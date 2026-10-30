const h = require('../lib/handler'), { activityCard } = require('../lib/svg');
module.exports = h((s, sc, t, hide) => activityCard(s, t, hide));
