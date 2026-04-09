const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createReviewService = async (data) => {
    const reviewUuid = uuidv4();

    const {
        name,
        description,
        treatment,
        rating,
        city,
        date
    } = data;

    const query = `
        INSERT INTO reviews
        (uuid, name, description, treatment, rating, city, date, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
        RETURNING *
    `;

    const values = [
        reviewUuid,
        name,
        description,
        treatment,
        rating,
        city,
        date
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get all reviews
const getAllReviewService = async () => {
    const query = `SELECT * FROM reviews ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
};

const getCityReviewsService = async () => {
    const query = `SELECT city FROM reviews ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    createReviewService,
    getAllReviewService,
    getCityReviewsService
};
