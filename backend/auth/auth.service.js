const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signupService = async ({ name, email, phone, password }) => {
    try {
        // 1️⃣ Validate input
        if (!name || !email || !phone || !password) {
            const error = new Error("All fields are required");
            error.statusCode = 400;
            throw error;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            error.field = "email";
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

        // Validate name length
        if (name.trim().length < 2) {
            const error = new Error("Name must be at least 2 characters");
            error.statusCode = 400;
            error.field = "name";
            throw error;
        }

        // 2️⃣ Check if email already exists
        const emailCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (emailCheck.rows.length > 0) {
            const error = new Error("Email already registered");
            error.statusCode = 409;
            error.field = "email";
            throw error;
        }

        // 3️⃣ Check if phone already exists
        const phoneCheck = await pool.query(
            "SELECT id FROM users WHERE phone = $1",
            [phone.replace(/\s/g, '')]
        );

        if (phoneCheck.rows.length > 0) {
            const error = new Error("Phone number already registered");
            error.statusCode = 409;
            error.field = "phone";
            throw error;
        }

        // 4️⃣ Hash password (using 12 rounds is good for security)
        const hash_password = await bcrypt.hash(password, 12);

        // 5️⃣ Insert user into database
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, hash_password, isadmin)
             VALUES ($1, $2, $3, $4, false)
             RETURNING id, uuid, name, email, phone, created_at`,
            [
                name.trim(), 
                email.toLowerCase().trim(), 
                phone.replace(/\s/g, ''), 
                hash_password
            ]
        );

        const newUser = result.rows[0];

        // 6️⃣ Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id,
                email: newUser.email 
            },
            process.env.JWT_SECRET || "your-secret-key-change-this",
            { expiresIn: "7d" } // 7 days for signup
        );

        // 7️⃣ Return user data and token
        return {
            message: "User created successfully",
            token,
            user: {
                id: newUser.id,
                uuid: newUser.uuid,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                createdAt: newUser.created_at
            }
        };

    } catch (error) {
        // Re-throw the error with proper structure
        throw error;
    }
};


exports.loginService = async ({ email, password, rememberMe = false }) => {
    try {
        // 1️⃣ Validate input
        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.statusCode = 400;
            throw error;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            error.field = "email";
            throw error;
        }

        // 2️⃣ Find user by email
        const result = await pool.query(
            "SELECT id, uuid, name, email, phone, hash_password, created_at, isadmin FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            const error = new Error("Invalid email or password");
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

        // 5️⃣ Generate JWT token
        const expiresIn = rememberMe ? "30d" : "1d"; // 30 days if remember me, else 1 day
        
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            process.env.JWT_SECRET || "your-secret-key-change-this",
            { expiresIn }
        );

        // 6️⃣ Return token and user data (exclude password hash)
        return {
            message: "Login successful",
            token,
            expiresIn,
            user: {
                isadmin: !!user.isadmin,
                id: user.id,
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.created_at
            }
        };

    } catch (error) {
        // Re-throw the error with proper structure
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
            "SELECT id, uuid, name, email, phone, created_at, isadmin FROM users WHERE id = $1",
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }

        return {
            user: result.rows[0]
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


// 🚪 Logout (just for consistency, actual logout handled by clearing cookie)
exports.logoutService = async () => {
    return { message: "Logged out successfully" };
};