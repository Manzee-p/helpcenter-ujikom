<template>
  <div class="vendor-client-chat-page">
    <div class="page-header">
      <h4 class="fw-bold mb-0">
        <i class="bx bx-message-square-dots me-2"></i>
        Chat Client
      </h4>
      <p class="text-muted mb-0">Komunikasi langsung dengan client terkait tiket yang Anda kerjakan</p>
    </div>

    <div class="chat-container">
      <!-- ═══ SIDEBAR: Daftar Tiket ═══ -->
      <div :class="['conversations-sidebar', { 'mobile-hidden': showChatMobile }]">
        <div class="sidebar-header">
          <div class="search-box">
            <i class="bx bx-search"></i>
            <input
              type="text"
              placeholder="Cari tiket atau client..."
              v-model="searchQuery"
            />
          </div>
          <div class="sidebar-stats">
            <span class="stat-pill">
              <i class="bx bx-file"></i>
              {{ myTickets.length }} tiket aktif
            </span>
            <span v-if="totalUnread > 0" class="stat-pill unread-pill">
              <i class="bx bx-bell"></i>
              {{ totalUnread }} belum dibaca
            </span>
          </div>
        </div>

        <div class="tickets-list">
          <div v-if="loadingTickets" class="loading-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <p>Memuat tiket...</p>
          </div>

          <div v-else-if="filteredTickets.length === 0" class="empty-state">
            <i class="bx bx-inbox"></i>
            <p>Tidak ada tiket aktif</p>
            <small>Tiket yang ditugaskan ke Anda akan muncul di sini</small>
          </div>

          <div
            v-else
            v-for="ticket in filteredTickets"
            :key="ticket.id"
            :class="['ticket-card', {
              active: activeTicket?.id === ticket.id,
              'has-unread': (unreadCounts[ticket.id] || 0) > 0
            }]"
            @click="selectTicket(ticket)"
          >
            <div class="ticket-card-left">
              <div class="client-avatar">
                {{ getInitials(ticket.user?.name) }}
              </div>
              <div v-if="(unreadCounts[ticket.id] || 0) > 0" class="unread-badge">
                {{ unreadCounts[ticket.id] }}
              </div>
            </div>

            <div class="ticket-card-info">
              <div class="ticket-card-header">
                <span class="client-name">{{ ticket.user?.name || 'Client' }}</span>
                <span class="ticket-time">{{ formatTime(ticket.updated_at) }}</span>
              </div>
              <div class="ticket-number">
                <i class="bx bx-file"></i>
                #{{ ticket.ticket_number }}
              </div>
              <div class="ticket-title-preview">{{ ticket.title }}</div>
              <div class="ticket-card-badges">
                <span :class="`priority-badge priority-${ticket.priority}`">
                  {{ formatPriority(ticket.priority) }}
                </span>
                <span :class="`status-badge status-${ticket.status}`">
                  {{ formatStatus(ticket.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ AREA CHAT ═══ -->
      <div :class="['chat-area', { 'mobile-visible': showChatMobile }]">

        <!-- State: belum pilih tiket -->
        <div v-if="!activeTicket" class="no-ticket-selected">
          <div class="no-ticket-icon">
            <i class="bx bx-message-square-add"></i>
          </div>
          <h5>Pilih Tiket untuk Mulai Chat</h5>
          <p>Pilih salah satu tiket dari daftar di kiri untuk berkomunikasi dengan client</p>
        </div>

        <!-- State: ada tiket aktif -->
        <div v-else class="chat-active">

          <!-- Header Chat -->
          <div class="chat-header">
            <div class="chat-header-left">
              <button class="btn-back-mobile" @click="backToSidebar">
                <i class="bx bx-arrow-back"></i>
              </button>
              <div class="client-avatar-lg">
                {{ getInitials(activeTicket.user?.name) }}
              </div>
              <div class="chat-header-info">
                <h5>{{ activeTicket.user?.name || 'Client' }}</h5>
                <p>
                  <i class="bx bx-file"></i>
                  #{{ activeTicket.ticket_number }} — {{ activeTicket.title }}
                </p>
              </div>
            </div>
            <div class="chat-header-right">
              <span :class="['realtime-indicator', isConnected ? 'live' : 'offline']">
                <span class="dot"></span>
                {{ isConnected ? 'Live' : 'Offline' }}
              </span>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="viewTicketDetail"
              >
                <i class="bx bx-link-external"></i>
                Lihat Tiket
              </button>
            </div>
          </div>

          <!-- Info Bar Tiket -->
          <div class="ticket-info-bar">
            <div class="info-chips">
              <span class="info-chip">
                <i class="bx bx-calendar"></i>
                Dibuat {{ formatDate(activeTicket.created_at) }}
              </span>
              <span v-if="activeTicket.venue" class="info-chip">
                <i class="bx bx-map-pin"></i>
                {{ activeTicket.venue }}
                <span v-if="activeTicket.area"> — {{ activeTicket.area }}</span>
              </span>
              <span :class="`priority-badge priority-${activeTicket.priority}`">
                {{ formatPriority(activeTicket.priority) }}
              </span>
              <span :class="`status-badge status-${activeTicket.status}`">
                {{ formatStatus(activeTicket.status) }}
              </span>
            </div>
          </div>

          <!-- Area Pesan -->
          <div class="messages-area" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading-messages">
              <i class="bx bx-loader-alt bx-spin"></i>
              <p>Memuat pesan...</p>
            </div>

            <div v-else class="messages-list">
              <div class="chat-start-label">
                <span>Percakapan dimulai {{ formatDate(activeTicket.created_at) }}</span>
              </div>

              <div
                v-for="comment in comments"
                :key="comment.id"
                :class="['message-item', isMyMessage(comment) ? 'msg-sent' : 'msg-received']"
              >
                <div v-if="!isMyMessage(comment)" class="msg-avatar">
                  {{ getInitials(comment.user?.name) }}
                </div>

                <div class="msg-content">
                  <div v-if="!isMyMessage(comment)" class="msg-sender">
                    {{ comment.user?.name }}
                    <span class="msg-role-tag tag-client">Client</span>
                  </div>
                  <div :class="['msg-bubble', isMyMessage(comment) ? 'bubble-sent' : 'bubble-received']">
                    {{ comment.comment }}
                  </div>
                  <div class="msg-meta">
                    <span class="msg-time">{{ formatMessageTime(comment.created_at) }}</span>
                    <span v-if="isMyMessage(comment)" class="msg-read-icon">
                      <i class="bx bx-check-double"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- ✅ TYPING INDICATOR -->
              <transition name="typing-fade">
                <div v-if="typingUser" class="message-item msg-received">
                  <div class="msg-avatar msg-avatar--typing">
                    {{ getInitials(typingUser.name) }}
                  </div>
                  <div class="msg-content">
                    <div class="msg-sender">
                      {{ typingUser.name }}
                      <span class="msg-role-tag tag-client">Client</span>
                      <span class="typing-label">sedang mengetik...</span>
                    </div>
                    <div class="msg-bubble bubble-received bubble--typing">
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </transition>

              <div v-if="comments.length === 0 && !typingUser" class="no-messages">
                <i class="bx bx-message"></i>
                <p>Belum ada pesan. Mulai percakapan dengan client!</p>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div v-if="canReply" class="message-input-area">
            <textarea
              v-model="newMessage"
              class="message-textarea"
              rows="1"
              placeholder="Ketik pesan untuk client... (Ctrl+Enter untuk kirim)"
              :disabled="sending"
              @keydown.ctrl.enter.prevent="sendMessage"
              @input="handleInput"
              ref="messageTextarea"
            ></textarea>
            <button
              class="btn-send"
              @click="sendMessage"
              :disabled="!newMessage.trim() || sending"
            >
              <i v-if="!sending" class="bx bx-send"></i>
              <i v-else class="bx bx-loader-alt bx-spin"></i>
            </button>
          </div>

          <div v-else class="chat-closed-notice">
            <i class="bx bx-lock me-2"></i>
            {{ ['resolved', 'closed'].includes(activeTicket.status)
              ? 'Tiket sudah selesai, chat client ditutup dan tidak bisa mengirim pesan lagi.'
              : 'Mulai kerjakan tiket untuk dapat mengirim pesan ke client.' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { initEcho } from '@/services/pusher'
import Swal from 'sweetalert2'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────
const myTickets       = ref([])
const activeTicket    = ref(null)
const comments        = ref([])
const newMessage      = ref('')
const searchQuery     = ref('')
const loadingTickets  = ref(false)
const loadingMessages = ref(false)
const sending         = ref(false)
const isConnected     = ref(false)
const showChatMobile  = ref(false)
const unreadCounts    = ref({})

// ✅ Typing indicator state
const typingUser = ref(null)
let typingTimer        = null
let sendTypingThrottle = null

const messagesContainer = ref(null)
const messageTextarea   = ref(null)

// ── Echo channels ──────────────────────────────────────────
let activeEchoChannel = null
const allEchoChannels = []

// ── Computed ───────────────────────────────────────────────
const filteredTickets = computed(() => {
  if (!searchQuery.value.trim()) return myTickets.value
  const q = searchQuery.value.toLowerCase()
  return myTickets.value.filter(t =>
    t.ticket_number?.toLowerCase().includes(q) ||
    t.title?.toLowerCase().includes(q) ||
    t.user?.name?.toLowerCase().includes(q)
  )
})

const totalUnread = computed(() =>
  Object.values(unreadCounts.value).reduce((sum, n) => sum + n, 0)
)

const canReply = computed(() => {
  if (!activeTicket.value) return false
  return ['in_progress', 'waiting_response'].includes(activeTicket.value.status)
})

// ── Pusher / Echo ──────────────────────────────────────────

function subscribeToAllTickets() {
  unsubscribeFromAllTickets()
  if (!window.Echo) { initEcho() }
  if (!window.Echo) return

  myTickets.value.forEach(ticket => {
    const channelName = `ticket.${ticket.id}`
    const ch = window.Echo.channel(channelName)

    // ✅ Listener: pesan baru
    ch.listen('.comment.new', async (data) => {
      if (!data.comment) return
      if (data.comment.is_internal) return
      if (data.comment.user?.id === authStore.user?.id) return

      const tid = ticket.id

      if (activeTicket.value?.id === tid) {
        const exists = comments.value.some(c => c.id === data.comment.id)
        if (!exists) {
          comments.value.push(data.comment)
          // Hapus typing indicator saat pesan masuk
          clearTypingIndicator()
          await nextTick()
          scrollToBottom()
        }
      } else {
        unreadCounts.value = {
          ...unreadCounts.value,
          [tid]: (unreadCounts.value[tid] || 0) + 1
        }
      }
    })

    // ✅ Listener: typing indicator dari client
    ch.listen('.user.typing', async (data) => {
      if (!data.user) return

      // Abaikan event dari diri sendiri
      if (data.user.id === authStore.user?.id) return

      // Hanya tampilkan jika tiket ini sedang aktif
      if (activeTicket.value?.id !== ticket.id) return

      showTypingIndicator(data.user)
    })

    allEchoChannels.push(channelName)
  })

  isConnected.value = true
}

function unsubscribeFromAllTickets() {
  allEchoChannels.forEach(name => window.Echo?.leaveChannel(name))
  allEchoChannels.length = 0
  isConnected.value = false
}

// ✅ Tampilkan typing indicator selama 3.5 detik
function showTypingIndicator(user) {
  typingUser.value = user
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    typingUser.value = null
  }, 3500)
  scrollToBottom()
}

// ✅ Hapus typing indicator
function clearTypingIndicator() {
  typingUser.value = null
  clearTimeout(typingTimer)
}

// ── API ────────────────────────────────────────────────────

const fetchMyTickets = async () => {
  loadingTickets.value = true
  try {
    const { data } = await api.get('/vendor/tickets', { params: { per_page: 100 } })
    const tickets = Array.isArray(data) ? data : (data.data || data.tickets || [])

    myTickets.value = tickets.filter(t =>
      ['new', 'in_progress', 'waiting_response'].includes(t.status)
    )

    subscribeToAllTickets()

    const qTicketId = route.query.ticket_id
    if (qTicketId) {
      const found = myTickets.value.find(t => String(t.id) === String(qTicketId))
      if (found) await selectTicket(found)
    }
  } catch (err) {
    console.error('Gagal memuat tiket:', err)
    myTickets.value = []
  } finally {
    loadingTickets.value = false
  }
}

const selectTicket = async (ticket) => {
  activeTicket.value = ticket
  showChatMobile.value = true

  // Reset unread
  if (unreadCounts.value[ticket.id]) {
    unreadCounts.value = { ...unreadCounts.value, [ticket.id]: 0 }
  }

  // Reset typing indicator saat ganti tiket
  clearTypingIndicator()

  await fetchComments(ticket.id)
}

const fetchComments = async (ticketId) => {
  loadingMessages.value = true
  comments.value = []
  try {
    const { data } = await api.get(`/tickets/${ticketId}/comments`)
    comments.value = (Array.isArray(data) ? data : []).filter(c => !c.is_internal)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Gagal memuat komentar:', err)
    comments.value = []
  } finally {
    loadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !activeTicket.value) return

  const messageText = newMessage.value
  newMessage.value  = ''
  sending.value     = true

  if (messageTextarea.value) {
    messageTextarea.value.style.height = 'auto'
  }

  try {
    const { data } = await api.post(`/tickets/${activeTicket.value.id}/comments`, {
      comment:     messageText,
      is_internal: false
    })

    const newComment = data.comment || data
    const exists = comments.value.some(c => c.id === newComment.id)
    if (!exists) {
      comments.value.push(newComment)
    }

    await nextTick()
    scrollToBottom()
  } catch (err) {
    newMessage.value = messageText
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: err.response?.data?.message || 'Pesan gagal dikirim',
      confirmButtonColor: '#696cff'
    })
  } finally {
    sending.value = false
  }
}

// ✅ handleInput: auto-resize textarea + kirim typing event ke backend
const handleInput = (e) => {
  // Auto resize
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'

  // Kirim typing indicator, throttle 2 detik
  if (sendTypingThrottle) return
  sendTypingThrottle = setTimeout(async () => {
    sendTypingThrottle = null
    if (!activeTicket.value?.id || !newMessage.value.trim()) return
    try {
      await api.post(`/tickets/${activeTicket.value.id}/typing`)
    } catch {
      // silent — typing indicator tidak kritis
    }
  }, 2000)
}

// ── Helpers ────────────────────────────────────────────────
const viewTicketDetail = () => {
  if (activeTicket.value) {
    router.push(`/vendor/tickets/${activeTicket.value.id}`)
  }
}

const backToSidebar = () => {
  showChatMobile.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const isMyMessage  = (c) => c.user?.id === authStore.user?.id
const getInitials  = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0][0] + (parts[0][1] || '')).toUpperCase()
}
const formatTime = (d) => {
  if (!d) return ''
  const date = new Date(d), now = new Date()
  const diff = Math.floor((now - date) / 60000)
  if (diff < 1)  return 'Baru saja'
  if (diff < 60) return `${diff}m`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}j`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}h`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  : ''
