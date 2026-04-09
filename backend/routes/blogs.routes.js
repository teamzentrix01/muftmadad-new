const router = require('express').Router();
const {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog,
} = require('../controllers/blogs.controller');

router.post('/',           createBlog);
router.get('/',            getAllBlogs);       // ?all=true for admin (includes drafts)
router.get('/slug/:slug',  getBlogBySlug);
router.get('/:id',         getBlogById);
router.put('/:id',         updateBlog);
router.delete('/:id',      deleteBlog);

module.exports = router;