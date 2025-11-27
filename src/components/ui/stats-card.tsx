import { Card, CardContent, CardHeader, CardTitle } from './card';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}
                {trend && (
                    <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}% from last week
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
