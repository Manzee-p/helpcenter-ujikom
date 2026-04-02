<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Update Ticket Status</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Current Status</label>
              <input type="text" class="form-control" :value="ticket.status" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label">New Status</label>
              <select class="form-select" v-model="newStatus" required>
                <option value="">Select Status</option>
                <option v-for="status in availableStatuses" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            <span v-if="!loading">Update Status</span>
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
import { ref, computed } from 'vue'
import { useTicketStore } from '@/stores/ticket'
import { useAuthStore } from '@/stores/auth'
import { STATUS_OPTIONS } from '@/utils/constants'
import Swal from 'sweetalert2'

const props = defineProps({
  ticket: Object
})

const emit = defineEmits(['close', 'updated'])

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const newStatus = ref('')
const loading = ref(false)

const availableStatuses = computed(() => {
  if (authStore.isVendor) {
    return STATUS_OPTIONS.filter(s => 
      ['in_progress', 'waiting_response', 'resolved'].includes(s.value)
    )
  }
  return STATUS_OPTIONS
})

const handleSubmit = async () => {
  if (!newStatus.value) return
  
  loading.value = true
  try {
    await ticketStore.updateTicket(props.ticket.id, { status: newStatus.value })
    
    Swal.fire({
      icon: 'success',
      title: 'Status Updated',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
    
    emit('updated')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to update status',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}
</script>