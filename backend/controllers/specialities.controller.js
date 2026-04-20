const {
    createSpecialityService,
    getAllSpecialitiesService,
    getSpecialityBySlugService,
    getSpecialityByIdService,
    deleteSpecialityService,
    updateSpecialityService,

    reorderSpecialitiesService,

    
} = require('../services/specialities.services');

const createSpeciality = async (req, res) => {
    try {
        const result = await createSpecialityService(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllSpecialities = async (req, res) => {
    try {
        const result = await getAllSpecialitiesService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSpecialityBySlug = async (req, res) => {
    try {
        const result = await getSpecialityBySlugService(req.params.slug);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const getSpecialityById = async (req, res) => {
    try {
        const result = await getSpecialityByIdService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};


const deleteSpeciality = async (req, res) => {
    try {
        const result = await deleteSpecialityService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const updateSpeciality = async (req, res) => {
    try {
        const result = await updateSpecialityService(req.params.id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const reorderSpecialities = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds must be a non-empty array' });
        }
        await reorderSpecialitiesService(orderedIds);
        return res.status(200).json({ message: 'Order saved successfully' });
    } catch (error) {
        console.error('Reorder specialities error:', error);
        return res.status(500).json({ message: 'Failed to save order' });
    }
};

module.exports = {
    createSpeciality,
    getAllSpecialities,
    getSpecialityBySlug,
    getSpecialityById,
    deleteSpeciality,
    updateSpeciality,
    reorderSpecialities,
};