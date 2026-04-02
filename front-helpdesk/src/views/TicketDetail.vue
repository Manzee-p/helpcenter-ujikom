<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>Memuat detail tiket...</p>
      </div>
    </div>

    <div v-else-if="ticket" class="ticket-detail-wrapper">

      <!-- HEADER -->
      <div class="ticket-header-card">
        <div class="ticket-header-content">
          <div class="header-main">
            <div class="header-left">
              <div class="ticket-number-badge">
                <span class="badge-label">TIKET</span>
                <span class="badge-number">#{{ ticketNumber }}</span>
              </div>
              <h1 class="ticket-title">{{ ticketTitle }}</h1>
              <div class="header-meta">
                <div class="meta-item">
                  <div class="meta-icon"><i class="fas fa-user"></i></div>
                  <div class="meta-content">
                    <span class="meta-label">Dibuat oleh</span>
                    <span class="meta-value">{{ userName }}</span>
                  </div>
                </div>
                <div class="meta-divider"></div>
                <div class="meta-item">
                  <div class="meta-icon"><i class="fas fa-clock"></i></div>
                  <div class="meta-content">
                    <span class="meta-label">Dibuat pada</span>
                    <span class="meta-value">{{ formatDate(ticket.created_at) }}</span>
                  </div>
                </div>
                <div class="meta-divider"></div>
                <div class="meta-item">
                  <div :class="['live-dot', isConnected ? 'live-dot--on' : 'live-dot--off']"></div>
                  <div class="meta-content">
                    <span class="meta-label">Live Chat</span>
                    <span :class="['meta-value', isConnected ? 'text-green' : 'text-gray']">
                      {{ isConnected ? 'Terhubung' : 'Menghubungkan...' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="canDelete" class="header-actions">
              <button @click="showDeleteModal = true" class="btn-delete" :disabled="deletionLoading">
                <i class="fas fa-trash-alt"></i><span>Ajukan Penghapusan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ALERTS -->
      <transition name="alert-slide">
        <div v-if="ticket.deletion_request?.status === 'pending'" class="alert-banner alert-warning">
          <div class="alert-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="alert-content">
            <h4 class="alert-title">Permintaan Penghapusan Menunggu</h4>
            <p class="alert-message">Permintaan penghapusan Anda sedang dalam peninjauan admin.</p>
          </div>
        </div>
      </transition>
      <transition name="alert-slide">
        <div v-if="ticket.deletion_request?.status === 'rejected'" class="alert-banner alert-danger">
          <div class="alert-icon"><i class="fas fa-times-circle"></i></div>
          <div class="alert-content">
            <h4 class="alert-title">Permintaan Penghapusan Ditolak</h4>
            <p class="alert-message">{{ ticket.deletion_request.admin_notes || 'Permintaan penghapusan Anda telah ditolak oleh admin.' }}</p>
          </div>
        </div>
      </transition>

      <!-- CONTENT GRID -->
      <div class="content-grid">

        <!-- Informasi Tiket -->
        <div class="detail-card">
          <div class="card-header">
            <div class="card-header-icon"><i class="fas fa-file-alt"></i></div>
            <h3 class="card-title">Informasi Tiket</h3>
          </div>
          <div class="card-body">
            <div class="info-block">
              <div class="info-label"><i class="fas fa-align-left"></i><span>Deskripsi</span></div>
              <div class="description-box">{{ ticketDescription }}</div>
            </div>
            <div class="details-grid">
              <div class="detail-box">
                <div class="detail-icon category-icon"><i class="fas fa-folder"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Kategori</span>
                  <span class="detail-value">{{ categoryName }}</span>
                </div>
              </div>
              <div class="detail-box priority-box">
                <div class="detail-icon priority-icon"><i class="fas fa-flag"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Prioritas Resmi <span class="admin-tag">oleh Admin</span></span>
                  <div v-if="ticketPriority" class="detail-value">
                    <span :class="['priority-tag', `priority-${ticketPriority}`]">{{ formatPriority(ticketPriority) }}</span>
                  </div>
                  <span v-else class="detail-value pending-text"><i class="fas fa-spinner fa-pulse"></i> Menunggu penetapan</span>
                </div>
              </div>
              <div class="detail-box">
                <div class="detail-icon status-icon"><i class="fas fa-tasks"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Status Saat Ini</span>
                  <div class="detail-value"><TicketStatusBadge :status="ticketStatus" /></div>
                </div>
              </div>
              <div class="detail-box">
                <div class="detail-icon assignee-icon"><i class="fas fa-user-tie"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Ditugaskan Kepada</span>
                  <span v-if="ticket.assigned_to" class="detail-value assigned"><i class="fas fa-check-circle"></i> {{ ticket.assigned_to_user?.name || 'Vendor' }}</span>
                  <span v-else class="detail-value unassigned"><i class="fas fa-clock"></i> Menunggu penugasan</span>
                </div>
              </div>
            </div>
            <div v-if="urgencyLevel" class="urgency-card">
              <div class="urgency-header">
                <div class="urgency-icon-wrapper"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="urgency-text">
                  <h4>Indikasi Urgensi Anda</h4>
                  <p>Anda menandai masalah ini sebagai <strong>{{ formatUrgencyLevel(urgencyLevel) }}</strong>.</p>
                </div>
                <span :class="['urgency-badge', `urgency-${urgencyLevel}`]">{{ formatUrgencyLevel(urgencyLevel) }}</span>
              </div>
            </div>
            <div v-if="eventName" class="event-card">
              <div class="info-label"><i class="fas fa-calendar-check"></i><span>Detail Acara</span></div>
              <div class="event-list">
                <div class="event-item"><i class="fas fa-calendar"></i><span>{{ eventName }}</span></div>
                <div v-if="venue" class="event-item"><i class="fas fa-map-marker-alt"></i><span>{{ venue }}</span></div>
                <div v-if="area"  class="event-item"><i class="fas fa-building"></i><span>{{ area }}</span></div>
              </div>
            </div>
            <div v-if="attachments.length > 0" class="attachments-section">
              <div class="info-label"><i class="fas fa-paperclip"></i><span>Lampiran ({{ attachments.length }})</span></div>
              <div class="attachments-list">
                <div v-for="(file, index) in attachments" :key="index" class="attachment-card">
                  <div class="attachment-icon"><i :class="getFileIcon(file.file_name)"></i></div>
                  <div class="attachment-details">
                    <p class="attachment-name">{{ file.file_name }}</p>
                    <span class="attachment-size">{{ formatFileSize(file.file_size) }}</span>
                  </div>
                  <a :href="`${apiBaseUrl}/storage/${file.file_path}`" target="_blank" class="attachment-download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>

            <div v-if="showVendorRatingCard" class="vendor-rating-section">
              <div class="info-label"><i class="fas fa-star"></i><span>Rating Vendor</span></div>

              <div v-if="hasSubmittedFeedback" class="vendor-rating-card vendor-rating-card--submitted">
                <div class="vendor-rating-head">
                  <div>
                    <h4>Penilaian untuk {{ vendorName }}</h4>
                    <p>Terima kasih, rating Anda untuk vendor sudah tersimpan.</p>
                  </div>
                  <span class="vendor-rating-badge">Terkirim</span>
                </div>

                <div class="vendor-rating-stars is-readonly">
                  <button
                    v-for="star in 5"
                    :key="`submitted-${star}`"
                    type="button"
                    class="star-btn"
                    :class="{ active: star <= submittedRating }"
                    disabled
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>

                <p class="vendor-rating-score">{{ submittedRating }}/5 bintang</p>
                <div v-if="submittedComment" class="vendor-rating-comment">
                  {{ submittedComment }}
                </div>
                <p v-else class="vendor-rating-empty">Anda tidak menambahkan komentar untuk rating ini.</p>
              </div>

              <div v-else class="vendor-rating-card">
                <div class="vendor-rating-head">
                  <div>
                    <h4>Beri rating untuk {{ vendorName }}</h4>
                    <p>Tiket sudah selesai. Silakan nilai pengalaman Anda dengan vendor.</p>
                  </div>
                  <span class="vendor-rating-badge vendor-rating-badge--pending">Menunggu</span>
                </div>

                <div class="vendor-rating-stars">
                  <button
                    v-for="star in 5"
                    :key="`input-${star}`"
                    type="button"
                    class="star-btn"
                    :class="{ active: star <= feedbackForm.rating }"
                    @click="feedbackForm.rating = star"
                    :disabled="feedbackSubmitting"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>

                <p class="vendor-rating-score">{{ feedbackRatingLabel }}</p>

                <textarea
                  v-model="feedbackForm.comment"
                  class="feedback-textarea"
                  rows="4"
                  maxlength="1000"
                  placeholder="Ceritakan pengalaman Anda dengan vendor ini..."
                  :disabled="feedbackSubmitting"
                ></textarea>

                <div class="feedback-actions">
                  <span class="feedback-hint">{{ feedbackForm.comment?.length || 0 }} / 1000 karakter</span>
                  <button
                    class="btn-feedback-submit"
                    @click="submitFeedback"
                    :disabled="!canSubmitFeedback"
                  >
                    <span v-if="!feedbackSubmitting"><i class="fas fa-paper-plane"></i> Kirim Rating</span>
                    <span v-else><i class="fas fa-spinner fa-spin"></i> Mengirim...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Komunikasi / Chat -->
        <div class="detail-card chat-card">
          <div class="card-header">
            <div class="card-header-icon"><i class="fas fa-comments"></i></div>
            <h3 class="card-title">Komunikasi</h3>
            <transition name="badge-pop">
              <span v-if="unreadCount > 0" class="unread-badge-pill" @click="unreadCount = 0">
                {{ unreadCount }} pesan baru
              </span>
            </transition>
          </div>

          <div class="chat-body">
            <div class="messages-area" ref="messagesContainerRef">
              <div v-if="commentsLoading" class="chat-state">
                <div class="spinner-ring small"></div>
                <p>Memuat pesan...</p>
              </div>
              <div v-else-if="comments.length === 0" class="chat-state">
                <div class="chat-empty-icon"><i class="fas fa-comment-dots"></i></div>
                <p class="chat-empty-title">Belum ada pesan</p>
                <p class="chat-empty-sub">Mulai percakapan dengan vendor!</p>
              </div>
              <div v-else class="messages-list">
                <div class="chat-date-label">
                  <span>{{ formatChatDate(comments[0]?.created_at) }}</span>
                </div>

                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  :class="['msg-row', isMine(comment) ? 'msg-row--right' : 'msg-row--left']"
                >
                  <div class="msg-avatar" :class="{ 'msg-avatar--support': !isMine(comment) }" :title="comment.user?.name">
                    {{ getInitials(comment.user?.name) }}
                  </div>
                  <div class="msg-body">
                    <div class="msg-meta-top">
                      <span class="msg-name">{{ isMine(comment) ? 'Anda' : comment.user?.name }}</span>
                      <span :class="['msg-role-tag', isMine(comment) ? 'tag--me' : 'tag--support']">
                        {{ isMine(comment) ? 'Anda' : 'Dukungan' }}
                      </span>
                      <span class="msg-time">{{ formatRelativeTime(comment.created_at) }}</span>
                    </div>
                    <div :class="['msg-bubble',
                      isMine(comment) ? 'bubble--me' : 'bubble--support',
                      comment.id?.toString().startsWith('temp_') ? 'bubble--sending' : ''
                    ]">
                      {{ comment.comment }}
                      <span v-if="isMine(comment)" class="msg-tick">
                        <i :class="messageTickClass(comment)">
                        </i>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Typing indicator -->
                <transition name="typing-fade">
                  <div v-if="typingUser" class="msg-row msg-row--left">
                    <div class="msg-avatar msg-avatar--support">{{ getInitials(typingUser.name) }}</div>
                    <div class="msg-body">
                      <div class="msg-meta-top">
                        <span class="msg-name">{{ typingUser.name }}</span>
                        <span class="msg-role-tag tag--support">Dukungan</span>
                        <span class="msg-time">sedang mengetik...</span>
                      </div>
                      <div class="msg-bubble bubble--support bubble--typing">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <div class="chat-footer">
              <div v-if="['resolved', 'closed'].includes(ticketStatus)" class="chat-notice chat-notice--closed">
                <i class="fas fa-lock"></i>
                <span>Tiket ini sudah selesai sehingga chat tidak dapat digunakan lagi.</span>
              </div>
              <div v-else-if="!ticket.assigned_to" class="chat-notice chat-notice--waiting">
                <div class="notice-icon-wrap"><i class="fas fa-hourglass-half"></i></div>
                <div class="notice-text">
                  <strong>Menunggu Penugasan Vendor</strong>
                  <p>Tiket Anda sedang ditinjau. Anda dapat berkomunikasi setelah vendor ditugaskan.</p>
                  <small><i class="fas fa-clock"></i> Biasanya dalam 1–2 jam selama jam kerja.</small>
                </div>
              </div>
              <div v-else class="reply-box">
                <textarea
                  ref="replyInputRef"
                  class="reply-textarea"
                  rows="1"
                  v-model="newComment"
                  placeholder="Ketik pesan Anda... (Enter untuk kirim)"
                  @keydown.enter.exact.prevent="submitComment"
                  @input="handleTyping"
                  :disabled="commentLoading"
                ></textarea>
                <button class="reply-send-btn" @click="submitComment" :disabled="commentLoading || !newComment.trim()">
                  <i v-if="!commentLoading" class="fas fa-paper-plane"></i>
                  <i v-else class="fas fa-spinner fa-spin"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- DELETE MODAL -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="modal-icon"><i class="fas fa-trash-alt"></i></div>
            <div class="modal-title-wrapper">
              <h3 class="modal-title">Ajukan Permintaan Penghapusan Tiket</h3>
              <p class="modal-subtitle">Permintaan ini akan ditinjau oleh tim admin kami</p>
            </div>
            <button class="modal-close" @click="showDeleteModal = false"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label"><i class="fas fa-list"></i> Alasan Penghapusan <span class="required">*</span></label>
              <div class="reason-options">
                <label v-for="reason in deletionReasons" :key="reason.value"
                  class="reason-option" :class="{ active: deletionForm.reason === reason.value }">
                  <input type="radio" :value="reason.value" v-model="deletionForm.reason" />
                  <div class="option-content">
                    <i :class="reason.icon"></i>
                    <span class="option-label">{{ reason.label }}</span>
                    <i class="fas fa-check-circle option-check"></i>
                  </div>
                </label>
              </div>
            </div>
            <transition name="slide-down">
              <div v-if="deletionForm.reason === 'other'" class="form-group">
                <label class="form-label"><i class="fas fa-edit"></i> Mohon Jelaskan <span class="required">*</span></label>
                <input type="text" class="form-input" v-model="deletionForm.customReason" placeholder="Contoh: Dibuat karena kesalahan..." maxlength="100" />
                <div class="form-hint">{{ deletionForm.customReason?.length || 0 }} / 100 karakter</div>
              </div>
            </transition>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-align-left"></i> Penjelasan Detail <span class="required">*</span>
                <span class="label-hint">(Min. 150 karakter)</span>
              </label>
              <textarea v-model="deletionForm.description" class="form-textarea" rows="5" minlength="150" maxlength="1000"
                placeholder="Berikan penjelasan detail mengapa Anda ingin menghapus tiket ini..."></textarea>
              <div class="form-footer">
                <span class="char-count">{{ deletionForm.description?.length || 0 }} / 1000</span>
                <span v-if="(deletionForm.description?.length || 0) < 150" class="validation-error">
                  <i class="fas fa-exclamation-circle"></i> Min. 150 karakter
                </span>
                <span v-else class="validation-success"><i class="fas fa-check-circle"></i> Panjang sudah cukup</span>
              </div>
            </div>
            <div class="info-notice">
              <i class="fas fa-info-circle"></i>
              <p>Admin akan meninjau permintaan Anda dalam waktu 24 jam.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDeleteModal = false">Batal</button>
            <button class="btn-primary" @click="submitDeletionRequest" :disabled="!canSubmitDeletion">
              <span v-if="!deletionLoading"><i class="fas fa-paper-plane"></i> Kirim Permintaan</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Mengirim...</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { initEcho } from '@/services/pusher'
import Swal from 'sweetalert2'
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import { formatDate, formatRelativeTime, getInitials } from '@/utils/helpers'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// ── Echo ─────────────────────────────────────
let echoChannel        = null
let typingTimer        = null
let sendTypingThrottle = null

const isConnected = ref(false)
const typingUser  = ref(null)

// ── State ─────────────────────────────────────
const route           = useRoute()
const ticket          = ref(null)
const comments        = ref([])
const loading         = ref(false)
const commentsLoading = ref(false)
const commentLoading  = ref(false)
const newComment      = ref('')
const unreadCount     = ref(0)
const apiBaseUrl      = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const feedbackSubmitting = ref(false)
const feedbackForm = ref({ rating: 0, comment: '' })

const messagesContainerRef = ref(null)
const replyInputRef        = ref(null)

// Delete
const canDelete       = ref(false)
const showDeleteModal = ref(false)
const deletionLoading = ref(false)
const deletionForm    = ref({ reason: '', customReason: '', description: '' })
const deletionReasons = [
  { value: 'duplicate',      label: 'Tiket Duplikat',        icon: 'fas fa-copy' },
  { value: 'solved',         label: 'Sudah Terselesaikan',   icon: 'fas fa-check-circle' },
  { value: 'wrong_category', label: 'Kategori Salah',        icon: 'fas fa-folder' },
  { value: 'wrong_info',     label: 'Informasi Tidak Tepat', icon: 'fas fa-exclamation-triangle' },
  { value: 'other',          label: 'Alasan Lainnya',        icon: 'fas fa-ellipsis-h' },
]

// ── Computed ──────────────────────────────────
const ticketNumber      = computed(() => ticket.value?.ticket_number || '')
const ticketTitle       = computed(() => ticket.value?.title || '')
const ticketDescription = computed(() => ticket.value?.description || '')
const ticketPriority    = computed(() => ticket.value?.priority || null)
const ticketStatus      = computed(() => ticket.value?.status || '')
const urgencyLevel      = computed(() => ticket.value?.urgency_level || null)
const categoryName      = computed(() => ticket.value?.category?.name || 'N/A')
const userName          = computed(() => ticket.value?.user?.name || 'Tidak Diketahui')
const eventName         = computed(() => ticket.value?.event_name || '')
const venue             = computed(() => ticket.value?.venue || '')
const area              = computed(() => ticket.value?.area || '')
const attachments       = computed(() => ticket.value?.attachments || [])
const ticketFeedback    = computed(() => ticket.value?.feedback || null)
const vendorName        = computed(() => ticket.value?.assigned_to_user?.name || 'vendor')
const showVendorRatingCard = computed(() => {
  return ['resolved', 'closed'].includes(ticketStatus.value) && !!ticket.value?.assigned_to
})
const hasSubmittedFeedback = computed(() => !!ticketFeedback.value)
const submittedRating      = computed(() => ticketFeedback.value?.rating || 0)
const submittedComment     = computed(() => ticketFeedback.value?.comment || '')
const feedbackRatingLabel  = computed(() => {
  return feedbackForm.value.rating
    ? `${feedbackForm.value.rating}/5 bintang`
    : 'Pilih rating 1 sampai 5 bintang'
})

const canSubmitDeletion = computed(() => {
  const hasReason = !!deletionForm.value.reason
  const hasCustom = deletionForm.value.reason === 'other' ? deletionForm.value.customReason?.trim().length > 0 : true
  const hasDesc   = (deletionForm.value.description?.trim().length || 0) >= 150
  return hasReason && hasCustom && hasDesc && !deletionLoading.value
})
const canSubmitFeedback = computed(() => {
  return showVendorRatingCard.value && !hasSubmittedFeedback.value && !!feedbackForm.value.rating && !feedbackSubmitting.value
})

const isMine = (comment) => {
  if (authStore.user?.id && comment.user?.id) return comment.user.id === authStore.user.id
  return comment.user?.role === 'client'
}

// ── Scroll ────────────────────────────────────
const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    const el = messagesContainerRef.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  })
}

