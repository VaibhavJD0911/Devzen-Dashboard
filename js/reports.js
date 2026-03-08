// Date
const now = new Date();
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
document.getElementById('dateBadge').textContent = dateStr;
document.getElementById('currentDate').textContent = dateStr;

// Load saved data
const focusSeconds = parseInt(localStorage.getItem('focusSeconds') || '0');
const sessions = parseInt(localStorage.getItem('sessionCount') || '0');
const distractions = parseInt(localStorage.getItem('distractions') || '0');
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const tasksCompleted = tasks.filter(t => t.done).length;

// Update stat cards
document.getElementById('totalFocus').innerHTML = (focusSeconds/3600).toFixed(1) + '<span class="stat-unit">h</span>';
document.getElementById('totalSessions').textContent = sessions;
document.getElementById('totalDistractions').textContent = distractions;
document.getElementById('tasksCompleted').textContent = tasksCompleted;
document.getElementById('totalTasks').textContent = tasks.length;
document.getElementById('deepFocusVal').textContent = (focusSeconds/3600).toFixed(1) + 'h';
document.getElementById('tasksVal').textContent = tasksCompleted;
document.getElementById('breaksVal').textContent = distractions;
document.getElementById('sessionsLegend').textContent = sessions;

// Radial chart
const pct = Math.min(100, (focusSeconds / (8*3600)) * 100);
document.getElementById('radialPct').textContent = pct.toFixed(0) + '%';
const CIRC = 408;
const offset = CIRC * (1 - pct / 100);
setTimeout(() => {
  document.getElementById('radialFocus').style.strokeDashoffset = offset;
}, 300);

// Week bar chart
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
// Simulate some data with today's real data
const todayIdx = (now.getDay() + 6) % 7;
const fakeMins = [120, 95, 180, 60, 210, 45, 30];
fakeMins[todayIdx] = Math.round(focusSeconds / 60);

const maxMins = Math.max(...fakeMins, 1);
const colors = ['var(--teal)','var(--lime)','var(--magenta)','var(--gold)','var(--purple)','var(--teal)','var(--lime)'];

const chart = document.getElementById('weekChart');
days.forEach((day, i) => {
  const grp = document.createElement('div');
  grp.className = 'bar-group';
  
  const bar = document.createElement('div');
  bar.className = 'bar';
  const h = Math.round((fakeMins[i] / maxMins) * 110);
  bar.style.height = '0px';
  bar.style.background = i === todayIdx
    ? `linear-gradient(180deg, ${colors[i]}, ${colors[i]}88)`
    : `${colors[i]}55`;
  bar.style.border = i === todayIdx ? `1px solid ${colors[i]}` : '1px solid transparent';
  
  const tooltip = document.createElement('div');
  tooltip.className = 'bar-tooltip';
  tooltip.textContent = `${(fakeMins[i]/60).toFixed(1)}h`;
  bar.appendChild(tooltip);
  
  const label = document.createElement('div');
  label.className = 'bar-day';
  label.textContent = day;
  if (i === todayIdx) label.style.color = 'var(--teal)';
  
  grp.append(bar, label);
  chart.appendChild(grp);
  
  setTimeout(() => { bar.style.height = h + 'px'; bar.style.transition = `height 0.8s ease ${i * 0.1}s`; }, 200);
});

// Sessions list
const sessionsListEl = document.getElementById('sessionsList');
const sessionTypes = [
  { name: 'Deep Work — Coding', color: 'var(--teal)', score: '98%', dur: '2h 00m' },
  { name: 'Code Review Session', color: 'var(--lime)', score: '87%', dur: '45m' },
  { name: 'Architecture Planning', color: 'var(--gold)', score: '92%', dur: '1h 30m' },
  { name: 'Bug Fixing Sprint', color: 'var(--magenta)', score: '74%', dur: '30m' },
];

sessionTypes.forEach((s, i) => {
  if (i === 0 && sessions === 0 && focusSeconds < 60) return;
  const item = document.createElement('div');
  item.className = 'session-item';
  item.style.animationDelay = `${i * 0.1}s`;
  item.innerHTML = `
    <div class="session-dot" style="background:${s.color};box-shadow:0 0 8px ${s.color}44;"></div>
    <div class="session-info">
      <div class="session-name">${s.name}</div>
      <div class="session-meta">Today · ${now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'})}</div>
    </div>
    <div class="session-duration">${i === 0 ? (focusSeconds/3600).toFixed(1)+'h' : s.dur}</div>
    <div class="session-score" style="background:${s.color}18;color:${s.color};border:1px solid ${s.color}33;">${s.score}</div>
  `;
  sessionsListEl.appendChild(item);
});

if (sessionsListEl.children.length === 0) {
  sessionsListEl.innerHTML = `<div style="text-align:center;padding:40px;font-family:'Space Mono',monospace;font-size:12px;color:var(--muted);letter-spacing:2px;">NO SESSIONS YET — START FOCUSING ON THE DASHBOARD</div>`;
}