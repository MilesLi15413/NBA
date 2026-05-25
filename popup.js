// Spoiler Shield v3 - Popup Script

let selectedTeams = new Set();
let allTeams = [];
let todayIds = new Set();
let allTeamsExpanded = false;

async function init() {
  const stored = await getStorage('selectedTeams');
  selectedTeams = new Set(stored.selectedTeams || []);

  // Check for sync error
  const errorData = await getStorage('syncError');
  if (errorData.syncError) {
    showError(errorData.syncError);
  }

  const data = await getStorage('spoilerData');

  if (data.spoilerData) {
    allTeams = data.spoilerData.teams;
    todayIds = new Set(data.spoilerData.todayIds || []);
    renderTeams();
    updateLastUpdated();
  } else {
    showLoading('teamGrid', 'Fetching data...');
    chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, () => {
      chrome.storage.local.get('spoilerData', data => {
        if (data.spoilerData) {
          allTeams = data.spoilerData.teams;
          todayIds = new Set(data.spoilerData.todayIds || []);
          renderTeams();
          updateLastUpdated();
        } else {
          showLoading('teamGrid', 'No data found.');
        }
      });
    });
  }
}

function renderTeams() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = '';

  const todaysTeams = allTeams.filter(t => todayIds.has(t.espnId));
  const otherTeams = allTeams.filter(t => !todayIds.has(t.espnId));

  if (todaysTeams.length === 0) {
    grid.innerHTML = `<div class="loading">No games today.</div>`;
    updateStatus('No active games');
  } else {
    todaysTeams.forEach(team => grid.appendChild(createTeamCard(team)));
    updateStatus(`${todaysTeams.length} team${todaysTeams.length > 1 ? 's' : ''} playing today`);
  }

  const allGrid = document.getElementById('allTeamsGrid');
  allGrid.innerHTML = '';
  otherTeams.forEach(team => allGrid.appendChild(createTeamCard(team)));

  updateSelectedCount();
}

function createTeamCard(team) {
  const isSelected = selectedTeams.has(team.espnId);
  const card = document.createElement('div');
  card.className = `team-card ${isSelected ? 'selected' : ''}`;
  card.dataset.id = team.espnId;

  card.innerHTML = `
    <img class="team-logo" src="${team.logo}" alt="${team.abbreviation}">
    <div class="team-abbr">${team.abbreviation}</div>
  `;

  card.addEventListener('click', () => toggleTeam(team));
  return card;
}

function toggleTeam(team) {
  if (selectedTeams.has(team.espnId)) {
    selectedTeams.delete(team.espnId);
  } else {
    selectedTeams.add(team.espnId);
  }

  document.querySelectorAll(`[data-id="${team.espnId}"]`).forEach(card => {
    card.classList.toggle('selected', selectedTeams.has(team.espnId));
  });

  saveAndSync();
  updateSelectedCount();
}

function saveAndSync() {
  chrome.storage.local.set({ selectedTeams: [...selectedTeams] }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'RESCAN' }).catch(() => {});
      }
    });
  });
}

document.getElementById('moreTeamsBtn').addEventListener('click', () => {
  const btn = document.getElementById('moreTeamsBtn');
  const section = document.getElementById('allTeamsSection');
  allTeamsExpanded = !allTeamsExpanded;
  btn.classList.toggle('open', allTeamsExpanded);
  section.classList.toggle('visible', allTeamsExpanded);
});

function showLoading(gridId, message) {
  document.getElementById(gridId).innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      ${message}
    </div>
  `;
}

function showError(message) {
  const status = document.getElementById('status');
  status.textContent = `⚠️ ${message}`;
  status.style.color = '#f97316';
}

function updateStatus(text) {
  const status = document.getElementById('status');
  status.textContent = text;
  status.style.color = '';
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

function getStorage(key) {
  return new Promise(resolve => chrome.storage.local.get(key, resolve));
}

document.getElementById('refreshBtn').addEventListener('click', () => {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  updateStatus('Syncing...');

  chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, () => {
    btn.classList.remove('spinning');
    chrome.storage.local.get(['spoilerData', 'syncError'], data => {
      if (data.syncError) {
        showError(data.syncError);
      }
      if (data.spoilerData) {
        allTeams = data.spoilerData.teams;
        todayIds = new Set(data.spoilerData.todayIds || []);
        renderTeams();
        updateLastUpdated();
      }
    });
  });
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'DATA_UPDATED') {
    chrome.storage.local.get('spoilerData', data => {
      if (data.spoilerData) {
        allTeams = data.spoilerData.teams;
        todayIds = new Set(data.spoilerData.todayIds || []);
        renderTeams();
        updateLastUpdated();
      }
    });
  }
  if (msg.type === 'SYNC_ERROR') {
    chrome.storage.local.get('syncError', data => {
      if (data.syncError) showError(data.syncError);
    });
  }
});

init();