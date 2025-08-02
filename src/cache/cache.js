const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes (600 seconds)
module.exports = cache;
