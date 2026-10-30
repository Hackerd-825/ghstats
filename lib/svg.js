const THEMES = {
  dark: { bg: '#12151c', bd: '#262b38', title: '#6ee7c8', text: '#d6dbe8', sub: '#8b93a7', acc: '#6ee7c8', heat: ['#1c2130', '#1d4d46', '#2b7f70', '#47b8a0', '#6ee7c8'] },
  light: { bg: '#ffffff', bd: '#d8dee6', title: '#0e9f84', text: '#1f2933', sub: '#5f6b7a', acc: '#0e9f84', heat: ['#ebedf0', '#b7ecdf', '#74d8c0', '#34b99d', '#0e9f84'] },
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const theme = n => THEMES[n] || THEMES.dark;
const wrap = (w, h, t, body, hide) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="'Segoe UI',Ubuntu,Arial,sans-serif">
<rect x=".5" y=".5" rx="14" width="${w - 1}" height="${h - 1}" fill="${hide ? 'none' : t.bg}" stroke="${hide ? 'none' : t.bd}"/>${body}</svg>`;
const title = (t, txt) => `<text x="25" y="36" font-size="18" font-weight="700" fill="${t.title}">${esc(txt)}</text>`;

function statsCard(s, sc, tn, hide) {
  const t = theme(tn);
  const trend = (s.trend >= 0 ? '▲ +' : '▼ ') + s.trend + '%';
  const rows = [
    ['Étoiles reçues', s.stars], [`Commits (${s.year})`, s.commits], ['Pull requests', s.prs], ['Issues ouvertes', s.issues],
    ['Heures de code estimées', s.hours + ' h'], ['Série en cours', s.streak + (s.streak > 1 ? ' jours' : ' jour')],
    ['Commits cette semaine', s.week], ['Tendance hebdo', `${trend}  ·  ${s.week} commits`], ['Moyenne par jour', s.avg],
    ['Jour le plus actif', s.bestDay], ['Contributions (12 mois)', s.contribs], ['Repos publics', s.repos], ['Abonnés', s.followers],
  ];
  const body = rows.map(([k, v], i) => {
    const y = 68 + i * 25;
    return `<circle cx="31" cy="${y - 5}" r="3.5" fill="${t.acc}" opacity=".85"/>
<text x="46" y="${y}" font-size="14" fill="${t.sub}">${esc(k)}</text>
<text x="338" y="${y}" font-size="14" font-weight="700" fill="${t.text}" text-anchor="end">${esc(v)}</text>`;
  }).join('');
  const C = 2 * Math.PI * 40, off = sc.percent / 100 * C;
  const ring = `<g transform="translate(427 190)"><circle r="40" fill="none" stroke="${t.bd}" stroke-width="7"/>
<circle r="40" fill="none" stroke="${t.acc}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${off} ${C}" transform="rotate(-90)"/>
<text y="9" font-size="28" font-weight="700" fill="${t.title}" text-anchor="middle">${sc.grade}</text>
<text y="24" font-size="10" fill="${t.sub}" text-anchor="middle">${sc.percent}%</text></g>
<text x="427" y="256" font-size="13" font-weight="700" fill="${t.text}" text-anchor="middle">Niveau ${sc.level}</text>
<rect x="387" y="264" width="80" height="6" rx="3" fill="${t.bd}"/><rect x="387" y="264" width="${80 * sc.levelPct / 100}" height="6" rx="3" fill="${t.acc}"/>
<text x="427" y="287" font-size="11" fill="${t.sub}" text-anchor="middle">${sc.xp} XP</text>`;
  return wrap(495, 68 + rows.length * 25 + 8, t, title(t, `Stats GitHub de ${s.login}`) + body + ring, hide);
}

function langsCard(s, tn, hide) {
  const t = theme(tn), list = s.langs.slice(0, 8), total = list.reduce((a, l) => a + l.size, 0) || 1;
  const R = 52, C = 2 * Math.PI * R; let acc = 0;
  const arcs = list.map(l => { const len = l.size / total * C;
    const el = `<circle r="${R}" fill="none" stroke="${l.color}" stroke-width="20" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90)"/>`;
    acc += len; return el; }).join('');
  const top = list[0] ? Math.round(list[0].size / total * 100) : 0;
  const legend = list.map((l, i) => { const y = 200 + i * 24;
    return `<circle cx="29" cy="${y - 4}" r="5" fill="${l.color}"/><text x="43" y="${y}" font-size="13" fill="${t.text}">${esc(l.name)}</text>
<text x="272" y="${y}" font-size="13" font-weight="600" fill="${t.sub}" text-anchor="end">${(l.size / total * 100).toFixed(1)}%</text>`; }).join('');
  return wrap(300, 212 + list.length * 24, t, `${title(t, 'Langages principaux')}<g transform="translate(150 112)">${arcs}
<text y="3" font-size="21" font-weight="700" fill="${t.title}" text-anchor="middle">${top}%</text>
<text y="19" font-size="11" fill="${t.sub}" text-anchor="middle">${esc(list[0]?.name || '-')}</text></g>${legend}`, hide);
}

