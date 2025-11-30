import React from 'react';
import { useNotification, NotificationType } from '../contexts/NotificationContext';

const NotificationItem: React.FC<{
  id: string;
  type: NotificationType;
  message: string;
  onClose: (id: string) => void;
}> = ({ id, type, message, onClose }) => {
  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i'
  };

  return (
    <div className={`${bgColors[type]} text-white p-4 mb-3 border border-[#141413] shadow-lg animate-slide-in flex items-start justify-between max-w-md`}>
      <div className="flex items-start space-x-3">
        <span className="font-bold text-lg">{icons[type]}</span>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-white hover:opacity-70 transition-opacity font-bold text-lg leading-none"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50" role="alert" aria-live="polite">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};
