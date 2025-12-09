import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { useState } from 'react';

export function GoogleLoginButton({ text = 'signin_with' }: { text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse: any) => {
        setError('');
        setLoading(true);

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

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                // Show specific server error message
                setError(data.message || 'Google login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Google login error:', err);

            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setError('Unable to connect to server. Please check your internet connection.');
            } else {
                setError('An unexpected error occurred with Google login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            {loading && <div className="mb-4 text-center text-sm text-slate-600">Signing in with Google...</div>}
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setError('Google Login Failed')}
                    useOneTap
                    text={text}
                // width prop removed as "100%" is invalid. 
                // The container div handles the width.
                />
            </div>
        </div>
    );
}
