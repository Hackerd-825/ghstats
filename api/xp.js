const h = require('../lib/handler'), { xpCard } = require('../lib/svg');
module.exports = h((s, sc, t, hide) => xpCard(s, sc, t, hide));
