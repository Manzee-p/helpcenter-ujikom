<template>
  <div class="client-fullscreen">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="top-bar-left">
        <div class="logo">
          <i class="bx bx-help-circle"></i>
          <span>HelpCenter</span>
        </div>
      </div>

      <div class="top-bar-center">
        <nav class="top-nav">
          <router-link to="/client/dashboard" class="nav-link" active-class="active">
            <i class="bx bx-home-circle"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/client/tickets" class="nav-link" active-class="active">
            <i class="bx bx-list-ul"></i>
            <span>Laporan Saya</span>
          </router-link>
          <router-link to="/client/history" class="nav-link" active-class="active">
            <i class="bx bx-history"></i>
            <span>Riwayat</span>
          </router-link>
        </nav>

        <button type="button" class="nav-insight" @click="router.push('/client/tickets')">
          <div class="nav-insight-icon">
            <i class="bx bx-pulse"></i>
          </div>
          <div class="nav-insight-body">
            <span class="nav-insight-label">Belum Dinilai</span>
            <strong>{{ navInsight.primary }}</strong>
            <small>{{ navInsight.secondary }}</small>
          </div>
        </button>
      </div>

      <div class="top-bar-right">
        <!-- CREATE LAPORAN BUTTON -->
        <router-link to="/client/create-ticket" class="nav-link nav-link-primary" active-class="active">
          <i class="bx bx-plus-circle"></i>
          <span>Create Ticket</span>
        </router-link>

        <!-- NOTIFICATION BELL -->
        <div class="notification-bell" @click="toggleNotifications">
          <i class="bx bx-bell"></i>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </div>

        <!-- USER MENU -->
        <button type="button" class="user-menu" @click="toggleUserMenu">
          <div class="user-avatar">
            <img 
              v-if="userAvatarUrl" 
              :src="userAvatarUrl" 
              alt="Avatar"
              @error="handleImageError"
            >
            <span v-else class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="user-identity">
            <span class="user-name">{{ authStore.userName || 'User' }}</span>
            <span class="user-role">Client</span>
          </div>
          <i :class="`bx bx-chevron-${userMenuOpen ? 'up' : 'down'}`"></i>
        </button>

        <!-- NOTIFICATION DROPDOWN -->
        <transition name="fade-slide">
          <div v-if="notificationsOpen" class="notification-dropdown" @click.stop>
            <div class="dropdown-header-notif">
              <h6 class="mb-0">Notifications</h6>
              <button class="btn-close-notif" @click="notificationsOpen = false">
                <i class="bx bx-x"></i>
              </button>
            </div>
            <div class="notification-body">
              <div v-if="isLoadingNotifications" class="loading-notifications">
                <i class="bx bx-loader-alt bx-spin"></i>
                <p>Loading notifications...</p>
              </div>
              <div v-else-if="notifications.length === 0" class="empty-notifications">
                <i class="bx bx-bell-off"></i>
                <p>No notifications</p>
              </div>
              <div v-else>
                <div 
                  v-for="notif in notifications.slice(0, 5)" 
                  :key="notif.id"
                  class="notification-item"
                  :class="{ 'unread': !notif.read_at }"
                  @click="handleNotificationClick(notif)"
                >
                  <div class="notif-icon">
                    <i :class="getNotificationIcon(notif.type)"></i>
                  </div>
                  <div class="notif-content">
                    <h6>{{ notif.title }}</h6>
                    <p>{{ notif.message }}</p>
                    <small>{{ formatDate(notif.created_at) }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="notification-footer">
              <router-link to="/client/history" @click="notificationsOpen = false">
                View Ticket History
              </router-link>
            </div>
          </div>
        </transition>

        <!-- USER DROPDOWN MENU -->
        <transition name="fade-slide">
          <div v-if="userMenuOpen" class="user-dropdown" @click.stop>
            <div class="dropdown-header">
              <div class="user-avatar-large">
                <img 
                  v-if="userAvatarUrl" 
                  :src="userAvatarUrl" 
                  alt="Avatar"
                  @error="handleImageError"
                >
                <span v-else class="avatar-initials">{{ userInitials }}</span>
              </div>
              <div class="user-info">
                <div class="user-info-name">{{ authStore.userName || 'User' }}</div>
                <div class="user-info-email">{{ authStore.user?.email || 'No email' }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/client/settings" class="dropdown-item" @click="userMenuOpen = false">
              <i class="bx bx-user"></i>
              <span>Profil Saya</span>
            </router-link>
            <router-link to="/client/settings" class="dropdown-item" @click="userMenuOpen = false">
              <i class="bx bx-cog"></i>
              <span>Pengaturan</span>
            </router-link>
            <router-link to="/client/history" class="dropdown-item" @click="userMenuOpen = false">
              <i class="bx bx-history"></i>
              <span>Riwayat Tiket</span>
            </router-link>
            <a href="#" class="dropdown-item" @click.prevent="goToFeedbackTickets">
              <i class="bx bx-star"></i>
              <span>Butuh Rating</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" @click.prevent="logout">
              <i class="bx bx-log-out"></i>
              <span>Logout</span>
            </a>
          </div>
        </transition>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <router-view />
      </div>
    </main>

    <!-- Click outside to close menus -->
    <div v-if="userMenuOpen || notificationsOpen" class="overlay" @click="closeAllMenus"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const userMenuOpen = ref(false)
const notificationsOpen = ref(false)
const isLoadingNotifications = ref(false)
const imageLoadError = ref(false)
const navSummary = ref({
  total: 0,
  active: 0,
  pendingFeedback: 0,
  latestTicketNumber: null
})

// Computed: User Initials
const userInitials = computed(() => {
  const name = authStore.userName || authStore.user?.name || 'User'
  const names = name.trim().split(' ')
  
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return (names[0][0] + (names[0][1] || '')).toUpperCase()
})

// Computed: User Avatar URL with proper validation
const userAvatarUrl = computed(() => {
  if (imageLoadError.value) return null
  
  // Check authStore.userAvatar
  if (authStore.userAvatar) {
    const avatar = authStore.userAvatar
    
    // Check if it's a full URL
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    // Check if it's a relative path
    if (avatar.startsWith('/storage/') || avatar.startsWith('storage/')) {
      const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`
      return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${cleanPath}`
    }
    
    // If it's just a filename
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${avatar}`
  }
  
  // Check user object
  if (authStore.user?.avatar) {
    const avatar = authStore.user.avatar
    
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    if (avatar.startsWith('/storage/') || avatar.startsWith('storage/')) {
      const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`
      return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${cleanPath}`
    }
    
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${avatar}`
  }
  
  return null
})

// Computed: Notifications
const notifications = computed(() => {
  return notificationStore.notifications || []
})

// Computed: Notification Count
const notificationCount = computed(() => {
  return notificationStore.unreadCount || 0
})

const navInsight = computed(() => {
  if (navSummary.value.pendingFeedback > 0) {
    return {
      primary: `${navSummary.value.pendingFeedback} pelayanan belum dinilai`,
      secondary: 'Cek tiket selesai dan beri rating vendor.'
    }
  }

  if (navSummary.value.active > 0) {
    return {
      primary: `${navSummary.value.active} laporan masih diproses`,
      secondary: navSummary.value.latestTicketNumber
        ? `Terbaru: ${navSummary.value.latestTicketNumber}`
        : 'Pantau progres tanpa pindah halaman.'
    }
  }

  return {
    primary: navSummary.value.total > 0 ? 'Semua tiket terkendali' : 'Siap membuat tiket baru',
    secondary: navSummary.value.total > 0
      ? `${navSummary.value.total} tiket sudah tercatat di akun Anda`
      : 'Gunakan Create Ticket saat butuh bantuan.'
  }
})

// Toggle User Menu
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  notificationsOpen.value = false
}

// Toggle Notifications
const toggleNotifications = async () => {
  notificationsOpen.value = !notificationsOpen.value
  userMenuOpen.value = false
  
  // Fetch notifications when opening dropdown
  if (notificationsOpen.value && notifications.value.length === 0) {
    await fetchNotifications()
  }
}

// Close All Menus
const closeAllMenus = () => {
  userMenuOpen.value = false
  notificationsOpen.value = false
}

// Fetch Notifications with error handling
const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) return
  
  isLoadingNotifications.value = true
  
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.warn('⚠️ Failed to fetch notifications:', error.message)
    // Don't show error to user, just fail silently
  } finally {
    isLoadingNotifications.value = false
  }
}

