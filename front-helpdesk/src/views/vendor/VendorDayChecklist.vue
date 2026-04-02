<template>
  <div class="vendor-checklist-page container-xxl flex-grow-1 container-p-y">
    <section class="hero-card">
      <div>
        <span class="hero-kicker">Checklist Hari-H</span>
        <h3>Isi checklist kesiapan event</h3>
        <p>Lihat event yang ditugaskan ke Anda, lalu tandai setiap item sebagai aman atau butuh perhatian. Jika ada kendala, isi keterangan dan unggah foto bila diperlukan.</p>
      </div>
      <button class="btn-primary-soft" type="button" @click="fetchEvents" :disabled="loading">
        {{ loading ? 'Memuat...' : 'Muat Ulang' }}
      </button>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total Event</span>
        <strong>{{ summary.total_event || 0 }}</strong>
      </article>
      <article class="stat-card stat-card--success">
        <span>Sudah Siap</span>
        <strong>{{ summary.event_siap || 0 }}</strong>
      </article>
      <article class="stat-card stat-card--alert">
        <span>Butuh Perhatian</span>
        <strong>{{ summary.event_butuh_perhatian || 0 }}</strong>
      </article>
      <article class="stat-card">
        <span>Belum Disubmit</span>
        <strong>{{ summary.belum_disubmit || 0 }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card panel-card--sidebar">
        <div class="panel-head">
          <div>
            <h5>Event Saya</h5>
            <p>Pilih event untuk membuka form checklist yang sudah disiapkan admin.</p>
          </div>
        </div>

        <div v-if="events.length" class="event-list">
          <button
            v-for="event in events"
            :key="event.id"
            type="button"
            :class="['event-item', { active: selectedEvent?.id === event.id }]"
            @click="openEvent(event.id)"
          >
            <div>
              <strong>{{ event.name }}</strong>
              <p>{{ formatDate(event.event_date) }}</p>
              <small>{{ event.venue || 'Lokasi belum diisi' }}</small>
            </div>
            <div class="event-side">
              <span :class="['badge-chip', `status-${event.status}`]">{{ formatStatus(event.status) }}</span>
              <small>{{ event.checked_count }}/{{ event.template_count }} item</small>
            </div>
          </button>
        </div>
        <div v-else class="empty-box">Belum ada event hari-H yang ditugaskan ke Anda.</div>
      </article>

      <article class="panel-card">
        <div class="panel-head">
          <div>
            <h5>Form Checklist Vendor</h5>
            <p v-if="selectedEvent">Isi semua item yang diberikan admin. Keterangan wajib untuk item yang butuh perhatian.</p>
            <p v-else>Pilih event terlebih dahulu untuk memulai checklist.</p>
          </div>
          <button v-if="selectedEvent" class="btn-primary" type="button" @click="submitChecklist" :disabled="submitting">
            {{ submitting ? 'Mengirim...' : 'Kirim ke Admin' }}
          </button>
        </div>

        <div v-if="detailLoading" class="empty-box">Memuat detail event...</div>
        <div v-else-if="!selectedEvent" class="empty-box">Belum ada event yang dipilih.</div>
        <div v-else class="form-wrap">
          <div class="event-overview">
            <div class="summary-card">
              <span>Event</span>
              <strong>{{ selectedEvent.name }}</strong>
              <small>{{ formatDate(selectedEvent.event_date) }} • {{ selectedEvent.venue || 'Lokasi belum diisi' }}</small>
            </div>
            <div class="summary-card">
              <span>Status Saat Ini</span>
              <strong>{{ formatStatus(selectedEvent.status) }}</strong>
              <small>{{ selectedEvent.attention_count }} item perlu perhatian</small>
            </div>
          </div>

          <div class="checklist-list">
            <article
              v-for="item in selectedEvent.items"
              :key="item.template_id"
              :class="['check-item', { 'check-item--alert': formState[item.checklist_item_id]?.status === 'tidak_aman' }]"
            >
              <div class="check-item__head">
                <div>
                  <span class="item-category">{{ item.category }}</span>
                  <h6>{{ item.name }}</h6>
                  <p>{{ item.instruction || item.description || 'Ikuti pengecekan standar dari admin.' }}</p>
                </div>
                <span v-if="item.result" class="last-check">Terakhir diisi {{ formatDateTime(item.result.checked_at) }}</span>
              </div>

              <div class="option-row">
                <label class="option-pill">
                  <input v-model="formState[item.checklist_item_id].status" type="radio" :name="`status-${item.checklist_item_id}`" value="aman">
                  <span>Aman</span>
                </label>
                <label class="option-pill option-pill--alert">
                  <input v-model="formState[item.checklist_item_id].status" type="radio" :name="`status-${item.checklist_item_id}`" value="tidak_aman">
                  <span>Butuh perhatian</span>
                </label>
              </div>

              <div v-if="formState[item.checklist_item_id].status === 'tidak_aman'" class="issue-grid">
                <label class="field">
                  <span>Keterangan Kendala</span>
                  <textarea
                    v-model="formState[item.checklist_item_id].notes"
                    rows="3"
                    class="form-control"
                    placeholder="Jelaskan kendala yang ditemukan di lapangan."
                  ></textarea>
                </label>
                <label class="field">
                  <span>Foto Kendala (opsional)</span>
                  <input type="file" accept="image/*" class="form-control" @change="handlePhotoChange(item.checklist_item_id, $event)">
                </label>
                <a v-if="item.result?.photo_url && !formState[item.checklist_item_id].photo" :href="item.result.photo_url" target="_blank" rel="noopener noreferrer" class="photo-link">
                  Lihat foto terakhir
                </a>
              </div>
            </article>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/services/api'

const loading = ref(false)
const detailLoading = ref(false)
const submitting = ref(false)

const summary = ref({})
const events = ref([])
const selectedEvent = ref(null)
const formState = ref({})

const fetchEvents = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/vendor/day-checklists/events')
    summary.value = data.summary || {}
    events.value = data.events || []

    if (!selectedEvent.value && events.value.length) {
      await openEvent(events.value[0].id)
    } else if (selectedEvent.value) {
      const current = events.value.find((event) => event.id === selectedEvent.value.id)
      if (current) {
        await openEvent(current.id)
      }
    }
  } catch (error) {
    showError(error, 'Gagal memuat daftar checklist vendor.')
  } finally {
    loading.value = false
  }
}

