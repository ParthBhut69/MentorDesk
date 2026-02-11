import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { API_URL } from '../../config/api';

interface Comment {
    id: number;
    answer_id: number;
    user_id: number;
    user_name: string;
    comment_text: string;
    created_at: string;
}

interface CommentSectionProps {
    answerId: number;
}

export function CommentSection({ answerId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchComments();
    }, [answerId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_URL}/api/engagement/comments?answer_id=${answerId}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to comment');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/engagement/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answer_id: answerId,
                    comment_text: newComment
                })
            });

            if (response.ok) {
                const data = await response.json();
                setComments([...comments, data]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/engagement/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            {/* Comments List */}
            {comments.length > 0 && (
                <div className="space-y-2">
                    {comments.map((comment) => (
                        <Card key={comment.id} className="bg-slate-50">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-900">{comment.user_name}</span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1">{comment.comment_text}</p>
                                    </div>
                                    {currentUser.id === comment.user_id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
