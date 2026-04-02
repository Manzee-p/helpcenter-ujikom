<template>
  <aside id="layout-menu" :class="['layout-menu', 'menu-vertical', 'menu', 'bg-menu-theme', { open: isMobileOpen }]">
    <!-- Brand Header -->
    <div class="app-brand demo">
      <a href="#" class="app-brand-link">
        <div class="brand-wrapper">
          <img :src="logo" alt="HelpCenter Logo" class="brand-logo" />
          <span class="brand-text">HelpCenter</span>
        </div>
      </a>

      <button class="menu-toggle d-xl-none" @click="toggleMenu">
        <i class="bx bx-x"></i>
      </button>
    </div>

    <!-- User Profile Section -->
    <div class="user-profile-section">
      <div class="user-avatar">
        <div v-if="authStore.userAvatar" class="avatar-image">
          <img :src="authStore.userAvatar" :alt="authStore.userName" />
        </div>
        <div v-else class="avatar-circle">
          {{ authStore.userInitials }}
        </div>
      </div>
      <div class="user-info">
        <div class="user-name">{{ authStore.userName }}</div>
        <div class="user-role">{{ getRoleName() }}</div>
      </div>
    </div>

    <div class="menu-divider"></div>

    <!-- Menu Items -->
    <ul class="menu-inner">
      <!-- ============ ADMIN MENU ============ -->
      <template v-if="authStore.isAdmin">
        <li class="menu-item" :class="{ active: isActive('/admin/dashboard') }">
          <router-link to="/admin/dashboard" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-home-circle"></i></div>
            <span class="menu-text">Dashboard</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/tickets') }">
          <router-link to="/admin/tickets" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-file"></i></div>
            <span class="menu-text">Semua Tiket</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/deletion-requests') }">
          <router-link to="/admin/deletion-requests" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-trash"></i></div>
            <span class="menu-text">Penghapusan Tiket</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>KOMUNIKASI</span></li>

        <li class="menu-item" :class="{ active: isActive('/admin/vendor-chat') }">
          <router-link to="/admin/vendor-chat" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-message-dots"></i></div>
            <span class="menu-text">Chat Vendor</span>
            <span v-if="vendorChatUnread > 0" class="menu-badge badge-info">{{ vendorChatUnread }}</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>MANAJEMEN</span></li>

        <li class="menu-item" :class="{ active: isActive('/admin/users') }">
          <router-link to="/admin/users" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-user"></i></div>
            <span class="menu-text">Pengguna</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/vendors') }">
          <router-link to="/admin/vendors" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-group"></i></div>
            <span class="menu-text">Vendor</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/vendor-ratings') }">
          <router-link to="/admin/vendor-ratings" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-star"></i></div>
            <span class="menu-text">Rating Vendor</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/day-checklists') }">
          <router-link to="/admin/day-checklists" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-task"></i></div>
            <span class="menu-text">Checklist Hari-H</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/categories') }">
          <router-link to="/admin/categories" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-category"></i></div>
            <span class="menu-text">Kategori</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>ANALISIS & LAPORAN</span></li>

        <li class="menu-item" :class="{ active: isActive('/admin/analytics') }">
          <router-link to="/admin/analytics" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-bar-chart-alt-2"></i></div>
            <span class="menu-text">Analitik</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/reports') }">
          <router-link to="/admin/reports" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-file-blank"></i></div>
            <span class="menu-text">Laporan</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/admin/status-board') }">
          <router-link to="/admin/status-board" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-info-circle"></i></div>
            <span class="menu-text">Papan Status</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>PENGATURAN</span></li>

        <li class="menu-item" :class="{ active: isActive('/admin/settings') }">
          <router-link to="/admin/settings" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-cog"></i></div>
            <span class="menu-text">Pengaturan</span>
          </router-link>
        </li>
      </template>

      <!-- ============ VENDOR MENU ============ -->
      <template v-if="authStore.isVendor">
        <li class="menu-item" :class="{ active: isActive('/vendor/dashboard') }">
          <router-link to="/vendor/dashboard" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-home-circle"></i></div>
            <span class="menu-text">Dashboard</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>TIKET</span></li>

        <li class="menu-item" :class="{ active: isActive('/vendor/tickets') }">
          <router-link to="/vendor/tickets" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-file"></i></div>
            <span class="menu-text">Tiket Ditugaskan</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>KOMUNIKASI</span></li>

        <li class="menu-item" :class="{ active: isActive('/vendor/admin-chat') }">
          <router-link to="/vendor/admin-chat" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-message-dots"></i></div>
            <span class="menu-text">Chat Admin</span>
            <span v-if="adminChatUnread > 0" class="menu-badge badge-info">{{ adminChatUnread }}</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/vendor/client-chat') }">
          <router-link to="/vendor/client-chat" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-message-square-dots"></i></div>
            <span class="menu-text">Chat Client</span>
            <span v-if="clientChatUnread > 0" class="menu-badge badge-info">{{ clientChatUnread }}</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>LAINNYA</span></li>

        <li class="menu-item" :class="{ active: isActive('/vendor/reports') }">
          <router-link to="/vendor/reports" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-bar-chart-alt-2"></i></div>
            <span class="menu-text">Laporan</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/vendor/history') }">
          <router-link to="/vendor/history" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-history"></i></div>
            <span class="menu-text">Riwayat</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/vendor/ratings') }">
          <router-link to="/vendor/ratings" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-star"></i></div>
            <span class="menu-text">Rating Client</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/vendor/day-checklists') }">
          <router-link to="/vendor/day-checklists" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-task"></i></div>
            <span class="menu-text">Checklist Hari-H</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/vendor/profile') }">
          <router-link to="/vendor/profile" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-user"></i></div>
            <span class="menu-text">Profil</span>
          </router-link>
        </li>

          <li class="menu-item" :class="{ active: isActive('/vendor/settings') }">
            <router-link to="/vendor/settings" class="menu-link">
              <div class="menu-icon-wrapper"><i class="bx bx-cog"></i></div>
              <span class="menu-text">Pengaturan</span>
            </router-link>
          </li>
      </template>

      <!-- ============ CLIENT MENU ============ -->
      <template v-if="authStore.isClient">
        <li class="menu-item" :class="{ active: isActive('/client/dashboard') }">
          <router-link to="/client/dashboard" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-home-circle"></i></div>
            <span class="menu-text">Dashboard</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>TIKET</span></li>

        <li class="menu-item" :class="{ active: isActive('/client/create-ticket') }">
          <router-link to="/client/create-ticket" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-plus-circle"></i></div>
            <span class="menu-text">Buat Tiket</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/client/tickets') }">
          <router-link to="/client/tickets" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-file"></i></div>
            <span class="menu-text">Tiket Saya</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>LAPORAN</span></li>

        <li class="menu-item" :class="{ active: isActive('/client/create-report') }">
          <router-link to="/client/create-report" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-edit"></i></div>
            <span class="menu-text">Buat Laporan</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/client/my-reports') }">
          <router-link to="/client/my-reports" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-notepad"></i></div>
            <span class="menu-text">Laporan Saya</span>
          </router-link>
        </li>

        <li class="menu-section-title"><span>LAINNYA</span></li>

        <li class="menu-item" :class="{ active: isActive('/client/history') }">
          <router-link to="/client/history" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-history"></i></div>
            <span class="menu-text">History</span>
          </router-link>
        </li>

        <li class="menu-item" :class="{ active: isActive('/client/client-settings') }">
          <router-link to="/client/client-settings" class="menu-link">
            <div class="menu-icon-wrapper"><i class="bx bx-cog"></i></div>
            <span class="menu-text">Pengaturan</span>
          </router-link>
        </li>
      </template>
    </ul>
  </aside>
  <div :class="['sidebar-overlay', { show: isMobileOpen }]" @click="closeMenu"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import logo from '@/assets/logo_helpdesk.png'

