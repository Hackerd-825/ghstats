const h = require('../lib/handler'), { langsCard } = require('../lib/svg');
module.exports = h((s, sc, t, hide) => langsCard(s, t, hide));
