// stores/auth.js

import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'
import { disconnectEcho } from '@/services/pusher'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isVendor: (state) => state.user?.role === 'vendor',
    isClient: (state) => state.user?.role === 'client',
    userName: (state) => state.user?.name || 'User',
    userRole: (state) => state.user?.role || '',
    userEmail: (state) => state.user?.email || '',

    userAvatar: (state) => {
      if (!state.user) return null

      if (state.user.avatar_url) {
        let url = state.user.avatar_url
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        if (url.includes('http://localhost/') && !url.includes(':8000')) {
          url = url.replace('http://localhost/', 'http://localhost:8000/')
        }
        return url
      }

      if (state.user.avatar) {
        const avatar = state.user.avatar
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar
        if (cleanPath.startsWith('storage/')) return `${baseURL}/${cleanPath}`
        return `${baseURL}/storage/${cleanPath}`
      }

      return null
    },

    userInitials: (state) => {
      if (!state.user?.name) return 'U'
      const names = state.user.name.split(' ')
      if (names.length > 1) return names[0][0].toUpperCase() + names[1][0].toUpperCase()
      return names[0][0].toUpperCase() + (names[0][1] || '').toUpperCase()
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        console.log('🔐 Attempting login...')
        const response = await api.post('/login', credentials)

        if (response.data.success && response.data.data) {
          this.token = response.data.data.token
          this.user  = response.data.data.user
        } else if (response.data.access_token) {
          this.token = response.data.access_token
          this.user  = response.data.user
        } else if (response.data.token) {
          this.token = response.data.token
          this.user  = response.data.user
        } else {
          throw new Error('Invalid response format')
        }

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.isInitialized = true

        // ✅ Init Pusher Echo setelah login

        console.log('✅ Login successful')
        console.log('👤 User:', this.user.name, '- Role:', this.user.role)

        if (this.isAdmin)        await router.push('/admin/dashboard')
        else if (this.isVendor)  await router.push('/vendor/dashboard')
        else if (this.isClient)  await router.push('/client/dashboard')
        else                     await router.push('/')

        return response.data
      } catch (error) {
        console.error('❌ Login error:', error)
        this.clearAuth()
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle(googleCredential) {
      this.loading = true
      try {
        console.log('🔐 Attempting Google login...')
        const response = await api.post('/auth/google', { credential: googleCredential })
        console.log('📥 Backend response:', response.data)

        if (response.data.success && response.data.data) {
          this.token = response.data.data.token
          this.user  = response.data.data.user
        } else if (response.data.access_token) {
          this.token = response.data.access_token
          this.user  = response.data.user
        } else if (response.data.token) {
          this.token = response.data.token
          this.user  = response.data.user
        } else {
          throw new Error('Invalid response format')
        }

        console.log('🖼️ User avatar_url:', this.user.avatar_url)
        console.log('🖼️ User avatar:', this.user.avatar)

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.isInitialized = true

        // ✅ Init Pusher Echo setelah Google login

        console.log('✅ Google login successful')
        console.log('👤 User:', this.user.name, '- Role:', this.user.role)

        if (this.isAdmin)        await router.push('/admin/dashboard')
        else if (this.isVendor)  await router.push('/vendor/dashboard')
        else if (this.isClient)  await router.push('/client/dashboard')
        else                     await router.push('/')

        return response.data
      } catch (error) {
        console.error('❌ Google login error:', error)
        console.error('Error details:', error.response?.data)
        this.clearAuth()
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        console.log('👋 Logging out...')
        if (this.token) {
          try { await api.post('/logout') }
          catch (error) { console.warn('⚠️ Logout API failed:', error.message) }
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // ✅ Disconnect Echo saat logout
        disconnectEcho()
        this.clearAuth()
        await router.push('/login')
      }
    },

    clearAuth() {
      this.user          = null
      this.token         = null
      this.isInitialized = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      console.log('🧹 Auth cleared')
    },

    initializeAuth() {
      if (this.isInitialized) {
        console.log('ℹ️ Already initialized')
        return
      }

      const token   = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          this.token = token
          this.user  = JSON.parse(userStr)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          console.log('🚀 Auth initialized from localStorage')
          console.log('👤 User:', this.user?.name, '- Role:', this.user?.role)

          this.isInitialized = true

          // ✅ Init Pusher Echo saat restore session dari localStorage
        } catch (error) {
          console.error('❌ Error parsing auth data:', error)
          this.clearAuth()
        }
      } else {
        console.log('ℹ️ No saved auth data')
        this.isInitialized = true
      }
    },

    updateUser(userData) {
      console.log('🔄 updateUser called with:', userData)
      if (!userData) { console.warn('⚠️ No user data provided to updateUser'); return }

      const newUser = {
        id: userData.id ?? this.user?.id,
        name: userData.name ?? this.user?.name,
        email: userData.email ?? this.user?.email,
        role: userData.role ?? this.user?.role,
        phone: userData.phone ?? this.user?.phone ?? null,
        emergency_contact: userData.emergency_contact ?? this.user?.emergency_contact ?? null,
        emergency_contact_name: userData.emergency_contact_name ?? this.user?.emergency_contact_name ?? null,
        emergency_contact_relation: userData.emergency_contact_relation ?? this.user?.emergency_contact_relation ?? null,
        address: userData.address ?? this.user?.address ?? null,
        city: userData.city ?? this.user?.city ?? null,
        province: userData.province ?? this.user?.province ?? null,
        postal_code: userData.postal_code ?? this.user?.postal_code ?? null,
        gender: userData.gender ?? this.user?.gender ?? null,
        birth_date: userData.birth_date ?? this.user?.birth_date ?? null,
        nik: userData.nik ?? this.user?.nik ?? null,
        bio: userData.bio ?? this.user?.bio ?? null,
        avatar: userData.avatar ?? this.user?.avatar ?? null,
        avatar_url: userData.avatar_url ?? this.user?.avatar_url ?? null,
        is_active: userData.is_active ?? this.user?.is_active ?? true,
        google_id: userData.google_id ?? this.user?.google_id ?? null,
        created_at: userData.created_at ?? this.user?.created_at,
        updated_at: userData.updated_at ?? this.user?.updated_at ?? new Date().toISOString(),
        position: userData.position ?? this.user?.position ?? null,
        company: userData.company ?? this.user?.company ?? null,
        department: userData.department ?? this.user?.department ?? null,
      }

      this.user = newUser
      localStorage.setItem('user', JSON.stringify(newUser))
      console.log('✅ User updated successfully')
    },

    async fetchUser() {
      if (!this.token) { console.log('⚠️ No token, skipping fetch'); return null }

      try {
        console.log('📡 Fetching user data from server...')
        const response = await api.get('/me')

        let userData = null
        if (response.data.success && response.data.data) {
          userData = response.data.data.user || response.data.data
        } else if (response.data.id) {
          userData = response.data
        } else {
          throw new Error('Invalid user response')
        }

        this.updateUser(userData)
        console.log('✅ User data fetched and updated')
        return this.user
      } catch (error) {
        console.error('❌ Fetch user error:', error.message)
        if (error.isTimeout) { console.warn('⏱️ Fetch user timeout - keeping current session'); return this.user }
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔐 Unauthorized - clearing auth')
          this.clearAuth()
          if (router.currentRoute.value.path !== '/login') await router.push('/login')
        }
        throw error
      }
    },

    async refreshUser() {
      console.log('🔄 refreshUser() - Fetching latest data from server...')
      try {
        const user = await this.fetchUser()
        console.log('✅ User refreshed successfully')
        return user
      } catch (error) {
        console.error('❌ Failed to refresh user:', error)
        if (error.isTimeout) return this.user
        throw error
      }
    },

    async validateTokenInBackground() {
      if (!this.token) return
      try {
        console.log('🔍 Validating token in background...')
        await this.fetchUser()
        console.log('✅ Token valid')
      } catch (error) {
        if (error.isTimeout) { console.warn('⏱️ Token validation timeout - keeping session'); return }
        console.warn('⚠️ Token validation failed:', error.message)
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🧹 Clearing invalid token')
          disconnectEcho() // ✅ Disconnect Echo jika token invalid
          this.clearAuth()
          if (router.currentRoute.value.path !== '/login') await router.push('/login')
        }
      }
    },

    isValidAuth() {
      return !!this.token && !!this.user
    }
  }
})
