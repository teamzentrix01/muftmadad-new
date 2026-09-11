const fs = require('node:fs');
const path = require('node:path');
const pool = require('../config/db');

async function main() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, '../migrations/002_seed_cities.sql'), 'utf8'
        );
        await pool.query(sql);
        console.log('City seed complete. Existing cities were preserved.');
    } finally {
        await pool.end();
    }
}

main().catch(error => {
    console.error('Failed to seed cities:', error.message);
    process.exitCode = 1;
});
