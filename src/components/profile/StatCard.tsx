'use client';
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    trend?: { value: number; positive: boolean };
    accentColor?: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    trend,
    accentColor = 'from-indigo-500 to-blue-500',
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${trend.positive
                                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
                                : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
                                }`}>
                                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
