const state = { people: [], search: '', department: 'all', toastTimer: null, standalone: location.protocol === 'file:' };
const starterPeople = [
  {id:1,name:'Aarav Mehta',title:'Chief Executive Officer',department:'Executive',level:'Executive',manager_id:null,email:'aarav.mehta@northstar.example',location:'Mumbai',bio:'Sets company direction and builds a culture where people can do their best work.',color:'violet'},
  {id:2,name:'Priya Nair',title:'Chief People Officer',department:'People & Culture',level:'Leadership',manager_id:1,email:'priya.nair@northstar.example',location:'Mumbai',bio:'Leads people strategy, talent development, and a thoughtful employee experience.',color:'rose'},
  {id:3,name:'Kabir Shah',title:'Chief Technology Officer',department:'Technology',level:'Leadership',manager_id:1,email:'kabir.shah@northstar.example',location:'Bengaluru',bio:'Guides technology strategy and the teams building our products.',color:'blue'},
  {id:4,name:'Ananya Rao',title:'VP, Talent Acquisition',department:'People & Culture',level:'Management',manager_id:2,email:'ananya.rao@northstar.example',location:'Mumbai',bio:'Helps teams find and welcome people who will thrive here.',color:'amber'},
  {id:5,name:'Rohan Iyer',title:'VP, People Operations',department:'People & Culture',level:'Management',manager_id:2,email:'rohan.iyer@northstar.example',location:'Pune',bio:'Makes core people processes clear, dependable, and employee-friendly.',color:'teal'},
  {id:6,name:'Meera Kapoor',title:'Engineering Director',department:'Technology',level:'Management',manager_id:3,email:'meera.kapoor@northstar.example',location:'Bengaluru',bio:'Builds high-performing engineering teams and reliable systems.',color:'blue'},
  {id:7,name:'Ishita Sen',title:'Talent Partner',department:'People & Culture',level:'Individual contributor',manager_id:4,email:'ishita.sen@northstar.example',location:'Mumbai',bio:'Partners with hiring managers to make recruitment human and inclusive.',color:'rose'},
  {id:8,name:'Dev Malhotra',title:'Learning & Development Lead',department:'People & Culture',level:'Individual contributor',manager_id:5,email:'dev.malhotra@northstar.example',location:'Remote',bio:'Creates learning experiences that help people grow into their next chapter.',color:'amber'},
  {id:9,name:'Nisha Verma',title:'People Operations Specialist',department:'People & Culture',level:'Individual contributor',manager_id:5,email:'nisha.verma@northstar.example',location:'Pune',bio:'Supports onboarding, employee records, and day-to-day people operations.',color:'teal'},
  {id:10,name:'Arjun Bose',title:'Engineering Manager',department:'Technology',level:'Management',manager_id:6,email:'arjun.bose@northstar.example',location:'Bengaluru',bio:'Supports a product engineering team from planning through delivery.',color:'blue'}
];
const chart = document.getElementById('org-chart');
const chartViewport = document.getElementById('chart-viewport');
const modalBackdrop = document.getElementById('modal-backdrop');
const profilePanel = document.getElementById('profile-panel');
const scrim = document.getElementById('scrim');
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const initials = name => name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();

async function loadData() {
  try {
    let stats;
    if (state.standalone) {
      state.people = JSON.parse(localStorage.getItem('people-atlas-employees') || 'null') || starterPeople;
      localStorage.setItem('people-atlas-employees', JSON.stringify(state.people));
      stats = makeStats(state.people);
    } else {
      const [peopleResponse, statsResponse] = await Promise.all([fetch('/api/employees'), fetch('/api/stats')]);
      if (!peopleResponse.ok || !statsResponse.ok) throw new Error('Could not load the people directory.');
      state.people = await peopleResponse.json();
      stats = await statsResponse.json();
    }
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-people').textContent = String(stats.people_team).padStart(2, '0');
    document.getElementById('stat-departments').textContent = String(stats.departments).padStart(2, '0');
    document.getElementById('stat-leaders').textContent = String(stats.leaders).padStart(2, '0');
    document.querySelector('.nav-count').textContent = stats.total;
    updateDepartmentOptions();
    renderChart();
  } catch (error) {
    chart.innerHTML = `<div class="empty-chart">${escapeHTML(error.message)}</div>`;
  }
}

function makeStats(people) {
  return {total:people.length,people_team:people.filter(p=>p.department==='People & Culture').length,departments:new Set(people.map(p=>p.department)).size,leaders:people.filter(p=>['Executive','Leadership'].includes(p.level)).length};
}

function updateDepartmentOptions() {
  const select = document.getElementById('department-filter');
  const prior = select.value;
  const departments = [...new Set(state.people.map(person => person.department))].sort();
  select.innerHTML = '<option value="all">All departments</option>' + departments.map(dept => `<option value="${escapeHTML(dept)}">${escapeHTML(dept)}</option>`).join('');
  if (departments.includes(prior)) select.value = prior;
  document.getElementById('manager-select').innerHTML = '<option value="">No manager</option>' + state.people.map(p => `<option value="${p.id}">${escapeHTML(p.name)} · ${escapeHTML(p.title)}</option>`).join('');
}

function matching(person) {
  const query = state.search.trim().toLowerCase();
  const matchesSearch = !query || [person.name, person.title, person.department, person.location].some(value => value.toLowerCase().includes(query));
  const matchesDepartment = state.department === 'all' || person.department === state.department;
  return matchesSearch && matchesDepartment;
}

