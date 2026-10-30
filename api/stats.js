const h = require('../lib/handler'), { statsCard } = require('../lib/svg');
module.exports = h((s, sc, t, hide) => statsCard(s, sc, t, hide));
