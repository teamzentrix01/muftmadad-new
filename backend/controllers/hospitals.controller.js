// controllers/hospital.controller.js
const {
    createHospitalService,
    getAllHospitalsService,
    getHospitalBySlugService,
    getHospitalByIdService,
    updateHospitalService,
    deleteHospitalService,
    addGalleryImagesService,
    removeGalleryImageService,
    getGalleryImagesService,
    getHospitalsBySpecialityService,
    getHospitalsByTreatmentService,
    getHospitalsByCityService,
    reorderHospitalsService,
} = require('../services/hospitals.services');

const createHospitalController = async (req, res) => {
    try {
        const { name, slug, phone, email, address, city, state, country } = req.body;

        if (!name || !slug || !phone || !email || !address || !city || !state || !country) {
            return res.status(400).json({
                message: 'name, slug, phone, email, address, city, state, and country are required'
            });
        }

        const hospital = await createHospitalService(req.body);

        return res.status(201).json({
            message: 'Hospital created successfully',
            data: hospital
        });

    } catch (error) {
        // ── Detailed error logging so you can see exactly what PostgreSQL rejected ──
        console.error('━━━ Create hospital error ━━━');
        console.error('Message :', error.message);
        console.error('PG Code :', error.code);       // e.g. 23505 = unique violation
        console.error('PG Detail:', error.detail);    // e.g. which column caused it
        console.error('PG Hint  :', error.hint);
        console.error('Stack   :', error.stack);

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'A hospital with this slug or email already exists',
                detail: error.detail
            });
        }
        // Send the actual DB error message back in dev so you can debug faster
        return res.status(500).json({
            message: 'Failed to create hospital',
            ...(process.env.NODE_ENV !== 'production' && {
                error: error.message,
                detail: error.detail,
                hint: error.hint,
            })
        });
    }
};

const getAllHospitalsController = async (req, res) => {
    try {
        const hospitals = await getAllHospitalsService();
        return res.status(200).json({
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        console.error('Get hospitals error:', error);
        return res.status(500).json({ message: 'Failed to fetch hospitals' });
    }
};

const getHospitalsBySpeciality = async (req, res) => {
    try {
        const { specialty, treatment, city } = req.query;
 
        if (treatment) {
            // Filter by treatment name
            const hospitals = await getHospitalsByTreatmentService(treatment);
            return res.status(200).json({ success: true, data: hospitals });
        }
 
        if (specialty) {
            // Filter by specialty name
            const hospitals = await getHospitalsBySpecialityService(specialty);
            return res.status(200).json({ success: true, data: hospitals });
        }
 
        if (city) {
            // Filter by city — add this service function below
            const hospitals = await getHospitalsByCityService(city);
            return res.status(200).json({ success: true, data: hospitals });
        }
 
        // No filter — return all
        const hospitals = await getAllHospitalsService();
        return res.status(200).json({ success: true, data: hospitals });
 
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getHospitalBySlugController = async (req, res) => {
    try {
        const { slug } = req.params;
        const hospital = await getHospitalBySlugService(slug);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        return res.status(200).json({ data: hospital });
    } catch (error) {
        console.error('Get hospital by slug error:', error);
        return res.status(500).json({ message: 'Failed to fetch hospital' });
    }
};

const getHospitalByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await getHospitalByIdService(id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        return res.status(200).json({ data: hospital });
    } catch (error) {
        console.error('Get hospital by id error:', error);
        return res.status(500).json({ message: 'Failed to fetch hospital' });
    }
};

const updateHospitalController = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await updateHospitalService(id, req.body);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        return res.status(200).json({
            message: 'Hospital updated successfully',
            data: hospital
        });
    } catch (error) {
        console.error('Update hospital error:', error);
        return res.status(500).json({ message: 'Failed to update hospital' });
    }
};

const deleteHospitalController = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await deleteHospitalService(id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        return res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        console.error('Delete hospital error:', error);
        return res.status(500).json({ message: 'Failed to delete hospital' });
    }
};

const getGalleryController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getGalleryImagesService(id);
        if (!result) return res.status(404).json({ message: 'Hospital not found' });
        return res.status(200).json({
            count: result.gallery_images.length,
            data: result.gallery_images
        });
    } catch (error) {
        console.error('Get gallery error:', error);
        return res.status(500).json({ message: 'Failed to fetch gallery images' });
    }
};

const addGalleryController = async (req, res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: 'images must be a non-empty array of URLs' });
        }

        const result = await addGalleryImagesService(id, images);
        if (!result) return res.status(404).json({ message: 'Hospital not found' });

        return res.status(200).json({
            message: `${images.length} image(s) added successfully`,
            data: result.gallery_images
        });
    } catch (error) {
        console.error('Add gallery error:', error);
        return res.status(500).json({ message: 'Failed to add gallery images' });
    }
};

const removeGalleryImageController = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'imageUrl is required in request body' });
        }

        const result = await removeGalleryImageService(id, imageUrl);
        if (!result) return res.status(404).json({ message: 'Hospital not found' });

        return res.status(200).json({
            message: 'Image removed successfully',
            data: result.gallery_images
        });
    } catch (error) {
        console.error('Remove gallery image error:', error);
        return res.status(500).json({ message: 'Failed to remove gallery image' });
    }
};

const reorderHospitalsController = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        // orderedIds = [{ id: 1, display_order: 1 }, { id: 3, display_order: 2 }, ...]
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds must be a non-empty array' });
        }
        await reorderHospitalsService(orderedIds);
        return res.status(200).json({ message: 'Order saved successfully' });
    } catch (error) {
        console.error('Reorder hospitals error:', error);
        return res.status(500).json({ message: 'Failed to save order' });
    }
};

module.exports = {
    createHospitalController,
    getAllHospitalsController,
    getHospitalBySlugController,
    getHospitalByIdController,
    updateHospitalController,
    deleteHospitalController,
    getGalleryController,
    addGalleryController,
    removeGalleryImageController,
    getHospitalsBySpeciality,
    reorderHospitalsController
};