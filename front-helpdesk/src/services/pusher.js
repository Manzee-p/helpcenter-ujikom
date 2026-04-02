import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
Pusher.logToConsole = false

export function initEcho() {
  const token = localStorage.getItem('token')
  const key = import.meta.env.VITE_PUSHER_APP_KEY

  if (!token || !key) {
    window.Echo = null
    return null
  }

  if (window.Echo) {
    window.Echo.disconnect()
  }

  window.Echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST || undefined,
    wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 80),
    wssPort: Number(import.meta.env.VITE_PUSHER_PORT || 443),
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  window.Echo.connector.pusher.connection.bind('disconnected', () => {
    import('@/services/api').then(({ default: api }) => {
      delete api.defaults.headers.common['X-Socket-ID']
    })

    if (import.meta.env.DEV) {
      console.log('Echo disconnected')
    }
  })

  if (import.meta.env.DEV) {
    console.log('Echo initialized:', !!window.Echo)
  }

  return window.Echo
}

export function disconnectEcho() {
  if (window.Echo) {
    import('@/services/api').then(({ default: api }) => {
      delete api.defaults.headers.common['X-Socket-ID']
    })

    window.Echo.disconnect()
    window.Echo = null

    if (import.meta.env.DEV) {
      console.log('Echo disconnected')
    }
  }
}
