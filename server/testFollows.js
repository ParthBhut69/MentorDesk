const db = require('./db/db');
const { followUser, unfollowUser, getFollowing, getFollowers } = require('./controllers/followerController');

// Mock request and response objects
const mockReq = (body = {}, params = {}, query = {}, user = { id: 1 }) => ({
    body,
    params,
    query,
    user
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testFollowSystem() {
    console.log('\n🧪 Testing Follow System...\n');

    try {
        // Get a test user (User A)
        const userA = await db('users').first();
        if (!userA) {
            console.log('❌ No users found. Please register a user first.');
            process.exit(1);
        }

        // Get another test user (User B) or create one
        let userB = await db('users').whereNot('id', userA.id).first();
        if (!userB) {
            console.log('Creating User B for testing...');
            const [id] = await db('users').insert({
                name: 'Test User B',
                email: 'testb@example.com',
                password: 'hashedpassword'
            });
            userB = await db('users').where('id', id).first();
        }

        console.log(`User A: ${userA.name} (${userA.id})`);
        console.log(`User B: ${userB.name} (${userB.id})`);

        // Test 1: User A follows User B
        console.log('\nTest 1: User A follows User B');
        let req = mockReq({ user_id: userB.id, type: 'user' }, {}, {}, userA);
        let res = mockRes();
        await followUser(req, res);
        console.log(`   Response: ${res.statusCode || 200} - ${JSON.stringify(res.data)}`);

        // Verify in DB
        const follow = await db('follows').where({
            follower_id: userA.id,
            followed_id: userB.id,
            followed_type: 'user'
        }).first();
        console.log(`   DB Check: ${follow ? '✅ Follow record exists' : '❌ Follow record missing'}`);

        // Test 2: Get Following for User A
        console.log('\nTest 2: Get Following for User A');
        req = mockReq({}, { user_id: userA.id }, { type: 'user' }, userA);
        res = mockRes();
        await getFollowing(req, res);
        console.log(`   Response: ${res.statusCode || 200} - Found ${res.data.length} following`);
        const isFollowingB = res.data.some(u => u.id === userB.id);
        console.log(`   Check: ${isFollowingB ? '✅ User A is following User B' : '❌ User B not found in following list'}`);

        // Test 3: User A unfollows User B
        console.log('\nTest 3: User A unfollows User B');
        req = mockReq({}, { user_id: userB.id }, { type: 'user' }, userA);
        res = mockRes();
        await unfollowUser(req, res);
        console.log(`   Response: ${res.statusCode || 200} - ${JSON.stringify(res.data)}`);

        // Verify in DB
        const followCheck = await db('follows').where({
            follower_id: userA.id,
            followed_id: userB.id,
            followed_type: 'user'
        }).first();
        console.log(`   DB Check: ${!followCheck ? '✅ Follow record removed' : '❌ Follow record still exists'}`);

        // Test 4: Create and Follow Category
        console.log('\nTest 4: Create and Follow Category');
        // Create category manually for test
        const catName = 'Test Category ' + Date.now();
        const [catId] = await db('categories').insert({
            name: catName,
            slug: 'test-category-' + Date.now(),
            description: 'A test category'
        });
        console.log(`   Created Category: ${catName} (${catId})`);

        // Follow Category
        req = mockReq({ user_id: catId, type: 'category' }, {}, {}, userA);
        res = mockRes();
        await followUser(req, res); // Using followUser which handles generic types now
        console.log(`   Response: ${res.statusCode || 200} - ${JSON.stringify(res.data)}`);

        // Verify
        const catFollow = await db('follows').where({
            follower_id: userA.id,
            followed_id: catId,
            followed_type: 'category'
        }).first();
        console.log(`   DB Check: ${catFollow ? '✅ Category follow record exists' : '❌ Category follow record missing'}`);

        console.log('\n✅ All tests completed successfully!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error during testing:', error);
        process.exit(1);
    }
}

testFollowSystem();
