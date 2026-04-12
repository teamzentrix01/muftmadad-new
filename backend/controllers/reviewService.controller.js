const {
  createReviewService,
  getAllReviewService,
  getCityReviewsService,
      updateReviewService,     // ← add
    deleteReviewService
} = require("../services/review.services");

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
        const { city } = req.params;                        // extract city
        const cityreviews = await getCityReviewsService(city); // pass it

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
}

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
        const deleted = await deleteReviewService(id);

        if (!deleted) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json({ message: "Review deleted successfully", data: deleted });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({ message: "Failed to delete review" });
    }
};

module.exports = {
  createReviewController,
  getAllReviewController,
  getCityReviewsController,
   updateReviewController,   // ← add
    deleteReviewController  
};
