const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');

const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env')));
const config = { host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_NAME };
const schema = 'recycle_bin_test_' + randomBytes(8).toString('hex');
const adminDb = new Pool(config);
const db = new Pool({ ...config, options: `-c search_path=${schema}` });
const dbPath = require.resolve('../config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

process.env.JWT_SECRET = randomBytes(32).toString('hex');
let server, base;

const adminToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
const regularToken = jwt.sign({ userId: 2 }, process.env.JWT_SECRET);

const request = async (route, method = 'GET', body, token = adminToken) => {
    const response = await fetch(base + route, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    const text = await response.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { status: response.status, body: parsed };
};

before(async () => {
    await adminDb.query(`CREATE SCHEMA ${schema}`);
    const c = await db.connect();
    try {
        await c.query(fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8')
            .replace(/^\\(?:un)?restrict[^\r\n]*\r?$/gm, '')
            .replaceAll('public.', `${schema}.`));
        await c.query(`SET search_path TO ${schema}`);
        for (const name of fs.readdirSync(path.join(__dirname, '../migrations')).filter(n => n.endsWith('.sql')).sort()) {
            await c.query(fs.readFileSync(path.join(__dirname, '../migrations', name), 'utf8'));
        }
        await c.query("INSERT INTO users(id, name, email, phone, hash_password, isadmin) VALUES(1, 'Super Admin', 'admin@example.com', '9876543210', 'hash', true)");
        await c.query("INSERT INTO users(id, name, email, phone, hash_password, isadmin) VALUES(2, 'Regular User', 'user@example.com', '9123456780', 'hash', false)");
        await c.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    } finally { c.release(); }

    const app = express();
    app.use(express.json());
    app.use('/api/recycle-bin', require('../routes/recycleBin.routes'));
    app.use('/api/specialities', require('../auth/admin.middleware'), require('../routes/specialities.routes'));

    server = app.listen(0);
    base = `http://localhost:${server.address().port}`;
});

after(async () => {
    server?.close();
    await db.end();
    await adminDb.query(`DROP SCHEMA ${schema} CASCADE`);
    await adminDb.end();
});

test('recycle bin security: non-admins are rejected with 403 or 401', async () => {
    const unauth = await request('/api/recycle-bin/items', 'GET', null, null);
    assert.equal(unauth.status, 401);

    const nonAdmin = await request('/api/recycle-bin/items', 'GET', null, regularToken);
    assert.equal(nonAdmin.status, 403);
});

test('deletion logs deleter info to recycle bin and restore brings it back', async () => {
    // 1. Create a speciality
    const createRes = await request('/api/specialities', 'POST', {
        name_en: 'Cardiology Test',
        name_hi: 'कार्डियोलॉजी टेस्ट',
        slug: 'cardiology-test',
        description: 'Heart care'
    });
    assert.equal(createRes.status, 201);
    const specId = createRes.body.data.id;

    // 2. Delete it
    const delRes = await request(`/api/specialities/${specId}`, 'DELETE');
    assert.equal(delRes.status, 200);

    // 3. Check recycle bin items
    const binRes = await request('/api/recycle-bin/items?entity_type=speciality');
    assert.equal(binRes.status, 200);
    assert.equal(binRes.body.items.length, 1);
    const item = binRes.body.items[0];

    assert.equal(item.entity_type, 'speciality');
    assert.equal(item.entity_name, 'Cardiology Test');
    assert.equal(item.source_dashboard, 'Speciality Dashboard');
    assert.equal(item.deleted_by_name, 'Super Admin');
    assert.equal(item.deleted_by_email, 'admin@example.com');
    assert.equal(item.deleted_by_phone, '9876543210');

    // 4. Restore it
    const restoreRes = await request(`/api/recycle-bin/items/${item.id}/restore`, 'POST');
    assert.equal(restoreRes.status, 200);

    // 5. Verify restored back in specialities
    const checkRes = await request(`/api/specialities/${specId}`);
    assert.equal(checkRes.status, 200);
    assert.equal(checkRes.body.data.name_en, 'Cardiology Test');
});

test('signup and login succeed with name, phone, password and without email', async () => {
    const authService = require('../auth/auth.service');
    const result = await authService.signupService({
        name: 'Rahul Sharma',
        phone: '9876501234',
        password: 'Password@123'
    });
    assert.ok(result.token);
    assert.equal(result.user.name, 'Rahul Sharma');
    assert.equal(result.user.phone, '9876501234');
    assert.equal(result.user.email, null);

    // Verify login with phone + password works seamlessly
    const loginResult = await authService.loginService({
        identifier: '9876501234',
        password: 'Password@123'
    });
    assert.ok(loginResult.token);
    assert.equal(loginResult.user.id, result.user.id);
});
