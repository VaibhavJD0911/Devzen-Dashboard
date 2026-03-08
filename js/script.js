/* ========================= LOGOUT ========================= */
function handleLogout() {
  document.querySelector('.logout-btn').textContent = 'Logging out...';
  setTimeout(() => { window.location.href = 'login.html'; }, 600);
}

/* ========================= POMODORO TIMER ========================= */
const CIRCUMFERENCE = 2 * Math.PI * 65; // ≈ 408.4
const progressEl = document.getElementById('timerProgress');
const displayEl = document.getElementById('timerDisplay');
const phaseEl = document.getElementById('timerPhase');
const timerStatusEl = document.getElementById('timerStatus');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

progressEl.style.strokeDasharray = CIRCUMFERENCE;
progressEl.style.strokeDashoffset = 0;

let timeLeft = 1500;
let totalTime = 1500;
let timerInterval = null;
let isRunning = false;
let sessionCount = parseInt(localStorage.getItem('sessionCount') || '0');
let totalFocusSeconds = parseInt(localStorage.getItem('focusSeconds') || '0');

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function updateProgress() {
  const offset = CIRCUMFERENCE * (1 - timeLeft / totalTime);
  progressEl.style.strokeDashoffset = offset;
  displayEl.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.textContent = '⏸ Pause';
  timerStatusEl.textContent = 'RUNNING';
  timerStatusEl.className = 'card-badge badge-lime';

  timerInterval = setInterval(() => {
    timeLeft--;
    totalFocusSeconds++;
    updateProgress();
    updateAnalytics();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      sessionCount++;
      localStorage.setItem('sessionCount', sessionCount);
      localStorage.setItem('focusSeconds', totalFocusSeconds);
      timerStatusEl.textContent = 'DONE';
      timerStatusEl.className = 'card-badge badge-magenta';
      startBtn.textContent = '▶ Start';
      updateAnalytics();
      showNotification('Session complete! 🎯');
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  startBtn.textContent = '▶ Resume';
  timerStatusEl.textContent = 'PAUSED';
  timerStatusEl.className = 'card-badge badge-gold';
}

startBtn.addEventListener('click', () => {
  if (isRunning) { pauseTimer(); } else { startTimer(); }
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  timeLeft = 1500;
  totalTime = 1500;
  updateProgress();
  startBtn.textContent = '▶ Start';
  timerStatusEl.textContent = 'IDLE';
  timerStatusEl.className = 'card-badge badge-teal';
  phaseEl.textContent = 'Focus';
});

updateProgress();

/* ========================= TASK MANAGER ========================= */
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const check = document.createElement('div');
    check.className = 'task-check' + (task.done ? ' done' : '');
    check.addEventListener('click', () => {
      tasks[i].done = !tasks[i].done;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text' + (task.done ? ' done' : '');
    text.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'task-del';
    del.textContent = '×';
    del.addEventListener('click', () => {
      tasks.splice(i, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    });

    li.append(check, text, del);
    list.appendChild(li);
  });
  document.getElementById('taskCount').textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

document.getElementById('addTaskBtn').addEventListener('click', () => {
  const val = document.getElementById('taskInput').value.trim();
  if (!val) return;
  tasks.push({ text: val, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  document.getElementById('taskInput').value = '';
  renderTasks();
});

document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addTaskBtn').click();
});

renderTasks();

/* ========================= QUICK NOTES ========================= */
const notesArea = document.getElementById('notesArea');
const charCount = document.getElementById('charCount');
const savedNote = localStorage.getItem('quickNote') || '';
notesArea.value = savedNote;
charCount.textContent = savedNote.length + ' chars';

notesArea.addEventListener('input', () => {
  charCount.textContent = notesArea.value.length + ' chars';
});

document.getElementById('saveNote').addEventListener('click', () => {
  localStorage.setItem('quickNote', notesArea.value);
  const btn = document.getElementById('saveNote');
  btn.textContent = '✓ Saved!';
  btn.style.color = 'var(--lime)';
  btn.style.borderColor = 'rgba(170,255,0,0.3)';
  setTimeout(() => { btn.textContent = 'Save Note'; btn.style.color = ''; btn.style.borderColor = ''; }, 1500);
});

/* ========================= WEATHER ========================= */
const API_KEY = "a2dd0159dccdce3b502cd1c573b5ba6f";

document.getElementById('getWeather').addEventListener('click', async () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;
  const result = document.getElementById('weatherResult');
  result.className = 'weather-result';
  result.innerHTML = `<span style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:var(--teal)">
    <span class="loading-dot">.</span><span class="loading-dot">.</span><span class="loading-dot">.</span>
  </span>`;
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
    const d = await r.json();
    if (d.cod !== 200) throw new Error('City not found');
    result.className = 'weather-result loaded';
    result.innerHTML = `
      <div class="weather-city">${d.name}, ${d.sys.country}</div>
      <div class="weather-temp">${Math.round(d.main.temp)}°C</div>
      <div class="weather-meta">
        <span>${d.weather[0].description}</span>
        <span>Feels ${Math.round(d.main.feels_like)}°C</span>
        <span>Humidity ${d.main.humidity}%</span>
      </div>
    `;
  } catch {
    result.innerHTML = `<span style="color:var(--magenta);font-family:'Space Mono',monospace;font-size:11px;">City not found</span>`;
  }
});

document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('getWeather').click();
});

