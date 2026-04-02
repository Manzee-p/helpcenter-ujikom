<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label class="form-label">Title <span class="text-danger">*</span></label>
      <input 
        type="text" 
        class="form-control" 
        v-model="form.title"
        placeholder="Brief description of your issue"
        required
      />
    </div>

    <div class="mb-3">
      <label class="form-label">Category <span class="text-danger">*</span></label>
      <select class="form-select" v-model="form.category_id" required>
        <option value="">Select Category</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Priority <span class="text-danger">*</span></label>
      <select class="form-select" v-model="form.priority" required>
        <option value="low">Rendah</option>
        <option value="medium">Sedang</option>
        <option value="high">Tinggi</option>
        <option value="critical">Urgent</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Description <span class="text-danger">*</span></label>
      <textarea 
        class="form-control" 
        rows="5" 
        v-model="form.description"
        placeholder="Provide detailed information about your issue"
        required
      ></textarea>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">Event Name</label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.event_name"
          placeholder="e.g., Annual Conference 2025"
        />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Venue</label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.venue"
          placeholder="e.g., Grand Ballroom"
        />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">Area</label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.area"
          placeholder="e.g., Main Hall"
        />
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Attachments</label>
      <input 
        type="file" 
        class="form-control" 
        multiple
        accept="image/*,.pdf,.doc,.docx"
        @change="handleFileChange"
      />
      <small class="text-muted">Max 5MB per file. Supported: JPG, PNG, PDF, DOC, DOCX</small>
      
      <div v-if="fileList.length > 0" class="mt-2">
        <div v-for="(file, index) in fileList" :key="index" class="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
          <span class="text-truncate">{{ file.name }} ({{ formatFileSize(file.size) }})</span>
          <button type="button" class="btn btn-sm btn-icon btn-danger" @click="removeFile(index)">
            <i class="bx bx-x"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="!loading">
          <i class="bx bx-send me-1"></i> Submit Ticket
        </span>
        <span v-else>
          <span class="spinner-border spinner-border-sm me-2" role="status"></span>
          Submitting...
        </span>
      </button>
      <router-link to="/client/tickets" class="btn btn-label-secondary">
        Cancel
      </router-link>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  loading: Boolean
})

const emit = defineEmits(['submit'])

const form = ref({
  title: '',
  category_id: '',
  priority: 'medium',
  description: '',
  event_name: '',
  venue: '',
  area: '',
  attachments: []
})

const categories = ref([])
const fileList = ref([])

onMounted(async () => {
  await fetchCategories()
})

const fetchCategories = async () => {
  try {
    const response = await api.get('/ticket-categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback categories
    categories.value = [
      { id: 1, name: 'Sound System' },
      { id: 2, name: 'Lighting' },
      { id: 3, name: 'Venue' },
      { id: 4, name: 'Technical' },
      { id: 5, name: 'Logistik' },
      { id: 6, name: 'Registrasi' },
      { id: 7, name: 'Lainnya' }
    ]
  }
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  fileList.value = [...fileList.value, ...files]
  form.value.attachments = fileList.value
}

const removeFile = (index) => {
  fileList.value.splice(index, 1)
  form.value.attachments = fileList.value
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>