<template>
  <div class="settings-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="bx bx-cog"></i>
          Pengaturan Akun
        </h1>
        <p class="page-subtitle">Kelola profil dan preferensi akun Anda</p>
      </div>
    </div>

    <!-- Settings Tabs - CLIENT VERSION (6 TABS) -->
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i class="bx" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      
      <!-- Profile Tab -->
      <div v-show="activeTab === 'profile'" class="settings-section">
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Informasi Profil</h3>
              <p>Update informasi profil dan foto Anda</p>
            </div>
          </div>
          <div class="card-body">
            <!-- Avatar Upload -->
            <div class="avatar-section">
              <div class="avatar-preview">
                <img 
                  v-if="displayAvatarUrl" 
                  :src="displayAvatarUrl" 
                  alt="Avatar"
                  @error="handleImageError"
                  style="width: 100%; height: 100%; object-fit: cover;"
                >
                <div v-else class="avatar-placeholder">
                  <span>{{ authStore.userInitials }}</span>
                </div>
              </div>
              <div class="avatar-actions">
                <label class="btn-upload">
                  <i class="bx bx-upload"></i>
                  Upload Foto
                  <input 
                    type="file" 
                    ref="avatarInput"
                    accept="image/*" 
                    @change="handleAvatarChange"
                    hidden
                  >
                </label>
                <button 
                  v-if="authStore.userAvatar || avatarPreview" 
                  class="btn-remove"
                  @click="removeAvatar"
                  :disabled="saving"
                >
                  <i class="bx bx-trash"></i>
                  Hapus
                </button>
                <p class="avatar-hint">JPG, PNG atau GIF. Max 2MB</p>
              </div>
            </div>

            <!-- Profile Form -->
            <form @submit.prevent="updateProfile" class="settings-form">
              <!-- Nama Lengkap & Email -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nama Lengkap <span class="required">*</span></label>
                  <input 
                    v-model="profileForm.name" 
                    type="text" 
                    class="form-control"
                    placeholder="Masukkan nama lengkap"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Email <span class="required">*</span></label>
                  <input 
                    v-model="profileForm.email" 
                    type="email" 
                    class="form-control"
                    placeholder="email@example.com"
                    required
                  >
                </div>
              </div>

              <!-- Nomor Telepon & Kontak Darurat -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nomor Telepon / WhatsApp</label>
                  <input 
                    v-model="profileForm.phone" 
                    type="tel" 
                    class="form-control"
                    placeholder="+62 812 3456 7890"
                  >
                  <p class="form-hint">Nomor yang bisa dihubungi via telepon atau WhatsApp</p>
                </div>
                <div class="form-group">
                  <label>Kontak Darurat</label>
                  <input 
                    v-model="profileForm.emergency_contact" 
                    type="tel" 
                    class="form-control"
                    placeholder="+62 812 3456 7890"
                  >
                  <p class="form-hint">Nomor keluarga/kerabat yang bisa dihubungi</p>
                </div>
              </div>

              <!-- Nama Kontak Darurat & Hubungan -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nama Kontak Darurat</label>
                  <input 
                    v-model="profileForm.emergency_contact_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Nama keluarga/kerabat"
                  >
                </div>
                <div class="form-group">
                  <label>Hubungan</label>
                  <select v-model="profileForm.emergency_contact_relation" class="form-control">
                    <option value="">Pilih Hubungan</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Suami/Istri">Suami/Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Kerabat">Kerabat</option>
                    <option value="Teman">Teman</option>
                  </select>
                </div>
              </div>

              <!-- Alamat Lengkap -->
              <div class="form-group">
                <label>Alamat Lengkap</label>
                <textarea 
                  v-model="profileForm.address" 
                  class="form-control"
                  rows="3"
                  placeholder="Jalan, Nomor, RT/RW, Kelurahan..."
                ></textarea>
              </div>

              <!-- Kota & Provinsi -->
              <div class="form-row">
                <div class="form-group">
                  <label>Kota/Kabupaten</label>
                  <input 
                    v-model="profileForm.city" 
                    type="text" 
                    class="form-control"
                    placeholder="Contoh: Bandung"
                  >
                </div>
                <div class="form-group">
                  <label>Provinsi</label>
                  <select v-model="profileForm.province" class="form-control">
                    <option value="">Pilih Provinsi</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <!-- Add more provinces as needed -->
                  </select>
                </div>
              </div>

              <!-- Kode Pos & Jenis Kelamin -->
              <div class="form-row">
                <div class="form-group">
                  <label>Kode Pos</label>
                  <input 
                    v-model="profileForm.postal_code" 
                    type="text" 
                    class="form-control"
                    placeholder="40xxx"
                    maxlength="5"
                  >
                </div>
                <div class="form-group">
                  <label>Jenis Kelamin</label>
                  <select v-model="profileForm.gender" class="form-control">
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <!-- Tanggal Lahir & NIK -->
              <div class="form-row">
                <div class="form-group">
                  <label>Tanggal Lahir</label>
                  <input 
                    v-model="profileForm.birth_date" 
                    type="date" 
                    class="form-control"
                  >
                </div>
                <div class="form-group">
                  <label>NIK (Nomor Induk Kependudukan)</label>
                  <input 
                    v-model="profileForm.nik" 
                    type="text" 
                    class="form-control"
                    placeholder="16 digit NIK"
                    maxlength="16"
                  >
                  <p class="form-hint">Data pribadi ini dilindungi dan tidak akan ditampilkan publik</p>
                </div>
              </div>

              <!-- Bio -->
              <div class="form-group">
                <label>Bio / Catatan Tambahan</label>
                <textarea 
                  v-model="profileForm.bio" 
                  class="form-control"
                  rows="4"
                  placeholder="Ceritakan tentang diri Anda atau catatan penting lainnya..."
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetProfileForm" :disabled="saving">
                  <i class="bx bx-reset"></i>
                  Reset
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                  {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Communication Tab -->
      <div v-show="activeTab === 'communication'" class="settings-section">
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Riwayat Komunikasi</h3>
              <p>Semua interaksi Anda dengan sistem dan vendor</p>
            </div>
            <button 
              v-if="!loadingComms" 
              class="btn-refresh" 
              @click="loadCommunications"
              title="Refresh"
            >
              <i class="bx bx-refresh"></i>
            </button>
          </div>
          <div class="card-body">
            <!-- Communication Stats -->
            <div class="comm-stats">
              <div class="stat-card">
                <i class="bx bx-message-dots"></i>
                <div>
                  <h4>{{ commStats.messages }}</h4>
                  <p>Pesan</p>
                </div>
              </div>
              <div class="stat-card">
                <i class="bx bx-envelope"></i>
                <div>
                  <h4>{{ commStats.emails }}</h4>
                  <p>Email</p>
                </div>
              </div>
              <div class="stat-card">
                <i class="bx bx-bell"></i>
                <div>
                  <h4>{{ commStats.notifications }}</h4>
                  <p>Notifikasi</p>
                </div>
              </div>
              <div class="stat-card">
                <i class="bx bx-phone"></i>
                <div>
                  <h4>{{ commStats.calls }}</h4>
                  <p>Panggilan</p>
                </div>
              </div>
            </div>

            <!-- Communication List -->
            <div v-if="loadingComms" class="loading-state">
              <i class="bx bx-loader-alt bx-spin"></i>
              <p>Memuat riwayat komunikasi...</p>
            </div>
            <div v-else-if="communications.length === 0" class="empty-state">
              <i class="bx bx-chat"></i>
              <p>Belum ada riwayat komunikasi</p>
            </div>
            <div v-else class="comm-list">
              <div v-for="comm in communications" :key="comm.id" class="comm-item">
                <div class="comm-icon" :class="getCommTypeClass(comm.type)">
                  <i class="bx" :class="getCommIcon(comm.type)"></i>
                </div>
                <div class="comm-info">
                  <h4>{{ comm.subject }}</h4>
                  <p>{{ comm.message }}</p>
                  <div class="comm-meta">
                    <span class="comm-from">{{ comm.from }}</span>
                    <span class="comm-time">{{ formatTime(comm.created_at) }}</span>
                  </div>
                </div>
                <span :class="['comm-status', comm.read ? 'read' : 'unread']">
                  {{ comm.read ? 'Dibaca' : 'Baru' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Tab -->
      <div v-show="activeTab === 'help'" class="settings-section">
        <!-- FAQ Section -->
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Pertanyaan Umum (FAQ)</h3>
              <p>Jawaban untuk pertanyaan yang sering diajukan</p>
            </div>
          </div>
          <div class="card-body">
            <div class="faq-list">
              <div v-for="faq in faqs" :key="faq.id" class="faq-item">
                <button 
                  class="faq-question" 
                  @click="toggleFAQ(faq.id)"
                  :class="{ active: expandedFAQ === faq.id }"
                >
                  <span>{{ faq.question }}</span>
                  <i class="bx" :class="expandedFAQ === faq.id ? 'bx-chevron-up' : 'bx-chevron-down'"></i>
                </button>
                <div v-show="expandedFAQ === faq.id" class="faq-answer">
                  <p>{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Kirim Pesan ke Support</h3>
              <p>Tim kami siap membantu Anda</p>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="sendSupportMessage" class="settings-form">
              <div class="form-group">
                <label>Kategori <span class="required">*</span></label>
                <select v-model="supportForm.category" class="form-control" required>
                  <option value="">Pilih kategori...</option>
                  <option value="technical">Masalah Teknis</option>
                  <option value="account">Akun & Profil</option>
                  <option value="billing">Billing & Pembayaran</option>
                  <option value="feature">Fitur & Permintaan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div class="form-group">
                <label>Subjek <span class="required">*</span></label>
                <input 
                  v-model="supportForm.subject" 
                  type="text" 
                  class="form-control"
                  placeholder="Ringkasan masalah Anda"
                  required
                >
              </div>

              <div class="form-group">
                <label>Pesan <span class="required">*</span></label>
                <textarea 
                  v-model="supportForm.message" 
                  class="form-control"
                  rows="6"
                  placeholder="Jelaskan masalah Anda secara detail..."
                  required
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="sendingSupport">
                  <i class="bx" :class="sendingSupport ? 'bx-loader-alt bx-spin' : 'bx-send'"></i>
                  {{ sendingSupport ? 'Mengirim...' : 'Kirim Pesan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Security Tab -->
      <div v-show="activeTab === 'security'" class="settings-section">
        <!-- Change Password -->
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Ubah Password</h3>
              <p>Pastikan akun Anda menggunakan password yang kuat</p>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword" class="settings-form">
              <div class="form-group">
                <label>Password Saat Ini <span class="required">*</span></label>
                <div class="password-input">
                  <input 
                    v-model="passwordForm.currentPassword" 
                    :type="showCurrentPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Masukkan password saat ini"
                    required
                  >
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i class="bx" :class="showCurrentPassword ? 'bx-hide' : 'bx-show'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Password Baru <span class="required">*</span></label>
                <div class="password-input">
                  <input 
                    v-model="passwordForm.newPassword" 
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Masukkan password baru (min. 8 karakter)"
                    required
                    minlength="8"
                  >
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i class="bx" :class="showNewPassword ? 'bx-hide' : 'bx-show'"></i>
                  </button>
                </div>
                <div class="password-strength" v-if="passwordForm.newPassword">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :class="passwordStrength.class"
                      :style="{ width: passwordStrength.width }"
                    ></div>
                  </div>
                  <span class="strength-text" :class="passwordStrength.class">
                    {{ passwordStrength.text }}
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label>Konfirmasi Password Baru <span class="required">*</span></label>
                <div class="password-input">
                  <input 
                    v-model="passwordForm.confirmPassword" 
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Konfirmasi password baru"
                    required
                  >
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i class="bx" :class="showConfirmPassword ? 'bx-hide' : 'bx-show'"></i>
                  </button>
                </div>
                <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && !passwordsMatch" class="error-text">
                  <i class="bx bx-error-circle"></i>
                  Password tidak cocok
                </p>
                <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordsMatch" class="success-text">
                  <i class="bx bx-check-circle"></i>
                  Password cocok
                </p>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetPasswordForm" :disabled="saving">
                  <i class="bx bx-reset"></i>
                  Reset
                </button>
                <button 
                  type="submit" 
                  class="btn-primary" 
                  :disabled="!passwordsMatch || !passwordForm.currentPassword || saving"
                >
                  <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-key'"></i>
                  {{ saving ? 'Mengubah...' : 'Ubah Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Login Activity -->
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Aktivitas Login Terakhir</h3>
              <p>Monitor aktivitas login ke akun Anda</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="lastLogin" class="last-login-info">
              <i class="bx bx-time-five"></i>
              <div>
                <h4>Login Terakhir</h4>
                <p>{{ formatTime(lastLogin.logged_in_at) }} • {{ lastLogin.location }}</p>
                <span class="login-device">{{ lastLogin.device }} • {{ lastLogin.browser }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="bx bx-info-circle"></i>
              <p>Tidak ada data login</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Tab -->
      <div v-show="activeTab === 'notifications'" class="settings-section">
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Preferensi Notifikasi</h3>
              <p>Pilih notifikasi yang ingin Anda terima</p>
            </div>
          </div>
          <div class="card-body">
            <div class="notification-settings">
              <div 
                v-for="setting in notificationSettings" 
                :key="setting.id"
                class="notification-item"
              >
                <div class="notification-icon">
                  <i class="bx" :class="setting.icon"></i>
                </div>
                <div class="notification-info">
                  <h4>{{ setting.title }}</h4>
                  <p>{{ setting.description }}</p>
                </div>
                <div class="notification-toggles">
                  <div class="toggle-option">
                    <span>Email</span>
                    <div class="toggle-switch small">
                      <input 
                        type="checkbox" 
                        :id="`${setting.id}-email`"
                        v-model="setting.email"
                      >
                      <label :for="`${setting.id}-email`"></label>
                    </div>
                  </div>
                  <div class="toggle-option">
                    <span>Push</span>
                    <div class="toggle-switch small">
                      <input 
                        type="checkbox" 
                        :id="`${setting.id}-push`"
                        v-model="setting.push"
                      >
                      <label :for="`${setting.id}-push`"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveNotificationSettings" :disabled="saving">
                <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan Preferensi' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences Tab -->
      <div v-show="activeTab === 'preferences'" class="settings-section">
        <div class="section-card">
          <div class="card-header">
            <div>
              <h3>Preferensi Aplikasi</h3>
              <p>Sesuaikan tampilan dan pengalaman aplikasi Anda</p>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="savePreferences" class="settings-form">
              <div class="preference-group">
                <label>Tema</label>
                <div class="theme-options">
                  <label 
                    v-for="theme in themes" 
                    :key="theme.id"
                    :class="['theme-option', { active: preferences.theme === theme.id }]"
                  >
                    <input 
                      type="radio" 
                      name="theme" 
                      :value="theme.id"
                      v-model="preferences.theme"
                      hidden
                    >
                    <i class="bx" :class="theme.icon"></i>
                    <span>{{ theme.label }}</span>
                  </label>
                </div>
              </div>

              <div class="preference-group">
                <label>Bahasa</label>
                <select v-model="preferences.language" class="form-control">
                  <option value="id">🇮🇩 Bahasa Indonesia</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div class="preference-group">
                <label>Zona Waktu</label>
                <select v-model="preferences.timezone" class="form-control">
                  <option value="Asia/Jakarta">WIB - Jakarta (GMT+7)</option>
                  <option value="Asia/Makassar">WITA - Makassar (GMT+8)</option>
                  <option value="Asia/Jayapura">WIT - Jayapura (GMT+9)</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="saving">
                  <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                  {{ saving ? 'Menyimpan...' : 'Simpan Preferensi' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import api from '@/services/api'

const authStore = useAuthStore()

// Tabs
const tabs = [
  { id: 'profile', label: 'Profil', icon: 'bx-user' },
  { id: 'communication', label: 'Komunikasi', icon: 'bx-message-dots' },
  { id: 'help', label: 'Bantuan', icon: 'bx-help-circle' },
  { id: 'security', label: 'Password', icon: 'bx-key' },
  { id: 'notifications', label: 'Notifikasi', icon: 'bx-bell' },
  { id: 'preferences', label: 'Preferensi', icon: 'bx-cog' }
]

const activeTab = ref('profile')

// Profile
const avatarInput = ref(null)
const avatarPreview = ref(null)
const selectedFile = ref(null)
const imageError = ref(false)

const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  emergency_contact: '',
  emergency_contact_name: '',
  emergency_contact_relation: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
  gender: '',
  birth_date: '',
  nik: '',
  bio: ''
})

// ✅ FIXED: Computed for display avatar URL with proper fallback
const displayAvatarUrl = computed(() => {
  // If there's an error loading image, return null to show initials
  if (imageError.value) return null
  
  // Prioritize preview if file is selected
  if (avatarPreview.value) return avatarPreview.value
  
  // Use auth store avatar
  if (authStore.userAvatar) {
    return authStore.userAvatar
  }
  
  return null
})

// Security
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const lastLogin = ref(null)

// Communication
const communications = ref([])
const loadingComms = ref(false)
const commStats = ref({
  messages: 0,
  emails: 0,
  notifications: 0,
  calls: 0
})

// Help
const expandedFAQ = ref(null)
const faqs = ref([
  {
    id: 1,
    question: 'Bagaimana cara membuat tiket baru?',
    answer: 'Klik tombol "Buat Laporan" di dashboard, isi form dengan detail masalah Anda, upload foto jika perlu, lalu klik submit.'
  },
  {
    id: 2,
    question: 'Berapa lama waktu respons dari vendor?',
    answer: 'Vendor biasanya merespons dalam 24 jam kerja. Untuk masalah urgent, Anda bisa menandai tiket sebagai "High Priority".'
  }
])

const supportForm = ref({
  category: '',
  subject: '',
  message: ''
})
const sendingSupport = ref(false)

// Notifications
const notificationSettings = ref([
  {
    id: 'ticket-update',
    title: 'Update Tiket',
    description: 'Notifikasi ketika ada update pada tiket Anda',
    icon: 'bx-refresh',
    email: true,
    push: true
  },
  {
    id: 'ticket-comment',
    title: 'Komentar Baru',
    description: 'Notifikasi ketika ada balasan pada tiket Anda',
    icon: 'bx-message-dots',
    email: true,
    push: true
  }
])

// Preferences
const themes = [
  { id: 'light', label: 'Terang', icon: 'bx-sun' },
  { id: 'dark', label: 'Gelap', icon: 'bx-moon' },
  { id: 'auto', label: 'Otomatis', icon: 'bx-adjust' }
]

const preferences = ref({
  theme: 'light',
  language: 'id',
  timezone: 'Asia/Jakarta'
})

// State
const saving = ref(false)

// Computed
const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword
  if (!password) return { width: '0%', class: '', text: '' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++
  
  const levels = [
    { width: '20%', class: 'weak', text: 'Sangat Lemah' },
    { width: '40%', class: 'weak', text: 'Lemah' },
    { width: '60%', class: 'medium', text: 'Sedang' },
    { width: '80%', class: 'strong', text: 'Kuat' },
    { width: '100%', class: 'strong', text: 'Sangat Kuat' }
  ]
  
  return levels[Math.min(strength, 4)]
})

const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

// Helper Methods
const formatTime = (datetime) => {
  if (!datetime) return '-'
  
  try {
    const date = new Date(datetime)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return datetime
  }
}

const getCommIcon = (type) => {
  const iconMap = {
    'message': 'bx-message-dots',
    'email': 'bx-envelope',
    'notification': 'bx-bell',
    'call': 'bx-phone',
    'system': 'bx-info-circle'
  }
  return iconMap[type] || 'bx-chat'
}

const getCommTypeClass = (type) => {
  const classMap = {
    'message': 'type-message',
    'email': 'type-email',
    'notification': 'type-notification',
    'call': 'type-call',
    'system': 'type-system'
  }
  return classMap[type] || 'type-message'
}

// ✅ FIXED: Load communications with proper error handling
const loadCommunications = async () => {
  try {
    loadingComms.value = true
    const response = await api.get('/client/settings/communications')
    
    if (response.data.success) {
      communications.value = response.data.data.communications || []
      commStats.value = response.data.data.stats || commStats.value
      console.log('✅ Communications loaded:', communications.value.length)
    }
  } catch (error) {
    console.error('❌ Load communications error:', error)
    // Fail silently - keep empty state
  } finally {
    loadingComms.value = false
  }
}

// FAQ Methods
const toggleFAQ = (faqId) => {
  expandedFAQ.value = expandedFAQ.value === faqId ? null : faqId
}

// ✅ FIXED: Send support message
const sendSupportMessage = async () => {
  try {
    sendingSupport.value = true
    
    await api.post('/client/settings/support', supportForm.value)
    
    Swal.fire({
      icon: 'success',
      title: 'Pesan Terkirim!',
      text: 'Tim support kami akan segera merespons via email',
      confirmButtonColor: '#8b5cf6'
    })
    
    supportForm.value = {
      category: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Gagal mengirim pesan',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    sendingSupport.value = false
  }
}

// ✅ FIXED: Avatar handling
const handleImageError = (e) => {
  console.warn('⚠️ Image failed to load:', e.target?.src)
  imageError.value = true
  // Hide the broken image
  if (e.target) {
    e.target.style.display = 'none'
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'File Terlalu Besar',
      text: 'Ukuran file maksimal 2MB',
      confirmButtonColor: '#8b5cf6'
    })
    return
  }

  if (!file.type.startsWith('image/')) {
    Swal.fire({
      icon: 'error',
      title: 'Format File Salah',
      text: 'Hanya file gambar yang diperbolehkan',
      confirmButtonColor: '#8b5cf6'
    })
    return
  }
  
  selectedFile.value = file
  imageError.value = false // Reset error state
  
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeAvatar = async () => {
  const result = await Swal.fire({
    title: 'Hapus Foto Profil?',
    text: 'Foto profil Anda akan dihapus',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280'
  })

  if (!result.isConfirmed) return

  try {
    saving.value = true
    const response = await api.delete('/client/settings/avatar')
    
    if (response.data.success) {
      avatarPreview.value = null
      selectedFile.value = null
      imageError.value = false
      
      if (avatarInput.value) {
        avatarInput.value.value = ''
      }
      
      if (response.data.data?.user) {
        authStore.updateUser(response.data.data.user)
      }
      
      await authStore.refreshUser()
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Foto profil berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Gagal menghapus foto profil',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    saving.value = false
  }
}

// ✅ FIXED: Update profile
const updateProfile = async () => {
  try {
    saving.value = true
    
    const formData = new FormData()
    formData.append('name', profileForm.value.name)
    formData.append('email', profileForm.value.email)
    if (profileForm.value.phone) formData.append('phone', profileForm.value.phone)
    if (profileForm.value.emergency_contact) formData.append('emergency_contact', profileForm.value.emergency_contact)
    if (profileForm.value.emergency_contact_name) formData.append('emergency_contact_name', profileForm.value.emergency_contact_name)
    if (profileForm.value.emergency_contact_relation) formData.append('emergency_contact_relation', profileForm.value.emergency_contact_relation)
    if (profileForm.value.address) formData.append('address', profileForm.value.address)
    if (profileForm.value.city) formData.append('city', profileForm.value.city)
    if (profileForm.value.province) formData.append('province', profileForm.value.province)
    if (profileForm.value.postal_code) formData.append('postal_code', profileForm.value.postal_code)
    if (profileForm.value.gender) formData.append('gender', profileForm.value.gender)
    if (profileForm.value.birth_date) formData.append('birth_date', profileForm.value.birth_date)
    if (profileForm.value.nik) formData.append('nik', profileForm.value.nik)
    if (profileForm.value.bio) formData.append('bio', profileForm.value.bio)
    
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value)
    }
    
    console.log('📤 Sending profile update...')
    
    const response = await api.post('/client/settings/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    console.log('📥 Response received:', response.data)
    
    if (response.data.success && response.data.data?.user) {
      const updatedUser = response.data.data.user
      
      authStore.updateUser(updatedUser)
      
      // Reset image error state
      imageError.value = false
      
      profileForm.value = {
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        emergency_contact: updatedUser.emergency_contact || '',
        emergency_contact_name: updatedUser.emergency_contact_name || '',
        emergency_contact_relation: updatedUser.emergency_contact_relation || '',
        address: updatedUser.address || '',
        city: updatedUser.city || '',
        province: updatedUser.province || '',
        postal_code: updatedUser.postal_code || '',
        gender: updatedUser.gender || '',
        birth_date: updatedUser.birth_date || '',
        nik: updatedUser.nik || '',
        bio: updatedUser.bio || ''
      }
      
      if (selectedFile.value) {
        selectedFile.value = null
        avatarPreview.value = null
        if (avatarInput.value) {
          avatarInput.value.value = ''
        }
      }

      console.log('✅ Profile updated successfully')
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error('❌ Update profile error:', error)
    
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Gagal memperbarui profil',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    saving.value = false
  }
}

const resetProfileForm = () => {
  loadUserData()
  avatarPreview.value = null
  selectedFile.value = null
  imageError.value = false
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

// ✅ FIXED: Change password
const changePassword = async () => {
  try {
    saving.value = true
    
    await api.post('/client/settings/password', {
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword,
      new_password_confirmation: passwordForm.value.confirmPassword
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Password berhasil diubah',
      timer: 2000,
      showConfirmButton: false
    })
    
    resetPasswordForm()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Gagal mengubah password',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    saving.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// ✅ FIXED: Save notification settings
const saveNotificationSettings = async () => {
  try {
    saving.value = true
    
    await api.post('/client/settings/notifications', {
      settings: notificationSettings.value
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Preferensi notifikasi berhasil disimpan',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Gagal menyimpan preferensi notifikasi',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    saving.value = false
  }
}

// ✅ FIXED: Save preferences
const savePreferences = async () => {
  try {
    saving.value = true
    
    await api.post('/client/settings/preferences', preferences.value)
    
    if (preferences.value.theme === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Preferensi berhasil disimpan',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Gagal menyimpan preferensi',
      confirmButtonColor: '#8b5cf6'
    })
  } finally {
    saving.value = false
  }
}

const loadUserData = () => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || '',
      email: authStore.user.email || '',
      phone: authStore.user.phone || '',
      emergency_contact: authStore.user.emergency_contact || '',
      emergency_contact_name: authStore.user.emergency_contact_name || '',
      emergency_contact_relation: authStore.user.emergency_contact_relation || '',
      address: authStore.user.address || '',
      city: authStore.user.city || '',
      province: authStore.user.province || '',
      postal_code: authStore.user.postal_code || '',
      gender: authStore.user.gender || '',
      birth_date: authStore.user.birth_date || '',
      nik: authStore.user.nik || '',
      bio: authStore.user.bio || ''
    }
  }
}

// ✅ FIXED: Load last login
const loadLastLogin = async () => {
  try {
    const response = await api.get('/client/settings/last-login')
    if (response.data.success && response.data.data.last_login) {
      lastLogin.value = response.data.data.last_login
    }
  } catch (error) {
    console.error('❌ Load last login error:', error)
    // Fail silently
  }
}

onMounted(() => {
  loadUserData()
  loadCommunications()
  loadLastLogin()
})
</script>

<style scoped>
/* [COPY ALL STYLES FROM DOCUMENT 10 - ClientSettings.vue] */
/* I'll include the complete styles here */

/* Base Container */
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.page-title i {
  font-size: 32px;
  color: #8b5cf6;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.page-title i {
  font-size: 32px;
  color: #8b5cf6;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

/* Tabs */
.settings-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

.tab-btn i {
  font-size: 20px;
}

/* Section Card */
.section-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.card-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.card-body {
  padding: 24px;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  font-weight: 700;
}

.avatar-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-upload,
.btn-remove {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  width: fit-content;
}

.btn-upload {
  background: #8b5cf6;
  color: #fff;
}

.btn-upload:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.btn-remove {
  background: #fee2e2;
  color: #dc2626;
}

.btn-remove:hover:not(:disabled) {
  background: #fecaca;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-hint {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* Forms */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Password Input */
.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #6b7280;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.error-text {
  color: #dc2626;
  font-size: 13px;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.success-text {
  color: #10b981;
  font-size: 13px;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #8b5cf6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 14px;
  transition: 0.3s;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + label {
  background: #8b5cf6;
}

.toggle-switch input:checked + label:before {
  transform: translateX(24px);
}

.toggle-switch.small {
  width: 40px;
  height: 22px;
}

.toggle-switch.small label:before {
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
}

.toggle-switch.small input:checked + label:before {
  transform: translateX(18px);
}

/* Notification Settings */
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.notification-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
  margin-right: 16px;
}

.notification-info {
  flex: 1;
}

.notification-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.notification-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.notification-toggles {
  display: flex;
  gap: 24px;
}

.toggle-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.toggle-option span {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* Theme Options */
.preference-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.preference-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-option:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.theme-option.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}

.theme-option i {
  font-size: 32px;
  color: #6b7280;
}

.theme-option.active i {
  color: #8b5cf6;
}

.theme-option span {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Communication Stats */
.comm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 12px;
  color: #fff;
}

.stat-card i {
  font-size: 32px;
  opacity: 0.9;
}

.stat-card h4 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.stat-card p {
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
}

/* Communication List */
.comm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comm-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.comm-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comm-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
}

.comm-icon.type-message {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.comm-icon.type-email {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.comm-icon.type-notification {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.comm-icon.type-call {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.comm-icon.type-system {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.comm-info {
  flex: 1;
}

.comm-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.comm-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comm-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.comm-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.comm-status.unread {
  background: #dbeafe;
  color: #2563eb;
}

.comm-status.read {
  background: #f3f4f6;
  color: #6b7280;
}

/* FAQ List */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  text-align: left;
  transition: all 0.3s ease;
}

.faq-question:hover {
  background: #f9fafb;
}

.faq-question.active {
  background: #f9fafb;
  color: #8b5cf6;
}

.faq-question i {
  font-size: 20px;
  flex-shrink: 0;
}

.faq-answer {
  padding: 0 20px 16px 20px;
  background: #f9fafb;
}

.faq-answer p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* Help Grid */
.help-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.help-item {
  padding: 24px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.help-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.help-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
}

.help-item h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.help-item p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.btn-help {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-help:hover {
  background: #7c3aed;
  transform: translateX(2px);
}

/* Last Login Info */
.last-login-info {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.last-login-info i {
  font-size: 40px;
  color: #8b5cf6;
  flex-shrink: 0;
}

.last-login-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.last-login-info p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 6px 0;
}

.login-device {
  font-size: 12px;
  color: #9ca3af;
}

/* Form hint */
.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: #e5e7eb;
  color: #8b5cf6;
  transform: rotate(90deg);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-state i {
  font-size: 48px;
  color: #8b5cf6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
}

.export-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  gap: 20px;
}

.export-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1;
}

.export-info i {
  font-size: 40px;
  color: #8b5cf6;
  flex-shrink: 0;
}

.export-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.export-info p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .settings-tabs {
    gap: 8px;
  }
  
  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
    
  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .notification-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .export-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .comm-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .help-grid {
    grid-template-columns: 1fr;
  } 
  
  /* Avatar specific styles */
.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  font-weight: 700;
}

/* Loading and empty states */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-state i {
  font-size: 48px;
  color: #8b5cf6;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.bx-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

}
</style>