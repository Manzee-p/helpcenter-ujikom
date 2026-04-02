<?php

namespace Database\Seeders;

use App\Models\Feedback;
use App\Models\Ticket;
use App\Models\User;
use App\Models\VendorWarning;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class VendorRatingSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::query()->where('role', 'client')->pluck('id');
        $vendors = User::query()->where('role', 'vendor')->pluck('id');

        if ($clients->isEmpty() || $vendors->isEmpty()) {
            $this->command?->warn('VendorRatingSeeder skipped: users client/vendor belum tersedia.');
            return;
        }

        $completedTickets = Ticket::query()
            ->whereIn('status', ['resolved', 'closed'])
            ->whereNotNull('assigned_to')
            ->orderBy('created_at')
            ->get();

        if ($completedTickets->isEmpty()) {
            $this->command?->warn('VendorRatingSeeder skipped: belum ada tiket resolved/closed yang assigned.');
            return;
        }

        $createdFeedbacks = 0;

        foreach ($completedTickets as $index => $ticket) {
            Feedback::query()->firstOrCreate(
                ['ticket_id' => $ticket->id],
                [
                    'user_id' => $ticket->user_id ?: $clients->random(),
                    'rating' => $this->resolveRating($index, (int) $ticket->assigned_to),
                    'comment' => $this->resolveComment($index),
                    'created_at' => $ticket->closed_at ?: $ticket->resolved_at ?: now(),
                    'updated_at' => $ticket->closed_at ?: $ticket->resolved_at ?: now(),
                ]
            );

            $createdFeedbacks++;
        }

        if (Schema::hasTable('vendor_warnings')) {
            $this->seedWarnings($vendors->all());
        }

        $this->command?->info("VendorRatingSeeder selesai: {$createdFeedbacks} feedback dipastikan tersedia.");
    }

    private function resolveRating(int $index, int $vendorId): int
    {
        // Vendor pertama sengaja punya lebih banyak rating rendah agar dashboard admin ada data perhatian.
        if ($vendorId === (int) User::query()->where('role', 'vendor')->orderBy('id')->value('id')) {
            $pattern = [2, 1, 2, 3, 2, 4, 2, 1, 5, 2];
            return $pattern[$index % count($pattern)];
        }

        $pattern = [5, 4, 4, 5, 3, 4, 5, 4];
        return $pattern[$index % count($pattern)];
    }

    private function resolveComment(int $index): string
    {
        $comments = [
            'Vendor cukup membantu, tetapi perlu lebih cepat merespons.',
            'Masalah selesai dengan baik dan komunikasi jelas.',
            'Penanganan sudah oke, hanya butuh follow up lebih rapi.',
            'Sangat puas, vendor datang tepat waktu dan solutif.',
            'Perlu peningkatan di koordinasi lapangan.',
            'Teknisi ramah dan penyelesaian sesuai kebutuhan acara.',
        ];

        return $comments[$index % count($comments)];
    }

    private function seedWarnings(array $vendorIds): void
    {
        if (empty($vendorIds)) {
            return;
        }

        $firstVendorId = $vendorIds[0];

        VendorWarning::query()->firstOrCreate(
            [
                'vendor_id' => $firstVendorId,
                'warning_type' => 'system',
                'message' => 'Sistem mendeteksi penurunan performa vendor. Mohon evaluasi kualitas penanganan, komunikasi, dan kepatuhan SOP.',
            ]
        );

        VendorWarning::query()->firstOrCreate(
            [
                'vendor_id' => $firstVendorId,
                'warning_type' => 'admin',
                'message' => 'Admin memberikan peringatan langsung karena performa penanganan Anda tidak sesuai SOP/peraturan yang berlaku. Mohon lakukan evaluasi dan perbaikan segera.',
            ]
        );
    }
}
