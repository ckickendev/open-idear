import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'error' | 'warning';

interface NotificationProps {
    type: NotificationType;
    message: string;
    onClose?: () => void;
    autoHide?: boolean;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
    type,
    message,
    onClose,
    autoHide = true,
    duration = 2000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoHide) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300); // Wait for fade out animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoHide, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    const getNotificationStyles = () => {
        const baseStyles = "flex items-center p-6 rounded-xl shadow-2xl border transition-all duration-300 ease-out backdrop-blur-sm max-w-md mx-4";

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

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className={`${getNotificationStyles()} pointer-events-auto transform transition-all duration-300 ease-out ${isVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-4'}`}>
                {getIcon()}
                <div className="flex-1 text-base font-medium">
                    {message}
                </div>
                <button
                    onClick={handleClose}
                    className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Demo component to showcase the notifications
const NotificationDemo: React.FC = () => {
    const [notifications, setNotifications] = useState<Array<{
        id: number;
        type: NotificationType;
        message: string;
    }>>([]);

    const addNotification = (type: NotificationType, message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Notification Component Demo
                </h1>

                {/* Control Buttons */}
                <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => addNotification('info', 'This is an info notification')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Show Info
                        </button>
                        <button
                            onClick={() => addNotification('success', 'Operation completed successfully!')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Show Success
                        </button>
                        <button
                            onClick={() => addNotification('warning', 'Please check your input')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Show Warning
                        </button>
                        <button
                            onClick={() => addNotification('error', 'Something went wrong!')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Show Error
                        </button>
                    </div>
                </div>

                {/* Notifications Container */}
                <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            type={notification.type}
                            message={notification.message}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>

                {/* Usage Instructions */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Usage</h2>
                    <div className="text-gray-600 space-y-2">
                        <p>• Click the buttons above to test different notification types</p>
                        <p>• Notifications automatically disappear after 2 seconds</p>
                        <p>• You can manually close them by clicking the X button</p>
                        <p>• Notifications appear in the center of the screen with enhanced animations</p>
                        <p>• They feature scale, fade, and slide effects for smooth transitions</p>
                        <p>• Semi-transparent background with backdrop blur for modern look</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;