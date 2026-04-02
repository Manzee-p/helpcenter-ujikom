<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-1">Kategori Management</h4>
        <p class="text-muted small mb-0">Kelola kategori tiket support Anda</p>
      </div>
      <button class="btn btn-primary rounded-pill px-4 shadow-sm" @click="showAddModal">
        <i class="bx bx-plus me-2"></i>Tambah Kategori
      </button>
    </div>

    <!-- Categories List -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="categories.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="bx bx-category bx-lg text-muted mb-3"></i>
            <h6 class="text-muted">Belum ada kategori</h6>
            <p class="text-muted small">Mulai dengan menambahkan kategori pertama Anda</p>
          </div>
        </div>

        <div v-else class="category-list">
          <div 
            v-for="(category, index) in categories" 
            :key="category.id"
            class="category-item"
            :class="{ 'border-bottom': index !== categories.length - 1 }"
          >
            <div class="category-content">
              <!-- Icon & Name -->
              <div class="category-info">
                <div class="category-icon">
                  <i class="bx bx-category"></i>
                </div>
                <div class="category-details">
                  <h6 class="category-name mb-1">{{ category.name }}</h6>
                  <p class="category-description text-muted small mb-0">
                    {{ category.description || 'Tidak ada deskripsi' }}
                  </p>
                </div>
              </div>

              <!-- Stats & Actions -->
              <div class="category-meta">
                <div class="category-stats">
                  <span class="ticket-badge">
                    <i class="bx bx-receipt me-1"></i>
                    {{ category.tickets_count || 0 }} tickets
                  </span>
                  <span 
                    :class="`status-badge ${category.is_active ? 'status-active' : 'status-inactive'}`"
                  >
                    <span class="status-dot"></span>
                    {{ category.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </div>

                <div class="category-actions">
                  <button 
                    class="btn btn-sm btn-icon btn-light"
                    @click="editCategory(category)"
                    title="Edit kategori"
                  >
                    <i class="bx bx-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-icon btn-light-danger"
                    @click="deleteCategory(category)"
                    title="Hapus kategori"
                    :disabled="category.tickets_count > 0"
                  >
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold mb-1">
                {{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
              </h5>
              <p class="text-muted small mb-0">
                {{ editingCategory ? 'Perbarui informasi kategori' : 'Buat kategori untuk mengorganisir tiket' }}
              </p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body pt-3">
              <div class="mb-3">
                <label class="form-label fw-semibold">Nama Kategori <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  v-model="categoryForm.name" 
                  required
                  placeholder="Contoh: Sound System"
                >
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Deskripsi</label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  v-model="categoryForm.description"
                  placeholder="Jelaskan kategori ini secara singkat..."
                ></textarea>
              </div>
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    v-model="categoryForm.is_active"
                    id="isActiveSwitch"
                  >
                  <label class="form-check-label fw-semibold" for="isActiveSwitch">
                    Status Aktif
                  </label>
                  <p class="text-muted small ms-4 mb-0">
                    Kategori aktif dapat dipilih saat membuat tiket baru
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                Batal
              </button>
              <button type="submit" class="btn btn-primary px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bx bx-check me-2"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import api from '@/services/api'
import Swal from 'sweetalert2'

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const editingCategory = ref(null)

const categoryForm = ref({
  name: '',
  description: '',
  is_active: true
})

let categoryModal = null

const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/ticket-categories')
    categories.value = data
  } catch (error) {
    console.error('Gagal mengambil kategori:', error)
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Gagal memuat kategori',
      confirmButtonColor: '#5F61E6'
    })
  } finally {
    loading.value = false
  }
}

const showAddModal = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    description: '',
    is_active: true
  }
  categoryModal.show()
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description || '',
    is_active: category.is_active
  }
  categoryModal.show()
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (editingCategory.value) {
      await api.put(`/admin/categories/${editingCategory.value.id}`, categoryForm.value)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kategori berhasil diperbarui',
        confirmButtonColor: '#5F61E6',
        timer: 2000
      })
    } else {
      await api.post('/admin/categories', categoryForm.value)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kategori berhasil dibuat',
        confirmButtonColor: '#5F61E6',
        timer: 2000
      })
    }
    
    categoryModal.hide()
    fetchCategories()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Gagal menyimpan kategori',
      confirmButtonColor: '#5F61E6'
    })
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (category) => {
  if (category.tickets_count > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Tidak Dapat Menghapus',
      text: 'Kategori ini memiliki tiket aktif. Pindahkan atau selesaikan tiket terlebih dahulu.',
      confirmButtonColor: '#5F61E6'
    })
    return
  }

  const result = await Swal.fire({
    title: 'Hapus Kategori?',
    html: `Anda yakin ingin menghapus kategori <strong>"${category.name}"</strong>?<br><small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EA5455',
    cancelButtonColor: '#E7E7FF',
    cancelButtonText: '<span style="color: #5F61E6">Batal</span>',
    confirmButtonText: 'Ya, Hapus'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/admin/categories/${category.id}`)
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Kategori berhasil dihapus',
        confirmButtonColor: '#5F61E6',
        timer: 2000
      })
      fetchCategories()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.response?.data?.message || 'Gagal menghapus kategori',
        confirmButtonColor: '#5F61E6'
      })
    }
  }
}

onMounted(() => {
  fetchCategories()
  categoryModal = new Modal(document.getElementById('categoryModal'))
})
</script>

<style scoped>
/* Card Styling */
.card {
  border-radius: 12px;
  overflow: hidden;
}

/* Category List */
.category-list {
  padding: 0;
}

.category-item {
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #f8f9fa;
}

.category-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Category Info */
.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-icon i {
  font-size: 24px;
  color: white;
}

.category-details {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: #5e5873;
  margin: 0;
}

.category-description {
  font-size: 0.875rem;
  color: #b9b9c3;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Category Meta */
.category-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.category-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ticket-badge {
  padding: 0.375rem 0.75rem;
  background-color: #e0f4ff;
  color: #00a3ff;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.status-active {
  background-color: #d4f4dd;
  color: #28c76f;
}

.status-inactive {
  background-color: #ffeaea;
  color: #ea5455;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Actions */
.category-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  transition: all 0.2s ease;
}

.btn-light {
  background-color: #f8f8f8;
  color: #5e5873;
}

.btn-light:hover {
  background-color: #e7e7ff;
  color: #5F61E6;
  transform: translateY(-2px);
}

.btn-light-danger {
  background-color: #fff5f5;
  color: #ea5455;
}

.btn-light-danger:hover:not(:disabled) {
  background-color: #ea5455;
  color: white;
  transform: translateY(-2px);
}

.btn-light-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 64px;
  opacity: 0.5;
}

/* Modal Styling */
.modal-content {
  border-radius: 12px;
}

.form-control,
.form-control-lg {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 0.625rem 1rem;
}

.form-control:focus,
.form-control-lg:focus {
  border-color: #5F61E6;
  box-shadow: 0 0 0 0.2rem rgba(95, 97, 230, 0.1);
}

.form-check-input:checked {
  background-color: #5F61E6;
  border-color: #5F61E6;
}

.btn-primary {
  background-color: #5F61E6;
  border-color: #5F61E6;
}

.btn-primary:hover {
  background-color: #5346d4;
  border-color: #5346d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(95, 97, 230, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .category-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-meta {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .category-stats {
    width: 100%;
    justify-content: space-between;
  }

  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>