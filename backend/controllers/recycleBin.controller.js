const recycleBinService = require('../services/recycleBin.service');

exports.getBinItemsController = async (req, res) => {
    try {
        const { type, search, status, page, limit } = req.query;
        const result = await recycleBinService.getBinItems({
            type,
            search,
            status,
            page,
            limit
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('getBinItemsController error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch recycle bin items' });
    }
};

exports.getBinStatsController = async (req, res) => {
    try {
        const stats = await recycleBinService.getBinStats();
        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error('getBinStatsController error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch recycle bin stats' });
    }
};

exports.restoreItemController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }
        const restored = await recycleBinService.restoreItem(id, req.adminUser || req.user);
        res.status(200).json({
            success: true,
            message: `Successfully restored ${restored.entity_name} back to ${restored.source_dashboard}.`,
            item: restored
        });
    } catch (error) {
        console.error('restoreItemController error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to restore item' });
    }
};

exports.purgeItemController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }
        const purged = await recycleBinService.purgeItem(id);
        res.status(200).json({
            success: true,
            message: `Permanently deleted ${purged.entity_name} from recycle bin.`,
            item: purged
        });
    } catch (error) {
        console.error('purgeItemController error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to permanently delete item' });
    }
};

exports.emptyBinController = async (req, res) => {
    try {
        const result = await recycleBinService.emptyBin();
        res.status(200).json({
            success: true,
            message: `Recycle bin emptied. ${result.purgedCount} items permanently deleted.`
        });
    } catch (error) {
        console.error('emptyBinController error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to empty recycle bin' });
    }
};
