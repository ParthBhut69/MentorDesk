const cron = require('node-cron');
const trendingService = require('../services/trendingService');
const notificationService = require('../services/notificationService');

/**
 * Cron Jobs Scheduler
 * Handles scheduled tasks for trending updates and cleanup
 */

/**
 * Update trending scores every 15 minutes
 * Pattern: every 15 minutes
 */
function scheduleTrendingUpdates() {
    cron.schedule('*/15 * * * *', async () => {
        console.log('[CRON] Starting trending scores update...');
        try {
            const count = await trendingService.updateAllTrendingScores('7d');
            console.log(`[CRON] Updated ${count} trending topics`);
        } catch (error) {
            console.error('[CRON] Error updating trending scores:', error);
        }
    });

    console.log('✓ Trending updates cron job scheduled (every 15 minutes)');
}

/**
 * Clean old activity logs daily at 2:00 AM
 * Pattern: 0 2 * * * (2 AM every day)
 */
function scheduleActivityLogCleanup() {
    cron.schedule('0 2 * * *', async () => {
        console.log('[CRON] Starting activity log cleanup...');
        try {
            const deleted = await trendingService.cleanOldActivityLogs(90);
            console.log(`[CRON] Cleaned ${deleted} old activity logs`);
        } catch (error) {
            console.error('[CRON] Error cleaning activity logs:', error);
        }
    });

    console.log('✓ Activity log cleanup cron job scheduled (daily at 2 AM)');
}

/**
 * Clean old read notifications daily at 3:00 AM
 * Pattern: 0 3 * * * (3 AM every day)
 */
function scheduleNotificationCleanup() {
    cron.schedule('0 3 * * *', async () => {
        console.log('[CRON] Starting notification cleanup...');
        try {
            const deleted = await notificationService.cleanOldNotifications(30);
            console.log(`[CRON] Cleaned ${deleted} old notifications`);
        } catch (error) {
            console.error('[CRON] Error cleaning notifications:', error);
        }
    });

    console.log('✓ Notification cleanup cron job scheduled (daily at 3 AM)');
}

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
    console.log('\n=== Initializing Cron Jobs ===');

    scheduleTrendingUpdates();
    scheduleActivityLogCleanup();
    scheduleNotificationCleanup();

    console.log('=== All Cron Jobs Initialized ===\n');
}

/**
 * Manual trigger functions for testing
 */
async function manuallyUpdateTrending() {
    console.log('Manually triggering trending update...');
    try {
        const count = await trendingService.updateAllTrendingScores('7d');
        console.log(`Successfully updated ${count} trending topics`);
        return count;
    } catch (error) {
        console.error('Error in manual trending update:', error);
        throw error;
    }
}

async function manuallyCleanupLogs() {
    console.log('Manually triggering activity log cleanup...');
    try {
        const deleted = await trendingService.cleanOldActivityLogs(90);
        console.log(`Successfully cleaned ${deleted} old activity logs`);
        return deleted;
    } catch (error) {
        console.error('Error in manual cleanup:', error);
        throw error;
    }
}

async function manuallyCleanupNotifications() {
    console.log('Manually triggering notification cleanup...');
    try {
        const deleted = await notificationService.cleanOldNotifications(30);
        console.log(`Successfully cleaned ${deleted} old notifications`);
        return deleted;
    } catch (error) {
        console.error('Error in manual notification cleanup:', error);
        throw error;
    }
}

module.exports = {
    initializeCronJobs,
    manuallyUpdateTrending,
    manuallyCleanupLogs,
    manuallyCleanupNotifications
};
