import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                <Link
                    to="/"
                    className={cn(
                        "flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors",
                        isActive('/') ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    to="/ask"
                    className="flex flex-col items-center justify-center -mt-6"
                >
                    <div className="h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center transform transition-transform active:scale-95">
                        <PlusSquare className="h-7 w-7" />
                    </div>
                    <span className="text-[10px] font-medium text-primary-600 mt-1">Ask</span>
                </Link>

                <Link
                    to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}').id || 'me'}`}
                    className={cn(
                        "flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors",
                        location.pathname.startsWith('/profile') ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <User className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </div>
    );
}
