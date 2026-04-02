<template>
  <nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
       id="layout-navbar">
    <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
      <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)" @click.prevent="toggleSidebar">
        <i class="bx bx-menu bx-sm"></i>
      </a>
    </div>

    <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
      <!-- Page Title -->
      <div class="navbar-nav align-items-center">
        <div class="nav-item d-flex align-items-center">
          <div class="page-title-wrapper">
            <h4 class="mb-0 page-title">{{ pageTitle }}</h4>
            <p class="page-breadcrumb" v-if="breadcrumb">{{ breadcrumb }}</p>
          </div>
        </div>
      </div>

      <ul class="navbar-nav flex-row align-items-center ms-auto">
        
        <!-- Quick Search -->
        <li class="nav-item me-2 d-none d-lg-block" v-click-outside="closeSearch">
          <div class="search-wrapper">
            <i class="bx bx-search"></i>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Cari tiket, user..."
              v-model="searchQuery"
              @input="handleSearch"
              @focus="showSearchResults = true"
            >
            <!-- Search Results Dropdown -->
            <div class="search-results" v-if="showSearchResults && (searchQuery || isSearching)">
              <div v-if="isSearching" class="search-loading">
                <i class="bx bx-loader-alt bx-spin"></i>
                <span>Mencari...</span>
              </div>
              <template v-else-if="searchResults.length > 0">
                <div 
                  class="search-result-item" 
                  v-for="result in searchResults" 
                  :key="result.id"
                  @click="goToResult(result)"
                >
                  <i class="bx" :class="result.icon"></i>
                  <span>{{ result.text }}</span>
                </div>
                <div class="view-all" @click="viewAllResults">Lihat semua hasil</div>
              </template>
              <div v-else-if="searchQuery" class="search-empty">
                <i class="bx bx-search-alt"></i>
                <span>Tidak ada hasil ditemukan</span>
              </div>
            </div>
          </div>
        </li>

        <!-- Theme Toggle -->
        <li class="nav-item me-2">
          <button class="action-btn theme-toggle" @click="toggleTheme" :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
            <i class="bx" :class="isDark ? 'bx-sun' : 'bx-moon'"></i>
          </button>
        </li>

        <!-- Full Screen Toggle -->
        <li class="nav-item me-2 d-none d-lg-block">
          <button class="action-btn" @click="toggleFullscreen" title="Full Screen">
            <i class="bx" :class="isFullscreen ? 'bx-exit-fullscreen' : 'bx-fullscreen'"></i>
          </button>
        </li>

        <!-- Shortcuts -->
        <li class="nav-item navbar-dropdown dropdown me-2 d-none d-lg-block" v-click-outside="closeShortcuts">
          <button 
            class="action-btn" 
            @click.prevent="toggleShortcuts"
            title="Shortcuts"
          >
            <i class="bx bx-grid-alt"></i>
          </button>
          <ul 
            class="dropdown-menu dropdown-menu-end shortcuts-dropdown" 
            :class="{ show: showShortcuts }"
          >
            <li class="dropdown-header">
              <span class="header-title">Quick Access</span>
            </li>
            <li><div class="dropdown-divider"></div></li>
            <li class="shortcuts-grid">
              <router-link 
                v-if="canCreateTicket" 
                :to="createTicketRoute" 
                class="shortcut-item"
                @click="closeShortcuts"
              >
                <div class="shortcut-icon" style="background: #dbeafe;">
                  <i class="bx bx-plus-circle" style="color: #2563eb;"></i>
                </div>
                <span>Buat Tiket</span>
              </router-link>
              
              <router-link 
                :to="myTicketsRoute" 
                class="shortcut-item"
                @click="closeShortcuts"
              >
                <div class="shortcut-icon" style="background: #fef3c7;">
                  <i class="bx bx-file" style="color: #d97706;"></i>
                </div>
                <span>Tiket Saya</span>
              </router-link>
              
              <router-link 
                v-if="authStore.isAdmin" 
                to="/admin/analytics" 
                class="shortcut-item"
                @click="closeShortcuts"
              >
                <div class="shortcut-icon" style="background: #d1fae5;">
                  <i class="bx bx-bar-chart-alt-2" style="color: #059669;"></i>
                </div>
                <span>Analytics</span>
              </router-link>
              
              <router-link 
                :to="settingsRoute" 
                class="shortcut-item"
                @click="closeShortcuts"
              >
                <div class="shortcut-icon" style="background: #e9d5ff;">
                  <i class="bx bx-cog" style="color: #7c3aed;"></i>
                </div>
                <span>Settings</span>
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Notifications -->
        <li class="nav-item navbar-dropdown dropdown me-2" v-click-outside="closeNotifications">
          <button 
            class="action-btn notification-btn" 
            @click.prevent="toggleNotifications"
          >
            <i class="bx bx-bell"></i>
            <span class="badge-dot" v-if="unreadNotifications > 0"></span>
            <span class="badge-count-small" v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
          </button>
          <ul 
            class="dropdown-menu dropdown-menu-end notification-dropdown" 
            :class="{ show: showNotifications }"
          >
            <li class="dropdown-header">
              <span class="header-title">Notifikasi</span>
              <span class="badge-count" v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
            </li>
            <li>
              <div class="dropdown-divider"></div>
            </li>
            <template v-if="notifications.length > 0">
              <li v-for="notif in notifications" :key="notif.id">
                <a class="dropdown-item notification-item" href="#" @click.prevent="handleNotificationClick(notif)">
                  <div class="notif-wrapper">
                    <div class="notif-icon" :class="notif.type">
                      <i class="bx" :class="notif.icon"></i>
                    </div>
                    <div class="notif-content">
                      <div class="notif-title">{{ notif.title }}</div>
                      <div class="notif-text">{{ notif.text }}</div>
                      <div class="notif-time">{{ notif.time }}</div>
                    </div>
                  </div>
                </a>
              </li>
            </template>
            <li v-else>
              <div class="notification-empty">
                <i class="bx bx-bell-off"></i>
                <span>Tidak ada notifikasi</span>
              </div>
            </li>
            <li>
              <div class="dropdown-divider"></div>
            </li>
            <li>
              <a class="dropdown-item view-all-link" href="#" @click.prevent="viewAllNotifications">
                Lihat Semua Notifikasi
              </a>
            </li>
          </ul>
        </li>

        <!-- User Profile -->
        <li class="nav-item navbar-dropdown dropdown-user dropdown" v-click-outside="closeUserDropdown">
          <button 
            class="user-btn" 
            @click.prevent="toggleDropdown"
          >
            <div class="user-avatar">
              <!-- ✅ USE AUTH STORE GETTER -->
              <img v-if="authStore.userAvatar" :src="authStore.userAvatar" :alt="authStore.userName" class="avatar-img" />
              <span v-else class="avatar-text">{{ authStore.userInitials }}</span>
              <div class="status-dot"></div>
            </div>
            <div class="user-details d-none d-lg-block">
              <span class="user-name-text">{{ authStore.userName }}</span>
              <span class="user-role-text">{{ roleText }}</span>
            </div>
            <i class="bx bx-chevron-down chevron-icon"></i>
          </button>
          <ul 
            class="dropdown-menu dropdown-menu-end user-dropdown" 
            :class="{ show: showDropdown }"
          >
            <li>
              <div class="dropdown-user-info">
                <div class="user-avatar-large">
                  <!-- ✅ USE AUTH STORE GETTER -->
                  <img v-if="authStore.userAvatar" :src="authStore.userAvatar" :alt="authStore.userName" class="avatar-img-large" />
                  <span v-else class="avatar-text-large">{{ authStore.userInitials }}</span>
                  <div class="status-dot-large"></div>
                </div>
                <div class="user-info-text">
                  <div class="user-name-large">{{ authStore.userName }}</div>
                  <div class="user-role-large">{{ roleText }}</div>
                </div>
              </div>
            </li>
            <li>
              <div class="dropdown-divider"></div>
            </li>
            <li>
              <a class="dropdown-item menu-item" href="#" @click.prevent="navigateTo('profile')">
                <i class="bx bx-user"></i>
                <span>Profil Saya</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item menu-item" href="#" @click.prevent="navigateTo('settings')">
                <i class="bx bx-cog"></i>
                <span>Pengaturan</span>
              </a>
            </li>
            <li>
              <div class="dropdown-divider"></div>
            </li>
            <li>
              <a class="dropdown-item menu-item logout" href="#" @click.prevent="logout">
                <i class="bx bx-log-out"></i>
                <span>Keluar</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// State management
