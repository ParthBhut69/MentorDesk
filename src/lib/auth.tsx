import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from './api';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Validate existing token on mount
        const validateStoredToken = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            // If no token or user, just finish loading
            if (!storedUser || !token) {
                setIsLoading(false);
                return;
            }
            try {
                // Validate token with backend
                const response = await api.get('/auth/validate');

                if (response.data.valid) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Token invalid, clear storage
                    console.log('Token invalid, clearing storage');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            } catch (error: any) {
                console.error('Token validation failed:', error);

                // If token expired, try to refresh it
                if (error.response?.data?.expired) {
                    try {
                        const refreshResponse = await api.post('/auth/refresh', { token });

                        if (refreshResponse.data.token) {
                            // Successfully refreshed
                            localStorage.setItem('token', refreshResponse.data.token);
                            localStorage.setItem('user', JSON.stringify({
                                id: refreshResponse.data.id,
                                name: refreshResponse.data.name,
                                email: refreshResponse.data.email,
                                role: refreshResponse.data.role,
                                avatarUrl: refreshResponse.data.avatarUrl
                            }));
                            setUser(refreshResponse.data);
                        } else {
                            // Refresh failed, clear storage
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        // Clear invalid token
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    }
                } else {
                    // Other error, clear storage
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }

            setIsLoading(false);
        };

        validateStoredToken();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    // Show loading state while validating token
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
