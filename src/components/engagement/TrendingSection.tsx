import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface TrendingQuestion {
    id: number;
    title: string;
    upvotes: number;
    answer_count: number;
}

interface TopExpert {
    id: number;
    name: string;
    is_verified_expert: boolean;
    total_upvotes: number;
    answer_count: number;
}

interface PopularTag {
    id: number;
    name: string;
    question_count: number;
}

export function TrendingSection() {
    const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
    const [topExperts, setTopExperts] = useState<TopExpert[]>([]);
    const [popularTags, setPopularTags] = useState<PopularTag[]>([]);

    useEffect(() => {
        fetchTrendingData();
    }, []);

    const fetchTrendingData = async () => {
        try {
            // Fetch trending questions
            const questionsRes = await fetch('http://localhost:3000/api/trending/questions');
            if (questionsRes.ok) {
                const data = await questionsRes.json();
                setTrendingQuestions(data.slice(0, 5));
            }

            // Fetch top experts
            const expertsRes = await fetch('http://localhost:3000/api/trending/experts');
            if (expertsRes.ok) {
                const data = await expertsRes.json();
                setTopExperts(data.slice(0, 5));
            }

            // Fetch popular tags
            const tagsRes = await fetch('http://localhost:3000/api/trending/tags');
            if (tagsRes.ok) {
                const data = await tagsRes.json();
                setPopularTags(data.slice(0, 10));
            }
        } catch (error) {
            console.error('Error fetching trending data:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Trending Questions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        Trending Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {trendingQuestions.length > 0 ? (
                        <div className="space-y-3">
                            {trendingQuestions.map((question) => (
                                <Link
                                    key={question.id}
                                    to={`/question/${question.id}`}
                                    className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <h4 className="text-sm font-medium text-slate-900 line-clamp-2">
                                        {question.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                                        <span>{question.upvotes} upvotes</span>
                                        <span>{question.answer_count} answers</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No trending questions yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Top Experts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Top Experts This Week
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topExperts.length > 0 ? (
                        <div className="space-y-2">
                            {topExperts.map((expert, index) => (
                                <div
                                    key={expert.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-400">#{index + 1}</span>
                                        <span className="text-sm font-medium text-slate-900">{expert.name}</span>
                                        {expert.is_verified_expert && (
                                            <Badge variant="default" className="text-xs">Verified</Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-600">{expert.total_upvotes} pts</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No experts yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Tag className="h-5 w-5 text-blue-600" />
                        Popular Topics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {popularTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary-50"
                                >
                                    {tag.name} ({tag.question_count})
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No tags yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
