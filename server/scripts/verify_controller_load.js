try {
    const authController = require('../controllers/authController');
    console.log('✅ authController loaded successfully');
    console.log('Exports:', Object.keys(authController));
} catch (error) {
    console.error('❌ Failed to load authController:', error);
    process.exit(1);
}
