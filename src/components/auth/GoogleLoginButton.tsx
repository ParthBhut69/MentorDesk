import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { useState } from 'react';

export function GoogleLoginButton({ text = 'signin_with' }: { text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSuccess = async (credentialResponse: any) => {
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
                setError(data.message || 'Google login failed');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError('Something went wrong with Google login');
        }
    };

    return (
        <div className="w-full">
            {error && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
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
