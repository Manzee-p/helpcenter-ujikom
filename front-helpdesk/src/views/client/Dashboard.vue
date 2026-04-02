<template>
  <div class="client-dashboard-clean">
    <section class="dashboard-hero">
      <div class="dashboard-hero__copy">
        <span class="hero-badge">Ringkasan Client</span>
        <h1>Halo, {{ authStore.userName }}.</h1>
        <p>Pantau tiket aktif, lihat layanan yang belum dinilai, dan buat laporan baru tanpa tampilan yang terlalu padat.</p>
        <div class="hero-actions">
          <router-link to="/client/create-ticket" class="btn-primary">
            <i class="bx bx-plus-circle"></i>
            <span>Buat Tiket</span>
          </router-link>
          <router-link to="/client/tickets" class="btn-secondary">
            <i class="bx bx-file"></i>
            <span>Laporan Saya</span>
          </router-link>
        </div>
      </div>

      <div class="dashboard-hero__side">
        <article class="focus-card">
          <span class="focus-label">Butuh perhatian</span>
          <strong>{{ pendingFeedbackCount }} layanan belum dinilai</strong>
          <small>Berikan rating agar evaluasi vendor lebih akurat.</small>
          <router-link to="/client/history" class="focus-link">Buka riwayat</router-link>
        </article>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span>Total tiket</span>
        <strong>{{ stats.tickets.total }}</strong>
        <small>Seluruh laporan yang pernah Anda buat</small>
      </article>
      <article class="summary-card summary-card--active">
        <span>Sedang diproses</span>
        <strong>{{ stats.tickets.in_progress }}</strong>
        <small>Masih ditangani vendor</small>
      </article>
      <article class="summary-card summary-card--done">
        <span>Selesai</span>
        <strong>{{ stats.tickets.resolved }}</strong>
        <small>Resolved atau closed</small>
      </article>
      <article class="summary-card summary-card--rating">
        <span>Belum dinilai</span>
        <strong>{{ pendingFeedbackCount }}</strong>
        <small>Tiket selesai yang menunggu rating</small>
      </article>
    </section>

    <section v-if="pendingFeedbackItems.length" class="pending-strip">
      <div class="section-head">
        <div>
          <span class="section-kicker">Perlu Rating</span>
          <h2>Layanan vendor yang belum Anda nilai</h2>
        </div>
        <router-link to="/client/history" class="section-link">Lihat semua</router-link>
      </div>

      <div class="pending-list">
        <button
          v-for="ticket in pendingFeedbackItems.slice(0, 3)"
          :key="`feedback-${ticket.id}`"
          type="button"
          class="pending-item"
          @click="viewTicket(ticket)"
        >
          <div>
            <strong>#{{ ticket.ticket_number }}</strong>
            <p>{{ ticket.title }}</p>
          </div>
          <small>{{ ticket.assigned_to?.name || 'Vendor sudah menyelesaikan tiket ini' }}</small>
        </button>
      </div>
    </section>

    <section class="content-grid">
      <article class="content-card">
        <div class="section-head">
          <div>
            <span class="section-kicker">Aktivitas Terbaru</span>
            <h2>Tiket terbaru Anda</h2>
          </div>
          <router-link to="/client/history" class="section-link">Riwayat</router-link>
        </div>

        <div v-if="loading" class="empty-state">Memuat dashboard...</div>
        <div v-else-if="recentTickets.length === 0" class="empty-state">Belum ada tiket yang bisa ditampilkan.</div>
        <div v-else class="ticket-list">
          <article
            v-for="ticket in recentTickets"
            :key="ticket.id"
            class="ticket-row"
            @click="viewTicket(ticket)"
          >
            <div class="ticket-row__main">
              <div class="ticket-number">#{{ ticket.ticket_number }}</div>
              <h3>{{ ticket.title }}</h3>
              <p>{{ truncate(ticket.description, 110) }}</p>
            </div>

            <div class="ticket-row__meta">
              <TicketStatusBadge :status="ticket.status" />
              <span class="meta-pill">{{ ticket.category?.name || 'Tanpa kategori' }}</span>
              <span class="meta-pill">{{ timeAgo(ticket.created_at) }}</span>
              <span v-if="ticket.priority" :class="`meta-pill priority-${ticket.priority}`">{{ ticket.priority }}</span>
            </div>

            <div class="ticket-row__footer">
              <span>{{ ticket.assigned_to?.name || 'Menunggu penugasan vendor' }}</span>
              <span v-if="['resolved', 'closed'].includes(ticket.status) && !ticket.feedback" class="rating-flag">Perlu rating</span>
            </div>
          </article>
        </div>
      </article>

      <article class="content-card content-card--aside">
        <div class="section-head">
          <div>
            <span class="section-kicker">Aksi Cepat</span>
            <h2>Yang bisa Anda lakukan</h2>
          </div>
        </div>

        <div class="quick-actions">
          <router-link to="/client/create-ticket" class="quick-action">
            <i class="bx bx-plus-circle"></i>
            <div>
              <strong>Buat tiket baru</strong>
              <small>Kirim permintaan bantuan baru ke tim.</small>
            </div>
          </router-link>

          <router-link to="/client/tickets" class="quick-action">
            <i class="bx bx-folder-open"></i>
            <div>
              <strong>Laporan saya</strong>
              <small>Lihat seluruh tiket aktif Anda.</small>
            </div>
          </router-link>

          <router-link to="/client/history" class="quick-action">
            <i class="bx bx-star"></i>
            <div>
              <strong>Beri rating vendor</strong>
              <small>Periksa tiket selesai yang belum dinilai.</small>
            </div>
          </router-link>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import { timeAgo, truncate } from '@/utils/helpers'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const stats = ref({
  tickets: {
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  },
})

