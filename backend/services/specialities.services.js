const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createSpecialityService = async (data) => {
    const {
        name_en, name_hi, slug, image,
        description_en, description_hi, is_active = true
    } = data;

    const result = await pool.query(
        `INSERT INTO specialities 
         (uuid, name_en, name_hi, slug, image, description_en, description_hi, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [uuidv4(), name_en, name_hi, slug, image || null, description_en || null, description_hi || null, is_active]
    );
    return { success: true, data: result.rows[0] };
    
};

const getAllSpecialitiesService = async () => {
    const result = await pool.query(
        `SELECT * FROM specialities WHERE is_active = true ORDER BY id ASC`
    );
    return { success: true, data: result.rows };
};

const getSpecialityBySlugService = async (slug) => {
    const result = await pool.query(
        `SELECT * FROM specialities WHERE slug = $1`, [slug]
    );
    if (!result.rows[0]) throw new Error('Speciality not found');
    return { success: true, data: result.rows[0] };
};

const getSpecialityByIdService = async (id) => {
    const result = await pool.query(
        `SELECT * FROM specialities WHERE id = $1`, [id]
    );
    if (!result.rows[0]) throw new Error('Speciality not found');
    return { success: true, data: result.rows[0] };
};

const deleteSpecialityService = async (id) => {
    const result = await pool.query(
        `DELETE FROM specialities WHERE id = $1 RETURNING id`, [id]
    );
    if (!result.rows[0]) throw new Error('Speciality not found');
    return { success: true, data: result.rows[0] };
};

// ✅ Added — update speciality by id
const updateSpecialityService = async (id, data) => {
    const {
        name_en, name_hi, slug, image,
        description_en, description_hi, is_active
    } = data;

    const result = await pool.query(
        `UPDATE specialities SET
            name_en        = COALESCE($1, name_en),
            name_hi        = COALESCE($2, name_hi),
            slug           = COALESCE($3, slug),
            image          = COALESCE($4, image),
            description_en = COALESCE($5, description_en),
            description_hi = COALESCE($6, description_hi),
            is_active      = COALESCE($7, is_active),
            updated_at     = NOW()
         WHERE id = $8
         RETURNING *`,
        [
            name_en        || null,
            name_hi        || null,
            slug           || null,
            image          || null,
            description_en || null,
            description_hi || null,
            is_active !== undefined ? is_active : null,
            id
        ]
    );
    if (!result.rows[0]) throw new Error('Speciality not found');
    return { success: true, data: result.rows[0] };
};

module.exports = {
    createSpecialityService,
    getAllSpecialitiesService,
    getSpecialityBySlugService,
    getSpecialityByIdService,
    deleteSpecialityService,
    updateSpecialityService,  // ✅
};