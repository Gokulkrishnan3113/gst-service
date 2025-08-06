const LRUCache = require('lru-cache');

const cache = new LRUCache({
    maxSize: 50 * 1024 * 1024,
    max: 5000,
    sizeCalculation: (value, key) => {
        return Buffer.byteLength(JSON.stringify(value)) + Buffer.byteLength(key);
    },
    maxAge: 1000 * 60 * 10, // 10 minutes
    dispose: (value, key, reason) => {
        console.log(`Evicted key: ${value}`);
    },
});

function clearCacheByPrefix(prefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.del(key);
        }
    }
}

module.exports = {
    cache,
    clearCacheByPrefix
};
