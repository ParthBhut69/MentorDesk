const db = require('../db/db');
const { awardPoints, REWARDS } = require('./rewardController');

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const result = await db.transaction(async (trx) => {
            const [id] = await trx('questions').insert({
                user_id: req.user.id,
                title,
                description,
                image_url: req.body.image || null
            });

            // Extract tags from title and description
            const extractTags = (text) => {
                const regex = /#(\w+)/g;
                const matches = text.match(regex);
                return matches ? matches.map(tag => tag.substring(1)) : [];
            };

            const titleTags = extractTags(title);
            const descTags = extractTags(description);
            const uniqueTags = [...new Set([...titleTags, ...descTags])];

            // Save tags
            for (const tagName of uniqueTags) {
                let tag = await trx('tags').where({ name: tagName }).first();
                if (!tag) {
                    const [tagId] = await trx('tags').insert({ name: tagName });
                    tag = { id: tagId };
                }
                await trx('question_tags').insert({
                    question_id: id,
                    tag_id: tag.id
                });
            }

            // Award points for posting question
            await awardPoints(req.user.id, 'question_posted', REWARDS.QUESTION_POSTED, id, trx);

            const question = await trx('questions').where({ id }).first();
            return question;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getAllQuestions = async (req, res) => {
    try {
        const { filter, tag } = req.query;
        let query = db('questions')
            .leftJoin('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                db.raw('COALESCE(users.name, \'[Deleted User]\') as user_name'),
                db.raw('COALESCE(users.avatar_url, null) as user_avatar'),
                db.raw('COALESCE(users.is_verified_expert, false) as is_verified_expert'),
                db.raw('COALESCE(users.expert_role, null) as expert_role'),
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id AND answers.deleted_at IS NULL) as answers_count')
            )
            .whereNull('questions.deleted_at');  // Exclude soft-deleted questions

        if (filter === 'unanswered') {
            query = query
                .leftJoin('answers', function () {
                    this.on('questions.id', '=', 'answers.question_id')
                        .andOnNull('answers.deleted_at');
                })
                .whereNull('answers.id');
        } else if (filter === 'trending') {
            // Trending logic is handled in trendingController, but simple sort here
            query = query
                .orderBy('questions.views', 'desc')
                .orderBy('questions.upvotes', 'desc');
        } else {
            query = query.orderBy('questions.created_at', 'desc');
        }

        if (tag) {
            query = query
                .join('question_tags', 'questions.id', 'question_tags.question_id')
                .join('tags', 'question_tags.tag_id', 'tags.id')
                .where('tags.name', tag);
        }

        const questions = await query;
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
    try {
        const question = await db('questions')
            .leftJoin('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                db.raw('COALESCE(users.name, \'[Deleted User]\') as user_name'),
                db.raw('COALESCE(users.avatar_url, null) as user_avatar'),
                db.raw('COALESCE(users.is_verified_expert, false) as is_verified_expert'),
                db.raw('COALESCE(users.expert_role, null) as expert_role'),
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id AND answers.deleted_at IS NULL) as answers_count')
            )
            .where('questions.id', req.params.id)
            .whereNull('questions.deleted_at')  // Exclude soft-deleted
            .first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
    try {
        const question = await db('questions').where({ id: req.params.id }).first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check user
        if (question.user_id !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { title, description, image } = req.body;

        await db('questions')
            .where({ id: req.params.id })
            .update({
                title: title || question.title,
                description: description || question.description,
                image_url: image !== undefined ? image : question.image_url,
                updated_at: db.fn.now()
            });

        const updatedQuestion = await db('questions').where({ id: req.params.id }).first();
        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete question (SOFT DELETE)
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
    try {
        const question = await db('questions')
            .where({ id: req.params.id })
            .whereNull('deleted_at')  // Already deleted check
            .first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check user or admin - admins can delete any question (spam/inappropriate content)
        if (question.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // SOFT DELETE instead of hard delete
        await db('questions')
            .where({ id: req.params.id })
            .update({
                deleted_at: db.fn.now(),
                deleted_by: req.user.id
            });

        console.log(`Question ${req.params.id} soft-deleted by user ${req.user.id}`);
        res.json({ id: req.params.id, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get questions by user
// @route   GET /api/questions/user/:userId
// @access  Public
const getUserQuestions = async (req, res) => {
    try {
        const questions = await db('questions')
            .leftJoin('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                db.raw('COALESCE(users.name, \'[Deleted User]\') as user_name'),
                db.raw('COALESCE(users.avatar_url, null) as user_avatar'),
                db.raw('COALESCE(users.is_verified_expert, false) as is_verified_expert'),
                db.raw('COALESCE(users.expert_role, null) as expert_role'),
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id AND answers.deleted_at IS NULL) as answers_count')
            )
            .where('questions.user_id', req.params.userId)
            .whereNull('questions.deleted_at')  // Exclude soft-deleted
            .orderBy('questions.created_at', 'desc');

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getUserQuestions,
};
