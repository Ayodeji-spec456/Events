const express = require("express");
const {
  deleteEvent,
  getTotalOrganizers,
  getTotalAttendees,
  getTotalTickets,
  getAllUsers,
  getAttendeesList,
  getOrganizersList,
  deleteAttendee,
  deleteOrganizer,
  deleteAdmin,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected and only accessible by admins
router.use(protect);
router.use(authorize("admin"));

// Event management
router.delete("/events/:id", deleteEvent);

// Statistics
router.get("/organizers", getTotalOrganizers);
router.get("/attendees", getTotalAttendees);
router.get("/tickets", getTotalTickets);

// User management
router.get("/users", getAllUsers);
router.get("/attendees/list", getAttendeesList);
router.get("/organizers/list", getOrganizersList);
router.delete("/attendees/:id", deleteAttendee);
router.delete("/organizers/:id", deleteOrganizer);
router.delete("/admins/:id", deleteAdmin);

module.exports = router;
