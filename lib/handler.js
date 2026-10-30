const { getStats } = require('./github');
const { score } = require('./score');
const { errorCard } = require('./svg');

module.exports = render => async (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  try {
    const { username, theme = 'dark', hide_bg, cols } = req.query;
    if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) throw new Error('Paramètre ?username= invalide');
    const s = await getStats(username);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
    res.status(200).send(render(s, score(s), theme, hide_bg === 'true', parseInt(cols) || 5));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(errorCard('Erreur : ' + e.message));
  }
};
