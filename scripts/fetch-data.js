// ══════════════════════════════════════════════
//  fetch-data.js
//  Runs via GitHub Actions every hour.
//  Calls API-Football, generates data.json
//  API key is stored in GitHub Secrets — never in code.
// ══════════════════════════════════════════════

const https = require('https');
const fs    = require('fs');

const API_KEY    = process.env.FOOTBALL_API_KEY;
const BASE_URL   = 'v3.football.api-sports.io';
const LEAGUE     = 1;      // FIFA World Cup
const SEASON     = 2026;

// ── helper: make an HTTPS GET request ─────────
function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path,
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY },
    };
    https.get(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── main ───────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error('❌  FOOTBALL_API_KEY not set');
    process.exit(1);
  }

  console.log('📡  Fetching World Cup 2026 data...');

  try {
    // 1. All fixtures (results + upcoming)
    const fixturesRes = await get(
      `/fixtures?league=${LEAGUE}&season=${SEASON}`
    );

    // 2. Standings (group tables)
    const standingsRes = await get(
      `/standings?league=${LEAGUE}&season=${SEASON}`
    );

    // 3. Top scorers
    const scorersRes = await get(
      `/players/topscorers?league=${LEAGUE}&season=${SEASON}`
    );

    // ── build the data object ──────────────────
    const fixtures  = fixturesRes.response  || [];
    const standings = standingsRes.response || [];
    const scorers   = scorersRes.response   || [];

    // Map fixtures to our app format
    const matches = fixtures.map(f => {
      const isLive = ['1H','HT','2H','ET','P','BT'].includes(
        f.fixture.status.short
      );
      const isDone = f.fixture.status.short === 'FT' ||
                     f.fixture.status.short === 'AET'||
                     f.fixture.status.short === 'PEN';
      const status = isDone ? 'done' : isLive ? 'live' : 'upcoming';

      return {
        id:      f.fixture.id,
        d:       f.fixture.date.slice(0, 10),          // YYYY-MM-DD
        t:       f.fixture.date.slice(11, 16),         // HH:MM (UTC)
        h:       f.teams.home.name,
        hCode:   f.teams.home.name.substring(0, 3).toUpperCase(),
        hLogo:   f.teams.home.logo,
        a:       f.teams.away.name,
        aCode:   f.teams.away.name.substring(0, 3).toUpperCase(),
        aLogo:   f.teams.away.logo,
        hs:      f.goals.home  ?? 0,
        as:      f.goals.away  ?? 0,
        s:       status,
        g:       f.league.round,                       // e.g. "Group Stage - 1"
        elapsed: f.fixture.status.elapsed ?? null,
        // goals events
        goals: (f.events || [])
          .filter(e => e.type === 'Goal')
          .map(e => ({
            min:    e.time.elapsed + (e.time.extra ? `+${e.time.extra}` : ''),
            scorer: e.player.name,
            team:   e.team.name,
            type:   e.detail,                          // "Normal Goal", "Own Goal", "Penalty"
          })),
      };
    });

    // Map standings
    const groups = {};
    if (standings.length && standings[0].league?.standings) {
      standings[0].league.standings.forEach(group => {
        group.forEach(row => {
          const g = row.group; // "Group A", etc.
          if (!groups[g]) groups[g] = [];
          groups[g].push({
            c:   row.team.name.substring(0, 3).toUpperCase(),
            n:   row.team.name,
            logo:row.team.logo,
            p:   row.all.played,
            w:   row.all.win,
            d:   row.all.draw,
            l:   row.all.lose,
            gf:  row.all.goals.for,
            ga:  row.all.goals.against,
            gd:  row.goalsDiff,
            pts: row.points,
          });
        });
      });
    }

    // Top 10 scorers
    const topScorers = scorers.slice(0, 10).map(s => ({
      name:  s.player.name,
      team:  s.statistics[0]?.team?.name || '',
      goals: s.statistics[0]?.goals?.total || 0,
    }));

    // ── write data.json ────────────────────────
    const output = {
      updatedAt: new Date().toISOString(),
      matches,
      groups,
      topScorers,
    };

    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
    console.log(`✅  data.json updated — ${matches.length} matches, ${Object.keys(groups).length} groups`);

  } catch (err) {
    console.error('❌  Error fetching data:', err.message);
    process.exit(1);
  }
}

main();

const fixturesRes = await get(
  `/fixtures?league=${LEAGUE}&season=${SEASON}`
);
console.log('Fixtures response:', JSON.stringify(fixturesRes).slice(0, 500));