<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">
          <h4 class="fw-bold mb-1">Manajemen Vendor</h4>
          <p class="text-muted mb-0">Kelola dan pantau performa vendor Anda</p>
        </div>
        <button class="btn btn-primary btn-lg shadow-sm" @click="showAddVendorModal">
          <i class="bx bx-plus me-2"></i>Tambah Vendor
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary-subtle">
                <i class="bx bx-group bx-sm text-primary"></i>
              </div>
              <div class="ms-3">
                <p class="text-muted mb-0 small">Total Vendor</p>
                <h5 class="mb-0 fw-bold">{{ vendors.length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success-subtle">
                <i class="bx bx-check-circle bx-sm text-success"></i>
              </div>
              <div class="ms-3">
                <p class="text-muted mb-0 small">Vendor Aktif</p>
                <h5 class="mb-0 fw-bold">{{ vendors.filter(v => v.is_active).length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning-subtle">
                <i class="bx bx-pause-circle bx-sm text-warning"></i>
              </div>
              <div class="ms-3">
                <p class="text-muted mb-0 small">Tidak Aktif</p>
                <h5 class="mb-0 fw-bold">{{ vendors.filter(v => !v.is_active).length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info-subtle">
                <i class="bx bx-file bx-sm text-info"></i>
              </div>
              <div class="ms-3">
                <p class="text-muted mb-0 small">Total Tiket</p>
                <h5 class="mb-0 fw-bold">{{ totalTickets }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-8">
            <div class="search-wrapper">
              <i class="bx bx-search search-icon"></i>
              <input 
                type="text" 
                class="form-control form-control-lg ps-5" 
                v-model="filters.search"
                placeholder="Cari vendor berdasarkan nama, email, atau perusahaan..."
                @input="debounceSearch"
              >
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select form-select-lg" v-model="filters.is_active" @change="fetchVendors">
              <option value="">🔍 Semua Status</option>
              <option value="1">✅ Aktif</option>
              <option value="0">❌ Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Vendors Grid -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3">Memuat data vendor...</p>
    </div>

    <div v-else-if="vendors.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="empty-state">
          <i class="bx bx-user-x bx-lg"></i>
          <h5 class="mt-3 mb-2">Tidak Ada Vendor</h5>
          <p class="text-muted">Belum ada vendor yang terdaftar. Tambahkan vendor baru untuk memulai.</p>
        </div>
      </div>
    </div>

    <div v-else class="row g-3">
      <div v-for="vendor in vendors" :key="vendor.id" class="col-md-6 col-lg-4">
        <div class="card vendor-card border-0 shadow-sm h-100">
          <div class="card-body">
            <!-- Vendor Header -->
            <div class="d-flex align-items-start justify-content-between mb-3">
              <div class="d-flex align-items-center flex-grow-1">
                <div class="vendor-avatar">
                  <span>{{ getInitials(vendor.name) }}</span>
                </div>
                <div class="ms-3 flex-grow-1">
                  <h6 class="mb-0 fw-bold">{{ vendor.name }}</h6>
                  <small class="text-muted">{{ vendor.email }}</small>
                </div>
              </div>
              <div class="dropdown">
                <button 
                  class="btn btn-sm btn-icon"
                  type="button"
                  @click="showActionMenu($event, vendor)"
                >
                  <i class="bx bx-dots-vertical-rounded"></i>
                </button>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="mb-3">
              <span :class="`badge ${vendor.is_active ? 'badge-success-soft' : 'badge-danger-soft'}`">
                <i :class="`bx ${vendor.is_active ? 'bx-check-circle' : 'bx-x-circle'} me-1`"></i>
                {{ vendor.is_active ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </div>

            <!-- Company Info -->
            <div class="company-info mb-3">
              <div class="info-item">
                <i class="bx bx-buildings text-muted"></i>
                <span>{{ vendor.company_name || 'Tidak ada perusahaan' }}</span>
              </div>
              <div class="info-item" v-if="vendor.company_phone">
                <i class="bx bx-phone text-muted"></i>
                <span>{{ vendor.company_phone }}</span>
              </div>
              <div class="info-item" v-if="vendor.specialization">
                <i class="bx bx-briefcase text-muted"></i>
                <span>{{ vendor.specialization }}</span>
              </div>
            </div>

            <!-- Performance Stats -->
            <div v-if="vendor.performance" class="performance-stats">
              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-label">Total Tiket</span>
                  <span class="stat-value">{{ vendor.performance.total_tickets }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Selesai</span>
                  <span class="stat-value text-success">{{ vendor.performance.resolved_tickets }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">SLA</span>
                  <span class="stat-value text-primary">{{ vendor.performance.sla_compliance_rate }}%</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-3">
              <button class="btn btn-outline-primary btn-sm w-100" @click="viewVendorDetails(vendor)">
                <i class="bx bx-show me-1"></i>Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Menu -->
    <Teleport to="body">
      <div 
        v-if="actionMenu.show" 
        class="modern-dropdown-menu"
        :style="{ top: actionMenu.y + 'px', left: actionMenu.x + 'px' }"
      >
        <div class="dropdown-item" @click="viewVendorDetails(actionMenu.vendor)">
          <i class="bx bx-show"></i>
          <span>Lihat Detail</span>
        </div>
        <div class="dropdown-item" @click="editVendor(actionMenu.vendor)">
          <i class="bx bx-edit"></i>
          <span>Edit Vendor</span>
        </div>
        <div class="dropdown-item" @click="toggleVendorStatus(actionMenu.vendor)">
          <i :class="`bx ${actionMenu.vendor.is_active ? 'bx-block' : 'bx-check'}`"></i>
          <span>{{ actionMenu.vendor.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item text-danger" @click="deleteVendor(actionMenu.vendor)">
          <i class="bx bx-trash"></i>
          <span>Hapus Vendor</span>
        </div>
      </div>
      <div 
        v-if="actionMenu.show" 
        class="dropdown-backdrop" 
        @click="closeActionMenu"
      ></div>
    </Teleport>

    <!-- Add/Edit Vendor Modal -->
    <div class="modal fade" id="vendorModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold">{{ editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru' }}</h5>
              <p class="text-muted small mb-0">{{ editingVendor ? 'Perbarui informasi vendor' : 'Isi formulir untuk menambahkan vendor' }}</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveVendor">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Nama Lengkap <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-lg" v-model="vendorForm.name" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
                  <input type="email" class="form-control form-control-lg" v-model="vendorForm.email" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">No Telepon</label>
                  <input type="text" class="form-control form-control-lg" v-model="vendorForm.phone">
                </div>
                <div class="col-md-6" v-if="!editingVendor">
                  <label class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                  <input type="password" class="form-control form-control-lg" v-model="vendorForm.password" :required="!editingVendor" minlength="8">
                </div>
                <div class="col-12"><hr class="my-2"></div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Nama Perusahaan</label>
                  <input type="text" class="form-control form-control-lg" v-model="vendorForm.company_name">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">No Telepon Perusahaan</label>
                  <input type="text" class="form-control form-control-lg" v-model="vendorForm.company_phone">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Alamat Perusahaan</label>
                  <textarea class="form-control" rows="2" v-model="vendorForm.company_address"></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Spesialisasi</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    v-model="vendorForm.specialization"
                    placeholder="Contoh: Audio System, Lighting, Stage Setup"
                  >
                  <small class="text-muted">Pisahkan dengan koma untuk beberapa spesialisasi</small>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Menyimpan...' : 'Simpan Vendor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Vendor Details Modal -->
    <div class="modal fade" id="vendorDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">Detail Vendor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedVendor">
            <div class="row g-4">
              <!-- Left Column - Vendor Info -->
              <div class="col-lg-4">
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-body text-center">
                    <div class="vendor-avatar-lg mb-3">
                      <span>{{ getInitials(selectedVendor.name) }}</span>
                    </div>
                    <h5 class="mb-1">{{ selectedVendor.name }}</h5>
                    <p class="text-muted mb-2">{{ selectedVendor.email }}</p>
                    <span :class="`badge ${selectedVendor.is_active ? 'badge-success-soft' : 'badge-danger-soft'}`">
                      {{ selectedVendor.is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </div>
                </div>

                <div class="card border-0 shadow-sm">
                  <div class="card-body">
                    <h6 class="mb-3 fw-bold">Informasi Perusahaan</h6>
                    <div class="detail-item">
                      <small class="text-muted">Perusahaan</small>
                      <p class="mb-2 fw-semibold">{{ selectedVendor.company_name || '-' }}</p>
                    </div>
                    <div class="detail-item">
                      <small class="text-muted">Alamat</small>
                      <p class="mb-2">{{ selectedVendor.company_address || '-' }}</p>
                    </div>
                    <div class="detail-item">
                      <small class="text-muted">Telepon</small>
                      <p class="mb-2">{{ selectedVendor.company_phone || '-' }}</p>
                    </div>
                    <div class="detail-item">
                      <small class="text-muted">Spesialisasi</small>
                      <p class="mb-0 fw-semibold">{{ selectedVendor.specialization || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column - Performance -->
              <div class="col-lg-8" v-if="vendorPerformance">
                <div class="row g-3 mb-4">
                  <div class="col-md-4">
                    <div class="card stat-card border-0 shadow-sm h-100">
                      <div class="card-body">
                        <div class="d-flex align-items-center">
                          <div class="stat-icon bg-primary-subtle">
                            <i class="bx bx-file bx-sm text-primary"></i>
                          </div>
                          <div class="ms-3">
                            <p class="text-muted mb-0 small">Total Tiket</p>
                            <h4 class="mb-0 fw-bold">{{ vendorPerformance.total_tickets }}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card stat-card border-0 shadow-sm h-100">
                      <div class="card-body">
                        <div class="d-flex align-items-center">
                          <div class="stat-icon bg-success-subtle">
                            <i class="bx bx-check-circle bx-sm text-success"></i>
                          </div>
                          <div class="ms-3">
                            <p class="text-muted mb-0 small">Terselesaikan</p>
                            <h4 class="mb-0 fw-bold">{{ vendorPerformance.resolved_tickets }}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card stat-card border-0 shadow-sm h-100">
                      <div class="card-body">
                        <div class="d-flex align-items-center">
                          <div class="stat-icon bg-info-subtle">
                            <i class="bx bx-time bx-sm text-info"></i>
                          </div>
                          <div class="ms-3">
                            <p class="text-muted mb-0 small">SLA Rate</p>
                            <h4 class="mb-0 fw-bold">{{ vendorPerformance.sla_compliance_rate }}%</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Recent Tickets -->
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-white border-0 py-3">
                    <h6 class="mb-0 fw-bold">Tiket Terbaru</h6>
                  </div>
                  <div class="card-body">
                    <div v-if="vendorPerformance.recent_tickets && vendorPerformance.recent_tickets.length > 0" class="ticket-list">
                      <div v-for="ticket in vendorPerformance.recent_tickets" :key="ticket.id" class="ticket-item">
                        <div class="d-flex align-items-start">
                          <div class="ticket-icon">
                            <i class="bx bx-file"></i>
                          </div>
                          <div class="flex-grow-1 ms-3">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                              <div>
                                <span class="fw-bold">{{ ticket.ticket_number }}</span>
                                <p class="mb-1 text-muted small">{{ truncate(ticket.title, 40) }}</p>
                              </div>
                              <small class="text-muted">{{ timeAgo(ticket.created_at) }}</small>
                            </div>
                            <div class="d-flex gap-2">
                              <span :class="`badge badge-${getStatusColor(ticket.status)}-soft small`">
                                {{ formatStatus(ticket.status) }}
                              </span>
                              <span :class="`badge badge-${getPriorityColor(ticket.priority)}-soft small`">
                                {{ formatPriority(ticket.priority) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center py-4">
                      <i class="bx bx-inbox bx-lg text-muted"></i>
                      <p class="text-muted mt-2 mb-0">Tidak ada tiket terbaru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Modal } from 'bootstrap'
import api from '@/services/api'
import Swal from 'sweetalert2'
import {
  getInitials,
  getPriorityColor,
  getStatusColor,
  formatPriority,
  formatStatus,
  timeAgo,
  truncate,
  debounce
} from '@/utils/helpers'

const vendors = ref([])
const loading = ref(false)
const saving = ref(false)
const editingVendor = ref(null)
const selectedVendor = ref(null)
const vendorPerformance = ref(null)

const filters = ref({
  search: '',
  is_active: ''
})

const vendorForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  company_name: '',
  company_address: '',
  company_phone: '',
  specialization: ''
})

const actionMenu = ref({
  show: false,
  x: 0,
  y: 0,
  vendor: null
})

const totalTickets = computed(() => {
  return vendors.value.reduce((sum, vendor) => {
    return sum + (vendor.performance?.total_tickets || 0)
  }, 0)
})

let vendorModal = null
let detailsModal = null

const fetchVendors = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.is_active !== '') params.is_active = filters.value.is_active
    
    const { data } = await api.get('/admin/vendors', { params })
    vendors.value = data
  } catch (error) {
    console.error('Gagal mengambil vendor:', error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal memuat vendor', 'error')
  } finally {
    loading.value = false
  }
}

const debounceSearch = debounce(() => {
  fetchVendors()
}, 500)

const showActionMenu = (event, vendor) => {
  event.stopPropagation()
  const button = event.target.closest('button')
  if (!button) return
  
  const rect = button.getBoundingClientRect()
  const scrollY = window.scrollY || window.pageYOffset
  const scrollX = window.scrollX || window.pageXOffset
  
  let x = rect.left + scrollX - 180
  let y = rect.bottom + scrollY + 5
  
  if (x < 0) x = rect.right + scrollX + 5
  
  actionMenu.value = { show: true, x, y, vendor }
}

const closeActionMenu = () => {
  actionMenu.value.show = false
}

const showAddVendorModal = () => {
  closeActionMenu()
  editingVendor.value = null
  vendorForm.value = {
    name: '', email: '', phone: '', password: '',
    company_name: '', company_address: '', company_phone: '', specialization: ''
  }
  vendorModal.show()
}

const editVendor = (vendor) => {
  closeActionMenu()
  editingVendor.value = vendor
  vendorForm.value = {
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone || '',
    company_name: vendor.company_name || '',
    company_address: vendor.company_address || '',
    company_phone: vendor.company_phone || '',
    specialization: vendor.specialization || ''
  }
  vendorModal.show()
}

const saveVendor = async () => {
  saving.value = true
  try {
    const formData = {
      name: vendorForm.value.name,
      email: vendorForm.value.email,
      phone: vendorForm.value.phone || null,
      role: 'vendor',
      company_name: vendorForm.value.company_name || null,
      company_address: vendorForm.value.company_address || null,
      company_phone: vendorForm.value.company_phone || null,
      specialization: vendorForm.value.specialization || null
    }

    if (!editingVendor.value && vendorForm.value.password) {
      formData.password = vendorForm.value.password
    }

    if (editingVendor.value) {
      await api.put(`/admin/users/${editingVendor.value.id}`, formData)
      await Swal.fire('Berhasil', 'Vendor berhasil diperbarui', 'success')
    } else {
      await api.post('/admin/users', formData)
      await Swal.fire('Berhasil', 'Vendor berhasil ditambahkan', 'success')
    }

    vendorModal.hide()
    await fetchVendors()
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan vendor'
    if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat().join('<br>')
      await Swal.fire('Error Validasi', errors, 'error')
    } else {
      await Swal.fire('Error', errorMessage, 'error')
    }
  } finally {
    saving.value = false
  }
}

const viewVendorDetails = async (vendor) => {
  closeActionMenu()
  selectedVendor.value = vendor
  try {
    const { data } = await api.get(`/admin/vendors/${vendor.id}`)
    vendorPerformance.value = data.performance
    detailsModal.show()
  } catch (error) {
    Swal.fire('Error', 'Gagal memuat detail vendor', 'error')
  }
}

const toggleVendorStatus = async (vendor) => {
  closeActionMenu()
  try {
    await api.patch(`/admin/users/${vendor.id}`, { is_active: !vendor.is_active })
    vendor.is_active = !vendor.is_active
    Swal.fire('Berhasil', 'Status vendor diperbarui', 'success')
  } catch (error) {
    Swal.fire('Error', 'Gagal memperbarui status', 'error')
  }
}

const deleteVendor = async (vendor) => {
  closeActionMenu()
  const result = await Swal.fire({
    title: 'Hapus Vendor?',
    text: 'Tindakan ini tidak dapat dibatalkan',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Hapus'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/admin/users/${vendor.id}`)
      Swal.fire('Terhapus', 'Vendor berhasil dihapus', 'success')
      fetchVendors()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal menghapus vendor', 'error')
    }
  }
}

const handleClickOutside = (event) => {
  if (actionMenu.value.show && !event.target.closest('.modern-dropdown-menu') && !event.target.closest('button')) {
    closeActionMenu()
  }
}

onMounted(() => {
  fetchVendors()
  vendorModal = new Modal(document.getElementById('vendorModal'))
  detailsModal = new Modal(document.getElementById('vendorDetailsModal'))
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Modern Styles */
.page-header h4 {
  color: #2c3e50;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 20px;
}

.vendor-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.vendor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}

.vendor-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
  flex-shrink: 0;
}

.vendor-avatar-lg {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 36px;
}

.badge-success-soft {
  background-color: #d4edda;
  color: #155724;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.badge-danger-soft {
  background-color: #f8d7da;
  color: #721c24;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.badge-primary-soft {
  background-color: #cfe2ff;
  color: #084298;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.badge-warning-soft {
  background-color: #fff3cd;
  color: #856404;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.badge-info-soft {
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.company-info .info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #495057;
  border-bottom: 1px solid #f0f0f0;
}

.company-info .info-item:last-child {
  border-bottom: none;
}

.company-info .info-item i {
  font-size: 18px;
  width: 20px;
}

.performance-stats {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 16px;
  border-radius: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 4px;
}

.modern-dropdown-menu {
  position: absolute;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 200px;
  padding: 8px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.modern-dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
}

.modern-dropdown-menu .dropdown-item i {
  font-size: 18px;
  width: 20px;
}

.modern-dropdown-menu .dropdown-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 8px 0;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}

.empty-state i {
  font-size: 64px;
  color: #cbd5e0;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-item {
  padding: 16px;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.ticket-item:hover {
  background-color: #e9ecef;
}

.ticket-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.form-control, .form-select {
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px 16px;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.1);
}

.btn {
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f8f9fa;
}

.modal-content {
  border-radius: 16px;
}

.bg-primary-subtle {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

.bg-success-subtle {
  background-color: rgba(40, 167, 69, 0.1) !important;
}

.bg-warning-subtle {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.bg-info-subtle {
  background-color: rgba(13, 202, 240, 0.1) !important;
}

.page-header { 
  margin-bottom: 24px; 
}
.page-header .btn {
  height: 40px;
}
.page-header .btn i {
  font-size: 20px;
}
</style>