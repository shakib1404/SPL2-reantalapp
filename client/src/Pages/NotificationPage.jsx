import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/NotificationPage.scss"; // SCSS file for styling

const NotificationPage = () => {
  const { userId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch notifications for the given userId
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/notification/${userId}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setNotifications(data); // Update state with fetched notifications
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to fetch notifications.");
      }
    };

    fetchNotifications();
  }, [userId]);

  // Function to delete individual notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/notification/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Update state after successful deletion
      setNotifications(
        notifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Function to delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/notification/user/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Update state to clear all notifications
      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  const approveBooking = async (notification) => {
    try {
      // Notify the renter about approval
      const response = await fetch(`http://localhost:3001/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: notification.senderId, // Renter
          senderId: notification.userId, // Host
          listingId: notification.listingId,
          type: 'BOOKING_APPROVED',
          message: `Your booking request for listing ${notification.listingId} has been approved.`,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      // Delete the original booking request notification
      deleteNotification(notification._id);
    } catch (err) {
      console.error('Error approving booking:', err);
    }
  };
  

  return (
    <div className="notification-page">
      <h1 className="title">Your Notifications</h1>

      {/* Error message if any */}
      {error && <div className="error-message">{error}</div>}

      {/* Button to clear all notifications */}
      <div className="delete-all-btn-container">
        <button onClick={deleteAllNotifications} className="delete-all-btn">
          Clear All Notifications
        </button>
      </div>

      {/* Display notifications if available */}
      {notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div key={notification._id} className="notification-item">
              <div className="notification-box">
                <div className="notification-header">
                  <h3>{notification.message}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => deleteNotification(notification._id)}
                  >
                    Delete
                  </button>

                  {notification.type === "BOOKING_REQUEST" && (
                    <button
                      className="approve-btn"
                      onClick={() => approveBooking(notification)}
                    >
                      Approve
                    </button>
                  )}
                </div>
                <div className="notification-body">
                  <p>{notification.message}</p>
                </div>
                <div className="notification-footer">
                  <small>
                    {new Date(notification.timestamp).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-notifications">No notifications available</div>
      )}
    </div>
  );
};

export default NotificationPage;
