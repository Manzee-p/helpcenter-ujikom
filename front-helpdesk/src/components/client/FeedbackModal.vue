<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Give Feedback</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Ticket</label>
            <input type="text" class="form-control" :value="`${ticket.ticket_number} - ${ticket.title}`" disabled>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Rating <span class="text-danger">*</span></label>
            <div class="d-flex gap-2">
              <button 
                v-for="star in 5" 
                :key="star"
                type="button"
                class="btn btn-lg"
                :class="star <= rating ? 'btn-warning' : 'btn-outline-secondary'"
                @click="rating = star"
              >
                <i class="bx bxs-star"></i>
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Comment</label>
            <textarea 
              class="form-control" 
              rows="4" 
              v-model="comment"
              placeholder="Share your experience..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading || !rating">
            <span v-if="!loading">Submit Feedback</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Submitting...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  ticket: Object
})

const emit = defineEmits(['close', 'submitted'])

const rating = ref(0)
const comment = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post(`/client/tickets/${props.ticket.id}/feedback`, {
      rating: rating.value,
      comment: comment.value
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Thank You!',
      text: 'Your feedback has been submitted',
      confirmButtonColor: '#696cff'
    })
    
    emit('submitted')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Failed to submit feedback',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}
</script>