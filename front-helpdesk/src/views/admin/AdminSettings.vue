<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <!-- SVG defs untuk gradient score circle -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#667eea"/>
          <stop offset="100%" style="stop-color:#10b981"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- ══════ HERO BANNER ══════ -->
    <div class="as-hero">
      <div class="as-hero-left">
        <!-- Avatar with upload -->
        <div class="as-avatar-area">
          <div class="as-avatar-ring">
            <img v-if="avatarPreview || currentAvatarUrl"
              :src="avatarPreview || currentAvatarUrl"
              class="as-avatar-img" @error="onAvatarError" />
            <div v-else class="as-avatar-txt">{{ authStore.userInitials }}</div>
            <span class="as-avatar-online"></span>
          </div>
          <label class="as-avatar-upload" title="Ganti Foto">
            <i class="bx bx-camera"></i>
            <input type="file" ref="avatarInput" accept="image/*" @change="handleAvatarChange" hidden />
          </label>
        </div>

        <div class="as-hero-info">
          <div class="as-hero-name">{{ profileForm.name || authStore.userName || 'Admin' }}</div>
          <div class="as-hero-email">{{ profileForm.email || authStore.user?.email }}</div>
          <div class="as-hero-badges">
            <span class="as-badge indigo"><i class="bx bx-shield-check"></i> Administrator</span>
            <span class="as-badge green"><i class="bx bx-radio-circle-marked"></i> Aktif</span>
            <span class="as-badge gray" v-if="profileForm.position"><i class="bx bx-briefcase"></i> {{ profileForm.position }}</span>
          </div>
        </div>
      </div>

      <div class="as-hero-right">
        <!-- Tombol Simpan Foto hanya muncul jika ada preview baru -->
        <button v-if="avatarPreview" class="as-hero-btn save" @click="saveAvatar" :disabled="saving">
          <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-check'"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan Foto' }}
        </button>

        <!-- Tombol Hapus Foto: gunakan currentAvatarUrl bukan authStore.userAvatar -->
        <button 
          v-if="currentAvatarUrl && !avatarPreview" 
          class="as-hero-btn remove" 
          @click="removeAvatar" 
          :disabled="saving">
          <i class="bx bx-trash"></i> Hapus Foto
        </button>

        <div class="as-hero-stats">
          <div class="as-hstat">
            <span class="as-hstat-val">{{ formatTime(lastLogin) }}</span>
            <span class="as-hstat-lbl">Login Terakhir</span>
          </div>
          <div class="as-hstat-div"></div>
          <div class="as-hstat">
            <span class="as-hstat-val">{{ activeSessions.length || 1 }}</span>
            <span class="as-hstat-lbl">Sesi Aktif</span>
          </div>
          <div class="as-hstat-div"></div>
          <div class="as-hstat">
            <span class="as-hstat-val">{{ activityLogs.length }}</span>
            <span class="as-hstat-lbl">Aktivitas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════ TAB BAR ══════ -->
    <div class="as-tabs">
      <button v-for="t in tabs" :key="t.id"
        class="as-tab" :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id">
        <i class="bx" :class="t.icon"></i>
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════
         TAB: PROFIL
    ══════════════════════════════════ -->
    <div v-show="activeTab === 'profile'">

      <!-- Baris 1: Informasi Profil + Ringkasan Akun sejajar -->
      <div class="as-two-col-equal">

        <!-- Form Profil -->
        <div class="as-card">
          <div class="as-card-head h-indigo">
            <div class="as-card-ico"><i class="bx bx-user"></i></div>
            <div><h6>Informasi Profil</h6><p>Perbarui data profil administrator</p></div>
          </div>
          <div class="as-card-body">
            <!-- Avatar upload section -->
            <div class="as-avatar-section">
              <div class="as-avatar-lg">
                <img v-if="avatarPreview || currentAvatarUrl"
                  :src="avatarPreview || currentAvatarUrl"
                  @error="onAvatarError" />
                <div v-else class="as-avatar-lg-txt">{{ authStore.userInitials }}</div>
              </div>
              <div class="as-avatar-actions">
                <label class="as-btn indigo-outline">
                  <i class="bx bx-upload"></i> Upload Foto
                  <input type="file" ref="avatarInput2" accept="image/*" @change="handleAvatarChange" hidden />
                </label>

                <!-- Tombol Hapus: gunakan currentAvatarUrl, konsisten dengan hero -->
                <button 
                  v-if="currentAvatarUrl && !avatarPreview" 
                  class="as-btn red-outline" 
                  @click="removeAvatar" 
                  :disabled="saving">
                  <i class="bx bx-trash"></i> Hapus Foto
                </button>

                <!-- Batalkan preview jika sedang preview -->
                <button 
                  v-if="avatarPreview" 
                  class="as-btn gray" 
                  @click="cancelAvatarPreview" 
                  :disabled="saving">
                  <i class="bx bx-x"></i> Batalkan
                </button>

                <p class="as-avatar-hint">JPG, PNG atau GIF. Maksimal 2MB</p>
              </div>
            </div>

            <form @submit.prevent="updateProfile">
              <div class="as-grid-2">
                <div class="as-field">
                  <label>Nama Lengkap <span class="req">*</span></label>
                  <input class="as-input" type="text" v-model="profileForm.name" placeholder="Nama lengkap" required />
                </div>
                <div class="as-field">
                  <label>Email <span class="req">*</span></label>
                  <input class="as-input" type="email" v-model="profileForm.email" placeholder="email@example.com" required />
                </div>
                <div class="as-field">
                  <label>Nomor Telepon</label>
                  <input class="as-input" type="tel" v-model="profileForm.phone" placeholder="+62 xxx xxxx xxxx" />
                </div>
                <div class="as-field">
                  <label>Jabatan</label>
                  <input class="as-input" type="text" v-model="profileForm.position" placeholder="Jabatan Anda" />
                </div>
                <div class="as-field">
                  <label>Perusahaan</label>
                  <input class="as-input" type="text" v-model="profileForm.company" placeholder="Nama perusahaan" />
                </div>
                <div class="as-field as-field-full">
                  <label>Bio</label>
                  <textarea class="as-input" rows="3" v-model="profileForm.bio" placeholder="Ceritakan tentang diri Anda..."></textarea>
                </div>
              </div>
              <div class="as-actions">
                <button type="button" class="as-btn gray" @click="resetProfileForm" :disabled="saving">
                  <i class="bx bx-reset"></i> Reset
                </button>
                <button type="submit" class="as-btn indigo" :disabled="saving">
                  <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                  {{ saving ? 'Menyimpan...' : 'Simpan Profil' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Ringkasan Akun — sejajar dengan Form Profil -->
        <div class="as-card">
          <div class="as-card-head h-teal">
            <div class="as-card-ico"><i class="bx bx-bar-chart-alt-2"></i></div>
            <div><h6>Ringkasan Akun</h6><p>Status & keamanan akun Anda</p></div>
          </div>
          <div class="as-card-body">

            <!-- Stat Grid -->
            <div class="as-stat-grid">
              <div class="as-stat-item green">
                <i class="bx bx-devices"></i>
                <span class="as-stat-v">{{ activeSessions.length || 1 }}</span>
                <span class="as-stat-l">Perangkat Aktif</span>
              </div>
              <div class="as-stat-item blue">
                <i class="bx bx-time-five"></i>
                <span class="as-stat-v">Baru saja</span>
                <span class="as-stat-l">Login Terakhir</span>
              </div>
              <div class="as-stat-item purple">
                <i class="bx bx-list-ul"></i>
                <span class="as-stat-v">{{ activityLogs.length }}</span>
                <span class="as-stat-l">Log Aktivitas</span>
              </div>
              <div class="as-stat-item amber">
                <i class="bx bx-history"></i>
                <span class="as-stat-v">{{ loginHistory.length }}</span>
                <span class="as-stat-l">Riwayat Login</span>
              </div>
            </div>

            <div class="as-divider"></div>

            <!-- Skor Keamanan Akun -->
            <p class="as-sec-title">Skor Keamanan Akun</p>
            <div class="as-security-score">
              <div class="as-score-circle">
                <svg viewBox="0 0 36 36" class="as-score-svg">
                  <path class="as-score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="as-score-fill" :stroke-dasharray="`${securityScore}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="as-score-val">{{ securityScore }}<span>%</span></div>
              </div>
              <div class="as-score-checks">
                <div class="as-scheck" :class="profileForm.name && profileForm.email ? 'ok' : 'warn'">
                  <i class="bx" :class="profileForm.name && profileForm.email ? 'bx-check-circle' : 'bx-error-circle'"></i>
                  <span>Profil lengkap</span>
                </div>
                <div class="as-scheck" :class="profileForm.phone ? 'ok' : 'warn'">
                  <i class="bx" :class="profileForm.phone ? 'bx-check-circle' : 'bx-error-circle'"></i>
                  <span>Nomor telepon</span>
                </div>
                <div class="as-scheck" :class="currentAvatarUrl ? 'ok' : 'warn'">
                  <i class="bx" :class="currentAvatarUrl ? 'bx-check-circle' : 'bx-error-circle'"></i>
                  <span>Foto profil</span>
                </div>
                <div class="as-scheck" :class="twoFactorEnabled ? 'ok' : 'warn'">
                  <i class="bx" :class="twoFactorEnabled ? 'bx-check-circle' : 'bx-error-circle'"></i>
                  <span>2FA aktif</span>
                </div>
              </div>
            </div>

            <div class="as-divider"></div>

            <!-- Informasi Akun -->
            <p class="as-sec-title">Informasi Akun</p>
            <div class="as-info-rows">
              <div class="as-info-row">
                <span class="as-info-lbl">Role</span>
                <span class="as-badge-sm indigo">Administrator</span>
              </div>
              <div class="as-info-row">
                <span class="as-info-lbl">Status</span>
                <span class="as-badge-sm green"><i class="bx bx-radio-circle-marked"></i> Aktif</span>
              </div>
              <div class="as-info-row" v-if="profileForm.company">
                <span class="as-info-lbl">Perusahaan</span>
                <span class="as-info-val">{{ profileForm.company }}</span>
              </div>
              <div class="as-info-row" v-if="profileForm.position">
                <span class="as-info-lbl">Jabatan</span>
                <span class="as-info-val">{{ profileForm.position }}</span>
              </div>
            </div>

            <div class="as-divider"></div>

            <!-- Akses Cepat -->
            <p class="as-sec-title">Akses Cepat</p>
            <div class="as-quick-links">
              <router-link class="as-qlink" to="/admin/dashboard">
                <span class="as-qico" style="background:#dbeafe;color:#2563eb"><i class="bx bx-home-circle"></i></span>
                <span>Dashboard</span><i class="bx bx-chevron-right"></i>
              </router-link>
              <router-link class="as-qlink" to="/admin/users">
                <span class="as-qico" style="background:#ede9fe;color:#7c3aed"><i class="bx bx-user"></i></span>
                <span>Kelola Users</span><i class="bx bx-chevron-right"></i>
              </router-link>
              <router-link class="as-qlink" to="/admin/analytics">
                <span class="as-qico" style="background:#ccfbf1;color:#0d9488"><i class="bx bx-bar-chart"></i></span>
                <span>Analytics</span><i class="bx bx-chevron-right"></i>
              </router-link>
              <router-link class="as-qlink" to="/admin/vendors">
                <span class="as-qico" style="background:#fef3c7;color:#d97706"><i class="bx bx-store"></i></span>
                <span>Kelola Vendors</span><i class="bx bx-chevron-right"></i>
              </router-link>
              <router-link class="as-qlink" to="/admin/tickets">
                <span class="as-qico" style="background:#ffe4e6;color:#e11d48"><i class="bx bx-support"></i></span>
                <span>Tiket Masuk</span><i class="bx bx-chevron-right"></i>
              </router-link>
            </div>

          </div>
        </div>

      </div><!-- end as-two-col-equal -->
    </div>

    <!-- ══════════════════════════════════
         TAB: KEAMANAN
    ══════════════════════════════════ -->
    <div v-show="activeTab === 'security'">

      <div class="as-two-col">

        <!-- Ubah Password -->
        <div class="as-card">
          <div class="as-card-head h-amber">
            <div class="as-card-ico"><i class="bx bx-lock-alt"></i></div>
            <div><h6>Ubah Password</h6><p>Gunakan password yang kuat untuk keamanan akun</p></div>
          </div>
          <div class="as-card-body">
            <form @submit.prevent="changePassword">
              <div class="as-pw-fields">
                <div class="as-field">
                  <label>Password Saat Ini <span class="req">*</span></label>
                  <div class="as-eye">
                    <input :type="show.current ? 'text' : 'password'" class="as-input" v-model="passwordForm.currentPassword" placeholder="Password saat ini" required />
                    <button type="button" @click="show.current=!show.current"><i class="bx" :class="show.current?'bx-hide':'bx-show'"></i></button>
                  </div>
                </div>
                <div class="as-field">
                  <label>Password Baru <span class="req">*</span></label>
                  <div class="as-eye">
                    <input :type="show.new ? 'text' : 'password'" class="as-input" v-model="passwordForm.newPassword" placeholder="Min. 8 karakter" required minlength="8" />
                    <button type="button" @click="show.new=!show.new"><i class="bx" :class="show.new?'bx-hide':'bx-show'"></i></button>
                  </div>
                  <div class="as-strength" v-if="passwordForm.newPassword">
                    <div class="as-bars">
                      <div class="as-bar-fill" :class="pwStrength.class" :style="{ width: pwStrength.width }"></div>
                    </div>
                    <span :class="['as-str-txt', pwStrength.class]">{{ pwStrength.text }}</span>
                  </div>
                </div>
                <div class="as-field">
                  <label>Konfirmasi Password <span class="req">*</span></label>
                  <div class="as-eye">
                    <input :type="show.confirm ? 'text' : 'password'" class="as-input" :class="{ err: passwordForm.confirmPassword && !pwMatch }" v-model="passwordForm.confirmPassword" placeholder="Ulangi password baru" required />
                    <button type="button" @click="show.confirm=!show.confirm"><i class="bx" :class="show.confirm?'bx-hide':'bx-show'"></i></button>
                  </div>
                  <p v-if="passwordForm.confirmPassword && !pwMatch" class="as-err-txt"><i class="bx bx-error-circle"></i> Password tidak cocok</p>
                  <p v-if="passwordForm.confirmPassword && pwMatch" class="as-ok-txt"><i class="bx bx-check-circle"></i> Password cocok</p>
                </div>
              </div>
              <div class="as-actions">
                <button type="button" class="as-btn gray" @click="resetPasswordForm" :disabled="saving"><i class="bx bx-reset"></i> Reset</button>
                <button type="submit" class="as-btn amber" :disabled="!pwMatch || !passwordForm.currentPassword || saving">
                  <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-key'"></i>
                  {{ saving ? 'Mengubah...' : 'Ubah Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 2FA + Tips -->
        <div class="as-card">
          <div class="as-card-head h-rose">
            <div class="as-card-ico"><i class="bx bx-shield-alt-2"></i></div>
            <div><h6>Keamanan Lanjutan</h6><p>Fitur keamanan tambahan untuk akun Anda</p></div>
          </div>
          <div class="as-card-body">
            <div class="as-2fa-row">
              <div class="as-2fa-left">
                <div class="as-2fa-ico"><i class="bx bx-mobile-alt"></i></div>
                <div>
                  <p class="as-2fa-title">Autentikasi Dua Faktor (2FA)</p>
                  <p class="as-2fa-desc">Tingkatkan keamanan dengan verifikasi dua langkah</p>
                </div>
              </div>
              <label class="as-switch">
                <input type="checkbox" v-model="twoFactorEnabled" @change="toggle2FA" />
                <span class="as-track"><span class="as-thumb"></span></span>
              </label>
            </div>
            <div class="as-info-box blue" v-if="twoFactorEnabled">
              <i class="bx bx-shield-check"></i>
              <div><strong>2FA Aktif</strong><p>Akun Anda dilindungi verifikasi dua langkah</p></div>
            </div>

            <div class="as-divider"></div>

            <p class="as-sec-title">Tips Keamanan Password</p>
            <div class="as-tips">
              <div class="as-tip" v-for="t in secTips" :key="t.text">
                <span class="as-tip-ico" :style="{ background: t.bg, color: t.color }"><i class="bx" :class="t.icon"></i></span>
                <span>{{ t.text }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Login History + Sessions row -->
      <div class="as-two-col as-mt">

        <!-- Riwayat Login -->
        <div class="as-card">
          <div class="as-card-head h-purple">
            <div class="as-card-ico"><i class="bx bx-history"></i></div>
            <div><h6>Riwayat Login</h6><p>Aktivitas login terakhir pada akun Anda</p></div>
            <button class="as-refresh-btn" @click="loadLoginHistory" :disabled="loadingHistory" title="Refresh">
              <i class="bx bx-refresh" :class="{ 'bx-spin': loadingHistory }"></i>
            </button>
          </div>
          <div class="as-card-body">
            <div v-if="loadingHistory" class="as-loading"><i class="bx bx-loader-alt bx-spin"></i><p>Memuat...</p></div>
            <div v-else-if="loginHistory.length === 0" class="as-empty"><i class="bx bx-history"></i><p>Belum ada riwayat login</p></div>
            <div v-else class="as-list">
              <div class="as-list-item" v-for="login in loginHistory" :key="login.id">
                <div class="as-list-ico" :class="login.success ? 'success' : 'danger'">
                  <i class="bx" :class="getDeviceIcon(login.device)"></i>
                </div>
                <div class="as-list-info">
                  <p class="as-list-title">{{ login.device }} • {{ login.browser }}</p>
                  <p class="as-list-sub">{{ login.location }} • {{ login.ip_address }}</p>
                  <span class="as-list-time">{{ formatTime(login.logged_in_at) }}</span>
                </div>
                <span class="as-status-badge" :class="login.success ? 'success' : 'danger'">
                  <i class="bx" :class="login.success ? 'bx-check' : 'bx-x'"></i>
                  {{ login.success ? 'Berhasil' : 'Gagal' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sesi Aktif -->
        <div class="as-card">
          <div class="as-card-head h-teal">
            <div class="as-card-ico"><i class="bx bx-devices"></i></div>
            <div><h6>Sesi Aktif</h6><p>Perangkat yang sedang login ke akun Anda</p></div>
          </div>
          <div class="as-card-body">
            <div v-if="loadingSessions" class="as-loading"><i class="bx bx-loader-alt bx-spin"></i><p>Memuat...</p></div>
            <div v-else-if="activeSessions.length === 0" class="as-empty"><i class="bx bx-devices"></i><p>Tidak ada sesi aktif</p></div>
            <div v-else class="as-list">
              <div class="as-list-item" v-for="session in activeSessions" :key="session.id">
                <div class="as-list-ico indigo">
                  <i class="bx" :class="getDeviceIcon(session.device)"></i>
                </div>
                <div class="as-list-info">
                  <p class="as-list-title">{{ session.device }} • {{ session.browser }}</p>
                  <p class="as-list-sub">{{ session.location }}</p>
                  <span class="as-list-time">{{ session.current ? 'Sesi ini' : formatTime(session.last_active) }}</span>
                </div>
                <button v-if="!session.current" class="as-end-btn" @click="endSession(session.id)">
                  <i class="bx bx-x"></i> Akhiri
                </button>
                <span v-else class="as-current-badge"><i class="bx bx-check-circle"></i> Sesi Ini</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Activity Log full width -->
      <div class="as-card as-mt">
        <div class="as-card-head h-indigo">
          <div class="as-card-ico"><i class="bx bx-list-ul"></i></div>
          <div><h6>Log Aktivitas</h6><p>Riwayat semua tindakan pada akun Anda</p></div>
          <button class="as-refresh-btn" @click="loadActivityLogs" :disabled="loadingActivity" title="Refresh">
            <i class="bx bx-refresh" :class="{ 'bx-spin': loadingActivity }"></i>
          </button>
        </div>
        <div class="as-card-body">
          <div v-if="loadingActivity" class="as-loading"><i class="bx bx-loader-alt bx-spin"></i><p>Memuat...</p></div>
          <div v-else-if="activityLogs.length === 0" class="as-empty"><i class="bx bx-list-ul"></i><p>Belum ada aktivitas</p></div>
          <div v-else class="as-activity-grid">
            <div class="as-list-item" v-for="act in activityLogs" :key="act.id">
              <div class="as-list-ico" :class="getActivityClass(act.action)">
                <i class="bx" :class="getActivityIcon(act.action)"></i>
              </div>
              <div class="as-list-info">
                <p class="as-list-title">{{ act.description }}</p>
                <p class="as-list-sub">{{ act.ip_address }} • {{ formatTime(act.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         TAB: NOTIFIKASI
    ══════════════════════════════════ -->
    <div v-show="activeTab === 'notifications'">
      <div class="as-two-col">

        <div class="as-card">
          <div class="as-card-head h-teal">
            <div class="as-card-ico"><i class="bx bx-bell"></i></div>
            <div><h6>Notifikasi Email & Push</h6><p>Atur jenis notifikasi yang ingin diterima</p></div>
          </div>
          <div class="as-card-body">
            <div class="as-notif-list">
              <div class="as-notif-item" v-for="s in notificationSettings" :key="s.id">
                <div class="as-notif-ico"><i class="bx" :class="s.icon"></i></div>
                <div class="as-notif-info">
                  <p class="as-notif-title">{{ s.title }}</p>
                  <p class="as-notif-desc">{{ s.description }}</p>
                </div>
                <div class="as-notif-toggles">
                  <div class="as-toggle-opt">
                    <span>Email</span>
                    <label class="as-switch sm">
                      <input type="checkbox" :id="`${s.id}-email`" v-model="s.email" />
                      <span class="as-track"><span class="as-thumb"></span></span>
                    </label>
                  </div>
                  <div class="as-toggle-opt">
                    <span>Push</span>
                    <label class="as-switch sm">
                      <input type="checkbox" :id="`${s.id}-push`" v-model="s.push" />
                      <span class="as-track"><span class="as-thumb"></span></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="as-actions">
              <button class="as-btn indigo" @click="saveNotificationSettings" :disabled="saving">
                <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan Preferensi' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Notif summary -->
        <div class="as-card">
          <div class="as-card-head h-amber">
            <div class="as-card-ico"><i class="bx bx-bar-chart-alt-2"></i></div>
            <div><h6>Ringkasan Notifikasi</h6><p>Status notifikasi aktif saat ini</p></div>
          </div>
          <div class="as-card-body">
            <div class="as-notif-stats">
              <div class="as-nstat" v-for="s in notifSummary" :key="s.label">
                <div class="as-nstat-ico" :style="{ background: s.bg, color: s.color }"><i class="bx" :class="s.icon"></i></div>
                <div><p class="as-nstat-val">{{ s.val }}</p><p class="as-nstat-lbl">{{ s.label }}</p></div>
              </div>
            </div>
            <div class="as-divider"></div>
            <p class="as-sec-title">Panduan Notifikasi</p>
            <div class="as-tips">
              <div class="as-tip" v-for="t in notifGuide" :key="t"><i class="bx bx-check-circle" style="color:#10b981;font-size:1rem;flex-shrink:0"></i><span>{{ t }}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════
         TAB: PREFERENSI
    ══════════════════════════════════ -->
    <div v-show="activeTab === 'preferences'">
      <div class="as-two-col">

        <!-- Tema & Bahasa -->
        <div class="as-card">
          <div class="as-card-head h-purple">
            <div class="as-card-ico"><i class="bx bx-palette"></i></div>
            <div><h6>Tema & Bahasa</h6><p>Sesuaikan tampilan antarmuka</p></div>
          </div>
          <div class="as-card-body">
            <p class="as-field-lbl">Tema Tampilan</p>
            <div class="as-theme-opts">
              <label v-for="t in themes" :key="t.id" class="as-theme-opt" :class="{ active: preferences.theme === t.id }">
                <input type="radio" name="theme" :value="t.id" v-model="preferences.theme" hidden />
                <i class="bx" :class="t.icon"></i>
                <span>{{ t.label }}</span>
              </label>
            </div>
            <p class="as-field-lbl as-mt">Bahasa Interface</p>
            <div class="as-sel-wrap"><i class="bx bx-globe as-sel-ico"></i><select class="as-select" v-model="preferences.language"><option value="id">🇮🇩 Bahasa Indonesia</option><option value="en">🇬🇧 English</option></select></div>
            <p class="as-field-lbl as-mt">Zona Waktu</p>
            <div class="as-sel-wrap"><i class="bx bx-time as-sel-ico"></i><select class="as-select" v-model="preferences.timezone"><option value="Asia/Jakarta">WIB — Jakarta (UTC+7)</option><option value="Asia/Makassar">WITA — Makassar (UTC+8)</option><option value="Asia/Jayapura">WIT — Jayapura (UTC+9)</option></select></div>
            <p class="as-field-lbl as-mt">Format Tanggal</p>
            <div class="as-sel-wrap"><i class="bx bx-calendar as-sel-ico"></i><select class="as-select" v-model="preferences.dateFormat"><option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option><option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option><option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option></select></div>
            <div class="as-actions">
              <button class="as-btn indigo" @click="savePreferences" :disabled="saving">
                <i class="bx" :class="saving ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan Preferensi' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Export + Danger -->
        <div class="as-card">
          <div class="as-card-head h-teal">
            <div class="as-card-ico"><i class="bx bx-data"></i></div>
            <div><h6>Data & Akun</h6><p>Ekspor data atau hapus akun Anda</p></div>
          </div>
          <div class="as-card-body">
            <p class="as-sec-title">Ekspor Data</p>
            <div class="as-export-box">
              <div class="as-export-info">
                <div class="as-export-ico"><i class="bx bx-download"></i></div>
                <div>
                  <p class="as-export-title">Download Data Anda</p>
                  <p class="as-export-desc">Semua data profil, log, dan pengaturan dalam format JSON (GDPR)</p>
                </div>
              </div>
              <button class="as-btn teal" @click="exportData" :disabled="exporting">
                <i class="bx" :class="exporting ? 'bx-loader-alt bx-spin' : 'bx-export'"></i>
                {{ exporting ? 'Mengunduh...' : 'Download Data' }}
              </button>
            </div>

            <div class="as-divider"></div>

            <p class="as-sec-title">Kebijakan Data</p>
            <div class="as-policy-list">
              <div class="as-policy-row" v-for="p in policies" :key="p.title">
                <div class="as-policy-ico" :style="{ background: p.bg, color: p.color }"><i class="bx" :class="p.icon"></i></div>
                <div><p class="as-policy-title">{{ p.title }}</p><p class="as-policy-desc">{{ p.desc }}</p></div>
              </div>
            </div>

            <div class="as-divider"></div>

            <p class="as-sec-title danger-txt">⚠️ Zona Berbahaya</p>
            <div class="as-danger-box">
              <div>
                <p class="as-danger-title">Hapus Akun Permanen</p>
                <p class="as-danger-desc">Hapus akun dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <button class="as-btn red" @click="confirmDeleteAccount">
                <i class="bx bx-trash"></i> Hapus Akun
              </button>
            </div>
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

// ── Tabs ──────────────────────────────────
const activeTab = ref('profile')
const tabs = [
  { id:'profile',       label:'Profil',      icon:'bx-user'      },
  { id:'security',      label:'Keamanan',    icon:'bx-shield'    },
  { id:'notifications', label:'Notifikasi',  icon:'bx-bell'      },
  { id:'preferences',   label:'Preferensi',  icon:'bx-cog'       },
]

// ── Avatar ────────────────────────────────
const avatarInput  = ref(null)
const avatarInput2 = ref(null)
const avatarPreview = ref(null)
const selectedFile  = ref(null)

/**
 * FIX UTAMA: Computed avatar URL lokal yang tidak bergantung pada authStore.userAvatar
 * Controller updateProfile mengembalikan avatar_url (full URL)
 * Controller deleteAvatar mengembalikan avatar: null, avatar_url: null
 * Kita baca keduanya agar konsisten apapun struktur authStore
 */
const currentAvatarUrl = computed(() => {
  const u = authStore.user
  if (!u) return null
  // avatar_url = full URL (dikembalikan controller updateProfile)
  if (u.avatar_url) return u.avatar_url
  // Fallback: path relatif dari /me atau store lama
  if (u.avatar) {
    if (u.avatar.startsWith('http')) return u.avatar
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${base}/storage/${u.avatar}`
  }
  return null
})

