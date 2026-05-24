// Spoiler Shield v3 - Popup Script

let selectedTeams = new Set();
let allTeams = [];

// Load everything when popup opens
async function init() {
  const stored = await getStorage('selectedTeams');
  selectedTeams = new Set(stored.selectedTeams || []);

  const data = await getStorage('playoffData');

  if (data.playoffData) {
    allTeams = data.playoffData.teams;
    renderTeams();
    updateLastUpdated();
  } else {
    showLoading('Fetching playoff data...');
    chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, () => {
      chrome.storage.local.get('playoffData', data => {
        if (data.playoffData) {
          allTeams = data.playoffData.teams;
          renderTeams();
          updateLastUpdated();
        } else {
          showLoading('No active playoff games found.');
        }
      });
    });
  }
}

// Render team logo grid
function renderTeams() {
  const grid = document.getElementById('teamGrid');

  if (allTeams.length === 0) {
    grid.innerHTML = `<div class="loading">No active playoff games right now.</div>`;
    updateStatus('No active games');
    return;
  }

  grid.innerHTML = '';

  allTeams.forEach(team => {
    const isSelected = selectedTeams.has(team.espnId);
    const card = document.createElement('div');
    card.className = `team-card ${isSelected ? 'selected' : ''}`;
    card.dataset.id = team.espnId;

    card.innerHTML = `
      <img class="team-logo" src="${team.logo}" alt="${team.abbreviation}">
      <div class="team-abbr">${team.abbreviation}</div>
    `;

    card.addEventListener('click', () => toggleTeam(team));
    grid.appendChild(card);
  });

  updateStatus(`${allTeams.length} teams in playoffs`);
  updateSelectedCount();
}

// Toggle a team on/off
function toggleTeam(team) {
  if (selectedTeams.has(team.espnId)) {
    selectedTeams.delete(team.espnId);
  } else {
    selectedTeams.add(team.espnId);
  }

  const card = document.querySelector(`[data-id="${team.espnId}"]`);
  if (card) card.classList.toggle('selected', selectedTeams.has(team.espnId));

  saveAndSync();
  updateSelectedCount();
}

// Save selected teams and tell content script to rescan
function saveAndSync() {
  chrome.storage.local.set({ selectedTeams: [...selectedTeams] }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'RESCAN' }).catch(() => {});
      }
    });
  });
}

// UI helpers
function showLoading(message) {
  document.getElementById('teamGrid').innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      ${message}
    </div>
  `;
}

function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

function updateLastUpdated() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('lastUpdated').textContent = `Updated at ${time}`;
}

function updateSelectedCount() {
  const count = selectedTeams.size;
  const el = document.getElementById('selectedCount');
  el.textContent = count > 0 ? `${count} team${count > 1 ? 's' : ''} blocked` : '';
}

// Storage helper
function getStorage(key) {
  return new Promise(resolve => chrome.storage.local.get(key, resolve));
}

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  updateStatus('Syncing...');

  chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, () => {
    btn.classList.remove('spinning');
    chrome.storage.local.get('playoffData', data => {
      if (data.playoffData) {
        allTeams = data.playoffData.teams;
        renderTeams();
        updateLastUpdated();
      }
    });
  });
});

// Listen for background data updates
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'DATA_UPDATED') {
    chrome.storage.local.get('playoffData', data => {
      if (data.playoffData) {
        allTeams = data.playoffData.teams;
        renderTeams();
        updateLastUpdated();
      }
    });
  }
});

// Start
init();