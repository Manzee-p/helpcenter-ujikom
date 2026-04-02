<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold mb-1">📊 My Reports</h4>
        <p class="text-muted mb-0">Track your performance and statistics</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <div class="btn-group shadow-sm">
          <button 
            :class="['btn', periodType === 'weekly' ? 'btn-primary' : 'btn-outline-primary']"
            @click="periodType = 'weekly'; fetchAll()"
          >
            <i class="bx bx-calendar me-1"></i>
            Weekly
          </button>
          <button 
            :class="['btn', periodType === 'monthly' ? 'btn-primary' : 'btn-outline-primary']"
            @click="periodType = 'monthly'; fetchAll()"
          >
            <i class="bx bx-calendar-alt me-1"></i>
            Monthly
          </button>
        </div>
        <button class="btn btn-outline-secondary shadow-sm" @click="fetchAll">
          <i class="bx bx-refresh"></i>
        </button>
      </div>
    </div>

    <!-- Current Period Report -->
    <div v-if="currentReport" class="card shadow-sm mb-4 border-0">
      <div class="card-header bg-gradient-primary text-white border-0">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="card-title mb-1 text-white">
              <i class="bx bx-trending-up me-2"></i>
              Current {{ periodType === 'weekly' ? 'Week' : 'Month' }} Performance
            </h5>
            <small class="opacity-75">
              {{ formatDateShort(currentReport.period_start) }} - {{ formatDateShort(currentReport.period_end) }}
            </small>
          </div>
          <div class="badge bg-white text-primary px-3 py-2">
            Active Period
          </div>
        </div>
      </div>
      <div class="card-body p-4">
        <!-- Stats Grid -->
        <div class="row g-3 mb-4">
          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm h-100 stat-card">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar flex-shrink-0 me-3">
                    <div class="avatar-initial rounded bg-label-primary">
                      <i class="bx bx-file bx-md"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <span class="d-block mb-1 text-muted small">Total Tickets</span>
                    <h4 class="mb-0 fw-bold">{{ currentReport.total_tickets }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm h-100 stat-card">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar flex-shrink-0 me-3">
                    <div class="avatar-initial rounded bg-label-success">
                      <i class="bx bx-check-circle bx-md"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <span class="d-block mb-1 text-muted small">Resolved</span>
                    <h4 class="mb-0 fw-bold text-success">{{ currentReport.resolved_tickets }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm h-100 stat-card">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar flex-shrink-0 me-3">
                    <div class="avatar-initial rounded bg-label-warning">
                      <i class="bx bx-time bx-md"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <span class="d-block mb-1 text-muted small">Avg Response</span>
                    <h4 class="mb-0 fw-bold text-warning">{{ currentReport.avg_response_time || 0 }}<small class="fs-6">m</small></h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm h-100 stat-card">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar flex-shrink-0 me-3">
                    <div class="avatar-initial rounded bg-label-info">
                      <i class="bx bx-chart bx-md"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <span class="d-block mb-1 text-muted small">SLA Rate</span>
                    <h4 class="mb-0 fw-bold text-info">{{ currentReport.sla_compliance_rate || 0 }}<small class="fs-6">%</small></h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <div class="card border-0 bg-light h-100">
              <div class="card-body">
                <h6 class="mb-3 fw-bold">
                  <i class="bx bx-flag me-2 text-primary"></i>
                  Tickets by Priority
                </h6>
                <div style="height: 300px; position: relative;">
                  <canvas ref="priorityChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card border-0 bg-light h-100">
              <div class="card-body">
                <h6 class="mb-3 fw-bold">
                  <i class="bx bx-category me-2 text-primary"></i>
                  Tickets by Category
                </h6>
                <div style="height: 300px; position: relative;">
                  <canvas ref="categoryChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Trend Chart -->
        <div class="card border-0 bg-light">
          <div class="card-body">
            <h6 class="mb-3 fw-bold">
              <i class="bx bx-line-chart me-2 text-primary"></i>
              Performance Trend (Last 6 Months)
            </h6>
            <div style="height: 350px; position: relative;">
              <canvas ref="trendChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Reports -->
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-bottom">
        <h5 class="card-title mb-0 d-flex align-items-center">
          <i class="bx bx-history me-2 text-primary"></i>
          Historical Reports
        </h5>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Loading reports...</p>
        </div>

        <div v-else-if="reports.length === 0" class="text-center py-5">
          <i class="bx bx-folder-open display-4 text-muted"></i>
          <p class="text-muted mt-3 mb-0">No historical reports found</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Period</th>
                <th class="text-center">Total</th>
                <th class="text-center">Resolved</th>
                <th class="text-center">Pending</th>
                <th class="text-center">Avg Response</th>
                <th class="text-center">Avg Resolution</th>
                <th class="text-center">SLA Rate</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id" class="border-bottom">
                <td class="ps-4">
                  <div class="fw-semibold">{{ formatDateShort(report.period_start) }}</div>
                  <small class="text-muted">to {{ formatDateShort(report.period_end) }}</small>
                </td>
                <td class="text-center">
                  <span class="fw-semibold">{{ report.total_tickets }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-label-success rounded-pill px-3 py-2">
                    {{ report.resolved_tickets }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-label-warning rounded-pill px-3 py-2">
                    {{ report.pending_tickets }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="text-muted">{{ report.avg_response_time || '-' }}m</span>
                </td>
                <td class="text-center">
                  <span class="text-muted">{{ report.avg_resolution_time || '-' }}m</span>
                </td>
                <td class="text-center">
                  <span :class="getSlaClass(report.sla_compliance_rate)">
                    {{ report.sla_compliance_rate || 0 }}%
                  </span>
                </td>
                <td class="text-center pe-4">
                  <button 
                    class="btn btn-sm btn-outline-primary rounded-pill"
                    @click="viewReport(report)"
                  >
                    <i class="bx bx-show me-1"></i>
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Report Detail Modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 bg-gradient-primary text-white">
            <div>
              <h5 class="modal-title fw-bold mb-1">
                <i class="bx bx-bar-chart-alt-2 me-2"></i>
                Report Details
              </h5>
              <small v-if="selectedReport">
                {{ formatDateShort(selectedReport.period_start) }} - {{ formatDateShort(selectedReport.period_end) }}
              </small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-4" v-if="selectedReport">
            <!-- Summary Stats -->
            <div class="row g-3 mb-4">
              <div class="col-6 col-md-3">
                <div class="text-center p-3 rounded bg-light">
                  <div class="text-primary mb-2">
                    <i class="bx bx-file bx-lg"></i>
                  </div>
                  <h4 class="mb-1 fw-bold">{{ selectedReport.total_tickets }}</h4>
                  <small class="text-muted">Total Tickets</small>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center p-3 rounded bg-light">
                  <div class="text-success mb-2">
                    <i class="bx bx-check-circle bx-lg"></i>
                  </div>
                  <h4 class="mb-1 fw-bold">{{ selectedReport.resolved_tickets }}</h4>
                  <small class="text-muted">Resolved</small>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center p-3 rounded bg-light">
                  <div class="text-warning mb-2">
                    <i class="bx bx-time bx-lg"></i>
                  </div>
                  <h4 class="mb-1 fw-bold">{{ selectedReport.pending_tickets }}</h4>
                  <small class="text-muted">Pending</small>
                </div>
              </div>
              
              <div class="col-6 col-md-3">
                <div class="text-center p-3 rounded bg-light">
                  <div class="text-info mb-2">
                    <i class="bx bx-chart bx-lg"></i>
                  </div>
                  <h4 class="mb-1 fw-bold">{{ selectedReport.sla_compliance_rate || 0 }}%</h4>
                  <small class="text-muted">SLA Rate</small>
                </div>
              </div>
            </div>

            <!-- Charts in Modal -->
            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <h6 class="fw-bold mb-3">Priority Distribution</h6>
                    <div style="height: 250px; position: relative;">
                      <canvas ref="modalPriorityChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <h6 class="fw-bold mb-3">Category Distribution</h6>
                    <div style="height: 250px; position: relative;">
                      <canvas ref="modalCategoryChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="card bg-light border-0">
              <div class="card-body">
                <h6 class="fw-bold mb-3">
                  <i class="bx bx-timer me-2 text-primary"></i>
                  Performance Metrics
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <div class="d-flex justify-content-between align-items-center p-2 bg-white rounded">
                      <span class="text-muted">
                        <i class="bx bx-time-five me-2"></i>
                        Average Response Time
                      </span>
                      <span class="fw-bold">{{ selectedReport.avg_response_time || '-' }} minutes</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center p-2 bg-white rounded">
                      <span class="text-muted">
                        <i class="bx bx-check-double me-2"></i>
                        Average Resolution Time
                      </span>
                      <span class="fw-bold">{{ selectedReport.avg_resolution_time || '-' }} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import api from '@/services/api'
import { formatDateShort, getPriorityColor, formatPriority } from '@/utils/helpers'

// Load Chart.js from CDN
const loadChartJS = () => {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve(window.Chart)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    script.onload = () => resolve(window.Chart)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const periodType = ref('monthly')
const currentReport = ref(null)
const reports = ref([])
const loading = ref(false)

const priorityChart = ref(null)
const categoryChart = ref(null)
const trendChart = ref(null)
const modalPriorityChart = ref(null)
const modalCategoryChart = ref(null)

let priorityChartInstance = null
let categoryChartInstance = null
let trendChartInstance = null
let modalPriorityChartInstance = null
let modalCategoryChartInstance = null

const fetchCurrentReport = async () => {
  try {
    const { data } = await api.get('/vendor/reports/current', {
      params: { period_type: periodType.value }
    })
    currentReport.value = data
    
    await nextTick()
    await renderCharts()
  } catch (error) {
    console.error('Failed to fetch current report:', error)
  }
}

const fetchReports = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/vendor/reports', {
      params: { period_type: periodType.value }
    })
    reports.value = data.data || data
  } catch (error) {
    console.error('Failed to fetch reports:', error)
  } finally {
    loading.value = false
  }
}

const fetchAll = () => {
  fetchCurrentReport()
  fetchReports()
}

const renderCharts = async () => {
  if (!currentReport.value) return
  
  await loadChartJS()
  const Chart = window.Chart
  
  // Priority Chart
  if (priorityChart.value) {
    const ctx = priorityChart.value.getContext('2d')
    if (priorityChartInstance) priorityChartInstance.destroy()
    
    const priorities = currentReport.value.tickets_by_priority || {}
    
    if (Object.keys(priorities).length === 0) {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText('No priority data', priorityChart.value.width / 2, priorityChart.value.height / 2)
      return
    }
    
    const labels = Object.keys(priorities).map(p => formatPriority(p))
    const data = Object.values(priorities)
    const colors = Object.keys(priorities).map(p => {
      const colorMap = {
        'critical': '#ff4560',
        'high': '#ff6b6b',
        'medium': '#ffa726',
        'low': '#00e396'
      }
      return colorMap[p] || '#696cff'
    })
    
    priorityChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          }
        }
      }
    })
  }
  
  // Category Chart
  if (categoryChart.value) {
    const ctx = categoryChart.value.getContext('2d')
    if (categoryChartInstance) categoryChartInstance.destroy()
    
    const categories = currentReport.value.tickets_by_category || {}
    const labels = Object.keys(categories)
    const data = Object.values(categories)
    
    if (labels.length === 0) {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText('No category data', categoryChart.value.width / 2, categoryChart.value.height / 2)
      return
    }
    
    categoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets',
          data: data,
          backgroundColor: '#696cff',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    })
  }
  
  // Trend Chart
  if (trendChart.value && reports.value.length > 0) {
    const ctx = trendChart.value.getContext('2d')
    if (trendChartInstance) trendChartInstance.destroy()
    
    const sortedReports = [...reports.value].sort((a, b) => 
      new Date(a.period_start) - new Date(b.period_start)
    ).slice(-6)
    
    const labels = sortedReports.map(r => formatDateShort(r.period_start))
    const totalData = sortedReports.map(r => r.total_tickets)
    const resolvedData = sortedReports.map(r => r.resolved_tickets)
    const pendingData = sortedReports.map(r => r.pending_tickets)
    
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Tickets',
            data: totalData,
            borderColor: '#696cff',
            backgroundColor: 'rgba(105, 108, 255, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Resolved',
            data: resolvedData,
            borderColor: '#00e396',
            backgroundColor: 'rgba(0, 227, 150, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Pending',
            data: pendingData,
            borderColor: '#ffa726',
            backgroundColor: 'rgba(255, 167, 38, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { padding: 15 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    })
  }
}

