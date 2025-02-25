const express = require("express");
const mongoose = require("mongoose");
const Message = require("../Models/Message");

class MessageController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:listingId", this.getMessagesByListingAndUser.bind(this));
        this.router.post("/", this.createMessage.bind(this));
        this.router.get("/inbox/:userId", this.getInbox.bind(this));
    }

    async getMessagesByListingAndUser(req, res) {
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
    }

    async createMessage(req, res) {
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
    }

    async getInbox(req, res) {
        const { userId } = req.params;

        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const conversations = await Message.aggregate([
                { $match: { receiverId: userObjectId } },
                {
                    $group: {
                        _id: "$senderId",
                        listingId: { $first: "$listingId" },
                        receiverId: { $first: "$receiverId" },
                        createdAt: { $first: "$createdAt" },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "senderUser",
                    },
                },
                {
                    $lookup: {
                        from: "users",
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
