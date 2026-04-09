const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const createBlogService = async (data) => {
    const {
        title, subtitle, tag, author, publish_date,
        read_time, bg_image, overlay_opacity, align,
        text_color, blocks, is_published = false
    } = data;

    const slug = generateSlug(title) + '-' + Date.now();

    const result = await pool.query(
        `INSERT INTO blogs
         (uuid, title, subtitle, slug, tag, author, publish_date,
          read_time, bg_image, overlay_opacity, align, text_color,
          blocks, is_published, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())
         RETURNING *`,
        [
            uuidv4(), title, subtitle || null, slug,
            tag || null, author || null, publish_date || null,
            read_time || null, bg_image || null,
            overlay_opacity ?? 0.6, align || 'text-center',
            text_color || 'text-white',
            JSON.stringify(blocks || []),
            is_published
        ]
    );
    return { success: true, data: result.rows[0] };
};

const getAllBlogsService = async (publishedOnly = true) => {
    const query = publishedOnly
        ? `SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC`
        : `SELECT * FROM blogs ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
};

const getBlogBySlugService = async (slug) => {
    const result = await pool.query(
        `SELECT * FROM blogs WHERE slug = $1`, [slug]
    );
    if (!result.rows[0]) throw new Error('Blog not found');
    return { success: true, data: result.rows[0] };
};

const getBlogByIdService = async (id) => {
    const result = await pool.query(
        `SELECT * FROM blogs WHERE id = $1`, [id]
    );
    if (!result.rows[0]) throw new Error('Blog not found');
    return { success: true, data: result.rows[0] };
};

const updateBlogService = async (id, data) => {
    const {
        title, subtitle, tag, author, publish_date,
        read_time, bg_image, overlay_opacity, align,
        text_color, blocks, is_published
    } = data;

    const result = await pool.query(
        `UPDATE blogs SET
            title = COALESCE($1, title),
            subtitle = COALESCE($2, subtitle),
            tag = COALESCE($3, tag),
            author = COALESCE($4, author),
            publish_date = COALESCE($5, publish_date),
            read_time = COALESCE($6, read_time),
            bg_image = COALESCE($7, bg_image),
            overlay_opacity = COALESCE($8, overlay_opacity),
            align = COALESCE($9, align),
            text_color = COALESCE($10, text_color),
            blocks = COALESCE($11, blocks),
            is_published = COALESCE($12, is_published),
            updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
            title, subtitle, tag, author, publish_date,
            read_time, bg_image, overlay_opacity, align,
            text_color,
            blocks ? JSON.stringify(blocks) : null,
            is_published,
            id
        ]
    );
    if (!result.rows[0]) throw new Error('Blog not found');
    return { success: true, data: result.rows[0] };
};

const deleteBlogService = async (id) => {
    const result = await pool.query(
        `DELETE FROM blogs WHERE id = $1 RETURNING id`, [id]
    );
    if (!result.rows[0]) throw new Error('Blog not found');
    return { success: true };
};

module.exports = {
    createBlogService,
    getAllBlogsService,
    getBlogBySlugService,
    getBlogByIdService,
    updateBlogService,
    deleteBlogService,
};