const onAvatarError = (e) => { e.target.style.display = 'none' }

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({ icon:'error', title:'File Terlalu Besar', text:'Maksimal 2MB', confirmButtonColor:'#667eea' })
    return
  }
  if (!file.type.startsWith('image/')) {
    Swal.fire({ icon:'error', title:'Format Salah', text:'Hanya file gambar', confirmButtonColor:'#667eea' })
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

// FIX: Batalkan preview tanpa menghapus avatar yang sudah tersimpan
const cancelAvatarPreview = () => {
  avatarPreview.value = null
  selectedFile.value = null
  if (avatarInput.value) avatarInput.value.value = ''
  if (avatarInput2.value) avatarInput2.value.value = ''
}

const saveAvatar = async () => {
  if (!selectedFile.value) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('name', profileForm.value.name)
    fd.append('email', profileForm.value.email)
    fd.append('avatar', selectedFile.value)

    const { data } = await api.post('/admin/settings/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Controller mengembalikan: { success, data: { user: { avatar, avatar_url, ... } } }
    if (data.success && data.data?.user) {
      const u = data.data.user
      // Mutasi langsung untuk avatar (bypass ?? operator bug di updateUser)
      if (authStore.user) {
        authStore.user.avatar = u.avatar ?? null
        authStore.user.avatar_url = u.avatar_url ?? null
      }
      // Update field lain via updateUser (aman karena bukan null)
      authStore.updateUser(u)
      // Sync localStorage
      localStorage.setItem('user', JSON.stringify({ ...authStore.user }))
    }

    cancelAvatarPreview()
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Foto profil diperbarui', timer:2000, showConfirmButton:false })
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menyimpan foto', confirmButtonColor:'#667eea' })
  } finally {
    saving.value = false
  }
}

// FIX FINAL: removeAvatar
// ROOT CAUSE: updateUser() menggunakan operator ?? sehingga
// null ?? existing_value = existing_value — avatar tidak bisa di-null-kan via updateUser!
// SOLUSI: mutasi langsung state Pinia untuk field avatar
const removeAvatar = async () => {
  if (saving.value) return

  if (!currentAvatarUrl.value) {
    Swal.fire({ toast:true, position:'top-end', icon:'info', title:'Tidak ada foto untuk dihapus', timer:2000, showConfirmButton:false })
    return
  }

  const r = await Swal.fire({
    title: 'Hapus Foto Profil?',
    text: 'Foto profil Anda akan dihapus permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  })

  if (!r.isConfirmed) return

  // Simpan nilai lama untuk rollback
  const previousAvatar = authStore.user?.avatar
  const previousAvatarUrl = authStore.user?.avatar_url

  // OPTIMISTIC UPDATE: langsung mutasi state Pinia — bypass updateUser karena ?? operator
  // Ini yang benar karena updateUser tidak bisa set null ke field yang sudah ada nilainya
  if (authStore.user) {
    authStore.user.avatar = null
    authStore.user.avatar_url = null
  }
  // Juga update localStorage agar konsisten
  const updatedUser = { ...authStore.user, avatar: null, avatar_url: null }
  localStorage.setItem('user', JSON.stringify(updatedUser))

  avatarPreview.value = null
  selectedFile.value = null
  if (avatarInput.value) avatarInput.value.value = ''
  if (avatarInput2.value) avatarInput2.value.value = ''

  saving.value = true
  try {
    await api.delete('/admin/settings/avatar')
    // Backend berhasil — optimistic update sudah benar, tidak perlu update ulang
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Foto dihapus', timer:2000, showConfirmButton:false })
  } catch (e) {
    // ROLLBACK: kembalikan avatar ke nilai sebelumnya
    if (authStore.user) {
      authStore.user.avatar = previousAvatar
      authStore.user.avatar_url = previousAvatarUrl
    }
    const rollbackUser = { ...authStore.user, avatar: previousAvatar, avatar_url: previousAvatarUrl }
    localStorage.setItem('user', JSON.stringify(rollbackUser))

    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus Foto',
      text: e.response?.data?.message || 'Gagal menghapus foto. Silakan coba lagi.',
      confirmButtonColor: '#667eea'
    })
  } finally {
    saving.value = false
  }
}

// ── Profile ───────────────────────────────
const profileForm = ref({ name:'', email:'', phone:'', position:'', company:'', bio:'' })
const saving = ref(false)
const exporting = ref(false)
const lastLogin = ref(null)

const updateProfile = async () => {
  saving.value = true
  try {
    const fd = new FormData()
    Object.entries(profileForm.value).forEach(([k, v]) => { if (v) fd.append(k, v) })
    if (selectedFile.value) fd.append('avatar', selectedFile.value)

    const { data } = await api.post('/admin/settings/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (data.success && data.data?.user) {
      authStore.updateUser(data.data.user)
      const u = data.data.user
      profileForm.value = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        position: u.position || '',
        company: u.company || '',
        bio: u.bio || ''
      }
    } else if (data.user) {
      authStore.updateUser(data.user)
      const u = data.user
      profileForm.value = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        position: u.position || '',
        company: u.company || '',
        bio: u.bio || ''
      }
    }

    cancelAvatarPreview()

    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Profil berhasil diperbarui', timer:2000, showConfirmButton:false })
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal memperbarui profil', confirmButtonColor:'#667eea' })
  } finally {
    saving.value = false
  }
}

