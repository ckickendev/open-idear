'use client';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    dot?: boolean;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200/60',
};

const dotStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
};

const StatusBadge = ({ variant, children, dot = false, className = '' }: StatusBadgeProps) => {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 
                rounded-full text-xs font-medium border
                ${variantStyles[variant]} 
                ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
            )}
            {children}
        </span>
    );
};

export default StatusBadge;