const getSlaClass = (rate) => {
  if (!rate) return 'badge bg-label-secondary rounded-pill px-3 py-2'
  if (rate >= 90) return 'badge bg-label-success rounded-pill px-3 py-2'
  if (rate >= 70) return 'badge bg-label-warning rounded-pill px-3 py-2'
  return 'badge bg-label-danger rounded-pill px-3 py-2'
}

const selectedReport = ref(null)
const showModal = ref(false)

const viewReport = async (report) => {
  selectedReport.value = report
  showModal.value = true
  
  await nextTick()
  await renderModalCharts()
}

const renderModalCharts = async () => {
  if (!selectedReport.value) return
  
  await loadChartJS()
  const Chart = window.Chart
  
  // Modal Priority Chart
  if (modalPriorityChart.value) {
    const ctx = modalPriorityChart.value.getContext('2d')
    if (modalPriorityChartInstance) modalPriorityChartInstance.destroy()
    
    const priorities = selectedReport.value.tickets_by_priority || {}
    
    if (Object.keys(priorities).length === 0) {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText('No priority data', modalPriorityChart.value.width / 2, modalPriorityChart.value.height / 2)
      return
    }
    
    const labels = Object.keys(priorities).map(p => formatPriority(p))
    const data = Object.values(priorities)
    const colors = Object.keys(priorities).map(p => {
      const colorMap = {
        'critical': '#ff4560',
        'high': '#ff6b6b',
        'medium': '#ffa726',
        'low': '#00e396'
      }
      return colorMap[p] || '#696cff'
    })
    
    modalPriorityChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    })
  }
  
  // Modal Category Chart
  if (modalCategoryChart.value) {
    const ctx = modalCategoryChart.value.getContext('2d')
    if (modalCategoryChartInstance) modalCategoryChartInstance.destroy()
    
    const categories = selectedReport.value.tickets_by_category || {}
    const labels = Object.keys(categories)
    const data = Object.values(categories)
    
    if (labels.length === 0) {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText('No category data', modalCategoryChart.value.width / 2, modalCategoryChart.value.height / 2)
      return
    }
    
    modalCategoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets',
          data: data,
          backgroundColor: '#696cff',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    })
  }
}

const closeModal = () => {
  showModal.value = false
  selectedReport.value = null
  if (modalPriorityChartInstance) modalPriorityChartInstance.destroy()
  if (modalCategoryChartInstance) modalCategoryChartInstance.destroy()
}

watch(reports, () => {
  nextTick(() => {
    if (trendChart.value && reports.value.length > 0) {
      renderCharts()
    }
  })
})

onMounted(async () => {
  await loadChartJS()
  fetchCurrentReport()
  fetchReports()
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #696cff 0%, #5a5fde 100%);
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

.avatar {
  width: 3.5rem;
  height: 3.5rem;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(105, 108, 255, 0.04);
}

.modal.show {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>