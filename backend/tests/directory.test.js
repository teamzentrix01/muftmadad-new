const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, randomUUID } = require('node:crypto');
const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env')));
const config = { host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_NAME };
const schema = 'directory_test_' + randomBytes(8).toString('hex');
const adminDb = new Pool(config);
const db = new Pool({ ...config, options: `-c search_path=${schema}` });
const dbPath = require.resolve('../config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
process.env.JWT_SECRET = randomBytes(32).toString('hex');
let server, base;
const request = async (route, method = 'GET', body) => {
    const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
};
before(async () => {
    await adminDb.query(`CREATE SCHEMA ${schema}`);
    const c = await db.connect();
    try {
        await c.query(fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8').replace(/^\\(?:un)?restrict[^\r\n]*\r?$/gm, '').replaceAll('public.', `${schema}.`));
        await c.query(`SET search_path TO ${schema}`);
        for (const name of fs.readdirSync(path.join(__dirname, '../migrations')).filter(n => n.endsWith('.sql')).sort()) {
            await c.query(fs.readFileSync(path.join(__dirname, '../migrations', name), 'utf8'));
        }
        await c.query("INSERT INTO users(id,name,email,phone,hash_password,isadmin) VALUES(1,'Admin','admin@test.invalid','1234567890','unused',true)");
    } finally { c.release(); }
    const app = express(); app.use(express.json({ limit: '50mb' }));
    app.use('/doctors', require('../auth/admin.middleware'), require('../routes/doctors.routes'));
    app.use('/hospitals', require('../auth/admin.middleware'), require('../routes/hospitals.routes'));
    app.use('/specialities', require('../auth/admin.middleware'), require('../routes/specialities.routes'));
    app.use('/admin', require('../auth/admin.middleware'), require('../routes/treatments.routes'));
    app.use('/users', require('../auth/admin.middleware'), require('../routes/userReview.routes'));
    app.use('/blogs', require('../auth/admin.middleware'), require('../routes/blogs.routes'));
    app.use('/admin/cities', require('../auth/admin.middleware'));
    app.use(require('../routes/cities'));
    server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    base = `http://127.0.0.1:${server.address().port}`;
});
test('speciality, treatment, review, blog and city save/update/list routes retain records', async () => {
    const cases = [
        { create: '/specialities', update: '/specialities', list: '/specialities', data: { name_en: 'Test speciality', name_hi: 'परीक्षण', slug: 'test-speciality', image: 'https://example.invalid/image.png', description_en: 'Description', description_hi: 'विवरण', is_active: true }, field: 'description_en', next: 'Updated description' },
        { create: '/admin/create', update: '/admin', list: '/admin/getAll', data: { name: 'Test treatment', slug: 'test-treatment', comes_in: 'Test speciality', overview_description: 'Overview', cost_ranges: [{ hospital_type: 'Private', min_cost: 100, max_cost: 200 }], key_benefits: ['Benefit'] }, field: 'overview_description', next: 'Updated overview' },
        { create: '/users/reviews/create', update: '/users/reviews', list: '/users/reviews', data: { name: 'Test Patient', description: 'Review text', treatment: 'Test treatment', rating: 5, city: 'Test City', date: '2026-09-10' }, field: 'description', next: 'Updated review' },
        { create: '/blogs', update: '/blogs', list: '/blogs?all=true', data: { title: 'Test blog', subtitle: 'Subtitle', author: 'Test Author', publish_date: '2026-09-10', blocks: [{ id: 'one', type: 'paragraph', content: 'Saved content' }], is_published: false }, field: 'title', next: 'Updated blog' },
        { create: '/admin/cities', update: '/admin/cities', list: '/cities', data: { name_en: 'Test City', name_hi: 'परीक्षण', slug: 'test-city', display_order: 1, is_active: true }, field: 'name_en', next: 'Updated City' },
    ];
    for (const item of cases) {
        const created = await request(item.create, 'POST', item.data);
        assert.equal(created.status, 201, `${item.create}: ${JSON.stringify(created.body)}`);
        const record = Array.isArray(created.body) ? created.body[0] : created.body.data;
        assert.ok(record.id, item.create);
        const updated = await request(`${item.update}/${record.id}`, 'PUT', { ...item.data, [item.field]: item.next });
        assert.equal(updated.status, 200, `${item.update}: ${JSON.stringify(updated.body)}`);
        const listed = await request(item.list);
        assert.equal(listed.status, 200);
        const records = Array.isArray(listed.body) ? listed.body : listed.body.data;
        const matches = records.filter(row => String(row.id) === String(record.id));
        assert.equal(matches.length, 1, item.list);
        assert.equal(matches[0][item.field], item.next, item.list);
        if (item.create === '/blogs') assert.deepEqual(matches[0].blocks, item.data.blocks);
    }
});
after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    await db.end();
    assert.match(schema, /^directory_test_[a-f0-9]{16}$/);
    await adminDb.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await adminDb.end();
});
test('doctor create/update persists all form fields and appears in public list without duplicates', async () => {
    const payload = { uuid: randomUUID(), name: 'Test Doctor', email: 'Doctor@Test.invalid', experience_in_years: '', consultation_fee: '', photo: 'data:image/png;base64,' + 'A'.repeat(1000), degrees: ['MBBS'], specialities: ['Orthopaedics'], currently_serving: 'Test Hospital', sitting_plan: ['Monday morning'], serving_in_hospitals: ['Test Hospital'], is_active: true };
    Object.assign(payload, { phone: '9876543210', registration_number: 'TEST-123', city: 'Test City', state: 'Test State', country: 'India', address: 'Doctor address', overview: 'Doctor overview', availability_schedule: [{ day: 'Monday', time: '10:00' }], languages_spoken: ['Hindi', 'English'], awards_and_recognitions: ['Test award'], publications: ['Test publication'], average_rating: 4.5, total_reviews: 2, total_patients_treated: 3, meta_title: 'Doctor title', meta_description: 'Doctor description', is_verified: false, location: { lat: 28.6, lng: 77.2 } });
    const created = await request('/doctors', 'POST', payload);
    for (const [key, value] of Object.entries(payload)) {
        if (['email', 'experience_in_years', 'consultation_fee', 'average_rating', 'location'].includes(key)) continue;
        assert.deepEqual(created.body.data?.[key], value, `Doctor field: ${key}`);
    }
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.data.experience_in_years, 0);
    assert.equal(created.body.data.email, 'doctor@test.invalid');
    assert.equal(created.body.data.photo, payload.photo);
    assert.deepEqual(created.body.data.sitting_plan, payload.sitting_plan);
    for (const reference of [created.body.data.id, payload.uuid]) {
        for (const prefix of ['/doctors/', '/doctors/id/']) {
            const detail = await request(prefix + reference);
            assert.equal(detail.status, 200, JSON.stringify(detail.body));
            assert.equal(detail.body.data.uuid, payload.uuid);
        }
    }
    assert.equal((await request('/doctors/id/not-a-doctor')).status, 400);
    const updated = await request('/doctors/' + payload.uuid, 'PUT', { ...payload, overview: 'Updated overview', consultation_fee: 0 });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.data.currently_serving, 'Test Hospital');
    assert.deepEqual(updated.body.data.location, { x: 28.6, y: 77.2 });
    const list = await request('/doctors?is_active=true');
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].overview, 'Updated overview');
    assert.equal((await request('/doctors', 'POST', { ...payload, uuid: randomUUID() })).status, 400);
});
test('hospital saves photos, certificates, treatments and updates the same public record', async () => {
    const payload = { uuid: randomUUID(), name: 'Test Hospital', slug: 'test-hospital', phone: '9876543210', email: 'hospital@test.invalid', address: 'Test address', city: 'Test City', state: '', country: '', photo: 'data:image/png;base64,' + 'A'.repeat(1000), certificate_files: [{ name: 'certificate.pdf', data: 'data:application/pdf;base64,AAAA' }], available_treatments: ['Knee care'], available_specialities: ['Orthopaedics'] };
    Object.assign(payload, { pincode: '110001', about: 'Hospital overview', timing_display: '24 hours', certifications: ['NABH'], available_services: ['ICU', 'Pharmacy'], gallery_images: ['https://example.invalid/image.png'], total_doctors: 2, total_specialities: 1, is_verified: false, is_active: true, meta_title: 'Hospital title', meta_description: 'Hospital description' });
    const created = await request('/hospitals', 'POST', payload);
    for (const [key, value] of Object.entries(payload)) {
        if (key === 'country') continue;
        assert.deepEqual(created.body.data?.[key], value, `Hospital field: ${key}`);
    }
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.data.country, 'India');
    assert.deepEqual(created.body.data.certificate_files, payload.certificate_files);
    const updated = await request('/hospitals/' + created.body.data.id, 'PUT', { ...payload, about: 'Updated hospital', photo: '', available_treatments: ['Knee care', 'Hip care'] });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.data.photo, null);
    const list = await request('/hospitals');
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].about, 'Updated hospital');
    assert.deepEqual(list.body.data[0].available_treatments, ['Knee care', 'Hip care']);
    for (const route of ['/hospitals/' + created.body.data.id, '/hospitals/slug/' + payload.slug]) {
        const detail = await request(route);
        assert.equal(detail.status, 200, JSON.stringify(detail.body));
        assert.equal(detail.body.data.uuid, payload.uuid);
    }
});
