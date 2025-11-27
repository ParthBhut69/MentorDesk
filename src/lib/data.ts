import type { User, Question } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Sarah Miller',
        email: 'sarah@example.com',
        role: 'mentor',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
        bio: 'Senior Financial Analyst | CPA',
        isVerified: true,
        badges: ['Finance Expert', 'Top Mentor'],
        stats: { questions: 5, answers: 142, followers: 890, following: 45 }
    },
    {
        id: '2',
        name: 'David Chen',
        email: 'david@example.com',
        role: 'user',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
        bio: 'Startup Founder & Tech Enthusiast',
        isVerified: false,
        badges: [],
        stats: { questions: 12, answers: 3, followers: 120, following: 60 }
    },
    {
        id: '3',
        name: 'Emily Johnson',
        email: 'emily@example.com',
        role: 'mentor',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
        bio: 'HR Director with 15+ years experience',
        isVerified: true,
        badges: ['HR Specialist'],
        stats: { questions: 2, answers: 89, followers: 560, following: 30 }
    }
];

export const MOCK_QUESTIONS: Question[] = [
    {
        id: '101',
        title: 'How do I handle international tax compliance for a SaaS startup?',
        content: 'I am expanding my SaaS business to Europe and I am confused about VAT and other tax obligations. Do I need to register in every country?',
        author: MOCK_USERS[1],
        createdAt: '2023-10-25T10:30:00Z',
        tags: ['Finance', 'Tax', 'Startup', 'SaaS'],
        views: 1250,
        upvotes: 45,
        answersCount: 3,
        isAnswered: true
    },
    {
        id: '102',
        title: 'Best practices for remote team conflict resolution?',
        content: 'We have a fully remote team and recently two senior developers have been clashing over architectural decisions. It is affecting the team morale. How should I approach this?',
        author: MOCK_USERS[1],
        createdAt: '2023-10-26T14:15:00Z',
        tags: ['HR', 'Management', 'Remote Work'],
        views: 890,
        upvotes: 32,
        answersCount: 5,
        isAnswered: true
    },
    {
        id: '103',
        title: 'What are the most effective low-budget marketing strategies for B2B?',
        content: 'We are a bootstrapped B2B service provider. We cannot afford expensive ads. What organic strategies have worked for you?',
        author: MOCK_USERS[1],
        createdAt: '2023-10-27T09:00:00Z',
        tags: ['Marketing', 'B2B', 'Growth'],
        views: 2100,
        upvotes: 120,
        answersCount: 12,
        isAnswered: false
    }
];
