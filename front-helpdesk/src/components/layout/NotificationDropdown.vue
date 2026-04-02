<template>
  <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-1">
    <a 
      class="nav-link dropdown-toggle hide-arrow" 
      href="javascript:void(0);" 
      data-bs-toggle="dropdown" 
      data-bs-auto-close="outside" 
      aria-expanded="false"
      @click="loadNotifications"
    >
      <i class="bx bx-bell bx-sm"></i>
      <span v-if="unreadCount > 0" class="badge bg-danger rounded-pill badge-notifications">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end py-0">
      <li class="dropdown-menu-header border-bottom">
        <div class="dropdown-header d-flex align-items-center py-3">
          <h5 class="text-body mb-0 me-auto">Notifications</h5>
          <a 
            v-if="unreadCount > 0"
            href="javascript:void(0);" 
            class="dropdown-notifications-all text-body" 
            @click="markAllAsRead"
          >
            <i class="bx fs-4 bx-envelope-open"></i>
          </a>
        </div>
      </li>
      <li class="dropdown-notifications-list scrollable-container">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="notifications.length === 0" class="text-center py-4">
          <i class="bx bx-bell-off bx-lg text-muted"></i>
          <p class="text-muted mb-0 mt-2">No notifications</p>
        </div>

        <ul v-else class="list-group list-group-flush">
          <li 
            v-for="notif in notifications" 
            :key="notif.id"
            class="list-group-item list-group-item-action dropdown-notifications-item"
            :class="{ 'marked-as-read': notif.is_read }"
            @click="handleNotificationClick(notif)"
          >
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <div :class="`avatar ${getNotificationIconClass(notif.type)}`">
                  <span class="avatar-initial rounded-circle">
                    <i :class="getNotificationIcon(notif.type)"></i>
                  </span>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-1">{{ notif.title }}</h6>
                <p class="mb-0">{{ notif.message }}</p>
                <small class="text-muted">{{ timeAgo(notif.created_at) }}</small>
              </div>
              <div class="flex-shrink-0 dropdown-notifications-actions">
                <a 
                  href="javascript:void(0);" 
                  class="dropdown-notifications-read"
                  @click.stop="markAsRead(notif)"
                >
                  <span class="badge badge-dot" :class="notif.is_read ? '' : 'bg-primary'"></span>
                </a>
                <a 
                  href="javascript:void(0);" 
                  class="dropdown-notifications-archive"
                  @click.stop="deleteNotification(notif)"
                >
                  <span class="bx bx-x"></span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </li>
      <li class="dropdown-menu-footer border-top">
        <router-link 
          to="/notifications" 
          class="dropdown-item d-flex justify-content-center p-3"
        >
          View all notifications
        </router-link>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { timeAgo } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
let intervalId = null

const loadNotifications = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/notifications', {
      params: { per_page: 10 }
    })
    notifications.value = data.data || data
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const { data } = await api.get('/notifications/unread-count')
    unreadCount.value = data.count
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

const markAsRead = async (notification) => {
  if (notification.is_read) return

  try {
    await api.post(`/notifications/${notification.id}/read`)
    notification.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await api.post('/notifications/mark-all-read')
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

const deleteNotification = async (notification) => {
  try {
    await api.delete(`/notifications/${notification.id}`)
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
    if (!notification.is_read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const handleNotificationClick = async (notification) => {
  await markAsRead(notification)
  
  if (notification.ticket_id) {
    // Navigate based on user role
    const role = authStore.user.role
    if (role === 'admin') {
      router.push(`/admin/tickets/${notification.ticket_id}`)
    } else if (role === 'vendor') {
      router.push(`/vendor/tickets/${notification.ticket_id}`)
    } else {
      router.push(`/tickets/${notification.ticket_id}`)
    }
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    'ticket_created': 'bx-file',
    'ticket_assigned': 'bx-user-check',
    'ticket_status_changed': 'bx-refresh',
    'ticket_commented': 'bx-message',
    'ticket_resolved': 'bx-check-circle',
    'ticket_updated': 'bx-edit',
  }
  return icons[type] || 'bx-bell'
}

const getNotificationIconClass = (type) => {
  const classes = {
    'ticket_created': 'bg-label-warning',
    'ticket_assigned': 'bg-label-primary',
    'ticket_status_changed': 'bg-label-info',
    'ticket_commented': 'bg-label-secondary',
    'ticket_resolved': 'bg-label-success',
    'ticket_updated': 'bg-label-warning',
  }
  return classes[type] || 'bg-label-secondary'
}

onMounted(() => {
  loadUnreadCount()
  
  // Poll for new notifications every 30 seconds
  intervalId = setInterval(() => {
    loadUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.dropdown-notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-notifications-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-notifications-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dropdown-notifications-item.marked-as-read {
  opacity: 0.7;
}

.dropdown-notifications-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge-notifications {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
}
</style>