<template>
  <div class="my-tickets-page">
    <!-- Page Header -->
    <div class="page-header-section">
      <div class="page-header-content">
        <h1 class="page-title">Laporan Saya</h1>
        <p class="page-subtitle">Pantau semua laporan aktif, vendor yang menangani, dan pelayanan yang belum Anda nilai.</p>
      </div>
      <router-link to="/client/create-ticket" class="btn-create-ticket">
        <i class="bx bx-plus-circle"></i>
        <span>Buat Laporan</span>
      </router-link>
    </div>

    <div v-if="pendingFeedbackTickets.length" class="pending-feedback-panel">
      <div class="pending-feedback-header">
        <div>
          <span class="panel-chip">Pelayanan Belum Dinilai</span>
          <h2 class="pending-feedback-title">{{ pendingFeedbackTickets.length }} laporan selesai menunggu rating</h2>
        </div>
        <router-link to="/client/history" class="pending-feedback-link">
          Buka riwayat
          <i class="bx bx-right-arrow-alt"></i>
        </router-link>
      </div>

      <div class="pending-feedback-list">
        <button
          v-for="ticket in pendingFeedbackTickets.slice(0, 3)"
          :key="`pending-${ticket.id}`"
          type="button"
          class="pending-feedback-item"
          @click="viewTicket(ticket)"
        >
          <div>
            <strong>#{{ ticket.ticket_number }}</strong>
            <p>{{ ticket.title }}</p>
          </div>
          <span class="pending-feedback-badge">Beri Rating</span>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">
            <i class="bx bx-filter"></i>
            Status
          </label>
          <select class="filter-select" v-model="filters.status" @change="fetchTickets">
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="waiting_response">Menunggu Respons</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div class="filter-group filter-group-search">
          <label class="filter-label">
            <i class="bx bx-search"></i>
            Search
          </label>
          <input 
            type="text" 
            class="filter-search" 
            placeholder="Cari nomor tiket, judul, atau vendor..."
            v-model="filters.search"
            @input="debounceSearch"
          />
        </div>
      </div>
    </div>

    <!-- Tickets Grid -->
    <div v-if="ticketStore.loading" class="loading-section">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="loading-text">Loading your tickets...</p>
    </div>

    <div v-else-if="ticketStore.tickets.length === 0" class="empty-section">
      <div class="empty-illustration">
        <i class="bx bx-search-alt"></i>
      </div>
      <h3 class="empty-title">Tidak ada laporan ditemukan</h3>
      <p class="empty-text">
        {{ filters.status || filters.search ? 'Coba ubah filter pencarian Anda.' : 'Buat laporan pertama untuk mulai meminta bantuan.' }}
      </p>
      <router-link v-if="!filters.status && !filters.search" to="/client/create-ticket" class="btn-create-primary">
        <i class="bx bx-plus-circle"></i>
        Buat Laporan
      </router-link>
    </div>

    <div v-else>
      <div class="tickets-grid-layout">
        <div 
          v-for="ticket in ticketStore.tickets" 
          :key="ticket.id"
          class="ticket-item-card"
          @click="viewTicket(ticket)"
        >
          <div class="ticket-item-header">
            <div class="ticket-number-badge">#{{ ticket.ticket_number }}</div>
            <TicketStatusBadge :status="ticket.status" />
          </div>

          <h3 class="ticket-item-title">{{ ticket.title }}</h3>
          
          <div class="ticket-item-meta">
            <span class="meta-item">
              <i class="bx bx-category-alt"></i>
              {{ ticket.category?.name || 'N/A' }}
            </span>
            <span :class="`meta-item priority-${ticket.priority}`">
              <i class="bx bx-flag"></i>
              {{ ticket.priority }}
            </span>
          </div>

          <div class="ticket-item-footer">
            <div class="ticket-date">
              <i class="bx bx-time"></i>
              {{ formatDate(ticket.created_at) }}
            </div>
            <div v-if="ticket.assigned_to" class="ticket-assignee-mini">
              <div class="assignee-avatar-mini">
                {{ getInitials(ticket.assigned_to?.name) }}
              </div>
            </div>
          </div>

          <div v-if="isPendingFeedback(ticket)" class="ticket-rating-alert">
            <i class="bx bx-star"></i>
            <span>Vendor belum dinilai</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav v-if="ticketStore.pagination.last_page > 1" class="pagination-section">
        <button 
          class="pagination-btn" 
          :disabled="ticketStore.pagination.current_page === 1"
          @click="changePage(ticketStore.pagination.current_page - 1)"
        >
          <i class="bx bx-chevron-left"></i>
          Previous
        </button>

        <div class="pagination-pages">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="pagination-page"
            :class="{ active: page === ticketStore.pagination.current_page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="pagination-btn" 
          :disabled="ticketStore.pagination.current_page === ticketStore.pagination.last_page"
          @click="changePage(ticketStore.pagination.current_page + 1)"
        >
          Next
          <i class="bx bx-chevron-right"></i>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import { formatDate, getInitials } from '@/utils/helpers'

