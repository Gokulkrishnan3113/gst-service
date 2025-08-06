const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes (600 seconds)

async function clearCacheByPrefix(prefix) {
    const allKeys = cache.keys();
    const matchingKeys = allKeys.filter(key => key.startsWith(prefix));
    matchingKeys.forEach(key => cache.del(key));
}


module.exports = { cache, clearCacheByPrefix };
