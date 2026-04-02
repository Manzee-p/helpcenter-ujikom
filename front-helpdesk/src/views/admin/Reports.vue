<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <h4 class="fw-bold mb-4">Laporan Sistem</h4>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Jenis Periode</label>
            <select class="form-select" v-model="filters.period_type">
              <option value="monthly">Bulanan</option>
              <option value="weekly">Mingguan</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Tanggal Mulai</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="filters.start_date"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">Tanggal Selesai</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="filters.end_date"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <button class="btn btn-primary w-100" @click="fetchReports">
              <i class="bx bx-search me-1"></i> Tampilkan Laporan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="reportData">
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="card-text mb-1">Total Tiket</p>
                  <h3 class="mb-0">{{ reportData.summary.total_tickets }}</h3>
                  <small class="text-muted">{{ formatDateShort(filters.start_date) }} - {{ formatDateShort(filters.end_date) }}</small>
                </div>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="bx bx-file bx-lg"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="card-text mb-1">Tiket Selesai</p>
                  <h3 class="mb-0">{{ reportData.summary.resolved_tickets }}</h3>
                  <small class="text-success">
                    {{ reportData.summary.resolution_rate }}% tingkat penyelesaian
                  </small>
                </div>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="bx bx-check-circle bx-lg"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="card-text mb-1">Rata-rata Kepuasan</p>
                  <h3 class="mb-0">{{ Number(reportData.summary.average_satisfaction || 0).toFixed(2) }}/5</h3>
                  <small class="text-muted">{{ reportData.summary.low_rating_total || 0 }} rating buruk pada periode ini</small>
                </div>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-info">
                    <i class="bx bx-star bx-lg"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card vendor-card">
            <div class="card-header">
              <h5 class="card-title mb-0">Tracking Kepuasan Vendor</h5>
            </div>
            <div class="card-body vendor-card-body">
              <div v-if="reportData.vendor_satisfaction && reportData.vendor_satisfaction.length > 0">
                <div 
                  v-for="(vendor, index) in reportData.vendor_satisfaction" 
                  :key="vendor.id"
                  class="d-flex justify-content-between align-items-center mb-3 pb-3"
                  :class="{ 'border-bottom': index < reportData.vendor_satisfaction.length - 1 }"
                >
                  <div class="d-flex align-items-center">
                    <div class="avatar avatar-sm me-3">
                      <span :class="`avatar-initial rounded-circle bg-label-${getRankColor(index)}`">
                        {{ index + 1 }}
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ vendor.name }}</h6>
                      <small class="text-muted">{{ vendor.company_name || 'Tanpa perusahaan' }}</small>
                    </div>
                  </div>
                  <div class="text-end">
                    <strong class="d-block">{{ Number(vendor.average_rating || 0).toFixed(2) }}/5</strong>
                    <small class="text-muted">{{ vendor.total_feedbacks }} feedback • {{ vendor.low_rating_count }} buruk</small>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                <i class="bx bx-user-x bx-lg mb-2"></i>
                <p class="mb-0">Belum ada data kepuasan vendor</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card trend-card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Tren Waktu Penyelesaian</h5>
                <span class="badge bg-label-primary">Rata-rata (menit)</span>
              </div>
              
              <div class="d-flex gap-2 flex-wrap">
                <button 
                  class="btn btn-sm"
                  :class="performanceFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
                  @click="performanceFilter = 'all'"
                >
                  <i class="bx bx-list-ul me-1"></i> Semua
                </button>
                <button 
                  class="btn btn-sm"
                  :class="performanceFilter === 'fastest' ? 'btn-success' : 'btn-outline-success'"
                  @click="performanceFilter = 'fastest'"
                >
                  <i class="bx bx-rocket me-1"></i> Cepat
                </button>
                <button 
                  class="btn btn-sm"
                  :class="performanceFilter === 'average' ? 'btn-warning' : 'btn-outline-warning'"
                  @click="performanceFilter = 'average'"
                >
                  <i class="bx bx-timer me-1"></i> Sedang
                </button>
                <button 
                  class="btn btn-sm"
                  :class="performanceFilter === 'slowest' ? 'btn-danger' : 'btn-outline-danger'"
                  @click="performanceFilter = 'slowest'"
                >
                  <i class="bx bx-hourglass me-1"></i> Lambat
                </button>
              </div>
            </div>
            <div class="card-body trend-card-body">
              <template v-if="getFilteredTrendData().length > 0">
                <div class="resolution-trend-chart">
                  <div 
                    v-for="(trend, index) in getFilteredTrendData()" 
                    :key="`${trend.period}-${index}`"
                    class="trend-item"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                  >
                    <div class="trend-header mb-2">
                      <strong class="trend-period">{{ formatPeriod(trend.period) }}</strong>
                      <span 
                        class="trend-badge"
                        :class="getBarColor(trend.avg_resolution_time, trend.category)"
                      >
                        {{ formatTime(trend.avg_resolution_time) }}
                      </span>
                    </div>
                    <div class="trend-bar-container">
                      <div 
                        class="trend-bar"
                        :style="{ width: calculateBarWidth(trend.avg_resolution_time) + '%' }"
                        :class="getBarColor(trend.avg_resolution_time, trend.category)"
                      >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="trend-summary mt-4 pt-3 border-top">
                  <div class="row text-center g-3">
                    <div class="col-4">
                      <div class="stat-box">
                        <i class="bx bx-rocket text-success mb-1"></i>
                        <small class="text-muted d-block">Tercepat</small>
                        <strong class="text-success">{{ formatTime(getFastestTime()) }}</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="stat-box">
                        <i class="bx bx-timer text-primary mb-1"></i>
                        <small class="text-muted d-block">Rata-rata</small>
                        <strong class="text-primary">{{ formatTime(getAverageTime()) }}</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="stat-box">
                        <i class="bx bx-hourglass text-danger mb-1"></i>
                        <small class="text-muted d-block">Terlambat</small>
                        <strong class="text-danger">{{ formatTime(getSlowestTime()) }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-center text-muted py-5">
                  <i class="bx bx-line-chart bx-lg mb-2"></i>
                  <p class="mb-0">{{ getEmptyStateMessage() }}</p>
                  <small v-if="performanceFilter !== 'all'" class="text-muted">
                    Coba pilih "Semua" untuk melihat seluruh data
                  </small>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Ringkasan Peringatan Vendor</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="trend-summary h-100">
                <small class="text-muted d-block">Total Warning</small>
                <strong class="fs-4">{{ reportData.warning_summary?.total_warnings || 0 }}</strong>
              </div>
            </div>
            <div class="col-md-4">
              <div class="trend-summary h-100">
                <small class="text-muted d-block">Warning Sistem</small>
                <strong class="fs-4 text-warning">{{ reportData.warning_summary?.system_warnings || 0 }}</strong>
              </div>
            </div>
            <div class="col-md-4">
              <div class="trend-summary h-100">
                <small class="text-muted d-block">Warning Admin</small>
                <strong class="fs-4 text-danger">{{ reportData.warning_summary?.admin_warnings || 0 }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body text-center py-5">
        <i class="bx bx-bar-chart bx-lg text-muted mb-3"></i>
        <h5 class="text-muted">Belum Ada Data</h5>
        <p class="text-muted">Pilih rentang tanggal lalu tekan "Tampilkan Laporan" untuk melihat data.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const reportData = ref(null)
const loading = ref(false)
const performanceFilter = ref('all')

const filters = ref({
  period_type: 'monthly',
  start_date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
})

const fetchReports = async () => {
  loading.value = true
  try {
    console.log('Fetching reports with params:', filters.value)
    
    const { data } = await api.get('/admin/reports', {
      params: filters.value
    })
    
    console.log('Reports data received:', data)
    console.log('Resolution trend:', data.resolution_trend)
    reportData.value = data
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    
    let errorMessage = 'Gagal memuat laporan'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: errorMessage,
      footer: error.response?.data?.error ? `<small>${error.response.data.error}</small>` : ''
    })
  } finally {
    loading.value = false
  }
}

