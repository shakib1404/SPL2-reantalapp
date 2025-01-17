const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const router = express.Router();

// Get messages by listingId and userId
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.query;

    const messages = await Message.find({
      listingId,
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, listingId, text } = req.body;
    const newMessage = new Message({
      senderId,
      receiverId,
      listingId,
      text,
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get('/inbox/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId for proper comparison with MongoDB ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregation pipeline
    const conversations = await Message.aggregate([
      // Match messages where receiverId is equal to userId
      { $match: { receiverId: userObjectId } },

      // Group messages by senderId and get the first listingId for each sender
      { 
        $group: { 
          _id: "$senderId", 
          listingId: { $first: "$listingId" },
          receiverId: { $first: "$receiverId" },
          createdAt: { $first: "$createdAt" }
        } 
      },

      // Lookup sender user data from the "users" collection by senderId
      { 
        $lookup: { 
          from: "users", 
          localField: "_id", 
          foreignField: "_id", 
          as: "senderUser " 
        } 
      },

      // Lookup receiver user data from the "users" collection by receiverId
      { 
        $lookup: { 
          from: "users", 
          localField: "receiverId", 
          foreignField: "_id", 
          as: "receiverUser " 
        } 
      },

      // Unwind both sender and receiver arrays to get individual user information
      { $unwind: { path: "$senderUser ", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$receiverUser ", preserveNullAndEmptyArrays: true } },

      // Project necessary fields: sender's and receiver's full name, listingId, senderId, receiverId, and createdAt
      { 
        $project: { 
          senderName: { 
            $concat: [
              { $ifNull: ["$senderUser .firstname", "Unknown"] }, 
              " ", 
              { $ifNull: ["$senderUser .lastname", ""] }
            ]
          },
          receiverName: { 
            $concat: [
              { $ifNull: ["$receiverUser .firstname", "Unknown"] }, 
              " ", 
              { $ifNull: ["$receiverUser .lastname", ""] }
            ]
          },
          listingId: 1,
          senderId: { $toString: "$_id" }, // Convert senderId ObjectId to string
          receiverId: { $toString: "$receiverId" }, // Convert receiverId ObjectId to string
          createdAt: { $toDate: "$createdAt" } // Ensure createdAt is in date format
        } 
      }
    ]);

    // Log the result for debugging
    console.log(conversations);

    // Return the result as a JSON response
    res.json(conversations);

  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});
module.exports = router;
