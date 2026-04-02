<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else-if="ticket">
    <!-- Ticket Header -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4 class="mb-2">{{ ticket.title }}</h4>
            <div class="text-muted">
              <span class="me-3">
                <i class="bx bx-hash"></i> {{ ticket.ticket_number }}
              </span>
              <span class="me-3">
                <i class="bx bx-user"></i> {{ ticket.user?.name }}
              </span>
              <span>
                <i class="bx bx-calendar"></i> {{ formatDate(ticket.created_at) }}
              </span>
            </div>
          </div>
          <div class="text-end">
            <TicketStatusBadge :status="ticket.status" class="mb-2" />
            <br>
            <span :class="`badge bg-label-${getPriorityColor(ticket.priority)}`">
              {{ ticket.priority }}
            </span>
          </div>
        </div>

        <!-- Event Info -->
        <div v-if="ticket.event_name || ticket.venue" class="alert alert-info mb-3">
          <div class="row">
            <div class="col-md-4" v-if="ticket.event_name">
              <strong>Event:</strong> {{ ticket.event_name }}
            </div>
            <div class="col-md-4" v-if="ticket.venue">
              <strong>Venue:</strong> {{ ticket.venue }}
            </div>
            <div class="col-md-4" v-if="ticket.area">
              <strong>Area:</strong> {{ ticket.area }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-3">
          <h6>Description</h6>
          <p class="text-muted">{{ ticket.description }}</p>
        </div>

        <!-- Attachments -->
        <div v-if="ticket.attachments?.length > 0" class="mb-3">
          <h6>Attachments</h6>
          <div class="d-flex flex-wrap gap-2">
            <a 
              v-for="attachment in ticket.attachments" 
              :key="attachment.id"
              :href="getAttachmentUrl(attachment.file_path)" 
              target="_blank"
              class="btn btn-sm btn-outline-primary"
            >
              <i class="bx bx-paperclip me-1"></i>
              {{ attachment.file_name }}
            </a>
          </div>
        </div>

        <!-- Assignment Info -->
        <div v-if="ticket.assigned_to" class="mb-3">
          <h6>Assigned To</h6>
          <div class="d-flex align-items-center">
            <div class="avatar avatar-sm me-2">
              <span class="avatar-initial rounded-circle bg-label-primary">
                {{ getInitials(ticket.assigned_to?.name) }}
              </span>
            </div>
            <div>
              <div class="fw-semibold">{{ ticket.assigned_to?.name }}</div>
              <small class="text-muted">{{ ticket.assigned_to?.email }}</small>
            </div>
          </div>
        </div>

        <!-- SLA Info -->
        <div v-if="ticket.sla_tracking" class="row">
          <div class="col-md-6">
            <div class="card border">
              <div class="card-body">
                <h6 class="mb-2">Response Time</h6>
                <div v-if="ticket.first_response_at">
                  <span :class="`badge bg-label-${ticket.sla_tracking.response_sla_met ? 'success' : 'danger'}`">
                    {{ ticket.sla_tracking.actual_response_time }} minutes
                  </span>
                  <small class="text-muted d-block mt-1">
                    SLA: {{ ticket.sla_tracking.response_time_sla }} minutes
                  </small>
                </div>
                <span v-else class="text-muted">Not responded yet</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border">
              <div class="card-body">
                <h6 class="mb-2">Resolution Time</h6>
                <div v-if="ticket.resolved_at">
                  <span :class="`badge bg-label-${ticket.sla_tracking.resolution_sla_met ? 'success' : 'danger'}`">
                    {{ ticket.sla_tracking.actual_resolution_time }} minutes
                  </span>
                  <small class="text-muted d-block mt-1">
                    SLA: {{ ticket.sla_tracking.resolution_time_sla }} minutes
                  </small>
                </div>
                <span v-else class="text-muted">Not resolved yet</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-3" v-if="canManageTicket">
          <button 
            v-if="ticket.status !== 'closed'" 
            class="btn btn-sm btn-primary me-2"
            @click="showStatusModal = true"
          >
            <i class="bx bx-edit me-1"></i> Update Status
          </button>
          
          <button 
            v-if="authStore.isAdmin && ticket.status === 'new'" 
            class="btn btn-sm btn-info"
            @click="showAssignModal = true"
          >
            <i class="bx bx-user me-1"></i> Assign Ticket
          </button>
        </div>
      </div>
    </div>

    <!-- Comments -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title m-0">Comments</h5>
      </div>
      <div class="card-body">
        <!-- Comment List -->
        <div class="mb-4">
          <div v-if="comments.length === 0" class="text-center text-muted py-3">
            No comments yet
          </div>
          <div v-else>
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="d-flex mb-3"
            >
              <div class="avatar avatar-sm me-3 flex-shrink-0">
                <span class="avatar-initial rounded-circle bg-label-primary">
                  {{ getInitials(comment.user?.name) }}
                </span>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <strong>{{ comment.user?.name }}</strong>
                    <span v-if="comment.is_internal" class="badge bg-label-warning ms-2">Internal</span>
                  </div>
                  <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
                </div>
                <p class="mb-0">{{ comment.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Comment Form -->
        <div class="border-top pt-3">
          <h6>Add Comment</h6>
          <form @submit.prevent="submitComment">
            <div class="mb-3">
              <textarea 
                class="form-control" 
                rows="3" 
                v-model="newComment"
                placeholder="Type your comment here..."
                required
              ></textarea>
            </div>
            <div class="mb-3" v-if="!authStore.isClient">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="internalNote"
                  v-model="isInternal"
                />
                <label class="form-check-label" for="internalNote">
                  Internal Note (not visible to client)
                </label>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="commentLoading">
              <span v-if="!commentLoading">
                <i class="bx bx-send me-1"></i> Post Comment
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Posting...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UpdateStatusModal 
      v-if="showStatusModal"
      :ticket="ticket"
      @close="showStatusModal = false"
      @updated="onTicketUpdated"
    />

    <AssignModal 
      v-if="showAssignModal"
      :ticket="ticket"
      @close="showAssignModal = false"
      @assigned="onTicketUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTicketStore } from '@/stores/ticket'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import UpdateStatusModal from '@/components/tickets/UpdateStatusModal.vue'
import AssignModal from '@/components/admin/AssignModal.vue'
import { formatDate, getPriorityColor, getInitials } from '@/utils/helpers'
import Swal from 'sweetalert2'

const route = useRoute()
const authStore = useAuthStore()
const ticketStore = useTicketStore()

const ticket = ref(null)
const comments = ref([])
const loading = ref(false)
const commentLoading = ref(false)
const newComment = ref('')
const isInternal = ref(false)
const showStatusModal = ref(false)
const showAssignModal = ref(false)

const canManageTicket = computed(() => {
  return authStore.isAdmin || authStore.isVendor
})

onMounted(async () => {
  await fetchTicketDetail()
  await fetchComments()
})

const fetchTicketDetail = async () => {
  loading.value = true
  try {
    const response = await ticketStore.fetchTicketDetail(route.params.id)
    ticket.value = response
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load ticket details',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const response = await ticketStore.fetchComments(route.params.id)
    comments.value = response
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

const submitComment = async () => {
  commentLoading.value = true
  try {
    await ticketStore.addComment(route.params.id, {
      comment: newComment.value,
      is_internal: isInternal.value
    })
    
    newComment.value = ''
    isInternal.value = false
    await fetchComments()
    
    Swal.fire({
      icon: 'success',
      title: 'Comment Posted',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to post comment',
      confirmButtonColor: '#696cff'
    })
  } finally {
    commentLoading.value = false
  }
}

const onTicketUpdated = () => {
  showStatusModal.value = false
  showAssignModal.value = false
  fetchTicketDetail()
}

const getAttachmentUrl = (path) => {
  return `http://localhost:8000/storage/${path}`
}
</script>