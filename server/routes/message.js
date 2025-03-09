const express = require("express");
const mongoose = require("mongoose");
const Message = require("../Models/Message");
const Property = require("../Models/Listing");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});


const fileFilter = (req, file, cb) => {
   
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload an image, document, or PDF.'), false);
    }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

class MessageController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:listingId/conversation", this.getMessagesByListingAndUsers.bind(this));
        this.router.post("/create", this.createMessage.bind(this));
        this.router.get("/inbox/:userId", this.getInbox.bind(this));
        
        
        this.router.post("/upload", upload.single('file'), this.uploadFile.bind(this));
        this.router.get("/files/:filename", this.getFile.bind(this));
    }

    // Get messages by listing ID, between two users (senderId and receiverId)
    async getMessagesByListingAndUsers(req, res) {
        try {
            const { listingId } = req.params;
            const { senderId, receiverId } = req.query;

        
            if (!mongoose.Types.ObjectId.isValid(listingId) || 
                !mongoose.Types.ObjectId.isValid(senderId) || 
                !mongoose.Types.ObjectId.isValid(receiverId)) {
                return res.status(400).json({ error: "Invalid listing ID or user ID" });
            }

            
            const messages = await Message.find({
                listingId,
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ createdAt: 1 }); 

            res.json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Create a new message
    async createMessage(req, res) {
        try {
            const { senderId, receiverId, listingId, text, fileUrl, fileType, fileName } = req.body;
            const newMessage = new Message({
                senderId,
                receiverId,
                listingId,
                text,
                fileUrl,
                fileType,
                fileName,
                timestamp: new Date()
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Error saving message:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Upload file and return file path
    uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            
            // Get the file path relative to the public directory
            const filePath = `/uploads/${req.file.filename}`;
            
            res.status(200).json({
                message: "File uploaded successfully",
                filePath: filePath,
                fileName: req.file.originalname,
                fileType: req.file.mimetype
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            res.status(500).json({ error: "File upload failed" });
        }
    }

    // Get file by filename
    getFile(req, res) {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../public/uploads', filename);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "File not found" });
            }
            
            res.sendFile(filePath);
        } catch (error) {
            console.error("Error serving file:", error);
            res.status(500).json({ error: "Failed to serve file" });
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
                        from: "listings",
                        localField: "listingId",
                        foreignField: "_id",
                        as: "listingData",
                    },
                },
                { $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true } },
                {
                    $match: { "listingData._id": { $ne: null } } // Ensure listing still exists
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
                        senderProfilePic: {
                            $ifNull: ["$senderUser.profileimagePath", "/default-profile.png"],
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