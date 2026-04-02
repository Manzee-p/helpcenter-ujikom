<template>
  <div class="public-status-board">
    <div class="container">
      <!-- Hero Header -->
      <div class="hero-section">
        <div class="hero-main">
          <h1 class="page-title">Papan Informasi Status Layanan</h1>
          <p class="page-subtitle">Pantau status gangguan dan pemeliharaan sistem secara real-time</p>
          <div class="public-badge">
            <i class="bx bx-globe"></i>
            <span>Halaman publik - Tidak perlu login untuk melihat status</span>
          </div>
        </div>
        
        <!-- Overall Status Box -->
        <div class="status-box" :class="overallStatusClass">
          <div class="status-label">STATUS SISTEM</div>
          <div class="status-display">
            <i :class="overallStatusIcon"></i>
            <span class="status-text">{{ overallStatusText }}</span>
          </div>
          <div class="status-count" v-if="activeIncidents.length > 0">
            {{ activeIncidents.length }} Gangguan Aktif
          </div>
        </div>
      </div>

      <!-- Auth Notice for Non-logged Users -->
      <div v-if="!isAuthenticated" class="auth-notice">
        <div class="notice-content">
          <div class="notice-icon">
            <i class="bx bx-info-circle"></i>
          </div>
          <div class="notice-text">
            <h3>Ingin melaporkan masalah?</h3>
            <p>Login untuk membuat tiket dan berkomunikasi dengan tim support</p>
          </div>
        </div>
        <router-link to="/login" class="btn-login">
          <i class="bx bx-log-in"></i>
          <span>Login Sekarang</span>
        </router-link>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filter-header">
          <h3 class="filter-title">Filter Status</h3>
          <button @click="resetFilters" class="btn-reset">
            <i class="bx bx-refresh"></i>
            <span>Reset</span>
          </button>
        </div>
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">
              <i class="bx bx-filter"></i>
              Status
            </label>
            <select v-model="filters.status" @change="fetchStatuses" class="filter-select">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">
              <i class="bx bx-category"></i>
              Kategori
            </label>
            <select v-model="filters.category" @change="fetchStatuses" class="filter-select">
              <option value="">Semua Kategori</option>
              <option value="power_outage">Gangguan Listrik</option>
              <option value="technical_issue">Masalah Teknis</option>
              <option value="facility_issue">Masalah Fasilitas</option>
              <option value="network_issue">Gangguan Jaringan</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div class="filter-group filter-search">
            <label class="filter-label">
              <i class="bx bx-search"></i>
              Cari
            </label>
            <input
              v-model="filters.search"
              @input="debounceSearch"
              type="text"
              placeholder="Cari berdasarkan judul atau area..."
              class="filter-input"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">Memuat informasi status...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="statuses.length === 0" class="empty-state">
        <div class="empty-illustration">
          <i class="bx bx-check-circle"></i>
        </div>
        <h3 class="empty-title">Semua Sistem Normal</h3>
        <p class="empty-text">Tidak ada gangguan atau masalah yang dilaporkan saat ini</p>
        <div class="empty-meta">
          <i class="bx bx-time"></i>
          <span>Terakhir diperbarui: {{ new Date().toLocaleString('id-ID') }}</span>
        </div>
      </div>

      <!-- Status Cards -->
      <div v-else class="status-content">
        <!-- Pinned Items -->
        <div v-if="pinnedStatuses.length > 0" class="status-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="bx bxs-pin"></i>
              Status Penting
            </h3>
            <span class="count-badge">{{ pinnedStatuses.length }} Status</span>
          </div>
          <div class="status-list">
            <div
              v-for="status in pinnedStatuses"
              :key="status.id"
              @click="viewDetail(status.id)"
              class="status-card pinned"
            >
              <div class="card-badges">
                <span class="badge badge-pending">
                  <i class="bx bxs-pin"></i>
                  Penting
                </span>
                <span class="badge badge-number">{{ status.incident_number }}</span>
                <span class="badge badge-severity" :class="`severity-${status.severity}`">
                  <i class="bx bx-flag"></i>
                  {{ getSeverityLabel(status.severity) }}</span>
              </div>

              <h4 class="card-title">{{ status.title }}</h4>

              <div class="card-meta">
                <span class="meta-item">
                  <i class="bx bx-category"></i>
                  {{ getCategoryLabel(status.category) }}
                </span>
                <span v-if="status.affected_area" class="meta-item">
                  <i class="bx bx-map-pin"></i>
                  {{ status.affected_area }}
                </span>
              </div>

              <p class="card-desc">{{ truncateText(status.description, 100) }}</p>

              <div class="card-footer">
                <div class="status-badge" :class="`badge-${status.status}`">
                  <i class="bx bx-info-circle"></i>
                  {{ getStatusLabel(status.status) }}
                </div>
                <span class="card-time">
                  <i class="bx bx-time"></i>
                  {{ formatTimeAgo(status.started_at) }}
                </span>
              </div>

              <div v-if="status.updates_count > 0" class="updates-badge">
                <i class="bx bx-message-square-detail"></i>
                {{ status.updates_count }} Update
              </div>
            </div>
          </div>
        </div>

        <!-- Regular Items -->
        <div v-if="regularStatuses.length > 0" class="status-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="bx bx-clipboard"></i>
              Semua Status
            </h3>
            <span class="count-badge">{{ regularStatuses.length }} Status</span>
          </div>
          <div class="status-list">
            <div
              v-for="status in regularStatuses"
              :key="status.id"
              @click="viewDetail(status.id)"
              class="status-card"
            >
              <div class="card-badges">
                <span class="badge badge-pending" :class="`badge-${status.status}`">
                  <i class="bx bx-error"></i>
                  {{ getStatusLabel(status.status) }}
                </span>
                <span class="badge badge-number">{{ status.incident_number }}</span>
                <span class="badge badge-severity" :class="`severity-${status.severity}`">
                  <i class="bx bx-flag"></i>
                  {{ getSeverityLabel(status.severity) }}
                </span>
              </div>

              <h4 class="card-title">{{ status.title }}</h4>

              <div class="card-meta">
                <span class="meta-item">
                  <i class="bx bx-category"></i>
                  {{ getCategoryLabel(status.category) }}
                </span>
                <span v-if="status.affected_area" class="meta-item">
                  <i class="bx bx-map-pin"></i>
                  {{ status.affected_area }}
                </span>
              </div>

              <p class="card-desc">{{ truncateText(status.description, 100) }}</p>

              <div class="card-footer">
                <div class="status-badge" :class="`badge-${status.status}`">
                  <i class="bx bx-info-circle"></i>
                  {{ getStatusLabel(status.status) }}
                </div>
                <span class="card-time">
                  <i class="bx bx-time"></i>
                  {{ formatTimeAgo(status.started_at) }}
                </span>
              </div>

              <div v-if="status.updates_count > 0" class="updates-badge">
                <i class="bx bx-message-square-detail"></i>
                {{ status.updates_count }} Update
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <button
          @click="goToPage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="pagination-btn"
        >
          <i class="bx bx-chevron-left"></i>
          <span>Sebelumnya</span>
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-number', { active: page === pagination.current_page }]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="pagination-btn"
        >
          <span>Selanjutnya</span>
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusBoardStore } from '@/stores/statusBoard'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const statusBoardStore = useStatusBoardStore()
const authStore = useAuthStore()

