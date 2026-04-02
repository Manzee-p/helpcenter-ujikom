<template>
  <div class="admin-ticket-detail">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Memuat...</span>
      </div>
    </div>

    <div v-else-if="ticket">

      <!-- Header Actions -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm" @click="goBack">
                <i class="bx bx-arrow-back me-1"></i> Kembali
              </button>
              <span class="text-muted small">/ Detail Tiket</span>
            </div>
            <div class="d-flex gap-2">
              <button v-if="ticket.status !== 'closed'" class="btn btn-primary btn-sm" @click="openAssignModal">
                <i class="bx bx-user-plus me-1"></i>
                {{ ticket.assigned_to ? 'Tugaskan Ulang' : 'Tugaskan' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="handleDeleteTicket">
                <i class="bx bx-trash me-1"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row g-3">

        <!-- Left Column -->
        <div class="col-lg-8">
          <div class="card mb-3 ticket-main-card">
            <div class="ticket-header">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <i class="bx bx-file" style="font-size:1.3rem;"></i>
                  <h6 class="mb-0 fw-bold">{{ ticket.ticket_number || 'N/A' }}</h6>
                </div>
                <div class="d-flex gap-2">
                  <span :class="`badge-pill badge-${getStatusBgColor(ticket.status)}`">{{ formatStatus(ticket.status) }}</span>
                  <span v-if="ticket.priority" :class="`badge-pill badge-${getPriorityBgColor(ticket.priority)}`">{{ formatPriority(ticket.priority) }}</span>
                  <span v-else class="badge-pill badge-secondary">TANPA PRIORITAS</span>
                </div>
              </div>
            </div>

            <div class="card-body">
              <h5 class="fw-bold mb-3">{{ ticket.title || 'Tanpa Judul' }}</h5>

              <!-- Event Info -->
              <div v-if="ticket.event_name || ticket.venue" class="event-info-box mb-3">
                <div class="row g-2">
                  <div class="col-md-4" v-if="ticket.event_name">
                    <div class="event-info-item">
                      <i class="bx bx-calendar text-primary"></i>
                      <div><small class="text-muted d-block">Acara</small><span class="fw-medium">{{ ticket.event_name }}</span></div>
                    </div>
                  </div>
                  <div class="col-md-4" v-if="ticket.venue">
                    <div class="event-info-item">
                      <i class="bx bx-building text-info"></i>
                      <div><small class="text-muted d-block">Tempat</small><span class="fw-medium">{{ ticket.venue }}</span></div>
                    </div>
                  </div>
                  <div class="col-md-4" v-if="ticket.area">
                    <div class="event-info-item">
                      <i class="bx bx-map text-warning"></i>
                      <div><small class="text-muted d-block">Area</small><span class="fw-medium">{{ ticket.area }}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <small class="section-label">Deskripsi</small>
                <p class="mb-0 desc-text">{{ ticket.description || 'Tidak ada deskripsi' }}</p>
              </div>

              <!-- Attachments -->
              <div v-if="ticket.attachments?.length > 0" class="mb-4">
                <small class="section-label">Lampiran</small>
                <div class="d-flex flex-wrap gap-2">
                  <a v-for="attachment in ticket.attachments" :key="attachment.id"
                    :href="getAttachmentUrl(attachment.file_path)" target="_blank"
                    class="btn btn-sm btn-outline-secondary">
                    <i class="bx bx-paperclip me-1"></i>{{ attachment.file_name }}
                  </a>
                </div>
              </div>

              <!-- Timeline -->
              <div>
                <small class="section-label">Timeline</small>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot dot-primary"><i class="bx bx-plus"></i></div>
                    <div class="timeline-body">
                      <span class="fw-semibold">Tiket Dibuat</span>
                      <small class="d-block text-muted mt-1">{{ formatDate(ticket.created_at) }}</small>
                      <small v-if="ticket.urgency_level" class="text-info d-block">Urgensi klien: {{ formatUrgency(ticket.urgency_level) }}</small>
                    </div>
                  </div>
                  <div v-if="ticket.assigned_at" class="timeline-item">
                    <div class="timeline-dot dot-info"><i class="bx bx-user-check"></i></div>
                    <div class="timeline-body">
                      <span class="fw-semibold">Ditugaskan ke {{ getAssignedToName() }}</span>
                      <small class="d-block text-muted mt-1">{{ formatDate(ticket.assigned_at) }}</small>
                    </div>
                  </div>
                  <div v-if="ticket.first_response_at" class="timeline-item">
                    <div class="timeline-dot dot-warning"><i class="bx bx-message"></i></div>
                    <div class="timeline-body">
                      <span class="fw-semibold">Respon Pertama</span>
                      <small class="d-block text-muted mt-1">{{ formatDate(ticket.first_response_at) }}</small>
                    </div>
                  </div>
                  <div v-if="ticket.resolved_at" class="timeline-item">
                    <div class="timeline-dot dot-success"><i class="bx bx-check"></i></div>
                    <div class="timeline-body">
                      <span class="fw-semibold">Tiket Diselesaikan</span>
                      <small class="d-block text-muted mt-1">{{ formatDate(ticket.resolved_at) }}</small>
                    </div>
                  </div>
                  <div v-if="ticket.closed_at" class="timeline-item last">
                    <div class="timeline-dot dot-dark"><i class="bx bx-lock"></i></div>
                    <div class="timeline-body">
                      <span class="fw-semibold">Tiket Ditutup</span>
                      <small class="d-block text-muted mt-1">{{ formatDate(ticket.closed_at) }}</small>
                    </div>
                  </div>
                </div>
              </div>

            </div><!-- end card-body -->

            <!-- ✅ VENDOR CHAT SECTION — di dalam card utama, di bawah timeline -->
            <div class="vendor-chat-section" :class="ticket.assigned_to ? 'has-vendor' : 'no-vendor'">
              <!-- Jika sudah ada vendor -->
              <div v-if="ticket.assigned_to" class="vendor-chat-inner">
                <div class="vendor-chat-info">
                  <div class="vendor-chat-avatar-wrap">
                    <span class="vendor-chat-avatar-lg">{{ getInitials(getAssignedToName()) }}</span>
                    <span class="vendor-online-dot"></span>
                  </div>
                  <div class="vendor-chat-meta">
                    <div class="vendor-chat-name">{{ getAssignedToName() }}</div>
                    <div class="vendor-chat-email">{{ getAssignedToEmail() }}</div>
                    <div class="vendor-chat-ticket">
                      <i class="bx bx-file"></i> {{ ticket.ticket_number }}
                      <span :class="`ms-2 badge-pill-xs badge-${getStatusBgColor(ticket.status)}`">{{ formatStatus(ticket.status) }}</span>
                    </div>
                  </div>
                </div>
                <div class="vendor-chat-action">
                  <p class="vendor-chat-hint">
                    <i class="bx bx-info-circle me-1"></i>
                    Komunikasi dengan vendor dilakukan melalui fitur Chat Vendor
                  </p>
                  <button class="btn-go-to-chat" @click="goBackToVendorChat">
                    <i class="bx bx-message-dots"></i>
                    <span>{{ fromVendorChat ? 'Kembali ke Chat Vendor' : 'Buka Chat Vendor' }}</span>
                    <i class="bx bx-right-arrow-alt"></i>
                  </button>
                </div>
              </div>

              <!-- Jika belum ada vendor -->
              <div v-else class="no-vendor-inner">
                <div class="no-vendor-icon"><i class="bx bx-user-x"></i></div>
                <div>
                  <div class="no-vendor-title">Belum Ada Vendor Ditugaskan</div>
                  <div class="no-vendor-sub">Tugaskan tiket ini ke vendor agar dapat memulai komunikasi</div>
                </div>
                <button class="btn btn-sm btn-primary" @click="openAssignModal">
                  <i class="bx bx-user-plus me-1"></i> Tugaskan Sekarang
                </button>
              </div>
            </div>

          </div><!-- end card -->

          <!-- ✅ Card Ringkasan Aktivitas — mengisi ruang kosong di bawah -->
          <div class="card activity-card">
            <div class="card-body">
              <div class="activity-grid">

                <!-- Stat: Dibuat -->
                <div class="activity-stat-item">
                  <div class="activity-stat-icon icon-created">
                    <i class="bx bx-calendar-plus"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">Tanggal Dibuat</div>
                    <div class="activity-stat-value">{{ formatDateShort(ticket.created_at) }}</div>
                  </div>
                </div>

                <!-- Stat: Kategori -->
                <div class="activity-stat-item">
                  <div class="activity-stat-icon icon-category">
                    <i class="bx bx-category"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">Kategori</div>
                    <div class="activity-stat-value">{{ ticket.category?.name || '—' }}</div>
                  </div>
                </div>

                <!-- Stat: Prioritas -->
                <div class="activity-stat-item">
                  <div class="activity-stat-icon icon-priority">
                    <i class="bx bx-flag"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">Prioritas</div>
                    <div class="activity-stat-value">{{ ticket.priority ? formatPriority(ticket.priority) : '—' }}</div>
                  </div>
                </div>

                <!-- Stat: SLA Respon -->
                <div class="activity-stat-item" v-if="ticket.sla_tracking">
                  <div class="activity-stat-icon" :class="ticket.sla_tracking.response_sla_met ? 'icon-sla-ok' : 'icon-sla-warn'">
                    <i class="bx bx-time"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">SLA Respon</div>
                    <div class="activity-stat-value">
                      <span v-if="ticket.sla_tracking.actual_response_time">
                        {{ ticket.sla_tracking.actual_response_time }} / {{ ticket.sla_tracking.response_time_sla }} menit
                      </span>
                      <span v-else class="text-muted">Menunggu</span>
                    </div>
                  </div>
                </div>

                <!-- Stat: Urgensi Klien -->
                <div class="activity-stat-item" v-if="ticket.urgency_level">
                  <div class="activity-stat-icon icon-urgency">
                    <i class="bx bx-error-circle"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">Urgensi Klien</div>
                    <div class="activity-stat-value">{{ formatUrgency(ticket.urgency_level) }}</div>
                  </div>
                </div>

                <!-- Stat: Vendor -->
                <div class="activity-stat-item">
                  <div class="activity-stat-icon icon-vendor">
                    <i class="bx bx-wrench"></i>
                  </div>
                  <div class="activity-stat-body">
                    <div class="activity-stat-label">Vendor Bertugas</div>
                    <div class="activity-stat-value">{{ ticket.assigned_to ? getAssignedToName() : 'Belum ditugaskan' }}</div>
                  </div>
                </div>

              </div>

              <!-- Progress bar status -->
              <div class="status-progress mt-3">
                <div class="status-progress-label">
                  <small class="text-muted">Progress Penanganan</small>
                  <small class="text-muted fw-semibold">{{ getStatusProgress(ticket.status) }}%</small>
                </div>
                <div class="progress" style="height:6px; border-radius:10px;">
                  <div 
                    class="progress-bar" 
                    :class="getProgressBarClass(ticket.status)"
                    :style="`width: ${getStatusProgress(ticket.status)}%`"
                    role="progressbar"
                  ></div>
                </div>
                <div class="status-steps mt-2">
                  <span :class="['step', isStepDone('new', ticket.status) ? 'done' : '']">Baru</span>
                  <span :class="['step', isStepDone('in_progress', ticket.status) ? 'done' : '']">Diproses</span>
                  <span :class="['step', isStepDone('resolved', ticket.status) ? 'done' : '']">Selesai</span>
                  <span :class="['step', isStepDone('closed', ticket.status) ? 'done' : '']">Ditutup</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Right Column -->
        <div class="col-lg-4">

          <!-- Client Info -->
          <div class="card mb-3">
            <div class="card-header py-2 px-3">
              <h6 class="mb-0 fs-sm"><i class="bx bx-user me-2 text-primary"></i>Informasi Klien</h6>
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="side-avatar bg-label-primary">{{ getInitials(ticket.user?.name) }}</div>
                <div>
                  <div class="fw-semibold">{{ ticket.user?.name || 'Klien Tidak Dikenal' }}</div>
                  <small class="text-muted">{{ ticket.user?.email || 'N/A' }}</small>
                </div>
              </div>
              <div v-if="ticket.user?.phone" class="info-row">
                <i class="bx bx-phone text-muted"></i>
                <span>{{ ticket.user.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Assignment -->
          <div class="card mb-3">
            <div class="card-header py-2 px-3">
              <h6 class="mb-0 fs-sm"><i class="bx bx-user-check me-2 text-info"></i>Penugasan</h6>
            </div>
            <div class="card-body">
              <div v-if="ticket.assigned_to">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="side-avatar bg-label-info">{{ getInitials(getAssignedToName()) }}</div>
                  <div>
                    <div class="fw-semibold">{{ getAssignedToName() }}</div>
                    <small class="text-muted">{{ getAssignedToEmail() }}</small>
                  </div>
                </div>
                <div class="d-grid gap-2">
                  <button class="btn btn-sm btn-outline-secondary" @click="openAssignModal">
                    <i class="bx bx-refresh me-1"></i> Tugaskan Ulang
                  </button>
                </div>
              </div>
              <div v-else>
                <div class="alert alert-warning alert-sm mb-2 py-2 px-3">
                  <i class="bx bx-error-circle me-1"></i> Belum ditugaskan
                </div>
                <button class="btn btn-sm btn-primary w-100" @click="openAssignModal">
                  <i class="bx bx-user-plus me-1"></i> Tugaskan Sekarang
                </button>
              </div>
            </div>
          </div>

          <!-- Classification & Status -->
          <div class="card mb-3">
            <div class="card-header py-2 px-3">
              <h6 class="mb-0 fs-sm"><i class="bx bx-category me-2 text-warning"></i>Klasifikasi & Status</h6>
            </div>
            <div class="card-body">
              <div class="classify-row mb-3">
                <small class="text-muted">Kategori</small>
                <span class="badge bg-label-secondary">{{ ticket.category?.name || 'Tidak Dikategorikan' }}</span>
              </div>
              <div class="classify-row mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">Prioritas</small>
                  <button class="btn btn-xxs btn-outline-primary" @click="openPriorityModal" :disabled="ticket.status === 'closed'">
                    <i class="bx bx-edit-alt"></i> Ubah
                  </button>
                </div>
                <span v-if="ticket.priority" :class="`badge bg-label-${getPriorityColor(ticket.priority)}`">{{ formatPriority(ticket.priority) }}</span>
                <span v-else class="badge bg-label-secondary">BELUM DIATUR</span>
                <div v-if="ticket.urgency_level" class="mt-2 p-2 bg-light rounded">
                  <small class="text-muted d-block mb-1"><i class="bx bx-info-circle me-1"></i>Urgensi Klien:</small>
                  <span class="badge bg-label-info">{{ formatUrgency(ticket.urgency_level) }}</span>
                </div>
              </div>
              <div class="classify-row">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">Status</small>
                  <button class="btn btn-xxs btn-outline-warning" @click="openStatusModal" :disabled="ticket.status === 'closed'">
                    <i class="bx bx-edit-alt"></i> Perbarui
                  </button>
                </div>
                <span :class="`badge bg-label-${getStatusColor(ticket.status)}`">{{ formatStatus(ticket.status) }}</span>
              </div>
            </div>
          </div>

          <!-- SLA Tracking -->
          <div class="card mb-3" v-if="ticket.sla_tracking">
            <div class="card-header py-2 px-3">
              <h6 class="mb-0 fs-sm"><i class="bx bx-time-five me-2 text-success"></i>Pelacakan SLA</h6>
            </div>
            <div class="card-body">
              <div class="sla-metric mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">Waktu Respon</small>
                  <span v-if="ticket.sla_tracking.response_sla_met !== null"
                        :class="`badge ${ticket.sla_tracking.response_sla_met ? 'bg-label-success' : 'bg-label-danger'}`">
                    {{ ticket.sla_tracking.response_sla_met ? 'TERPENUHI' : 'TERLAMPAUI' }}
                  </span>
                </div>
                <div v-if="ticket.sla_tracking.actual_response_time">
                  <strong>{{ ticket.sla_tracking.actual_response_time }} menit</strong>
                  <small class="text-muted"> / {{ ticket.sla_tracking.response_time_sla }} menit</small>
                </div>
                <div v-else class="text-muted small">Menunggu (Target: {{ ticket.sla_tracking.response_time_sla }} menit)</div>
              </div>
              <div class="sla-metric">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">Waktu Penyelesaian</small>
                  <span v-if="ticket.sla_tracking.resolution_sla_met !== null"
                        :class="`badge ${ticket.sla_tracking.resolution_sla_met ? 'bg-label-success' : 'bg-label-danger'}`">
                    {{ ticket.sla_tracking.resolution_sla_met ? 'TERPENUHI' : 'TERLAMPAUI' }}
                  </span>
                </div>
                <div v-if="ticket.sla_tracking.actual_resolution_time">
                  <strong>{{ ticket.sla_tracking.actual_resolution_time }} menit</strong>
                  <small class="text-muted"> / {{ ticket.sla_tracking.resolution_time_sla }} menit</small>
                </div>
                <div v-else class="text-muted small">Menunggu (Target: {{ ticket.sla_tracking.resolution_time_sla }} menit)</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header py-2 px-3">
              <h6 class="mb-0 fs-sm"><i class="bx bx-cog me-2 text-secondary"></i>Aksi Cepat</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="exportTicket">
                  <i class="bx bx-download me-1"></i> Ekspor Detail
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="printTicket">
                  <i class="bx bx-printer me-1"></i> Cetak
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <AssignModal v-if="showAssignModal && ticketForModal" :key="`assign-${ticketForModal.id}`" :ticket="ticketForModal" @close="closeAssignModal" @assigned="handleTicketUpdated" />
      <UpdateStatusModal v-if="showStatusModal && ticketForModal" :key="`status-${ticketForModal.id}`" :ticket="ticketForModal" @close="closeStatusModal" @updated="handleTicketUpdated" />
      <PriorityModal v-if="showPriorityModal && ticketForModal" :key="`priority-${ticketForModal.id}`" :ticket="ticketForModal" @close="closePriorityModal" @updated="handleTicketUpdated" />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTicketStore } from '@/stores/ticket'
import AssignModal from '@/components/admin/AssignModal.vue'
import UpdateStatusModal from '@/components/tickets/UpdateStatusModal.vue'
import PriorityModal from '@/components/admin/PriorityModal.vue'
import { formatDate, getPriorityColor, getInitials } from '@/utils/helpers'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const ticketStore = useTicketStore()

const ticket = ref(null)
const loading = ref(false)
const showStatusModal = ref(false)
const showAssignModal = ref(false)
const showPriorityModal = ref(false)

// ✅ Deteksi apakah admin datang dari halaman Chat Vendor
const fromVendorChat = computed(() => route.query.from === 'vendor-chat')

const ticketForModal = computed(() => {
  if (!ticket.value) return null
  return {
    id: ticket.value.id,
    ticket_number: ticket.value.ticket_number,
    title: ticket.value.title,
    status: ticket.value.status,
    priority: ticket.value.priority,
    assigned_to: ticket.value.assigned_to,
    user_id: ticket.value.user_id,
    urgency_level: ticket.value.urgency_level
  }
})

onMounted(async () => { await fetchTicketDetail() })

const fetchTicketDetail = async () => {
  loading.value = true
  try {
    const response = await ticketStore.fetchTicketDetail(route.params.id)
    if (!response || !response.id) throw new Error('Data tiket tidak valid')
    ticket.value = JSON.parse(JSON.stringify(response))
  } catch (error) {
    if (error.response?.status === 404) {
      await Swal.fire({ icon: 'error', title: 'Tiket Tidak Ditemukan', text: 'Tiket yang Anda cari tidak ada.', confirmButtonColor: '#696cff' })
      router.push('/admin/tickets')
      return
    }
    Swal.fire({ icon: 'error', title: 'Kesalahan', text: error.response?.data?.message || 'Gagal memuat detail tiket', confirmButtonColor: '#696cff' })
  } finally {
    loading.value = false
  }
}

// ✅ Kembali ke Chat Vendor — ticket_id dikirim agar tiket langsung terpilih
const goBackToVendorChat = () => {
  router.push({
    name: 'AdminVendorChat',
    query: {
      ticket_id: ticket.value.id,
      ticket_number: ticket.value.ticket_number,
      mode: 'outgoing'
    }
  })
}

const openAssignModal = () => { showAssignModal.value = true }
const closeAssignModal = () => { showAssignModal.value = false }
const openStatusModal = () => { showStatusModal.value = true }
const closeStatusModal = () => { showStatusModal.value = false }
const openPriorityModal = () => { showPriorityModal.value = true }
const closePriorityModal = () => { showPriorityModal.value = false }

const handleTicketUpdated = async () => {
  showStatusModal.value = false
  showAssignModal.value = false
  showPriorityModal.value = false
  await new Promise(resolve => setTimeout(resolve, 100))
  await fetchTicketDetail()
  Swal.fire({ icon: 'success', title: 'Berhasil Diperbarui!', text: 'Tiket berhasil diperbarui', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
}

const handleDeleteTicket = async () => {
  if (!ticket.value) return
  const result = await Swal.fire({
    title: 'Hapus Tiket?',
    html: `Apakah Anda yakin ingin menghapus tiket <strong>${ticket.value.ticket_number || 'ini'}</strong>?<br><small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small>`,
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
  })
  if (result.isConfirmed) {
    try {
      await ticketStore.deleteTicket(ticket.value.id)
      Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Tiket berhasil dihapus', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
      router.push('/admin/tickets')
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Kesalahan', text: error.response?.data?.message || 'Gagal menghapus tiket', confirmButtonColor: '#696cff' })
    }
  }
}

const goBack = () => router.back()

const getAttachmentUrl = (path) => {
  if (!path) return ''
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`
}

const getAssignedToName = () => {
  if (typeof ticket.value.assigned_to === 'object' && ticket.value.assigned_to) return ticket.value.assigned_to.name || 'Tidak Dikenal'
  return 'Tidak Dikenal'
}

const getAssignedToEmail = () => {
  if (typeof ticket.value.assigned_to === 'object' && ticket.value.assigned_to) return ticket.value.assigned_to.email || 'N/A'
  return 'N/A'
}

const getStatusBgColor = (status) => ({ new: 'warning', in_progress: 'info', waiting_response: 'secondary', resolved: 'success', closed: 'dark' }[status] || 'secondary')
const getStatusColor = (status) => ({ new: 'warning', in_progress: 'info', waiting_response: 'secondary', resolved: 'success', closed: 'dark' }[status] || 'secondary')
const getPriorityBgColor = (priority) => ({ low: 'secondary', medium: 'info', high: 'warning', urgent: 'danger' }[priority] || 'secondary')

const formatStatus = (status) => ({ new: 'Baru', in_progress: 'Sedang Diproses', waiting_response: 'Menunggu Respon', resolved: 'Selesai', closed: 'Ditutup' }[status] || status || 'Tidak Diketahui')
const formatPriority = (priority) => ({ low: 'RENDAH', medium: 'SEDANG', high: 'TINGGI', urgent: 'MENDESAK' }[priority] || (priority ? priority.toUpperCase() : 'TIDAK ADA'))
const formatUrgency = (urgency) => ({ low: 'RENDAH', medium: 'SEDANG', high: 'TINGGI', urgent: 'MENDESAK' }[urgency] || (urgency ? urgency.toUpperCase() : ''))

const exportTicket = () => Swal.fire({ icon: 'info', title: 'Ekspor', text: 'Fitur ekspor akan segera hadir', confirmButtonColor: '#696cff' })
const printTicket = () => window.print()

const formatDateShort = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusProgress = (status) => {
  return { new: 20, in_progress: 50, waiting_response: 65, resolved: 85, closed: 100 }[status] || 0
}

const getProgressBarClass = (status) => {
  return { new: 'bg-warning', in_progress: 'bg-info', waiting_response: 'bg-secondary', resolved: 'bg-success', closed: 'bg-dark' }[status] || 'bg-secondary'
}

const isStepDone = (step, currentStatus) => {
  const order = ['new', 'in_progress', 'waiting_response', 'resolved', 'closed']
  return order.indexOf(currentStatus) >= order.indexOf(step)
}
</script>

<style scoped>
.admin-ticket-detail { animation: fadeIn 0.25s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ─── Vendor Chat Section (bottom of main card) ─── */
.vendor-chat-section {
  border-top: 1px solid #e9ecef;
  padding: 1.25rem 1.5rem;
  border-radius: 0 0 0.375rem 0.375rem;
}

.vendor-chat-section.has-vendor {
  background: linear-gradient(135deg, #f8f9ff 0%, #f3f0ff 100%);
}

.vendor-chat-section.no-vendor {
  background: #f8f9fa;
}

.vendor-chat-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.vendor-chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vendor-chat-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.vendor-chat-avatar-lg {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #28a745;
  border-radius: 50%;
  border: 2px solid white;
}

.vendor-chat-meta { min-width: 0; }
.vendor-chat-name { font-weight: 700; font-size: 0.9rem; color: #2c3e50; }
.vendor-chat-email { font-size: 0.78rem; color: #6c757d; margin-bottom: 0.25rem; }
.vendor-chat-ticket {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #696cff;
  font-weight: 600;
}
.vendor-chat-ticket i { font-size: 0.85rem; }

.badge-pill-xs {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  text-transform: uppercase;
}

.vendor-chat-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vendor-chat-hint {
  font-size: 0.75rem;
  color: #6c757d;
  margin: 0;
  text-align: right;
}

.btn-go-to-chat {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-go-to-chat:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(105, 108, 255, 0.4);
}
.btn-go-to-chat:active { transform: translateY(0); }
.btn-go-to-chat i { font-size: 1.1rem; }

/* No vendor state */
.no-vendor-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.no-vendor-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.no-vendor-icon i { font-size: 1.3rem; color: #6c757d; }
.no-vendor-title { font-weight: 600; font-size: 0.875rem; color: #495057; }
.no-vendor-sub { font-size: 0.775rem; color: #6c757d; }
.no-vendor-inner .btn { margin-left: auto; flex-shrink: 0; }

/* ─── Main Card ─── */
.ticket-main-card { border: none; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.ticket-header {
  background: linear-gradient(135deg, #696cff 0%, #9155fd 100%);
  color: white; padding: 1rem 1.5rem; border-radius: 0.375rem 0.375rem 0 0;
}
.ticket-header h6 { color: white; }

/* ─── Badge Pills ─── */
.badge-pill {
  padding: 0.3rem 0.7rem; font-size: 0.7rem; font-weight: 700;
  border-radius: 20px; text-transform: uppercase; letter-spacing: 0.4px;
}
.badge-warning { background: #ffc107; color: #000; }
.badge-info    { background: #17a2b8; color: #fff; }
.badge-secondary { background: #6c757d; color: #fff; }
.badge-success { background: #28a745; color: #fff; }
.badge-dark    { background: #343a40; color: #fff; }
.badge-danger  { background: #dc3545; color: #fff; }

/* ─── Event Info ─── */
.event-info-box { background: #f0f8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 0.85rem 1rem; }
.event-info-item { display: flex; align-items: flex-start; gap: 0.5rem; }
.event-info-item i { font-size: 1.1rem; margin-top: 0.1rem; flex-shrink: 0; }

.section-label {
  display: block; margin-bottom: 0.6rem;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: #6c757d;
}
.desc-text { color: #495057; line-height: 1.65; font-size: 0.9rem; }

/* ─── Timeline ─── */
.timeline { position: relative; padding-left: 28px; }
.timeline::before {
  content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px;
  width: 2px; background: #e9ecef; border-radius: 2px;
}
.timeline-item { position: relative; padding-bottom: 1.25rem; display: flex; gap: 0.75rem; }
.timeline-item.last { padding-bottom: 0; }
.timeline-dot {
  position: absolute; left: -28px; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 10px; flex-shrink: 0; top: 2px;
}
.dot-primary { background: #696cff; }
.dot-info    { background: #17a2b8; }
.dot-warning { background: #ffc107; }
.dot-success { background: #28a745; }
.dot-dark    { background: #343a40; }
.timeline-body { font-size: 0.875rem; }

/* ─── Sidebar ─── */
.card-header { background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
.fs-sm { font-size: 0.8rem; }
.side-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
}
.info-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #495057; }
.classify-row { padding-bottom: 0.75rem; border-bottom: 1px solid #f0f0f0; }
.classify-row:last-child { padding-bottom: 0; border-bottom: none; }
.btn-xxs { padding: 0.1rem 0.45rem; font-size: 0.7rem; line-height: 1.3; }
.alert-sm { font-size: 0.8rem; }

/* ─── Vendor Chat Button (sidebar) ─── */
.btn-vendor-chat-sm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; border: none; padding: 0.375rem 0.75rem;
  border-radius: 6px; font-size: 0.8rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.btn-vendor-chat-sm:hover {
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(105,108,255,.35); color: white;
}

/* ─── SLA ─── */
.sla-metric { padding: 0.75rem; background: #f8f9fa; border-radius: 6px; font-size: 0.875rem; }

/* ─── Activity Card ─── */
.activity-card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.activity-stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.icon-created  { background: #e8f4fd; color: #1a73e8; }
.icon-category { background: #fef3e2; color: #f57c00; }
.icon-priority { background: #fce4ec; color: #c62828; }
.icon-sla-ok   { background: #e8f5e9; color: #2e7d32; }
.icon-sla-warn { background: #fff3e0; color: #e65100; }
.icon-urgency  { background: #fff8e1; color: #f9a825; }
.icon-vendor   { background: #ede7f6; color: #6a1b9a; }

.activity-stat-label {
  font-size: 0.7rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.activity-stat-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Progress */
.status-progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.status-steps {
  display: flex;
  justify-content: space-between;
}

.step {
  font-size: 0.68rem;
  color: #adb5bd;
  font-weight: 500;
  position: relative;
}

.step.done {
  color: #696cff;
  font-weight: 700;
}

@media (max-width: 768px) {
  .activity-grid { grid-template-columns: repeat(2, 1fr); }
}

@media print { .btn, .vendor-chat-back-banner { display: none !important; } }
</style>