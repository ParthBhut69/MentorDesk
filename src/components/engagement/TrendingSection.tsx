import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Tag, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { API_URL } from '../../config/api';

interface TrendingQuestion {
    id: number;
    title: string;
    upvotes: number;
    answer_count: number;
}

interface TopExpert {
    id: number;
    name: string;
    avatar_url?: string;
    is_verified_expert: boolean;
    total_upvotes: number;
    answer_count: number;
}

interface TrendingTopic {
    id: number;
    topic_id: number;
    topic_name: string;
    trending_score: number;
    growth_rate: number;
    views_count: number;
    posts_count: number;
    likes_count: number;
    replies_count: number;
    rank: number;
}

const TIME_WINDOWS = [
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' }
];

export function TrendingSection() {
    const navigate = useNavigate();
    const [timeWindow, setTimeWindow] = useState('7d');
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
    const [topExperts, setTopExperts] = useState<TopExpert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingData = async () => {
            setLoading(true);
            try {
                // Fetch trending topics (new enhanced API)
                const topicsRes = await fetch(
                    `${API_URL}/api/trending/topics?limit=10&timeWindow=${timeWindow}`
                );
                if (topicsRes.ok) {
                    const data = await topicsRes.json();
                    setTrendingTopics(data);
                }

                // Fetch trending questions
                const questionsRes = await fetch(
                    `${API_URL}/api/trending/questions?limit=5&timeWindow=${timeWindow}`
                );
                if (questionsRes.ok) {
                    const data = await questionsRes.json();
                    setTrendingQuestions(data);
                }

                // Fetch top experts
                const expertsRes = await fetch(
                    `${API_URL}/api/trending/experts?limit=5&timeWindow=${timeWindow}`
                );
                if (expertsRes.ok) {
                    const data = await expertsRes.json();
                    setTopExperts(data);
                }
            } catch (error) {
                console.error('Error fetching trending data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, [timeWindow]);

    const getGrowthIcon = (growthRate: number) => {
        if (growthRate > 10) return <ArrowUp className="h-3 w-3 text-green-600" />;
        if (growthRate < -10) return <ArrowDown className="h-3 w-3 text-red-600" />;
        return <Minus className="h-3 w-3 text-gray-400" />;
    };

    const getGrowthColor = (growthRate: number) => {
        if (growthRate > 10) return 'text-green-600';
        if (growthRate < -10) return 'text-red-600';
        return 'text-gray-600';
    };

    const handleTagClick = (tagName: string) => {
        navigate(`/?tag=${encodeURIComponent(tagName)}`);
    };

    return (
        <div className="space-y-6">
            {/* Time Window Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {TIME_WINDOWS.map((window) => (
                    <button
                        key={window.value}
                        onClick={() => setTimeWindow(window.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${timeWindow === window.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {window.label}
                    </button>
                ))}
            </div>

            {/* Trending Topics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : trendingTopics.length > 0 ? (
                        <div className="space-y-2">
                            {trendingTopics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTagClick(topic.topic_name)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-xs font-bold text-slate-400 w-6">
                                            #{topic.rank}
                                        </span>
                                        <Tag className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-slate-900 truncate">
                                            {topic.topic_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-1">
                                            {getGrowthIcon(topic.growth_rate)}
                                            <span className={`text-xs font-semibold ${getGrowthColor(topic.growth_rate)}`}>
                                                {topic.growth_rate > 0 ? '+' : ''}
                                                {topic.growth_rate.toFixed(0)}%
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {topic.posts_count} posts
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No trending topics yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Trending Questions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        Hot Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : trendingQuestions.length > 0 ? (
                        <div className="space-y-3">
                            {trendingQuestions.map((question) => (
                                <Link
                                    key={question.id}
                                    to={`/question/${question.id}`}
                                    className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <h4 className="text-sm font-medium text-slate-900 line-clamp-2 mb-2">
                                        {question.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-600">
                                        <span>{question.upvotes} upvotes</span>
                                        <span>•</span>
                                        <span>{question.answer_count} answers</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No trending questions yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Top Experts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Top Experts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : topExperts.length > 0 ? (
                        <div className="space-y-2">
                            {topExperts.map((expert, index) => (
                                <div
                                    key={expert.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-400 w-6">
                                            #{index + 1}
                                        </span>
                                        {expert.avatar_url ? (
                                            <img
                                                src={expert.avatar_url}
                                                alt={expert.name}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-primary-600">
                                                    {expert.name[0].toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-slate-900">
                                            {expert.name}
                                        </span>
                                        {expert.is_verified_expert && (
                                            <Badge variant="default" className="text-xs">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-600">
                                        {expert.total_upvotes} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No experts yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
