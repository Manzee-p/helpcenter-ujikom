<template>
  <div class="admin-status-detail-page">
    <!-- Back Button -->
    <button @click="goBack" class="btn-back">
      <i class="bx bx-arrow-left"></i>
      <span>Kembali ke Daftar Status</span>
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat detail status...</p>
    </div>

    <!-- Content -->
    <div v-else-if="status" class="detail-content">
      <div class="content-grid">
        <!-- Main Column -->
        <div class="main-column">
          <!-- Header Card -->
          <div class="card header-card">
            <div class="header-top">
              <div class="header-info">
                <div class="header-badges">
                  <span class="badge badge-number">
                    <i class="bx bx-hash"></i>
                    {{ status.incident_number }}
                  </span>
                  <span v-if="status.is_pinned" class="badge badge-pinned">
                    <i class="bx bxs-pin"></i>
                    Pinned
                  </span>
                  <span :class="['badge', 'badge-visibility', status.is_public ? 'badge-public' : 'badge-private']">
                    <i :class="status.is_public ? 'bx bx-show' : 'bx bx-hide'"></i>
                    {{ status.is_public ? 'Publik' : 'Private' }}
                  </span>
                </div>
                <h1 class="status-title">{{ status.title }}</h1>
                <div class="status-meta">
                  <span class="meta-item">
                    <i class="bx bx-category"></i>
                    {{ getCategoryLabel(status.category) }}
                  </span>
                  <span v-if="status.affected_area" class="meta-item">
                    <i class="bx bx-map-pin"></i>
                    {{ status.affected_area }}
                  </span>
                  <span class="meta-item">
                    <i class="bx bx-calendar"></i>
                    {{ formatDateTime(status.started_at) }}
                  </span>
                </div>
              </div>
              <div class="header-badges-right">
                <span :class="['severity-badge-large', `severity-${status.severity}`]">
                  <i class="bx bx-flag"></i>
                  {{ getSeverityLabel(status.severity) }}
                </span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Current Status Banner -->
            <div :class="['current-status-banner', `status-${status.status}`]">
              <div class="status-icon">
                <i :class="getStatusIcon(status.status)"></i>
              </div>
              <div class="status-info">
                <span class="status-label">Status Saat Ini</span>
                <span class="status-value">{{ getStatusLabel(status.status) }}</span>
              </div>
            </div>

            <div v-if="status.resolved_at" class="resolved-info">
              <i class="bx bx-check-circle"></i>
              <span>Diselesaikan pada: {{ formatDateTime(status.resolved_at) }}</span>
            </div>
          </div>

          <!-- Description Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="section-title">
                <i class="bx bx-file-blank"></i>
                Deskripsi Masalah
              </h3>
            </div>
            <div class="card-body">
              <p class="description-text">{{ status.description }}</p>
            </div>
          </div>

          <!-- Updates Timeline -->
          <div class="card">
            <div class="card-header">
              <h3 class="section-title">
                <i class="bx bx-history"></i>
                Timeline Update
              </h3>
              <button @click="showAddUpdateModal = true" class="btn-add-update">
                <i class="bx bx-plus-circle"></i>
                Tambah Update
              </button>
            </div>
            <div class="card-body">
              <div v-if="updates.length === 0" class="empty-updates">
                <i class="bx bx-info-circle"></i>
                <p>Belum ada update</p>
              </div>

              <div v-else class="timeline">
                <div
                  v-for="(update, index) in updates"
                  :key="update.id"
                  class="timeline-item"
                >
                  <div class="timeline-marker" :class="`marker-${update.update_type}`">
                    <i :class="getUpdateIcon(update.update_type)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="update-header">
                      <div class="update-author">
                        <i class="bx bx-user-circle"></i>
                        {{ update.user?.name || 'Admin' }}
                      </div>
                      <span class="update-time">{{ formatTimeAgo(update.created_at) }}</span>
                    </div>
                    <p class="update-message">{{ update.message }}</p>
                    <span :class="['update-type-badge', `type-${update.update_type}`]">
                      {{ getUpdateTypeLabel(update.update_type) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Column -->
        <div class="side-column">
          <!-- Quick Actions Card -->
          <div class="card side-card">
            <div class="card-header">
              <h3 class="section-title">
                <i class="bx bx-lightning"></i>
                Quick Actions
              </h3>
            </div>
            <div class="card-body">
              <div class="action-buttons">
                <button @click="toggleVisibility" class="action-btn btn-visibility">
                  <i :class="status.is_public ? 'bx bx-hide' : 'bx bx-show'"></i>
                  {{ status.is_public ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
                <button @click="togglePin" class="action-btn btn-pin">
                  <i :class="status.is_pinned ? 'bx bx-pin' : 'bx bxs-pin'"></i>
                  {{ status.is_pinned ? 'Unpin' : 'Pin Status' }}
                </button>
                <button @click="showUpdateStatusModal = true" class="action-btn btn-status">
                  <i class="bx bx-edit"></i>
                  Update Status
                </button>
                <button @click="confirmDelete" class="action-btn btn-delete">
                  <i class="bx bx-trash"></i>
                  Hapus Status
                </button>
              </div>
            </div>
          </div>

          <!-- Assignment Info Card -->
          <div class="card side-card">
            <div class="card-header">
              <h3 class="section-title">
                <i class="bx bx-user-check"></i>
                Penanganan
              </h3>
            </div>
            <div class="card-body">
              <div v-if="status.assignedTo" class="assigned-user">
                <div class="assigned-avatar">
                  <i class="bx bx-user-circle"></i>
                </div>
                <div class="assigned-info">
                  <span class="assigned-name">{{ status.assignedTo.name }}</span>
                  <span class="assigned-email">{{ status.assignedTo.email }}</span>
                  <span class="assigned-role">{{ getRoleLabel(status.assignedTo.role) }}</span>
                </div>
              </div>
              <div v-else class="unassigned-state">
                <i class="bx bx-user-x"></i>
                <span>Belum ditugaskan</span>
              </div>
              <button @click="showAssignModal = true" class="btn-assign">
                <i class="bx bx-user-plus"></i>
                {{ status.assignedTo ? 'Ubah Penugasan' : 'Tugaskan' }}
              </button>
            </div>
          </div>

          <!-- Created By Info -->
          <div class="card side-card">
            <div class="card-header">
              <h3 class="section-title">
                <i class="bx bx-info-circle"></i>
                Informasi
              </h3>
            </div>
            <div class="card-body">
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Dibuat Oleh:</span>
                  <span class="info-value">{{ status.creator?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dibuat:</span>
                  <span class="info-value">{{ formatDateTime(status.created_at) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Update Terakhir:</span>
                  <span class="info-value">{{ formatDateTime(status.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Update Modal -->
    <transition name="modal-fade">
      <div v-if="showAddUpdateModal" class="modal-backdrop" @click.self="closeAddUpdateModal">
        <div class="modal-modern">
          <div class="modal-header-modern">
            <h3><i class="bx bx-message-square-add"></i> Tambah Update</h3>
            <button @click="closeAddUpdateModal" class="modal-close-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>
          <form @submit.prevent="submitUpdate">
            <div class="modal-body-modern">
              <div class="form-group">
                <label class="input-label">Tipe Update:</label>
                <select v-model="updateForm.update_type" class="modal-select" required>
                  <option value="investigating">Penyelidikan</option>
                  <option value="update">Update Progress</option>
                  <option value="resolved">Status Selesai</option>
                </select>
              </div>
              <div class="form-group">
                <label class="input-label">Pesan Update:</label>
                <textarea
                  v-model="updateForm.message"
                  class="modal-textarea"
                  rows="5"
                  placeholder="Tulis update atau progress terbaru..."
                  maxlength="1000"
                  required
                ></textarea>
                <span class="char-counter">{{ updateForm.message.length }}/1000</span>
              </div>
            </div>
            <div class="modal-footer-modern">
              <button type="button" @click="closeAddUpdateModal" class="btn-modal btn-cancel">
                Batal
              </button>
              <button type="submit" class="btn-modal btn-confirm" :disabled="submittingUpdate">
                <i class="bx" :class="submittingUpdate ? 'bx-loader-alt bx-spin' : 'bx-send'"></i>
                {{ submittingUpdate ? 'Mengirim...' : 'Kirim Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Update Status Modal -->
    <transition name="modal-fade">
      <div v-if="showUpdateStatusModal" class="modal-backdrop" @click.self="closeUpdateStatusModal">
        <div class="modal-modern">
          <div class="modal-header-modern">
            <h3><i class="bx bx-edit"></i> Update Status</h3>
            <button @click="closeUpdateStatusModal" class="modal-close-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>
          <form @submit.prevent="submitStatusUpdate">
            <div class="modal-body-modern">
              <div class="form-group">
                <label class="input-label">Status Baru:</label>
                <select v-model="statusUpdateForm.status" class="modal-select" required>
                  <option value="investigating">Sedang Diselidiki</option>
                  <option value="identified">Teridentifikasi</option>
                  <option value="monitoring">Dalam Pemantauan</option>
                  <option value="resolved">Selesai</option>
                </select>
              </div>
            </div>
            <div class="modal-footer-modern">
              <button type="button" @click="closeUpdateStatusModal" class="btn-modal btn-cancel">
                Batal
              </button>
              <button type="submit" class="btn-modal btn-confirm" :disabled="submittingStatus">
                <i class="bx" :class="submittingStatus ? 'bx-loader-alt bx-spin' : 'bx-check'"></i>
                {{ submittingStatus ? 'Updating...' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Assign Modal -->
    <transition name="modal-fade">
      <div v-if="showAssignModal" class="modal-backdrop" @click.self="closeAssignModal">
        <div class="modal-modern">
          <div class="modal-header-modern">
            <h3><i class="bx bx-user-plus"></i> Tugaskan Status</h3>
            <button @click="closeAssignModal" class="modal-close-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>
          <form @submit.prevent="submitAssignment">
            <div class="modal-body-modern">
              <div class="form-group">
                <label class="input-label">Pilih Admin:</label>
                <select v-model="assignForm.assigned_to" class="modal-select" required>
                  <option value="">-- Pilih Admin --</option>
                  <option v-for="user in assignableUsers" :key="user.id" :value="user.id">
                    {{ user.name }} ({{ user.role }})
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer-modern">
              <button type="button" @click="closeAssignModal" class="btn-modal btn-cancel">
                Batal
              </button>
              <button type="submit" class="btn-modal btn-confirm" :disabled="!assignForm.assigned_to">
                <i class="bx bx-check"></i>
                Tugaskan
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
        <div class="modal-modern modal-danger">
          <div class="modal-header-modern">
            <h3><i class="bx bx-error"></i> Konfirmasi Hapus</h3>
            <button @click="closeDeleteModal" class="modal-close-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>
          <div class="modal-body-modern">
            <p class="delete-message">Apakah Anda yakin ingin menghapus status ini?</p>
            <div class="delete-detail">
              <strong>{{ status?.title }}</strong>
              <br>
              <small>{{ status?.incident_number }}</small>
            </div>
            <p class="delete-warning">Tindakan ini tidak dapat dibatalkan!</p>
          </div>
          <div class="modal-footer-modern">
            <button @click="closeDeleteModal" class="btn-modal btn-cancel">Batal</button>
            <button @click="deleteStatus" class="btn-modal btn-danger">
              <i class="bx bx-trash"></i> Hapus Status
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusBoardStore } from '@/stores/statusBoard'
import api from '@/services/api'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const statusBoardStore = useStatusBoardStore()

const loading = ref(true)
const status = ref(null)
const assignableUsers = ref([])

const showAddUpdateModal = ref(false)
const showUpdateStatusModal = ref(false)
const showAssignModal = ref(false)
const showDeleteModal = ref(false)

const submittingUpdate = ref(false)
const submittingStatus = ref(false)

const updateForm = ref({
  update_type: 'update',
  message: ''
})

const statusUpdateForm = ref({
  status: ''
})

const assignForm = ref({
  assigned_to: ''
})

const updates = computed(() => {
  if (!status.value?.updates) return []
  return [...status.value.updates].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )
})

// ✅ FIXED: Use admin method
const fetchStatusDetail = async () => {
  loading.value = true
  try {
    console.log('🔍 [ADMIN DETAIL] Fetching for ID:', route.params.id)
    
    const data = await statusBoardStore.fetchAdminStatusDetail(route.params.id)
    status.value = data
    statusUpdateForm.value.status = data.status
    
    console.log('✅ [ADMIN DETAIL] Loaded successfully')
  } catch (error) {
    console.error('❌ [ADMIN DETAIL] Fetch error:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal memuat detail status',
      confirmButtonColor: '#667eea'
    })
    router.push('/admin/status-board')
  } finally {
    loading.value = false
  }
}

const fetchAssignableUsers = async () => {
  try {
    const response = await api.get('/admin/users', {
      params: { role: 'admin' }
    })
    assignableUsers.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const toggleVisibility = async () => {
  try {
    await statusBoardStore.updateStatus(status.value.id, {
      is_public: !status.value.is_public
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Status ${status.value.is_public ? 'disembunyikan' : 'ditampilkan'}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })

    await fetchStatusDetail()
  } catch (error) {
    console.error('Error toggling visibility:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal mengubah visibilitas',
      confirmButtonColor: '#ef4444'
    })
  }
}

const togglePin = async () => {
  try {
    await statusBoardStore.updateStatus(status.value.id, {
      is_pinned: !status.value.is_pinned
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Status ${status.value.is_pinned ? 'di-unpin' : 'di-pin'}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })

    await fetchStatusDetail()
  } catch (error) {
    console.error('Error toggling pin:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal mengubah pin status',
      confirmButtonColor: '#ef4444'
    })
  }
}

const submitUpdate = async () => {
  submittingUpdate.value = true
  try {
    await statusBoardStore.addUpdate(status.value.id, updateForm.value)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Update berhasil ditambahkan',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })

    closeAddUpdateModal()
    await fetchStatusDetail()
  } catch (error) {
    console.error('Error adding update:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal menambahkan update',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    submittingUpdate.value = false
  }
}

const submitStatusUpdate = async () => {
  submittingStatus.value = true
  try {
    await statusBoardStore.updateStatus(status.value.id, {
      status: statusUpdateForm.value.status
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status berhasil diupdate',
      confirmButtonColor: '#667eea'
    })

    closeUpdateStatusModal()
    await fetchStatusDetail()
  } catch (error) {
    console.error('Error updating status:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal update status',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    submittingStatus.value = false
  }
}

const submitAssignment = async () => {
  try {
    await statusBoardStore.updateStatus(status.value.id, {
      assigned_to: assignForm.value.assigned_to
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status berhasil ditugaskan',
      confirmButtonColor: '#667eea'
    })

    closeAssignModal()
    await fetchStatusDetail()
  } catch (error) {
    console.error('Error assigning status:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal menugaskan status',
      confirmButtonColor: '#ef4444'
    })
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteStatus = async () => {
  try {
    await statusBoardStore.deleteStatus(status.value.id)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status berhasil dihapus',
      confirmButtonColor: '#667eea'
    })

    router.push('/admin/status-board')
  } catch (error) {
    console.error('Error deleting status:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal menghapus status',
      confirmButtonColor: '#ef4444'
    })
  }
}

const closeAddUpdateModal = () => {
  showAddUpdateModal.value = false
  updateForm.value = {
    update_type: 'update',
    message: ''
  }
}

const closeUpdateStatusModal = () => {
  showUpdateStatusModal.value = false
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assignForm.value.assigned_to = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const goBack = () => {
  router.push('/admin/status-board')
}

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Kritis',
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah'
  }
  return labels[severity] || severity
}

const getCategoryLabel = (category) => {
  const labels = {
    power_outage: 'Gangguan Listrik',
    technical_issue: 'Masalah Teknis',
    facility_issue: 'Masalah Fasilitas',
    network_issue: 'Gangguan Jaringan',
    other: 'Lainnya'
  }
  return labels[category] || category
}

const getStatusLabel = (statusValue) => {
  const labels = {
    investigating: 'Sedang Diselidiki',
    identified: 'Masalah Teridentifikasi',
    monitoring: 'Dalam Pemantauan',
    resolved: 'Selesai'
  }
  return labels[statusValue] || statusValue
}

const getStatusIcon = (statusValue) => {
  const icons = {
    investigating: 'bx-search-alt',
    identified: 'bx-check-shield',
    monitoring: 'bx-radar',
    resolved: 'bx-check-circle'
  }
  return `bx ${icons[statusValue] || 'bx-info-circle'}`
}

const getUpdateIcon = (type) => {
  const icons = {
    investigating: 'bx-search-alt',
    update: 'bx-info-circle',
    resolved: 'bx-check-circle'
  }
  return `bx ${icons[type] || 'bx-message-square-detail'}`
}

const getUpdateTypeLabel = (type) => {
  const labels = {
    investigating: 'Penyelidikan',
    update: 'Update',
    resolved: 'Selesai'
  }
  return labels[type] || type
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    vendor: 'Vendor',
    client: 'Client'
  }
  return labels[role] || role
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeAgo = (date) => {
  if (!date) return ''

  const now = new Date()
  const past = new Date(date)
  const diffInMinutes = Math.floor((now - past) / 60000)

  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam lalu`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} hari lalu`

  return formatDateTime(date)
}

onMounted(() => {
  fetchStatusDetail()
  fetchAssignableUsers()
})
</script>

<style scoped>
.admin-status-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

/* Back Button */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-4px);
}

/* Loading */
.loading-state {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Content Grid */
.detail-content {
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.card-header {
  padding: 1.25rem 1.5rem;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  font-size: 1.25rem;
  color: #667eea;
}

/* Header Card */
.header-card {
  padding: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}

.header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge-pinned {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.badge-public {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-private {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.status-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.status-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #6c757d;
  font-weight: 500;
}

.meta-item i {
  font-size: 1.125rem;
  color: #667eea;
}

.severity-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
}

.severity-critical {
  background: #fee2e2;
  color: #991b1b;
}

.severity-high {
  background: #fef3c7;
  color: #92400e;
}

.severity-medium {
  background: #dbeafe;
  color: #1e40af;
}

.severity-low {
  background: #f3f4f6;
  color: #4b5563;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

/* Current Status Banner */
.current-status-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 3px solid;
}

.current-status-banner .status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.current-status-banner .status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.current-status-banner .status-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
}

.current-status-banner .status-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.status-investigating {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.status-investigating .status-icon {
  background: #f59e0b;
  color: white;
}

.status-identified {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.status-identified .status-icon {
  background: #3b82f6;
  color: white;
}

.status-monitoring {
  background: #e0e7ff;
  border-color: #6366f1;
  color: #4338ca;
}

.status-monitoring .status-icon {
  background: #6366f1;
  color: white;
}

.status-resolved {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.status-resolved .status-icon {
  background: #10b981;
  color: white;
}

.resolved-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 8px;
  margin-top: 1rem;
  color: #065f46;
  font-size: 0.9375rem;
  font-weight: 500;
}

.resolved-info i {
  font-size: 1.25rem;
}

/* Description */
.description-text {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #4b5563;
  margin: 0;
  white-space: pre-wrap;
}

/* Timeline */
.btn-add-update {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-update:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.empty-updates {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.empty-updates i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-updates p {
  font-size: 1rem;
  margin: 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 23px;
  top: 56px;
  bottom: -32px;
  width: 2px;
  background: linear-gradient(to bottom, #e5e7eb 0%, transparent 100%);
}

.timeline-marker {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.marker-investigating {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.marker-update {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.marker-resolved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.timeline-content {
  flex: 1;
  background: #f9fafb;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.update-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9375rem;
}

.update-author i {
  font-size: 1.25rem;
  color: #667eea;
}

.update-time {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.update-message {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  white-space: pre-wrap;
}

.update-type-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-investigating {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.type-update {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.type-resolved {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

/* Side Column */
.side-card {
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-visibility {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-visibility:hover {
  background: #c7d2fe;
  transform: translateY(-2px);
}

.btn-pin {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.btn-pin:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.btn-status {
  background: #dbeafe;
  color: #1e40af;
}

.btn-status:hover {
  background: #bfdbfe;
  transform: translateY(-2px);
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

/* Assigned User */
.assigned-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.assigned-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.assigned-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.assigned-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9375rem;
}

.assigned-email {
  font-size: 0.8125rem;
  color: #6c757d;
}

.assigned-role {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.unassigned-state {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 10px;
  color: #856404;
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.unassigned-state i {
  font-size: 1.25rem;
}

.btn-assign {
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-assign:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8125rem;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #2c3e50;
  font-weight: 600;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-modern {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-modern.modal-danger .modal-header-modern {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.modal-header-modern h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body-modern {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.625rem;
}

.modal-select,
.modal-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.3s;
}

.modal-select:focus,
.modal-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.modal-textarea {
  resize: vertical;
  line-height: 1.6;
}

.char-counter {
  display: block;
  font-size: 0.8125rem;
  color: #9ca3af;
  text-align: right;
  margin-top: 0.375rem;
}

.modal-footer-modern {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-modal {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  font-size: 0.9375rem;
}

.btn-cancel {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Delete Modal Specific */
.delete-message {
  font-size: 1rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 1rem;
}

.delete-detail {
  background: #fef2f2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #374151;
  margin-bottom: 1rem;
  border-left: 3px solid #ef4444;
}

.delete-warning {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-status-detail-page {
    padding: 1rem;
  }

  .header-card {
    padding: 1.5rem;
  }

  .status-title {
    font-size: 1.5rem;
  }

  .current-status-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-item {
    gap: 1rem;
  }

  .timeline-marker {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .timeline-item:not(:last-child)::before {
    left: 19px;
  }
}
</style>