'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const colorMap = {
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: 'text-emerald-500',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-500',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-500',
    },
};

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 4000,
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const Icon = iconMap[type];
    const colors = colorMap[type];

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in-toast">
            <div
                className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg backdrop-blur-sm min-w-[320px] max-w-[480px] ${colors.bg} ${colors.border}`}
            >
                <Icon size={20} className={`flex-shrink-0 ${colors.icon}`} />
                <p className={`text-sm font-medium flex-1 ${colors.text}`}>{message}</p>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${colors.text}`}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// Hook for easy toast usage
interface ToastState {
    message: string;
    type: ToastType;
    isVisible: boolean;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    };

    return { toast, showToast, hideToast };
}

export default Toast;
