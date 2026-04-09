const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post("/signup",    authController.signupController);
router.post("/login",     authController.loginController);
router.post("/logout",    authController.logoutController);
router.get("/check-auth", authController.checkAuthController);

module.exports = router;