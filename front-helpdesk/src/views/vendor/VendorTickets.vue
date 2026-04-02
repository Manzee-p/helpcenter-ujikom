<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold mb-1">🎫 My Tickets</h4>
        <p class="text-muted mb-0">Manage and track your assigned tickets</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="fetchTickets">
          <i class="bx bx-refresh me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="avatar flex-shrink-0 me-3">
                <div class="avatar-initial rounded bg-label-primary">
                  <i class="bx bx-file bx-sm"></i>
                </div>
              </div>
              <div>
                <p class="mb-0 text-muted small">Total</p>
                <h5 class="mb-0 fw-bold">{{ pagination.total || 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="avatar flex-shrink-0 me-3">
                <div class="avatar-initial rounded bg-label-warning">
                  <i class="bx bx-time bx-sm"></i>
                </div>
              </div>
              <div>
                <p class="mb-0 text-muted small">In Progress</p>
                <h5 class="mb-0 fw-bold">{{ stats.in_progress || 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="avatar flex-shrink-0 me-3">
                <div class="avatar-initial rounded bg-label-info">
                  <i class="bx bx-hourglass bx-sm"></i>
                </div>
              </div>
              <div>
                <p class="mb-0 text-muted small">Waiting</p>
                <h5 class="mb-0 fw-bold">{{ stats.waiting || 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="avatar flex-shrink-0 me-3">
                <div class="avatar-initial rounded bg-label-success">
                  <i class="bx bx-check-circle bx-sm"></i>
                </div>
              </div>
              <div>
                <p class="mb-0 text-muted small">Resolved</p>
                <h5 class="mb-0 fw-bold">{{ stats.resolved || 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4 shadow-sm border-0">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-3">
            <label class="form-label small mb-1">Status</label>
            <select class="form-select" v-model="filters.status" @change="handleFilterChange">
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small mb-1">Priority</label>
            <select class="form-select" v-model="filters.priority" @change="handleFilterChange">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Search</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bx bx-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search by ticket number or title..."
                v-model="filters.search"
                @input="handleSearchChange"
              >
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label small mb-1 invisible">Action</label>
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="bx bx-x me-1"></i>Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">
          <i class="bx bx-list-ul me-2 text-primary"></i>
          Assigned Tickets
        </h5>
        <span class="badge bg-label-primary rounded-pill px-3 py-2">
          {{ pagination.total || 0 }} total
        </span>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Loading tickets...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger m-4">
          <i class="bx bx-error me-2"></i>{{ error }}
        </div>

        <div v-else-if="tickets.length === 0" class="text-center py-5">
          <i class="bx bx-folder-open display-4 text-muted"></i>
          <p class="text-muted mt-3 mb-0">No tickets found</p>
          <small class="text-muted">Try adjusting your filters</small>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Ticket</th>
                <th>Client</th>
                <th class="text-center">Category</th>
                <th class="text-center">Priority</th>
                <th class="text-center">Status</th>
                <th>Created</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.id" class="border-bottom">
                <td class="ps-4">
                  <div>
                    <strong class="text-primary">{{ ticket.ticket_number }}</strong>
                    <br>
                    <small class="text-muted">{{ truncate(ticket.title, 40) }}</small>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar avatar-xs flex-shrink-0 me-2">
                      <div class="avatar-initial rounded-circle bg-label-secondary">
                        {{ getInitials(ticket.user?.name) }}
                      </div>
                    </div>
                    <span>{{ ticket.user?.name || 'N/A' }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-label-info rounded-pill px-3 py-2">
                    {{ ticket.category?.name || 'N/A' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="`badge bg-label-${getPriorityColor(ticket.priority)} rounded-pill px-3 py-2`">
                    {{ formatPriority(ticket.priority) }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="`badge bg-label-${getStatusColor(ticket.status)} rounded-pill px-3 py-2`">
                    {{ formatStatus(ticket.status) }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">{{ timeAgo(ticket.created_at) }}</small>
                </td>
                <td class="text-center pe-4">
                  <router-link 
                    :to="`/vendor/tickets/${ticket.id}`"
                    class="btn btn-sm btn-outline-primary rounded-pill"
                  >
                    <i class="bx bx-show me-1"></i>View
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="tickets.length > 0 && pagination.last_page > 1" class="card-footer bg-white border-top">
        <div class="row align-items-center">
          <div class="col-md-6 mb-3 mb-md-0">
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted small">Show</span>
              <select 
                class="form-select form-select-sm w-auto" 
                v-model="filters.per_page" 
                @change="handlePerPageChange"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span class="text-muted small">
                Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total || 0 }} entries
              </span>
            </div>
          </div>
          <div class="col-md-6">
            <nav>
              <ul class="pagination pagination-sm justify-content-md-end justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                  <button 
                    class="page-link" 
                    @click="changePage(pagination.current_page - 1)"
                    :disabled="pagination.current_page === 1"
                  >
                    <i class="bx bx-chevron-left"></i>
                  </button>
                </li>

                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: page === pagination.current_page }"
                >
                  <button 
                    v-if="page !== '...'" 
                    class="page-link" 
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="page-link">...</span>
                </li>

                <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                  <button 
                    class="page-link" 
                    @click="changePage(pagination.current_page + 1)"
                    :disabled="pagination.current_page === pagination.last_page"
                  >
                    <i class="bx bx-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import {
  getPriorityColor,
  getStatusColor,
  formatPriority,
  formatStatus,
  timeAgo,
  truncate
} from '@/utils/helpers'

const tickets = ref([])
const loading = ref(false)
const error = ref(null)
const stats = ref({
  in_progress: 0,
  waiting: 0,
  resolved: 0
})

const filters = ref({
  status: '',
  priority: '',
  search: '',
  per_page: 10,
  page: 1
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

let searchTimeout = null

const visiblePages = computed(() => {
  const pages = []
  const current = pagination.value.current_page
  const last = pagination.value.last_page

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(last)
    } else if (current >= last - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = last - 4; i <= last; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(last)
    }
  }

  return pages
})

const getInitials = (name) => {
  if (!name) return 'NA'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const fetchTickets = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = { 
      ...filters.value,
      page: filters.value.page
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })
    
    console.log('Fetching vendor tickets with params:', params)
    
    const { data } = await api.get('/vendor/tickets', { params })
    
    console.log('Vendor tickets response:', data)
    
    // Handle both array and paginated response
    if (Array.isArray(data)) {
      tickets.value = data
      pagination.value = {
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        total: data.length,
        from: data.length > 0 ? 1 : 0,
        to: data.length
      }
    } else if (data.data) {
      tickets.value = data.data
      pagination.value = {
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 10,
        total: data.total || 0,
        from: data.from || 0,
        to: data.to || 0
      }
    } else {
      tickets.value = []
    }

    // Calculate stats
    calculateStats()
  } catch (err) {
    console.error('Failed to fetch tickets:', err)
    error.value = err.response?.data?.message || 'Failed to fetch tickets. Please try again.'
    tickets.value = []
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  // This should ideally come from API, but we can calculate from current data
  stats.value = {
    in_progress: tickets.value.filter(t => t.status === 'in_progress').length,
    waiting: tickets.value.filter(t => t.status === 'waiting_response').length,
    resolved: tickets.value.filter(t => t.status === 'resolved').length
  }
}

const handleFilterChange = () => {
  filters.value.page = 1
  fetchTickets()
}

const handleSearchChange = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchTickets()
  }, 500)
}

const handlePerPageChange = () => {
  filters.value.page = 1
  fetchTickets()
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  filters.value.page = page
  fetchTickets()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  filters.value = {
    status: '',
    priority: '',
    search: '',
    per_page: 10,
    page: 1
  }
  fetchTickets()
}

onMounted(() => {
  fetchTickets()
})
</script>

<style scoped>
.avatar {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-xs {
  width: 2rem;
  height: 2rem;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(105, 108, 255, 0.04);
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  border: 1px solid #d9dee3;
  color: #697a8d;
  transition: all 0.2s ease;
}

.page-link:hover {
  background-color: rgba(105, 108, 255, 0.08);
  border-color: #696cff;
  color: #696cff;
}

.page-item.active .page-link {
  background-color: #696cff;
  border-color: #696cff;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 767.98px) {
  .table {
    font-size: 0.875rem;
  }
  
  .avatar {
    width: 2rem;
    height: 2rem;
  }

  .avatar-xs {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>