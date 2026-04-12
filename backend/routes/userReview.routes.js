const express = require('express');
const router = express.Router();

const {
  createReviewController,
  getAllReviewController,
  getCityReviewsController,
    updateReviewController,    // ← add
  deleteReviewController 
} = require('../controllers/reviewService.controller');

router.post('/reviews/create', createReviewController);
router.get('/reviews', getAllReviewController);
router.get('/reviews/:city', getCityReviewsController);
router.put('/reviews/:id', updateReviewController);     // ← add
router.delete('/reviews/:id', deleteReviewController);

module.exports = router;