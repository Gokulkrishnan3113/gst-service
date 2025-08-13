const { match } = require('path-to-regexp');

const buckets = new Map();
const metrics = {};

setInterval(() => {
    for (let key in metrics) {
        delete metrics[key];
    }
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] Rate limiter metrics reset`);
}, 60 * 60 * 1000);
// }, 60 * 1000);


const config = {
    global: {
        limit: 100,
        refillRate: 0.5,
        window: 60
    },
    prefixLimits: {
        '/gst': { limit: 10, refillRate: 1, window: 60 },
        '/invoice': { limit: 5, refillRate: 0.5, window: 60 },
        '/ledger': { limit: 5, refillRate: 0.5, window: 60 },
    },
    routeOverrides: {
        // '/gst/filings': { limit: 2, refillRate: 0.1, window: 60 }
    },
    developerBypass: false // Can be toggled if needed
};


const whitelist = [
    { method: 'GET', path: '/vendors' },
    { method: 'POST', path: '/vendors' },
    { method: 'GET', path: '/gst/filings-with-invoices' },
    { method: 'GET', path: '/gst/filings-with-invoices/:gstin' },
    { method: 'GET', path: '/health' },

];

function isWhitelisted(method, path) {
    return whitelist.some(route => {
        if (route.method !== method) return false;

        const matcher = match(route.path, { decode: decodeURIComponent });
        return matcher(path) !== false;
    });
}

function allowRequest(bucketKey, limit, refillRate, windowSeconds) {
    const now = Date.now() / 1000;

    if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
            tokens: limit,
            lastRefill: now
        });
    }

    const bucket = buckets.get(bucketKey);
    const elapsed = now - bucket.lastRefill;

    const refillAmount = elapsed * refillRate;
    bucket.tokens = Math.min(limit, bucket.tokens + refillAmount);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return true;
    }

    return false;
}

function rateLimiter(req, res, next) {
    if (config.developerBypass) {
        return next(); // Skip rate limiting
    }

    const apiKey = req.headers['authorization'];
    const mac = req.headers['mac-address'];
    const path = req.path;
    const method = req.method;

    if (isWhitelisted(method, path)) {
        return next();
    }

    if (!apiKey || !mac) {
        return res.status(400).json({ error: 'Missing API key or MAC address' });
    }

    const identity = `${apiKey}:${mac}`;

    let matchedLimit = config.global;
    if (config.routeOverrides[path]) {
        matchedLimit = config.routeOverrides[path];
    } else {
        const prefix = Object.keys(config.prefixLimits).find(p => path.startsWith(p));
        if (prefix) {
            matchedLimit = config.prefixLimits[prefix];
        }
    }

    const bucketKey = `${identity}:${req.method}:${path}`;

    const allowed = allowRequest(bucketKey, matchedLimit.limit, matchedLimit.refillRate, matchedLimit.window);

    updateMetrics(
        identity,
        `${method} ${path}`,
        !allowed
    );

    if (allowed) return next();
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
}


function updateMetrics(apiKey, routeKey, wasBlocked) {
    if (!metrics[apiKey]) {
        metrics[apiKey] = { totalBlocked: 0, routes: {} };
    }
    if (!metrics[apiKey].routes[routeKey]) {
        metrics[apiKey].routes[routeKey] = { blocked: 0 };
    }
    if (wasBlocked) {
        metrics[apiKey].totalBlocked++;
        metrics[apiKey].routes[routeKey].blocked++;
    }
}

function getRateLimiterMetrics() {
    return metrics; // already structured by API key and route
}


module.exports = {
    rateLimiter,
    // getBlockedCount: () => blockedCount,
    getRateLimiterMetrics
};
