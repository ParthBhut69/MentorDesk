import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bookmark, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookmarkedQuestion {
    id: number;
    title: string;
    description: string;
    author_name: string;
    created_at: string;
    bookmarked_at: string;
    answer_count?: number;
}

export function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:3000/api/engagement/bookmarks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (questionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/engagement/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question_id: questionId })
            });

            if (response.ok) {
                setBookmarks(bookmarks.filter(b => b.id !== questionId));
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto py-8 text-center">
                    <p className="text-slate-500">Loading bookmarks...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Bookmark className="h-6 w-6 text-primary-600" />
                    <h1 className="text-2xl font-bold text-slate-900">Saved Questions</h1>
                </div>

                {bookmarks.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No saved questions yet</p>
                            <p className="text-sm text-slate-400 mt-2">
                                Click the bookmark icon on any question to save it for later
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookmarks.map((bookmark) => (
                            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => navigate(`/question/${bookmark.id}`)}
                                        >
                                            <h3 className="text-lg font-semibold text-slate-900 hover:text-primary-600 mb-2">
                                                {bookmark.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                                {bookmark.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>by {bookmark.author_name}</span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Saved {new Date(bookmark.bookmarked_at).toLocaleDateString()}</span>
                                                </div>
                                                {bookmark.answer_count !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        <span>{bookmark.answer_count} answers</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeBookmark(bookmark.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
