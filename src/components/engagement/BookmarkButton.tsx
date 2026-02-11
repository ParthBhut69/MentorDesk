import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '../ui/button';

interface BookmarkButtonProps {
    questionId: number;
    initialBookmarked?: boolean;
}
import { API_URL } from '../../config/api';

export function BookmarkButton({ questionId, initialBookmarked = false }: BookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [loading, setLoading] = useState(false);

    const handleBookmark = async () => {
        if (loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to bookmark');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/engagement/bookmarks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question_id: questionId })
            });

            if (response.ok) {
                const data = await response.json();
                setBookmarked(data.bookmarked);
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={bookmarked ? 'default' : 'ghost'}
            size="sm"
            onClick={handleBookmark}
            disabled={loading}
            className={bookmarked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'Saved' : 'Save'}
        </Button>
    );
}
