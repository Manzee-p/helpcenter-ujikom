import { defineStore } from 'pinia'
import api from '@/services/api'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    tickets: [],
    currentTicket: null,
    categories: [],
    loading: false,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    },
    stats: {
      user_created_count: 0,
      admin_created_count: 0,
      assigned_count: 0
    }
  }),

  getters: {
    getTicketById: (state) => (id) => {
      return state.tickets.find(ticket => ticket.id === id)
    },
    
    ticketsByStatus: (state) => (status) => {
      return state.tickets.filter(ticket => ticket.status === status)
    }
  },

  actions: {
    async fetchTickets(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/tickets', { params })
        
        // ✅ Set tickets
        this.tickets = response.data.data || []
        
        // ✅ Set pagination
        this.pagination = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0
        }
        
        // ✅ Set stats
        this.stats = {
          user_created_count: response.data.stats?.user_created_count || 0,
          admin_created_count: response.data.stats?.admin_created_count || 0,
          assigned_count: response.data.stats?.assigned_count || 0
        }
        
        return response.data
      } catch (error) {
        console.error('Fetch tickets error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTicketDetail(id) {
      this.loading = true
      try {
        const response = await api.get(`/tickets/${id}`)
        this.currentTicket = response.data
        return response.data
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTicket(ticketData) {
      this.loading = true
      try {
        const formData = new FormData()
        
        Object.keys(ticketData).forEach(key => {
          if (key === 'attachments' && ticketData[key]) {
            ticketData[key].forEach(file => {
              formData.append('attachments[]', file)
            })
          } else if (ticketData[key]) {
            formData.append(key, ticketData[key])
          }
        })

        const response = await api.post('/tickets', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        return response.data
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTicket(id, data) {
      this.loading = true
      try {
        const response = await api.put(`/tickets/${id}`, data)
        
        // ✅ Update ticket in list if exists
        const index = this.tickets.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tickets[index] = response.data.ticket
        }
        
        // ✅ Update current ticket if viewing detail
        if (this.currentTicket?.id === id) {
          this.currentTicket = response.data.ticket
        }
        
        return response.data
      } catch (error) {
        console.error('Update ticket error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTicket(id) {
      this.loading = true
      try {
        await api.delete(`/tickets/${id}`)
        
        // Remove from list
        this.tickets = this.tickets.filter(t => t.id !== id)
        
        // Update pagination count
        if (this.pagination.total > 0) {
          this.pagination.total--
        }
        
        // Update stats if needed
        const deletedTicket = this.tickets.find(t => t.id === id)
        if (deletedTicket) {
          if (deletedTicket.created_by_admin) {
            this.stats.admin_created_count = Math.max(0, this.stats.admin_created_count - 1)
          } else {
            this.stats.user_created_count = Math.max(0, this.stats.user_created_count - 1)
          }
          if (deletedTicket.assigned_to) {
            this.stats.assigned_count = Math.max(0, this.stats.assigned_count - 1)
          }
        }
        
      } catch (error) {
        console.error('Delete ticket error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async addComment(ticketId, comment) {
      try {
        const response = await api.post(`/tickets/${ticketId}/comments`, comment)
        return response.data
      } catch (error) {
        throw error
      }
    },

    async fetchComments(ticketId) {
      try {
        const response = await api.get(`/tickets/${ticketId}/comments`)
        return response.data
      } catch (error) {
        throw error
      }
    }
  }
})