const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUserStaffDetails = async (userId) => {
    try {
        const staffRes = await pool.query(
            `SELECT post, department, status FROM staff_members WHERE user_id = $1`,
            [userId]
        );
        const staffMember = staffRes.rows[0];

        const res = await pool.query(
            `SELECT m.laboratory_id, m.collector_id, 
                    l.name as laboratory_name, c.name as collector_name
             FROM lab_memberships m
             LEFT JOIN lab_laboratories l ON l.id = m.laboratory_id
             LEFT JOIN lab_collectors c ON c.id = m.collector_id
             WHERE m.user_id = $1`,
            [userId]
        );
        const row = res.rows[0] || {};
        const is_staff = Boolean(staffMember || row.laboratory_id || row.collector_id);
        const staff_role = row.laboratory_id ? 'laboratory' : (row.collector_id ? 'collector' : (staffMember?.post || null));
        return {
            is_staff,
            staff_role,
            post: staffMember?.post || (is_staff ? '-' : null),
            department: staffMember?.department || (is_staff ? '-' : null),
            staff_status: staffMember?.status || (is_staff ? 'pending' : 'active'),
            membership: {
                laboratory_id: row.laboratory_id || null,
                collector_id: row.collector_id || null,
                laboratory_name: row.laboratory_name || null,
                collector_name: row.collector_name || null,
                role: staff_role,
                post: staffMember?.post || (is_staff ? '-' : null)
            }
        };
    } catch {
        return { is_staff: false, staff_role: null, post: null, department: null, staff_status: 'pending', membership: null };
    }
};

