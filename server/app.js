require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
app.options('*', cors()); // Enable pre-flight for all routes
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
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/badges', badgeRoutes);

// Serve static files from the React app
const path = require('path');
const fs = require('fs');

// Determine the correct dist path
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist folder exists and log
if (fs.existsSync(distPath)) {
    console.log(`[Static Files] Serving from: ${distPath}`);
    app.use(express.static(distPath));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            console.error('[Static Files] index.html not found');
            res.status(404).json({
                message: 'Frontend not built',
                hint: 'Run: npm run build in the project root',
                development: process.env.NODE_ENV === 'development' ?
                    'In development, run the frontend separately with: npm run dev' : undefined
            });
        }
    });
} else {
    console.warn(`[Static Files] Warning: dist folder not found at ${distPath}`);

    if (process.env.NODE_ENV === 'development') {
        console.log('[Static Files] Running in DEVELOPMENT mode');
        console.log('[Static Files] Start frontend separately: cd .. && npm run dev');
        console.log('[Static Files] API routes will work at http://localhost:3000/api/*');
    } else {
        console.warn('[Static Files] Running in PRODUCTION without build - this is an error!');
    }

    // Fallback route for development - just show a helpful message
    app.get('*', (req, res) => {
        res.status(503).json({
            message: 'Frontend not available',
            environment: process.env.NODE_ENV || 'unknown',
            apiStatus: 'API is running',
            hint: process.env.NODE_ENV === 'development' ?
                'Start frontend separately with: npm run dev' :
                'Build frontend with: npm run build'
        });
    });
}


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize cron jobs for trending updates and cleanup
    initializeCronJobs();
});
