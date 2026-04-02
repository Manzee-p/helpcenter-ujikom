<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Edit User' : 'Add New User' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.name"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Email <span class="text-danger">*</span></label>
              <input 
                type="email" 
                class="form-control" 
                v-model="form.email"
                :disabled="isEdit"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.phone"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Role <span class="text-danger">*</span></label>
              <select class="form-select" v-model="form.role" required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div class="mb-3" v-if="!isEdit">
              <label class="form-label">Password <span class="text-danger">*</span></label>
              <input 
                type="password" 
                class="form-control" 
                v-model="form.password"
                :required="!isEdit"
                minlength="8"
              />
              <small class="text-muted">Minimum 8 characters</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="!loading">{{ isEdit ? 'Update' : 'Create' }} User</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
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
  user: Object
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const form = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: ''
})

const isEdit = computed(() => !!props.user)

onMounted(() => {
  if (isEdit.value) {
    form.value = {
      name: props.user.name,
      email: props.user.email,
      phone: props.user.phone || '',
      role: props.user.role,
      password: ''
    }
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await api.put(`/admin/users/${props.user.id}`, form.value)
    } else {
      await api.post('/admin/users', form.value)
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: `User ${isEdit.value ? 'updated' : 'created'} successfully`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })
    
    emit('saved')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Failed to save user',
      confirmButtonColor: '#696cff'
    })
  } finally {
    loading.value = false
  }
}
</script>