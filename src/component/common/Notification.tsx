import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import alertStore from '@/store/AlertStore';

type NotificationType = 'info' | 'success' | 'error' | 'warning' | '';

interface NotificationProps {
    onClose?: () => void;
    autoHide?: boolean;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
    onClose,
    autoHide = true,
    duration = 3000,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const type = alertStore(state => state.type);
    const setType = alertStore(state => state.setType);
    const message = alertStore(state => state.message);

    // Show notification when type changes to a valid notification type
    useEffect(() => {
        if (type) {
            setIsVisible(true);
            setIsAnimating(true);
        }
    }, [type]);

    // Auto-hide functionality
    useEffect(() => {
        if (isVisible && autoHide && type) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, autoHide, duration, type]);

    const handleClose = () => {
        setIsAnimating(false);

        // Wait for animation to complete before hiding and resetting store
        setTimeout(() => {
            setIsVisible(false);
            setType('');
            onClose?.();
        }, 300);
    };

    const getNotificationStyles = () => {
        const baseStyles = "flex items-center p-4 rounded-lg shadow-lg border transition-all duration-300 ease-out backdrop-blur-sm max-w-md mx-4";

        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-50/95 border-green-200 text-green-800`;
            case 'error':
                return `${baseStyles} bg-red-50/95 border-red-200 text-red-800`;
            case 'warning':
                return `${baseStyles} bg-yellow-50/95 border-yellow-200 text-yellow-800`;
            case 'info':
            default:
                return `${baseStyles} bg-blue-50/95 border-blue-200 text-blue-800`;
        }
    };

    const getIcon = () => {
        const iconClass = "w-5 h-5 mr-3 flex-shrink-0";

        switch (type) {
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-600`} />;
            case 'error':
                return <XCircle className={`${iconClass} text-red-600`} />;
            case 'warning':
                return <AlertCircle className={`${iconClass} text-yellow-600`} />;
            case 'info':
            default:
                return <Info className={`${iconClass} text-blue-600`} />;
        }
    };

    // Don't render if not visible
    if (!isVisible) {
        return null;
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none transition-all duration-300 bg-gray-600/50`}>
            <div className={`${getNotificationStyles()} pointer-events-auto transform transition-all duration-300 ease-out ${isAnimating
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-4'
                }`}>
                {getIcon()}
                <div className="flex-1 text-sm font-medium">
                    {message}
                </div>
                <button
                    onClick={handleClose}
                    className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4 cursor-pointer" />
                </button>
            </div>
        </div>
    );
};

export default Notification;