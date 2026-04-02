<template>
  <div class="tickets-page-admin">
    <section class="hero-card">
      <div>
        <span class="hero-kicker">Manajemen Tiket</span>
        <h1>Semua tiket dalam satu layar</h1>
        <p>Admin fokus pada pemantauan, penugasan, dan penghapusan tiket tanpa alur membuat tiket baru untuk client.</p>
      </div>
      <div class="hero-actions">
        <button class="ghost-btn" type="button" @click="fetchTickets">
          <i class="bx bx-refresh"></i>
          Muat ulang
        </button>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total tiket</span>
        <strong>{{ pagination.total || 0 }}</strong>
        <small>Keseluruhan tiket yang tercatat</small>
      </article>
      <article class="stat-card stat-card--new">
        <span>Tiket baru</span>
        <strong>{{ newCount }}</strong>
        <small>Perlu ditinjau admin</small>
      </article>
      <article class="stat-card stat-card--progress">
        <span>Dalam proses</span>
        <strong>{{ inProgressCount }}</strong>
        <small>Masih dikerjakan vendor</small>
      </article>
      <article class="stat-card stat-card--assigned">
        <span>Sudah ditugaskan</span>
        <strong>{{ assignedCount }}</strong>
        <small>Sudah punya vendor penanggung jawab</small>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-search">
        <i class="bx bx-search"></i>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Cari nomor tiket, judul, atau nama client..."
          @input="debounceSearch"
        >
        <button v-if="filters.search" type="button" class="clear-search" @click="filters.search = ''; fetchTickets()">
          <i class="bx bx-x"></i>
        </button>
      </div>

      <div class="filter-row">
        <label class="filter-field">
          <span>Status</span>
          <select v-model="filters.status" @change="fetchTickets">
            <option value="">Semua status</option>
            <option value="new">Baru</option>
            <option value="in_progress">Dalam proses</option>
            <option value="waiting_response">Menunggu respon</option>
            <option value="resolved">Terselesaikan</option>
            <option value="closed">Ditutup</option>
          </select>
        </label>

        <label class="filter-field">
          <span>Prioritas</span>
          <select v-model="filters.priority" @change="fetchTickets">
            <option value="">Semua prioritas</option>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
            <option value="urgent">Mendesak</option>
          </select>
        </label>

        <div class="view-switch">
          <button :class="{ active: viewMode === 'table' }" type="button" @click="viewMode = 'table'">
            <i class="bx bx-list-ul"></i>
          </button>
          <button :class="{ active: viewMode === 'grid' }" type="button" @click="viewMode = 'grid'">
            <i class="bx bx-grid-alt"></i>
          </button>
        </div>

        <button v-if="activeFiltersCount" class="reset-btn" type="button" @click="clearFilters">
          Reset filter
        </button>
      </div>
    </section>

    <section class="content-card">
      <div class="content-head">
        <div>
          <h2>Daftar tiket</h2>
          <p>{{ tickets.length }} tiket tampil pada halaman ini</p>
        </div>
      </div>

      <div v-if="ticketStore.loading" class="state-box">Memuat data tiket...</div>
      <div v-else-if="tickets.length === 0" class="state-box">Belum ada tiket yang cocok dengan filter saat ini.</div>

      <div v-else-if="viewMode === 'table'" class="table-shell">
        <table class="tickets-table">
          <thead>
            <tr>
              <th>Tiket</th>
              <th>Client</th>
              <th>Status</th>
              <th>Prioritas</th>
              <th>Vendor</th>
              <th>Dibuat</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id" class="table-row" @click="viewTicket(ticket)">
              <td>
                <div class="ticket-main">
                  <strong>{{ ticket.ticket_number }}</strong>
                  <span>{{ ticket.title }}</span>
                </div>
              </td>
              <td>{{ ticket.user?.name || '-' }}</td>
              <td><span :class="['status-badge', `status-${ticket.status}`]">{{ formatStatus(ticket.status) }}</span></td>
              <td><span :class="['priority-badge', `priority-${ticket.priority || 'none'}`]">{{ formatPriority(ticket.priority) }}</span></td>
              <td>{{ getAssignedName(ticket) || 'Belum ditugaskan' }}</td>
              <td>{{ formatDate(ticket.created_at) }}</td>
              <td class="actions" @click.stop>
                <button class="icon-btn" type="button" @click="viewTicket(ticket)"><i class="bx bx-show"></i></button>
                <button class="icon-btn" type="button" @click="handleAssign(ticket)"><i class="bx bx-user-plus"></i></button>
                <button class="icon-btn icon-btn--danger" type="button" @click="handleDelete(ticket)"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="ticket-grid">
        <article v-for="ticket in tickets" :key="ticket.id" class="ticket-card" @click="viewTicket(ticket)">
          <div class="ticket-card__top">
            <strong>{{ ticket.ticket_number }}</strong>
            <span :class="['status-badge', `status-${ticket.status}`]">{{ formatStatus(ticket.status) }}</span>
          </div>

          <h3>{{ ticket.title }}</h3>
          <p>{{ truncate(ticket.description, 120) }}</p>

          <div class="ticket-card__meta">
            <span>{{ ticket.user?.name || 'Client tidak diketahui' }}</span>
            <span>{{ getAssignedName(ticket) || 'Belum ditugaskan' }}</span>
            <span>{{ formatDate(ticket.created_at) }}</span>
          </div>

          <div class="ticket-card__footer">
            <span :class="['priority-badge', `priority-${ticket.priority || 'none'}`]">{{ formatPriority(ticket.priority) }}</span>
            <div class="card-actions" @click.stop>
              <button class="icon-btn" type="button" @click="handleAssign(ticket)"><i class="bx bx-user-plus"></i></button>
              <button class="icon-btn icon-btn--danger" type="button" @click="handleDelete(ticket)"><i class="bx bx-trash"></i></button>
            </div>
          </div>
        </article>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-wrap">
        <button :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">Sebelumnya</button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="{ active: page === pagination.current_page, dots: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        <button :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">Berikutnya</button>
      </div>
    </section>

    <AssignModal
      v-if="showAssignModal"
      :ticket="selectedTicket"
      @close="showAssignModal = false"
      @assigned="onTicketAssigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import AssignModal from '@/components/admin/AssignModal.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const ticketStore = useTicketStore()

const filters = ref({ status: '', priority: '', search: '', sort: 'newest' })
const showAssignModal = ref(false)
const selectedTicket = ref(null)
const viewMode = ref('table')
let searchTimeout = null

const tickets = computed(() => Array.isArray(ticketStore.tickets) ? ticketStore.tickets : [])
const pagination = computed(() => ({
  current_page: ticketStore.pagination?.current_page || 1,
  last_page: ticketStore.pagination?.last_page || 1,
  total: ticketStore.pagination?.total || 0,
}))

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status) count++
  if (filters.value.priority) count++
  if (filters.value.search) count++
  return count
})

