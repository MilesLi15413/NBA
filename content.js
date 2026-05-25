// Spoiler Shield v3 - Content Script

function createShieldHTML() {
  return `
    <div class="ss-shield-inner">
      <div class="ss-shield-logo">🛡️</div>
      <div class="ss-shield-title">SpoilerShield</div>
      <div class="ss-shield-subtitle">Filtering spoilers...</div>
      <div class="ss-shield-spinner"></div>
    </div>
  `;
}

let shieldShownAt = Date.now();
let shieldRemoved = false;
let scanComplete = false;

// Turn on per-card hiding: every card stays hidden until individually scanned/blurred
function enableFiltering() {
  document.body.classList.add('ss-filtering');
}

function disableFiltering() {
  document.body.classList.remove('ss-filtering');
}

function injectShield() {
  const existing = document.getElementById('ss-page-shield');
  if (existing) existing.remove();
  const s = document.createElement('div');
  s.id = 'ss-page-shield';
  s.innerHTML = createShieldHTML();
  document.documentElement.appendChild(s);
  shieldShownAt = Date.now();
  shieldRemoved = false;
  scanComplete = false;

  setTimeout(() => {
    scanComplete = true;
    removeShield();
  }, 6000);
}

// Shield is purely cosmetic now — card visibility is handled per-card by CSS.
// Removing the shield does NOT reveal cards; only scanning does.
function removeShield() {
  if (shieldRemoved) return;
  const elapsed = Date.now() - shieldShownAt;
  const remaining = Math.max(0, 2000 - elapsed);

  setTimeout(() => {
    if (shieldRemoved) return;
    if (!scanComplete) {
      setTimeout(() => removeShield(), 100);
      return;
    }
    shieldRemoved = true;
    const s = document.getElementById('ss-page-shield');
    if (s) {
      s.classList.add('fade-out');
      setTimeout(() => s.remove(), 200);
    }
  }, remaining);
}

let blockedTeams = [];
let isEnabled = true;

function loadSettings(callback) {
  chrome.storage.local.get(['spoilerData', 'selectedTeams', 'enabled'], data => {
    const spoilerData = data.spoilerData;
    const selectedIds = new Set(data.selectedTeams || []);
    isEnabled = data.enabled !== false;

    if (spoilerData && spoilerData.teams) {
      blockedTeams = spoilerData.teams.filter(t => selectedIds.has(t.espnId));
    } else {
      blockedTeams = [];
    }

    // Only filter (hide cards) when enabled and teams are selected
    if (isEnabled && blockedTeams.length > 0) {
      enableFiltering();
    } else {
      disableFiltering();
    }

    if (callback) callback();
  });
}

function matchesBlockedTeam(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const team of blockedTeams) {
    if (team.keywords.strong.some(k => lower.includes(k))) return team;

    if (team.keywords.weak.some(k => lower.includes(k))) {
      const teamWords = [
        team.displayName.toLowerCase(),
        team.name.toLowerCase(),
        team.abbreviation.toLowerCase()
      ];
      if (teamWords.some(w => lower.includes(w))) return team;
    }
  }
  return null;
}

function getCardText(el) {
  const title = el.querySelector([
    '#video-title',
    'h3 a',
    'a#video-title',
    '#movie-name',
    '.title',
    '.title-fade',
    '.title-container',
    '.ytd-watch-card-compact-video-renderer #video-title',
    '.shortsLockupViewModelHostOutsideMetadata',
    '.shortsLockupViewModelHostMetadataTitle',
    'h3.shortsLockupViewModelHostOutsideMetadataTitle',
    '.reel-item-metadata h3',
    '#details .title',
    'a.yt-simple-endpoint.ytd-playlist-renderer',
    '.playlist-title',
    'yt-formatted-string.ytd-video-renderer',
    'span#video-title'
  ].join(', '));

  const channel = el.querySelector([
    '#channel-name',
    'ytd-channel-name',
    '.ytd-channel-name',
    'a.yt-simple-endpoint.ytd-video-owner-renderer',
    '.shortsLockupViewModelHostOutsideMetadataSubtitle',
    '#owner-name'
  ].join(', '));

  const description = el.querySelector([
    '#description-text',
    '#snippet-text',
    'yt-formatted-string#description-text',
    '.metadata-snippet-text',
    '#description'
  ].join(', '));

  const metadata = el.querySelector([
    '#metadata-line',
    '#video-short-byline-text',
    '.ytd-video-meta-block',
    '#metadata'
  ].join(', '));

  const shortTitle = el.querySelector([
    '.reel-item-metadata',
    '#details',
    'h3.shortsLockupViewModelHostOutsideMetadataTitle',
    '.shortsLockupViewModelHostOutsideMetadata'
  ].join(', '));

  return [
    title?.textContent || '',
    channel?.textContent || '',
    description?.textContent || '',
    metadata?.textContent || '',
    shortTitle?.textContent || '',
    el.getAttribute('aria-label') || '',
    el.getAttribute('title') || ''
  ].join(' ').trim();
}

