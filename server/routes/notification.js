const express = require("express");
const nodemailer = require("nodemailer");
const Notification = require("../Models/notification");
const User = require("../Models/user"); 

class NotificationController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/:userId', this.getNotificationsByUser.bind(this));
        this.router.post('/', this.createNotification.bind(this));
        this.router.patch('/:id', this.markNotificationAsRead.bind(this));
        this.router.delete('/:id', this.deleteNotification.bind(this));
        this.router.delete('/user/:userId', this.deleteAllNotificationsForUser.bind(this));
    }

    async getNotificationsByUser(req, res) {
        const { userId } = req.params;

        try {
            const notifications = await Notification.find({ userId })
                .sort({ timestamp: -1 });
            res.status(200).json(notifications);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }

    async createNotification(req, res) {
        const { userId, senderId, listingId, type, message } = req.body;

        try {
            const newNotification = new Notification({
                userId,
                senderId,
                listingId,
                type,
                message,
            });

            const savedNotification = await newNotification.save();
            const io = req.app.get('io');
            if (io) {
              io.to(`notification-${userId}`).emit("newNotification", savedNotification);
            }

           
            await this.sendEmailNotification(userId, message);

            res.status(201).json(savedNotification);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create notification' });
        }
    }

    async markNotificationAsRead(req, res) {
        const { id } = req.params;

        try {
            const updatedNotification = await Notification.findByIdAndUpdate(
                id,
                { isRead: true },
                { new: true }
            );

            if (!updatedNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json(updatedNotification);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update notification' });
        }
    }

    async deleteNotification(req, res) {
        const { id } = req.params;

        try {
            const deletedNotification = await Notification.findByIdAndDelete(id);

            if (!deletedNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({ message: 'Notification deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    }

    async deleteAllNotificationsForUser(req, res) {
        const { userId } = req.params;

        try {
            await Notification.deleteMany({ userId });
            res.status(200).json({ message: 'All notifications deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete notifications' });
        }
    }

    
    async sendEmailNotification(userId, message) {
        try {
           
            const user = await User.findById(userId);
            if (!user) {
                console.error("User not found");
                return;
            }

            
            const transporter = nodemailer.createTransport({
                service: 'gmail', 
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS, 
                },
            });

           
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: user.email, 
                subject: 'New Notification',
                text: message, 
            };

           
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (err) {
            console.error('Error sending email:', err);
        }
    }
}

const notificationController = new NotificationController();
module.exports = notificationController.router;
