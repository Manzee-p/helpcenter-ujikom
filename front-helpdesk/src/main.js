import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import { useAuthStore } from './stores/auth'
import { clickOutside } from './directives/clickOutside'

import './assets/sneat/vendor/css/core.css'
import './assets/sneat/vendor/css/theme-default.css'
import './assets/sneat/css/demo.css'
import './assets/sneat/vendor/fonts/boxicons.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap
window.Echo = null

const pinia = createPinia()
const app = createApp(App)

app.directive('click-outside', clickOutside)
app.use(pinia)
app.use(router)
app.mount('#app')

router.isReady().then(() => {
  const authStore = useAuthStore()
  authStore.initializeAuth()

  if (authStore.token && authStore.user) {
    setTimeout(() => {
      authStore.validateTokenInBackground().catch(err => {
        console.warn('Token validation failed:', err.message)
      })
    }, 500)
  }

  if (import.meta.env.DEV) {
    console.log('App initialized')
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
    console.log('Pinia stores:', pinia._s.size, 'registered')
    console.log('Auth token:', authStore.token ? 'Present' : 'Missing')
    console.log('Current user:', authStore.user?.name || 'Guest (Public Access)')
    console.log('User role:', authStore.userRole || 'none (public)')
    console.log('Router ready with', router.getRoutes().length, 'routes')
    console.log('Public routes enabled: /status (no login required)')
  }
})

app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

if (import.meta.env.DEV) {
  app.config.performance = true
}
