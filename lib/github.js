const Q = `query($login:String!,$after:String,$from:DateTime!){
 user(login:$login){
  followers{totalCount} createdAt
  repositories(first:100,after:$after,ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false){
   totalCount pageInfo{hasNextPage endCursor}
   nodes{stargazerCount languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}
  }
  contributionsCollection(from:$from){
   totalCommitContributions totalPullRequestContributions
   totalIssueContributions totalPullRequestReviewContributions
   contributionCalendar{totalContributions weeks{contributionDays{date contributionCount weekday}}}
  }
 }}`;

async function gql(variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: Q, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  return j.data.user;
}

async function getStats(login) {
  const now = new Date(), year = now.getUTCFullYear();
  const from = `${year}-01-01T00:00:00Z`;
  let after = null, user, repos = [];
  for (let i = 0; i < 10; i++) {            // max 1000 repos
    user = await gql({ login, after, from });
    repos.push(...user.repositories.nodes);
    if (!user.repositories.pageInfo.hasNextPage) break;
    after = user.repositories.pageInfo.endCursor;
  }
  const cc = user.contributionsCollection;
  const today = now.toISOString().slice(0, 10);
  const days = cc.contributionCalendar.weeks.flatMap(w => w.contributionDays)
    .filter(d => d.date <= today).sort((a, b) => a.date < b.date ? -1 : 1);

  let streak = 0, i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;   // today not over yet
  for (; i >= 0 && days[i].contributionCount > 0; i--) streak++;

  const sum = a => a.reduce((t, d) => t + d.contributionCount, 0);
  const week = sum(days.slice(-7)), prev = sum(days.slice(-14, -7));
  const trend = prev ? Math.round((week - prev) / prev * 100) : (week ? 100 : 0);
  const yd = days.filter(d => d.date >= from.slice(0, 10));
  const byDay = Array(7).fill(0);
  yd.forEach(d => byDay[d.weekday] += d.contributionCount);
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const langMap = {};
  repos.forEach(r => r.languages.edges.forEach(e => {
    const l = langMap[e.node.name] ||= { name: e.node.name, color: e.node.color || '#888', size: 0 };
    l.size += e.size;
  }));
  const langs = Object.values(langMap).sort((a, b) => b.size - a.size);

  return {
    login,
    stars: repos.reduce((t, r) => t + r.stargazerCount, 0),
    commits: cc.totalCommitContributions,
    prs: cc.totalPullRequestContributions,
    issues: cc.totalIssueContributions,
    reviews: cc.totalPullRequestReviewContributions,
    contribs: cc.contributionCalendar.totalContributions,
    hours: Math.round(cc.totalCommitContributions * 0.5),
    streak, week, trend,
    avg: +(cc.totalCommitContributions / Math.max(yd.length, 1)).toFixed(1),
    bestDay: Math.max(...byDay) ? names[byDay.indexOf(Math.max(...byDay))] : '-',
    repos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    years: Math.floor((now - new Date(user.createdAt)) / 3.156e10),
    langs, year,
  };
}
module.exports = { getStats };
