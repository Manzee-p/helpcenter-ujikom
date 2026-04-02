<template>
  <div class="container-xxl flex-grow-1 container-p-y">

    <!-- ══════ PAGE HEADER ══════ -->
    <div class="ps-hero">
      <div class="ps-hero-left">
        <!-- Avatar -->
        <div class="ps-avatar-area">
          <div class="ps-avatar-ring">
            <img v-if="avatarPreview || profile.avatar_url" :src="avatarPreview || profile.avatar_url" class="ps-avatar-img" @error="avatarError" />
            <div v-else class="ps-avatar-txt">{{ getInitials(profile.name) }}</div>
            <span class="ps-avatar-online"></span>
          </div>
          <!-- Upload overlay -->
          <label class="ps-avatar-upload" title="Ganti Foto">
            <i class="bx bx-camera"></i>
            <input type="file" ref="avatarInput" accept="image/*" @change="handleAvatarChange" hidden />
          </label>
        </div>

        <div class="ps-hero-info">
          <div class="ps-hero-name">{{ profile.name || 'Nama Vendor' }}</div>
          <div class="ps-hero-email">{{ profile.email }}</div>
          <div class="ps-hero-badges">
            <span class="ps-badge purple"><i class="bx bx-store"></i> Vendor</span>
            <span class="ps-badge" :class="profile.is_active ? 'green' : 'red'">
              <i class="bx bx-radio-circle-marked"></i>
              {{ profile.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
            <span class="ps-badge gray"><i class="bx bx-calendar"></i> {{ formatDate(profile.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Avatar actions -->
      <div class="ps-hero-right">
        <button v-if="avatarPreview" class="ps-hero-btn save" @click="saveAvatar" :disabled="savingAvatar">
          <i class="bx" :class="savingAvatar ? 'bx-loader-alt bx-spin' : 'bx-check'"></i>
          {{ savingAvatar ? 'Menyimpan...' : 'Simpan Foto' }}
        </button>
        <button v-if="profile.avatar_url && !avatarPreview" class="ps-hero-btn remove" @click="removeAvatar" :disabled="savingAvatar">
          <i class="bx bx-trash"></i> Hapus Foto
        </button>
        <div class="ps-completion-ring">
          <svg viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" class="ring-bg"/>
            <circle cx="36" cy="36" r="30" class="ring-fill" :class="completionColor"
              :style="{ strokeDashoffset: 188 - (188 * completionPct / 100) }"/>
          </svg>
          <div class="ring-label">
            <span :class="completionColor">{{ completionPct }}%</span>
            <span>Lengkap</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════ MAIN TAB BAR ══════ -->
    <div class="ps-tabs">
      <button v-for="t in mainTabs" :key="t.id" class="ps-tab" :class="{ active: activeMain === t.id }" @click="activeMain = t.id">
        <i class="bx" :class="t.icon"></i>
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════
         TAB: PROFIL
    ══════════════════════════════════════════ -->
    <div v-show="activeMain === 'profile'">

      <!-- Stat row -->
      <div class="ps-stat-row">
        <div class="ps-stat" v-for="s in statCards" :key="s.label">
          <div class="ps-stat-ico" :style="{ background: s.bg, color: s.color }"><i class="bx" :class="s.icon"></i></div>
          <div><p class="ps-stat-val">{{ s.value }}</p><p class="ps-stat-lbl">{{ s.label }}</p></div>
        </div>
      </div>

      <!-- Profile + Completion row -->
      <div class="ps-two-col">

        <!-- Form Profil -->
        <div class="ps-card ps-col-2">
          <div class="ps-card-head h-rose"><div class="ps-card-ico"><i class="bx bx-user"></i></div><div><h6>Informasi Profil</h6><p>Perbarui data diri dan perusahaan Anda</p></div></div>
          <div class="ps-card-body">
            <form @submit.prevent="updateProfile">
              <div class="ps-grid-3">

                <div class="ps-field">
                  <label><i class="bx bx-user"></i> Nama Lengkap</label>
                  <input class="ps-input" type="text" v-model="profile.name" placeholder="Masukkan nama lengkap" required />
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-envelope"></i> Email</label>
                  <input class="ps-input disabled" type="email" v-model="profile.email" disabled />
                  <small><i class="bx bx-lock-alt"></i> Tidak dapat diubah</small>
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-phone"></i> Nomor Telepon</label>
                  <input class="ps-input" type="text" v-model="profile.phone" placeholder="Nomor telepon" />
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-buildings"></i> Nama Perusahaan</label>
                  <input class="ps-input" type="text" v-model="profile.company_name" placeholder="Nama perusahaan" />
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-phone-call"></i> Telepon Perusahaan</label>
                  <input class="ps-input" type="text" v-model="profile.company_phone" placeholder="Telepon perusahaan" />
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-briefcase"></i> Spesialisasi</label>
                  <input class="ps-input" type="text" v-model="profile.specialization" placeholder="Sound System, Lighting..." />
                  <small><i class="bx bx-info-circle"></i> Pisahkan dengan koma</small>
                </div>
                <div class="ps-field ps-field-full">
                  <label><i class="bx bx-map"></i> Alamat Perusahaan</label>
                  <textarea class="ps-input" rows="2" v-model="profile.company_address" placeholder="Alamat lengkap perusahaan"></textarea>
                </div>

              </div>

              <div class="ps-tags-row" v-if="specList.length">
                <span class="ps-tags-lbl">Spesialisasi:</span>
                <span class="ps-tag" v-for="s in specList" :key="s">{{ s }}</span>
              </div>

              <div class="ps-actions">
                <button class="ps-btn primary" type="submit" :disabled="savingProfile">
                  <i class="bx" :class="savingProfile ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
                  {{ savingProfile ? 'Menyimpan...' : 'Simpan Profil' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Kelengkapan -->
        <div class="ps-card">
          <div class="ps-card-head h-purple"><div class="ps-card-ico"><i class="bx bx-bar-chart-alt-2"></i></div><div><h6>Kelengkapan Profil</h6><p>{{ completionDesc }}</p></div></div>
          <div class="ps-card-body">
            <div class="ps-prog-hd">
              <span>Progress</span>
              <span class="ps-prog-pct" :class="completionColor">{{ completionPct }}%</span>
            </div>
            <div class="ps-prog-track"><div class="ps-prog-fill" :class="completionColor" :style="{ width: completionPct + '%' }"></div></div>
            <div class="ps-chklist">
              <div class="ps-chk" v-for="c in completionItems" :key="c.key">
                <span class="ps-chk-dot" :class="c.done ? 'done' : 'todo'"><i class="bx" :class="c.done ? 'bx-check' : 'bx-minus'"></i></span>
                <div>
                  <p class="ps-chk-name" :class="{ done: c.done }">{{ c.label }}</p>
                  <p class="ps-chk-desc">{{ c.desc }}</p>
                </div>
                <span class="ps-chk-pts" :class="c.done ? 'earned' : 'empty'">{{ c.done ? '✓' : '○' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Password + Security row -->
      <div class="ps-two-col ps-mt">

        <!-- Ubah Password -->
        <div class="ps-card">
          <div class="ps-card-head h-amber"><div class="ps-card-ico"><i class="bx bx-lock-alt"></i></div><div><h6>Ubah Password</h6><p>Perbarui keamanan akun secara berkala</p></div></div>
          <div class="ps-card-body">
            <form @submit.prevent="changePassword">
              <div class="ps-pw-fields">
                <div class="ps-field">
                  <label><i class="bx bx-lock"></i> Password Saat Ini</label>
                  <div class="ps-eye"><input :type="show.current ? 'text' : 'password'" class="ps-input" v-model="pwForm.current_password" placeholder="Password saat ini" required /><button type="button" @click="show.current=!show.current"><i class="bx" :class="show.current?'bx-hide':'bx-show'"></i></button></div>
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-lock-open"></i> Password Baru</label>
                  <div class="ps-eye"><input :type="show.new ? 'text' : 'password'" class="ps-input" v-model="pwForm.new_password" placeholder="Min. 8 karakter" required minlength="8" /><button type="button" @click="show.new=!show.new"><i class="bx" :class="show.new?'bx-hide':'bx-show'"></i></button></div>
                  <div class="ps-strength" v-if="pwForm.new_password">
                    <div class="ps-bars"><span v-for="i in 4" :key="i" :class="{ on: pwStrength>=i, [`lv${pwStrength}`]: pwStrength>=i }"></span></div>
                    <span class="ps-str-lbl">{{ pwStrengthLabel }}</span>
                  </div>
                </div>
                <div class="ps-field">
                  <label><i class="bx bx-lock-open-alt"></i> Konfirmasi Password</label>
                  <div class="ps-eye"><input :type="show.confirm ? 'text' : 'password'" class="ps-input" :class="{ err: pwMismatch }" v-model="pwForm.new_password_confirmation" placeholder="Ulangi password baru" required minlength="8" /><button type="button" @click="show.confirm=!show.confirm"><i class="bx" :class="show.confirm?'bx-hide':'bx-show'"></i></button></div>
                  <small v-if="pwMismatch" class="err-txt"><i class="bx bx-x-circle"></i> Password tidak cocok</small>
                </div>
              </div>
              <div class="ps-actions">
                <button class="ps-btn amber" type="submit" :disabled="savingPw || pwMismatch">
                  <i class="bx" :class="savingPw ? 'bx-loader-alt bx-spin' : 'bx-shield-alt-2'"></i>
                  {{ savingPw ? 'Memproses...' : 'Ubah Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tips & Navigasi -->
        <div class="ps-card">
          <div class="ps-card-head h-indigo"><div class="ps-card-ico"><i class="bx bx-bulb"></i></div><div><h6>Tips & Navigasi Cepat</h6><p>Rekomendasi keamanan dan akses cepat</p></div></div>
          <div class="ps-card-body">
            <p class="ps-sec-title">Tips Keamanan Password</p>
            <div class="ps-pw-tips">
              <div class="ps-pw-tip" v-for="t in pwTips" :key="t.text">
                <span class="ps-tip-ico" :style="{ background: t.bg, color: t.color }"><i class="bx" :class="t.icon"></i></span>
                <span>{{ t.text }}</span>
              </div>
            </div>
            <div class="ps-divider"></div>
            <p class="ps-sec-title">Akses Cepat</p>
            <div class="ps-quick-links">
              <router-link class="ps-qlink" to="/vendor/tickets"><span class="ps-qico" style="background:#dbeafe;color:#2563eb"><i class="bx bx-file"></i></span><span>Tiket Saya</span><i class="bx bx-chevron-right"></i></router-link>
              <router-link class="ps-qlink" to="/vendor/history"><span class="ps-qico" style="background:#fef3c7;color:#d97706"><i class="bx bx-history"></i></span><span>Riwayat</span><i class="bx bx-chevron-right"></i></router-link>
              <router-link class="ps-qlink" to="/vendor/admin-chat"><span class="ps-qico" style="background:#ccfbf1;color:#0d9488"><i class="bx bx-chat"></i></span><span>Chat Admin</span><i class="bx bx-chevron-right"></i></router-link>
              <router-link class="ps-qlink" to="/vendor/reports"><span class="ps-qico" style="background:#ede9fe;color:#7c3aed"><i class="bx bx-bar-chart"></i></span><span>Laporan</span><i class="bx bx-chevron-right"></i></router-link>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════
         TAB: PENGATURAN
    ══════════════════════════════════════════ -->
    <div v-show="activeMain === 'settings'">

      <!-- Sub-tab bar -->
      <div class="ps-stabs">
        <button v-for="t in settingsTabs" :key="t.id" class="ps-stab" :class="{ active: activeSub === t.id }" @click="activeSub = t.id">
          <span class="ps-stab-ico" :class="t.color"><i class="bx" :class="t.icon"></i></span>
          <span class="ps-stab-lbl">{{ t.label }}</span>
          <span class="ps-stab-sub">{{ t.desc }}</span>
        </button>
      </div>

      <!-- NOTIFIKASI -->
      <div v-show="activeSub === 'notifikasi'">
        <div class="ps-two-col">
          <div class="ps-card">
            <div class="ps-card-head h-teal"><div class="ps-card-ico"><i class="bx bx-envelope"></i></div><div><h6>Notifikasi Email</h6><p>Email yang dikirim ke akun Anda</p></div></div>
            <div class="ps-card-body">
              <div class="ps-tgl-list">
                <div class="ps-tgl-row" v-for="n in emailNotifs" :key="n.key">
                  <span class="ps-tgl-ico" :style="{ background: n.bg, color: n.color }"><i class="bx" :class="n.icon"></i></span>
                  <div class="ps-tgl-info"><p class="ps-tgl-title">{{ n.label }}</p><p class="ps-tgl-desc">{{ n.desc }}</p></div>
                  <label class="ps-switch"><input type="checkbox" v-model="notif[n.key]" /><span class="ps-track"><span class="ps-thumb"></span></span></label>
                </div>
              </div>
            </div>
          </div>
          <div class="ps-card">
            <div class="ps-card-head h-purple"><div class="ps-card-ico"><i class="bx bx-bell"></i></div><div><h6>Notifikasi Sistem</h6><p>Notifikasi in-app dari platform</p></div></div>
            <div class="ps-card-body">
              <div class="ps-tgl-list">
                <div class="ps-tgl-row" v-for="n in systemNotifs" :key="n.key">
                  <span class="ps-tgl-ico" :style="{ background: n.bg, color: n.color }"><i class="bx" :class="n.icon"></i></span>
                  <div class="ps-tgl-info"><p class="ps-tgl-title">{{ n.label }}</p><p class="ps-tgl-desc">{{ n.desc }}</p></div>
                  <label class="ps-switch"><input type="checkbox" v-model="notif[n.key]" /><span class="ps-track"><span class="ps-thumb"></span></span></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ps-save-bar ps-mt">
          <button class="ps-btn primary" @click="saveNotifications" :disabled="savingNotif">
            <i class="bx" :class="savingNotif ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
            {{ savingNotif ? 'Menyimpan...' : 'Simpan Notifikasi' }}
          </button>
        </div>
      </div>

      <!-- TAMPILAN -->
      <div v-show="activeSub === 'tampilan'">
        <div class="ps-two-col">
          <div class="ps-card">
            <div class="ps-card-head h-purple"><div class="ps-card-ico"><i class="bx bx-palette"></i></div><div><h6>Tema & Bahasa</h6><p>Pilihan visual antarmuka</p></div></div>
            <div class="ps-card-body">
              <p class="ps-field-lbl">Tema Warna</p>
              <div class="ps-theme-grid">
                <div v-for="t in themes" :key="t.id" class="ps-theme-card" :class="{ active: prefs.theme === t.id }" @click="prefs.theme = t.id">
                  <div class="ps-theme-swatch" :style="{ background: t.gradient }"></div>
                  <span>{{ t.label }}</span>
                  <i v-if="prefs.theme === t.id" class="bx bx-check-circle ps-theme-chk"></i>
                </div>
              </div>
              <p class="ps-field-lbl ps-mt">Bahasa</p>
              <div class="ps-sel-wrap"><i class="bx bx-globe ps-sel-ico"></i><select class="ps-select" v-model="prefs.language"><option value="id">🇮🇩 Bahasa Indonesia</option><option value="en">🇬🇧 English</option></select></div>
            </div>
          </div>
          <div class="ps-card">
            <div class="ps-card-head h-rose"><div class="ps-card-ico"><i class="bx bx-time"></i></div><div><h6>Tanggal & Waktu</h6><p>Format dan zona waktu</p></div></div>
            <div class="ps-card-body">
              <p class="ps-field-lbl">Format Tanggal</p>
              <div class="ps-radio-list">
                <label class="ps-radio" v-for="d in dateFormats" :key="d.value">
                  <input type="radio" v-model="prefs.dateFormat" :value="d.value" />
                  <span class="ps-radio-dot"></span>
                  <span>{{ d.label }}</span>
                </label>
              </div>
              <p class="ps-field-lbl ps-mt">Zona Waktu</p>
              <div class="ps-sel-wrap"><i class="bx bx-map-pin ps-sel-ico"></i><select class="ps-select" v-model="prefs.timezone"><option value="Asia/Jakarta">WIB — Jakarta (UTC+7)</option><option value="Asia/Makassar">WITA — Makassar (UTC+8)</option><option value="Asia/Jayapura">WIT — Jayapura (UTC+9)</option></select></div>
              <div class="ps-preview ps-mt" :style="{ background: currentTheme.gradient }">
                <span class="ps-preview-badge">{{ currentTheme.label }}</span>
                <p>Pratinjau Tema Aktif</p>
              </div>
            </div>
          </div>
        </div>
        <div class="ps-save-bar ps-mt">
          <button class="ps-btn primary" @click="savePreferences" :disabled="savingPref">
            <i class="bx" :class="savingPref ? 'bx-loader-alt bx-spin' : 'bx-save'"></i>
            {{ savingPref ? 'Menyimpan...' : 'Simpan Tampilan' }}
          </button>
        </div>
      </div>

      <!-- PRIVASI -->
      <div v-show="activeSub === 'privasi'">
        <div class="ps-two-col">
          <div class="ps-card">
            <div class="ps-card-head h-rose"><div class="ps-card-ico"><i class="bx bx-shield-alt-2"></i></div><div><h6>Visibilitas Profil</h6><p>Informasi yang terlihat oleh admin</p></div></div>
            <div class="ps-card-body">
              <div class="ps-tgl-list">
                <div class="ps-tgl-row" v-for="p in privacyItems" :key="p.key">
                  <span class="ps-tgl-ico" :style="{ background: p.bg, color: p.color }"><i class="bx" :class="p.icon"></i></span>
                  <div class="ps-tgl-info"><p class="ps-tgl-title">{{ p.label }}</p><p class="ps-tgl-desc">{{ p.desc }}</p></div>
                  <label class="ps-switch"><input type="checkbox" v-model="privacy[p.key]" /><span class="ps-track"><span class="ps-thumb"></span></span></label>
                </div>
              </div>
              <div class="ps-actions">
                <button class="ps-btn primary" @click="savePrivacy" :disabled="savingPrivacy">
                  <i class="bx" :class="savingPrivacy ? 'bx-loader-alt bx-spin' : 'bx-shield-alt-2'"></i>
                  {{ savingPrivacy ? 'Menyimpan...' : 'Simpan Privasi' }}
                </button>
                <button class="ps-btn danger-outline" @click="logoutAll"><i class="bx bx-log-out"></i> Logout Semua</button>
              </div>
            </div>
          </div>
          <div class="ps-card">
            <div class="ps-card-head h-indigo"><div class="ps-card-ico"><i class="bx bx-bulb"></i></div><div><h6>Tips Keamanan</h6><p>Rekomendasi menjaga keamanan akun</p></div></div>
            <div class="ps-card-body">
              <div class="ps-alert amber"><i class="bx bx-info-circle"></i><div><strong>Sesi Login</strong><p>Anda sedang login di 1 perangkat aktif.</p></div></div>
              <div class="ps-tips-grid">
                <div class="ps-tip-card" v-for="t in secTips" :key="t.title">
                  <div class="ps-tip-ico" :style="{ background: t.bg, color: t.color }"><i class="bx" :class="t.icon"></i></div>
                  <div><p class="ps-tip-title">{{ t.title }}</p><p class="ps-tip-desc">{{ t.desc }}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DATA AKUN -->
      <div v-show="activeSub === 'data'">
        <div class="ps-three-col">
          <div class="ps-card">
            <div class="ps-card-head h-teal"><div class="ps-card-ico"><i class="bx bx-download"></i></div><div><h6>Ekspor Data</h6><p>Unduh data akun Anda</p></div></div>
            <div class="ps-card-body">
              <p class="ps-card-text">Unduh salinan semua data profil, pengaturan, dan riwayat aktivitas dalam format JSON terenkripsi.</p>
              <div class="ps-feat-list">
                <div class="ps-feat" v-for="f in exportFeatures" :key="f"><i class="bx bx-check-circle" style="color:#0d9488"></i><span>{{ f }}</span></div>
              </div>
              <div class="ps-actions"><button class="ps-btn teal" @click="exportData"><i class="bx bx-export"></i> Ekspor Sekarang</button></div>
            </div>
          </div>
          <div class="ps-card">
            <div class="ps-card-head h-amber"><div class="ps-card-ico"><i class="bx bx-history"></i></div><div><h6>Riwayat Aktivitas</h6><p>Log aktivitas akun</p></div></div>
            <div class="ps-card-body">
              <p class="ps-card-text">Lihat semua aktivitas login, perubahan data, dan tindakan penting yang pernah dilakukan.</p>
              <div class="ps-act-list">
                <div class="ps-act-row" v-for="a in activityMock" :key="a.label">
                  <span class="ps-act-dot" :style="{ background: a.color }"></span>
                  <div><p class="ps-act-lbl">{{ a.label }}</p><p class="ps-act-time">{{ a.time }}</p></div>
                </div>
              </div>
              <div class="ps-actions"><button class="ps-btn amber-outline" @click="viewActivity"><i class="bx bx-list-ul"></i> Lihat Semua</button></div>
            </div>
          </div>
          <div class="ps-card danger-card">
            <div class="ps-card-head h-red"><div class="ps-card-ico"><i class="bx bx-trash-alt"></i></div><div><h6>Hapus Akun</h6><p>Penghapusan permanen</p></div></div>
            <div class="ps-card-body">
              <p class="ps-card-text">Tindakan ini bersifat <strong>permanen</strong> dan tidak dapat dibatalkan.</p>
              <div class="ps-danger-warn"><i class="bx bx-error-circle"></i><span>Data tidak dapat dipulihkan setelah dihapus</span></div>
              <div class="ps-actions"><button class="ps-btn danger" @click="confirmDelete"><i class="bx bx-trash"></i> Hapus Akun</button></div>
            </div>
          </div>
        </div>
        <div class="ps-card ps-mt">
          <div class="ps-card-head h-indigo"><div class="ps-card-ico"><i class="bx bx-file-blank"></i></div><div><h6>Kebijakan Data Kami</h6><p>Transparansi pengelolaan data Anda</p></div></div>
          <div class="ps-card-body">
            <div class="ps-policy-grid">
              <div class="ps-policy-item" v-for="p in policies" :key="p.title">
                <div class="ps-policy-ico" :style="{ background: p.bg, color: p.color }"><i class="bx" :class="p.icon"></i></div>
                <div><p class="ps-policy-title">{{ p.title }}</p><p class="ps-policy-desc">{{ p.desc }}</p></div>
              </div>
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
import api from '@/services/api'
import { formatDate, getInitials } from '@/utils/helpers'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

// ── Tabs ──────────────────────────────────────────────────
const activeMain = ref('profile')
const activeSub  = ref('notifikasi')

const mainTabs = [
  { id:'profile',  label:'Profil',      icon:'bx-user' },
  { id:'settings', label:'Pengaturan',  icon:'bx-cog'  },
]

const settingsTabs = [
  { id:'notifikasi', label:'Notifikasi',  desc:'Email & sistem',     icon:'bx-bell',         color:'teal'   },
  { id:'tampilan',   label:'Tampilan',    desc:'Tema & bahasa',      icon:'bx-palette',      color:'purple' },
  { id:'privasi',    label:'Privasi',     desc:'Visibilitas & sesi', icon:'bx-shield-alt-2', color:'rose'   },
  { id:'data',       label:'Data Akun',   desc:'Ekspor & hapus',     icon:'bx-data',         color:'blue'   },
]

// ── Avatar ────────────────────────────────────────────────
const avatarInput  = ref(null)
const avatarPreview = ref(null)
const selectedFile  = ref(null)
const savingAvatar  = ref(false)

const handleAvatarChange = (e) => {
  const file = e.target.files[0]; if (!file) return
  if (file.size > 2 * 1024 * 1024) { Swal.fire({ icon:'error', title:'File Terlalu Besar', text:'Maksimal 2MB' }); return }
  if (!file.type.startsWith('image/')) { Swal.fire({ icon:'error', title:'Format Salah', text:'Hanya file gambar' }); return }
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

const avatarError = (e) => { e.target.style.display = 'none' }

const saveAvatar = async () => {
  if (!selectedFile.value) return
  savingAvatar.value = true
  try {
    const fd = new FormData()
    fd.append('name', profile.value.name)
    fd.append('avatar', selectedFile.value)
    const { data } = await api.post('/vendor/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (data.success && data.data?.user) {
      authStore.updateUser(data.data.user)
      profile.value.avatar_url = data.data.user.avatar_url
      avatarPreview.value = null; selectedFile.value = null
      if (avatarInput.value) avatarInput.value.value = ''
    }
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Foto profil diperbarui', timer:2000, showConfirmButton:false })
  } catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menyimpan foto' }) }
  finally { savingAvatar.value = false }
}

const removeAvatar = async () => {
  const r = await Swal.fire({ title:'Hapus Foto Profil?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ef4444', confirmButtonText:'Ya, Hapus', cancelButtonText:'Batal' })
  if (!r.isConfirmed) return
  savingAvatar.value = true
  try {
    const { data } = await api.delete('/vendor/avatar')
    if (data.success) {
      profile.value.avatar_url = null; avatarPreview.value = null; selectedFile.value = null
      if (data.data?.user) authStore.updateUser(data.data.user)
    }
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Foto dihapus', timer:2000, showConfirmButton:false })
  } catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menghapus foto' }) }
  finally { savingAvatar.value = false }
}

// ── Profile state ─────────────────────────────────────────
const profile = ref({ name:'', email:'', phone:'', company_name:'', company_address:'', company_phone:'', specialization:'', avatar_url:null, is_active:true, created_at:'' })
const savingProfile = ref(false)
const savingPw      = ref(false)
const show = ref({ current:false, new:false, confirm:false })
const pwForm = ref({ current_password:'', new_password:'', new_password_confirmation:'' })

const specList   = computed(() => profile.value.specialization ? profile.value.specialization.split(',').map(s=>s.trim()).filter(Boolean) : [])
const pwMismatch = computed(() => pwForm.value.new_password_confirmation && pwForm.value.new_password !== pwForm.value.new_password_confirmation)
const pwStrength = computed(() => {
  const p = pwForm.value.new_password; if (!p) return 0
  let s=0; if(p.length>=8)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return s
})
const pwStrengthLabel = computed(() => ['','Lemah','Sedang','Kuat','Sangat Kuat'][pwStrength.value]||'')

const completionItems = computed(() => [
  { key:'name',            done:!!profile.value.name,            label:'Nama Lengkap',       desc:'Identitas utama akun'        },
  { key:'avatar',          done:!!profile.value.avatar_url,      label:'Foto Profil',         desc:'Tampilan lebih profesional'  },
  { key:'phone',           done:!!profile.value.phone,           label:'Nomor Telepon',       desc:'Dihubungi oleh admin'        },
  { key:'company_name',    done:!!profile.value.company_name,    label:'Nama Perusahaan',     desc:'Informasi bisnis vendor'     },
  { key:'company_address', done:!!profile.value.company_address, label:'Alamat Perusahaan',   desc:'Lokasi operasional'          },
  { key:'specialization',  done:!!profile.value.specialization,  label:'Spesialisasi',        desc:'Bidang keahlian'             },
])
const completionPct   = computed(() => Math.round(completionItems.value.filter(i=>i.done).length / completionItems.value.length * 100))
const completionColor = computed(() => completionPct.value >= 80 ? 'green' : completionPct.value >= 50 ? 'amber' : 'red')
const completionDesc  = computed(() => completionPct.value === 100 ? '🎉 Profil Anda sudah lengkap!' : completionPct.value >= 80 ? 'Hampir lengkap!' : 'Lengkapi profil Anda')

const statCards = computed(() => [
  { label:'Sesi Aktif',    value:'1 Perangkat',                               icon:'bx-devices',   color:'#2563eb', bg:'#dbeafe' },
  { label:'Login Terakhir',value:'Baru saja',                                 icon:'bx-time-five', color:'#0d9488', bg:'#ccfbf1' },
  { label:'Kelengkapan',   value: completionPct.value + '%',                  icon:'bx-bar-chart', color:'#7c3aed', bg:'#ede9fe' },
  { label:'Status',        value: profile.value.is_active ? 'Aktif':'Nonaktif', icon:'bx-signal-5', color: profile.value.is_active ? '#10b981':'#ef4444', bg: profile.value.is_active ? '#d1fae5':'#fee2e2' },
])

const pwTips = [
  { text:'Minimal 8 karakter',              icon:'bx-check', color:'#10b981', bg:'#d1fae5' },
  { text:'Gabungkan huruf besar & kecil',   icon:'bx-check', color:'#2563eb', bg:'#dbeafe' },
  { text:'Tambahkan angka dan simbol',      icon:'bx-check', color:'#7c3aed', bg:'#ede9fe' },
  { text:'Ganti password setiap 3 bulan',   icon:'bx-time',  color:'#d97706', bg:'#fef3c7' },
]

// ── Settings state ────────────────────────────────────────
const savingNotif   = ref(false)
const savingPref    = ref(false)
const savingPrivacy = ref(false)

const emailNotifs = [
  { key:'email_ticket_assigned', label:'Tiket Ditugaskan',  desc:'Email saat tiket baru ditugaskan', icon:'bx-file-blank', color:'#2563eb', bg:'#dbeafe' },
  { key:'email_ticket_updated',  label:'Tiket Diperbarui',  desc:'Email saat tiket berubah',         icon:'bx-edit',       color:'#7c3aed', bg:'#ede9fe' },
  { key:'email_chat_message',    label:'Pesan Chat Baru',   desc:'Email saat ada chat dari admin',   icon:'bx-chat',       color:'#0d9488', bg:'#ccfbf1' },
  { key:'email_weekly_report',   label:'Laporan Mingguan',  desc:'Ringkasan aktivitas mingguan',     icon:'bx-bar-chart',  color:'#d97706', bg:'#fef3c7' },
]
const systemNotifs = [
  { key:'system_ticket_reminder', label:'Pengingat Tiket',   desc:'Tiket mendekati batas waktu',    icon:'bx-time',      color:'#ef4444', bg:'#fee2e2' },
  { key:'system_status_change',   label:'Perubahan Status',  desc:'Status tiket berubah',           icon:'bx-refresh',   color:'#2563eb', bg:'#dbeafe' },
  { key:'system_announcement',    label:'Pengumuman Sistem', desc:'Pemeliharaan & update',           icon:'bx-broadcast', color:'#7c3aed', bg:'#ede9fe' },
]
const notif = ref({ email_ticket_assigned:true, email_ticket_updated:true, email_chat_message:true, email_weekly_report:false, system_ticket_reminder:true, system_status_change:true, system_announcement:false })

const themes = [
  { id:'default', label:'Default', gradient:'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id:'ocean',   label:'Ocean',   gradient:'linear-gradient(135deg,#667eea,#764ba2)' },
  { id:'forest',  label:'Forest',  gradient:'linear-gradient(135deg,#56ab2f,#a8e063)' },
  { id:'sunset',  label:'Sunset',  gradient:'linear-gradient(135deg,#f7971e,#ffd200)' },
]
const dateFormats = [
  { value:'DD/MM/YYYY', label:'DD/MM/YYYY — 31/12/2025' },
  { value:'MM/DD/YYYY', label:'MM/DD/YYYY — 12/31/2025' },
  { value:'YYYY-MM-DD', label:'YYYY-MM-DD — 2025-12-31' },
]
const prefs = ref({ theme:'default', language:'id', dateFormat:'DD/MM/YYYY', timezone:'Asia/Jakarta' })
const currentTheme = computed(() => themes.find(t=>t.id===prefs.value.theme)||themes[0])

const privacyItems = [
  { key:'show_company',        label:'Tampilkan Perusahaan',   desc:'Admin melihat nama perusahaan', icon:'bx-buildings', color:'#2563eb', bg:'#dbeafe' },
  { key:'show_phone',          label:'Tampilkan Telepon',      desc:'Admin melihat nomor telepon',   icon:'bx-phone',     color:'#0d9488', bg:'#ccfbf1' },
  { key:'show_specialization', label:'Tampilkan Spesialisasi', desc:'Terlihat di profil publik',     icon:'bx-briefcase', color:'#7c3aed', bg:'#ede9fe' },
  { key:'two_factor_auth',     label:'Autentikasi 2FA',        desc:'Keamanan ekstra (segera)',      icon:'bx-lock',      color:'#d97706', bg:'#fef3c7' },
]
const privacy = ref({ show_company:true, show_phone:false, show_specialization:true, two_factor_auth:false })

const secTips = [
  { title:'Password Kuat',    desc:'Kombinasi huruf, angka & simbol',    icon:'bx-lock-alt', color:'#7c3aed', bg:'#ede9fe' },
  { title:'Logout Rutin',     desc:'Keluar dari perangkat tak terpakai', icon:'bx-log-out',  color:'#0d9488', bg:'#ccfbf1' },
  { title:'Pantau Aktivitas', desc:'Cek riwayat login berkala',          icon:'bx-show',     color:'#2563eb', bg:'#dbeafe' },
  { title:'Update Berkala',   desc:'Perbarui password tiap 3 bulan',     icon:'bx-refresh',  color:'#d97706', bg:'#fef3c7' },
]

const exportFeatures = ['Data profil lengkap','Riwayat aktivitas','Pengaturan akun','Format JSON terenkripsi']
const activityMock = [
  { label:'Login berhasil',     time:'Hari ini, 16:47', color:'#10b981' },
  { label:'Profil diperbarui',  time:'2 hari lalu',     color:'#3b82f6' },
  { label:'Password diubah',    time:'1 minggu lalu',   color:'#f59e0b' },
  { label:'Notifikasi disimpan',time:'2 minggu lalu',   color:'#8b5cf6' },
]
const policies = [
  { title:'Terenkripsi AES-256',    desc:'Data disimpan dengan enkripsi industri',          icon:'bx-lock-alt',    color:'#10b981', bg:'#d1fae5' },
  { title:'Tidak Dijual',           desc:'Tidak menjual data ke pihak ketiga',              icon:'bx-shield-alt-2',color:'#3b82f6', bg:'#dbeafe' },
  { title:'Hak Akses Penuh',        desc:'Anda berhak unduh atau hapus data kapan saja',   icon:'bx-user-check',  color:'#8b5cf6', bg:'#ede9fe' },
  { title:'Retensi 30 Hari',        desc:'Data terhapus hilang permanen setelah 30 hari',  icon:'bx-time',        color:'#d97706', bg:'#fef3c7' },
]

// ── Load ──────────────────────────────────────────────────
const loadProfile = async () => {
  try {
    const { data } = await api.get('/vendor/profile')
    const u = data.data?.user || data
    if (u) {
      profile.value = { name:u.name||'', email:u.email||'', phone:u.phone||'', company_name:u.company_name||'', company_address:u.company_address||'', company_phone:u.company_phone||'', specialization:u.specialization||'', avatar_url:u.avatar_url||null, is_active:u.is_active??true, created_at:u.created_at||'' }
      authStore.updateUser(u)
    }
  } catch {
    const u = authStore.user
    if (u) profile.value = { name:u.name||'', email:u.email||'', phone:u.phone||'', company_name:u.company_name||'', company_address:u.company_address||'', company_phone:u.company_phone||'', specialization:u.specialization||'', avatar_url:u.avatar_url||null, is_active:u.is_active??true, created_at:u.created_at||'' }
  }
}

const loadSettings = async () => {
  try {
    const { data } = await api.get('/vendor/settings')
    if (data.data?.notifications) notif.value  = { ...notif.value, ...data.data.notifications }
    if (data.data?.preferences)   prefs.value  = { ...prefs.value, ...data.data.preferences }
    if (data.data?.privacy)       privacy.value = { ...privacy.value, ...data.data.privacy }
  } catch { /* use defaults */ }
}

// ── Profile methods ───────────────────────────────────────
const updateProfile = async () => {
  savingProfile.value = true
  try {
    const fd = new FormData()
    fd.append('name', profile.value.name)
    if (profile.value.phone)           fd.append('phone',           profile.value.phone)
    if (profile.value.company_name)    fd.append('company_name',    profile.value.company_name)
    if (profile.value.company_address) fd.append('company_address', profile.value.company_address)
    if (profile.value.company_phone)   fd.append('company_phone',   profile.value.company_phone)
    if (profile.value.specialization)  fd.append('specialization',  profile.value.specialization)

    const { data } = await api.post('/vendor/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (data.success && data.data?.user) {
      authStore.updateUser(data.data.user)
      profile.value.avatar_url = data.data.user.avatar_url
    }
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Profil berhasil diperbarui', timer:2000, showConfirmButton:false })
  } catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal memperbarui profil' }) }
  finally { savingProfile.value = false }
}

const changePassword = async () => {
  if (pwMismatch.value) return
  savingPw.value = true
  try {
    await api.post('/vendor/change-password', pwForm.value)
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Password berhasil diubah', timer:2000, showConfirmButton:false })
    pwForm.value = { current_password:'', new_password:'', new_password_confirmation:'' }
  } catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal mengubah password' }) }
  finally { savingPw.value = false }
}

// ── Settings methods ──────────────────────────────────────
const saveNotifications = async () => {
  savingNotif.value = true
  try { await api.post('/vendor/settings/notifications', notif.value); Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Notifikasi disimpan', timer:2000, showConfirmButton:false }) }
  catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menyimpan' }) }
  finally { savingNotif.value = false }
}
const savePreferences = async () => {
  savingPref.value = true
  try { await api.post('/vendor/settings/preferences', prefs.value); Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Tampilan disimpan', timer:2000, showConfirmButton:false }) }
  catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menyimpan' }) }
  finally { savingPref.value = false }
}
const savePrivacy = async () => {
  savingPrivacy.value = true
  try { await api.post('/vendor/settings/privacy', privacy.value); Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Privasi disimpan', timer:2000, showConfirmButton:false }) }
  catch (e) { Swal.fire({ icon:'error', title:'Gagal', text:e.response?.data?.message||'Gagal menyimpan' }) }
  finally { savingPrivacy.value = false }
}
const logoutAll = async () => {
  const r = await Swal.fire({ icon:'warning', title:'Logout Semua Perangkat?', showCancelButton:true, confirmButtonColor:'#ef4444', confirmButtonText:'Ya, Logout', cancelButtonText:'Batal' })
  if (r.isConfirmed) { try { await api.post('/vendor/settings/logout-all'); await authStore.logout() } catch { Swal.fire({ icon:'success', title:'Semua sesi diakhiri', timer:2000, showConfirmButton:false }) } }
}
const exportData = async () => {
  try {
    const { data } = await api.get('/vendor/settings/export-data')
    const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`vendor-data-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
    Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Data berhasil diunduh', timer:2000, showConfirmButton:false })
  } catch { Swal.fire({ icon:'info', title:'Data sedang disiapkan...', timer:2000, showConfirmButton:false }) }
}
const viewActivity = () => Swal.fire({ icon:'info', title:'Riwayat Aktivitas', text:'Fitur ini akan segera tersedia.', confirmButtonColor:'#667eea' })
const confirmDelete = async () => {
  const r = await Swal.fire({ icon:'error', title:'Hapus Akun?', html:'<p>Tindakan ini <strong>tidak dapat dibatalkan</strong>.</p>', showCancelButton:true, confirmButtonColor:'#ef4444', confirmButtonText:'Hapus Permanen', cancelButtonText:'Batal', input:'text', inputPlaceholder:'Ketik "HAPUS"', preConfirm:(v)=>{ if(v!=='HAPUS') Swal.showValidationMessage('Ketik "HAPUS"') } })
  if (r.isConfirmed) { try { await api.delete('/vendor/settings/delete-account') } catch {} Swal.fire({ icon:'success', title:'Permintaan Dikirim', text:'Diproses dalam 7 hari kerja.', timer:3000, showConfirmButton:false }) }
}

onMounted(async () => {
  await loadProfile()
  loadSettings()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   VENDOR PROFILE & SETTINGS — COMBINED
═══════════════════════════════════════════════ */

/* ── Hero ── */
.ps-hero { background:linear-gradient(135deg,#f093fb,#f5576c); border-radius:20px; padding:1.75rem 2rem; display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; box-shadow:0 8px 24px rgba(240,147,251,.3); flex-wrap:wrap; gap:1rem; }
.ps-hero-left  { display:flex; align-items:center; gap:1.25rem; }
.ps-hero-right { display:flex; align-items:center; gap:.875rem; }

/* Avatar */
.ps-avatar-area { position:relative; flex-shrink:0; }
.ps-avatar-ring { position:relative; width:76px; height:76px; }
.ps-avatar-img  { width:76px; height:76px; border-radius:50%; object-fit:cover; border:4px solid rgba(255,255,255,.5); }
.ps-avatar-txt  { width:76px; height:76px; border-radius:50%; border:4px solid rgba(255,255,255,.5); background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; color:white; }
.ps-avatar-online { position:absolute; bottom:4px; right:4px; width:16px; height:16px; background:#10b981; border:3px solid white; border-radius:50%; }
.ps-avatar-upload { position:absolute; bottom:-4px; right:-4px; width:28px; height:28px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.2); transition:all .2s; }
.ps-avatar-upload:hover { transform:scale(1.1); background:#f0fdfa; }
.ps-avatar-upload i { font-size:.9rem; color:#f093fb; }

.ps-hero-name  { font-size:1.35rem; font-weight:800; color:white; margin-bottom:.2rem; }
.ps-hero-email { font-size:.85rem; color:rgba(255,255,255,.8); margin-bottom:.625rem; }
.ps-hero-badges { display:flex; gap:.5rem; flex-wrap:wrap; }
.ps-badge { display:inline-flex; align-items:center; gap:.3rem; padding:.3rem .75rem; border-radius:20px; font-size:.75rem; font-weight:700; backdrop-filter:blur(8px); }
.ps-badge.purple { background:rgba(255,255,255,.25); color:white; }
.ps-badge.green  { background:rgba(16,185,129,.25); color:#d1fae5; }
.ps-badge.red    { background:rgba(239,68,68,.25); color:#fee2e2; }
.ps-badge.gray   { background:rgba(255,255,255,.15); color:rgba(255,255,255,.9); }

.ps-hero-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.55rem 1.125rem; border-radius:10px; font-size:.83rem; font-weight:600; cursor:pointer; border:none; transition:all .2s; }
.ps-hero-btn.save   { background:rgba(255,255,255,.25); color:white; border:1px solid rgba(255,255,255,.4); }
.ps-hero-btn.remove { background:rgba(239,68,68,.25); color:white; border:1px solid rgba(239,68,68,.4); }
.ps-hero-btn:hover  { transform:translateY(-1px); }
.ps-hero-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

/* Completion ring */
.ps-completion-ring { position:relative; width:72px; height:72px; flex-shrink:0; }
.ps-completion-ring svg { width:72px; height:72px; transform:rotate(-90deg); }
.ring-bg   { fill:none; stroke:rgba(255,255,255,.2); stroke-width:7; }
.ring-fill { fill:none; stroke-width:7; stroke-linecap:round; stroke-dasharray:188; transition:stroke-dashoffset .6s; }
.ring-fill.green  { stroke:#34d399; }
.ring-fill.amber  { stroke:#fbbf24; }
.ring-fill.red    { stroke:#f87171; }
.ring-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ring-label span:first-child { font-size:.95rem; font-weight:800; }
.ring-label span:last-child  { font-size:.58rem; color:rgba(255,255,255,.7); font-weight:600; }
.ring-label .green { color:#34d399; }
.ring-label .amber { color:#fbbf24; }
.ring-label .red   { color:#f87171; }

/* ── Main Tabs ── */
.ps-tabs { display:flex; gap:.5rem; background:white; border-radius:14px; padding:.5rem; margin-bottom:1.25rem; box-shadow:0 2px 12px rgba(0,0,0,.06); }
.ps-tab  { flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.75rem 1rem; border-radius:10px; border:none; background:transparent; cursor:pointer; font-size:.9rem; font-weight:600; color:#64748b; transition:all .25s; }
.ps-tab:hover  { background:#f8fafc; color:#1e293b; }
.ps-tab.active { background:linear-gradient(135deg,#f093fb,#f5576c); color:white; box-shadow:0 4px 14px rgba(240,147,251,.3); }
.ps-tab i { font-size:1.1rem; }

/* ── Stat row ── */
.ps-stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.25rem; }
.ps-stat { background:white; border-radius:14px; padding:1rem 1.25rem; display:flex; align-items:center; gap:.875rem; box-shadow:0 2px 12px rgba(0,0,0,.06); transition:all .2s; }
.ps-stat:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.1); }
.ps-stat-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
.ps-stat-val { font-size:.95rem; font-weight:700; color:#1e293b; margin:0; }
.ps-stat-lbl { font-size:.73rem; color:#94a3b8; margin:0; }

/* ── Layout ── */
.ps-two-col   { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
.ps-three-col { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.ps-col-2     { grid-column:span 2; }
.ps-mt { margin-top:1.25rem; }
.ps-save-bar { display:flex; }

/* ── Cards ── */
.ps-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.06); }
.ps-card.danger-card { border:1px solid #fecdd3; }
.ps-card-head { padding:1.125rem 1.5rem; color:white; display:flex; align-items:center; gap:.875rem; }
.ps-card-ico  { width:40px; height:40px; background:rgba(255,255,255,.2); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; }
.ps-card-head h6 { font-size:1rem; font-weight:700; margin:0; }
.ps-card-head p  { font-size:.78rem; margin:0; opacity:.88; }
.ps-card-body { padding:1.5rem; }
.ps-card-text { font-size:.875rem; color:#475569; line-height:1.6; margin:0 0 1rem; }

.h-rose   { background:linear-gradient(135deg,#f093fb,#f5576c); }
.h-amber  { background:linear-gradient(135deg,#fa709a,#fee140); }
.h-purple { background:linear-gradient(135deg,#8b5cf6,#7c3aed); }
.h-teal   { background:linear-gradient(135deg,#0d9488,#0891b2); }
.h-indigo { background:linear-gradient(135deg,#667eea,#764ba2); }
.h-red    { background:linear-gradient(135deg,#ef4444,#dc2626); }

/* ── Form ── */
.ps-grid-3    { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.ps-field     { display:flex; flex-direction:column; gap:.35rem; }
.ps-field-full { grid-column:1/-1; }
.ps-field label { display:flex; align-items:center; gap:.35rem; font-size:.83rem; font-weight:600; color:#475569; }
.ps-field label i { color:#f093fb; font-size:.95rem; }

.ps-input { padding:.75rem .95rem; border:2px solid #e2e8f0; border-radius:10px; font-size:.875rem; color:#1e293b; background:white; transition:all .25s; font-family:inherit; width:100%; box-sizing:border-box; resize:vertical; }
.ps-input:focus   { outline:none; border-color:#f093fb; box-shadow:0 0 0 3px rgba(240,147,251,.1); }
.ps-input.disabled { background:#f8fafc; color:#94a3b8; cursor:not-allowed; }
.ps-input.err     { border-color:#ef4444!important; }
.ps-field small { font-size:.75rem; color:#94a3b8; display:flex; align-items:center; gap:.3rem; }
.err-txt { color:#ef4444!important; }

.ps-tags-row  { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; margin-top:.875rem; padding:.75rem 1rem; background:#fff1fe; border-radius:10px; border:1px solid #fecdd3; }
.ps-tags-lbl  { font-size:.78rem; font-weight:600; color:#94a3b8; }
.ps-tag       { padding:.22rem .6rem; background:white; color:#f5576c; border-radius:20px; font-size:.75rem; font-weight:600; border:1px solid #fecdd3; }

/* ── Password ── */
.ps-pw-fields { display:flex; flex-direction:column; gap:1rem; }
.ps-eye { position:relative; }
.ps-eye .ps-input { padding-right:2.75rem; }
.ps-eye button { position:absolute; right:.75rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.05rem; display:flex; padding:0; }
.ps-strength { display:flex; align-items:center; gap:.5rem; margin-top:.25rem; }
.ps-bars { display:flex; gap:3px; flex:1; }
.ps-bars span { flex:1; height:4px; background:#e2e8f0; border-radius:2px; transition:all .3s; }
.ps-bars span.on.lv1 { background:#ef4444; }
.ps-bars span.on.lv2 { background:#f59e0b; }
.ps-bars span.on.lv3 { background:#3b82f6; }
.ps-bars span.on.lv4 { background:#10b981; }
.ps-str-lbl { font-size:.72rem; font-weight:600; color:#64748b; min-width:70px; }

/* ── Quick links / tips ── */
.ps-sec-title { font-size:.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin:0 0 .75rem; }
.ps-pw-tips { display:flex; flex-direction:column; gap:.5rem; margin-bottom:0; }
.ps-pw-tip  { display:flex; align-items:center; gap:.75rem; padding:.625rem .875rem; background:#f8fafc; border-radius:10px; font-size:.82rem; color:#475569; }
.ps-tip-ico { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.9rem; flex-shrink:0; }
.ps-divider { height:1px; background:#f1f5f9; margin:1rem 0; }
.ps-quick-links { display:flex; flex-direction:column; gap:.4rem; }
.ps-qlink { display:flex; align-items:center; gap:.75rem; padding:.75rem .875rem; border-radius:10px; text-decoration:none; color:#1e293b; background:#f8fafc; transition:all .2s; border:1px solid transparent; }
.ps-qlink:hover { background:#f1f5f9; border-color:#e2e8f0; transform:translateX(3px); }
.ps-qlink > span:last-of-type { flex:1; font-size:.85rem; font-weight:600; }
.ps-qlink > i:last-child { color:#94a3b8; font-size:1rem; }
.ps-qico { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }

/* ── Completion ── */
.ps-prog-hd   { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; font-size:.84rem; font-weight:600; color:#475569; }
.ps-prog-pct  { font-size:1rem; font-weight:800; }
.ps-prog-pct.green { color:#10b981; } .ps-prog-pct.amber { color:#f59e0b; } .ps-prog-pct.red { color:#ef4444; }
.ps-prog-track { height:8px; background:#f1f5f9; border-radius:8px; overflow:hidden; margin-bottom:.5rem; }
.ps-prog-fill  { height:100%; border-radius:8px; transition:width .6s; }
.ps-prog-fill.green { background:linear-gradient(90deg,#10b981,#34d399); }
.ps-prog-fill.amber { background:linear-gradient(90deg,#f59e0b,#fbbf24); }
.ps-prog-fill.red   { background:linear-gradient(90deg,#ef4444,#f87171); }
.ps-chklist { display:flex; flex-direction:column; gap:.4rem; }
.ps-chk { display:flex; align-items:center; gap:.75rem; padding:.625rem .875rem; border-radius:10px; background:#f8fafc; }
.ps-chk-dot { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.85rem; flex-shrink:0; }
.ps-chk-dot.done { background:#d1fae5; color:#059669; }
.ps-chk-dot.todo { background:#f1f5f9; color:#94a3b8; }
.ps-chk-name { display:block; font-size:.83rem; font-weight:600; color:#1e293b; margin:0; }
.ps-chk-name.done { text-decoration:line-through; color:#94a3b8; }
.ps-chk-desc { display:block; font-size:.72rem; color:#94a3b8; margin:0; }
.ps-chk > div { flex:1; }
.ps-chk-pts.earned { color:#10b981; } .ps-chk-pts.empty { color:#cbd5e1; }

/* ── Settings sub-tabs ── */
.ps-stabs { display:grid; grid-template-columns:repeat(4,1fr); gap:.875rem; margin-bottom:1.25rem; }
.ps-stab  { display:flex; flex-direction:column; align-items:center; gap:.375rem; padding:1.125rem 1rem; background:white; border:2px solid transparent; border-radius:14px; cursor:pointer; transition:all .25s; box-shadow:0 2px 12px rgba(0,0,0,.06); }
.ps-stab:hover { border-color:#e2e8f0; transform:translateY(-2px); }
.ps-stab.active { border-color:#667eea; background:#f5f3ff; }
.ps-stab-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; transition:all .25s; }
.ps-stab-ico.teal   { background:#f0fdfa; color:#0d9488; } .ps-stab.active .ps-stab-ico.teal   { background:#ccfbf1; }
.ps-stab-ico.purple { background:#faf5ff; color:#7c3aed; } .ps-stab.active .ps-stab-ico.purple { background:#ede9fe; }
.ps-stab-ico.rose   { background:#fff1f2; color:#f43f5e; } .ps-stab.active .ps-stab-ico.rose   { background:#ffe4e6; }
.ps-stab-ico.blue   { background:#eff6ff; color:#2563eb; } .ps-stab.active .ps-stab-ico.blue   { background:#dbeafe; }
.ps-stab-lbl { font-size:.875rem; font-weight:700; color:#1e293b; }
.ps-stab-sub { font-size:.72rem; color:#94a3b8; }
.ps-stab.active .ps-stab-lbl { color:#667eea; }

/* ── Toggle ── */
.ps-tgl-list { display:flex; flex-direction:column; gap:.5rem; }
.ps-tgl-row  { display:flex; align-items:center; gap:.875rem; padding:.875rem 1rem; border-radius:12px; background:#f8fafc; border:1px solid transparent; transition:all .2s; }
.ps-tgl-row:hover { background:#f1f5f9; border-color:#e2e8f0; }
.ps-tgl-ico  { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; flex-shrink:0; }
.ps-tgl-info { flex:1; min-width:0; }
.ps-tgl-title { font-size:.875rem; font-weight:600; color:#1e293b; margin:0 0 .1rem; }
.ps-tgl-desc  { font-size:.775rem; color:#64748b; margin:0; }

/* TOGGLE SWITCH */
.ps-switch { position:relative; display:inline-flex; align-items:center; cursor:pointer; width:50px; height:28px; flex-shrink:0; }
.ps-switch input { position:absolute; opacity:0; width:0; height:0; }
.ps-track { position:relative; width:50px; height:28px; background:#cbd5e1; border-radius:28px; transition:background .3s; display:block; }
.ps-thumb { position:absolute; top:3px; left:3px; width:22px; height:22px; background:white; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,.2); transition:transform .3s; display:block; }
.ps-switch input:checked ~ .ps-track { background:linear-gradient(135deg,#667eea,#764ba2); }
.ps-switch input:checked ~ .ps-track .ps-thumb { transform:translateX(22px); }

/* ── Theme ── */
.ps-field-lbl { font-size:.78rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin:0 0 .75rem; }
.ps-field-lbl.ps-mt { margin-top:1.25rem; }
.ps-theme-grid { display:flex; gap:.75rem; flex-wrap:wrap; }
.ps-theme-card { display:flex; flex-direction:column; align-items:center; gap:.45rem; padding:.75rem; border-radius:12px; border:2px solid #e2e8f0; cursor:pointer; transition:all .2s; position:relative; min-width:80px; }
.ps-theme-card:hover  { border-color:#667eea; background:#f5f3ff; }
.ps-theme-card.active { border-color:#7c3aed; background:#f5f3ff; }
.ps-theme-swatch { width:40px; height:26px; border-radius:7px; box-shadow:0 2px 8px rgba(0,0,0,.15); }
.ps-theme-card span { font-size:.75rem; font-weight:600; color:#475569; }
.ps-theme-chk { position:absolute; top:-7px; right:-7px; font-size:1.1rem; color:#7c3aed; }

/* ── Select ── */
.ps-sel-wrap { position:relative; display:flex; align-items:center; }
.ps-sel-ico  { position:absolute; left:.875rem; font-size:1.1rem; color:#94a3b8; pointer-events:none; z-index:1; }
.ps-select   { width:100%; padding:.75rem 2.5rem .75rem 2.5rem; border:2px solid #e2e8f0; border-radius:10px; font-size:.875rem; color:#1e293b; background:white; appearance:none; cursor:pointer; transition:all .25s; font-family:inherit; }
.ps-select:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1); }
.ps-sel-wrap::after { content:'⌄'; position:absolute; right:1rem; color:#94a3b8; pointer-events:none; font-weight:700; }

/* ── Radio ── */
.ps-radio-list { display:flex; flex-direction:column; gap:.5rem; }
.ps-radio { display:flex; align-items:center; gap:.75rem; cursor:pointer; }
.ps-radio input { display:none; }
.ps-radio-dot { width:18px; height:18px; border-radius:50%; border:2px solid #cbd5e1; position:relative; flex-shrink:0; transition:all .2s; }
.ps-radio input:checked ~ .ps-radio-dot { border-color:#7c3aed; }
.ps-radio input:checked ~ .ps-radio-dot::after { content:''; position:absolute; inset:3px; background:linear-gradient(135deg,#667eea,#764ba2); border-radius:50%; }
.ps-radio span:last-child { font-size:.875rem; color:#475569; }

/* ── Preview ── */
.ps-preview { border-radius:12px; padding:1.125rem; text-align:center; color:white; }
.ps-preview-badge { display:inline-block; background:rgba(255,255,255,.25); padding:.3rem 1rem; border-radius:20px; font-weight:700; font-size:.85rem; margin-bottom:.375rem; }
.ps-preview p { margin:0; opacity:.85; font-size:.82rem; }

/* ── Alert ── */
.ps-alert { display:flex; gap:.875rem; padding:.875rem 1rem; border-radius:12px; margin-bottom:1rem; font-size:.83rem; }
.ps-alert.amber { background:#fffbeb; color:#92400e; border:1px solid #fde68a; }
.ps-alert i { font-size:1.2rem; color:#d97706; flex-shrink:0; margin-top:2px; }
.ps-alert strong { display:block; font-weight:700; margin-bottom:.15rem; }
.ps-alert p { margin:0; }

/* ── Tips grid ── */
.ps-tips-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
.ps-tip-card  { display:flex; align-items:flex-start; gap:.75rem; padding:.875rem; background:#f8fafc; border-radius:12px; }
.ps-tip-ico   { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
.ps-tip-title { font-size:.83rem; font-weight:700; color:#1e293b; margin:0 0 .15rem; }
.ps-tip-desc  { font-size:.75rem; color:#64748b; margin:0; line-height:1.4; }

/* ── Data cards ── */
.ps-feat-list  { display:flex; flex-direction:column; gap:.4rem; margin-bottom:1rem; }
.ps-feat       { display:flex; align-items:center; gap:.5rem; font-size:.83rem; color:#475569; }
.ps-act-list   { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1rem; }
.ps-act-row    { display:flex; align-items:center; gap:.75rem; padding:.625rem .875rem; background:#f8fafc; border-radius:10px; }
.ps-act-dot    { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.ps-act-lbl    { font-size:.83rem; font-weight:600; color:#1e293b; margin:0; }
.ps-act-time   { font-size:.73rem; color:#94a3b8; margin:0; }
.ps-danger-warn { display:flex; align-items:center; gap:.5rem; padding:.75rem 1rem; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; font-size:.82rem; color:#ef4444; margin-bottom:1rem; }
.ps-danger-warn i { font-size:1.1rem; flex-shrink:0; }

/* ── Policy ── */
.ps-policy-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.ps-policy-item { display:flex; align-items:flex-start; gap:.75rem; padding:1rem; background:#f8fafc; border-radius:12px; }
.ps-policy-ico  { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; flex-shrink:0; }
.ps-policy-title { font-size:.83rem; font-weight:700; color:#1e293b; margin:0 0 .2rem; }
.ps-policy-desc  { font-size:.75rem; color:#64748b; margin:0; line-height:1.4; }

/* ── Actions ── */
.ps-actions { margin-top:1.25rem; padding-top:1.125rem; border-top:1px solid #f1f5f9; display:flex; gap:.625rem; flex-wrap:wrap; }
.ps-btn { display:inline-flex; align-items:center; gap:.45rem; padding:.7rem 1.375rem; border-radius:10px; font-weight:600; font-size:.875rem; cursor:pointer; border:none; transition:all .25s; }
.ps-btn:disabled { opacity:.6; cursor:not-allowed; transform:none!important; }
.ps-btn.primary       { background:linear-gradient(135deg,#f093fb,#f5576c); color:white; }
.ps-btn.primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 18px rgba(240,147,251,.35); }
.ps-btn.amber         { background:linear-gradient(135deg,#fa709a,#fee140); color:white; }
.ps-btn.amber:hover:not(:disabled)   { transform:translateY(-2px); box-shadow:0 6px 18px rgba(250,112,154,.35); }
.ps-btn.teal          { background:linear-gradient(135deg,#0d9488,#0891b2); color:white; }
.ps-btn.teal:hover    { transform:translateY(-2px); box-shadow:0 6px 18px rgba(13,148,136,.35); }
.ps-btn.danger        { background:linear-gradient(135deg,#ef4444,#dc2626); color:white; }
.ps-btn.danger:hover  { transform:translateY(-2px); box-shadow:0 6px 18px rgba(239,68,68,.35); }
.ps-btn.danger-outline { background:transparent; color:#ef4444; border:2px solid #fca5a5; }
.ps-btn.danger-outline:hover { background:#fff1f2; }
.ps-btn.amber-outline { background:transparent; color:#d97706; border:2px solid #fcd34d; }
.ps-btn.amber-outline:hover { background:#fffbeb; }

.bx-spin { animation:spin 1s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* ── Responsive ── */
@media (max-width:1200px) { .ps-grid-3 { grid-template-columns:1fr 1fr; } .ps-policy-grid { grid-template-columns:1fr 1fr; } }
@media (max-width:992px)  {
  .ps-two-col,.ps-three-col { grid-template-columns:1fr; }
  .ps-col-2 { grid-column:auto; }
  .ps-stat-row { grid-template-columns:1fr 1fr; }
  .ps-stabs { grid-template-columns:1fr 1fr; }
}
@media (max-width:768px)  {
  .ps-grid-3 { grid-template-columns:1fr; }
  .ps-hero { flex-direction:column; }
  .ps-hero-right .ps-completion-ring { display:none; }
  .ps-tips-grid { grid-template-columns:1fr; }
}
@media (max-width:480px)  {
  .ps-stat-row { grid-template-columns:1fr 1fr; }
  .ps-stabs { grid-template-columns:1fr 1fr; }
  .ps-card-body { padding:1.125rem; }
  .ps-btn { width:100%; justify-content:center; }
}
</style>