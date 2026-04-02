<template>
  <div class="user-management">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card bg-gradient-primary text-white">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h3 class="text-white mb-2">
                  <i class="bx bx-user-circle me-2"></i>
                  Manegement User
                </h3>
                <p class="mb-0 opacity-75">Mengelola pengguna sistem, peran, serta izin akses.</p>
              </div>
              <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <button class="btn btn-light" @click="showAddUser">
                  <i class="bx bx-plus me-1"></i> Tambah User Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-lg-3 col-md-6">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted d-block mb-1">Total User</span>
                <h3 class="mb-0">{{ totalUsers }}</h3>
              </div>
              <div class="icon-wrapper bg-label-primary">
                <i class="bx bx-user bx-md"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted d-block mb-1">Admin</span>
                <h3 class="mb-0">{{ adminCount }}</h3>
              </div>
              <div class="icon-wrapper bg-label-danger">
                <i class="bx bx-shield bx-md"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted d-block mb-1">Vendor</span>
                <h3 class="mb-0">{{ vendorCount }}</h3>
              </div>
              <div class="icon-wrapper bg-label-info">
                <i class="bx bx-wrench bx-md"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted d-block mb-1">Client</span>
                <h3 class="mb-0">{{ clientCount }}</h3>
              </div>
              <div class="icon-wrapper bg-label-success">
                <i class="bx bx-group bx-md"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="card-header">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">Daftar User</h5>
          </div>
          <div class="col-md-6">
            <div class="d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
              <!-- Search -->
              <div class="input-group" style="max-width: 250px;">
                <span class="input-group-text">
                  <i class="bx bx-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Cari user..."
                  v-model="searchQuery"
                  @input="handleSearch"
                />
              </div>
              <!-- Role Filter -->
              <select class="form-select" style="max-width: 150px;" v-model="filterRole" @change="fetchUsers">
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center text-muted py-5">
          <i class="bx bx-user-x bx-lg mb-3"></i>
          <p class="mb-0">Tidak ada pengguna yang ditemukan</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Kontak</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar avatar-md me-3">
                      <span class="avatar-initial rounded-circle" :class="`bg-label-${getRoleColor(user.role)}`">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ user.name }}</h6>
                      <small class="text-muted">ID: #{{ user.id }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="mb-1">
                      <i class="bx bx-envelope me-1 text-muted"></i>
                      <small>{{ user.email }}</small>
                    </div>
                    <div v-if="user.phone">
                      <i class="bx bx-phone me-1 text-muted"></i>
                      <small>{{ user.phone }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="`badge bg-${getRoleColor(user.role)}`">
                    <i :class="`bx ${getRoleIcon(user.role)} me-1`"></i>
                    {{ capitalizeRole(user.role) }}
                  </span>
                </td>
                <td>
                  <span :class="`badge bg-${user.is_active ? 'success' : 'secondary'}`">
                    <i :class="`bx ${user.is_active ? 'bx-check-circle' : 'bx-x-circle'} me-1`"></i>
                    {{ user.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">{{ formatDateShort(user.created_at) }}</small>
                </td>
                <td class="text-center">
                  <div class="dropdown position-relative">
                    <button 
                      class="btn btn-sm btn-icon btn-outline-secondary" 
                      type="button"
                      @click="toggleDropdown(user.id)"
                    >
                      <i class="bx bx-dots-vertical-rounded"></i>
                    </button>
                    <ul 
                      class="dropdown-menu dropdown-menu-end" 
                      :class="{ show: openDropdown === user.id }"
                      style="position: absolute; right: 0;"
                    >
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="handleAction(() => editUser(user), user.id)">
                          <i class="bx bx-edit me-2"></i> Edit User
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="handleAction(() => toggleUserStatus(user), user.id)">
                          <i :class="`bx ${user.is_active ? 'bx-x-circle' : 'bx-check-circle'} me-2`"></i>
                          {{ user.is_active ? 'Menonaktifkan' : 'Mengaktifkan' }}
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="handleAction(() => deleteUser(user), user.id)">
                          <i class="bx bx-trash me-2"></i> Delete User
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-4" v-if="totalPages > 1">
            <div>
              <small class="text-muted">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredUsers.length }} users
              </small>
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="javascript:void(0)" @click="previousPage">
                    <i class="bx bx-chevron-left"></i>
                  </a>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="javascript:void(0)" @click="goToPage(page)">
                    {{ page }}
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="javascript:void(0)" @click="nextPage">
                    <i class="bx bx-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser ? 'Edit User' : 'Tambahkan User Baru' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Nama Lengkap *</label>
                <input type="text" class="form-control" v-model="userForm.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input type="email" class="form-control" v-model="userForm.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">No hp</label>
                <input type="text" class="form-control" v-model="userForm.phone">
              </div>
              <div class="mb-3" v-if="!editingUser">
                <label class="form-label">Password *</label>
                <input type="password" class="form-control" v-model="userForm.password" :required="!editingUser" minlength="8">
              </div>
              <div class="mb-3">
                <label class="form-label">Role *</label>
                <select class="form-select" v-model="userForm.role" required>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ saving ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import api from '@/services/api'
import { formatDateShort } from '@/utils/helpers'
import Swal from 'sweetalert2'

const loading = ref(false)
const saving = ref(false)
const users = ref([])
const filterRole = ref('')
const searchQuery = ref('')
const editingUser = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const openDropdown = ref(null)

const userForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'client'
})

