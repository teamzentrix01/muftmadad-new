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

const getCityReviewsService = async (city) => {
    const query = `
        SELECT * FROM reviews 
        WHERE LOWER(city) = LOWER($1) 
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [city]);
    return result.rows;
};

const updateReviewService = async (id, data) => {
    const { name, description, treatment, rating, city, date } = data;
    const query = `
        UPDATE reviews
        SET name=$1, description=$2, treatment=$3, rating=$4, city=$5, date=$6, updated_at=NOW()
        WHERE id=$7
        RETURNING *
    `;
    const values = [name, description, treatment, rating, city, date, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteReviewService = async (id) => {
    const query = `DELETE FROM reviews WHERE id=$1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createReviewService,
    getAllReviewService,
    getCityReviewsService,
      updateReviewService,      // ← add
    deleteReviewService 
};
