<template>
  <div class="admin-status-board-page">
    <!-- Page Header -->
    <div class="page-header-section">
      <div class="header-wrapper">
        <div class="header-left">
          <div class="header-icon">
            <i class="bx bx-info-circle"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Papan Status</h1>
            <p class="header-subtitle">Kelola informasi status gangguan dan pemeliharaan</p>
          </div>
        </div>
        <router-link to="/admin/status-board/create" class="btn-create">
          <i class="bx bx-plus-circle"></i>
          <span>Buat Status Baru</span>
        </router-link>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-cards-container">
      <div class="stat-card-modern stat-primary">
        <div class="stat-icon-wrapper">
          <i class="bx bx-file"></i>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ statistics.total_incidents || 0 }}</span>
          <span class="stat-label">Total Incident</span>
        </div>
      </div>

      <div class="stat-card-modern stat-warning">
        <div class="stat-icon-wrapper">
          <i class="bx bx-error"></i>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ statistics.active_incidents || 0 }}</span>
          <span class="stat-label">Incident Aktif</span>
        </div>
      </div>

      <div class="stat-card-modern stat-success">
        <div class="stat-icon-wrapper">
          <i class="bx bx-check-circle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ statistics.resolved_incidents || 0 }}</span>
          <span class="stat-label">Terselesaikan</span>
        </div>
      </div>

      <div class="stat-card-modern stat-danger">
        <div class="stat-icon-wrapper">
          <i class="bx bx-error-circle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ statistics.critical_incidents || 0 }}</span>
          <span class="stat-label">Kritis</span>
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="search-wrapper">
        <i class="bx bx-search search-icon"></i>
        <input
          v-model="filters.search"
          type="text"
          class="search-input"
          placeholder="Cari berdasarkan judul, nomor incident, atau area..."
          @input="debouncedSearch"
        />
      </div>

      <div class="filters-row">
        <div class="filter-item">
          <label>Status</label>
          <select v-model="filters.status" @change="fetchStatuses" class="modern-select">
            <option value="">Semua Status</option>
            <option value="investigating">Sedang Diselidiki</option>
            <option value="identified">Teridentifikasi</option>
            <option value="monitoring">Pemantauan</option>
            <option value="resolved">Selesai</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Kategori</label>
          <select v-model="filters.category" @change="fetchStatuses" class="modern-select">
            <option value="">Semua Kategori</option>
            <option value="power_outage">Gangguan Listrik</option>
            <option value="technical_issue">Masalah Teknis</option>
            <option value="facility_issue">Masalah Fasilitas</option>
            <option value="network_issue">Gangguan Jaringan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Tingkat</label>
          <select v-model="filters.severity" @change="fetchStatuses" class="modern-select">
            <option value="">Semua Tingkat</option>
            <option value="critical">Kritis</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>

        <button @click="resetFilters" class="btn-reset-modern">
          <i class="bx bx-refresh"></i>
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="modern-spinner"></div>
      <p>Memuat data status...</p>
    </div>

    <!-- Table Card -->
    <div v-else class="table-card">
      <!-- Table Header -->
      <div class="table-card-header">
        <h3>
          <i class="bx bx-list-ul"></i>
          Daftar Status
          <span class="count-badge">{{ pagination.total }} status</span>
        </h3>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th class="th-number">No. Incident</th>
              <th class="th-title">Judul</th>
              <th class="th-category">Kategori</th>
              <th class="th-area">Area Terdampak</th>
              <th class="th-severity">Tingkat</th>
              <th class="th-status">Status</th>
              <th class="th-date">Waktu Mulai</th>
              <th class="th-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="statuses.length === 0">
              <td colspan="8">
                <div class="empty-state-modern">
                  <div class="empty-icon">
                    <i class="bx bx-folder-open"></i>
                  </div>
                  <h4>Tidak Ada Status</h4>
                  <p>Belum ada status yang dibuat</p>
                </div>
              </td>
            </tr>
            <tr v-for="status in statuses" :key="status.id" class="table-row">
              <td>
                <div class="incident-id">
                  <i class="bx bx-hash"></i>
                  {{ status.incident_number }}
                </div>
                <span v-if="status.is_pinned" class="pinned-tag">
                  <i class="bx bxs-pin"></i>
                  Pinned
                </span>
              </td>
              <td>
                <div class="status-title">
                  {{ status.title }}
                </div>
              </td>
              <td>
                <span :class="['category-tag', getCategoryClass(status.category)]">
                  {{ getCategoryLabel(status.category) }}
                </span>
              </td>
              <td>
                <div class="area-cell">
                  <i class="bx bx-map-pin"></i>
                  <span>{{ status.affected_area || '-' }}</span>
                </div>
              </td>
              <td>
                <span :class="['severity-tag', `severity-${status.severity}`]">
                  <i class="bx bx-flag"></i>
                  {{ getSeverityLabel(status.severity) }}
                </span>
              </td>
              <td>
                <span :class="['status-tag', `status-${status.status}`]">
                  <i :class="getStatusIcon(status.status)"></i>
                  {{ getStatusLabel(status.status) }}
                </span>
              </td>
              <td>
                <div class="date-cell">
                  <span class="date-main">{{ formatDate(status.started_at) }}</span>
                  <span class="date-time">{{ formatTime(status.started_at) }}</span>
                </div>
              </td>
              <td>
                <div class="actions-cell">
                  <button
                    @click="viewDetail(status)"
                    class="action-btn action-view"
                    title="Lihat Detail"
                  >
                    <i class="bx bx-show"></i>
                  </button>
                  <button
                    @click="toggleVisibility(status)"
                    class="action-btn action-visibility"
                    :title="status.is_public ? 'Sembunyikan' : 'Tampilkan'"
                  >
                    <i :class="status.is_public ? 'bx bx-hide' : 'bx bx-show'"></i>
                  </button>
                  <button
                    @click="togglePin(status)"
                    class="action-btn action-pin"
                    :title="status.is_pinned ? 'Unpin' : 'Pin'"
                  >
                    <i :class="status.is_pinned ? 'bx bxs-pin' : 'bx bx-pin'"></i>
                  </button>
                  <button
                    @click="confirmDelete(status)"
                    class="action-btn action-delete"
                    title="Hapus"
                  >
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="table-footer">
        <div class="pagination-info">
          Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} status
        </div>
        <div class="pagination-controls">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="pagination-button"
          >
            <i class="bx bx-chevron-left"></i>
          </button>
          <span class="page-indicator">
            {{ pagination.current_page }} / {{ pagination.last_page }}
          </span>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="pagination-button"
          >
            <i class="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

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
              <strong>{{ deleteTarget?.title }}</strong>
              <br>
              <small>{{ deleteTarget?.incident_number }}</small>
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
import { useRouter } from 'vue-router'
import { useStatusBoardStore } from '@/stores/statusBoard'
import Swal from 'sweetalert2'