const assignedCount = computed(() => ticketStore.stats?.assigned_count || 0)
const newCount = computed(() => tickets.value.filter((ticket) => ticket.status === 'new').length)
const inProgressCount = computed(() => tickets.value.filter((ticket) => ticket.status === 'in_progress').length)

const fetchTickets = async () => {
  await ticketStore.fetchTickets(filters.value)
}

const visiblePages = computed(() => {
  const cur = pagination.value.current_page
  const last = pagination.value.last_page
  const range = []
  for (let i = Math.max(2, cur - 1); i <= Math.min(last - 1, cur + 1); i++) range.push(i)
  if (cur - 1 > 2) range.unshift('...')
  if (cur + 1 < last - 1) range.push('...')
  range.unshift(1)
  if (last !== 1) range.push(last)
  return range
})

onMounted(fetchTickets)

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchTickets, 400)
}

const clearFilters = () => {
  filters.value = { status: '', priority: '', search: '', sort: 'newest' }
  fetchTickets()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    ticketStore.fetchTickets({ ...filters.value, page })
  }
}

const handleAssign = (ticket) => {
  selectedTicket.value = ticket
  showAssignModal.value = true
}

const viewTicket = (ticket) => {
  router.push({ name: 'AdminTicketDetail', params: { id: ticket.id } })
}

