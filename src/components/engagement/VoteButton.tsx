import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/button';

interface VoteButtonProps {
    votableType: 'question' | 'answer';
    votableId: number;
    initialUpvotes: number;
    userVote?: 'upvote' | 'downvote' | null;
}

import { API_URL } from '../../config/api';

export function VoteButton({ votableType, votableId, initialUpvotes, userVote: initialUserVote }: VoteButtonProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote || null);
    const [loading, setLoading] = useState(false);

    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to vote');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/engagement/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    votable_type: votableType,
                    votable_id: votableId,
                    vote_type: voteType
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Update UI based on action
                if (data.action === 'removed') {
                    setUserVote(null);
                    setUpvotes(prev => prev + (voteType === 'upvote' ? -1 : 1));
                } else if (data.action === 'updated') {
                    setUserVote(voteType);
                    setUpvotes(prev => prev + (voteType === 'upvote' ? 2 : -2));
                } else {
                    setUserVote(voteType);
                    setUpvotes(prev => prev + (voteType === 'upvote' ? 1 : -1));
                }
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                <Button
                    variant={userVote === 'upvote' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleVote('upvote');
                    }}
                    disabled={loading}
                    className={`h-8 px-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 gap-1.5 rounded-full transition-colors ${userVote === 'upvote' ? 'bg-primary-50 text-primary-600' : ''}`}
                >
                    <ThumbsUp className={`h-4 w-4 ${userVote === 'upvote' ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{upvotes}</span>
                    <span className="text-xs font-medium hidden sm:inline">Upvote</span>
                </Button>
            </div>
            <Button
                variant={userVote === 'downvote' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVote('downvote');
                }}
                disabled={loading}
                className={`h-8 px-2 text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 rounded-full transition-colors ${userVote === 'downvote' ? 'bg-red-50 text-red-600' : ''}`}
            >
                <ThumbsDown className={`h-4 w-4 ${userVote === 'downvote' ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium hidden sm:inline">Downvote</span>
            </Button>
        </div>
    );
}
