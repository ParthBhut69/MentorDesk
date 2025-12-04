import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Home, TrendingUp, MessageSquare, Briefcase, PieChart, Users, Star, Scale, Cpu, Bookmark, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import logo from '../../assets/logo.png';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-24 items-center px-4 justify-between">

                {/* Logo & Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-slate-500"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>

                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="MentorDesk" className="h-14 w-auto object-contain" />
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
                    <Link to="/categories" className="hover:text-primary-600 transition-colors">Categories</Link>
                    <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
                    {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                        <Link to="/admin" className="hover:text-primary-600 transition-colors font-semibold">Admin Panel</Link>
                    )}
                </div>

                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden lg:flex flex-1 items-center max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search for solutions..."
                            className="pl-9 bg-slate-50 focus:bg-white transition-all border-slate-200 focus:border-primary-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-slate-500 hover:text-primary-600"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-primary-600"
                        onClick={() => navigate('/bookmarks')}
                        title="Saved Items"
                    >
                        <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-primary-600"
                        onClick={() => navigate('/notifications')}
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                    <div className="hidden sm:flex items-center space-x-2">
                        {localStorage.getItem('user') ? (
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Link
                                        to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600"
                                    >
                                        <Avatar className="h-8 w-8 border border-slate-200">
                                            <AvatarImage src={JSON.parse(localStorage.getItem('user') || '{}').avatarUrl} />
                                            <AvatarFallback className="bg-primary-50 text-primary-700">
                                                {JSON.parse(localStorage.getItem('user') || '{}').name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:inline">{JSON.parse(localStorage.getItem('user') || '{}').name}</span>
                                        <ChevronDown className="h-4 w-4 hidden md:inline" />
                                    </Link>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="py-1">
                                            <Link
                                                to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/preferences"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Preferences
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('token');
                                                    localStorage.removeItem('user');
                                                    window.location.reload();
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="text-slate-600 font-medium hover:text-primary-600">
                                        Log in
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="font-medium shadow-md shadow-primary-600/20">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {isSearchOpen && (
                <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 bg-slate-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 border-t border-slate-200 bg-white shadow-lg" style={{ maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto' }}>
                    <div className="px-4 py-4 space-y-4">
                        <div className="space-y-2">
                            <Link to="/" className="block py-2 text-sm font-medium text-slate-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/about" className="block py-2 text-sm font-medium text-slate-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                            <Link to="/contact" className="block py-2 text-sm font-medium text-slate-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        </div>

                        {/* Mobile Discover Section */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Discover</h4>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
                                    <Home className="mr-2 h-4 w-4 text-slate-400" />
                                    Feed
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?filter=trending'); setIsMenuOpen(false); }}>
                                    <TrendingUp className="mr-2 h-4 w-4 text-slate-400" />
                                    Trending
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?filter=unanswered'); setIsMenuOpen(false); }}>
                                    <MessageSquare className="mr-2 h-4 w-4 text-slate-400" />
                                    Unanswered
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Topics Section */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Topics</h4>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=Business'); setIsMenuOpen(false); }}>
                                    <Briefcase className="mr-2 h-4 w-4 text-slate-400" />
                                    Business & Strategy
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=Finance'); setIsMenuOpen(false); }}>
                                    <PieChart className="mr-2 h-4 w-4 text-slate-400" />
                                    Finance & Accounting
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=HR'); setIsMenuOpen(false); }}>
                                    <Users className="mr-2 h-4 w-4 text-slate-400" />
                                    HR & Management
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=Startups'); setIsMenuOpen(false); }}>
                                    <Star className="mr-2 h-4 w-4 text-slate-400" />
                                    Startups
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=Legal'); setIsMenuOpen(false); }}>
                                    <Scale className="mr-2 h-4 w-4 text-slate-400" />
                                    Legal & Law
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2" onClick={() => { navigate('/?tag=Tech'); setIsMenuOpen(false); }}>
                                    <Cpu className="mr-2 h-4 w-4 text-slate-400" />
                                    Tech
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Auth Section */}
                        <div className="pt-4 border-t border-slate-100 space-y-2 pb-4">
                            {localStorage.getItem('user') ? (
                                <>
                                    <Link to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`} className="block w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center">
                                            View Profile
                                        </Button>
                                    </Link>
                                    <Link to="/preferences" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center">
                                            Preferences
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            window.location.reload();
                                        }}
                                    >
                                        Log out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                                    </Link>
                                    <Link to="/register" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full justify-center">Sign up</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
