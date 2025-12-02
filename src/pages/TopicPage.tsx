import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { MessageSquare, TrendingUp, Hash } from 'lucide-react';
import { API_URL } from '../config/api';

interface Question {
    id: number;
    title: string;
    description: string;
    user_name: string;
    user_avatar: string;
    created_at: string;
    answers_count: number;
    upvotes: number;
    views: number;
}

export function TopicPage() {
    const { tag } = useParams<{ tag: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tag) {
            fetchQuestionsByTag(tag);
        }
    }, [tag]);

    const fetchQuestionsByTag = async (tagName: string) => {
        setLoading(true);
        setError('');
        try {
            // Remove # if present
            const cleanTag = tagName.replace('#', '');
            const response = await fetch(`${API_URL}/api/questions?tag=${encodeURIComponent(cleanTag)}`);

            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
            } else {
                setError('Failed to load questions for this topic');
            }
        } catch (err) {
            console.error('Error fetching questions by tag:', err);
            setError('Error loading questions');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto py-8">
                    <div className="text-center text-slate-500">Loading questions...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8 space-y-6">
                {/* Topic Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <Hash className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">#{tag}</h1>
                        <p className="text-slate-600">{questions.length} {questions.length === 1 ? 'question' : 'questions'}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Questions List */}
                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Hash className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions yet</h3>
                            <p className="text-slate-600">Be the first to ask a question about #{tag}!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <Card
                                key={question.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/question/${question.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        {/* Stats Sidebar */}
                                        <div className="flex flex-col gap-2 text-center min-w-[60px]">
                                            <div className="flex flex-col items-center">
                                                <TrendingUp className="h-4 w-4 text-slate-400 mb-1" />
                                                <span className="text-sm font-semibold text-slate-700">{question.upvotes || 0}</span>
                                                <span className="text-xs text-slate-500">votes</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <MessageSquare className="h-4 w-4 text-slate-400 mb-1" />
                                                <span className="text-sm font-semibold text-slate-700">{question.answers_count || 0}</span>
                                                <span className="text-xs text-slate-500">answers</span>
                                            </div>
                                        </div>

                                        {/* Question Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-slate-900 hover:text-primary-600 mb-2">
                                                {question.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                {question.description}
                                            </p>

                                            {/* Author & Meta */}
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={question.user_avatar} />
                                                        <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                                                            {question.user_name?.[0]?.toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-700">{question.user_name}</span>
                                                </div>
                                                <span>•</span>
                                                <span>{formatDate(question.created_at)}</span>
                                                {question.views > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{question.views} views</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
