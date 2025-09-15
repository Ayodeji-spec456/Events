const Ticket = require("../models/Ticket.model");
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const qrcode = require("qrcode");
const { sendTicketConfirmation } = require("../services/emailService");

// @desc    Create ticket for event
// @route   POST /api/tickets/:eventId
// @access  Private (Organizer)
const createTicket = async (req, res) => {
  try {
    const { ticketType, price } = req.body;
    const { eventId } = req.params;

    // Check if event exists and user owns it
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Make sure user owns the event
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create tickets for this event",
      });
    }

    const ticket = await Ticket.create({
      eventId,
      ticketType,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Buy ticket
// @route   POST /api/tickets/buy/:ticketId
// @access  Private (Attendee)
const buyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Find available ticket
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!ticket.isAvailable || ticket.attendeeId) {
      return res.status(400).json({
        success: false,
        message: "Ticket is not available",
      });
    }

    // Update ticket with attendee info
    ticket.attendeeId = req.user.id;
    ticket.isAvailable = false;
    await ticket.save();

    // Populate event details and user details
    await ticket.populate(
      "eventId",
      "name description genre category price organizerId"
    );
    const user = await User.findById(req.user.id);

    // Send ticket confirmation email (don't wait for it to complete)
    if (ticket.eventId && user) {
      const ticketDetails = {
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        price: ticket.price,
        qrCode: ticket.qrCode,
        createdAt: ticket.createdAt,
      };

      const eventDetails = {
        name: ticket.eventId.name,
        description: ticket.eventId.description,
        genre: ticket.eventId.genre,
        category: ticket.eventId.category,
        price: ticket.eventId.price,
      };

      sendTicketConfirmation(
        user.email,
        user.name,
        ticketDetails,
        eventDetails
      ).catch((error) => {
        console.error("Failed to send ticket confirmation email:", error);
        // Don't fail the ticket purchase if email fails
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket purchased successfully",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's bought tickets
// @route   GET /api/tickets/mine
// @access  Private (Attendee)
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      attendeeId: req.user.id,
    }).populate("eventId", "name description genre category price organizerId");

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all tickets for an event
// @route   GET /api/tickets/event/:eventId
// @access  Private (Organizer)
const getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists and user owns it
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.organizerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to view tickets for this event",
      });
    }

    const tickets = await Ticket.find({ eventId }).populate(
      "attendeeId",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available tickets for an event (public for attendees)
// @route   GET /api/tickets/available/:eventId
// @access  Private (Attendee)
const getAvailableTickets = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get only available tickets for this event
    const tickets = await Ticket.find({
      eventId,
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify QR code
// @route   POST /api/tickets/verify
// @access  Private (Organizer/Admin)
const verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR code is required",
      });
    }

    // Find ticket by QR code
    const ticket = await Ticket.findOne({ qrCode }).populate([
      { path: "eventId", select: "name description organizerId" },
      { path: "attendeeId", select: "name email" },
    ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Check if user is authorized to verify this ticket
    if (
      ticket.eventId.organizerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to verify this ticket",
      });
    }

    res.status(200).json({
      success: true,
      message: "QR code verified successfully",
      data: {
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        eventName: ticket.eventId.name,
        attendeeName: ticket.attendeeId.name,
        attendeeEmail: ticket.attendeeId.email,
        isValid: ticket.isAvailable === false && ticket.attendeeId !== null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate QR code for ticket
// @route   GET /api/tickets/qr/:ticketId
// @access  Private (Attendee - must own the ticket)
const generateQRCode = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Find ticket and check ownership
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if user owns this ticket
    if (ticket.attendeeId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to view this ticket's QR code",
      });
    }

    if (!ticket.qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR code not available for this ticket",
      });
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await qrcode.toDataURL(ticket.qrCode, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        qrCodeDataURL,
        ticketNumber: ticket.ticketNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Scan QR code and display ticket details (public route)
// @route   GET /api/tickets/scan/:qrCode
// @access  Public
const scanQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR code is required",
      });
    }

    // Find ticket by QR code
    const ticket = await Ticket.findOne({ qrCode }).populate([
      { path: "eventId", select: "name description genre category date location organizerId" },
      { path: "attendeeId", select: "name email" },
    ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code - ticket not found",
      });
    }

    // Check if ticket is valid (purchased and not used)
    if (!ticket.attendeeId || ticket.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket - not purchased or already used",
      });
    }

    // Return formatted ticket details for display
    res.status(200).json({
      success: true,
      message: "Ticket verified successfully",
      data: {
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        price: ticket.price,
        purchaseDate: ticket.createdAt,
        event: {
          name: ticket.eventId.name,
          description: ticket.eventId.description,
          genre: ticket.eventId.genre,
          category: ticket.eventId.category,
          date: ticket.eventId.date,
          location: ticket.eventId.location,
        },
        attendee: {
          name: ticket.attendeeId.name,
          email: ticket.attendeeId.email,
        },
        organizer: ticket.eventId.organizerId?.name || "Unknown",
        status: "Valid",
        qrCode: ticket.qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTicket,
  buyTicket,
  getMyTickets,
  getEventTickets,
  getAvailableTickets,
  verifyQRCode,
  generateQRCode,
  scanQRCode,
};
