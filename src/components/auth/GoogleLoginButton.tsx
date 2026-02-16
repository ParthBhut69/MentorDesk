import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { useState } from 'react';
import { safeLocalStorageSet } from '../../lib/storage';

export function GoogleLoginButton({ text = 'signin_with' }: { text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse: any) => {
        setError('');
        setLoading(true);

        // Enhanced logging for debugging
        console.log('[GoogleAuth] Authentication initiated');
        console.log('[GoogleAuth] Credential received:', credentialResponse.credential ? 'Yes' : 'No');
        console.log('[GoogleAuth] API URL:', API_URL);
        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            console.log('[GoogleAuth] Server response status:', response.status);

            const data = await response.json();
            console.log('[GoogleAuth] Server response:', {
                ok: response.ok,
                message: data.message,
                hasToken: !!data.token
            });

            if (response.ok) {
                localStorage.setItem('token', data.token);

                // Strip large images before saving to localStorage
                const userToSave = { ...data };
                if (userToSave.avatarUrl && userToSave.avatarUrl.startsWith('data:image')) {
                    delete userToSave.avatarUrl;
                }

                safeLocalStorageSet('user', userToSave);
                console.log('[GoogleAuth] Login successful, redirecting...');
                navigate('/');
            } else {
                // Show specific server error message
                console.error('[GoogleAuth] Login failed:', data.message);
                setError(data.message || 'Google login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('[GoogleAuth] Error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });

            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setError('Unable to connect to server. Please check your internet connection and ensure the backend is running.');
            } else {
                setError(`Authentication error: ${err.message || 'An unexpected error occurred'}. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => {
        console.error('[GoogleAuth] Google Login popup failed or was closed');
        setError('Google Login Failed. Please try again or check your popup blocker settings.');
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {loading && (
                <div className="mb-4 text-center text-sm text-slate-600 bg-blue-50 p-2 rounded">
                    Signing in with Google...
                </div>
            )}
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap
                    text={text}
                // width prop removed as "100%" is invalid. 
                // The container div handles the width.
                />
            </div>
        </div>
    );
}