const openEvent = async (eventId) => {
  detailLoading.value = true
  try {
    const { data } = await api.get(`/vendor/day-checklists/events/${eventId}`)
    selectedEvent.value = data.event
    syncFormState(data.event)
  } catch (error) {
    showError(error, 'Gagal memuat detail checklist event.')
  } finally {
    detailLoading.value = false
  }
}

const syncFormState = (event) => {
  const state = {}
  event.items.forEach((item) => {
    state[item.checklist_item_id] = {
      status: item.result?.status || 'aman',
      notes: item.result?.notes || '',
      photo: null,
    }
  })
  formState.value = state
}

const handlePhotoChange = (itemId, event) => {
  formState.value[itemId].photo = event.target.files?.[0] || null
}

const submitChecklist = async () => {
  if (!selectedEvent.value) return

  submitting.value = true
  try {
    const payload = new FormData()
    selectedEvent.value.items.forEach((item, index) => {
      const state = formState.value[item.checklist_item_id]
      payload.append(`items[${index}][checklist_item_id]`, item.checklist_item_id)
      payload.append(`items[${index}][status]`, state.status)
      payload.append(`items[${index}][notes]`, state.status === 'tidak_aman' ? (state.notes || '') : '')
      if (state.photo) {
        payload.append(`items[${index}][photo]`, state.photo)
      }
    })

    const { data } = await api.post(`/vendor/day-checklists/events/${selectedEvent.value.id}/submit`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    selectedEvent.value = data.event
    syncFormState(data.event)
    await fetchEvents()
    Swal.fire({ icon: 'success', title: 'Terkirim', text: 'Checklist berhasil dikirim ke admin.', confirmButtonColor: '#0f766e' })
  } catch (error) {
    showError(error, 'Gagal mengirim checklist ke admin.')
  } finally {
    submitting.value = false
  }
}

const formatStatus = (status) => ({
  draft: 'Menunggu isian',
  siap: 'Siap',
  butuh_perhatian: 'Butuh perhatian',
}[status] || status)

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  : '-'

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  : '-'

const showError = (error, fallback) => {
  Swal.fire({
    icon: 'error',
    title: 'Terjadi Kendala',
    text: error.response?.data?.message || fallback,
    confirmButtonColor: '#0f766e',
  })
}

onMounted(fetchEvents)
</script>

<style scoped>
.vendor-checklist-page { display: flex; flex-direction: column; gap: 1.5rem; }
.hero-card, .panel-card, .stat-card, .summary-card, .event-item, .check-item { background: #fff; border: 1px solid rgba(13, 148, 136, .14); box-shadow: 0 18px 40px rgba(15, 23, 42, .06); }
.hero-card { display: flex; justify-content: space-between; gap: 1.5rem; align-items: flex-start; padding: 1.8rem; border-radius: 28px; background: linear-gradient(135deg, #ecfeff 0%, #fff 70%, #f8fafc 100%); }
.hero-kicker { display: inline-flex; padding: .35rem .8rem; border-radius: 999px; background: rgba(13, 148, 136, .12); color: #0f766e; font-weight: 800; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
.hero-card h3 { margin: .9rem 0 .55rem; font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; color: #0f172a; }
.hero-card p { margin: 0; max-width: 760px; color: #64748b; }
.btn-primary-soft, .btn-primary { border: 0; border-radius: 16px; padding: .9rem 1.15rem; font-weight: 700; }
.btn-primary-soft { background: #0f766e; color: #fff; }
.btn-primary { background: linear-gradient(135deg, #0f766e, #0f766e); color: #fff; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.stat-card { border-radius: 22px; padding: 1.2rem; display: grid; gap: .35rem; }
.stat-card span { color: #64748b; font-weight: 700; }
.stat-card strong { font-size: 2rem; color: #0f172a; }
.stat-card--success { border-color: rgba(34, 197, 94, .18); background: linear-gradient(180deg, #f0fdf4, #fff); }
.stat-card--alert { border-color: rgba(249, 115, 22, .18); background: linear-gradient(180deg, #fff7ed, #fff); }
.content-grid { display: grid; grid-template-columns: .92fr 1.3fr; gap: 1rem; align-items: start; }
.panel-card { border-radius: 26px; padding: 1.35rem; }
.panel-card--sidebar { max-height: 42rem; overflow: auto; }
.panel-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
.panel-head h5 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.panel-head p { margin: .25rem 0 0; color: #64748b; }
.event-list, .checklist-list, .event-overview { display: grid; gap: .9rem; }
.event-item { border-radius: 20px; padding: 1rem; display: flex; justify-content: space-between; gap: .9rem; align-items: center; text-align: left; cursor: pointer; }
.event-item.active { border-color: rgba(13, 148, 136, .45); box-shadow: 0 14px 28px rgba(13, 148, 136, .14); }
.event-item strong, .summary-card strong, .check-item h6 { color: #0f172a; }
.event-item p, .event-item small, .check-item p, .summary-card small { color: #64748b; margin: 0; }
.event-side { display: flex; flex-direction: column; gap: .45rem; align-items: flex-end; }
.badge-chip { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .75rem; border-radius: 999px; font-size: .78rem; font-weight: 800; }
.status-draft { background: rgba(148, 163, 184, .14); color: #475569; }
.status-siap { background: rgba(34, 197, 94, .12); color: #15803d; }
.status-butuh_perhatian { background: rgba(249, 115, 22, .12); color: #c2410c; }
.event-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 1rem; }
.summary-card { border-radius: 22px; padding: 1rem 1.1rem; display: grid; gap: .35rem; }
.summary-card span, .item-category { color: #64748b; font-size: .83rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.check-item { border-radius: 22px; padding: 1rem 1.1rem; }
.check-item--alert { border-color: rgba(249, 115, 22, .32); background: linear-gradient(180deg, #fff7ed, #fff); }
.check-item__head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.last-check { color: #94a3b8; font-size: .82rem; }
.option-row { display: flex; gap: .75rem; flex-wrap: wrap; margin: 1rem 0 .75rem; }
.option-pill { display: inline-flex; align-items: center; gap: .5rem; border: 1px solid rgba(148, 163, 184, .35); border-radius: 999px; padding: .65rem .9rem; background: #f8fafc; color: #334155; font-weight: 700; }
.option-pill--alert { border-color: rgba(249, 115, 22, .25); background: #fff7ed; color: #c2410c; }
.issue-grid { display: grid; gap: .8rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.field span { font-weight: 700; color: #334155; }
.form-control { width: 100%; border: 1px solid rgba(148, 163, 184, .35); border-radius: 16px; padding: .9rem 1rem; background: #fff; color: #0f172a; }
.form-control:focus { outline: none; border-color: rgba(13, 148, 136, .5); box-shadow: 0 0 0 4px rgba(13, 148, 136, .08); }
.photo-link { color: #0f766e; font-weight: 700; text-decoration: none; }
.empty-box { border: 1px dashed rgba(148, 163, 184, .55); border-radius: 22px; padding: 1.3rem; color: #64748b; text-align: center; }
@media (max-width: 1199px) {
  .stats-grid, .event-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .content-grid { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .hero-card, .event-item, .check-item__head { flex-direction: column; align-items: flex-start; }
  .stats-grid, .event-overview { grid-template-columns: 1fr; }
  .event-side { align-items: flex-start; }
}
</style>
