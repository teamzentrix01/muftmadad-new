const pool = require('../config/db');
const recycleBinService = require('../services/recycleBin.service');

// 1. Get all registered accounts with stats and optional role/search filter
exports.getAllAccountsController = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = `
            SELECT 
                u.id, 
                u.uuid, 
                u.name, 
                u.email, 
                u.phone, 
                u.isadmin, 
                COALESCE(u.role, CASE WHEN u.isadmin THEN 'admin' ELSE 'patient' END) as role, 
                u.post, 
                u.department, 
                u.status, 
                u.created_at, 
                u.updated_at
            FROM users u
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== 'all') {
            params.push(role.toLowerCase());
            query += ` AND (LOWER(u.role) = $${params.length} OR ($${params.length} = 'admin' AND u.isadmin = true))`;
        }

        if (search && search.trim()) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR u.phone LIKE $${params.length})`;
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await pool.query(query, params);

        // Calculate summary metrics
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        const totalPatients = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'patient' OR (role IS NULL AND isadmin = false)");
        const totalStaff = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'staff' OR is_staff = true");
        const totalAdmins = await pool.query('SELECT COUNT(*) FROM users WHERE isadmin = true');

        res.status(200).json({
            success: true,
            total: result.rows.length,
            stats: {
                total: parseInt(totalUsers.rows[0].count, 10),
                patients: parseInt(totalPatients.rows[0].count, 10),
                staff: parseInt(totalStaff.rows[0].count, 10),
                admins: parseInt(totalAdmins.rows[0].count, 10),
            },
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch accounts' });
    }
};

// 2. Delete user account
exports.deleteAccountController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        if (req.adminUser && Number(req.adminUser.id) === Number(id)) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
        }

        const check = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userRow = check.rows[0];
        if (userRow.isadmin) {
            return res.status(403).json({ success: false, message: 'Administrator accounts cannot be deleted directly.' });
        }

        // Archive into recycle bin before deleting
        await recycleBinService.moveToBin({
            entity_type: 'account',
            entity_id: userRow.id,
            entity_name: userRow.name,
            source_dashboard: 'User Accounts',
            original_data: userRow,
            user: req.adminUser || req.user
        });

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: `Account for ${userRow.name} moved to Recycle Bin successfully.`
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete account' });
    }
};

// 3. Update account details / role
exports.updateAccountController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, role, post, department, status } = req.body;

        const check = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = check.rows[0];

        const updated = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 phone = COALESCE($2, phone),
                 role = COALESCE($3, role),
                 post = COALESCE($4, post),
                 department = COALESCE($5, department),
                 status = COALESCE($6, status),
                 updated_at = NOW()
             WHERE id = $7
             RETURNING id, name, email, phone, role, post, department, status, updated_at`,
            [name, phone, role, post, department, status, id]
        );

        // If role is set to staff, ensure present in staff_members
        if (role === 'staff') {
            await pool.query(
                `INSERT INTO staff_members (user_id, name, email, phone, post, department, status, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (user_id) DO UPDATE
                 SET name = EXCLUDED.name,
                     phone = EXCLUDED.phone,
                     post = COALESCE(EXCLUDED.post, staff_members.post, '-'),
                     department = COALESCE(EXCLUDED.department, staff_members.department, '-'),
                     status = COALESCE(EXCLUDED.status, staff_members.status, 'pending'),
                     updated_at = NOW()`,
                [
                    id, 
                    name || user.name, 
                    user.email, 
                    phone || user.phone, 
                    post || '-', 
                    department || '-', 
                    status || 'pending'
                ]
            );
        } else if (role === 'patient') {
            // Remove from staff_members if switched back to patient
            await pool.query('DELETE FROM staff_members WHERE user_id = $1', [id]);
        }

        res.status(200).json({
            success: true,
            message: 'Account updated successfully',
            data: updated.rows[0]
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update account' });
    }
};

// 4. Get all staff members
exports.getAllStaffController = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = `
            SELECT 
                s.id,
                s.user_id,
                s.name,
                s.email,
                s.phone,
                COALESCE(s.post, u.post, '-') as post,
                COALESCE(s.department, u.department, '-') as department,
                COALESCE(s.status, u.status, 'pending') as status,
                s.notes,
                s.created_at,
                s.updated_at,
                u.created_at as user_registered_at,
                u.isadmin
            FROM staff_members s
            LEFT JOIN users u ON u.id = s.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            params.push(status.toLowerCase());
            query += ` AND LOWER(s.status) = $${params.length}`;
        }

        if (search && search.trim()) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(s.name) LIKE $${params.length} OR LOWER(s.email) LIKE $${params.length} OR s.phone LIKE $${params.length} OR LOWER(s.post) LIKE $${params.length} OR LOWER(s.department) LIKE $${params.length})`;
        }

        query += ` ORDER BY s.created_at DESC`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch staff members' });
    }
};

// 5. Update a staff member's Post / Designation and department
exports.updateStaffPostController = async (req, res) => {
    try {
        const { id } = req.params;
        const { post, department, status, notes } = req.body;

        if (!post && !department && !status && notes === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide at least one field to update' });
        }

        // Check if staff record exists
        const staffRes = await pool.query('SELECT * FROM staff_members WHERE id = $1', [id]);
        if (staffRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        const current = staffRes.rows[0];
        const newPost = post !== undefined ? (post.trim() || '-') : (current.post || '-');
        const newDept = department !== undefined ? (department.trim() || '-') : (current.department || '-');
        const newStatus = status !== undefined ? (status.trim() || 'pending') : (current.status || 'pending');
        const newNotes = notes !== undefined ? notes : current.notes;

        const updated = await pool.query(
            `UPDATE staff_members
             SET post = $1,
                 department = $2,
                 status = $3,
                 notes = $4,
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [newPost, newDept, newStatus, newNotes, id]
        );

        // Also sync post and department into the users table
        if (current.user_id) {
            await pool.query(
                `UPDATE users 
                 SET post = $1, department = $2, status = $3, updated_at = NOW() 
                 WHERE id = $4`,
                [newPost, newDept, newStatus, current.user_id]
            );
        }

        res.status(200).json({
            success: true,
            message: `Post and details updated for ${current.name}`,
            data: updated.rows[0]
        });
    } catch (error) {
        console.error('Error updating staff post:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update staff post' });
    }
};

// 6. Delete or remove staff member
exports.deleteStaffController = async (req, res) => {
    try {
        const { id } = req.params;
        const staffRes = await pool.query('SELECT * FROM staff_members WHERE id = $1', [id]);
        if (staffRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        const staff = staffRes.rows[0];

        // Archive into recycle bin before deleting
        await recycleBinService.moveToBin({
            entity_type: 'staff',
            entity_id: staff.id,
            entity_name: staff.name,
            source_dashboard: 'Staff & Posts',
            original_data: staff,
            user: req.adminUser || req.user
        });

        // Delete from staff_members
        await pool.query('DELETE FROM staff_members WHERE id = $1', [id]);

        // Revert user role to patient
        if (staff.user_id) {
            await pool.query(
                `UPDATE users SET role = 'patient', post = NULL, updated_at = NOW() WHERE id = $1`,
                [staff.user_id]
            );
        }

        res.status(200).json({
            success: true,
            message: `${staff.name} removed from staff directory.`
        });
    } catch (error) {
        console.error('Error removing staff member:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to remove staff member' });
    }
};
