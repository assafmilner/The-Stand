const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config({ path: "./.env" });

const app = require("./app");
const server = http.createServer(app);

// הגדרת Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO logic
const jwt = require("jsonwebtoken");
const connectedUsers = {};

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
	connectedUsers[socket.userId] = socket.id;
	console.log(`User ${socket.userId} connected`);
	
	socket.on("join-chat", ({ receiverId }) => {
	  const roomId = [socket.userId, receiverId].sort().join("_");
	  socket.join(roomId);
	  console.log(`User ${socket.userId} joined room ${roomId}`);
	});
	
	// הסרת ה-send-message handler מכאן כי אנחנו משתמשים בו מהקונטרולר
	
	socket.on("disconnect", () => {
	  delete connectedUsers[socket.userId];
	  console.log(`User ${socket.userId} disconnected`);
	});
  });

// עבור השרת
app.set('io', io);

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

const port = process.env.PORT || 3001;

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