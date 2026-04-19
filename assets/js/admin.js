// ==================== KONFIGURASI SUPABASE ====================
// GANTI DENGAN PROJECT SUPABASE KAMU!
const SUPABASE_URL = 'https://yjmutdmhczorrsdaqbkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hkxIwYsO1ku8YcdpdZ9WTg_qeQU5Xip';

// Inisialisasi Supabase Client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================== STATE ====================
let currentTab = 'events';
let editingItem = null;
let currentDataType = null;

// ==================== CHECK AUTHENTICATION ====================
async function checkAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = 'admin.html';
    return false;
  }
  
  const { data: { user }, error } = await _supabase.auth.getUser(token);
  if (error || !user) {
    localStorage.removeItem('admin_token');
    window.location.href = 'admin.html';
    return false;
  }
  return true;
}

// ==================== LOAD EVENTS ====================
async function loadEvents() {
  const tbody = document.getElementById('eventsTableBody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Memuat data...</td></tr>';
  
  const { data, error } = await _supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  
  if (error) {
    console.error('Error loading events:', error);
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Gagal memuat data</td></tr>';
    return;
  }
  
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada dokumentasi. Klik "Tambah Baru"</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(event => `
    <tr data-id="${event.id}">
      <td>${escapeHtml(event.title)}</td>
      <td>${event.event_date ? formatDate(event.event_date) : '-'}</td>
      <td><a href="${event.drive_link}" target="_blank" style="color:#C6A85B;">Lihat Drive</a></td>
      <td class="action-buttons">
        <button class="edit-btn" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// ==================== LOAD MEMBERS ====================
async function loadMembers() {
  const tbody = document.getElementById('membersTableBody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Memuat data...</td></tr>';
  
  const { data, error } = await _supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading members:', error);
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Gagal memuat data</td></tr>';
    return;
  }
  
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada anggota. Klik "Tambah Baru"</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(member => `
    <tr data-id="${member.id}">
      <td>${escapeHtml(member.name)}</td>
      <td>${escapeHtml(member.role)}</td>
      <td>${escapeHtml(member.division || '-')}</td>
      <td class="action-buttons">
        <button class="edit-btn" onclick="editMember('${member.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" onclick="deleteMember('${member.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// ==================== EVENT CRUD ====================
async function saveEvent(data, id = null) {
  if (id) {
    const { error } = await _supabase
      .from('events')
      .update({
        title: data.title,
        description: data.description,
        event_date: data.event_date,
        drive_link: data.drive_link,
        thumbnail: data.thumbnail,
        updated_at: new Date()
      })
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await _supabase
      .from('events')
      .insert([{
        title: data.title,
        description: data.description,
        event_date: data.event_date,
        drive_link: data.drive_link,
        thumbnail: data.thumbnail
      }]);
    if (error) throw error;
  }
  await loadEvents();
}

async function deleteEvent(id) {
  if (confirm('Yakin ingin menghapus dokumentasi ini?')) {
    const { error } = await _supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      await loadEvents();
    }
  }
}

async function editEvent(id) {
  const { data, error } = await _supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    alert('Gagal mengambil data: ' + error.message);
    return;
  }
  
  if (data) {
    editingItem = { id, type: 'event' };
    currentDataType = 'event';
    openModalForEvent(data);
  }
}

// ==================== MEMBER CRUD ====================
async function saveMember(data, id = null) {
  if (id) {
    const { error } = await _supabase
      .from('members')
      .update({
        name: data.name,
        role: data.role,
        division: data.division,
        photo: data.photo,
        updated_at: new Date()
      })
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await _supabase
      .from('members')
      .insert([{
        name: data.name,
        role: data.role,
        division: data.division,
        photo: data.photo
      }]);
    if (error) throw error;
  }
  await loadMembers();
}

async function deleteMember(id) {
  if (confirm('Yakin ingin menghapus anggota ini?')) {
    const { error } = await _supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      await loadMembers();
    }
  }
}

async function editMember(id) {
  const { data, error } = await _supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    alert('Gagal mengambil data: ' + error.message);
    return;
  }
  
  if (data) {
    editingItem = { id, type: 'member' };
    currentDataType = 'member';
    openModalForMember(data);
  }
}

