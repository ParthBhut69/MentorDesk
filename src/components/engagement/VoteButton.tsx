import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/button';

interface VoteButtonProps {
    votableType: 'question' | 'answer';
    votableId: number;
    initialUpvotes: number;
    userVote?: 'upvote' | 'downvote' | null;
}

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
            const response = await fetch('http://localhost:3000/api/engagement/votes', {
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
        <div className="flex items-center gap-2">
            <Button
                variant={userVote === 'upvote' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleVote('upvote')}
                disabled={loading}
                className={userVote === 'upvote' ? 'bg-primary-600' : ''}
            >
                <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-700">{upvotes}</span>
            <Button
                variant={userVote === 'downvote' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleVote('downvote')}
                disabled={loading}
            >
                <ThumbsDown className="h-4 w-4" />
            </Button>
        </div>
    );
}
