<template>
  <div class="container-xxl flex-grow-1 container-p-y">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-1">Vendor Dashboard</h4>
        <p class="text-muted mb-0">
          Selamat datang kembali, {{ authStore.user?.name }} &mdash; {{ currentDate }}
        </p>
      </div>
      <router-link to="/vendor/profile" class="btn btn-outline-primary">
        <i class="bx bx-user me-1"></i> Profile Settings
      </router-link>
    </div>

    <!-- BARIS 1 — Stat Cards (dashboard) -->
    <div class="row g-3 mb-3">
      <div class="col-md-3 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">Active Tickets</p>
                <h3 class="fw-semibold mb-1">{{ stats.active_tickets }}</h3>
                <small class="text-primary">Sedang berjalan</small>
              </div>
              <div class="stat-icon bg-label-primary rounded-2 p-2">
                <i class="bx bx-file bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">New Tickets</p>
                <h3 class="fw-semibold mb-1">{{ stats.new_tickets }}</h3>
                <small class="text-warning">Perlu perhatian</small>
              </div>
              <div class="stat-icon bg-label-warning rounded-2 p-2">
                <i class="bx bx-bell bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">Resolved This Week</p>
                <h3 class="fw-semibold mb-1">{{ stats.resolved_this_week }}</h3>
                <small class="text-success">Minggu ini</small>
              </div>
              <div class="stat-icon bg-label-success rounded-2 p-2">
                <i class="bx bx-check-circle bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">SLA Compliance</p>
                <h3 class="fw-semibold mb-1">{{ stats.sla_compliance }}%</h3>
                <small class="text-info">Bulan ini</small>
              </div>
              <div class="stat-icon bg-label-info rounded-2 p-2">
                <i class="bx bx-time bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BARIS 2 — Performance Cards -->
    <div class="row g-3 mb-3">
      <div class="col-md-4 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">Resolved This Month</p>
                <h3 class="fw-semibold mb-1">{{ performance.resolved_this_month }}</h3>
                <small class="text-success">Bulan ini</small>
              </div>
              <div class="stat-icon bg-label-success rounded-2 p-2">
                <i class="bx bx-trending-up bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">Avg Response Time</p>
                <h3 class="fw-semibold mb-1">{{ formatMinutes(performance.avg_response_time) }}</h3>
                <small class="text-muted">Rata-rata respons pertama</small>
              </div>
              <div class="stat-icon bg-label-warning rounded-2 p-2">
                <i class="bx bx-reply bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-6">
        <div class="card stat-card border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-2">Avg Resolution Time</p>
                <h3 class="fw-semibold mb-1">{{ formatMinutes(performance.avg_resolution_time) }}</h3>
                <small class="text-muted">Rata-rata penyelesaian</small>
              </div>
              <div class="stat-icon bg-label-info rounded-2 p-2">
                <i class="bx bx-timer bx-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BARIS 3 — Chart Tren + Donut -->
    <div class="row g-3 mb-3">
      <div class="col-md-8">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">Tren Tiket</h5>
              <div class="d-flex gap-3">
                <small class="text-muted d-flex align-items-center gap-1">
                  <span class="legend-dot bg-primary"></span>Total Masuk
                </small>
                <small class="text-muted d-flex align-items-center gap-1">
                  <span class="legend-dot bg-success"></span>Selesai
                </small>
              </div>
            </div>
            <div class="btn-group btn-group-sm">
              <button
                type="button" class="btn"
                :class="trendPeriod === 'weekly' ? 'btn-primary' : 'btn-outline-secondary'"
                :disabled="trendLoading"
                @click="switchPeriod('weekly')"
              >Mingguan</button>
              <button
                type="button" class="btn"
                :class="trendPeriod === 'monthly' ? 'btn-primary' : 'btn-outline-secondary'"
                :disabled="trendLoading"
                @click="switchPeriod('monthly')"
              >Bulanan</button>
            </div>
          </div>
          <div class="card-body" style="position: relative; min-height: 200px;">
            <!-- ✅ FIX: v-show bukan v-if — canvas TETAP ada di DOM -->
            <div v-show="trendLoading" class="text-center py-5">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <!-- ✅ canvas selalu mounted, ref selalu valid -->
            <canvas
              ref="trendChartRef"
              height="120"
              :style="{ display: trendLoading ? 'none' : 'block' }"
            ></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title m-0">Status Tiket</h5>
          </div>
          <div class="card-body d-flex align-items-center">
            <div class="d-flex align-items-center gap-3 w-100">
              <div style="width:120px;flex-shrink:0">
                <canvas ref="donutChartRef"></canvas>
              </div>
              <div class="flex-grow-1">
                <div
                  v-for="item in statusBreakdown" :key="item.label"
                  class="d-flex align-items-center justify-content-between mb-2"
                >
                  <div class="d-flex align-items-center gap-2">
                    <span class="legend-dot" :style="{ background: item.color }"></span>
                    <small class="text-muted">{{ item.label }}</small>
                  </div>
                  <small class="fw-semibold">{{ item.count }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BARIS 4 — Monthly Performance Line Chart -->
    <div class="row g-3 mb-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">Performa Bulanan (6 bulan)</h5>
              <small class="text-muted">Jumlah tiket resolved per bulan</small>
            </div>
            <router-link to="/vendor/reports" class="btn btn-sm btn-label-primary">
              Lihat Laporan
            </router-link>
          </div>
          <div class="card-body">
            <canvas ref="lineChartRef" height="60"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- BARIS 5 — Urgent + Recent Tickets -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title m-0">Urgent Tickets</h5>
            <span class="badge bg-danger rounded-pill">{{ urgentTickets.length }}</span>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-danger"></div>
            </div>
            <div v-else-if="urgentTickets.length === 0" class="text-center text-muted py-5">
              <i class="bx bx-check-circle bx-lg text-success"></i>
              <p class="mb-0 mt-2 small">Tidak ada tiket urgent</p>
            </div>
            <div v-else>
              <div
                v-for="ticket in urgentTickets" :key="ticket.id"
                class="ticket-item d-flex justify-content-between align-items-start px-3 py-3"
              >
                <div class="flex-grow-1 me-2 min-w-0">
                  <p class="fw-semibold mb-1 text-truncate small">{{ ticket.title }}</p>
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <small class="text-muted">{{ ticket.ticket_number }}</small>
                    <span :class="`badge bg-${getPriorityColor(ticket.priority)} rounded-pill`">
                      {{ formatPriority(ticket.priority) }}
                    </span>
                    <small class="text-muted">{{ timeAgo(ticket.created_at) }}</small>
                  </div>
                </div>
                <router-link
                  :to="`/vendor/tickets/${ticket.id}`"
                  class="btn btn-sm btn-outline-primary flex-shrink-0"
                >Lihat</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title m-0">Tiket Terbaru</h5>
            <router-link to="/vendor/tickets" class="btn btn-sm btn-label-primary">
              Lihat Semua
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else-if="recentTickets.length === 0" class="text-center text-muted py-5">
              <i class="bx bx-folder-open bx-lg"></i>
              <p class="mb-0 mt-2 small">Belum ada tiket terbaru</p>
            </div>
            <div v-else>
              <div
                v-for="ticket in recentTickets" :key="ticket.id"
                class="ticket-item d-flex justify-content-between align-items-start px-3 py-3"
              >
                <div class="flex-grow-1 me-2 min-w-0">
                  <p class="fw-semibold mb-1 text-truncate small">{{ ticket.title }}</p>
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <small class="text-muted">{{ ticket.user?.name }}</small>
                    <span :class="`badge bg-${getStatusColor(ticket.status)} rounded-pill`">
                      {{ formatStatus(ticket.status) }}
                    </span>
                    <small class="text-muted">{{ timeAgo(ticket.created_at) }}</small>
                  </div>
                </div>
                <router-link
                  :to="`/vendor/tickets/${ticket.id}`"
                  class="btn btn-sm btn-outline-primary flex-shrink-0"
                >Lihat</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import {
  getPriorityColor, getStatusColor,
  formatPriority, formatStatus, timeAgo
} from '@/utils/helpers'
import Chart from 'chart.js/auto'

const authStore = useAuthStore()

const loading      = ref(false)
const trendLoading = ref(false)
const trendPeriod  = ref('monthly')

const stats = ref({
  active_tickets: 0, new_tickets: 0,
  in_progress: 0, resolved_this_week: 0, sla_compliance: 0,
})
const performance = ref({
  total_assigned: 0, resolved_this_month: 0,
  avg_response_time: 0, avg_resolution_time: 0,
  sla_compliance: 0, tickets_by_status: {}, monthly_performance: [],
})
const recentTickets = ref([])
const urgentTickets = ref([])
const statusBreakdown = ref([
  { label: 'New',              statusKey: 'new',              count: 0, color: '#378ADD' },
  { label: 'In Progress',      statusKey: 'in_progress',      count: 0, color: '#BA7517' },
  { label: 'Waiting Response', statusKey: 'waiting_response', count: 0, color: '#E24B4A' },
  { label: 'Resolved',         statusKey: 'resolved',         count: 0, color: '#639922' },
  { label: 'Closed',           statusKey: 'closed',           count: 0, color: '#888780' },
])
const trendData = ref({ labels: [], total: [], resolved: [] })

const trendChartRef = ref(null)
const donutChartRef = ref(null)
const lineChartRef  = ref(null)
let trendInst = null
let donutInst = null
let lineInst  = null

const currentDate = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

const formatMinutes = (minutes) => {
  if (!minutes || minutes === 0) return '—'
  if (minutes < 60) return `${Math.round(minutes)} mnt`
  return `${(minutes / 60).toFixed(1)} jam`
}

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchDashboard = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/vendor/dashboard')
    stats.value         = data.stats
    recentTickets.value = data.recent_tickets
    urgentTickets.value = data.urgent_tickets
  } catch (err) {
    console.error('dashboard error:', err)
  } finally {
    loading.value = false
  }
}