const getRankColor = (index) => {
  const colors = ['primary', 'success', 'info', 'warning', 'secondary']
  return colors[index] || 'secondary'
}

const getValidTrendData = () => {
  if (!reportData.value?.resolution_trend) {
    console.log('No resolution_trend data')
    return []
  }
  
  console.log('Processing resolution_trend:', reportData.value.resolution_trend)
  
  // Filter out invalid data and ensure we have valid numbers
  const validData = reportData.value.resolution_trend.filter(trend => {
    const time = parseFloat(trend.avg_resolution_time)
    const isValid = !isNaN(time) && time > 0
    if (!isValid) {
      console.log('Invalid trend data:', trend)
    }
    return isValid
  })
  
  console.log('Valid trend data count:', validData.length)
  return validData
}

const getFilteredTrendData = () => {
  const validData = getValidTrendData()
  
  console.log('Filtering with:', performanceFilter.value)
  
  // If specific filter, return matching category data
  if (performanceFilter.value !== 'all') {
    const filtered = validData.filter(trend => trend.category === performanceFilter.value)
    console.log(`Filtered ${performanceFilter.value} data:`, filtered)
    return filtered
  }
  
  // If "all", return all data (backend already grouped by period)
  console.log('Returning all data:', validData)
  return validData
}

const formatPeriod = (period) => {
  if (!period) return ''
  
  // Handle monthly format: "2024-08"
  if (period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }
  
  // Handle weekly format: "2024-W32"
  if (period.match(/^\d{4}-W\d{2}$/)) {
    return period
  }
  
  return period
}

