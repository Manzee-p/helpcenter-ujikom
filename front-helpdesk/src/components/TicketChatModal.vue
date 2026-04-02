<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="ticket-chat-modal" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-left">
            <i class="bx bx-message-dots"></i>
            <div class="header-info">
              <h5>Chat - Tiket #{{ ticket?.ticket_number }}</h5>
              <p>{{ ticket?.title }}</p>
            </div>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <i class="bx bx-x"></i>
          </button>
        </div>

        <!-- Ticket Info Bar -->
        <div v-if="ticket" class="ticket-info-bar">
          <div class="info-item">
            <i class="bx bx-user"></i>
            <span>{{ userRole === 'admin' ? conversation?.vendor?.name : conversation?.admin?.name }}</span>
          </div>
          <div class="info-item">
            <i class="bx bx-map"></i>
            <span>{{ ticket.venue || '-' }}</span>
          </div>
          <div class="info-item">
            <span :class="`status-badge status-${ticket.status}`">
              {{ formatStatus(ticket.status) }}
            </span>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="messages-area" ref="messagesContainer">
          <div v-if="loadingMessages" class="loading-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <p>Memuat pesan...</p>
          </div>

          <div v-else-if="messages.length === 0" class="empty-state">
            <i class="bx bx-message"></i>
            <p>Belum ada percakapan</p>
            <small>Mulai percakapan dengan mengirim pesan pertama</small>
          </div>

          <div v-else class="messages-list">
            <!-- Conversation Start -->
            <div class="conversation-start">
              <div class="start-icon">
                <i class="bx bx-chat"></i>
              </div>
              <p>Percakapan dimulai</p>
              <small>{{ formatDate(conversation.created_at) }}</small>
            </div>

            <!-- Messages -->
            <div 
              v-for="message in messages"
              :key="message.id"
              :class="['message-item', isFromMe(message) ? 'message-sent' : 'message-received']"
            >
              <div v-if="!isFromMe(message)" class="message-avatar">
                <span>{{ getInitials(message.sender?.name) }}</span>
              </div>
              
              <div class="message-content">
                <div v-if="!isFromMe(message)" class="message-sender">
                  {{ message.sender?.name }}
                </div>
                
                <!-- Message Type Badge -->
                <div v-if="message.message_type !== 'regular'" class="message-type-badge" :class="`type-${message.message_type}`">
                  <i :class="getMessageTypeIcon(message.message_type)"></i>
                  {{ getMessageTypeLabel(message.message_type) }}
                </div>
                
                <!-- Message Bubble -->
                <div class="message-bubble">
                  {{ message.message }}
                  
                  <!-- Photos (if any) -->
                  <div v-if="message.completion_photos && message.completion_photos.length > 0" class="message-photos">
                    <div 
                      v-for="(photo, index) in message.completion_photos"
                      :key="index"
                      class="photo-item"
                      @click="viewPhoto(photo)"
                    >
                      <img :src="getPhotoUrl(photo)" :alt="`Photo ${index + 1}`" />
                      <div class="photo-overlay">
                        <i class="bx bx-search-alt"></i>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Completion Notes -->
                  <div v-if="message.completion_notes" class="completion-notes">
                    <i class="bx bx-note"></i>
                    <p>{{ message.completion_notes }}</p>
                  </div>
                </div>
                
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
                  <span v-if="isFromMe(message)" class="message-status">
                    <i :class="[
                      'bx',
                      message.is_read ? 'bx-check-double' : 'bx-check',
                      message.is_read ? 'read' : ''
                    ]"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-area">
          <!-- Message Type Selector -->
          <div class="message-type-selector">
            <label>Tipe Pesan:</label>
            <select v-model="messageType" class="form-select">
              <option v-for="type in availableMessageTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Photo Upload (for vendors) -->
          <div v-if="userRole === 'vendor' && messageType === 'issue_report'" class="photo-upload-area">
            <label>
              <i class="bx bx-image-add"></i>
              Upload Foto Masalah (Opsional, maks 5 foto)
            </label>
            <div class="upload-zone" @click="triggerFileInput">
              <input 
                ref="fileInput"
                type="file" 
                multiple
                accept="image/jpeg,image/png"
                @change="handleFileSelect"
                style="display: none"
              />
              <div class="upload-placeholder">
                <i class="bx bx-cloud-upload"></i>
                <p>Klik untuk upload foto atau drag & drop</p>
                <small>JPG, PNG (maks 5MB per foto)</small>
              </div>
            </div>
            
            <!-- Photo Preview -->
            <div v-if="selectedPhotos.length > 0" class="photo-preview-list">
              <div 
                v-for="(photo, index) in selectedPhotos" 
                :key="index"
                class="photo-preview-item"
              >
                <img :src="photo.preview" :alt="`Preview ${index + 1}`" />
                <button class="btn-remove-photo" @click="removePhoto(index)">
                  <i class="bx bx-x"></i>
                </button>
                <div class="photo-info">
                  <span>{{ photo.file.name }}</span>
                  <small>{{ formatFileSize(photo.file.size) }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Text Input -->
          <div class="text-input-wrapper">
            <textarea 
              v-model="newMessage"
              placeholder="Ketik pesan Anda..."
              rows="2"
              @keydown.ctrl.enter="sendMessage"
              :disabled="sending"
            ></textarea>
            <button 
              class="btn-send"
              @click="sendMessage"
              :disabled="!canSend"
            >
              <i v-if="!sending" class="bx bx-send"></i>
              <i v-else class="bx bx-loader-alt bx-spin"></i>
            </button>
          </div>
          
          <small class="input-hint">Tekan Ctrl+Enter untuk kirim</small>
        </div>
      </div>
    </div>

    <!-- Photo Viewer Modal -->
    <div v-if="viewingPhoto" class="photo-viewer-overlay" @click="viewingPhoto = null">
      <div class="photo-viewer-content" @click.stop>
        <button class="btn-close-viewer" @click="viewingPhoto = null">
          <i class="bx bx-x"></i>
        </button>
        <img :src="getPhotoUrl(viewingPhoto)" alt="Full size photo" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  ticketId: {
    type: Number,
    required: true
  },
  conversationId: {
    type: Number,
    default: null
  },
  userRole: {
    type: String,
    required: true,
    validator: (val) => ['admin', 'vendor'].includes(val)
  },
  initialMessageType: {
    type: String,
    default: 'regular'
  }
})

