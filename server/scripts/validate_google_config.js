require('dotenv').config();

/**
 * Validates Google OAuth configuration on the backend
 * Run this script to ensure GOOGLE_CLIENT_ID is properly configured
 */

async function validateGoogleConfig() {
    console.log('=== Google OAuth Backend Configuration Validation ===\n');

    let hasErrors = false;

    // 1. Check if GOOGLE_CLIENT_ID exists
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('❌ GOOGLE_CLIENT_ID is NOT set in environment variables');
        console.error('   → Please add GOOGLE_CLIENT_ID to server/.env file\n');
        hasErrors = true;
    } else {
        console.log('✅ GOOGLE_CLIENT_ID is set');

        // 2. Validate format (should end with .apps.googleusercontent.com)
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId.endsWith('.apps.googleusercontent.com')) {
            console.error('❌ GOOGLE_CLIENT_ID format appears invalid');
            console.error(`   → Expected format: xxxxxxxxx.apps.googleusercontent.com`);
            console.error(`   → Got: ${clientId}\n`);
            hasErrors = true;
        } else {
            console.log(`✅ GOOGLE_CLIENT_ID format is valid`);
            console.log(`   → ${clientId.substring(0, 30)}...\n`);
        }

        // 3. Test if google-auth-library can initialize
        try {
            const { OAuth2Client } = require('google-auth-library');
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            console.log('✅ OAuth2Client initialized successfully\n');
        } catch (error) {
            console.error('❌ Failed to initialize OAuth2Client');
            console.error(`   → Error: ${error.message}\n`);
            hasErrors = true;
        }
    }

    // 4. Check if GOOGLE_CLIENT_SECRET exists (optional but recommended)
    if (!process.env.GOOGLE_CLIENT_SECRET) {
        console.warn('⚠️  GOOGLE_CLIENT_SECRET is not set (optional for ID token verification)');
        console.warn('   → This is OK for client-side OAuth, but may be needed for server-side flows\n');
    } else {
        console.log('✅ GOOGLE_CLIENT_SECRET is set\n');
    }

    // 5. Check other required environment variables
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this') {
        console.warn('⚠️  JWT_SECRET is using default value or not set');
        console.warn('   → Please change this in production!\n');
    } else {
        console.log('✅ JWT_SECRET is configured\n');
    }

    // Summary
    console.log('=== Validation Summary ===');
    if (hasErrors) {
        console.error('\n❌ Configuration has ERRORS. Please fix the issues above.\n');
        process.exit(1);
    } else {
        console.log('\n✅ All checks passed! Google OAuth backend is properly configured.\n');
        console.log('Next steps:');
        console.log('1. Ensure frontend has VITE_GOOGLE_CLIENT_ID set');
        console.log('2. Verify Google Cloud Console settings:');
        console.log('   - Authorized JavaScript origins: http://localhost:5173, http://localhost:3000');
        console.log('   - Authorized redirect URIs: http://localhost:5173, http://localhost:3000');
        console.log('3. Start the server with: npm start\n');
        process.exit(0);
    }
}

validateGoogleConfig();
