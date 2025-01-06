// routes/message.js
const express = require("express");
const Message = require("../Models/Message");
const router = express.Router();

// Route to fetch messages for a particular listing/chat room
router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ listingId: chatId })
      .populate("senderId", "firstname lastname profileimagePath")
      .populate("receiverId", "firstname lastname profileimagePath")
      .sort({ timestamp: 1 }); // Sorting messages in ascending order of timestamp
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Route to store a new message
router.post("/", async (req, res) => {
  const { senderId, receiverId, listingId, text } = req.body;
  
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      listingId,
      text,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