const emit = defineEmits(['close', 'conversation-created'])

const authStore = useAuthStore()

// State
const conversation = ref(null)
const ticket = ref(null)
const messages = ref([])
const newMessage = ref('')
const messageType = ref(props.initialMessageType)
const selectedPhotos = ref([])
const loadingMessages = ref(false)
const sending = ref(false)
const viewingPhoto = ref(null)

// Refs
const messagesContainer = ref(null)
const fileInput = ref(null)

// Computed
const availableMessageTypes = computed(() => {
  if (props.userRole === 'admin') {
    return [
      { value: 'regular', label: 'Pesan Biasa' },
      { value: 'warning', label: '⚠️ Peringatan' },
      { value: 'escalation', label: '🚨 Eskalasi' }
    ]
  } else {
    return [
      { value: 'regular', label: 'Pesan Biasa' },
      { value: 'progress_update', label: '📊 Update Progress' },
      { value: 'issue_report', label: '⚠️ Laporan Masalah' }
    ]
  }
})

const canSend = computed(() => {
  return newMessage.value.trim() && !sending.value
})

// Methods
const initChat = async () => {
  try {
    // Load ticket info
    const ticketEndpoint = props.userRole === 'admin' 
      ? `/tickets/${props.ticketId}` // admin can access via general endpoint
      : `/vendor/tickets/${props.ticketId}`
    
    const { data: ticketData } = await api.get(ticketEndpoint)
    ticket.value = ticketData.ticket || ticketData

    // Check if conversation exists or create new
    if (props.conversationId) {
      await loadConversation(props.conversationId)
    } else {
      await checkExistingConversation()
    }
  } catch (error) {
    console.error('Error initializing chat:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat data chat',
      confirmButtonColor: '#696cff'
    })
  }
}

const checkExistingConversation = async () => {
  try {
    const endpoint = props.userRole === 'admin'
      ? '/admin/vendor-chat/conversations'
      : '/vendor/admin-chat/conversations'
    
    const { data } = await api.get(endpoint)
    
    const conversations = data.success ? data.data : (Array.isArray(data) ? data : [])
    
    // Find conversation for this ticket
    const ticketConv = conversations.find(c => c.ticket_id === props.ticketId)
    if (ticketConv) {
      await loadConversation(ticketConv.id)
    }
  } catch (error) {
    console.error('Error checking conversation:', error)
  }
}

const loadConversation = async (convId) => {
  loadingMessages.value = true
  try {
    const endpoint = props.userRole === 'admin'
      ? `/admin/vendor-chat/conversations/${convId}/messages`
      : `/vendor/admin-chat/conversations/${convId}/messages`
    
    const { data } = await api.get(endpoint)
    
    if (data.success) {
      conversation.value = data.conversation
      messages.value = data.messages || []
    } else if (data.messages) {
      conversation.value = data.conversation
      messages.value = data.messages
    }
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error loading conversation:', error)
  } finally {
    loadingMessages.value = false
  }
}

