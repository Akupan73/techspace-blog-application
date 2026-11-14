const express = require('express');
const router = express.Router();

const db = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// ==================================
// GET ALL PUBLISHED BLOG POSTS
// ==================================
router.get('/', (req, res) => {
    try {
        const blogs = db.prepare(`
            SELECT
                blogs.id,
                blogs.title,
                blogs.category,
                blogs.image,
                blogs.excerpt,
                blogs.content,
                blogs.status,
                blogs.created_at,
                users.id AS author_id,
                users.name AS author_name
            FROM blogs
            JOIN users ON blogs.author_id = users.id
            WHERE blogs.status = 'published'
            ORDER BY blogs.created_at DESC
        `).all();

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs: blogs
        });

    } catch (error) {
        console.error('Get blogs error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve blog posts.'
        });
    }
});


// ==================================
// GET LOGGED-IN USER'S BLOG POSTS
// ==================================
router.get('/my-blogs', authenticateToken, (req, res) => {
    try {
        const blogs = db.prepare(`
            SELECT *
            FROM blogs
            WHERE author_id = ?
            ORDER BY created_at DESC
        `).all(req.user.id);

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs: blogs
        });

    } catch (error) {
        console.error('My blogs error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve your blog posts.'
        });
    }
});


// ==================================
// GET A SINGLE BLOG POST
// ==================================
router.get('/:id', (req, res) => {
    try {
        const blog = db.prepare(`
            SELECT
                blogs.*,
                users.name AS author_name
            FROM blogs
            JOIN users ON blogs.author_id = users.id
            WHERE blogs.id = ?
            AND blogs.status = 'published'
        `).get(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found.'
            });
        }

        res.status(200).json({
            success: true,
            blog: blog
        });

    } catch (error) {
        console.error('Get blog error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve blog post.'
        });
    }
});


// ==================================
// CREATE A NEW BLOG POST
// ==================================
router.post('/', authenticateToken, (req, res) => {
    try {
        const {
            title,
            category,
            image,
            excerpt,
            content,
            status
        } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title, category and content are required.'
            });
        }

        const blogStatus = status || 'published';

        if (!['published', 'draft'].includes(blogStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be published or draft.'
            });
        }

        const result = db.prepare(`
            INSERT INTO blogs (
                title,
                category,
                image,
                excerpt,
                content,
                author_id,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            title.trim(),
            category.trim(),
            image || null,
            excerpt || null,
            content,
            req.user.id,
            blogStatus
        );

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully.',
            blogId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Create blog error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to create blog post.'
        });
    }
});


// ==================================
// UPDATE A BLOG POST
// ==================================
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const {
            title,
            category,
            image,
            excerpt,
            content,
            status
        } = req.body;

        const blog = db.prepare(`
            SELECT * FROM blogs
            WHERE id = ? AND author_id = ?
        `).get(req.params.id, req.user.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found or you are not the owner.'
            });
        }

        if (status && !['published', 'draft'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be published or draft.'
            });
        }

        const updatedTitle = title === undefined ? blog.title : title.trim();
        const updatedCategory = category === undefined ? blog.category : category.trim();
        const updatedImage = image === undefined ? blog.image : image;
        const updatedExcerpt = excerpt === undefined ? blog.excerpt : excerpt;
        const updatedContent = content === undefined ? blog.content : content;
        const updatedStatus = status || blog.status;

        if (!updatedTitle || !updatedCategory || !updatedContent) {
            return res.status(400).json({
                success: false,
                message: 'Title, category and content cannot be empty.'
            });
        }

        db.prepare(`
            UPDATE blogs
            SET
                title = ?,
                category = ?,
                image = ?,
                excerpt = ?,
                content = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND author_id = ?
        `).run(
            updatedTitle,
            updatedCategory,
            updatedImage,
            updatedExcerpt,
            updatedContent,
            updatedStatus,
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully.'
        });

    } catch (error) {
        console.error('Update blog error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to update blog post.'
        });
    }
});


// ==================================
// DELETE A BLOG POST
// ==================================
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const result = db.prepare(`
            DELETE FROM blogs
            WHERE id = ? AND author_id = ?
        `).run(req.params.id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found or you are not the owner.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully.'
        });

    } catch (error) {
        console.error('Delete blog error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to delete blog post.'
        });
    }
});

module.exports = router;
