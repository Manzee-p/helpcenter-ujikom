<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="`bx ${isEdit ? 'bx-edit' : 'bx-plus'} me-2`"></i>
            {{ isEdit ? 'Edit User' : 'Add New User' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Name -->
            <div class="mb-3">
              <label class="form-label">Full Name <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bx bx-user"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.name"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Enter full name"
                  required
                />
                <div class="invalid-feedback" v-if="errors.name">
                  {{ errors.name }}
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label">Email Address <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bx bx-envelope"></i>
                </span>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="form.email"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="user@example.com"
                  required
                />
                <div class="invalid-feedback" v-if="errors.email">
                  {{ errors.email }}
                </div>
              </div>
            </div>

            <!-- Phone -->
            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bx bx-phone"></i>
                </span>
                <input 
                  type="tel" 
                  class="form-control" 
                  v-model="form.phone"
                  :class="{ 'is-invalid': errors.phone }"
                  placeholder="+62 812 3456 7890"
                />
                <div class="invalid-feedback" v-if="errors.phone">
                  {{ errors.phone }}
                </div>
              </div>
            </div>

            <!-- Role -->
            <div class="mb-3">
              <label class="form-label">Role <span class="text-danger">*</span></label>
              <div class="role-selector">
                <div 
                  v-for="role in roles" 
                  :key="role.value"
                  class="role-card"
                  :class="{ 'selected': form.role === role.value }"
                  @click="form.role = role.value"
                >
                  <div class="role-icon" :class="`bg-label-${role.color}`">
                    <i :class="`bx ${role.icon} bx-md`"></i>
                  </div>
                  <div class="role-info">
                    <strong>{{ role.label }}</strong>
                    <small class="d-block text-muted">{{ role.description }}</small>
                  </div>
                  <div class="role-check">
                    <i class="bx bx-check-circle"></i>
                  </div>
                </div>
              </div>
              <div class="text-danger small mt-1" v-if="errors.role">
                {{ errors.role }}
              </div>
            </div>

            <!-- Password (only for new users) -->
            <div class="mb-3" v-if="!isEdit">
              <label class="form-label">Password <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bx bx-lock"></i>
                </span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  v-model="form.password"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Minimum 8 characters"
                  required
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="showPassword = !showPassword"
                >
                  <i :class="`bx ${showPassword ? 'bx-hide' : 'bx-show'}`"></i>
                </button>
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
              <small class="text-muted">Password must be at least 8 characters long</small>
            </div>

            <!-- Status (only for edit) -->
            <div class="mb-3" v-if="isEdit">
              <label class="form-label">Account Status</label>
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="activeStatus"
                  v-model="form.is_active"
                />
                <label class="form-check-label" for="activeStatus">
                  {{ form.is_active ? 'Active' : 'Inactive' }}
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="!loading">
                <i :class="`bx ${isEdit ? 'bx-save' : 'bx-plus'} me-1`"></i>
                {{ isEdit ? 'Update User' : 'Create User' }}
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? 'Updating...' : 'Creating...' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'client',
  password: '',
  is_active: true
})
const errors = ref({})

const roles = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full system access',
    icon: 'bx-shield',
    color: 'danger'
  },
  {
    value: 'vendor',
    label: 'Vendor',
    description: 'Handle tickets',
    icon: 'bx-wrench',
    color: 'info'
  },
  {
    value: 'client',
    label: 'Client',
    description: 'Create tickets',
    icon: 'bx-user',
    color: 'success'
  }
]

const isEdit = computed(() => !!props.user)

onMounted(() => {
  if (props.user) {
    form.value = {
      name: props.user.name || '',
      email: props.user.email || '',
      phone: props.user.phone || '',
      role: props.user.role || 'client',
      is_active: props.user.is_active ?? true
    }
  }
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.name || form.value.name.trim().length < 3) {
    errors.value.name = 'Name must be at least 3 characters'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.value.role) {
    errors.value.role = 'Please select a role'
    isValid = false
  }

  if (!isEdit.value && (!form.value.password || form.value.password.length < 8)) {
    errors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errors.value = {}

  try {
    if (isEdit.value) {
      // Update user
      await api.put(`/admin/users/${props.user.id}`, {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone || null,
        role: form.value.role,
        is_active: form.value.is_active
      })
      
      Swal.fire({
        icon: 'success',
        title: 'User Updated!',
        text: 'User information has been updated successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } else {
      // Create user
      await api.post('/admin/users', {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone || null,
        password: form.value.password,
        role: form.value.role
      })
      
      Swal.fire({
        icon: 'success',
        title: 'User Created!',
        text: 'New user has been created successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    }
    
    emit('saved')
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save user',
        confirmButtonColor: '#696cff'
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal {
  display: block;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-card:hover {
  border-color: #696cff;
  background-color: rgba(105, 108, 255, 0.05);
  transform: translateX(5px);
}

.role-card.selected {
  border-color: #696cff;
  background-color: rgba(105, 108, 255, 0.1);
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.role-info {
  flex-grow: 1;
}

.role-check {
  color: #696cff;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-card.selected .role-check {
  opacity: 1;
}

.input-group-text {
  background-color: #f8f9fa;
}

.btn-outline-secondary:hover {
  background-color: #8592a3;
  color: white;
}

.form-check-input:checked {
  background-color: #696cff;
  border-color: #696cff;
}
</style>