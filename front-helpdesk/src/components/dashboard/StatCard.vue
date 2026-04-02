<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <span class="fw-semibold d-block mb-1">{{ title }}</span>
          <h3 class="card-title mb-2" v-if="!loading">{{ formattedValue }}</h3>
          <div v-else class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="avatar flex-shrink-0">
          <span :class="`avatar-initial rounded bg-label-${color}`">
            <i :class="`bx ${icon} bx-sm`"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  icon: String,
  color: {
    type: String,
    default: 'primary'
  },
  loading: Boolean
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>