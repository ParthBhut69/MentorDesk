require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(cors());
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

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
