<template>
  <div class="deletion-requests-page">
    <div class="page-header">
      <div class="header-content">
        <h4 class="page-title">
          <i class="bx bx-file-find"></i>
          Permintaan Penghapusan Tiket
        </h4>
        <p class="page-subtitle">Tinjau dan setujui/tolak permintaan penghapusan dari user</p>
      </div>
      <div class="header-stats">
        <div class="stat-badge">
          <i class="bx bx-time"></i>
          <span>{{ pendingCount }} Menunggu</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="bx bx-loader-alt bx-spin"></i>
      <p>Memuat permintaan...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="bx bx-check-circle"></i>
      </div>
      <h5>Tidak Ada Permintaan Penghapusan</h5>
      <p>Semua permintaan penghapusan telah ditinjau</p>
    </div>

    <!-- Requests List -->
    <div v-else class="requests-grid">
      <div v-for="request in requests" :key="request.id" class="request-card">
        <!-- Card Header -->
        <div class="card-header">
          <div class="request-badge pending">
            <i class="bx bx-time"></i>
            <span>Pending</span>
          </div>
          <span class="request-date">{{ formatDate(request.created_at) }}</span>
        </div>

        <!-- Ticket Info -->
        <div class="ticket-section">
          <div class="section-title">
            <i class="bx bx-ticket"></i>
            <span>Informasi Tiket</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nomor:</span>
              <span class="info-value">{{ request.ticket.ticket_number }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Judul:</span>
              <span class="info-value">{{ request.ticket.title }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Kategori:</span>
              <span class="info-value">{{ request.ticket.category?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="badge-status" :class="`status-${request.ticket.status}`">
                {{ request.ticket.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div class="user-section">
          <div class="section-title">
            <i class="bx bx-user"></i>
            <span>Diminta Oleh</span>
          </div>
          <div class="user-info">
            <div class="user-avatar">
              {{ request.user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ request.user.name }}</div>
              <div class="user-email">{{ request.user.email }}</div>
            </div>
          </div>
        </div>

        <!-- Reason Section -->
        <div class="reason-section">
          <div class="section-title">
            <i class="bx bx-info-circle"></i>
            <span>Alasan Penghapusan</span>
          </div>
          <div class="reason-badge">
            <i :class="getReasonIcon(request.reason)"></i>
            <span>{{ getReasonLabel(request.reason) }}</span>
          </div>
          <div v-if="request.description" class="reason-description">
            {{ request.description }}
          </div>
        </div>

        <!-- Admin Notes (Optional) -->
        <div class="admin-notes-section">
          <label class="notes-label">
            <i class="bx bx-note"></i>
            Catatan Admin (Opsional)
          </label>
          <textarea
            v-model="adminNotes[request.id]"
            class="admin-notes-input"
            rows="2"
            placeholder="Tambahkan catatan untuk user..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="card-actions">
          <button 
            @click="handleRequest(request.id, 'reject')"
            class="btn-reject"
            :disabled="processing === request.id"
          >
            <i class="bx bx-x"></i>
            <span>Tolak</span>
          </button>
          <button 
            @click="handleRequest(request.id, 'approve')"
            class="btn-approve"
            :disabled="processing === request.id"
          >
            <template v-if="processing === request.id">
              <i class="bx bx-loader-alt bx-spin"></i>
              <span>Memproses...</span>
            </template>
            <template v-else>
              <i class="bx bx-check"></i>
              <span>Setujui & Hapus</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const loading = ref(true)
const processing = ref(null)
const requests = ref([])
const adminNotes = reactive({})

const pendingCount = computed(() => requests.value.length)

const reasonLabels = {
  duplicate: 'Tiket Duplikat',
  solved: 'Masalah Sudah Teratasi',
  wrong_category: 'Kategori Salah',
  wrong_info: 'Informasi Salah',
  other: 'Alasan Lain'
}

const reasonIcons = {
  duplicate: 'bx bx-copy',
  solved: 'bx bx-check-circle',
  wrong_category: 'bx bx-folder-open',
  wrong_info: 'bx bx-edit',
  other: 'bx bx-dots-horizontal-rounded'
}

onMounted(() => {
  fetchRequests()
})

const fetchRequests = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/deletion-requests/pending')
    requests.value = response.data.deletion_requests
  } catch (error) {
    console.error('Error fetching deletion requests:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal memuat permintaan penghapusan',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    loading.value = false
  }
}

const getReasonLabel = (reason) => {
  return reasonLabels[reason] || reason
}

const getReasonIcon = (reason) => {
  return reasonIcons[reason] || 'bx bx-info-circle'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRequest = async (requestId, action) => {
  const actionText = action === 'approve' ? 'menyetujui' : 'menolak'
  const actionTitle = action === 'approve' ? 'Setujui Permintaan?' : 'Tolak Permintaan?'
  const actionColor = action === 'approve' ? '#ef4444' : '#6c757d'
  
  const result = await Swal.fire({
    title: actionTitle,
    text: `Anda yakin ingin ${actionText} permintaan penghapusan ini?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: actionColor,
    cancelButtonColor: '#cbd5e1',
    confirmButtonText: action === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) {
    return
  }

  processing.value = requestId

  try {
    const payload = {
      action: action,
      admin_notes: adminNotes[requestId] || null
    }

    await api.post(`/admin/deletion-requests/${requestId}/handle`, payload)

    await Swal.fire({
      icon: 'success',
      title: action === 'approve' ? 'Disetujui!' : 'Ditolak!',
      text: `Permintaan penghapusan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`,
      confirmButtonColor: '#667eea',
      timer: 2000
    })

    // Remove from list
    requests.value = requests.value.filter(r => r.id !== requestId)
    delete adminNotes[requestId]

  } catch (error) {
    console.error(`Error ${action}ing deletion request:`, error)
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || `Gagal ${actionText} permintaan`,
      confirmButtonColor: '#ef4444'
    })
  } finally {
    processing.value = null
  }
}
</script>

<style scoped>
.deletion-requests-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.page-title i {
  font-size: 2rem;
  color: #667eea;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-radius: 12px;
  font-weight: 700;
  color: #c2410c;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
}

.stat-badge i {
  font-size: 1.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.loading-state p {
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #059669;
}

.empty-state h5 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: #64748b;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.request-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid #f0f0f0;
}

.request-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 2px solid #fbbf24;
}

.request-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
}

.request-badge.pending {
  background: rgba(255, 255, 255, 0.9);
  color: #d97706;
}

.request-badge i {
  font-size: 1.125rem;
}

.request-date {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 600;
}

.ticket-section,
.user-section,
.reason-section,
.admin-notes-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title i {
  font-size: 1.125rem;
  color: #667eea;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
}

.badge-status {
  display: inline-block;
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-new {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.reason-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 20px;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 1rem;
}

.reason-badge i {
  font-size: 1.125rem;
}

.reason-description {
  background: #f8fafc;
  border-left: 3px solid #cbd5e1;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.6;
  margin-top: 0.75rem;
}

.notes-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.625rem;
}

.notes-label i {
  font-size: 1.125rem;
  color: #667eea;
}

.admin-notes-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #fafbfc;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.admin-notes-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.card-actions {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
}

.btn-reject,
.btn-approve {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-reject {
  background: white;
  color: #475569;
  border: 2px solid #e5e7eb;
}

.btn-reject:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-approve {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.btn-approve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-reject:disabled,
.btn-approve:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .requests-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .deletion-requests-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn-reject,
  .btn-approve {
    width: 100%;
  }
}
</style>