const showDropdown = ref(false)
const showNotifications = ref(false)
const showShortcuts = ref(false)
const showSearchResults = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const isDark = ref(false)
const isFullscreen = ref(false)
const unreadNotifications = ref(3)
const searchTimeout = ref(null)

// Mock notifications
const notifications = ref([
  {
    id: 1,
    type: 'success',
    icon: 'bx-check-circle',
    title: 'Ticket Resolved',
    text: 'TKT-2025123-0001 berhasil diselesaikan',
    time: '5 menit lalu'
  },
  {
    id: 2,
    type: 'warning',
    icon: 'bx-error-circle',
    title: 'Tiket Baru Ditugaskan',
    text: 'Anda ditugaskan ke TKT-2025123-0005',
    time: '1 jam lalu'
  },
  {
    id: 3,
    type: 'info',
    icon: 'bx-info-circle',
    title: 'Update Sistem',
    text: 'Maintenance dijadwalkan malam ini',
    time: '3 jam lalu'
  }
])

// Computed properties
const pageTitle = computed(() => {
  const titles = {
    'AdminDashboard': 'Dashboard',
    'AdminTickets': 'Semua Tickets',
    'AdminTicketDetail': 'Detail Ticket',
    'AdminUsers': 'User Management',
    'AdminVendors': 'Vendor Management',
    'AdminCategories': 'Kategori',
    'AdminAnalytics': 'Analytics',
    'AdminReports': 'Reports',
    'AdminLaporan': 'Kelola Laporan',
    'AdminSettings': 'Pengaturan Akun',
    'VendorDashboard': 'Dashboard',
    'VendorTickets': 'Tiket Ditugaskan',
    'ClientDashboard': 'Dashboard',
    'CreateTicket': 'Buat Tiket Baru',
    'ClientTickets': 'Ticket saya',
    'ClientSettings': 'Pengaturan',
  }
  return titles[route.name] || 'HelpCenter'
})

