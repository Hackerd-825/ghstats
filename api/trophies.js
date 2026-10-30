const h = require('../lib/handler'), { trophiesCard } = require('../lib/svg');
module.exports = h((s, sc, t, hide, cols) => trophiesCard(s, t, cols, hide));
