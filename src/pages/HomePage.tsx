import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Sidebar } from '../components/layout/Sidebar';
import { QuestionCard } from '../components/feed/QuestionCard';
import { Button } from '../components/ui/button';
import { PenSquare } from 'lucide-react';

import { API_URL } from '../config/api';

export function HomePage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchQuestions();
    }, [searchParams]);

    const fetchQuestions = async () => {
        try {
            const filter = searchParams.get('filter');
            const tag = searchParams.get('tag');

            let url = `${API_URL}/api/questions`;

            const params = new URLSearchParams();
            if (filter) params.append('filter', filter);
            if (tag) params.append('tag', tag);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-6">
                <Sidebar className="shrink-0 hidden lg:block" />

                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Top Questions for You</h1>
                        <Link to="/ask" className="hidden lg:block">
                            <Button className="gap-2 shadow-lg shadow-primary-600/20">
                                <PenSquare className="h-4 w-4" />
                                Ask Question
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading questions...</div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No questions yet. Be the first to ask!
                            </div>
                        ) : (
                            questions.map((question) => (
                                <QuestionCard key={question.id} question={{
                                    id: question.id.toString(),
                                    title: question.title,
                                    content: question.description,
                                    author: {
                                        id: question.user_id.toString(),
                                        name: question.user_name || 'Anonymous',
                                        email: '',
                                        avatarUrl: question.user_avatar,
                                        bio: '',
                                        role: 'user' as const,
                                        isVerified: false
                                    },
                                    createdAt: question.created_at,
                                    tags: [],
                                    views: question.views || 0,
                                    upvotes: question.upvotes || 0,
                                    answersCount: question.answers_count || 0,
                                    isAnswered: false,
                                    image_url: question.image_url
                                }} />
                            ))
                        )}
                    </div>
                </div>

                <div className="hidden xl:block w-80 shrink-0">
                    {/* Right Sidebar Placeholder */}
                    <div className="sticky top-24 space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-2">Trending Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Remote Work', 'AI Tools', 'Fundraising', 'Tax Law'].map(tag => (
                                    <span key={tag} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-200">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
