const pool = require('../config/db');

/**
 * Move a deleted item into the Recycle Bin with complete audit info of the deleter.
 */
async function moveToBin(payload) {
    try {
        const entity_type = payload.entity_type || payload.entityType;
        const entity_id = payload.entity_id || payload.entityId;
        const entity_name = payload.entity_name || payload.entityName;
        const source_dashboard = payload.source_dashboard || payload.sourceDashboard;
        const original_data = payload.original_data || payload.originalData;
        const user = payload.user || payload.deletedByUser;

        const query = `
            INSERT INTO recycle_bin (
                entity_type,
                entity_id,
                entity_name,
                source_dashboard,
                original_data,
                deleted_by_user_id,
                deleted_by_name,
                deleted_by_email,
                deleted_by_phone,
                deleted_at,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'in_bin')
            RETURNING *;
        `;

        const values = [
            entity_type,
            String(entity_id),
            String(entity_name || 'Unnamed Item'),
            String(source_dashboard || 'Admin Dashboard'),
            JSON.stringify(original_data || {}),
            user?.id || null,
            user?.name || 'Administrator',
            user?.email || null,
            user?.phone || null
        ];

        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (error) {
        console.error('Error in moveToBin:', error);
        throw error;
    }
}

/**
 * Get items from the Recycle Bin with filtering and search.
 */
async function getBinItems({ type, entity_type, search, status = 'in_bin', page = 1, limit = 50 }) {
    try {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
        const conditions = [];
        const params = [];

        if (status && status !== 'all') {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        const selectedType = type || entity_type;
        if (selectedType && selectedType !== 'all') {
            params.push(selectedType);
            conditions.push(`entity_type = $${params.length}`);
        }

        if (search && search.trim()) {
            params.push(`%${search.trim()}%`);
            const idx = params.length;
            conditions.push(`(
                entity_name ILIKE $${idx} OR 
                deleted_by_name ILIKE $${idx} OR 
                deleted_by_email ILIKE $${idx} OR 
                deleted_by_phone ILIKE $${idx} OR
                source_dashboard ILIKE $${idx}
            )`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Total count
        const countQuery = `SELECT COUNT(*) as total FROM recycle_bin ${whereClause};`;
        const countRes = await pool.query(countQuery, params);
        const total = parseInt(countRes.rows[0].total, 10);

        // Fetch items
        params.push(limit);
        const limitIdx = params.length;
        params.push(offset);
        const offsetIdx = params.length;

        const dataQuery = `
            SELECT * FROM recycle_bin 
            ${whereClause} 
            ORDER BY deleted_at DESC 
            LIMIT $${limitIdx} OFFSET $${offsetIdx};
        `;
        const res = await pool.query(dataQuery, params);

        return {
            items: res.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error in getBinItems:', error);
        throw error;
    }
}

/**
 * Get statistics for the Recycle Bin.
 */
async function getBinStats() {
    try {
        const inBinCount = await pool.query("SELECT COUNT(*) as count FROM recycle_bin WHERE status = 'in_bin'");
        const restoredCount = await pool.query("SELECT COUNT(*) as count FROM recycle_bin WHERE status = 'restored'");
        
        const typeCounts = await pool.query(`
            SELECT entity_type, COUNT(*) as count 
            FROM recycle_bin 
            WHERE status = 'in_bin' 
            GROUP BY entity_type
        `);

        const lastDeleted = await pool.query(`
            SELECT entity_name, entity_type, deleted_at, deleted_by_name 
            FROM recycle_bin 
            WHERE status = 'in_bin' 
            ORDER BY deleted_at DESC 
            LIMIT 1
        `);

        return {
            inBin: parseInt(inBinCount.rows[0].count, 10),
            restored: parseInt(restoredCount.rows[0].count, 10),
            byType: typeCounts.rows,
            lastDeleted: lastDeleted.rows[0] || null
        };
    } catch (error) {
        console.error('Error in getBinStats:', error);
        throw error;
    }
}

/**
 * Restore an item from the Recycle Bin back to its original table.
 */
async function restoreItem(binId, adminUser) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const binRes = await client.query('SELECT * FROM recycle_bin WHERE id = $1 FOR UPDATE', [binId]);
        if (binRes.rows.length === 0) {
            const err = new Error('Recycle bin item not found');
            err.statusCode = 404;
            throw err;
        }

        const item = binRes.rows[0];
        if (item.status === 'restored') {
            const err = new Error('Item is already restored');
            err.statusCode = 400;
            throw err;
        }

        const data = typeof item.original_data === 'string' ? JSON.parse(item.original_data) : item.original_data;
        const type = item.entity_type;

        // Perform restore based on entity type
        switch (type) {
            case 'account': {
                // Restore user account
                await client.query(
                    `INSERT INTO users (id, uuid, name, email, phone, hash_password, role, post, department, status, isadmin, created_at, updated_at)
                     VALUES ($1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, NOW()), NOW())
                     ON CONFLICT (id) DO UPDATE 
                     SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
                         role = EXCLUDED.role, post = EXCLUDED.post, department = EXCLUDED.department, 
                         status = EXCLUDED.status, updated_at = NOW()`,
                    [
                        data.id,
                        data.uuid,
                        data.name,
                        data.email,
                        data.phone,
                        data.hash_password,
                        data.role || 'user',
                        data.post || null,
                        data.department || null,
                        data.status || 'active',
                        data.isadmin || false,
                        data.created_at
                    ]
                );
                break;
            }

            case 'staff': {
                // Restore staff member
                await client.query(
                    `INSERT INTO staff_members (id, user_id, name, email, phone, post, department, status, notes, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, NOW()), NOW())
                     ON CONFLICT (id) DO UPDATE 
                     SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
                         post = EXCLUDED.post, department = EXCLUDED.department, status = EXCLUDED.status, updated_at = NOW()`,
                    [
                        data.id,
                        data.user_id,
                        data.name,
                        data.email,
                        data.phone,
                        data.post || '-',
                        data.department || '-',
                        data.status || 'pending',
                        data.notes || null,
                        data.created_at
                    ]
                );
                // Also ensure the user role is staff
                if (data.user_id) {
                    await client.query(
                        `UPDATE users SET role = 'staff', post = $1, department = $2, status = $3, updated_at = NOW() WHERE id = $4`,
                        [data.post || '-', data.department || '-', data.status || 'pending', data.user_id]
                    );
                }
                break;
            }

            case 'hospital': {
                // Check if row exists in hospitals (if soft deleted by deleted_at)
                const existing = await client.query('SELECT id FROM hospitals WHERE id = $1', [data.id]);
                if (existing.rows.length > 0) {
                    await client.query('UPDATE hospitals SET deleted_at = NULL, is_active = true, updated_at = NOW() WHERE id = $1', [data.id]);
                } else {
                    await client.query(
                        `INSERT INTO hospitals (
                            id, uuid, name, photo, slug, phone, email, address, city, state, pincode, country, 
                            location, about, opening_hours, timing_display, certifications, total_doctors, total_specialities, 
                            rating, total_reviews, is_verified, is_active, meta_title, meta_description, 
                            available_treatments, available_services, available_specialities, gallery_images, 
                            display_order, certificate_files, created_at, updated_at
                         ) VALUES (
                            $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                            $13, $14, $15, $16, $17, $18, $19,
                            $20, $21, $22, $23, $24, $25,
                            $26, $27, $28, $29,
                            $30, $31, COALESCE($32, NOW()), NOW()
                         ) ON CONFLICT (id) DO UPDATE 
                         SET deleted_at = NULL, is_active = true, updated_at = NOW()`,
                        [
                            data.id, data.uuid, data.name, data.photo, data.slug, data.phone, data.email, data.address, data.city, data.state, data.pincode, data.country,
                            data.location, data.about, data.opening_hours, data.timing_display, data.certifications, data.total_doctors, data.total_specialities,
                            data.rating, data.total_reviews, data.is_verified ?? true, true, data.meta_title, data.meta_description,
                            data.available_treatments, data.available_services, data.available_specialities, data.gallery_images,
                            data.display_order, data.certificate_files, data.created_at
                        ]
                    );
                }
                break;
            }

            case 'doctor': {
                const existing = await client.query('SELECT id FROM doctors WHERE id = $1 OR uuid = $2', [data.id, data.uuid]);
                if (existing.rows.length > 0) {
                    await client.query('UPDATE doctors SET deleted_at = NULL, is_active = true, updated_at = NOW() WHERE id = $1', [existing.rows[0].id]);
                } else {
                    await client.query(
                        `INSERT INTO doctors (
                            id, uuid, name, email, photo, phone, degrees, specialities, experience_in_years, registration_number,
                            city, state, country, address, location, overview, serving_in_hospitals, is_active, is_verified,
                            availability_schedule, consultation_fee, languages_spoken, awards_and_recognitions, publications,
                            average_rating, total_reviews, total_patients_treated, slug, meta_title, meta_description,
                            currently_serving, sitting_plan, created_at, updated_at
                         ) VALUES (
                            $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19,
                            $20, $21, $22, $23, $24,
                            $25, $26, $27, $28, $29, $30,
                            $31, $32, COALESCE($33, NOW()), NOW()
                         ) ON CONFLICT (id) DO UPDATE 
                         SET deleted_at = NULL, is_active = true, updated_at = NOW()`,
                        [
                            data.id, data.uuid, data.name, data.email, data.photo, data.phone, data.degrees, data.specialities, data.experience_in_years, data.registration_number,
                            data.city, data.state, data.country, data.address, data.location, data.overview, data.serving_in_hospitals, true, data.is_verified ?? true,
                            data.availability_schedule, data.consultation_fee, data.languages_spoken, data.awards_and_recognitions, data.publications,
                            data.average_rating, data.total_reviews, data.total_patients_treated, data.slug, data.meta_title, data.meta_description,
                            data.currently_serving, data.sitting_plan, data.created_at
                        ]
                    );
                }
                break;
            }

            case 'treatment': {
                await client.query(
                    `INSERT INTO treatments (
                        id, uuid, name, slug, specialty_id, treatment_image, png_logo, overview_description, key_benefits,
                        who_gets_description, ideal_candidates, not_suitable_for, causes_description, causes_list,
                        symptoms_description, symptoms_list, diagnosis_description, diagnosis_steps,
                        treatment_procedure_description, pre_operative_steps, surgical_procedure_steps, post_operative_steps,
                        cost_description, cost_ranges, cost_factors, ayushman_covered, ayushman_description,
                        ayushman_benefits, ayushman_eligibility, ayushman_claim_steps, surgery_duration, hospital_stay,
                        recovery_time, success_rate, faqs, comes_in, display_order, created_at, updated_at
                     ) VALUES (
                        $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9,
                        $10, $11, $12, $13, $14,
                        $15, $16, $17, $18,
                        $19, $20, $21, $22,
                        $23, $24, $25, $26, $27,
                        $28, $29, $30, $31, $32,
                        $33, $34, $35, $36, $37, COALESCE($38, NOW()), NOW()
                     ) ON CONFLICT (id) DO UPDATE 
                     SET name = EXCLUDED.name, slug = EXCLUDED.slug, updated_at = NOW()`,
                    [
                        data.id, data.uuid, data.name, data.slug, data.specialty_id, data.treatment_image, data.png_logo, data.overview_description, data.key_benefits,
                        data.who_gets_description, data.ideal_candidates, data.not_suitable_for, data.causes_description, data.causes_list,
                        data.symptoms_description, data.symptoms_list, data.diagnosis_description, data.diagnosis_steps,
                        data.treatment_procedure_description, data.pre_operative_steps, data.surgical_procedure_steps, data.post_operative_steps,
                        data.cost_description, data.cost_ranges, data.cost_factors, data.ayushman_covered, data.ayushman_description,
                        data.ayushman_benefits, data.ayushman_eligibility, data.ayushman_claim_steps, data.surgery_duration, data.hospital_stay,
                        data.recovery_time, data.success_rate, data.faqs, data.comes_in, data.display_order, data.created_at
                    ]
                );
                break;
            }

            case 'speciality': {
                await client.query(
                    `INSERT INTO specialities (
                        id, uuid, slug, description, icon, name_en, name_hi, image, description_en, description_hi, is_active, display_order, faqs, created_at, updated_at
                     ) VALUES (
                        $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, COALESCE($14, NOW()), NOW()
                     ) ON CONFLICT (id) DO UPDATE 
                     SET name_en = EXCLUDED.name_en, is_active = true, updated_at = NOW()`,
                    [
                        data.id, data.uuid, data.slug, data.description, data.icon, data.name_en, data.name_hi, data.image,
                        data.description_en, data.description_hi, data.is_active ?? true, data.display_order, data.faqs, data.created_at
                    ]
                );
                break;
            }

            case 'review': {
                await client.query(
                    `INSERT INTO reviews (
                        id, uuid, name, description, treatment, rating, city, date, created_at, updated_at
                     ) VALUES (
                        $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), NOW()
                     ) ON CONFLICT (id) DO UPDATE 
                     SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW()`,
                    [
                        data.id, data.uuid, data.name, data.description, data.treatment, data.rating, data.city, data.date, data.created_at
                    ]
                );
                break;
            }

            case 'city': {
                await client.query(
                    `INSERT INTO cities (
                        id, name_en, name_hi, slug, display_order, is_active, created_at
                     ) VALUES (
                        $1, $2, $3, $4, $5, $6, COALESCE($7, NOW())
                     ) ON CONFLICT (id) DO UPDATE 
                     SET name_en = EXCLUDED.name_en, is_active = true`,
                    [
                        data.id, data.name_en, data.name_hi, data.slug, data.display_order, data.is_active ?? true, data.created_at
                    ]
                );
                break;
            }

            case 'blog': {
                await client.query(
                    `INSERT INTO blogs (
                        id, uuid, title, subtitle, slug, tag, author, publish_date, read_time, bg_image, overlay_opacity, align, text_color, blocks, is_published, created_at, updated_at
                     ) VALUES (
                        $1, COALESCE($2, gen_random_uuid()), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, COALESCE($16, NOW()), NOW()
                     ) ON CONFLICT (id) DO UPDATE 
                     SET title = EXCLUDED.title, is_published = EXCLUDED.is_published, updated_at = NOW()`,
                    [
                        data.id, data.uuid, data.title, data.subtitle, data.slug, data.tag, data.author, data.publish_date,
                        data.read_time, data.bg_image, data.overlay_opacity, data.align, data.text_color, data.blocks,
                        data.is_published, data.created_at
                    ]
                );
                break;
            }

            default:
                throw new Error(`Restore for entity type '${type}' is not supported.`);
        }

        // Update recycle_bin item status
        const updateRes = await client.query(
            `UPDATE recycle_bin 
             SET status = 'restored', 
                 restored_at = NOW(), 
                 restored_by_user_id = $1, 
                 restored_by_name = $2 
             WHERE id = $3 
             RETURNING *;`,
            [adminUser?.id || null, adminUser?.name || 'Administrator', binId]
        );

        await client.query('COMMIT');
        return updateRes.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in restoreItem:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Permanently delete an item from the Recycle Bin.
 */
async function purgeItem(binId) {
    try {
        const res = await pool.query('DELETE FROM recycle_bin WHERE id = $1 RETURNING *;', [binId]);
        if (res.rows.length === 0) {
            const err = new Error('Recycle bin item not found');
            err.statusCode = 404;
            throw err;
        }
        return res.rows[0];
    } catch (error) {
        console.error('Error in purgeItem:', error);
        throw error;
    }
}

/**
 * Permanently empty all items from the Recycle Bin.
 */
async function emptyBin() {
    try {
        const res = await pool.query("DELETE FROM recycle_bin WHERE status = 'in_bin' RETURNING id;");
        return { purgedCount: res.rowCount };
    } catch (error) {
        console.error('Error in emptyBin:', error);
        throw error;
    }
}

module.exports = {
    moveToBin,
    getBinItems,
    getBinStats,
    restoreItem,
    purgeItem,
    emptyBin
};
