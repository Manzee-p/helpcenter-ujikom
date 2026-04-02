<template>
  <div class="ticket-chat-inbox-page">
    <div class="page-header">
      <h4 class="fw-bold">
        <i class="bx bx-message-dots me-2"></i>
        {{ isAdmin ? 'Chat dari Vendor' : 'Chat dengan Admin' }}
      </h4>
      <p class="text-muted">
        {{ isAdmin ? 'Pesan dari vendor tentang tiket yang sedang dikerjakan' : 'Hubungi admin untuk laporan kendala atau progres' }}
      </p>
    </div>

    <div class="inbox-container">
      <!-- Sidebar Filter -->
      <div class="inbox-sidebar">
        <div class="sidebar-header">
          <div class="search-box">
            <i class="bx bx-search"></i>
            <input 
              type="text" 
              placeholder="Cari tiket..."
              v-model="searchQuery"
              @input="debouncedSearch"
            />
          </div>
          <div class="filter-tabs">
            <button 
              :class="['tab-btn', { active: filterStatus === 'all' }]"
              @click="filterStatus = 'all'"
            >
              Semua
              <span class="count">{{ stats.total || 0 }}</span>
            </button>
            <button 
              :class="['tab-btn', { active: filterStatus === 'active' }]"
              @click="filterStatus = 'active'"
            >
              Aktif
              <span class="count">{{ stats.active || 0 }}</span>
            </button>
          </div>
        </div>

        <!-- Conversation List -->
        <div class="conversation-list">
          <div v-if="loadingConversations" class="loading-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <p>Memuat...</p>
          </div>

          <div v-else-if="conversations.length === 0" class="empty-state">
            <i class="bx bx-message-x"></i>
            <p>Tidak ada percakapan</p>
            <small>{{ isAdmin ? 'Vendor akan muncul di sini ketika menghubungi Anda' : 'Hubungi admin dari halaman tiket' }}</small>
          </div>

          <div 
            v-else
            v-for="conv in conversations"
            :key="conv.id"
            :class="['conversation-card', { 
              active: activeConv?.id === conv.id,
              'has-unread': conv.unread_count > 0 
            }]"
            @click="selectConversation(conv)"
          >
            <div class="conv-avatar">
              <span class="avatar-text">
                {{ isAdmin ? getInitials(conv.vendor?.name) : getInitials(conv.admin?.name) }}
              </span>
              <span v-if="conv.unread_count > 0" class="unread-badge">
                {{ conv.unread_count }}
              </span>
            </div>

            <div class="conv-info">
              <div class="conv-header">
                <h6>
                  {{ isAdmin ? conv.vendor?.name : conv.admin?.name }}
                </h6>
                <span class="conv-time">
                  {{ formatTime(conv.last_message_at) }}
                </span>
              </div>

              <p class="conv-ticket">
                <i class="bx bx-file"></i>
                #{{ conv.ticket?.ticket_number }} - {{ conv.ticket?.title }}
              </p>

              <p class="conv-preview">
                <span v-if="conv.latestMessage?.sender_id !== authStore.user.id" class="sender-name">
                  {{ conv.latestMessage?.sender?.name }}:
                </span>
                {{ conv.latestMessage?.message || 'Percakapan baru' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <div v-if="!activeConv" class="no-selection">
          <div class="no-selection-icon">
            <i class="bx bx-message-detail"></i>
          </div>
          <h5>Pilih Percakapan</h5>
          <p>Pilih tiket dari daftar untuk melihat chat</p>
        </div>

        <TicketChatModal 
          v-else
          :show="true"
          :ticket="activeConv.ticket"
          @close="activeConv = null"
          @message-sent="handleMessageSent"
          style="position: relative; z-index: 1;"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import TicketChatModal from './TicketChatModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const conversations = ref([])
const activeConv = ref(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const loadingConversations = ref(false)
const stats = ref({
  total: 0,
  active: 0,
  unread: 0
})

// Computed
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isVendor = computed(() => authStore.user?.role === 'vendor')

// Methods
const fetchConversations = async () => {
  loadingConversations.value = true
  try {
    const endpoint = isAdmin.value 
      ? '/admin/tickets/chats'
      : '/vendor/tickets/chats'

    const params = {
      status: filterStatus.value === 'all' ? '' : filterStatus.value,
      search: searchQuery.value
    }

    const { data } = await api.get(endpoint, { params })

    if (data.success) {
      conversations.value = data.data || []
      
      // Update stats
      stats.value.total = conversations.value.length
      stats.value.active = conversations.value.filter(c => c.status === 'active').length
      stats.value.unread = conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
    }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    if (error.response?.status !== 404) {
      conversations.value = []
    }
  } finally {
    loadingConversations.value = false
  }
}

const selectConversation = (conv) => {
  activeConv.value = conv
  // Mark as read
  if (conv.unread_count > 0) {
    conv.unread_count = 0
    stats.value.unread = Math.max(0, stats.value.unread - conv.unread_count)
  }
}

const handleMessageSent = () => {
  // Refresh conversation list
  fetchConversations()
}

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return (names[0][0] + (names[0][1] || '')).toUpperCase()
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins}m`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}j`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}h`
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const debouncedSearch = debounce(() => {
  fetchConversations()
}, 500)

function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Watch filters
watch([filterStatus], () => {
  fetchConversations()
})

// Auto-refresh every 30 seconds
let refreshInterval = null

onMounted(() => {
  fetchConversations()
  
  refreshInterval = setInterval(() => {
    fetchConversations()
  }, 30000)
})

import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.ticket-chat-inbox-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.inbox-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 180px);
}

/* Sidebar */
.inbox-sidebar {
  background: white;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.25rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #696cff;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active {
  background: #696cff;
  color: white;
}

.tab-btn .count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

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
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #696cff;
}

.empty-state small {
  color: #adb5bd;
  margin-top: 0.5rem;
}

.conversation-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.conversation-card:hover {
  background: #f8f9fa;
}

.conversation-card.active {
  background: linear-gradient(135deg, rgba(105, 108, 255, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #696cff;
}

.conversation-card.has-unread {
  background: #f0f4ff;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.avatar-text {
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.25rem;
}

.conv-header h6 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-time {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
}

.conv-ticket {
  font-size: 0.8rem;
  color: #667eea;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-preview {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sender-name {
  font-weight: 600;
  color: #2c3e50;
}

/* Chat Area */
.chat-area {
  background: white;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  overflow: hidden;
}

.no-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  text-align: center;
}

.no-selection-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(105, 108, 255, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.no-selection-icon i {
  font-size: 4rem;
  color: #696cff;
}

.no-selection h5 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .inbox-container {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 992px) {
  .inbox-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .inbox-sidebar {
    height: 400px;
  }
  
  .chat-area {
    height: 600px;
  }
}
</style>