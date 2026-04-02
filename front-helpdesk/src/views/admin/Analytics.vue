<template>
  <div>
    <!-- Date Range Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Tanggal Mulai</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="dateRange.start"
            />
          </div>
          <div class="col-md-4">  
            <label class="form-label">Tanggal Berakhir</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="dateRange.end"
            />
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="fetchAnalytics">
              <i class="bx bx-search me-1"></i> Hasilkan Laporan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Analytics Data -->
    <div v-else-if="analytics && hasData">
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ getTotalTickets }}</h3>
              <small class="text-muted">Total Tickets</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ formatNumber(analytics.avg_resolution_time_minutes) }} min</h3>
              <small class="text-muted">Waktu Resolusi Rata-rata</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="mb-1">{{ mostUsedCategory }}</h3>
              <small class="text-muted">Kategori Teratas</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3 class="mb-1 text-capitalize">{{ mostUsedPriority }}</h3>
              <small class="text-muted">Prioritas Paling Umum</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Charts Row -->
      <div class="row">
        <!-- Left Side: Status Breakdown with Doughnut -->
        <div class="col-lg-5 col-md-12 mb-4">
          <div class="card" style="height: 500px;">
            <div class="card-header">
              <div>
                <h5 class="card-title m-0">Statistik Ticket</h5>
                <small class="text-muted">{{ getTotalTickets }} Total Tickets</small>
              </div>
            </div>
            <div class="card-body">
              <div class="row h-100">
                <!-- Doughnut Chart -->
                <div class="col-5 d-flex align-items-center justify-content-center">
                  <div style="position: relative; width: 180px; height: 180px;">
                    <canvas ref="statusChart"></canvas>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                      <h4 class="mb-0">{{ getNewTicketsCount }}</h4>
                      <small class="text-muted">Baru ({{ getStatusPercentage }})</small>
                    </div>
                  </div>
                </div>
                
                <!-- Breakdown List -->
                <div class="col-7 d-flex align-items-center">
                  <div class="w-100">
                    <div 
                      v-for="status in analytics.tickets_by_status" 
                      :key="status.status"
                      class="d-flex align-items-center justify-content-between mb-3"
                    >
                      <div class="d-flex align-items-center">
                        <div 
                          class="rounded me-3" 
                          :style="{
                            width: '40px',
                            height: '40px',
                            backgroundColor: getStatusBgColor(status.status),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }"
                        >
                          <i :class="getStatusIcon(status.status)" :style="{ color: getStatusColor(status.status), fontSize: '20px' }"></i>
                        </div>
                        <div>
                          <h6 class="mb-0 text-capitalize">{{ status.status.replace('_', ' ') }}</h6>
                          <small class="text-muted">{{ getStatusDescription(status.status) }}</small>
                        </div>
                      </div>
                      <h6 class="mb-0">{{ formatCount(status.count) }}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Monthly Ticket Overview -->
        <div class="col-lg-7 col-md-12 mb-4">
          <div class="card" style="height: 500px;">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center w-100">
                <div>
                  <h5 class="card-title m-0">Ringkasan Tiket Bulanan</h5>
                  <small class="text-muted">Tickets per Bulan</small>
                </div>
              </div>
            </div>
            <div class="card-body">
              <!-- Stats Summary -->
              <div class="mb-3">
                <div class="d-flex align-items-center">
                  <div class="me-4">
                    <h3 class="mb-0">{{ getMonthlyAverage }}</h3>
                    <small class="text-muted">Rata-rata per Bulan</small>
                  </div>
                  <div class="me-4">
                    <h4 class="mb-0">{{ getPeakMonth.count }}</h4>
                    <small class="text-muted">Bulan Tertinggi</small>
                  </div>
                  <div class="d-flex align-items-center" :class="getTrendIndicator >= 0 ? 'text-success' : 'text-danger'">
                    <i :class="getTrendIndicator >= 0 ? 'bx bx-trending-up' : 'bx bx-trending-down'" class="me-1"></i>
                    <span>{{ Math.abs(getTrendIndicator) }}%</span>
                  </div>
                </div>
              </div>
              
              <!-- Line Chart -->
              <div style="position: relative; height: 320px;">
                <canvas ref="monthlyChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Category Bar Chart -->
      <div class="row">
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title m-0">Tickets by Category</h5>
            </div>
            <div class="card-body" style="position: relative; height: 300px;">
              <canvas ref="categoryChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <div class="text-center">
        <button class="btn btn-outline-primary" @click="exportReport">
          <i class="bx bx-download me-1"></i> Export Report
        </button>
      </div>
    </div>

    <!-- No Data -->
    <div v-else class="text-center text-muted py-5">
      <p class="mb-0">No analytics data available for the selected date range.</p>
      <small class="text-muted">Try selecting a different date range.</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/services/api'
