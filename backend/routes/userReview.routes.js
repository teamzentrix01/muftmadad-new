const express = require('express');
const router = express.Router();

const {
  createReviewController,
  getAllReviewController,
  getCityReviewsController
} = require('../controllers/reviewService.controller');

router.post('/reviews/create', createReviewController);
router.get('/reviews', getAllReviewController);
router.get('/reviews/:city', getCityReviewsController);

module.exports = router;