const loading = ref(false)
const filters = ref({
  status: '',
  category: '',
  search: '',
  page: 1
})

let searchTimeout = null
let refreshInterval = null

const isAuthenticated = computed(() => authStore.isAuthenticated)
const statuses = computed(() => statusBoardStore.statuses)
const pagination = computed(() => statusBoardStore.pagination)

const pinnedStatuses = computed(() => 
  statuses.value.filter(s => s.is_pinned)
)

const regularStatuses = computed(() => 
  statuses.value.filter(s => !s.is_pinned)
)

const activeIncidents = computed(() => 
  statuses.value.filter(s => ['investigating', 'identified', 'monitoring'].includes(s.status))
)

const visiblePages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const pages = []
  
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(last)
    } else if (current >= last - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = last - 4; i <= last; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(last)
    }
  }
  
  return pages
})

const overallStatusClass = computed(() => {
  const criticalCount = activeIncidents.value.filter(s => s.severity === 'critical').length
  const highCount = activeIncidents.value.filter(s => s.severity === 'high').length
  
  if (criticalCount > 0) return 'status-critical'
  if (highCount > 0) return 'status-warning'
  if (activeIncidents.value.length > 0) return 'status-info'
  return 'status-success'
})

const overallStatusIcon = computed(() => {
  const criticalCount = activeIncidents.value.filter(s => s.severity === 'critical').length
  
  if (criticalCount > 0) return 'bx bx-error-circle'
  if (activeIncidents.value.length > 0) return 'bx bx-info-circle'
  return 'bx bx-check-circle'
})

const overallStatusText = computed(() => {
  const criticalCount = activeIncidents.value.filter(s => s.severity === 'critical').length
  const highCount = activeIncidents.value.filter(s => s.severity === 'high').length
  
  if (criticalCount > 0) return 'Gangguan Kritis'
  if (highCount > 0) return 'Gangguan Tinggi'
  if (activeIncidents.value.length > 0) return 'Gangguan Minor'
  return 'Semua Sistem Normal'
})

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

