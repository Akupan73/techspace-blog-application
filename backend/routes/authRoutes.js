const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

require('dotenv').config();

// ==================================
// USER REGISTRATION API
// ==================================
router.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your name, email and password.'
            });
        }

        name = name.trim();
        email = email.trim().toLowerCase();

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            });
        }

        // Check if email already exists
        const existingUser = db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).get(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save user in database
        const result = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(name, email, hashedPassword);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            user: {
                id: result.lastInsertRowid,
                name: name,
                email: email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration.'
        });
    }
});


// ==================================
// USER LOGIN API
// ==================================
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email and password.'
            });
        }

        email = email.trim().toLowerCase();

        // Find user
        const user = db.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate authentication token
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred during login.'
        });
    }
});


// ==================================
// GET LOGGED-IN USER
// ==================================
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare(`
            SELECT id, name, email, created_at
            FROM users
            WHERE id = ?
        `).get(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('User retrieval error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve user information.'
        });
    }
});

module.exports = router;