const breadcrumb = computed(() => {
  const breadcrumbs = {
    'AdminDashboard': 'Home / Dashboard',
    'AdminTickets': 'Home / Tiket / Semua Tiket',
    'AdminUsers': 'Home / Manajemen / Users',
    'AdminVendors': 'Home / Manajemen / Vendors',
    'AdminCategories': 'Home / Manajemen / Kategori',
    'AdminSettings': 'Home / Pengaturan',
    'ClientSettings': 'Home / Pengaturan',
  }
  return breadcrumbs[route.name] || ''
})

const roleText = computed(() => {
  const roles = {
    'admin': 'Administrator',
    'vendor': 'Vendor',
    'client': 'Client'
  }
  return roles[authStore.userRole] || authStore.userRole
})

// Search
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  searchTimeout.value = setTimeout(() => {
    performSearch()
  }, 500)
}

const performSearch = () => {
  const mockResults = [
    { id: 1, type: 'ticket', icon: 'bx-file', text: `Tiket #TKT-2025-${searchQuery.value}` },
    { id: 2, type: 'user', icon: 'bx-user', text: `User: ${searchQuery.value}` }
  ]
  searchResults.value = mockResults
  isSearching.value = false
}

const goToResult = (result) => {
  console.log('Navigate to:', result)
  showSearchResults.value = false
  searchQuery.value = ''
}

const viewAllResults = () => {
  showSearchResults.value = false
}

