<template>
  <div class="day-checklist-page container-xxl flex-grow-1 container-p-y">
    <section class="hero-card">
      <div>
        <span class="hero-kicker">Checklist Hari-H</span>
        <h3>Form kesiapan event untuk vendor</h3>
        <p>Admin menyusun item evaluasi per event, lalu vendor tinggal ceklis kondisi lapangan. Jika ada kendala, admin akan langsung melihat item yang butuh perhatian.</p>
      </div>
      <button class="btn-primary-soft" type="button" @click="fetchDashboard" :disabled="loading">
        {{ loading ? 'Memuat...' : 'Muat Ulang' }}
      </button>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total Event</span>
        <strong>{{ summary.total_event || 0 }}</strong>
        <small>Hari-H yang sudah dibuat admin</small>
      </article>
      <article class="stat-card stat-card--success">
        <span>Event Siap</span>
        <strong>{{ summary.event_siap || 0 }}</strong>
        <small>Semua item dinyatakan aman</small>
      </article>
      <article class="stat-card stat-card--alert">
        <span>Butuh Perhatian</span>
        <strong>{{ summary.event_butuh_perhatian || 0 }}</strong>
        <small>Ada item yang dilaporkan bermasalah</small>
      </article>
      <article class="stat-card">
        <span>Template Aktif</span>
        <strong>{{ summary.item_template_aktif || 0 }}</strong>
        <small>Item checklist siap dipakai</small>
      </article>
    </section>

    <section class="content-grid">
      <div class="left-stack">
        <article class="panel-card">
          <div class="panel-head">
            <div>
              <h5>Tambah Item Evaluasi</h5>
              <p>Item ini akan masuk ke pustaka checklist dan bisa dipakai saat admin membuat event baru.</p>
            </div>
          </div>

          <form class="form-grid" @submit.prevent="submitItem">
            <label class="field">
              <span>Nama Item</span>
              <input v-model="itemForm.name" type="text" class="form-control" placeholder="Contoh: Mic utama panggung">
            </label>

            <label class="field">
              <span>Kategori</span>
              <input v-model="itemForm.category" type="text" class="form-control" placeholder="Contoh: Sound System">
            </label>

            <label class="field field--full">
              <span>Catatan Admin</span>
              <textarea v-model="itemForm.description" rows="3" class="form-control" placeholder="Jelaskan apa yang perlu dicek vendor pada item ini."></textarea>
            </label>

            <div class="form-actions">
              <button class="btn-primary" type="submit" :disabled="itemSubmitting">
                {{ itemSubmitting ? 'Menyimpan...' : 'Simpan Item' }}
              </button>
            </div>
          </form>
        </article>

        <article class="panel-card panel-card--wide">
          <div class="panel-head">
            <div>
              <h5>Buat Form Kesiapan Event</h5>
              <p>Pilih vendor, tentukan tanggal event, lalu centang item yang wajib dicek di hari-H.</p>
            </div>
          </div>

          <form class="event-builder" @submit.prevent="submitEvent">
            <div class="event-builder__details">
              <label class="field">
                <span>Nama Event</span>
                <input v-model="eventForm.name" type="text" class="form-control" placeholder="Contoh: Seminar nasional 2026">
              </label>

              <label class="field">
                <span>Tanggal Event</span>
                <input v-model="eventForm.event_date" type="date" class="form-control">
              </label>

              <label class="field">
                <span>Vendor Pelaksana</span>
                <select v-model="eventForm.vendor_id" class="form-control">
                  <option value="">Pilih vendor</option>
                  <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">{{ vendor.name }}</option>
                </select>
              </label>

              <label class="field">
                <span>Lokasi</span>
                <input v-model="eventForm.venue" type="text" class="form-control" placeholder="Contoh: Hall utama">
              </label>
            </div>

            <div class="field event-builder__library">
              <span>Checklist untuk Event Ini</span>
              <div class="library-list">
                <label v-for="item in checklistItems" :key="item.id" class="library-item">
                  <div class="library-item__top">
                    <input v-model="eventForm.selected_items" :value="item.id" type="checkbox">
                    <div>
                      <strong>{{ item.name }}</strong>
                      <p>{{ item.category }}</p>
                    </div>
                  </div>
                  <textarea
                    v-if="eventForm.selected_items.includes(item.id)"
                    v-model="eventForm.instructions[item.id]"
                    rows="2"
                    class="form-control"
                    placeholder="Instruksi khusus untuk vendor di event ini"
                  ></textarea>
                </label>
              </div>
            </div>

            <div class="form-actions event-builder__actions">
              <button class="btn-primary" type="submit" :disabled="eventSubmitting">
                {{ eventSubmitting ? 'Membuat Form...' : 'Buat Form Event' }}
              </button>
            </div>
          </form>
        </article>
      </div>

      <div class="right-stack">
        <article class="panel-card panel-card--scroll">
          <div class="panel-head">
            <div>
              <h5>Peringatan Event</h5>
              <p>Event yang sudah diisi vendor dan punya item butuh perhatian akan muncul di sini.</p>
            </div>
          </div>

          <div v-if="attentionEvents.length" class="event-list">
            <button
              v-for="event in attentionEvents"
              :key="`attention-${event.id}`"
              type="button"
              class="event-item event-item--attention"
              @click="openEvent(event.id)"
            >
              <div>
                <strong>{{ event.name }}</strong>
                <p>{{ formatDate(event.event_date) }} • {{ event.venue || 'Lokasi belum diisi' }}</p>
              </div>
              <span class="badge-chip badge-chip--alert">{{ event.attention_count }} perhatian</span>
            </button>
          </div>
          <div v-else class="empty-box">Belum ada event yang membutuhkan perhatian khusus.</div>
        </article>

        <article class="panel-card panel-card--scroll">
          <div class="panel-head">
            <div>
              <h5>Daftar Event Hari-H</h5>
              <p>Pilih event untuk melihat progres checklist vendor dan item mana yang butuh follow up.</p>
            </div>
          </div>

          <div class="event-list">
            <button
              v-for="event in events"
              :key="event.id"
              type="button"
              :class="['event-item', { active: selectedEvent?.id === event.id }]"
              @click="openEvent(event.id)"
            >
              <div>
                <strong>{{ event.name }}</strong>
                <p>{{ event.vendor?.name || '-' }} • {{ formatDate(event.event_date) }}</p>
              </div>
              <div class="event-item__meta">
                <span :class="['badge-chip', `status-${event.status}`]">{{ formatStatus(event.status) }}</span>
                <small>{{ event.checked_count }}/{{ event.template_count }} item</small>
              </div>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="panel-card detail-card">
      <div class="panel-head">
        <div>
          <h5>Review Checklist Vendor</h5>
          <p v-if="selectedEvent">Admin bisa memeriksa item mana yang aman dan mana yang perlu tindak lanjut.</p>
          <p v-else>Pilih salah satu event terlebih dulu untuk melihat hasil checklist vendor.</p>
        </div>
      </div>

      <div v-if="detailLoading" class="empty-box">Memuat detail event...</div>
      <div v-else-if="!selectedEvent" class="empty-box">Belum ada event yang dipilih.</div>
      <div v-else class="detail-grid">
        <div class="event-summary">
          <div class="summary-card">
            <span>Event</span>
            <strong>{{ selectedEvent.name }}</strong>
            <small>{{ formatDate(selectedEvent.event_date) }} • {{ selectedEvent.venue || 'Lokasi belum diisi' }}</small>
          </div>
          <div class="summary-card">
            <span>Vendor</span>
            <strong>{{ selectedEvent.vendor?.name || '-' }}</strong>
            <small>{{ selectedEvent.vendor?.email || 'Email vendor belum tersedia' }}</small>
          </div>
          <div class="summary-card">
            <span>Status</span>
            <strong>{{ formatStatus(selectedEvent.status) }}</strong>
            <small>{{ selectedEvent.attention_count }} item perhatian dari {{ selectedEvent.template_count }} item</small>
          </div>
        </div>

        <div class="checklist-review-list">
          <article
            v-for="item in selectedEvent.items"
            :key="item.template_id"
            :class="['review-item', { 'review-item--alert': item.result?.status === 'tidak_aman' }]"
          >
            <div class="review-item__top">
              <div>
                <span class="item-category">{{ item.category }}</span>
                <h6>{{ item.name }}</h6>
                <p>{{ item.instruction || item.description || 'Tidak ada instruksi tambahan dari admin.' }}</p>
              </div>
              <span :class="['badge-chip', item.result ? `status-${item.result.status === 'tidak_aman' ? 'butuh_perhatian' : 'siap'}` : 'status-draft']">
                {{ item.result ? (item.result.status === 'tidak_aman' ? 'Butuh perhatian' : 'Aman') : 'Belum diisi' }}
              </span>
            </div>

            <div v-if="item.result" class="review-item__body">
              <p><strong>Keterangan vendor:</strong> {{ item.result.notes || 'Tidak ada kendala.' }}</p>
              <p><strong>Waktu isi:</strong> {{ formatDateTime(item.result.checked_at) }}</p>
              <a v-if="item.result.photo_url" :href="item.result.photo_url" target="_blank" rel="noopener noreferrer" class="photo-link">
                Lihat foto kendala
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/services/api'

