import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates Google OAuth configuration on the frontend
 * Run this script to ensure VITE_GOOGLE_CLIENT_ID is properly configured
 */

function validateFrontendEnv() {
    console.log('=== Google OAuth Frontend Configuration Validation ===\n');

    let hasErrors = false;

    // Read .env.development file
    const envPath = path.join(__dirname, '..', '.env.development');

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.development file does NOT exist');
        console.error('   → Please create .env.development in the project root\n');
        hasErrors = true;
    } else {
        console.log('✅ .env.development file exists');

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');

        let hasClientId = false;
        let clientId = '';

        for (const line of lines) {
            if (line.trim().startsWith('VITE_GOOGLE_CLIENT_ID=')) {
                hasClientId = true;
                clientId = line.split('=')[1]?.trim() || '';
                break;
            }
        }

        if (!hasClientId || !clientId) {
            console.error('❌ VITE_GOOGLE_CLIENT_ID is NOT set in .env.development');
            console.error('   → Please add: VITE_GOOGLE_CLIENT_ID=your-client-id-here\n');
            hasErrors = true;
        } else {
            console.log('✅ VITE_GOOGLE_CLIENT_ID is set');

            // Validate format
            if (!clientId.endsWith('.apps.googleusercontent.com')) {
                console.error('❌ VITE_GOOGLE_CLIENT_ID format appears invalid');
                console.error(`   → Expected format: xxxxxxxxx.apps.googleusercontent.com`);
                console.error(`   → Got: ${clientId}\n`);
                hasErrors = true;
            } else {
                console.log(`✅ VITE_GOOGLE_CLIENT_ID format is valid`);
                console.log(`   → ${clientId.substring(0, 30)}...\n`);
            }
        }

        // Check API URL
        let hasApiUrl = false;
        for (const line of lines) {
            if (line.trim().startsWith('VITE_API_URL=')) {
                hasApiUrl = true;
                const apiUrl = line.split('=')[1]?.trim() || '';
                if (apiUrl) {
                    console.log(`✅ VITE_API_URL is set: ${apiUrl}\n`);
                } else {
                    console.warn('⚠️  VITE_API_URL is empty (will use default)\n');
                }
                break;
            }
        }

        if (!hasApiUrl) {
            console.warn('⚠️  VITE_API_URL is not set (will use default)\n');
        }
    }

    // Check if backend client ID matches (optional)
    const backendEnvPath = path.join(__dirname, '..', 'server', '.env');
    if (fs.existsSync(backendEnvPath)) {
        const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf-8');
        const backendLines = backendEnvContent.split('\n');

        for (const line of backendLines) {
            if (line.trim().startsWith('GOOGLE_CLIENT_ID=')) {
                const backendClientId = line.split('=')[1]?.trim() || '';

                // Read frontend client ID again for comparison
                const frontendEnvContent = fs.readFileSync(envPath, 'utf-8');
                const frontendLines = frontendEnvContent.split('\n');
                let frontendClientId = '';

                for (const fLine of frontendLines) {
                    if (fLine.trim().startsWith('VITE_GOOGLE_CLIENT_ID=')) {
                        frontendClientId = fLine.split('=')[1]?.trim() || '';
                        break;
                    }
                }

                if (backendClientId && frontendClientId && backendClientId === frontendClientId) {
                    console.log('✅ Frontend and backend client IDs match\n');
                } else if (backendClientId && frontendClientId) {
                    console.error('❌ Frontend and backend client IDs DO NOT match!');
                    console.error('   → This will cause authentication to fail\n');
                    hasErrors = true;
                }
                break;
            }
        }
    }

    // Summary
    console.log('=== Validation Summary ===');
    if (hasErrors) {
        console.error('\n❌ Configuration has ERRORS. Please fix the issues above.\n');
        process.exit(1);
    } else {
        console.log('\n✅ All checks passed! Google OAuth frontend is properly configured.\n');
        console.log('Next steps:');
        console.log('1. Start the frontend dev server: npm run dev');
        console.log('2. Navigate to: http://localhost:5173/login');
        console.log('3. Test Google Sign-In\n');
        process.exit(0);
    }
}

validateFrontendEnv();
