const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function isAllowedOrigin(origin) {
    if (!origin) return true;
    const configured = (process.env.FRONTEND_URL || '').split(',').map(value => value.trim().replace(/\/$/, '')).filter(Boolean);
    if (configured.includes(origin)) return true;
    if (process.env.NODE_ENV === 'production') return false;
    try {
        const url = new URL(origin);
        return ['http:', 'https:'].includes(url.protocol) && localHosts.has(url.hostname);
    } catch {
        return false;
    }
}

module.exports = { isAllowedOrigin };