const recentTickets = ref([])
const allTickets = ref([])
const pendingFeedbackCount = ref(0)

onMounted(async () => {
  await fetchDashboard()
})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const ticketsResponse = await api.get('/tickets', {
      params: { per_page: 100, page: 1 },
    })

    let ticketItems = []
    if (ticketsResponse.data.data) {
      ticketItems = ticketsResponse.data.data
    } else if (Array.isArray(ticketsResponse.data)) {
      ticketItems = ticketsResponse.data
    }

    allTickets.value = ticketItems

    stats.value.tickets = {
      total: ticketItems.length,
      open: ticketItems.filter((ticket) => ticket.status === 'new').length,
      in_progress: ticketItems.filter((ticket) => ticket.status === 'in_progress').length,
      resolved: ticketItems.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length,
    }

    pendingFeedbackCount.value = ticketItems.filter(
      (ticket) => ['resolved', 'closed'].includes(ticket.status) && !ticket.feedback,
    ).length

    ticketItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    recentTickets.value = ticketItems.slice(0, 5)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal memuat dashboard',
      text: error.response?.data?.message || 'Data dashboard client belum bisa dimuat.',
      confirmButtonColor: '#6366f1',
    })
  } finally {
    loading.value = false
  }
}

const pendingFeedbackItems = computed(() => {
  return allTickets.value.filter((ticket) => ['resolved', 'closed'].includes(ticket.status) && !ticket.feedback)
})

const viewTicket = (ticket) => {
  router.push(`/tickets/${ticket.id}`)
}
</script>

