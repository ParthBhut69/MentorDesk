import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Mail, Calendar, FileQuestion, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

interface UserDetails {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    questions: Array<{
        id: number;
        title: string;
        description: string;
        created_at: string;
    }>;
    answers: Array<{
        id: number;
        answer_text: string;
        question_title: string;
        created_at: string;
    }>;
    stats: {
        total_questions: number;
        total_answers: number;
    };
    is_verified_expert?: boolean;
    expert_role?: string | null;
}

export function UserDetails() {
    const { id } = useParams();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedExpertRole, setSelectedExpertRole] = useState('');
    const [verifyingExpert, setVerifyingExpert] = useState(false);
    const navigate = useNavigate();

    const expertRoles = [
        'CA', 'Lawyer', 'HR', 'Marketing', 'Finance', 'Tax',
        'Business', 'IT', 'Sales', 'Operations', 'Compliance', 'Strategy'
    ];

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUserDetails();
    }, [id, navigate]);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setSelectedExpertRole(data.expert_role || '');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyExpert = async () => {
        if (!selectedExpertRole) {
            alert('Please select an expert role');
            return;
        }

        setVerifyingExpert(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${id}/verify-expert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ expert_role: selectedExpertRole })
            });

            if (response.ok) {
                await fetchUserDetails();
                alert('User verified as expert successfully!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to verify expert');
            }
        } catch (error) {
            console.error('Error verifying expert:', error);
            alert('Error verifying expert');
        } finally {
            setVerifyingExpert(false);
        }
    };

    const removeExpertStatus = async () => {
        if (!confirm('Are you sure you want to remove expert status from this user?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${id}/expert-status`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchUserDetails();
                setSelectedExpertRole('');
                alert('Expert status removed successfully!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to remove expert status');
            }
        } catch (error) {
            console.error('Error removing expert status:', error);
            alert('Error removing expert status');
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

    if (!user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-slate-500">User not found</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/admin/users">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </Link>
                </div>

                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                        {user.role}
                                    </Badge>
                                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {user.is_verified_expert && (
                                        <Badge variant="default" className="bg-green-600">
                                            ✓ Verified {user.expert_role} Expert
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-2xl font-bold text-slate-900">{user.stats.total_questions}</div>
                                    <div className="text-sm text-slate-600 mt-1">Questions Posted</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-2xl font-bold text-slate-900">{user.stats.total_answers}</div>
                                    <div className="text-sm text-slate-600 mt-1">Answers Given</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Expert Verification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expert Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {user.is_verified_expert ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="font-semibold text-green-900">Verified Expert</p>
                                            <p className="text-sm text-green-700">Role: {user.expert_role}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={removeExpertStatus}
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Remove Expert Status
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <XCircle className="h-6 w-6 text-slate-400" />
                                        <p className="text-slate-600">This user is not verified as an expert</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Select Expert Role
                                            </label>
                                            <select
                                                value={selectedExpertRole}
                                                onChange={(e) => setSelectedExpertRole(e.target.value)}
                                                className="w-full border-slate-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            >
                                                <option value="">-- Select Role --</option>
                                                {expertRoles.map((role) => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            onClick={verifyExpert}
                                            disabled={!selectedExpertRole || verifyingExpert}
                                            className="w-full"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {verifyingExpert ? 'Verifying...' : 'Verify as Expert'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileQuestion className="h-5 w-5" />
                            Questions ({user.questions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.questions.length > 0 ? (
                            <div className="space-y-4">
                                {user.questions.map((question) => (
                                    <div key={question.id} className="p-4 border border-slate-200 rounded-lg">
                                        <h4 className="font-semibold text-slate-900">{question.title}</h4>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{question.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Posted on {new Date(question.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No questions posted yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Answers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Answers ({user.answers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.answers.length > 0 ? (
                            <div className="space-y-4">
                                {user.answers.map((answer) => (
                                    <div key={answer.id} className="p-4 border border-slate-200 rounded-lg">
                                        <p className="text-sm font-medium text-slate-700">On: {answer.question_title}</p>
                                        <p className="text-sm text-slate-600 mt-2">{answer.answer_text}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Answered on {new Date(answer.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No answers given yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout >
    );
}
