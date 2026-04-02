<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bx bx-sort-alt-2 me-2"></i>
            Set Ticket Priority
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Ticket Info -->
          <div class="ticket-info-box">
            <i class="bx bx-info-circle info-icon"></i>
            <div class="ticket-info-content">
              <div class="ticket-number">{{ ticket?.ticket_number }}</div>
              <div class="ticket-title">{{ ticket?.title }}</div>
            </div>
          </div>

          <!-- Current Status Info -->
          <div class="current-status-row" v-if="ticket?.priority">
            <div class="status-item">
              <label>Current Priority</label>
              <span :class="`badge bg-${getPriorityColor(ticket.priority)}`">
                {{ formatPriority(ticket.priority).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Client's Urgency Indication - Shown separately as info only -->
          <div v-if="ticket?.urgency_level" class="urgency-info-box">
            <i class="bx bx-bell info-icon-small"></i>
            <div>
              <small class="text-muted d-block mb-1">Client's Urgency Indication:</small>
              <span class="badge bg-info">
                {{ formatUrgencyLevel(ticket.urgency_level).toUpperCase() }}
              </span>
              <small class="d-block text-muted mt-1" style="font-size: 0.75rem;">
                This is what the client indicated. Set admin priority below.
              </small>
            </div>
          </div>

          <!-- Priority Selection Label -->
          <div class="selection-label">
            SELECT NEW PRIORITY <span class="text-danger">*</span>
          </div>

          <!-- Priority Options -->
          <div class="priority-options">
            <!-- Low Priority -->
            <div 
              class="priority-card"
              :class="{ 'selected': selectedPriority === 'low' }"
              @click="selectedPriority = 'low'"
            >
              <div class="priority-icon-wrapper">
                <div class="priority-icon low">
                  <i class="bx bx-minus-circle"></i>
                </div>
              </div>
              <div class="priority-content">
                <div class="priority-name">Low Priority</div>
                <div class="priority-desc">Non-urgent issues, can be handled in normal workflow</div>
                <div class="priority-sla">
                  <i class="bx bx-time-five"></i>
                  <span>Response: 120min | Resolution: 2880min</span>
                </div>
              </div>
              <div class="priority-checkmark">
                <i class="bx bx-check"></i>
              </div>
            </div>

            <!-- Medium Priority -->
            <div 
              class="priority-card"
              :class="{ 'selected': selectedPriority === 'medium' }"
              @click="selectedPriority = 'medium'"
            >
              <div class="priority-icon-wrapper">
                <div class="priority-icon medium">
                  <i class="bx bx-bar-chart-alt"></i>
                </div>
              </div>
              <div class="priority-content">
                <div class="priority-name">Medium Priority</div>
                <div class="priority-desc">Standard priority, should be addressed in reasonable time</div>
                <div class="priority-sla">
                  <i class="bx bx-time-five"></i>
                  <span>Response: 60min | Resolution: 1440min</span>
                </div>
              </div>
              <div class="priority-checkmark">
                <i class="bx bx-check"></i>
              </div>
            </div>

            <!-- High Priority -->
            <div 
              class="priority-card"
              :class="{ 'selected': selectedPriority === 'high' }"
              @click="selectedPriority = 'high'"
            >
              <div class="priority-icon-wrapper">
                <div class="priority-icon high">
                  <i class="bx bx-trending-up"></i>
                </div>
              </div>
              <div class="priority-content">
                <div class="priority-name">High Priority</div>
                <div class="priority-desc">Important issues requiring prompt attention</div>
                <div class="priority-sla">
                  <i class="bx bx-time-five"></i>
                  <span>Response: 30min | Resolution: 480min</span>
                </div>
              </div>
              <div class="priority-checkmark">
                <i class="bx bx-check"></i>
              </div>
            </div>

            <!-- Urgent Priority -->
            <div 
              class="priority-card"
              :class="{ 'selected': selectedPriority === 'urgent' }"
              @click="selectedPriority = 'urgent'"
            >
              <div class="priority-icon-wrapper">
                <div class="priority-icon urgent">
                  <i class="bx bx-error-circle"></i>
                </div>
              </div>
              <div class="priority-content">
                <div class="priority-name">Urgent Priority</div>
                <div class="priority-desc">Critical issues requiring immediate action</div>
                <div class="priority-sla">
                  <i class="bx bx-time-five"></i>
                  <span>Response: 15min | Resolution: 240min</span>
                </div>
              </div>
              <div class="priority-checkmark">
                <i class="bx bx-check"></i>
              </div>
            </div>
          </div>

          <!-- Info Notice -->
          <div class="info-notice" v-if="selectedPriority">
            <i class="bx bx-info-circle"></i>
            <span>Setting priority will update the SLA tracking for this ticket.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit" 
            :disabled="loading || !selectedPriority"
          >
            <span v-if="!loading">
              <i class="bx bx-save me-1"></i>
              Set Priority
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Updating...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const selectedPriority = ref('')
const loading = ref(false)

onMounted(() => {
  if (props.ticket?.priority) {
    selectedPriority.value = props.ticket.priority
  }
})

const handleSubmit = async () => {
  if (!selectedPriority.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Please select a priority',
      confirmButtonColor: '#696cff'
    })
    return
  }

  loading.value = true
  try {
    console.log('🚀 Updating priority for ticket:', props.ticket.id, 'to', selectedPriority.value)
    
    const response = await api.put(`/admin/tickets/${props.ticket.id}/priority`, {
      priority: selectedPriority.value
    })

    console.log('✅ Priority updated successfully:', response.data)

    await Swal.fire({
      icon: 'success',
      title: 'Priority Updated!',
      text: `Ticket priority has been set to ${formatPriority(selectedPriority.value)}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    emit('updated')
    emit('close')
  } catch (error) {
    console.error('❌ Failed to update priority:', error)
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Failed to update priority',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}

const formatPriority = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  }
  return labels[priority] || priority
}

const formatUrgencyLevel = (level) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  }
  return labels[level] || level
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'secondary',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return colors[priority] || 'secondary'
}
</script>

<style scoped>
/* Modal Overlay */
.modal {
  z-index: 1055;
}

.modal-dialog {
  max-width: 600px;
}

/* Modal Structure */
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #696cff 0%, #5f63f2 100%);
  color: white;
  border: none;
  padding: 1.5rem 1.75rem;
  position: relative;
}

.modal-title {
  font-weight: 600;
  font-size: 1.25rem;
  color: white;
  display: flex;
  align-items: center;
  margin: 0;
}

.modal-title i {
  font-size: 1.5rem;
}

/* FIXED: Close button now visible */
.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  opacity: 1;
  position: relative;
}

.btn-close span {
  font-size: 28px;
  font-weight: 300;
  color: white;
  line-height: 1;
  display: block;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.btn-close:active {
  transform: rotate(90deg) scale(0.95);
}

.btn-close:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

/* Modal Body */
.modal-body {
  padding: 1.75rem;
  max-height: 70vh;
  overflow-y: auto;
}

/* Ticket Info Box */
.ticket-info-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #696cff;
}

.info-icon {
  font-size: 1.5rem;
  color: #696cff;
  flex-shrink: 0;
}

.info-icon-small {
  font-size: 1.25rem;
  color: #17a2b8;
  flex-shrink: 0;
}

.ticket-info-content {
  flex: 1;
}

.ticket-number {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e40af;
  margin-bottom: 0.25rem;
}

.ticket-title {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.4;
}

/* Current Status Row */
.current-status-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-item {
  flex: 1;
  min-width: 150px;
}

.status-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.status-item .badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.875rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Urgency Info Box - NEW */
.urgency-info-box {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border-left: 3px solid #17a2b8;
}

/* Selection Label */
.selection-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

/* Priority Options */
.priority-options {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

/* Priority Card */
.priority-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  position: relative;
}

.priority-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateX(2px);
}

.priority-card.selected {
  border-color: #696cff;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%);
  box-shadow: 0 4px 12px rgba(105, 108, 255, 0.15);
}

/* Priority Icon - FIXED: Different icons for each priority */
.priority-icon-wrapper {
  flex-shrink: 0;
}

.priority-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.priority-icon i {
  font-size: 1.75rem;
  color: white;
}

.priority-icon.low {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.priority-icon.medium {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
}

.priority-icon.high {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}

.priority-icon.urgent {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.priority-card.selected .priority-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Priority Content */
.priority-content {
  flex: 1;
}

.priority-name {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 0.35rem;
}

.priority-desc {
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.priority-sla {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.priority-sla i {
  font-size: 0.875rem;
}

/* Checkmark */
.priority-checkmark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.priority-card.selected .priority-checkmark {
  background: #696cff;
  transform: scale(1.1);
}

.priority-checkmark i {
  font-size: 1.125rem;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.priority-card.selected .priority-checkmark i {
  color: white;
  font-weight: 700;
}

/* Info Notice */
.info-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
  border-left: 3px solid #f59e0b;
}

.info-notice i {
  font-size: 1.25rem;
  color: #d97706;
  flex-shrink: 0;
}

.info-notice span {
  font-size: 0.8125rem;
  color: #92400e;
  line-height: 1.4;
}

/* Footer */
.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* Buttons */
.btn {
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  border: none;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
  color: #334155;
}

.btn-primary {
  background: linear-gradient(135deg, #696cff 0%, #5f63f2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(105, 108, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(105, 108, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .priority-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .priority-content {
    text-align: center;
  }

  .current-status-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-item {
    min-width: 100%;
  }

  .priority-checkmark {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style>