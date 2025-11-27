export type UserRole = 'user' | 'mentor' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    bio?: string;
    isVerified?: boolean;
    badges?: string[];
    stats?: {
        questions: number;
        answers: number;
        followers: number;
        following: number;
    };
}

export interface Question {
    id: string;
    title: string;
    content: string;
    author: User;
    createdAt: string;
    tags: string[];
    views: number;
    upvotes: number;
    answersCount: number;
    isAnswered: boolean;
}

export interface Answer {
    id: string;
    questionId: string;
    content: string;
    author: User;
    createdAt: string;
    upvotes: number;
    isAccepted: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'answer' | 'follow' | 'mention' | 'upvote';
    message: string;
    read: boolean;
    createdAt: string;
}
