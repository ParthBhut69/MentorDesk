require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initializeCronJobs } = require('./jobs/cronJobs');

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const followerRoutes = require('./routes/followerRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: [
        'https://mentordesk.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors({
    origin: [
        'https://mentordesk.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
})); // Enable pre-flight for all routes with same CORS config
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "https:"],
        },
    },
}));
app.use(morgan('dev'));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for development
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development
    message: { message: 'Too many login attempts, please try again later.' }
});

// Apply global limiter to all routes
app.use('/api', globalLimiter);


// Test endpoint to verify CORS
app.get('/api/test', (req, res) => {
    res.json({
        message: 'CORS is working!',
        cors: {
            origin: req.headers.origin,
            allowed: ['https://mentordesk.onrender.com', 'http://localhost:5173', 'http://localhost:3000']
        }
    });
});


// Routes
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/users', userRoutes);
const likeRoutes = require('./routes/likeRoutes');
app.use('/api/answers', likeRoutes); // Mount like routes for answers
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/gamification', gamificationRoutes);

// Explicit 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.error(`[API 404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: 'API route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Serve static files from the React app
const path = require('path');
const fs = require('fs');

// Determine the correct dist path
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

console.log(`[Static] Checking dist path: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log(`[Static] Dist folder found. Serving static files.`);
    app.use(express.static(distPath));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            console.error('[Static] index.html not found at:', indexPath);
            res.status(500).send('Frontend build is missing index.html');
        }
    });
} else {
    console.error(`[Static] Dist folder NOT found at: ${distPath}`);
    app.get('*', (req, res) => {
        res.status(503).json({
            message: 'Frontend not available (dist folder missing)',
            path: distPath,
            env: process.env.NODE_ENV
        });
    });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize cron jobs for trending updates and cleanup
    initializeCronJobs();
});