import moment from 'moment'
import Swal from 'sweetalert2'
import {
  Chart,
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
Chart.register(
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const loading = ref(false)
const analytics = ref(null)
const dateRange = ref({
  start: moment().subtract(6, 'months').format('YYYY-MM-DD'),
  end: moment().format('YYYY-MM-DD')
})

// Chart refs
const statusChart = ref(null)
const monthlyChart = ref(null)
const categoryChart = ref(null)

// Chart instances
let statusChartInstance = null
let monthlyChartInstance = null
let categoryChartInstance = null

onMounted(() => {
  fetchAnalytics()
})

onUnmounted(() => {
  destroyCharts()
})

const destroyCharts = () => {
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy()
    monthlyChartInstance = null
  }
  if (categoryChartInstance) {
    categoryChartInstance.destroy()
    categoryChartInstance = null
  }
}

const fetchAnalytics = async () => {
  loading.value = true
  destroyCharts()
  
  try {
    const response = await api.get('/admin/analytics', {
      params: {
        start_date: dateRange.value.start,
        end_date: dateRange.value.end
      }
    })
    
    console.log('Analytics data received:', response.data)
    analytics.value = response.data
    
    await nextTick()
    setTimeout(() => {
      renderCharts()
    }, 100)
    
  } catch (error) {
    console.error('Error fetching analytics:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Failed to load analytics data',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (!analytics.value) {
    console.log('No analytics data available')
    return
  }

  console.log('Rendering charts with data:', analytics.value)

  // Status Doughnut Chart
  if (analytics.value.tickets_by_status?.length && statusChart.value) {
    const statusColors = {
      'new': '#696cff',
      'in_progress': '#03c3ec',
      'waiting_response': '#ffab00',
      'resolved': '#71dd37',
      'closed': '#8592a3'
    }

    const ctx = statusChart.value.getContext('2d')
    statusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: analytics.value.tickets_by_status.map(s => 
          s.status.replace('_', ' ').toUpperCase()
        ),
        datasets: [{
          data: analytics.value.tickets_by_status.map(s => s.count),
          backgroundColor: analytics.value.tickets_by_status.map(s => 
            statusColors[s.status] || '#8592a3'
          ),
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((context.parsed / total) * 100).toFixed(1)
                return `${context.label}: ${context.parsed} (${percentage}%)`
              }
            }
          }
        }
      }
    })
    console.log('Status chart rendered')
  }

  // Monthly Line Chart
  renderMonthlyChart()

  // Category Bar Chart
  if (analytics.value.tickets_by_category && Object.keys(analytics.value.tickets_by_category).length && categoryChart.value) {
    const categories = Object.keys(analytics.value.tickets_by_category)
    const counts = Object.values(analytics.value.tickets_by_category)

    const ctx = categoryChart.value.getContext('2d')
    categoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Number of Tickets',
          data: counts,
          backgroundColor: '#696cff',
          borderRadius: 8,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Total: ${context.parsed.y} tickets`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            },
            grid: {
              display: true,
              drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
    console.log('Category chart rendered')
  }
}

const renderMonthlyChart = () => {
  if (!monthlyChart.value) {
    console.log('Monthly chart ref not available')
    return
  }
  
  if (!analytics.value.monthly_tickets) {
    console.log('No monthly tickets data')
    return
  }

  console.log('Monthly tickets data:', analytics.value.monthly_tickets)

  const monthlyData = analytics.value.monthly_tickets
  
  // Check if data exists and is not empty
  if (!monthlyData || Object.keys(monthlyData).length === 0) {
    console.log('Monthly tickets data is empty')
    return
  }

  const months = Object.keys(monthlyData).sort()
  const counts = months.map(month => monthlyData[month])

  console.log('Months:', months)
  console.log('Counts:', counts)

  // Format months for display (e.g., "2024-10" -> "Oct 2024")
  const labels = months.map(month => {
    // Handle both "YYYY-MM" and full date formats
    const dateStr = month.includes('-') ? month + (month.length === 7 ? '-01' : '') : month
    return moment(dateStr).format('MMM YYYY')
  })

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy()
  }

  const ctx = monthlyChart.value.getContext('2d')
  monthlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tickets per Month',
        data: counts,
        borderColor: '#696cff',
        backgroundColor: 'rgba(105, 108, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#696cff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} tickets`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: Math.ceil(Math.max(...counts) / 5)
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  })
  console.log('Monthly chart rendered successfully')
}

// Status helpers
const getStatusColor = (status) => {
  const colors = {
    'new': '#696cff',
    'in_progress': '#03c3ec',
    'waiting_response': '#ffab00',
    'resolved': '#71dd37',
    'closed': '#8592a3'
  }
  return colors[status] || '#8592a3'
}

