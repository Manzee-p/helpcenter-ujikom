<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Ticket;
use App\Models\User;
use App\Models\VendorWarning;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class VendorRatingController extends Controller
{
    private const LOW_RATING_MAX = 2;
    private const MIN_COMPLETED_TICKETS = 10;
    private const SYSTEM_WARNING_THRESHOLD = 5;
    private const ADMIN_WARNING_THRESHOLD = 8;

    public function adminIndex(Request $request)
    {
        try {
            $warningTableExists = Schema::hasTable('vendor_warnings');
            $attentionVendors = $this->buildVendorAttentionMap();
            $this->syncSystemWarnings($attentionVendors);

            $feedbackQuery = Feedback::query()
                ->with([
                    'user:id,name,email',
                    'ticket' => function ($query) {
                        $query->with([
                            'user:id,name,email',
                            'assignedTo:id,name,email,company_name',
                            'category:id,name',
                        ]);
                    },
                ])
                ->whereHas('ticket', function ($query) {
                    $query->whereNotNull('assigned_to');
                });

            if ($request->filled('vendor_id')) {
                $feedbackQuery->whereHas('ticket', function ($query) use ($request) {
                    $query->where('assigned_to', $request->vendor_id);
                });
            }

            if ($request->filled('attention')) {
                $vendorIds = collect($attentionVendors)
                    ->filter(function ($vendor) use ($request) {
                        return match ($request->attention) {
                            'system_warning' => $vendor['warning_level'] === 'system',
                            'admin_warning' => $vendor['warning_level'] === 'admin',
                            'needs_attention' => $vendor['needs_attention'],
                            'excellent' => $vendor['average_rating'] >= 4.5,
                            'stable' => !$vendor['needs_attention'] && $vendor['average_rating'] >= 3.5,
                            default => true,
                        };
                    })
                    ->pluck('id')
                    ->values();

                if ($vendorIds->isEmpty()) {
                    $feedbackQuery->whereRaw('1 = 0');
                } else {
                    $feedbackQuery->whereHas('ticket', function ($query) use ($vendorIds) {
                        $query->whereIn('assigned_to', $vendorIds);
                    });
                }
            }

            if ($request->filled('search')) {
                $search = trim($request->search);
                $feedbackQuery->where(function ($query) use ($search) {
                    $query->where('comment', 'like', "%{$search}%")
                        ->orWhereHas('ticket', function ($ticketQuery) use ($search) {
                            $ticketQuery->where('title', 'like', "%{$search}%")
                                ->orWhere('ticket_number', 'like', "%{$search}%")
                                ->orWhereHas('assignedTo', function ($vendorQuery) use ($search) {
                                    $vendorQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('email', 'like', "%{$search}%")
                                        ->orWhere('company_name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('user', function ($clientQuery) use ($search) {
                                    $clientQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('email', 'like', "%{$search}%");
                                });
                        });
                });
            }

            $sort = $request->input('sort', 'latest');
            match ($sort) {
                'lowest_rating' => $feedbackQuery->orderBy('rating')->orderByDesc('created_at'),
                'highest_rating' => $feedbackQuery->orderByDesc('rating')->orderByDesc('created_at'),
                'oldest' => $feedbackQuery->oldest(),
                default => $feedbackQuery->latest(),
            };

            $perPage = (int) $request->input('per_page', 15);
            $feedbacks = $feedbackQuery->paginate($perPage);

            $completedTicketsQuery = Ticket::query()
                ->whereNotNull('assigned_to')
                ->whereIn('status', ['resolved', 'closed']);

            $summary = [
                'total_feedbacks' => Feedback::whereHas('ticket', function ($query) {
                    $query->whereNotNull('assigned_to');
                })->count(),
                'average_rating' => round((float) Feedback::whereHas('ticket', function ($query) {
                    $query->whereNotNull('assigned_to');
                })->avg('rating'), 2),
                'completed_tickets' => (clone $completedTicketsQuery)->count(),
                'pending_ratings' => (clone $completedTicketsQuery)->doesntHave('feedback')->count(),
                'system_warning_count' => $warningTableExists ? VendorWarning::where('warning_type', 'system')->count() : 0,
                'admin_warning_count' => $warningTableExists ? VendorWarning::where('warning_type', 'admin')->count() : 0,
            ];

            $warningMap = $this->getLatestWarningsMap();

            $vendorStats = User::query()
                ->where('role', 'vendor')
                ->select('id', 'name', 'email', 'company_name')
                ->withCount([
                    'assignedTickets as completed_tickets' => function ($query) {
                        $query->whereIn('status', ['resolved', 'closed']);
                    },
                    'assignedTickets as rated_tickets' => function ($query) {
                        $query->whereIn('status', ['resolved', 'closed'])->whereHas('feedback');
                    },
                    'assignedTickets as pending_ratings' => function ($query) {
                        $query->whereIn('status', ['resolved', 'closed'])->whereDoesntHave('feedback');
                    },
                ])
                ->get()
                ->map(function ($vendor) use ($attentionVendors, $warningMap) {
                    $ratingMeta = $attentionVendors[$vendor->id] ?? $this->emptyVendorMeta($vendor->id);

                    return [
                        'id' => $vendor->id,
                        'name' => $vendor->name,
                        'email' => $vendor->email,
                        'company_name' => $vendor->company_name,
                        'completed_tickets' => $vendor->completed_tickets,
                        'rated_tickets' => $vendor->rated_tickets,
                        'pending_ratings' => $vendor->pending_ratings,
                        'average_rating' => round((float) $ratingMeta['average_rating'], 2),
                        'low_rating_count' => $ratingMeta['low_rating_count'],
                        'needs_attention' => $ratingMeta['needs_attention'],
                        'warning_level' => $ratingMeta['warning_level'],
                        'should_receive_admin_warning' => $ratingMeta['should_receive_admin_warning'],
                        'warning_message' => $ratingMeta['warning_message'],
                        'latest_warning' => $warningMap[$vendor->id] ?? null,
                        'warning_counts' => [
                            'system' => $ratingMeta['system_warning_count'],
                            'admin' => $ratingMeta['admin_warning_count'],
                        ],
                    ];
                })
                ->sortByDesc(function ($vendor) {
                    $weight = $vendor['warning_level'] === 'admin'
                        ? 2
                        : ($vendor['warning_level'] === 'system' ? 1 : 0);

                    return ($weight * 100000) + ((int) $vendor['low_rating_count'] * 100) - (int) round($vendor['average_rating'] * 10);
                })
                ->values();

            $summary['low_rating_vendors'] = $vendorStats->where('needs_attention', true)->count();
            $summary['vendors_recommended_admin_warning'] = $vendorStats->where('should_receive_admin_warning', true)->count();

            return response()->json([
                'success' => true,
                'summary' => $summary,
                'thresholds' => [
                    'min_completed_tickets' => self::MIN_COMPLETED_TICKETS,
                    'system_warning_threshold' => self::SYSTEM_WARNING_THRESHOLD,
                    'admin_warning_threshold' => self::ADMIN_WARNING_THRESHOLD,
                    'low_rating_max' => self::LOW_RATING_MAX,
                ],
                'vendor_stats' => $vendorStats,
                'data' => collect($feedbacks->items())->map(function ($feedback) {
                    return $this->transformFeedback($feedback);
                })->values(),
                'pagination' => [
                    'current_page' => $feedbacks->currentPage(),
                    'last_page' => $feedbacks->lastPage(),
                    'per_page' => $feedbacks->perPage(),
                    'total' => $feedbacks->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin vendor ratings fetch failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendor ratings',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function vendorIndex(Request $request)
    {
        try {
            $vendorId = Auth::id();
            $vendorMeta = $this->buildVendorAttentionMap();
            $this->syncSystemWarnings($vendorMeta);
            $warningTableExists = Schema::hasTable('vendor_warnings');

            $query = Ticket::query()
                ->with(['user:id,name,email', 'category:id,name', 'feedback'])
                ->where('assigned_to', $vendorId)
                ->whereIn('status', ['resolved', 'closed']);

            if ($request->filled('feedback_status')) {
                if ($request->feedback_status === 'rated') {
                    $query->whereHas('feedback');
                }

                if ($request->feedback_status === 'pending') {
                    $query->whereDoesntHave('feedback');
                }
            }

            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($ticketQuery) use ($search) {
                    $ticketQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('ticket_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($clientQuery) use ($search) {
                            $clientQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            }

            $sort = $request->input('sort', 'latest');

            if ($sort === 'lowest_rating') {
                $query->leftJoin('feedbacks', 'feedbacks.ticket_id', '=', 'tickets.id')
                    ->select('tickets.*')
                    ->orderByRaw('CASE WHEN feedbacks.rating IS NULL THEN 999 ELSE feedbacks.rating END')
                    ->orderByDesc('tickets.resolved_at');
            } elseif ($sort === 'oldest') {
                $query->orderBy('resolved_at');
            } elseif ($sort === 'pending_first') {
                $query->orderByRaw('CASE WHEN EXISTS (SELECT 1 FROM feedbacks WHERE feedbacks.ticket_id = tickets.id) THEN 2 ELSE 1 END')
                    ->orderByDesc('resolved_at');
            } else {
                $query->orderByRaw('CASE WHEN status = "closed" THEN 2 ELSE 1 END')
                    ->orderByDesc('resolved_at')
                    ->orderByDesc('closed_at');
            }

            $perPage = (int) $request->input('per_page', 15);
            $tickets = $query->paginate($perPage);

            $baseStatsQuery = Ticket::query()
                ->where('assigned_to', $vendorId)
                ->whereIn('status', ['resolved', 'closed']);

            $ratingMeta = $vendorMeta[$vendorId] ?? $this->emptyVendorMeta($vendorId);
            $warnings = $warningTableExists
                ? VendorWarning::query()
                    ->where('vendor_id', $vendorId)
                    ->latest()
                    ->get(['id', 'warning_type', 'message', 'created_at'])
                    ->map(function ($warning) {
                        return [
                            'id' => $warning->id,
                            'warning_type' => $warning->warning_type,
                            'message' => $warning->message,
                            'created_at' => $warning->created_at,
                        ];
                    })
                    ->values()
                : collect();

            $stats = [
                'completed_tickets' => (clone $baseStatsQuery)->count(),
                'rated_tickets' => (clone $baseStatsQuery)->has('feedback')->count(),
                'pending_ratings' => (clone $baseStatsQuery)->doesntHave('feedback')->count(),
                'average_rating' => $ratingMeta['average_rating'],
                'low_rating_count' => $ratingMeta['low_rating_count'],
                'needs_attention' => $ratingMeta['needs_attention'],
                'warning_level' => $ratingMeta['warning_level'],
                'warning_message' => $ratingMeta['warning_message'],
                'system_warning_count' => $ratingMeta['system_warning_count'],
                'admin_warning_count' => $ratingMeta['admin_warning_count'],
                'latest_warning' => $warnings->first(),
                'warnings' => $warnings,
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'thresholds' => [
                    'min_completed_tickets' => self::MIN_COMPLETED_TICKETS,
                    'system_warning_threshold' => self::SYSTEM_WARNING_THRESHOLD,
                    'admin_warning_threshold' => self::ADMIN_WARNING_THRESHOLD,
                    'low_rating_max' => self::LOW_RATING_MAX,
                ],
                'data' => collect($tickets->items())->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'title' => $ticket->title,
                        'status' => $ticket->status,
                        'priority' => $ticket->priority,
                        'resolved_at' => $ticket->resolved_at,
                        'closed_at' => $ticket->closed_at,
                        'client' => $ticket->user ? [
                            'id' => $ticket->user->id,
                            'name' => $ticket->user->name,
                            'email' => $ticket->user->email,
                        ] : null,
                        'category' => $ticket->category ? [
                            'id' => $ticket->category->id,
                            'name' => $ticket->category->name,
                        ] : null,
                        'feedback_status' => $ticket->feedback ? 'rated' : 'pending',
                        'feedback' => $ticket->feedback ? [
                            'id' => $ticket->feedback->id,
                            'rating' => $ticket->feedback->rating,
                            'comment' => $ticket->feedback->comment,
                            'created_at' => $ticket->feedback->created_at,
                            'is_low_rating' => (int) $ticket->feedback->rating <= self::LOW_RATING_MAX,
                        ] : null,
                    ];
                })->values(),
                'pagination' => [
                    'current_page' => $tickets->currentPage(),
                    'last_page' => $tickets->lastPage(),
                    'per_page' => $tickets->perPage(),
                    'total' => $tickets->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Vendor ratings fetch failed', [
                'vendor_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendor ratings',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $feedback = Feedback::query()
                ->whereHas('ticket', function ($query) {
                    $query->whereNotNull('assigned_to');
                })
                ->findOrFail($id);

            $feedback->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vendor rating deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Vendor rating deletion failed', [
                'feedback_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete vendor rating',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function sendAdminWarning(Request $request, $vendorId)
    {
        try {
            $vendor = User::query()->where('role', 'vendor')->findOrFail($vendorId);
            $vendorMeta = $this->buildVendorAttentionMap();
            $ratingMeta = $vendorMeta[$vendorId] ?? $this->emptyVendorMeta($vendorId);

            if (!$ratingMeta['should_receive_admin_warning']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vendor belum memenuhi ambang peringatan admin.',
                ], 422);
            }

            $message = trim((string) $request->input(
                'message',
                'Admin memberikan peringatan langsung karena performa penanganan Anda tidak sesuai SOP/peraturan yang berlaku. Mohon lakukan evaluasi dan perbaikan segera.'
            ));

            $warning = VendorWarning::create([
                'vendor_id' => $vendor->id,
                'warning_type' => 'admin',
                'message' => $message !== '' ? $message : 'Admin memberikan peringatan langsung kepada vendor.',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Peringatan admin berhasil dikirim ke vendor.',
                'warning' => [
                    'id' => $warning->id,
                    'warning_type' => $warning->warning_type,
                    'message' => $warning->message,
                    'created_at' => $warning->created_at,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin warning creation failed', [
                'vendor_id' => $vendorId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim peringatan admin.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    private function transformFeedback(Feedback $feedback): array
    {
        $ticket = $feedback->ticket;
        $vendor = $ticket?->assignedTo;
        $client = $ticket?->user;

        return [
            'id' => $feedback->id,
            'rating' => $feedback->rating,
            'comment' => $feedback->comment,
            'created_at' => $feedback->created_at,
            'is_low_rating' => (int) $feedback->rating <= self::LOW_RATING_MAX,
            'ticket' => $ticket ? [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status,
                'category' => $ticket->category ? [
                    'id' => $ticket->category->id,
                    'name' => $ticket->category->name,
                ] : null,
            ] : null,
            'vendor' => $vendor ? [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'email' => $vendor->email,
                'company_name' => $vendor->company_name,
            ] : null,
            'client' => $client ? [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ] : null,
        ];
    }

    private function buildVendorAttentionMap(): array
    {
        $warningTableExists = Schema::hasTable('vendor_warnings');

        $ratingRows = Feedback::query()
            ->join('tickets', 'tickets.id', '=', 'feedbacks.ticket_id')
            ->whereNotNull('tickets.assigned_to')
            ->groupBy('tickets.assigned_to')
            ->selectRaw(
                'tickets.assigned_to as vendor_id, AVG(feedbacks.rating) as average_rating, COUNT(feedbacks.id) as rated_tickets, SUM(CASE WHEN feedbacks.rating <= ? THEN 1 ELSE 0 END) as low_rating_count',
                [self::LOW_RATING_MAX]
            )
            ->get()
            ->keyBy('vendor_id');

        $completedRows = Ticket::query()
            ->whereNotNull('assigned_to')
            ->whereIn('status', ['resolved', 'closed'])
            ->groupBy('assigned_to')
            ->selectRaw('assigned_to as vendor_id, COUNT(*) as completed_tickets')
            ->get()
            ->keyBy('vendor_id');

        $systemWarningCounts = $warningTableExists
            ? VendorWarning::query()
                ->where('warning_type', 'system')
                ->selectRaw('vendor_id, COUNT(*) as total')
                ->groupBy('vendor_id')
                ->pluck('total', 'vendor_id')
            : collect();

        $adminWarningCounts = $warningTableExists
            ? VendorWarning::query()
                ->where('warning_type', 'admin')
                ->selectRaw('vendor_id, COUNT(*) as total')
                ->groupBy('vendor_id')
                ->pluck('total', 'vendor_id')
            : collect();

        return $ratingRows->keys()
            ->merge($completedRows->keys())
            ->unique()
            ->values()
            ->mapWithKeys(function ($vendorId) use ($ratingRows, $completedRows, $systemWarningCounts, $adminWarningCounts) {
                $ratingRow = $ratingRows->get($vendorId);
                $completedRow = $completedRows->get($vendorId);
                $completedTickets = (int) ($completedRow->completed_tickets ?? 0);
                $ratedTickets = (int) ($ratingRow->rated_tickets ?? 0);
                $average = round((float) ($ratingRow->average_rating ?? 0), 2);
                $lowCount = (int) ($ratingRow->low_rating_count ?? 0);
                $eligible = $completedTickets >= self::MIN_COMPLETED_TICKETS;
                $systemLevel = $eligible && $lowCount >= self::SYSTEM_WARNING_THRESHOLD;
                $adminLevel = $eligible && $lowCount >= self::ADMIN_WARNING_THRESHOLD;

                return [
                    (int) $vendorId => [
                        'id' => (int) $vendorId,
                        'average_rating' => $average,
                        'completed_tickets' => $completedTickets,
                        'rated_tickets' => $ratedTickets,
                        'low_rating_count' => $lowCount,
                        'needs_attention' => $systemLevel || $adminLevel || ($eligible && $average > 0 && $average < 3.5),
                        'warning_level' => $adminLevel ? 'admin' : ($systemLevel ? 'system' : 'normal'),
                        'should_receive_admin_warning' => $adminLevel,
                        'system_warning_count' => (int) ($systemWarningCounts[$vendorId] ?? 0),
                        'admin_warning_count' => (int) ($adminWarningCounts[$vendorId] ?? 0),
                        'warning_message' => $this->buildWarningMessage($completedTickets, $lowCount, $average, $systemLevel, $adminLevel),
                    ],
                ];
            })
            ->toArray();
    }

    private function syncSystemWarnings(array $vendorMeta): void
    {
        if (!Schema::hasTable('vendor_warnings')) {
            return;
        }

        foreach ($vendorMeta as $vendorId => $meta) {
            if (!in_array($meta['warning_level'], ['system', 'admin'], true)) {
                continue;
            }

            $message = $meta['warning_level'] === 'admin'
                ? 'Sistem mendeteksi pola rating buruk berulang. Admin disarankan segera memberikan teguran langsung kepada vendor ini.'
                : 'Sistem mendeteksi penurunan performa vendor. Mohon evaluasi kualitas penanganan, komunikasi, dan kepatuhan SOP.';

            $exists = VendorWarning::query()
                ->where('vendor_id', $vendorId)
                ->where('warning_type', 'system')
                ->where('message', $message)
                ->exists();

            if (!$exists) {
                VendorWarning::create([
                    'vendor_id' => $vendorId,
                    'warning_type' => 'system',
                    'message' => $message,
                ]);
            }
        }
    }

    private function getLatestWarningsMap(): array
    {
        if (!Schema::hasTable('vendor_warnings')) {
            return [];
        }

        return VendorWarning::query()
            ->latest()
            ->get()
            ->groupBy('vendor_id')
            ->map(function ($warnings) {
                $latest = $warnings->first();

                return [
                    'id' => $latest->id,
                    'warning_type' => $latest->warning_type,
                    'message' => $latest->message,
                    'created_at' => $latest->created_at,
                ];
            })
            ->toArray();
    }

    private function buildWarningMessage(int $completedTickets, int $lowRatingCount, float $averageRating, bool $systemLevel, bool $adminLevel): ?string
    {
        if ($adminLevel) {
            return "Vendor memiliki {$lowRatingCount} rating buruk dari {$completedTickets} tiket selesai. Admin perlu memberikan teguran langsung karena performa tidak sesuai SOP.";
        }

        if ($systemLevel) {
            return "Vendor memiliki {$lowRatingCount} rating buruk dari {$completedTickets} tiket selesai. Sistem memberi peringatan agar vendor segera memperbaiki kualitas layanan.";
        }

        if ($completedTickets < self::MIN_COMPLETED_TICKETS && $lowRatingCount > 0) {
            return "Sudah ada rating rendah, tetapi vendor belum mencapai minimum " . self::MIN_COMPLETED_TICKETS . ' tiket selesai untuk warning otomatis.';
        }

        if ($averageRating > 0 && $averageRating < 3.5) {
            return 'Rata-rata rating vendor menurun. Mohon evaluasi komunikasi, kecepatan, dan kualitas penyelesaian pekerjaan.';
        }

        return null;
    }

    private function emptyVendorMeta(int $vendorId): array
    {
        return [
            'id' => $vendorId,
            'average_rating' => 0,
            'completed_tickets' => 0,
            'rated_tickets' => 0,
            'low_rating_count' => 0,
            'needs_attention' => false,
            'warning_level' => 'normal',
            'should_receive_admin_warning' => false,
            'system_warning_count' => 0,
            'admin_warning_count' => 0,
            'warning_message' => null,
        ];
    }
}
