import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Users, BadgeCheck, Lightbulb, ArrowRight, TrendingUp, MessageCircle, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { API_URL } from '../config/api';

/* ─── Count-up hook ─── */
function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    const ref = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) { setValue(0); return; }
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) ref.current = requestAnimationFrame(tick);
        };
        ref.current = requestAnimationFrame(tick);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [target, duration]);

    return value;
}

/* ─── Stat card component ─── */
function StatCard({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
    const animated = useCountUp(value);
    return (
        <div className="text-center px-4 py-6 sm:py-0">
            <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="h-5 w-5 text-primary-500" />
                <span className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                    {animated.toLocaleString()}+
                </span>
            </div>
            <div className="text-sm text-slate-500 font-medium">{label}</div>
        </div>
    );
}

/* ─── Loading skeleton for stats ─── */
function StatsSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-slate-200">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center px-4 py-6 sm:py-0 animate-pulse">
                    <div className="h-10 w-24 bg-slate-200 rounded-lg mx-auto mb-2" />
                    <div className="h-4 w-20 bg-slate-100 rounded mx-auto" />
                </div>
            ))}
        </div>
    );
}

const VALUES = [
    {
        icon: Users,
        title: 'Community First',
        description: 'We\'re built on the belief that the smartest people in the room are often the ones who\'ve already solved your problem. We connect them with you.',
    },
    {
        icon: BadgeCheck,
        title: 'Verified Experts',
        description: 'Every expert on MentorDesk is vetted. No noise, no generic answers. Just real professionals with real credentials and real results.',
    },
    {
        icon: Lightbulb,
        title: 'Actionable Advice',
        description: 'We don\'t do theory. Every answer on MentorDesk is expected to be something you can act on by tomorrow morning.',
    },
];

const PROBLEMS = [
    'Googling your business problems and getting blog posts written for SEO',
    'Paying $500/hr for a consultant just to ask one specific question',
    'Posting in generic forums and getting generic, unqualified responses',
    'Making critical decisions without access to experienced peers',
];

const SOLUTIONS = [
    'Ask a targeted question and get answers from domain experts in hours',
    'Access real practitioners — CFOs, founders, operators — for free',
    'A community of professionals who\'ve been exactly where you are',
    'Actionable, specific, peer-reviewed advice you can act on today',
];

export function AboutPage() {
    const [stats, setStats] = useState<{ totalUsers: number; totalExperts: number; totalQuestions: number; totalAnswers: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/stats`);
                if (!res.ok) throw new Error('Failed to fetch stats');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error('[AboutPage] Stats fetch error:', err);
                // Fallback — show 0s rather than crash
                setStats({ totalUsers: 0, totalExperts: 0, totalQuestions: 0, totalAnswers: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Auto-refresh every 60s
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <MainLayout>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeInUp 0.6s ease-out both; }
                .fade-in-1 { animation-delay: 0.1s; }
                .fade-in-2 { animation-delay: 0.2s; }
                .fade-in-3 { animation-delay: 0.3s; }
                .fade-in-4 { animation-delay: 0.4s; }
                .value-card:hover { transform: translateY(-4px); }
                .value-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .value-card:hover { box-shadow: 0 20px 40px -12px rgba(56,93,138,0.18); }
            `}</style>

            {/* ── Hero ── */}
            <section className="relative bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f920_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f920_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
                    <span className="fade-in fade-in-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-50 text-primary-700 border border-primary-200 mb-6">
                        <Sparkles className="h-3.5 w-3.5" /> Where Ideas Meet Expertise
                    </span>
                    <h1 className="fade-in fade-in-2 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-6">
                        Real Business Advice.<br />
                        <span className="text-primary-600">From Real Experts.</span>
                    </h1>
                    <p className="fade-in fade-in-3 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        MentorDesk is where startup founders, executives, and operators get specific,
                        vetted answers to their hardest business questions — fast.
                    </p>
                    <div className="fade-in fade-in-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/ask"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
                        >
                            Ask Your First Question <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                        >
                            Browse the Community
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats (Real-time) ── */}
            <section className="bg-slate-50 border-b border-slate-100">
                {loading ? (
                    <StatsSkeleton />
                ) : stats ? (
                    <div className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0 sm:divide-x sm:divide-slate-200">
                        <StatCard value={stats.totalUsers} label="Total Professionals" icon={Users} />
                        <StatCard value={stats.totalQuestions} label="Questions Asked" icon={HelpCircle} />
                    </div>
                ) : null}
            </section>

            {/* ── Mission ── */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                        Why MentorDesk Exists
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Every founder, at some point, hits a wall — a decision they've never made before,
                        a problem they've never seen, in a domain they've never navigated.
                        The best advice they could get exists somewhere, in someone's head.
                        We built MentorDesk to close that gap.
                    </p>
                </div>
            </section>

            {/* ── Problem → Solution ── */}
            <section className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            The Old Way vs. The MentorDesk Way
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto">We replaced expensive consultants and noisy forums with something better.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-500 font-bold text-sm">✗</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">The Old Way</h3>
                            </div>
                            <ul className="space-y-3">
                                {PROBLEMS.map(p => (
                                    <li key={p} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-primary-600 rounded-2xl p-8 shadow-lg shadow-primary-600/20">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">✓</span>
                                </div>
                                <h3 className="font-bold text-white text-lg">The MentorDesk Way</h3>
                            </div>
                            <ul className="space-y-3">
                                {SOLUTIONS.map(s => (
                                    <li key={s} className="flex items-start gap-3 text-primary-100 text-sm leading-relaxed">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-white/70 flex-shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            What We Stand For
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Three principles that guide everything we build.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {VALUES.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="value-card bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
                            >
                                <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                                    <Icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Our Story ── */}
            <section className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 py-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Our Story</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                        Built Because the Gap Was Real
                    </h2>
                    <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
                        <p>
                            Founded in 2024, MentorDesk was born from a frustration every serious founder knows.
                            Developers have Stack Overflow. Designers have Dribbble. But where do founders, CFOs,
                            and operators go when they have a hard, specific business question?
                        </p>
                        <p>
                            There was no great answer. So we built one. A platform where a first-time CEO
                            could ask about fundraising structure and get a response from someone who'd raised
                            Series B. Where an HR director could ask about remote compensation policy and hear
                            from an operator who's already figured it out.
                        </p>
                        <p className="font-medium text-slate-800">
                            MentorDesk exists for the decisions that actually matter — the ones that keep
                            founders up at night. We believe everyone deserves access to the right answer,
                            not just people who know the right people.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="bg-primary-950">
                <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                    <div className="inline-flex items-center gap-2 text-primary-300 text-sm font-medium mb-6">
                        <MessageCircle className="h-4 w-4" />
                        Join thousands of founders already getting answers
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
                        Your next breakthrough<br />is one question away.
                    </h2>
                    <p className="text-primary-300 text-lg mb-10 leading-relaxed">
                        Stop guessing. Stop searching. Ask your specific question and get a real answer
                        from someone who's been there.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-primary-50 transition-colors shadow-2xl"
                        >
                            Join MentorDesk Today <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/ask"
                            className="inline-flex items-center gap-2 px-8 py-4 border border-primary-700 text-primary-200 font-semibold text-sm rounded-xl hover:border-primary-500 hover:text-white transition-colors"
                        >
                            Ask Your First Question
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-6 text-primary-400 text-xs">
                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Free to join</span>
                        <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" /> Verified experts</span>
                        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Real community</span>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
