<template>
  <div class="card">
    <div class="card-body">
      <!-- Logo -->
      <div class="app-brand justify-content-center mb-4">
        <a href="#" class="app-brand-link gap-2">
          <span class="app-brand-logo demo">
            <i class="bx bx-help-circle" style="font-size: 48px; color: #696cff;"></i>
          </span>
        </a>
      </div>
      
      <h4 class="mb-2 text-center">Welcome to HelpCenter! 👋</h4>
      <p class="mb-4 text-center">Please sign-in to your account</p>

      <!-- Alert Error -->
      <div v-if="generalError" class="alert alert-danger alert-dismissible" role="alert">
        <i class="bx bx-error-circle me-2"></i>
        {{ generalError }}
        <button type="button" class="btn-close" @click="generalError = ''"></button>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="form.email"
            placeholder="Enter your email"
            :class="{ 'is-invalid': errors.email }"
            required
            autocomplete="email"
          />
          <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
        </div>
        
        <div class="mb-3 form-password-toggle">
          <label class="form-label" for="password">Password</label>
          <div class="input-group input-group-merge">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control"
              v-model="form.password"
              placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
              :class="{ 'is-invalid': errors.password }"
              required
              autocomplete="current-password"
            />
            <span class="input-group-text cursor-pointer" @click="togglePassword">
              <i :class="showPassword ? 'bx bx-show' : 'bx bx-hide'"></i>
            </span>
          </div>
          <div class="invalid-feedback d-block" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <div class="mb-3">
          <button class="btn btn-primary d-grid w-100" type="submit" :disabled="authStore.loading">
            <span v-if="!authStore.loading">Sign in</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Signing in...
            </span>
          </button>
        </div>
      </form>

      <!-- Demo Credentials -->
      <div class="divider my-4">
        <div class="divider-text">Demo Credentials</div>
      </div>
      
      <div class="alert alert-info mb-0">
        <div class="d-flex align-items-center mb-2">
          <i class="bx bx-info-circle me-2"></i>
          <strong>Use these credentials to test:</strong>
        </div>
        <div class="demo-credentials">
          <div class="credential-item" @click="fillCredentials('admin')">
            <i class="bx bx-user-circle"></i>
            <div>
              <strong>Admin:</strong> admin@helpdesk.com
              <span class="badge bg-label-primary ms-2">Click to fill</span>
            </div>
          </div>
          <div class="credential-item" @click="fillCredentials('vendor')">
            <i class="bx bx-wrench"></i>
            <div>
              <strong>Vendor:</strong> vendor.sound@helpdesk.com
              <span class="badge bg-label-info ms-2">Click to fill</span>
            </div>
          </div>
          <div class="credential-item" @click="fillCredentials('client')">
            <i class="bx bx-user"></i>
            <div>
              <strong>Client:</strong> rina@company.com
              <span class="badge bg-label-success ms-2">Click to fill</span>
            </div>
          </div>
        </div>
        <small class="text-muted d-block mt-2">
          <i class="bx bx-lock-alt"></i> Default password: <strong>password</strong>
        </small>
      </div>

      <!-- Google Login -->
      <div class="divider my-4">
        <div class="divider-text">or continue with</div>
      </div>

      <div class="mb-0">
        <!-- ✅ FIXED: Proper callback name -->
        <div id="g_id_onload"
             :data-client_id="googleClientId"
             data-context="signin"
             data-ux_mode="popup"
             data-callback="onGoogleSignIn"
             data-auto_prompt="false">
        </div>
        
        <div class="g_id_signin"
             data-type="standard"
             data-shape="rectangular"
             data-theme="outline"
             data-text="signin_with"
             data-size="large"
             data-logo_alignment="left"
             data-width="360">
        </div>
      </div>
    </div>
  </div>
</template> 

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const errors = ref({})
const generalError = ref('')
const showPassword = ref(false)

// ✅ Get Google Client ID from environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const fillCredentials = (role) => {
  const credentials = {
    admin: { email: 'admin@helpdesk.com', password: 'password' },
    vendor: { email: 'vendor.sound@helpdesk.com', password: 'password' },
    client: { email: 'rina@company.com', password: 'password' }
  }
  
  if (credentials[role]) {
    form.value.email = credentials[role].email
    form.value.password = credentials[role].password
    
    Swal.fire({
      icon: 'info',
      title: 'Credentials Filled',
      text: `${role.charAt(0).toUpperCase() + role.slice(1)} credentials filled. Click Sign in to continue.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  }
}

const handleLogin = async () => {
  errors.value = {}
  generalError.value = ''
  
  try {
    await authStore.login(form.value)
    
    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: `Welcome back, ${authStore.userName}!`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.status === 401) {
      generalError.value = 'Invalid email or password. Please try again.'
    } else {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
        confirmButtonColor: '#696cff'
      })
    }
  }
}

// ✅ FIXED: Proper Google callback function
const onGoogleSignIn = async (response) => {
  console.log('🔐 Google Sign-In callback triggered')
  console.log('📥 Received credential:', response.credential ? 'Yes' : 'No')
  
  try {
    // Call loginWithGoogle from auth store
    await authStore.loginWithGoogle(response.credential)
    
    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: `Welcome, ${authStore.userName}!`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (error) {
    console.error('❌ Google login error:', error)
    
    const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.'
    
    Swal.fire({
      icon: 'error',
      title: 'Google Login Failed',
      text: errorMessage,
      confirmButtonColor: '#696cff'
    })
  }
}

// ✅ Load Google Sign-In script and setup callback
onMounted(() => {
  console.log('🔧 Setting up Google Sign-In...')
  console.log('📍 Client ID:', googleClientId)
  
  // ✅ CRITICAL: Make callback available globally with exact name used in data-callback
  window.onGoogleSignIn = onGoogleSignIn
  
  // Load Google Sign-In script
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    console.log('✅ Google Sign-In script loaded')
  }
  script.onerror = () => {
    console.error('❌ Failed to load Google Sign-In script')
  }
  document.head.appendChild(script)
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.demo-credentials {
  margin-top: 0.75rem;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.credential-item:hover {
  background-color: rgba(105, 108, 255, 0.1);
}

.credential-item i {
  font-size: 1.5rem;
  color: #696cff;
}

.credential-item div {
  flex: 1;
  font-size: 0.875rem;
}

.credential-item .badge {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #d9dee3;
}

.divider-text {
  padding: 0 1rem;
  color: #697a8d;
  font-size: 0.8125rem;
}

/* Google button styling */
.g_id_signin {
  width: 100% !important;
}

.alert {
  border-radius: 0.375rem;
}

.form-control:focus {
  border-color: #696cff;
  box-shadow: 0 0 0 0.25rem rgba(105, 108, 255, 0.25);
}

.is-invalid {
  border-color: #ff3e1d;
}

.is-invalid:focus {
  border-color: #ff3e1d;
  box-shadow: 0 0 0 0.25rem rgba(255, 62, 29, 0.25);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ff3e1d;
}
</style>
