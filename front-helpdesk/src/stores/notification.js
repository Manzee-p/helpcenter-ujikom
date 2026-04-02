// stores/notification.js - FIXED VERSION

import { defineStore } from 'pinia'
import api from '@/services/api'
import Swal from 'sweetalert2'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastFetch: null,
    cacheTimeout: 60000, // 1 minute cache
    hasMore: false,
    currentPage: 1,
    perPage: 20,
    fetchRetries: 0, // ✅ ADDED: Track retry attempts
    maxRetries: 2 // ✅ ADDED: Max retry attempts
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read_at)
    },
    
    readNotifications: (state) => {
      return state.notifications.filter(n => n.read_at)
    },

    getNotificationsByType: (state) => (type) => {
      return state.notifications.filter(n => n.type === type)
    },

    isCacheValid: (state) => {
      if (!state.lastFetch) return false
      const timeSinceLastFetch = Date.now() - state.lastFetch
      return timeSinceLastFetch < state.cacheTimeout
    }
  },

  actions: {
    /**
     * ✅ FIXED: Fetch notifications with better error handling
     */
    async fetchNotifications(params = {}, forceRefresh = false) {
      // Check cache if not forcing refresh
      if (!forceRefresh && this.isCacheValid && this.notifications.length > 0) {
        console.log('ℹ️ Using cached notifications')
        return this.notifications
      }

      try {
        this.loading = true
        this.error = null
        
        const response = await api.get('/notifications', { params })
        
        // Better response handling with type checking
        const data = response.data?.data || response.data || []
        this.notifications = Array.isArray(data) ? data : []
        
        // Handle pagination
        this.hasMore = response.data?.hasMore || false
        this.currentPage = response.data?.currentPage || 1
        
        // Update cache timestamp
        this.lastFetch = Date.now()
        
        // Update unread count
        this.updateUnreadCount()
        
        // ✅ FIXED: Reset retry counter on success
        this.fetchRetries = 0
        
        return this.notifications
      } catch (error) {
        // ✅ FIXED: Handle timeout gracefully
        if (error.isTimeout) {
          console.warn('⏱️ Fetch notifications timeout')
          this.error = 'Connection timeout. Using cached data.'
          
          // Don't clear notifications on timeout
          if (this.notifications.length > 0) {
            return this.notifications
          }
        } else {
          this.error = error.response?.data?.message || 'Gagal memuat notifikasi'
          console.error('❌ Fetch notifications error:', error)
        }
        
        // ✅ FIXED: Don't show error toast on first timeout
        if (!error.isTimeout || this.fetchRetries >= this.maxRetries) {
          this.showErrorToast(this.error)
          this.notifications = []
          this.unreadCount = 0
        }
        
        this.fetchRetries++
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Load more notifications (pagination)
     */
    async loadMore() {
      if (!this.hasMore || this.loading) return

      try {
        this.loading = true
        const nextPage = this.currentPage + 1
        
        const response = await api.get('/notifications', {
          params: { page: nextPage, perPage: this.perPage }
        })
        
        const data = response.data?.data || []
        if (Array.isArray(data)) {
          this.notifications.push(...data)
          this.hasMore = response.data?.hasMore || false
          this.currentPage = nextPage
        }
      } catch (error) {
        console.error('❌ Load more notifications error:', error)
        
        // ✅ FIXED: Don't show toast on timeout
        if (!error.isTimeout) {
          this.showErrorToast('Gagal memuat notifikasi tambahan')
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * ✅ FIXED: Fetch unread count with timeout handling
     */
    async fetchUnreadCount() {
      try {
        const response = await api.get('/notifications/unread-count')
        this.unreadCount = response.data?.count || 0
        return this.unreadCount
      } catch (error) {
        // ✅ FIXED: Fail silently on timeout
        if (error.isTimeout) {
          console.warn('⏱️ Unread count fetch timeout')
        } else {
          console.error('❌ Failed to fetch unread count:', error)
        }
        
        // Keep current count on error
        return this.unreadCount
      }
    },

    /**
     * Update local unread count
     */
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read_at).length
    },

    /**
     * Mark single notification as read
     */
    async markAsRead(notificationId) {
      try {
        const response = await api.post(`/notifications/${notificationId}/read`)
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.read_at) {
          notification.read_at = response.data?.notification?.read_at || new Date().toISOString()
          this.updateUnreadCount()
        }
        
        return response.data
      } catch (error) {
        console.error('❌ Failed to mark as read:', error)
        
        // ✅ FIXED: Don't show toast on timeout
        if (!error.isTimeout) {
          this.showErrorToast('Gagal menandai notifikasi sebagai dibaca')
        }
        throw error
      }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
      try {
        const response = await api.post('/notifications/mark-all-read')
        
        // Update local state
        const now = new Date().toISOString()
        this.notifications.forEach(n => {
          if (!n.read_at) {
            n.read_at = now
          }
        })
        this.updateUnreadCount()
        
        this.showSuccessToast('Semua notifikasi ditandai sebagai dibaca')
        
        return response.data
      } catch (error) {
        console.error('❌ Failed to mark all as read:', error)
        
        // ✅ FIXED: Don't show toast on timeout
        if (!error.isTimeout) {
          this.showErrorToast('Gagal menandai semua notifikasi sebagai dibaca')
        }
        throw error
      }
    },

    /**
     * Delete notification
     */
    async deleteNotification(notificationId) {
      try {
        await api.delete(`/notifications/${notificationId}`)
        
        // Remove from local state
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index > -1) {
          this.notifications.splice(index, 1)
          this.updateUnreadCount()
        }

        this.showSuccessToast('Notifikasi berhasil dihapus')
      } catch (error) {
        console.error('❌ Failed to delete notification:', error)
        
        // ✅ FIXED: Don't show toast on timeout
        if (!error.isTimeout) {
          this.showErrorToast('Gagal menghapus notifikasi')
        }
        throw error
      }
    },

    /**
     * Add notification to local state (for real-time updates)
     */
    addNotification(notification) {
      // Check if notification already exists
      const exists = this.notifications.find(n => n.id === notification.id)
      if (!exists) {
        this.notifications.unshift(notification)
        this.updateUnreadCount()
        
        // Show toast for new notification
        this.showNewNotificationToast(notification)
      }
    },

    /**
     * ✅ FIXED: Auto-refresh with better error handling
     */
    startAutoRefresh(interval = 30000) {
      // Initial fetch - but don't block on error
      this.fetchNotifications().catch(err => {
        console.warn('⚠️ Initial notification fetch failed:', err.message)
      })
      
      // Set up interval for fetching unread count only (lighter)
      const refreshInterval = setInterval(() => {
        this.fetchUnreadCount().catch(err => {
          console.warn('⚠️ Auto-refresh failed:', err.message)
        })
      }, interval)
      
      // Return function to stop auto-refresh
      return () => clearInterval(refreshInterval)
    },

    /**
     * Clear all data (useful for logout)
     */
    clearNotifications() {
      this.notifications = []
      this.unreadCount = 0
      this.loading = false
      this.error = null
      this.lastFetch = null
      this.hasMore = false
      this.currentPage = 1
      this.fetchRetries = 0
    },

    /**
     * Invalidate cache (force next fetch to hit API)
     */
    invalidateCache() {
      this.lastFetch = null
    },

    // Toast Helper Methods
    showSuccessToast(message) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },

    showErrorToast(message) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      })
    },

    showNewNotificationToast(notification) {
      // Only show toast if notification is important
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: notification.title || 'Notifikasi Baru',
          text: notification.message,
          showConfirmButton: true,
          confirmButtonText: 'Lihat',
          timer: 5000,
          timerProgressBar: true
        }).then((result) => {
          if (result.isConfirmed && notification.url) {
            window.location.href = notification.url
          }
        })
      }
    }
  }
})