const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// PUBLIC ROUTES - No authentication needed
// GET /api/cities - Get all active cities
router.get('/cities', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name_en, name_hi, slug, display_order, is_active 
             FROM cities 
             WHERE is_active = true 
             ORDER BY display_order ASC, name_en ASC`
        );
        
        console.log('Cities from DB:', result.rows);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities'
        });
    }
});

// GET single city by slug
router.get('/cities/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            `SELECT id, name_en, name_hi, slug, display_order 
             FROM cities 
             WHERE slug = $1 AND is_active = true`,
            [slug]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching city:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch city'
        });
    }
});

// ADMIN ROUTES - No authentication for now (add auth later)
router.get('/admin/cities', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM cities ORDER BY display_order ASC, created_at DESC`
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching all cities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities'
        });
    }
});

// POST - Create new city
router.post('/admin/cities', async (req, res) => {
    try {
        const { name_en, name_hi, slug, display_order, is_active } = req.body;
        
        // Validation
        if (!name_en || !name_hi || !slug) {
            return res.status(400).json({
                success: false,
                message: 'Name (EN), Name (HI), and Slug are required'
            });
        }
        
        // Check if slug already exists
        const slugCheck = await pool.query(
            'SELECT id FROM cities WHERE slug = $1',
            [slug]
        );
        
        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'City with this slug already exists'
            });
        }
        
        const result = await pool.query(
            `INSERT INTO cities (name_en, name_hi, slug, display_order, is_active) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name_en, name_hi, slug, display_order || 1, is_active !== false]
        );
        
        res.status(201).json({
            success: true,
            message: 'City created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating city:', error);
        
        // Check for duplicate slug
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'City with this slug already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create city'
        });
    }
});

// PUT - Update city
router.put('/admin/cities/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name_en, name_hi, slug, display_order, is_active } = req.body;
        
        // Check if city exists
        const cityCheck = await pool.query(
            'SELECT id FROM cities WHERE id = $1',
            [id]
        );
        
        if (cityCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        
        // Check if slug is unique (excluding current city)
        if (slug) {
            const slugCheck = await pool.query(
                'SELECT id FROM cities WHERE slug = $1 AND id != $2',
                [slug, id]
            );
            
            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'City with this slug already exists'
                });
            }
        }
        
        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (name_en !== undefined) {
            updates.push(`name_en = $${paramCount++}`);
            values.push(name_en);
        }
        if (name_hi !== undefined) {
            updates.push(`name_hi = $${paramCount++}`);
            values.push(name_hi);
        }
        if (slug !== undefined) {
            updates.push(`slug = $${paramCount++}`);
            values.push(slug);
        }
        if (display_order !== undefined) {
            updates.push(`display_order = $${paramCount++}`);
            values.push(display_order);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        values.push(id);
        
        const result = await pool.query(
            `UPDATE cities 
             SET ${updates.join(', ')} 
             WHERE id = $${paramCount} 
             RETURNING *`,
            values
        );
        
        res.json({
            success: true,
            message: 'City updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update city'
        });
    }
});

// DELETE - Delete city
router.delete('/admin/cities/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM cities WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        
        res.json({
            success: true,
            message: 'City deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete city'
        });
    }
});

module.exports = router;