import { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/ui/button';
import { Mail, User, Clock, CheckCircle, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config/api';

interface ContactMessage {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function MessagesDashboard() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/contact`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch messages. Make sure you are logged in as admin.');
            const data = await res.json();
            setMessages(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        // Mark as read if not already read
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.is_read) {
            markAsRead(id);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/contact/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:row items-start md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Contact Messages</h1>
                        <p className="text-slate-500 mt-1">Manage and respond to inquiries from MentorDesk users.</p>
                    </div>
                    <Button onClick={fetchMessages} variant="outline" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {loading && messages.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900">No messages yet</h3>
                        <p className="text-slate-400">When users contact you, they'll appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`group bg-white rounded-2xl border transition-all overflow-hidden ${msg.is_read ? 'border-slate-100' : 'border-primary-200 bg-primary-50/10 shadow-sm'
                                    }`}
                            >
                                <div
                                    onClick={() => toggleExpand(msg.id)}
                                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 grid md:grid-cols-4 gap-4 items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${msg.is_read ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-600'
                                                }`}>
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-bold truncate ${msg.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                    {msg.first_name} {msg.last_name}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">{msg.email}</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:block">
                                            <span className={`text-sm font-medium ${msg.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                                                {msg.subject}
                                            </span>
                                        </div>
                                        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-xs">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-end pr-4">
                                            {!msg.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-slate-400">
                                        {expandedIds.includes(msg.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>

                                {expandedIds.includes(msg.id) && (
                                    <div className="px-5 pb-6 pt-2 border-t border-slate-50">
                                        <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Message</p>
                                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <a
                                                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                        Reply by Email
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Received on {new Date(msg.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