const authStore = useAuthStore()
const route = useRoute()

// Unread counts
const vendorChatUnread = ref(0)
const adminChatUnread = ref(0)
const clientChatUnread = ref(0)

// Error tracking
const errorCounts = ref({
  vendorChat: 0,
  adminChat: 0
})

const MAX_ERRORS = 3
const isMobileOpen = ref(false)

// ─── Helpers ──────────────────────────────────────────────
const isActive = (path) => route.path.startsWith(path)

const getRoleName = () => {
  if (authStore.isAdmin) return 'Administrator'
  if (authStore.isVendor) return 'Vendor'
  if (authStore.isClient) return 'Client'
  return 'User'
}

const toggleMenu = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const closeMenu = () => {
  isMobileOpen.value = false
}

const handleExternalToggle = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const syncBodyScroll = (open) => {
  if (window.innerWidth >= 1200) {
    document.body.style.overflow = ''
    return
  }

  document.body.style.overflow = open ? 'hidden' : ''
}

// ─── Safe Fetch ───────────────────────────────────────────
const safeFetch = async (endpoint, type) => {
  if (errorCounts.value[type] >= MAX_ERRORS) {
    console.warn(`⚠️ Sidebar: Skip ${endpoint} (too many errors)`)
    return null
  }

  try {
    const { data } = await api.get(endpoint, {
      timeout: 5000,
      params: { per_page: 50 }
    })
    errorCounts.value[type] = 0
    return data
  } catch (error) {
    errorCounts.value[type]++
    if (import.meta.env.DEV) {
      console.warn(`⚠️ Sidebar fetch error (${type}):`, {
        endpoint,
        status: error.response?.status,
        message: error.message
      })
    }
    return null
  }
}

