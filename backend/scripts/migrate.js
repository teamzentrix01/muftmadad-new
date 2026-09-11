const fs = require('node:fs');
const path = require('node:path');
const pool = require('../config/db');

(async () => {
    const client = await pool.connect();
    try {
        await client.query('SELECT pg_advisory_lock(824619)');
        await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
        for (const name of fs.readdirSync(path.join(__dirname, '../migrations')).filter(n => n.endsWith('.sql')).sort()) {
            if ((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name])).rowCount) continue;
            const sql = fs.readFileSync(path.join(__dirname, '../migrations', name), 'utf8').replace(/^BEGIN;\s*/m, '').replace(/^COMMIT;\s*/m, '');
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
            await client.query('COMMIT');
            console.log(`Applied ${name}`);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await client.query('SELECT pg_advisory_unlock(824619)');
        client.release();
        await pool.end();
    }
})();
