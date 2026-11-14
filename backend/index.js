// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import database
const db = require('./config/database');

// Import API routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'TechSpace Blog API is running!'
    });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Blog routes
app.use('/api/blogs', blogRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`TechSpace API is running on http://localhost:${PORT}`);
});
