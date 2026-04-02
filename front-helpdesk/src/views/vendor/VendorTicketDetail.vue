<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="bx bx-error me-2"></i>{{ error }}
      <button class="btn btn-sm btn-outline-secondary ms-3" @click="goBack">
        <i class="bx bx-arrow-back me-1"></i>Go Back
      </button>
    </div>

    <div v-else-if="ticket" class="vendor-ticket-detail">
      <!-- Action Bar -->
      <div class="action-bar mb-4">
        <div class="card bg-light">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="goBack">
                  <i class="bx bx-arrow-back"></i>
                </button>
                <span class="badge bg-primary me-2">{{ ticket.ticket_number }}</span>
                <span :class="`badge bg-${getPriorityBgColor(ticket.priority)}`">
                  {{ ticket.priority.toUpperCase() }}
                </span>
                <span class="text-muted ms-3">
                  <i class="bx bx-time-five"></i>
                  Created {{ formatRelativeTime(ticket.created_at) }}
                </span>
              </div>
              <div class="col-md-4 text-md-end mt-2 mt-md-0">
                <button
                  v-if="canUpdateStatus"
                  class="btn btn-primary btn-sm"
                  @click="showStatusModal = true"
                >
                  <i class="bx bx-edit me-1"></i> Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="row g-3">
        <!-- Left Column: Ticket Content -->
        <div class="col-lg-8">
          <!-- Priority Alert for Critical -->
          <div v-if="ticket.priority === 'critical'" class="alert alert-danger mb-3">
            <div class="d-flex align-items-center">
              <i class="bx bx-error-circle bx-lg me-3"></i>
              <div>
                <strong>CRITICAL PRIORITY!</strong>
                <p class="mb-0">This ticket requires immediate attention. Please respond as soon as possible.</p>
              </div>
            </div>
          </div>

          <!-- Ticket Details Card -->
          <div class="card mb-3">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ ticket.title }}</h5>
                <span :class="`badge bg-label-${getStatusColor(ticket.status)}`">
                  {{ formatStatus(ticket.status) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <!-- Event Info -->
              <div v-if="hasEventInfo" class="event-info mb-3">
                <div class="row">
                  <div class="col-md-4" v-if="ticket.event_name">
                    <div class="info-box">
                      <i class="bx bx-calendar text-primary"></i>
                      <div>
                        <small class="text-muted">Event</small>
                        <div class="fw-semibold">{{ ticket.event_name }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4" v-if="ticket.venue">
                    <div class="info-box">
                      <i class="bx bx-building text-info"></i>
                      <div>
                        <small class="text-muted">Venue</small>
                        <div class="fw-semibold">{{ ticket.venue }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4" v-if="ticket.area">
                    <div class="info-box">
                      <i class="bx bx-map text-success"></i>
                      <div>
                        <small class="text-muted">Area</small>
                        <div class="fw-semibold">{{ ticket.area }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="description-box mb-3">
                <h6 class="text-muted mb-2">Issue Description</h6>
                <p class="mb-0">{{ ticket.description }}</p>
              </div>

              <!-- Attachments -->
              <div v-if="hasAttachments">
                <h6 class="text-muted mb-2">Attachments</h6>
                <div class="attachments-grid">
                  <a
                    v-for="attachment in ticket.attachments"
                    :key="attachment.id"
                    :href="getAttachmentUrl(attachment.file_path)"
                    target="_blank"
                    class="attachment-item"
                  >
                    <i class="bx bx-file"></i>
                    <span>{{ attachment.file_name }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Update Actions -->
          <div v-if="showQuickActions" class="card mb-3">
            <div class="card-header d-flex align-items-center justify-content-between"
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <h6 class="mb-0 text-white">
                <i class="bx bx-git-branch me-2 text-white"></i>
                Update Ticket Status
              </h6>
              <small class="badge bg-transparent text-white border border-white">Quick Actions</small>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <!-- Start Work -->
                <div class="col-6 col-lg-4" v-if="ticket.status === 'new'">
                  <button
                    class="status-action-btn w-100"
                    @click="quickStatusUpdate('in_progress')"
                    :disabled="statusUpdating"
                  >
                    <div class="status-icon bg-info">
                      <i class="bx bx-play-circle"></i>
                    </div>
                    <div class="status-text">
                      <strong>Start Work</strong>
                      <small>Begin working on this ticket</small>
                    </div>
                    <i class="bx bx-chevron-right ms-auto"></i>
                  </button>
                </div>

                <!-- Need Information -->
                <div class="col-6 col-lg-4" v-if="ticket.status === 'in_progress'">
                  <button
                    class="status-action-btn w-100"
                    @click="quickStatusUpdate('waiting_response')"
                    :disabled="statusUpdating"
                  >
                    <div class="status-icon bg-warning">
                      <i class="bx bx-message-dots"></i>
                    </div>
                    <div class="status-text">
                      <strong>Need Info</strong>
                      <small>Request client response</small>
                    </div>
                    <i class="bx bx-chevron-right ms-auto"></i>
                  </button>
                </div>

                <!-- Report Completion Button -->
                <div class="col-6 col-lg-4" v-if="ticket.status === 'in_progress'">
                  <button
                    class="status-action-btn w-100"
                    @click="showReportCompletionModal = true"
                    :disabled="statusUpdating"
                  >
                    <div class="status-icon bg-success">
                      <i class="bx bx-check-circle"></i>
                    </div>
                    <div class="status-text">
                      <strong>Lapor Selesai</strong>
                      <small>Report task completion</small>
                    </div>
                    <i class="bx bx-chevron-right ms-auto"></i>
                  </button>
                </div>

                <!-- Mark Resolved -->
                <div class="col-6 col-lg-4" v-if="canMarkResolved">
                  <button
                    class="status-action-btn w-100"
                    @click="quickStatusUpdate('resolved')"
                    :disabled="statusUpdating"
                  >
                    <div class="status-icon bg-success">
                      <i class="bx bx-check-circle"></i>
                    </div>
                    <div class="status-text">
                      <strong>Mark Resolved</strong>
                      <small>Complete this ticket</small>
                    </div>
                    <i class="bx bx-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="statusUpdating" class="text-center mt-3">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <small class="text-muted">Updating status...</small>
              </div>
            </div>
          </div>

          <!-- Close Ticket Card -->
          <div v-if="canCloseTicket" class="card mb-3 border-success">
            <div class="card-header bg-success text-white">
              <h6 class="mb-0">
                <i class="bx bx-check-double me-2"></i>
                Ticket Resolved
              </h6>
            </div>
            <div class="card-body text-center p-4">
              <div class="mb-3">
                <i class="bx bx-check-shield" style="font-size: 48px; color: #28a745;"></i>
              </div>
              <p class="text-muted mb-3">This ticket has been marked as resolved. You can now close it permanently.</p>
              <button
                class="btn btn-outline-dark"
                @click="quickStatusUpdate('closed')"
                :disabled="statusUpdating"
              >
                <i class="bx bx-lock me-2"></i>
                Close Ticket Permanently
              </button>
            </div>
          </div>

          <div v-if="showFeedbackCard" class="card mb-3 border-warning">
            <div class="card-header bg-warning-subtle">
              <h6 class="mb-0">
                <i class="bx bx-star me-2"></i>
                Rating dari Client
              </h6>
            </div>
            <div class="card-body">
              <div v-if="ticket.feedback" class="feedback-card">
                <div class="feedback-stars mb-2">
                  <i
                    v-for="star in 5"
                    :key="`feedback-${star}`"
                    class="bx bxs-star"
                    :class="{ active: star <= ticket.feedback.rating }"
                  ></i>
                </div>
                <p class="fw-semibold mb-1">{{ ticket.feedback.rating }}/5 bintang</p>
                <p class="mb-0 text-muted">
                  {{ ticket.feedback.comment || 'Client tidak menambahkan komentar untuk rating ini.' }}
                </p>
              </div>
              <div v-else class="text-muted">
                Client belum memberikan rating untuk tiket ini.
              </div>
            </div>
          </div>

          <!-- ✅ Admin Chat Section — menggantikan Communication -->
          <div class="card vendor-chat-card">
            <div class="vendor-chat-section" :class="showAdminChat ? 'has-admin' : 'no-admin'">

              <!-- Jika tiket sudah dikerjakan / ada chat dengan admin -->
              <div v-if="showAdminChat" class="vendor-chat-inner">
                <div class="vendor-chat-info">
                  <div class="vendor-chat-avatar-wrap">
                    <span class="vendor-chat-avatar-lg">
                      <i class="bx bx-shield-alt-2"></i>
                    </span>
                    <span class="vendor-online-dot"></span>
                  </div>
                  <div class="vendor-chat-meta">
                    <div class="vendor-chat-name">Tim Admin</div>
                    <div class="vendor-chat-email">Hubungi admin terkait tiket ini</div>
                    <div class="vendor-chat-ticket">
                      <i class="bx bx-file"></i> {{ ticket.ticket_number }}
                      <span :class="`ms-2 badge-pill-xs badge-status-${ticket.status}`">{{ formatStatus(ticket.status) }}</span>
                    </div>
                  </div>
                </div>
                <div class="vendor-chat-action">
                  <p class="vendor-chat-hint">
                    <i class="bx bx-info-circle me-1"></i>
                    Laporkan progres, kendala, atau komunikasi terkait tiket ini melalui Chat Admin
                  </p>
                  <button class="btn-go-to-chat" @click="goToAdminChat">
                    <i class="bx bx-message-dots"></i>
                    <span>Buka Chat Admin</span>
                    <i class="bx bx-right-arrow-alt"></i>
                  </button>
                </div>
              </div>

              <!-- Jika tiket masih baru / belum dikerjakan -->
              <div v-else class="no-admin-inner">
                <div class="no-admin-icon">
                  <i class="bx bx-message-x"></i>
                </div>
                <div>
                  <div class="no-admin-title">Chat Admin Belum Tersedia</div>
                  <div class="no-admin-sub">Chat dengan admin akan aktif setelah Anda mulai mengerjakan tiket ini</div>
                </div>
                <button
                  v-if="ticket.status === 'new'"
                  class="btn btn-sm btn-primary"
                  @click="quickStatusUpdate('in_progress')"
                  :disabled="statusUpdating"
                >
                  <i class="bx bx-play-circle me-1"></i> Mulai Kerjakan
                </button>
              </div>

            </div>
          </div>
          <!-- End Admin Chat Section -->

          <!-- ✅ Client Chat Section -->
          <div class="card client-chat-card mb-3">
            <div class="client-chat-section" :class="showClientChat ? 'has-client' : 'no-client'">
          
              <!-- Jika tiket sudah dikerjakan -->
              <div v-if="showClientChat" class="client-chat-inner">
                <div class="client-chat-info">
                  <div class="client-chat-avatar-wrap">
                    <span class="client-chat-avatar-lg">
                      {{ getInitials(ticket.user?.name) }}
                    </span>
                    <span class="client-online-dot"></span>
                  </div>
                  <div class="client-chat-meta">
                    <div class="client-chat-name">{{ ticket.user?.name || 'Client' }}</div>
                    <div class="client-chat-sub">{{ ticket.user?.email || 'Client tiket ini' }}</div>
                    <div class="client-chat-ticket">
                      <i class="bx bx-file"></i> {{ ticket.ticket_number }}
                    </div>
                  </div>
                </div>
                <div class="client-chat-action">
                  <p class="client-chat-hint">
                    <i class="bx bx-info-circle me-1"></i>
                    Balas pertanyaan atau update progres langsung ke client
                  </p>
                  <button class="btn-go-to-client-chat" @click="goToClientChat">
                    <i class="bx bx-message-dots"></i>
                    <span>Buka Chat Client</span>
                    <i class="bx bx-right-arrow-alt"></i>
                  </button>
                </div>
              </div>
          
              <!-- Jika tiket belum dikerjakan -->
              <div v-else class="no-client-inner">
                <div class="no-client-icon">
                  <i class="bx bx-message-x"></i>
                </div>
                <div>
                  <div class="no-client-title">Chat Client Belum Tersedia</div>
                  <div class="no-client-sub">Mulai kerjakan tiket untuk dapat berkomunikasi dengan client</div>
                </div>
              </div>
          
            </div>
          </div>
          <!-- End Client Chat Section -->

          <!-- ✅ Ringkasan Statistik Tiket -->
          <div class="card stats-summary-card mt-3">
            <div class="card-header stats-card-header">
              <h6 class="mb-0">
                <i class="bx bx-bar-chart-alt-2 me-2"></i>
                Ringkasan Statistik Tiket
              </h6>
            </div>
            <div class="card-body p-0">
              <div class="stats-grid">

                <!-- Durasi Sejak Dibuat -->
                <div class="stat-block">
                  <div class="stat-block-icon icon-time">
                    <i class="bx bx-time-five"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Durasi Sejak Dibuat</div>
                    <div class="stat-block-value">{{ getTicketAge(ticket.created_at) }}</div>
                  </div>
                </div>

                <!-- Waktu Mulai Dikerjakan -->
                <div class="stat-block">
                  <div class="stat-block-icon icon-start">
                    <i class="bx bx-play-circle"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Mulai Dikerjakan</div>
                    <div class="stat-block-value">
                      {{ ticket.assigned_at ? formatDateShort(ticket.assigned_at) : '—' }}
                    </div>
                  </div>
                </div>

                <!-- Respon Pertama -->
                <div class="stat-block">
                  <div class="stat-block-icon icon-response">
                    <i class="bx bx-message-check"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Respon Pertama</div>
                    <div class="stat-block-value">
                      {{ ticket.first_response_at ? formatDateShort(ticket.first_response_at) : 'Belum ada' }}
                    </div>
                  </div>
                </div>

                <!-- Status Saat Ini -->
                <div class="stat-block">
                  <div class="stat-block-icon" :class="getStatusIconClass(ticket.status)">
                    <i :class="getStatusIcon(ticket.status)"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Status Saat Ini</div>
                    <div class="stat-block-value">{{ formatStatus(ticket.status) }}</div>
                  </div>
                </div>

                <!-- Waktu Selesai -->
                <div class="stat-block">
                  <div class="stat-block-icon icon-resolved">
                    <i class="bx bx-check-circle"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Diselesaikan</div>
                    <div class="stat-block-value">
                      {{ ticket.resolved_at ? formatDateShort(ticket.resolved_at) : 'Belum selesai' }}
                    </div>
                  </div>
                </div>

                <!-- Kategori -->
                <div class="stat-block">
                  <div class="stat-block-icon icon-category">
                    <i class="bx bx-category"></i>
                  </div>
                  <div class="stat-block-body">
                    <div class="stat-block-label">Kategori</div>
                    <div class="stat-block-value">{{ ticket.category?.name || '—' }}</div>
                  </div>
                </div>

              </div>

              <!-- Progress Bar -->
              <div class="stats-progress-wrap">
                <div class="stats-progress-label">
                  <small class="text-muted">Progress Penanganan</small>
                  <small class="fw-bold" :class="getProgressTextClass(ticket.status)">{{ getStatusProgress(ticket.status) }}%</small>
                </div>
                <div class="progress stats-progress-bar">
                  <div
                    class="progress-bar"
                    :class="getProgressBarClass(ticket.status)"
                    :style="`width: ${getStatusProgress(ticket.status)}%`"
                    role="progressbar"
                  ></div>
                </div>
                <div class="progress-steps">
                  <span :class="['progress-step', isStepDone('new', ticket.status) ? 'done' : '']">Baru</span>
                  <span :class="['progress-step', isStepDone('in_progress', ticket.status) ? 'done' : '']">Diproses</span>
                  <span :class="['progress-step', isStepDone('waiting_response', ticket.status) ? 'done' : '']">Menunggu</span>
                  <span :class="['progress-step', isStepDone('resolved', ticket.status) ? 'done' : '']">Selesai</span>
                  <span :class="['progress-step', isStepDone('closed', ticket.status) ? 'done' : '']">Ditutup</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ Panduan / Checklist Penanganan -->
          <div class="card checklist-card mt-3">
            <div class="card-header checklist-card-header">
              <h6 class="mb-0">
                <i class="bx bx-list-check me-2"></i>
                Panduan Penanganan Tiket
              </h6>
              <small class="text-muted">Ikuti langkah-langkah berikut</small>
            </div>
            <div class="card-body">
              <div class="checklist-items">

                <div :class="['checklist-item', isStepDone('new', ticket.status) ? 'done' : 'pending']">
                  <div class="checklist-dot">
                    <i v-if="isStepDone('new', ticket.status)" class="bx bx-check"></i>
                    <span v-else>1</span>
                  </div>
                  <div class="checklist-content">
                    <div class="checklist-title">Terima & Pelajari Tiket</div>
                    <div class="checklist-desc">Baca deskripsi masalah, lokasi, dan prioritas tiket dengan seksama</div>
                  </div>
                </div>

                <div :class="['checklist-item', isStepDone('in_progress', ticket.status) ? 'done' : 'pending']">
                  <div class="checklist-dot">
                    <i v-if="isStepDone('in_progress', ticket.status)" class="bx bx-check"></i>
                    <span v-else>2</span>
                  </div>
                  <div class="checklist-content">
                    <div class="checklist-title">Mulai Kerjakan & Update Status</div>
                    <div class="checklist-desc">Ubah status ke "In Progress" dan segera tuju lokasi yang ditentukan</div>
                  </div>
                </div>

                <div :class="['checklist-item', ticket.first_response_at ? 'done' : 'pending']">
                  <div class="checklist-dot">
                    <i v-if="ticket.first_response_at" class="bx bx-check"></i>
                    <span v-else>3</span>
                  </div>
                  <div class="checklist-content">
                    <div class="checklist-title">Komunikasikan ke Admin</div>
                    <div class="checklist-desc">Laporkan progres, kendala, atau butuh informasi tambahan melalui Chat Admin</div>
                  </div>
                </div>

                <div :class="['checklist-item', isStepDone('resolved', ticket.status) ? 'done' : 'pending']">
                  <div class="checklist-dot">
                    <i v-if="isStepDone('resolved', ticket.status)" class="bx bx-check"></i>
                    <span v-else>4</span>
                  </div>
                  <div class="checklist-content">
                    <div class="checklist-title">Lapor Penyelesaian</div>
                    <div class="checklist-desc">Kirim laporan penyelesaian dengan foto dokumentasi melalui Chat Admin</div>
                  </div>
                </div>

                <div :class="['checklist-item', isStepDone('closed', ticket.status) ? 'done' : 'pending']">
                  <div class="checklist-dot">
                    <i v-if="isStepDone('closed', ticket.status)" class="bx bx-check"></i>
                    <span v-else>5</span>
                  </div>
                  <div class="checklist-content">
                    <div class="checklist-title">Konfirmasi & Tutup Tiket</div>
                    <div class="checklist-desc">Tunggu konfirmasi admin lalu tutup tiket secara permanen</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Info Sidebar -->
        <div class="col-lg-4">
          <!-- Client Info -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bx bx-user me-2"></i>
                Client Details
              </h6>
            </div>
            <div class="card-body">
              <div class="client-card">
                <div class="d-flex align-items-center mb-3">
                  <div class="avatar avatar-lg me-3">
                    <span class="avatar-initial rounded-circle bg-label-primary">
                      {{ getInitials(ticket.user?.name) }}
                    </span>
                  </div>
                  <div>
                    <h6 class="mb-0">{{ ticket.user?.name }}</h6>
                    <small class="text-muted">Client</small>
                  </div>
                </div>
                <div class="contact-info">
                  <div class="mb-2">
                    <i class="bx bx-envelope me-2 text-muted"></i>
                    <a :href="`mailto:${ticket.user?.email}`">{{ ticket.user?.email }}</a>
                  </div>
                  <div v-if="ticket.user?.phone">
                    <i class="bx bx-phone me-2 text-muted"></i>
                    <a :href="`tel:${ticket.user?.phone}`">{{ ticket.user.phone }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ticket Info -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bx bx-info-circle me-2"></i>
                Ticket Information
              </h6>
            </div>
            <div class="card-body">
              <div class="info-item mb-3">
                <small class="text-muted">Category</small>
                <div>
                  <span class="badge bg-label-secondary">
                    {{ ticket.category?.name || 'Uncategorized' }}
                  </span>
                </div>
              </div>
              <div class="info-item mb-3">
                <small class="text-muted">Priority Level</small>
                <div>
                  <span :class="`badge bg-label-${getPriorityColor(ticket.priority)}`">
                    {{ ticket.priority.toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="info-item mb-3">
                <small class="text-muted">Current Status</small>
                <div>
                  <span :class="`badge bg-label-${getStatusColor(ticket.status)}`">
                    {{ formatStatus(ticket.status) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <small class="text-muted">Created</small>
                <div>{{ formatDate(ticket.created_at) }}</div>
              </div>
            </div>
          </div>

          <!-- SLA Performance -->
          <div class="card mb-3" v-if="ticket.sla_tracking">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bx bx-stopwatch me-2"></i>
                SLA Performance
              </h6>
            </div>
            <div class="card-body">
              <!-- Response SLA -->
              <div class="sla-card mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong>Response Time</strong>
                  <span v-if="ticket.sla_tracking.response_sla_met !== null"
                        :class="`badge ${getSLABadgeClass(ticket.sla_tracking.response_sla_met)}`">
                    {{ ticket.sla_tracking.response_sla_met ? '✓ MET' : '✗ BREACHED' }}
                  </span>
                </div>
                <div v-if="ticket.sla_tracking.actual_response_time">
                  <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar"
                         :class="ticket.sla_tracking.response_sla_met ? 'bg-success' : 'bg-danger'"
                         :style="{ width: getProgressWidth(ticket.sla_tracking.actual_response_time, ticket.sla_tracking.response_time_sla) }"
                    ></div>
                  </div>
                  <small class="text-muted">
                    {{ ticket.sla_tracking.actual_response_time }} / {{ ticket.sla_tracking.response_time_sla }} minutes
                  </small>
                </div>
                <div v-else class="text-warning">
                  <i class="bx bx-time"></i> Awaiting first response
                </div>
              </div>

              <!-- Resolution SLA -->
              <div class="sla-card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong>Resolution Time</strong>
                  <span v-if="ticket.sla_tracking.resolution_sla_met !== null"
                        :class="`badge ${getSLABadgeClass(ticket.sla_tracking.resolution_sla_met)}`">
                    {{ ticket.sla_tracking.resolution_sla_met ? '✓ MET' : '✗ BREACHED' }}
                  </span>
                </div>
                <div v-if="ticket.sla_tracking.actual_resolution_time">
                  <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar"
                         :class="ticket.sla_tracking.resolution_sla_met ? 'bg-success' : 'bg-danger'"
                         :style="{ width: getProgressWidth(ticket.sla_tracking.actual_resolution_time, ticket.sla_tracking.resolution_time_sla) }"
                    ></div>
                  </div>
                  <small class="text-muted">
                    {{ ticket.sla_tracking.actual_resolution_time }} / {{ ticket.sla_tracking.resolution_time_sla }} minutes
                  </small>
                </div>
                <div v-else class="text-warning">
                  <i class="bx bx-time"></i> In progress
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ Riwayat Perubahan Status -->
          <div class="card history-card">
            <div class="card-header history-card-header">
              <h6 class="mb-0">
                <i class="bx bx-git-branch me-2"></i>
                Riwayat Perubahan Status
              </h6>
            </div>
            <div class="card-body">
              <div class="history-timeline">

                <div class="history-item">
                  <div class="history-dot dot-created">
                    <i class="bx bx-plus-circle"></i>
                  </div>
                  <div class="history-content">
                    <div class="history-status">Tiket Dibuat</div>
                    <div class="history-meta">
                      <i class="bx bx-user me-1"></i>{{ ticket.user?.name || 'Client' }}
                      <span class="history-sep">·</span>
                      <i class="bx bx-calendar me-1"></i>{{ formatDate(ticket.created_at) }}
                    </div>
                  </div>
                </div>

                <div v-if="ticket.assigned_at" class="history-item">
                  <div class="history-dot dot-assigned">
                    <i class="bx bx-user-pin"></i>
                  </div>
                  <div class="history-content">
                    <div class="history-status">Ditugaskan ke Vendor</div>
                    <div class="history-meta">
                      <i class="bx bx-shield-alt-2 me-1"></i>Admin
                      <span class="history-sep">·</span>
                      <i class="bx bx-calendar me-1"></i>{{ formatDate(ticket.assigned_at) }}
                    </div>
                  </div>
                </div>

                <div v-if="ticket.first_response_at" class="history-item">
                  <div class="history-dot dot-response">
                    <i class="bx bx-message-dots"></i>
                  </div>
                  <div class="history-content">
                    <div class="history-status">Respon Pertama Dikirim</div>
                    <div class="history-meta">
                      <i class="bx bx-calendar me-1"></i>{{ formatDate(ticket.first_response_at) }}
                    </div>
                  </div>
                </div>

                <div v-if="ticket.resolved_at" class="history-item">
                  <div class="history-dot dot-resolved">
                    <i class="bx bx-check-circle"></i>
                  </div>
                  <div class="history-content">
                    <div class="history-status">Tiket Diselesaikan</div>
                    <div class="history-meta">
                      <i class="bx bx-calendar me-1"></i>{{ formatDate(ticket.resolved_at) }}
                    </div>
                  </div>
                </div>

                <div v-if="ticket.closed_at" class="history-item last">
                  <div class="history-dot dot-closed">
                    <i class="bx bx-lock-alt"></i>
                  </div>
                  <div class="history-content">
                    <div class="history-status">Tiket Ditutup</div>
                    <div class="history-meta">
                      <i class="bx bx-calendar me-1"></i>{{ formatDate(ticket.closed_at) }}
                    </div>
                  </div>
                </div>

                <div v-if="!ticket.assigned_at && !ticket.first_response_at && !ticket.resolved_at" class="history-empty">
                  <i class="bx bx-time-five"></i>
                  <span>Belum ada perubahan status lanjutan</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Completion Modal -->
    <div v-if="showReportCompletionModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bx bx-check-circle me-2"></i>
              Lapor Penyelesaian Tugas
            </h5>
            <button type="button" class="btn-close" @click="showReportCompletionModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin tugas ini sudah selesai dikerjakan?</p>
            <p class="text-muted small">Tiket akan diubah statusnya menjadi "Resolved" dan menunggu konfirmasi dari admin.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showReportCompletionModal = false">
              Batal
            </button>
            <button type="button" class="btn btn-success" @click="confirmReportCompletion">
              <i class="bx bx-check me-1"></i>
              Ya, Laporkan Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showReportCompletionModal" class="modal-backdrop show"></div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bx bx-edit me-2"></i>
              Update Ticket Status
            </h5>
            <button type="button" class="btn-close" @click="showStatusModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Select new status for this ticket:</p>
            <select v-model="selectedStatus" class="form-select">
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showStatusModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="confirmStatusUpdate">
              <i class="bx bx-check me-1"></i>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showStatusModal" class="modal-backdrop show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatRelativeTime, getPriorityColor, getInitials } from '@/utils/helpers'
import Swal from 'sweetalert2'
import api from '@/services/api'
import { initEcho } from '@/services/pusher'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const ticket = ref(null)
const loading = ref(false)
const statusUpdating = ref(false)
const error = ref(null)
const showReportCompletionModal = ref(false)
const showStatusModal = ref(false)
const selectedStatus = ref('')

let echoChannel = null

// Computed Properties
const canUpdateStatus = computed(() => {
  return ticket.value &&
         ticket.value.assigned_to === authStore.user?.id &&
         ticket.value.status !== 'closed'
})

const hasEventInfo = computed(() => {
  return ticket.value && (ticket.value.event_name || ticket.value.venue || ticket.value.area)
})

const hasAttachments = computed(() => {
  return ticket.value?.attachments && ticket.value.attachments.length > 0
})

const showQuickActions = computed(() => {
  return canUpdateStatus.value &&
         ticket.value.status !== 'resolved' &&
         ticket.value.status !== 'closed'
})

const canMarkResolved = computed(() => {
  return ['in_progress', 'waiting_response'].includes(ticket.value?.status)
})

const canCloseTicket = computed(() => {
  return canUpdateStatus.value && ticket.value.status === 'resolved'
})

const showFeedbackCard = computed(() => {
  return ticket.value && ['resolved', 'closed'].includes(ticket.value.status)
})

// ✅ Tampilkan chat admin jika tiket sedang/sudah dikerjakan
const showAdminChat = computed(() => {
  return ticket.value && ['in_progress', 'waiting_response', 'resolved', 'closed'].includes(ticket.value.status)
})

// ✅ Tampilkan chat client jika tiket sedang/sudah dikerjakan
const showClientChat = computed(() => {
  return ticket.value &&
    ['in_progress', 'waiting_response'].includes(ticket.value.status)
})

// Lifecycle
onMounted(async () => {
  await fetchTicketDetail()

  if (ticket.value) {
    subscribeToTicket(ticket.value.id)
  }
})

const subscribeToTicket = (ticketId) => {
  if (!window.Echo) { initEcho() }
  if (!window.Echo) return

  if (echoChannel) {
    window.Echo.leaveChannel(`ticket.${ticketId}`)
  }

  window.Echo.private(`ticket.${ticket.id}`)  // private ✅

  echoChannel.listen('.comment.new', async (data) => {
    if (!data.comment) return

    console.log('Realtime comment masuk:', data.comment)

    await nextTick()
  })
}

const unsubscribeFromTicket = () => {
  if (echoChannel && ticket.value) {
    window.Echo.leaveChannel(`ticket.${ticket.value.id}`)
    echoChannel = null
  }
}

// Methods
const fetchTicketDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const ticketId = Number(route.params.id)

    if (!ticketId || isNaN(ticketId)) {
      throw new Error('Invalid ticket ID')
    }

    const { data } = await api.get(`/vendor/tickets/${ticketId}`)

    ticket.value = data.ticket || data

    if (!ticket.value) {
      throw new Error('Ticket data not found in response')
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Ticket not found or you are not assigned to this ticket'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this ticket'
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to load ticket details'
    }
  } finally {
    loading.value = false
  }
}

const quickStatusUpdate = async (newStatus) => {
  if (!ticket.value) return

  statusUpdating.value = true
  try {
    const ticketId = ticket.value.id

    const { data } = await api.patch(`/vendor/tickets/${ticketId}/status`, {
      status: newStatus
    })

    Swal.fire({
      icon: 'success',
      title: 'Status Updated',
      text: `Ticket status changed to ${formatStatus(newStatus)}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    })

    await fetchTicketDetail()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || err.message || 'Failed to update status',
      confirmButtonColor: '#696cff'
    })
  } finally {
    statusUpdating.value = false
  }
}

const confirmReportCompletion = async () => {
  showReportCompletionModal.value = false
  await quickStatusUpdate('resolved')
}

const confirmStatusUpdate = async () => {
  if (!selectedStatus.value) return
  showStatusModal.value = false
  await quickStatusUpdate(selectedStatus.value)
}

// ✅ Navigasi ke halaman Chat Admin dengan konteks tiket ini
const goToAdminChat = () => {
  router.push({
    name: 'VendorAdminChat',
    query: {
      ticket_id: ticket.value.id,
      ticket_number: ticket.value.ticket_number
    }
  })
}

// ✅ Navigasi ke halaman Chat Client dengan konteks tiket ini
const goToClientChat = () => {
  router.push({
    name: 'VendorClientChat',
    query: {
      ticket_id: ticket.value.id
    }
  })
}

const goBack = () => {
  router.push('/vendor/tickets')
}

const getAttachmentUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  return `${baseUrl}/storage/${path}`
}

const getStatusColor = (status) => {
  const colors = {
    'new': 'warning',
    'in_progress': 'info',
    'waiting_response': 'secondary',
    'resolved': 'success',
    'closed': 'dark'
  }
  return colors[status] || 'secondary'
}

const getPriorityBgColor = (priority) => {
  const colors = {
    'low': 'secondary',
    'medium': 'info',
    'high': 'warning',
    'critical': 'danger'
  }
  return colors[priority] || 'secondary'
}

const formatStatus = (status) => {
  if (!status) return ''
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getSLABadgeClass = (met) => {
  return met ? 'badge-success' : 'badge-danger'
}

const getProgressWidth = (actual, target) => {
  if (!actual || !target) return '0%'
  const percentage = (actual / target) * 100
  return Math.min(percentage, 100) + '%'
}

// ─── Stats helpers ───
const getTicketAge = (createdAt) => {
  if (!createdAt) return '—'
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 60000)
  if (diff < 60) return `${diff} menit`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h} jam`
  const d = Math.floor(h / 24)
  return `${d} hari`
}

const formatDateShort = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const getStatusProgress = (status) => {
  return { new: 10, in_progress: 45, waiting_response: 65, resolved: 85, closed: 100 }[status] || 0
}

const getProgressBarClass = (status) => {
  return { new: 'bg-warning', in_progress: 'bg-info', waiting_response: 'bg-secondary', resolved: 'bg-success', closed: 'bg-dark' }[status] || 'bg-secondary'
}

const getProgressTextClass = (status) => {
  return { new: 'text-warning', in_progress: 'text-info', waiting_response: 'text-secondary', resolved: 'text-success', closed: 'text-dark' }[status] || 'text-secondary'
}

const getStatusIcon = (status) => {
  return { new: 'bx bx-bell', in_progress: 'bx bx-loader-alt', waiting_response: 'bx bx-time', resolved: 'bx bx-check-circle', closed: 'bx bx-lock-alt' }[status] || 'bx bx-circle'
}

const getStatusIconClass = (status) => {
  return { new: 'icon-status-new', in_progress: 'icon-status-progress', waiting_response: 'icon-status-waiting', resolved: 'icon-status-resolved', closed: 'icon-status-closed' }[status] || ''
}

const isStepDone = (step, currentStatus) => {
  const order = ['new', 'in_progress', 'waiting_response', 'resolved', 'closed']
  return order.indexOf(currentStatus) >= order.indexOf(step)
}

onBeforeUnmount(() => {
  unsubscribeFromTicket()
})

</script>

<style scoped>
.vendor-ticket-detail {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Client Chat Section ─── */
.client-chat-card {
  border: none;
  overflow: hidden;
}
 
.client-chat-section {
  padding: 1.25rem 1.5rem;
  border-radius: 0.375rem;
}
 
.client-chat-section.has-client {
  background: linear-gradient(135deg, #f0fff4 0%, #e6f9f0 100%);
  border: 1px solid #c3e6cb;
}
 
.client-chat-section.no-client {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.feedback-card {
  border: 1px solid #fde68a;
  background: #fffbeb;
  border-radius: 12px;
  padding: 1rem;
}

.feedback-stars {
  display: inline-flex;
  gap: 0.2rem;
  font-size: 1.15rem;
  color: #d1d5db;
}

.feedback-stars .active {
  color: #f59e0b;
}
 
.client-chat-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}
 
.client-chat-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
 
.client-chat-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
 
.client-chat-avatar-lg {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.client-online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #28a745;
  border-radius: 50%;
  border: 2px solid white;
  animation: blink 2s infinite;
}
 
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
 
.client-chat-meta { min-width: 0; }
 
.client-chat-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2c3e50;
}
 
.client-chat-sub {
  font-size: 0.75rem;
  color: #6c757d;
}
 
.client-chat-ticket {
  font-size: 0.72rem;
  color: #28a745;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.2rem;
}
 
.client-chat-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}
 
.client-chat-hint {
  font-size: 0.73rem;
  color: #6c757d;
  margin: 0;
  text-align: right;
  max-width: 200px;
  line-height: 1.4;
}
 
.btn-go-to-client-chat {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.125rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
 
.btn-go-to-client-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40,167,69,.35);
}
 
.btn-go-to-client-chat i { font-size: 1rem; }
 
/* No client state */
.no-client-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}
 
.no-client-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
 
.no-client-icon i { font-size: 1.3rem; color: #6c757d; }
 
.no-client-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #495057;
}
 
.no-client-sub {
  font-size: 0.775rem;
  color: #6c757d;
  margin-top: 0.125rem;
}
 
@media (max-width: 768px) {
  .client-chat-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .client-chat-action {
    align-items: flex-start;
    width: 100%;
  }
  .client-chat-hint { text-align: left; max-width: 100%; }
  .btn-go-to-client-chat { width: 100%; justify-content: center; }
}

.info-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.info-box i {
  font-size: 24px;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
}

.attachment-item:hover {
  background: #e9ecef;
  border-color: #696cff;
}

.status-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.status-action-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9fe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.status-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-action-btn .status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-action-btn .status-icon i {
  font-size: 24px;
  color: white;
}

.status-action-btn .status-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-action-btn .status-text strong {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

.status-action-btn .status-text small {
  font-size: 12px;
  color: #95a5a6;
}

.status-action-btn > i:last-child {
  font-size: 20px;
  color: #bdc3c7;
  transition: all 0.3s;
}

.status-action-btn:hover:not(:disabled) > i:last-child {
  color: #667eea;
  transform: translateX(4px);
}

/* ─── Vendor/Admin Chat Section ─── */
.vendor-chat-card {
  border: none;
  overflow: hidden;
}

.vendor-chat-section {
  padding: 1.5rem;
  border-radius: 0.375rem;
}

.vendor-chat-section.has-admin {
  background: linear-gradient(135deg, #f8f9ff 0%, #f3f0ff 100%);
  border: 1px solid #e0d9ff;
}

.vendor-chat-section.no-admin {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.vendor-chat-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.vendor-chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vendor-chat-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.vendor-chat-avatar-lg {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  background: #28a745;
  border-radius: 50%;
  border: 2px solid white;
}

.vendor-chat-meta { min-width: 0; }

.vendor-chat-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #2c3e50;
}

.vendor-chat-email {
  font-size: 0.78rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.vendor-chat-ticket {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #696cff;
  font-weight: 600;
}

.vendor-chat-ticket i { font-size: 0.85rem; }

/* Status mini badge */
.badge-pill-xs {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  text-transform: uppercase;
}

.badge-status-in_progress  { background: #cce5ff; color: #004085; }
.badge-status-waiting_response { background: #e2e3e5; color: #383d41; }
.badge-status-resolved     { background: #d4edda; color: #155724; }
.badge-status-closed       { background: #343a40; color: #fff; }

.vendor-chat-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vendor-chat-hint {
  font-size: 0.75rem;
  color: #6c757d;
  margin: 0;
  text-align: right;
  max-width: 220px;
  line-height: 1.4;
}

.btn-go-to-chat {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-go-to-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(105, 108, 255, 0.4);
}

.btn-go-to-chat:active { transform: translateY(0); }

.btn-go-to-chat i { font-size: 1.1rem; }

/* No admin state */
.no-admin-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.no-admin-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.no-admin-icon i { font-size: 1.4rem; color: #6c757d; }

.no-admin-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #495057;
}

.no-admin-sub {
  font-size: 0.775rem;
  color: #6c757d;
  margin-top: 0.15rem;
}

.no-admin-inner .btn { margin-left: auto; flex-shrink: 0; }

/* ─── Client Card ─── */
.client-card {
  text-align: center;
}

.contact-info a {
  color: #696cff;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

/* ─── SLA ─── */
.sla-card {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* ─── Activity Timeline ─── */
.activity-timeline {
  position: relative;
}

.activity-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.activity-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 13px;
  top: 32px;
  bottom: -16px;
  width: 2px;
  background: #e9ecef;
}

.activity-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex-grow: 1;
}

/* ─── Badges ─── */
.badge-success {
  background-color: #28a745 !important;
  color: white !important;
}

.badge-danger {
  background-color: #dc3545 !important;
  color: white !important;
}

/* ─── Avatar ─── */
.avatar-sm {
  width: 30px;
  height: 30px;
}

.avatar-sm .avatar-initial {
  font-size: 0.85rem;
}

.avatar-lg {
  width: 56px;
  height: 56px;
}

.avatar-lg .avatar-initial {
  font-size: 1.5rem;
}

/* ─── Modal ─── */
.modal.show {
  background: rgba(0, 0, 0, 0.5);
}

.modal-backdrop.show {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .vendor-chat-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .vendor-chat-action {
    align-items: flex-start;
    width: 100%;
  }

  .vendor-chat-hint {
    text-align: left;
    max-width: 100%;
  }

  .btn-go-to-chat {
    width: 100%;
    justify-content: center;
  }
}

/* ─────────────────────────────────────────
   ✅ STATS SUMMARY CARD
───────────────────────────────────────── */
.stats-summary-card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  overflow: hidden;
}

.stats-card-header {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%);
  border-bottom: 1px solid #e0e8ff;
  padding: 0.9rem 1.25rem;
}

.stats-card-header h6 { font-size: 0.875rem; color: #2c3e50; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.stat-block:hover { background: #fafbff; }
.stat-block:nth-child(3n) { border-right: none; }

.stat-block-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.icon-time            { background: #e3f2fd; color: #1565c0; }
.icon-start           { background: #e8f5e9; color: #2e7d32; }
.icon-response        { background: #fff8e1; color: #f57f17; }
.icon-resolved        { background: #e8f5e9; color: #1b5e20; }
.icon-category        { background: #fce4ec; color: #880e4f; }
.icon-status-new      { background: #fff8e1; color: #f57c00; }
.icon-status-progress { background: #e3f2fd; color: #0277bd; }
.icon-status-waiting  { background: #f3e5f5; color: #6a1b9a; }
.icon-status-resolved { background: #e8f5e9; color: #2e7d32; }
.icon-status-closed   { background: #eceff1; color: #37474f; }

.stat-block-label {
  font-size: 0.68rem;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.stat-block-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-progress-wrap {
  padding: 1rem 1.25rem 1.1rem;
}

.stats-progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
}

.stats-progress-bar {
  height: 7px;
  border-radius: 10px;
  background: #f0f0f0;
}

.stats-progress-bar .progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.progress-step {
  font-size: 0.68rem;
  color: #bdbdbd;
  font-weight: 500;
  transition: color 0.3s;
}

.progress-step.done {
  color: #696cff;
  font-weight: 700;
}

/* ─────────────────────────────────────────
   ✅ CHECKLIST CARD
───────────────────────────────────────── */
.checklist-card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  overflow: hidden;
}

.checklist-card-header {
  background: linear-gradient(135deg, #fff8e1 0%, #fce4ec 100%);
  border-bottom: 1px solid #ffe0b2;
  padding: 0.9rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checklist-card-header h6 { font-size: 0.875rem; color: #2c3e50; }

.checklist-items { display: flex; flex-direction: column; gap: 0; }

.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px dashed #f0f0f0;
  transition: all 0.3s;
}

.checklist-item:last-child { border-bottom: none; }

.checklist-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s;
}

.checklist-item.done .checklist-dot {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  font-size: 1rem;
}

.checklist-item.pending .checklist-dot {
  background: #f0f0f0;
  color: #9e9e9e;
  border: 2px dashed #ccc;
}

.checklist-item.done .checklist-title { color: #2c3e50; }
.checklist-item.pending .checklist-title { color: #9e9e9e; }

.checklist-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.checklist-desc {
  font-size: 0.77rem;
  color: #aaa;
  line-height: 1.45;
}

.checklist-item.done .checklist-desc { color: #888; }

/* ─────────────────────────────────────────
   ✅ HISTORY TIMELINE CARD
───────────────────────────────────────── */
.history-card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  overflow: hidden;
}

.history-card-header {
  background: linear-gradient(135deg, #ede7f6 0%, #e3f2fd 100%);
  border-bottom: 1px solid #d1c4e9;
  padding: 0.9rem 1.25rem;
}

.history-card-header h6 { font-size: 0.875rem; color: #2c3e50; }

.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: linear-gradient(to bottom, #696cff, #e9ecef);
  border-radius: 2px;
}

.history-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-bottom: 1.25rem;
}

.history-item.last { padding-bottom: 0; }

.history-dot {
  position: absolute;
  left: -1.55rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
}

.dot-created  { background: linear-gradient(135deg, #696cff, #9155fd); }
.dot-assigned { background: linear-gradient(135deg, #17a2b8, #0d6efd); }
.dot-response { background: linear-gradient(135deg, #ffc107, #fd7e14); }
.dot-resolved { background: linear-gradient(135deg, #28a745, #20c997); }
.dot-closed   { background: linear-gradient(135deg, #343a40, #495057); }

.history-content { flex: 1; padding-top: 0.1rem; }

.history-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #9e9e9e;
  flex-wrap: wrap;
}

.history-meta i { font-size: 0.8rem; }
.history-sep { color: #ccc; margin: 0 0.15rem; }

.history-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #bdbdbd;
  font-size: 0.82rem;
  padding: 0.5rem 0;
  font-style: italic;
}

.history-empty i { font-size: 1rem; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

