<template>
  <div class="container-xxl flex-grow-1 container-p-y vendor-ratings-page">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="hero-kicker">Insight rating client</span>
        <h4 class="page-title">Rating dari Client</h4>
        <p class="page-subtitle">Pantau tiket yang sudah diberi rating, temukan penilaian rendah, dan perbaiki kualitas layanan sebelum ada komplain berikutnya.</p>
      </div>
      <div class="hero-score">
        <span>Rata-rata Anda</span>
        <strong>{{ formatAverage(stats.average_rating) }}</strong>
        <small>{{ stats.rated_tickets || 0 }} tiket sudah dinilai</small>
      </div>
    </section>

    <div v-if="stats.needs_attention" class="warning-banner">
      <div class="warning-banner__icon">
        <i class="bx bx-error-circle"></i>
      </div>
      <div class="warning-banner__copy">
        <strong>Peringatan rating vendor rendah</strong>
        <p>{{ stats.warning_message || 'Ada rating rendah yang perlu segera Anda tindak lanjuti.' }}</p>
      </div>
      <span class="warning-banner__meta">{{ stats.low_rating_count || 0 }} rating rendah</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Tiket Selesai</span>
        <strong class="stat-value">{{ stats.completed_tickets || 0 }}</strong>
      </div>
      <div class="stat-card stat-card--good">
        <span class="stat-label">Sudah Dinilai</span>
        <strong class="stat-value">{{ stats.rated_tickets || 0 }}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">Menunggu Rating</span>
        <strong class="stat-value">{{ stats.pending_ratings || 0 }}</strong>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-label">Rating Rendah</span>
        <strong class="stat-value">{{ stats.low_rating_count || 0 }}</strong>
      </div>
    </div>

    <div class="panel-card panel-card--filters">
      <div class="panel-head">
        <div>
          <h5>Atur Tampilan Rating</h5>
          <p>Filter status rating, atur urutan tiket, dan cari client atau tiket tertentu.</p>
        </div>
        <button class="btn-ghost" type="button" @click="resetFilters">
          Reset Filter
        </button>
      </div>

      <div class="filter-grid">
        <div class="form-group">
          <label>Status Rating</label>
          <select v-model="filters.feedback_status" class="form-control" @change="fetchRatings(1)">
            <option value="">Semua</option>
            <option value="rated">Sudah Dinilai</option>
            <option value="pending">Belum Dinilai</option>
          </select>
        </div>

        <div class="form-group">
          <label>Urutkan</label>
          <select v-model="filters.sort" class="form-control" @change="fetchRatings(1)">
            <option value="latest">Tiket Terbaru</option>
            <option value="lowest_rating">Rating Terendah</option>
            <option value="pending_first">Belum Dinilai Dulu</option>
            <option value="oldest">Tiket Terlama</option>
          </select>
        </div>

        <div class="form-group form-group--wide">
          <label>Pencarian</label>
          <input
            v-model="filters.search"
            type="text"
            class="form-control"
            placeholder="Cari tiket atau nama client..."
            @input="handleSearch"
          >
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-head">
        <div>
          <h5>Daftar Hasil Rating</h5>
          <p>Tiket dengan rating 1-2 bintang akan diberi penanda agar vendor bisa segera mengevaluasi penanganannya.</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Memuat data rating client...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="empty-state">
        <i class="bx bx-star"></i>
        <p>Belum ada tiket yang cocok dengan filter saat ini.</p>
      </div>

      <div v-else class="ticket-rating-list">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          :class="['ticket-rating-item', { 'ticket-rating-item--alert': ticket.feedback?.is_low_rating }]"
        >
          <div class="ticket-rating-top">
            <div class="ticket-rating-copy">
              <div class="ticket-number">{{ ticket.ticket_number }}</div>
              <h6>{{ ticket.title }}</h6>
              <p>{{ ticket.client?.name || '-' }} | {{ formatTicketFinish(ticket) }}</p>
            </div>

            <div class="ticket-rating-status">
              <span :class="['rating-status-badge', ticket.feedback_status]">
                {{ ticket.feedback_status === 'rated' ? 'Sudah Dinilai' : 'Belum Dinilai' }}
              </span>
              <span
                v-if="ticket.feedback?.is_low_rating"
                class="rating-status-badge rating-status-badge--alert"
              >
                Rating rendah
              </span>
            </div>
          </div>

          <div class="ticket-rating-meta">
            <span class="meta-pill">{{ formatStatus(ticket.status) }}</span>
            <span class="meta-pill">{{ ticket.category?.name || 'Tanpa kategori' }}</span>
            <span class="meta-pill">{{ formatPriority(ticket.priority) }}</span>
          </div>

          <div v-if="ticket.feedback" class="rating-result">
            <div class="rating-result-head">
              <div class="stars">
                <i
                  v-for="star in 5"
                  :key="`${ticket.id}-${star}`"
                  class="bx bxs-star"
                  :class="{ active: star <= ticket.feedback.rating }"
                ></i>
              </div>
              <strong>{{ ticket.feedback.rating }}/5</strong>
            </div>
            <p class="rating-comment">{{ ticket.feedback.comment || 'Client tidak menambahkan komentar.' }}</p>
          </div>

          <div v-else class="rating-pending-box">
            Client belum memberikan rating untuk tiket ini.
          </div>
        </div>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-wrap">
        <button class="btn-page" :disabled="pagination.current_page === 1" @click="fetchRatings(pagination.current_page - 1)">
          Sebelumnya
        </button>
        <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
        <button class="btn-page" :disabled="pagination.current_page === pagination.last_page" @click="fetchRatings(pagination.current_page + 1)">
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/services/api'
import { formatPriority } from '@/utils/helpers'

