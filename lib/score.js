// Barème : chaque stat rapporte des points -> XP -> niveau + grade
const GRADES = [['S', 3000], ['A', 1500], ['B', 700], ['C', 250], ['D', 0]];

function score(s) {
  const pts = {
    stars: s.stars * 3, commits: s.commits, repos: s.repos * 2, followers: s.followers * 2,
    prs: s.prs * 4, issues: s.issues * 2, reviews: s.reviews * 3,
    langs: s.langs.length * 2, streak: s.streak * 2,
  };
  const xp = Object.values(pts).reduce((a, b) => a + b, 0);
  const level = Math.floor(Math.sqrt(xp / 5)) + 1;
  const lvlStart = 5 * (level - 1) ** 2, lvlEnd = 5 * level ** 2;
  const gi = GRADES.findIndex(([, min]) => xp >= min);
  const next = GRADES[gi - 1];
  const percent = next ? Math.round((xp - GRADES[gi][1]) / (next[1] - GRADES[gi][1]) * 100) : 100;
  return { xp, level, levelPct: Math.round((xp - lvlStart) / (lvlEnd - lvlStart) * 100),
           grade: GRADES[gi][0], percent, pts };
}

// seuils [S, A, B, C] pour les trophées
const TROPHIES = [
  ['MultiLanguage', s => s.langs.length, [8, 5, 3, 1], 'Rainbow Lang User'],
  ['Stars', s => s.stars, [100, 30, 10, 1], 'High Star'],
  ['Repositories', s => s.repos, [50, 30, 10, 1], 'Hyper Repo Creator'],
  ['Commits', s => s.commits, [1000, 500, 100, 1], 'High Committer'],
  ['Followers', s => s.followers, [100, 30, 10, 1], 'Many Friends'],
  ['Experience', s => s.years, [10, 5, 2, 1], 'Junior Dev'],
  ['Issues', s => s.issues, [100, 30, 10, 1], 'Bug Hunter'],
  ['PullRequest', s => s.prs, [100, 30, 10, 1], 'Merge Master'],
  ['Reviews', s => s.reviews, [50, 20, 5, 1], 'Code Reviewer'],
];
function trophyRank(v, t) {
  return v >= t[0] ? 'S' : v >= t[1] ? 'A' : v >= t[2] ? 'B' : v >= t[3] ? 'C' : '?';
}
module.exports = { score, TROPHIES, trophyRank };
