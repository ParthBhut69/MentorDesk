import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RankBadge } from './RankBadge';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
    id: number;
    name: string;
    points: number;
    rank: string;
    is_verified_expert: boolean;
}

export function Leaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/rewards/leaderboard?limit=10');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-500">Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {users.map((user, index) => (
                        <Link
                            key={user.id}
                            to={`/profile/${user.id}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-slate-100 text-slate-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-50 text-slate-600'
                                    }`}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{user.name}</span>
                                        {user.is_verified_expert && (
                                            <span className="text-xs text-blue-600">✓ Verified</span>
                                        )}
                                    </div>
                                    <RankBadge rank={user.rank} size="sm" />
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary-600">{user.points}</div>
                                <div className="text-xs text-slate-500">points</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
