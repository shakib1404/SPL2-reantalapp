// LandlordInboxPage.js
import "../styles/LandlordPage.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LandlordInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const currentUser = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // Redirect to login if not logged in
      return;
    }

    // Fetch conversations where the current user is the landlord
    fetch(`http://localhost:3001/messages/inbox/${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((err) => {
        console.error("Error fetching conversations:", err);
      });
  }, [currentUser, navigate]);

  return (
    <div className="inbox-page">
      <h2>Inbox</h2>
      {conversations.length > 0 ? (
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.listingId}
              onClick={() => navigate(`/chat/${conversation.listingId}`)}
            >
              Chat with {conversation.senderName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages yet.</p>
      )}
    </div>
  );
};

export default LandlordInboxPage;
