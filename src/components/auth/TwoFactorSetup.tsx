import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Shield, Copy, Check, AlertCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

interface TwoFactorSetupProps {
    onComplete: () => void;
    onCancel: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setStep('verify');
            } else {
                setError(data.message || 'Failed to setup 2FA');
            }
        } catch (err) {
            setError('Failed to setup 2FA. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/2fa/enable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: verificationCode })
            });

            const data = await response.json();

            if (response.ok) {
                setBackupCodes(data.backupCodes);
                setStep('backup');
            } else {
                setError(data.message || 'Invalid verification code');
            }
        } catch (err) {
            setError('Failed to verify code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (step === 'setup') {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">Enable Two-Factor Authentication</h2>
                    <p className="text-slate-600 text-center mb-6">
                        Add an extra layer of security to your account by requiring a verification code in addition to your password.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button onClick={handleSetup} className="w-full" disabled={loading}>
                            {loading ? 'Setting up...' : 'Get Started'}
                        </Button>
                        <Button onClick={onCancel} variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (step === 'verify') {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-center mb-4">Scan QR Code</h2>
                    <p className="text-slate-600 text-center mb-6">
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>

                    {qrCode && (
                        <div className="flex justify-center mb-6">
                            <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Or enter this code manually:
                        </label>
                        <div className="flex gap-2">
                            <Input value={secret} readOnly className="font-mono text-sm" />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copySecret}
                                className="flex-shrink-0"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter the 6-digit code from your app:
                            </label>
                            <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify and Enable'}
                        </Button>
                        <Button type="button" onClick={onCancel} variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    // Backup codes step
    return (
        <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">2FA Enabled!</h2>
                <p className="text-slate-600 text-center mb-6">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                            <div key={index} className="text-center py-1">
                                {code}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy Codes
                    </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> Each backup code can only be used once. Store them securely!
                        </p>
                    </div>
                </div>

                <Button onClick={onComplete} className="w-full">
                    Done
                </Button>
            </CardContent>
        </Card>
    );
}
