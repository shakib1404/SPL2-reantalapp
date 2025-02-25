const express = require("express");
const mongoose = require("mongoose");
const Message = require("../Models/Message");
const Property = require("../Models/Listing");

class MessageController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:listingId/conversation", this.getMessagesByListingAndUsers.bind(this));
        this.router.post("/create", this.createMessage.bind(this));
        this.router.get("/inbox/:userId", this.getInbox.bind(this));
    }

    // Get messages by listing ID, between two users (senderId and receiverId)
    async getMessagesByListingAndUsers(req, res) {
        try {
            const { listingId } = req.params;
            const { senderId, receiverId } = req.query;

            // Validate the input ids
            if (!mongoose.Types.ObjectId.isValid(listingId) || 
                !mongoose.Types.ObjectId.isValid(senderId) || 
                !mongoose.Types.ObjectId.isValid(receiverId)) {
                return res.status(400).json({ error: "Invalid listing ID or user ID" });
            }

            // Fetch messages exchanged between sender and receiver for the listing
            const messages = await Message.find({
                listingId,
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ createdAt: 1 }); // Sort messages by timestamp in ascending order

            res.json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Create a new message
    async createMessage(req, res) {
        try {
            const { senderId, receiverId, listingId, text } = req.body;
            const newMessage = new Message({
                senderId,
                receiverId,
                listingId,
                text,
                timestamp: new Date()
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Error saving message:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Get inbox for a user - shows conversations with other users for the properties they are involved with
    async getInbox(req, res) {
        const { userId } = req.params;

        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const conversations = await Message.aggregate([
                { $match: { receiverId: userObjectId } },
                {
                    $group: {
                        _id: "$senderId", // Group by senderId
                        listingId: { $first: "$listingId" },
                        receiverId: { $first: "$receiverId" },
                        createdAt: { $first: "$createdAt" },
                    },
                },
                {
                    $lookup: {
                        from: "users", // Lookup sender info
                        localField: "_id",
                        foreignField: "_id",
                        as: "senderUser",
                    },
                },
                {
                    $lookup: {
                        from: "users", // Lookup receiver info
                        localField: "receiverId",
                        foreignField: "_id",
                        as: "receiverUser",
                    },
                },
                { $unwind: { path: "$senderUser", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$receiverUser", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        senderName: {
                            $concat: [
                                { $ifNull: ["$senderUser.firstname", "Unknown"] },
                                " ",
                                { $ifNull: ["$senderUser.lastname", ""] },
                            ],
                        },
                        receiverName: {
                            $concat: [
                                { $ifNull: ["$receiverUser.firstname", "Unknown"] },
                                " ",
                                { $ifNull: ["$receiverUser.lastname", ""] },
                            ],
                        },
                        listingId: 1,
                        senderId: { $toString: "$_id" },
                        receiverId: { $toString: "$receiverId" },
                        createdAt: { $toDate: "$createdAt" },
                    },
                },
            ]);

            console.log(conversations);
            res.json(conversations);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            res.status(500).json({ error: "Failed to fetch conversations" });
        }
    }
}

const messageController = new MessageController();
module.exports = messageController.router;