const loading = ref(false)
const tickets = ref([])
const stats = ref({})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const filters = ref({
  feedback_status: '',
  sort: 'latest',
  search: '',
})

let searchTimer = null

const formatAverage = (value) => {
  const numeric = Number(value || 0)
  return numeric > 0 ? `${numeric.toFixed(2)} / 5` : '0.00 / 5'
}

const formatStatus = (status) => ({
  resolved: 'Selesai',
  closed: 'Ditutup',
}[status] || status || '-')

const formatTicketFinish = (ticket) => {
  const date = ticket.closed_at || ticket.resolved_at
  if (!date) return 'Tanggal selesai belum tersedia'

  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchRatings = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      feedback_status: filters.value.feedback_status || undefined,
      sort: filters.value.sort || undefined,
      search: filters.value.search?.trim() || undefined,
      per_page: pagination.value.per_page,
    }

    const { data } = await api.get('/vendor/ratings', { params })
    tickets.value = data.data || []
    stats.value = data.stats || {}
    pagination.value = data.pagination || pagination.value
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Rating',
      text: error.response?.data?.message || 'Data rating client tidak berhasil dimuat.',
      confirmButtonColor: '#0f766e',
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchRatings(1), 350)
}

const resetFilters = () => {
  filters.value = {
    feedback_status: '',
    sort: 'latest',
    search: '',
  }
  fetchRatings(1)
}

onMounted(() => {
  fetchRatings()
})
</script>

