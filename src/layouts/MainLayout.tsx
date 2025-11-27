import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { ScrollToTop } from '../components/ui/ScrollToTop';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
                {children}
            </main>
            <MobileNav />
            <ScrollToTop />
        </div>
    );
}
