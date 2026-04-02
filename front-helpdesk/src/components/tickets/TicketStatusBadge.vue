<template>
  <span :class="`badge bg-label-${statusColor}`">
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: String
})

const statusColors = {
  'new': 'warning',
  'in_progress': 'info',
  'waiting_response': 'secondary',
  'resolved': 'success',
  'closed': 'dark'
}

const statusTexts = {
  'new': 'New',
  'in_progress': 'In Progress',
  'waiting_response': 'Waiting Response',
  'resolved': 'Resolved',
  'closed': 'Closed'
}

const statusColor = computed(() => statusColors[props.status] || 'secondary')
const statusText = computed(() => statusTexts[props.status] || props.status)
</script>