<style scoped>
.vendor-ratings-page {
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: rgba(15, 118, 110, 0.14);
  --card-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  --warning-soft: #fff7ed;
  --warning-text: #c2410c;
  --danger-soft: #fff1f2;
  --danger-text: #be123c;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-card,
.stat-card,
.panel-card,
.warning-banner {
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
}

.hero-card {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background:
    radial-gradient(circle at right top, rgba(45, 212, 191, 0.22), transparent 28%),
    linear-gradient(135deg, #effcf7 0%, #ffffff 58%, #f1fdfa 100%);
}

.hero-kicker {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(13, 148, 136, 0.1);
  color: #0f766e;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.page-title {
  margin: 0.85rem 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 700px;
  color: var(--text-muted);
  line-height: 1.7;
}

.hero-score {
  min-width: 220px;
  padding: 1rem 1.15rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 118, 110, 0.12);
}

.hero-score span,
.hero-score small,
.stat-label {
  display: block;
  color: var(--text-muted);
}

.hero-score strong,
.stat-value {
  display: block;
  margin-top: 0.35rem;
  color: var(--text-main);
}

.hero-score strong {
  font-size: 1.9rem;
}

.hero-score small {
  margin-top: 0.35rem;
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: linear-gradient(135deg, #fff7ed 0%, #fffaf2 100%);
  border-color: rgba(194, 65, 12, 0.18);
}

.warning-banner__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(194, 65, 12, 0.12);
  color: var(--warning-text);
  font-size: 1.4rem;
}

.warning-banner__copy strong {
  color: var(--warning-text);
}

.warning-banner__copy p {
  margin: 0.2rem 0 0;
  color: #9a3412;
}

.warning-banner__meta {
  margin-left: auto;
  white-space: nowrap;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(194, 65, 12, 0.12);
  color: var(--warning-text);
  font-size: 0.78rem;
  font-weight: 800;
}

.stats-grid,
.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card,
.panel-card {
  padding: 1.2rem;
  background: #ffffff;
}

.stat-card--good {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.stat-card--warning {
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
}

.panel-card--filters {
  background:
    radial-gradient(circle at bottom left, rgba(45, 212, 191, 0.12), transparent 25%),
    #ffffff;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-head h5 {
  margin: 0;
  color: var(--text-main);
}

.panel-head p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  line-height: 1.6;
}

.btn-ghost,
.btn-page {
  border: none;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-ghost {
  background: #ecfeff;
  color: #0f766e;
}

.btn-page {
  background: #ecfeff;
  color: #0f766e;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group--wide {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.form-control {
  width: 100%;
  min-height: 52px;
  border: 1px solid #99f6e4;
  border-radius: 16px;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.94);
  color: var(--text-main);
}

.form-control:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.14);
}

.ticket-rating-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-rating-item {
  border: 1px solid #d9f5f1;
  border-radius: 22px;
  padding: 1rem;
  background: linear-gradient(135deg, #fbfffe 0%, #ffffff 100%);
}

.ticket-rating-item--alert {
  border-color: rgba(225, 29, 72, 0.18);
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
}

.ticket-rating-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.ticket-number {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f766e;
}

.ticket-rating-top h6 {
  margin: 0.25rem 0 0;
  font-size: 1.05rem;
  color: var(--text-main);
}

.ticket-rating-top p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.86rem;
}

.ticket-rating-status,
.ticket-rating-meta {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.ticket-rating-meta {
  margin-top: 0.95rem;
}

.meta-pill,
.rating-status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.76rem;
  font-weight: 800;
}

.meta-pill {
  background: #ecfeff;
  color: #0f766e;
}

.rating-status-badge.rated {
  background: #dcfce7;
  color: #166534;
}

.rating-status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.rating-status-badge--alert {
  background: var(--danger-soft);
  color: var(--danger-text);
}

.rating-result,
.rating-pending-box {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2f3ef;
}

.rating-result-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.rating-result-head strong {
  color: #0f766e;
}

.stars {
  display: inline-flex;
  gap: 0.15rem;
  color: #d1d5db;
  font-size: 1rem;
}

.stars .active {
  color: #f59e0b;
}

.rating-comment {
  margin: 0.75rem 0 0;
  color: #334155;
  line-height: 1.7;
}

.rating-pending-box {
  color: var(--text-muted);
}

.loading-state,
.empty-state,
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loading-state,
.empty-state {
  min-height: 240px;
  flex-direction: column;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 2rem;
}

.pagination-wrap {
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 1100px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-card,
  .warning-banner,
  .panel-head,
  .ticket-rating-top,
  .rating-result-head {
    flex-direction: column;
  }

  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .form-group--wide {
    grid-column: span 1;
  }

  .warning-banner__meta {
    margin-left: 0;
  }
}
</style>
