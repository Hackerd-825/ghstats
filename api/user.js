const { getStats } = require('../lib/github');
const { score } = require('../lib/score');
module.exports = async (req, res) => {
  try {
    const u = req.query.username;
    if (!u || !/^[a-zA-Z0-9-]{1,39}$/.test(u)) throw new Error('Pseudo GitHub invalide');
    const s = await getStats(u), sc = score(s);
    res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400');
    res.status(200).json({ login: u, score: sc, stats: { ...s, langs: s.langs.slice(0, 8).map(l => l.name) } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
