const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const errorHandler = require("./middleware/error");

// Route files
const auth = require("./routes/auth");
const events = require("./routes/events");
const tickets = require("./routes/tickets");
const admin = require("./routes/admin");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Mount routers
app.use("/api/auth", auth);
app.use("/api/events", events);
app.use("/api/tickets", tickets);
app.use("/api/admin", admin);

// Basic route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Event Organizing API is running!",
    version: "1.0.0",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
