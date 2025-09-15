const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    ticketType: {
      type: String,
      required: [true, "Ticket type is required"],
      enum: ["regular", "vip", "premium", "early-bird"],
      default: "regular",
    },
    attendeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null when ticket is available, populated when bought
    },
    price: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Price cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      default: null, // Will be generated when ticket is purchased
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but ensures uniqueness when not null
    },
  },
  {
    timestamps: true,
  }
);

// Generate ticket number before saving
ticketSchema.pre("save", function (next) {
  if (this.isModified("attendeeId") && this.attendeeId && !this.ticketNumber) {
    // Generate unique ticket number when purchased
    this.ticketNumber =
      "TKT-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 5).toUpperCase();
    // Generate QR code data (ticket verification string)
    this.qrCode = `TICKET:${this.ticketNumber}:EVENT:${this.eventId}:USER:${this.attendeeId}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
