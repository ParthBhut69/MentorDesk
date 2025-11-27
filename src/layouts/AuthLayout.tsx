import logo from '../assets/logo.png';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <img src={logo} alt="MentorDesk" className="h-16 w-auto object-contain mb-4" />
                </div>
                {children}
            </div>
        </div>
    );
}
