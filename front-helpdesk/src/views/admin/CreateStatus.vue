<template>
  <div class="create-status-page">
    <!-- Back Button -->
    <button @click="goBack" class="btn-back">
      <i class="bx bx-arrow-left"></i>
      <span>Kembali</span>
    </button>

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Buat Status Baru</h1>
      <p class="page-subtitle">Buat informasi status gangguan atau pemeliharaan sistem</p>
    </div>

    <!-- Alert -->
    <transition name="fade">
      <div v-if="alert.show" :class="['alert', `alert-${alert.type}`]">
        <i :class="['bx', alert.type === 'success' ? 'bx-check-circle' : 'bx-error-circle']"></i>
        <span>{{ alert.message }}</span>
        <button @click="alert.show = false" class="alert-close">
          <i class="bx bx-x"></i>
        </button>
      </div>
    </transition>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="submitStatus">
        <!-- Basic Information -->
        <div class="form-section">
          <div class="section-header">
            <i class="bx bx-info-circle"></i>
            <h2>Informasi Dasar</h2>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label class="form-label">
                <i class="bx bx-heading"></i>
                Judul Status <span class="required">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                :class="{ 'is-invalid': errors.title }"
                placeholder="Contoh: Gangguan Listrik di Hall A"
                maxlength="255"
                @input="clearError('title')"
                required
              />
              <span v-if="errors.title" class="error-message">
                <i class="bx bx-error-circle"></i> {{ errors.title }}
              </span>
              <span class="input-hint">Judul yang jelas dan deskriptif</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-category"></i>
                Kategori <span class="required">*</span>
              </label>
              <select
                v-model="form.category"
                class="form-select"
                :class="{ 'is-invalid': errors.category }"
                @change="clearError('category')"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="power_outage">Gangguan Listrik</option>
                <option value="technical_issue">Masalah Teknis</option>
                <option value="facility_issue">Masalah Fasilitas</option>
                <option value="network_issue">Gangguan Jaringan</option>
                <option value="other">Lainnya</option>
              </select>
              <span v-if="errors.category" class="error-message">
                <i class="bx bx-error-circle"></i> {{ errors.category }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-flag"></i>
                Tingkat Keparahan <span class="required">*</span>
              </label>
              <select
                v-model="form.severity"
                class="form-select"
                :class="{ 'is-invalid': errors.severity }"
                @change="clearError('severity')"
                required
              >
                <option value="">-- Pilih Tingkat --</option>
                <option value="critical">🔴 Kritis</option>
                <option value="high">🟠 Tinggi</option>
                <option value="medium">🟡 Sedang</option>
                <option value="low">🟢 Rendah</option>
              </select>
              <span v-if="errors.severity" class="error-message">
                <i class="bx bx-error-circle"></i> {{ errors.severity }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-map-pin"></i>
                Area Terdampak
              </label>
              <input
                v-model="form.affected_area"
                type="text"
                class="form-input"
                placeholder="Contoh: Hall A, Ruang VIP"
                maxlength="255"
              />
              <span class="input-hint">Lokasi atau area yang terpengaruh (opsional)</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-calendar"></i>
                Waktu Mulai <span class="required">*</span>
              </label>
              <input
                v-model="form.started_at"
                type="datetime-local"
                class="form-input"
                :class="{ 'is-invalid': errors.started_at }"
                @change="clearError('started_at')"
                required
              />
              <span v-if="errors.started_at" class="error-message">
                <i class="bx bx-error-circle"></i> {{ errors.started_at }}
              </span>
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">
              <i class="bx bx-detail"></i>
              Deskripsi Masalah <span class="required">*</span>
            </label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              :class="{ 'is-invalid': errors.description }"
              rows="6"
              placeholder="Jelaskan masalah atau gangguan secara detail..."
              maxlength="2000"
              @input="clearError('description')"
              required
            ></textarea>
            <div class="input-info">
              <span v-if="errors.description" class="error-message">
                <i class="bx bx-error-circle"></i> {{ errors.description }}
              </span>
              <span class="char-count">{{ form.description.length }}/2000</span>
            </div>
          </div>
        </div>

        <!-- Assignment & Visibility -->
        <div class="form-section">
          <div class="section-header">
            <i class="bx bx-cog"></i>
            <h2>Pengaturan</h2>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-user-check"></i>
                Ditugaskan Kepada
              </label>
              <select v-model="form.assigned_to" class="form-select">
                <option value="">-- Tidak Ditugaskan --</option>
                <option v-for="user in assignableUsers" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.role }})
                </option>
              </select>
              <span class="input-hint">Admin yang bertanggung jawab (opsional)</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bx bx-show"></i>
                Visibilitas
              </label>
              <div class="toggle-group">
                <label class="toggle-item">
                  <input
                    v-model="form.is_public"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Tampilkan ke Publik</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  v-model="form.is_pinned"
                  type="checkbox"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">
                  <i class="bx bxs-pin"></i>
                  Pin Status (Tampilkan di Atas)
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Preview Card -->
        <div class="preview-section">
          <div class="section-header">
            <i class="bx bx-show"></i>
            <h2>Preview</h2>
          </div>
          <div class="preview-card">
            <div class="preview-header">
              <span class="preview-badge">Preview</span>
              <span v-if="form.severity" :class="['severity-preview', `severity-${form.severity}`]">
                {{ getSeverityLabel(form.severity) }}
              </span>
            </div>
            <h3 class="preview-title">{{ form.title || 'Judul Status' }}</h3>
            <div class="preview-meta">
              <span v-if="form.category" class="preview-meta-item">
                <i class="bx bx-category"></i>
                {{ getCategoryLabel(form.category) }}
              </span>
              <span v-if="form.affected_area" class="preview-meta-item">
                <i class="bx bx-map-pin"></i>
                {{ form.affected_area }}
              </span>
            </div>
            <p class="preview-description">
              {{ form.description || 'Deskripsi masalah akan ditampilkan di sini...' }}
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-secondary" :disabled="loading">
            <i class="bx bx-x"></i>
            Batal
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i class="bx" :class="loading ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
            {{ loading ? 'Menyimpan...' : 'Buat Status' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusBoardStore } from '@/stores/statusBoard'
import api from '@/services/api'
import Swal from 'sweetalert2'

const router = useRouter()
const statusBoardStore = useStatusBoardStore()

const loading = ref(false)
const assignableUsers = ref([])

const form = ref({
  title: '',
  category: '',
  severity: '',
  affected_area: '',
  description: '',
  started_at: '',
  assigned_to: '',
  is_public: true,
  is_pinned: false
})

const errors = ref({})

const alert = ref({
  show: false,
  type: '',
  message: ''
})

const fetchAssignableUsers = async () => {
  try {
    const response = await api.get('/admin/users', {
      params: { role: 'admin' }
    })
    assignableUsers.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Judul harus diisi'
  }
  
  if (!form.value.category) {
    errors.value.category = 'Kategori harus dipilih'
  }
  
  if (!form.value.severity) {
    errors.value.severity = 'Tingkat keparahan harus dipilih'
  }
  
  if (!form.value.started_at) {
    errors.value.started_at = 'Waktu mulai harus diisi'
  }
  
  if (!form.value.description.trim()) {
    errors.value.description = 'Deskripsi harus diisi'
  } else if (form.value.description.length < 20) {
    errors.value.description = 'Deskripsi minimal 20 karakter'
  }
  
  return Object.keys(errors.value).length === 0
}

const submitStatus = async () => {
  if (!validateForm()) {
    showAlert('error', 'Mohon lengkapi form dengan benar')
    return
  }
  
  loading.value = true
  
  try {
    await statusBoardStore.createStatus(form.value)
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Status berhasil dibuat',
      confirmButtonColor: '#667eea'
    })
    
    router.push('/admin/status-board')
  } catch (error) {
    console.error('Error creating status:', error)
    
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
      showAlert('error', 'Terdapat kesalahan pada form')
    } else {
      showAlert('error', error.response?.data?.message || 'Gagal membuat status')
    }
  } finally {
    loading.value = false
  }
}