const loading = ref(false)
const detailLoading = ref(false)
const itemSubmitting = ref(false)
const eventSubmitting = ref(false)

const summary = ref({})
const vendors = ref([])
const checklistItems = ref([])
const events = ref([])
const attentionEvents = ref([])
const selectedEvent = ref(null)

const itemForm = ref({
  name: '',
  category: '',
  description: '',
})

const eventForm = ref({
  name: '',
  event_date: '',
  venue: '',
  vendor_id: '',
  selected_items: [],
  instructions: {},
})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/day-checklists/dashboard')
    summary.value = data.summary || {}
    vendors.value = data.vendors || []
    checklistItems.value = data.checklist_items || []
    events.value = data.events || []
    attentionEvents.value = data.attention_events || []

    if (!selectedEvent.value && events.value.length) {
      await openEvent(events.value[0].id)
    } else if (selectedEvent.value) {
      const current = events.value.find((event) => event.id === selectedEvent.value.id)
      if (current) {
        await openEvent(current.id)
      }
    }
  } catch (error) {
    showError(error, 'Gagal memuat checklist hari-H admin.')
  } finally {
    loading.value = false
  }
}

const openEvent = async (eventId) => {
  detailLoading.value = true
  try {
    const { data } = await api.get(`/admin/day-checklists/events/${eventId}`)
    selectedEvent.value = data.event
  } catch (error) {
    showError(error, 'Gagal memuat detail event.')
  } finally {
    detailLoading.value = false
  }
}

