<template>
  <div class="landing-page">
    <!-- Simple Navbar for Guest -->
    <nav class="guest-navbar">
      <div class="nav-container">
        <div class="logo">
          <i class="bx bx-support"></i>
          <span>HelpCenter</span>
        </div>
        <div class="nav-actions">
          <router-link to="/status" class="nav-link">
            <i class="bx bx-info-circle"></i>
            <span>Status Layanan</span>
          </router-link>
          <router-link to="/login" class="btn-login">
            <i class="bx bx-log-in"></i>
            <span>Login</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">
          <i class="bx bx-check-shield"></i>
          <span>Sistem Support Terpercaya</span>
        </div>
        
        <h1 class="hero-title">
          Solusi Cepat untuk
          <span class="gradient-text">Setiap Masalah</span>
        </h1>
        
        <p class="hero-description">
          Platform HelpCenter modern yang memudahkan Anda melaporkan masalah, 
          melacak progress, dan berkomunikasi dengan tim support secara real-time.
        </p>
        
        <div class="hero-actions">
          <router-link to="/login" class="btn-primary">
            <span>Mulai Sekarang</span>
            <i class="bx bx-right-arrow-alt"></i>
          </router-link>
          <router-link to="/status" class="btn-secondary">
            <i class="bx bx-info-circle"></i>
            <span>Lihat Status</span>
          </router-link>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="bx bx-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">1250+</div>
              <div class="stat-label">Tiket Terselesaikan</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="bx bx-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">2j</div>
              <div class="stat-label">Rata-rata Respons</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="bx bx-happy"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">98%</div>
              <div class="stat-label">Kepuasan User</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Cara Kerja Sistem</h2>
          <p class="section-subtitle">
            4 langkah mudah untuk mendapatkan bantuan
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card" v-for="(step, index) in steps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-icon" :style="{ background: step.color }">
              <i :class="step.icon"></i>
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Fitur Unggulan</h2>
          <p class="section-subtitle">
            Semua yang Anda butuhkan untuk mengelola support dengan efisien
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon" :style="{ background: feature.color }">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Preview Section -->
    <section class="dashboard-preview">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Dashboard yang Intuitif</h2>
          <p class="section-subtitle">
            Kelola semua tiket dan komunikasi dalam satu tempat
          </p>
        </div>

        <div class="preview-container">
          <div class="preview-mockup">
            <div class="mockup-browser">
              <div class="browser-header">
                <div class="browser-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="browser-address">localhost:8080/dashboard</div>
              </div>
              <div class="browser-content">
                <div class="mock-sidebar">
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                  <div class="mock-nav-item"></div>
                </div>
                <div class="mock-main-content">
                  <div class="mock-top-bar"></div>
                  <div class="mock-stats-row">
                    <div class="mock-stat-card"></div>
                    <div class="mock-stat-card"></div>
                    <div class="mock-stat-card"></div>
                    <div class="mock-stat-card"></div>
                  </div>
                  <div class="mock-table">
                    <div class="mock-table-row"></div>
                    <div class="mock-table-row"></div>
                    <div class="mock-table-row"></div>
                    <div class="mock-table-row"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="preview-features">
            <div class="preview-feature-item">
              <div class="preview-feature-icon">
                <i class="bx bx-bar-chart-alt-2"></i>
              </div>
              <div class="preview-feature-content">
                <h4>Analytics Real-time</h4>
                <p>Pantau performa tim dan metrik tiket secara langsung</p>
              </div>
            </div>
            <div class="preview-feature-item">
              <div class="preview-feature-icon">
                <i class="bx bx-filter-alt"></i>
              </div>
              <div class="preview-feature-content">
                <h4>Filter & Sorting</h4>
                <p>Temukan tiket dengan cepat menggunakan filter canggih</p>
              </div>
            </div>
            <div class="preview-feature-item">
              <div class="preview-feature-icon">
                <i class="bx bx-bell"></i>
              </div>
              <div class="preview-feature-content">
                <h4>Notifikasi Instan</h4>
                <p>Dapatkan update real-time untuk setiap perubahan status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Mengapa Memilih HelpCenter?</h2>
          <p class="section-subtitle">
            Tingkatkan produktivitas dan kepuasan pelanggan Anda
          </p>
        </div>

        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-image">
              <div class="benefit-illustration">
                <i class="bx bx-trending-up"></i>
              </div>
            </div>
            <h3>Tingkatkan Efisiensi</h3>
            <p>Kurangi waktu resolusi tiket hingga 60% dengan workflow otomatis dan assignment cerdas</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-image">
              <div class="benefit-illustration">
                <i class="bx bx-group"></i>
              </div>
            </div>
            <h3>Kolaborasi Tim</h3>
            <p>Tingkatkan kerja sama antar departemen dengan tools komunikasi terintegrasi</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-image">
              <div class="benefit-illustration">
                <i class="bx bx-line-chart"></i>
              </div>
            </div>
            <h3>Analisis Mendalam</h3>
            <p>Dapatkan insight berharga dari data tiket untuk perbaikan berkelanjutan</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Section -->
    <section class="integrations">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Terintegrasi dengan Tools Favorit</h2>
          <p class="section-subtitle">
            Hubungkan dengan aplikasi yang sudah Anda gunakan
          </p>
        </div>

        <div class="integration-logos">
          <div class="integration-item" v-for="integration in integrations" :key="integration.name">
            <div class="integration-logo">
              <i :class="integration.icon"></i>
            </div>
            <span>{{ integration.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Apa Kata Mereka?</h2>
          <p class="section-subtitle">
            Dipercaya oleh ratusan pengguna
          </p>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="(testimonial, index) in testimonials" :key="index">
            <div class="testimonial-stars">
              <i class="bx bxs-star" v-for="n in 5" :key="n"></i>
            </div>
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testimonial.initial }}</div>
              <div class="author-info">
                <div class="author-name">{{ testimonial.name }}</div>
                <div class="author-role">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Pertanyaan yang Sering Diajukan</h2>
          <p class="section-subtitle">
            Temukan jawaban untuk pertanyaan umum
          </p>
        </div>

        <div class="faq-container">
          <div class="faq-item" v-for="(item, index) in faqs" :key="index">
            <div class="faq-question">
              <h4>{{ item.question }}</h4>
              <i class="bx bx-plus"></i>
            </div>
            <div class="faq-answer">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-container">
        <div class="cta-icon">
          <i class="bx bx-rocket"></i>
        </div>
        <h2 class="cta-title">Siap untuk Memulai?</h2>
        <p class="cta-description">
          Bergabunglah dengan ribuan pengguna yang sudah mempercayai sistem kami
        </p>
        <router-link to="/login" class="btn-cta">
          <span>Login Sekarang</span>
          <i class="bx bx-right-arrow-alt"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const steps = ref([
  {
    icon: 'bx bx-log-in',
    title: 'Login ke Sistem',
    description: 'Akses dashboard dengan kredensial Anda',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'bx bx-message-square-add',
    title: 'Buat Tiket',
    description: 'Laporkan masalah dengan detail lengkap',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'bx bx-conversation',
    title: 'Komunikasi',
    description: 'Chat dengan teknisi untuk solusi cepat',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'bx bx-check-circle',
    title: 'Selesai',
    description: 'Masalah terselesaikan, tiket ditutup',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

const features = ref([
  {
    icon: 'bx bx-rocket',
    title: 'Respon Cepat',
    description: 'Tim support siap membantu dengan waktu respons rata-rata 2 jam',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'bx bx-globe',
    title: 'Status Real-time',
    description: 'Pantau status layanan dan gangguan sistem secara real-time',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'bx bx-conversation',
    title: 'Komunikasi Mudah',
    description: 'Chat langsung dengan teknisi dan vendor untuk solusi cepat',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'bx bx-history',
    title: 'Riwayat Lengkap',
    description: 'Akses semua riwayat tiket dan komunikasi kapan saja',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: 'bx bx-mobile',
    title: 'Mobile Friendly',
    description: 'Akses dari mana saja, kapan saja melalui smartphone Anda',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: 'bx bx-shield-check',
    title: 'Aman & Terpercaya',
    description: 'Data Anda dijamin aman dengan enkripsi tingkat enterprise',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

const integrations = ref([
  { name: 'Slack', icon: 'bx bxl-slack' },
  { name: 'Google', icon: 'bx bxl-google' },
  { name: 'Microsoft', icon: 'bx bxl-microsoft' },
  { name: 'Trello', icon: 'bx bxl-trello' },
  { name: 'Gmail', icon: 'bx bx-envelope' },
  { name: 'Zoom', icon: 'bx bx-video' }
])

const testimonials = ref([
  {
    name: 'Budi Santoso',
    role: 'IT Manager',
    initial: 'BS',
    text: 'Sistem yang sangat membantu tim kami dalam mengelola support. Response time sangat cepat!'
  },
  {
    name: 'Siti Nurhaliza',
    role: 'Operations Head',
    initial: 'SN',
    text: 'Interface yang mudah digunakan. Tim kami langsung bisa menggunakan tanpa training panjang.'
  },
  {
    name: 'Ahmad Dahlan',
    role: 'Facility Manager',
    initial: 'AD',
    text: 'Tracking tiket jadi sangat mudah. Semua history tersimpan dengan rapi dan mudah diakses.'
  }
])

const faqs = ref([
  {
    question: 'Bagaimana cara membuat tiket baru?',
    answer: 'Setelah login, klik tombol "Buat Tiket" di dashboard. Isi detail masalah, pilih kategori, dan submit. Tim support akan segera merespons.'
  },
  {
    question: 'Berapa lama waktu respons rata-rata?',
    answer: 'Kami berkomitmen untuk merespons setiap tiket dalam waktu maksimal 2 jam pada jam kerja. Untuk masalah urgent, respons bisa lebih cepat.'
  },
  {
    question: 'Apakah saya bisa melacak status tiket?',
    answer: 'Ya, Anda dapat melacak status tiket secara real-time melalui dashboard. Anda juga akan menerima notifikasi email untuk setiap update.'
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Keamanan data adalah prioritas kami. Semua data dienkripsi dan disimpan dengan standar keamanan enterprise-level.'
  },
  {
    question: 'Apakah bisa diakses melalui mobile?',
    answer: 'Ya, sistem kami fully responsive dan dapat diakses melalui browser mobile maupun desktop dengan pengalaman yang optimal.'
  }
])
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  min-height: 100vh;
  background: #f5f7fa;
  color: #2c3e50;
  width: 100%;
  overflow-x: hidden;
}

/* Guest Navbar */
.guest-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo i {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #667eea;
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rem 2rem 4rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
}

.hero-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  text-align: center;
  width: 100%;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out;
  color: #667eea;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
  color: #2c3e50;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: #6c757d;
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  color: #667eea;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  margin-top: 4rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.8s both;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.stat-content {
  text-align: left;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #6c757d;
}

/* How It Works */
.how-it-works {
  padding: 6rem 2rem;
  background: white;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateY(-8px);
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
}

.step-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.step-description {
  color: #6c757d;
  line-height: 1.6;
}

/* Features */
.features {
  padding: 6rem 2rem;
  background: #f5f7fa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  padding: 2.5rem;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-description {
  color: #6c757d;
  line-height: 1.6;
}

/* Dashboard Preview */
.dashboard-preview {
  padding: 6rem 2rem;
  background: white;
}

.preview-container {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
  align-items: center;
}

.preview-mockup {
  position: relative;
}

.mockup-browser {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.browser-header {
  background: #f9fafb;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.browser-dots {
  display: flex;
  gap: 0.5rem;
}

.browser-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
}

.browser-address {
  flex: 1;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #6c757d;
}

.browser-content {
  display: flex;
  min-height: 400px;
  background: #fafbfc;
}

.mock-sidebar {
  width: 80px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mock-nav-item {
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.mock-main-content {
  flex: 1;
  padding: 2rem;
}

.mock-top-bar {
  height: 60px;
  background: #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.mock-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mock-stat-card {
  height: 100px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.mock-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mock-table-row {
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
}

.preview-features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preview-feature-item {
  display: flex;
  gap: 1.5rem;
  align-items: start;
}

.preview-feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.preview-feature-content h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.preview-feature-content p {
  color: #6c757d;
  line-height: 1.6;
}

/* Benefits */
.benefits {
  padding: 6rem 2rem;
  background: #f5f7fa;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 3rem;
}

.benefit-card {
  text-align: center;
}

.benefit-image {
  margin-bottom: 2rem;
}

.benefit-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
}

.benefit-card h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.benefit-card p {
  color: #6c757d;
  line-height: 1.7;
  font-size: 1.125rem;
}

/* Integrations */
.integrations {
  padding: 6rem 2rem;
  background: white;
}

.integration-logos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.integration-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s;
}

.integration-item:hover {
  transform: translateY(-4px);
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.integration-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #667eea;
}

.integration-item span {
  font-weight: 600;
  color: #2c3e50;
}

/* Testimonials */
.testimonials {
  padding: 6rem 2rem;
  background: #f5f7fa;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  padding: 2rem;
  transition: all 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.testimonial-stars {
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: #4b5563;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
}

.author-name {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.author-role {
  font-size: 0.875rem;
  color: #6c757d;
}

/* FAQ */
.faq {
  padding: 6rem 2rem;
  background: white;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s;
}

.faq-item:hover {
  border-color: #667eea;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  cursor: pointer;
  user-select: none;
}

.faq-question h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.faq-question i {
  font-size: 1.5rem;
  color: #667eea;
}

.faq-answer {
  padding: 0 2rem 1.5rem;
  color: #6c757d;
  line-height: 1.7;
}

/* CTA */
.cta {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
}

.cta-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: white;
}

.cta-description {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  color: white;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.25rem;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .preview-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item {
    width: 100%;
  }

  .nav-link span {
    display: none;
  }

  .cta-title {
    font-size: 2rem;
  }

  .integration-logos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
