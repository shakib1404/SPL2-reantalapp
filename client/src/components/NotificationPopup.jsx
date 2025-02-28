import React from 'react';
import { useNotification } from '../NotificationContext';
import '../styles/NotificationPopup.scss';

const NotificationPopup = () => {
  const { popupNotifications, dismissNotification, getNotificationColor } = useNotification();

  return (
    <div className="notification-popup-container">
      {popupNotifications.map(notification => (
        <div 
          key={notification._id} 
          className={`notification-popup ${notification.isNew ? 'notification-new' : ''}`}
          style={{ borderLeftColor: getNotificationColor(notification.type) }}
        >
          <div className="notification-popup-header">
            <span className="notification-type" style={{ color: getNotificationColor(notification.type) }}>
              {notification.type.replace(/_/g, " ")}
            </span>
            <button 
              className="notification-dismiss"
              onClick={() => dismissNotification(notification._id)}
            >
              ×
            </button>
          </div>
          <div className="notification-popup-body">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
