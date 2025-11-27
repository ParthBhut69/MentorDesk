import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Eye, Trash2, UserX, UserCheck } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    post_count: number;
    rank?: string;
    points?: number;
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [navigate]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeRank = async (userId: number, newRank: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rank: newRank })
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating rank:', error);
        }
    };

    const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                        <p className="text-slate-600 mt-1">Manage all users and their permissions</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
                    </Badge>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rank</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Points</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Posts</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-sm font-medium text-slate-900">{user.name}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={user.rank || 'Beginner'}
                                                    onChange={(e) => changeRank(user.id, e.target.value)}
                                                    className="text-sm border-slate-200 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1 px-2"
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Contributor">Contributor</option>
                                                    <option value="Helper">Helper</option>
                                                    <option value="Mentor">Mentor</option>
                                                    <option value="Expert">Expert</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{user.points || 0}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{user.post_count}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/admin/users/${user.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.is_active ? (
                                                            <UserX className="h-4 w-4 text-orange-600" />
                                                        ) : (
                                                            <UserCheck className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">No users found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
