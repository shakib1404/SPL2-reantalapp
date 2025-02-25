import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import "../styles/chat.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Initialize socket connection
const socket = io("http://localhost:3001");

const ChatPage = () => {
  const { listingId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const specificTenantId = queryParams.get('tenant'); // For landlords viewing specific tenant conversations
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [property, setProperty] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLandlord, setIsLandlord] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Fetch property details
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/properties/${listingId}`);
        if (!response.ok) throw new Error("Failed to fetch property details");
        
        const propertyData = await response.json();
        setProperty(propertyData);
        
        // Determine if current user is the landlord
        const userIsLandlord = propertyData.creator._id === currentUser._id;
        setIsLandlord(userIsLandlord);
        
        // Set other user info based on role
        if (userIsLandlord && specificTenantId) {
          // Landlord viewing conversation with specific tenant
          const tenantResponse = await fetch(`http://localhost:3001/users/${specificTenantId}`);
          if (!tenantResponse.ok) throw new Error("Failed to fetch tenant details");
          
          const tenantData = await tenantResponse.json();
          setOtherUserInfo({
            _id: specificTenantId,
            name: `${tenantData.firstname} ${tenantData.lastname}`,
            role: "tenant"
          });
        } else if (!userIsLandlord) {
          // Tenant viewing conversation with landlord
          setOtherUserInfo({
            _id: propertyData.creator._id,
            name: `${propertyData.creator.firstname} ${propertyData.creator.lastname}`,
            role: "landlord"
          });
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property information. Please try again.");
      }
    };

    fetchPropertyDetails();
  }, [currentUser, listingId, navigate, specificTenantId]);

  useEffect(() => {
    // Only fetch messages once we have determined roles and users
    if (!currentUser || !otherUserInfo) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        let url = `http://localhost:3001/messages/${listingId}/conversation?senderId=${currentUser._id}&receiverId=${otherUserInfo._id}`;

        // If landlord is viewing specific tenant conversation, filter messages
        if (isLandlord && specificTenantId) {
          url = `http://localhost:3001/messages/${listingId}/conversation?senderId=${currentUser._id}&receiverId=${specificTenantId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch messages");
        
        const messageData = await response.json();
        setMessages(messageData);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Join socket room
    socket.emit("joinRoom", listingId);
    
    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      if (
        (newMessage.senderId === currentUser._id || newMessage.receiverId === currentUser._id) &&
        newMessage.listingId === listingId
      ) {
        // Add new message to the state without refreshing
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    // Cleanup socket listeners on component unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, listingId, otherUserInfo, isLandlord, specificTenantId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      alert("Message cannot be empty!");
      return;
    }
    
    if (!otherUserInfo || !otherUserInfo._id) {
      alert("Cannot determine message recipient.");
      return;
    }
  
    try {
      const messageData = {
        senderId: currentUser._id,
        receiverId: otherUserInfo._id,  // Ensure receiverId is set
        listingId,
        text: newMessage,
      };
  
      // Optimistically update UI with the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, createdAt: new Date().toISOString() }, // Add timestamp for display
      ]);
  
      // Emit message via socket
      socket.emit("sendMessage", messageData);
  
      // Save message to database
      const response = await fetch("http://localhost:3001/messages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
  
      // Clear input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading && !otherUserInfo) {
    return (
      <>
        <Navbar />
        <div className="chat-page loading">
          <p>Loading conversation...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="chat-page error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          
          <div className="chat-info">
            <h2>
              {isLandlord 
                ? `Chat with ${otherUserInfo?.name || 'Tenant'}`
                : `Chat with ${otherUserInfo?.name || 'Landlord'}`
              }
            </h2>
            {property && (
              <p className="property-title">
                Property: {property.title}
              </p>
            )}
          </div>
          
          {property && !isLandlord && (
            <button 
              className="view-property-button"
              onClick={() => navigate(`/properties/${listingId}`)}
            >
              View Property
            </button>
          )}
        </div>

        <div className="messages-container">
          {messages.length > 0 ? (
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`message ${msg.senderId === currentUser._id ? "my-message" : "other-message"}`}
                >
                  <div className="message-content">
                    <p>{msg.text}</p>
                  </div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="no-messages">
              <p>
                {isLandlord
                  ? "No messages yet. Wait for inquiries about your property."
                  : "No messages yet. Start the conversation with the landlord!"}
              </p>
            </div>
          )}
        </div>

        <div className="message-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={2}
          />
          <button onClick={sendMessage} disabled={!newMessage.trim()}>
            Send
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPage;