const formatTime = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0 mnt'
  
  const absMinutes = Math.abs(parseFloat(minutes))
  
  if (absMinutes < 60) {
    return `${Math.round(absMinutes)} mnt`
  } else if (absMinutes < 1440) {
    const hours = Math.floor(absMinutes / 60)
    const mins = Math.round(absMinutes % 60)
    return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`
  } else {
    const days = Math.floor(absMinutes / 1440)
    const hours = Math.floor((absMinutes % 1440) / 60)
    return hours > 0 ? `${days}h ${hours}j` : `${days}h`
  }
}

const calculateBarWidth = (value) => {
  const filteredData = getFilteredTrendData()
  if (filteredData.length === 0) return 0
  
  const values = filteredData
    .map(t => Math.abs(parseFloat(t.avg_resolution_time)))
    .filter(v => !isNaN(v) && v > 0)
  
  if (values.length === 0) return 0
  
  const maxValue = Math.max(...values)
  const absValue = Math.abs(parseFloat(value))
  
  if (isNaN(absValue) || maxValue === 0) return 0
  
  return Math.max((absValue / maxValue) * 100, 5)
}

const getBarColor = (minutes, category = null) => {
  const absMinutes = Math.abs(parseFloat(minutes))
  
  if (isNaN(absMinutes)) return 'bar-average'
  
  // For specific filters, use category-based color
  if (performanceFilter.value !== 'all' && category) {
    if (category === 'fastest') return 'bar-excellent'
    if (category === 'average') return 'bar-average'
    if (category === 'slowest') return 'bar-very-slow'
  }
  
  // For "All" filter, use absolute thresholds
  if (performanceFilter.value === 'all') {
    if (absMinutes < 720) return 'bar-excellent'    // < 12h
    if (absMinutes < 1440) return 'bar-average'     // 12-24h
    return 'bar-very-slow'                           // >= 24h
  }
  
  // Fallback
  if (absMinutes < 720) return 'bar-excellent'
  if (absMinutes < 1440) return 'bar-average'
  return 'bar-very-slow'
}

const getFastestTime = () => {
  const filteredData = getFilteredTrendData()
  if (filteredData.length === 0) return 0
  
  const times = filteredData
    .map(t => Math.abs(parseFloat(t.avg_resolution_time)))
    .filter(t => !isNaN(t) && t > 0)
  
  return times.length > 0 ? Math.min(...times) : 0
}

const getAverageTime = () => {
  const filteredData = getFilteredTrendData()
  if (filteredData.length === 0) return 0
  
  const times = filteredData
    .map(t => Math.abs(parseFloat(t.avg_resolution_time)))
    .filter(t => !isNaN(t) && t > 0)
  
  if (times.length === 0) return 0
  
  const sum = times.reduce((acc, val) => acc + val, 0)
  return sum / times.length
}

const getSlowestTime = () => {
  const filteredData = getFilteredTrendData()
  if (filteredData.length === 0) return 0
  
  const times = filteredData
    .map(t => Math.abs(parseFloat(t.avg_resolution_time)))
    .filter(t => !isNaN(t) && t > 0)
  
  return times.length > 0 ? Math.max(...times) : 0
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getEmptyStateMessage = () => {
  if (performanceFilter.value === 'all') return 'Belum ada data tren pada periode yang dipilih'
  if (performanceFilter.value === 'fastest') return 'Belum ada periode dengan waktu penyelesaian cepat (< 12 jam)'
  if (performanceFilter.value === 'average') return 'Belum ada periode dengan waktu penyelesaian sedang (12-24 jam)'
  if (performanceFilter.value === 'slowest') return 'Belum ada periode dengan waktu penyelesaian lambat (>= 24 jam)'
  return 'Belum ada data'
}

const exportReport = (format) => {
  Swal.fire({
    icon: 'info',
    title: 'Fitur Ekspor',
    text: `Ekspor ke ${format.toUpperCase()} akan tersedia pada pembaruan berikutnya.`,
    confirmButtonText: 'Tutup'
  })
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.avatar-initial {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card Height Control */
.vendor-card,
.trend-card {
  height: 100%;
  min-height: 550px;
}

.vendor-card-body {
  max-height: 450px;
  overflow-y: auto;
}

.trend-card-body {
  max-height: 450px;
  overflow-y: auto;
}

/* Scrollbar Styling */
.vendor-card-body::-webkit-scrollbar,
.trend-card-body::-webkit-scrollbar {
  width: 6px;
}

.vendor-card-body::-webkit-scrollbar-track,
.trend-card-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.vendor-card-body::-webkit-scrollbar-thumb,
.trend-card-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.vendor-card-body::-webkit-scrollbar-thumb:hover,
.trend-card-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Resolution Time Trend Chart Styles */
.resolution-trend-chart {
  margin-top: 0.5rem;
}

.trend-item {
  margin-bottom: 1.5rem;
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-period {
  font-size: 0.875rem;
  font-weight: 600;
  color: #566a7f;
}

.trend-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Badge colors matching bar colors */
.trend-badge.bar-excellent {
  background: linear-gradient(135deg, #28a745 0%, #34ce57 100%);
}

.trend-badge.bar-good {
  background: linear-gradient(135deg, #17a2b8 0%, #20c9e0 100%);
}

.trend-badge.bar-average {
  background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
}

.trend-badge.bar-slow {
  background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
}

.trend-badge.bar-very-slow {
  background: linear-gradient(135deg, #c82333 0%, #d32f2f 100%);
}

.trend-bar-container {
  width: 100%;
  height: 32px;
  background-color: #f5f5f9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.trend-bar {
  height: 100%;
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.trend-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.2) 50%, 
    rgba(255,255,255,0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Color schemes based on performance */
.bar-excellent {
  background: linear-gradient(90deg, #28a745 0%, #34ce57 100%);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.bar-good {
  background: linear-gradient(90deg, #17a2b8 0%, #20c9e0 100%);
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.bar-average {
  background: linear-gradient(90deg, #ffc107 0%, #ffcd39 100%);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.bar-slow {
  background: linear-gradient(90deg, #dc3545 0%, #e74c3c 100%);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.bar-very-slow {
  background: linear-gradient(90deg, #c82333 0%, #d32f2f 100%);
  box-shadow: 0 2px 8px rgba(200, 35, 51, 0.4);
}

/* Hover effect */
.trend-bar:hover {
  transform: scaleY(1.1);
  filter: brightness(1.05);
}

/* Summary Stats */
.trend-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.stat-box {
  padding: 0.5rem;
}

.stat-box i {
  font-size: 1.5rem;
}

.stat-box strong {
  font-size: 1.1rem;
  display: block;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .vendor-card,
  .trend-card {
    min-height: auto;
  }
  
  .vendor-card-body,
  .trend-card-body {
    max-height: none;
  }
  
  .trend-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .trend-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
  
  .trend-bar-container {
    height: 28px;
  }
  
  .stat-box strong {
    font-size: 1rem;
  }
}
</style>
