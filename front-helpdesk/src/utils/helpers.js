// File: frontend/src/utils/helpers.js

import moment from 'moment'

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  if (!date) return '-'
  return moment(date).format('MMM DD, YYYY HH:mm')
}

/**
 * Format date short (without time)
 */
export const formatDateShort = (date) => {
  if (!date) return '-'
  return moment(date).format('MMM DD, YYYY')
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'
  return moment(date).fromNow()
}

/**
 * Time ago (alias for formatRelativeTime)
 */
export const timeAgo = (date) => {
  return formatRelativeTime(date)
}

/**
 * Get time ago text with color class
 */
export const getTimeAgoClass = (date) => {
  if (!date) return 'text-muted'
  const hours = moment().diff(moment(date), 'hours')
  if (hours < 1) return 'text-success'
  if (hours < 24) return 'text-warning'
  return 'text-danger'
}

/**
 * Get priority color class
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'secondary',
    'medium': 'info',
    'high': 'warning',
    'critical': 'danger'
  }
  return colors[priority] || 'secondary'
}

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  const colors = {
    'new': 'warning',
    'in_progress': 'info',
    'waiting_response': 'secondary',
    'resolved': 'success',
    'closed': 'dark'
  }
  return colors[status] || 'secondary'
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Format status text (e.g., "in_progress" -> "In Progress")
 */
export const formatStatus = (status) => {
  if (!status) return '-'
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format priority text
 */
export const formatPriority = (priority) => {
  if (!priority) return '-'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Format number with thousand separator
 */
export const formatNumber = (num) => {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get time difference in minutes
 */
export const getTimeDiffInMinutes = (start, end) => {
  if (!start || !end) return 0
  return moment(end).diff(moment(start), 'minutes')
}

/**
 * Check if date is overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return moment().isAfter(moment(dueDate))
}

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Default export (optional)
export default {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  timeAgo,
  getTimeAgoClass,
  getPriorityColor,
  getStatusColor,
  getInitials,
  formatStatus,
  formatPriority,
  truncate,
  formatNumber,
  calculatePercentage,
  getTimeDiffInMinutes,
  isOverdue,
  formatFileSize,
  downloadFile,
  copyToClipboard,
  debounce
}