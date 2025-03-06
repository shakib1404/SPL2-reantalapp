import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/NotificationPage.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Socket.io client connection
const socket = io("http://localhost:3001");

const NotificationPage = () => {
  const { userId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [listingDetails, setListingDetails] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing notifications and listing details
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const notificationResponse = await fetch(`http://localhost:3001/notification/${userId}`);
        if (!notificationResponse.ok) {
          throw new Error(`Error: ${notificationResponse.statusText}`);
        }
        const notificationsData = await notificationResponse.json();
        setNotifications(notificationsData);
        setError(null);

        // Fetch listing details (assumes there's an API to fetch listings)
        const listingsResponse = await fetch("http://localhost:3001/properties"); // Change to actual endpoint
        const listingsData = await listingsResponse.json();
        const listingMap = listingsData.reduce((acc, listing) => {
          acc[listing._id] = listing;
          return acc;
        }, {});
        setListingDetails(listingMap);
      } catch (err) {
        console.error("Error fetching notifications or listings:", err);
        setError("Failed to fetch notifications or listings.");
      } finally {
        setIsLoading(false);
      }
    };

    // Connect to notification room
    socket.emit("joinNotificationRoom", userId);

    fetchNotifications();

    // Listen for real-time updates
    socket.on("newNotification", (newNotification) => {
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    });

    // Cleanup socket listeners and rooms
    return () => {
      socket.off("newNotification");
      socket.emit("leaveNotificationRoom", userId);
    };
  }, [userId]);

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3001/notification/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3001/notification/user/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      setError("Failed to clear all notifications.");
    }
  };

  // Approve booking and send detailed notification
  const approveBooking = async (notification) => {
    try {
      const listing = listingDetails[notification.listingId];
      
      if (!listing) {
        setError("Listing details not found.");
        return;
      }

      const message = `Your booking request for the listing "${listing.title}" located at "${listing.streetAddress}" in the category "${listing.category}" has been approved. Price: ${listing.price} per night.`;

      const response = await fetch(`http://localhost:3001/notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: notification.senderId, // Renter
          senderId: notification.userId, // Host
          listingId: notification.listingId,
          type: "BOOKING_APPROVED",
          message: message, // Send the detailed message
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Delete the original notification after approval
      deleteNotification(notification._id);
    } catch (err) {
      console.error("Error approving booking:", err);
      setError("Failed to approve booking.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="notification-page">
        <h1 className="title">Your Notifications</h1>
        
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading-spinner">Loading notifications...</div>
        ) : (
          <>
            <div className="delete-all-btn-container">
              <button 
                onClick={deleteAllNotifications} 
                className="delete-all-btn"
                disabled={notifications.length === 0}
              >
                Clear All Notifications
              </button>
            </div>

            {notifications.length > 0 ? (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div key={notification._id} className="notification-item">
                    <div className="notification-box">
                      <div className="notification-header">
                        <h3>{notification.type}</h3>
                        <div className="notification-actions">
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
                      </div>
                      <div className="notification-body">
                        <p>{notification.message}</p>
                      </div>
                      <div className="notification-footer">
                        <small>{new Date(notification.timestamp).toLocaleString()}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-notifications">No notifications available</div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default NotificationPage;