const formatMessageTime = (d) => d
  ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  : ''
const formatPriority = (p) => ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', urgent: 'Mendesak', critical: 'Kritis' }[p] || p || '')
const formatStatus   = (s) => ({ new: 'Baru', in_progress: 'Diproses', waiting_response: 'Menunggu', resolved: 'Selesai', closed: 'Ditutup' }[s] || s || '')

// ── Lifecycle ──────────────────────────────────────────────
onMounted(() => {
  fetchMyTickets()
})

onBeforeUnmount(() => {
  unsubscribeFromAllTickets()
  clearTimeout(typingTimer)
  clearTimeout(sendTypingThrottle)
})
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.vendor-client-chat-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.page-header h4 {
  color: #2c3e50;
  font-size: 1.1rem;
}

.chat-container {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 200px);
}

/* ── Sidebar ─────────────────────────────────────────────── */
.conversations-sidebar {
  background: white;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.search-box {
  position: relative;
  margin-bottom: 0.875rem;
}

.search-box i {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1.5px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,.1);
}

.sidebar-stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.75rem;
  background: #f0f4ff;
  color: #667eea;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-pill i { font-size: 0.875rem; }

.unread-pill {
  background: #fff3cd;
  color: #856404;
  animation: pulse 2s infinite;
}

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.7} }

