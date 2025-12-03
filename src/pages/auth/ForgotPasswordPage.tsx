import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { AuthLayout } from '../../layouts/AuthLayout';
import { API_URL } from '../../config/api';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="border-0 shadow-xl ring-1 ring-slate-900/5">
                <CardHeader className="space-y-1 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight">Forgot Password</h3>
                    <p className="text-sm text-slate-500">
                        Enter your email to receive a password reset link
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded">{message}</div>}
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
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

                        <Button className="w-full" size="lg" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
                    <div className="text-center text-sm text-slate-500">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
