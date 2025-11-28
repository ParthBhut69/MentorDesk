import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, Check, MessageSquare, Star, Award } from 'lucide-react';
import { API_URL } from '../config/api';

interface Notification {
    id: number;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
    data?: any;
}

export function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reply':
                return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case 'upvote':
                return <Star className="h-5 w-5 text-yellow-500" />;
            case 'reward':
                return <Award className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    {notifications.some(n => !n.is_read) && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="mt-1 bg-white p-2 rounded-full shadow-sm border border-slate-100">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${notification.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-primary-600"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg">
                        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No notifications yet</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
