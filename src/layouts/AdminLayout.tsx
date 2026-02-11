import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LayoutDashboard, Users, LogOut, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Back to Site</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{user.name}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
                            <Link to="/admin">
                                <Button variant="ghost" className="w-full justify-start">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/admin/users">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Users className="h-4 w-4 mr-2" />
                                    User Management
                                </Button>
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
