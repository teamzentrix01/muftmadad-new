const {
    createBlogService,
    getAllBlogsService,
    getBlogBySlugService,
    getBlogByIdService,
    updateBlogService,
    deleteBlogService,
} = require('../services/blogs.services');

const createBlog = async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }
        const result = await createBlogService(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllBlogs = async (req, res) => {
    try {
        // ?all=true returns drafts too (for admin)
        const publishedOnly = req.query.all !== 'true';
        const result = await getAllBlogsService(publishedOnly);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBlogBySlug = async (req, res) => {
    try {
        const result = await getBlogBySlugService(req.params.slug);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const result = await getBlogByIdService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const result = await updateBlogService(req.params.id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const result = await deleteBlogService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog,
};