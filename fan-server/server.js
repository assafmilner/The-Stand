const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./.env" });

const app = require("./app");

const DB = process.env.MONGO_URL.replace(
	"<MONGO_PASSWORD>",
	process.env.MONGO_PASSWORD
);

mongoose
	.connect(DB)
	.then(() => {
		console.log("DB connection successful!");
	})
	.catch((err) => {
		console.log("Error connecting to database:", err);
	});

const port = process.env.PORT || 8000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Store user's socket ID
  onlineUsers.set(socket.userId, socket.id);
  
  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;
      
      // Save message to database
      const Message = require("./models/Message");
      const newMessage = new Message({
        senderId,
        receiverId,
        content
      });
      
      const savedMessage = await newMessage.save();
      await savedMessage.populate("senderId", "name profilePicture");
      
      // Send to receiver if they're online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", savedMessage);
      }
      
      // Confirm to sender
      socket.emit("message_sent", savedMessage);
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    onlineUsers.delete(socket.userId);
  });
});

// Start server
server.listen(port, () => {
	console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});