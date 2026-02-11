/**
 * Test script to simulate Google OAuth flow and identify the error
 * This will help us understand where the 500 error is occurring
 */

const fetch = require('node-fetch');

// Mock Google ID token (this is just for testing the flow, not a real token)
const mockCredential = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NzUwNzYzNTkzNTgtODZqcXJtaXFkbGpobTNxODNqcGVpN3Zicm9pNXNmYTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NzUwNzYzNTkzNTgtODZqcXJtaXFkbGpobTNxODNqcGVpN3Zicm9pNXNmYTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIzNDU2Nzg5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiVGVzdCBVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL2RlZmF1bHQtdXNlciIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyNDI2MjJ9.mock_signature';

async function testGoogleAuth() {
    console.log('=== Testing Google OAuth Endpoint ===\n');

    const API_URL = 'http://localhost:3000';

    try {
        console.log('1. Testing with mock credential (will fail token verification)...');
        const response = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: mockCredential
            })
        });

        console.log('   Status:', response.status);
        const data = await response.json();
        console.log('   Response:', JSON.stringify(data, null, 2));

        if (response.status === 500) {
            console.log('\n❌ 500 ERROR DETECTED!');
            console.log('This is the error the user is experiencing.');
        } else if (response.status === 400) {
            console.log('\n✅ Expected 400 error (invalid token)');
            console.log('The endpoint is handling token verification correctly.');
        }

    } catch (error) {
        console.error('\n❌ Network Error:', error.message);
        console.log('Make sure the server is running on port 3000');
    }

    console.log('\n=== Test Complete ===');
    console.log('\nNOTE: To test with a real Google token:');
    console.log('1. Open the frontend in a browser');
    console.log('2. Click "Sign in with Google"');
    console.log('3. Check the browser console for the credential');
    console.log('4. Check the server terminal for detailed logs');
}

testGoogleAuth();
