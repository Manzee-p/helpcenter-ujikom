<template>
  <div class="create-ticket-page">
    <div class="page-container">
      <!-- Back Button -->
      <div class="page-header mb-4">
        <button @click="goBack" class="btn-back">
          <i class="bx bx-arrow-back"></i>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <!-- Page Title Header -->
      <div class="page-title-header">
        <div class="header-icon">
          <i class="bx bx-file-blank"></i>
        </div>
        <div class="header-content">
          <h5 class="modal-title fw-bold mb-0">
            Buat Tiket Dukungan Baru
          </h5>
          <p class="header-subtitle">Isi detail di bawah ini dan tim kami akan segera menindaklanjuti</p>
        </div>
      </div>

      <!-- Main Content Grid: Form + Guidelines -->
      <div class="main-content-grid">
        
        <!-- Left: Ticket Form -->
        <div class="professional-ticket-form">
          <form @submit.prevent="submitForm" class="form-body">
            <!-- GRID LAYOUT: 2 Kolom untuk Title dan Category -->
            <div class="form-row">
              <!-- Title Field -->
              <div class="form-col">
                <div class="input-group-modern">
                  <label class="input-label">
                    Judul Tiket <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="bx bx-text input-icon-left"></i>
                    <input
                      v-model="formData.title"
                      type="text"
                      class="modern-input"
                      placeholder="Deskripsi singkat masalah Anda"
                      :class="{ 'has-error': errors.title }"
                    />
                  </div>
                  <span v-if="errors.title" class="error-text">
                    <i class="bx bx-error-circle"></i> {{ errors.title }}
                  </span>
                </div>
              </div>

              <!-- Category Field -->
              <div class="form-col">
                <div class="input-group-modern">
                  <label class="input-label">
                    Kategori <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="bx bx-folder input-icon-left"></i>
                    <select
                      v-model="formData.category_id"
                      class="modern-input"
                      :class="{ 'has-error': errors.category_id }"
                    >
                      <option value="">Pilih kategori</option>
                      <option 
                        v-for="category in categories" 
                        :key="category.id" 
                        :value="category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <span v-if="errors.category_id" class="error-text">  
                    <i class="bx bx-error-circle"></i> {{ errors.category_id }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Urgency Level Section -->
            <div class="form-section">
              <div class="info-banner">
                <i class="bx bx-info-circle"></i>
                <div>
                  <strong>Prioritas resmi akan ditentukan oleh tim kami</strong> berdasarkan kategori dan deskripsi masalah Anda.
                </div>
              </div>

              <label class="section-label">
                Seberapa mendesak masalah ini menurut Anda? <span class="optional-badge">Opsional</span>
              </label>
              <div class="urgency-grid">
                <button
                  type="button"
                  v-for="urgency in urgencyLevels"
                  :key="urgency.value"
                  @click="formData.urgency_level = urgency.value"
                  class="urgency-card"
                  :class="[
                    `urgency-${urgency.value}`,
                    { active: formData.urgency_level === urgency.value }
                  ]"
                >
                  <i :class="urgency.icon"></i>
                  <span class="urgency-label-text">{{ urgency.label }}</span>
                </button>
              </div>
            </div>

            <!-- Description Field - Full Width -->
            <div class="form-section">
              <div class="input-group-modern">
                <label class="input-label">
                  Deskripsi Detail <span class="required">*</span>
                  <span class="char-count-inline">{{ formData.description.length }} / 2000</span>
                </label>
                <div class="textarea-with-icon">
                  <i class="bx bx-align-left textarea-icon"></i>
                  <textarea
                    v-model="formData.description"
                    class="modern-textarea"
                    rows="6"
                    placeholder="Berikan informasi detail tentang masalah Anda. Sertakan langkah-langkah, pesan error, atau konteks yang relevan... (Minimal 150 karakter)"
                    :class="{ 'has-error': errors.description }"
                  ></textarea>
                </div>
                <span v-if="errors.description" class="error-text">
                  <i class="bx bx-error-circle"></i> {{ errors.description }}
                </span>
              </div>
            </div>

            <!-- Event Details - Grid Layout -->
            <div class="form-section">
              <div class="section-header collapsible" @click="toggleEventDetails">
                <div class="section-header-left">
                  <i class="bx bx-calendar-check"></i>
                  <span>Detail Event</span>
                  <span class="optional-badge">Opsional</span>
                </div>
                <i class="bx bx-chevron-down transition-icon" :class="{ rotated: showEventDetails }"></i>
              </div>
              
              <transition name="slide-fade">
                <div v-show="showEventDetails" class="event-details-grid">
                  <div class="event-input-group">
                    <label class="event-label">
                      <i class="bx bx-calendar"></i>
                      Nama Event
                    </label>
                    <input
                      v-model="formData.event_name"
                      type="text"
                      class="event-input"
                      placeholder="Nama Event"
                    />
                  </div>
                  <div class="event-input-group">
                    <label class="event-label">
                      <i class="bx bx-map"></i>
                      Venue
                    </label>
                    <input
                      v-model="formData.venue"
                      type="text"
                      class="event-input"
                      placeholder="Venue"
                    />
                  </div>
                  <div class="event-input-group">
                    <label class="event-label">
                      <i class="bx bx-building"></i>
                      Area/Ruangan
                    </label>
                    <input
                      v-model="formData.area"
                      type="text"
                      class="event-input"
                      placeholder="Area/Ruangan"
                    />
                  </div>
                </div>
              </transition>
            </div>

            <!-- Attachments -->
            <div class="form-section">
              <div class="section-header-simple">
                <div class="section-header-left">
                  <i class="bx bx-paperclip"></i>
                  <span>Lampiran</span>
                </div>
                <span class="file-limit">Maksimal 5MB per file</span>
              </div>
              
              <div class="upload-container">
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  @change="handleFileUpload"
                  style="display: none"
                />
                
                <div v-if="!files.length" class="upload-dropzone" @click="$refs.fileInput.click()">
                  <div class="upload-icon-wrapper">
                    <i class="bx bx-cloud-upload"></i>
                  </div>
                  <h6>Letakkan file di sini atau klik untuk browse</h6>
                  <p class="upload-hint">Mendukung: JPG, PNG, PDF, DOC, DOCX</p>
                </div>

                <div v-else class="files-grid">
                  <div v-for="(file, index) in files" :key="index" class="file-card">
                    <div class="file-card-header">
                      <div class="file-icon" :class="getFileIconClass(file.name)">
                        <i :class="getFileIcon(file.name)"></i>
                      </div>
                      <button type="button" @click="removeFile(index)" class="file-remove">
                        <i class="bx bx-x"></i>
                      </button>
                    </div>
                    <div class="file-card-body">
                      <p class="file-name">{{ truncateFileName(file.name) }}</p>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    </div>
                  </div>
                  
                  <div class="file-card add-more" @click="$refs.fileInput.click()">
                    <i class="bx bx-plus"></i>
                    <span>Tambah Lagi</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button type="button" @click="handleCancel" class="btn-secondary" :disabled="loading">
                <i class="bx bx-x"></i>
                <span>Batal</span>
              </button>
              <button type="submit" class="btn-primary" :disabled="loading || !isFormValid">
                <template v-if="!loading">
                  <i class="bx bx-paper-plane"></i>
                  <span>Kirim Tiket</span>
                </template>
                <template v-else>
                  <i class="bx bx-loader-alt bx-spin"></i>
                  <span>Mengirim...</span>
                </template>
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Guidelines Panel -->
        <div class="guidelines-panel">
          <div class="guidelines-sticky">
            <div class="guidelines-header">
              <i class="bx bx-info-circle"></i>
              <h6>Panduan Pengisian</h6>
            </div>
            
            <div class="guidelines-table-wrapper">
              <table class="guidelines-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Ketentuan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-text"></i>
                        <span>Judul Tiket</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-required">Wajib</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Jelaskan masalah secara singkat dan spesifik
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-folder"></i>
                        <span>Kategori</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-required">Wajib</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Pilih kategori yang paling sesuai
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-error-circle"></i>
                        <span>Urgensi</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-optional">Opsional</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Prioritas final ditentukan tim kami
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-align-left"></i>
                        <span>Deskripsi</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-required">Min. 150</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Sertakan: langkah yang dicoba, error, waktu kejadian
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-calendar-check"></i>
                        <span>Detail Event</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-optional">Opsional</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Isi jika terkait event tertentu
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="field-name">
                        <i class="bx bx-paperclip"></i>
                        <span>Lampiran</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-optional">Max. 5MB</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="tips-cell">
                      Format: JPG, PNG, PDF, DOC
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Quick Tips -->
            <div class="quick-tips">
              <div class="tip-item">
                <i class="bx bx-check-circle"></i>
                <span>Berikan informasi selengkap mungkin</span>
              </div>
              <div class="tip-item">
                <i class="bx bx-check-circle"></i>
                <span>Sertakan screenshot jika memungkinkan</span>
              </div>
              <div class="tip-item">
                <i class="bx bx-check-circle"></i>
                <span>Pilih kategori yang tepat</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)