const showAlert = (type, message) => {
  alert.value = {
    show: true,
    type: type,
    message: message
  }
  
  setTimeout(() => {
    alert.value.show = false
  }, 5000)
}

const goBack = () => {
  router.push('/admin/status-board')
}

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Kritis',
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah'
  }
  return labels[severity] || severity
}

const getCategoryLabel = (category) => {
  const labels = {
    power_outage: 'Gangguan Listrik',
    technical_issue: 'Masalah Teknis',
    facility_issue: 'Masalah Fasilitas',
    network_issue: 'Gangguan Jaringan',
    other: 'Lainnya'
  }
  return labels[category] || category
}

onMounted(() => {
  fetchAssignableUsers()
  
  // Set default started_at to now
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const localISOTime = new Date(now - offset).toISOString().slice(0, 16)
  form.value.started_at = localISOTime
})
</script>

<style scoped>
.create-status-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Back Button */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-4px);
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.alert-success {
  background: linear-gradient(135deg, #d4f4dd 0%, #c3f0cf 100%);
  color: #059669;
  border: 1px solid #6ee7b7;
}

.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.alert i {
  font-size: 1.25rem;
}

.alert-close {
  margin-left: auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Form Container */
.form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

/* Form Section */
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header i {
  font-size: 1.75rem;
  color: #667eea;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.625rem;
}

.form-label i {
  font-size: 1.125rem;
  color: #667eea;
}

.required {
  color: #ef4444;
}

/* Form Inputs */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.3s;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.is-invalid,
.form-select.is-invalid,
.form-textarea.is-invalid {
  border-color: #ef4444;
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.input-hint {
  display: block;
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-top: 0.375rem;
}

.input-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #ef4444;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: 0.375rem;
}

.error-message i {
  font-size: 1rem;
}

/* Toggle Group */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;
}

.toggle-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 26px;
  background: #d1d5db;
  border-radius: 26px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Preview Section */
.preview-section {
  margin-bottom: 2rem;
}

.preview-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.75rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-badge {
  padding: 0.375rem 0.875rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.severity-preview {
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.severity-critical {
  background: #fee2e2;
  color: #991b1b;
}

.severity-high {
  background: #fef3c7;
  color: #92400e;
}

.severity-medium {
  background: #dbeafe;
  color: #1e40af;
}

.severity-low {
  background: #f3f4f6;
  color: #4b5563;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.preview-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.preview-meta-item i {
  font-size: 1rem;
  color: #9ca3af;
}

.preview-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #6c757d;
  margin: 0;
  white-space: pre-wrap;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 0.9375rem;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .create-status-page {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>