// Navigation
const navigateTo = (destination) => {
  let targetRoute = null
  
  switch(destination) {
    case 'settings':
      if (authStore.isAdmin) {
        targetRoute = '/admin/settings'
      } else if (authStore.isClient) {
        targetRoute = '/client/settings'
      } else if (authStore.isVendor) {
        targetRoute = '/vendor/settings'
      }
      break
    
    case 'profile':
      if (authStore.isAdmin) {
        targetRoute = '/admin/settings'
      } else if (authStore.isVendor) {
        targetRoute = '/vendor/settings'
      } else if (authStore.isClient) {
        targetRoute = '/client/settings'
      }
      break
    
    case 'create-ticket':
      targetRoute = authStore.isClient ? '/client/create-ticket' : '/admin/tickets'
      break
    
    case 'my-tickets':
      if (authStore.isClient) {
        targetRoute = '/client/tickets'
      } else if (authStore.isVendor) {
        targetRoute = '/vendor/tickets'
      } else {
        targetRoute = '/admin/tickets'
      }
      break
    
    case 'analytics':
      targetRoute = '/admin/analytics'
      break
    
  }
  
  if (targetRoute) {
    router.push(targetRoute).catch(() => {})
  }
  
  showShortcuts.value = false
  showDropdown.value = false
  showNotifications.value = false
  showSearchResults.value = false
}

const handleNotificationClick = (notif) => {
  console.log('Notification clicked:', notif)
  showNotifications.value = false
}

const viewAllNotifications = () => {
  showNotifications.value = false
  router.push({ name: 'Notifications' }).catch(() => {})
}

// Toggle functions
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  showNotifications.value = false
  showShortcuts.value = false
  showSearchResults.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showDropdown.value = false
  showShortcuts.value = false
  showSearchResults.value = false
}

const toggleShortcuts = () => {
  showShortcuts.value = !showShortcuts.value
  showDropdown.value = false
  showNotifications.value = false
  showSearchResults.value = false
}

const toggleSidebar = () => {
  window.dispatchEvent(new CustomEvent('layout:toggle-sidebar'))
}

// Close functions
const closeUserDropdown = () => {
  showDropdown.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

const closeShortcuts = () => {
  showShortcuts.value = false
}

const closeSearch = () => {
  showSearchResults.value = false
}

// Theme
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: isDark.value ? 'Mode Gelap Aktif' : 'Mode Terang Aktif',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
  })
}

// Fullscreen
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
    isFullscreen.value = true
  } else {
    document.exitFullscreen().catch(() => {})
    isFullscreen.value = false
  }
}