const categories = ref([])

const formData = reactive({
  title: '',
  category_id: '',
  urgency_level: 'medium',
  description: '',
  event_name: '',
  venue: '',
  area: ''
})

const files = ref([])
const errors = reactive({})
const showEventDetails = ref(false)
const fileInput = ref(null)

const urgencyLevels = ref([
  { 
    label: 'Tidak Mendesak', 
    value: 'low', 
    icon: 'bx bx-check-circle'
  },
  { 
    label: 'Normal', 
    value: 'medium', 
    icon: 'bx bx-time-five'
  },
  { 
    label: 'Mendesak', 
    value: 'high', 
    icon: 'bx bx-error-circle'
  },
  { 
    label: 'Sangat Mendesak', 
    value: 'critical', 
    icon: 'bx bx-error'
  }
])

onMounted(async () => {
  try {
    const response = await api.get('/ticket-categories')
    categories.value = response.data.filter(cat => cat.is_active)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const isFormValid = computed(() => {
  return formData.title.trim() !== '' && 
         formData.category_id !== '' && 
         formData.description.trim() !== '' &&
         formData.description.length >= 150 &&
         !loading.value
})

const toggleEventDetails = () => {
  showEventDetails.value = !showEventDetails.value
}

const handleFileUpload = (event) => {
  const newFiles = Array.from(event.target.files)
  const maxSize = 5 * 1024 * 1024
  
  const validFiles = newFiles.filter(file => {
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: `File ${file.name} melebihi batas 5MB`,
        confirmButtonColor: '#667eea'
      })
      return false
    }
    return true
  })
  
  files.value.push(...validFiles)
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: 'bx bxs-file-pdf',
    doc: 'bx bxs-file-doc',
    docx: 'bx bxs-file-doc',
    jpg: 'bx bxs-file-image',
    jpeg: 'bx bxs-file-image',
    png: 'bx bxs-file-image'
  }
  return iconMap[ext] || 'bx bxs-file'
}

