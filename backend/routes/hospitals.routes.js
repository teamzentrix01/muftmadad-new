// routes/hospital.routes.js
const express = require('express');
const router = express.Router();

const {
    createHospitalController,
    getAllHospitalsController,
    getHospitalsBySpeciality,            // ✅ matches exact export name in controller
    getHospitalBySlugController,
    getHospitalByIdController,
    updateHospitalController,
    deleteHospitalController,
    getGalleryController,
    addGalleryController,
    removeGalleryImageController,
} = require('../controllers/hospitals.controller');

// ── Core CRUD ──────────────────────────────────────────
router.post('/',            createHospitalController);
router.get('/',             getHospitalsBySpeciality);          // ✅ handles both ?specialty= and no filter
router.get('/slug/:slug',   getHospitalBySlugController);
router.get('/:id',          getHospitalByIdController);
router.put('/:id',          updateHospitalController);
router.delete('/:id',       deleteHospitalController);

// ── Gallery ────────────────────────────────────────────
router.get('/:id/gallery',    getGalleryController);
router.post('/:id/gallery',   addGalleryController);
router.delete('/:id/gallery', removeGalleryImageController);

module.exports = router;