const getAssignedName = (ticket) => {
  if (ticket.assigned_to && typeof ticket.assigned_to === 'object') return ticket.assigned_to.name
  if (ticket.assignedTo && typeof ticket.assignedTo === 'object') return ticket.assignedTo.name
  return null
}

const handleDelete = async (ticket) => {
  const result = await Swal.fire({
    title: 'Hapus tiket?',
    html: `Tiket <strong>${ticket.ticket_number}</strong> akan dihapus permanen.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal',
  })

  if (!result.isConfirmed) return

  try {
    await ticketStore.deleteTicket(ticket.id)
    await fetchTickets()
    Swal.fire({ icon: 'success', title: 'Tiket dihapus', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false })
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal menghapus tiket', text: error.response?.data?.message || 'Terjadi kesalahan.' })
  }
}

const onTicketAssigned = () => {
  showAssignModal.value = false
  fetchTickets()
}

const truncate = (text, limit) => text && text.length > limit ? `${text.substring(0, limit)}...` : (text || '')
const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const formatStatus = (status) => ({ new: 'Baru', in_progress: 'Dalam proses', waiting_response: 'Menunggu respon', resolved: 'Selesai', closed: 'Ditutup' }[status] || status)
const formatPriority = (priority) => ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', urgent: 'Mendesak' }[priority] || 'Belum diatur')

watch(showAssignModal, (open) => {
  document.body.classList.toggle('modal-open', open)
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
.tickets-page-admin { display: flex; flex-direction: column; gap: 1.5rem; padding: 1.5rem; background: #f8fafc; min-height: 100vh; }
.hero-card, .stat-card, .filter-card, .content-card, .ticket-card { background: #fff; border: 1px solid rgba(79, 70, 229, .1); box-shadow: 0 18px 40px rgba(15, 23, 42, .05); }
.hero-card { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; padding: 1.6rem; border-radius: 28px; background: linear-gradient(135deg, #eef2ff 0%, #fff7ed 100%); }
.hero-kicker { display: inline-flex; padding: .35rem .75rem; border-radius: 999px; background: rgba(79, 70, 229, .12); color: #4f46e5; font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.hero-card h1 { margin: .9rem 0 .45rem; font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; color: #0f172a; }
.hero-card p { margin: 0; max-width: 760px; color: #64748b; }
.ghost-btn { border: 1px solid rgba(79, 70, 229, .16); background: #fff; color: #4f46e5; padding: .85rem 1.1rem; border-radius: 16px; font-weight: 700; display: inline-flex; gap: .5rem; align-items: center; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.stat-card { border-radius: 22px; padding: 1.2rem; display: grid; gap: .35rem; }
.stat-card span { color: #64748b; font-weight: 700; }
.stat-card strong { font-size: 2rem; color: #0f172a; }
.stat-card small { color: #94a3b8; }
.stat-card--new { background: linear-gradient(180deg, #fff7ed, #fff); }
.stat-card--progress { background: linear-gradient(180deg, #eff6ff, #fff); }
.stat-card--assigned { background: linear-gradient(180deg, #f0fdf4, #fff); }
.filter-card, .content-card { border-radius: 26px; padding: 1.25rem; }
.filter-search { position: relative; margin-bottom: 1rem; }
.filter-search i { position: absolute; top: 50%; left: 1rem; transform: translateY(-50%); color: #94a3b8; }
.filter-search input { width: 100%; border: 1px solid rgba(148, 163, 184, .3); border-radius: 16px; padding: .9rem 3rem; }
.clear-search { position: absolute; top: 50%; right: .85rem; transform: translateY(-50%); border: 0; background: #eef2ff; color: #4f46e5; width: 2rem; height: 2rem; border-radius: 999px; }
.filter-row { display: flex; gap: 1rem; align-items: end; flex-wrap: wrap; }
.filter-field { display: grid; gap: .45rem; min-width: 180px; flex: 1; }
.filter-field span { font-size: .8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.filter-field select { border: 1px solid rgba(148, 163, 184, .3); border-radius: 14px; padding: .85rem 1rem; background: #fff; }
.view-switch { display: inline-flex; background: #f8fafc; border-radius: 14px; padding: .25rem; border: 1px solid rgba(148, 163, 184, .18); }
.view-switch button, .reset-btn, .icon-btn { border: 0; cursor: pointer; }
.view-switch button { width: 2.8rem; height: 2.8rem; background: transparent; border-radius: 12px; color: #64748b; }
.view-switch button.active { background: #fff; color: #4f46e5; box-shadow: 0 10px 24px rgba(15, 23, 42, .08); }
.reset-btn { background: #fff1f2; color: #e11d48; padding: .85rem 1rem; border-radius: 14px; font-weight: 700; }
.content-head { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.content-head h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f172a; }
.content-head p { margin: .2rem 0 0; color: #64748b; }
.state-box { border: 1px dashed rgba(148, 163, 184, .45); border-radius: 20px; padding: 1.3rem; text-align: center; color: #64748b; }
.table-shell { overflow: auto; border: 1px solid rgba(226, 232, 240, .9); border-radius: 20px; }
.tickets-table { width: 100%; border-collapse: collapse; }
.tickets-table th, .tickets-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eef2f7; }
.tickets-table th { font-size: .78rem; text-transform: uppercase; color: #64748b; background: #f8fafc; letter-spacing: .04em; }
.table-row { cursor: pointer; transition: background .18s ease; }
.table-row:hover { background: #f8fafc; }
.ticket-main { display: grid; gap: .25rem; }
.ticket-main strong { color: #4f46e5; }
.ticket-main span { color: #0f172a; font-weight: 700; }
.status-badge, .priority-badge { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .75rem; border-radius: 999px; font-size: .78rem; font-weight: 800; }
.status-new, .status-waiting_response, .priority-urgent { background: rgba(249, 115, 22, .12); color: #c2410c; }
.status-in_progress, .priority-high { background: rgba(59, 130, 246, .12); color: #1d4ed8; }
.status-resolved, .status-closed { background: rgba(34, 197, 94, .12); color: #15803d; }
.priority-medium { background: rgba(250, 204, 21, .16); color: #a16207; }
.priority-low { background: rgba(34, 197, 94, .12); color: #15803d; }
.priority-none { background: rgba(148, 163, 184, .14); color: #475569; }
.actions { text-align: center; }
.icon-btn { width: 2.5rem; height: 2.5rem; border-radius: 12px; background: #f8fafc; color: #475569; margin: 0 .15rem; }
.icon-btn--danger { background: #fff1f2; color: #e11d48; }
.ticket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.ticket-card { border-radius: 22px; padding: 1rem; display: grid; gap: .85rem; cursor: pointer; }
.ticket-card__top, .ticket-card__footer { display: flex; justify-content: space-between; gap: .8rem; align-items: center; }
.ticket-card__top strong { color: #4f46e5; }
.ticket-card h3 { margin: 0; font-size: 1.05rem; color: #0f172a; }
.ticket-card p { margin: 0; color: #64748b; }
.ticket-card__meta { display: grid; gap: .35rem; color: #64748b; }
.card-actions { display: flex; gap: .4rem; }
.pagination-wrap { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-top: 1rem; flex-wrap: wrap; }
.pagination-wrap button { border: 1px solid rgba(148, 163, 184, .25); background: #fff; border-radius: 12px; padding: .7rem 1rem; }
.page-numbers { display: flex; gap: .4rem; }
.page-numbers button.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
@media (max-width: 1199px) {
  .stats-grid, .ticket-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .tickets-page-admin, .hero-card { padding: 1rem; }
  .hero-card, .content-head, .ticket-card__top, .ticket-card__footer, .pagination-wrap { flex-direction: column; align-items: flex-start; }
  .stats-grid, .ticket-grid { grid-template-columns: 1fr; }
  .filter-row { flex-direction: column; align-items: stretch; }
  .view-switch { width: 100%; justify-content: space-between; }
}
</style>
