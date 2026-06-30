// ══════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════

const TABS = ['matches', 'groups', 'search', 'champ', 'knockout'];

function goTab(tab) {
  TABS.forEach(t => {
    const panel = document.getElementById(`panel-${t}`);
    if (panel) panel.classList.toggle('active', t === tab);
  });
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  const titles = {
    matches:  'Matches',
    groups:   'Group Standings',
    search:   'Search',
    champ:    'Champion 🏆',
    knockout: 'Round of 32',
  };
  document.getElementById('page-title').textContent = titles[tab] || tab;
}

document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => goTab(btn.dataset.tab));
});

// ══════════════════════════════════════════════
//  COUNTDOWN
// ══════════════════════════════════════════════

const FINAL_DATE = new Date('2026-07-19T20:00:00-03:00');

function updateCountdown() {
  const diff = FINAL_DATE - new Date();
  if (diff <= 0) {
    document.getElementById('countdown').textContent = '🏆 Final is today!';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  document.getElementById('countdown').textContent =
    `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ══════════════════════════════════════════════
//  TOOLTIP
// ══════════════════════════════════════════════

let tipTimer;
function showTip(event, countryName) {
  const tip = document.getElementById('tooltip');
  tip.textContent = countryName;
  tip.style.display = 'block';
  tip.style.left = (event.clientX - 30) + 'px';
  tip.style.top  = (event.clientY - 44) + 'px';
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => tip.style.display = 'none', 1800);
}

// ══════════════════════════════════════════════
//  TEAMS
// ══════════════════════════════════════════════

const TEAMS = {
  ARG:{n:'Argentina',     f:'ar'}, BRA:{n:'Brazil',          f:'br'},
  FRA:{n:'France',        f:'fr'}, ENG:{n:'England',         f:'gb-eng'},
  ESP:{n:'Spain',         f:'es'}, GER:{n:'Germany',         f:'de'},
  POR:{n:'Portugal',      f:'pt'}, NED:{n:'Netherlands',     f:'nl'},
  BEL:{n:'Belgium',       f:'be'}, COL:{n:'Colombia',        f:'co'},
  MEX:{n:'Mexico',        f:'mx'}, USA:{n:'USA',             f:'us'},
  MAR:{n:'Morocco',       f:'ma'}, NOR:{n:'Norway',          f:'no'},
  CRO:{n:'Croatia',       f:'hr'}, SUI:{n:'Switzerland',     f:'ch'},
  AUT:{n:'Austria',       f:'at'}, JPN:{n:'Japan',           f:'jp'},
  SEN:{n:'Senegal',       f:'sn'}, CIV:{n:'Ivory Coast',     f:'ci'},
  URU:{n:'Uruguay',       f:'uy'}, GHA:{n:'Ghana',           f:'gh'},
  AUS:{n:'Australia',     f:'au'}, KOR:{n:'South Korea',     f:'kr'},
  EGY:{n:'Egypt',         f:'eg'}, IRN:{n:'IR Iran',         f:'ir'},
  BIH:{n:'Bosnia & Herz.',f:'ba'}, SWE:{n:'Sweden',          f:'se'},
  ECU:{n:'Ecuador',       f:'ec'}, PAR:{n:'Paraguay',        f:'py'},
  COD:{n:'Congo DR',      f:'cd'}, CPV:{n:'Cape Verde',      f:'cv'},
  KSA:{n:'Saudi Arabia',  f:'sa'}, NZL:{n:'New Zealand',     f:'nz'},
  PAN:{n:'Panama',        f:'pa'}, JOR:{n:'Jordan',          f:'jo'},
  DZA:{n:'Algeria',       f:'dz'}, RSA:{n:'South Africa',    f:'za'},
  CAN:{n:'Canada',        f:'ca'}, QAT:{n:'Qatar',           f:'qa'},
  SCO:{n:'Scotland',      f:'gb-sct'}, HTI:{n:'Haiti',       f:'ht'},
  TUR:{n:'Turkiye',       f:'tr'}, CUW:{n:'Curacao',         f:'cw'},
  TUN:{n:'Tunisia',       f:'tn'}, UZB:{n:'Uzbekistan',      f:'uz'},
  CZE:{n:'Czechia',       f:'cz'}, IRQ:{n:'Iraq',            f:'iq'},
};

// ══════════════════════════════════════════════
//  DATA LOADING — fetch real data from data.json
//  Generated automatically every hour by GitHub
//  Actions from openfootball/worldcup.json
// ══════════════════════════════════════════════

let MATCHES = [];
let STANDINGS = {};

// ── helper: convert data.json match → app match format ──
function normalizeMatch(m, idx) {
  return {
    d:  m.d,
    t:  m.t,
    h:  m.h,
    a:  m.a,
    hs: m.hs,
    as: m.as,
    s:  m.s,
    g:  m.g,
    // upcoming win-probability bars aren't in data.json yet —
    // omitted until a future data source provides them
    goals: m.goals || [],
  };
}

function buildStandingsFromMatches(matches) {
  const table = {};
  matches
    .filter(m => m.s === 'done' && m.g && m.g !== 'R32' && m.g.length === 1)
    .forEach(m => {
      if (!table[m.g]) table[m.g] = {};
      [m.h, m.a].forEach(code => {
        if (!table[m.g][code])
          table[m.g][code] = { c:code, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
      });
      const home = table[m.g][m.h];
      const away = table[m.g][m.a];
      home.p++; away.p++;
      home.gf += m.hs; home.ga += m.as;
      away.gf += m.as; away.ga += m.hs;
      if      (m.hs > m.as) { home.w++; home.pts += 3; away.l++; }
      else if (m.hs < m.as) { away.w++; away.pts += 3; home.l++; }
      else                  { home.d++; away.d++; home.pts++; away.pts++; }
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    });
  const sorted = {};
  Object.entries(table).forEach(([g, teams]) => {
    sorted[g] = Object.values(teams).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.c.localeCompare(b.c)
    );
  });
  return sorted;
}

// ── show a simple loading state in the matches list ──
function showLoadingState() {
  const el = document.getElementById('matches-list');
  if (el) {
    el.innerHTML = `
      <div style="text-align:center;padding:50px 20px;color:#444">
        <div class="floating" style="font-size:30px;margin-bottom:10px">⚽</div>
        <p style="font-size:13px;font-weight:600;letter-spacing:1px">Loading matches...</p>
      </div>`;
  }
}

function showErrorState(message) {
  const el = document.getElementById('matches-list');
  if (el) {
    el.innerHTML = `
      <div style="text-align:center;padding:50px 20px;color:#444">
        <p style="font-size:13px;font-weight:600">⚠️ ${message}</p>
        <p style="font-size:11px;margin-top:6px;color:#333">Try refreshing the page.</p>
      </div>`;
  }
}

// ── fetch data.json and initialize the whole app ──
async function loadData() {
  showLoadingState();
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    MATCHES   = (data.matches || []).map(normalizeMatch);
    STANDINGS = buildStandingsFromMatches(MATCHES);

    initApp();
  } catch (err) {
    console.error('Failed to load data.json:', err);
    showErrorState('Could not load match data.');
  }
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════

function flagImg(code, sm = false) {
  const t = TEAMS[code];
  if (!t) return `<span style="font-size:9px;color:#666">${code}</span>`;
  const cls = sm ? 'flag-sm' : 'flag-img';
  return `<img class="${cls}" src="https://flagcdn.com/w80/${t.f}.png" alt="${t.n}" onclick="showTip(event,'${t.n}')" onerror="this.style.display='none'">`;
}

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
function fmtDate(d) {
  const [y, m, dd] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, dd);
  return `${DAYS[dt.getDay()]} ${MONTHS[m-1]} ${dd}`;
}

// ══════════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════════

function openMatchModal(m) {
  const upcoming = m.s === 'upcoming';
  const homeWon  = !upcoming && m.hs > m.as;
  const awayWon  = !upcoming && m.as > m.hs;

  const scoreHTML = upcoming
    ? `<span class="vs">vs</span>`
    : `<span class="${homeWon?'w':'l'}">${m.hs}</span>
       <span class="sep"> — </span>
       <span class="${awayWon?'w':'l'}">${m.as}</span>`;

  // Goals — straight from data.json, sorted by minute
  let goalsHTML = '';
  if (m.goals?.length) {
    const sorted = [...m.goals].sort((a, b) => parseInt(a.min) - parseInt(b.min));
    goalsHTML = `<div class="modal-section">⚽ Goals</div>`;
    sorted.forEach(g => {
      const penaltyTag = g.penalty ? ' <span style="color:#444">(P)</span>' : '';
      goalsHTML += `
        <div class="goal-event">
          <span class="minute">${g.min}'</span>
          <span class="scorer">${g.scorer}${penaltyTag}</span>
          <span class="team-tag">${g.team}</span>
        </div>`;
    });
  } else if (!upcoming) {
    goalsHTML = `<div class="modal-section">⚽ Goals</div>
      <p style="font-size:12px;color:#444;padding:8px 0">
        No goals scored, or data not available yet.
      </p>`;
  }

  // Probability bar — not in data.json, so this section is
  // simply omitted for upcoming matches for now
  const overlay = document.getElementById('match-modal');
  overlay.querySelector('.modal-body').innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-teams">
      <div class="modal-team">
        <img src="https://flagcdn.com/w80/${TEAMS[m.h]?.f}.png" alt="${m.h}">
        <span class="modal-team-name">${TEAMS[m.h]?.n || m.h}</span>
      </div>
      <div class="modal-score">${scoreHTML}</div>
      <div class="modal-team">
        <img src="https://flagcdn.com/w80/${TEAMS[m.a]?.f}.png" alt="${m.a}">
        <span class="modal-team-name">${TEAMS[m.a]?.n || m.a}</span>
      </div>
    </div>
    <div class="modal-meta">${fmtDate(m.d)} · ${m.t}hs · ${m.g === 'R32' ? 'Round of 32' : 'Group ' + m.g}</div>
    ${goalsHTML}
  `;
  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('match-modal').classList.remove('open');
}

// ══════════════════════════════════════════════
//  RENDER — MATCHES
// ══════════════════════════════════════════════

function buildMatches() {
  const r32done     = MATCHES.filter(m => m.s === 'done'     && m.g === 'R32');
  const r32upcoming = MATCHES.filter(m => m.s === 'upcoming' && m.g === 'R32');
  const groupDone   = MATCHES.filter(m => m.s === 'done'     && m.g !== 'R32');

  let html = '';

  if (r32done.length) {
    html += `<div class="section-label">Round of 32 · Results</div>`;
    r32done.forEach(m => html += matchCard(m));
  }

  if (r32upcoming.length) {
    const upDates = [...new Set(r32upcoming.map(m => m.d))].sort();
    upDates.forEach(date => {
      html += `<div class="section-label">Round of 32 · ${fmtDate(date)}</div>`;
      r32upcoming.filter(m => m.d === date).forEach(m => html += matchCard(m));
    });
  }

  // Group stage results — last 4 days
  const doneDates = [...new Set(groupDone.map(m => m.d))].sort().reverse().slice(0, 4);
  doneDates.forEach(date => {
    html += `<div class="section-label">Group Stage · ${fmtDate(date)}</div>`;
    groupDone.filter(m => m.d === date).forEach(m => html += matchCard(m));
  });

  if (!html) {
    html = `<div style="text-align:center;padding:40px 20px;color:#444">
      <p style="font-size:13px">No matches available yet.</p>
    </div>`;
  }

  document.getElementById('matches-list').innerHTML = html;
}

function matchCard(m) {
  const upcoming = m.s === 'upcoming';
  const homeWon  = !upcoming && m.hs > m.as;
  const awayWon  = !upcoming && m.as > m.hs;

  const scoreHTML = upcoming
    ? `<div class="score-center"><span class="score-vs">vs</span></div>`
    : `<div class="score-center">
        <span class="score-num ${homeWon?'score-win':'score-lose'}">${m.hs}</span>
        <span class="score-sep">—</span>
        <span class="score-num ${awayWon?'score-win':'score-lose'}">${m.as}</span>
       </div>`;

  const winnerTag = (!upcoming && m.hs !== m.as)
    ? `<div class="winner-tag">✓ ${homeWon ? (TEAMS[m.h]?.n || m.h) : (TEAMS[m.a]?.n || m.a)} won</div>`
    : '';

  const label = m.g === 'R32' ? 'Round of 32' : `Group ${m.g}`;

  return `
    <div class="match-card" onclick='openMatchModal(MATCHES.find(x=>x.h==="${m.h}"&&x.a==="${m.a}"&&x.d==="${m.d}"))' style="cursor:pointer">
      <div class="card-stripe stripe-${m.s}"></div>
      <div class="card-body">
        <div class="card-meta">${fmtDate(m.d)} · ${m.t}hs · ${label}</div>
        <div class="match-row">
          <div class="team-side">
            ${flagImg(m.h)}
            <span class="team-abbr">${m.h}</span>
          </div>
          ${scoreHTML}
          <div class="team-side right">
            <span class="team-abbr">${m.a}</span>
            ${flagImg(m.a)}
          </div>
        </div>
        ${winnerTag}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
//  RENDER — GROUPS
// ══════════════════════════════════════════════

function buildGroups() {
  let html = '';
  Object.entries(STANDINGS).forEach(([grp, teams]) => {
    html += `
      <div class="group-card">
        <div class="group-header">GROUP ${grp}</div>
        <table class="group-table">
          <thead><tr>
            <th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
            <th>GF</th><th>GA</th><th>GD</th><th>PTS</th>
          </tr></thead>
          <tbody>`;

    teams.forEach((t, i) => {
      const badge = i === 0
        ? `<span class="q-badge">1st</span>`
        : i === 1 ? `<span class="q-badge">2nd</span>` : '';
      const gd = t.gd > 0 ? `+${t.gd}` : `${t.gd}`;
      html += `
        <tr class="${i < 2 ? 'qualified' : 'eliminated'}">
          <td><div class="team-cell">
            ${flagImg(t.c, true)}
            <span>${t.c}</span>
            ${badge}
          </div></td>
          <td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
          <td>${t.gf}</td><td>${t.ga}</td><td>${gd}</td>
          <td class="pts-cell">${t.pts}</td>
        </tr>`;
    });

    html += `</tbody></table>
      <div class="qualified-note">✓ Top 2 advance to Round of 32</div>
    </div>`;
  });

  if (!html) {
    html = `<div style="text-align:center;padding:40px 20px;color:#444">
      <p style="font-size:13px">Group standings not available yet.</p>
    </div>`;
  }

  document.getElementById('groups-list').innerHTML = html;
}

// ══════════════════════════════════════════════
//  RENDER — SEARCH
// ══════════════════════════════════════════════

document.getElementById('search-input')
  .addEventListener('input', e => renderSearch(e.target.value));

function renderSearch(q) {
  const el = document.getElementById('search-result');
  if (!q.trim()) {
    el.innerHTML = `<div class="search-empty"><p>Type a team name or code<br><span style="color:#555">Argentina · BRA · France · ENG</span></p></div>`;
    return;
  }
  const code = Object.keys(TEAMS).find(k =>
    k.toLowerCase() === q.toLowerCase() ||
    TEAMS[k].n.toLowerCase().includes(q.toLowerCase())
  );
  if (!code) {
    el.innerHTML = `<div class="search-empty"><p>No results for "<strong>${q}</strong>"</p></div>`;
    return;
  }

  const played = MATCHES.filter(m => (m.h===code||m.a===code) && m.s==='done');
  const wins   = played.filter(m => (m.h===code&&m.hs>m.as)||(m.a===code&&m.as>m.hs)).length;
  const draws  = played.filter(m => m.hs===m.as).length;
  const gf     = played.reduce((acc,m) => acc+(m.h===code?m.hs:m.as), 0);
  const gc     = played.reduce((acc,m) => acc+(m.h===code?m.as:m.hs), 0);

  let grpName = '', pts = wins*3+draws;
  Object.entries(STANDINGS).forEach(([g,arr]) => {
    const found = arr.find(x => x.c===code);
    if (found) { grpName=g; pts=found.pts; }
  });

  const next = MATCHES.find(m => (m.h===code||m.a===code) && m.s==='upcoming');
  const nextHTML = next ? (() => {
    const opp = next.h===code ? next.a : next.h;
    return `<div class="next-box">${flagImg(opp,true)}<span class="next-opp">${TEAMS[opp]?.n||opp}</span><span class="next-time">${fmtDate(next.d)} · ${next.t}</span></div>`;
  })() : '';

  const recentHTML = played.slice(-4).reverse().map(m => {
    const ih=m.h===code, opp=ih?m.a:m.h;
    const ms=ih?m.hs:m.as, os=ih?m.as:m.hs;
    const r=ms>os?'W':ms<os?'L':'D';
    const bg=r==='W'?'var(--orange)':r==='D'?'#444':'#8b2222';
    return `<div class="recent-row">
      <div class="res-badge" style="background:${bg}">${r}</div>
      ${flagImg(opp,true)}
      <span class="res-opp">${opp}</span>
      <span class="res-score">${ms}–${os}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="sres-card">
      <div class="sres-header">
        ${flagImg(code)}
        <span class="sres-name">${TEAMS[code].n}</span>
        ${grpName ? `<span class="sres-group">GR.${grpName}</span>` : ''}
      </div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-val white">${pts}</div><div class="stat-lbl">POINTS</div></div>
        <div class="stat-box"><div class="stat-val">${wins}</div><div class="stat-lbl">WINS</div></div>
        <div class="stat-box"><div class="stat-val">${gf}</div><div class="stat-lbl">GOALS</div></div>
        <div class="stat-box"><div class="stat-val white">${played.length}</div><div class="stat-lbl">PLAYED</div></div>
        <div class="stat-box"><div class="stat-val">${draws}</div><div class="stat-lbl">DRAWS</div></div>
        <div class="stat-box"><div class="stat-val">${gc}</div><div class="stat-lbl">AGAINST</div></div>
      </div>
      ${next ? `<div class="recent-label">NEXT MATCH</div>${nextHTML}` : ''}
      ${recentHTML ? `<div class="recent-label" style="margin-top:10px">LAST RESULTS</div>${recentHTML}` : ''}
    </div>`;
}

// ══════════════════════════════════════════════
//  RENDER — KNOCKOUT (Round of 32)
// ══════════════════════════════════════════════

function buildKnockout() {
  const el = document.getElementById('panel-knockout');
  if (!el) return;

  const r32 = MATCHES.filter(m => m.g === 'R32');
  const done = r32.filter(m => m.s === 'done');
  const upcoming = r32.filter(m => m.s === 'upcoming');

  let html = `
    <div style="background:#1c1200;border-radius:12px;padding:12px 16px;margin-bottom:14px;border-left:4px solid var(--orange)">
      <p style="font-size:10px;font-weight:700;color:var(--orange);letter-spacing:2px;margin-bottom:4px">KNOCKOUT STAGE</p>
      <p style="font-size:13px;color:#888">Round of 32 · ${r32.length} matches</p>
    </div>`;

  if (done.length) {
    html += `<div class="section-label">Results</div>`;
    done.forEach(m => html += matchCard(m));
  }

  if (upcoming.length) {
    const upDates = [...new Set(upcoming.map(m => m.d))].sort();
    upDates.forEach(date => {
      html += `<div class="section-label">Upcoming · ${fmtDate(date)}</div>`;
      upcoming.filter(m => m.d === date).forEach(m => html += matchCard(m));
    });
  }

  if (!done.length && !upcoming.length) {
    html += `<div style="text-align:center;padding:30px 20px;color:#444">
      <p style="font-size:13px">Bracket not yet defined — waiting for group stage to finish.</p>
    </div>`;
  }

  html += `
    <div style="background:var(--card);border-radius:14px;padding:20px;text-align:center;margin-top:16px">
      <div style="font-size:28px;margin-bottom:8px">🏆</div>
      <p style="font-size:11px;font-weight:700;color:var(--orange);letter-spacing:2px;margin-bottom:6px">COMING SOON</p>
      <p style="font-size:12px;color:#444;line-height:1.7">
        Round of 16 · Quarter-finals<br>
        Semi-finals · Final<br>
        <span style="color:#333">Jul 4 → Jul 19</span>
      </p>
    </div>`;

  el.innerHTML = html;
}

// ══════════════════════════════════════════════
//  RENDER — CHAMPION
// ══════════════════════════════════════════════

function buildChamp() {
  // Change null to team code when confirmed — e.g. 'ARG'
  const WINNER = null;
  const el = document.getElementById('champ-content');

  if (!WINNER) {
    el.innerHTML = `
      <div style="text-align:center;padding:24px 20px 30px">
        <div class="section-label" style="text-align:center;margin-bottom:16px">WORLD CHAMPION</div>
        <div class="floating" style="margin-bottom:12px">
          <svg width="120" height="190" viewBox="0 0 120 190" fill="none">
            <circle cx="60" cy="34" r="20" fill="#2a2a2e"/>
            <path d="M28 82 Q28 64 60 64 Q92 64 92 82 L97 135 H23 Z" fill="#2a2a2e"/>
            <path d="M28 82 Q14 68 8 50 Q6 43 12 42 Q18 41 22 50 Q28 66 36 76 Z" fill="#2a2a2e"/>
            <path d="M92 82 Q106 68 112 50 Q114 43 108 42 Q102 41 98 50 Q92 66 84 76 Z" fill="#2a2a2e"/>
            <path d="M42 135 L36 178 Q34 185 42 186 Q50 187 52 180 L57 148 Z" fill="#2a2a2e"/>
            <path d="M78 135 L84 178 Q86 185 78 186 Q70 187 68 180 L63 148 Z" fill="#2a2a2e"/>
            <text x="60" y="108" text-anchor="middle" font-size="26" font-weight="900" fill="#FF6B1A">?</text>
          </svg>
        </div>
        <p style="font-size:13px;color:#555;margin-bottom:20px;line-height:1.6">
          The final is on <strong style="color:#888">July 19</strong>.<br>
          The champion hasn't been crowned yet.
        </p>
        <div class="countdown-banner" style="margin:0">
          <div>
            <p class="cd-label">TIME TO THE FINAL</p>
            <p class="cd-time" id="cd-champ">--</p>
          </div>
          <span class="cd-trophy">🏆</span>
        </div>
        <div style="margin-top:24px;font-size:22px;letter-spacing:6px">🏆 ⚽ 🌍</div>
      </div>`;

    function syncChamp() {
      const el2 = document.getElementById('cd-champ');
      if (!el2) return;
      const diff = FINAL_DATE - new Date();
      if (diff <= 0) { el2.textContent = "It's today! 🎉"; return; }
      const d=Math.floor(diff/86400000);
      const h=Math.floor((diff%86400000)/3600000);
      const m=Math.floor((diff%3600000)/60000);
      const s=Math.floor((diff%60000)/1000);
      el2.textContent=`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    }
    syncChamp();
    setInterval(syncChamp, 1000);

  } else {
    const t = TEAMS[WINNER] || { n:WINNER, f:'un' };
    el.innerHTML = `
      <div style="text-align:center;padding:24px 20px 30px">
        <div class="section-label" style="text-align:center;margin-bottom:4px">🏆 WORLD CHAMPION 🏆</div>
        <p style="font-size:11px;color:#444;margin-bottom:16px;letter-spacing:1px">FIFA WORLD CUP 2026</p>
        <div class="floating" style="margin-bottom:12px;display:inline-block">
          <svg width="150" height="230" viewBox="0 0 150 230" fill="none">
            <circle cx="75" cy="34" r="22" fill="#FBBF7A"/>
            <ellipse cx="75" cy="18" rx="20" ry="9" fill="#4a3000"/>
            <path d="M36 92 Q36 72 75 72 Q114 72 114 92 L120 155 H30 Z" fill="#FF6B1A"/>
            <path d="M36 92 Q20 76 10 52 Q7 43 14 41 Q21 39 25 50 Q34 72 46 84 Z" fill="#FBBF7A"/>
            <path d="M114 92 Q130 76 140 52 Q143 43 136 41 Q129 39 125 50 Q116 72 104 84 Z" fill="#FBBF7A"/>
            <line x1="10" y1="52" x2="10" y2="10" stroke="#ccc" stroke-width="3" stroke-linecap="round"/>
            <image href="https://flagcdn.com/w80/${t.f}.png" x="-8" y="6" width="42" height="28" clip-path="url(#fc)"/>
            <defs><clipPath id="fc"><rect x="-8" y="6" width="42" height="28" rx="3"/></clipPath></defs>
            <path d="M52 155 L44 210 Q42 218 52 219 Q62 220 64 212 L70 162 Z" fill="#FF6B1A"/>
            <path d="M98 155 L106 210 Q108 218 98 219 Q88 220 86 212 L80 162 Z" fill="#FF6B1A"/>
            <ellipse cx="47" cy="218" rx="11" ry="5" fill="#222"/>
            <ellipse cx="103" cy="218" rx="11" ry="5" fill="#222"/>
            <text x="140" y="54" font-size="20" text-anchor="middle">🏆</text>
            <circle cx="68" cy="32" r="2.5" fill="#5a3000"/>
            <circle cx="82" cy="32" r="2.5" fill="#5a3000"/>
            <path d="M67 42 Q75 49 83 42" stroke="#5a3000" stroke-width="2" stroke-linecap="round" fill="none"/>
          </svg>
        </div>
        <div style="font-size:22px;letter-spacing:4px;margin-bottom:8px">🎊 🎉 🎊</div>
        <div style="font-size:30px;font-weight:900;letter-spacing:2px">${WINNER}</div>
        <div style="font-size:14px;color:#888;margin-bottom:12px">${t.n}</div>
        <img src="https://flagcdn.com/w160/${t.f}.png" alt="${t.n}"
          style="width:72px;height:48px;border-radius:7px;object-fit:cover;border:2px solid var(--orange);margin-bottom:16px">
        <div style="background:#1a1a1e;border-radius:12px;padding:14px">
          <p style="font-size:10px;color:#444;letter-spacing:2px;font-weight:700;margin-bottom:6px">2026 WORLD CHAMPIONS</p>
          <p style="font-size:13px;color:#888;line-height:1.8">${t.n} are the<br>2026 FIFA World Cup Champions 🏆</p>
        </div>
      </div>`;
  }
}

