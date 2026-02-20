import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Mail, MapPin, Phone, CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

import { API_URL } from '../config/api';

export function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to send message');

            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
        }
    };

    return (
        <MainLayout>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                .focus-ring { transition: all 0.2s ease; }
                .focus-ring:focus-within { ring: 2px; ring-color: #385d8a; ring-offset: 2px; }
            `}</style>

            <div className="relative min-h-[calc(100vh-64px)] bg-white overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary-50/50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-50/30 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* ── Left Column: Contact Info & Trust ── */}
                        <div className="space-y-10 animate-slide-up">
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-50 text-primary-700 border border-primary-200">
                                    <Zap className="h-3 w-3 fill-current" /> We typically respond in under 24 hours
                                </span>
                                <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                                    Let's build the<br />
                                    <span className="text-primary-600">future together.</span>
                                </h1>
                                <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                                    Have a question, feedback, or just want to say hello?
                                    Our team is here to support your journey.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {/* Email */}
                                <div className="group flex items-start gap-4 p-4 rounded-2xl transition-colors hover:bg-slate-50">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Email</h3>
                                        <p className="text-slate-500 text-sm">support@mentordesk.com</p>
                                        <p className="text-slate-400 text-xs">mentordeskinc@gmail.com</p>
                                    </div>
                                </div>

                                {/* Office */}
                                <div className="group flex items-start gap-4 p-4 rounded-2xl transition-colors hover:bg-slate-50">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Office</h3>
                                        <p className="text-slate-500 text-sm">Mumbai, Maharashtra 401202</p>
                                        <p className="text-slate-400 text-xs">India</p>
                                    </div>
                                </div>

                                {/* Phone & Hours */}
                                <div className="group flex items-start gap-4 p-4 rounded-2xl transition-colors hover:bg-slate-50">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Phone & Hours</h3>
                                        <p className="text-slate-500 text-sm">+91 98765 43210</p>
                                        <p className="text-slate-400 text-xs">Mon – Sat, 9 AM – 7 PM IST</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Secure Data</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Globe className="h-5 w-5" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Global Support</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Verified Experts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column: Premium Form ── */}
                        <div className="animate-slide-up delay-1">
                            {status === 'success' ? (
                                <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-slate-100 space-y-6">
                                    <div className="mx-auto h-20 w-20 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                        <CheckCircle2 className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-slate-900">Message Sent ✓</h2>
                                        <p className="text-slate-500">
                                            Your message has been received.<br />
                                            Our team will contact you soon.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setStatus('idle')}
                                        variant="outline"
                                        className="rounded-xl"
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 overflow-hidden relative">
                                    {/* Submitting Overlay */}
                                    {status === 'loading' && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
                                                <p className="font-semibold text-primary-900 text-sm">Sending your message...</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 px-0.5">
                                                <label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">First Name</label>
                                                <Input
                                                    id="firstName"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    placeholder="e.g. Rahul"
                                                    className="h-12 rounded-xl border-slate-200 focus:border-primary-600 focus:ring-0 transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                            <div className="space-y-1.5 px-0.5">
                                                <label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Last Name</label>
                                                <Input
                                                    id="lastName"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    placeholder="e.g. Sharma"
                                                    className="h-12 rounded-xl border-slate-200 focus:border-primary-600 focus:ring-0 transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 px-0.5">
                                            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Business Email</label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="rahul@company.com"
                                                className="h-12 rounded-xl border-slate-200 focus:border-primary-600 focus:ring-0 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div className="space-y-1.5 px-0.5">
                                            <label htmlFor="subject" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Subject</label>
                                            <Input
                                                id="subject"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Expert verification query"
                                                className="h-12 rounded-xl border-slate-200 focus:border-primary-600 focus:ring-0 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div className="space-y-1.5 px-0.5">
                                            <label htmlFor="message" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Description</label>
                                            <textarea
                                                id="message"
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="flex min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm ring-offset-white placeholder:text-slate-300 focus:outline-none focus:border-primary-600 focus:ring-0 transition-all resize-none"
                                                placeholder="Tell us how we can help you..."
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 group transition-all"
                                        >
                                            {status === 'loading' ? 'Sending...' : (
                                                <>
                                                    Send Message
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>

                                        {status === 'error' && (
                                            <p className="text-center text-xs text-red-500 font-medium">
                                                Something went wrong. Please try again or email us directly.
                                            </p>
                                        )}
                                    </form>
                                </div>
                            )}

                            {/* Support Message */}
                            <p className="mt-8 text-center text-slate-400 text-sm">
                                By submitting this form, you agree to our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Proof Section */}
            <section className="bg-slate-50 py-16 px-6 border-t border-slate-100">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Trusted by operators at</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale pointer-events-none">
                        <span className="text-2xl font-black italic">STRIPE</span>
                        <span className="text-2xl font-black">Notion</span>
                        <span className="text-2xl font-black tracking-tighter">LINEAR</span>
                        <span className="text-2xl font-black underline underline-offset-4">Vercel</span>
                        <span className="text-2xl font-black decoration-double">Figma</span>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}

// Simple internal Link mock if needed for the footer text
function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
    return <a href={to} className={className}>{children}</a>;
}
