import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-9xl font-bold text-primary-100">404</h1>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">Page Not Found</h2>
                <p className="text-slate-600 mt-2 max-w-md">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <div className="flex gap-4 mt-8">
                    <Link to="/">
                        <Button>
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <Link to="/search">
                        <Button variant="outline">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
