import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, User } from 'lucide-react';

import { API_URL } from '../config/api';

interface SearchResults {
    questions: any[];
    answers: any[];
}

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResults>({ questions: [], answers: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Search Results</h1>
                <p className="text-slate-600 mb-8">
                    Showing results for <span className="font-semibold">"{query}"</span>
                </p>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'questions'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setActiveTab('questions')}
                    >
                        Questions ({results.questions.length})
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'answers'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setActiveTab('answers')}
                    >
                        Answers ({results.answers.length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Searching...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'questions' ? (
                            results.questions.length > 0 ? (
                                results.questions.map((question) => (
                                    <Link key={question.id} to={`/question/${question.id}`}>
                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                    {question.title}
                                                </h3>
                                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                    {question.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{question.author_name}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{new Date(question.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-lg">
                                    <p className="text-slate-500">No questions found matching "{query}"</p>
                                </div>
                            )
                        ) : (
                            results.answers.length > 0 ? (
                                results.answers.map((answer) => (
                                    <Link key={answer.id} to={`/question/${answer.question_id}`}>
                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="mb-2">
                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Answer to:
                                                    </span>
                                                    <h3 className="text-base font-semibold text-slate-900 mt-1">
                                                        {answer.question_title}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-4 line-clamp-3 bg-slate-50 p-3 rounded-md">
                                                    {answer.answer_text}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{answer.author_name}</span>
                                                    </div>
                                                    {answer.is_accepted && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Accepted
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-lg">
                                    <p className="text-slate-500">No answers found matching "{query}"</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
