<template>
  <div class="admin-dashboard-page container-xxl flex-grow-1 container-p-y">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="hero-kicker">Dashboard Admin</span>
        <h3>Ringkasan operasional HelpCenter hari ini</h3>
        <p>Pantau tiket masuk, performa SLA, dan progres checklist hari-H dari satu layar yang lebih rapi dan responsif.</p>
        <div class="hero-actions">
          <router-link to="/admin/tickets" class="btn-primary">
            Buka Semua Tiket
          </router-link>
          <router-link to="/admin/day-checklists" class="btn-ghost">
            Checklist Hari-H
          </router-link>
        </div>
      </div>
      <div class="hero-focus">
        <span>Butuh perhatian</span>
        <strong>{{ stats.new_tickets || 0 }} tiket baru</strong>
        <small>{{ dayChecklist.butuh_perhatian || 0 }} event checklist perlu tindak lanjut</small>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total tiket</span>
        <strong>{{ stats.total_tickets || 0 }}</strong>
        <small>Akumulasi seluruh tiket yang masuk</small>
      </article>
      <article class="stat-card stat-card--warning">
        <span>Tiket baru</span>
        <strong>{{ stats.new_tickets || 0 }}</strong>
        <small>Perlu triase dan penugasan</small>
      </article>
      <article class="stat-card stat-card--info">
        <span>Dalam proses</span>
        <strong>{{ stats.in_progress || 0 }}</strong>
        <small>Masih dikerjakan tim vendor</small>
      </article>
      <article class="stat-card stat-card--success">
        <span>Terselesaikan</span>
        <strong>{{ stats.resolved || 0 }}</strong>
        <small>Tiket selesai dan ditutup</small>
      </article>
    </section>

    <section class="overview-grid">
      <article class="panel-card panel-card--priority">
        <div class="panel-head">
          <div>
            <h5>Prioritas belum ditetapkan</h5>
            <p>Pastikan tiket tanpa prioritas segera diarahkan agar SLA tidak terganggu.</p>
          </div>
          <span class="big-number">{{ stats.tickets_without_priority || 0 }}</span>
        </div>
        <button class="btn-warning" type="button" @click="goToFirstNoPriorityTicket" :disabled="priorityLoading || !stats.tickets_without_priority">
          {{ priorityLoading ? 'Membuka...' : 'Tetapkan Prioritas' }}
        </button>
      </article>

      <article class="panel-card">
        <div class="panel-head">
          <div>
            <h5>Performa SLA</h5>
            <p>Persentase tiket yang selesai sesuai target layanan.</p>
          </div>
          <span class="badge-pill">{{ slaPerformance.percentage || 0 }}%</span>
        </div>
        <div class="metric-row">
          <div class="metric-box">
            <strong>{{ slaPerformance.total || 0 }}</strong>
            <span>Total SLA</span>
          </div>
          <div class="metric-box metric-box--success">
            <strong>{{ slaPerformance.met || 0 }}</strong>
            <span>Tercapai</span>
          </div>
          <div class="metric-box metric-box--danger">
            <strong>{{ slaPerformance.missed || 0 }}</strong>
            <span>Terlewat</span>
          </div>
        </div>
        <div class="progress-rail">
          <div class="progress-bar" :style="{ width: `${slaPerformance.percentage || 0}%` }"></div>
        </div>
      </article>

      <article class="panel-card panel-card--checklist">
        <div class="panel-head">
          <div>
            <h5>Checklist hari-H</h5>
            <p>Monitoring kesiapan event yang diisi vendor untuk operasional lapangan.</p>
          </div>
          <router-link to="/admin/day-checklists" class="link-inline">Lihat detail</router-link>
        </div>
        <div class="metric-row metric-row--four">
          <div class="metric-box">
            <strong>{{ dayChecklist.total_event || 0 }}</strong>
            <span>Total event</span>
          </div>
          <div class="metric-box metric-box--success">
            <strong>{{ dayChecklist.siap || 0 }}</strong>
            <span>Siap</span>
          </div>
          <div class="metric-box metric-box--danger">
            <strong>{{ dayChecklist.butuh_perhatian || 0 }}</strong>
            <span>Perhatian</span>
          </div>
          <div class="metric-box metric-box--neutral">
            <strong>{{ dayChecklist.draft || 0 }}</strong>
            <span>Belum diisi</span>
          </div>
        </div>
      </article>
    </section>

    <section class="panel-card">
      <div class="panel-head">
        <div>
          <h5>Komposisi pengguna</h5>
          <p>Gambaran singkat akun yang aktif di sistem HelpCenter.</p>
        </div>
      </div>
      <div class="user-grid">
        <div class="user-card">
          <span>Total pengguna</span>
          <strong>{{ stats.total_users || 0 }}</strong>
        </div>
        <div class="user-card">
          <span>Vendor</span>
          <strong>{{ stats.vendors || 0 }}</strong>
        </div>
        <div class="user-card">
          <span>Client</span>
          <strong>{{ stats.clients || 0 }}</strong>
        </div>
      </div>
    </section>

    <section class="panel-card">
      <div class="panel-head">
        <div>
          <h5>Tiket terbaru</h5>
          <p>Daftar tiket terbaru untuk tindak lanjut cepat oleh admin.</p>
        </div>
        <div class="head-actions">
          <button class="btn-icon" type="button" @click="refreshDashboard" :disabled="loading">
            <i class="bx bx-refresh"></i>
          </button>
          <router-link to="/admin/tickets" class="btn-primary">Lihat semua</router-link>
        </div>
      </div>

      <div v-if="loading" class="empty-state">Memuat dashboard admin...</div>
      <div v-else-if="recentTickets.length === 0" class="empty-state">Belum ada tiket terbaru.</div>
      <div v-else class="ticket-grid">
        <article v-for="ticket in recentTickets" :key="ticket.id" class="ticket-card">
          <div class="ticket-card__top">
            <div>
              <span class="ticket-number">{{ ticket.ticket_number }}</span>
              <h6>{{ ticket.title }}</h6>
            </div>
            <span :class="['status-chip', `status-${ticket.status}`]">{{ formatStatus(ticket.status) }}</span>
          </div>
          <div class="ticket-meta">
            <span>{{ ticket.user?.name || 'Client belum terdeteksi' }}</span>
            <span>{{ ticket.category?.name || 'Tanpa kategori' }}</span>
            <span>{{ ticket.assigned_to?.name || 'Belum ditugaskan' }}</span>
          </div>
          <div class="ticket-footer">
            <span :class="['priority-chip', `priority-${ticket.priority || 'none'}`]">{{ formatPriority(ticket.priority) }}</span>
            <small>{{ formatDate(ticket.created_at) }}</small>
          </div>
          <router-link :to="`/admin/tickets/${ticket.id}`" class="ticket-link">Buka detail</router-link>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/services/api'