const fetchNavSummary = async () => {
  if (!authStore.isAuthenticated) return

  try {
    const response = await api.get('/tickets', {
      params: { per_page: 100, page: 1 }
    })

    const tickets = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : []

    const sortedTickets = [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    navSummary.value = {
      total: tickets.length,
      active: tickets.filter(ticket => ['new', 'open', 'in_progress', 'assigned'].includes(ticket.status)).length,
      pendingFeedback: tickets.filter(
        ticket => ['resolved', 'closed'].includes(ticket.status) && !ticket.feedback
      ).length,
      latestTicketNumber: sortedTickets[0]?.ticket_number || null
    }
  } catch (error) {
    console.warn('Failed to load client navbar summary:', error.message)
  }
}

// Get Notification Icon
const getNotificationIcon = (type) => {
  const icons = {
    'ticket_created': 'bx bx-file-blank',
    'ticket_updated': 'bx bx-edit',
    'ticket_assigned': 'bx bx-user-check',
    'ticket_resolved': 'bx bx-check-circle',
    'laporan_created': 'bx bx-notepad',
    'laporan_status_updated': 'bx bx-refresh',
    'laporan_assigned': 'bx bx-user-plus',
    'priority_updated': 'bx bx-flag',
    'comment_added': 'bx bx-message-dots'
  }
  return icons[type] || 'bx bx-bell'
}

// Handle Notification Click
const handleNotificationClick = async (notif) => {
  notificationsOpen.value = false
  
  try {
    // Mark as read
    if (!notif.read_at) {
      await notificationStore.markAsRead(notif.id)
    }

    // Navigate based on type
    if (notif.related_type === 'laporan' && notif.related_id) {
      router.push('/client/history')
    } else if (notif.related_id) {
      router.push(`/tickets/${notif.related_id}`)
    }
  } catch (error) {
    console.error('Error handling notification:', error)
  }
}

// Format Date
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  } catch (error) {
    return dateString
  }
}

