import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Access Redux store
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // Get user from Redux state
  const user = useSelector((state) => state.user); 
  const userId = user ? user._id : null; // Extract userId from Redux state

  const [socket, setSocket] = useState(null);
  const [popupNotifications, setPopupNotifications] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Set up notification listeners
  useEffect(() => {
    if (!socket || !userId) return;

    // Join the notification room for this user
    socket.emit("joinNotificationRoom", userId);

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      setPopupNotifications(prev => [...prev, { ...notification, isNew: true }]);

      setTimeout(() => {
        setPopupNotifications(prev => 
          prev.filter(item => item._id !== notification._id)
        );
      }, 5000);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket, userId]);

  const dismissNotification = (notificationId) => {
    setPopupNotifications(prev => 
      prev.filter(notification => notification._id !== notificationId)
    );
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'BOOKING_REQUEST': return '#4caf50';
      case 'BOOKING_APPROVED': return '#2196f3';
      case 'BOOKING_REJECTED': return '#f44336';
      case 'MESSAGE': return '#ff9800';
      default: return '#9c27b0';
    }
  };

  return (
    <NotificationContext.Provider value={{ popupNotifications, dismissNotification, getNotificationColor }}>
      {children}
    </NotificationContext.Provider>
  );
};
