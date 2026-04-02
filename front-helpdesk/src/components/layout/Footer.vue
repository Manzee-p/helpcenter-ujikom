<template>
  <footer class="content-footer footer bg-footer-theme">
    <div class="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
      <div class="mb-2 mb-md-0">
        © {{ currentYear }}
        <a href="#" target="_blank" class="footer-link fw-bolder">Web HelpCenter</a>
      </div>
      <div>
        <a href="#" class="footer-link me-4">Documentation</a>
        <a href="#" class="footer-link me-4">Support</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
