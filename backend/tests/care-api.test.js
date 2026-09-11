const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('care client handles errors, authentication, cancellation and fresh reads', async () => {
    const originalFetch = global.fetch;
    const originalUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4002/api/';
        const source = fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/care-api.js'), 'utf8');
        const { careApi } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
        global.fetch = async (url, options) => {
            assert.equal(url, 'http://localhost:4002/api/care/catalog');
            assert.equal(options.credentials, 'include');
            assert.equal(options.cache, 'no-store');
            return Response.json({ hospitals: [] });
        };
        assert.deepEqual(await careApi('/catalog'), { hospitals: [] });
        global.fetch = async () => Response.json({ message: 'Please log in.' }, { status: 401 });
        await assert.rejects(careApi('/appointments'), error => error.status === 401);
        global.fetch = async () => { throw new TypeError('Failed to fetch'); };
        await assert.rejects(careApi('/catalog'), /Cannot connect/);
        global.fetch = async () => new Response('<html>Bad gateway</html>', { status: 502 });
        await assert.rejects(careApi('/catalog'), /invalid response/);
        const controller = new AbortController();
        controller.abort();
        global.fetch = async (_url, options) => { options.signal.throwIfAborted(); };
        await assert.rejects(careApi('/catalog', { signal: controller.signal }), error => error.name === 'AbortError');
    } finally {
        global.fetch = originalFetch;
        if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
        else process.env.NEXT_PUBLIC_API_URL = originalUrl;
    }
});
