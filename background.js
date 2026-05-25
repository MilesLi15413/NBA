import { TEAM_SUPPLEMENTS } from './keywords.js';

// Spoiler Shield v3 - Background Service Worker

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Fetch teams playing today from ESPN scoreboard
async function fetchTodaysTeams() {
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
}

// Fetch all 30 NBA teams
async function fetchAllTeams() {
  const res = await fetch(`${ESPN_BASE}/teams?limit=100`);
  const json = await res.json();
  return (json.sports?.[0]?.leagues?.[0]?.teams || []).map(t => ({
    espnId: t.team.id,
    name: t.team.name,
    displayName: t.team.displayName,
    abbreviation: t.team.abbreviation,
    logo: t.team.logos?.[0]?.href || '',
    color: t.team.color
  }));
}

// Fetch roster AND coach in one call
async function fetchRosterAndCoach(espnId) {
  const res = await fetch(`${ESPN_BASE}/teams/${espnId}/roster`);
  const json = await res.json();

  const players = (json.athletes || []).map(p => ({
    first_name: p.firstName,
    last_name: p.lastName,
    fullName: p.fullName
  }));

  const rawCoach = json.coach?.[0];
  const coach = rawCoach ? {
    fullName: `${rawCoach.firstName} ${rawCoach.lastName}`.toLowerCase(),
    lastName: rawCoach.lastName.toLowerCase()
  } : null;

  return { players, coach };
}

// Build keyword list for a team
function buildKeywords(team, players, coach) {
  const strong = new Set();
  const weak = new Set();

  strong.add(team.displayName.toLowerCase());
  strong.add(team.name.toLowerCase());
  strong.add(team.abbreviation.toLowerCase());

  players.forEach(p => {
    if (p.last_name) strong.add(p.last_name.toLowerCase());
    if (p.first_name && p.last_name) {
      strong.add(`${p.first_name} ${p.last_name}`.toLowerCase());
    }
    if (p.first_name) weak.add(p.first_name.toLowerCase());
  });

  if (coach) {
    strong.add(coach.fullName);
    strong.add(coach.lastName);
  }

  const supplement = TEAM_SUPPLEMENTS[team.espnId];
  if (supplement) {
    supplement.nicknames?.forEach(k => strong.add(k));
    supplement.players?.forEach(k => strong.add(k));
    supplement.arenas?.forEach(k => strong.add(k));
    supplement.hashtags?.forEach(k => strong.add(k));
  }

  return {
    strong: [...strong].filter(k => k.length > 3),
    weak: [...weak].filter(k => k.length > 3)
  };
}

// Main sync
async function syncData() {
  console.log('[SpoilerShield] Syncing...');

  try {
    const [todaysTeams, allTeams] = await Promise.all([
      fetchTodaysTeams(),
      fetchAllTeams()
    ]);

    if (allTeams.length === 0) {
      console.warn('[SpoilerShield] ESPN returned no teams.');
      await chrome.storage.local.set({ syncError: 'ESPN API returned no data. Using cached data.' });
      chrome.runtime.sendMessage({ type: 'SYNC_ERROR' }).catch(() => {});
      return;
    }

    const enrichedTeams = await Promise.all(
      allTeams.map(async team => {
        try {
          const { players, coach } = await fetchRosterAndCoach(team.espnId);
          const keywords = buildKeywords(team, players, coach);
          return { ...team, players, coach, keywords };
        } catch (err) {
          console.warn(`[SpoilerShield] Roster fetch failed for ${team.name}:`, err);
          // Build keywords with just team name if roster fails
          const keywords = buildKeywords(team, [], null);
          return { ...team, players: [], coach: null, keywords };
        }
      })
    );

    const todayIds = new Set(todaysTeams.map(t => t.espnId));

    const payload = {
      teams: enrichedTeams,
      todayIds: [...todayIds],
      lastUpdated: Date.now()
    };

    await chrome.storage.local.set({ spoilerData: payload, syncError: null });
    console.log(`[SpoilerShield] Synced ${enrichedTeams.length} teams, ${todayIds.size} playing today`);

    chrome.runtime.sendMessage({ type: 'DATA_UPDATED' }).catch(() => {});

  } catch (err) {
    console.error('[SpoilerShield] Sync failed:', err);
    await chrome.storage.local.set({ syncError: 'ESPN API is currently unavailable. Using cached data.' });
    chrome.runtime.sendMessage({ type: 'SYNC_ERROR' }).catch(() => {});
  }
}

// Check if cache is stale
async function maybeSync() {
  const data = await chrome.storage.local.get('spoilerData');
  const cached = data.spoilerData;
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
    chrome.storage.local.get('spoilerData').then(data => {
      sendResponse(data.spoilerData || null);
    });
    return true;
  }
});