<template>
  <div class="container-xxl flex-grow-1 container-p-y vendor-ratings-page">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="hero-kicker">Monitoring kualitas vendor</span>
        <h4 class="page-title">Kelola Rating Vendor</h4>
        <p class="page-subtitle">Pantau vendor dengan rating rendah, cari feedback bermasalah lebih cepat, dan tindak lanjuti tiket yang butuh perhatian.</p>
      </div>
      <div class="hero-badges">
        <div class="hero-badge hero-badge--alert">
          <span>Vendor perlu perhatian</span>
          <strong>{{ summary.low_rating_vendors || 0 }}</strong>
        </div>
        <div class="hero-badge">
          <span>Rata-rata platform</span>
          <strong>{{ formatAverage(summary.average_rating) }}</strong>
        </div>
      </div>
    </section>

    <div class="stats-grid">
      <div class="stat-card stat-card--accent">
        <span class="stat-label">Total Rating</span>
        <strong class="stat-value">{{ summary.total_feedbacks || 0 }}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">Tiket Selesai</span>
        <strong class="stat-value">{{ summary.completed_tickets || 0 }}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">Belum Dinilai</span>
        <strong class="stat-value">{{ summary.pending_ratings || 0 }}</strong>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-label">Vendor Rating Rendah</span>
        <strong class="stat-value">{{ summary.low_rating_vendors || 0 }}</strong>
      </div>
    </div>

    <div class="content-grid">
      <div class="panel-card panel-card--filters">
        <div class="panel-head">
          <div>
            <h5>Kontrol Rating</h5>
            <p>Filter vendor, level perhatian, dan urutan tampilan untuk menemukan rating penting lebih cepat.</p>
          </div>
          <button class="btn-ghost" type="button" @click="resetFilters">
            Reset Filter
          </button>
        </div>

        <div class="filter-grid">
          <div class="form-group">
            <label>Vendor</label>
            <select v-model="filters.vendor_id" class="form-control" @change="fetchRatings(1)">
              <option value="">Semua Vendor</option>
              <option v-for="vendor in vendorOptions" :key="vendor.id" :value="vendor.id">
                {{ vendor.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Status Perhatian</label>
            <select v-model="filters.attention" class="form-control" @change="fetchRatings(1)">
              <option value="">Semua Kondisi</option>
              <option value="needs_attention">Perlu Perhatian</option>
              <option value="stable">Stabil</option>
              <option value="excellent">Sangat Baik</option>
            </select>
          </div>

          <div class="form-group">
            <label>Urutkan</label>
            <select v-model="filters.sort" class="form-control" @change="fetchRatings(1)">
              <option value="latest">Rating Terbaru</option>
              <option value="lowest_rating">Rating Terendah</option>
              <option value="highest_rating">Rating Tertinggi</option>
              <option value="oldest">Rating Terlama</option>
            </select>
          </div>

          <div class="form-group form-group--wide">
            <label>Pencarian</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="Cari tiket, vendor, client, atau komentar..."
              @input="handleSearch"
            >
          </div>
        </div>
      </div>

      <div class="panel-card panel-card--summary">
        <div class="panel-head">
          <div>
            <h5>Peringatan Vendor</h5>
            <p>Vendor dengan rating rata-rata rendah atau menerima feedback 1-2 bintang akan ditandai otomatis.</p>
          </div>
        </div>

        <div v-if="vendorStats.length === 0" class="empty-state empty-state--compact">
          <i class="bx bx-group"></i>
          <p>Belum ada data vendor untuk rating.</p>
        </div>

        <div v-else class="vendor-summary-list">
          <div
            v-for="vendor in vendorStats"
            :key="vendor.id"
            :class="['vendor-summary-item', { 'vendor-summary-item--alert': vendor.needs_attention }]"
          >
            <div class="vendor-summary-main">
              <div class="vendor-summary-header">
                <div>
                  <h6>{{ vendor.name }}</h6>
                  <p>{{ vendor.company_name || vendor.email }}</p>
                </div>
                <span :class="['attention-badge', vendor.needs_attention ? 'attention-badge--alert' : 'attention-badge--good']">
                  {{ vendor.needs_attention ? 'Perlu perhatian' : 'Sehat' }}
                </span>
              </div>

              <div class="vendor-summary-metrics">
                <span>{{ vendor.completed_tickets }} selesai</span>
                <span>{{ vendor.rated_tickets }} dinilai</span>
                <span>{{ vendor.pending_ratings }} pending</span>
                <span>{{ vendor.low_rating_count || 0 }} rating rendah</span>
              </div>
            </div>

            <div class="vendor-summary-score">
              <strong>{{ formatAverage(vendor.average_rating) }}</strong>
              <small>{{ vendor.needs_attention ? 'Butuh tindak lanjut admin' : 'Performa masih aman' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-head">
        <div>
          <h5>Daftar Rating Masuk</h5>
          <p>Feedback dengan rating rendah diberi penanda khusus agar admin bisa melakukan follow up lebih cepat.</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Memuat data rating vendor...</p>
      </div>

      <div v-else-if="ratings.length === 0" class="empty-state">
        <i class="bx bx-star"></i>
        <p>Belum ada rating yang cocok dengan filter saat ini.</p>
      </div>

      <div v-else class="ratings-list">
        <div
          v-for="item in ratings"
          :key="item.id"
          :class="['rating-item', { 'rating-item--alert': item.is_low_rating }]"
        >
          <div class="rating-top">
            <div class="rating-top-copy">
              <div class="ticket-line">{{ item.ticket?.ticket_number }} | {{ item.ticket?.title }}</div>
              <div class="meta-line">
                <span>Vendor: {{ item.vendor?.name || '-' }}</span>
                <span>Client: {{ item.client?.name || '-' }}</span>
                <span>{{ formatDate(item.created_at) }}</span>
              </div>
            </div>

            <div class="rating-actions">
              <span v-if="item.is_low_rating" class="attention-badge attention-badge--alert">
                Rating rendah
              </span>
              <div class="stars">
                <i
                  v-for="star in 5"
                  :key="`${item.id}-${star}`"
                  class="bx bxs-star"
                  :class="{ active: star <= item.rating }"
                ></i>
              </div>
              <button class="btn-delete-rating" @click="deleteRating(item)">
                <i class="bx bx-trash"></i>
                Hapus
              </button>
            </div>
          </div>

          <p class="comment-box">
            {{ item.comment || 'Client tidak menambahkan komentar.' }}
          </p>
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
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/services/api'
import { formatDate } from '@/utils/helpers'

const loading = ref(false)
const ratings = ref([])
const vendorStats = ref([])
const summary = ref({})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const filters = ref({
  vendor_id: '',
  attention: '',
  sort: 'latest',
  search: '',
})

let searchTimer = null

const vendorOptions = computed(() => vendorStats.value.map((vendor) => ({
  id: vendor.id,
  name: vendor.name,
})))

const formatAverage = (value) => {
  const numeric = Number(value || 0)
  return numeric > 0 ? `${numeric.toFixed(2)} / 5` : '0.00 / 5'
}

const fetchRatings = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      vendor_id: filters.value.vendor_id || undefined,
      attention: filters.value.attention || undefined,
      sort: filters.value.sort || undefined,
      search: filters.value.search?.trim() || undefined,
      per_page: pagination.value.per_page,
    }

    const { data } = await api.get('/admin/vendor-ratings', { params })
    ratings.value = data.data || []
    vendorStats.value = data.vendor_stats || []
    summary.value = data.summary || {}
    pagination.value = data.pagination || pagination.value
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Rating',
      text: error.response?.data?.message || 'Data rating vendor tidak berhasil dimuat.',
      confirmButtonColor: '#d97706',
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
    vendor_id: '',
    attention: '',
    sort: 'latest',
    search: '',
  }
  fetchRatings(1)
}

const deleteRating = async (item) => {
  const confirmation = await Swal.fire({
    icon: 'warning',
    title: 'Hapus rating ini?',
    text: `Feedback untuk ${item.vendor?.name || 'vendor'} akan dihapus.`,
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  })

  if (!confirmation.isConfirmed) return

  try {
    await api.delete(`/admin/vendor-ratings/${item.id}`)
    await fetchRatings(pagination.value.current_page)
    Swal.fire({
      icon: 'success',
      title: 'Rating Dihapus',
      text: 'Feedback vendor berhasil dihapus.',
      confirmButtonColor: '#d97706',
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus Rating',
      text: error.response?.data?.message || 'Feedback vendor tidak berhasil dihapus.',
      confirmButtonColor: '#d97706',
    })
  }
}

onMounted(() => {
  fetchRatings()
})
</script>

<style scoped>
.vendor-ratings-page {
  --bg-soft: linear-gradient(180deg, #fffdf7 0%, #fff 100%);
  --border-color: rgba(217, 119, 6, 0.14);
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --accent: #c2410c;
  --danger-soft: #fff1f2;
  --danger-text: #be123c;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-card,
.stat-card,
.panel-card {
  background: var(--bg-soft);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(148, 64, 0, 0.08);
}

.hero-card {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.18), transparent 28%),
    linear-gradient(135deg, #fff8ef 0%, #ffffff 55%, #fff3e0 100%);
}

.hero-kicker {
  display: inline-flex;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(194, 65, 12, 0.08);
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.page-title {
  margin: 0.9rem 0 0;
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

.hero-badges {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 0.85rem;
  width: min(100%, 420px);
}

.hero-badge {
  border-radius: 18px;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(217, 119, 6, 0.12);
}

.hero-badge--alert {
  background: linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%);
  border-color: rgba(225, 29, 72, 0.16);
}

.hero-badge span,
.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.hero-badge strong,
.stat-value {
  display: block;
  margin-top: 0.4rem;
  font-size: 1.8rem;
  color: var(--text-main);
}

.stats-grid,
.content-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.content-grid {
  grid-template-columns: 1.3fr 1fr;
}

.stat-card {
  padding: 1.15rem 1.2rem;
}

.stat-card--accent {
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
}

.stat-card--warning {
  background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%);
}

.panel-card {
  padding: 1.25rem;
}

.panel-card--filters {
  background:
    radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.14), transparent 30%),
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
  font-size: 1.08rem;
  color: var(--text-main);
}

.panel-head p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.btn-ghost,
.btn-delete-rating,
.btn-page {
  border: none;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-ghost {
  background: #fff7ed;
  color: #9a3412;
}

.btn-delete-rating {
  background: #ffe4e6;
  color: var(--danger-text);
}

.btn-page {
  background: #fff1e6;
  color: #9a3412;
}

.btn-ghost:hover,
.btn-delete-rating:hover,
.btn-page:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(148, 64, 0, 0.08);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group--wide {
  grid-column: span 4;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
}

.form-control {
  width: 100%;
  min-height: 52px;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  padding: 0.85rem 1rem;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.92);
}

.form-control:focus {
  outline: none;
  border-color: #fb923c;
  box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.12);
}

.vendor-summary-list,
.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.vendor-summary-item,
.rating-item {
  border: 1px solid #f3e8d8;
  border-radius: 20px;
  padding: 1rem;
  background: #fffdfa;
}

.vendor-summary-item--alert,
.rating-item--alert {
  border-color: rgba(225, 29, 72, 0.2);
  background: linear-gradient(135deg, #fff8f8 0%, #fffdf8 100%);
}

.vendor-summary-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.vendor-summary-header {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
}

.vendor-summary-item h6,
.ticket-line {
  margin: 0;
  color: var(--text-main);
  font-weight: 800;
}

.vendor-summary-item p,
.meta-line,
.vendor-summary-score small {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.vendor-summary-metrics,
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.85rem;
  color: #4b5563;
  font-size: 0.83rem;
}

.vendor-summary-score {
  min-width: 160px;
  text-align: right;
}

.vendor-summary-score strong {
  display: block;
  font-size: 1.15rem;
  color: var(--accent);
}

.rating-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.rating-top-copy {
  min-width: 0;
}

.rating-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.attention-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.74rem;
  font-weight: 800;
}

.attention-badge--alert {
  background: var(--danger-soft);
  color: var(--danger-text);
}

.attention-badge--good {
  background: #ecfdf3;
  color: #15803d;
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

.comment-box {
  margin: 0.95rem 0 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #f3e8d8;
  border-radius: 16px;
  color: #374151;
  line-height: 1.7;
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

.empty-state--compact {
  min-height: 180px;
}

.empty-state i {
  font-size: 2rem;
}

.pagination-wrap {
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .stats-grid,
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-group--wide {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .hero-card,
  .vendor-summary-item,
  .vendor-summary-header,
  .rating-top,
  .panel-head {
    flex-direction: column;
  }

  .hero-badges,
  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .form-group--wide {
    grid-column: span 1;
  }

  .vendor-summary-score {
    min-width: auto;
    text-align: left;
  }

  .rating-actions {
    justify-content: flex-start;
  }
}
</style>
