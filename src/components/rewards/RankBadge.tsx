import { Badge } from '../ui/badge';
import { Award, Star, Trophy, Crown, Sparkles, Shield } from 'lucide-react';

interface RankBadgeProps {
    rank: string;
    size?: 'sm' | 'md' | 'lg';
}

const RANK_CONFIG = {
    'Beginner': {
        color: 'bg-slate-500',
        icon: Sparkles,
        textColor: 'text-slate-700'
    },
    'Contributor': {
        color: 'bg-blue-500',
        icon: Star,
        textColor: 'text-blue-700'
    },
    'Helper': {
        color: 'bg-green-500',
        icon: Award,
        textColor: 'text-green-700'
    },
    'Mentor': {
        color: 'bg-purple-500',
        icon: Trophy,
        textColor: 'text-purple-700'
    },
    'Expert': {
        color: 'bg-yellow-500',
        icon: Crown,
        textColor: 'text-yellow-700'
    },
    'Admin': {
        color: 'bg-red-600',
        icon: Shield,
        textColor: 'text-red-700'
    }
};

export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
    const config = RANK_CONFIG[rank as keyof typeof RANK_CONFIG] || RANK_CONFIG['Beginner'];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    return (
        <Badge
            className={`${config.color} text-white ${sizeClasses[size]} flex items-center gap-1 font-semibold`}
        >
            <Icon className={iconSizes[size]} />
            {rank}
        </Badge>
    );
}
