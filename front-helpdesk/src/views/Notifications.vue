<template>
  <div class="notifications-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            <i class="bx bx-bell"></i>
            Notifications
          </h1>
          <p class="page-subtitle">Stay updated with your tickets and reports</p>
        </div>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0"
            class="btn btn-primary"
            @click="markAllAsRead"
          >
            <i class="bx bx-check-double me-1"></i>
            Mark All as Read
          </button>
          <button class="btn btn-outline" @click="fetchNotifications">
            <i class="bx bx-refresh"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stat-card stat-card-primary">
        <div class="stat-icon">
          <i class="bx bx-bell"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ notifications.length }}</div>
          <div class="stat-label">Total Notifications</div>
        </div>
      </div>

      <div class="stat-card stat-card-warning">
        <div class="stat-icon">
          <i class="bx bx-time-five"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ unreadCount }}</div>
          <div class="stat-label">Unread</div>
        </div>
      </div>

      <div class="stat-card stat-card-success">
        <div class="stat-icon">
          <i class="bx bx-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ readCount }}</div>
          <div class="stat-label">Read</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          class="filter-tab"
          :class="{ active: filter === 'all' }"
          @click="setFilter('all')"
        >
          All Notifications
        </button>
        <button 
          class="filter-tab"
          :class="{ active: filter === 'unread' }"
          @click="setFilter('unread')"
        >
          Unread <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>
        <button 
          class="filter-tab"
          :class="{ active: filter === 'read' }"
          @click="setFilter('read')"
        >
          Read
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bx bx-bell-off"></i>
        </div>
        <h3>No notifications yet</h3>
        <p>When you have updates, they'll appear here</p>
      </div>

      <!-- Notifications -->
      <div v-else class="notifications-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-card"
          :class="{ 
            'unread': !notification.read_at,
            'clickable': notification.related_id 
          }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-indicator" v-if="!notification.read_at"></div>
          
          <div class="notification-icon" :class="getIconClass(notification.type)">
            <i :class="getIcon(notification.type)"></i>
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <span class="notification-time">{{ formatRelativeTime(notification.created_at) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-footer">
              <span class="notification-date">
                <i class="bx bx-time-five"></i>
                {{ formatDate(notification.created_at) }}
              </span>
              <span v-if="notification.related_id" class="notification-link">
                <i class="bx bx-link-external"></i>
                View Details
              </span>
            </div>
          </div>

          <div class="notification-actions">
            <button 
              v-if="!notification.read_at"
              class="action-btn mark-read"
              @click.stop="markAsRead(notification)"
              title="Mark as read"
            >
              <i class="bx bx-check"></i>
            </button>
            <button 
              class="action-btn delete"
              @click.stop="deleteNotification(notification)"
              title="Delete"
            >
              <i class="bx bx-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const filter = ref('all')

const notifications = computed(() => notificationStore.notifications || [])
const unreadCount = computed(() => notificationStore.unreadCount || 0)
const readCount = computed(() => notifications.value.length - unreadCount.value)

const filteredNotifications = computed(() => {
  if (filter.value === 'all') return notifications.value
  if (filter.value === 'unread') return notifications.value.filter(n => !n.read_at)
  if (filter.value === 'read') return notifications.value.filter(n => n.read_at)
  return notifications.value
})

const setFilter = (newFilter) => {
  filter.value = newFilter
}

const fetchNotifications = async () => {
  loading.value = true
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('Failed to load notifications:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load notifications'
    })
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notification) => {
  if (notification.read_at) return

  try {
    await notificationStore.markAsRead(notification.id)
  } catch (error) {
    console.error('Failed to mark as read:', error)
    // Silent fail - don't show error to user for this action
  }
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'All notifications marked as read',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to mark all as read'
    })
  }
}

const deleteNotification = async (notification) => {
  const result = await Swal.fire({
    title: 'Delete notification?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      await notificationStore.deleteNotification(notification.id)
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Notification has been deleted',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete notification'
      })
    }
  }
}

