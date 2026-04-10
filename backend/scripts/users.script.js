const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser() {
  try {
    const useruuid = uuidv4();
    const password = "aaditya123";

    const hash_password = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (uuid, name, email, phone, hash_password, created_at, updated_at, isAdmin) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)
       RETURNING uuid, name, email, phone, isAdmin`,
      [useruuid, 'Aaditya', 'aadityasaini@gmail.com', '7906761247', hash_password, false]
    );

    console.log('✅ User created successfully!');
    console.log('User data:', result.rows[0]);
    return result.rows[0];

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    throw error;
  }
}

createUser();