const getStatusBgColor = (status) => {
  const colors = {
    'new': '#696cff20',
    'in_progress': '#03c3ec20',
    'waiting_response': '#ffab0020',
    'resolved': '#71dd3720',
    'closed': '#8592a320'
  }
  return colors[status] || '#8592a320'
}

const getStatusIcon = (status) => {
  const icons = {
    'new': 'bx bx-file',
    'in_progress': 'bx bx-time-five',
    'waiting_response': 'bx bx-message-dots',
    'resolved': 'bx bx-check-circle',
    'closed': 'bx bx-x-circle'
  }
  return icons[status] || 'bx bx-circle'
}

const getStatusDescription = (status) => {
  const descriptions = {
    'new': 'Pending review',
    'in_progress': 'Being handled',
    'waiting_response': 'Awaiting reply',
    'resolved': 'Issue fixed',
    'closed': 'Completed'
  }
  return descriptions[status] || ''
}

// Computed properties
const hasData = computed(() => {
  if (!analytics.value) return false
  const { tickets_by_status, tickets_by_priority, tickets_by_category } = analytics.value
  return (
    (tickets_by_status && tickets_by_status.length > 0) ||
    (tickets_by_priority && tickets_by_priority.length > 0) ||
    (tickets_by_category && Object.keys(tickets_by_category).length > 0)
  )
})

const getTotalTickets = computed(() => {
  if (!analytics.value?.tickets_by_status) return 0
  return analytics.value.tickets_by_status.reduce((sum, item) => sum + item.count, 0)
})

const getNewTicketsCount = computed(() => {
  if (!analytics.value?.tickets_by_status?.length) return 0
  const newTickets = analytics.value.tickets_by_status.find(s => s.status === 'new')
  return newTickets ? newTickets.count : 0
})

const getStatusPercentage = computed(() => {
  if (!analytics.value?.tickets_by_status?.length) return '0%'
  const newTickets = analytics.value.tickets_by_status.find(s => s.status === 'new')
  if (!newTickets) return '0%'
  const total = getTotalTickets.value
  if (total === 0) return '0%'
  
  const percentage = (newTickets.count / total) * 100
  if (percentage < 1 && percentage > 0) {
    return percentage.toFixed(1) + '%'
  }
  return Math.round(percentage) + '%'
})

const getMonthlyAverage = computed(() => {
  if (!analytics.value?.monthly_tickets) return 0
  const counts = Object.values(analytics.value.monthly_tickets)
  if (counts.length === 0) return 0
  const sum = counts.reduce((a, b) => a + b, 0)
  return Math.round(sum / counts.length)
})

const getPeakMonth = computed(() => {
  if (!analytics.value?.monthly_tickets) return { month: '-', count: 0 }
  const entries = Object.entries(analytics.value.monthly_tickets)
  if (entries.length === 0) return { month: '-', count: 0 }
  
  const peak = entries.reduce((max, [month, count]) => 
    count > max.count ? { month, count } : max
  , { month: entries[0][0], count: entries[0][1] })
  
  return peak
})

const getTrendIndicator = computed(() => {
  if (!analytics.value?.monthly_tickets) return 0
  const months = Object.keys(analytics.value.monthly_tickets).sort()
  if (months.length < 2) return 0
  
  const firstHalf = months.slice(0, Math.floor(months.length / 2))
  const secondHalf = months.slice(Math.floor(months.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, month) => sum + analytics.value.monthly_tickets[month], 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, month) => sum + analytics.value.monthly_tickets[month], 0) / secondHalf.length
  
  if (firstAvg === 0) return 0
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
})

const mostUsedCategory = computed(() => {
  if (!analytics.value?.tickets_by_category) return '-'
  const categories = analytics.value.tickets_by_category
  const keys = Object.keys(categories)
  if (keys.length === 0) return '-'
  const maxCategory = keys.reduce((a, b) => 
    categories[a] > categories[b] ? a : b
  )
  return maxCategory
})

const mostUsedPriority = computed(() => {
  if (!analytics.value?.tickets_by_priority) return '-'
  const priorities = analytics.value.tickets_by_priority
  if (!Array.isArray(priorities) || priorities.length === 0) return '-'
  const maxPriority = priorities.reduce((max, item) => 
    item.count > max.count ? item : max
  , priorities[0])
  return maxPriority.priority
})

const formatNumber = (num) => {
  if (!num) return '0'
  return parseFloat(num).toFixed(2)
}

const formatCount = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const exportReport = () => {
  Swal.fire({
    icon: 'info',
    title: 'Export Report',
    text: 'Export functionality will be implemented soon',
    confirmButtonColor: '#696cff'
  })
}
</script>