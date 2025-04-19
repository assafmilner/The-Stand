const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");


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

const server = app.listen(port, () => {
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