const fetchPerformance = async () => {
  try {
    const { data } = await api.get('/vendor/performance')
    performance.value = data
    const map = data.tickets_by_status ?? {}
    statusBreakdown.value = statusBreakdown.value.map(item => ({
      ...item,
      count: Number(map[item.statusKey] ?? 0),
    }))
    await nextTick()
    initDonutChart()
    initLineChart(data.monthly_performance ?? [])
  } catch (err) {
    console.error('performance error:', err)
    await nextTick()
    initDonutChart()
    initLineChart([])
  }
}

const fetchTrendStats = async (period) => {
  trendLoading.value = true
  try {
    const { data } = await api.get('/vendor/ticket-stats', { params: { period } })
    const items = data.data ?? []
    trendData.value = {
      labels:   items.map(i => period === 'weekly' ? (i.date ?? i.period) : i.period),
      total:    items.map(i => i.total),
      resolved: items.map(i => i.resolved),
    }
  } catch (err) {
    console.error('ticketStats error:', err)
    trendData.value = { labels: [], total: [], resolved: [] }
  } finally {
    trendLoading.value = false
    // ✅ nextTick: pastikan v-show sudah display:block sebelum build
    await nextTick()
    buildTrendChart()
  }
}


// ─── Charts ───────────────────────────────────────────────────────────────────

