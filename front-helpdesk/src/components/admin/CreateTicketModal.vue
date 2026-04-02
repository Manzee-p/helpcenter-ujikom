<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5Z"/>
            </svg>
          </div>
          <div>
            <h4 class="modal-title">Buat Tiket untuk Client</h4>
            <p class="modal-subtitle">Admin membuat tiket atas nama client</p>
          </div>
        </div>
        <button class="btn-close-custom" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Client Selection -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="bi bi-person-circle"></i>
              Informasi Client
            </h6>
            
            <div class="form-group">
              <label class="form-label required">Pilih Client</label>
              <select 
                class="form-select" 
                v-model="form.user_id" 
                required
                :disabled="loadingClients"
              >
                <option value="">
                  {{ loadingClients ? 'Loading clients...' : 'Pilih klien...' }}
                </option>
                <option 
                  v-for="client in clients" 
                  :key="client.id" 
                  :value="client.id"
                >
                  {{ client.name }} — {{ client.email }}
                  <span v-if="client.company_name"> ({{ client.company_name }})</span>
                </option>
              </select>
            </div>
          </div>

          <!-- Ticket Details -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="bi bi-card-text"></i>
              Ticket Details
            </h6>

            <div class="form-group">
              <label class="form-label required">Judul</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.title"
                placeholder="Deskripsi singkat mengenai masalah"
                required
                maxlength="255"
              />
            </div>

            <div class="form-group">
              <label class="form-label required">Deskripsi</label>
              <textarea 
                class="form-control" 
                v-model="form.description"
                placeholder="Deskripsi masalah terperinci..."
                rows="4"
                required
                maxlength="2000"
              ></textarea>
              <div class="char-count">{{ form.description.length }}/2000</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Kategori</label>
                <select 
                  class="form-select" 
                  v-model="form.category_id" 
                  required
                  :disabled="loadingCategories"
                >
                  <option value="">
                    {{ loadingCategories ? 'Loading...' : 'Pilih Katedori' }}
                  </option>
                  <option 
                    v-for="category in categories" 
                    :key="category.id" 
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label required">Prioritas</label>
                <select class="form-select priority-select" v-model="form.priority" required>
                  <option value="low">🟢 Rendah — 48h resolution</option>
                  <option value="medium">🟡 Sedang — 24h resolution</option>
                  <option value="high">🟠 Tinggo — 8h resolution</option>
                  <option value="urgent">🔴 Mendesak — 4h resolution</option>
                </select>
                <div class="form-hint">
                  <i class="bi bi-info-circle"></i>
                  Prioritas menentukan waktu respons & resolusi SLA
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Tugaskan kepada Vendor</label>
              <select 
                class="form-select" 
                v-model="form.assigned_to"
                :disabled="loadingVendors"
              >
                <option value="">
                  {{ loadingVendors ? 'Loading vendors...' : 'Tugaskan nanti (optional)' }}
                </option>
                <option 
                  v-for="vendor in vendors" 
                  :key="vendor.id" 
                  :value="vendor.id"
                >
                  {{ vendor.name }}
                  <span v-if="vendor.specialization"> — {{ vendor.specialization }}</span>
                </option>
              </select>
            </div>
          </div>

          <!-- Event Details (Collapsible) -->
          <div class="form-section collapsible" :class="{ expanded: showEventDetails }">
            <h6 class="section-title clickable" @click="showEventDetails = !showEventDetails">
              <i class="bi bi-calendar-event"></i>
              Detail Acara
              <span class="optional-badge">Opsional</span>
              <i class="bi" :class="showEventDetails ? 'bi-chevron-atas' : 'bi-chevron-bawah'"></i>
            </h6>
            
            <div class="collapsible-content" v-show="showEventDetails">
              <div class="form-row three-cols">
                <div class="form-group">
                  <label class="form-label">Nama Event</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.event_name"
                    placeholder="misalnya, Konferensi Tahunan"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Lokasi</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.venue"
                    placeholder="misalnya, Grand Ballroom"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Area</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.area"
                    placeholder="misalnya, Stage Area"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Notes -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="bi bi-shield-lock"></i>
              Internal Notes
              <span class="admin-badge">Admin Only</span>
            </h6>
            
            <div class="form-group">
              <textarea 
                class="form-control admin-notes" 
                v-model="form.admin_notes"
                placeholder="Catatan internal (tidak terlihat oleh klien)..."
                rows="2"
                maxlength="1000"
              ></textarea>
            </div>
          </div>

          <!-- Attachments -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="bi bi-paperclip"></i>
              Lampiran
              <span class="optional-badge">Opsional</span>
            </h6>
            
            <div class="file-upload-area" @dragover.prevent @drop.prevent="handleDrop">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileChange"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                class="file-input"
              />
              <div class="upload-content">
                <i class="bi bi-cloud-arrow-up"></i>
                <p>Seret & jatuhkan berkas atau <span class="browse-link" @click="$refs.fileInput.click()">browse</span></p>
                <small>JPG, PNG, PDF, DOC, DOCX — Max 5MB each</small>
              </div>
            </div>

            <div v-if="form.attachments.length > 0" class="file-list">
              <div 
                v-for="(file, index) in form.attachments" 
                :key="index"
                class="file-item"
              >
                <div class="file-info">
                  <i :class="getFileIcon(file.type)"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <button type="button" class="btn-remove" @click="removeFile(index)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')" :disabled="loading">
          Batalkan
        </button>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else><i class="bi bi-check2-circle"></i></span>
          {{ loading ? 'Membuat...' : 'Buat Tiket' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const emit = defineEmits(['close', 'created'])

const loading = ref(false)
const loadingClients = ref(false)
const loadingCategories = ref(false)
const loadingVendors = ref(false)
const showEventDetails = ref(false)
const fileInput = ref(null)

const clients = ref([])
const categories = ref([])
const vendors = ref([])

const form = ref({
  user_id: '',
  title: '',
  description: '',
  category_id: '',
  priority: 'medium',
  event_name: '',
  venue: '',
  area: '',
  admin_notes: '',
  assigned_to: '',
  attachments: []
})

const isFormValid = computed(() => {
  return form.value.user_id && 
         form.value.title && 
         form.value.description && 
         form.value.category_id &&
         form.value.priority
})

onMounted(() => {
  fetchClients()
  fetchCategories()
  fetchVendors()
})

const fetchClients = async () => {
  loadingClients.value = true
  try {
    const response = await api.get('/admin/users', { params: { role: 'client' } })
    clients.value = response.data.filter(u => u.is_active)
  } catch (e) {
    console.error('Failed to fetch clients:', e)
  } finally {
    loadingClients.value = false
  }
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await api.get('/ticket-categories')
    categories.value = response.data
  } catch (e) {
    console.error('Failed to fetch categories:', e)
  } finally {
    loadingCategories.value = false
  }
}

const fetchVendors = async () => {
  loadingVendors.value = true
  try {
    const response = await api.get('/admin/vendors', { params: { is_active: true } })
    vendors.value = response.data
  } catch (e) {
    console.error('Failed to fetch vendors:', e)
  } finally {
    loadingVendors.value = false
  }
}

const handleFileChange = (e) => {
  addFiles(Array.from(e.target.files))
}

const handleDrop = (e) => {
  addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = (files) => {
  const maxSize = 5 * 1024 * 1024
  const allowed = ['image/jpeg', 'image/png', 'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  files.forEach(file => {
    if (file.size > maxSize) {
      Swal.fire({ icon: 'error', title: 'File Too Large', text: `${file.name} exceeds 5MB`, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })
      return
    }
    if (!allowed.includes(file.type)) {
      Swal.fire({ icon: 'error', title: 'Invalid Type', text: `${file.name} not allowed`, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })
      return
    }
    form.value.attachments.push(file)
  })
}

const removeFile = (idx) => form.value.attachments.splice(idx, 1)

const getFileIcon = (type) => {
  if (type.includes('image')) return 'bi bi-file-image text-success'
  if (type.includes('pdf')) return 'bi bi-file-pdf text-danger'
  return 'bi bi-file-word text-primary'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('user_id', form.value.user_id)
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('category_id', form.value.category_id)
    formData.append('priority', form.value.priority)
    
    if (form.value.event_name) formData.append('event_name', form.value.event_name)
    if (form.value.venue) formData.append('venue', form.value.venue)
    if (form.value.area) formData.append('area', form.value.area)
    if (form.value.admin_notes) formData.append('admin_notes', form.value.admin_notes)
    if (form.value.assigned_to) formData.append('assigned_to', form.value.assigned_to)
    
    form.value.attachments.forEach((file, i) => {
      formData.append(`attachments[${i}]`, file)
    })
    
    const response = await api.post('/admin/tickets/create-for-user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    emit('created', response.data.ticket)
  } catch (error) {
    const msg = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.message || 'Failed to create ticket'
    Swal.fire({ icon: 'error', title: 'Error', text: msg })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white !important;
}

.modal-subtitle {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.btn-close-custom {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-custom:hover {
  background: rgba(255,255,255,0.3);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title i:first-child {
  color: #6366f1;
}

.section-title.clickable {
  cursor: pointer;
}

.optional-badge, .admin-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: auto;
}

.optional-badge {
  background: #e5e7eb;
  color: #6b7280;
}

.admin-badge {
  background: #fef3c7;
  color: #92400e;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-control, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-control:focus, .form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.collapsible-content {
  margin-top: 1rem;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.file-upload-area:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-content i {
  font-size: 2.5rem;
  color: #6366f1;
}

.upload-content p {
  margin: 0.5rem 0 0.25rem;
  color: #374151;
}

.browse-link {
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
}

.upload-content small {
  color: #9ca3af;
}

.file-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
}

.file-size {
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ef4444;
  color: #fff;
}

.admin-notes {
  background: #fffbeb;
  border-color: #fcd34d;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .form-row, .form-row.three-cols {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    max-height: 95vh;
  }
}
</style>