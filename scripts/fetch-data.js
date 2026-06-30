'use strict';
// ══════════════════════════════════════════════
//  fetch-data.js
//  Runs via GitHub Actions every hour.
//  Pulls real World Cup 2026 data from openfootball
//  (public domain, no API key required):
//  https://github.com/openfootball/worldcup.json
// ══════════════════════════════════════════════

const https = require('https');
const fs    = require('fs');

const SOURCE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// ── helper: make an HTTPS GET request ─────────
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── helper: build a 3-letter code from a team name ─
function teamCode(name) {
  const KNOWN = {
    'Argentina':'ARG','Brazil':'BRA','France':'FRA','England':'ENG',
    'Spain':'ESP','Germany':'GER','Portugal':'POR','Netherlands':'NED',
    'Belgium':'BEL','Colombia':'COL','Mexico':'MEX','USA':'USA',
    'Morocco':'MAR','Norway':'NOR','Croatia':'CRO','Switzerland':'SUI',
    'Austria':'AUT','Japan':'JPN','Senegal':'SEN','Ivory Coast':'CIV',
    'Uruguay':'URU','Ghana':'GHA','Australia':'AUS','South Korea':'KOR',
    'Egypt':'EGY','IR Iran':'IRN','Iran':'IRN','Bosnia & Herz.':'BIH',
    'Bosnia and Herzegovina':'BIH','Sweden':'SWE','Ecuador':'ECU',
    'Paraguay':'PAR','Congo DR':'COD','DR Congo':'COD','Cape Verde':'CPV',
    'Saudi Arabia':'KSA','New Zealand':'NZL','Panama':'PAN','Jordan':'JOR',
    'Algeria':'DZA','South Africa':'RSA','Canada':'CAN','Qatar':'QAT',
    'Scotland':'SCO','Haiti':'HTI','Turkiye':'TUR','Turkey':'TUR',
    'Curacao':'CUW','Tunisia':'TUN','Uzbekistan':'UZB','Czech Republic':'CZE',
    'Czechia':'CZE','Iraq':'IRQ',
  };
  if (KNOWN[name]) return KNOWN[name];
  return name.substring(0, 3).toUpperCase();
}

// ── main ───────────────────────────────────────
async function main() {
  console.log('📡  Fetching World Cup 2026 data from openfootball...');

  try {
    const source = await get(SOURCE_URL);
    const rawMatches = source.matches || [];

    console.log(`Source returned ${rawMatches.length} matches`);

    // Map to our app format
    const matches = rawMatches
      // Skip placeholder knockout matches like "W101" vs "W102" (winner TBD)
      .filter(m => !/^W\d+$/.test(m.team1) && !/^W\d+$/.test(m.team2))
      .map((m, i) => {
        const isDone = !!(m.score && m.score.ft);
        const hs = isDone ? m.score.ft[0] : 0;
        const as = isDone ? m.score.ft[1] : 0;

        const mapGoals = (goalsArr, teamCode_) =>
          (goalsArr || []).map(g => ({
            min:    g.minute,
            scorer: g.name,
            team:   teamCode_,
            penalty: !!g.penalty,
          }));

        const hCode = teamCode(m.team1);
        const aCode = teamCode(m.team2);

        return {
          id:    i,
          d:     m.date,
          t:     (m.time || '').split(' ')[0],   // strip UTC offset, keep HH:MM
          h:     hCode,
          hName: m.team1,
          a:     aCode,
          aName: m.team2,
          hs, as,
          s:     isDone ? 'done' : 'upcoming',
          g:     m.group ? m.group.replace('Group ', '') : (m.round || ''),
          round: m.round,
          ground: m.ground,
          goals: [
            ...mapGoals(m.goals1, hCode),
            ...mapGoals(m.goals2, aCode),
          ],
        };
      });

    // ── write data.json ────────────────────────
    const output = {
      updatedAt: new Date().toISOString(),
      source: 'openfootball/worldcup.json (public domain, updated ~daily)',
      matches,
    };

    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
    console.log(`✅  data.json updated — ${matches.length} matches`);

  } catch (err) {
    console.error('❌  Error fetching data:', err.message);
    process.exit(1);
  }
}

main();