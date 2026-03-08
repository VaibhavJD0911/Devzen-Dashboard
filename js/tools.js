/* =========================
   DEVZEN — TOOLS.JS
   Tool Hub + Focus Shield
========================= */

/* ─── DEFAULT TOOLS ─── */
const DEFAULT_TOOLS = [
  { id: 'dt1', name: 'ChatGPT',       url: 'https://chat.openai.com',       cat: 'ai',          emoji: '🤖', desc: 'OpenAI conversational AI' },
  { id: 'dt2', name: 'Claude AI',     url: 'https://claude.ai',             cat: 'ai',          emoji: '🧠', desc: 'Anthropic AI assistant' },
  { id: 'dt3', name: 'Gemini',        url: 'https://gemini.google.com',     cat: 'ai',          emoji: '✨', desc: 'Google Gemini AI' },
  { id: 'dt4', name: 'YouTube',       url: 'https://youtube.com',           cat: 'media',       emoji: '▶️', desc: 'Video platform' },
  { id: 'dt5', name: 'MDN Docs',      url: 'https://developer.mozilla.org', cat: 'docs',        emoji: '📚', desc: 'Web development reference' },
  { id: 'dt6', name: 'GitHub',        url: 'https://github.com',            cat: 'dev',         emoji: '🐙', desc: 'Code hosting & collaboration' },
  { id: 'dt7', name: 'Stack Overflow',url: 'https://stackoverflow.com',     cat: 'dev',         emoji: '💬', desc: 'Developer Q&A community' },
  { id: 'dt8', name: 'Notion',        url: 'https://notion.so',             cat: 'productivity',emoji: '📝', desc: 'All-in-one workspace' },
  { id: 'dt9', name: 'Perplexity',    url: 'https://perplexity.ai',         cat: 'ai',          emoji: '🔍', desc: 'AI-powered search' },
  { id: 'dt10',name: 'CodePen',       url: 'https://codepen.io',            cat: 'dev',         emoji: '🖊️', desc: 'Front-end playground' },
];

const DEFAULT_BLOCKED = ['youtube.com', 'twitter.com', 'instagram.com', 'reddit.com', 'facebook.com'];

/* ─── CATEGORY COLORS ─── */
const CAT_COLORS = {
  ai:           { color: 'var(--teal)',    badge: 'badge-teal'    },
  productivity: { color: 'var(--lime)',    badge: 'badge-lime'    },
  docs:         { color: 'var(--gold)',    badge: 'badge-gold'    },
  dev:          { color: 'var(--purple)',  badge: 'badge-purple'  },
  media:        { color: 'var(--magenta)', badge: 'badge-magenta' },
  other:        { color: 'var(--orange)',  badge: 'badge-orange'  },
};

const CAT_LABELS = {
  ai: 'AI', productivity: 'Productivity', docs: 'Docs', dev: 'Dev', media: 'Media', other: 'Other',
};

/* ─── STATE ─── */
let tools       = JSON.parse(localStorage.getItem('dz_tools'))        || [...DEFAULT_TOOLS];
let blocked     = JSON.parse(localStorage.getItem('dz_blocked'))      || [...DEFAULT_BLOCKED];
let focusMode   = JSON.parse(localStorage.getItem('dz_focusMode'))    || false;
let activeFilter = 'all';

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  renderTools();
  renderBlockList();
  renderQuickLaunch();
  applyFocusMode(focusMode, false);

  document.getElementById('focusModeToggle').checked = focusMode;

  bindEvents();
  checkIfBlocked();
});

/* ─── BIND EVENTS ─── */
function bindEvents() {
  // Add Tool
  document.getElementById('addToolBtn').addEventListener('click', addTool);
  document.getElementById('toolUrl').addEventListener('keydown', e => { if (e.key === 'Enter') addTool(); });

  // Filter tabs
  document.getElementById('filterTabs').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.cat;
    renderTools();
  });

  // Block
  document.getElementById('addBlockBtn').addEventListener('click', addBlock);
  document.getElementById('blockInput').addEventListener('keydown', e => { if (e.key === 'Enter') addBlock(); });

  // Focus Mode Toggle
  document.getElementById('focusModeToggle').addEventListener('change', e => {
    focusMode = e.target.checked;
    localStorage.setItem('dz_focusMode', JSON.stringify(focusMode));
    applyFocusMode(focusMode, true);
  });
}

