const { createReviewService, getAllReviewService, getCityReviewsService } = require('../services/review.services');



const createReviewController = async (req, res) => {
    try {
        const { name, description, treatment, rating, city, date } = req.body;

        // basic validation
        if (!name || !description || !rating) {
            return res.status(400).json({
                message: "name, description and rating are required"
            });
        }

        const review = await createReviewService({
            name,
            description,
            treatment,
            rating,
            city,
            date
        });

        return res.status(201).json({
            message: "Review created successfully",
            data: review
        });


    } catch (error) {
        console.error("Create review error:", error);
        return res.status(500).json({
            message: "Failed to create review"
        });
    }
}


const getAllReviewController = async (req, res) => {
    try {
        const reviews = await getAllReviewService();

        return res.status(200).json({
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error("Get reviews error:", error);
        return res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
};

const getCityReviewsController = async (req, res) => {
    try {
        const cityreviews = await getCityReviewsService();

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

module.exports = {
    createReviewController,
    getAllReviewController,
    getCityReviewsController
};