let userModal = null

onMounted(() => {
  fetchUsers()
  userModal = new Modal(document.getElementById('userModal'))
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      openDropdown.value = null
    }
  })
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = filterRole.value ? { role: filterRole.value } : {}
    const response = await api.get('/admin/users', { params })
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal mengambil pengguna'
    })
  } finally {
    loading.value = false
  }
}

// Computed Properties
const totalUsers = computed(() => users.value.length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const vendorCount = computed(() => users.value.filter(u => u.role === 'vendor').length)
const clientCount = computed(() => users.value.filter(u => u.role === 'client').length)

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredUsers.value.length))

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Helper Functions
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getRoleColor = (role) => {
  const colors = {
    'admin': 'danger',
    'vendor': 'info',
    'client': 'success'
  }
  return colors[role] || 'secondary'
}

const getRoleIcon = (role) => {
  const icons = {
    'admin': 'bx-shield',
    'vendor': 'bx-wrench',
    'client': 'bx-user'
  }
  return icons[role] || 'bx-user'
}

const capitalizeRole = (role) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const handleSearch = () => {
  currentPage.value = 1
}

// Dropdown Functions
const toggleDropdown = (userId) => {
  openDropdown.value = openDropdown.value === userId ? null : userId
}

const handleAction = (callback, userId) => {
  openDropdown.value = null
  callback()
}

// Pagination Functions
const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// User Actions
const showAddUser = () => {
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client'
  }
  userModal.show()
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    password: '',
    role: user.role
  }
  userModal.show()
}

const saveUser = async () => {
  saving.value = true
  try {
    const formData = { ...userForm.value }
    
    // Remove password if editing and empty
    if (editingUser.value && !formData.password) {
      delete formData.password
    }

    let response
    if (editingUser.value) {
      response = await api.put(`/admin/users/${editingUser.value.id}`, formData)
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User berhasil diperbarui',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      response = await api.post('/admin/users', formData)
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User berhasil ditambahkan',
        timer: 2000,
        showConfirmButton: false
      })
    }

    userModal.hide()
    await fetchUsers()
  } catch (error) {
    console.error('Save user error:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Gagal menyimpan user'
    })
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (user) => {
  const result = await Swal.fire({
    title: `${user.is_active ? 'Menonaktifkan' : 'Mengaktifkan'} User?`,
    html: `Are you sure you want to ${user.is_active ? 'Menonaktifkan' : 'Mengaktifkan'} <strong>${user.name}</strong>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: user.is_active ? '#dc3545' : '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${user.is_active ? 'Menonaktifkan' : 'Mengaktifkan'}`
  })

  if (result.isConfirmed) {
    try {
      await api.patch(`/admin/users/${user.id}`, {
        is_active: !user.is_active
      })
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `User ${user.is_active ? 'menonaktifkan' : 'mengaktifkan'} berhasil`,
        timer: 2000,
        showConfirmButton: false
      })
      
      await fetchUsers()
    } catch (error) {
      await Swal.fire('Error', 'Gagal memperbarui status pengguna', 'error')
    }
  }
}

const deleteUser = async (user) => {
  const result = await Swal.fire({
    title: 'Hapus User?',
    html: `Apakah Anda yakin ingin menghapus <strong>${user.name}</strong>?<br><small class="text-danger">Tindakan ini tidak dapat dibatalkan.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus User'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/admin/users/${user.id}`)
      
      await Swal.fire({
        icon: 'success',
        title: 'Hapus!',
        text: 'User berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      })
      
      await fetchUsers()
    } catch (error) {
      await Swal.fire('Error', error.response?.data?.message || 'Gagal menghapus user', 'error')
    }
  }
}
</script>

<style scoped>
.user-management {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #696cff 0%, #5f61e6 100%);
}

.stat-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.avatar-md .avatar-initial {
  font-size: 1rem;
}

.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
  padding: 1rem 0.75rem;
}

.table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(105, 108, 255, 0.05);
}

.badge {
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  font-size: 0.75rem;
}

.pagination .page-link {
  border: 1px solid #e9ecef;
  color: #696cff;
  margin: 0 2px;
  border-radius: 4px;
}

.pagination .page-item.active .page-link {
  background-color: #696cff;
  border-color: #696cff;
}

.pagination .page-link:hover {
  background-color: rgba(105, 108, 255, 0.1);
  border-color: #696cff;
}

.dropdown-menu {
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  transition: opacity 0.2s, visibility 0.2s;
  opacity: 0;
  visibility: hidden;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  display: block;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: rgba(105, 108, 255, 0.08);
}

.dropdown-item.text-danger:hover {
  background-color: rgba(220, 53, 69, 0.1);
}
</style>