const getFileIconClass = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  return `file-icon-${ext}`
}

const truncateFileName = (name) => {
  return name.length > 20 ? name.substring(0, 20) + '...' : name
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  if (!formData.title.trim()) {
    errors.title = 'Judul tiket harus diisi'
  }
  
  if (!formData.category_id) {
    errors.category_id = 'Silakan pilih kategori'
  }
  
  if (!formData.description.trim()) {
    errors.description = 'Deskripsi harus diisi'
  } else if (formData.description.length < 150) {
    errors.description = 'Deskripsi harus minimal 150 karakter untuk memberikan informasi yang cukup detail'
  } else if (formData.description.length > 2000) {
    errors.description = 'Deskripsi tidak boleh lebih dari 2000 karakter'
  }
  
  return Object.keys(errors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const submitData = new FormData()
    
    submitData.append('title', formData.title)
    submitData.append('category_id', formData.category_id)
    submitData.append('urgency_level', formData.urgency_level)
    submitData.append('description', formData.description)
    
    if (formData.event_name) {
      submitData.append('event_name', formData.event_name)
    }
    if (formData.venue) {
      submitData.append('venue', formData.venue)
    }
    if (formData.area) {
      submitData.append('area', formData.area)
    }
    
    files.value.forEach((file, index) => {
      submitData.append(`attachments[${index}]`, file)
    })
    
    const response = await api.post('/tickets', submitData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    await Swal.fire({
      icon: 'success',
      title: 'Tiket Berhasil Dibuat!',
      html: `
        <p>Tiket dukungan Anda telah berhasil dikirim.</p>
        <p style="font-size: 0.9em; color: #6b7280; margin-top: 1rem;">
          <strong>Catatan:</strong> Prioritas final akan ditentukan oleh tim kami 
          berdasarkan tingkat urgensi dan kategori masalah Anda.
        </p>
      `,
      confirmButtonColor: '#667eea',
      timer: 3000,
      timerProgressBar: true
    })
    
    router.push(`/tickets/${response.data.ticket.id}`)
    
  } catch (error) {
    console.error('Error creating ticket:', error)
    
    let errorMessage = 'Gagal membuat tiket. Silakan coba lagi.'
    
    if (error.response?.data?.errors) {
      const errorList = error.response.data.errors
      errorMessage = Object.values(errorList).flat().join('\n')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonColor: '#ef4444'
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  Swal.fire({
    title: 'Batalkan Pembuatan Tiket?',
    text: 'Semua data yang diisi akan hilang',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, batalkan',
    cancelButtonText: 'Lanjut mengisi'
  }).then((result) => {
    if (result.isConfirmed) {
      router.push('/client/dashboard')
    }
  })
}

const goBack = () => {
  handleCancel()
}
</script>

<style scoped>
.create-ticket-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-back:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.btn-back i {
  font-size: 1.25rem;
}

/* Page Title Header */
.page-title-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.page-title-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.page-title-header .header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  z-index: 1;
}

.page-title-header .header-content {
  flex: 1;
  z-index: 1;
}

.page-title-header .modal-title {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-title-header .header-subtitle {
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

.professional-ticket-form {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Guidelines Panel - Right Side */
.guidelines-panel {
  position: relative;
}

.guidelines-sticky {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.guidelines-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.guidelines-header i {
  font-size: 1.5rem;
  color: #667eea;
}

.guidelines-header h6 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.guidelines-table-wrapper {
  padding: 0;
}

.guidelines-table {
  width: 100%;
  background: white;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.guidelines-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.guidelines-table thead th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 700;
  color: white;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guidelines-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.guidelines-table tbody tr:hover {
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.guidelines-table td {
  padding: 0.875rem 1rem;
  color: #475569;
  vertical-align: middle;
}

.tips-cell {
  padding: 0.5rem 1rem 1rem 1rem !important;
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.field-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.field-name i {
  font-size: 1.125rem;
  color: #667eea;
  flex-shrink: 0;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-required {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.badge-optional {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

/* Quick Tips Section */
.quick-tips {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-top: 2px solid #bbf7d0;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #166534;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item i {
  font-size: 1.125rem;
  color: #16a34a;
  flex-shrink: 0;
}

.tip-item span {
  font-weight: 500;
  line-height: 1.4;
}

.form-body {
  padding: 2.5rem;
}

/* NEW: Grid Layout for Forms */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.form-col {
  min-width: 0; /* Prevents grid blowout */
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.input-group-modern {
  width: 100%;
}

.input-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.625rem;
  letter-spacing: 0.3px;
}

.char-count-inline {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.section-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  letter-spacing: 0.3px;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.optional-badge {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-left {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  color: #667eea;
  z-index: 1;
}

.modern-input {
  width: 100%;
  padding: 0.9rem 1.125rem 0.9rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
  font-weight: 500;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.modern-input.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.textarea-with-icon {
  position: relative;
}

.textarea-icon {
  position: absolute;
  top: 1.125rem;
  left: 1rem;
  font-size: 1.25rem;
  color: #667eea;
  z-index: 1;
}

.modern-textarea {
  width: 100%;
  padding: 1rem 1.125rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
  font-weight: 500;
  line-height: 1.6;
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.modern-textarea.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Info Banner */
.info-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.08);
}

.info-banner i {
  font-size: 1.25rem;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-banner div {
  flex: 1;
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.5;
}

.info-banner strong {
  font-weight: 700;
  color: #1e3a8a;
}

/* Urgency Grid */
.urgency-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.urgency-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.125rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  gap: 0.5rem;
  min-height: 90px;
}

.urgency-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.urgency-card i {
  font-size: 1.75rem;
  transition: all 0.25s ease;
}

.urgency-label-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  transition: all 0.25s ease;
}

/* Active states for each urgency level */
.urgency-low.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.urgency-low.active i {
  color: #2563eb;
}

.urgency-low.active .urgency-label-text {
  color: #1e40af;
}

.urgency-medium.active {
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border-color: #eab308;
  box-shadow: 0 4px 14px rgba(234, 179, 8, 0.25);
}

.urgency-medium.active i {
  color: #ca8a04;
}

.urgency-medium.active .urgency-label-text {
  color: #a16207;
}

.urgency-high.active {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-color: #f97316;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.25);
}

.urgency-high.active i {
  color: #ea580c;
}

.urgency-high.active .urgency-label-text {
  color: #c2410c;
}

.urgency-critical.active {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.urgency-critical.active i {
  color: #dc2626;
}

.urgency-critical.active .urgency-label-text {
  color: #991b1b;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header.collapsible {
  cursor: pointer;
  padding: 1rem;
  margin: -0.5rem -1rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.section-header.collapsible:hover {
  background: #f8fafc;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.section-header-left i {
  font-size: 1.25rem;
  color: #667eea;
}

.file-limit {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.transition-icon {
  transition: transform 0.3s ease;
  font-size: 1.25rem;
  color: #667eea;
}

.transition-icon.rotated {
  transform: rotate(180deg);
}

/* Event Details Grid */
.event-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 1rem;
}

.event-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.event-label i {
  font-size: 1.125rem;
  color: #667eea;
}

.event-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-weight: 500;
}

.event-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Upload Section */
.upload-container {
  margin-top: 1rem;
}

.upload-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.upload-dropzone:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
  transform: translateY(-2px);
}

.upload-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-wrapper i {
  font-size: 2.5rem;
  color: #667eea;
}

.upload-dropzone h6 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.file-card {
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.file-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.file-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
}

.file-icon-pdf {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.file-icon-doc,
.file-icon-docx {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.file-icon-jpg,
.file-icon-jpeg,
.file-icon-png {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.file-remove {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.125rem;
}

.file-remove:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.file-card-body {
  text-align: left;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.35rem 0;
  word-break: break-word;
  line-height: 1.4;
}

.file-size {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 600;
}

.file-card.add-more {
  border: 2px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  cursor: pointer;
  background: white;
  min-height: 120px;
}

.file-card.add-more:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
}

.file-card.add-more i {
  font-size: 2rem;
  color: #667eea;
}

.file-card.add-more span {
  font-size: 0.875rem;
  font-weight: 700;
  color: #667eea;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border-radius: 0 0 20px 20px;
  margin: 2.5rem -2.5rem -2.5rem;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  letter-spacing: 0.3px;
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-primary i,
.btn-secondary i {
  font-size: 1.125rem;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content-grid {
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
  }

  .page-container {
    max-width: 1200px;
  }
}

@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .guidelines-panel {
    order: -1; /* Move guidelines above form on tablet/mobile */
  }

  .guidelines-sticky {
    position: relative;
    top: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .urgency-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .event-details-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .create-ticket-page {
    padding: 1rem 0;
  }
  
  .page-container {
    padding: 0 1rem;
  }
  
  .page-title-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .page-title-header .header-icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }
  
  .page-title-header .modal-title {
    font-size: 1.5rem;
  }

  .guidelines-header h6 {
    font-size: 1rem;
  }

  .guidelines-table {
    font-size: 0.8rem;
  }

  .guidelines-table thead th,
  .guidelines-table td {
    padding: 0.75rem 0.875rem;
  }

  .field-name {
    font-size: 0.8rem;
  }

  .field-name i {
    font-size: 1rem;
  }

  .quick-tips {
    padding: 1.25rem;
  }

  .tip-item {
    font-size: 0.8rem;
  }
  
  .form-body {
    padding: 1.5rem;
  }
  
  .form-row {
    gap: 1.25rem;
  }
  
  .urgency-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
    margin: 1.5rem -1.5rem -1.5rem;
    padding: 1.5rem;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .form-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

@media (max-width: 576px) {
  .urgency-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-back {
    width: 100%;
    justify-content: center;
  }
  
  .page-title-header .header-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
  
  .page-title-header .modal-title {
    font-size: 1.25rem;
  }
  
  .page-title-header .header-subtitle {
    font-size: 0.875rem;
  }

  .guidelines-header {
    padding: 1.25rem;
  }

  .guidelines-table {
    font-size: 0.75rem;
  }

  .guidelines-table thead th,
  .guidelines-table td {
    padding: 0.625rem 0.75rem;
  }

  .tips-cell {
    font-size: 0.75rem;
  }

  .quick-tips {
    padding: 1rem;
  }

  .tip-item {
    font-size: 0.75rem;
  }
  
  .section-header-left {
    font-size: 0.9375rem;
  }
  
  .files-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>