const getStatusLabel = (status) => {
  const labels = {
    investigating: 'Sedang Diselidiki',
    identified: 'Teridentifikasi',
    monitoring: 'Pemantauan',
    resolved: 'Selesai'
  }
  return labels[status] || status
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

const getStatusIcon = (status) => {
  const icons = {
    investigating: 'bx-search-alt',
    identified: 'bx-check-shield',
    monitoring: 'bx-radar',
    resolved: 'bx-check-circle'
  }
  return `bx ${icons[status] || 'bx-info-circle'}`
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
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
  
  return past.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const fetchStatuses = async () => {
  loading.value = true
  try {
    await statusBoardStore.fetchPublicStatuses(filters.value)
  } catch (error) {
    console.error('Fetch statuses error:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchStatuses()
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    status: '',
    category: '',
    search: '',
    page: 1
  }
  fetchStatuses()
}

const goToPage = (page) => {
  if (page === '...') return
  filters.value.page = page
  fetchStatuses()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const viewDetail = (id) => {
  router.push(`/status/${id}`)
}

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    fetchStatuses()
  }, 5 * 60 * 1000)
}

onMounted(() => {
  fetchStatuses()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.public-status-board {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.hero-main {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.public-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  font-size: 0.875rem;
  color: #059669;
  font-weight: 600;
}

/* Status Box */
.status-box {
  min-width: 220px;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 2px solid;
  text-align: center;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.status-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-display i {
  font-size: 1.5rem;
}

.status-text {
  font-size: 1.125rem;
  font-weight: 700;
}

.status-count {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.5);
  color: #059669;
}

.status-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
  color: #2563eb;
}

.status-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.5);
  color: #d97706;
}

.status-critical {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.5);
  color: #dc2626;
}

/* Auth Notice */
.auth-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.notice-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notice-icon i {
  font-size: 2rem;
  color: white;
}

.notice-text {
  color: white;
}

.notice-text h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.notice-text p {
  font-size: 1rem;
  opacity: 0.95;
  margin: 0;
}

.btn-login {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-login:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9375rem;
}

.btn-reset:hover {
  background: #e5e7eb;
  border-color: #667eea;
  color: #667eea;
}

.filters-row {
  display: grid;
  grid-template-columns: 200px 200px 1fr;
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.filter-label i {
  font-size: 1rem;
  color: #667eea;
}

.filter-select,
.filter-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  background: white;
  color: #2c3e50;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading */
.loading-container {
  background: white;
  border-radius: 20px;
  padding: 5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  margin-bottom: 1.5rem;
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

.loading-text {
  font-size: 1.125rem;
  color: #6c757d;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  font-size: 6rem;
  color: #10b981;
  margin-bottom: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 1.125rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.empty-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #f9fafb;
  border-radius: 25px;
  font-size: 0.9375rem;
  color: #6c757d;
  font-weight: 500;
}

.empty-meta i {
  font-size: 1.125rem;
}

/* Status Content */
.status-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.section-title i {
  font-size: 1.375rem;
  color: #667eea;
}

.count-badge {
  padding: 0.375rem 0.875rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
}

/* Status List & Cards */
.status-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.status-card.pinned {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
}

.card-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8125rem;
}

.badge-pending {
  background: #6366f1;
  color: white;
}

.badge-investigating {
  background: #f59e0b;
  color: white;
}

.badge-resolved {
  background: #10b981;
  color: white;
}

.badge-number {
  background: #f3f4f6;
  color: #4b5563;
  font-family: 'Courier New', monospace;
}

.badge-severity {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.severity-critical {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.severity-high {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.severity-medium {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.severity-low {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.meta-item i {
  font-size: 1rem;
  color: #667eea;
}

.card-desc {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #6c757d;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
}

.badge-investigating {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.badge-identified,
.badge-monitoring {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.badge-resolved {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.card-time {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
}

.card-time i {
  font-size: 1rem;
}

.updates-badge {
  position: absolute;
  top: -8px;
  right: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.updates-badge i {
  font-size: 0.875rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6c757d;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 45px;
  height: 45px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6c757d;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.page-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-section {
    flex-direction: column;
  }

  .status-box {
    width: 100%;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .status-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9375rem;
  }

  .auth-notice {
    flex-direction: column;
    text-align: center;
  }

  .notice-content {
    flex-direction: column;
  }

  .btn-login {
    width: 100%;
    justify-content: center;
  }

  .status-list {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .pagination-btn span {
    display: none;
  }
}
</style>