const goToFeedbackTickets = () => {
  userMenuOpen.value = false
  router.push('/client/tickets')
}

// Logout
const logout = async () => {
  userMenuOpen.value = false
  
  const result = await Swal.fire({
    title: 'Logout',
    text: 'Are you sure you want to logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
        text: 'An error occurred during logout. Please try again.',
        confirmButtonColor: '#667eea'
      })
    }
  }
}

// Handle Image Error
const handleImageError = (e) => {
  console.warn('⚠️ Image failed to load:', e.target?.src)
  imageLoadError.value = true
  
  // Hide the broken image
  if (e.target) {
    e.target.style.display = 'none'
  }
}

// Handle Escape Key
const handleEscape = (e) => {
  if (e.key === 'Escape' && (userMenuOpen.value || notificationsOpen.value)) {
    closeAllMenus()
  }
}

// Watch for auth changes
watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) {
    // Reset image error state when user logs in
    imageLoadError.value = false
    // Fetch notifications
    fetchNotifications()
    fetchNavSummary()
  }
})

// Lifecycle: Mounted
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  
  // Fetch notifications if authenticated
  if (authStore.isAuthenticated) {
    fetchNotifications()
    fetchNavSummary()
  }
})

// Lifecycle: Unmounted
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.client-fullscreen {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.12), transparent 30%),
    linear-gradient(180deg, #f8f9ff 0%, #f4f6fb 100%);
}

/* Top Bar */
.top-bar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  padding: 0.8rem 1.35rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 78px;
  position: sticky;
  top: 0;
  z-index: 1000;
  gap: 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.top-bar-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.65rem;
  font-weight: 800;
  color: #5b6ee1;
  text-decoration: none;
}

.logo i {
  font-size: 2rem;
}

.top-bar-center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.top-nav {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  padding: 0.28rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.08);
  border-radius: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.72rem 1.1rem;
  border-radius: 14px;
  text-decoration: none;
  color: #6c757d;
  font-weight: 600;
  transition: all 0.3s;
  position: relative;
}

.nav-link i {
  font-size: 1.25rem;
}

.nav-link:hover {
  color: #667eea;
  background: rgba(255, 255, 255, 0.95);
}

.nav-link.active {
  color: #667eea;
  background: #fff;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.14);
}

.nav-link.active::after {
  display: none;
}

.nav-link-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 14px 24px rgba(102, 126, 234, 0.24);
}

.nav-link-primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a428f 100%);
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(102, 126, 234, 0.28);
}

