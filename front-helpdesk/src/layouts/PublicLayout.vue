<template>
  <div class="public-layout">
    <!-- Public Navbar - Simple without Dashboard -->
    <nav class="public-navbar">
      <div class="navbar-container">
        <router-link to="/" class="nav-brand">
          <i class="bx bx-support"></i>
          <span>HelpCenter</span>
        </router-link>
        
        <div class="nav-menu">
          <router-link to="/" class="nav-link">
            <i class="bx bx-home"></i>
            <span>Home</span>
          </router-link>
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

    <!-- Content -->
    <main class="public-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="public-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="logo">
            <i class="bx bx-support"></i>
            <span>HelpCenter</span>
          </div>
          <p>Sistem Support Terpercaya</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h4>Layanan</h4>
            <router-link to="/status">Status Board</router-link>
            <router-link to="/login">Login</router-link>
          </div>
          <div class="footer-column">
            <h4>Kontak</h4>
            <a href="mailto:support@helpdesk.com">support@helpdesk.com</a>
            <a href="tel:+6281234567890">+62 812-3456-7890</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 HelpCenter System. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Layout for public pages without dashboard navbar
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  width: 100%;
  overflow-x: hidden;
}

/* Public Navbar */
.public-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-brand i {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
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

.public-content {
  flex: 1;
  width: 100%;
}

.public-footer {
  background: white;
  color: #2c3e50;
  border-top: 1px solid #e5e7eb;
  padding: 3rem 0 1.5rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-brand .logo i {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-brand p {
  color: #6c757d;
}

.footer-links {
  display: flex;
  gap: 3rem;
}

.footer-column h4 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.footer-column a {
  display: block;
  color: #6c757d;
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
}

.footer-column a:hover {
  color: #667eea;
  transform: translateX(4px);
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  color: #9ca3af;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .nav-link span {
    display: none;
  }

  .footer-container {
    grid-template-columns: 1fr;
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .footer-container {
    padding: 0 1rem;
  }
}
</style>
