import { TEAM_SUPPLEMENTS } from './keywords.js';
// Spoiler Shield v3 - Background Service Worker

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Fetch current playoff teams from ESPN scoreboard
async function fetchPlayoffTeams() {
  try {
    const res = await fetch(`${ESPN_BASE}/scoreboard?limit=100`);
    const json = await res.json();

    const teams = new Map();

    const events = json.events || [];
    events.forEach(event => {
      event.competitions[0].competitors.forEach(competitor => {
        const team = competitor.team;
        teams.set(team.id, {
          espnId: team.id,
          name: team.name,
          displayName: team.displayName,
          abbreviation: team.abbreviation,
          logo: team.logo,
          color: team.color
        });
      });
    });

    return [...teams.values()];
  } catch (err) {
    console.error('[SpoilerShield] ESPN scoreboard fetch failed:', err);
    return [];
  }
}

// Fetch roster AND coach in one call
async function fetchRosterAndCoach(espnId) {
  try {
    const res = await fetch(`${ESPN_BASE}/teams/${espnId}/roster`);
    const json = await res.json();

    const players = (json.athletes || []).map(p => {
      return {
        first_name: p.firstName,
        last_name: p.lastName,
        fullName: p.fullName
      };
    });

    const rawCoach = json.coach?.[0];
    const coach = rawCoach ? {
      fullName: `${rawCoach.firstName} ${rawCoach.lastName}`.toLowerCase(),
      lastName: rawCoach.lastName.toLowerCase()
    } : null;

    return { players, coach };
  } catch (err) {
    console.error('[SpoilerShield] ESPN roster fetch failed:', err);
    return { players: [], coach: null };
  }
}

// Build keyword list for a team
function buildKeywords(team, players, coach) {
  const keywords = new Set();

  // Team names from API
  keywords.add(team.displayName.toLowerCase());
  keywords.add(team.name.toLowerCase());
  keywords.add(team.abbreviation.toLowerCase());

  // Players from ESPN roster
  players.forEach(p => {
    if (p.first_name) keywords.add(p.first_name.toLowerCase());
    if (p.last_name) keywords.add(p.last_name.toLowerCase());
    if (p.first_name && p.last_name) {
      keywords.add(`${p.first_name} ${p.last_name}`.toLowerCase());
    }
  });

  // Coach
  if (coach) {
    keywords.add(coach.fullName);
    keywords.add(coach.lastName);
  }

  // Static supplements from keywords.js
  const supplement = TEAM_SUPPLEMENTS[team.espnId];
  if (supplement) {
    supplement.nicknames?.forEach(k => keywords.add(k));
    supplement.players?.forEach(k => keywords.add(k));
    supplement.arenas?.forEach(k => keywords.add(k));
    supplement.hashtags?.forEach(k => keywords.add(k));
  }

  return [...keywords].filter(k => k.length > 3);
}

// Main sync
async function syncData() {
  console.log('[SpoilerShield] Syncing...');

  const playoffTeams = await fetchPlayoffTeams();

  if (playoffTeams.length === 0) {
    console.log('[SpoilerShield] No active games found.');
    return;
  }

  // One fetch per team (roster + coach combined)
  const enrichedTeams = await Promise.all(
    playoffTeams.map(async team => {
      const { players, coach } = await fetchRosterAndCoach(team.espnId);
      const keywords = buildKeywords(team, players, coach);
      return { ...team, players, coach, keywords };
    })
  );

  const payload = {
    teams: enrichedTeams,
    lastUpdated: Date.now()
  };

  await chrome.storage.local.set({ playoffData: payload });
  console.log(`[SpoilerShield] Synced ${enrichedTeams.length} teams`);

  chrome.runtime.sendMessage({ type: 'DATA_UPDATED' }).catch(() => {});
}

// Check if cache is stale
async function maybeSync() {
  const data = await chrome.storage.local.get('playoffData');
  const cached = data.playoffData;
  const isStale = !cached || (Date.now() - cached.lastUpdated) > CACHE_TTL;
  if (isStale) await syncData();
}

// Daily refresh alarm
chrome.alarms.create('dailySync', { periodInMinutes: 60 * 24 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'dailySync') syncData();
});

// On install and browser startup
chrome.runtime.onInstalled.addListener(() => syncData());
chrome.runtime.onStartup.addListener(() => maybeSync());

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FORCE_SYNC') {
    syncData().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'GET_DATA') {
    chrome.storage.local.get('playoffData').then(data => {
      sendResponse(data.playoffData || null);
    });
    return true;
  }
});