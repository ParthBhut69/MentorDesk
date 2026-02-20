import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { VoteButton } from '../components/engagement/VoteButton';
import { ShareButton } from '../components/engagement/ShareButton';
import { BookmarkButton } from '../components/engagement/BookmarkButton';
import { ExpertBadge } from '../components/common/ExpertBadge';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../lib/auth';
import { toast } from 'react-hot-toast';

export function QuestionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [question, setQuestion] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [answerText, setAnswerText] = useState('');

    useEffect(() => {
        if (id) {
            fetchQuestion();
            fetchAnswers();
        }
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await fetch(`${API_URL}/api/questions/${id}`);
            if (!response.ok) {
                if (response.status === 404) setQuestion(null);
                throw new Error('Failed to load question');
            }
            const data = await response.json();
            setQuestion(data);
        } catch (error) {
            console.error('Failed to fetch question:', error);
            // Optionally set error state here if UI supports it
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/questions/${id}/answers`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAnswers(data);
                } else {
                    setAnswers([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch answers:', error);
            setAnswers([]);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answerText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/questions/${id}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answer_text: answerText })
            });

            if (response.ok) {
                setAnswerText('');
                fetchAnswers(); // Refresh answers
                toast.success('Answer posted successfully!');
            }
        } catch (error) {
            console.error('Failed to post answer:', error);
            toast.error('Failed to post answer');
        }
    };

    const handleDeleteQuestion = async () => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/questions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Question deleted successfully');
                navigate('/');
            } else {
                toast.error('Failed to delete question');
            }
        } catch (error) {
            console.error('Failed to delete question:', error);
            toast.error('Error deleting question');
        }
    };

    const handleDeleteAnswer = async (answerId: number) => {
        if (!window.confirm('Are you sure you want to delete this answer?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/answers/${answerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Answer deleted successfully');
                fetchAnswers();
            } else {
                toast.error('Failed to delete answer');
            }
        } catch (error) {
            console.error('Failed to delete answer:', error);
            toast.error('Error deleting answer');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="text-center py-8 text-slate-500">Loading question...</div>
            </MainLayout>
        );
    }

    if (!question) {
        return (
            <MainLayout>
                <div className="text-center py-8 text-slate-500">Question not found</div>
            </MainLayout>
        );
    }

    const canDeleteQuestion = user && (user.id === question.user_id || user.role === 'admin');

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-6">
                <Sidebar className="shrink-0 hidden lg:block" />

                <div className="flex-1 min-w-0 space-y-6">
                    {/* Question Section */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{question.title}</h1>
                                    {canDeleteQuestion && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDeleteQuestion}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={question.user_avatar} alt={question.user_name} />
                                        <AvatarFallback>{question.user_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <Link
                                        to={`/profile/${question.user_id}`}
                                        className="text-sm font-medium text-slate-900 hover:text-primary-600 transition-colors"
                                    >
                                        {question.user_name || 'Anonymous'}
                                    </Link>
                                    {question.is_verified_expert && question.expert_role && (
                                        <ExpertBadge expertRole={question.expert_role} isVerified={true} size="sm" />
                                    )}
                                    <span className="text-xs text-slate-500">• {new Date(question.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="prose prose-slate max-w-none mb-6 text-slate-800">
                                    <p>{question.description}</p>
                                    {question.image_url && (
                                        <div className="mt-4">
                                            <img
                                                src={question.image_url}
                                                alt="Question attachment"
                                                className="rounded-lg max-h-96 w-full object-contain border border-slate-100 bg-slate-50"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-6">
                                    <VoteButton
                                        votableType="question"
                                        votableId={question.id}
                                        initialUpvotes={question.upvotes || 0}
                                    />
                                    <BookmarkButton questionId={question.id} />
                                    <ShareButton
                                        questionId={question.id}
                                        questionTitle={question.title}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Answer Input */}
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                className="w-full min-h-[150px] p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:outline-none mb-4"
                                placeholder="Write your solution here..."
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSubmitAnswer}>Post Answer</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answers List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">{answers.length} Answers</h3>

                        {answers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No answers yet. Be the first to answer!
                            </div>
                        ) : (
                            answers.map((answer) => {
                                const canDeleteAnswer = user && (user.id === answer.user_id || user.role === 'admin');
                                return (
                                    <Card key={answer.id} className={answer.is_accepted ? "border-green-200 bg-green-50/30" : ""}>
                                        <CardContent className="pt-6">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <VoteButton
                                                        votableType="answer"
                                                        votableId={answer.id}
                                                        initialUpvotes={answer.upvotes || 0}
                                                    />
                                                    {answer.is_accepted && (
                                                        <div className="mt-2 text-green-600" title="Best Answer">
                                                            <CheckCircle2 className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={answer.user_avatar} alt={answer.user_name} />
                                                                <AvatarFallback>{answer.user_name?.[0] || 'U'}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/profile/${answer.user_id}`}
                                                                    className="text-sm font-bold block hover:text-primary-600 transition-colors"
                                                                >
                                                                    {answer.user_name || 'Anonymous'}
                                                                </Link>
                                                                {answer.is_verified_expert && answer.expert_role && (
                                                                    <ExpertBadge expertRole={answer.expert_role} isVerified={true} size="sm" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(answer.created_at).toLocaleDateString()}
                                                            </span>
                                                            {canDeleteAnswer && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteAnswer(answer.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="prose prose-sm max-w-none text-slate-800">
                                                        <p>{answer.answer_text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
