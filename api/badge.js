const h = require('../lib/handler'), { badge } = require('../lib/svg');
module.exports = h((s, sc, t) => badge(s, sc, t));
