const express = require("express");
const {
  createTicket,
  buyTicket,
  getMyTickets,
  getEventTickets,
  verifyQRCode,
  getAvailableTickets,
  generateQRCode,
  scanQRCode,
} = require("../controllers/ticketController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Create ticket for event (organizers only)
router.post(
  "/:eventId",
  protect,
  authorize("organizer", "admin"),
  createTicket
);

// Buy ticket (attendees only)
router.post("/buy/:ticketId", protect, authorize("attendee"), buyTicket);

// Get user's bought tickets (attendees only)
router.get("/mine", protect, authorize("attendee"), getMyTickets);

// Get all tickets for an event (organizers and admins)
router.get(
  "/event/:eventId",
  protect,
  authorize("organizer", "admin"),
  getEventTickets
);

// Get available tickets for an event (attendees only)
router.get(
  "/available/:eventId",
  protect,
  authorize("attendee"),
  getAvailableTickets
);

// Verify QR code (organizers and admins)
router.post("/verify", protect, authorize("organizer", "admin"), verifyQRCode);

// Generate QR code for ticket (attendees only - must own the ticket)
router.get("/qr/:ticketId", protect, authorize("attendee"), generateQRCode);

// Scan QR code and display ticket details (public)
router.get("/scan/:qrCode", scanQRCode);

module.exports = router;
