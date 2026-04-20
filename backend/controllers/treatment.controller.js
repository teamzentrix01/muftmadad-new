const { createTreatmentService, getAllTreatmentService, getTreatmentBySpecialtyIdService, updateTreatmentService, deleteTreatmentService, reorderTreatmentService } = require("../services/treatment.services")


const createTreatmentController = async (req, res) => {
    try {

        const treatmentData = req.body;

        // Basic validation
        if (!treatmentData.name || !treatmentData.slug) {
            return res.status(400).json({
                success: false,
                message: 'Name and slug are required fields'
            });
        }

        const result = await createTreatmentService(treatmentData);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error in createTreatment controller:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.error || error.message
        });
    }
};

const getAllTreatmentController = async (req, res) => {
    try {
        const result = await getAllTreatmentService();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getAllTreatment controller:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.error || error.message
        });
    }
};

const getTreatmentBySpecialtyIdController = async (req, res) => {
    try {
        const { specialty_id } = req.params;
        
        if (!specialty_id) {
            return res.status(400).json({
                success: false,
                message: 'specialty_id is required'
            });
        }

        const result = await getTreatmentBySpecialtyIdService(specialty_id);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getTreatmentBySpecialtyId controller:', error);
        return res.status(404).json({
            success: false,
            message: error.message || 'Treatment not found',
        });
    }
};

const updateTreatmentController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateTreatmentService(id, req.body);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in updateTreatment controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update treatment',
        });
    }
};

const deleteTreatmentController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteTreatmentService(id);
        return res.status(200).json({ success: true, message: 'Treatment deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTreatment controller:', error);
        return res.status(404).json({
            success: false,
            message: error.message || 'Treatment not found',
        });
    }
};

const reorderTreatmentController = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds must be a non-empty array' });
        }
        await reorderTreatmentService(orderedIds);
        return res.status(200).json({ message: 'Order saved successfully' });
    } catch (error) {
        console.error('Reorder treatments error:', error);
        return res.status(500).json({ message: 'Failed to save order' });
    }
};

module.exports = { createTreatmentController, getAllTreatmentController, getTreatmentBySpecialtyIdController, updateTreatmentController,deleteTreatmentController, reorderTreatmentController }