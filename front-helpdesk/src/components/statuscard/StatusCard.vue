<template>
  <div class="status-card" :class="cardClass" @click="$emit('click')">
    <!-- Header -->
    <div class="card-header">
      <div class="header-left">
        <span class="incident-number">{{ status.incident_number }}</span>
        <span v-if="isPinned" class="pinned-badge">
          <i class="bx bx-pin"></i>
          Penting
        </span>
      </div>
      <span :class="['severity-badge', `severity-${status.severity}`]">
        {{ getSeverityLabel(status.severity) }}
      </span>
    </div>

    <!-- Title -->
    <h3 class="status-title">{{ status.title }}</h3>

    <!-- Meta Info -->
    <div class="meta-info">
      <span class="meta-item">
        <i class="bx bx-category"></i>
        {{ getCategoryLabel(status.category) }}
      </span>
      <span v-if="status.affected_area" class="meta-item">
        <i class="bx bx-map"></i>
        {{ status.affected_area }}
      </span>
    </div>

    <!-- Description -->
    <p class="status-description">{{ truncateText(status.description, 120) }}</p>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-left">
        <span :class="['status-badge', `status-${status.status}`]">
          <i :class="getStatusIcon(status.status)"></i>
          {{ getStatusLabel(status.status) }}
        </span>
      </div>
      <div class="footer-right">
        <span class="time-info">
          <i class="bx bx-time"></i>
          {{ formatTimeAgo(status.started_at) }}
        </span>
      </div>
    </div>

    <!-- Updates Count -->
    <div v-if="status.updates && status.updates.length > 0" class="updates-indicator">
      <i class="bx bx-comment-dots"></i>
      {{ status.updates.length }} Update{{ status.updates.length > 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: Object,
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const cardClass = computed(() => {
  const classes = ['clickable']
  
  if (props.isPinned) {
    classes.push('is-pinned')
  }
  
  if (props.status.severity === 'critical') {
    classes.push('card-critical')
  } else if (props.status.severity === 'high') {
    classes.push('card-high')
  }
  
  return classes.join(' ')
})

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Kritis',
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah'
  }
  return labels[severity] || severity
}

const getCategoryLabel = (category) => {
  const labels = {
    power_outage: 'Gangguan Listrik',
    technical_issue: 'Masalah Teknis',
    facility_issue: 'Masalah Fasilitas',
    network_issue: 'Gangguan Jaringan',
    other: 'Lainnya'
  }
  return labels[category] || category
}

const getStatusLabel = (status) => {
  const labels = {
    investigating: 'Sedang Diselidiki',
    identified: 'Teridentifikasi',
    monitoring: 'Pemantauan',
    resolved: 'Selesai'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    investigating: 'bx-search',
    identified: 'bx-check',
    monitoring: 'bx-radar',
    resolved: 'bx-check-circle'
  }
  return `bx ${icons[status] || 'bx-info-circle'}`
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diffInMinutes = Math.floor((now - past) / 60000)
  
  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam lalu`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} hari lalu`
  
  return past.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.status-card {
  background: white;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #e5e7eb;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.status-card.clickable {
  cursor: pointer;
}

.status-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.status-card.is-pinned {
  border-left-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, white 100%);
}

.status-card.card-critical {
  border-left-color: #ef4444;
}

.status-card.card-high {
  border-left-color: #f59e0b;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.incident-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #667eea;
  padding: 0.375rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.pinned-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #667eea;
  padding: 0.25rem 0.625rem;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 6px;
}

.severity-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.severity-critical {
  background: #fee2e2;
  color: #991b1b;
}

.severity-high {
  background: #fef3c7;
  color: #92400e;
}

.severity-medium {
  background: #dbeafe;
  color: #1e40af;
}

.severity-low {
  background: #f3f4f6;
  color: #4b5563;
}

/* Title */
.status-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

/* Meta Info */
.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.meta-item i {
  font-size: 1rem;
  color: #9ca3af;
}

/* Description */
.status-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #6c757d;
  margin: 0 0 1.25rem 0;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  gap: 1rem;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.status-investigating {
  background: #fef3c7;
  color: #92400e;
}

.status-identified {
  background: #dbeafe;
  color: #1e40af;
}

.status-monitoring {
  background: #e0e7ff;
  color: #4338ca;
}

.status-resolved {
  background: #d1fae5;
  color: #065f46;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Updates Indicator */
.updates-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .status-card {
    padding: 1.25rem;
  }

  .status-title {
    font-size: 1.125rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>