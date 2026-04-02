// src/directives/clickOutside.js
export const clickOutside = {
  mounted(el, binding) {
    el.__ClickOutsideHandler__ = (event) => {
      // Pastikan click benar-benar di luar element
      if (!(el === event.target || el.contains(event.target))) {
        // Panggil function yang diberikan
        binding.value(event)
      }
    }
    
    // Delay untuk menghindari trigger langsung
    setTimeout(() => {
      document.addEventListener('click', el.__ClickOutsideHandler__, true)
    }, 100)
  },
  
  beforeUnmount(el) {
    if (el.__ClickOutsideHandler__) {
      document.removeEventListener('click', el.__ClickOutsideHandler__, true)
      delete el.__ClickOutsideHandler__
    }
  }
}