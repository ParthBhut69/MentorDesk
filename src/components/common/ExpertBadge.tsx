import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ExpertBadgeProps {
    expertRole: string | null;
    isVerified?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
    CA: {
        label: 'Verified CA',
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: '📊'
    },
    Lawyer: {
        label: 'Verified Lawyer',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: '⚖️'
    },
    HR: {
        label: 'Verified HR Expert',
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: '👥'
    },
    Marketing: {
        label: 'Verified Marketing Expert',
        color: 'bg-pink-100 text-pink-700 border-pink-300',
        icon: '📈'
    },
    Finance: {
        label: 'Verified Finance Expert',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        icon: '💰'
    },
    Tax: {
        label: 'Verified Tax Consultant',
        color: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: '📋'
    },
    Business: {
        label: 'Verified Business Consultant',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        icon: '💼'
    },
    IT: {
        label: 'Verified IT Expert',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
        icon: '💻'
    },
    Sales: {
        label: 'Verified Sales Expert',
        color: 'bg-rose-100 text-rose-700 border-rose-300',
        icon: '📊'
    },
    Operations: {
        label: 'Verified Operations Expert',
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        icon: '⚙️'
    },
    Compliance: {
        label: 'Verified Compliance Expert',
        color: 'bg-teal-100 text-teal-700 border-teal-300',
        icon: '✓'
    },
    Strategy: {
        label: 'Verified Strategy Consultant',
        color: 'bg-violet-100 text-violet-700 border-violet-300',
        icon: '🎯'
    }
};

export const ExpertBadge: React.FC<ExpertBadgeProps> = ({
    expertRole,
    isVerified = true,
    size = 'md',
    showLabel = true
}) => {
    if (!expertRole || !isVerified) return null;

    const config = roleConfig[expertRole];
    if (!config) return null;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full border ${config.color} ${sizeClasses[size]} font-medium`}>
            <span>{config.icon}</span>
            {showLabel && <span>{config.label}</span>}
            <CheckCircle className="h-3 w-3" />
        </div>
    );
};
