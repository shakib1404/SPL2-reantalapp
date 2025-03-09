const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io");
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
    
    const server = app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
   
    // Initialize Socket.IO after server is created
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"],
      },
    });
   
    // Store io instance in app to make it accessible in routes
    app.set('io', io);
   
    // Socket.IO connection
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
     
     
      socket.on("joinRoom", (listingId) => {
        socket.join(listingId);
        console.log(`User with ID: ${socket.id} joined room: ${listingId}`);
      });
      
     
      socket.on("joinNotificationRoom", (userId) => {
        socket.join(`notification-${userId}`);
        console.log(`User with ID: ${socket.id} joined notification room for user: ${userId}`);
      });
     
      
      socket.on("sendMessage", (messageData) => {
       
        io.to(messageData.listingId).emit("receiveMessage", {
          ...messageData,
          createdAt: new Date().toISOString()
        });
      });
     
      
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
const messageRoutes = require("./routes/message.js");
const notificationRoutes = require("./routes/notification.js");
const predictionRoutes = require("./routes/rentprediction.js");

app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/notification", notificationRoutes);
app.use("/predict", predictionRoutes);