<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Assign Ticket</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Ticket</label>
            <input type="text" class="form-control" :value="`${ticket.ticket_number} - ${ticket.title}`" disabled>
          </div>
          <div class="mb-3">
            <label class="form-label">Assign To</label>
            <select class="form-select" v-model="selectedVendor" required>
              <option value="">Select Vendor</option>
              <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                {{ vendor.name }} ({{ vendor.email }})
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleAssign" :disabled="loading || !selectedVendor">
            <span v-if="!loading">Assign</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Assigning...
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
  ticket: Object
})

const emit = defineEmits(['close', 'assigned'])

const vendors = ref([])
const selectedVendor = ref('')
const loading = ref(false)

onMounted(async () => {
  await fetchVendors()
})

const fetchVendors = async () => {
  try {
    const response = await api.get('/admin/users', { params: { role: 'vendor' } })
    vendors.value = response.data
  } catch (error) {
    console.error('Error fetching vendors:', error)
  }
}

const handleAssign = async () => {
  loading.value = true
  try {
    await api.post(`/admin/tickets/${props.ticket.id}/assign`, {
      assigned_to: selectedVendor.value
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Ticket Assigned',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
    
    emit('assigned')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to assign ticket',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}
</script>