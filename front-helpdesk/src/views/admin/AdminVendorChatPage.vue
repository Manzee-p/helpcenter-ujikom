<template>
  <div class="admin-vendor-chat-page">
    <div class="page-header">
      <h4 class="fw-bold"><i class="bx bx-message-dots me-2"></i>Komunikasi Vendor</h4>
      <p class="text-muted">Kelola komunikasi dengan vendor tentang penanganan tiket</p>
    </div>

    <div v-if="showBackendWarning" class="alert alert-warning">
      <i class="bx bx-error-circle me-2"></i>
      <strong>Perhatian:</strong> Beberapa fitur mungkin tidak tersedia karena masalah koneksi backend.
      <button class="btn-close-alert" @click="showBackendWarning = false">×</button>
    </div>

    <div class="chat-container">
      <!-- Sidebar -->
      <div :class="['conversations-sidebar', { 'mobile-hidden': showChatMobile }]">
        <div class="sidebar-header">
          <div class="search-box">
            <i class="bx bx-search"></i>
            <input type="text" placeholder="Cari vendor atau tiket..." v-model="searchQuery" @input="debouncedSearch" />
          </div>
          <div class="filter-tabs">
            <button :class="['tab-btn', { active: filterMode === 'incoming' }]" @click="switchMode('incoming')">
              <i class="bx bx-message-detail"></i> Chat dari Vendor
              <span class="count">{{ incomingCount }}</span>
            </button>
            <button :class="['tab-btn', { active: filterMode === 'outgoing' }]" @click="switchMode('outgoing')">
              <i class="bx bx-phone-outgoing"></i> Hubungi Vendor
              <span class="count">{{ assignedTicketsCount }}</span>
            </button>
          </div>
        </div>

        <div class="conversations-list">
          <div v-if="filterMode === 'incoming'">
            <div v-if="loadingConversations" class="loading-state"><i class="bx bx-loader-alt bx-spin"></i><p>Memuat percakapan...</p></div>
            <div v-else-if="conversationsError" class="error-state">
              <i class="bx bx-error-circle"></i><p>{{ conversationsError }}</p>
              <button class="btn btn-sm btn-primary mt-2" @click="retryFetchConversations"><i class="bx bx-refresh"></i> Coba Lagi</button>
            </div>
            <div v-else-if="filteredIncomingConversations.length === 0" class="empty-state">
              <i class="bx bx-message-x"></i><p>Tidak ada chat dari vendor</p>
              <small>Vendor dapat memulai chat untuk melaporkan progres atau kendala</small>
            </div>
            <div
              v-else v-for="conv in filteredIncomingConversations" :key="conv.id"
              :class="['conversation-card', { active: activeConversation?.id === conv.id, 'has-unread': conv.unread_count > 0 }]"
              @click="selectConversation(conv)"
            >
              <div class="conv-avatar">
                <img v-if="conv.vendor?.avatar" :src="getAvatarUrl(conv.vendor.avatar)" :alt="conv.vendor.name" />
                <span v-else class="avatar-text">{{ getInitials(conv.vendor?.name) }}</span>
                <span v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count }}</span>
              </div>
              <div class="conv-info">
                <div class="conv-header">
                  <h6>{{ conv.vendor?.name || 'Vendor' }}</h6>
                  <span class="conv-time">{{ formatTime(conv.last_message_at || conv.created_at) }}</span>
                </div>
                <p class="conv-subject"><i class="bx bx-file"></i> {{ conv.ticket?.ticket_number || 'Percakapan' }}</p>
                <p class="conv-preview">{{ conv.latest_message?.message || 'Percakapan baru' }}</p>
                <div class="conv-badges">
                  <span v-if="conv.ticket?.priority" :class="`priority-badge priority-${conv.ticket.priority}`">{{ formatPriority(conv.ticket.priority) }}</span>
                  <span v-if="conv.ticket?.status" :class="`status-badge status-${conv.ticket.status}`">{{ formatStatus(conv.ticket.status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="filterMode === 'outgoing'">
            <div v-if="loadingAssignedTickets" class="loading-state"><i class="bx bx-loader-alt bx-spin"></i><p>Memuat tiket...</p></div>
            <div v-else-if="ticketsError" class="error-state">
              <i class="bx bx-error-circle"></i><p>{{ ticketsError }}</p>
              <button class="btn btn-sm btn-primary mt-2" @click="retryFetchTickets"><i class="bx bx-refresh"></i> Coba Lagi</button>
            </div>
            <div v-else-if="filteredAssignedTickets.length === 0" class="empty-state">
              <i class="bx bx-inbox"></i><p>Tidak ada tiket yang ditugaskan</p>
              <small>Tiket yang ditugaskan ke vendor akan muncul di sini</small>
            </div>
            <div
              v-else v-for="ticket in filteredAssignedTickets" :key="ticket.id"
              :class="['ticket-card', { active: activeTicket?.id === ticket.id, 'has-conversation': ticket.has_conversation }]"
              @click="selectTicket(ticket)"
            >
              <div class="ticket-avatar">
                <img v-if="ticket.vendor?.avatar" :src="getAvatarUrl(ticket.vendor.avatar)" :alt="ticket.vendor.name" />
                <span v-else class="avatar-text">{{ getInitials(ticket.vendor?.name) }}</span>
                <span v-if="ticket.has_conversation" class="chat-indicator"><i class="bx bx-message-dots"></i></span>
              </div>
              <div class="ticket-info">
                <div class="ticket-header-row">
                  <h6>{{ ticket.vendor?.name || 'Vendor' }}</h6>
                  <span class="ticket-time">{{ formatTime(ticket.assigned_at) }}</span>
                </div>
                <p class="ticket-number"><i class="bx bx-file"></i> #{{ ticket.ticket_number }}</p>
                <p class="ticket-title">{{ ticket.title }}</p>
                <div class="ticket-badges">
                  <span :class="`priority-badge priority-${ticket.priority}`">{{ formatPriority(ticket.priority) }}</span>
                  <span :class="`status-badge status-${ticket.status}`">{{ formatStatus(ticket.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div :class="['chat-area', { 'mobile-visible': showChatMobile }]">
        <div v-if="!activeConversation && !activeTicket" class="no-conversation">
          <div v-if="filterMode === 'outgoing'" class="ticket-search-form">
            <div class="form-icon"><i class="bx bx-search-alt"></i></div>
            <h5>Cari Tiket untuk Hubungi Vendor</h5>
            <p class="text-muted mb-4">Masukkan nomor tiket yang ingin Anda diskusikan dengan vendor</p>
            <div class="search-input-group">
              <input type="text" v-model="ticketSearchNumber" placeholder="Contoh: TKT-2024-001" class="form-control" @keyup.enter="searchTicketByNumber" />
              <button class="btn btn-primary" @click="searchTicketByNumber" :disabled="!ticketSearchNumber.trim() || searchingTicket">
                <i v-if="!searchingTicket" class="bx bx-search"></i>
                <i v-else class="bx bx-loader-alt bx-spin"></i>
                Cari Tiket
              </button>
            </div>
            <div v-if="ticketSearchError" class="alert alert-danger mt-3"><i class="bx bx-error-circle me-2"></i>{{ ticketSearchError }}</div>
            <div class="or-divider"><span>atau</span></div>
            <p class="text-muted small"><i class="bx bx-info-circle me-1"></i>Pilih tiket dari daftar di samping yang sudah ditugaskan ke vendor</p>
          </div>
          <div v-else class="no-conv-default">
            <div class="no-conv-icon"><i class="bx bx-message-detail"></i></div>
            <h5>Pilih Percakapan</h5>
            <p>Pilih percakapan dari vendor untuk membalas</p>
          </div>
        </div>

        <div v-else class="chat-active">
          <div class="chat-header">
            <div class="chat-header-left">
              <button class="btn-back-mobile" @click="closeChat">
                <i class="bx bx-arrow-back"></i>
              </button>
              <div class="vendor-avatar">
                <img v-if="currentVendor?.avatar" :src="getAvatarUrl(currentVendor.avatar)" :alt="currentVendor.name" />
                <span v-else class="avatar-text">{{ getInitials(currentVendor?.name) }}</span>
              </div>
              <div class="vendor-info">
                <h5>{{ currentVendor?.name }}</h5>
                <p>
                  <i class="bx bx-building"></i>
                  {{ currentVendor?.company_name || 'Vendor' }}
                  <span v-if="currentVendor?.specialization" class="ms-2">• {{ currentVendor.specialization }}</span>
                </p>
              </div>
            </div>
            <div class="chat-header-actions">
              <button v-if="currentTicket" class="btn btn-sm btn-outline-primary" @click="viewTicket(currentTicket.id)">
                <i class="bx bx-link-external"></i> <span class="btn-text">Lihat Tiket</span>
              </button>
              <button v-if="activeConversation && activeConversation.status === 'active'" class="btn btn-sm btn-outline-success" @click="resolveConversation">
                <i class="bx bx-check-double"></i> <span class="btn-text">Tandai Selesai</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary btn-close-desktop" @click="closeChat">
                <i class="bx bx-x"></i> <span class="btn-text">Tutup</span>
              </button>
            </div>
          </div>

          <div v-if="currentTicket" class="ticket-info-bar">
            <i class="bx bx-file"></i>
            <div class="ticket-details">
              <strong>#{{ currentTicket.ticket_number }}</strong>
              <span>{{ currentTicket.title }}</span>
              <div v-if="currentTicket.venue" class="ticket-meta">
                <i class="bx bx-map-pin"></i>{{ currentTicket.venue }}<span v-if="currentTicket.area"> - {{ currentTicket.area }}</span>
              </div>
            </div>
            <span :class="`status-badge status-${currentTicket.status}`">{{ formatStatus(currentTicket.status) }}</span>
            <span :class="`priority-badge priority-${currentTicket.priority}`">{{ formatPriority(currentTicket.priority) }}</span>
          </div>

          <div class="messages-area" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading-messages">
              <i class="bx bx-loader-alt bx-spin"></i><p>Memuat pesan...</p>
            </div>
            <div v-else class="messages-list">
              <div class="conversation-start">
                <div class="start-icon"><i class="bx bx-message-detail"></i></div>
                <p>Percakapan dimulai</p>
                <small>{{ formatDate(conversationStartDate) }}</small>
              </div>
              <div
                v-for="message in messages" :key="message.id"
                :class="['message-item', isFromMe(message) ? 'message-sent' : 'message-received', `message-type-${message.message_type || 'regular'}`]"
              >
                <div v-if="!isFromMe(message)" class="message-avatar">
                  <img v-if="message.sender?.avatar" :src="getAvatarUrl(message.sender.avatar)" :alt="message.sender.name" />
                  <span v-else>{{ getInitials(message.sender?.name) }}</span>
                </div>
                <div class="message-content">
                  <div v-if="!isFromMe(message)" class="message-sender">
                    {{ message.sender?.name }}
                    <span v-if="message.message_type && message.message_type !== 'regular'" class="message-type-label">
                      {{ formatMessageType(message.message_type) }}
                    </span>
                  </div>
                  <div :class="['message-bubble', { 'has-photos': message.completion_photos?.length > 0 }, { 'photo-only': message.completion_photos?.length > 0 && !message.message }]">
                    <template v-if="message.completion_photos?.length > 0">
                      <div :class="['wa-photos-grid', `wa-grid-${Math.min(message.completion_photos.length, 4)}`]">
                        <div v-for="(photo, index) in message.completion_photos" v-show="index < 4" :key="index" class="wa-photo-cell" @click="viewPhoto(getPhotoUrl(photo))">
                          <img :src="getPhotoUrl(photo)" :alt="`Photo ${index + 1}`" />
                          <div v-if="index === 3 && message.completion_photos.length > 4" class="wa-more-overlay">+{{ message.completion_photos.length - 4 }}</div>
                        </div>
                      </div>
                    </template>
                    <p v-if="message.message" class="bubble-text">{{ message.message }}</p>
                    <div v-if="message.completion_notes" class="completion-notes">
                      <strong>Catatan:</strong><p>{{ message.completion_notes }}</p>
                    </div>
                  </div>
                  <div class="message-meta">
                    <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
                    <button
                      v-if="isFromMe(message) && !message.is_deleted"
                      class="message-edit-btn"
                      type="button"
                      @click="editMessage(message)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="isFromMe(message) && !message.is_deleted"
                      class="message-delete-btn"
                      type="button"
                      @click="deleteMessage(message)"
                    >
                      Hapus
                    </button>
                    <span v-if="isFromMe(message)" class="message-status">
                      <i :class="['bx', message.is_read ? 'bx-check-double' : 'bx-check', message.is_read ? 'read' : '']"></i>
                    </span>
                  </div>
                </div>
              </div>

              <transition name="typing-fade">
                <div v-if="typingUser" class="message-item message-received">
                  <div class="message-content">
                    <div class="message-bubble bubble--typing">
                      <span class="typing-text">sedang mengetik</span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div v-if="canSendMessage" class="message-input">
            <div class="message-type-selector">
              <select v-model="messageType" class="form-select form-select-sm">
                <option value="regular">Pesan Biasa</option>
                <option value="warning">⚠️ Peringatan</option>
                <option value="escalation">🚨 Eskalasi</option>
              </select>
            </div>
            <div class="input-row">
              <textarea v-model="newMessage" placeholder="Ketik pesan Anda..." rows="1" @keydown.enter.exact.prevent="sendMessage" @input="handleTyping" ref="messageTextarea"></textarea>
              <button class="btn-send" @click="sendMessage" :disabled="!newMessage.trim() || sending">
                <i v-if="!sending" class="bx bx-send"></i>
                <i v-else class="bx bx-loader-alt bx-spin"></i>
              </button>
            </div>
          </div>
          <div v-else class="conversation-closed-notice">
            <i class="bx bx-lock"></i>
            Percakapan ini sudah {{ activeConversation?.status === 'resolved' ? 'selesai' : 'ditutup' }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="photoViewerUrl" class="photo-viewer-modal" @click="closePhotoViewer">
      <div class="photo-viewer-content" @click.stop>
        <button class="close-btn" @click="closePhotoViewer"><i class="bx bx-x"></i></button>
        <img :src="photoViewerUrl" alt="Photo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { initEcho } from '@/services/pusher'
import Swal from 'sweetalert2'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const conversations          = ref([])
const assignedTickets        = ref([])
const activeConversation     = ref(null)
const activeTicket           = ref(null)
const messages               = ref([])
const newMessage             = ref('')
const messageType            = ref('regular')
const searchQuery            = ref('')
const filterMode             = ref('incoming')
const loadingConversations   = ref(false)
const loadingAssignedTickets = ref(false)
const loadingMessages        = ref(false)
const sending                = ref(false)
const photoViewerUrl         = ref(null)
const showBackendWarning     = ref(false)
const conversationsError     = ref('')
const ticketsError           = ref('')
const ticketSearchNumber     = ref('')
const searchingTicket        = ref(false)
const ticketSearchError      = ref('')
const messagesContainer      = ref(null)
const messageTextarea        = ref(null)
const isConnected            = ref(false)
const showChatMobile         = ref(false)
const typingUser             = ref(null)

let echoChannel = null
const allEchoChannels = []
let typingTimer = null
let sendTypingThrottle = null

const incomingCount        = computed(() => conversations.value.length)
const assignedTicketsCount = computed(() => assignedTickets.value.length)

const filteredIncomingConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c =>
    c.vendor?.name?.toLowerCase().includes(q) ||
    c.ticket?.ticket_number?.toLowerCase().includes(q) ||
    c.subject?.toLowerCase().includes(q)
  )
})

const filteredAssignedTickets = computed(() => {
  if (!searchQuery.value.trim()) return assignedTickets.value
  const q = searchQuery.value.toLowerCase()
  return assignedTickets.value.filter(t =>
    t.vendor?.name?.toLowerCase().includes(q) ||
    t.ticket_number?.toLowerCase().includes(q) ||
    t.title?.toLowerCase().includes(q)
  )
})

const currentVendor = computed(() => {
  if (activeConversation.value) return activeConversation.value.vendor
  if (activeTicket.value) {
    if (activeTicket.value.vendor) return activeTicket.value.vendor
    if (typeof activeTicket.value.assigned_to === 'object') return activeTicket.value.assigned_to
  }
  return null
})

const currentTicket         = computed(() => activeConversation.value?.ticket || activeTicket.value || null)
const conversationStartDate = computed(() => activeConversation.value?.created_at || messages.value[0]?.created_at || new Date())
const canSendMessage        = computed(() => {
  if (activeConversation.value) return activeConversation.value.status === 'active'
  if (activeTicket.value) return ['new', 'in_progress', 'waiting_response'].includes(activeTicket.value.status)
  return false
})

// ✅ Update centang biru semua pesan milik admin
function applyReadUpdate() {
  messages.value = messages.value.map(msg => ({
    ...msg,
    is_read: msg.sender_id === authStore.user?.id ? true : msg.is_read
  }))
}

function showTypingIndicator(user) {
  typingUser.value = user
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    typingUser.value = null
  }, 3000)
  nextTick(() => scrollToBottom())
}

function clearTypingIndicator() {
  typingUser.value = null
  clearTimeout(typingTimer)
}

// ============================================================
// ✅ Subscribe ke SEMUA conversations
// - Tangkap .message.sent → update unread badge di sidebar
// - Tangkap .messages.read → update centang biru
// ============================================================
function subscribeToAllConversations() {
  unsubscribeFromAllConversations()
  if (!window.Echo) { initEcho() }
  if (!window.Echo) return

  conversations.value.forEach(conv => {
    const channelName = `conversation.${conv.id}`
    const ch = window.Echo.private(channelName)

    // ✅ Pesan baru masuk dari vendor
    ch.listen('.message.sent', async (data) => {
      if (!data.message) return
      const convId = conv.id

      // Update latest_message dan last_message_at di sidebar
      const index = conversations.value.findIndex(c => c.id === convId)
      if (index !== -1) {
        conversations.value[index].latest_message  = data.message
        conversations.value[index].last_message_at = data.message.created_at
      }

      // Jika conversation ini TIDAK sedang aktif → tambah unread badge
      if (activeConversation.value?.id !== convId) {
        if (index !== -1) {
          conversations.value[index].unread_count =
            (conversations.value[index].unread_count || 0) + 1
        }
      } else {
        // Conversation ini sedang aktif → push pesan ke UI & mark as read
        const exists = messages.value.some(m => m.id === data.message.id)
        if (!exists) {
          messages.value.push(data.message)
          await nextTick()
          scrollToBottom()
          markAsRead(convId).catch(() => {})
        }
        clearTypingIndicator()
      }
    })

    // ✅ Vendor baca pesan admin → update centang biru
    ch.listen('.messages.read', () => {
      if (activeConversation.value?.id === conv.id) {
        applyReadUpdate()
      }
    })

    ch.listen('.message.deleted', (data) => {
      if (!data.message) return
      const targetId = data.message.id
      messages.value = messages.value.map((msg) => (msg.id === targetId ? { ...msg, ...data.message } : msg))

      const index = conversations.value.findIndex(c => c.id === conv.id)
      if (index !== -1 && conversations.value[index].latest_message?.id === targetId) {
        conversations.value[index].latest_message = data.message
      }
    })

    ch.listen('.message.updated', (data) => {
      if (!data.message) return
      const targetId = data.message.id
      messages.value = messages.value.map((msg) => (msg.id === targetId ? { ...msg, ...data.message } : msg))

      const index = conversations.value.findIndex(c => c.id === conv.id)
      if (index !== -1 && conversations.value[index].latest_message?.id === targetId) {
        conversations.value[index].latest_message = data.message
      }
    })

    ch.listen('.user.typing', (data) => {
      if (!data.user || data.user.id === authStore.user?.id) return
      if (activeConversation.value?.id !== conv.id) return
      showTypingIndicator(data.user)
    })

    allEchoChannels.push(channelName)
  })
}

function unsubscribeFromAllConversations() {
  allEchoChannels.forEach(channelName => window.Echo?.leaveChannel(channelName))
  allEchoChannels.length = 0
}

// ============================================================
// ✅ Subscribe ke 1 conversation aktif — hanya untuk mark as read
// dan .messages.read backup (tidak perlu .message.sent lagi
// karena sudah ditangani subscribeToAllConversations)
// ============================================================
function subscribeToConversation(conversationId) {
  if (echoChannel) { window.Echo?.leaveChannel(echoChannel.name); echoChannel = null }
  // Tidak perlu subscribe ulang karena allEchoChannels sudah handle
  // Simpan referensi saja untuk unsubscribe saat ganti conversation
  isConnected.value = true
}

function unsubscribeFromConversation() {
  if (echoChannel) { window.Echo?.leaveChannel(echoChannel.name); echoChannel = null; isConnected.value = false }
}

// ============================================================
// API
// ============================================================
const safeApiCall = async (fn, errMsg = 'Operasi gagal') => {
  try { return await fn() }
  catch (error) {
    if (error.isNetworkError || error.isTimeout) { showBackendWarning.value = true; throw new Error('Koneksi bermasalah.') }
    if (error.response?.status === 404) throw new Error('Fitur belum tersedia.')
    if (error.response?.status === 500) { showBackendWarning.value = true; throw new Error('Server error.') }
    if (error.response?.status === 401) throw new Error('Sesi berakhir.')
    throw new Error(error.response?.data?.message || errMsg)
  }
}

const switchMode = (mode) => {
  filterMode.value = mode
  conversationsError.value = ''
  ticketsError.value = ''
  if (mode === 'incoming' && conversations.value.length === 0) fetchIncomingConversations()
  else if (mode === 'outgoing' && assignedTickets.value.length === 0) fetchAssignedTickets()
}

const searchTicketByNumber = async () => {
  if (!ticketSearchNumber.value.trim()) return
  searchingTicket.value = true; ticketSearchError.value = ''
  try {
    const { data } = await safeApiCall(() => api.get('/tickets', { params: { search: ticketSearchNumber.value.trim(), per_page: 100 } }))
    const tickets  = data?.data || data || []
    const ticket   = Array.isArray(tickets) ? tickets.find(t => t.ticket_number?.toLowerCase() === ticketSearchNumber.value.trim().toLowerCase()) : null
    if (!ticket)             { ticketSearchError.value = 'Tiket tidak ditemukan.'; return }
    if (!ticket.assigned_to) { ticketSearchError.value = 'Tiket ini belum ditugaskan ke vendor.'; return }
    await selectTicket(ticket); ticketSearchNumber.value = ''
    Swal.fire({ icon: 'success', title: 'Tiket Ditemukan', text: `Tiket #${ticket.ticket_number} berhasil dimuat`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
  } catch (error) { ticketSearchError.value = error.message }
  finally { searchingTicket.value = false }
}

const fetchIncomingConversations = async () => {
  loadingConversations.value = true; conversationsError.value = ''
  try {
    const { data } = await safeApiCall(() => api.get('/admin/vendor-chat/conversations', { params: { per_page: 50 } }))
    conversations.value = data?.data || data || []
    // ✅ Subscribe ke semua conversation setelah data loaded
    subscribeToAllConversations()
  } catch (error) {
    conversationsError.value = error.message
    conversations.value = []
  } finally { loadingConversations.value = false }
}

const retryFetchConversations = () => { conversationsError.value = ''; fetchIncomingConversations() }

const fetchAssignedTickets = async () => {
  loadingAssignedTickets.value = true; ticketsError.value = ''
  try {
    const { data } = await safeApiCall(() => api.get('/admin/vendor-chat/assigned-tickets', { params: { per_page: 100 } }))
    assignedTickets.value = data?.data || data || []
  } catch {
    try {
      const { data } = await safeApiCall(() => api.get('/tickets', { params: { per_page: 100 } }))
      const tickets = data?.data || data || []
      assignedTickets.value = Array.isArray(tickets)
        ? tickets.filter(t => t.assigned_to != null && ['in_progress', 'waiting_response', 'new'].includes(t.status))
        : []
    } catch (e) { ticketsError.value = e.message; assignedTickets.value = [] }
  } finally { loadingAssignedTickets.value = false }
}

const retryFetchTickets = () => { ticketsError.value = ''; fetchAssignedTickets() }

const selectConversation = async (conversation) => {
  clearTypingIndicator()
  activeConversation.value = conversation
  activeTicket.value = null
  showChatMobile.value = true
  subscribeToConversation(conversation.id)
  await fetchMessages(conversation.id)
}

const selectTicket = async (ticket) => {
  clearTypingIndicator()
  activeTicket.value = ticket
  activeConversation.value = null
  showChatMobile.value = true
  unsubscribeFromConversation()
  try {
    const { data }     = await safeApiCall(() => api.get('/admin/vendor-chat/conversations', { params: { ticket_id: ticket.id } }))
    const convs        = data?.data || data || []
    const vendorId     = typeof ticket.assigned_to === 'object' ? ticket.assigned_to?.id : ticket.assigned_to
    const existingConv = Array.isArray(convs) ? convs.find(c => c.ticket_id === ticket.id && c.vendor_id === vendorId) : null
    if (existingConv) {
      clearTypingIndicator()
      activeConversation.value = existingConv
      activeTicket.value = null
      subscribeToConversation(existingConv.id)
      await fetchMessages(existingConv.id)
    } else { messages.value = [] }
  } catch { messages.value = [] }
}

const fetchMessages = async (conversationId) => {
  loadingMessages.value = true
  try {
    const { data } = await safeApiCall(() => api.get(`/admin/vendor-chat/conversations/${conversationId}/messages`))
    messages.value = data?.messages || data?.data || []
    clearTypingIndicator()
    if (data.conversation) activeConversation.value = { ...activeConversation.value, ...data.conversation }
    await nextTick(); scrollToBottom()
    markAsRead(conversationId).catch(() => {})
    // ✅ Reset unread badge conversation ini
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index !== -1) conversations.value[index].unread_count = 0
  } catch { messages.value = [] }
  finally { loadingMessages.value = false }
}

const markAsRead = async (conversationId) => {
  try { await api.post(`/admin/vendor-chat/conversations/${conversationId}/mark-read`) } catch {}
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  const messageText = newMessage.value, msgType = messageType.value
  clearTimeout(sendTypingThrottle)
  sendTypingThrottle = null
  clearTypingIndicator()
  newMessage.value = ''; sending.value = true
  try {
    let conversationId = activeConversation.value?.id
    if (!conversationId && activeTicket.value) {
      const { data: convData } = await safeApiCall(() => api.post('/admin/vendor-chat/conversations', {
        vendor_id:    typeof activeTicket.value.assigned_to === 'object' ? activeTicket.value.assigned_to?.id : activeTicket.value.assigned_to,
        ticket_id:    activeTicket.value.id,
        subject:      `Tiket #${activeTicket.value.ticket_number}`,
        message:      messageText,
        message_type: msgType
      }))
      if (convData.success && convData.data) {
        activeConversation.value = convData.data; activeTicket.value = null
        conversationId = convData.data.id
        await fetchIncomingConversations()
        subscribeToConversation(conversationId)
        await fetchMessages(conversationId)
        messageType.value = 'regular'; sending.value = false; return
      }
    }
    const { data } = await safeApiCall(() => api.post(
      `/admin/vendor-chat/conversations/${conversationId}/messages`,
      { message: messageText, message_type: msgType }
    ))
    const newMsg = data.success ? data.data : data

    // ✅ Cek duplikat sebelum push
    const exists = messages.value.some(m => m.id === newMsg.id)
    if (!exists) {
      messages.value.push(newMsg)
    }

    messageType.value = 'regular'
    await nextTick(); scrollToBottom()
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      conversations.value[index].last_message_at = new Date().toISOString()
      conversations.value[index].latest_message  = newMsg
    }
  } catch (error) {
    newMessage.value = messageText
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, confirmButtonColor: '#696cff' })
  } finally { sending.value = false }
}

