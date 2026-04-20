const router = require('express').Router();

const { createTreatmentController, getAllTreatmentController, getTreatmentBySpecialtyIdController,updateTreatmentController, deleteTreatmentController,reorderTreatmentController, } = require('../controllers/treatment.controller')




router.post('/create', createTreatmentController);
router.get('/getAll', getAllTreatmentController);
router.post('/reorder', reorderTreatmentController); 
router.get('/getBySpecialty/:specialty_id', getTreatmentBySpecialtyIdController);
router.put('/:id', updateTreatmentController);
router.delete('/:id', deleteTreatmentController); 

module.exports = router;


