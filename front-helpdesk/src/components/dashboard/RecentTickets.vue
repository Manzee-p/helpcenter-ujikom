<template>
  <div class="table-responsive">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <table v-else class="table table-hover">
      <thead>
        <tr>
          <th>Ticket #</th>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="tickets.length === 0">
          <td colspan="6" class="text-center text-muted">No tickets found</td>
        </tr>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td><strong>{{ ticket.ticket_number }}</strong></td>
          <td>{{ ticket.title }}</td>
          <td>
            <TicketStatusBadge :status="ticket.status" />
          </td>
          <td>
            <span :class="`badge bg-label-${getPriorityColor(ticket.priority)}`">
              {{ ticket.priority }}
            </span>
          </td>
          <td>{{ formatDate(ticket.created_at) }}</td>
          <td>
            <router-link :to="`/tickets/${ticket.id}`" class="btn btn-sm btn-icon btn-primary">
              <i class="bx bx-show"></i>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge.vue'
import { formatDate, getPriorityColor } from '@/utils/helpers'

defineProps({
  tickets: Array,
  loading: Boolean
})
</script>