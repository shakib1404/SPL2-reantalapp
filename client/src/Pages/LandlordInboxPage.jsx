import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/LandlordInbox.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandlordInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/messages/inbox/${currentUser._id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Navbar />
      <div className="landlord-inbox-container">
        <h1>Property Inquiries</h1>
        {loading ? (
          <p>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="no-messages">
            <p>You haven't received any messages about your properties yet.</p>
            <button onClick={() => navigate("/landlord/properties")}>
              Manage My Properties
            </button>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => (
              // Only render conversation if currentUser is not the sender
              currentUser._id !== conv.senderId && (
                <div
                  key={`${conv.listingId}-${conv.senderId}`}
                  className="conversation-item"
                  onClick={() =>
                    navigate(`/chat/${conv.listingId}?tenant=${conv.senderId}`)
                  }
                >
                  <div className="conversation-header">
                    <h3>{conv.propertyTitle || "Property"}</h3>
                    <span className="date">{formatDate(conv.createdAt)}</span>
                  </div>
                  <p className="tenant-name">From: {conv.senderName || "Unknown"}</p>
                </div>
              )
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default LandlordInboxPage;
