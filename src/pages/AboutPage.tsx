import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Users, Target, Shield } from 'lucide-react';

export function AboutPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-12 py-8">
                {/* Hero Section */}
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Empowering Business Professionals
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        MentorDesk is the premier community for sharing knowledge, solving complex business problems, and connecting with industry experts.
                    </p>
                </section>

                {/* Mission Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-lg bg-white/50 backdrop-blur">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold">Our Mission</h3>
                            <p className="text-slate-600">
                                To democratize access to high-quality business advice and mentorship for everyone.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-white/50 backdrop-blur">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold">Community First</h3>
                            <p className="text-slate-600">
                                Building a supportive network of professionals who help each other grow and succeed.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-white/50 backdrop-blur">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold">Verified Experts</h3>
                            <p className="text-slate-600">
                                Ensuring quality and trust through our rigorous expert verification process.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Story Section */}
                <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="mb-4">
                            Founded in 2024, MentorDesk emerged from a simple observation: while developers have Stack Overflow and general queries go to Quora, business professionals lacked a dedicated, high-quality platform for specific operational, financial, and strategic issues.
                        </p>
                        <p>
                            We set out to build a space where a CFO could ask about international tax compliance, a Founder could seek fundraising advice, and an HR Director could discuss remote work policies—all receiving answers from verified peers and mentors.
                        </p>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
