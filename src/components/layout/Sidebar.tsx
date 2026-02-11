import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, MessageSquare, Users, Star, Briefcase, PieChart, Settings, ChevronDown, ChevronRight, Scale, Cpu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

type Section = 'discover' | 'topics' | 'settings';

export function Sidebar({ className }: SidebarProps) {
    const navigate = useNavigate();
    const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
        discover: true,
        topics: true,
        settings: true
    });

    const toggleSection = (section: Section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className={cn("pb-12 w-64 hidden lg:block", className)}>
            <div className="space-y-6 py-4">

                {/* Discover Section */}
                <div className="px-3">
                    <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-slate-100 mb-2 px-4"
                        onClick={() => toggleSection('discover')}
                    >
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discover</span>
                        {openSections.discover ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </Button>

                    {openSections.discover && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/')}
                            >
                                <Home className="mr-2 h-4 w-4 text-slate-400" />
                                Feed
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?filter=trending')}
                            >
                                <TrendingUp className="mr-2 h-4 w-4 text-slate-400" />
                                Trending
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?filter=unanswered')}
                            >
                                <MessageSquare className="mr-2 h-4 w-4 text-slate-400" />
                                Unanswered
                            </Button>
                        </div>
                    )}
                </div>

                {/* Topics Section */}
                <div className="px-3">
                    <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-slate-100 mb-2 px-4"
                        onClick={() => toggleSection('topics')}
                    >
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topics</span>
                        {openSections.topics ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </Button>

                    {openSections.topics && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=Business')}
                            >
                                <Briefcase className="mr-2 h-4 w-4 text-slate-400" />
                                Business & Strategy
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=Finance')}
                            >
                                <PieChart className="mr-2 h-4 w-4 text-slate-400" />
                                Finance & Accounting
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=HR')}
                            >
                                <Users className="mr-2 h-4 w-4 text-slate-400" />
                                HR & Management
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=Startups')}
                            >
                                <Star className="mr-2 h-4 w-4 text-slate-400" />
                                Startups
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=Legal')}
                            >
                                <Scale className="mr-2 h-4 w-4 text-slate-400" />
                                Legal & Law
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                onClick={() => navigate('/?tag=Tech')}
                            >
                                <Cpu className="mr-2 h-4 w-4 text-slate-400" />
                                Tech
                            </Button>
                        </div>
                    )}
                </div>

                {/* Settings Section */}
                <div className="px-3">
                    <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-slate-100 mb-2 px-4"
                        onClick={() => toggleSection('settings')}
                    >
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</span>
                        {openSections.settings ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </Button>

                    {openSections.settings && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                <Settings className="mr-2 h-4 w-4 text-slate-400" />
                                Preferences
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