const router = useRouter()
const statusBoardStore = useStatusBoardStore()

const loading = ref(false)
const statistics = ref({
  total_incidents: 0,
  active_incidents: 0,
  resolved_incidents: 0,
  critical_incidents: 0
})
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

const filters = ref({
  search: '',
  status: '',
  category: '',
  severity: '',
  page: 1
})

let searchTimeout = null

const statuses = computed(() => statusBoardStore.statuses)
const pagination = computed(() => statusBoardStore.pagination)

const fetchStatistics = async () => {
  try {
    console.log('🔍 Fetching statistics...')
    const stats = await statusBoardStore.fetchStatistics()
    
    if (stats && typeof stats === 'object') {
      statistics.value = {
        total_incidents: stats.total_incidents || 0,
        active_incidents: stats.active_incidents || 0,
        resolved_incidents: stats.resolved_incidents || 0,
        critical_incidents: stats.critical_incidents || 0
      }
      console.log('✅ Statistics updated:', statistics.value)
    }
  } catch (error) {
    console.error('❌ Error fetching statistics:', error)
  }
}

const fetchStatuses = async (page = 1) => {
  loading.value = true
  try {
    filters.value.page = page
    await statusBoardStore.fetchAdminStatuses(filters.value)
  } catch (error) {
    console.error('Error fetching statuses:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal memuat data status',
      confirmButtonColor: '#667eea'
    })
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchStatuses(), 500)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    category: '',
    severity: '',
    page: 1
  }
  fetchStatuses()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchStatuses(page)
  }
}

const viewDetail = (status) => {
  router.push(`/admin/status-board/${status.id}`)
}