/* ========================= GITHUB ========================= */
document.getElementById('fetchGithub').addEventListener('click', async () => {
  const user = document.getElementById('githubUser').value.trim();
  if (!user) return;
  const result = document.getElementById('githubResult');
  result.innerHTML = `<span style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:var(--magenta)">
    <span class="loading-dot">.</span><span class="loading-dot">.</span><span class="loading-dot">.</span>
  </span>`;
  try {
    const r = await fetch(`https://api.github.com/users/${user}`);
    if (!r.ok) throw new Error('User not found');
    const d = await r.json();
    result.style.flexDirection = 'column';
    result.style.alignItems = 'flex-start';
    result.innerHTML = `
      <div class="gh-profile">
        <img src="${d.avatar_url}" class="gh-avatar" alt="avatar">
        <div class="gh-info">
          <div class="gh-name">${d.login}</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);">${d.bio || 'No bio'}</div>
        </div>
      </div>
      <div class="gh-stats-row">
        <div class="gh-stat"><span class="gh-stat-val">${d.public_repos}</span><span class="gh-stat-key">Repos</span></div>
        <div class="gh-stat"><span class="gh-stat-val">${d.followers}</span><span class="gh-stat-key">Followers</span></div>
        <div class="gh-stat"><span class="gh-stat-val">${d.following}</span><span class="gh-stat-key">Following</span></div>
      </div>
    `;
  } catch {
    result.innerHTML = `<span style="color:var(--magenta);font-family:'Space Mono',monospace;font-size:11px;">User not found</span>`;
  }
});

/* ========================= ANALYTICS ========================= */
let distractionCount = parseInt(localStorage.getItem('distractions') || '0');

function updateAnalytics() {
  const hours = (totalFocusSeconds / 3600).toFixed(1);
  document.getElementById('focusTime').textContent = hours + 'h';
  document.getElementById('sessionCount').textContent = sessionCount;
  document.getElementById('distractionCount').textContent = distractionCount;

  // Goal: 8 hours = 100%
  const pct = Math.min(100, (totalFocusSeconds / (8 * 3600)) * 100);
  document.getElementById('focusBar').style.width = pct + '%';
  document.getElementById('focusPercent').textContent = pct.toFixed(0) + '%';
}

updateAnalytics();

// Animate bar on load
setTimeout(() => {
  const pct = Math.min(100, (totalFocusSeconds / (8 * 3600)) * 100);
  document.getElementById('focusBar').style.width = pct + '%';
}, 500);

/* ========================= DISTRACTION TRACKER ========================= */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isRunning) {
    distractionCount++;
    localStorage.setItem('distractions', distractionCount);
    updateAnalytics();
    const alert = document.getElementById('distractionAlert');
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 3000);
  }
});

/* ========================= FOCUS SESSION ========================= */
document.getElementById('startSession').addEventListener('click', () => {
  const mins = parseInt(document.getElementById('sessionTime').value);
  timeLeft = mins * 60;
  totalTime = mins * 60;
  updateProgress();
  startTimer();
  document.getElementById('focusBanner').classList.add('session-active');
  showNotification(`${mins}-minute focus session started! 🚀`);
});

/* ========================= NOTIFICATION ========================= */
function showNotification(msg) {
  const alert = document.getElementById('distractionAlert');
  alert.querySelector('p').textContent = msg;
  alert.style.borderColor = 'rgba(0,245,212,0.4)';
  alert.style.background = 'rgba(0,245,212,0.1)';
  alert.querySelector('p').style.color = 'var(--teal)';
  alert.classList.add('show');
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.style.borderColor = '';
      alert.style.background = '';
      alert.querySelector('p').style.color = '';
    }, 300);
  }, 3000);
}