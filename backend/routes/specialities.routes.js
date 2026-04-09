const router = require('express').Router();
const {
    createSpeciality,
    getAllSpecialities,
    getSpecialityBySlug,
    getSpecialityById,
    deleteSpeciality, 
    updateSpeciality,
} = require('../controllers/specialities.controller');

router.post('/', createSpeciality);
router.get('/', getAllSpecialities);
router.get('/slug/:slug', getSpecialityBySlug);
router.get('/:id', getSpecialityById);
router.put('/:id', updateSpeciality);
router.delete('/:id',       deleteSpeciality);   // ✅ add this


module.exports = router;