// ══════════════════════════════════════════════
//  EXTRA CSS
// ══════════════════════════════════════════════

const extraCSS = `
  .section-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#444;margin:14px 0 8px 2px;text-transform:uppercase}
  .sres-card{background:var(--card);border-radius:var(--radius);padding:14px}
  .sres-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .sres-name{font-size:16px;font-weight:800}
  .sres-group{background:#1c1200;color:var(--orange);font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;letter-spacing:1px}
  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:14px}
  .stat-box{background:#0d0d0f;border-radius:10px;padding:10px 6px;text-align:center}
  .stat-val{font-size:22px;font-weight:900;color:var(--orange)}
  .stat-val.white{color:#fff}
  .stat-lbl{font-size:9px;font-weight:700;color:#444;margin-top:2px;letter-spacing:1px}
  .next-box{background:#1c1200;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:9px;margin-bottom:10px}
  .next-opp{font-size:13px;font-weight:700;color:#ccc}
  .next-time{margin-left:auto;font-size:10px;color:#555;white-space:nowrap}
  .recent-label{font-size:10px;font-weight:700;color:#444;letter-spacing:1.5px;margin-bottom:6px;text-transform:uppercase}
  .recent-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #1e1e22}
  .res-badge{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#fff;flex-shrink:0}
  .res-opp{font-size:12px;font-weight:700;color:#888}
  .res-score{margin-left:auto;font-size:14px;font-weight:800}
  .search-empty{text-align:center;padding:40px 20px;color:#444;font-size:13px;line-height:1.8}
  .group-card{background:var(--card);border-radius:var(--radius);margin-bottom:11px;overflow:hidden}
  .group-header{background:#1c1200;padding:8px 14px;font-size:11px;font-weight:800;color:var(--orange);letter-spacing:2px}
  .group-table{width:100%;border-collapse:collapse}
  .group-table th{font-size:10px;color:#444;font-weight:700;padding:6px;text-align:center;letter-spacing:1px}
  .group-table th:first-child{text-align:left;padding-left:12px}
  .group-table td{padding:6px 4px;font-size:11px;text-align:center;border-top:1px solid #1e1e22;color:#555}
  .group-table td:first-child{text-align:left;padding-left:0}
  .group-table tr.qualified td{color:#ccc}
  .group-table tr.qualified td:first-child{border-left:3px solid var(--orange);padding-left:9px}
  .group-table tr.eliminated td{color:#3a3a3e;opacity:.7}
  .pts-cell{color:var(--orange)!important;font-weight:800!important}
  .team-cell{display:flex;align-items:center;gap:6px}
  .flag-sm{width:22px;height:16px;border-radius:3px;object-fit:cover;border:1px solid #2a2a2e;cursor:pointer}
  .q-badge{font-size:9px;font-weight:800;background:var(--orange);color:#000;padding:2px 6px;border-radius:4px;letter-spacing:.5px}
  .qualified-note{font-size:10px;color:#444;font-weight:600;padding:8px 14px;border-top:1px solid #1e1e22;letter-spacing:.5px}
  #tooltip{position:fixed;background:#1c1200;border:1px solid var(--orange);color:var(--orange);padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;pointer-events:none;z-index:999;display:none;white-space:nowrap}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .floating{animation:float 3s ease-in-out infinite}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
  .modal-overlay.open{opacity:1;pointer-events:all}
  .modal{width:100%;max-width:430px;background:#111113;border-radius:20px 20px 0 0;padding:20px 18px 40px;transform:translateY(100%);transition:transform .3s ease;max-height:85vh;overflow-y:auto}
  .modal-overlay.open .modal{transform:translateY(0)}
  .modal-handle{width:36px;height:4px;background:#2a2a2e;border-radius:2px;margin:0 auto 16px}
  .modal-teams{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .modal-team{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1}
  .modal-team img{width:48px;height:34px;border-radius:6px;object-fit:cover;border:1px solid #2a2a2e}
  .modal-team-name{font-size:11px;font-weight:700;color:#888;text-align:center}
  .modal-score{font-size:42px;font-weight:900;text-align:center;padding:0 12px;white-space:nowrap}
  .modal-score .sep{color:#2a2a2e;font-weight:300}
  .modal-score .w{color:#fff}
  .modal-score .l{color:#333}
  .modal-score .vs{color:#2a2a2e;font-size:24px}
  .modal-meta{text-align:center;font-size:11px;color:#444;margin-bottom:20px;font-weight:600;letter-spacing:1px}
  .modal-section{font-size:10px;font-weight:700;letter-spacing:2px;color:#444;text-transform:uppercase;margin:16px 0 10px}
  .goal-event{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #1e1e22;font-size:12px;color:#ccc}
  .goal-event .minute{color:var(--orange);font-weight:800;font-size:11px;width:36px;flex-shrink:0}
  .goal-event .scorer{font-weight:700}
  .goal-event .team-tag{margin-left:auto;font-size:10px;color:#555;font-weight:700}
`;
const style = document.createElement('style');
style.textContent = extraCSS;
document.head.appendChild(style);

// ══════════════════════════════════════════════
//  INIT — called once data.json has loaded
// ══════════════════════════════════════════════

function initApp() {
  buildMatches();
  buildGroups();
  buildKnockout();
  buildChamp();
}

// Kick everything off
loadData();