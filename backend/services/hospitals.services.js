// services/hospital.services.js
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─── Helper: convert location to PostgreSQL point literal ────────────────────
// Accepts: null | { lat, lng } | { x, y } | "lat,lng" string
const toPoint = (location) => {
    if (!location) return null;
    if (typeof location === 'string') {
        // already a "lat,lng" string
        const parts = location.split(',').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) return `(${parts[0]},${parts[1]})`;
        return null;
    }
    if (typeof location === 'object') {
        const lat = location.lat ?? location.x ?? null;
        const lng = location.lng ?? location.y ?? null;
        if (lat !== null && lng !== null) return `(${lat},${lng})`;
    }
    return null;
};

const createHospitalService = async (data) => {
    const {
        uuid,
        name,
        photo,
        slug,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        country,
        location,       // point column — needs special handling
        about,
        timing_display,
        certifications,
        available_specialities,
        available_services,
        available_treatments,
        gallery_images,
        total_doctors,
        total_specialities,
        is_verified,
        is_active,
        meta_title,
        meta_description,
    } = data;

    const pointValue = toPoint(location); // null or "(lat,lng)" string

    const query = `
    INSERT INTO hospitals (
        uuid, name, photo, slug, phone, email,
        address, city, state, pincode, country, location,
        about, timing_display, certifications,
        available_specialities, available_treatments, available_services, gallery_images,
        total_doctors, total_specialities,
        is_verified, is_active, meta_title, meta_description,
        created_at, updated_at
    )
    VALUES (
        $1,  $2,  $3,  $4,  $5,  $6,
        $7,  $8,  $9,  $10, $11,
        ${pointValue ? `point($12)` : `$12`},
        $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21,
        $22, $23, $24, $25,
        NOW(), NOW()
    )
    RETURNING *
`;

    const values = [
    uuid || uuidv4(),                               // $1
    name,                                           // $2
    photo || null,                                  // $3
    slug,                                           // $4
    phone,                                          // $5
    email,                                          // $6
    address,                                        // $7
    city,                                           // $8
    state,                                          // $9
    pincode || null,                                // $10
    country,                                        // $11
    pointValue,                                     // $12
    about || null,                                  // $13
    timing_display || null,                         // $14
    certifications || [],                           // $15
    available_specialities || [],                   // $16
    available_treatments || [],                     // $17
    available_services || [],                       // $18
    gallery_images || [],                           // $19
    total_doctors || 0,                             // $20
    total_specialities || 0,                        // $21
    is_verified || false,                           // $22
    is_active !== undefined ? is_active : true,     // $23
    meta_title || null,                             // $24
    meta_description || null,                       // $25
];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllHospitalsService = async () => {
    const query = `
        SELECT 
            h.*,
            -- Count real doctors serving at this hospital
            (SELECT COUNT(*) FROM doctors d
             WHERE LOWER(d.serving_in_hospitals::text) LIKE LOWER('%' || h.name || '%')
             AND d.deleted_at IS NULL
            )::int AS real_doctor_count,
            -- Count real specialities from available_specialities array
            COALESCE(array_length(h.available_specialities, 1), 0) AS real_speciality_count
        FROM hospitals h
        WHERE h.deleted_at IS NULL
        ORDER BY h.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// ADD this new function to your existing hospital.services.js
// Place it after getAllHospitalsService

const getHospitalsBySpecialityService = async (specialityName) => {
    const query = `
        SELECT * FROM hospitals
        WHERE deleted_at IS NULL
          AND is_active = true
          AND $1 = ANY(available_specialities)
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [specialityName]);
    return result.rows;
};

// Also add it to module.exports:
// getHospitalsBySpecialityService,

const getHospitalBySlugService = async (slug) => {
    const query = `SELECT * FROM hospitals WHERE slug = $1 AND deleted_at IS NULL`;
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
};

const getHospitalByIdService = async (id) => {
    const query = `SELECT * FROM hospitals WHERE id = $1 AND deleted_at IS NULL`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

const getHospitalsByCityService = async (city) => {
    const query = `
        SELECT * FROM hospitals
        WHERE deleted_at IS NULL
          AND is_active = true
          AND city ILIKE $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [`%${city}%`]);
    return result.rows;
};

const updateHospitalService = async (id, data) => {
    const existing = await pool.query(
        'SELECT * FROM hospitals WHERE id = $1 AND deleted_at IS NULL', [id]
    );
    if (!existing.rows[0]) return null;

    // Merge existing data with new data — only override what was sent
    const merged = { ...existing.rows[0], ...Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    )};

    const pointValue = toPoint(merged.location);

    const query = `
        UPDATE hospitals SET
            name = $1, photo = $2, slug = $3, phone = $4, email = $5,
            address = $6, city = $7, state = $8, pincode = $9, country = $10,
            location = ${pointValue ? `point($11)` : `$11`},
            about = $12, timing_display = $13,
            certifications = $14, total_doctors = $15, total_specialities = $16,
            is_verified = $17, is_active = $18,
            meta_title = $19, meta_description = $20,
            available_specialities = $21,
            available_services = $22,
            gallery_images = $23,
            available_treatments = $24,
            updated_at = NOW()
        WHERE id = $25 AND deleted_at IS NULL
        RETURNING *
    `;

    const values = [
        merged.name,
        merged.photo || null,
        merged.slug,
        merged.phone,
        merged.email,
        merged.address,
        merged.city,
        merged.state,
        merged.pincode || null,
        merged.country,
        pointValue,
        merged.about || null,
        merged.timing_display || null,
        merged.certifications || [],
        merged.total_doctors || 0,
        merged.total_specialities || 0,
        merged.is_verified || false,
        merged.is_active !== undefined ? merged.is_active : true,
        merged.meta_title || null,
        merged.meta_description || null,
        merged.available_specialities || [],
        merged.available_services || [],
        merged.gallery_images || [],
        merged.available_treatments || [],
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const getHospitalsByTreatmentService = async (treatmentName) => {
    const query = `
        SELECT * FROM hospitals
        WHERE deleted_at IS NULL
          AND is_active = true
          AND $1 = ANY(available_treatments)
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [treatmentName]);
    return result.rows;
};

const addGalleryImagesService = async (id, newImages) => {
    const query = `
        UPDATE hospitals
        SET gallery_images = gallery_images || $1::text[],
            updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING gallery_images
    `;
    const result = await pool.query(query, [newImages, id]);
    return result.rows[0] || null;
};

const removeGalleryImageService = async (id, imageUrl) => {
    const query = `
        UPDATE hospitals
        SET gallery_images = array_remove(gallery_images, $1::text),
            updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING gallery_images
    `;
    const result = await pool.query(query, [imageUrl, id]);
    return result.rows[0] || null;
};

const getGalleryImagesService = async (id) => {
    const query = `SELECT gallery_images FROM hospitals WHERE id = $1 AND deleted_at IS NULL`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// WITH this:
const deleteHospitalService = async (id) => {
    const query = `DELETE FROM hospitals WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

module.exports = {
    createHospitalService,
    getAllHospitalsService,
    getHospitalBySlugService,
    getHospitalByIdService,
    updateHospitalService,
    deleteHospitalService,
    addGalleryImagesService,
    removeGalleryImageService,
    getGalleryImagesService,
    getHospitalsBySpecialityService,
    getHospitalsByTreatmentService,
    getHospitalsByCityService
};