const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../auth/admin.middleware');
const {
    getAllAccountsController,
    updateAccountController,
    deleteAccountController,
    getAllStaffController,
    updateStaffPostController,
    deleteStaffController
} = require('../controllers/adminUsers.controller');

// All these routes require Administrator privilege
router.use(requireAdmin);

// User Accounts Management
router.get('/accounts', getAllAccountsController);
router.put('/accounts/:id', updateAccountController);
router.delete('/accounts/:id', deleteAccountController);

// Staff Directory & Post Management
router.get('/staff', getAllStaffController);
router.put('/staff/:id', updateStaffPostController);
router.delete('/staff/:id', deleteStaffController);

module.exports = router;