const router = useRouter()

const loading = ref(false)
const priorityLoading = ref(false)
const stats = ref({})
const slaPerformance = ref({})
const dayChecklist = ref({})
const recentTickets = ref([])

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data.stats || {}
    slaPerformance.value = data.sla_performance || {}
    dayChecklist.value = data.day_checklist || {}
    recentTickets.value = data.recent_tickets || []
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal memuat dashboard',
      text: error.response?.data?.message || 'Data dashboard admin belum bisa dimuat.',
      confirmButtonColor: '#4f46e5',
    })
  } finally {
    loading.value = false
  }
}

const refreshDashboard = async () => {
  await fetchDashboardData()
  Swal.fire({
    icon: 'success',
    title: 'Dashboard diperbarui',
    toast: true,
    position: 'top-end',
    timer: 1800,
    showConfirmButton: false,
  })
}

const goToFirstNoPriorityTicket = async () => {
  if (!stats.value.tickets_without_priority) return

  priorityLoading.value = true
  try {
    const { data } = await api.get('/admin/tickets/no-priority/first')
    if (data.ticket?.id) {
      router.push(`/admin/tickets/${data.ticket.id}`)
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak bisa membuka tiket',
      text: error.response?.data?.message || 'Gagal mencari tiket tanpa prioritas.',
      confirmButtonColor: '#4f46e5',
    })
  } finally {
    priorityLoading.value = false
  }
}

const formatDate = (value) => value
  ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  : '-'

const formatPriority = (priority) => ({
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
}[priority] || 'Belum diatur')

const formatStatus = (status) => ({
  new: 'Baru',
  open: 'Terbuka',
  pending: 'Menunggu',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
}[status] || status)

onMounted(fetchDashboardData)
</script>

