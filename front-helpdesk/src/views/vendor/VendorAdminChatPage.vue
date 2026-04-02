<template>
  <div class="vendor-admin-chat-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h4 class="fw-bold mb-0">
          <i class="bx bx-message-square-dots me-2"></i>
          Komunikasi dengan Admin
        </h4>
        <p class="text-muted mb-0">Laporkan kendala, update progres, atau hubungi admin terkait tiket Anda</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <i class="bx bx-message-dots"></i>
          <div>
            <small>Total Chat</small>
            <strong>{{ stats.total || 0 }}</strong>
          </div>
        </div>
        <div class="stat-card">
          <i class="bx bx-message-square-check"></i>
          <div>
            <small>Aktif</small>
            <strong>{{ stats.active || 0 }}</strong>
          </div>
        </div>
        <div class="stat-card unread">
          <i class="bx bx-bell"></i>
          <div>
            <small>Belum Dibaca</small>
            <strong>{{ stats.unread_total || 0 }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-container">
      <!-- Conversations Sidebar -->
      <div :class="['conversations-sidebar', { 'mobile-hidden': showChatMobile }]">
        <div class="sidebar-header">
          <div class="search-box">
            <i class="bx bx-search"></i>
            <input type="text" placeholder="Cari percakapan..." v-model="searchQuery" @input="debouncedSearch" />
          </div>
          <div class="filter-tabs">
            <button :class="['tab-btn', { active: filterStatus === 'all' }]" @click="setFilter('all')">Semua</button>
            <button :class="['tab-btn', { active: filterStatus === 'active' }]" @click="setFilter('active')">Aktif</button>
            <button :class="['tab-btn', { active: filterStatus === 'resolved' }]" @click="setFilter('resolved')">Selesai</button>
          </div>
        </div>

        <div class="conversations-list">
          <div v-if="loadingConversations" class="loading-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <p>Memuat percakapan...</p>
          </div>

          <div v-else-if="conversations.length === 0" class="empty-state">
            <i class="bx bx-message-x"></i>
            <p>Belum ada percakapan</p>
            <small>Mulai percakapan baru dari tiket yang Anda kerjakan</small>
          </div>

          <div
            v-else
            v-for="conv in conversations"
            :key="conv.id"
            :class="['conversation-card', {
              active: activeConversation?.id === conv.id,
              'has-unread': conv.unread_count > 0
            }]"
            @click="selectConversation(conv)"
          >
            <div class="conv-icon">
              <i class="bx bx-shield-alt-2"></i>
              <span v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count }}</span>
            </div>
            <div class="conv-info">
              <div class="conv-header">
                <h6>{{ conv.admin?.name || 'Admin' }}</h6>
                <span class="conv-time">{{ formatTime(conv.last_message_at) }}</span>
              </div>
              <div class="conv-ticket">
                <i class="bx bx-file"></i>
                <span>#{{ conv.ticket?.ticket_number }}</span>
                <span :class="`priority-badge priority-${conv.ticket?.priority}`">
                  {{ formatPriority(conv.ticket?.priority) }}
                </span>
              </div>
              <p class="conv-preview">
                {{ conv.latestMessage?.message || conv.subject || 'Percakapan baru' }}
              </p>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-new-conv" @click="openNewConvModal">
            <i class="bx bx-plus-circle"></i>
            Percakapan Baru
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div :class="['chat-area', { 'mobile-visible': showChatMobile }]">
        <div v-if="!activeConversation" class="no-conversation">
          <div class="no-conv-icon">
            <i class="bx bx-message-square-add"></i>
          </div>
          <h5>Mulai Komunikasi dengan Admin</h5>
          <p>Pilih percakapan yang ada atau mulai percakapan baru untuk tiket yang sedang Anda kerjakan</p>
          <button class="btn btn-primary btn-lg" @click="openNewConvModal">
            <i class="bx bx-plus me-1"></i> Percakapan Baru
          </button>
        </div>

        <div v-else class="chat-active">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="header-info">
              <button class="btn-back-mobile" @click="backToSidebar">
                <i class="bx bx-arrow-back"></i>
              </button>
              <div class="admin-avatar">
                <i class="bx bx-shield-alt-2"></i>
              </div>
              <div>
                <h5>{{ activeConversation.admin?.name || 'Admin' }}</h5>
                <p v-if="activeConversation.ticket">
                  <i class="bx bx-file"></i>
                  #{{ activeConversation.ticket.ticket_number }} - {{ activeConversation.ticket.title }}
                </p>
              </div>
            </div>
            <div class="header-actions">
              <button
                v-if="activeConversation.ticket_id"
                class="btn btn-sm btn-outline-primary"
                @click="viewTicket(activeConversation.ticket_id)"
              >
                <i class="bx bx-link-external"></i> Lihat Tiket
              </button>
            </div>
          </div>

          <!-- Ticket Info Bar -->
          <div v-if="activeConversation.ticket" class="ticket-info-bar">
            <div class="ticket-details">
              <div class="detail-item" v-if="activeConversation.ticket.venue">
                <i class="bx bx-map-pin"></i>
                <span>{{ activeConversation.ticket.venue }}</span>
              </div>
              <div class="detail-item" v-if="activeConversation.ticket.area">
                <i class="bx bx-map"></i>
                <span>{{ activeConversation.ticket.area }}</span>
              </div>
              <div class="detail-item">
                <i class="bx bx-flag"></i>
                <span :class="`priority-badge priority-${activeConversation.ticket.priority}`">
                  {{ formatPriority(activeConversation.ticket.priority) }}
                </span>
              </div>
              <div class="detail-item">
                <i class="bx bx-info-circle"></i>
                <span :class="`status-badge status-${activeConversation.ticket.status}`">
                  {{ formatStatus(activeConversation.ticket.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-area" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading-messages">
              <i class="bx bx-loader-alt bx-spin"></i>
              <p>Memuat pesan...</p>
            </div>

            <div v-else class="messages-list">
              <div class="conversation-start">
                <div class="start-line"></div>
                <span>Percakapan dimulai {{ formatDate(activeConversation.created_at) }}</span>
                <div class="start-line"></div>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message-item', isFromMe(message) ? 'message-sent' : 'message-received']"
              >
                <div v-if="!isFromMe(message)" class="message-avatar">
                  <i class="bx bx-shield-alt-2"></i>
                </div>

                <div class="message-content">
                  <div v-if="!isFromMe(message)" class="message-sender">
                    {{ message.sender?.name || 'Admin' }}
                  </div>

                  <div v-if="message.message_type && message.message_type !== 'regular'" class="message-type-badge">
                    <i :class="getMessageTypeIcon(message.message_type)"></i>
                    {{ getMessageTypeLabel(message.message_type) }}
                  </div>

                  <div
                    :class="[
                      'message-bubble',
                      `type-${message.message_type || 'regular'}`,
                      { 'has-photos': message.completion_photos && message.completion_photos.length > 0 },
                      { 'photo-only': message.completion_photos && message.completion_photos.length > 0 && !message.message }
                    ]"
                  >
                    <template v-if="message.completion_photos && message.completion_photos.length > 0">
                      <div :class="['wa-photos-grid', `wa-grid-${Math.min(message.completion_photos.length, 4)}`]">
                        <div
                          v-for="(photo, index) in message.completion_photos"
                          v-show="index < 4"
                          :key="index"
                          class="wa-photo-cell"
                          @click="viewPhoto(getPhotoUrl(photo))"
                        >
                          <img :src="getPhotoUrl(photo)" :alt="`Foto ${index + 1}`" />
                          <div v-if="index === 3 && message.completion_photos.length > 4" class="wa-more-overlay">
                            +{{ message.completion_photos.length - 4 }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <p v-if="message.message" class="bubble-text">{{ message.message }}</p>

                    <div v-if="message.completion_notes" class="completion-notes">
                      <i class="bx bx-note"></i>
                      <div>
                        <strong>Catatan:</strong>
                        <span>{{ message.completion_notes }}</span>
                      </div>
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

          <!-- Message Input -->
          <div v-if="activeConversation.status === 'active'" class="message-input">
            <div class="input-options">
              <select v-model="messageType" class="message-type-select">
                <option value="regular">💬 Pesan Biasa</option>
                <option value="progress_update">📊 Update Progres</option>
                <option value="issue_report">⚠️ Laporan Kendala</option>
              </select>
              <button v-if="canReportCompletion" class="btn-completion" @click="openCompletionModal">
                <i class="bx bx-check-circle"></i> Lapor Selesai
              </button>
            </div>

            <div v-if="chatPhotos.length > 0" class="chat-photo-previews">
              <div v-for="(photo, index) in chatPhotos" :key="index" class="chat-photo-thumb">
                <img :src="photo.preview" :alt="`Foto ${index + 1}`" />
                <button @click="removeChatPhoto(index)" class="chat-photo-remove" type="button">
                  <i class="bx bx-x"></i>
                </button>
                <div class="chat-photo-num">{{ index + 1 }}</div>
              </div>
              <div
                v-for="n in (5 - chatPhotos.length)" :key="`empty-${n}`"
                class="chat-photo-empty" @click="chatPhotoInput.click()" title="Tambah foto"
              >
                <i class="bx bx-plus"></i>
              </div>
            </div>

            <div class="input-row">
              <input type="file" ref="chatPhotoInput" @change="handleChatPhotoSelect" accept="image/jpeg,image/jpg,image/png" multiple style="display: none" />
              <button class="btn-attach-photo" @click="chatPhotoInput.click()" :disabled="chatPhotos.length >= 5" :title="chatPhotos.length >= 5 ? 'Maksimal 5 foto' : `Lampirkan foto (${chatPhotos.length}/5)`" type="button">
                <i class="bx bx-image-add"></i>
                <span v-if="chatPhotos.length > 0" class="photo-count-badge">{{ chatPhotos.length }}/5</span>
              </button>
              <textarea v-model="newMessage" placeholder="Ketik pesan atau lampirkan foto..." rows="1" @keydown.enter.exact.prevent="sendMessage" @input="handleTypingInput" ref="messageTextarea"></textarea>
              <button class="btn-send" @click="sendMessage" :disabled="(!newMessage.trim() && chatPhotos.length === 0) || sending">
                <i v-if="!sending" class="bx bx-send"></i>
                <i v-else class="bx bx-loader-alt bx-spin"></i>
              </button>
            </div>
          </div>

          <div v-else class="conversation-closed">
            <i class="bx bx-lock"></i>
            Percakapan ini sudah {{ activeConversation.status === 'resolved' ? 'selesai' : 'ditutup' }}
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Percakapan Baru -->
    <div v-if="showNewConvModal" class="modal-overlay" @click.self="closeNewConvModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5><i class="bx bx-message-square-add me-2"></i>Percakapan Baru dengan Admin</h5>
          <button @click="closeNewConvModal" class="btn-close"><i class="bx bx-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label><i class="bx bx-file me-1"></i>Pilih Tiket *</label>
            <select v-model="newConv.ticketId" class="form-control" required>
              <option value="">-- Pilih Tiket yang Sedang Dikerjakan --</option>
              <option v-for="ticket in myTickets" :key="ticket.id" :value="ticket.id">
                #{{ ticket.ticket_number }} - {{ ticket.title }}
              </option>
            </select>
            <small class="form-text text-muted">Hanya menampilkan tiket yang sedang Anda kerjakan</small>
          </div>
          <div class="form-group">
            <label><i class="bx bx-message-dots me-1"></i>Tipe Pesan</label>
            <select v-model="newConv.messageType" class="form-control">
              <option value="regular">💬 Pesan Biasa</option>
              <option value="progress_update">📊 Update Progres</option>
              <option value="issue_report">⚠️ Laporan Kendala</option>
            </select>
          </div>
          <div class="form-group">
            <label><i class="bx bx-message-square-detail me-1"></i>Pesan *</label>
            <textarea v-model="newConv.message" class="form-control" rows="5" placeholder="Tulis pesan Anda kepada admin..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeNewConvModal"><i class="bx bx-x"></i> Batal</button>
          <button class="btn btn-primary" @click="startNewConversation" :disabled="!newConv.ticketId || !newConv.message.trim() || sending">
            <i v-if="!sending" class="bx bx-send"></i>
            <i v-else class="bx bx-loader-alt bx-spin"></i>
            Kirim Pesan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: Laporan Penyelesaian -->
    <div v-if="showCompletionModal" class="modal-overlay" @click.self="closeCompletionModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h5><i class="bx bx-check-circle me-2"></i>Laporan Penyelesaian Pekerjaan</h5>
          <button @click="closeCompletionModal" class="btn-close"><i class="bx bx-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bx bx-info-circle"></i>
            <div>
              <strong>Informasi:</strong>
              <p>Laporkan pekerjaan yang telah diselesaikan. Admin akan meninjau dan memberikan konfirmasi.</p>
            </div>
          </div>
          <div class="form-group">
            <label><i class="bx bx-edit me-1"></i>Deskripsi Pekerjaan yang Diselesaikan *</label>
            <textarea v-model="completionReport.message" class="form-control" rows="5" placeholder="Jelaskan secara detail pekerjaan yang sudah diselesaikan..."></textarea>
          </div>
          <div class="form-group">
            <label><i class="bx bx-note me-1"></i>Catatan Tambahan</label>
            <textarea v-model="completionReport.notes" class="form-control" rows="3" placeholder="Catatan atau informasi tambahan (opsional)"></textarea>
          </div>
          <div class="form-group">
            <label><i class="bx bx-image me-1"></i>Foto Dokumentasi</label>
            <input type="file" ref="photoInput" @change="handlePhotoUpload" accept="image/jpeg,image/jpg,image/png" multiple class="form-control" />
            <small class="form-text text-muted">Format: JPG, PNG | Maks. 5 foto | Ukuran: Maks. 5MB per foto</small>
            <div v-if="completionReport.photos.length > 0" class="photo-previews">
              <div class="previews-header"><strong>{{ completionReport.photos.length }} foto dipilih</strong></div>
              <div class="previews-grid">
                <div v-for="(photo, index) in completionReport.photos" :key="index" class="photo-preview">
                  <img :src="photo.preview" :alt="`Foto ${index + 1}`" />
                  <button @click="removePhoto(index)" class="remove-photo" type="button"><i class="bx bx-x"></i></button>
                  <div class="photo-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCompletionModal"><i class="bx bx-x"></i> Batal</button>
          <button class="btn btn-success" @click="submitCompletionReport" :disabled="!completionReport.message.trim() || sending">
            <i v-if="!sending" class="bx bx-check-circle"></i>
            <i v-else class="bx bx-loader-alt bx-spin"></i>
            Kirim Laporan Penyelesaian
          </button>
        </div>
      </div>
    </div>

    <!-- Photo Viewer -->
    <div v-if="photoViewerUrl" class="photo-viewer-overlay" @click="closePhotoViewer">
      <div class="photo-viewer-content">
        <button @click="closePhotoViewer" class="close-viewer"><i class="bx bx-x"></i></button>
        <img :src="photoViewerUrl" alt="Photo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { initEcho } from '@/services/pusher'
import Swal from 'sweetalert2'

const router    = useRouter()
const authStore = useAuthStore()

const conversations        = ref([])
const activeConversation   = ref(null)
const messages             = ref([])
const newMessage           = ref('')
const messageType          = ref('regular')
const searchQuery          = ref('')
const filterStatus         = ref('all')
const loadingConversations = ref(false)
const loadingMessages      = ref(false)
const sending              = ref(false)
const stats                = ref({ total: 0, active: 0, resolved: 0, unread_total: 0 })
const showChatMobile       = ref(false)

const chatPhotos     = ref([])
const chatPhotoInput = ref(null)

const showNewConvModal = ref(false)
const myTickets        = ref([])
const newConv          = ref({ ticketId: '', messageType: 'regular', message: '' })

const showCompletionModal = ref(false)
const completionReport    = ref({ message: '', notes: '', photos: [] })

const photoViewerUrl    = ref(null)
const messagesContainer = ref(null)
const messageTextarea   = ref(null)
const photoInput        = ref(null)
const typingUser        = ref(null)

const isConnected = ref(false)

// ✅ Satu channel untuk conversation aktif (pesan baru)
let echoChannel = null

// ✅ Semua channels untuk semua conversations (notif unread)
const allEchoChannels = []
let typingTimer = null
let sendTypingThrottle = null

const canReportCompletion = computed(() => {
  if (!activeConversation.value?.ticket) return false
  return ['in_progress', 'waiting_response'].includes(activeConversation.value.ticket.status)
})

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
// ✅ Mark as read — selalu broadcast ke admin
// ============================================================
async function markConversationAsRead(conversationId) {
  try { await api.post(`/vendor/admin-chat/conversations/${conversationId}/mark-read`) } catch {}
}

// ============================================================
// ✅ Subscribe ke SEMUA conversations untuk notif unread
// ============================================================
function subscribeToAllConversations() {
  unsubscribeFromAllConversations()
  if (!window.Echo) { initEcho() }
  if (!window.Echo) return

  conversations.value.forEach(conv => {
    const channelName = `conversation.${conv.id}`
    const ch = window.Echo.private(channelName)

    // ✅ Pesan baru dari admin masuk
    ch.listen('.message.sent', async (data) => {
      if (!data.message) return
      const convId = conv.id
      const index  = conversations.value.findIndex(c => c.id === convId)

      // Update preview di sidebar
      if (index !== -1) {
        conversations.value[index].latestMessage   = data.message
        conversations.value[index].last_message_at = data.message.created_at
      }

      if (activeConversation.value?.id === convId) {
        // ✅ Conversation ini aktif → push pesan + mark as read
        const exists = messages.value.some(m => m.id === data.message.id)
        if (!exists) {
          messages.value.push(data.message)
          await nextTick()
          scrollToBottom()
          markConversationAsRead(convId)
        }
        clearTypingIndicator()
        // unread_count tetap 0
      } else {
        // ✅ Conversation tidak aktif → tambah unread badge
        if (index !== -1) {
          conversations.value[index].unread_count =
            (conversations.value[index].unread_count || 0) + 1
        }
        stats.value.unread_total = (stats.value.unread_total || 0) + 1
      }
    })

    // ✅ Admin membaca pesan vendor → update centang biru
    ch.listen('.messages.read', () => {
      if (activeConversation.value?.id === conv.id) {
        messages.value = messages.value.map(msg => ({
          ...msg,
          is_read: msg.sender_id === authStore.user?.id ? true : msg.is_read
        }))
      }
    })

    ch.listen('.message.deleted', (data) => {
      if (!data.message) return
      const targetId = data.message.id
      messages.value = messages.value.map((msg) => (msg.id === targetId ? { ...msg, ...data.message } : msg))

      const index = conversations.value.findIndex(c => c.id === conv.id)
      if (index !== -1 && conversations.value[index].latestMessage?.id === targetId) {
        conversations.value[index].latestMessage = data.message
      }
    })

    ch.listen('.message.updated', (data) => {
      if (!data.message) return
      const targetId = data.message.id
      messages.value = messages.value.map((msg) => (msg.id === targetId ? { ...msg, ...data.message } : msg))

      const index = conversations.value.findIndex(c => c.id === conv.id)
      if (index !== -1 && conversations.value[index].latestMessage?.id === targetId) {
        conversations.value[index].latestMessage = data.message
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
// ✅ Subscribe ke 1 conversation aktif — sudah ditangani
// subscribeToAllConversations, fungsi ini hanya set isConnected
// ============================================================
function subscribeToConversation(conversationId) {
  isConnected.value = true
}

function unsubscribeFromConversation() {
  if (echoChannel) {
    window.Echo?.leaveChannel(echoChannel.name)
    echoChannel = null
    isConnected.value = false
  }
}

// ============================================================
// API Calls
// ============================================================
const fetchStats = async () => {
  try {
    const { data } = await api.get('/vendor/admin-chat/stats')
    if (data.success && data.stats) stats.value = data.stats
  } catch { stats.value = { total: 0, active: 0, resolved: 0, unread_total: 0 } }
}

const fetchConversations = async () => {
  loadingConversations.value = true
  try {
    const params = {
      per_page: 50,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(filterStatus.value !== 'all' && { status: filterStatus.value })
    }
    const { data } = await api.get('/vendor/admin-chat/conversations', { params })
    if (data.success) {
      conversations.value = data.data || []
      // ✅ Subscribe ke semua conversation setelah data loaded
      subscribeToAllConversations()
    }
  } catch { conversations.value = [] }
  finally { loadingConversations.value = false }
}

const setFilter = (status) => { filterStatus.value = status; fetchConversations() }

const selectConversation = async (conversation) => {
  clearTypingIndicator()
  activeConversation.value = conversation
  showChatMobile.value = true
  subscribeToConversation(conversation.id)
  await fetchMessages(conversation.id)
}

const backToSidebar = () => {
  clearTypingIndicator()
  showChatMobile.value = false
  // Tidak unsubscribe — tetap terima notif
}

const fetchMessages = async (conversationId) => {
  loadingMessages.value = true
  try {
    const { data } = await api.get(`/vendor/admin-chat/conversations/${conversationId}/messages`)
    if (data.success) {
      messages.value = data.messages || []
      clearTypingIndicator()
      if (data.conversation) activeConversation.value = data.conversation
    }
    // ✅ Reset unread badge conversation ini
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      const prevUnread = conversations.value[index].unread_count || 0
      conversations.value[index].unread_count = 0
      // Kurangi stats.unread_total
      stats.value.unread_total = Math.max(0, (stats.value.unread_total || 0) - prevUnread)
    }
    await nextTick()
    scrollToBottom()
    fetchStats()
    // ✅ Paksa broadcast ke admin bahwa vendor sudah baca
    markConversationAsRead(conversationId)
  } catch (error) {
    messages.value = []
    if (error.response?.status !== 404) {
      Swal.fire({ icon: 'error', title: 'Kesalahan', text: 'Gagal memuat pesan', confirmButtonColor: '#696cff' })
    }
  } finally { loadingMessages.value = false }
}

const sendMessage = async () => {
  const hasText  = newMessage.value.trim().length > 0
  const hasPhoto = chatPhotos.value.length > 0
  if ((!hasText && !hasPhoto) || sending.value) return

  const messageText  = newMessage.value
  const msgType      = messageType.value
  const photosToSend = [...chatPhotos.value]

  clearTimeout(sendTypingThrottle)
  sendTypingThrottle = null
  clearTypingIndicator()
  newMessage.value = ''
  chatPhotos.value = []
  if (chatPhotoInput.value) chatPhotoInput.value.value = ''
  sending.value = true

  try {
    const formData = new FormData()
    formData.append('message', messageText)
    formData.append('message_type', msgType)
    photosToSend.forEach((p, i) => formData.append(`photos[${i}]`, p.file))

    const { data } = await api.post(
      `/vendor/admin-chat/conversations/${activeConversation.value.id}/messages`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    if (data.success) {
      // ✅ Cek duplikat sebelum push
      const exists = messages.value.some(m => m.id === data.data.id)
      if (!exists) {
        messages.value.push(data.data)
      }
      await nextTick(); scrollToBottom()
      const index = conversations.value.findIndex(c => c.id === activeConversation.value.id)
      if (index !== -1) {
        conversations.value[index].last_message_at = new Date().toISOString()
        conversations.value[index].latestMessage   = data.data
      }
      messageType.value = 'regular'
    }
  } catch (error) {
    newMessage.value = messageText
    chatPhotos.value = photosToSend
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Pesan gagal dikirim', confirmButtonColor: '#696cff' })
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
    const { data } = await api.delete(`/vendor/admin-chat/conversations/${activeConversation.value.id}/messages/${message.id}`)
    const deletedMessage = data?.data
    if (deletedMessage?.id) {
      messages.value = messages.value.map((msg) => (msg.id === deletedMessage.id ? { ...msg, ...deletedMessage } : msg))
      const index = conversations.value.findIndex(c => c.id === activeConversation.value.id)
      if (index !== -1 && conversations.value[index].latestMessage?.id === deletedMessage.id) {
        conversations.value[index].latestMessage = deletedMessage
      }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Pesan tidak berhasil dihapus', confirmButtonColor: '#696cff' })
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
    const { data } = await api.put(`/vendor/admin-chat/conversations/${activeConversation.value.id}/messages/${message.id}`, {
      message: result.value,
    })
    const updatedMessage = data?.data
    if (updatedMessage?.id) {
      messages.value = messages.value.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
      const index = conversations.value.findIndex(c => c.id === activeConversation.value.id)
      if (index !== -1 && conversations.value[index].latestMessage?.id === updatedMessage.id) {
        conversations.value[index].latestMessage = updatedMessage
      }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Pesan tidak berhasil diperbarui', confirmButtonColor: '#696cff' })
  }
}

const handleTypingInput = (event) => {
  autoResize(event)
  if (sendTypingThrottle || !activeConversation.value?.id || (!newMessage.value.trim() && chatPhotos.value.length === 0)) return
  sendTypingThrottle = setTimeout(async () => {
    sendTypingThrottle = null
    try {
      await api.post(`/vendor/admin-chat/conversations/${activeConversation.value.id}/typing`)
    } catch {}
  }, 450)
}

const handleChatPhotoSelect = (event) => {
  const files     = Array.from(event.target.files)
  const remaining = 5 - chatPhotos.value.length
  if (files.length > remaining) {
    Swal.fire({ icon: 'warning', title: 'Peringatan', text: `Maksimal 5 foto per pesan (sisa slot: ${remaining})`, confirmButtonColor: '#696cff' })
    event.target.value = ''; return
  }
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Peringatan', text: `File "${file.name}" terlalu besar (maks. 5MB)`, confirmButtonColor: '#696cff' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => chatPhotos.value.push({ file, preview: e.target.result })
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const removeChatPhoto = (index) => { chatPhotos.value.splice(index, 1) }

const openNewConvModal = async () => {
  try {
    const { data } = await api.get('/vendor/tickets', { params: { per_page: 100 } })
    const tickets  = Array.isArray(data) ? data : (data.data || data.tickets || [])
    myTickets.value = tickets.filter(t => ['new', 'in_progress', 'waiting_response'].includes(t.status))
    if (myTickets.value.length === 0) {
      Swal.fire({ icon: 'info', title: 'Tidak Ada Tiket', text: 'Anda belum memiliki tiket yang sedang dikerjakan', confirmButtonColor: '#696cff' })
      return
    }
    showNewConvModal.value = true
  } catch {
    Swal.fire({ icon: 'error', title: 'Kesalahan', text: 'Gagal memuat daftar tiket', confirmButtonColor: '#696cff' })
  }
}

const closeNewConvModal = () => {
  showNewConvModal.value = false
  newConv.value = { ticketId: '', messageType: 'regular', message: '' }
}

const startNewConversation = async () => {
  if (!newConv.value.ticketId || !newConv.value.message.trim()) {
    Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Silakan pilih tiket dan tulis pesan', confirmButtonColor: '#696cff' })
    return
  }
  sending.value = true
  try {
    const { data } = await api.post('/vendor/admin-chat/conversations', {
      ticket_id:    parseInt(newConv.value.ticketId),
      message:      newConv.value.message,
      message_type: newConv.value.messageType
    })
    if (data.success) {
      closeNewConvModal()
      await fetchConversations()
      await fetchStats()
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Percakapan baru dimulai', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
      const newConversation = conversations.value.find(c => c.id === data.data.id)
      if (newConversation) await selectConversation(newConversation)
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Gagal memulai percakapan', confirmButtonColor: '#696cff' })
  } finally { sending.value = false }
}

const openCompletionModal  = () => { showCompletionModal.value = true }
const closeCompletionModal = () => {
  showCompletionModal.value = false
  completionReport.value = { message: '', notes: '', photos: [] }
  if (photoInput.value) photoInput.value.value = ''
}

const handlePhotoUpload = (event) => {
  const files = Array.from(event.target.files)
  if (completionReport.value.photos.length + files.length > 5) {
    Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Maksimal 5 foto', confirmButtonColor: '#696cff' })
    event.target.value = ''; return
  }
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Peringatan', text: `File ${file.name} terlalu besar (maks. 5MB)`, confirmButtonColor: '#696cff' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => completionReport.value.photos.push({ file, preview: e.target.result })
    reader.readAsDataURL(file)
  })
}

const removePhoto = (index) => { completionReport.value.photos.splice(index, 1) }

const submitCompletionReport = async () => {
  if (!completionReport.value.message.trim()) {
    Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Deskripsi pekerjaan harus diisi', confirmButtonColor: '#696cff' })
    return
  }
  const ticketId = activeConversation.value?.ticket_id
  if (!ticketId) {
    Swal.fire({ icon: 'error', title: 'Kesalahan', text: 'Tiket tidak ditemukan', confirmButtonColor: '#696cff' })
    return
  }
  sending.value = true
  try {
    const formData = new FormData()
    formData.append('message', completionReport.value.message)
    if (completionReport.value.notes) formData.append('completion_notes', completionReport.value.notes)
    completionReport.value.photos.forEach((photo, index) => formData.append(`photos[${index}]`, photo.file))
    const { data } = await api.post(
      `/vendor/admin-chat/tickets/${ticketId}/report-completion`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    if (data.success) {
      closeCompletionModal()
      messages.value.push(data.data)
      await nextTick(); scrollToBottom()
      if (activeConversation.value.ticket) activeConversation.value.ticket.status = 'waiting_response'
      Swal.fire({ icon: 'success', title: 'Berhasil!', html: '<p>Laporan penyelesaian telah dikirim ke admin.</p>', confirmButtonColor: '#696cff' })
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Gagal mengirim laporan', confirmButtonColor: '#696cff' })
  } finally { sending.value = false }
}

const viewTicket       = (ticketId) => router.push(`/vendor/tickets/${ticketId}`)
const scrollToBottom   = () => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }
const autoResize       = (event) => { const el = event.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
const isFromMe         = (message) => message.sender_id === authStore.user?.id
const viewPhoto        = (url) => { photoViewerUrl.value = url }
const closePhotoViewer = () => { photoViewerUrl.value = null }

const getPhotoUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`
}

const getMessageTypeIcon  = (type) => ({ warning: 'bx bx-error', escalation: 'bx bx-rocket', progress_update: 'bx bx-trending-up', issue_report: 'bx bx-error-circle', completion_report: 'bx bx-check-circle' }[type] || 'bx bx-message')
const getMessageTypeLabel = (type) => ({ warning: 'Peringatan dari Admin', escalation: 'Eskalasi', progress_update: 'Update Progres', issue_report: 'Laporan Kendala', completion_report: 'Laporan Penyelesaian' }[type] || '')

const formatTime        = (d) => { if (!d) return ''; const date = new Date(d), now = new Date(), diff = Math.floor((now - date) / 60000); if (diff < 1) return 'Baru saja'; if (diff < 60) return `${diff} menit lalu`; const h = Math.floor(diff / 60); if (h < 24) return `${h} jam lalu`; const days = Math.floor(h / 24); if (days < 7) return `${days} hari lalu`; return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
const formatMessageTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
const formatDate        = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const formatPriority    = (p) => ({ urgent: 'Urgent', high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }[p] || p || '')
const formatStatus      = (s) => ({ new: 'Baru', in_progress: 'Diproses', waiting_response: 'Menunggu Konfirmasi', resolved: 'Selesai', closed: 'Ditutup' }[s] || s || '')

const debouncedSearch = debounce(() => fetchConversations(), 500)
function debounce(func, wait) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func.apply(this, args), wait) } }

onBeforeUnmount(() => {
  unsubscribeFromConversation()
  unsubscribeFromAllConversations()
  clearTypingIndicator()
  clearTimeout(sendTypingThrottle)
})

onMounted(() => { fetchConversations(); fetchStats() })
</script>

<style scoped>
.vendor-admin-chat-page { padding: 2rem; max-width: 1600px; margin: 0 auto; background: #f8f9fa; min-height: 100vh; }

.pusher-status { font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.2rem; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; gap: 2rem; background: white; padding: 1.5rem 2rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.header-left h4 { color: #2c3e50; display: flex; align-items: center; }
.header-left p  { font-size: 0.9rem; margin-top: 0.25rem; }
.header-stats   { display: flex; gap: 1rem; }
.stat-card { background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); padding: 1rem 1.5rem; border-radius: 12px; border: 2px solid #e9ecef; display: flex; align-items: center; gap: 1rem; min-width: 140px; transition: all 0.3s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(105,108,255,.1); }
.stat-card i { font-size: 2rem; color: #696cff; }
.stat-card.unread i { color: #ff6b6b; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.stat-card div small  { display: block; color: #6c757d; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-card div strong { display: block; color: #2c3e50; font-size: 1.5rem; font-weight: 700; }

.chat-container { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; height: calc(100vh - 240px); }

.conversations-sidebar { background: white; border-radius: 16px; border: 2px solid #e9ecef; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.sidebar-header { padding: 1.5rem; border-bottom: 2px solid #e9ecef; background: #f8f9fa; }
.search-box { position: relative; margin-bottom: 1rem; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; font-size: 1.1rem; }
.search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 2px solid #e9ecef; border-radius: 12px; font-size: 0.9rem; transition: all 0.3s; }
.search-box input:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.filter-tabs { display: flex; gap: 0.5rem; }
.tab-btn { flex: 1; padding: 0.625rem; background: white; border: 2px solid #e9ecef; border-radius: 8px; font-weight: 600; color: #6c757d; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
.tab-btn:hover { background: #f8f9fa; border-color: #696cff; }
.tab-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: #667eea; }
.conversations-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
.conversations-list::-webkit-scrollbar { width: 6px; }
.conversations-list::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
.sidebar-footer { padding: 1rem; border-top: 2px solid #e9ecef; background: #f8f9fa; }
.btn-new-conv { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.9rem; transition: all 0.3s; }
.btn-new-conv:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(105,108,255,.4); }
.btn-new-conv i { font-size: 1.2rem; }

.conversation-card { display: flex; gap: 1rem; padding: 1rem; border-radius: 12px; cursor: pointer; margin-bottom: 0.5rem; transition: all 0.2s; border: 2px solid transparent; }
.conversation-card:hover      { background: #f8f9fa; border-color: #e9ecef; }
.conversation-card.active     { background: linear-gradient(135deg, rgba(105,108,255,.1) 0%, rgba(118,75,162,.1) 100%); border-color: #696cff; }
.conversation-card.has-unread { background: #f0f4ff; }
.conv-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; position: relative; flex-shrink: 0; }
.unread-badge { position: absolute; top: -4px; right: -4px; background: #dc3545; color: white; font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 10px; font-weight: 700; min-width: 20px; text-align: center; }
.conv-info { flex: 1; min-width: 0; }
.conv-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.conv-header h6 { margin: 0; font-size: 0.95rem; font-weight: 600; color: #2c3e50; }
.conv-time      { font-size: 0.75rem; color: #6c757d; white-space: nowrap; }
.conv-ticket    { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-size: 0.8rem; color: #667eea; font-weight: 500; }
.conv-preview   { font-size: 0.85rem; color: #6c757d; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.priority-badge { font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 8px; font-weight: 700; text-transform: uppercase; }
.priority-urgent { background: #fee; color: #c00; }
.priority-high   { background: #ffe; color: #c60; }
.priority-medium { background: #ffc; color: #860; }
.priority-low    { background: #efe; color: #060; }

.chat-area { background: white; border-radius: 16px; border: 2px solid #e9ecef; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.no-conversation { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; text-align: center; }
.no-conv-icon { width: 120px; height: 120px; background: linear-gradient(135deg, rgba(105,108,255,.1) 0%, rgba(118,75,162,.1) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
.no-conv-icon i    { font-size: 4rem; color: #696cff; }
.no-conversation h5 { color: #2c3e50; margin-bottom: 0.5rem; }
.no-conversation p  { color: #6c757d; margin-bottom: 2rem; max-width: 400px; }
.chat-active { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.chat-header { padding: 1.5rem; border-bottom: 2px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); }
.header-info  { display: flex; align-items: center; gap: 1rem; }
.admin-avatar { width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; flex-shrink: 0; }
.header-info h5 { margin: 0 0 0.25rem 0; color: #2c3e50; font-size: 1.1rem; }
.header-info p  { margin: 0; font-size: 0.85rem; color: #6c757d; display: flex; align-items: center; gap: 0.5rem; }
.header-actions { display: flex; gap: 0.5rem; }

.ticket-info-bar { padding: 1rem 1.5rem; background: linear-gradient(135deg, rgba(105,108,255,.05) 0%, rgba(118,75,162,.05) 100%); border-bottom: 1px solid #e9ecef; }
.ticket-details { display: flex; gap: 2rem; flex-wrap: wrap; }
.detail-item   { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #6c757d; }
.detail-item i { color: #696cff; font-size: 1rem; }
.status-badge            { font-size: 0.7rem; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 700; text-transform: uppercase; }
.status-new              { background: #fff3cd; color: #856404; }
.status-in_progress      { background: #cce5ff; color: #004085; }
.status-waiting_response { background: #f8f9fa; color: #6c757d; }
.status-resolved         { background: #d4edda; color: #155724; }
.status-closed           { background: #f8f9fa; color: #383d41; }

.messages-area { flex: 1; overflow-y: auto; padding: 1.5rem; background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); }
.messages-area::-webkit-scrollbar       { width: 8px; }
.messages-area::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
.conversation-start { display: flex; align-items: center; gap: 1rem; margin: 2rem 0; color: #6c757d; font-size: 0.8rem; }
.start-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #e9ecef, transparent); }
.message-item { display: flex; gap: 0.75rem; margin-bottom: 1rem; animation: msgSlide 0.3s ease; }
@keyframes msgSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.message-sent  { justify-content: flex-end; }
.message-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; flex-shrink: 0; }
.message-content { max-width: 70%; }
.message-sender  { font-size: 0.75rem; font-weight: 600; color: #667eea; margin-bottom: 0.25rem; }
.message-type-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; background: #fff3cd; color: #856404; border-radius: 8px; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.5rem; }

.message-bubble { padding: 0.875rem 1.125rem; border-radius: 16px; word-wrap: break-word; box-shadow: 0 2px 8px rgba(0,0,0,.08); overflow: hidden; }
.message-bubble.has-photos { padding: 0; }
.bubble-text { margin: 0; line-height: 1.5; padding: 0.625rem 1.125rem 0.75rem; }
.message-bubble:not(.has-photos) .bubble-text { padding: 0; }
.message-bubble.has-photos .completion-notes { margin: 0; border-radius: 0; padding: 0.5rem 1.125rem 0.75rem; }
.message-sent .message-bubble { background: white; color: #2c3e50; border-bottom-right-radius: 4px; border: 1px solid #e9ecef; }
.message-sent .bubble-text    { color: #2c3e50; }
.message-sent .completion-notes { background: rgba(0,0,0,.04); }
.message-received .message-bubble { background: white; color: #2c3e50; border-bottom-left-radius: 4px; border: 1px solid #e9ecef; }
.bubble--typing { display: inline-flex; align-items: center; gap: 5px; min-width: 132px; padding: 0.85rem 1.05rem !important; }
.message-bubble.type-warning           { border-left: 4px solid #ffa500 !important; background: #fff3cd !important; color: #856404 !important; padding: 0.875rem 1.125rem !important; }
.message-bubble.type-escalation        { border-left: 4px solid #ff6b6b !important; background: #fee !important; color: #c00 !important; padding: 0.875rem 1.125rem !important; }
.message-bubble.type-completion_report { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important; color: #155724 !important; border-left: 4px solid #28a745 !important; }

.wa-photos-grid { display: grid; gap: 2px; width: 100%; overflow: hidden; border-radius: 14px 14px 0 0; line-height: 0; }
.photo-only .wa-photos-grid { border-radius: 14px; }
.wa-grid-1 { grid-template-columns: 1fr; }
.wa-grid-1 .wa-photo-cell img { height: 220px; }
.wa-grid-2 { grid-template-columns: 1fr 1fr; }
.wa-grid-2 .wa-photo-cell img { height: 160px; }
.wa-grid-3 { grid-template-columns: 1fr 1fr; }
.wa-grid-3 .wa-photo-cell:first-child { grid-row: span 2; }
.wa-grid-3 .wa-photo-cell img { height: 120px; }
.wa-grid-3 .wa-photo-cell:first-child img { height: 100%; }
.wa-grid-4 { grid-template-columns: 1fr 1fr; }
.wa-grid-4 .wa-photo-cell img { height: 130px; }
.wa-photo-cell { position: relative; overflow: hidden; background: #000; cursor: pointer; }
.wa-photo-cell img { width: 100%; object-fit: cover; display: block; transition: transform 0.25s ease, opacity 0.25s ease; }
.wa-photo-cell:hover img { transform: scale(1.04); opacity: 0.9; }
.wa-more-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; }

.completion-notes { margin-top: 0.75rem; padding: 0.75rem; background: rgba(0,0,0,.05); border-radius: 8px; display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; }
.completion-notes div strong { display: block; margin-bottom: 0.25rem; }

.message-meta                { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; font-size: 0.7rem; color: #6c757d; }
.message-sent .message-meta  { justify-content: flex-end; color: #6c757d; }
.message-edit-btn { border: none; background: transparent; color: #4f46e5; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; }
.message-edit-btn:hover { opacity: 0.8; }
.message-delete-btn { border: none; background: transparent; color: #dc3545; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; }
.message-delete-btn:hover { opacity: 0.8; }
.message-status i.read { color: #28a745; }
.typing-text { color: #94a3b8; font-size: 0.78rem; font-style: italic; margin-right: 0.15rem; }
.typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #a5b4fc; animation: typingBounce 1.3s infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.18s; }
.typing-dot:nth-child(3) { animation-delay: 0.36s; }
@keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
.typing-fade-enter-active, .typing-fade-leave-active { transition: all 0.25s ease; }
.typing-fade-enter-from, .typing-fade-leave-to { opacity: 0; transform: translateY(6px); }

.message-input { padding: 1.5rem; border-top: 2px solid #e9ecef; background: white; }
.input-options { display: flex; gap: 1rem; margin-bottom: 1rem; }
.message-type-select { flex: 1; padding: 0.5rem 1rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.85rem; background: white; cursor: pointer; transition: all 0.3s; }
.message-type-select:focus { outline: none; border-color: #696cff; }
.btn-completion { padding: 0.5rem 1rem; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; transition: all 0.3s; }
.btn-completion:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(40,167,69,.3); }

.chat-photo-previews { display: flex; gap: 0.5rem; padding: 0.75rem 0 0.5rem; flex-wrap: wrap; }
.chat-photo-thumb { position: relative; width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 2px solid #e9ecef; flex-shrink: 0; }
.chat-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
.chat-photo-remove { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(220,53,69,.9); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; transition: all 0.2s; }
.chat-photo-remove:hover { background: #dc3545; transform: scale(1.1); }
.chat-photo-num { position: absolute; bottom: 2px; left: 4px; background: rgba(0,0,0,.6); color: white; font-size: 0.65rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.chat-photo-empty { width: 72px; height: 72px; border-radius: 8px; border: 2px dashed #cbd5e0; display: flex; align-items: center; justify-content: center; color: #cbd5e0; font-size: 1.5rem; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.chat-photo-empty:hover { border-color: #696cff; color: #696cff; background: #f0f4ff; }

.input-row { display: flex; gap: 1rem; align-items: flex-end; }
.input-row textarea { flex: 1; border: 2px solid #e9ecef; border-radius: 12px; padding: 0.875rem 1.125rem; font-size: 0.9rem; resize: none; max-height: 120px; font-family: inherit; transition: all 0.3s; }
.input-row textarea:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.btn-attach-photo { position: relative; width: 48px; height: 48px; background: #f0f4ff; border: 2px solid #e9ecef; border-radius: 50%; color: #696cff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s; font-size: 1.4rem; }
.btn-attach-photo:hover:not(:disabled) { background: #696cff; color: white; border-color: #696cff; }
.btn-attach-photo:disabled { opacity: 0.4; cursor: not-allowed; }
.photo-count-badge { position: absolute; top: -6px; right: -10px; background: #696cff; color: white; font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 10px; white-space: nowrap; }
.btn-send { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s; }
.btn-send:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 4px 12px rgba(105,108,255,.4); }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-send i { font-size: 1.5rem; }
.conversation-closed { padding: 1.5rem; background: #f8f9fa; border-top: 2px solid #e9ecef; text-align: center; color: #6c757d; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 500; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-content { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,.2); animation: slideUp 0.3s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
.modal-content.large { max-width: 700px; }
.modal-header { padding: 1.5rem; border-bottom: 2px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); }
.modal-header h5 { margin: 0; color: #2c3e50; font-weight: 600; display: flex; align-items: center; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #6c757d; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s; }
.btn-close:hover { background: #f8f9fa; color: #2c3e50; }
.modal-body   { padding: 1.5rem; }
.modal-footer { padding: 1.5rem; border-top: 2px solid #e9ecef; display: flex; justify-content: flex-end; gap: 1rem; background: #f8f9fa; }
.alert { padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; gap: 1rem; }
.alert-info { background: #e7f3ff; border: 1px solid #b3d9ff; color: #004085; }
.alert i { font-size: 1.5rem; flex-shrink: 0; }
.alert strong { display: block; margin-bottom: 0.25rem; }
.alert p { margin: 0; font-size: 0.9rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: flex; align-items: center; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
.form-control { width: 100%; padding: 0.75rem 1rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.9rem; transition: all 0.3s; }
.form-control:focus { outline: none; border-color: #696cff; box-shadow: 0 0 0 3px rgba(105,108,255,.1); }
.form-text { display: block; margin-top: 0.5rem; font-size: 0.8rem; }
.photo-previews  { margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
.previews-header { margin-bottom: 0.75rem; color: #2c3e50; }
.previews-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
.photo-preview   { position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #e9ecef; }
.photo-preview img { width: 100%; height: 120px; object-fit: cover; display: block; }
.remove-photo { position: absolute; top: 0.5rem; right: 0.5rem; width: 28px; height: 28px; background: rgba(220,53,69,.95); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.remove-photo:hover { background: #dc3545; transform: scale(1.1); }
.photo-number { position: absolute; bottom: 0.5rem; left: 0.5rem; background: rgba(0,0,0,.7); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }

.btn { padding: 0.625rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(105,108,255,.4); }
.btn-secondary { background: #6c757d; color: white; }
.btn-secondary:hover { background: #5a6268; }
.btn-success { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; }
.btn-success:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(40,167,69,.4); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-lg { padding: 0.875rem 2rem; font-size: 1rem; }
.btn-sm { padding: 0.375rem 0.875rem; font-size: 0.8rem; }
.btn-outline-primary { background: transparent; border: 2px solid #696cff; color: #696cff; padding: 0.375rem 0.875rem; }
.btn-outline-primary:hover { background: #696cff; color: white; }

.photo-viewer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.9); display: flex; align-items: center; justify-content: center; z-index: 2000; cursor: zoom-out; }
.photo-viewer-content { max-width: 90vw; max-height: 90vh; position: relative; }
.photo-viewer-content img { max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; }
.close-viewer { position: absolute; top: -50px; right: 0; background: rgba(255,255,255,.2); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: all 0.3s; }
.close-viewer:hover { background: rgba(255,255,255,.3); transform: scale(1.1); }

.loading-state, .empty-state, .loading-messages { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; color: #6c757d; }
.loading-state i, .empty-state i, .loading-messages i { font-size: 3rem; margin-bottom: 1rem; color: #696cff; }
.empty-state small { margin-top: 0.5rem; font-size: 0.85rem; }

.ms-2 { margin-left: 0.5rem; }
.me-1 { margin-right: 0.25rem; }
.me-2 { margin-right: 0.5rem; }
.mb-0 { margin-bottom: 0; }
.text-muted { color: #6c757d; }

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
.btn-back-mobile:hover { background: rgba(105,108,255,.1); }

@media (max-width: 768px) {
  .vendor-admin-chat-page { padding: 0; min-height: 100dvh; }

  .page-header {
    padding: 0.875rem 1rem;
    margin-bottom: 0;
    border-radius: 0;
    flex-direction: row;
    align-items: center;
  }
  .header-stats { display: none; }
  .header-left p  { display: none; }
  .header-left h4 { font-size: 1rem; margin-bottom: 0; }

  .chat-container {
    display: block;
    height: calc(100dvh - 60px);
    position: relative;
    overflow: hidden;
  }

  .conversations-sidebar {
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
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

  .chat-area {
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
    box-shadow: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .chat-area.mobile-visible { transform: translateX(0); }

  .btn-back-mobile { display: flex; }

  /* Chat header */
  .chat-header { padding: 0.75rem 1rem; }
  .header-info  { gap: 0.5rem; }
  .admin-avatar { width: 36px; height: 36px; font-size: 1.25rem; }
  .header-info h5 { font-size: 0.875rem; }
  .header-info p  { font-size: 0.7rem; }
  .header-actions .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }

  /* Ticket info bar */
  .ticket-info-bar { padding: 0.5rem 1rem; gap: 0.5rem; flex-wrap: wrap; }

  /* Messages */
  .messages-area { padding: 0.75rem 1rem; }
  .message-content { max-width: 85%; }

  /* Input */
  .message-input  { padding: 0.75rem 1rem; }
  .input-options  { gap: 0.5rem; }
  .message-type-select { font-size: 0.8rem; padding: 0.375rem 0.75rem; }
  .btn-completion { padding: 0.375rem 0.75rem; font-size: 0.8rem; }
  .chat-photo-thumb, .chat-photo-empty { width: 56px; height: 56px; }

  /* Sidebar */
  .sidebar-header { padding: 0.875rem 1rem; }
  .filter-tabs  { gap: 0.25rem; }
  .tab-btn      { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
  .sidebar-footer { padding: 0.75rem; }
  .btn-new-conv { padding: 0.625rem; font-size: 0.85rem; }

  .conversation-card { padding: 0.875rem 1rem; }
  .conv-icon { width: 42px; height: 42px; font-size: 1.25rem; }
}

@media (max-width: 400px) {
  .header-info h5 { font-size: 0.8rem; }
  .btn-completion { display: none; }
  .message-type-select { max-width: 130px; }
}
</style>