const router = useRouter()
const ticketStore = useTicketStore()

const filters = ref({
  status: '',
  search: ''
})

let searchTimeout = null

onMounted(() => {
  fetchTickets()
})

const fetchTickets = async () => {
  await ticketStore.fetchTickets(filters.value)
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTickets()
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= ticketStore.pagination.last_page) {
    ticketStore.fetchTickets({ ...filters.value, page })
  }
}

const visiblePages = computed(() => {
  const current = ticketStore.pagination.current_page
  const last = ticketStore.pagination.last_page
  const delta = 2
  const range = []
  
  for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
    range.push(i)
  }
  
  return range
})

const isPendingFeedback = (ticket) => {
  return ['resolved', 'closed'].includes(ticket.status) && !ticket.feedback
}

const pendingFeedbackTickets = computed(() => {
  return ticketStore.tickets.filter(isPendingFeedback)
})

const viewTicket = (ticket) => {
  router.push(`/tickets/${ticket.id}`)
}
</script>

<style scoped>
.my-tickets-page {
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
.page-header-section {
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

.page-header-content {
  flex: 1;
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
  max-width: 720px;
  line-height: 1.7;
}

.btn-create-ticket {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 16px 28px rgba(102, 126, 234, 0.22);
}

.btn-create-ticket:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-create-ticket i {
  font-size: 1.25rem;
}

.pending-feedback-panel,
.filters-card,
.empty-section,
.loading-section {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
}

.pending-feedback-panel {
  border-radius: 24px;
  padding: 1.35rem;
  margin-bottom: 1.25rem;
}

.pending-feedback-header,
.pending-feedback-list {
  display: flex;
  gap: 1rem;
}

.pending-feedback-header {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.panel-chip {
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

.pending-feedback-title {
  margin: 0.7rem 0 0;
  font-size: 1.15rem;
  color: #1f2937;
}

.pending-feedback-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #5b6ee1;
  text-decoration: none;
  font-weight: 700;
}

.pending-feedback-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pending-feedback-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: linear-gradient(135deg, #fffaf0, #ffffff);
  border: 1px solid rgba(245, 158, 11, 0.18);
  text-align: left;
}

.pending-feedback-item strong {
  display: block;
  color: #b7791f;
}

.pending-feedback-item p {
  margin: 0.25rem 0 0;
  color: #334155;
}

.pending-feedback-badge {
  padding: 0.42rem 0.72rem;
  border-radius: 999px;
  background: #fff1d6;
  color: #b7791f;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Filters */
.filters-card {
  border-radius: 24px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
}

.filter-label i {
  color: #667eea;
}

.filter-select,
.filter-search {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-search:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Tickets Grid */
.tickets-grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ticket-item-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 1.75rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.ticket-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.08);
}

.ticket-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ticket-number-badge {
  font-size: 0.875rem;
  font-weight: 700;
  color: #5b6ee1;
  background: rgba(91, 110, 225, 0.1);
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
}

.ticket-item-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-item-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.meta-item i {
  font-size: 1rem;
}

.priority-low { color: #28a745; }
.priority-medium { color: #ffc107; }
.priority-high { color: #fd7e14; }
.priority-critical { color: #dc3545; }

.ticket-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6c757d;
}

.ticket-assignee-mini {
  display: flex;
}

.ticket-rating-alert {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding: 0.46rem 0.8rem;
  border-radius: 999px;
  background: #fff1d6;
  color: #b7791f;
  font-size: 0.76rem;
  font-weight: 700;
}

.assignee-avatar-mini {
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
}

/* Empty State */
.empty-section {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  font-size: 6rem;
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

.btn-create-primary {
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

.btn-create-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Loading */
.loading-section {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-text {
  margin-top: 1rem;
  color: #6c757d;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.pagination-page {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: white;
  border: 2px solid #e9ecef;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover {
  border-color: #667eea;
  color: #667eea;
}

.pagination-page.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

/* Responsive */
@media (max-width: 1200px) {
  .tickets-grid-layout,
  .pending-feedback-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .pending-feedback-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .tickets-grid-layout,
  .pending-feedback-list {
    grid-template-columns: 1fr;
  }

  .btn-create-ticket {
    width: 100%;
    justify-content: center;
  }
}
</style>
