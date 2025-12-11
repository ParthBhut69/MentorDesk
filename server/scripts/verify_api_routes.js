const http = require('http');

const ENDPOINTS = [
    '/api/questions',
    '/api/trending/tags',
    '/api/categories',
    '/api/rewards/leaderboard',
    '/api/test' // The CORS test endpoint
];

const BASE_URL = 'http://localhost:3000';

function checkEndpoint(path) {
    return new Promise((resolve) => {
        http.get(BASE_URL + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const isJson = res.headers['content-type']?.includes('application/json');
                const status = res.statusCode;

                // We expect 200 for most, maybe 401 for protected if we don't send token.
                // But definitely NOT 404 (unless generic route) and definitely JSON.

                if (status === 404) {
                    console.error(`❌ [FAIL] ${path} -> 404 NOT FOUND`);
                    resolve(false);
                } else if (!isJson) {
                    console.error(`❌ [FAIL] ${path} -> Returned ${res.headers['content-type']} (Expected JSON). Body: ${data.substring(0, 100)}`);
                    resolve(false);
                } else {
                    try {
                        JSON.parse(data);
                        console.log(`✅ [PASS] ${path} -> ${status} JSON`);
                        resolve(true);
                    } catch (e) {
                        console.error(`❌ [FAIL] ${path} -> Invalid JSON format`);
                        resolve(false);
                    }
                }
            });
        }).on('error', (err) => {
            console.error(`❌ [FAIL] ${path} -> Network Error: ${err.message}`);
            resolve(false);
        });
    });
}

async function runTests() {
    console.log('=== API Route Verification ===');
    console.log(`Testing against ${BASE_URL}\n`);

    let allPassed = true;
    for (const endpoint of ENDPOINTS) {
        const passed = await checkEndpoint(endpoint);
        if (!passed) allPassed = false;
    }

    if (allPassed) {
        console.log('\n✨ ALL API TESTS PASSED');
    } else {
        console.error('\n💀 SOME API TESTS FAILED');
        process.exit(1);
    }
}

runTests();
