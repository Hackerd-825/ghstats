const { TROPHIES, trophyRank } = require('./score');
const THEMES = {
  dark:  { bg: '#0d1117', bd: '#30363d', title: '#58a6ff', text: '#c9d1d9', sub: '#8b949e', acc: '#58a6ff', card: '#1c1c24' },
  light: { bg: '#ffffff', bd: '#d0d7de', title: '#0969da', text: '#24292f', sub: '#57606a', acc: '#0969da', card: '#f6f8fa' },
};
const RANK = { S: '#c084fc', A: '#8b5cf6', B: '#2c7a8c', C: '#4a9d6b', D: '#6b7280', '?': '#5f8a2d' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const theme = n => THEMES[n] || THEMES.dark;
const wrap = (w, h, t, body, hide) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="'Segoe UI',Ubuntu,Arial,sans-serif">
<rect x=".5" y=".5" rx="8" width="${w - 1}" height="${h - 1}" fill="${hide ? 'none' : t.bg}" stroke="${hide ? 'none' : t.bd}"/>${body}</svg>`;

function statsCard(s, sc, tn, hide) {
  const t = theme(tn);
  const trend = s.trend >= 0 ? `▲ +${s.trend}%` : `▼ ${s.trend}%`;
  const rows = [
    ['Total Stars Earned', s.stars], [`Total Commits (${s.year})`, s.commits], ['Pull Requests', s.prs],
    ['Issues Opened', s.issues], ['Estimated Coding Hours', s.hours + 'h'],
    ['Current Streak', s.streak + (s.streak > 1 ? ' days' : ' day')], ['Commits This Week', s.week],
    ['Weekly Trend', `${trend}  ${s.week} commits`], ['Avg Commits / Day', s.avg], ['Most Active Day', s.bestDay],
    ['Contributions This Year', s.contribs], ['Public Repos', s.repos], ['Followers', s.followers],
  ];
  const body = rows.map(([k, v], i) => {
    const y = 62 + i * 25;
    return `<circle cx="30" cy="${y - 5}" r="4" fill="${t.acc}"/>
<text x="46" y="${y}" font-size="14" fill="${t.text}">${esc(k)}:</text>
<text x="335" y="${y}" font-size="14" font-weight="700" fill="${t.text}" text-anchor="end">${esc(v)}</text>`;
  }).join('');
  const C = 2 * Math.PI * 40, off = (sc.percent / 100) * C;
  const ring = `<g transform="translate(425 190)">
<circle r="40" fill="none" stroke="${t.bd}" stroke-width="7"/>
<circle r="40" fill="none" stroke="${t.acc}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${off} ${C}" transform="rotate(-90)"/>
<text y="6" font-size="26" font-weight="700" fill="${t.title}" text-anchor="middle">${sc.grade}</text>
<text y="22" font-size="10" fill="${t.sub}" text-anchor="middle">${sc.percent}%</text></g>
<text x="425" y="255" font-size="12" font-weight="700" fill="${t.text}" text-anchor="middle">Lv. ${sc.level}</text>
<rect x="385" y="262" width="80" height="6" rx="3" fill="${t.bd}"/>
<rect x="385" y="262" width="${80 * sc.levelPct / 100}" height="6" rx="3" fill="${t.acc}"/>
<text x="425" y="285" font-size="11" fill="${t.sub}" text-anchor="middle">${sc.xp} XP</text>`;
  return wrap(495, 62 + rows.length * 25 + 5, t,
    `<text x="25" y="32" font-size="18" font-weight="700" fill="${t.title}">${esc(s.login)}'s GitHub Stats</text>${body}${ring}`, hide);
}

