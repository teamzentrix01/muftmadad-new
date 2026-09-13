const authService = require("../auth/auth.service");

// Signup
exports.signupController = async (req, res) => {
    try {
        const { name, email, phone, password, role, account_type, staff_role, post, department, laboratory_id, collector_id } = req.body;
        const result = await authService.signupService({ name, email, phone, password, role, account_type, staff_role, post, department, laboratory_id, collector_id });

        res.cookie('authToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        // ✅ Also send token in body
        res.status(201).json({
            message: result.message,
            token: result.token,   // ← ADD THIS
            user: result.user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const response = { message: error.message || 'Server error.' };
        if (error.field) response.field = error.field;
        res.status(statusCode).json(response);
    }
};

// Login
exports.loginController = async (req, res) => {
    try {
        const { email, identifier, password, rememberMe } = req.body;
        const result = await authService.loginService({ email: email || identifier, identifier, password, rememberMe });

        const maxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

        res.cookie('authToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/',
        });

        // ✅ Also send token in body
        res.status(200).json({
            message: result.message,
            token: result.token,   // ← ADD THIS
            user: result.user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const response = { message: error.message || 'Server error.' };
        if (error.field) response.field = error.field;
        res.status(statusCode).json(response);
    }
};

// Logout
exports.logoutController = async (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Check auth — reads token from Authorization header (reliable)
exports.checkAuthController = async (req, res) => {
    try {
        // ✅ Read from Authorization header instead of cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.authToken;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const result = await authService.verifyTokenService(token);
        res.status(200).json({ user: result.user });
    } catch (error) {
        const statusCode = error.statusCode || 401;
        res.status(statusCode).json({ message: error.message || 'Not authenticated' });
    }
};