// Logout
const logout = async () => {
  showDropdown.value = false
  
  const result = await Swal.fire({
    title: 'Keluar',
    text: 'Apakah Anda yakin ingin keluar?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#8b5cf6',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    reverseButtons: true
  })

  if (result.isConfirmed) {
    try {
      await authStore.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

// Lifecycle
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark-mode')
  }
  
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

const settingsRoute = computed(() => {
  if (authStore.isAdmin) return '/admin/settings'
  if (authStore.isVendor) return '/vendor/settings'
  if (authStore.isClient) return '/client/settings'
  return '/'
})

const myTicketsRoute = computed(() => {
  if (authStore.isAdmin) return '/admin/tickets'
  if (authStore.isVendor) return '/vendor/tickets'
  if (authStore.isClient) return '/client/tickets'
  return '/'
})

const createTicketRoute = computed(() => {
  if (authStore.isClient) return '/client/create-ticket'
  return '/admin/tickets'
})

const canCreateTicket = computed(() => {
  return authStore.isClient || authStore.isAdmin
})
</script>

<style scoped>
/* Navbar Base */
.layout-navbar {
  background: #fff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 0 !important;
  margin-bottom: 1.5rem !important;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 1000;
  overflow: visible !important;
}

:global(.dark-mode) .layout-navbar {
  background: #1e293b !important;
  border-bottom: 1px solid #334155;
}

/* Page Title */
.page-title-wrapper {
  padding: 0;
}

.page-title {
  color: #2d3748 !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  margin: 0 !important;
  line-height: 1.2;
  transition: color 0.3s ease;
}

:global(.dark-mode) .page-title {
  color: #f1f5f9 !important;
}

.page-breadcrumb {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
  transition: color 0.3s ease;
}

:global(.dark-mode) .page-breadcrumb {
  color: #94a3b8 !important;
}

/* Action Buttons */
.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.action-btn:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

:global(.dark-mode) .action-btn:hover {
  background: #334155;
}

.action-btn i {
  font-size: 22px;
  color: #6b7280;
  transition: color 0.3s ease;
}

:global(.dark-mode) .action-btn i {
  color: #94a3b8;
}

.action-btn:hover i {
  color: #8b5cf6;
}

.theme-toggle:hover i {
  color: #f59e0b;
}

/* Search Bar */
.search-wrapper {
  position: relative;
  width: 300px;
}

.search-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 18px;
  z-index: 1;
  transition: color 0.3s ease;
  pointer-events: none;
}

:global(.dark-mode) .search-wrapper i {
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #4b5563;
  background: #f9fafb;
  transition: all 0.3s ease;
}

:global(.dark-mode) .search-input {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

:global(.dark-mode) .search-input:focus {
  background: #1e293b;
}

.search-input::placeholder {
  color: #9ca3af;
}

:global(.dark-mode) .search-input::placeholder {
  color: #64748b;
}

/* Search Results */
.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 300px;
  overflow-y: auto;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:global(.dark-mode) .search-results {
  background: #1e293b;
  border-color: #334155;
}

.search-loading,
.search-empty {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

:global(.dark-mode) .search-loading,
:global(.dark-mode) .search-empty {
  color: #94a3b8;
}

.search-loading i {
  font-size: 24px;
  color: #8b5cf6;
}

.search-empty i {
  font-size: 32px;
  color: #9ca3af;
}

.search-result-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-result-item:hover {
  background: #f9fafb;
}

:global(.dark-mode) .search-result-item:hover {
  background: #334155;
}

.search-result-item i {
  font-size: 18px;
  color: #8b5cf6;
}

.search-result-item span {
  font-size: 14px;
  color: #4b5563;
}

:global(.dark-mode) .search-result-item span {
  color: #e2e8f0;
}

.view-all {
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #8b5cf6;
  cursor: pointer;
  border-top: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

:global(.dark-mode) .view-all {
  border-top-color: #334155;
}

.view-all:hover {
  background: #f9fafb;
}

:global(.dark-mode) .view-all:hover {
  background: #334155;
}

/* Notification Button */
.notification-btn {
  position: relative;
}

.badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

:global(.dark-mode) .badge-dot {
  border-color: #1e293b;
}

.badge-count-small {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

/* Dropdown Menus */
.dropdown-menu {
  display: none;
  animation: slideDown 0.2s ease;
}

.dropdown-menu.show {
  display: block;
}

.navbar-dropdown,
.dropdown-user {
  position: relative;
}

/* Shortcuts Dropdown - lanjutan */
.shortcuts-dropdown {
  min-width: 320px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
  padding: 0 !important;
  margin-top: 8px !important;
}

:global(.dark-mode) .shortcuts-dropdown {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.dropdown-header {
  padding: 16px 20px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

:global(.dark-mode) .dropdown-header {
  background: #334155;
  border-bottom-color: #475569;
}

.header-title {
  color: #1f2937;
  font-weight: 600;
  font-size: 15px;
  transition: color 0.3s ease;
}

:global(.dark-mode) .header-title {
  color: #f1f5f9;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  background: #f9fafb;
}

:global(.dark-mode) .shortcut-item {
  background: #334155;
}

.shortcut-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-icon i {
  font-size: 24px;
}

.shortcut-item span {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
  transition: color 0.3s ease;
}

:global(.dark-mode) .shortcut-item span {
  color: #e2e8f0;
}

/* Notification Dropdown */
.notification-dropdown {
  min-width: 380px !important;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
  padding: 0 !important;
  margin-top: 8px !important;
}

:global(.dark-mode) .notification-dropdown {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.badge-count {
  background: #8b5cf6;
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.notification-item {
  padding: 14px 20px !important;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

:global(.dark-mode) .notification-item {
  border-bottom-color: #334155;
}

.notification-item:hover {
  background: #f9fafb !important;
}

:global(.dark-mode) .notification-item:hover {
  background: #334155 !important;
}

.notification-empty {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

:global(.dark-mode) .notification-empty {
  color: #94a3b8;
}

.notification-empty i {
  font-size: 48px;
  color: #9ca3af;
}

:global(.dark-mode) .notification-empty i {
  color: #64748b;
}

.notif-wrapper {
  display: flex;
  gap: 12px;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon.success {
  background: #d1fae5;
  color: #059669;
}

.notif-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.notif-icon.info {
  background: #dbeafe;
  color: #2563eb;
}

.notif-icon i {
  font-size: 20px;
}

.notif-content {
  flex: 1;
}

.notif-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

:global(.dark-mode) .notif-title {
  color: #f1f5f9;
}

.notif-text {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
  line-height: 1.4;
  transition: color 0.3s ease;
}

:global(.dark-mode) .notif-text {
  color: #94a3b8;
}

.notif-time {
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.3s ease;
}

:global(.dark-mode) .notif-time {
  color: #64748b;
}

.dropdown-divider {
  margin: 0;
  border-top: 1px solid #e5e7eb;
}

:global(.dark-mode) .dropdown-divider {
  border-top-color: #334155;
}

.view-all-link {
  padding: 14px 20px !important;
  font-weight: 600;
  font-size: 14px;
  color: #8b5cf6 !important;
  text-align: center;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
  transition: background 0.2s ease;
}

:global(.dark-mode) .view-all-link {
  background: #334155;
}

.view-all-link:hover {
  background: #f3f4f6 !important;
}

:global(.dark-mode) .view-all-link:hover {
  background: #475569 !important;
}

/* User Dropdown */
.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px !important;
  background: transparent;
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-btn:hover {
  background: #f3f4f6;
}

:global(.dark-mode) .user-btn:hover {
  background: #334155;
}

.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.user-avatar .avatar-text {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.user-avatar .status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #34d399;
  border: 2px solid #fff;
  border-radius: 50%;
}

:global(.dark-mode) .user-avatar .status-dot {
  border-color: #1e293b;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-details .user-name-text {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  transition: color 0.3s ease;
}

:global(.dark-mode) .user-details .user-name-text {
  color: #f1f5f9;
}

.user-details .user-role-text {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  transition: color 0.3s ease;
}

:global(.dark-mode) .user-details .user-role-text {
  color: #94a3b8;
}

.chevron-icon {
  font-size: 18px;
  color: #6b7280;
  transition: all 0.3s ease;
}

:global(.dark-mode) .chevron-icon {
  color: #94a3b8;
}

.user-btn:hover .chevron-icon {
  transform: translateY(2px);
}

/* User Dropdown Menu */
.user-dropdown {
  min-width: 280px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
  padding: 0 !important;
  margin-top: 8px !important;
  z-index: 1400 !important;
  right: 0 !important;
  left: auto !important;
}

:global(.dark-mode) .user-dropdown {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.dropdown-user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%);
}

:global(.dark-mode) .dropdown-user-info {
  border-bottom-color: #334155;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
}

.user-avatar-large {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.user-avatar-large .avatar-text-large {
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  text-transform: uppercase;
}

.user-avatar-large .status-dot-large {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #34d399;
  border: 3px solid #fff;
  border-radius: 50%;
}

:global(.dark-mode) .user-avatar-large .status-dot-large {
  border-color: #1e293b;
}

.user-info-text {
  flex: 1;
}

.user-info-text .user-name-large {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
  transition: color 0.3s ease;
}

:global(.dark-mode) .user-info-text .user-name-large {
  color: #f1f5f9;
}

.user-info-text .user-role-large {
  font-size: 13px;
  color: #6b7280;
  transition: color 0.3s ease;
}

:global(.dark-mode) .user-info-text .user-role-large {
  color: #94a3b8;
}

.menu-item {
  padding: 12px 20px !important;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4b5563 !important;
  transition: all 0.2s ease;
  text-decoration: none;
}

:global(.dark-mode) .menu-item {
  color: #e2e8f0 !important;
}

.menu-item:hover {
  background: #f9fafb !important;
  padding-left: 24px !important;
}

:global(.dark-mode) .menu-item:hover {
  background: #334155 !important;
}

.menu-item i {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.menu-item:hover i {
  transform: scale(1.1);
}

.menu-item.logout {
  color: #ef4444 !important;
  border-radius: 0 0 12px 12px;
}

.menu-item.logout:hover {
  background: #fee2e2 !important;
}

:global(.dark-mode) .menu-item.logout:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.menu-item.logout i {
  color: #ef4444;
}

/* Responsive */
@media (max-width: 991.98px) {
  .search-wrapper {
    width: 200px;
  }
  
  .notification-dropdown,
  .user-dropdown {
    min-width: 280px !important;
  }
}

@media (max-width: 575.98px) {
  .layout-navbar {
    padding: 0.5rem 1rem !important;
  }

  .navbar-nav-right {
    min-width: 0;
  }
  
  .page-title {
    font-size: 18px !important;
  }

  .page-breadcrumb {
    display: none;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
  }
  
  .action-btn i {
    font-size: 20px;
  }

  .user-btn {
    padding: 6px 8px !important;
    gap: 0.4rem;
  }

  .user-dropdown,
  .notification-dropdown {
    position: fixed !important;
    top: 64px !important;
    right: 12px !important;
    left: 12px !important;
    min-width: auto !important;
    width: auto !important;
    max-width: none !important;
  }
}

/* Scrollbar Styling */
.search-results::-webkit-scrollbar,
.notification-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track,
.notification-dropdown::-webkit-scrollbar-track {
  background: #f3f4f6;
}

:global(.dark-mode) .search-results::-webkit-scrollbar-track,
:global(.dark-mode) .notification-dropdown::-webkit-scrollbar-track {
  background: #334155;
}

.search-results::-webkit-scrollbar-thumb,
.notification-dropdown::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

:global(.dark-mode) .search-results::-webkit-scrollbar-thumb,
:global(.dark-mode) .notification-dropdown::-webkit-scrollbar-thumb {
  background: #475569;
}

.search-results::-webkit-scrollbar-thumb:hover,
.notification-dropdown::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

:global(.dark-mode) .search-results::-webkit-scrollbar-thumb:hover,
:global(.dark-mode) .notification-dropdown::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* ✅ ADD: Avatar image styling for navbar */
.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  overflow: hidden; /* ✅ IMPORTANT: Clip image to circle */
}

/* ✅ ADD: Style for avatar image */
.user-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-avatar .avatar-text {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.user-avatar .status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #34d399;
  border: 2px solid #fff;
  border-radius: 50%;
  z-index: 1; /* ✅ IMPORTANT: Above image */
}

:global(.dark-mode) .user-avatar .status-dot {
  border-color: #1e293b;
}

/* ✅ ADD: Avatar large styling for dropdown */
.user-avatar-large {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  overflow: hidden; /* ✅ IMPORTANT: Clip image to circle */
}

/* ✅ ADD: Style for large avatar image */
.user-avatar-large .avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-avatar-large .avatar-text-large {
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  text-transform: uppercase;
}

.user-avatar-large .status-dot-large {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #34d399;
  border: 3px solid #fff;
  border-radius: 50%;
  z-index: 1; /* ✅ IMPORTANT: Above image */
}

:global(.dark-mode) .user-avatar-large .status-dot-large {
  border-color: #1e293b;
}
</style>
