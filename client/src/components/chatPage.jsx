import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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
    
    
    socket.on("receiveMessage", (newMessage) => {
      if (
        ((newMessage.senderId === currentUser._id || newMessage.senderId === currentUser._id.toString()) || 
         (newMessage.receiverId === currentUser._id || newMessage.receiverId === currentUser._id.toString())) &&
        newMessage.listingId === listingId
      ) {
       
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    
    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, listingId, otherUserInfo, isLandlord, specificTenantId]);

  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add emoji to message
  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create file preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload file to server
  const uploadFile = async () => {
    if (!selectedFile) return null;
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("listingId", listingId);
      formData.append("senderId", currentUser._id);
      
      const response = await fetch("http://localhost:3001/messages/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const fileData = await response.json();
      setIsUploading(false);
      return fileData.filePath;
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      return null;
    }
  };

  // Send message with text and/or file
  const sendMessage = async () => {
   
    if (!newMessage.trim() && !selectedFile) {
      alert("Message cannot be empty or select a file to send!");
      return;
    }
    
    try {
      let filePath = null;
      
      // Upload file if selected
      if (selectedFile) {
        filePath = await uploadFile();
        if (!filePath && !newMessage.trim()) {
          alert("Failed to upload file. Please try again.");
          return;
        }
      }
      
      const messageData = {
        senderId: currentUser._id,
        receiverId: otherUserInfo._id,
        listingId,
        text: newMessage.trim() || (selectedFile ? `Sent a file: ${selectedFile.name}` : ""),
        fileUrl: filePath,
        fileType: selectedFile ? selectedFile.type : null,
        fileName: selectedFile ? selectedFile.name : null,
      };

     
      const response = await fetch("http://localhost:3001/messages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      // Get the saved message with proper ID and timestamps
      const savedMessage = await response.json();
      
      
      socket.emit("sendMessage", savedMessage);
      
      
      setNewMessage("");
      clearSelectedFile();
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
                    {msg.fileUrl && (
                      <div className="file-attachment">
                        {msg.fileType && msg.fileType.startsWith('image/') ? (
                          <img 
                            src={`http://localhost:3001${msg.fileUrl}`} 
                            alt="Attached file" 
                            className="attached-image"
                            onClick={() => window.open(`http://localhost:3001${msg.fileUrl}`, '_blank')}
                          />
                        ) : (
                          <div className="file-download">
                            <i className="fas fa-file"></i>
                            <a href={`http://localhost:3001${msg.fileUrl}`} target="_blank" rel="noopener noreferrer">
                              {msg.fileName || 'Download File'}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
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
          {selectedFile && (
            <div className="file-preview">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-name">{selectedFile.name}</div>
              )}
              <button className="remove-file" onClick={clearSelectedFile}>
                ✕
              </button>
            </div>
          )}
          
          <div className="input-actions">
            <button className="emoji-button" onClick={toggleEmojiPicker}>
              😊
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <button className="attachment-button" onClick={() => fileInputRef.current.click()}>
              📎
            </button>
          </div>
          
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={2}
          />
          <button 
            onClick={sendMessage} 
            disabled={(isUploading || (!newMessage.trim() && !selectedFile))}
          >
            {isUploading ? "Uploading..." : "Send"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPage;