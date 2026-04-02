<!-- src/views/client/ClientHistory.vue -->
<template>
  <div class="history-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Riwayat Laporan</h1>
        <p class="page-subtitle">Lihat laporan yang sudah selesai, yang sudah diberi rating, dan pelayanan yang masih menunggu penilaian Anda.</p>
      </div>
      <div class="header-actions">
        <router-link to="/client/create-ticket" class="btn-action">
          <i class="bx bx-plus-circle"></i>
          Buat Laporan
        </router-link>
      </div>
    </div>

    <div v-if="pendingFeedbackItems.length" class="feedback-highlight">
      <div class="feedback-highlight-header">
        <div>
          <span class="highlight-chip">Butuh Penilaian</span>
          <h2>{{ pendingFeedbackItems.length }} pelayanan selesai belum Anda nilai</h2>
        </div>
      </div>

      <div class="feedback-highlight-list">
        <button
          v-for="item in pendingFeedbackItems.slice(0, 3)"
          :key="`highlight-${item.id}`"
          type="button"
          class="feedback-highlight-item"
          @click="openFeedbackModal(item)"
        >
          <strong>#{{ item.ticket_number }}</strong>
          <span>{{ item.title }}</span>
        </button>
      </div>
    </div>

    <!-- Filter & Tab Section -->
    <div class="filter-section">
      <!-- Filters -->
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="filters.status" @change="applyFilters" class="filter-select">
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div class="filter-group flex-grow">
          <label class="filter-label">Search</label>
          <div class="search-box">
            <i class="bx bx-search"></i>
            <input 
              v-model="filters.search" 
              @input="debounceSearch"
              type="text" 
              placeholder="Cari judul, nomor, atau deskripsi laporan..."
              class="search-input"
            >
            <button v-if="filters.search" @click="clearSearch" class="clear-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset">
        <i class="bx bx-refresh"></i>
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="loading-text">Memuat riwayat laporan...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayItems.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="bx bx-inbox"></i>
      </div>
      <h3 class="empty-title">Riwayat laporan belum tersedia</h3>
      <p class="empty-text">
        {{ filters.search || filters.status ? 'Coba ubah filter pencarian Anda.' : 'Buat laporan pertama untuk mulai meminta bantuan.' }}
      </p>
      <div v-if="!filters.search && !filters.status" class="empty-actions">
          <router-link to="/client/create-ticket" class="btn-primary">
            <i class="bx bx-plus-circle"></i>
          Buat Laporan
          </router-link>
      </div>
    </div>

    <!-- Items List -->
    <div v-else class="items-list">
      <div 
        v-for="item in displayItems" 
        :key="item.id"
        class="item-card"
        @click="viewItem(item)"
      >
        <div class="item-content">
          <div class="item-header">
            <div class="item-number">#{{ item.ticket_number }}</div>
            <TicketStatusBadge :status="item.status" />
          </div>

          <h3 class="item-title">{{ item.title }}</h3>
          <p class="item-description">{{ truncate(item.description, 150) }}</p>

          <div class="item-meta">
            <div class="meta-item">
              <i class="bx bx-category"></i>
              <span>{{ item.category?.name || 'N/A' }}</span>
            </div>
            <div v-if="item.priority" class="meta-item">
              <i class="bx bx-flag"></i>
              <span :class="`priority-${item.priority}`">{{ item.priority }}</span>
            </div>
            <div class="meta-item">
              <i class="bx bx-time"></i>
              <span>{{ timeAgo(item.created_at) }}</span>
            </div>
          </div>

          <div v-if="item.assigned_to" class="item-assignee">
            <div class="assignee-avatar">
              {{ getInitials(item.assigned_to.name) }}
            </div>
            <span class="assignee-text">Ditangani <strong>{{ item.assigned_to.name }}</strong></span>
          </div>

          <!-- Feedback Badge for Resolved/Closed Tickets -->
          <div v-if="['resolved', 'closed'].includes(item.status)" class="item-footer">
            <div v-if="item.feedback" class="feedback-badge">
              <i class="bx bx-star"></i>
              Sudah dinilai {{ item.feedback.rating }}/5
            </div>
            <button v-else @click.stop="openFeedbackModal(item)" class="btn-feedback">
              <i class="bx bx-comment"></i>
              Beri Rating
            </button>
          </div>
        </div>

        <div class="item-arrow">
          <i class="bx bx-chevron-right"></i>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav v-if="pagination.last_page > 1" class="pagination-container">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
          <button class="page-link" @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1">
            <i class="bx bx-chevron-left"></i>
            Previous
          </button>
        </li>
        
        <li 
          v-for="page in visiblePages" 
          :key="page"
          class="page-item" 
          :class="{ active: page === pagination.current_page, dots: page === '...' }"
        >
          <button v-if="page !== '...'" class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
          <span v-else class="page-dots">...</span>
        </li>
        
        <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
          <button class="page-link" @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page">
            Next
            <i class="bx bx-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Feedback Modal -->
    <FeedbackModal 
      v-if="showFeedbackModal"
      :ticket="selectedTicket"
      @close="showFeedbackModal = false"
      @submitted="onFeedbackSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import FeedbackModal from '@/components/client/FeedbackModal.vue'
import { timeAgo, getInitials, truncate } from '@/utils/helpers'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)
const allTickets = ref([])
const showFeedbackModal = ref(false)
const selectedTicket = ref(null)

const filters = ref({
  status: '',
  search: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
})

let searchTimeout = null

onMounted(() => {
  fetchAllData()
})

const fetchAllData = async () => {
  loading.value = true
  try {
    // Fetch Tickets
    const ticketsResponse = await api.get('/tickets', {
      params: { per_page: 1000 }
    })
    
    if (ticketsResponse.data.data) {
      allTickets.value = ticketsResponse.data.data
    } else if (Array.isArray(ticketsResponse.data)) {
      allTickets.value = ticketsResponse.data
    }

  } catch (error) {
    console.error('Error fetching tickets:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load ticket history',
      confirmButtonColor: '#667eea'
    })
  } finally {
    loading.value = false
  }
}

const filteredItems = computed(() => {
  let items = [...allTickets.value]
  
  // Apply status filter
  if (filters.value.status) {
    items = items.filter(item => item.status === filters.value.status)
  }
  
  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    items = items.filter(item => {
      return (
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.ticket_number?.toLowerCase().includes(search)
      )
    })
  }
  
  // Sort by created_at descending
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  return items
})

const pendingFeedbackItems = computed(() => {
  return filteredItems.value.filter(item => ['resolved', 'closed'].includes(item.status) && !item.feedback)
})

const displayItems = computed(() => {
  const start = (pagination.value.current_page - 1) * pagination.value.per_page
  const end = start + pagination.value.per_page
  
  // Update pagination
  pagination.value.total = filteredItems.value.length
  pagination.value.last_page = Math.ceil(filteredItems.value.length / pagination.value.per_page)
  
  return filteredItems.value.slice(start, end)
})

const visiblePages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const range = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i)
  }
  
  if (current - delta > 2) range.unshift('...')
  if (current + delta < last - 1) range.push('...')
  
  range.unshift(1)
  if (last !== 1) range.push(last)
  
  return range
})

const applyFilters = () => {
  pagination.value.current_page = 1
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const clearSearch = () => {
  filters.value.search = ''
  applyFilters()
}

const resetFilters = () => {
  filters.value = {
    status: '',
    search: ''
  }
  applyFilters()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page && page !== '...') {
    pagination.value.current_page = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const viewItem = (item) => {
  router.push(`/tickets/${item.id}`)
}

const openFeedbackModal = (ticket) => {
  selectedTicket.value = ticket
  showFeedbackModal.value = true
}

const onFeedbackSubmitted = () => {
  showFeedbackModal.value = false
  fetchAllData()
}
</script>

<style scoped>
.history-page {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.75rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
}

.page-title {
  font-size: clamp(1.85rem, 3vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.55rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  max-width: 760px;
  line-height: 1.7;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 16px 28px rgba(102, 126, 234, 0.22);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Filter Section */
.feedback-highlight,
.filter-section {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
}

.feedback-highlight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.highlight-chip {
  display: inline-flex;
  padding: 0.38rem 0.8rem;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.14);
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feedback-highlight-header h2 {
  margin: 0.7rem 0 0;
  font-size: 1.15rem;
  color: #1f2937;
}

.feedback-highlight-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feedback-highlight-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: linear-gradient(135deg, #fffaf0, #ffffff);
  text-align: left;
}

.feedback-highlight-item strong {
  color: #b7791f;
}

.feedback-highlight-item span {
  color: #334155;
}

/* Filters Row */
.filters-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group.flex-grow {
  flex: 1;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #495057;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border: none;
  border-radius: 6px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dee2e6;
  color: #495057;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

/* Loading State */
.loading-container {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
}

.loading-text {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
}

.empty-icon {
  font-size: 5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  gap: 1.5rem;
  position: relative;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.08);
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #667eea;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.item-description {
  font-size: 0.9375rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.item-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.meta-item i {
  font-size: 1rem;
}

.meta-item .priority-low { color: #28a745; }
.meta-item .priority-medium { color: #ffc107; }
.meta-item .priority-high { color: #dc3545; }
.meta-item .priority-urgent { color: #721c24; font-weight: 600; }

.item-assignee {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.assignee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.assignee-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.assignee-text strong {
  color: #495057;
}

.item-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.feedback-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 10px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-feedback:hover {
  background: #667eea;
  color: white;
}

.item-arrow {
  display: flex;
  align-items: center;
  color: #dee2e6;
  font-size: 1.5rem;
  transition: all 0.3s;
}

.item-card:hover .item-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* Pagination */
.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.page-item {
  display: flex;
}

.page-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  color: #495057;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.page-link:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.page-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-dots {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .feedback-highlight-list {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action {
    justify-content: center;
    width: 100%;
  }

  .filters-row {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .item-card {
    flex-direction: column;
  }

  .item-arrow {
    display: none;
  }
}
</style>