/* ─── RENDER TOOLS ─── */
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  grid.innerHTML = '';

  const filtered = activeFilter === 'all'
    ? tools
    : tools.filter(t => t.cat === activeFilter);

  document.getElementById('toolCountBadge').textContent = `${tools.length} tool${tools.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔭</div>
        <p>No tools in this category yet</p>
      </div>`;
    return;
  }

  filtered.forEach((tool, i) => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.cat = tool.cat;
    card.style.animationDelay = `${i * 0.05}s`;

    const { color, badge } = CAT_COLORS[tool.cat] || CAT_COLORS.other;
    const domain = getDomain(tool.url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    card.innerHTML = `
      <div class="tool-card-top">
        <div class="tool-favicon">
          <img src="${faviconUrl}" alt="" onerror="this.parentElement.innerHTML='${tool.emoji}'">
        </div>
        <div class="tool-actions">
          <button class="tool-action-btn open-btn" title="Open" onclick="openTool('${tool.url}', '${tool.name}', event)">↗</button>
          <button class="tool-action-btn" title="Remove" onclick="removeTool('${tool.id}', event)">×</button>
        </div>
      </div>
      <div>
        <div class="tool-name">${tool.name}</div>
        <div class="tool-url">${domain}</div>
      </div>
      <span class="tool-cat-badge ${badge}" style="color:${color};">${CAT_LABELS[tool.cat] || 'Other'}</span>
    `;

    // Click whole card to open
    card.addEventListener('click', () => openTool(tool.url, tool.name));
    grid.appendChild(card);
  });
}

/* ─── ADD TOOL ─── */
function addTool() {
  const name  = document.getElementById('toolName').value.trim();
  let   url   = document.getElementById('toolUrl').value.trim();
  const cat   = document.getElementById('toolCategory').value;
  const emoji = document.getElementById('toolEmoji').value.trim() || '🔗';
  const desc  = document.getElementById('toolDesc').value.trim();

  if (!name || !url) {
    flashInput(!name ? 'toolName' : 'toolUrl');
    return;
  }

  // Auto-add https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const newTool = {
    id: 'tool_' + Date.now(),
    name, url, cat, emoji, desc,
  };

  tools.unshift(newTool);
  saveTools();
  renderTools();
  renderQuickLaunch();

  // Reset form
  document.getElementById('toolName').value    = '';
  document.getElementById('toolUrl').value     = '';
  document.getElementById('toolEmoji').value   = '';
  document.getElementById('toolDesc').value    = '';

  // Flash success
  const btn = document.getElementById('addToolBtn');
  btn.textContent = '✓ Added!';
  btn.style.background = 'linear-gradient(135deg, var(--lime), #7ab800)';
  btn.style.color = 'var(--void)';
  setTimeout(() => {
    btn.textContent = '+ Add to Library';
    btn.style.background = '';
    btn.style.color = '';
  }, 1500);
}

/* ─── REMOVE TOOL ─── */
function removeTool(id, e) {
  if (e) e.stopPropagation();
  tools = tools.filter(t => t.id !== id);
  saveTools();
  renderTools();
  renderQuickLaunch();
}

/* ─── OPEN TOOL ─── */
function openTool(url, name, e) {
  if (e) e.stopPropagation();
  if (focusMode && isBlocked(url)) {
    showBlockedOverlay(getDomain(url));
    return;
  }
  window.open(url, '_blank');
}

/* ─── BLOCK SITES ─── */
function addBlock() {
  let domain = document.getElementById('blockInput').value.trim().toLowerCase();
  if (!domain) return;

  // Strip protocol/www
  domain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];

  if (blocked.includes(domain)) {
    flashInput('blockInput');
    return;
  }

  blocked.push(domain);
  saveBlocked();
  renderBlockList();
  document.getElementById('blockInput').value = '';
}

