const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../auth/admin.middleware');
const {
    getBinItemsController,
    getBinStatsController,
    restoreItemController,
    purgeItemController,
    emptyBinController
} = require('../controllers/recycleBin.controller');

// Strictly Administrator Only
router.use(requireAdmin);

router.get('/stats', getBinStatsController);
router.get('/', getBinItemsController);
router.get('/items', getBinItemsController);
router.post('/restore/:id', restoreItemController);
router.post('/:id/restore', restoreItemController);
router.post('/items/:id/restore', restoreItemController);
router.delete('/empty', emptyBinController);
router.delete('/:id', purgeItemController);
router.delete('/items/:id', purgeItemController);

module.exports = router;
