import { defineStore } from 'pinia'
import api from '@/services/api'

export const useStatusBoardStore = defineStore('statusBoard', {
  state: () => ({
    statuses: [],
    currentStatus: null,
    statistics: null, // ✅ ADDED: Statistics state
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    hasStatuses: (state) => state.statuses.length > 0,
    totalPages: (state) => state.pagination.last_page,
    activeStatuses: (state) => state.statuses.filter(s => 
      ['investigating', 'identified', 'monitoring'].includes(s.status)
    ),
    resolvedStatuses: (state) => state.statuses.filter(s => s.status === 'resolved')
  },

  actions: {
    // ✅ Public: Fetch status board
    async fetchPublicStatuses(filters = {}) {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          status: filters.status || '',
          category: filters.category || '',
          search: filters.search || '',
          page: filters.page || 1,
          per_page: 15
        }

        console.log('📤 Fetching public statuses:', params)
        const response = await api.get('/status-board', { params })
        
        if (response.data.success) {
          this.statuses = response.data.data || []
          const pag = response.data.pagination || {}
          this.pagination = {
            current_page: pag.current_page || 1,
            last_page: pag.last_page || 1,
            per_page: pag.per_page || 15,
            total: pag.total || 0
          }
          return response.data
        } else {
          throw new Error(response.data.message || 'Failed to load statuses')
        }
      } catch (error) {
        console.error('❌ Fetch public statuses error:', error)
        this.error = error.response?.data?.message || 'Gagal memuat papan informasi'
        this.statuses = []
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ Admin: Fetch all statuses
    async fetchAdminStatuses(filters = {}) {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          status: filters.status || '',
          category: filters.category || '',
          severity: filters.severity || '',
          search: filters.search || '',
          page: filters.page || 1,
          per_page: 15
        }

        console.log('📤 Fetching admin statuses:', params)
        const response = await api.get('/admin/status-board', { params })
        
        if (response.data.success) {
          this.statuses = response.data.data || []
          const pag = response.data.pagination || {}
          this.pagination = {
            current_page: pag.current_page || 1,
            last_page: pag.last_page || 1,
            per_page: pag.per_page || 15,
            total: pag.total || 0
          }
          return response.data
        } else {
          throw new Error(response.data.message || 'Failed to load statuses')
        }
      } catch (error) {
        console.error('❌ Fetch admin statuses error:', error)
        this.error = error.response?.data?.message || 'Gagal memuat data'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ PUBLIC: Fetch status detail (untuk client/public)
    async fetchPublicStatusDetail(id) {
      this.loading = true
      this.error = null
      
      try {
        const numericId = parseInt(id, 10)
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid status ID')
        }

        console.log('🔍 [PUBLIC] Fetching status detail for ID:', numericId)
        
        const response = await api.get(`/status-board/${numericId}`)
        
        if (response.data.success) {
          this.currentStatus = response.data.data
          console.log('✅ [PUBLIC] Status detail loaded')
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Failed to load detail')
        }
      } catch (error) {
        console.error('❌ [PUBLIC] Fetch detail error:', error)
        this.error = error.response?.data?.message || 'Gagal memuat detail'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ ADMIN: Fetch status detail (untuk admin)
    async fetchAdminStatusDetail(id) {
      this.loading = true
      this.error = null
      
      try {
        const numericId = parseInt(id, 10)
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid status ID')
        }

        console.log('🔍 [ADMIN] Fetching status detail for ID:', numericId)
        
        const response = await api.get(`/admin/status-board/${numericId}`)
        
        if (response.data.success) {
          this.currentStatus = response.data.data
          console.log('✅ [ADMIN] Status detail loaded')
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Failed to load detail')
        }
      } catch (error) {
        console.error('❌ [ADMIN] Fetch detail error:', error)
        this.error = error.response?.data?.message || 'Gagal memuat detail'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ Admin: Create status
    async createStatus(formData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/admin/status-board', formData)
        
        if (response.data.data) {
          this.statuses.unshift(response.data.data)
          this.pagination.total += 1
        }
        
        return response.data
      } catch (error) {
        console.error('❌ Create status error:', error)
        this.error = error.response?.data?.message || 'Gagal membuat status'
        if (error.response?.data?.errors) {
          throw error.response.data.errors
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ Admin: Update status
    async updateStatus(id, formData) {
      this.loading = true
      this.error = null
      
      try {
        const numericId = parseInt(id, 10)
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid status ID')
        }

        const response = await api.put(`/admin/status-board/${numericId}`, formData)
        
        const index = this.statuses.findIndex(s => s.id === numericId)
        if (index !== -1 && response.data.data) {
          this.statuses[index] = response.data.data
        }
        
        if (this.currentStatus?.id === numericId) {
          this.currentStatus = response.data.data
        }
        
        return response.data
      } catch (error) {
        console.error('❌ Update status error:', error)
        this.error = error.response?.data?.message || 'Gagal update status'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ Admin: Add update/comment
    async addUpdate(id, updateData) {
      try {
        const numericId = parseInt(id, 10)
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid status ID')
        }

        const response = await api.post(`/admin/status-board/${numericId}/updates`, updateData)
        
        if (this.currentStatus?.id === numericId) {
          await this.fetchAdminStatusDetail(numericId)
        }
        
        return response.data
      } catch (error) {
        console.error('❌ Add update error:', error)
        this.error = error.response?.data?.message || 'Gagal menambahkan update'
        throw error
      }
    },

    // ✅ Admin: Delete status
    async deleteStatus(id) {
      this.loading = true
      this.error = null
      
      try {
        const numericId = parseInt(id, 10)
        if (isNaN(numericId) || numericId <= 0) {
          throw new Error('Invalid status ID')
        }

        await api.delete(`/admin/status-board/${numericId}`)
        
        this.statuses = this.statuses.filter(s => s.id !== numericId)
        if (this.pagination.total > 0) {
          this.pagination.total--
        }
      } catch (error) {
        console.error('❌ Delete status error:', error)
        this.error = error.response?.data?.message || 'Gagal menghapus status'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ FIXED: Fetch statistics with proper error handling
    async fetchStatistics() {
      this.loading = true
      this.error = null
      
      try {
        console.log('📊 [Store] Fetching statistics...')
        
        const response = await api.get('/admin/status-board/statistics', {
          timeout: 10000
        })
        
        console.log('📦 [Store] Raw response:', response.data)
        
        // ✅ Handle both response formats
        let statsData = null
        
        if (response.data.success && response.data.data) {
          // Format: { success: true, data: { ... } }
          statsData = response.data.data
        } else if (response.data.total_incidents !== undefined) {
          // Format: { total_incidents: 0, ... }
          statsData = response.data
        }
        
        if (statsData) {
          this.statistics = {
            total_incidents: statsData.total_incidents || 0,
            active_incidents: statsData.active_incidents || 0,
            resolved_incidents: statsData.resolved_incidents || 0,
            critical_incidents: statsData.critical_incidents || 0
          }
          
          console.log('✅ [Store] Statistics loaded:', this.statistics)
          return this.statistics
        } else {
          throw new Error('Invalid statistics format')
        }
        
      } catch (error) {
        console.error('❌ [Store] Fetch statistics error:', error)
        
        // ✅ Set default statistics on error
        this.statistics = {
          total_incidents: 0,
          active_incidents: 0,
          resolved_incidents: 0,
          critical_incidents: 0
        }
        
        this.error = error.response?.data?.message || 'Gagal memuat statistik'
        
        // Return default stats instead of throwing
        return this.statistics
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    resetState() {
      this.statuses = []
      this.currentStatus = null
      this.statistics = null
      this.pagination = {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      }
      this.loading = false
      this.error = null
      console.log('🔄 Status board store reset')
    }
  }
})