const toggleVisibility = async (status) => {
  try {
    await statusBoardStore.updateStatus(status.id, {
      is_public: !status.is_public
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Status ${status.is_public ? 'disembunyikan' : 'ditampilkan'}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
    
    fetchStatuses(filters.value.page)
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

const togglePin = async (status) => {
  try {
    await statusBoardStore.updateStatus(status.id, {
      is_pinned: !status.is_pinned
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Status ${status.is_pinned ? 'di-unpin' : 'di-pin'}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
    
    fetchStatuses(filters.value.page)
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

const confirmDelete = (status) => {
  deleteTarget.value = status
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
}

const deleteStatus = async () => {
  try {
    await statusBoardStore.deleteStatus(deleteTarget.value.id)
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status berhasil dihapus',
      confirmButtonColor: '#667eea'
    })
    
    closeDeleteModal()
    fetchStatuses(filters.value.page)
    fetchStatistics()
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

// ✅ HELPER FUNCTIONS - Category
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

// ✅ FIXED: Add missing getCategoryClass function
const getCategoryClass = (category) => {
  const classes = {
    power_outage: 'cat-power',
    technical_issue: 'cat-technical',
    facility_issue: 'cat-facility',
    network_issue: 'cat-network',
    other: 'cat-other'
  }
  return classes[category] || 'cat-other'
}

// ✅ HELPER FUNCTIONS - Severity
const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Kritis',
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah'
  }
  return labels[severity] || severity
}

// ✅ HELPER FUNCTIONS - Status
const getStatusLabel = (status) => {
  const labels = {
    investigating: 'Diselidiki',
    identified: 'Teridentifikasi',
    monitoring: 'Pemantauan',
    resolved: 'Selesai'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    investigating: 'bx bx-search-alt',
    identified: 'bx bx-check-shield',
    monitoring: 'bx bx-radar',
    resolved: 'bx bx-check-circle'
  }
  return icons[status] || 'bx bx-info-circle'
}

// ✅ HELPER FUNCTIONS - Date/Time
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('📍 AdminStatusBoard mounted')
  
  try {
    await fetchStatistics()
    await fetchStatuses()
  } catch (error) {
    console.error('❌ Error during initialization:', error)
  }
})
</script>

<style scoped>
.admin-status-board-page {
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.header-text {
  color: white;
}

.header-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.375rem 0;
  color: white;
}

.header-subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 1rem;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Statistics Cards */
.stats-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card-modern {
  background: white;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid;
  transition: all 0.3s;
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-primary {
  border-left-color: #667eea;
}

.stat-primary .stat-icon-wrapper {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.stat-warning {
  border-left-color: #f59e0b;
}

.stat-warning .stat-icon-wrapper {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-success {
  border-left-color: #10b981;
}

.stat-success .stat-icon-wrapper {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-danger {
  border-left-color: #ef4444;
}

.stat-danger .stat-icon-wrapper {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.813rem;
  font-weight: 500;
}

/* Filters Card */
.filters-card {
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-wrapper {
  position: relative;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  flex: 1;
  min-width: 180px;
}

.filter-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.modern-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.938rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
}

.modern-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-reset-modern {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-reset-modern:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.modern-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-badge {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background: #f9fafb;
}

.modern-table th {
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.modern-table tbody tr.table-row {
  transition: background 0.2s;
}

.modern-table tbody tr.table-row:hover {
  background: #f9fafb;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.incident-id {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: #667eea;
  font-size: 0.875rem;
}

.pinned-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  margin-top: 0.25rem;
}

.status-title {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.938rem;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.cat-power {
  background-color: #fef3c7;
  color: #92400e;
}

.cat-technical {
  background-color: #dbeafe;
  color: #1e40af;
}

.cat-facility {
  background-color: #e0e7ff;
  color: #4338ca;
}

.cat-network {
  background-color: #d1fae5;
  color: #065f46;
}

.cat-other {
  background-color: #f3f4f6;
  color: #4b5563;
}

.area-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.severity-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  white-space: nowrap;
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

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.status-investigating {
  background: #fef3c7;
  color: #92400e;
}

.status-identified {
  background: #dbeafe;
  color: #1e40af;
}

.status-monitoring {
  background: #e0e7ff;
  color: #4338ca;
}

.status-resolved {
  background: #d1fae5;
  color: #065f46;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-main {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.date-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.375rem;
}

.action-btn {
  background: #f3f4f6;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-size: 1.125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-view {
  color: #3b82f6;
}

.action-view:hover {
  background: #dbeafe;
}

.action-visibility {
  color: #8b5cf6;
}

.action-visibility:hover {
  background: #ede9fe;
}

.action-pin {
  color: #667eea;
}

.action-pin:hover {
  background: #e0e7ff;
}

.action-delete {
  color: #ef4444;
}

.action-delete:hover {
  background: #fee2e2;
}

.empty-state-modern {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state-modern h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #6b7280;
}

.empty-state-modern p {
  margin: 0;
  font-size: 0.938rem;
}

/* Table Footer & Pagination */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination-button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-size: 1.125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  background: #f9fafb;
}

.pagination-button:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.page-indicator {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
  padding: 0 0.5rem;
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-bottom: none;
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
  font-size: 0.938rem;
  color: #374151;
  margin-bottom: 1rem;
  border-left: 3px solid #ef4444;
}

.delete-warning {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
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
  font-size: 0.938rem;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
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

/* Responsive */
@media (max-width: 768px) {
  .admin-status-board-page {
    padding: 1rem;
  }

  .page-header-section {
    padding: 1.5rem;
  }

  .header-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }

  .stats-cards-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .filters-row {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }

  .btn-reset-modern {
    width: 100%;
    justify-content: center;
  }

  .modern-table {
    min-width: 900px;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>