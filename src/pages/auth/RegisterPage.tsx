import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { AuthLayout } from '../../layouts/AuthLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { API_URL } from '../../config/api';

export function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    // Google Client ID from environment variable
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    return (
        <AuthLayout>
            <Card className="border-0 shadow-xl ring-1 ring-slate-900/5">
                <CardHeader className="space-y-1 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight">Create an account</h3>
                    <p className="text-sm text-slate-500">
                        Enter your details to get started
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Signup */}
                    {googleClientId && (
                        <GoogleOAuthProvider clientId={googleClientId}>
                            <GoogleLoginButton text="signup_with" />
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                                </div>
                            </div>
                        </GoogleOAuthProvider>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="name@company.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                        </div>
                        <Button className="w-full" size="lg" type="submit">
                            Create account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
                    <div className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
