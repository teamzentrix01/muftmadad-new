const router = require('express').Router();

const { createTreatmentController, getAllTreatmentController, getTreatmentBySpecialtyIdController,updateTreatmentController, deleteTreatmentController } = require('../controllers/treatment.controller')




router.post('/create', createTreatmentController);
router.get('/getAll', getAllTreatmentController);
router.get('/getBySpecialty/:specialty_id', getTreatmentBySpecialtyIdController);
router.put('/:id', updateTreatmentController);
router.delete('/:id', deleteTreatmentController); 

module.exports = router;


