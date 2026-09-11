const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedOrigin } = require('../config/cors');

test('development accepts changing local ports but rejects external origins', () => {
    const env = { ...process.env };
    try {
        process.env.NODE_ENV = 'development';
        process.env.FRONTEND_URL = 'http://localhost:3001';
        for (const origin of ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000']) {
            assert.equal(isAllowedOrigin(origin), true);
        }
        assert.equal(isAllowedOrigin('https://localhost.example.com'), false);
        assert.equal(isAllowedOrigin('null'), false);
        process.env.NODE_ENV = 'production';
        assert.equal(isAllowedOrigin('http://localhost:3000'), false);
        assert.equal(isAllowedOrigin('http://localhost:3001'), true);
        assert.equal(isAllowedOrigin(undefined), true);
    } finally {
        process.env = env;
    }
});
