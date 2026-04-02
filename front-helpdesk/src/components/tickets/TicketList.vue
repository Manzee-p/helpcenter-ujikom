<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading tickets...</p>
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-5">
      <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
      <p class="text-muted mt-3">No tickets found</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th style="width: 120px;">Ticket #</th>
            <th>Title</th>
            <th v-if="showCreator" style="width: 100px;">Created By</th>
            <th style="width: 150px;">Client</th>
            <th style="width: 120px;">Category</th>
            <th style="width: 100px;">Status</th>
            <th style="width: 100px;">Priority</th>
            <th style="width: 150px;">Assigned To</th>
            <th style="width: 130px;">Created</th>
            <th v-if="showActions" style="width: 150px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <!-- Ticket Number -->
            <td>
              <strong class="text-primary">{{ ticket.ticket_number }}</strong>
            </td>

            <!-- Title -->
            <td>
              <div class="fw-medium">{{ ticket.title }}</div>
              <small v-if="ticket.admin_notes" class="text-muted">
                <i class="bi bi-lock-fill text-warning"></i> 
                Has internal notes
              </small>
            </td>

            <!-- Created By Badge -->
            <td v-if="showCreator">
              <span 
                v-if="ticket.created_by_admin" 
                class="badge bg-warning text-dark d-flex align-items-center gap-1"
                style="width: fit-content;"
                :title="`Created by ${ticket.created_by_admin?.name || 'Admin'}`"
              >
                <i class="bi bi-person-badge"></i>
                Admin
              </span>
              <span 
                v-else 
                class="badge bg-success d-flex align-items-center gap-1"
                style="width: fit-content;"
              >
                <i class="bi bi-person"></i>
                User
              </span>
            </td>

            <!-- Client -->
            <td>
              <div class="small">
                <strong>{{ ticket.user?.name }}</strong>
              </div>
              <small class="text-muted">{{ ticket.user?.email }}</small>
            </td>

            <!-- Category -->
            <td>
              <span class="badge bg-secondary">
                {{ ticket.category?.name }}
              </span>
            </td>

            <!-- Status -->
            <td>
              <span 
                class="badge" 
                :class="statusClass(ticket.status)"
              >
                {{ statusText(ticket.status) }}
              </span>
            </td>

            <!-- Priority -->
            <td>
              <span 
                class="badge" 
                :class="priorityClass(ticket.priority)"
              >
                {{ ticket.priority?.toUpperCase() }}
              </span>
              <!-- Show client urgency if different -->
              <div v-if="ticket.urgency_level && ticket.urgency_level !== ticket.priority">
                <small class="text-muted d-block mt-1">
                  <i class="bi bi-exclamation-circle"></i>
                  Client: {{ ticket.urgency_level }}
                </small>
              </div>
            </td>

            <!-- Assigned To -->
            <td>
              <div v-if="ticket.assigned_to">
                <i class="bi bi-person-check text-success"></i>
                <span class="small ms-1">{{ ticket.assigned_to?.name }}</span>
              </div>
              <div v-else class="text-muted">
                <i class="bi bi-person-x"></i>
                <span class="small ms-1">Unassigned</span>
              </div>
            </td>

            <!-- Created At -->
            <td>
              <small class="text-muted">{{ formatDate(ticket.created_at) }}</small>
            </td>

            <!-- Actions -->
            <td v-if="showActions">
              <div class="btn-group btn-group-sm" role="group">
                <button 
                  class="btn btn-outline-primary"
                  @click="$emit('view', ticket)"
                  title="View Details"
                >
                  <i class="bi bi-eye"></i>
                </button>
                
                <button 
                  v-if="!ticket.assigned_to"
                  class="btn btn-outline-success"
                  @click="$emit('assign', ticket)"
                  title="Assign Ticket"
                >
                  <i class="bi bi-person-plus"></i>
                </button>
                
                <button 
                  class="btn btn-outline-danger"
                  @click="$emit('delete', ticket)"
                  title="Delete Ticket"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tickets: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  showCreator: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view', 'assign', 'delete'])

// Format date WITHOUT date-fns library
const formatDate = (date) => {
  if (!date) return '-'
  
  try {
    const d = new Date(date)
    
    // Check if valid date
    if (isNaN(d.getTime())) return '-'
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const day = String(d.getDate()).padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return `${day} ${month} ${year} ${hours}:${minutes}`
  } catch (e) {
    console.error('Date formatting error:', e)
    return '-'
  }
}

const statusClass = (status) => {
  const classes = {
    'new': 'bg-info',
    'in_progress': 'bg-primary',
    'waiting_response': 'bg-warning text-dark',
    'resolved': 'bg-success',
    'closed': 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const statusText = (status) => {
  const texts = {
    'new': 'New',
    'in_progress': 'In Progress',
    'waiting_response': 'Waiting',
    'resolved': 'Resolved',
    'closed': 'Closed'
  }
  return texts[status] || status
}

const priorityClass = (priority) => {
  const classes = {
    'low': 'bg-secondary',
    'medium': 'bg-info',
    'high': 'bg-warning text-dark',
    'urgent': 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}
</script>

<style scoped>
.table {
  white-space: nowrap;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.table > :not(caption) > * > * {
  padding: 0.75rem 0.5rem;
}

.fw-medium {
  font-weight: 500;
}
</style>