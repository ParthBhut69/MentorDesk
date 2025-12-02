import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { API_URL } from '../../config/api';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginButtonProps {
    onTwoFactorRequired?: (userId: number, tempToken: string) => void;
}

export function GoogleLoginButton({ onTwoFactorRequired }: GoogleLoginButtonProps) {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse.credential) {
                console.error('No credential received');
                return;
            }

            // Decode the JWT token from Google
            const decoded: any = jwtDecode(credentialResponse.credential);

            // Send to backend
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: decoded.email,
                    name: decoded.name,
                    googleId: decoded.sub,
                    picture: decoded.picture
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Check if 2FA is required
                if (data.requiresTwoFactor) {
                    if (onTwoFactorRequired) {
                        onTwoFactorRequired(data.userId, data.tempToken);
                    }
                } else {
                    // Login successful
                    login(data.token, {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        avatarUrl: data.avatarUrl
                    });
                    navigate('/');
                }
            } else {
                console.error('Google login failed:', data.message);
                alert(data.message || 'Failed to login with Google');
            }
        } catch (error) {
            console.error('Error during Google login:', error);
            alert('An error occurred during Google login');
        }
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.error('Google Login Failed');
                    alert('Google login failed. Please try again.');
                }}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
            />
        </div>
    );
}
