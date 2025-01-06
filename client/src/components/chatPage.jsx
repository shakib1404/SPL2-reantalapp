import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import "../styles/chat.scss";

const socket = io("http://localhost:3001");

const ChatPage = () => {
  const { listingId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senders, setSenders] = useState({}); 
  const [landlordName, setLandlordName] = useState(""); 
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // Redirect to login if not logged in
      return;
    }

    // Fetch all messages for the chat room
    fetch(`http://localhost:3001/messages/${listingId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

    // Join the specific room based on listingId for socket communication
    socket.emit("joinRoom", listingId);

    // Listen for new messages sent to the room
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [listingId, currentUser, navigate]);

  useEffect(() => {
    // Fetch sender and receiver details when messages are updated
    const fetchSenderReceiverDetails = async () => {
      const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
      const receiverIds = [...new Set(messages.map((msg) => msg.receiverId))];
      
      // Combine sender and receiver IDs
      const userIds = [...new Set([...senderIds, ...receiverIds])];
      const userDetails = {};

      // Fetch details for all users
      for (const id of userIds) {
        const response = await fetch(`http://localhost:3001/users/${id}`);
        const data = await response.json();
        userDetails[id] = data.name; 
      }

      setSenders(userDetails);

      // Fetch landlord name (creator of the listing)
      fetch(`http://localhost:3001/properties/${listingId}`)
        .then((res) => res.json())
        .then((listing) => {
          setLandlordName(listing.creatorName); // Store the landlord's name
        });
    };

    if (messages.length > 0) {
      fetchSenderReceiverDetails();
    }
  }, [messages, listingId]);

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      fetch(`http://localhost:3001/properties/${listingId}`)
        .then((res) => res.json())
        .then((listing) => {
          const receiverId = listing.creator; 
  
          const messageData = {
            senderId: currentUser._id,
            receiverId,
            listingId,
            text: newMessage,
          };

          socket.emit("sendMessage", messageData);

          fetch("http://localhost:3001/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
          })
            .then((res) => res.json())
            .then((data) => {
              setMessages((prevMessages) => [...prevMessages, data]);
              setNewMessage(""); // Clear input after sending
            })
            .catch((err) => {
              console.error("Error sending message:", err);
              alert("Failed to send message.");
            });
        })
        .catch((err) => {
          console.error("Error fetching listing:", err);
          alert("Failed to fetch listing details.");
        });
    } else {
      alert("Message cannot be empty!");
    }
  };

  return (
    <div className="chat-page">
      <h2>Chat with Landlord</h2>
      <div className="messages">
        {messages.map((msg, index) => {
          const senderName = senders[msg.senderId] || (msg.senderId === currentUser._id ? "You" : "Landlord");
          const receiverName = msg.receiverId === currentUser._id ? "You" : landlordName;

          return (
            <div
              key={index}
              className={msg.senderId === currentUser._id ? "my-message" : "other-message"}
            >
              <div className="message-header">
                <span className="sender-name">{senderName}</span> 
                <span className="receiver-name">{receiverName}</span>
              </div>
              <p>{msg.text}</p>
            </div>
          );
        })}
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