const submitItem = async () => {
  itemSubmitting.value = true
  try {
    await api.post('/admin/day-checklists/items', itemForm.value)
    itemForm.value = { name: '', category: '', description: '' }
    await fetchDashboard()
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Item checklist berhasil ditambahkan.', confirmButtonColor: '#4f46e5' })
  } catch (error) {
    showError(error, 'Gagal menambahkan item checklist.')
  } finally {
    itemSubmitting.value = false
  }
}

const submitEvent = async () => {
  eventSubmitting.value = true
  try {
    const payload = {
      name: eventForm.value.name,
      event_date: eventForm.value.event_date,
      venue: eventForm.value.venue,
      vendor_id: eventForm.value.vendor_id,
      items: eventForm.value.selected_items.map((id) => ({
        checklist_item_id: id,
        instruction: eventForm.value.instructions[id] || '',
      })),
    }

    const { data } = await api.post('/admin/day-checklists/events', payload)
    eventForm.value = { name: '', event_date: '', venue: '', vendor_id: '', selected_items: [], instructions: {} }
    await fetchDashboard()
    if (data.event?.id) {
      await openEvent(data.event.id)
    }
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Form kesiapan event berhasil dibuat.', confirmButtonColor: '#4f46e5' })
  } catch (error) {
    showError(error, 'Gagal membuat form event.')
  } finally {
    eventSubmitting.value = false
  }
}

const formatStatus = (status) => ({
  draft: 'Menunggu isian vendor',
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
    confirmButtonColor: '#4f46e5',
  })
}

onMounted(fetchDashboard)
</script>

