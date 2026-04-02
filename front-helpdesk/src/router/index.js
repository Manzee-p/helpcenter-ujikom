// router/index.js - UPDATED WITH CHAT ROUTES AND DELETION REQUESTS
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ClientFullScreenLayout from '@/layouts/ClientFullScreenLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Auth
import Login from '@/views/auth/Login.vue'

// Public Views
import Landing from '@/views/public/Landing.vue'
import PublicStatusBoard from '@/views/public/StatusBoard.vue'
import PublicStatusDetail from '@/views/public/StatusDetail.vue'

// Admin
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminTickets from '@/views/admin/Tickets.vue'
import AdminTicketDetail from '@/views/admin/TicketDetail.vue'
import AdminUsers from '@/views/admin/Users.vue'
import AdminVendors from '@/views/admin/Vendors.vue'
import AdminAnalytics from '@/views/admin/Analytics.vue'
import AdminReports from '@/views/admin/Reports.vue'
import AdminCategories from '@/views/admin/Categories.vue'
import AdminSettings from '@/views/admin/AdminSettings.vue'
import AdminVendorRatings from '@/views/admin/VendorRatings.vue'
import AdminDayChecklist from '@/views/admin/AdminDayChecklist.vue'

// Status Board Admin
import AdminStatusBoard from '@/views/admin/StatusBoard.vue'
import AdminStatusBoardDetail from '@/views/admin/StatusBoardDetail.vue'
import AdminCreateStatus from '@/views/admin/CreateStatus.vue'

// ✅ CHAT ADMIN
import AdminVendorChatPage from '@/views/admin/AdminVendorChatPage.vue'

// Vendor
import VendorDashboard from '@/views/vendor/Dashboard.vue'
import VendorTickets from '@/views/vendor/VendorTickets.vue'
import VendorTicketDetail from '@/views/vendor/VendorTicketDetail.vue'
import VendorReports from '@/views/vendor/VendorReports.vue'
import VendorHistory from '@/views/vendor/VendorHistory.vue'
import VendorSettings from '@/views/vendor/VendorSettings.vue'
import VendorClientChatPage from '@/views/vendor/VendorClientChatPage.vue'
import VendorRatings from '@/views/vendor/VendorRatings.vue'
import VendorDayChecklist from '@/views/vendor/VendorDayChecklist.vue'

// ✅ CHAT VENDOR
import VendorAdminChatPage from '@/views/vendor/VendorAdminChatPage.vue'

// Client
import ClientDashboard from '@/views/client/Dashboard.vue'
import CreateTicket from '@/views/client/CreateTicket.vue'
import ClientTickets from '@/views/client/MyTickets.vue'
import TicketHistory from '@/views/client/TicketHistory.vue'
import ClientSettings from '@/views/client/ClientSettings.vue'
import TicketDetail from '@/views/TicketDetail.vue'