function applyBlur(el, team) {
  if (el.dataset.ssBlurred === 'true') return;
  el.dataset.ssBlurred = 'true';
  el.dataset.ssTeam = team.espnId;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.style.filter = 'blur(10px)';
  el.style.visibility = 'visible';

  const overlay = document.createElement('div');
  overlay.className = 'ss-overlay';
  overlay.style.filter = 'blur(0px)';
  overlay.innerHTML = `
    <div class="ss-overlay-inner">
      <div class="ss-lock">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div class="ss-label">Spoiler Blocked</div>
    </div>
  `;

  overlay.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    showConfirmation(el, overlay, team);
  });

  el.appendChild(overlay);
}

function showConfirmation(el, overlay, team) {
  document.querySelector('.ss-dialog')?.remove();

  const dialog = document.createElement('div');
  dialog.className = 'ss-dialog';
  dialog.innerHTML = `
    <div class="ss-dialog-box">
      <div class="ss-dialog-emoji">🏀</div>
      <h3>Watch this video?</h3>
      <p>This video may contain spoilers for<br>
      <strong>${team.displayName}</strong></p>
      <div class="ss-dialog-buttons">
        <button class="ss-btn-cancel">Keep Blocked</button>
        <button class="ss-btn-confirm">Watch Anyway</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  dialog.querySelector('.ss-btn-cancel').addEventListener('click', () => {
    dialog.remove();
  });

  dialog.querySelector('.ss-btn-confirm').addEventListener('click', () => {
    dialog.remove();
    overlay.remove();
    el.style.filter = 'none';
    el.dataset.ssBlurred = 'removed';
  });

  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.remove();
  });
}

const SELECTORS = [
  'ytd-rich-item-renderer',
  'ytd-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-video-with-context-renderer',
  'ytd-reel-item-renderer',
  'ytd-shorts',
  'ytd-reel-shelf-renderer',
  'ytm-shorts-lockup-view-model',
  'ytm-shorts-lockup-view-model-v2',
  'ytd-playlist-renderer',
  'ytd-compact-playlist-renderer',
  'ytd-grid-playlist-renderer',
  'ytd-radio-renderer',
  'ytd-compact-radio-renderer',
  'ytd-watch-card-compact-video-renderer',
  'ytd-watch-card-rich-header-renderer',
  'ytd-watch-card-hero-video-renderer',
  'ytd-movie-renderer',
  'ytd-clip-creation-renderer',
  'ytd-search-pyv-renderer',
  'ytd-notification-renderer',
  'ytd-compact-live-meta-renderer',
  'ytd-channel-video-player-renderer',
  'ytd-featured-channel-renderer'
].join(', ');

function allCardsScanned() {
  const cards = document.querySelectorAll(SELECTORS);
  for (const el of cards) {
    if (!el.dataset.ssBlurred && !el.classList.contains('ss-scanned')) {
      return false;
    }
  }
  return true;
}

function scanPage() {
  const cards = document.querySelectorAll(SELECTORS);
  if (cards.length === 0) return;

  // If not filtering, nothing to hide — just drop the shield.
  if (!isEnabled || blockedTeams.length === 0) {
    scanComplete = true;
    removeShield();
    return;
  }

  cards.forEach(el => {
    if (el.dataset.ssBlurred === 'true') return;
    if (el.dataset.ssBlurred === 'removed') return;
    if (el.classList.contains('ss-scanned')) return;

    const text = getCardText(el);
    // No text yet — leave hidden, next scan cycle will catch it (no reveal = no flash)
    if (!text) return;

    const team = matchesBlockedTeam(text);
    if (team) {
      applyBlur(el, team);          // blurred + made visible inline
    } else {
      el.classList.add('ss-scanned'); // CSS makes this one visible
    }
  });

  if (allCardsScanned()) {
    scanComplete = true;
    removeShield();
  }
}

function fullReset() {
  scanComplete = false;
  document.querySelectorAll('[data-ss-blurred="true"], .ss-scanned').forEach(el => {
    el.querySelector('.ss-overlay')?.remove();
    el.style.filter = 'none';
    el.style.visibility = '';
    el.dataset.ssBlurred = '';
    el.classList.remove('ss-scanned');
  });

  loadSettings(() => scanPage());
}

// Main scan observer
const observer = new MutationObserver(() => {
  clearTimeout(window._ssScanTimer);
  window._ssScanTimer = setTimeout(scanPage, 200);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// URL change observer — re-show shield on YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    chrome.storage.local.get(['selectedTeams', 'enabled'], data => {
      const selectedTeams = data.selectedTeams || [];
      const enabled = data.enabled !== false;

      if (selectedTeams.length > 0 && enabled) {
        enableFiltering();   // keep cards hidden through the navigation
        injectShield();
        setTimeout(() => {
          scanComplete = false;
        }, 300);
      }
    });
  }
}).observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'RESCAN') fullReset();
});

// Init
chrome.storage.local.get(['selectedTeams', 'enabled'], data => {
  const selectedTeams = data.selectedTeams || [];
  const enabled = data.enabled !== false;

  if (selectedTeams.length > 0 && enabled) {
    enableFiltering();
    injectShield();
  } else {
    scanComplete = true;
    shieldRemoved = true;
  }

  loadSettings(() => scanPage());
});