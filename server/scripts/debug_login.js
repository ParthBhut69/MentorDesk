const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('Testing login with non-existent user...');
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173' // Simulate frontend origin
            },
            body: JSON.stringify({
                email: 'parthbhut1622@gmail.com',
                password: 'Parth@1234'
            }),
        });

        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify([...response.headers.entries()]));
        const text = await response.text();
        console.log('Body:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Response is NOT JSON');
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testLogin();