// ─── Fetch Unread Counts ─────────────────────────────────
const fetchUnreadCounts = async () => {
  if (authStore.isAdmin) {
    let vendorData = await safeFetch('/admin/vendor-chat/unread-count', 'vendorChat')

    if (!vendorData) {
      vendorData = await safeFetch('/admin/vendor-chat/conversations', 'vendorChat')
    }

    if (vendorData) {
      if (typeof vendorData?.count === 'number') {
        vendorChatUnread.value = vendorData.count
      } else {
        const convs = vendorData?.data || vendorData || []
        if (Array.isArray(convs)) {
          vendorChatUnread.value = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        }
      }
    }
  }

  if (authStore.isVendor) {
    let adminData = await safeFetch('/vendor/admin-chat/unread-count', 'adminChat')

    if (!adminData) {
      adminData = await safeFetch('/vendor/admin-chat/conversations', 'adminChat')
    }

    if (adminData) {
      if (typeof adminData?.count === 'number') {
        adminChatUnread.value = adminData.count
      } else {
        const convs = adminData?.data || adminData || []
        if (Array.isArray(convs)) {
          adminChatUnread.value = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        }
      }
    }

    // ✅ CLIENT CHAT UNREAD (TAMBAHKAN DI SINI)
    try {
      const ticketsRes = await safeFetch('/vendor/tickets?per_page=100', 'clientChat')

      if (ticketsRes) {
        const tickets = Array.isArray(ticketsRes)
          ? ticketsRes
          : (ticketsRes.data || [])

        const activeTickets = tickets.filter(t =>
          ['in_progress', 'waiting_response', 'resolved'].includes(t.status)
        )

        const waitingCount = activeTickets.filter(t =>
          t.status === 'waiting_response'
        ).length

        clientChatUnread.value = waitingCount
      }

    } catch {
      clientChatUnread.value = 0
    }
  }
}

// ─── Polling ─────────────────────────────────────────────
let refreshInterval = null
let currentInterval = 30000

const startPolling = () => {
  if (refreshInterval) return
  fetchUnreadCounts()
  refreshInterval = setInterval(fetchUnreadCounts, currentInterval)
}

const stopPolling = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const resetErrorCounts = () => {
  errorCounts.value = {
    vendorChat: 0,
    adminChat: 0
  }
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  if (authStore.isAdmin || authStore.isVendor) {
    startPolling()
    window.addEventListener('click', resetErrorCounts)
    window.addEventListener('keydown', resetErrorCounts)
  }

  window.addEventListener('layout:toggle-sidebar', handleExternalToggle)
})

onUnmounted(() => {
  stopPolling()
  window.removeEventListener('click', resetErrorCounts)
  window.removeEventListener('keydown', resetErrorCounts)
  window.removeEventListener('layout:toggle-sidebar', handleExternalToggle)
  document.body.style.overflow = ''
})

watch(() => route.path, () => {
  closeMenu()
})

watch(isMobileOpen, (open) => {
  syncBodyScroll(open)
})
</script>


