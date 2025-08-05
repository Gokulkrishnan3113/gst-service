const buckets = new Map();

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
    whitelistedRoutes: [
        { method: 'GET', path: '/vendors' },
        { method: 'POST', path: '/vendors' }

    ],
    developerBypass: false // Can be toggled if needed
};

function isWhitelisted(req) {
    return config.whitelistedRoutes.some(route =>
        route.method === req.method && route.path === req.path
    );
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
    if (config.developerBypass || isWhitelisted(req)) {
        return next(); // Skip rate limiting
    }

    const apiKey = req.headers['authorization'];
    const mac = req.headers['mac-address'];
    const path = req.path;

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

    if (allowed) return next();
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
}

module.exports = rateLimiter;