<style scoped>
.admin-dashboard-page { display: flex; flex-direction: column; gap: 1.5rem; }
.hero-card, .stat-card, .panel-card, .metric-box, .ticket-card, .user-card { background: #fff; border: 1px solid rgba(79, 70, 229, .12); box-shadow: 0 18px 40px rgba(15, 23, 42, .06); }
.hero-card { display: flex; justify-content: space-between; gap: 1.5rem; align-items: stretch; padding: 1.8rem; border-radius: 30px; background: linear-gradient(135deg, #eef2ff 0%, #fff7ed 100%); }
.hero-kicker { display: inline-flex; align-items: center; padding: .35rem .8rem; border-radius: 999px; background: rgba(79, 70, 229, .12); color: #4f46e5; font-weight: 800; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
.hero-copy h3 { margin: .9rem 0 .55rem; font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 800; color: #0f172a; }
.hero-copy p { margin: 0; max-width: 760px; color: #64748b; }
.hero-actions { display: flex; gap: .8rem; margin-top: 1.1rem; flex-wrap: wrap; }
.hero-focus { min-width: 18rem; border-radius: 24px; padding: 1.2rem; background: rgba(255, 255, 255, .8); display: grid; align-content: center; gap: .35rem; }
.hero-focus span, .stat-card span, .user-card span { color: #64748b; font-weight: 700; }
.hero-focus strong, .stat-card strong, .metric-box strong, .user-card strong { color: #0f172a; }
.hero-focus strong { font-size: 1.8rem; }
.hero-focus small, .stat-card small { color: #94a3b8; }
.btn-primary, .btn-ghost, .btn-warning, .btn-icon { border: 0; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: .82rem 1.15rem; }
.btn-ghost { background: #fff; color: #4f46e5; padding: .82rem 1.15rem; border: 1px solid rgba(79, 70, 229, .18); }
.btn-warning { width: 100%; padding: .95rem 1rem; background: #f59e0b; color: #fff; }
.btn-icon { width: 2.75rem; height: 2.75rem; background: #fff; color: #475569; border: 1px solid rgba(148, 163, 184, .25); }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.stat-card { border-radius: 24px; padding: 1.2rem; display: grid; gap: .35rem; }
.stat-card strong { font-size: 2rem; }
.stat-card--warning { background: linear-gradient(180deg, #fff7ed, #fff); border-color: rgba(249, 115, 22, .18); }
.stat-card--info { background: linear-gradient(180deg, #eff6ff, #fff); border-color: rgba(59, 130, 246, .18); }
.stat-card--success { background: linear-gradient(180deg, #f0fdf4, #fff); border-color: rgba(34, 197, 94, .18); }
.overview-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.panel-card { border-radius: 28px; padding: 1.35rem; }
.panel-card--priority { background: linear-gradient(180deg, #fff7ed, #fff); border-color: rgba(249, 115, 22, .18); }
.panel-card--checklist { background: linear-gradient(180deg, #eef2ff, #fff); }
.panel-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
.panel-head h5 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.panel-head p { margin: .25rem 0 0; color: #64748b; }
.big-number { font-size: 2.5rem; font-weight: 800; color: #c2410c; line-height: 1; }
.badge-pill { display: inline-flex; padding: .45rem .8rem; border-radius: 999px; background: rgba(34, 197, 94, .12); color: #15803d; font-weight: 800; }
.metric-row, .user-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; }
.metric-row--four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.metric-box, .user-card { border-radius: 22px; padding: 1rem; display: grid; gap: .3rem; }
.metric-box span, .link-inline { color: #64748b; }
.metric-box--success { background: #f0fdf4; border-color: rgba(34, 197, 94, .18); }
.metric-box--danger { background: #fff7ed; border-color: rgba(249, 115, 22, .18); }
.metric-box--neutral { background: #f8fafc; border-color: rgba(148, 163, 184, .18); }
.progress-rail { margin-top: 1rem; width: 100%; height: .8rem; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #22c55e, #4f46e5); }
.link-inline { font-weight: 700; text-decoration: none; }
.head-actions { display: flex; gap: .7rem; }
.ticket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.ticket-card { border-radius: 24px; padding: 1rem; display: grid; gap: .9rem; }
.ticket-card__top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.ticket-number { color: #4f46e5; font-weight: 800; font-size: .9rem; }
.ticket-card h6 { margin: .3rem 0 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.ticket-meta, .ticket-footer { display: flex; flex-wrap: wrap; gap: .55rem; color: #64748b; }
.ticket-footer { justify-content: space-between; align-items: center; }
.ticket-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
.status-chip, .priority-chip { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .75rem; border-radius: 999px; font-size: .78rem; font-weight: 800; }
.status-new, .status-pending { background: rgba(249, 115, 22, .12); color: #c2410c; }
.status-open, .status-in_progress { background: rgba(59, 130, 246, .12); color: #1d4ed8; }
.status-resolved, .status-closed { background: rgba(34, 197, 94, .12); color: #15803d; }
.priority-high, .priority-critical { background: rgba(239, 68, 68, .12); color: #b91c1c; }
.priority-medium { background: rgba(249, 115, 22, .12); color: #c2410c; }
.priority-low { background: rgba(34, 197, 94, .12); color: #15803d; }
.priority-none { background: rgba(148, 163, 184, .14); color: #475569; }
.empty-state { border: 1px dashed rgba(148, 163, 184, .55); border-radius: 22px; padding: 1.3rem; color: #64748b; text-align: center; }
@media (max-width: 1199px) {
  .overview-grid, .ticket-grid, .stats-grid { grid-template-columns: 1fr 1fr; }
  .metric-row, .metric-row--four, .user-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .hero-card, .panel-head, .ticket-card__top, .ticket-footer { flex-direction: column; align-items: flex-start; }
  .stats-grid, .overview-grid, .metric-row, .metric-row--four, .ticket-grid, .user-grid { grid-template-columns: 1fr; }
  .hero-focus { min-width: 100%; }
}
</style>
