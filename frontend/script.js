const API = 'http://localhost:3000/notes';
//const API = 'http://34.29.151.95:3000/notes';
let editId = null;
let allNotes = [];

// ── Render all notes as cards ──
function renderNotes(notes) {
  const grid = document.getElementById('notesGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('noteCount');

  count.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;

  if (notes.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = '';

  notes.forEach((note, i) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="card-meta">
        <span class="card-id">NOTE #${String(note.id).padStart(3, '0')}</span>
        <span class="card-date">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatTanggal(note.tanggal_dibuat)}
        </span>
      </div>
      <div class="card-title">${escHtml(note.judul)}</div>
      <div class="card-preview">${escHtml(note.isi)}</div>
      <div class="card-actions">
        <button class="card-btn edit" onclick="event.stopPropagation(); isiForm(${note.id}, \`${escJs(note.judul)}\`, \`${escJs(note.isi)}\`)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="card-btn delete" onclick="event.stopPropagation(); hapus(${note.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          Hapus
        </button>
      </div>
    `;
    card.addEventListener('click', () => lihatDetail(note.id, note.judul, note.isi, note.tanggal_dibuat));
    grid.appendChild(card);
  });
}

// ── GET DATA ──
async function getNotes() {
  try {
    const res = await fetch(API);
    allNotes = await res.json();
    renderNotes(allNotes);
  } catch {
    showToast('Gagal memuat notes. Cek koneksi server!');
  }
}

// ── FILTER / SEARCH ──
function filterNotes() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allNotes.filter(n =>
    n.judul.toLowerCase().includes(q) || n.isi.toLowerCase().includes(q)
  );
  renderNotes(filtered);
}

// ── SUBMIT (ADD / EDIT) ──
async function submitNote() {
  const judul = document.getElementById('judul').value.trim();
  const isi   = document.getElementById('isi').value.trim();

  if (!judul || !isi) {
    showToast('Judul dan isi wajib diisi!');
    return;
  }

  try {
    let res;
    if (editId === null) {
      res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi })
      });
    } else {
      res = await fetch(`${API}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi })
      });
    }

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const isEdit = editId !== null;
    editId = null;
    clearForm();
    await getNotes();
    showToast(isEdit ? '✦ Note berhasil diperbarui' : '✦ Note berhasil disimpan');
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan note!');
  }
}

// ── ISI FORM (edit mode) ──
function isiForm(id, judul, isi) {
  document.getElementById('judul').value = judul;
  document.getElementById('isi').value = isi;
  document.getElementById('btnText').textContent = 'Perbarui';
  document.getElementById('cancelBtn').style.display = 'block';
  editId = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── CANCEL EDIT ──
function cancelEdit() {
  clearForm();
  showToast('Edit dibatalkan');
}

// ── HAPUS ──
async function hapus(id) {
  if (!confirm('Yakin mau hapus note ini?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    closeDetail();
    await getNotes();
    showToast('Note dihapus');
  } catch (err) {
    console.error(err);
    showToast('Gagal menghapus note!');
  }
}

// ── DETAIL ──
function lihatDetail(id, judul, isi, tanggal_dibuat) {
  const panel   = document.getElementById('detailPanel');
  const overlay = document.getElementById('overlay');
  const content = document.getElementById('detailContent');

  content.innerHTML = `
    <div class="detail-tag">Detail Note</div>
    <div class="detail-title">${escHtml(judul)}</div>
    <div class="detail-date">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Dibuat: ${formatTanggal(tanggal_dibuat)}
    </div>
    <div class="detail-divider"></div>
    <div class="detail-body">${escHtml(isi)}</div>
  `;

  panel.classList.add('open');
  overlay.classList.add('active');
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

// ── CLEAR FORM ──
function clearForm() {
  document.getElementById('judul').value = '';
  document.getElementById('isi').value   = '';
  document.getElementById('btnText').textContent = 'Simpan';
  document.getElementById('cancelBtn').style.display = 'none';
  editId = null;
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── FORMAT TANGGAL ──
function formatTanggal(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── HELPERS ──
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escJs(str) {
  return String(str).replace(/`/g, '\\`').replace(/\\/g, '\\\\');
}

// ── INIT ──
getNotes();