<style scoped>
/* ─── Badge ──────────────────────────────────────────────── */
.menu-badge {
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  animation: pulse 2s infinite;
}
.badge-danger { background: #dc3545; color: #fff; }
.badge-info { background: #17a2b8; color: #fff; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ─── Menu link layout (flex + badge) ─────────────────────── */
.layout-menu .menu-item .menu-link {
  display: flex !important;
  align-items: center !important;
  padding: 11px 16px !important;
  text-decoration: none !important;
  color: rgba(0, 0, 0, 0.65) !important;
  border-radius: 10px !important;
  transition: all 0.25s ease !important;
  position: relative !important;
  overflow: visible !important;
  gap: 0 !important;
}

/* ─── Reset & Base ───────────────────────────────────────── */
* { margin: 0; padding: 0; box-sizing: border-box; }

#layout-menu.layout-menu {
  background: #f5f5f5 !important;
  width: 280px !important;
  height: 100vh !important;
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  z-index: 1000 !important;
  box-shadow: 2px 0 12px rgba(0,0,0,0.08) !important;
  transition: all 0.3s ease !important;
}

#layout-menu.layout-menu::-webkit-scrollbar { width: 6px; }
#layout-menu.layout-menu::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); }
#layout-menu.layout-menu::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
#layout-menu.layout-menu::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }

/* ─── Brand ──────────────────────────────────────────────── */
.layout-menu .app-brand {
  padding: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
}
.layout-menu .app-brand-link { text-decoration: none !important; flex: 1 !important; }
.layout-menu .brand-wrapper { display: flex !important; align-items: center !important; gap: 12px !important; }
.layout-menu .brand-logo {
  width: 48px !important; height: 48px !important;
  object-fit: contain !important; border-radius: 12px !important;
  background: rgba(102,126,234,0.08) !important; padding: 6px !important;
}
.layout-menu .brand-text { font-size: 20px !important; font-weight: 700 !important; color: #2b2c40 !important; letter-spacing: -0.5px !important; }
.layout-menu .menu-toggle {
  background: none !important; border: none !important; color: #2b2c40 !important;
  font-size: 24px !important; cursor: pointer !important; padding: 8px !important;
  border-radius: 8px !important; transition: all 0.3s !important;
}
.layout-menu .menu-toggle:hover { background: rgba(0,0,0,0.05) !important; }

/* ─── User Profile ───────────────────────────────────────── */
.layout-menu .user-profile-section {
  padding: 16px !important; display: flex !important; align-items: center !important; gap: 12px !important;
  background: rgba(102,126,234,0.08) !important; margin: 16px !important; border-radius: 12px !important;
  border: 1px solid rgba(102,126,234,0.15) !important;
}
.layout-menu .avatar-image { width: 42px !important; height: 42px !important; border-radius: 50% !important; overflow: hidden !important; box-shadow: 0 4px 12px rgba(102,126,234,0.3) !important; flex-shrink: 0 !important; }
.layout-menu .avatar-image img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
.layout-menu .avatar-circle {
  width: 42px !important; height: 42px !important; border-radius: 50% !important;
  background: linear-gradient(135deg,#667eea,#764ba2) !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  color: #fff !important; font-weight: 700 !important; font-size: 15px !important;
  box-shadow: 0 4px 12px rgba(102,126,234,0.3) !important; flex-shrink: 0 !important;
}
.layout-menu .user-info { flex: 1 !important; min-width: 0 !important; }
.layout-menu .user-name { font-size: 14px !important; font-weight: 600 !important; color: #2b2c40 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
.layout-menu .user-role { font-size: 12px !important; color: rgba(0,0,0,0.55) !important; margin-top: 2px !important; }
.layout-menu .menu-divider { height: 1px !important; background: rgba(0,0,0,0.08) !important; margin: 8px 16px 16px !important; }

/* ─── Menu Items ─────────────────────────────────────────── */
.layout-menu .menu-inner { list-style: none !important; padding: 8px 16px 24px !important; margin: 0 !important; }
.layout-menu .menu-section-title { padding: 16px 12px 8px !important; margin-top: 8px !important; }
.layout-menu .menu-section-title span { font-size: 11px !important; font-weight: 600 !important; color: rgba(0,0,0,0.45) !important; text-transform: uppercase !important; letter-spacing: 0.8px !important; }

.layout-menu .menu-item { margin-bottom: 4px !important; border-radius: 10px !important; overflow: visible !important; transition: all 0.3s !important; list-style: none !important; }

.layout-menu .menu-item .menu-link::before {
  content: '' !important; position: absolute !important; left: 0 !important; top: 0 !important;
  height: 100% !important; width: 3px !important;
  background: linear-gradient(135deg,#667eea,#764ba2) !important;
  transform: scaleY(0) !important; transition: transform 0.25s !important; border-radius: 0 2px 2px 0 !important;
}
.layout-menu .menu-item .menu-link:hover { background: rgba(102,126,234,0.08) !important; color: #2b2c40 !important; }
.layout-menu .menu-item.active .menu-link { background: rgba(102,126,234,0.15) !important; color: #667eea !important; }
.layout-menu .menu-item.active .menu-link::before { transform: scaleY(1) !important; }

.layout-menu .menu-icon-wrapper {
  width: 36px !important; height: 36px !important; display: flex !important; align-items: center !important; justify-content: center !important;
  background: rgba(102,126,234,0.08) !important; border-radius: 8px !important; margin-right: 12px !important; transition: all 0.25s !important; flex-shrink: 0 !important;
}
.layout-menu .menu-item.active .menu-icon-wrapper {
  background: linear-gradient(135deg,#667eea,#764ba2) !important;
  box-shadow: 0 2px 8px rgba(102,126,234,0.25) !important;
}
.layout-menu .menu-icon-wrapper i {
  font-size: 19px !important; color: rgba(0,0,0,0.65) !important; line-height: 1 !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
}
.layout-menu .menu-item.active .menu-icon-wrapper i { color: #fff !important; }
.layout-menu .menu-text { font-size: 14px !important; font-weight: 500 !important; flex: 1 !important; }

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 1199px) {
  #layout-menu.layout-menu { transform: translateX(-100%) !important; }
  #layout-menu.layout-menu.open { transform: translateX(0) !important; }
}
@media (max-width: 768px) {
  #layout-menu.layout-menu { width: 260px !important; }
  .layout-menu .brand-logo { width: 40px !important; height: 40px !important; }
  .layout-menu .brand-text { font-size: 18px !important; }
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1199px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.32);
    backdrop-filter: blur(2px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 999;
  }

  .sidebar-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
