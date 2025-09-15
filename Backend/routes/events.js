const express = require("express");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getEvents)
  .post(protect, authorize("organizer", "admin"), createEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(protect, authorize("organizer", "admin"), updateEvent)
  .delete(protect, authorize("organizer", "admin"), deleteEvent);

module.exports = router;
