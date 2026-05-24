// Spoiler Shield v3 - Content Script

let blockedTeams = [];
let isEnabled = true;

// Load settings from storage
function loadSettings(callback) {
  chrome.storage.local.get(['playoffData', 'selectedTeams', 'enabled'], data => {
    const playoffData = data.playoffData;
    const selectedIds = new Set(data.selectedTeams || []);
    isEnabled = data.enabled !== false;

    if (playoffData && playoffData.teams) {
      blockedTeams = playoffData.teams.filter(t => selectedIds.has(t.espnId));
    }

    if (callback) callback();
  });
}

// Check if a text string matches any blocked team
function matchesBlockedTeam(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const team of blockedTeams) {
    for (const keyword of team.keywords) {
      if (lower.includes(keyword)) {
        return team;
      }
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

// Apply blur overlay to a video card
function applyBlur(el, team) {
  if (el.dataset.ssBlurred === 'true') return;
  el.dataset.ssBlurred = 'true';
  el.dataset.ssTeam = team.espnId;
  el.style.position = 'relative';

  const overlay = document.createElement('div');
  overlay.className = 'ss-overlay';
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

// Show confirmation dialog
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
    el.dataset.ssBlurred = 'removed';
  });

  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.remove();
  });
}

// Scan all video cards on the page
function scanPage() {
  if (!isEnabled || blockedTeams.length === 0) return;

  const selectors = [
    // Standard video cards
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-video-with-context-renderer',
    // Shorts
    'ytd-reel-item-renderer',
    'ytd-shorts',
    'ytd-reel-shelf-renderer',
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
    // Playlists
    'ytd-playlist-renderer',
    'ytd-compact-playlist-renderer',
    'ytd-grid-playlist-renderer',
    'ytd-radio-renderer',
    'ytd-compact-radio-renderer',
    // Sidebar / watch page
    'ytd-watch-card-compact-video-renderer',
    'ytd-watch-card-rich-header-renderer',
    // Movies / clips
    'ytd-movie-renderer',
    'ytd-clip-creation-renderer',
    // Notifications / search
    'ytd-search-pyv-renderer',
    'ytd-notification-renderer',
    // Live / upcoming
    'ytd-compact-live-meta-renderer',
    // Channel page
    'ytd-channel-video-player-renderer',
    'ytd-featured-channel-renderer'
  ].join(', ');

  document.querySelectorAll(selectors).forEach(el => {
    if (el.dataset.ssBlurred === 'true') return;
    if (el.dataset.ssBlurred === 'removed') return;

    const text = getCardText(el);
    if (!text) return;

    const team = matchesBlockedTeam(text);
    if (team) applyBlur(el, team);
  });
}

// Full reset - removes all blurs and rescans
function fullReset() {
  document.querySelectorAll('[data-ss-blurred="true"]').forEach(el => {
    el.querySelector('.ss-overlay')?.remove();
    el.dataset.ssBlurred = '';
  });

  loadSettings(() => scanPage());
}

// Watch for new videos loading (YouTube loads content dynamically)
const observer = new MutationObserver(() => {
  clearTimeout(window._ssScanTimer);
  window._ssScanTimer = setTimeout(scanPage, 200);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'RESCAN') fullReset();
});

// Init
loadSettings(() => scanPage());