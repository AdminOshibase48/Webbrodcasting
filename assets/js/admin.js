// Supabase Configuration
const SUPABASE_URL = 'https://yjmutdmhczorrsdaqbkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hkxIwYsO1ku8YcdpdZ9WTg_qeQU5Xip';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let currentTab = 'events';
let editingItem = null;

// Check authentication
async function checkAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = 'admin.html';
    return;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    localStorage.removeItem('admin_token');
    window.location.href = 'admin.html';
  }
}

// Load Events
async function loadEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  
  if (error) {
    console.error('Error loading events:', error);
    return;
  }
  
  const tbody = document.getElementById('eventsTableBody');
  tbody.innerHTML = data.map(event => `
    <tr>
      <td>${escapeHtml(event.title)}</td>
      <td>${event.event_date ? new Date(event.event_date).toLocaleDateString('id-ID') : '-'}</td>
      <td><a href="${event.drive_link}" target="_blank" style="color:#C6A85B;">Lihat</a></td>
      <td class="action-buttons">
        <button class="edit-btn" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Load Members
async function loadMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading members:', error);
    return;
  }
  
  const tbody = document.getElementById('membersTableBody');
  tbody.innerHTML = data.map(member => `
    <tr>
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

// Event CRUD
async function saveEvent(data, id = null) {
  if (id) {
    const { error } = await supabase
      .from('events')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('events')
      .insert([data]);
    if (error) throw error;
  }
  await loadEvents();
}

async function deleteEvent(id) {
  if (confirm('Yakin ingin menghapus dokumentasi ini?')) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) console.error('Error:', error);
    else await loadEvents();
  }
}

async function editEvent(id) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (data) {
    editingItem = { id, type: 'event', data };
    openModal('event');
    document.getElementById('eventTitle').value = data.title;
    document.getElementById('eventDesc').value = data.description || '';
    document.getElementById('eventDate').value = data.event_date || '';
    document.getElementById('eventDrive').value = data.drive_link;
    document.getElementById('eventThumb').value = data.thumbnail || '';
  }
}

// Member CRUD
async function saveMember(data, id = null) {
  if (id) {
    const { error } = await supabase
      .from('members')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('members')
      .insert([data]);
    if (error) throw error;
  }
  await loadMembers();
}

async function deleteMember(id) {
  if (confirm('Yakin ingin menghapus anggota ini?')) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) console.error('Error:', error);
    else await loadMembers();
  }
}

async function editMember(id) {
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();
  
  if (data) {
    editingItem = { id, type: 'member', data };
    openModal('member');
    document.getElementById('memberName').value = data.name;
    document.getElementById('memberRole').value = data.role;
    document.getElementById('memberDivision').value = data.division || '';
    document.getElementById('memberPhoto').value = data.photo || '';
  }
}

// Modal handling
function openModal(type) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (type === 'event') {
    modalTitle.textContent = editingItem ? 'Edit Dokumentasi' : 'Tambah Dokumentasi';
    modalForm.innerHTML = `
      <input type="text" id="eventTitle" placeholder="Judul Event" required>
      <textarea id="eventDesc" placeholder="Deskripsi" rows="3"></textarea>
      <input type="date" id="eventDate">
      <input type="url" id="eventDrive" placeholder="Link Google Drive" required>
      <input type="url" id="eventThumb" placeholder="URL Thumbnail (opsional)">
    `;
  } else {
    modalTitle.textContent = editingItem ? 'Edit Anggota' : 'Tambah Anggota';
    modalForm.innerHTML = `
      <input type="text" id="memberName" placeholder="Nama Lengkap" required>
      <input type="text" id="memberRole" placeholder="Jabatan" required>
      <input type="text" id="memberDivision" placeholder="Divisi">
      <input type="url" id="memberPhoto" placeholder="URL Foto (opsional)">
    `;
  }
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingItem = null;
}

// Save handler
document.getElementById('saveBtn').onclick = async () => {
  if (currentTab === 'events') {
    const data = {
      title: document.getElementById('eventTitle').value,
      description: document.getElementById('eventDesc').value,
      event_date: document.getElementById('eventDate').value,
      drive_link: document.getElementById('eventDrive').value,
      thumbnail: document.getElementById('eventThumb').value
    };
    
    if (editingItem) {
      await saveEvent(data, editingItem.id);
    } else {
      await saveEvent(data);
    }
  } else {
    const data = {
      name: document.getElementById('memberName').value,
      role: document.getElementById('memberRole').value,
      division: document.getElementById('memberDivision').value,
      photo: document.getElementById('memberPhoto').value
    };
    
    if (editingItem) {
      await saveMember(data, editingItem.id);
    } else {
      await saveMember(data);
    }
  }
  
  closeModal();
  if (currentTab === 'events') await loadEvents();
  else await loadMembers();
};

// Tab switching
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;
    currentTab = tab;
    
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');
    
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
  });
});

document.getElementById('addBtn').onclick = () => {
  editingItem = null;
  openModal(currentTab === 'events' ? 'event' : 'member');
};

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('admin_token');
  window.location.href = 'admin.html';
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Initialize
checkAuth();
loadEvents();
