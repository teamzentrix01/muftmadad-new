const {
    createSpecialityService,
    getAllSpecialitiesService,
    getSpecialityBySlugService,
    getSpecialityByIdService,
    deleteSpecialityService,
    updateSpecialityService,

    
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

module.exports = {
    createSpeciality,
    getAllSpecialities,
    getSpecialityBySlug,
    getSpecialityById,
    deleteSpeciality,
    updateSpeciality,
};