.tickets-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.tickets-list::-webkit-scrollbar { width: 5px; }
.tickets-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6c757d;
  text-align: center;
}

.loading-state i,
.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state small { font-size: 0.8rem; margin-top: 0.25rem; }

/* ── Ticket Card ─────────────────────────────────────────── */
.ticket-card {
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 0.375rem;
  transition: all 0.2s;
  border: 1.5px solid transparent;
}

.ticket-card:hover      { background: #f8f9fa; border-color: #e9ecef; }
.ticket-card.active     { background: #f0f4ff; border-color: #667eea; }
.ticket-card.has-unread { background: #fffbf0; }

.ticket-card-left {
  position: relative;
  flex-shrink: 0;
}

.client-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.ticket-card-info { flex: 1; min-width: 0; }

.ticket-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.client-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-time {
  font-size: 0.7rem;
  color: #6c757d;
  white-space: nowrap;
  flex-shrink: 0;
}

.ticket-number {
  font-size: 0.78rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ticket-title-preview {
  font-size: 0.775rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.375rem;
}

.ticket-card-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

/* ── Chat Area ───────────────────────────────────────────── */
.chat-area {
  background: white;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.no-ticket-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.no-ticket-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(102,126,234,.1), rgba(118,75,162,.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.no-ticket-icon i { font-size: 3.5rem; color: #667eea; }
.no-ticket-selected h5 { color: #2c3e50; margin-bottom: 0.5rem; }
.no-ticket-selected p  { max-width: 340px; font-size: 0.9rem; }

/* ── Active Chat ─────────────────────────────────────────── */
.chat-active {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.125rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
  gap: 1rem;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.client-avatar-lg {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-header-info h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.chat-header-info p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.realtime-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
}

.realtime-indicator.live    { background: #d4edda; color: #155724; }
.realtime-indicator.offline { background: #f8d7da; color: #721c24; }

.realtime-indicator .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.realtime-indicator.live .dot {
  background: #28a745;
  animation: blink 1.5s infinite;
}

.realtime-indicator.offline .dot { background: #dc3545; }

@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* Info Bar */
.ticket-info-bar {
  padding: 0.75rem 1.5rem;
  background: #f8f9fe;
  border-bottom: 1px solid #e9ecef;
}

.info-chips {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.775rem;
  color: #6c757d;
}

.info-chip i { font-size: 0.875rem; color: #667eea; }

/* Badges */
.priority-badge, .status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.priority-low      { background: #e3f2fd; color: #1565c0; }
.priority-medium   { background: #fff8e1; color: #e65100; }
.priority-high     { background: #ffe0b2; color: #bf360c; }
.priority-urgent,
.priority-critical { background: #ffebee; color: #b71c1c; }

.status-new              { background: #fff8e1; color: #f57c00; }
.status-in_progress      { background: #e3f2fd; color: #1565c0; }
.status-waiting_response { background: #f3e5f5; color: #6a1b9a; }
.status-resolved         { background: #e8f5e9; color: #2e7d32; }
.status-closed           { background: #eceff1; color: #455a64; }

/* Messages */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f4f5f7;
}

.messages-area::-webkit-scrollbar { width: 6px; }
.messages-area::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.loading-messages i { font-size: 2rem; margin-bottom: 0.5rem; }

.messages-list { display: flex; flex-direction: column; gap: 1rem; }

.chat-start-label {
  text-align: center;
  margin: 1rem 0;
}

.chat-start-label span {
  background: white;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #6c757d;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
  text-align: center;
}

.no-messages i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  animation: msgIn 0.3s ease;
}

@keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.msg-sent     { flex-direction: row-reverse; }
.msg-received { flex-direction: row; }

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ✅ Avatar khusus typing indicator */
.msg-avatar--typing {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  opacity: 0.85;
}

.msg-content { max-width: 68%; }
.msg-sent .msg-content { display: flex; flex-direction: column; align-items: flex-end; }

.msg-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ✅ Label "sedang mengetik..." */
.typing-label {
  font-size: 0.68rem;
  font-weight: 400;
  color: #9ca3af;
  font-style: italic;
}

.msg-role-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  text-transform: uppercase;
}

.tag-client { background: #e3f2fd; color: #1565c0; }
.tag-vendor { background: #e8f5e9; color: #2e7d32; }

.msg-bubble {
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.875rem;
  line-height: 1.55;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,.07);
}

.bubble-received {
  background: white;
  color: #2c3e50;
  border-bottom-left-radius: 4px;
}

.bubble-sent {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom-right-radius: 4px;
}

/* ✅ Typing bubble animasi titik-titik */
.bubble--typing {
  display: inline-flex !important;
  align-items: center;
  gap: 5px;
  padding: 0.875rem 1.125rem !important;
  min-width: 70px;
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a5b4fc;
  animation: typingBounce 1.3s infinite;
  flex-shrink: 0;
}

.typing-dot:nth-child(2) { animation-delay: 0.18s; }
.typing-dot:nth-child(3) { animation-delay: 0.36s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
  40%           { transform: translateY(-5px); opacity: 1;   }
}

/* ✅ Transisi typing indicator muncul/hilang */
.typing-fade-enter-active,
.typing-fade-leave-active { transition: all 0.3s cubic-bezier(.16,1,.3,1); }
.typing-fade-enter-from,
.typing-fade-leave-to     { opacity: 0; transform: translateY(6px); }

.msg-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.msg-sent .msg-meta { justify-content: flex-end; }

.msg-time { font-size: 0.7rem; color: #6c757d; }

.msg-read-icon i {
  font-size: 0.9rem;
  color: #28a745;
}

/* Input */
.message-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1.125rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: white;
}

.message-textarea {
  flex: 1;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  transition: all 0.2s;
  line-height: 1.5;
}

.message-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,.1);
}

.message-textarea:disabled { opacity: 0.6; background: #f8f9fa; }

.btn-send {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(102,126,234,.4);
}

.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

.chat-closed-notice {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  text-align: center;
  color: #6c757d;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Mobile back button ──────────────────────────────────── */
.btn-back-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #667eea;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-back-mobile:hover { background: #f0f4ff; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .vendor-client-chat-page { padding: 0; min-height: 100dvh; }

  .page-header {
    padding: 0.875rem 1rem;
    margin-bottom: 0;
    border-radius: 0;
  }

  .chat-container {
    display: block;
    height: calc(100dvh - 80px);
    position: relative;
    overflow: hidden;
  }

  .conversations-sidebar {
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    transform: translateX(0);
  }

  .conversations-sidebar.mobile-hidden {
    transform: translateX(-100%);
    pointer-events: none;
  }

  .chat-area {
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }

  .chat-area.mobile-visible { transform: translateX(0); }

  .btn-back-mobile { display: flex; }

  .chat-header { padding: 0.75rem 1rem; }
  .chat-header-info h5 { font-size: 0.875rem; }
  .chat-header-info p  { font-size: 0.75rem; }
  .msg-content { max-width: 82%; }
  .messages-area { padding: 0.875rem 1rem; }
  .message-input-area { padding: 0.75rem 1rem; }
}

/* ── Utility ─────────────────────────────────────────────── */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
  border: none;
}

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn-outline-primary {
  background: transparent;
  border: 1.5px solid #667eea;
  color: #667eea;
}
.btn-outline-primary:hover { background: #667eea; color: white; }
</style>

