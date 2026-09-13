const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

// Rate limit only signup and login attempts (not check-auth or logout)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 60 : 1000, // Relaxed for dev and reasonable in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again in a few minutes." }
});

router.post("/signup",    authLimiter, authController.signupController);
router.post("/login",     authLimiter, authController.loginController);
router.post("/logout",    authController.logoutController);
router.get("/check-auth", authController.checkAuthController);

module.exports = router;