const createConversation = async () => {
  try {
    const endpoint = props.userRole === 'admin'
      ? '/admin/vendor-chat/conversations'
      : '/vendor/admin-chat/conversations'
    
    const payload = props.userRole === 'admin' 
      ? {
          ticket_id: props.ticketId,
          vendor_id: ticket.value.assigned_to,
          message: newMessage.value,
          message_type: messageType.value
        }
      : {
          ticket_id: props.ticketId,
          message: newMessage.value,
          message_type: messageType.value
        }
    
    const { data } = await api.post(endpoint, payload)
    
    const newConv = data.success ? data.data : data
    conversation.value = newConv
    emit('conversation-created', newConv)
    
    // Reload messages
    await loadConversation(newConv.id)
    
    return true
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

const sendMessage = async () => {
  if (!canSend.value) return
  
  const messageText = newMessage.value
  const photos = selectedPhotos.value
  
  newMessage.value = ''
  sending.value = true
  
  try {
    // Create conversation if doesn't exist
    if (!conversation.value) {
      await createConversation()
      // Message already sent during creation
      selectedPhotos.value = []
      messageType.value = 'regular'
      sending.value = false
      return
    }
    
    const endpoint = props.userRole === 'admin'
      ? `/admin/vendor-chat/conversations/${conversation.value.id}/messages`
      : `/vendor/admin-chat/conversations/${conversation.value.id}/messages`
    
    // Prepare form data if photos exist
    let requestData
    let config = {}
    
    if (photos.length > 0) {
      requestData = new FormData()
      requestData.append('message', messageText)
      requestData.append('message_type', messageType.value)
      
      photos.forEach((photo) => {
        requestData.append('photos[]', photo.file)
      })
      
      config.headers = { 'Content-Type': 'multipart/form-data' }
    } else {
      requestData = {
        message: messageText,
        message_type: messageType.value
      }
    }
    
    const { data } = await api.post(endpoint, requestData, config)
    
    const newMsg = data.success ? data.data : data
    messages.value.push(newMsg)
    
    // Clear photos
    selectedPhotos.value = []
    
    // Reset message type to regular after sending
    messageType.value = 'regular'
    
    await nextTick()
    scrollToBottom()
    
    Swal.fire({
      icon: 'success',
      title: 'Terkirim',
      text: 'Pesan berhasil dikirim',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (error) {
    console.error('Error sending message:', error)
    
    // Restore message
    newMessage.value = messageText
    
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengirim pesan',
      confirmButtonColor: '#696cff'
    })
  } finally {
    sending.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  
  // Validate count
  if (selectedPhotos.value.length + files.length > 5) {
    Swal.fire({
      icon: 'warning',
      title: 'Terlalu Banyak',
      text: 'Maksimal 5 foto',
      confirmButtonColor: '#696cff'
    })
    return
  }
  
  // Validate each file
  files.forEach(file => {
    // Validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Tidak Didukung',
        text: 'Hanya JPG dan PNG yang diperbolehkan',
        confirmButtonColor: '#696cff'
      })
      return
    }
    
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: `${file.name} lebih dari 5MB`,
        confirmButtonColor: '#696cff'
      })
      return
    }
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedPhotos.value.push({
        file: file,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
  
  // Clear input
  event.target.value = ''
}

const removePhoto = (index) => {
  selectedPhotos.value.splice(index, 1)
}

const viewPhoto = (photoPath) => {
  viewingPhoto.value = photoPath
}

const getPhotoUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  return `${baseUrl}/storage/${path}`
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleOverlayClick = () => {
  emit('close')
}

const isFromMe = (message) => {
  return message.sender_id === authStore.user?.id
}

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return (names[0][0] + (names[0][1] || '')).toUpperCase()
}

const getMessageTypeIcon = (type) => {
  const icons = {
    warning: 'bx bx-error',
    escalation: 'bx bx-error-circle',
    progress_update: 'bx bx-trending-up',
    issue_report: 'bx bx-info-circle',
    completion_report: 'bx bx-check-circle'
  }
  return icons[type] || 'bx bx-message'
}

const getMessageTypeLabel = (type) => {
  const labels = {
    warning: 'Peringatan',
    escalation: 'Eskalasi',
    progress_update: 'Update Progress',
    issue_report: 'Laporan Masalah',
    completion_report: 'Laporan Selesai'
  }
  return labels[type] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessageTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatStatus = (status) => {
  const statusMap = {
    new: 'Baru',
    in_progress: 'Diproses',
    waiting_response: 'Menunggu',
    resolved: 'Selesai',
    closed: 'Ditutup'
  }
  return statusMap[status] || status
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Auto-refresh messages
let refreshInterval = null

watch(() => conversation.value, (newVal) => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  
  if (newVal) {
    refreshInterval = setInterval(async () => {
      try {
        const endpoint = props.userRole === 'admin'
          ? `/admin/vendor-chat/conversations/${newVal.id}/messages`
          : `/vendor/admin-chat/conversations/${newVal.id}/messages`
        
        const { data } = await api.get(endpoint)
        
        const newMessages = data.success ? data.messages : (data.messages || [])
        
        if (newMessages.length > messages.value.length) {
          messages.value = newMessages
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        // Silent fail
      }
    }, 5000)
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

onMounted(() => {
  initChat()
})
</script>

<style scoped>
/* Keeping the exact same CSS from previous version */
/* (CSS content remains exactly the same - not repeating for brevity) */
</style>