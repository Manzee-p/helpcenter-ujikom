<template>
  <div class="ticket-card" @click="handleClick">
    <div class="ticket-card-header">
      <div class="ticket-number">
        <i class="fas fa-ticket-alt"></i>
        <span>#{{ ticket.ticket_number }}</span>
      </div>
      <TicketStatusBadge :status="ticket.status" />
    </div>

    <div class="ticket-card-body">
      <h5 class="ticket-title">{{ ticket.title }}</h5>
      <p class="ticket-description">{{ truncateText(ticket.description, 120) }}</p>

      <div class="ticket-meta">
        <div class="meta-item">
          <i class="fas fa-folder"></i>
          <span>{{ getCategoryLabel(ticket.category) }}</span>
        </div>
        <div class="meta-item" :class="`priority-${ticket.priority}`">
          <i class="fas fa-flag"></i>
          <span>{{ getPriorityLabel(ticket.priority) }}</span>
        </div>
      </div>

      <!-- Event Info (jika ada) -->
      <div v-if="ticket.event_name" class="event-info">
        <i class="fas fa-calendar-alt"></i>
        <span>{{ ticket.event_name }}</span>
        <span v-if="ticket.venue" class="event-detail">• {{ ticket.venue }}</span>
      </div>

      <!-- Attachments Indicator -->
      <div v-if="ticket.attachments && ticket.attachments.length > 0" class="attachments-indicator">
        <i class="fas fa-paperclip"></i>
        <span>{{ ticket.attachments.length }} file(s)</span>
      </div>
    </div>

    <div class="ticket-card-footer">
      <div class="ticket-date">
        <i class="far fa-clock"></i>
        <span>{{ formatDate(ticket.created_at) }}</span>
      </div>
      <div class="ticket-actions">
        <button 
          @click.stop="handleView" 
          class="btn-action btn-view"
          title="View Details"
        >
          <i class="fas fa-eye"></i>
        </button>
        <button 
          v-if="canEdit"
          @click.stop="handleEdit" 
          class="btn-action btn-edit"
          title="Edit Ticket"
        >
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </div>

    <!-- Response Badge (jika ada response baru) -->
    <div v-if="hasNewResponse" class="new-response-badge">
      <i class="fas fa-comment-dots"></i>
      <span>New Response</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TicketStatusBadge from './TicketStatusBadge.vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['view', 'edit'])
const router = useRouter()

const hasNewResponse = computed(() => {
  return props.ticket.has_new_response || false
})

const categoryLabels = {
  'technical': 'Technical Support',
  'billing': 'Billing',
  'general': 'General Inquiry',
  'feature': 'Feature Request',
  'bug': 'Bug Report'
}

const priorityLabels = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent'
}

const getCategoryLabel = (category) => {
  return categoryLabels[category] || category
}

const getPriorityLabel = (priority) => {
  return priorityLabels[priority] || priority
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const handleClick = () => {
  router.push(`/client/tickets/${props.ticket.id}`)
}

const handleView = () => {
  emit('view', props.ticket)
  router.push(`/client/tickets/${props.ticket.id}`)
}

const handleEdit = () => {
  emit('edit', props.ticket)
}
</script>

<style scoped>
.ticket-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.ticket-card:hover {
  border-color: #696cff;
  box-shadow: 0 8px 24px rgba(105, 108, 255, 0.12);
  transform: translateY(-4px);
}

/* Header */
.ticket-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ticket-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: #696cff;
}

.ticket-number i {
  font-size: 1.1rem;
}

/* Body */
.ticket-card-body {
  margin-bottom: 1rem;
}

.ticket-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-description {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.ticket-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.meta-item i {
  font-size: 0.8rem;
  color: #6b7280;
}

.meta-item.priority-low {
  background: #d1fae5;
  color: #065f46;
}

.meta-item.priority-low i {
  color: #10b981;
}

.meta-item.priority-medium {
  background: #dbeafe;
  color: #1e40af;
}

.meta-item.priority-medium i {
  color: #3b82f6;
}

.meta-item.priority-high {
  background: #fed7aa;
  color: #92400e;
}

.meta-item.priority-high i {
  color: #f59e0b;
}

.meta-item.priority-urgent {
  background: #fee2e2;
  color: #991b1b;
}

.meta-item.priority-urgent i {
  color: #ef4444;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f5f5ff 0%, #f0f0ff 100%);
  border-left: 3px solid #696cff;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #4c4f69;
  margin-bottom: 0.75rem;
}

.event-info i {
  color: #696cff;
}

.event-detail {
  color: #6b7280;
}

.attachments-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
}

.attachments-indicator i {
  color: #f59e0b;
}

/* Footer */
.ticket-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.ticket-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.ticket-date i {
  font-size: 0.9rem;
}

.ticket-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-view {
  background: #eff6ff;
  color: #3b82f6;
}

.btn-view:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.btn-edit {
  background: #fef3c7;
  color: #f59e0b;
}

.btn-edit:hover {
  background: #f59e0b;
  color: white;
  transform: scale(1.1);
}

/* New Response Badge */
.new-response-badge {
  position: absolute;
  top: 1rem;
  right: -2.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.25rem 3rem;
  font-size: 0.75rem;
  font-weight: 700;
  transform: rotate(45deg);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-card {
    padding: 1.25rem;
  }
  
  .ticket-title {
    font-size: 1rem;
  }
  
  .ticket-description {
    font-size: 0.875rem;
  }
  
  .ticket-meta {
    gap: 0.5rem;
  }
  
  .meta-item {
    font-size: 0.8rem;
    padding: 0.35rem 0.6rem;
  }
  
  .ticket-card-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .ticket-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Loading State */
.ticket-card.loading {
  pointer-events: none;
  opacity: 0.6;
}

/* Selected State */
.ticket-card.selected {
  border-color: #696cff;
  background: #f5f5ff;
}
</style>