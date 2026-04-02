<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- Modern Header -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-icon history-icon">
          <i class="bx bx-history"></i>
        </div>
        <div class="header-text">
          <h4 class="mb-1">Ticket History</h4>
          <p class="text-muted mb-0">View your completed and closed tickets</p>
        </div>
      </div>
    </div>

    <!-- Modern Filters -->
    <div class="filter-card mb-4" data-aos="fade-up">
      <div class="filter-header history-header">
        <i class="bx bx-filter-alt"></i>
        <h6>Filter History</h6>
      </div>
      <div class="filter-body">
        <div class="filter-group">
          <label><i class="bx bx-calendar"></i> Start Date</label>
          <input 
            type="date" 
            class="modern-input" 
            v-model="filters.start_date"
          >
        </div>

        <div class="filter-group">
          <label><i class="bx bx-calendar-check"></i> End Date</label>
          <input 
            type="date" 
            class="modern-input" 
            v-model="filters.end_date"
          >
        </div>

        <div class="filter-group">
          <label><i class="bx bx-flag"></i> Priority</label>
          <select class="modern-select" v-model="filters.priority">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div class="filter-group">
          <label>&nbsp;</label>
          <button class="btn-apply" @click="applyFilters">
            <i class="bx bx-search-alt"></i>
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Tickets List -->
    <div class="tickets-card" data-aos="fade-up">
      <div class="tickets-header history-tickets-header">
        <div class="tickets-title">
          <i class="bx bx-check-double"></i>
          <h5>Closed & Resolved Tickets</h5>
        </div>
        <div class="tickets-badge history-badge">{{ totalTickets }} total</div>
      </div>

      <div class="tickets-body">
        <div v-if="loading" class="loading-state">
          <div class="loader history-loader"></div>
          <p>Loading history...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="bx bx-error-circle"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="tickets.length === 0" class="empty-state">
          <i class="bx bx-folder-open"></i>
          <h5>No history found</h5>
          <p>Completed tickets will appear here</p>
        </div>

        <div v-else class="history-list">
          <div v-for="ticket in tickets" :key="ticket.id" class="history-item">
            <div class="history-main">
              <div class="history-status-indicator">
                <div class="status-dot" :class="`status-${ticket.status}`"></div>
              </div>

              <div class="history-content">
                <div class="history-header-row">
                  <div class="history-info">
                    <div class="ticket-number">{{ ticket.ticket_number }}</div>
                    <div class="ticket-title">{{ truncate(ticket.title, 50) }}</div>
                  </div>
                  
                  <div class="history-badges">
                    <span :class="`priority-badge priority-${ticket.priority}`">
                      <i :class="`bx ${getPriorityIcon(ticket.priority)}`"></i>
                      {{ formatPriority(ticket.priority) }}
                    </span>
                    <span :class="`status-badge status-${ticket.status}`">
                      {{ formatStatus(ticket.status) }}
                    </span>
                  </div>
                </div>

                <div class="history-details-row">
                  <div class="detail-group">
                    <div class="detail-item">
                      <i class="bx bx-user"></i>
                      <span class="detail-label">Client:</span>
                      <span class="detail-value">{{ ticket.user?.name || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="bx bx-category"></i>
                      <span class="detail-label">Category:</span>
                      <span class="detail-value">{{ ticket.category?.name || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <div class="detail-item" v-if="ticket.resolved_at">
                      <i class="bx bx-calendar-check"></i>
                      <span class="detail-label">Resolved:</span>
                      <span class="detail-value">{{ formatDate(ticket.resolved_at) }}</span>
                      <span class="detail-time">({{ timeAgo(ticket.resolved_at) }})</span>
                    </div>
                    <div class="detail-item" v-if="ticket.sla_tracking?.actual_resolution_time">
                      <i class="bx bx-timer"></i>
                      <span class="detail-label">Resolution Time:</span>
                      <span class="detail-value">{{ ticket.sla_tracking.actual_resolution_time }} min</span>
                      <span :class="`sla-indicator ${ticket.sla_tracking.resolution_sla_met ? 'met' : 'missed'}`">
                        <i :class="`bx ${ticket.sla_tracking.resolution_sla_met ? 'bx-check-circle' : 'bx-x-circle'}`"></i>
                        {{ ticket.sla_tracking.resolution_sla_met ? 'SLA Met' : 'SLA Missed' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="history-action">
                <router-link :to="`/vendor/tickets/${ticket.id}`" class="btn-view-history">
                  <i class="bx bx-show"></i>
                  <span>View</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Pagination -->
      <div v-if="tickets.length > 0 && lastPage > 1" class="tickets-footer">
        <div class="pagination-info">
          <select class="per-page-select" v-model.number="perPage" @change="handlePerPageChange">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <span>
            Showing {{ ((currentPage - 1) * perPage) + 1 }}-{{ Math.min(currentPage * perPage, totalTickets) }} 
            of {{ totalTickets }}
          </span>
        </div>

        <div class="pagination-controls">
          <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
            <i class="bx bx-chevron-left"></i>
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage, dots: page === '...' }"
            @click="page !== '...' && changePage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>

          <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === lastPage">
            <i class="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import {
  formatDate,
  formatPriority,
  formatStatus,
  getPriorityColor,
  getStatusColor,
  timeAgo,
  truncate
} from '@/utils/helpers'

const tickets = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(15)
const totalTickets = ref(0)

const filters = ref({
  start_date: '',
  end_date: '',
  priority: ''
})

const visiblePages = computed(() => {
  const pages = []
  const total = lastPage.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const getPriorityIcon = (priority) => {
  const icons = {
    low: 'bx-down-arrow-alt',
    medium: 'bx-minus',
    high: 'bx-up-arrow-alt',
    critical: 'bx-error'
  }
  return icons[priority] || 'bx-minus'
}

const fetchHistory = async (page = 1) => {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      page,
      per_page: perPage.value,
      start_date: filters.value.start_date || undefined,
      end_date: filters.value.end_date || undefined,
      priority: filters.value.priority || undefined
    }
    
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })
    
    const { data } = await api.get('/vendor/history', { params })
    
    if (data.success !== false) {
      tickets.value = data.data || []
      currentPage.value = data.current_page || 1
      lastPage.value = data.last_page || 1
      perPage.value = data.per_page || 15
      totalTickets.value = data.total || 0
    } else {
      error.value = data.message || 'Failed to fetch history'
      tickets.value = []
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch history. Please try again.'
    tickets.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchHistory(1)
}

const handlePerPageChange = () => {
  currentPage.value = 1
  fetchHistory(1)
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchHistory(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
/* Modern Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.history-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.header-text h4 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.header-text p {
  font-size: 0.95rem;
  margin: 0;
}

/* Modern Filter Card */
.filter-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filter-header {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.history-header {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.filter-body {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modern-select,
.modern-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.modern-select:focus,
.modern-input:focus {
  outline: none;
  border-color: #11998e;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
}

.btn-apply {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

/* Tickets Card */
.tickets-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tickets-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-tickets-header {
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
}

.tickets-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tickets-title i {
  font-size: 1.5rem;
  color: #11998e;
}

.tickets-title h5 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.tickets-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
}

.history-badge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.tickets-body {
  padding: 1.5rem;
  min-height: 400px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.history-loader {
  border-top-color: #11998e;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #718096;
  font-weight: 500;
  margin: 0;
}

/* Error & Empty States */
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.error-state i,
.empty-state i {
  font-size: 4rem;
  color: #cbd5e0;
}

.error-state p {
  color: #e53e3e;
  font-weight: 500;
}

.empty-state h5 {
  color: #4a5568;
  font-weight: 600;
  margin: 0;
}

.empty-state p {
  color: #a0aec0;
  margin: 0;
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.history-item {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: #11998e;
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.15);
  transform: translateY(-2px);
}

.history-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.25rem;
  padding: 1.5rem;
  align-items: flex-start;
}

.history-status-indicator {
  padding-top: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-dot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.3); opacity: 0; }
}

.status-dot.status-resolved {
  background: #10b981;
  color: #10b981;
}

.status-dot.status-closed {
  background: #6b7280;
  color: #6b7280;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ticket-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #11998e;
  letter-spacing: 0.5px;
}

.ticket-title {
  font-size: 1.05rem;
  color: #2d3748;
  font-weight: 600;
}

.history-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.priority-badge,
.status-badge {
  padding: 0.4rem 0.95rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.priority-badge.priority-low {
  background: #f3f4f6;
  color: #6b7280;
}

.priority-badge.priority-medium {
  background: #dbeafe;
  color: #1e40af;
}

.priority-badge.priority-high {
  background: #fef3c7;
  color: #92400e;
}

.priority-badge.priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-resolved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-closed {
  background: #f3f4f6;
  color: #374151;
}

.history-details-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
  flex-wrap: wrap;
}

.detail-item i {
  color: #11998e;
  font-size: 1.1rem;
}

.detail-label {
  font-weight: 600;
  color: #718096;
}

.detail-value {
  color: #2d3748;
  font-weight: 500;
}

.detail-time {
  color: #a0aec0;
  font-size: 0.8125rem;
}

.sla-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sla-indicator.met {
  background: #d1fae5;
  color: #065f46;
}

.sla-indicator.missed {
  background: #fee2e2;
  color: #991b1b;
}

.history-action {
  display: flex;
  align-items: center;
  padding-top: 0.5rem;
}

.btn-view-history {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-view-history:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
  color: white;
}

/* Pagination */
.tickets-footer {
  padding: 1.25rem 1.5rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.per-page-select {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:not(:disabled):hover {
  border-color: #11998e;
  background: #11998e;
  color: white;
  transform: translateY(-2px);
}

.page-btn.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-color: transparent;
  color: white;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.dots {
  cursor: default;
  border-color: transparent;
}

.page-btn.dots:hover {
  background: white;
  color: #4a5568;
  transform: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .history-main {
    grid-template-columns: auto 1fr;
  }
  
  .history-action {
    grid-column: span 2;
    padding-top: 0;
    border-top: 1px solid #e2e8f0;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  
  .btn-view-history {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .header-text h4 {
    font-size: 1.5rem;
  }
  
  .filter-body {
    grid-template-columns: 1fr;
  }
  
  .history-header-row {
    flex-direction: column;
  }
  
  .history-badges {
    width: 100%;
  }
  
  .history-details-row {
    grid-template-columns: 1fr;
  }
  
  .tickets-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-info,
  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .history-main {
    grid-template-columns: 1fr;
  }
  
  .history-status-indicator {
    display: none;
  }
}
</style>