// ── Resize textarea ───────────────────────────
const autoResize = () => {
  const el = replyInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// ── Normalize comment ─────────────────────────
const normalizeComment = (c) => ({
  id: c.id, comment: c.comment, is_internal: c.is_internal, created_at: c.created_at,
  user: c.user ? { id: c.user.id, name: c.user.name, role: c.user.role } : null,
  is_read: !!c.is_read,
  read_at: c.read_at || null,
})

const messageTickClass = (comment) => {
  if (comment.id?.toString().startsWith('temp_')) return 'fas fa-clock tick--pending'
  if (comment.is_read || comment.read_at) return 'fas fa-check-double tick--read'
  return 'fas fa-check tick--sent'
}

// ── Echo: subscribe ───────────────────────────
const subscribeToTicket = (ticketId) => {
  if (!window.Echo) { initEcho() }
  if (!window.Echo) return

  // Cleanup channel lama jika ada
  if (echoChannel) {
    try { window.Echo.leaveChannel(`ticket.${ticketId}`) } catch {}
    echoChannel = null
  }

  try {
    // ✅ PERBAIKAN UTAMA: assign hasil .channel() ke echoChannel
    echoChannel = window.Echo.channel(`ticket.${ticketId}`)

    // ✅ Listener: pesan baru
    echoChannel.listen('.comment.new', async (data) => {
      if (!data.comment) return
      if (comments.value.some(c => c.id === data.comment.id)) return

      const normalized = normalizeComment(data.comment)
      comments.value.push(normalized)
      if (!isMine(normalized)) unreadCount.value++
      clearTypingIndicator()
      await nextTick()
      scrollToBottom(true)
    })

    // ✅ Listener: typing indicator dari vendor/admin
    echoChannel.listen('.user.typing', (data) => {
      if (!data.user) return
      if (data.user.id === authStore.user?.id) return  // abaikan diri sendiri
      if (data.user.role === 'client') return           // abaikan sesama client
      showTypingIndicator(data.user)
    })

    isConnected.value = true
    console.log(`[Echo] ✅ Subscribed to ticket.${ticketId}`)

  } catch (err) {
    console.error('[Echo] ❌ Subscribe failed:', err)
    isConnected.value = false
  }
}

const unsubscribeFromTicket = () => {
  if (ticket.value?.id) {
    try { window.Echo?.leaveChannel(`ticket.${ticket.value.id}`) } catch {}
  }
  echoChannel = null
  isConnected.value = false
}

const showTypingIndicator = (user) => {
  typingUser.value = user
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => { typingUser.value = null }, 3500)
  scrollToBottom(true)
}