exports.signupService = async ({ name, email, phone, password, role, account_type, staff_role, post, department, laboratory_id, collector_id }) => {
    try {
        // 1️⃣ Validate required fields (name, phone, password are compulsory; email is optional)
        if (!name || !phone || !password) {
            const error = new Error("Name, mobile number, and password are required");
            error.statusCode = 400;
            throw error;
        }

        // Validate name (alphabets and spaces only, at least 2 chars)
        const nameClean = (name || '').trim();
        const nameRegex = /^[a-zA-Z\s]{2,60}$/;
        if (!nameRegex.test(nameClean)) {
            const error = new Error("Name must contain only alphabets (at least 2 characters)");
            error.statusCode = 400;
            error.field = "name";
            throw error;
        }

        // Validate phone (10 digits starting with 6, 7, 8, or 9)
        const rawDigits = phone.replace(/\D/g, '');
        const cleanPhone = (rawDigits.length === 12 && rawDigits.startsWith('91'))
            ? rawDigits.slice(2)
            : (rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits);

        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            const error = new Error("Invalid mobile number. Mobile number must be 10 digits and start with 6, 7, 8, or 9");
            error.statusCode = 400;
            error.field = "phone";
            throw error;
        }

        // Validate password strength (8+ chars, uppercase, lowercase, number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            const error = new Error("Password must be at least 8 characters with uppercase, lowercase, and number");
            error.statusCode = 400;
            error.field = "password";
            throw error;
        }

        // Email is OPTIONAL: validate and check uniqueness only if provided
        let cleanEmail = null;
        if (email && typeof email === 'string' && email.trim()) {
            const emailTrimmed = email.trim().toLowerCase();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailTrimmed)) {
                const error = new Error("Invalid email format. Please enter a valid email address");
                error.statusCode = 400;
                error.field = "email";
                throw error;
            }

            const emailCheck = await pool.query(
                "SELECT id FROM users WHERE email = $1",
                [emailTrimmed]
            );

            if (emailCheck.rows.length > 0) {
                const error = new Error("Email already registered");
                error.statusCode = 409;
                error.field = "email";
                throw error;
            }
            cleanEmail = emailTrimmed;
        }

        // 3️⃣ Check if phone already exists
        const phoneCheck = await pool.query(
            "SELECT id FROM users WHERE phone = $1 OR RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1",
            [cleanPhone]
        );

        if (phoneCheck.rows.length > 0) {
            const error = new Error("Phone number already registered");
            error.statusCode = 409;
            error.field = "phone";
            throw error;
        }

        // 4️⃣ Determine user role (patient or staff)
        const isStaffSignup = (account_type === 'staff' || role === 'staff' || !!staff_role);
        const userRole = isStaffSignup ? 'staff' : 'patient';
        // When user creates staff account, post='-', department='-', and status='pending' - admin will fill all 3!
        const initialPost = isStaffSignup ? '-' : null;
        const initialDept = isStaffSignup ? '-' : null;
        const initialStatus = isStaffSignup ? 'pending' : 'active';

        // 5️⃣ Hash password (using 12 rounds is good for security)
        const hash_password = await bcrypt.hash(password, 12);

        // 6️⃣ Insert user into database
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, hash_password, isadmin, role, post, department, status)
             VALUES ($1, $2, $3, $4, false, $5, $6, $7, $8)
             RETURNING id, uuid, name, email, phone, role, post, department, status, created_at`,
            [
                nameClean, 
                cleanEmail, 
                cleanPhone, 
                hash_password,
                userRole,
                initialPost,
                initialDept,
                initialStatus
            ]
        );

        const newUser = result.rows[0];

        // 7️⃣ If staff signup, automatically insert into staff_members table with post='-', department='-', status='pending' (to be filled by admin)
        if (isStaffSignup) {
            await pool.query(
                `INSERT INTO staff_members (user_id, name, email, phone, post, department, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
                 ON CONFLICT (user_id) DO UPDATE 
                 SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
                     post = COALESCE(staff_members.post, EXCLUDED.post),
                     department = COALESCE(staff_members.department, EXCLUDED.department),
                     status = COALESCE(staff_members.status, EXCLUDED.status),
                     updated_at = now()`,
                [
                    newUser.id,
                    newUser.name,
                    newUser.email,
                    newUser.phone,
                    '-',
                    '-',
                    'pending'
                ]
            );

            // Also maintain lab memberships if laboratory or collector specified
            if (staff_role === 'laboratory' || staff_role === 'collector') {
                let labId = laboratory_id ? Number(laboratory_id) : null;
                let colId = collector_id ? Number(collector_id) : null;

                if (staff_role === 'laboratory' && !labId) {
                    const existingLab = await pool.query("SELECT id FROM lab_laboratories WHERE is_active = true ORDER BY id LIMIT 1");
                    if (existingLab.rows.length > 0) {
                        labId = existingLab.rows[0].id;
                    } else {
                        const newLab = await pool.query(
                            "INSERT INTO lab_laboratories (name, phone, address, is_active) VALUES ($1, $2, $3, true) RETURNING id",
                            [`${name.trim()} Diagnostic Lab`, phone.replace(/\s/g, ''), 'Main Facility']
                        );
                        labId = newLab.rows[0].id;
                    }
                } else if (staff_role === 'collector' && !colId) {
                    const areaRes = await pool.query("SELECT id FROM lab_areas WHERE is_active = true ORDER BY id LIMIT 1");
                    let areaId = areaRes.rows[0]?.id;
                    if (!areaId) {
                        const newArea = await pool.query(
                            "INSERT INTO lab_areas (name, pincode, collection_fee, is_active) VALUES ('Central Zone', '110001', 0, true) RETURNING id"
                        );
                        areaId = newArea.rows[0].id;
                    }
                    const newCol = await pool.query(
                        "INSERT INTO lab_collectors (name, phone, area_id, is_active) VALUES ($1, $2, $3, true) RETURNING id",
                        [name.trim(), phone.replace(/\s/g, ''), areaId]
                    );
                    colId = newCol.rows[0].id;
                }

                if (labId || colId) {
                    await pool.query(
                        "INSERT INTO lab_memberships (user_id, laboratory_id, collector_id) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET laboratory_id = $2, collector_id = $3",
                        [newUser.id, labId, colId]
                    );
                }
            }
        }

        const staffDetails = await getUserStaffDetails(newUser.id);

        // 8️⃣ Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id,
                email: newUser.email 
            },
            process.env.JWT_SECRET || "your-secret-key-change-this",
            { expiresIn: "7d" }
        );

        // 9️⃣ Return user data and token
        return {
            message: isStaffSignup ? "Staff account created successfully" : "User created successfully",
            token,
            user: {
                id: newUser.id,
                uuid: newUser.uuid,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: userRole,
                post: isStaffSignup ? (staffDetails.post || initialPost) : null,
                department: isStaffSignup ? (staffDetails.department || initialDept) : null,
                status: isStaffSignup ? (staffDetails.staff_status || initialStatus) : 'active',
                createdAt: newUser.created_at,
                isadmin: false,
                is_staff: isStaffSignup || staffDetails.is_staff,
                staff_role: staffDetails.staff_role,
                membership: staffDetails.membership
            }
        };

    } catch (error) {
        throw error;
    }
};


exports.loginService = async ({ email, identifier, password, rememberMe = false }) => {
    try {
        const inputId = String(identifier || email || '').trim();
        // 1️⃣ Validate input
        if (!inputId || !password) {
            const error = new Error("Email or mobile number and password are required");
            error.statusCode = 400;
            throw error;
        }

        const cleanEmail = inputId.toLowerCase();
        const cleanPhone = inputId.replace(/[\s\-\(\)\+]/g, '');
        const digitsOnly = inputId.replace(/\D/g, '');
        const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '';

        // 2️⃣ Find user by email or phone (handles exact, cleaned, and last-10 digits match)
        const result = await pool.query(
            `SELECT id, uuid, name, email, phone, hash_password, created_at, isadmin, role, post, department, status 
             FROM users 
             WHERE email = $1 
                OR phone = $2 
                OR phone = $3
                OR ($4 != '' AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $4)`,
            [cleanEmail, cleanPhone, inputId, last10]
        );

        if (result.rows.length === 0) {
            const error = new Error("Invalid email/phone or password");
            error.statusCode = 401;
            throw error;
        }

        const user = result.rows[0];

        // 3️⃣ Verify password
        const isMatch = await bcrypt.compare(password, user.hash_password);
        
        if (!isMatch) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // 4️⃣ Update last login timestamp (optional)
        await pool.query(
            "UPDATE users SET updated_at = NOW() WHERE id = $1",
            [user.id]
        );

        // 5️⃣ Check staff membership
        const staffDetails = await getUserStaffDetails(user.id);
        const resolvedRole = user.isadmin ? 'admin' : (user.role === 'staff' || staffDetails.is_staff ? 'staff' : (user.role || 'patient'));

        // 6️⃣ Generate JWT token
        const expiresIn = rememberMe ? "30d" : "1d";
        
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            process.env.JWT_SECRET || "your-secret-key-change-this",
            { expiresIn }
        );

        // 7️⃣ Return token and user data
        return {
            message: "Login successful",
            token,
            expiresIn,
            user: {
                isadmin: !!user.isadmin,
                role: resolvedRole,
                post: staffDetails.post || user.post || (resolvedRole === 'staff' ? '-' : null),
                department: staffDetails.department || user.department || (resolvedRole === 'staff' ? '-' : null),
                status: staffDetails.staff_status || user.status || (resolvedRole === 'staff' ? 'pending' : 'active'),
                is_staff: Boolean(resolvedRole === 'staff' || staffDetails.is_staff),
                staff_role: staffDetails.staff_role,
                membership: staffDetails.membership,
                id: user.id,
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        };

    } catch (error) {
        throw error;
    }
};


// 🔒 Verify Token (Middleware helper)
exports.verifyTokenService = async (token) => {
    try {
        if (!token) {
            const error = new Error("No token provided");
            error.statusCode = 401;
            throw error;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");

        // Get user from database
        const result = await pool.query(
            "SELECT id, uuid, name, email, phone, created_at, isadmin, role, post, department, status FROM users WHERE id = $1",
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }

        const user = result.rows[0];
        const staffDetails = await getUserStaffDetails(user.id);
        const resolvedRole = user.isadmin ? 'admin' : (user.role === 'staff' || staffDetails.is_staff ? 'staff' : (user.role || 'patient'));

        return {
            user: {
                ...user,
                isadmin: !!user.isadmin,
                role: resolvedRole,
                post: staffDetails.post || user.post || (resolvedRole === 'staff' ? '-' : null),
                department: staffDetails.department || user.department || (resolvedRole === 'staff' ? '-' : null),
                status: staffDetails.staff_status || user.status || (resolvedRole === 'staff' ? 'pending' : 'active'),
                is_staff: Boolean(resolvedRole === 'staff' || staffDetails.is_staff),
                staff_role: staffDetails.staff_role,
                membership: staffDetails.membership
            }
        };

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            const customError = new Error("Invalid token");
            customError.statusCode = 401;
            throw customError;
        }
        if (error.name === "TokenExpiredError") {
            const customError = new Error("Token expired");
            customError.statusCode = 401;
            throw customError;
        }
        throw error;
    }
};


// 🚪 Logout
exports.logoutService = async () => {
    return { message: "Logged out successfully" };
};