function langsCard(s, tn, hide) {
  const t = theme(tn);
  const list = s.langs.slice(0, 8), total = list.reduce((a, l) => a + l.size, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  const arcs = list.map(l => {
    const len = l.size / total * C;
    const el = `<circle r="${R}" fill="none" stroke="${l.color}" stroke-width="20" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90)"/>`;
    acc += len; return el;
  }).join('');
  const top = list[0] ? Math.round(list[0].size / total * 100) : 0;
  const legend = list.map((l, i) => {
    const y = 195 + i * 24;
    return `<circle cx="28" cy="${y - 4}" r="5" fill="${l.color}"/>
<text x="42" y="${y}" font-size="13" fill="${t.text}">${esc(l.name)}</text>
<text x="272" y="${y}" font-size="13" font-weight="600" fill="${t.sub}" text-anchor="end">${(l.size / total * 100).toFixed(1)}%</text>`;
  }).join('');
  return wrap(300, 205 + list.length * 24, t, `<text x="22" y="32" font-size="18" font-weight="700" fill="${t.title}">Top Languages</text>
<g transform="translate(150 105)">${arcs}
<text y="2" font-size="20" font-weight="700" fill="${t.title}" text-anchor="middle">${top}%</text>
<text y="18" font-size="11" fill="${t.sub}" text-anchor="middle">${esc(list[0]?.name || '-')}</text></g>${legend}`, hide);
}

function trophiesCard(s, tn, cols = 5, hide) {
  const t = theme(tn), W = 110, H = 120, G = 8;
  const cells = TROPHIES.map(([title, get, th, sub], i) => {
    const v = get(s), r = trophyRank(v, th), c = RANK[r];
    const x = G + (i % cols) * (W + G), y = G + Math.floor(i / cols) * (H + G);
    const next = r === 'S' ? 1 : (th[['?', 'C', 'B', 'A'].indexOf(r)] ) ;
    const pct = r === 'S' ? 100 : Math.min(100, Math.round(v / next * 100));
    return `<g transform="translate(${x} ${y})">
<rect width="${W}" height="${H}" rx="6" fill="${t.card}" stroke="${t.bd}"/>
<text x="${W / 2}" y="18" font-size="12" font-weight="700" fill="${t.text}" text-anchor="middle">${title}</text>
<path d="M38 30h34v14a17 17 0 0 1-34 0zM38 34h-8v6a8 8 0 0 0 8 8M72 34h8v6a8 8 0 0 1-8 8M55 61v10M44 73h22v5H44z" fill="${c}" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
<circle cx="55" cy="44" r="11" fill="#fff"/>
<text x="55" y="49" font-size="14" font-weight="700" fill="${c}" text-anchor="middle">${r}</text>
<text x="${W / 2}" y="94" font-size="9" font-weight="700" fill="${t.text}" text-anchor="middle">${r === '?' ? 'Unknown' : esc(sub)}</text>
<text x="${W / 2}" y="106" font-size="9" fill="${t.sub}" text-anchor="middle">${esc(v)} pts</text>
<rect x="12" y="111" width="${W - 24}" height="3" rx="1.5" fill="${t.bd}"/>
<rect x="12" y="111" width="${(W - 24) * pct / 100}" height="3" rx="1.5" fill="${c}"/></g>`;
  }).join('');
  const rows = Math.ceil(TROPHIES.length / cols);
  return wrap(G + cols * (W + G), G + rows * (H + G), t, cells, hide);
}

function badge(s, sc, tn) {
  const t = theme(tn), right = `Lv.${sc.level} · ${sc.grade} · ${sc.xp} XP`, w1 = 100, w2 = 20 + right.length * 6.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w1 + w2}" height="24" font-family="'Segoe UI',Arial,sans-serif" font-size="12">
<rect width="${w1 + w2}" height="24" rx="5" fill="${t.acc}"/><rect width="${w1}" height="24" rx="5" fill="#30363d"/><rect x="${w1 - 5}" width="5" height="24" fill="#30363d"/>
<text x="${w1 / 2}" y="16" fill="#fff" text-anchor="middle" font-weight="600">GitHub Score</text>
<text x="${w1 + w2 / 2}" y="16" fill="#fff" text-anchor="middle" font-weight="700">${esc(right)}</text></svg>`;
}
const errorCard = msg => wrap(495, 80, THEMES.dark, `<text x="20" y="45" font-size="14" fill="#f85149">${esc(msg)}</text>`);
module.exports = { statsCard, langsCard, trophiesCard, badge, errorCard };
