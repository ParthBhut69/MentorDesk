import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export function ContactPage() {
    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
                                Get in touch
                            </h1>
                            <p className="text-lg text-slate-600">
                                Have questions about MentorDesk? We're here to help. Chat with our team.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="mt-1 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Email</h3>
                                    <p className="text-slate-600">support@mentordesk.com</p>
                                    <p className="text-slate-600">partners@mentordesk.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="mt-1 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Office</h3>
                                    <p className="text-slate-600">123 Business Avenue, Suite 400</p>
                                    <p className="text-slate-600">New York, NY 10001</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="mt-1 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Phone</h3>
                                    <p className="text-slate-600">+1 (555) 123-4567</p>
                                    <p className="text-sm text-slate-500 mt-1">Mon-Fri from 8am to 5pm EST</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <Card className="shadow-xl border-slate-200">
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you within 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium">First name</label>
                                        <Input id="firstName" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium">Last name</label>
                                        <Input id="lastName" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" placeholder="How can we help?" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>
                                <Button className="w-full" size="lg">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