const chartColors = () => {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches
  return {
    grid: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    tick: dark ? '#aaa' : '#888',
  }
}

const buildTrendChart = () => {
  if (!trendChartRef.value) {
    console.warn('trendChartRef is null, skipping chart build')
    return
  }
  if (trendInst) { trendInst.destroy(); trendInst = null }
 
  const { grid, tick } = chartColors()
  const hasData  = trendData.value.labels.length > 0
  const labels   = hasData ? trendData.value.labels   : ['Tidak ada data']
  const total    = hasData ? trendData.value.total    : [0]
  const resolved = hasData ? trendData.value.resolved : [0]
 
  trendInst = new Chart(trendChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Masuk',
          data: total,
          backgroundColor: '#378ADD',
          borderRadius: 4,
          barPercentage: 0.55,
        },
        {
          label: 'Selesai',
          data: resolved,
          backgroundColor: '#639922',
          borderRadius: 4,
          barPercentage: 0.55,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
 
      // ✅ FIX: animasi bar tumbuh dari bawah ke atas
      animation: {
        duration: 600,
        easing: 'easeOutQuart',
        // setiap kali data di-update (switch periode), animasi jalan ulang
        onProgress: null,
        onComplete: null,
      },
      animations: {
        y: {
          from: (ctx) => {
            // bar mulai dari sumbu Y (bawah chart) lalu tumbuh ke atas
            const chart = ctx.chart
            return chart.scales.y.getPixelForValue(0)
          },
        },
      },
      transitions: {
        // animasi saat update data (bukan hanya inisialisasi)
        active: {
          animation: { duration: 400 }
        },
        resize: {
          animation: { duration: 0 }   // resize jangan animasi supaya tidak glitch
        },
      },
 
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: tick,
            font: { size: 11 },
            autoSkip: false,
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: tick, font: { size: 11 }, precision: 0 },
          border: { display: false },
        },
      },
    },
  })
}



const initDonutChart = () => {
  if (!donutChartRef.value) return
  if (donutInst) { donutInst.destroy(); donutInst = null }
  donutInst = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: statusBreakdown.value.map(s => s.label),
      datasets: [{
        data:            statusBreakdown.value.map(s => s.count),
        backgroundColor: statusBreakdown.value.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: { legend: { display: false } },
    },
  })
}

const initLineChart = (monthlyPerformance) => {
  if (!lineChartRef.value) return
  if (lineInst) { lineInst.destroy(); lineInst = null }
  const { grid, tick } = chartColors()
  lineInst = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels: monthlyPerformance.map(m => m.month),
      datasets: [{
        label: 'Resolved',
        data: monthlyPerformance.map(m => m.resolved),
        borderColor: '#639922',
        backgroundColor: 'rgba(99,153,34,0.08)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#639922',
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tick, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: tick, font: { size: 11 }, precision: 0 },
          border: { display: false },
        },
      },
    },
  })
}



// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await fetchDashboard()
  await fetchPerformance()
  // ✅ FIX: pastikan DOM sudah render sebelum fetch & build chart
  await nextTick()
  await fetchTrendStats(trendPeriod.value)
})
</script>

<style scoped>
.stat-card { background-color: var(--bs-light, #f8f9fa); }
.stat-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ticket-item { border-bottom: 1px solid rgba(0,0,0,0.06); }
.ticket-item:last-child { border-bottom: none; }
.min-w-0 { min-width: 0; }
</style>