function activityCard(s, tn, hide) {
  const t = theme(tn), days = s.days || [], cell = 11, gap = 3, st = cell + gap, x0 = 25, y0 = 70;
  if (!days.length) return wrap(495, 90, t, title(t, 'Activité') + `<text x="25" y="66" font-size="13" fill="${t.sub}">Calendrier indisponible pour le moment</text>`, hide);
  const max = Math.max(...days.map(d => d.count), 1), first = days[0].weekday;
  const lvl = c => !c ? 0 : c <= max * .25 ? 1 : c <= max * .5 ? 2 : c <= max * .75 ? 3 : 4;
  const M = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  let lastM = -1, lastCol = -9, labels = '';
  const cells = days.map((d, i) => {
    const col = Math.floor((i + first) / 7), m = +d.date.slice(5, 7) - 1;
    if (m !== lastM) { if (col - lastCol >= 3) { labels += `<text x="${x0 + col * st}" y="${y0 - 8}" font-size="10" fill="${t.sub}">${M[m]}</text>`; lastCol = col; } lastM = m; }
    return `<rect x="${x0 + col * st}" y="${y0 + d.weekday * st}" width="${cell}" height="${cell}" rx="2.5" fill="${t.heat[lvl(d.count)]}"/>`;
  }).join('');
  const cols = Math.floor((days.length - 1 + first) / 7) + 1, W = x0 * 2 + cols * st, H = y0 + 7 * st + 38;
  const lg = [0, 1, 2, 3, 4].map(i => `<rect x="${W - x0 - 70 + i * 14}" y="${H - 28}" width="11" height="11" rx="2.5" fill="${t.heat[i]}"/>`).join('');
  return wrap(W, H, t, `${title(t, 'Activité sur 12 mois')}${labels}${cells}
<text x="${x0}" y="${H - 19}" font-size="12" fill="${t.sub}">${s.contribs} contributions · série en cours : ${s.streak} j</text>
<text x="${W - x0 - 76}" y="${H - 19}" font-size="10" fill="${t.sub}" text-anchor="end">Moins</text>${lg}<text x="${W - x0 + 2}" y="${H - 19}" font-size="10" fill="${t.sub}" text-anchor="end" dx="0"></text>`, hide);
}

function xpCard(s, sc, tn, hide) {
  const t = theme(tn);
  const L = { stars: 'Étoiles', commits: 'Commits', repos: 'Repos', followers: 'Abonnés', prs: 'Pull requests', issues: 'Issues', reviews: 'Reviews', langs: 'Langages', streak: 'Série' };
  const rows = Object.entries(sc.pts).sort((a, b) => b[1] - a[1]), max = Math.max(...rows.map(r => r[1]), 1);
  const body = rows.map(([k, v], i) => { const y = 76 + i * 26;
    return `<text x="25" y="${y}" font-size="13" fill="${t.text}">${L[k]}</text>
<rect x="125" y="${y - 10}" width="280" height="8" rx="4" fill="${t.bd}"/><rect x="125" y="${y - 10}" width="${Math.max(v / max * 280, v ? 6 : 0)}" height="8" rx="4" fill="${t.acc}"/>
<text x="470" y="${y}" font-size="13" font-weight="700" fill="${t.sub}" text-anchor="end">+${v}</text>`; }).join('');
  return wrap(495, 76 + rows.length * 26 + 6, t, `${title(t, "Détail de l'XP")}<text x="470" y="36" font-size="13" font-weight="700" fill="${t.text}" text-anchor="end">Niv. ${sc.level} · ${sc.xp} XP</text>${body}`, hide);
}

function badge(s, sc, tn) {
  const t = theme(tn), right = `Niv. ${sc.level} · ${sc.grade} · ${sc.xp} XP`, w1 = 104, w2 = 22 + right.length * 6.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w1 + w2}" height="26" font-family="'Segoe UI',Arial,sans-serif" font-size="12">
<rect width="${w1 + w2}" height="26" rx="13" fill="${t.acc}"/><rect width="${w1}" height="26" rx="13" fill="#262b38"/><rect x="${w1 - 13}" width="13" height="26" fill="#262b38"/>
<text x="${w1 / 2}" y="17" fill="#d6dbe8" text-anchor="middle" font-weight="600">Score GitHub</text>
<text x="${w1 + w2 / 2}" y="17" fill="#0b1210" text-anchor="middle" font-weight="700">${esc(right)}</text></svg>`;
}
const errorCard = msg => wrap(495, 80, THEMES.dark, `<text x="20" y="45" font-size="14" fill="#ff7b72">${esc(msg)}</text>`);
module.exports = { statsCard, langsCard, activityCard, xpCard, badge, errorCard };
