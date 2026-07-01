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
    'Bosnia & Herzegovina':'BIH','Bosnia and Herzegovina':'BIH','Sweden':'SWE','Ecuador':'ECU',
    'Paraguay':'PAR','Congo DR':'COD','DR Congo':'COD','Cape Verde':'CPV',
    'Saudi Arabia':'KSA','New Zealand':'NZL','Panama':'PAN','Jordan':'JOR',
    'Algeria':'DZA','South Africa':'RSA','Canada':'CAN','Qatar':'QAT',
    'Scotland':'SCO','Haiti':'HTI','Turkiye':'TUR','Turkey':'TUR',
    'Curacao':'CUW','Curaçao':'CUW','Tunisia':'TUN','Uzbekistan':'UZB','Czech Republic':'CZE',
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

    // A team field is a placeholder (not yet decided) if it matches
    // "W74" (winner of match 74), "L101" (loser of match 101),
    // "2A" (runner-up Group A), or "3A/B/C/D/F" (best 3rd place)
    const isPlaceholder = name => /^[WL]\d+$/.test(name) || /^[123][A-L](\/[A-L])*$/.test(name);

    // For a placeholder like "W74", extract the source match number (74)
    // so the bracket can later resolve "who won match 74" once known
    function bracketSource(name) {
      const m = /^W(\d+)$/.exec(name);
      return m ? Number(m[1]) : null;
    }

    // Map to our app format — keeps ALL matches, including future
    // knockout rounds whose teams aren't decided yet (h/a become null,
    // with bracketRef pointing at the feeding match number so the
    // bracket UI can resolve them once earlier rounds are played)
    const matches = rawMatches.map((m, i) => {
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

        const hIsTBD = isPlaceholder(m.team1);
        const aIsTBD = isPlaceholder(m.team2);
        const hCode = hIsTBD ? null : teamCode(m.team1);
        const aCode = aIsTBD ? null : teamCode(m.team2);

        // Normalize the round label: group stage matches get the
        // group letter (e.g. "A"), knockout rounds get a short code
        const ROUND_CODES = {
          'Round of 32': 'R32',
          'Round of 16': 'R16',
          'Quarter-final': 'QF',
          'Semi-final': 'SF',
          'Match for third place': 'P3',
          'Final': 'FINAL',
        };
        let groupCode;
        if (m.group) {
          groupCode = m.group.replace('Group ', '');
        } else {
          groupCode = ROUND_CODES[m.round] || m.round || '';
        }

        return {
          id:    i,
          num:   m.num ?? null,
          d:     m.date,
          t:     (m.time || '').split(' ')[0],   // strip UTC offset, keep HH:MM
          h:     hCode,
          hName: hIsTBD ? null : m.team1,
          hRef:  hIsTBD ? bracketSource(m.team1) : null,
          a:     aCode,
          aName: aIsTBD ? null : m.team2,
          aRef:  aIsTBD ? bracketSource(m.team2) : null,
          hs, as,
          s:     isDone ? 'done' : 'upcoming',
          g:     groupCode,
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
