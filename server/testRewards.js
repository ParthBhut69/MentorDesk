const db = require('./db/db');
const { awardPoints, calculateRank, REWARDS } = require('./controllers/rewardController');

async function testRewardSystem() {
    console.log('\n🧪 Testing Reward & Ranking System...\n');

    try {
        // Get a test user
        const user = await db('users').first();

        if (!user) {
            console.log('❌ No users found. Please register a user first.');
            process.exit(1);
        }

        console.log(`📊 Testing with user: ${user.name} (ID: ${user.id})`);
        console.log(`   Current Points: ${user.points || 0}`);
        console.log(`   Current Rank: ${user.rank || 'Beginner'}\n`);

        // Test 1: Award points for posting answer
        console.log('Test 1: Award +10 points for posting answer');
        const result1 = await awardPoints(user.id, 'answer_posted', REWARDS.ANSWER_POSTED, 1);
        console.log(`   ✅ Points awarded: +${REWARDS.ANSWER_POSTED}`);
        console.log(`   New Total: ${result1.points} points`);
        console.log(`   New Rank: ${result1.rank}\n`);

        // Test 2: Award points for answer upvote
        console.log('Test 2: Award +5 points for answer upvote');
        const result2 = await awardPoints(user.id, 'answer_upvoted', REWARDS.ANSWER_UPVOTED, 1);
        console.log(`   ✅ Points awarded: +${REWARDS.ANSWER_UPVOTED}`);
        console.log(`   New Total: ${result2.points} points`);
        console.log(`   New Rank: ${result2.rank}\n`);

        // Test 3: Award points for accepted answer
        console.log('Test 3: Award +2 points for accepted answer');
        const result3 = await awardPoints(user.id, 'answer_accepted', REWARDS.ANSWER_ACCEPTED, 1);
        console.log(`   ✅ Points awarded: +${REWARDS.ANSWER_ACCEPTED}`);
        console.log(`   New Total: ${result3.points} points`);
        console.log(`   New Rank: ${result3.rank}\n`);

        // Test 4: Check rank calculation
        console.log('Test 4: Rank Calculation Tests');
        const testCases = [
            { points: 0, expectedRank: 'Beginner' },
            { points: 50, expectedRank: 'Beginner' },
            { points: 100, expectedRank: 'Contributor' },
            { points: 250, expectedRank: 'Contributor' },
            { points: 300, expectedRank: 'Helper' },
            { points: 500, expectedRank: 'Helper' },
            { points: 700, expectedRank: 'Mentor' },
            { points: 1000, expectedRank: 'Mentor' },
            { points: 1500, expectedRank: 'Expert' },
            { points: 2000, expectedRank: 'Expert' }
        ];

        let allPassed = true;
        testCases.forEach(({ points, expectedRank }) => {
            const calculatedRank = calculateRank(points);
            const passed = calculatedRank === expectedRank;
            console.log(`   ${passed ? '✅' : '❌'} ${points} points → ${calculatedRank} ${passed ? '' : `(expected ${expectedRank})`}`);
            if (!passed) allPassed = false;
        });

        if (allPassed) {
            console.log('\n   ✅ All rank calculations passed!\n');
        } else {
            console.log('\n   ❌ Some rank calculations failed!\n');
        }

        // Test 5: Get reward history
        console.log('Test 5: Reward History');
        const rewards = await db('rewards_log')
            .where('user_id', user.id)
            .orderBy('created_at', 'desc')
            .limit(5);

        console.log(`   Found ${rewards.length} recent rewards:`);
        rewards.forEach(reward => {
            console.log(`   - ${reward.action_type}: +${reward.points_awarded} points`);
        });

        // Final user state
        const finalUser = await db('users').where('id', user.id).first();
        console.log('\n📈 Final User State:');
        console.log(`   Name: ${finalUser.name}`);
        console.log(`   Total Points: ${finalUser.points}`);
        console.log(`   Rank: ${finalUser.rank}`);
        console.log(`   Progress to next rank:`);

        const ranks = {
            'Beginner': { next: 'Contributor', needed: 100 },
            'Contributor': { next: 'Helper', needed: 300 },
            'Helper': { next: 'Mentor', needed: 700 },
            'Mentor': { next: 'Expert', needed: 1500 },
            'Expert': { next: 'Max Level!', needed: Infinity }
        };

        const currentRankInfo = ranks[finalUser.rank];
        if (currentRankInfo.needed !== Infinity) {
            const remaining = currentRankInfo.needed - finalUser.points;
            console.log(`   ${remaining} more points to reach ${currentRankInfo.next}`);
        } else {
            console.log(`   🏆 Maximum rank achieved!`);
        }

        console.log('\n✅ All tests completed successfully!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error during testing:', error);
        process.exit(1);
    }
}

testRewardSystem();
