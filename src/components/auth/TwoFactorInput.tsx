import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Shield, Key } from 'lucide-react';

interface TwoFactorInputProps {
    userId: number;
    tempToken: string;
    onSuccess: (token: string, userData: any) => void;
    onCancel: () => void;
}

export function TwoFactorInput({ userId, tempToken, onSuccess, onCancel }: TwoFactorInputProps) {
    const [code, setCode] = useState('');
    const [isBackupCode, setIsBackupCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    code: code.replace(/\s/g, ''), // Remove spaces
                    isBackupCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess(data.token, {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    avatarUrl: data.avatarUrl
                });
            } else {
                setError(data.message || 'Invalid code');
            }
        } catch (err) {
            setError('Failed to verify code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-600" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Two-Factor Authentication</h2>
            <p className="text-slate-600 text-center mb-6">
                {isBackupCode
                    ? 'Enter one of your backup codes'
                    : 'Enter the 6-digit code from your authenticator app'
                }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
                        maxLength={isBackupCode ? 16 : 6}
                        className="text-center text-2xl tracking-widest"
                        autoFocus
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || code.length < (isBackupCode ? 8 : 6)}
                >
                    {loading ? 'Verifying...' : 'Verify'}
                </Button>

                <button
                    type="button"
                    onClick={() => setIsBackupCode(!isBackupCode)}
                    className="w-full text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2"
                >
                    <Key className="h-4 w-4" />
                    {isBackupCode ? 'Use authenticator code' : 'Use backup code'}
                </button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </form>
        </div>
    );
}