const deleteMessage = async (message) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus pesan ini?',
    text: 'Pesan akan ditandai sebagai dihapus untuk semua pihak di percakapan ini.',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545',
  })

  if (!result.isConfirmed || !activeConversation.value?.id) return

  try {
    const { data } = await safeApiCall(() =>
      api.delete(`/admin/vendor-chat/conversations/${activeConversation.value.id}/messages/${message.id}`)
    )

    const deletedMessage = data?.data
    if (deletedMessage?.id) {
      messages.value = messages.value.map((msg) => (msg.id === deletedMessage.id ? { ...msg, ...deletedMessage } : msg))
      const index = conversations.value.findIndex(c => c.id === activeConversation.value.id)
      if (index !== -1 && conversations.value[index].latest_message?.id === deletedMessage.id) {
        conversations.value[index].latest_message = deletedMessage
      }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Pesan tidak berhasil dihapus', confirmButtonColor: '#696cff' })
  }
}

const editMessage = async (message) => {
  const result = await Swal.fire({
    title: 'Edit pesan',
    input: 'textarea',
    inputValue: message.message || '',
    inputLabel: 'Perbarui isi pesan',
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#696cff',
    inputValidator: (value) => (!value?.trim() ? 'Pesan tidak boleh kosong' : undefined),
  })

  if (!result.isConfirmed || !activeConversation.value?.id) return

  try {
    const { data } = await safeApiCall(() =>
      api.put(`/admin/vendor-chat/conversations/${activeConversation.value.id}/messages/${message.id}`, {
        message: result.value,
      })
    )

    const updatedMessage = data?.data
    if (updatedMessage?.id) {
      messages.value = messages.value.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
      const index = conversations.value.findIndex(c => c.id === activeConversation.value.id)
      if (index !== -1 && conversations.value[index].latest_message?.id === updatedMessage.id) {
        conversations.value[index].latest_message = updatedMessage
      }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.message || 'Pesan tidak berhasil diperbarui', confirmButtonColor: '#696cff' })
  }
}