// ==================== MODAL HANDLERS ====================
function openModalForEvent(data = null) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (data) {
    modalTitle.textContent = 'Edit Dokumentasi';
  } else {
    modalTitle.textContent = 'Tambah Dokumentasi';
  }
  
  modalForm.innerHTML = `
    <input type="text" id="eventTitle" placeholder="Judul Event*" value="${escapeHtml(data?.title || '')}" required>
    <textarea id="eventDesc" placeholder="Deskripsi" rows="3">${escapeHtml(data?.description || '')}</textarea>
    <input type="date" id="eventDate" value="${data?.event_date || ''}">
    <input type="url" id="eventDrive" placeholder="Link Google Drive*" value="${escapeHtml(data?.drive_link || '')}" required>
    <input type="url" id="eventThumb" placeholder="URL Thumbnail (opsional)" value="${escapeHtml(data?.thumbnail || '')}">
    <small style="color:#A1A1AA; font-size:0.7rem;">* wajib diisi</small>
  `;
  
  modal.classList.add('active');
}

function openModalForMember(data = null) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (data) {
    modalTitle.textContent = 'Edit Anggota';
  } else {
    modalTitle.textContent = 'Tambah Anggota';
  }
  
  modalForm.innerHTML = `
    <input type="text" id="memberName" placeholder="Nama Lengkap*" value="${escapeHtml(data?.name || '')}" required>
    <input type="text" id="memberRole" placeholder="Jabatan*" value="${escapeHtml(data?.role || '')}" required>
    <input type="text" id="memberDivision" placeholder="Divisi" value="${escapeHtml(data?.division || '')}">
    <input type="url" id="memberPhoto" placeholder="URL Foto (opsional)" value="${escapeHtml(data?.photo || '')}">
    <small style="color:#A1A1AA; font-size:0.7rem;">* wajib diisi</small>
  `;
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingItem = null;
  currentDataType = null;
}

// ==================== SAVE HANDLER ====================
async function handleSave() {
  if (currentTab === 'events') {
    const title = document.getElementById('eventTitle')?.value;
    const driveLink = document.getElementById('eventDrive')?.value;
    
    if (!title || !driveLink) {
      alert('Judul dan Link Drive wajib diisi!');
      return;
    }
    
    const data = {
      title: title,
      description: document.getElementById('eventDesc')?.value || '',
      event_date: document.getElementById('eventDate')?.value || null,
      drive_link: driveLink,
      thumbnail: document.getElementById('eventThumb')?.value || null
    };
    
    try {
      if (editingItem && editingItem.type === 'event') {
        await saveEvent(data, editingItem.id);
      } else {
        await saveEvent(data);
      }
      closeModal();
    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
    }
  } 
  else if (currentTab === 'members') {
    const name = document.getElementById('memberName')?.value;
    const role = document.getElementById('memberRole')?.value;
    
    if (!name || !role) {
      alert('Nama dan Jabatan wajib diisi!');
      return;
    }
    
    const data = {
      name: name,
      role: role,
      division: document.getElementById('memberDivision')?.value || '',
      photo: document.getElementById('memberPhoto')?.value || null
    };
    
    try {
      if (editingItem && editingItem.type === 'member') {
        await saveMember(data, editingItem.id);
      } else {
        await saveMember(data);
      }
      closeModal();
    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
    }
  }
}

// ==================== TAB SWITCHING ====================
function switchTab(tab) {
  currentTab = tab;
  
  // Update active class on nav
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.tab === tab) {
      link.classList.add('active');
    }
  });
  
  // Update tab content visibility
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Update header title
  const panelTitle = document.getElementById('panelTitle');
  const addBtn = document.getElementById('addBtn');
  
  if (tab === 'events') {
    panelTitle.textContent = 'Kelola Dokumentasi';
    addBtn.innerHTML = '+ Tambah Dokumentasi';
    loadEvents();
  } else {
    panelTitle.textContent = 'Kelola Anggota';
    addBtn.innerHTML = '+ Tambah Anggota';
    loadMembers();
  }
}

// ==================== ADD BUTTON HANDLER ====================
function handleAdd() {
  editingItem = null;
  if (currentTab === 'events') {
    openModalForEvent();
  } else {
    openModalForMember();
  }
}

// ==================== LOGOUT ====================
function handleLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = 'admin.html';
}

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  
  // Tab listeners
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });
  
  // Add button
  document.getElementById('addBtn').addEventListener('click', handleAdd);
  
  // Save button
  document.getElementById('saveBtn').addEventListener('click', handleSave);
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  
  // Close modal when clicking outside
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
  
  // Load initial data
  await loadEvents();
});

// Make functions global for onclick handlers
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.closeModal = closeModal;
