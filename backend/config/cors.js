const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function isAllowedOrigin(origin) {
    if (!origin) return true;
    const configured = (process.env.FRONTEND_URL || '').split(',').map(value => value.trim().replace(/\/$/, '')).filter(Boolean);
    if (configured.includes(origin)) return true;
    if (process.env.NODE_ENV === 'production') return false;
    try {
        const url = new URL(origin);
        if (!['http:', 'https:'].includes(url.protocol)) return false;
        if (localHosts.has(url.hostname)) return true;
        if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(url.hostname)) return true;
        return false;
    } catch {
        return false;
    }
}

module.exports = { isAllowedOrigin };