const resetProfileForm = () => {
  loadUserData()
  cancelAvatarPreview()
}

// ── Password ──────────────────────────────
const passwordForm = ref({ currentPassword:'', newPassword:'', confirmPassword:'' })
const show = ref({ current:false, new:false, confirm:false })

const pwStrength = computed(() => {
  const p = passwordForm.value.newPassword
  if (!p) return { width:'0%', class:'', text:'' }
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^a-zA-Z\d]/.test(p)) s++
  return [
    { width:'20%', class:'weak', text:'Sangat Lemah' },
    { width:'40%', class:'weak', text:'Lemah' },
    { width:'60%', class:'medium', text:'Sedang' },
    { width:'80%', class:'strong', text:'Kuat' },
    { width:'100%', class:'strong', text:'Sangat Kuat' },
  ][Math.min(s, 4)]
})

const pwMatch = computed(() => passwordForm.value.newPassword === passwordForm.value.confirmPassword)

// Skor keamanan akun berdasarkan kelengkapan profil dan pengaturan keamanan
const securityScore = computed(() => {
  let score = 0
  if (profileForm.value.name && profileForm.value.email) score += 25
  if (profileForm.value.phone) score += 25
  if (currentAvatarUrl.value) score += 25
  if (twoFactorEnabled.value) score += 25
  return score
})