const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.read_at) {
    await markAsRead(notification)
  }

  // Navigate if has related item
  if (!notification.related_id) return

  const role = authStore.user?.role
  
  if (notification.related_type === 'laporan') {
    if (role === 'admin') {
      router.push(`/admin/laporan/${notification.related_id}`)
    } else if (role === 'vendor') {
      router.push(`/vendor/laporan/${notification.related_id}`)
    } else if (role === 'client') {
      router.push(`/client/reports/${notification.related_id}`)
    }
  } else {
    // Ticket notification
    if (role === 'admin') {
      router.push(`/admin/tickets/${notification.related_id}`)
    } else if (role === 'vendor') {
      router.push(`/vendor/tickets/${notification.related_id}`)
    } else if (role === 'client') {
      router.push(`/tickets/${notification.related_id}`)
    }
  }
}

const getIcon = (type) => {
  const icons = {
    'ticket_created': 'bx-file-blank',
    'ticket_assigned': 'bx-user-check',
    'ticket_status_changed': 'bx-refresh',
    'ticket_updated': 'bx-edit',
    'ticket_resolved': 'bx-check-circle',
    'comment_added': 'bx-message-dots',
    'priority_updated': 'bx-flag',
    'laporan_created': 'bx-notepad',
    'laporan_status_updated': 'bx-refresh',
    'laporan_assigned': 'bx-user-plus',
  }
  return icons[type] || 'bx-bell'
}

const getIconClass = (type) => {
  const classes = {
    'ticket_created': 'icon-primary',
    'ticket_assigned': 'icon-info',
    'ticket_status_changed': 'icon-warning',
    'ticket_updated': 'icon-warning',
    'ticket_resolved': 'icon-success',
    'comment_added': 'icon-secondary',
    'priority_updated': 'icon-danger',
    'laporan_created': 'icon-primary',
    'laporan_status_updated': 'icon-info',
    'laporan_assigned': 'icon-success',
  }
  return classes[type] || 'icon-secondary'
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 60000)
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  
  return `${Math.floor(diffInDays / 30)}mo ago`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    await fetchNotifications()
  } catch (error) {
    console.error('Failed to load notifications on mount:', error)
    // Show error to user if needed
  }
})
</script>

<style scoped>
.notifications-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  font-size: 2rem;
  color: #667eea;
}

.page-subtitle {
  color: #6c757d;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #e9ecef;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-card-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-warning .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.stat-card-success .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Filter Section */
.filter-section {
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-tab {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6c757d;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.filter-tab:hover {
  background: #f8f9fa;
  color: #667eea;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.filter-tab .badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.filter-tab.active .badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Notifications Container */
.notifications-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #adb5bd;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Notifications List */
.notifications-list {
  padding: 0.5rem;
}

.notification-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
  position: relative;
  border: 2px solid transparent;
}

.notification-card:hover {
  background: #f8f9fa;
}

.notification-card.clickable {
  cursor: pointer;
}

.notification-card.clickable:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.notification-card.unread {
  background: #f0f4ff;
}

.notification-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 4px 4px 0;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.icon-primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
}

.icon-success {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.icon-warning {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.icon-danger {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.icon-info {
  background: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
}

.icon-secondary {
  background: rgba(108, 117, 125, 0.15);
  color: #6c757d;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.notification-time {
  font-size: 0.85rem;
  color: #6c757d;
  white-space: nowrap;
}

.notification-message {
  color: #495057;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.notification-date {
  font-size: 0.85rem;
  color: #adb5bd;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notification-link {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.25rem;
}

.action-btn.mark-read {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.mark-read:hover {
  background: #28a745;
  color: white;
}

.action-btn.delete {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-btn.delete:hover {
  background: #dc3545;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .notification-card {
    flex-direction: column;
    gap: 1rem;
  }

  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>