import axios from 'axios';
import { API_URL } from '../config/api';

const API_BASE_URL = `${API_URL}/api`;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect on 401 if not on auth pages (to prevent login loops)
        const isAuthPage = window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register');

        if (error.response?.status === 401 && !isAuthPage) {
            // Unauthorized - clear token and redirect to login
            console.log('401 Unauthorized, clearing auth and redirecting');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
