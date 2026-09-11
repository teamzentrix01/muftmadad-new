const doctorsService = require('../services/doctors.services');

const createDoctor = async (req, res) => {
    try {
        const doctor = await doctorsService.createDoctor(req.body);
        return res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create doctor'
        });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 10, city, specialty, hospital, is_active, is_verified } = req.query;
        const filters = { city, specialty, hospital: hospital?.toLowerCase(), is_active, is_verified };
        const result = await doctorsService.getAllDoctors(filters, parseInt(page), parseInt(limit));
        return res.status(200).json({
            success: true,
            message: 'Doctors fetched successfully',
            data: result.doctors,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch doctors'
        });
    }
};

const getDoctorByUuid = async (req, res) => {
    try {
        const reference = req.params.uuid;
        const numericId = /^[1-9]\d*$/.test(reference) && Number.isSafeInteger(Number(reference));
        if (!numericId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference)) {
            return res.status(400).json({ success: false, message: 'Invalid doctor reference' });
        }
        const doctor = numericId
            ? await doctorsService.getDoctorById(reference)
            : await doctorsService.getDoctorByUuid(reference);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Doctor fetched successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch doctor'
        });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const doctor = await doctorsService.getDoctorById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Doctor fetched successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch doctor'
        });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const doctor = await doctorsService.updateDoctor(req.params.uuid, req.body);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update doctor'
        });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const result = await doctorsService.deleteDoctor(req.params.uuid);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete doctor'
        });
    }
};

const searchDoctors = async (req, res) => {
    try {
        const { q, city, specialty, min_fee, max_fee, min_rating } = req.query;
        const doctors = await doctorsService.searchDoctors({ q, city, specialty, min_fee, max_fee, min_rating });
        return res.status(200).json({
            success: true,
            message: 'Search results fetched successfully',
            data: doctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Search failed'
        });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const { is_active, is_verified } = req.body;
        const doctor = await doctorsService.toggleStatus(req.params.uuid, { is_active, is_verified });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Doctor status updated successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update status'
        });
    }
};

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorByUuid,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
    toggleStatus,
    getDoctorById, 
};