const routes = [
  // ============================================
  // PUBLIC ROUTES
  // ============================================
  
  {
    path: '/',
    component: PublicLayout,
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'Landing',
        component: Landing,
        meta: { 
          public: true,
          title: 'Welcome'
        }
      }
    ]
  },
  
  {
    path: '/status',
    component: PublicLayout,
    meta: { 
      public: true,
      title: 'Status Board Publik'
    },
    children: [
      {
        path: '',
        name: 'PublicStatusBoard',
        component: PublicStatusBoard,
        meta: { 
          public: true,
          title: 'Status Layanan'
        }
      },
      {
        path: ':id',
        name: 'PublicStatusDetail',
        component: PublicStatusDetail,
        meta: { 
          public: true,
          title: 'Detail Status'
        }
      }
    ]
  },
  
  // ============================================
  // GUEST ROUTES
  // ============================================
  
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
        meta: { 
          guest: true,
          title: 'Login'
        }
      }
    ]
  },
  
  // ============================================
  // ADMIN ROUTES
  // ============================================
  
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: 'Dashboard Admin' }
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: AdminTickets,
        meta: { title: 'Kelola Tiket' }
      },
      {
        path: 'tickets/:id',
        name: 'AdminTicketDetail',
        component: AdminTicketDetail,
        meta: { title: 'Detail Tiket' }
      },
      
      // ✅ CHAT ROUTES ADMIN - CORRECTED
      {
        path: 'vendor-chat',
        name: 'AdminVendorChat',
        component: AdminVendorChatPage,
        meta: { 
          title: 'Chat Vendor',
          icon: 'bx-message-dots'
        }
      },
      
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: { title: 'Kelola Users' }
      },
      {
        path: 'vendors',
        name: 'AdminVendors',
        component: AdminVendors,
        meta: { title: 'Kelola Vendors' }
      },
      {
        path: 'vendor-ratings',
        name: 'AdminVendorRatings',
        component: AdminVendorRatings,
        meta: { title: 'Rating Vendor' }
      },
      {
        path: 'day-checklists',
        name: 'AdminDayChecklist',
        component: AdminDayChecklist,
        meta: { title: 'Checklist Hari-H' }
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: AdminAnalytics,
        meta: { title: 'Analitik' }
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: AdminReports,
        meta: { title: 'Laporan' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: AdminCategories,
        meta: { title: 'Kelola Kategori' }
      },
      {
        path: 'status-board',
        name: 'AdminStatusBoard',
        component: AdminStatusBoard,
        meta: { title: 'Kelola Papan Status' }
      },
      {
        path: 'status-board/create',
        name: 'AdminCreateStatus',
        component: AdminCreateStatus,
        meta: { title: 'Buat Status' }
      },
      {
        path: 'status-board/:id',
        name: 'AdminStatusBoardDetail',
        component: AdminStatusBoardDetail,
        meta: { title: 'Detail Status' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: AdminSettings,
        meta: { title: 'Pengaturan' }
      },
      {
        path: 'deletion-requests',
        name: 'DeletionRequests',
        component: () => import('@/views/admin/DeletionRequestsManager.vue'),
        meta: { 
          title: 'Permintaan Hapus Tiket',
          icon: 'bx-trash',
          menu: true,
          requiresAuth: true, 
          role: 'admin' 
        }
      },
    ]
  },
  
  // ============================================
  // VENDOR ROUTES
  // ============================================
  
  {
    path: '/vendor',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'vendor' },
    children: [
      {
        path: '',
        redirect: { name: 'VendorDashboard' }
      },
      {
        path: 'dashboard',
        name: 'VendorDashboard',
        component: VendorDashboard,
        meta: { title: 'Dashboard Vendor' }
      },
      {
        path: 'tickets',
        name: 'VendorTickets',
        component: VendorTickets,
        meta: { title: 'Tiket Saya' }
      },
      {
        path: 'tickets/:id',
        name: 'VendorTicketDetail',
        component: VendorTicketDetail,
        meta: { title: 'Detail Tiket' }
      },
      
      // ✅ CHAT ROUTE VENDOR - CORRECTED
      {
        path: 'admin-chat',
        name: 'VendorAdminChat',
        component: VendorAdminChatPage,
        meta: { 
          title: 'Chat Admin',
          icon: 'bx-message-dots'
        }
      },

      {
        path: 'client-chat',
        name: 'VendorClientChat',
        component: VendorClientChatPage,
        meta: {
          title: 'Chat Client',
          icon: 'bx-message-square-dots'
        }
      },
            
      {
        path: 'reports',
        name: 'VendorReports',
        component: VendorReports,
        meta: { title: 'Laporan' }
      },
      {
        path: 'history',
        name: 'VendorHistory',
        component: VendorHistory,
        meta: { title: 'Riwayat' }
      },
      {
        path: 'ratings',
        name: 'VendorRatings',
        component: VendorRatings,
        meta: { title: 'Rating Client' }
      },
      {
        path: 'day-checklists',
        name: 'VendorDayChecklist',
        component: VendorDayChecklist,
        meta: { title: 'Checklist Hari-H' }
      },
      {
        path: 'settings',
        name: 'VendorSettings',
        component: VendorSettings,
        meta: { title: 'Pengaturan' }
      }
    ]
  },
  
  // ============================================
  // CLIENT ROUTES
  // ============================================
  
  {
    path: '/client',
    component: ClientFullScreenLayout,
    meta: { requiresAuth: true, role: 'client' },
    children: [
      {
        path: '',
        redirect: { name: 'ClientDashboard' }
      },
      {
        path: 'dashboard',
        name: 'ClientDashboard',
        component: ClientDashboard,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'create-ticket',
        name: 'CreateTicket',
        component: CreateTicket,
        meta: { title: 'Buat Tiket' }
      },
      {
        path: 'tickets',
        name: 'ClientTickets',
        component: ClientTickets,
        meta: { title: 'Tiket Saya' }
      },
      {
        path: 'history',
        name: 'TicketHistory',
        component: TicketHistory,
        meta: { title: 'Riwayat Tiket' }
      },
      {
        path: 'settings',
        name: 'ClientSettings',
        component: ClientSettings,
        meta: { title: 'Pengaturan' }
      }
    ]
  },
  
  // ============================================
  // SHARED ROUTES
  // ============================================
  
  {
    path: '/tickets/:id',
    component: ClientFullScreenLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'TicketDetail',
        component: TicketDetail,
        meta: { title: 'Detail Tiket' }
      }
    ]
  },
  
  // ============================================
  // CATCH ALL
  // ============================================
  
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

let isNavigating = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (isNavigating) {
    return next(false)
  }

  try {
    isNavigating = true

    if (!authStore.isInitialized) {
      await authStore.initializeAuth()
    }

    // PUBLIC ROUTES
    if (to.meta.public) {
      return next()
    }

    // GUEST ROUTES
    if (to.meta.guest) {
      if (authStore.isValidAuth()) {
        if (authStore.isAdmin) return next('/admin/dashboard')
        if (authStore.isVendor) return next('/vendor/dashboard')
        if (authStore.isClient) return next('/client/dashboard')
      }
      return next()
    }

    // NO AUTH REQUIRED
    if (!to.meta.requiresAuth) {
      return next()
    }

    // PROTECTED ROUTES
    if (to.meta.requiresAuth) {
      if (!authStore.isValidAuth()) {
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }

      // Role check
      if (to.meta.role && authStore.userRole !== to.meta.role) {
        if (authStore.isAdmin) return next('/admin/dashboard')
        if (authStore.isVendor) return next('/vendor/dashboard')
        if (authStore.isClient) return next('/client/dashboard')
        return next('/login')
      }

      return next()
    }

    next()
  } catch (error) {
    console.error('Navigation error:', error)
    next('/login')
  } finally {
    isNavigating = false
  }
})

router.afterEach((to) => {
  const baseTitle = 'HelpCenter System'
  document.title = to.meta.title ? `${to.meta.title} - ${baseTitle}` : baseTitle
})

export default router