.nav-link-primary.active::after {
  display: none;
}

.top-bar-right {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.nav-insight,
.user-menu,
.btn-close-notif {
  border: none;
  outline: none;
}

.nav-insight {
  min-width: 0;
  max-width: 320px;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.06);
  text-align: left;
  cursor: pointer;
}

.nav-insight-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.14), rgba(118, 75, 162, 0.2));
  color: #5b6ee1;
}

.nav-insight-icon i {
  font-size: 1.1rem;
}

.nav-insight-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.nav-insight-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a94aa;
}

.nav-insight strong,
.nav-insight small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-insight strong {
  font-size: 0.88rem;
  color: #1f2937;
}

.nav-insight small {
  font-size: 0.75rem;
  color: #64748b;
}

/* CREATE LAPORAN BUTTON */
.btn-create-laporan {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #000;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.btn-create-laporan:hover {
  background: linear-gradient(135deg, #ffb300 0%, #ffa000 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.5);
  color: #000;
}

.btn-create-laporan i {
  font-size: 1.25rem;
}

/* ACTION BUTTON (Profile) */
.notification-bell {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(99, 102, 241, 0.06);
}

.notification-bell:hover {
  background: rgba(99, 102, 241, 0.12);
}

.notification-bell i {
  font-size: 1.5rem;
  color: #6c757d;
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #dc3545;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

/* NOTIFICATION DROPDOWN */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 1rem);
  right: 64px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 380px;
  max-height: 500px;
  overflow: hidden;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.dropdown-header-notif {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.dropdown-header-notif h6 {
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
}

.btn-close-notif {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close-notif:hover {
  background: #e9ecef;
}

.btn-close-notif i {
  font-size: 1.5rem;
}

.notification-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.loading-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #667eea;
}

.loading-notifications i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.loading-notifications p {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #adb5bd;
}

.empty-notifications i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-notifications p {
  margin: 0;
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f4ff;
}

.notification-item.unread:hover {
  background: #e6edff;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon i {
  font-size: 1.25rem;
  color: white;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-content h6 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.notif-content p {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notif-content small {
  font-size: 0.75rem;
  color: #adb5bd;
}

.notification-footer {
  padding: 0.75rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
  background: #f8f9fa;
}

.notification-footer a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
}

.notification-footer a:hover {
  text-decoration: underline;
}

/* USER MENU */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.75rem 0.45rem 0.45rem;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.user-menu:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.user-avatar .avatar-initials {
  position: relative;
  z-index: 1;
}

.user-name {
  font-weight: 700;
  color: #1f2937;
}

.user-identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.user-role {
  font-size: 0.78rem;
  color: #8a94aa;
}

.user-name,
.user-role {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 1rem);
  right: 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.14);
  min-width: 280px;
  overflow: hidden;
  z-index: 2000;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.dropdown-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.user-avatar-large .avatar-initials {
  position: relative;
  z-index: 1;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.user-info-email {
  font-size: 0.875rem;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #2c3e50;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item i {
  font-size: 1.5rem;
  color: #667eea;
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 78px);
  padding: 1.5rem;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Loading Spin Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.bx-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 1200px) {
  .content-container {
    max-width: 100%;
  }
  
  .notification-dropdown {
    width: 340px;
  }

  .top-bar {
    flex-wrap: wrap;
  }

  .top-bar-center {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }

  .nav-insight {
    flex: 1;
    max-width: none;
  }
}

@media (max-width: 992px) {
  .top-nav {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.75rem 1rem;
  }
  
  .nav-link span {
    display: none;
  }
  
  .nav-link i {
    font-size: 1.5rem;
  }

  .top-bar-center {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
  
  .notification-dropdown {
    right: 0;
    width: calc(100vw - 2rem);
    max-width: 340px;
  }

  .user-dropdown {
    right: 0;
    width: calc(100vw - 2rem);
  }

  .top-bar-right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-link-primary {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .top-nav {
    width: 100%;
    justify-content: space-between;
  }

  .nav-link {
    flex: 1;
    justify-content: center;
    padding-inline: 1rem;
  }

  .nav-link span {
    display: none;
  }

  .nav-link-primary span {
    display: inline;
  }

  .user-menu {
    flex: 1;
    justify-content: space-between;
  }

  .notification-bell {
    order: 2;
  }
}
</style>