const changePassword = async () => {
  saving.value = true
  try {
    await api.post('/admin/settings/password', {
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword,
      new_password_confirmation: passwordForm.value.confirmPassword
    })
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Password berhasil diubah', timer:2000, showConfirmButton:false })
    resetPasswordForm()
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal mengubah password', confirmButtonColor:'#667eea' })
  } finally {
    saving.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.value = { currentPassword:'', newPassword:'', confirmPassword:'' }
  show.value = { current:false, new:false, confirm:false }
}

// ── 2FA ───────────────────────────────────
const twoFactorEnabled = ref(false)
const toggle2FA = async () => {
  try {
    await api.post('/admin/settings/2fa', { enabled: twoFactorEnabled.value })
    Swal.fire({ toast:true, position:'top-end', icon:'success', title: twoFactorEnabled.value ? '2FA Diaktifkan' : '2FA Dinonaktifkan', timer:2000, showConfirmButton:false })
  } catch (e) {
    twoFactorEnabled.value = !twoFactorEnabled.value
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal mengubah 2FA', confirmButtonColor:'#667eea' })
  }
}

// ── Security data ─────────────────────────
const loginHistory    = ref([])
const loadingHistory  = ref(false)
const activeSessions  = ref([])
const loadingSessions = ref(false)
const activityLogs    = ref([])
const loadingActivity = ref(false)

const loadLoginHistory = async () => {
  loadingHistory.value = true
  try {
    const { data } = await api.get('/admin/settings/login-history')
    loginHistory.value = data.data?.login_history || []
  } catch (e) {
    console.error('Load login history error:', e)
  } finally {
    loadingHistory.value = false
  }
}

const loadActiveSessions = async () => {
  loadingSessions.value = true
  try {
    const { data } = await api.get('/admin/settings/sessions')
    activeSessions.value = data.data?.sessions || []
  } catch (e) {
    console.error('Load sessions error:', e)
  } finally {
    loadingSessions.value = false
  }
}

const loadActivityLogs = async () => {
  loadingActivity.value = true
  try {
    const { data } = await api.get('/admin/settings/activity-logs')
    activityLogs.value = data.data?.activity_logs || []
  } catch (e) {
    console.error('Load activity logs error:', e)
  } finally {
    loadingActivity.value = false
  }
}

const endSession = async (id) => {
  const r = await Swal.fire({
    title: 'Akhiri Sesi?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Akhiri',
    cancelButtonText: 'Batal'
  })
  if (!r.isConfirmed) return

  try {
    await api.delete(`/admin/settings/sessions/${id}`)
    activeSessions.value = activeSessions.value.filter(s => s.id !== id)
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Sesi diakhiri', timer:2000, showConfirmButton:false })
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal mengakhiri sesi', confirmButtonColor:'#667eea' })
  }
}

const getDeviceIcon = (d) => {
  const dl = (d || '').toLowerCase()
  if (dl.includes('mobile') || dl.includes('phone') || dl.includes('android') || dl.includes('iphone')) return 'bxs-mobile'
  if (dl.includes('tablet') || dl.includes('ipad')) return 'bxs-tablet'
  return 'bx-desktop'
}

const getActivityIcon = (a) => ({
  login: 'bx-log-in',
  logout: 'bx-log-out',
  profile_update: 'bx-user-circle',
  password_change: 'bx-key',
  avatar_upload: 'bx-image-add',
  avatar_delete: 'bx-trash',
  settings_update: 'bx-cog'
}[a] || 'bx-info-circle')

const getActivityClass = (a) =>
  (a || '').includes('delete') || (a || '').includes('logout') ? 'danger'
  : (a || '').includes('update') || (a || '').includes('change') ? 'warning'
  : 'success'

const formatTime = (dt) => {
  if (!dt) return '-'
  const d = new Date(dt), now = new Date(), diff = now - d
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  if (h < 24) return `${h} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

// ── Notifications ─────────────────────────
const notificationSettings = ref([
  { id:'ticket-status',  title:'Update Status Tiket', description:'Saat status tiket berubah',      icon:'bx-refresh',     email:true,  push:true  },
  { id:'ticket-comment', title:'Komentar Baru',       description:'Ada balasan pada tiket',          icon:'bx-message-dots',email:true,  push:false },
  { id:'ticket-assigned',title:'Tiket Ditugaskan',    description:'Tiket ditugaskan ke vendor',      icon:'bx-user-check',  email:false, push:true  },
  { id:'report-status',  title:'Status Laporan',      description:'Status laporan berubah',          icon:'bx-file-check',  email:true,  push:true  },
  { id:'new-user',       title:'Pengguna Baru',       description:'Ada pendaftaran pengguna baru',   icon:'bx-user-plus',   email:true,  push:false },
])

const notifSummary = computed(() => {
  const total = notificationSettings.value.length
  const emailOn = notificationSettings.value.filter(s => s.email).length
  const pushOn  = notificationSettings.value.filter(s => s.push).length
  return [
    { label:'Total Aktif', val:`${notificationSettings.value.filter(s=>s.email||s.push).length}/${total}`, icon:'bx-bell',      color:'#7c3aed', bg:'#ede9fe' },
    { label:'Email Aktif', val:`${emailOn}/${total}`,  icon:'bx-envelope',  color:'#2563eb', bg:'#dbeafe' },
    { label:'Push Aktif',  val:`${pushOn}/${total}`,   icon:'bx-phone',     color:'#0d9488', bg:'#ccfbf1' },
    { label:'Nonaktif',    val:`${total - notificationSettings.value.filter(s=>s.email||s.push).length}`, icon:'bx-bell-off', color:'#94a3b8', bg:'#f1f5f9' },
  ]
})

const notifGuide = [
  'Aktifkan notifikasi email untuk tiket agar tidak melewatkan perubahan status',
  'Push notification berguna saat Anda tidak membuka aplikasi',
  'Notifikasi pengguna baru membantu memantau pertumbuhan platform',
]

const saveNotificationSettings = async () => {
  saving.value = true
  try {
    await api.post('/admin/settings/notifications', { settings: notificationSettings.value })
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Notifikasi disimpan', timer:2000, showConfirmButton:false })
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:'Gagal menyimpan notifikasi', confirmButtonColor:'#667eea' })
  } finally {
    saving.value = false
  }
}

// ── Preferences ───────────────────────────
const themes = [
  { id:'light', label:'Terang',   icon:'bx-sun'    },
  { id:'dark',  label:'Gelap',    icon:'bx-moon'   },
  { id:'auto',  label:'Otomatis', icon:'bx-adjust' },
]
const preferences = ref({ theme:'light', language:'id', timezone:'Asia/Jakarta', dateFormat:'DD/MM/YYYY' })

const savePreferences = async () => {
  saving.value = true
  try {
    await api.post('/admin/settings/preferences', preferences.value)
    if (preferences.value.theme === 'dark') document.documentElement.classList.add('dark-mode')
    else document.documentElement.classList.remove('dark-mode')
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Preferensi disimpan', timer:2000, showConfirmButton:false })
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:'Gagal menyimpan preferensi', confirmButtonColor:'#667eea' })
  } finally {
    saving.value = false
  }
}

const exportData = async () => {
  exporting.value = true
  try {
    const res = await api.get('/admin/settings/export-data', { responseType:'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', `admin-data-${Date.now()}.json`)
    document.body.appendChild(a)
    a.click()
    a.remove()
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Data berhasil diunduh', timer:2000, showConfirmButton:false })
  } catch {
    Swal.fire({ icon:'error', title:'Gagal', text:'Gagal mengunduh data', confirmButtonColor:'#667eea' })
  } finally {
    exporting.value = false
  }
}

const confirmDeleteAccount = async () => {
  const r = await Swal.fire({
    title: 'Hapus Akun Permanen?',
    html: '<p>Semua data akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus Permanen',
    cancelButtonText: 'Batal',
    input: 'text',
    inputPlaceholder: 'Ketik "HAPUS"',
    inputValidator: (v) => v !== 'HAPUS' ? 'Ketik "HAPUS"' : null
  })

  if (!r.isConfirmed) return

  const pr = await Swal.fire({
    title: 'Konfirmasi Password',
    input: 'password',
    inputPlaceholder: 'Password Anda',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    inputValidator: (v) => !v ? 'Password harus diisi' : null
  })

  if (!pr.isConfirmed) return

  try {
    await api.delete('/admin/settings/account', { data: { password: pr.value } })
    await Swal.fire({ icon:'success', title:'Akun Dihapus', confirmButtonColor:'#667eea' })
    authStore.logout()
  } catch (e) {
    Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menghapus akun', confirmButtonColor:'#667eea' })
  }
}

// ── Static data ───────────────────────────
const secTips = [
  { text:'Minimal 8 karakter kombinasi huruf & angka', icon:'bx-check',  color:'#10b981', bg:'#d1fae5' },
  { text:'Jangan bagikan password kepada siapapun',    icon:'bx-check',  color:'#2563eb', bg:'#dbeafe' },
  { text:'Aktifkan 2FA untuk keamanan maksimal',       icon:'bx-shield', color:'#7c3aed', bg:'#ede9fe' },
  { text:'Ganti password setiap 3 bulan sekali',       icon:'bx-time',   color:'#d97706', bg:'#fef3c7' },
]
const policies = [
  { title:'Terenkripsi AES-256', desc:'Data disimpan dengan enkripsi industri',        icon:'bx-lock-alt',    color:'#10b981', bg:'#d1fae5' },
  { title:'Tidak Dijual',        desc:'Data tidak pernah dijual ke pihak ketiga',      icon:'bx-shield-alt-2',color:'#3b82f6', bg:'#dbeafe' },
  { title:'Hak Akses Penuh',     desc:'Anda berhak unduh atau hapus data kapan saja', icon:'bx-user-check',  color:'#8b5cf6', bg:'#ede9fe' },
]

// ── Load ──────────────────────────────────
const loadUserData = async () => {
  try {
    const { data } = await api.get('/me')
    const u = data.data?.user || data.data || (data.id ? data : null)
    if (u) {
      // Normalisasi: jika /me tidak mengembalikan avatar_url, buat dari avatar path
      if (u.avatar && !u.avatar_url) {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        u.avatar_url = u.avatar.startsWith('http') ? u.avatar : `${base}/storage/${u.avatar}`
      }
      authStore.updateUser(u)
      profileForm.value = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        position: u.position || '',
        company: u.company || '',
        bio: u.bio || ''
      }
    }
  } catch {
    if (authStore.user) {
      const u = authStore.user
      profileForm.value = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        position: u.position || '',
        company: u.company || '',
        bio: u.bio || ''
      }
    }
  }
}

onMounted(async () => {
  await loadUserData()
  Promise.all([loadLoginHistory(), loadActiveSessions(), loadActivityLogs()])
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   ADMIN SETTINGS — FULL REDESIGN
═══════════════════════════════════════════ */

/* ── Hero ── */
.as-hero { background:linear-gradient(135deg,#667eea,#764ba2); border-radius:20px; padding:1.75rem 2rem; display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; box-shadow:0 8px 24px rgba(102,126,234,.3); flex-wrap:wrap; gap:1rem; }
.as-hero-left  { display:flex; align-items:center; gap:1.25rem; }
.as-hero-right { display:flex; align-items:center; gap:.875rem; flex-wrap:wrap; }

/* Avatar */
.as-avatar-area { position:relative; flex-shrink:0; }
.as-avatar-ring { position:relative; width:76px; height:76px; }
.as-avatar-img  { width:76px; height:76px; border-radius:50%; object-fit:cover; border:4px solid rgba(255,255,255,.5); }
.as-avatar-txt  { width:76px; height:76px; border-radius:50%; border:4px solid rgba(255,255,255,.5); background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; color:white; }
.as-avatar-online { position:absolute; bottom:4px; right:4px; width:16px; height:16px; background:#10b981; border:3px solid white; border-radius:50%; }
.as-avatar-upload { position:absolute; bottom:-4px; right:-4px; width:28px; height:28px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.2); transition:all .2s; }
.as-avatar-upload:hover { transform:scale(1.1); background:#f5f3ff; }
.as-avatar-upload i { font-size:.9rem; color:#667eea; }

.as-hero-name  { font-size:1.35rem; font-weight:800; color:white; margin-bottom:.2rem; }
.as-hero-email { font-size:.85rem; color:rgba(255,255,255,.8); margin-bottom:.625rem; }
.as-hero-badges { display:flex; gap:.5rem; flex-wrap:wrap; }
.as-badge { display:inline-flex; align-items:center; gap:.3rem; padding:.3rem .75rem; border-radius:20px; font-size:.75rem; font-weight:700; backdrop-filter:blur(8px); }
.as-badge.indigo { background:rgba(255,255,255,.25); color:white; }
.as-badge.green  { background:rgba(16,185,129,.25); color:#d1fae5; }
.as-badge.gray   { background:rgba(255,255,255,.15); color:rgba(255,255,255,.9); }

.as-hero-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.55rem 1.125rem; border-radius:10px; font-size:.83rem; font-weight:600; cursor:pointer; border:none; transition:all .2s; }
.as-hero-btn.save   { background:rgba(255,255,255,.25); color:white; border:1px solid rgba(255,255,255,.4); }
.as-hero-btn.remove { background:rgba(239,68,68,.25); color:white; border:1px solid rgba(239,68,68,.4); }
.as-hero-btn:hover  { transform:translateY(-1px); }
.as-hero-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

.as-hero-stats { display:flex; align-items:center; gap:1rem; background:rgba(255,255,255,.15); padding:.75rem 1.25rem; border-radius:14px; }
.as-hstat      { display:flex; flex-direction:column; align-items:center; gap:.1rem; }
.as-hstat-val  { font-size:.9rem; font-weight:700; color:white; }
.as-hstat-lbl  { font-size:.68rem; color:rgba(255,255,255,.7); }
.as-hstat-div  { width:1px; height:28px; background:rgba(255,255,255,.25); }

/* ── Tabs ── */
.as-tabs { display:flex; gap:.5rem; background:white; border-radius:14px; padding:.5rem; margin-bottom:1.25rem; box-shadow:0 2px 12px rgba(0,0,0,.06); }
.as-tab  { flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.75rem 1rem; border-radius:10px; border:none; background:transparent; cursor:pointer; font-size:.9rem; font-weight:600; color:#64748b; transition:all .25s; }
.as-tab:hover  { background:#f8fafc; color:#1e293b; }
.as-tab.active { background:linear-gradient(135deg,#667eea,#764ba2); color:white; box-shadow:0 4px 14px rgba(102,126,234,.3); }
.as-tab i { font-size:1.1rem; }

/* ── Layout ── */
.as-two-col { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
.as-col-2   { grid-column:span 2; }
.as-mt      { margin-top:1.25rem; }

/* ── Profile tab: dua card sejajar sama tinggi ── */
.as-two-col-equal { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; align-items:stretch; }

/* ── Cards ── */
.as-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.06); }
.as-card-head { padding:1.125rem 1.5rem; color:white; display:flex; align-items:center; gap:.875rem; }
.as-card-ico  { width:40px; height:40px; background:rgba(255,255,255,.2); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; }
.as-card-head h6 { font-size:1rem; font-weight:700; margin:0; flex:1; color:white !important; }
.as-card-head p  { font-size:.78rem; margin:0; opacity:.88; color:white !important; }
.as-card-body { padding:1.5rem; }

.h-indigo { background:linear-gradient(135deg,#667eea,#764ba2); }
.h-amber  { background:linear-gradient(135deg,#f59e0b,#d97706); }
.h-rose   { background:linear-gradient(135deg,#f43f5e,#ec4899); }
.h-purple { background:linear-gradient(135deg,#8b5cf6,#7c3aed); }
.h-teal   { background:linear-gradient(135deg,#0d9488,#0891b2); }

/* ── Avatar section in form ── */
.as-avatar-section { display:flex; gap:1.5rem; align-items:flex-start; margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid #f1f5f9; }
.as-avatar-lg { width:100px; height:100px; border-radius:50%; overflow:hidden; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.1); background:linear-gradient(135deg,#667eea,#764ba2); display:flex; align-items:center; justify-content:center; }
.as-avatar-lg img { width:100%; height:100%; object-fit:cover; }
.as-avatar-lg-txt { font-size:2.25rem; font-weight:700; color:white; }
.as-avatar-actions { display:flex; flex-direction:column; gap:.625rem; }
.as-avatar-hint { font-size:.78rem; color:#94a3b8; margin:0; }

/* ── Form ── */
.as-grid-2    { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.as-field     { display:flex; flex-direction:column; gap:.35rem; }
.as-field-full { grid-column:1/-1; }
.as-field label { font-size:.83rem; font-weight:600; color:#475569; }
.req { color:#ef4444; }

.as-input { padding:.75rem .95rem; border:2px solid #e2e8f0; border-radius:10px; font-size:.875rem; color:#1e293b; background:white; transition:all .25s; font-family:inherit; width:100%; box-sizing:border-box; resize:vertical; }
.as-input:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1); }
.as-input.err   { border-color:#ef4444!important; }

/* ── Password ── */
.as-pw-fields { display:flex; flex-direction:column; gap:1rem; }
.as-eye { position:relative; }
.as-eye .as-input { padding-right:2.75rem; }
.as-eye button { position:absolute; right:.75rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.05rem; display:flex; padding:0; }
.as-strength { display:flex; align-items:center; gap:.5rem; margin-top:.3rem; }
.as-bars { flex:1; height:4px; background:#e2e8f0; border-radius:4px; overflow:hidden; }
.as-bar-fill { height:100%; border-radius:4px; transition:all .3s; }
.as-bar-fill.weak   { background:#ef4444; }
.as-bar-fill.medium { background:#f59e0b; }
.as-bar-fill.strong { background:#10b981; }
.as-str-txt { font-size:.72rem; font-weight:600; min-width:70px; }
.as-str-txt.weak   { color:#ef4444; }
.as-str-txt.medium { color:#f59e0b; }
.as-str-txt.strong { color:#10b981; }
.as-err-txt { color:#ef4444; font-size:.78rem; display:flex; align-items:center; gap:.3rem; margin:.25rem 0 0; }
.as-ok-txt  { color:#10b981; font-size:.78rem; display:flex; align-items:center; gap:.3rem; margin:.25rem 0 0; }

/* ── 2FA ── */
.as-2fa-row   { display:flex; align-items:center; gap:.875rem; padding:.875rem 1rem; background:#f8fafc; border-radius:12px; margin-bottom:1rem; }
.as-2fa-left  { display:flex; align-items:center; gap:.875rem; flex:1; }
.as-2fa-ico   { width:42px; height:42px; background:#ede9fe; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#7c3aed; flex-shrink:0; }
.as-2fa-title { font-size:.9rem; font-weight:700; color:#1e293b; margin:0; }
.as-2fa-desc  { font-size:.78rem; color:#64748b; margin:0; }
.as-info-box  { display:flex; gap:.875rem; padding:.875rem 1rem; border-radius:12px; font-size:.83rem; margin-bottom:1rem; }
.as-info-box.blue { background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; }
.as-info-box i { font-size:1.2rem; color:#2563eb; flex-shrink:0; }
.as-info-box strong { display:block; font-weight:700; margin-bottom:.15rem; }
.as-info-box p { margin:0; }

/* ── Stat grid ── */
.as-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.as-stat-item { display:flex; flex-direction:column; align-items:center; gap:.25rem; padding:.875rem; border-radius:12px; text-align:center; }
.as-stat-item.green  { background:#f0fdf4; } .as-stat-item.green  i { color:#10b981; }
.as-stat-item.blue   { background:#eff6ff; } .as-stat-item.blue   i { color:#3b82f6; }
.as-stat-item.purple { background:#faf5ff; } .as-stat-item.purple i { color:#8b5cf6; }
.as-stat-item.amber  { background:#fffbeb; } .as-stat-item.amber  i { color:#f59e0b; }
.as-stat-item i  { font-size:1.4rem; }
.as-stat-v { font-size:.85rem; font-weight:700; color:#1e293b; }
.as-stat-l { font-size:.7rem; color:#94a3b8; }

/* ── Shared utility ── */
.as-divider   { height:1px; background:#f1f5f9; margin:1.125rem 0; }
.as-sec-title { font-size:.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin:0 0 .75rem; }
.as-sec-title.danger-txt { color:#ef4444; }
.as-field-lbl { font-size:.78rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin:0 0 .75rem; }
.as-field-lbl.as-mt { margin-top:1.25rem; }

/* ── Info rows ── */
.as-info-rows { display:flex; flex-direction:column; gap:.5rem; }
.as-info-row  { display:flex; align-items:center; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid #f8fafc; }
.as-info-lbl  { font-size:.83rem; color:#64748b; }
.as-info-val  { font-size:.83rem; font-weight:600; color:#1e293b; }
.as-badge-sm  { display:inline-flex; align-items:center; gap:.25rem; padding:.25rem .625rem; border-radius:20px; font-size:.72rem; font-weight:700; }
.as-badge-sm.indigo { background:#ede9fe; color:#5b21b6; }
.as-badge-sm.green  { background:#d1fae5; color:#065f46; }

/* ── Security Score ── */
.as-security-score { display:flex; align-items:center; gap:1.25rem; padding:.75rem; background:#f8fafc; border-radius:12px; }
.as-score-circle { position:relative; width:72px; height:72px; flex-shrink:0; }
.as-score-svg { width:72px; height:72px; transform:rotate(-90deg); }
.as-score-bg   { fill:none; stroke:#e2e8f0; stroke-width:3.5; }
.as-score-fill { fill:none; stroke:url(#scoreGrad); stroke-width:3.5; stroke-linecap:round; transition:stroke-dasharray .6s ease; }
.as-score-val { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:.95rem; font-weight:800; color:#1e293b; display:flex; align-items:baseline; gap:1px; }
.as-score-val span { font-size:.55rem; font-weight:600; color:#94a3b8; }
.as-score-checks { display:flex; flex-direction:column; gap:.4rem; flex:1; }
.as-scheck { display:flex; align-items:center; gap:.5rem; font-size:.78rem; font-weight:600; }
.as-scheck.ok   i { color:#10b981; font-size:1rem; }
.as-scheck.warn i { color:#f59e0b; font-size:1rem; }
.as-scheck.ok   span { color:#374151; }
.as-scheck.warn span { color:#92400e; }

/* ── Quick links ── */
.as-quick-links { display:flex; flex-direction:column; gap:.4rem; }
.as-qlink { display:flex; align-items:center; gap:.75rem; padding:.75rem .875rem; border-radius:10px; text-decoration:none; color:#1e293b; background:#f8fafc; transition:all .2s; border:1px solid transparent; }
.as-qlink:hover { background:#f1f5f9; border-color:#e2e8f0; transform:translateX(3px); }
.as-qlink > span:last-of-type { flex:1; font-size:.85rem; font-weight:600; }
.as-qlink > i:last-child { color:#94a3b8; }
.as-qico { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }

/* ── Tips ── */
.as-tips { display:flex; flex-direction:column; gap:.5rem; }
.as-tip  { display:flex; align-items:center; gap:.75rem; padding:.625rem .875rem; background:#f8fafc; border-radius:10px; font-size:.82rem; color:#475569; }
.as-tip-ico { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.9rem; flex-shrink:0; }

/* ── List items ── */
.as-list { display:flex; flex-direction:column; gap:.5rem; }
.as-activity-grid { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
.as-list-item { display:flex; align-items:center; gap:.875rem; padding:.875rem 1rem; background:#f8fafc; border-radius:12px; border:1px solid transparent; transition:all .2s; }
.as-list-item:hover { background:#f1f5f9; border-color:#e2e8f0; }
.as-list-ico  { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; color:white; flex-shrink:0; }
.as-list-ico.success { background:linear-gradient(135deg,#667eea,#764ba2); }
.as-list-ico.danger  { background:linear-gradient(135deg,#ef4444,#dc2626); }
.as-list-ico.warning { background:linear-gradient(135deg,#f59e0b,#d97706); }
.as-list-ico.indigo  { background:linear-gradient(135deg,#667eea,#764ba2); }
.as-list-info { flex:1; min-width:0; }
.as-list-title { font-size:.875rem; font-weight:600; color:#1e293b; margin:0 0 .15rem; }
.as-list-sub   { font-size:.78rem; color:#64748b; margin:0 0 .15rem; }
.as-list-time  { font-size:.72rem; color:#94a3b8; }
.as-status-badge { padding:.3rem .75rem; border-radius:6px; font-size:.75rem; font-weight:600; display:flex; align-items:center; gap:.25rem; flex-shrink:0; }
.as-status-badge.success { background:#d1fae5; color:#059669; }
.as-status-badge.danger  { background:#fee2e2; color:#dc2626; }
.as-end-btn { display:flex; align-items:center; gap:.35rem; padding:.5rem 1rem; background:#fee2e2; color:#dc2626; border:none; border-radius:8px; font-size:.78rem; font-weight:600; cursor:pointer; flex-shrink:0; transition:all .2s; }
.as-end-btn:hover { background:#fecaca; }
.as-current-badge { padding:.4rem .875rem; background:#d1fae5; color:#059669; border-radius:6px; font-size:.75rem; font-weight:600; display:flex; align-items:center; gap:.3rem; flex-shrink:0; }
.as-refresh-btn { width:34px; height:34px; background:rgba(255,255,255,.2); border:none; border-radius:8px; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.1rem; transition:all .25s; flex-shrink:0; margin-left:auto; }
.as-refresh-btn:hover { background:rgba(255,255,255,.3); transform:rotate(90deg); }
.as-refresh-btn:disabled { opacity:.6; cursor:not-allowed; }

/* ── Loading / Empty ── */
.as-loading,.as-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem; gap:.75rem; }
.as-loading i { font-size:2.5rem; color:#667eea; }
.as-loading p { font-size:.875rem; color:#64748b; margin:0; }
.as-empty i { font-size:2.5rem; color:#d1d5db; }
.as-empty p { font-size:.875rem; color:#9ca3af; margin:0; }

/* ── Notifications ── */
.as-notif-list  { display:flex; flex-direction:column; gap:.75rem; }
.as-notif-item  { display:flex; align-items:center; gap:1rem; padding:.875rem 1rem; background:#f8fafc; border-radius:12px; border:1px solid transparent; transition:all .2s; }
.as-notif-item:hover { background:#f1f5f9; border-color:#e2e8f0; }
.as-notif-ico   { width:42px; height:42px; background:linear-gradient(135deg,#667eea,#764ba2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; color:white; flex-shrink:0; }
.as-notif-info  { flex:1; min-width:0; }
.as-notif-title { font-size:.9rem; font-weight:600; color:#1e293b; margin:0 0 .15rem; }
.as-notif-desc  { font-size:.78rem; color:#64748b; margin:0; }
.as-notif-toggles { display:flex; gap:1.25rem; flex-shrink:0; }
.as-toggle-opt  { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
.as-toggle-opt span { font-size:.7rem; font-weight:600; color:#94a3b8; }

.as-notif-stats { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.as-nstat { display:flex; align-items:center; gap:.75rem; padding:.875rem; background:#f8fafc; border-radius:12px; }
.as-nstat-ico { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
.as-nstat-val { font-size:.9rem; font-weight:700; color:#1e293b; margin:0; }
.as-nstat-lbl { font-size:.7rem; color:#94a3b8; margin:0; }

/* ── Theme Options ── */
.as-theme-opts { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; }
.as-theme-opt  { display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:1.125rem .875rem; background:#f9fafb; border:2px solid #e5e7eb; border-radius:12px; cursor:pointer; transition:all .25s; }
.as-theme-opt:hover  { border-color:#667eea; background:#f5f3ff; }
.as-theme-opt.active { background:rgba(102,126,234,.08); border-color:#667eea; }
.as-theme-opt i { font-size:1.75rem; color:#6b7280; }
.as-theme-opt.active i { color:#667eea; }
.as-theme-opt span { font-size:.83rem; font-weight:600; color:#374151; }

/* ── Select ── */
.as-sel-wrap { position:relative; display:flex; align-items:center; }
.as-sel-ico  { position:absolute; left:.875rem; font-size:1.1rem; color:#94a3b8; pointer-events:none; z-index:1; }
.as-select   { width:100%; padding:.75rem 2.5rem .75rem 2.5rem; border:2px solid #e2e8f0; border-radius:10px; font-size:.875rem; color:#1e293b; background:white; appearance:none; cursor:pointer; transition:all .25s; font-family:inherit; }
.as-select:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1); }
.as-sel-wrap::after { content:'⌄'; position:absolute; right:1rem; color:#94a3b8; pointer-events:none; font-weight:700; }

/* ── Export ── */
.as-export-box  { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.125rem; background:#f8fafc; border-radius:12px; border:1px solid #f1f5f9; }
.as-export-info { display:flex; align-items:flex-start; gap:.875rem; flex:1; }
.as-export-ico  { width:44px; height:44px; background:#ccfbf1; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.35rem; color:#0d9488; flex-shrink:0; }
.as-export-title { font-size:.9rem; font-weight:700; color:#1e293b; margin:0 0 .2rem; }
.as-export-desc  { font-size:.78rem; color:#64748b; margin:0; }

/* ── Policy ── */
.as-policy-list { display:flex; flex-direction:column; gap:.5rem; }
.as-policy-row  { display:flex; align-items:flex-start; gap:.75rem; padding:.75rem; background:#f8fafc; border-radius:10px; }
.as-policy-ico  { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
.as-policy-title { font-size:.83rem; font-weight:700; color:#1e293b; margin:0 0 .15rem; }
.as-policy-desc  { font-size:.75rem; color:#64748b; margin:0; }

/* ── Danger ── */
.as-danger-box  { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding:1rem 1.125rem; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; }
.as-danger-title { font-size:.9rem; font-weight:700; color:#991b1b; margin:0 0 .25rem; }
.as-danger-desc  { font-size:.78rem; color:#b91c1c; margin:0; }

/* ── Toggle Switch ── */
.as-switch { position:relative; display:inline-flex; align-items:center; cursor:pointer; flex-shrink:0; }
.as-switch:not(.sm) { width:50px; height:28px; }
.as-switch.sm { width:40px; height:22px; }
.as-switch input { position:absolute; opacity:0; width:0; height:0; }
.as-track { position:relative; background:#cbd5e1; border-radius:28px; transition:background .3s; display:block; }
.as-switch:not(.sm) .as-track { width:50px; height:28px; }
.as-switch.sm .as-track { width:40px; height:22px; }
.as-thumb { position:absolute; background:white; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,.2); transition:transform .3s; display:block; }
.as-switch:not(.sm) .as-thumb { width:22px; height:22px; top:3px; left:3px; }
.as-switch.sm .as-thumb { width:16px; height:16px; top:3px; left:3px; }
.as-switch input:checked ~ .as-track { background:linear-gradient(135deg,#667eea,#764ba2); }
.as-switch:not(.sm) input:checked ~ .as-track .as-thumb { transform:translateX(22px); }
.as-switch.sm input:checked ~ .as-track .as-thumb { transform:translateX(18px); }

/* ── Actions ── */
.as-actions { margin-top:1.25rem; padding-top:1.125rem; border-top:1px solid #f1f5f9; display:flex; gap:.625rem; flex-wrap:wrap; }
.as-btn { display:inline-flex; align-items:center; gap:.45rem; padding:.7rem 1.375rem; border-radius:10px; font-weight:600; font-size:.875rem; cursor:pointer; border:none; transition:all .25s; }
.as-btn:disabled { opacity:.6; cursor:not-allowed; transform:none!important; }
.as-btn.indigo        { background:linear-gradient(135deg,#667eea,#764ba2); color:white; }
.as-btn.indigo:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 18px rgba(102,126,234,.35); }
.as-btn.amber         { background:linear-gradient(135deg,#f59e0b,#d97706); color:white; }
.as-btn.amber:hover:not(:disabled)  { transform:translateY(-2px); box-shadow:0 6px 18px rgba(245,158,11,.35); }
.as-btn.teal          { background:linear-gradient(135deg,#0d9488,#0891b2); color:white; }
.as-btn.teal:hover    { transform:translateY(-2px); box-shadow:0 6px 18px rgba(13,148,136,.35); }
.as-btn.red           { background:linear-gradient(135deg,#ef4444,#dc2626); color:white; }
.as-btn.red:hover     { transform:translateY(-2px); box-shadow:0 6px 18px rgba(239,68,68,.35); }
.as-btn.gray          { background:#f3f4f6; color:#6b7280; }
.as-btn.gray:hover:not(:disabled) { background:#e5e7eb; }
.as-btn.indigo-outline { background:transparent; color:#667eea; border:2px solid #667eea; }
.as-btn.indigo-outline:hover { background:#f5f3ff; }
.as-btn.red-outline    { background:transparent; color:#ef4444; border:2px solid #fca5a5; }
.as-btn.red-outline:hover { background:#fff1f2; }

.bx-spin { animation:spin 1s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* ── Responsive ── */
@media (max-width:1200px) { .as-grid-2 { grid-template-columns:1fr 1fr; } .as-activity-grid { grid-template-columns:1fr; } }
@media (max-width:992px)  {
  .as-two-col { grid-template-columns:1fr; }
  .as-two-col-equal { grid-template-columns:1fr; }
  .as-col-2 { grid-column:auto; }
  .as-stat-grid { grid-template-columns:1fr 1fr; }
  .as-notif-stats { grid-template-columns:1fr 1fr; }
  .as-hero-stats { display:none; }
}
@media (max-width:768px) {
  .as-hero { flex-direction:column; }
  .as-grid-2 { grid-template-columns:1fr; }
  .as-theme-opts { grid-template-columns:1fr; }
  .as-notif-item { flex-wrap:wrap; }
  .as-avatar-section { flex-direction:column; align-items:center; text-align:center; }
}
@media (max-width:480px) {
  .as-card-body { padding:1.125rem; }
  .as-actions { flex-direction:column; }
  .as-btn { width:100%; justify-content:center; }
  .as-tabs { flex-wrap:wrap; }
  .as-tab { flex:0 0 calc(50% - .25rem); }
}
</style>