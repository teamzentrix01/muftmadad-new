const { validateDirectoryContact } = require('../config/directory-validation');
const pool = require('../config/db');
const { randomUUID } = require('node:crypto');
const numericFields = ['experience_in_years', 'consultation_fee', 'average_rating', 'total_reviews', 'total_patients_treated'];
const normalizeDoctor = data => {
    const normalized = { ...data };
    if (typeof normalized.email === 'string') normalized.email = normalized.email.trim().toLowerCase();
    for (const key of numericFields) {
        if (normalized[key] === '') normalized[key] = key === 'consultation_fee' ? null : 0;
    }
    return normalized;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const toPoint = value => !value ? null : typeof value === 'string' ? value : `(${value.x ?? value.lat},${value.y ?? value.lng})`;

const toArray = (val) => Array.isArray(val) ? val : [];

const toJsonb = (val) => {
    if (val === null || val === undefined) return JSON.stringify([]);
    if (typeof val === 'string') {
        try { JSON.parse(val); return val; } catch { return JSON.stringify([]); }
    }
    return JSON.stringify(val);
};

// ─── Field type maps — derived from actual DB schema ─────────────────────────
//
//  Columns visible in screenshot:
//    text[]  → degrees, specialities, languages_spoken,
//              awards_and_recognitions, publications
//    jsonb   → serving_in_hospitals, availability_schedule
//    MISSING → sitting_plan (does NOT exist in the doctors table)

const textArrayFields = [
    'degrees', 'specialities', 'languages_spoken',
    'awards_and_recognitions', 'publications', 'sitting_plan',
];

const jsonbFields = [
    'availability_schedule',
    'serving_in_hospitals', // jsonb in DB — was wrongly treated as text[]
];

// ─── CREATE ─────────────────────────────────────────────────────────────────

const createDoctor = async (data) => {
    validateDirectoryContact(data);
    data = normalizeDoctor(data);
    if (!data.name?.trim() || !data.email?.trim()) throw new Error('Doctor name and email are required');
    const {
        uuid, name, email, photo, phone,
        degrees, specialities, experience_in_years,
        registration_number, city, state, country, address,
        overview, serving_in_hospitals, is_active, is_verified,
        availability_schedule, consultation_fee, languages_spoken,
        awards_and_recognitions, publications, average_rating,
        total_reviews, total_patients_treated, meta_title,
        meta_description, created_at, updated_at
        // sitting_plan intentionally excluded — not a column in the doctors table
    } = data;

    const existing = await pool.query(
        'SELECT uuid FROM doctors WHERE email = $1 AND deleted_at IS NULL',
        [email]
    );
    if (existing.rows.length > 0) {
        throw new Error('A doctor with this email already exists');
    }

    const query = `
        INSERT INTO doctors (
            uuid, name, email, photo, phone,
            degrees, specialities, experience_in_years,
            registration_number, city, state, country, address,
            overview, serving_in_hospitals, is_active, is_verified,
            availability_schedule, consultation_fee, languages_spoken,
            awards_and_recognitions, publications, average_rating,
            total_reviews, total_patients_treated, meta_title,
            meta_description, created_at, updated_at, deleted_at, currently_serving, sitting_plan, location
        ) VALUES (
            $1,  $2,  $3,  $4,  $5,
            $6::text[],  $7::text[],  $8,
            $9,  $10, $11, $12, $13,
            $14, $15::jsonb, $16, $17,
            $18::jsonb, $19, $20::text[],
            $21::text[], $22::text[], $23,
            $24, $25, $26,
            $27, $28, $29, NULL, $30, $31::text[], $32::point
        )
        RETURNING *
    `;

    const values = [
        uuid || randomUUID(),              // $1
        name,                              // $2
        email,                             // $3
        photo || null,                     // $4
        phone || null,                     // $5
        toArray(degrees),                  // $6  text[]
        toArray(specialities),             // $7  text[]
        experience_in_years ?? 0,       // $8
        registration_number || null,       // $9
        city || null,                      // $10
        state || null,                     // $11
        country || null,                   // $12
        address || null,                   // $13
        overview || null,                  // $14
        toJsonb(serving_in_hospitals),     // $15 jsonb (was wrongly text[])
        is_active ?? true,                 // $16
        is_verified ?? false,              // $17
        toJsonb(availability_schedule),    // $18 jsonb
        consultation_fee ?? null,          // $19
        toArray(languages_spoken),         // $20 text[]
        toArray(awards_and_recognitions),  // $21 text[]
        toArray(publications),             // $22 text[]
        average_rating || 0,               // $23
        total_reviews || 0,                // $24
        total_patients_treated || 0,       // $25
        meta_title || null,                // $26
        meta_description || null,          // $27
        created_at || new Date(),          // $28
        updated_at || new Date(),          // $29
        data.currently_serving || null,
        toArray(data.sitting_plan),
        toPoint(data.location)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ─── BULK CREATE ─────────────────────────────────────────────────────────────
// For the hospital onboarding flow — inserts all doctors after hospital is saved.
// Uses sequential inserts so one duplicate email does not block the others.
// Returns { succeeded: [...rows], failed: [{ doctor, reason }] }

const bulkCreateDoctors = async (doctors = []) => {
    const succeeded = [];
    const failed = [];
    for (const doc of doctors) {
        try {
            const created = await createDoctor(doc);
            succeeded.push(created);
        } catch (err) {
            failed.push({ doctor: doc, reason: err.message });
        }
    }
    return { succeeded, failed };
};

// ─── READ ALL (with filters + pagination) ───────────────────────────────────

const getAllDoctors = async (filters = {}, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let p = 1;

    if (filters.city) {
        conditions.push(`city ILIKE $${p++}`);
        values.push(`%${filters.city}%`);
    }
    if (filters.specialty) {
        conditions.push(`EXISTS (SELECT 1 FROM unnest(specialities) s WHERE s ILIKE $${p++})`);
        values.push(filters.specialty);
    }
    if (filters.is_active !== undefined && filters.is_active !== '') {
        conditions.push(`is_active = $${p++}`);
        values.push(filters.is_active === 'true');
    }
    if (filters.is_verified !== undefined && filters.is_verified !== '') {
        conditions.push(`is_verified = $${p++}`);
        values.push(filters.is_verified === 'true');
    }
   // ✅ Case-insensitive JSONB search:
if (filters.hospital) {
    conditions.push(`LOWER(serving_in_hospitals::text) LIKE $${p++}`);
    values.push(`%${filters.hospital.toLowerCase()}%`);
}

    const where = conditions.join(' AND ');
    const countResult = await pool.query(`SELECT COUNT(*) FROM doctors WHERE ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
        `SELECT * FROM doctors WHERE ${where} ORDER BY created_at DESC LIMIT $${p++} OFFSET $${p++}`,
        [...values, limit, offset]
    );

    return {
        doctors: dataResult.rows,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

// ─── READ ONE ────────────────────────────────────────────────────────────────

const getDoctorByUuid = async (uuid) => {
    const result = await pool.query(
        'SELECT * FROM doctors WHERE uuid = $1 AND deleted_at IS NULL', [uuid]
    );
    return result.rows[0] || null;
};

const getDoctorById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM doctors WHERE id = $1 AND deleted_at IS NULL', [id]
    );
    return result.rows[0] || null;
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

const updateDoctor = async (uuid, data) => {
    validateDirectoryContact(data);
    data = normalizeDoctor(data);
    const existing = await pool.query(
        'SELECT uuid FROM doctors WHERE uuid = $1 AND deleted_at IS NULL', [uuid]
    );
    if (existing.rows.length === 0) return null;

    const allowedFields = [
        'name', 'email', 'photo', 'phone', 'currently_serving', 'sitting_plan',
        'degrees', 'specialities', 'experience_in_years', 'registration_number',
        'city', 'state', 'country', 'address', 'overview', 'location',
        'serving_in_hospitals', 'is_active', 'is_verified',
        'availability_schedule', 'consultation_fee', 'languages_spoken',
        'awards_and_recognitions', 'publications', 'average_rating',
        'total_reviews', 'total_patients_treated', 'meta_title', 'meta_description',
        // sitting_plan excluded — not in DB schema
    ];

    const setClauses = [];
    const values = [];
    let p = 1;

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            const val = data[field];
            if (field === 'location') {
                setClauses.push(`${field} = $${p++}::point`);
                values.push(toPoint(val));
            } else if (textArrayFields.includes(field)) {
                setClauses.push(`${field} = $${p++}::text[]`);
                values.push(toArray(val));
            } else if (jsonbFields.includes(field)) {
                setClauses.push(`${field} = $${p++}::jsonb`);
                values.push(toJsonb(val));
            } else {
                setClauses.push(`${field} = $${p++}`);
                values.push(val);
            }
        }
    }

    if (setClauses.length === 0) throw new Error('No valid fields to update');

    setClauses.push(`updated_at = $${p++}`);
    values.push(new Date());
    values.push(uuid);

    const result = await pool.query(
        `UPDATE doctors SET ${setClauses.join(', ')} WHERE uuid = $${p} AND deleted_at IS NULL RETURNING *`,
        values
    );
    return result.rows[0] || null;
};

// ─── SOFT DELETE ─────────────────────────────────────────────────────────────

const deleteDoctor = async (uuid) => {
    const result = await pool.query(
        `UPDATE doctors SET deleted_at = $1, updated_at = $1 WHERE uuid = $2 AND deleted_at IS NULL RETURNING uuid`,
        [new Date(), uuid]
    );
    return result.rows[0] || null;
};

// ─── SEARCH ──────────────────────────────────────────────────────────────────

const searchDoctors = async ({ q, city, specialty, min_fee, max_fee, min_rating }) => {
    const conditions = ['deleted_at IS NULL', 'is_active = true'];
    const values = [];
    let p = 1;

    if (q) { conditions.push(`(name ILIKE $${p} OR overview ILIKE $${p})`); values.push(`%${q}%`); p++; }
    if (city) { conditions.push(`city ILIKE $${p++}`); values.push(`%${city}%`); }
    if (specialty) { conditions.push(`EXISTS (SELECT 1 FROM unnest(specialities) s WHERE s ILIKE $${p++})`); values.push(specialty); }
    if (min_fee) { conditions.push(`consultation_fee >= $${p++}`); values.push(parseFloat(min_fee)); }
    if (max_fee) { conditions.push(`consultation_fee <= $${p++}`); values.push(parseFloat(max_fee)); }
    if (min_rating) { conditions.push(`average_rating >= $${p++}`); values.push(parseFloat(min_rating)); }

    const result = await pool.query(
        `SELECT * FROM doctors WHERE ${conditions.join(' AND ')} ORDER BY average_rating DESC, total_reviews DESC`,
        values
    );
    return result.rows;
};

// ─── TOGGLE STATUS ───────────────────────────────────────────────────────────

const toggleStatus = async (uuid, { is_active, is_verified }) => {
    const setClauses = [];
    const values = [];
    let p = 1;

    if (is_active !== undefined) { setClauses.push(`is_active = $${p++}`); values.push(is_active); }
    if (is_verified !== undefined) { setClauses.push(`is_verified = $${p++}`); values.push(is_verified); }
    if (setClauses.length === 0) throw new Error('No status fields provided');

    setClauses.push(`updated_at = $${p++}`);
    values.push(new Date());
    values.push(uuid);

    const result = await pool.query(
        `UPDATE doctors SET ${setClauses.join(', ')} WHERE uuid = $${p} AND deleted_at IS NULL RETURNING *`,
        values
    );
    return result.rows[0] || null;
};

module.exports = {
    createDoctor,
    bulkCreateDoctors,
    getAllDoctors,
    getDoctorByUuid,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
    toggleStatus,
    getDoctorById,
};