function node(person) {
  return `<button class="org-node ${matching(person) ? '' : 'filtered-out'}" data-person-id="${person.id}" aria-label="View ${escapeHTML(person.name)}, ${escapeHTML(person.title)}">
    <div class="node-top"><div class="node-avatar ${escapeHTML(person.color)}">${escapeHTML(initials(person.name))}</div><div style="min-width:0"><div class="node-name">${escapeHTML(person.name)}</div><div class="node-role">${escapeHTML(person.title)}</div></div></div>
    <div class="node-meta"><span class="node-dept">${escapeHTML(person.department)}</span><span class="node-level">${escapeHTML(person.level)}</span></div>
  </button>`;
}

function renderChart() {
  const top = state.people.filter(p => p.manager_id === null);
  const children = manager => state.people.filter(p => p.manager_id === manager.id);
  const levelTwo = top.flatMap(children);
  const levelThree = levelTwo.flatMap(children);
  const levelFour = levelThree.flatMap(children);
  const levels = [top, levelTwo, levelThree, levelFour].filter(level => level.length);
  if (!state.people.length) { chart.innerHTML = '<div class="empty-chart">Your people map is ready for its first teammate.</div>'; return; }
  chart.innerHTML = levels.map((level, index) => `<div class="chart-level level-${['one','two','three','four'][index]}">${level.map(node).join('')}</div>`).join('');
  chart.querySelectorAll('.org-node').forEach(button => button.addEventListener('click', () => openProfile(Number(button.dataset.personId))));
  document.getElementById('visible-count').textContent = state.people.filter(matching).length;
  if (!state.people.some(matching)) chart.innerHTML = '<div class="empty-chart">No teammates match that search. Try another name or department.</div>';
}

function openProfile(id) {
  const person = state.people.find(p => p.id === id);
  if (!person) return;
  const manager = state.people.find(p => p.id === person.manager_id);
  const reports = state.people.filter(p => p.manager_id === id);
  document.getElementById('profile-content').innerHTML = `<div class="profile-cover"></div>
    <div class="node-avatar profile-avatar ${escapeHTML(person.color)}">${escapeHTML(initials(person.name))}</div>
    <h2 class="profile-name">${escapeHTML(person.name)}</h2><p class="profile-title">${escapeHTML(person.title)}</p><span class="profile-tag">${escapeHTML(person.department)} · ${escapeHTML(person.level)}</span>
    <div class="profile-section"><h3>About</h3><p class="profile-bio">${escapeHTML(person.bio)}</p></div>
    <div class="profile-section"><h3>Details</h3><div class="detail-row"><span class="detail-icon">✉</span>${escapeHTML(person.email)}</div><div class="detail-row"><span class="detail-icon">⌖</span>${escapeHTML(person.location)}</div>${manager ? `<div class="detail-row"><span class="detail-icon">↖</span>Reports to ${escapeHTML(manager.name)}</div>` : ''}</div>
    <div class="profile-section"><h3>Team · ${reports.length}</h3>${reports.length ? reports.map(p => `<div class="reports-person"><div class="node-avatar ${escapeHTML(p.color)}" style="width:30px;height:30px;border-radius:50%">${escapeHTML(initials(p.name))}</div><span><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.title)}</small></span></div>`).join('') : '<p class="profile-bio">No direct reports just yet.</p>'}</div>`;
  profilePanel.classList.add('open'); profilePanel.setAttribute('aria-hidden', 'false'); scrim.classList.add('open');
}

function closeProfile() { profilePanel.classList.remove('open'); profilePanel.setAttribute('aria-hidden', 'true'); scrim.classList.remove('open'); }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); }
function closeModal() { modalBackdrop.classList.remove('open'); }

document.getElementById('search').addEventListener('input', event => { state.search = event.target.value; renderChart(); });
document.getElementById('department-filter').addEventListener('change', event => { state.department = event.target.value; renderChart(); });
document.getElementById('reset-filters').addEventListener('click', () => { state.search = ''; state.department = 'all'; document.getElementById('search').value = ''; document.getElementById('department-filter').value = 'all'; renderChart(); });
document.getElementById('expand-all').addEventListener('click', () => { chartViewport.scrollTo({left: 0, top: 0, behavior: 'smooth'}); showToast('Showing the full people map'); });
document.getElementById('add-person').addEventListener('click', () => { document.getElementById('form-error').textContent = ''; modalBackdrop.classList.add('open'); document.querySelector('#person-form [name="name"]').focus(); });
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-modal').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', event => { if (event.target === modalBackdrop) closeModal(); });
document.getElementById('close-panel').addEventListener('click', closeProfile);
scrim.addEventListener('click', closeProfile);
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); closeProfile(); } if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('search').focus(); } });

document.getElementById('person-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const data = Object.fromEntries(form.entries());
  try {
    let result;
    if (state.standalone) {
      result = {...data,id:Math.max(0,...state.people.map(p=>p.id))+1,manager_id:data.manager_id ? Number(data.manager_id) : null,color:['violet','rose','blue','amber','teal'][state.people.length%5],bio:data.bio||'A valued member of the Northstar team.'};
      state.people.push(result);
      localStorage.setItem('people-atlas-employees',JSON.stringify(state.people));
    } else {
      const response = await fetch('/api/employees', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
      result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not add this teammate.');
    }
    event.currentTarget.reset(); closeModal(); await loadData(); openProfile(result.id); showToast(`${result.name} has joined the people map`);
  } catch (error) { document.getElementById('form-error').textContent = error.message; }
});

loadData();