const resolveConversation = async () => {
  const result = await Swal.fire({
    title: 'Tandai Selesai?', text: 'Percakapan akan ditandai sebagai selesai',
    icon: 'question', showCancelButton: true,
    confirmButtonColor: '#28a745', cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Tandai Selesai', cancelButtonText: 'Batal'
  })
  if (result.isConfirmed) {
    try {
      await safeApiCall(() => api.patch(`/admin/vendor-chat/conversations/${activeConversation.value.id}`, { status: 'resolved' }))
      activeConversation.value.status = 'resolved'
      await fetchIncomingConversations()
      Swal.fire({ icon: 'success', title: 'Selesai', text: 'Percakapan ditandai sebagai selesai', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
    } catch (error) { Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, confirmButtonColor: '#696cff' }) }
  }
}

const closeChat = () => {
  unsubscribeFromConversation()
  clearTypingIndicator()
  activeConversation.value = null; activeTicket.value = null
  messages.value = []; ticketSearchError.value = ''
  showChatMobile.value = false
}

const viewTicket       = (id) => router.push({ path: `/admin/tickets/${id}`, query: { from: 'vendor-chat' } })
const viewPhoto        = (url) => { photoViewerUrl.value = url }
const closePhotoViewer = () => { photoViewerUrl.value = null }
const scrollToBottom   = () => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }
const autoResize       = (e) => { const t = e.target; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }
const handleTyping     = (e) => {
  autoResize(e)
  if (sendTypingThrottle || !activeConversation.value?.id || !newMessage.value.trim()) return
  sendTypingThrottle = setTimeout(async () => {
    sendTypingThrottle = null
    try {
      await api.post(`/admin/vendor-chat/conversations/${activeConversation.value.id}/typing`)
    } catch {}
  }, 450)
}
const isFromMe         = (m) => m.sender_id === authStore.user?.id
const getInitials      = (name) => { if (!name) return '?'; const n = name.split(' '); return n.length > 1 ? (n[0][0] + n[n.length-1][0]).toUpperCase() : (n[0][0] + (n[0][1] || '')).toUpperCase() }
const getAvatarUrl     = (a) => { if (!a) return ''; if (a.startsWith('http')) return a; return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${a}` }
const getPhotoUrl      = (p) => { if (!p) return ''; if (p.startsWith('http')) return p; return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${p}` }
const formatTime       = (d) => { if (!d) return ''; const date = new Date(d), now = new Date(), diff = Math.floor((now-date)/60000); if (diff<1) return 'Baru saja'; if (diff<60) return `${diff}m`; const h = Math.floor(diff/60); if (h<24) return `${h}j`; const days = Math.floor(h/24); if (days<7) return `${days}h`; return date.toLocaleDateString('id-ID',{day:'numeric',month:'short'}) }
const formatDate       = (d) => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''
const formatMessageTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : ''
const formatStatus     = (s) => ({ new:'Baru', in_progress:'Diproses', waiting_response:'Menunggu', resolved:'Selesai', closed:'Ditutup' }[s] || s)
const formatPriority   = (p) => ({ low:'Rendah', medium:'Sedang', high:'Tinggi', urgent:'Kritis' }[p] || p)
const formatMessageType = (t) => ({ regular:'Biasa', warning:'⚠️ Peringatan', escalation:'🚨 Eskalasi', progress_update:'📊 Update Progres', issue_report:'⚠️ Laporan Kendala', completion_report:'✅ Laporan Selesai', system:'🤖 Sistem' }[t] || t)

