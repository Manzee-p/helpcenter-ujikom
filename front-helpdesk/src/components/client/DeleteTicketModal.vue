<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-icon-wrapper">
            <i class="bx bx-trash-alt"></i>
          </div>
          <div>
            <h5 class="modal-title">Ajukan Permintaan Penghapusan Tiket</h5>
            <p class="modal-subtitle">Tiket yang sudah di-assign tidak dapat dihapus</p>
          </div>
          <button type="button" class="btn-close" @click="closeModal">
            <i class="bx bx-x"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Ticket Info -->
          <div class="ticket-info-card">
            <div class="info-row">
              <span class="info-label">Tiket:</span>
              <span class="info-value">{{ ticket.ticket_number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Judul:</span>
              <span class="info-value">{{ ticket.title }}</span>
            </div>
          </div>

          <!-- Reason Selection -->
          <div class="form-group">
            <label class="form-label">
              Alasan Penghapusan <span class="required">*</span>
            </label>
            <div class="reason-grid">
              <button
                type="button"
                v-for="option in reasonOptions"
                :key="option.value"
                @click="selectedReason = option.value"
                class="reason-card"
                :class="{ active: selectedReason === option.value }"
              >
                <i :class="option.icon"></i>
                <span>{{ option.label }}</span>
              </button>
            </div>
            <span v-if="errors.reason" class="error-text">
              <i class="bx bx-error-circle"></i> {{ errors.reason }}
            </span>
          </div>

          <!-- Description (Required if "other") -->
          <div v-if="selectedReason === 'other'" class="form-group">
            <label class="form-label">
              Deskripsi Alasan <span class="required">*</span>
              <span class="char-count">{{ description.length }} / 1000</span>
            </label>
            <textarea
              v-model="description"
              class="form-textarea"
              rows="5"
              placeholder="Jelaskan alasan Anda ingin menghapus tiket ini... (Minimal 150 karakter)"
              :class="{ 'has-error': errors.description }"
            ></textarea>
            <span v-if="errors.description" class="error-text">
              <i class="bx bx-error-circle"></i> {{ errors.description }}
            </span>
          </div>

          <!-- Warning Message -->
          <div class="warning-box">
            <i class="bx bx-info-circle"></i>
            <div>
              <strong>Perhatian:</strong> Permintaan penghapusan akan ditinjau oleh admin. 
              Anda akan menerima notifikasi tentang keputusan admin.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            @click="closeModal" 
            class="btn-cancel"
            :disabled="submitting"
          >
            Batal
          </button>
          <button 
            type="button" 
            @click="submitRequest" 
            class="btn-delete"
            :disabled="submitting || !canSubmit"
          >
            <template v-if="!submitting">
              <i class="bx bx-send"></i>
              <span>Ajukan Permintaan</span>
            </template>
            <template v-else>
              <i class="bx bx-loader-alt bx-spin"></i>
              <span>Mengirim...</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  ticket: Object
})

const emit = defineEmits(['close', 'submitted'])

const selectedReason = ref('')
const description = ref('')
const submitting = ref(false)
const errors = reactive({})

const reasonOptions = ref([
  {
    value: 'duplicate',
    label: 'Tiket Duplikat',
    icon: 'bx bx-copy'
  },
  {
    value: 'solved',
    label: 'Masalah Sudah Teratasi',
    icon: 'bx bx-check-circle'
  },
  {
    value: 'wrong_category',
    label: 'Kategori Salah',
    icon: 'bx bx-folder-open'
  },
  {
    value: 'wrong_info',
    label: 'Informasi Salah',
    icon: 'bx bx-edit'
  },
  {
    value: 'other',
    label: 'Alasan Lain',
    icon: 'bx bx-dots-horizontal-rounded'
  }
])

const canSubmit = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === 'other') {
    return description.value.trim().length >= 150
  }
  return true
})

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  if (!selectedReason.value) {
    errors.reason = 'Silakan pilih alasan penghapusan'
    return false
  }
  
  if (selectedReason.value === 'other') {
    if (!description.value.trim()) {
      errors.description = 'Deskripsi alasan harus diisi'
      return false
    }
    if (description.value.length < 150) {
      errors.description = 'Deskripsi minimal 150 karakter'
      return false
    }
    if (description.value.length > 1000) {
      errors.description = 'Deskripsi maksimal 1000 karakter'
      return false
    }
  }
  
  return true
}

const submitRequest = async () => {
  if (!validateForm()) {
    return
  }
  
  submitting.value = true
  
  try {
    const payload = {
      reason: selectedReason.value,
      description: selectedReason.value === 'other' ? description.value : null
    }
    
    await api.post(`/tickets/${props.ticket.id}/request-deletion`, payload)
    
    await Swal.fire({
      icon: 'success',
      title: 'Permintaan Terkirim',
      html: `
        <p>Permintaan penghapusan tiket telah diajukan ke admin.</p>
        <p style="font-size: 0.9em; color: #6b7280; margin-top: 1rem;">
          Anda akan menerima notifikasi setelah admin meninjau permintaan Anda.
        </p>
      `,
      confirmButtonColor: '#667eea'
    })
    
    emit('submitted')
    closeModal()
    
  } catch (error) {
    console.error('Error submitting deletion request:', error)
    
    let errorMessage = 'Gagal mengajukan permintaan penghapusan'
    
    if (error.response?.data?.errors) {
      const errorList = error.response.data.errors
      Object.assign(errors, errorList)
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
    submitting.value = false
  }
}

const closeModal = () => {
  selectedReason.value = ''
  description.value = ''
  Object.keys(errors).forEach(key => delete errors[key])
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-dialog {
  width: 100%;
  max-width: 600px;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  position: relative;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
  opacity: 0.95;
}

.btn-close {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

.ticket-info-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #0ea5e9;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0c4a6e;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #075985;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.875rem;
}

.required {
  color: #ef4444;
}

.char-count {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.reason-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}

.reason-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.125rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 90px;
}

.reason-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.reason-card i {
  font-size: 1.75rem;
  color: #64748b;
  transition: all 0.25s ease;
}

.reason-card span {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.25s ease;
}

.reason-card.active {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.reason-card.active i {
  color: #dc2626;
}

.reason-card.active span {
  color: #991b1b;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #fafbfc;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: #ef4444;
  background: white;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.form-textarea.has-error {
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

.warning-box {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-left: 4px solid #f97316;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1.5rem;
}

.warning-box i {
  font-size: 1.25rem;
  color: #f97316;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-box div {
  flex: 1;
  font-size: 0.875rem;
  color: #9a3412;
  line-height: 1.5;
}

.warning-box strong {
  font-weight: 700;
  color: #7c2d12;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  flex: 1;
}

.btn-cancel {
  background: white;
  color: #475569;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5);
}

.btn-cancel:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 576px) {
  .modal-dialog {
    max-width: 95%;
  }

  .modal-header {
    padding: 1.5rem 1.25rem;
  }

  .modal-body {
    padding: 1.5rem 1.25rem;
  }

  .reason-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    padding: 1.25rem;
  }

  .btn-cancel,
  .btn-delete {
    width: 100%;
  }
}
</style>