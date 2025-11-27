import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { StatsCard } from '../../components/ui/stats-card';
import { Users, FileQuestion, MessageSquare, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Stats {
    total_users: number;
    active_users: number;
    total_questions: number;
    total_answers: number;
    recent_users: number;
    recent_questions: number;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-slate-500">Loading...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                    <p className="text-slate-600 mt-1">Overview of your platform statistics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Users"
                        value={stats?.total_users || 0}
                        icon={Users}
                        description={`${stats?.recent_users || 0} new this week`}
                    />
                    <StatsCard
                        title="Active Users"
                        value={stats?.active_users || 0}
                        icon={UserCheck}
                        description="Currently active"
                    />
                    <StatsCard
                        title="Total Questions"
                        value={stats?.total_questions || 0}
                        icon={FileQuestion}
                        description={`${stats?.recent_questions || 0} new this week`}
                    />
                    <StatsCard
                        title="Total Answers"
                        value={stats?.total_answers || 0}
                        icon={MessageSquare}
                        description="All time"
                    />
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="p-4 border border-slate-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left"
                            >
                                <Users className="h-6 w-6 text-primary-600 mb-2" />
                                <h3 className="font-semibold text-slate-900">Manage Users</h3>
                                <p className="text-sm text-slate-600 mt-1">View and manage all users</p>
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="p-4 border border-slate-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left"
                            >
                                <FileQuestion className="h-6 w-6 text-primary-600 mb-2" />
                                <h3 className="font-semibold text-slate-900">View Questions</h3>
                                <p className="text-sm text-slate-600 mt-1">Browse all questions</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