const debouncedSearch = debounce(() => {}, 500)
function debounce(func, wait) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func.apply(this, args), wait) } }

onBeforeUnmount(() => {
  unsubscribeFromConversation()
  unsubscribeFromAllConversations()
  clearTypingIndicator()
  clearTimeout(sendTypingThrottle)
})

onMounted(async () => {
  const ticketId = route.query.ticket_id, mode = route.query.mode
  if (ticketId && mode === 'outgoing') {
    filterMode.value = 'outgoing'; await fetchAssignedTickets()
    const found = assignedTickets.value.find(t => String(t.id) === String(ticketId))
    if (found) await selectTicket(found)
  } else { fetchIncomingConversations() }
})
</script>

<style scoped>
.admin-vendor-chat-page { padding: 2rem; max-width: 1600px; margin: 0 auto; }
.page-header { margin-bottom: 2rem; }
.page-header h4 { color: #2c3e50; margin-bottom: 0.5rem; }
.alert-warning { margin-bottom: 1rem; border-left: 4px solid #ffc107; padding: 0.75rem 1rem; background: #fff3cd; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; }
.btn-close-alert { margin-left: auto; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #856404; }
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; color: #dc3545; }
.error-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.error-state p { color: #6c757d; margin-bottom: 0.5rem; }
.chat-container { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; height: calc(100vh - 180px); }
.conversations-sidebar { display: flex; flex-direction: column; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.1); overflow: hidden; }
.sidebar-header { padding: 1.5rem; border-bottom: 1px solid #e9ecef; }
.search-box { position: relative; margin-bottom: 1rem; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; }
.search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 1px solid #e9ecef; border-radius: 8px; font-size: 0.875rem; transition: all 0.3s; }
.search-box input:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.filter-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.tab-btn { padding: 0.75rem 0.5rem; border: 1px solid #e9ecef; background: white; border-radius: 6px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
.tab-btn:hover { border-color: #696cff; background: #f8f9fe; }
.tab-btn.active { background: #696cff; color: white; border-color: #696cff; }
.tab-btn .count { background: rgba(0,0,0,.1); padding: 0.1rem 0.4rem; border-radius: 10px; font-size: 0.7rem; }
.tab-btn.active .count { background: rgba(255,255,255,.2); }
.conversations-list { flex: 1; overflow-y: auto; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; color: #6c757d; }
.loading-state i, .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-state small { font-size: 0.8rem; margin-top: 0.25rem; }
.conversation-card { display: flex; gap: 1rem; padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef; cursor: pointer; transition: all 0.3s; }
.conversation-card:hover { background: #f8f9fa; }
.conversation-card.active { background: #f8f9fe; border-left: 3px solid #696cff; }
.conversation-card.has-unread { background: #fffbf0; }
.conv-avatar { position: relative; flex-shrink: 0; }
.conv-avatar img, .conv-avatar .avatar-text { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.conv-avatar .avatar-text { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
.unread-badge { position: absolute; top: -4px; right: -4px; background: #dc3545; color: white; font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 10px; font-weight: 700; }
.conv-info { flex: 1; min-width: 0; }
.conv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.conv-header h6 { margin: 0; font-size: 0.9rem; font-weight: 600; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-time { font-size: 0.7rem; color: #6c757d; flex-shrink: 0; }
.conv-subject { font-size: 0.8rem; color: #495057; margin: 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-preview { font-size: 0.75rem; color: #6c757d; margin: 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-badges { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.ticket-card { display: flex; gap: 1rem; padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef; cursor: pointer; transition: all 0.3s; }
.ticket-card:hover { background: #f8f9fa; }
.ticket-card.active { background: #f8f9fe; border-left: 3px solid #696cff; }
.ticket-card.has-conversation { background: #f0f8ff; }
.ticket-avatar { position: relative; flex-shrink: 0; }
.ticket-avatar img, .ticket-avatar .avatar-text { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.ticket-avatar .avatar-text { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
.chat-indicator { position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; background: #696cff; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
.chat-indicator i { font-size: 0.7rem; color: white; }
.ticket-info { flex: 1; min-width: 0; }
.ticket-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.ticket-header-row h6 { margin: 0; font-size: 0.9rem; font-weight: 600; color: #2c3e50; }
.ticket-time { font-size: 0.7rem; color: #6c757d; }
.ticket-number { font-size: 0.8rem; color: #696cff; margin: 0.25rem 0; font-weight: 500; }
.ticket-title { font-size: 0.75rem; color: #6c757d; margin: 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ticket-badges { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.chat-area { display: flex; flex-direction: column; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.1); overflow: hidden; }
.no-conversation { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; }
.ticket-search-form { max-width: 500px; width: 100%; text-align: center; }
.form-icon { margin-bottom: 1.5rem; }
.form-icon i { font-size: 4rem; color: #696cff; opacity: 0.7; }
.ticket-search-form h5 { color: #2c3e50; margin-bottom: 0.5rem; }
.search-input-group { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.search-input-group .form-control { flex: 1; padding: 0.75rem 1rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.9rem; transition: all 0.3s; }
.search-input-group .form-control:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.search-input-group .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.or-divider { position: relative; text-align: center; margin: 2rem 0; }
.or-divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #e9ecef; }
.or-divider span { position: relative; background: white; padding: 0 1rem; color: #6c757d; font-size: 0.875rem; }
.no-conv-default { text-align: center; color: #6c757d; }
.no-conv-icon i { font-size: 4rem; opacity: 0.3; margin-bottom: 1rem; display: block; }
.chat-active { display: flex; flex-direction: column; height: 100%; }
.chat-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e9ecef; background: white; }
.chat-header-left { display: flex; gap: 1rem; align-items: center; }
.vendor-avatar img, .vendor-avatar .avatar-text { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.vendor-avatar .avatar-text { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
.vendor-info h5 { margin: 0; font-size: 1rem; color: #2c3e50; }
.vendor-info p { margin: 0.2rem 0 0; font-size: 0.8rem; color: #6c757d; display: flex; align-items: center; gap: 0.25rem; }
.chat-header-actions { display: flex; gap: 0.5rem; }
.ticket-info-bar { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.5rem; background: #f8f9fe; border-bottom: 1px solid #e9ecef; }
.ticket-info-bar > i { font-size: 1.4rem; color: #696cff; }
.ticket-details { flex: 1; }
.ticket-details strong { color: #2c3e50; margin-right: 0.5rem; }
.ticket-details span { color: #495057; font-size: 0.875rem; }
.ticket-meta { font-size: 0.75rem; color: #6c757d; margin-top: 0.2rem; }
.messages-area { flex: 1; overflow-y: auto; padding: 1.5rem; background: #f4f5f7; }
.loading-messages { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6c757d; }
.loading-messages i { font-size: 2rem; margin-bottom: 0.5rem; }
.messages-list { display: flex; flex-direction: column; gap: 1rem; }
.conversation-start { text-align: center; padding: 1.5rem 0; }
.start-icon i { font-size: 2rem; color: #6c757d; opacity: 0.4; }
.conversation-start p { margin: 0.5rem 0; color: #495057; font-weight: 500; font-size: 0.875rem; }
.conversation-start small { color: #6c757d; font-size: 0.75rem; }
.message-item { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
.message-sent { flex-direction: row-reverse; }
.message-avatar { flex-shrink: 0; }
.message-avatar img, .message-avatar span { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.message-avatar span { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 0.75rem; font-weight: 600; }
.message-content { max-width: 70%; }
.message-sent .message-content { display: flex; flex-direction: column; align-items: flex-end; }
.message-sender { font-size: 0.75rem; color: #495057; margin-bottom: 0.25rem; font-weight: 500; }
.message-type-label { background: #fff3cd; color: #856404; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem; }
.message-bubble { border-radius: 12px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,.08); word-wrap: break-word; font-size: 0.875rem; overflow: hidden; padding: 0.75rem 1rem; }
.message-bubble.has-photos { padding: 0; }
.bubble-text { margin: 0; line-height: 1.5; padding: 0.5rem 1rem 0.75rem; }
.message-bubble:not(.has-photos) .bubble-text { padding: 0; }
.message-bubble.has-photos .completion-notes { padding: 0.5rem 1rem 0.75rem; margin: 0; background: rgba(0,0,0,.03); }
.message-sent .message-bubble { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.message-sent .bubble-text { color: white; }
.message-sent .completion-notes { background: rgba(255,255,255,.15); color: white; }
.message-sent .completion-notes p { color: rgba(255,255,255,.85); }
.message-received .message-bubble { background: white; color: #2c3e50; }
.bubble--typing { display: inline-flex; align-items: center; gap: 5px; min-width: 132px; padding: 0.8rem 1rem !important; }
.message-type-warning .message-bubble { border-left: 4px solid #ffc107; padding: 0.75rem 1rem !important; }
.message-type-escalation .message-bubble { border-left: 4px solid #dc3545; padding: 0.75rem 1rem !important; }
.message-type-completion_report .message-bubble { border-left: 4px solid #28a745; }
.wa-photos-grid { display: grid; gap: 2px; width: 100%; overflow: hidden; border-radius: 10px 10px 0 0; line-height: 0; }
.photo-only .wa-photos-grid { border-radius: 10px; }
.wa-grid-1 { grid-template-columns: 1fr; } .wa-grid-1 .wa-photo-cell img { height: 220px; }
.wa-grid-2 { grid-template-columns: 1fr 1fr; } .wa-grid-2 .wa-photo-cell img { height: 160px; }
.wa-grid-3 { grid-template-columns: 1fr 1fr; } .wa-grid-3 .wa-photo-cell:first-child { grid-row: span 2; } .wa-grid-3 .wa-photo-cell img { height: 120px; } .wa-grid-3 .wa-photo-cell:first-child img { height: 100%; }
.wa-grid-4 { grid-template-columns: 1fr 1fr; } .wa-grid-4 .wa-photo-cell img { height: 130px; }
.wa-photo-cell { position: relative; overflow: hidden; background: #000; cursor: pointer; }
.wa-photo-cell img { width: 100%; object-fit: cover; display: block; transition: transform 0.25s ease, opacity 0.25s ease; }
.wa-photo-cell:hover img { transform: scale(1.04); opacity: 0.9; }
.wa-more-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; }
.completion-notes { margin-top: 0.75rem; padding: 0.75rem; background: rgba(0,0,0,.04); border-radius: 8px; font-size: 0.8rem; }
.completion-notes strong { display: block; margin-bottom: 0.25rem; font-size: 0.8rem; }
.completion-notes p { margin: 0; font-size: 0.8rem; }
.message-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
.message-sent .message-meta { justify-content: flex-end; }
.message-time { font-size: 0.7rem; color: #6c757d; }
.message-edit-btn { border: none; background: transparent; color: #4f46e5; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; }
.message-edit-btn:hover { opacity: 0.8; }
.message-delete-btn { border: none; background: transparent; color: #dc3545; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; }
.message-delete-btn:hover { opacity: 0.8; }
.message-status i { font-size: 0.875rem; color: #adb5bd; }
.message-status i.read { color: #28a745; }
.typing-text { color: #94a3b8; font-size: 0.78rem; font-style: italic; margin-right: 0.15rem; }
.typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #a5b4fc; animation: typingBounce 1.3s infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.18s; }
.typing-dot:nth-child(3) { animation-delay: 0.36s; }
@keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
.typing-fade-enter-active, .typing-fade-leave-active { transition: all 0.25s ease; }
.typing-fade-enter-from, .typing-fade-leave-to { opacity: 0; transform: translateY(6px); }
.message-input { padding: 1.25rem 1.5rem; border-top: 1px solid #e9ecef; background: white; }
.message-type-selector { margin-bottom: 0.75rem; }
.message-type-selector select { max-width: 200px; border: 1px solid #e9ecef; border-radius: 6px; padding: 0.375rem 0.75rem; font-size: 0.875rem; }
.input-row { display: flex; gap: 0.75rem; align-items: flex-end; }
.input-row textarea { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e9ecef; border-radius: 10px; resize: none; font-size: 0.875rem; font-family: inherit; max-height: 120px; transition: all 0.3s; }
.input-row textarea:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.btn-send { width: 44px; height: 44px; border: none; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; flex-shrink: 0; }
.btn-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(105,108,255,.4); }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-send i { font-size: 1.1rem; }
.conversation-closed-notice { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; background: #f8f9fa; color: #6c757d; border-top: 1px solid #e9ecef; font-size: 0.875rem; }
.priority-badge, .status-badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 700; text-transform: uppercase; }
.priority-low { background: #e3f2fd; color: #1976d2; } .priority-medium { background: #fff3e0; color: #f57c00; } .priority-high { background: #ffe0b2; color: #e65100; } .priority-urgent { background: #ffebee; color: #c62828; }
.status-new { background: #fff3e0; color: #f57c00; } .status-in_progress { background: #e3f2fd; color: #1976d2; } .status-waiting_response { background: #f3e5f5; color: #7b1fa2; } .status-resolved { background: #e8f5e9; color: #2e7d32; } .status-closed { background: #eceff1; color: #455a64; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; transition: all 0.3s; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }
.btn-outline-primary { background: transparent; border: 1px solid #696cff; color: #696cff; } .btn-outline-primary:hover { background: #696cff; color: white; }
.btn-outline-success { background: transparent; border: 1px solid #28a745; color: #28a745; } .btn-outline-success:hover { background: #28a745; color: white; }
.btn-outline-secondary { background: transparent; border: 1px solid #6c757d; color: #6c757d; } .btn-outline-secondary:hover { background: #6c757d; color: white; }
.photo-viewer-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.9); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.photo-viewer-content { position: relative; max-width: 90%; max-height: 90%; }
.photo-viewer-content img { max-width: 100%; max-height: 90vh; object-fit: contain; }
.close-btn { position: absolute; top: -40px; right: 0; background: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.close-btn i { font-size: 1.5rem; }
.ms-2 { margin-left: 0.5rem; } .mt-2 { margin-top: 0.5rem; } .mb-4 { margin-bottom: 1.5rem; } .me-1 { margin-right: 0.25rem; } .me-2 { margin-right: 0.5rem; }
.text-muted { color: #6c757d; } .small { font-size: 0.875rem; }
.alert-danger { padding: 0.75rem 1rem; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; }

/* ============================================================
   MOBILE BUTTON BACK
   ============================================================ */
.btn-back-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #696cff;
  cursor: pointer;
  padding: 0.25rem;
  margin-right: 0.25rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.btn-back-mobile:hover { background: #f0f4ff; }
.btn-close-desktop { display: inline-flex; }

/* ============================================================
   MOBILE RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .admin-vendor-chat-page { padding: 0; }

  .page-header {
    padding: 0.875rem 1rem;
    margin-bottom: 0;
    border-radius: 0;
  }
  .page-header h4 { font-size: 1rem; margin-bottom: 0; }
  .page-header p  { display: none; }

  .chat-container {
    display: block;
    height: calc(100dvh - 60px);
    position: relative;
    overflow: hidden;
  }

  /* Sidebar: full width, slide out ke kiri saat chat dibuka */
  .conversations-sidebar {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0);
  }
  .conversations-sidebar.mobile-hidden {
    transform: translateX(-100%);
    pointer-events: none;
  }

  /* Chat area: full width, slide in dari kanan */
  .chat-area {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .chat-area.mobile-visible { transform: translateX(0); }

  /* Tampilkan tombol back, sembunyikan tombol tutup desktop */
  .btn-back-mobile   { display: flex; }
  .btn-close-desktop { display: none; }

  /* Header chat */
  .chat-header { padding: 0.75rem 1rem; gap: 0.5rem; }
  .chat-header-left { gap: 0.5rem; }
  .vendor-avatar img, .vendor-avatar .avatar-text { width: 36px; height: 36px; font-size: 0.8rem; }
  .vendor-info h5 { font-size: 0.875rem; }
  .vendor-info p  { font-size: 0.7rem; }
  .chat-header-actions { gap: 0.25rem; }
  .btn-text { display: none; }
  .chat-header-actions .btn-sm { padding: 0.375rem 0.5rem; }

  /* Ticket info bar */
  .ticket-info-bar { padding: 0.5rem 1rem; gap: 0.5rem; flex-wrap: wrap; }
  .ticket-info-bar > i { display: none; }
  .ticket-details strong { font-size: 0.8rem; }
  .ticket-details span  { font-size: 0.75rem; }
  .ticket-meta { font-size: 0.7rem; }

  /* Messages */
  .messages-area { padding: 0.75rem 1rem; }
  .message-content { max-width: 82%; }
  .message-bubble { font-size: 0.825rem; }

  /* Input */
  .message-input { padding: 0.75rem 1rem; }
  .message-type-selector select { max-width: 160px; font-size: 0.8rem; padding: 0.3rem 0.6rem; }
  .input-row textarea { font-size: 0.875rem; padding: 0.625rem 0.875rem; }

  /* Sidebar */
  .sidebar-header { padding: 0.875rem 1rem; }
  .filter-tabs { gap: 0.25rem; }
  .tab-btn { padding: 0.625rem 0.4rem; font-size: 0.75rem; gap: 0.25rem; }
  .tab-btn i { font-size: 0.875rem; }
  .conversation-card { padding: 0.875rem 1rem; }
  .conv-avatar img, .conv-avatar .avatar-text { width: 42px; height: 42px; }

  /* Search form */
  .search-input-group { flex-direction: column; }
  .ticket-search-form h5 { font-size: 1rem; }
}

@media (max-width: 400px) {
  .tab-btn span:not(.count) { display: none; }
  .tab-btn { justify-content: center; }
}
</style>