const clearTypingIndicator = () => {
  typingUser.value = null
  clearTimeout(typingTimer)
}

// ── handleTyping ──────────────────────────────
const handleTyping = () => {
  autoResize()
  if (sendTypingThrottle) return
  sendTypingThrottle = setTimeout(async () => {
    sendTypingThrottle = null
    if (!ticket.value?.id || !newComment.value.trim()) return
    try { await api.post(`/tickets/${ticket.value.id}/typing`) } catch { /* silent */ }
  }, 2000)
}

// ── API ───────────────────────────────────────
const fetchTicket = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/tickets/${route.params.id}`)
    ticket.value = {
      id: data.id, ticket_number: data.ticket_number, title: data.title,
      description: data.description, status: data.status, priority: data.priority,
      urgency_level: data.urgency_level, event_name: data.event_name,
      venue: data.venue, area: data.area, created_at: data.created_at,
      assigned_at: data.assigned_at, assigned_to: data.assigned_to,
      user:             data.user       ? { id: data.user.id, name: data.user.name, role: data.user.role } : null,
      assigned_to_user: data.assignedTo ? { id: data.assignedTo.id, name: data.assignedTo.name }          : null,
      category:         data.category   ? { id: data.category.id, name: data.category.name }              : null,
      attachments:      data.attachments    || [],
      feedback:         data.feedback ? {
        id: data.feedback.id,
        rating: data.feedback.rating,
        comment: data.feedback.comment,
        created_at: data.feedback.created_at,
      } : null,
      deletion_request: data.deletionRequest || null,
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal memuat detail tiket', confirmButtonColor: '#696cff' })
  } finally { loading.value = false }
}

const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const { data } = await api.get(`/tickets/${route.params.id}/comments`)
    comments.value = Array.isArray(data) ? data.map(normalizeComment) : []
    scrollToBottom()
  } catch { comments.value = [] }
  finally { commentsLoading.value = false }
}

const checkDeletionEligibility = async () => {
  try {
    const { data } = await api.get(`/tickets/${route.params.id}/can-delete`)
    canDelete.value = data.can_delete || false
  } catch { canDelete.value = false }
}

const submitComment = async () => {
  if (!newComment.value.trim() || commentLoading.value) return
  commentLoading.value = true
  const text = newComment.value.trim()
  newComment.value = ''
  if (replyInputRef.value) replyInputRef.value.style.height = 'auto'

  const tempId = `temp_${Date.now()}`
  comments.value.push({
    id: tempId, comment: text, is_internal: false, created_at: new Date().toISOString(),
    user: ticket.value?.user || { id: authStore.user?.id, name: authStore.user?.name, role: 'client' },
    is_read: false, read_at: null,
  })
  scrollToBottom(true)

  try {
    const { data } = await api.post(`/tickets/${route.params.id}/comments`, { comment: text, is_internal: false })
    const idx = comments.value.findIndex(c => c.id === tempId)
    if (idx !== -1) comments.value[idx] = normalizeComment(data.comment || data)
    Swal.fire({ icon: 'success', title: 'Terkirim', text: 'Pesan berhasil dikirim', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
  } catch (error) {
    comments.value = comments.value.filter(c => c.id !== tempId)
    newComment.value = text
    Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Gagal mengirim pesan', confirmButtonColor: '#696cff' })
  } finally { commentLoading.value = false }
}

const submitDeletionRequest = async () => {
  if (!canSubmitDeletion.value) return
  deletionLoading.value = true
  try {
    const finalReason = deletionForm.value.reason === 'other' ? deletionForm.value.customReason.trim() : deletionForm.value.reason
    await api.post(`/tickets/${route.params.id}/request-deletion`, { reason: finalReason, description: deletionForm.value.description.trim() })
    showDeleteModal.value = false
    await Swal.fire({ icon: 'success', title: 'Permintaan Terkirim', text: 'Permintaan penghapusan Anda akan ditinjau admin.', confirmButtonColor: '#696cff' })
    await fetchTicket()
    await checkDeletionEligibility()
    deletionForm.value = { reason: '', customReason: '', description: '' }
  } catch (error) {
    const msg = error.response?.data?.message || Object.values(error.response?.data?.errors || {}).flat().join('\n') || 'Gagal mengirim permintaan'
    Swal.fire({ icon: 'error', title: 'Gagal', text: msg, confirmButtonColor: '#696cff' })
  } finally { deletionLoading.value = false }
}

const submitFeedback = async () => {
  if (!canSubmitFeedback.value) return

  feedbackSubmitting.value = true
  try {
    const { data } = await api.post(`/client/tickets/${route.params.id}/feedback`, {
      rating: feedbackForm.value.rating,
      comment: feedbackForm.value.comment?.trim() || null,
    })

    ticket.value = {
      ...ticket.value,
      feedback: {
        id: data.feedback?.id,
        rating: data.feedback?.rating ?? feedbackForm.value.rating,
        comment: data.feedback?.comment ?? (feedbackForm.value.comment?.trim() || null),
        created_at: data.feedback?.created_at ?? new Date().toISOString(),
      },
    }

    Swal.fire({
      icon: 'success',
      title: 'Rating Terkirim',
      text: `Terima kasih, penilaian Anda untuk ${vendorName.value} berhasil disimpan.`,
      confirmButtonColor: '#696cff'
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Mengirim Rating',
      text: error.response?.data?.message || 'Rating vendor tidak berhasil disimpan.',
      confirmButtonColor: '#696cff'
    })
  } finally {
    feedbackSubmitting.value = false
  }
}

// ── Helpers ───────────────────────────────────
const getFileIcon    = (f) => { if (!f) return 'fas fa-file'; const e = f.split('.').pop().toLowerCase(); return { pdf:'fas fa-file-pdf', doc:'fas fa-file-word', docx:'fas fa-file-word', jpg:'fas fa-file-image', jpeg:'fas fa-file-image', png:'fas fa-file-image' }[e] || 'fas fa-file' }
const formatFileSize = (b) => { if (!b) return '0 B'; if (b < 1024) return b+' B'; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB' }
const formatPriority     = (p) => ({ low:'Rendah', medium:'Sedang', high:'Tinggi', urgent:'Mendesak' }[p] || p)
const formatUrgencyLevel = (l) => ({ low:'Tidak Mendesak', medium:'Normal', high:'Mendesak', critical:'Sangat Mendesak' }[l] || l)
const formatChatDate     = (d) => { if (!d) return ''; return new Date(d).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) }

// ── Lifecycle ─────────────────────────────────
onMounted(async () => {
  await fetchTicket()
  await fetchComments()
  await checkDeletionEligibility()
  if (ticket.value) subscribeToTicket(ticket.value.id)
})

onBeforeUnmount(() => {
  unsubscribeFromTicket()
  clearTimeout(typingTimer)
  clearTimeout(sendTypingThrottle)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.loading-container { display:flex; align-items:center; justify-content:center; min-height:70vh; }
.loading-spinner { text-align:center; }
.spinner-ring { width:56px; height:56px; border:4px solid #f0f0f0; border-top-color:#6366f1; border-radius:50%; animation:spin .8s linear infinite; margin:0 auto 1.25rem; }
.spinner-ring.small { width:36px; height:36px; border-width:3px; margin-bottom:0; }
@keyframes spin { to{transform:rotate(360deg)} }
.loading-spinner p { font:500 1rem 'Inter',sans-serif; color:#64748b; margin:0; }

.ticket-detail-wrapper { animation:fadeUp .45s cubic-bezier(.16,1,.3,1); }
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

.ticket-header-card { background:white; border-radius:22px; margin-bottom:1.75rem; box-shadow:0 1px 4px rgba(0,0,0,.08); }
.ticket-header-content { padding:2.25rem; }
.header-main { display:flex; justify-content:space-between; align-items:flex-start; gap:1.5rem; }
.header-left { flex:1; }
.ticket-number-badge { display:inline-flex; align-items:center; gap:.4rem; background:linear-gradient(135deg,#667eea,#764ba2); color:white; padding:.4rem .9rem; border-radius:10px; margin-bottom:.875rem; font:600 .8rem 'Outfit',sans-serif; box-shadow:0 3px 10px rgba(102,126,234,.35); }
.badge-label { opacity:.85; text-transform:uppercase; letter-spacing:.5px; font-size:.7rem; }
.badge-number { font-size:.95rem; font-weight:700; }
.ticket-title { font:700 1.875rem 'Outfit',sans-serif; color:#1e293b; margin:0 0 1.25rem; line-height:1.3; }
.header-meta { display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap; }
.meta-item   { display:flex; align-items:center; gap:.625rem; }
.meta-icon   { width:38px; height:38px; background:#f0f4ff; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#667eea; font-size:.95rem; }
.meta-content { display:flex; flex-direction:column; gap:.1rem; }
.meta-label { font:500 .7rem 'Inter',sans-serif; color:#64748b; text-transform:uppercase; letter-spacing:.4px; }
.meta-value { font:600 .9rem 'Inter',sans-serif; color:#1e293b; }
.meta-divider { width:1px; height:36px; background:linear-gradient(to bottom,transparent,#e2e8f0,transparent); }
.live-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.live-dot--on  { background:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.2); animation:livePulse 2s infinite; }
.live-dot--off { background:#94a3b8; }
@keyframes livePulse { 0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,.2)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,.05)} }
.text-green { color:#10b981 !important; }
.text-gray  { color:#94a3b8 !important; }
.header-actions { flex-shrink:0; }
.btn-delete { display:inline-flex; align-items:center; gap:.5rem; padding:.8rem 1.375rem; background:white; border:2px solid #ef4444; color:#ef4444; border-radius:12px; font:600 .9rem 'Inter',sans-serif; cursor:pointer; transition:all .3s cubic-bezier(.16,1,.3,1); }
.btn-delete:hover:not(:disabled) { background:#ef4444; color:white; transform:translateY(-2px); box-shadow:0 8px 18px rgba(239,68,68,.3); }
.btn-delete:disabled { opacity:.5; cursor:not-allowed; }

.alert-banner { display:flex; align-items:flex-start; gap:.875rem; padding:1.125rem 1.375rem; border-radius:14px; margin-bottom:1.75rem; }
.alert-warning { background:linear-gradient(135deg,#fffbeb,#fef3c7); border-left:4px solid #f59e0b; }
.alert-danger  { background:linear-gradient(135deg,#fef2f2,#fee2e2); border-left:4px solid #ef4444; }
.alert-icon { width:44px; height:44px; background:white; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.375rem; }
.alert-warning .alert-icon { color:#f59e0b; } .alert-danger .alert-icon { color:#ef4444; }
.alert-content { flex:1; }
.alert-title   { font:700 1.05rem 'Outfit',sans-serif; color:#1e293b; margin:0 0 .375rem; }
.alert-message { font:400 .9rem 'Inter',sans-serif; color:#475569; margin:0; line-height:1.6; }
.alert-slide-enter-active,.alert-slide-leave-active { transition:all .4s cubic-bezier(.16,1,.3,1); }
.alert-slide-enter-from,.alert-slide-leave-to { opacity:0; transform:translateY(-16px); }

.content-grid { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(360px,.9fr); gap:1.5rem; align-items:start; }

.detail-card { background:white; border-radius:18px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); transition:box-shadow .3s; }
.detail-card:hover { box-shadow:0 4px 14px rgba(0,0,0,.08); }
.card-header { display:flex; align-items:center; gap:.875rem; padding:1.375rem 1.875rem; background:linear-gradient(135deg,#f8fafc,#f1f5f9); border-bottom:1px solid #e2e8f0; }
.card-header-icon { width:44px; height:44px; background:linear-gradient(135deg,#667eea,#764ba2); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; box-shadow:0 4px 10px rgba(102,126,234,.3); }
.card-title { font:700 1.2rem 'Outfit',sans-serif; color:#1e293b; margin:0; flex:1; }
.unread-badge-pill { background:linear-gradient(135deg,#ef4444,#dc2626); color:white; font:700 .72rem 'Inter',sans-serif; padding:.3rem .8rem; border-radius:20px; cursor:pointer; }
.badge-pop-enter-active,.badge-pop-leave-active { transition:all .3s; }
.badge-pop-enter-from,.badge-pop-leave-to { transform:scale(0); opacity:0; }
.card-body { padding:1.875rem; }
.info-label { display:flex; align-items:center; gap:.4rem; font:700 .825rem 'Inter',sans-serif; color:#64748b; text-transform:uppercase; letter-spacing:.4px; margin-bottom:.75rem; }
.info-label i { color:#667eea; font-size:.95rem; }
.info-block { margin-bottom:1.75rem; }
.description-box { font:400 .95rem 'Inter',sans-serif; color:#334155; line-height:1.7; padding:1.25rem; background:#f8fafc; border-left:4px solid #667eea; border-radius:10px; word-wrap:break-word; }
.details-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1.1rem; margin-bottom:1.75rem; }
.detail-box { display:flex; align-items:flex-start; gap:.875rem; padding:1.375rem; background:linear-gradient(135deg,#fff,#f8fafc); border:1px solid #e2e8f0; border-radius:14px; transition:all .25s; }
.detail-box:hover { border-color:#667eea; box-shadow:0 4px 12px rgba(102,126,234,.1); transform:translateY(-2px); }
.priority-box { background:linear-gradient(135deg,#fffbeb,#fef3c7); border-color:#f59e0b; }
.detail-icon { width:42px; height:42px; background:white; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.category-icon{color:#667eea} .priority-icon{color:#f59e0b} .status-icon{color:#10b981} .assignee-icon{color:#8b5cf6}
.detail-info  { flex:1; display:flex; flex-direction:column; gap:.4rem; }
.detail-label { font:600 .75rem 'Inter',sans-serif; color:#64748b; text-transform:uppercase; letter-spacing:.4px; }
.admin-tag    { display:inline-block; padding:.2rem .5rem; background:#e0e7ff; color:#4f46e5; border-radius:5px; font-size:.65rem; margin-left:.4rem; font-weight:700; }
.detail-value { font:600 .95rem 'Inter',sans-serif; color:#1e293b; }
.priority-tag { display:inline-flex; align-items:center; padding:.4rem .875rem; border-radius:8px; font-weight:700; font-size:.825rem; }
.priority-low{background:#d1fae5;color:#065f46} .priority-medium{background:#dbeafe;color:#1e40af} .priority-high{background:#fed7aa;color:#92400e} .priority-urgent{background:#fee2e2;color:#991b1b}
.pending-text { color:#64748b; font-style:italic; display:flex; align-items:center; gap:.4rem; }
.assigned   { color:#10b981; display:flex; align-items:center; gap:.4rem; }
.unassigned { color:#f59e0b; display:flex; align-items:center; gap:.4rem; }
.urgency-card { margin-bottom:1.75rem; }
.urgency-header { display:flex; align-items:center; gap:1.1rem; padding:1.375rem; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:14px; }
.urgency-icon-wrapper { width:48px; height:48px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#3b82f6; font-size:1.375rem; flex-shrink:0; }
.urgency-text { flex:1; }
.urgency-text h4 { font:700 1.05rem 'Outfit',sans-serif; color:#1e293b; margin:0 0 .375rem; }
.urgency-text p  { font:400 .9rem 'Inter',sans-serif; color:#475569; margin:0; line-height:1.6; }
.urgency-badge { padding:.625rem 1.1rem; border-radius:10px; font:700 .825rem 'Inter',sans-serif; white-space:nowrap; flex-shrink:0; }
.urgency-low{background:#d1fae5;color:#065f46} .urgency-medium{background:#dbeafe;color:#1e40af} .urgency-high{background:#fed7aa;color:#92400e} .urgency-critical{background:#fee2e2;color:#991b1b}
.event-card { margin-bottom:1.75rem; }
.event-list { display:flex; flex-direction:column; gap:.75rem; padding:1.25rem; background:#f5f3ff; border-left:4px solid #8b5cf6; border-radius:10px; }
.event-item { display:flex; align-items:center; gap:.75rem; font:500 .9rem 'Inter',sans-serif; color:#334155; }
.event-item i { color:#8b5cf6; width:22px; text-align:center; }
.attachments-section { margin-bottom:0; }
.attachments-list { display:flex; flex-direction:column; gap:.875rem; }
.attachment-card { display:flex; align-items:center; gap:.875rem; padding:1.1rem; background:white; border:1px solid #e2e8f0; border-radius:12px; transition:all .25s; }
.attachment-card:hover { border-color:#667eea; box-shadow:0 4px 12px rgba(102,126,234,.1); transform:translateX(4px); }
.attachment-icon    { width:44px; height:44px; background:#f0f4ff; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#667eea; font-size:1.2rem; flex-shrink:0; }
.attachment-details { flex:1; }
.attachment-name    { font:600 .9rem 'Inter',sans-serif; color:#1e293b; margin:0 0 .2rem; }
.attachment-size    { font:400 .78rem 'Inter',sans-serif; color:#64748b; }
.attachment-download { width:40px; height:40px; background:linear-gradient(135deg,#667eea,#764ba2); color:white; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none; transition:all .25s; }
.attachment-download:hover { transform:scale(1.1) rotate(5deg); box-shadow:0 6px 16px rgba(102,126,234,.4); }

.vendor-rating-section { margin-top:1.75rem; }
.vendor-rating-card { padding:1.4rem; background:linear-gradient(135deg,#fff7ed,#ffffff); border:1px solid #fed7aa; border-radius:16px; }
.vendor-rating-card--submitted { background:linear-gradient(135deg,#ecfdf5,#ffffff); border-color:#a7f3d0; }
.vendor-rating-head { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
.vendor-rating-head h4 { font:700 1.05rem 'Outfit',sans-serif; color:#1e293b; margin:0 0 .35rem; }
.vendor-rating-head p { font:400 .88rem 'Inter',sans-serif; color:#64748b; margin:0; line-height:1.6; }
.vendor-rating-badge { display:inline-flex; align-items:center; padding:.45rem .8rem; border-radius:999px; background:#dcfce7; color:#166534; font:700 .74rem 'Inter',sans-serif; }
.vendor-rating-badge--pending { background:#fef3c7; color:#92400e; }
.vendor-rating-stars { display:flex; align-items:center; gap:.5rem; margin-bottom:.75rem; flex-wrap:wrap; }
.vendor-rating-stars.is-readonly { margin-bottom:.5rem; }
.star-btn { width:44px; height:44px; border:none; border-radius:12px; background:#e2e8f0; color:#94a3b8; display:flex; align-items:center; justify-content:center; font-size:1.05rem; transition:all .2s; }
.star-btn.active { background:linear-gradient(135deg,#f59e0b,#f97316); color:white; box-shadow:0 6px 16px rgba(245,158,11,.3); }
.star-btn:not(:disabled) { cursor:pointer; }
.star-btn:not(:disabled):hover { transform:translateY(-2px); }
.vendor-rating-score { font:700 .9rem 'Inter',sans-serif; color:#334155; margin:0 0 1rem; }
.vendor-rating-comment { padding:1rem 1.1rem; background:white; border:1px solid #d1fae5; border-radius:12px; font:400 .9rem 'Inter',sans-serif; color:#334155; line-height:1.7; white-space:pre-line; }
.vendor-rating-empty { font:400 .86rem 'Inter',sans-serif; color:#64748b; margin:0; }
.feedback-textarea { width:100%; padding:1rem 1.05rem; border:1.5px solid #e2e8f0; border-radius:14px; font:400 .9rem 'Inter',sans-serif; color:#1e293b; resize:vertical; min-height:110px; transition:all .2s; background:white; }
.feedback-textarea:focus { outline:none; border-color:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.12); }
.feedback-actions { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-top:1rem; }
.feedback-hint { font:400 .78rem 'Inter',sans-serif; color:#64748b; }
.btn-feedback-submit { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.8rem 1.1rem; border:none; border-radius:12px; background:linear-gradient(135deg,#f59e0b,#f97316); color:white; font:700 .88rem 'Inter',sans-serif; cursor:pointer; transition:all .2s; box-shadow:0 8px 18px rgba(245,158,11,.24); }
.btn-feedback-submit:hover:not(:disabled) { transform:translateY(-2px); }
.btn-feedback-submit:disabled { opacity:.6; cursor:not-allowed; box-shadow:none; }

.chat-card { display:flex; flex-direction:column; position:sticky; top:96px; }
.chat-body { display:flex; flex-direction:column; height:620px; }
.messages-area { flex:1; overflow-y:auto; padding:1.5rem 1.75rem; background:linear-gradient(180deg,#f8fafc 0%,#fff 100%); scroll-behavior:smooth; }
.messages-area::-webkit-scrollbar { width:5px; }
.messages-area::-webkit-scrollbar-thumb { background:#c7d2fe; border-radius:10px; }
.chat-state { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:.75rem; }
.chat-state p { font:400 .9rem 'Inter',sans-serif; color:#64748b; margin:0; }
.chat-empty-icon { width:72px; height:72px; background:#f0f4ff; border-radius:20px; display:flex; align-items:center; justify-content:center; color:#a5b4fc; font-size:2.25rem; }
.chat-empty-title { font:700 1.125rem 'Outfit',sans-serif; color:#1e293b; margin:0; }
.chat-empty-sub   { font:400 .875rem 'Inter',sans-serif; color:#94a3b8; margin:0; }
.chat-date-label { text-align:center; margin-bottom:1.25rem; }
.chat-date-label span { background:#e0e7ff; color:#4338ca; font:600 .72rem 'Inter',sans-serif; letter-spacing:.3px; padding:.3rem .875rem; border-radius:20px; }
.messages-list { display:flex; flex-direction:column; gap:1rem; }
.msg-row { display:flex; align-items:flex-end; gap:.625rem; animation:msgIn .3s cubic-bezier(.16,1,.3,1); }
@keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.msg-row--left  { flex-direction:row; }
.msg-row--right { flex-direction:row-reverse; }
.msg-avatar { width:38px; height:38px; border-radius:12px; flex-shrink:0; background:linear-gradient(135deg,#667eea,#764ba2); color:white; font:700 .8rem 'Outfit',sans-serif; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(102,126,234,.3); user-select:none; }
.msg-avatar--support { background:linear-gradient(135deg,#8b5cf6,#6d28d9); box-shadow:0 3px 8px rgba(139,92,246,.3); }
.msg-body { display:flex; flex-direction:column; max-width:68%; }
.msg-meta-top { display:flex; align-items:center; gap:.45rem; margin-bottom:.35rem; flex-wrap:nowrap; }
.msg-row--right .msg-meta-top { flex-direction:row-reverse; }
.msg-name { font:600 .78rem 'Inter',sans-serif; color:#374151; white-space:nowrap; }
.msg-time { font:400 .7rem 'Inter',sans-serif; color:#9ca3af; white-space:nowrap; }
.msg-role-tag { font:700 .62rem 'Inter',sans-serif; text-transform:uppercase; letter-spacing:.3px; padding:.15rem .45rem; border-radius:5px; white-space:nowrap; }
.tag--me      { background:#dbeafe; color:#1d4ed8; }
.tag--support { background:#ede9fe; color:#5b21b6; }
.msg-bubble { padding:.875rem 1.125rem; border-radius:18px; font:400 .925rem 'Inter',sans-serif; line-height:1.6; color:#1f2937; word-wrap:break-word; position:relative; max-width:100%; transition:opacity .2s; }
.bubble--support { background:white; border:1.5px solid #e5e7eb; border-bottom-left-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,.07); }
.bubble--me { background:linear-gradient(135deg,#6366f1,#7c3aed); color:white; border-bottom-right-radius:4px; box-shadow:0 4px 14px rgba(99,102,241,.35); }
.bubble--sending { opacity:.65; }
.msg-tick { position:absolute; bottom:.45rem; right:.6rem; font-size:.65rem; line-height:1; }
.tick--pending { color:rgba(255,255,255,.45); }
.tick--sent    { color:rgba(255,255,255,.75); }
.tick--read    { color:#bfdbfe; }
.bubble--typing { display:inline-flex !important; align-items:center; gap:5px; padding:.8rem 1.125rem !important; min-width:66px; }
.typing-dot { width:7px; height:7px; border-radius:50%; background:#a78bfa; animation:typingBounce 1.3s infinite; flex-shrink:0; }
.typing-dot:nth-child(2) { animation-delay:.18s; }
.typing-dot:nth-child(3) { animation-delay:.36s; }
@keyframes typingBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
.typing-fade-enter-active,.typing-fade-leave-active { transition:all .3s cubic-bezier(.16,1,.3,1); }
.typing-fade-enter-from,.typing-fade-leave-to { opacity:0; transform:translateY(6px); }

.chat-footer { flex-shrink:0; border-top:1px solid #f1f5f9; }
.chat-notice { display:flex; align-items:flex-start; gap:.875rem; padding:1.25rem 1.75rem; font:400 .875rem 'Inter',sans-serif; }
.chat-notice--closed { background:#f8fafc; color:#64748b; align-items:center; }
.chat-notice--closed i { font-size:1.1rem; }
.chat-notice--waiting { background:#fffbeb; }
.notice-icon-wrap { width:46px; height:46px; flex-shrink:0; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#f59e0b; font-size:1.375rem; box-shadow:0 2px 8px rgba(245,158,11,.2); }
.notice-text { flex:1; }
.notice-text strong { font:700 .95rem 'Inter',sans-serif; color:#1e293b; display:block; margin-bottom:.3rem; }
.notice-text p     { font-size:.875rem; color:#475569; margin:0 0 .5rem; line-height:1.5; }
.notice-text small { font-size:.78rem; color:#64748b; display:flex; align-items:center; gap:.35rem; }
.reply-box { display:flex; align-items:flex-end; gap:.75rem; padding:1rem 1.5rem; background:white; }
.reply-textarea { flex:1; border:1.5px solid #e5e7eb; border-radius:14px; padding:.75rem 1rem; font:400 .9rem 'Inter',sans-serif; color:#1e293b; resize:none; max-height:120px; line-height:1.5; transition:all .2s; background:#f8fafc; }
.reply-textarea:focus { outline:none; border-color:#6366f1; background:white; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
.reply-textarea::placeholder { color:#9ca3af; }
.reply-textarea:disabled { opacity:.6; cursor:not-allowed; }
.reply-send-btn { width:46px; height:46px; border-radius:50%; border:none; flex-shrink:0; background:linear-gradient(135deg,#6366f1,#7c3aed); color:white; display:flex; align-items:center; justify-content:center; font-size:1.1rem; cursor:pointer; transition:all .25s; box-shadow:0 4px 12px rgba(99,102,241,.35); }
.reply-send-btn:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 6px 18px rgba(99,102,241,.45); }
.reply-send-btn:disabled { opacity:.5; cursor:not-allowed; }

.modal-overlay  { position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem; }
.modal-container { background:white; border-radius:22px; width:100%; max-width:620px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,.25); }
.modal-header   { display:flex; align-items:flex-start; gap:1.1rem; padding:1.875rem; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
.modal-icon     { width:52px; height:52px; background:linear-gradient(135deg,#ef4444,#dc2626); border-radius:14px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.375rem; flex-shrink:0; box-shadow:0 4px 14px rgba(239,68,68,.3); }
.modal-title-wrapper { flex:1; }
.modal-title    { font:700 1.4rem 'Outfit',sans-serif; color:#1e293b; margin:0 0 .375rem; }
.modal-subtitle { font:400 .875rem 'Inter',sans-serif; color:#64748b; margin:0; }
.modal-close    { width:38px; height:38px; background:white; border:1.5px solid #e2e8f0; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#64748b; cursor:pointer; transition:all .2s; flex-shrink:0; }
.modal-close:hover { background:#fee2e2; border-color:#ef4444; color:#ef4444; }
.modal-body     { flex:1; overflow-y:auto; padding:1.875rem; }
.modal-footer   { display:flex; gap:.875rem; padding:1.375rem 1.875rem; background:#f8fafc; border-top:1px solid #e2e8f0; }
.form-group { margin-bottom:1.625rem; }
.form-label { display:flex; align-items:center; gap:.4rem; font:700 .875rem 'Inter',sans-serif; color:#1e293b; margin-bottom:.8rem; }
.form-label i { color:#667eea; }
.required { color:#ef4444; }
.label-hint { font-size:.775rem; color:#64748b; font-weight:500; margin-left:auto; }
.reason-options { display:grid; gap:.75rem; }
.reason-option  { position:relative; cursor:pointer; }
.reason-option input[type="radio"] { position:absolute; opacity:0; pointer-events:none; }
.option-content { display:flex; align-items:center; gap:.875rem; padding:1.05rem 1.25rem; background:white; border:2px solid #e2e8f0; border-radius:12px; transition:all .25s; }
.option-content i:first-child { color:#667eea; font-size:1.2rem; }
.option-label { flex:1; font:600 .9rem 'Inter',sans-serif; color:#334155; }
.option-check { color:#10b981; font-size:1.05rem; opacity:0; transition:opacity .25s; }
.reason-option:hover .option-content { border-color:#667eea; }
.reason-option.active .option-content { background:#eff6ff; border-color:#667eea; box-shadow:0 3px 12px rgba(102,126,234,.18); }
.reason-option.active .option-check  { opacity:1; }
.form-input,.form-textarea { width:100%; padding:.9rem 1.1rem; border:2px solid #e2e8f0; border-radius:12px; font:400 .9rem 'Inter',sans-serif; color:#1e293b; transition:all .25s; background:white; }
.form-input:focus,.form-textarea:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1); }
.form-textarea { resize:vertical; min-height:110px; }
.form-hint,.form-footer { display:flex; justify-content:space-between; align-items:center; margin-top:.5rem; font:400 .78rem 'Inter',sans-serif; color:#64748b; }
.char-count { color:#64748b; }
.validation-error  { color:#ef4444; display:flex; align-items:center; gap:.3rem; font-weight:600; }
.validation-success { color:#10b981; display:flex; align-items:center; gap:.3rem; font-weight:600; }
.info-notice { display:flex; align-items:center; gap:.75rem; padding:1rem; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:10px; margin-top:1.375rem; }
.info-notice i { color:#3b82f6; font-size:1.2rem; flex-shrink:0; }
.info-notice p { font:400 .85rem 'Inter',sans-serif; color:#475569; margin:0; line-height:1.5; }
.btn-secondary,.btn-primary { flex:1; padding:.825rem 1.375rem; border:none; border-radius:12px; font:600 .9rem 'Inter',sans-serif; cursor:pointer; transition:all .25s; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; }
.btn-secondary { background:white; border:2px solid #e2e8f0; color:#64748b; }
.btn-secondary:hover { background:#f8fafc; border-color:#cbd5e1; }
.btn-primary   { background:linear-gradient(135deg,#ef4444,#dc2626); color:white; box-shadow:0 3px 10px rgba(239,68,68,.28); }
.btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 7px 18px rgba(239,68,68,.38); }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.modal-enter-active,.modal-leave-active { transition:all .28s cubic-bezier(.16,1,.3,1); }
.modal-enter-active .modal-container,.modal-leave-active .modal-container { transition:all .28s cubic-bezier(.16,1,.3,1); }
.modal-enter-from,.modal-leave-to { opacity:0; }
.modal-enter-from .modal-container,.modal-leave-to .modal-container { opacity:0; transform:scale(.95) translateY(18px); }
.slide-down-enter-active,.slide-down-leave-active { transition:all .28s cubic-bezier(.16,1,.3,1); overflow:hidden; }
.slide-down-enter-from,.slide-down-leave-to { opacity:0; max-height:0; margin-bottom:0; }
.slide-down-enter-to,.slide-down-leave-from   { opacity:1; max-height:180px; }

@media(max-width:768px) {
  .content-grid { grid-template-columns:1fr; }
  .ticket-header-content { padding:1.5rem; }
  .header-main { flex-direction:column; gap:1.25rem; }
  .header-actions { width:100%; }
  .btn-delete { width:100%; justify-content:center; }
  .ticket-title { font-size:1.4rem; }
  .details-grid { grid-template-columns:1fr; }
  .card-body { padding:1.375rem; }
  .chat-card { position:static; }
  .chat-body { height:500px; }
  .msg-body { max-width:82%; }
  .urgency-header { flex-direction:column; text-align:center; }
  .urgency-badge  { width:100%; text-align:center; }
  .vendor-rating-head,
  .feedback-actions { flex-direction:column; align-items:flex-start; }
  .btn-feedback-submit { width:100%; }
  .modal-container { max-width:100%; border-radius:22px 22px 0 0; }
  .modal-header,.modal-body,.modal-footer { padding:1.375rem; }
  .modal-footer { flex-direction:column; }
  .btn-secondary,.btn-primary { width:100%; }
}
@media(max-width:480px) {
  .header-meta { flex-direction:column; align-items:flex-start !important; gap:.875rem !important; }
  .meta-divider { display:none; }
  .ticket-title { font-size:1.25rem; }
  .msg-body { max-width:90%; }
  .messages-area { padding:1rem; }
}

@media(max-width:1200px) {
  .content-grid { grid-template-columns:1fr; }
  .chat-card { position:static; }
}
</style>