function removeBlock(domain) {
  blocked = blocked.filter(d => d !== domain);
  saveBlocked();
  renderBlockList();
}

function renderBlockList() {
  const list = document.getElementById('blockList');
  list.innerHTML = '';

  if (blocked.length === 0) {
    list.innerHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:2px;text-align:center;padding:20px 0;">NO SITES BLOCKED</div>`;
    return;
  }

  blocked.forEach(domain => {
    const item = document.createElement('div');
    item.className = 'block-item';
    item.innerHTML = `
      <div class="block-item-left">
        <div class="block-icon"></div>
        <span class="block-domain">${domain}</span>
      </div>
      <button class="unblock-btn" title="Unblock">×</button>
    `;
    item.querySelector('.unblock-btn').addEventListener('click', () => removeBlock(domain));
    list.appendChild(item);
  });
}

/* ─── FOCUS MODE ─── */
function applyFocusMode(active, animate) {
  const badge   = document.getElementById('focusActiveBadge');
  const subtext = document.getElementById('focusModeSubtext');
  const navStatus = document.getElementById('focusStatusNav');

  if (active) {
    badge.classList.add('show');
    subtext.textContent = `${blocked.length} sites blocked`;
    navStatus.textContent = '🛡 FOCUS MODE ON';
    navStatus.style.color = 'var(--magenta)';
  } else {
    badge.classList.remove('show');
    subtext.textContent = 'Blocking inactive';
    navStatus.textContent = '';
  }
}

/* ─── IS BLOCKED ─── */
function isBlocked(url) {
  if (!focusMode) return false;
  const domain = getDomain(url).replace(/^www\./, '');
  return blocked.some(b => domain === b || domain.endsWith('.' + b));
}

/* ─── BLOCKED OVERLAY ─── */
function showBlockedOverlay(domain) {
  document.getElementById('blockedDomainLabel').textContent = domain;
  document.getElementById('blockedOverlay').classList.add('show');
}

function closeBlockedOverlay() {
  document.getElementById('blockedOverlay').classList.remove('show');
}

/* ─── CHECK IF CURRENT SITE IS BLOCKED ─── */
function checkIfBlocked() {
  // Intercept link clicks anywhere on page
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('dashboard') || href.startsWith('reports') || href.startsWith('tools') || href.startsWith('login')) return;
    if (focusMode && isBlocked(href)) {
      e.preventDefault();
      showBlockedOverlay(getDomain(href));
    }
  });
}

/* ─── QUICK LAUNCH ─── */
function renderQuickLaunch() {
  const list = document.getElementById('quickLaunchList');
  list.innerHTML = '';
  const top = tools.slice(0, 8);

  document.getElementById('quickCount').textContent = tools.length;

  if (top.length === 0) {
    list.innerHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:2px;text-align:center;padding:20px 0;">ADD TOOLS TO QUICK LAUNCH</div>`;
    return;
  }

  top.forEach(tool => {
    const domain = getDomain(tool.url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const item = document.createElement('div');
    item.className = 'quick-item';
    item.innerHTML = `
      <div class="quick-item-icon">
        <img src="${faviconUrl}" alt="" onerror="this.parentElement.innerHTML='${tool.emoji}'">
      </div>
      <span class="quick-item-name">${tool.name}</span>
      <span class="quick-item-arrow">→</span>
    `;
    item.addEventListener('click', () => openTool(tool.url, tool.name));
    list.appendChild(item);
  });
}

/* ─── HELPERS ─── */
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  }
}

function saveTools()   { localStorage.setItem('dz_tools',     JSON.stringify(tools));     }
function saveBlocked() { localStorage.setItem('dz_blocked',   JSON.stringify(blocked));   }

function flashInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--magenta)';
  el.style.boxShadow   = '0 0 0 3px rgba(255,45,120,0.12)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1000);
}