<style scoped>
.client-dashboard-clean { display: flex; flex-direction: column; gap: 1.5rem; }
.dashboard-hero,
.summary-card,
.pending-strip,
.content-card,
.ticket-row,
.focus-card,
.pending-item,
.quick-action { background: #fff; border: 1px solid rgba(99, 102, 241, .1); box-shadow: 0 18px 40px rgba(15, 23, 42, .05); }
.dashboard-hero { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr); gap: 1rem; padding: 1.5rem; border-radius: 28px; background: linear-gradient(135deg, #eef2ff 0%, #fff 55%, #f8fafc 100%); }
.hero-badge, .section-kicker { display: inline-flex; padding: .35rem .75rem; border-radius: 999px; background: rgba(99, 102, 241, .1); color: #6366f1; font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.dashboard-hero__copy h1 { margin: .9rem 0 .45rem; font-size: clamp(1.8rem, 4vw, 2.7rem); font-weight: 800; color: #0f172a; }
.dashboard-hero__copy p { margin: 0; max-width: 650px; color: #64748b; }
.hero-actions { display: flex; gap: .8rem; flex-wrap: wrap; margin-top: 1.1rem; }
.btn-primary, .btn-secondary { display: inline-flex; align-items: center; gap: .55rem; padding: .85rem 1.1rem; border-radius: 16px; font-weight: 700; text-decoration: none; }
.btn-primary { background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; }
.btn-secondary { background: #fff; color: #4f46e5; border: 1px solid rgba(99, 102, 241, .16); }
.dashboard-hero__side { display: flex; }
.focus-card { width: 100%; border-radius: 24px; padding: 1.2rem; display: grid; gap: .45rem; align-content: center; }
.focus-label, .summary-card span { color: #64748b; font-weight: 700; }
.focus-card strong, .summary-card strong { color: #0f172a; }
.focus-card strong { font-size: 1.5rem; }
.focus-card small, .summary-card small { color: #94a3b8; }
.focus-link, .section-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.summary-card { border-radius: 22px; padding: 1.15rem; display: grid; gap: .35rem; }
.summary-card strong { font-size: 2rem; }
.summary-card--active { background: linear-gradient(180deg, #eff6ff, #fff); }
.summary-card--done { background: linear-gradient(180deg, #f0fdf4, #fff); }
.summary-card--rating { background: linear-gradient(180deg, #fff7ed, #fff); }
.pending-strip, .content-card { border-radius: 28px; padding: 1.35rem; }
.section-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
.section-head h2 { margin: .35rem 0 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.pending-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; }
.pending-item { border-radius: 20px; padding: 1rem; text-align: left; }
.pending-item strong { color: #d97706; }
.pending-item p { margin: .4rem 0; color: #0f172a; font-weight: 700; }
.pending-item small { color: #64748b; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, .75fr); gap: 1rem; }
.ticket-list, .quick-actions { display: grid; gap: .9rem; }
.ticket-row { border-radius: 22px; padding: 1rem; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
.ticket-row:hover { transform: translateY(-2px); box-shadow: 0 20px 45px rgba(79, 70, 229, .08); }
.ticket-row__main h3 { margin: .3rem 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.ticket-row__main p { margin: 0; color: #64748b; }
.ticket-number { color: #4f46e5; font-weight: 800; }
.ticket-row__meta, .ticket-row__footer { display: flex; flex-wrap: wrap; gap: .55rem; align-items: center; margin-top: .85rem; color: #64748b; }
.ticket-row__footer { justify-content: space-between; }
.meta-pill, .rating-flag { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .7rem; border-radius: 999px; font-size: .78rem; font-weight: 700; background: #f8fafc; color: #475569; }
.rating-flag, .priority-high, .priority-critical { background: rgba(249, 115, 22, .12); color: #c2410c; }
.priority-medium { background: rgba(250, 204, 21, .16); color: #a16207; }
.priority-low { background: rgba(34, 197, 94, .12); color: #15803d; }
.quick-action { border-radius: 20px; padding: 1rem; display: flex; gap: .9rem; align-items: flex-start; text-decoration: none; }
.quick-action i { font-size: 1.4rem; color: #6366f1; }
.quick-action strong { display: block; color: #0f172a; }
.quick-action small { color: #64748b; }
.empty-state { border: 1px dashed rgba(148, 163, 184, .5); border-radius: 20px; padding: 1.25rem; text-align: center; color: #64748b; }
@media (max-width: 1199px) {
  .summary-grid, .pending-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .content-grid, .dashboard-hero { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .summary-grid, .pending-list, .content-grid { grid-template-columns: 1fr; }
  .section-head, .ticket-row__footer { flex-direction: column; align-items: flex-start; }
  .section-head h2 { font-size: 1.45rem; }
}
</style>
