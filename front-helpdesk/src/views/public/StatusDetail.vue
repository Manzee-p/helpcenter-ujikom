<template>
  <div class="status-detail-page">
    <div class="container">
      <!-- Navigation Bar -->
      <div class="nav-bar">
        <button @click="goBack" class="btn-back">
          <i class="bx bx-arrow-left"></i>
          <span>Kembali</span>
        </button>
        <div class="nav-actions">
          <button class="btn-share">
            <i class="bx bx-share-alt"></i>
          </button>
          <button class="btn-refresh" @click="refreshData">
            <i class="bx bx-refresh"></i>
          </button>
        </div>
      </div>

      <!-- Auth Notice -->
      <div v-if="!isAuthenticated" class="auth-notice">
        <div class="notice-content">
          <div class="notice-icon">
            <i class="bx bx-shield-check"></i>
          </div>
          <div class="notice-text">
            <h3>Punya masalah serupa?</h3>
            <p>Login untuk membuat tiket dan dapatkan bantuan dari tim support kami</p>
          </div>
        </div>
        <router-link to="/login" class="btn-login">
          <i class="bx bx-log-in"></i>
          <span>Login Sekarang</span>
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">Memuat detail status...</p>
      </div>

      <!-- Content -->
      <div v-else-if="status" class="detail-content">
        <!-- Main Status Card -->
        <div class="main-card">
          <div class="card-header-badges">
            <span class="badge badge-incident">
              <i class="bx bx-hash"></i>
              {{ status.incident_number }}
            </span>
            <span class="badge badge-status" :class="`status-${status.status}`">
              <i class="bx bx-error"></i>
              {{ getStatusLabel(status.status) }}
            </span>
            <span class="badge badge-severity" :class="`severity-${status.severity}`">
              <i class="bx bx-flag"></i>
              {{ getSeverityLabel(status.severity) }}
            </span>
          </div>

          <h1 class="status-title">{{ status.title }}</h1>

          <div class="info-row">
            <div class="info-item">
              <i class="bx bx-category"></i>
              <div class="info-text">
                <span class="info-label">Kategori</span>
                <span class="info-value">{{ getCategoryLabel(status.category) }}</span>
              </div>
            </div>
            <div class="info-item" v-if="status.affected_area">
              <i class="bx bx-map-pin"></i>
              <div class="info-text">
                <span class="info-label">Area</span>
                <span class="info-value">{{ status.affected_area }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="bx bx-time"></i>
              <div class="info-text">
                <span class="info-label">Dimulai</span>
                <span class="info-value">{{ formatDateTime(status.started_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Current Status Banner -->
          <div class="current-status" :class="`status-${status.status}`">
            <div class="status-icon">
              <i :class="getStatusIcon(status.status)"></i>
            </div>
            <div class="status-info">
              <span class="status-label">Status Saat Ini</span>
              <h3 class="status-text">{{ getStatusText(status.status) }}</h3>
              <p class="status-desc">{{ getStatusDescription(status.status) }}</p>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
          <!-- Description -->
          <div class="content-box">
            <div class="box-header">
              <i class="bx bx-detail"></i>
              <h3>Deskripsi Masalah</h3>
            </div>
            <div class="box-body">
              <p class="description-text">{{ status.description }}</p>
            </div>
          </div>

          <!-- Timeline Updates -->
          <div class="content-box">
            <div class="box-header">
              <i class="bx bx-history"></i>
              <h3>Timeline Update</h3>
              <span class="update-count">{{ updates.length }} Update</span>
            </div>
            <div class="box-body">
              <div v-if="updates.length === 0" class="no-updates">
                <i class="bx bx-info-circle"></i>
                <p>Belum ada update</p>
              </div>
              <div v-else class="timeline">
                <div
                  v-for="(update, index) in updates"
                  :key="update.id"
                  class="timeline-item"
                  :class="{ 'last-item': index === updates.length - 1 }"
                >
                  <div class="timeline-marker" :class="`marker-${update.update_type}`">
                    <i :class="getUpdateIcon(update.update_type)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="update-header">
                      <div class="author-info">
                        <div class="author-avatar">
                          {{ getInitials(update.user?.name || 'Admin') }}
                        </div>
                        <span class="author-name">{{ update.user?.name || 'Admin' }}</span>
                      </div>
                      <span class="update-time">{{ formatTimeAgo(update.created_at) }}</span>
                    </div>
                    <p class="update-message">{{ update.message }}</p>
                    <span class="update-type" :class="`type-${update.update_type}`">
                      {{ getUpdateTypeLabel(update.update_type) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="bx bx-error-circle"></i>
        </div>
        <h3 class="error-title">Status Tidak Ditemukan</h3>
        <p class="error-text">Status yang Anda cari tidak tersedia atau telah dihapus</p>
        <button @click="goBack" class="btn-primary">
          <i class="bx bx-arrow-left"></i>
          <span>Kembali ke Status Board</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatusBoardStore } from '@/stores/statusBoard'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const statusBoardStore = useStatusBoardStore()
const authStore = useAuthStore()

const loading = ref(true)
const status = ref(null)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const updates = computed(() => {
  if (!status.value?.updates) return []
  return [...status.value.updates].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )
})

const fetchStatusDetail = async () => {
  loading.value = true
  try {
    const data = await statusBoardStore.fetchPublicStatusDetail(route.params.id)
    status.value = data
  } catch (error) {
    console.error('Fetch status detail error:', error)
    
    let errorMsg = 'Tidak dapat memuat detail status'
    
    if (error.response?.status === 403) {
      errorMsg = 'Status ini tidak tersedia untuk publik'
    } else if (error.response?.status === 404) {
      errorMsg = 'Status tidak ditemukan'
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat',
      text: errorMsg,
      confirmButtonColor: '#667eea'
    })
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchStatusDetail()
  Swal.fire({
    icon: 'success',
    title: 'Diperbarui!',
    text: 'Data telah diperbarui',
    timer: 1500,
    showConfirmButton: false
  })
}

const goBack = () => {
  router.push('/status')
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
    identified: 'Teridentifikasi',
    monitoring: 'Pemantauan',
    resolved: 'Selesai'
  }
  return labels[statusValue] || statusValue
}

const getStatusText = (statusValue) => {
  const labels = {
    investigating: 'Sedang Diselidiki',
    identified: 'Masalah Teridentifikasi',
    monitoring: 'Dalam Pemantauan',
    resolved: 'Selesai'
  }
  return labels[statusValue] || statusValue
}

const getStatusDescription = (statusValue) => {
  const descriptions = {
    investigating: 'Tim kami sedang menyelidiki masalah ini',
    identified: 'Penyebab masalah telah ditemukan dan sedang ditangani',
    monitoring: 'Perbaikan sedang dipantau untuk memastikan masalah teratasi',
    resolved: 'Masalah telah terselesaikan dan sistem kembali normal'
  }
  return descriptions[statusValue] || ''
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

const getInitials = (name) => {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
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
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.status-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #6c757d;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-4px);
}

.nav-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-share,
.btn-refresh {
  width: 45px;
  height: 45px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.25rem;
  color: #6c757d;
}

.btn-share:hover,
.btn-refresh:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
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

/* Main Card */
.main-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
}

.badge-incident {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Courier New', monospace;
}

.badge-status.status-investigating {
  background: #f59e0b;
  color: white;
}

.badge-status.status-identified,
.badge-status.status-monitoring {
  background: #6366f1;
  color: white;
}

.badge-status.status-resolved {
  background: #10b981;
  color: white;
}

.badge-severity.severity-critical {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.badge-severity.severity-high {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.badge-severity.severity-medium {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.badge-severity.severity-low {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item > i {
  font-size: 1.5rem;
  color: #667eea;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Current Status */
.current-status {
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.status-text {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 0.375rem 0;
}

.status-desc {
  font-size: 0.9375rem;
  opacity: 0.9;
  margin: 0;
}

.status-investigating {
  background: rgba(245, 158, 11, 0.05);
  border-color: #f59e0b;
  color: #d97706;
}

.status-investigating .status-icon {
  background: rgba(245, 158, 11, 0.15);
}

.status-identified,
.status-monitoring {
  background: rgba(99, 102, 241, 0.05);
  border-color: #6366f1;
  color: #6366f1;
}

.status-identified .status-icon,
.status-monitoring .status-icon {
  background: rgba(99, 102, 241, 0.15);
}

.status-resolved {
  background: rgba(16, 185, 129, 0.05);
  border-color: #10b981;
  color: #059669;
}

.status-resolved .status-icon {
  background: rgba(16, 185, 129, 0.15);
}

/* Content Section */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.content-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.box-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.box-header i {
  font-size: 1.375rem;
  color: #667eea;
}

.box-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.update-count {
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 700;
}

.box-body {
  padding: 1.5rem;
}

.description-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
  white-space: pre-wrap;
}

/* Timeline */
.no-updates {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.no-updates i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  display: block;
}

.no-updates p {
  margin: 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
}

.timeline-item:not(.last-item)::after {
  content: '';
  position: absolute;
  left: 19px;
  top: 42px;
  bottom: -24px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.author-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
}

.author-name {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.9375rem;
}

.update-time {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 600;
}

.update-message {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  white-space: pre-wrap;
}

.update-type {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
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

/* Error State */
.error-state {
  background: white;
  border-radius: 20px;
  padding: 5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 6rem;
  color: #ef4444;
  margin-bottom: 2rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error-text {
  font-size: 1.125rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .nav-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .nav-actions {
    justify-content: center;
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

  .main-card {
    padding: 1.5rem;
  }

  .status-title {
    font-size: 1.5rem;
  }

  .info-row {
    grid-template-columns: 1fr;
  }

  .current-status {
    flex-direction: column;
    align-items: flex-start;
  }

  .box-body {
    padding: 1.25rem;
  }

  .timeline-item {
    gap: 0.75rem;
  }
}
</style>