const {
  createReviewService,
  getAllReviewService,
  getCityReviewsService,
  updateReviewService,
  deleteReviewService
} = require("../services/review.services");
const recycleBinService = require('../services/recycleBin.service');
const pool = require('../config/db');

const createReviewController = async (req, res) => {
  try {
    const { name, description, treatment, rating, city, date } = req.body;

    // basic validation
    if (!name || !description || !rating) {
      return res.status(400).json({
        message: "name, description and rating are required",
      });
    }

    const review = await createReviewService({
      name,
      description,
      treatment,
      rating,
      city,
      date,
    });

    return res.status(201).json({
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      message: "Failed to create review",
    });
  }
};

const getAllReviewController = async (req, res) => {
  try {
    const reviews = await getAllReviewService();

    return res.status(200).json({
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
};

const getCityReviewsController = async (req, res) => {
    try {
        const { city } = req.params;
        const cityreviews = await getCityReviewsService(city);

        return res.status(200).json({
            count: cityreviews.length,
            data: cityreviews
        });
    } catch (error) {
        console.log("Get City reviews Error", error);
        return res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
};

const updateReviewController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, treatment, rating, city, date } = req.body;

        if (!name || !description || !rating) {
            return res.status(400).json({ message: "name, description and rating are required" });
        }

        const updated = await updateReviewService(id, { name, description, treatment, rating, city, date });

        if (!updated) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json({ message: "Review updated successfully", data: updated });
    } catch (error) {
        console.error("Update review error:", error);
        return res.status(500).json({ message: "Failed to update review" });
    }
};

const deleteReviewController = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
        if (!check.rows[0]) {
            return res.status(404).json({ message: "Review not found" });
        }

        const existingReview = check.rows[0];

        // Archive into recycle bin with Deleter audit info
        await recycleBinService.moveToBin({
            entityType: 'review',
            entityId: existingReview.id,
            entityName: `${existingReview.name || 'User'} (${existingReview.treatment || 'Review'})`,
            sourceDashboard: 'Review Dashboard',
            originalData: existingReview,
            deletedByUser: req.adminUser || req.user
        });

        const deleted = await deleteReviewService(id);
        return res.status(200).json({ message: "Review moved to recycle bin successfully", data: deleted });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({ message: "Failed to delete review" });
    }
};

module.exports = {
  createReviewController,
  getAllReviewController,
  getCityReviewsController,
  updateReviewController,
  deleteReviewController  
};
