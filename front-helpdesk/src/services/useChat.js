import { ref, onBeforeUnmount } from 'vue'
import api from '@/services/api'

export function useChat(conversationId, role = 'admin') {
  const messages = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const isConnected = ref(false)
  const error = ref(null)

  // ✅ Subscribe SEKALI SAJA
  const channel = window.Echo.private(`conversation.${conversationId}`)

  channel.subscribed(() => {
    isConnected.value = true
    console.log(`📡 Subscribed to conversation.${conversationId}`)
  })

  // ✅ Listen SEKALI SAJA — cek duplikat sebelum push
  channel.listen('.message.sent', (data) => {
    console.log('📨 Pesan masuk via Pusher:', data)
    const exists = messages.value.some(m => m.id === data.message?.id)
    if (!exists) {
      messages.value.push(data.message)
    }
  })

  // ✅ Cleanup saat unmount
  onBeforeUnmount(() => {
    window.Echo.leaveChannel(`private-conversation.${conversationId}`)
    isConnected.value = false
  })

  async function loadMessages() {
    isLoading.value = true
    error.value = null
    try {
      const endpoint = role === 'admin'
        ? `/admin/admin-chat/conversations/${conversationId}/messages`
        : `/vendor/admin-chat/conversations/${conversationId}/messages`

      const { data } = await api.get(endpoint)
      if (data.success) {
        messages.value = data.messages
      }
    } catch (err) {
      error.value = 'Gagal memuat pesan'
      console.error('loadMessages error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function adminSendMessage(text, messageType = 'regular') {
    if (!text?.trim() || isSending.value) return false
    isSending.value = true
    error.value = null

    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: text,
      message_type: messageType,
      sender: JSON.parse(localStorage.getItem('user') || '{}'),
      created_at: new Date().toISOString(),
      is_read: false,
      _isPending: true,
    }
    messages.value.push(tempMessage)

    try {
      const { data } = await api.post(
        `/admin/admin-chat/conversations/${conversationId}/messages`,
        { message: text, message_type: messageType }
      )
      if (data.success) {
        const idx = messages.value.findIndex(m => m.id === tempMessage.id)
        if (idx !== -1) messages.value[idx] = data.data
      }
      return true
    } catch (err) {
      error.value = 'Gagal mengirim pesan'
      messages.value = messages.value.filter(m => m.id !== tempMessage.id)
      return false
    } finally {
      isSending.value = false
    }
  }

  async function vendorSendMessage(text, messageType = 'regular', photos = []) {
    if ((!text?.trim() && photos.length === 0) || isSending.value) return false
    isSending.value = true
    error.value = null

    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: text,
      message_type: messageType,
      sender: JSON.parse(localStorage.getItem('user') || '{}'),
      created_at: new Date().toISOString(),
      is_read: false,
      _isPending: true,
    }
    messages.value.push(tempMessage)

    try {
      const formData = new FormData()
      if (text?.trim()) formData.append('message', text)
      formData.append('message_type', messageType)
      photos.forEach((photo, i) => formData.append(`photos[${i}]`, photo))

      const { data } = await api.post(
        `/vendor/admin-chat/conversations/${conversationId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      if (data.success) {
        const idx = messages.value.findIndex(m => m.id === tempMessage.id)
        if (idx !== -1) messages.value[idx] = data.data
      }
      return true
    } catch (err) {
      error.value = 'Gagal mengirim pesan'
      messages.value = messages.value.filter(m => m.id !== tempMessage.id)
      return false
    } finally {
      isSending.value = false
    }
  }

  async function markAsRead() {
    try {
      const endpoint = role === 'admin'
        ? `/admin/admin-chat/conversations/${conversationId}/mark-read`
        : `/vendor/admin-chat/conversations/${conversationId}/mark-read`
      await api.post(endpoint)
    } catch (err) {
      console.error('markAsRead error:', err)
    }
  }

  return {
    messages,
    isLoading,
    isSending,
    isConnected,
    error,
    loadMessages,
    adminSendMessage,
    vendorSendMessage,
    markAsRead,
  }
}