<style scoped>
.day-checklist-page { display: flex; flex-direction: column; gap: 1.5rem; }
.hero-card, .panel-card, .stat-card, .summary-card, .review-item, .event-item { background: #fff; border: 1px solid rgba(79, 70, 229, .12); box-shadow: 0 18px 40px rgba(15, 23, 42, .06); }
.hero-card { display: flex; justify-content: space-between; gap: 1.5rem; align-items: flex-start; padding: 1.8rem; border-radius: 28px; background: linear-gradient(135deg, #eef2ff 0%, #fff7ed 100%); }
.hero-kicker { display: inline-flex; padding: .35rem .8rem; border-radius: 999px; background: rgba(79, 70, 229, .12); color: #4f46e5; font-weight: 800; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
.hero-card h3 { margin: .9rem 0 .55rem; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; color: #0f172a; }
.hero-card p { margin: 0; max-width: 760px; color: #64748b; }
.btn-primary-soft, .btn-primary { border: 0; border-radius: 16px; padding: .9rem 1.15rem; font-weight: 700; }
.btn-primary-soft { background: #4f46e5; color: #fff; }
.btn-primary { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.stat-card { border-radius: 22px; padding: 1.2rem; display: flex; flex-direction: column; gap: .35rem; }
.stat-card span { color: #64748b; font-weight: 700; }
.stat-card strong { font-size: 2rem; color: #0f172a; }
.stat-card small { color: #94a3b8; }
.stat-card--success { border-color: rgba(34, 197, 94, .18); background: linear-gradient(180deg, #f0fdf4, #fff); }
.stat-card--alert { border-color: rgba(249, 115, 22, .18); background: linear-gradient(180deg, #fff7ed, #fff); }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .8fr); gap: 1rem; align-items: start; }
.left-stack, .right-stack { display: grid; gap: 1rem; }
.panel-card--wide { min-height: 100%; }
.panel-card { border-radius: 26px; padding: 1.35rem; }
.panel-card--scroll { max-height: 34rem; overflow: auto; }
.panel-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
.panel-head h5 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.panel-head p { margin: .25rem 0 0; color: #64748b; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.event-builder { display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: start; }
.event-builder__details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.event-builder__library { margin: 0; }
.event-builder__actions { grid-column: 1 / -1; }
.field { display: flex; flex-direction: column; gap: .45rem; }
.field span { font-weight: 700; color: #334155; }
.field--full { grid-column: 1 / -1; }
.form-control { width: 100%; border: 1px solid rgba(148, 163, 184, .35); border-radius: 16px; padding: .9rem 1rem; background: #fff; color: #0f172a; }
.form-control:focus { outline: none; border-color: rgba(79, 70, 229, .55); box-shadow: 0 0 0 4px rgba(79, 70, 229, .08); }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.library-list, .event-list, .checklist-review-list { display: grid; gap: .8rem; }
.library-list { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
.library-item { border: 1px solid rgba(226, 232, 240, .9); border-radius: 20px; padding: 1rem; display: grid; gap: .75rem; background: linear-gradient(180deg, #fcfcff 0%, #ffffff 100%); min-height: 7.75rem; align-content: start; }
.library-item__top { display: flex; gap: .8rem; align-items: flex-start; }
.library-item__top input { width: 1rem; height: 1rem; margin-top: .15rem; }
.library-item__top strong { display: block; color: #0f172a; font-size: .98rem; line-height: 1.45; }
.library-item__top p { margin: .2rem 0 0; color: #64748b; font-size: .82rem; font-weight: 700; }
.library-item textarea { min-height: 5rem; }
.event-item { border-radius: 20px; padding: 1rem; display: flex; justify-content: space-between; gap: .9rem; align-items: center; text-align: left; cursor: pointer; }
.event-item strong { color: #0f172a; }
.event-item p { margin: .2rem 0 0; color: #64748b; font-size: .92rem; }
.event-item.active { border-color: rgba(79, 70, 229, .4); box-shadow: 0 14px 28px rgba(79, 70, 229, .12); }
.event-item--attention { border-color: rgba(249, 115, 22, .3); background: #fff7ed; }
.event-item__meta { display: flex; flex-direction: column; gap: .45rem; align-items: flex-end; color: #64748b; }
.badge-chip { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .75rem; border-radius: 999px; font-size: .78rem; font-weight: 800; }
.badge-chip--alert, .status-butuh_perhatian { background: rgba(249, 115, 22, .12); color: #c2410c; }
.status-siap { background: rgba(34, 197, 94, .12); color: #15803d; }
.status-draft { background: rgba(148, 163, 184, .14); color: #475569; }
.detail-card { min-height: 26rem; }
.detail-grid { display: grid; gap: 1rem; }
.event-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.summary-card { border-radius: 22px; padding: 1rem 1.1rem; display: grid; gap: .35rem; }
.summary-card span, .item-category { color: #64748b; font-size: .83rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.summary-card strong { color: #0f172a; font-size: 1.05rem; }
.summary-card small { color: #64748b; }
.review-item { border-radius: 22px; padding: 1rem 1.1rem; }
.review-item--alert { border-color: rgba(249, 115, 22, .32); background: linear-gradient(180deg, #fff7ed, #fff); }
.review-item__top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.review-item__top h6 { margin: .25rem 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.review-item__top p, .review-item__body p { margin: 0; color: #64748b; }
.review-item__body { margin-top: .85rem; display: grid; gap: .35rem; }
.photo-link { color: #4f46e5; font-weight: 700; text-decoration: none; }
.empty-box { border: 1px dashed rgba(148, 163, 184, .55); border-radius: 22px; padding: 1.3rem; color: #64748b; text-align: center; }
@media (max-width: 1199px) {
  .stats-grid, .event-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .content-grid { grid-template-columns: 1fr; }
  .library-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .hero-card { flex-direction: column; }
  .stats-grid, .form-grid, .event-summary, .event-builder, .event-builder__details { grid-template-columns: 1fr; }
  .event-item, .review-item__top { flex-direction: column; align-items: flex-start; }
  .event-item__meta { align-items: flex-start; }
  .library-list { grid-template-columns: 1fr; }
}
</style>
