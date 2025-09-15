const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Ticket = require("../models/Ticket.model");

// @desc    Delete event (Admin only)
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete all tickets associated with the event
    await Ticket.deleteMany({ eventId: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event and associated tickets deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get total organizers
// @route   GET /api/admin/organizers
// @access  Private (Admin)
const getTotalOrganizers = async (req, res) => {
  try {
    const totalOrganizers = await User.countDocuments({ role: "organizer" });

    res.status(200).json({
      success: true,
      data: {
        totalOrganizers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get total attendees
// @route   GET /api/admin/attendees
// @access  Private (Admin)
const getTotalAttendees = async (req, res) => {
  try {
    const totalAttendees = await User.countDocuments({ role: "attendee" });

    res.status(200).json({
      success: true,
      data: {
        totalAttendees,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get total tickets
// @route   GET /api/admin/tickets
// @access  Private (Admin)
const getTotalTickets = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const soldTickets = await Ticket.countDocuments({ isAvailable: false });
    const availableTickets = totalTickets - soldTickets;

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        soldTickets,
        availableTickets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete attendee
// @route   DELETE /api/admin/attendees/:id
// @access  Private (Admin)
const deleteAttendee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "attendee") {
      return res.status(400).json({
        success: false,
        message: "User is not an attendee",
      });
    }

    // Update tickets to make them available again
    await Ticket.updateMany(
      { attendeeId: req.params.id },
      {
        $unset: { attendeeId: "" },
        isAvailable: true,
      }
    );

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Attendee deleted successfully and tickets made available",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete organizer
// @route   DELETE /api/admin/organizers/:id
// @access  Private (Admin)
const deleteOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "organizer") {
      return res.status(400).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    // Get all events by this organizer
    const events = await Event.find({ organizerId: req.params.id });

    // Delete all tickets for these events
    for (let event of events) {
      await Ticket.deleteMany({ eventId: event._id });
    }

    // Delete all events by this organizer
    await Event.deleteMany({ organizerId: req.params.id });

    // Delete the organizer
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message:
        "Organizer and all associated events and tickets deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get list of attendees
// @route   GET /api/admin/attendees/list
// @access  Private (Admin)
const getAttendeesList = async (req, res) => {
  try {
    const attendees = await User.find({ role: "attendee" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attendees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get list of organizers
// @route   GET /api/admin/organizers/list
// @access  Private (Admin)
const getOrganizersList = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: organizers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Admin)
const deleteAdmin = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
