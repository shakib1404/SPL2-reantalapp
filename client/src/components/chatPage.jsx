import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import "../styles/chat.scss";

const socket = io("http://localhost:3001"); // Initialize socket connection

const ChatPage = () => {
  const { listingId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senders, setSenders] = useState({});
  const [landlordName, setLandlordName] = useState("");
  const [landlordId, setLandlordId] = useState(null);
  const [isLandlord, setIsLandlord] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!currentUser) {
      navigate("/login");
      return;
    }

    console.log("Listing ID:", listingId);
    console.log("Current User ID:", currentUser._id);

    // Fetch messages related to the listing and user
    fetch(`http://localhost:3001/messages/${listingId}?userId=${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched messages:", data);
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
      });

    // Emit event to join the room (for socket communication)
    socket.emit("joinRoom", listingId);

    // Listen for real-time messages
    socket.on("receiveMessage", (message) => {
      if (
        (message.senderId === currentUser._id && message.receiverId === landlordId) ||
        (message.senderId === landlordId && message.receiverId === currentUser._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, [listingId, currentUser, landlordId, navigate]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch property details
        const listing = await fetch(`http://localhost:3001/properties/${listingId}`).then((res) =>
          res.json()
        );

        if (listing?.creator) {
          setLandlordId(listing.creator._id);
          setLandlordName(listing.creator.firstname);
        } else {
          console.error("Creator information is missing in the listing:", listing);
        }

        // Get user details for all message participants
        const userIds = Array.from(
          new Set([...messages.map((msg) => msg.senderId), ...messages.map((msg) => msg.receiverId)])
        );

        const userDetailsPromises = userIds.map((id) =>
          fetch(`http://localhost:3001/users/${id}`).then((res) => res.json())
        );

        const users = await Promise.all(userDetailsPromises);
        const userDetails = users.reduce((acc, user) => {
          acc[user._id] = user.name;
          return acc;
        }, {});

        setSenders(userDetails);
      } catch (error) {
        console.error("Error fetching user or listing details:", error);
      }
    };

    fetchDetails();
  }, [messages, listingId]);

  useEffect(() => {
    const checkLandlordStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/users/${currentUser._id}/properties`);
        const properties = await response.json();
        const isUserLandlord = properties.some(
          (property) => property.creator._id === currentUser._id
        );
        setIsLandlord(isUserLandlord);
      } catch (error) {
        console.error("Error checking landlord status:", error);
      }
    };

    if (currentUser) checkLandlordStatus();
  }, [currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return alert("Message cannot be empty!");

    try {
      const listing = await fetch(`http://localhost:3001/properties/${listingId}`).then((res) =>
        res.json()
      );

      const messageData = {
        senderId: currentUser._id,
        receiverId: listing.creator._id,
        listingId,
        text: newMessage,
      };

      // Emit message to the socket server
      socket.emit("sendMessage", messageData);

      // Send the message to the backend and save it to the database
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const savedMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, savedMessage]);
      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="chat-page">
      <h2>Chat with {isLandlord ? "Tenant" : landlordName || "Landlord"}</h2>
      <div className="messages">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg, index) => {
            const senderName =
              senders[msg.senderId] || (msg.senderId === currentUser._id ? "You" : landlordName);

            return (
              <div
                key={index}
                className={msg.senderId === currentUser._id ? "my-message" : "other-message"}
              >
                <div className="message-header">
                  <span className="sender-name">{senderName}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            );
          })
        ) : (
          <p>No messages available.</p>
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <button className="back-button" onClick={() => navigate(`/properties/${listingId}`)}>
        Back to Listing
      </button>
    </div>
  );
};

export default ChatPage;
