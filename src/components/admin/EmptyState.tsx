'use client';
import { Inbox, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({
    icon: Icon = Inbox,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
                <Icon size={24} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary-ring"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
