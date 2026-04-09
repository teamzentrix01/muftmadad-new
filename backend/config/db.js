// const { Pool } = require("pg");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // full Neon URL
//   ssl: {
//     rejectUnauthorized: false, // required for Neon
//   },
// });

// pool.on("connect", () => {
//   console.log("Database connected successfully");
// });

// pool.on("error", (err) => {
//   console.error("Database error:", err);
// });

// module.exports = pool;




//const { Pool } = require('pg');

//const pool = new Pool({
    //user: 'postgres',
    //host: 'localhost',
    //database: 'muftmadad',
    //password: process.env.DB_PASSWORD,
  //  port: 5432,
//})

//pool.on('connect', () => {
  //  console.log("the database connected successfully ")
//})
//pool.on('error', () => {
  //  console.log('the error is occur at db.js file ', err);
//})

//module.exports = pool;


const { Pool } = require('pg');
require('dotenv').config({ path: '/var/www/muftmadad/backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


pool.on('connect', () => {
    console.log("✅ Database connected successfully as:", process.env.DB_USER);
});

pool.on('error', (err) => {
    console.log('❌ DB Error:', err);
});


module.exports = pool;