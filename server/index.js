// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io"); // Import Server from socket.io

const app = express();
const PORT = 3001;

// MongoDB Connection
console.log("MONGO_URL:", process.env.MONGO_URL);
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Dream_Nest",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start the server only after MongoDB connection is successful
    const server = app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    // Initialize Socket.IO after server is created
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000", // Adjusted to allow requests from the frontend
        methods: ["GET", "POST"],
      },
    });

    // Socket.IO connection
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Handle joining chat room (user and host can join a room based on chatId)
      socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`User with ID: ${socket.id} joined room: ${chatId}`);
      });

      // Handle sending message
      socket.on("sendMessage", ({ chatId, senderId, message }) => {
        const newMessage = {
          senderId,
          content: message,
          timestamp: new Date(),
        };

        // Emit the new message to users in the same room
        io.to(chatId).emit("receiveMessage", newMessage);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  })
  .catch((err) => console.log(`${err} - Error did not connect`));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const messageRoutes = require("./routes/message.js"); // Import the message routes

app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes); // User-related routes
app.use("/messages", messageRoutes); // Message-related routes
