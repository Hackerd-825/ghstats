// Aucune clé requise : API REST publique + calendrier de contributions public.
// (Si un jour tu veux plus de marge sur la limite de requêtes, un GITHUB_TOKEN est pris en compte s'il existe, mais ce n'est pas nécessaire.)
const H = { 'User-Agent': 'ghstats', Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };

const COLORS = { Python: '#3572A5', HTML: '#e34c26', JavaScript: '#f1e05a', TypeScript: '#3178c6', CSS: '#663399', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138',
  Kotlin: '#A97BFF', Shell: '#89e051', Batchfile: '#C1F12E', PowerShell: '#012456', AutoHotkey: '#6594b9', Lua: '#000080',
  Dart: '#00B4AB', Vue: '#41b883', SCSS: '#c6538c', Jupyter: '#DA5B0B', 'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384d54' };

async function api(path) {
  const r = await fetch('https://api.github.com' + path, { headers: H });
  if (r.status === 404) throw new Error('Utilisateur introuvable');
  if (r.status === 403 || r.status === 429) throw new Error('Limite GitHub atteinte, réessaie dans quelques minutes');
  if (!r.ok) throw new Error('GitHub a répondu ' + r.status);
  return r.json();
}
// Recherche : en cas d'échec (limite), on renvoie null et on utilise une valeur de repli
async function count(q) {
  try {
    const r = await fetch('https://api.github.com/search/' + q, { headers: H });
    return r.ok ? (await r.json()).total_count : null;
  } catch { return null; }
}

async function calendar(u) {
  try {
    const r = await fetch(`https://github.com/users/${u}/contributions`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return [];
    const h = await r.text(), tips = {}, map = {};
    for (const m of h.matchAll(/<tool-tip[^>]*\sfor="([^"]+)"[^>]*>([^<]*)</g)) {
      const n = m[2].trim().match(/^(\d+)\s/); tips[m[1]] = n ? +n[1] : 0;
    }
    for (const m of h.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*>/g)) {
      const id = (m[0].match(/\sid="([^"]+)"/) || [])[1];
      const lvl = +((m[0].match(/data-level="(\d)"/) || [])[1] || 0);
      map[m[1]] = { date: m[1], count: id in tips ? tips[id] : lvl, weekday: new Date(m[1] + 'T00:00:00Z').getUTCDay() };
    }
    return Object.values(map).sort((a, b) => a.date < b.date ? -1 : 1);
  } catch { return []; }
}

async function getStats(login) {
  const now = new Date(), year = now.getUTCFullYear(), since = `${year}-01-01`;
  const q = t => `issues?q=${encodeURIComponent(t)}&per_page=1`;
  const [user, days, commitsN, prsN, issuesN, reviewsN] = await Promise.all([
    api(`/users/${login}`), calendar(login),
    count(`commits?q=${encodeURIComponent(`author:${login} author-date:>=${since}`)}&per_page=1`),
    count(q(`author:${login} type:pr created:>=${since}`)),
    count(q(`author:${login} type:issue created:>=${since}`)),
    count(q(`reviewed-by:${login} type:pr -author:${login} created:>=${since}`)),
  ]);

  let repos = [];
  for (let p = 1; p <= 5; p++) {
    const page = await api(`/users/${login}/repos?per_page=100&type=owner&page=${p}`);
    repos.push(...page);
    if (page.length < 100) break;
  }
  repos = repos.filter(r => !r.fork);

  const langMap = {};
  repos.forEach(r => { if (!r.language) return;
    const l = langMap[r.language] ||= { name: r.language, color: COLORS[r.language] || '#8b949e', size: 0 };
    l.size += r.size + 1; });
  const langs = Object.values(langMap).sort((a, b) => b.size - a.size);

  const today = now.toISOString().slice(0, 10);
  const d = days.filter(x => x.date <= today);
  const sum = a => a.reduce((t, x) => t + x.count, 0);
  const contribs = sum(d);
  let streak = 0, i = d.length - 1;
  if (i >= 0 && d[i].count === 0) i--;
  for (; i >= 0 && d[i].count > 0; i--) streak++;
  const week = sum(d.slice(-7)), prev = sum(d.slice(-14, -7));
  const trend = prev ? Math.round((week - prev) / prev * 100) : (week ? 100 : 0);
  const yd = d.filter(x => x.date >= since);
  const byDay = Array(7).fill(0); yd.forEach(x => byDay[x.weekday] += x.count);
  const names = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const commits = commitsN ?? sumYear(yd);

  return {
    login, stars: repos.reduce((t, r) => t + r.stargazers_count, 0),
    commits, prs: prsN ?? 0, issues: issuesN ?? 0, reviews: reviewsN ?? 0, contribs,
    hours: Math.round(commits * 0.5), streak, week, trend,
    avg: +(commits / Math.max(yd.length, 1)).toFixed(1),
    bestDay: Math.max(...byDay) ? names[byDay.indexOf(Math.max(...byDay))] : '-',
    repos: user.public_repos, followers: user.followers,
    years: Math.floor((now - new Date(user.created_at)) / 3.156e10), langs, year, days: d,
  };
}
const sumYear = a => a.reduce((t, x) => t + x.count, 0);
module.exports = { getStats };
