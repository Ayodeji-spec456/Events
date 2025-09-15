const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate QR Code as base64 image
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

// Send welcome email when user registers
const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  try {
    const transporter = createTransporter();

    const roleMessages = {
      attendee: {
        title: "Welcome to EventHub! 🎉",
        subtitle: "Get ready to discover amazing events!",
        message:
          "As an attendee, you can browse, search, and purchase tickets for exciting events. Start exploring now!",
        features: [
          "🔍 Browse and search events by category and genre",
          "🎟️ Purchase tickets with QR codes",
          "📧 Receive instant ticket confirmations",
          "📱 Easy mobile access to your tickets",
        ],
      },
      organizer: {
        title: "Welcome to EventHub! 🎯",
        subtitle: "Ready to create amazing events?",
        message:
          "As an organizer, you can create, manage, and sell tickets for your events. Let's get started!",
        features: [
          "✨ Create and manage your events",
          "🎟️ Generate and sell tickets",
          "📊 Track ticket sales and attendees",
          "💼 Manage your event portfolio",
        ],
      },
      admin: {
        title: "Welcome to EventHub Admin! ⚡",
        subtitle: "You have full platform access",
        message:
          "As an admin, you can manage the entire platform, users, and events. Welcome to the team!",
        features: [
          "👥 Manage users and organizers",
          "🎪 Oversee all events on the platform",
          "📈 Access platform analytics",
          "🛠️ Full administrative control",
        ],
      },
    };

    const roleData = roleMessages[userRole] || roleMessages.attendee;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Welcome to EventHub - ${userName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎫 EventHub</h1>
            <h2 style="color: white; margin: 15px 0 5px 0; font-weight: normal; font-size: 24px;">${
              roleData.title
            }</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${
              roleData.subtitle
            }</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 24px;">Hello ${userName}!</h3>
              <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">${
                roleData.message
              }</p>
            </div>

            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 30px; margin: 30px 0; border-radius: 5px;">
              <h4 style="color: #333; margin-top: 0; font-size: 18px; margin-bottom: 20px;">🚀 What you can do:</h4>
              <div style="color: #555;">
                ${roleData.features
                  .map(
                    (feature) => `
                  <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                    ${feature}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div style="background: #e8f5e8; border: 1px solid #d4edda; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #155724; margin-top: 0; font-size: 18px;">🎯 Quick Start Tips:</h4>
              <ul style="color: #155724; margin: 15px 0; padding-left: 20px; line-height: 1.8;">
                ${
                  userRole === "attendee"
                    ? `
                  <li>Complete your profile to get personalized event recommendations</li>
                  <li>Browse events by category to find what interests you</li>
                  <li>Save your favorite events for easy access</li>
                `
                    : userRole === "organizer"
                    ? `
                  <li>Create your first event to start attracting attendees</li>
                  <li>Add detailed descriptions and categories for better visibility</li>
                  <li>Set up different ticket types for various pricing options</li>
                `
                    : `
                  <li>Review platform analytics to understand user engagement</li>
                  <li>Monitor event quality and user feedback</li>
                  <li>Ensure platform security and user safety</li>
                `
                }
              </ul>
            </div>

            <div style="background: linear-gradient(45deg, #28a745, #20c997); padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="color: white; margin: 0; font-size: 18px; font-weight: 500;">
                🎉 Ready to get started? 🎉
              </p>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                Log in to your account and start exploring everything EventHub has to offer!
              </p>
            </div>

            <div style="text-align: center; padding-top: 30px; border-top: 2px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                Questions? Contact our support team anytime
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                EventHub © 2024 | Making events memorable
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// Send ticket confirmation email
const sendTicketConfirmation = async (
  userEmail,
  userName,
  ticketDetails,
  eventDetails
) => {
  try {
    const transporter = createTransporter();

    // Generate QR code for the ticket
    const qrCodeImage = await generateQRCode(ticketDetails.qrCode);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎫 Ticket Confirmation - ${eventDetails.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: linear-gradient(45deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎫 EventHub</h1>
            <h2 style="color: white; margin: 10px 0 0 0; font-weight: normal;">Ticket Confirmed!</h2>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="color: #28a745; margin: 0; font-size: 24px;">Hello ${userName}!</h3>
              <p style="color: #666; margin: 10px 0;">Your ticket purchase was successful. Here are your details:</p>
            </div>

            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; font-size: 18px;">📅 Event Details</h4>
              <table style="width: 100%; color: #555;">
                <tr><td style="padding: 8px 0;"><strong>Event Name:</strong></td><td>${
                  eventDetails.name
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Category:</strong></td><td style="text-transform: capitalize;">${
                  eventDetails.category
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Genre:</strong></td><td>${
                  eventDetails.genre
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Description:</strong></td><td>${
                  eventDetails.description
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Price:</strong></td><td style="color: #28a745; font-weight: bold;">$${
                  eventDetails.price
                }</td></tr>
              </table>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; font-size: 18px;">🎟️ Ticket Information</h4>
              <table style="width: 100%; color: #555;">
                <tr><td style="padding: 8px 0;"><strong>Ticket Number:</strong></td><td style="color: #2196f3; font-weight: bold;">${
                  ticketDetails.ticketNumber
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Ticket Type:</strong></td><td style="text-transform: uppercase; background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${
                  ticketDetails.ticketType
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Price Paid:</strong></td><td style="color: #28a745; font-weight: bold;">$${
                  ticketDetails.price
                }</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Purchase Date:</strong></td><td>${new Date(
                  ticketDetails.createdAt
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</td></tr>
              </table>
            </div>

            ${
              qrCodeImage
                ? `
              <div style="background: white; border: 2px solid #dee2e6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px;">
                <h4 style="color: #333; margin-bottom: 20px; font-size: 18px;">📱 Your QR Code Ticket</h4>
                <img src="${qrCodeImage}" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 8px;"/>
                <p style="color: #666; margin-top: 15px; font-size: 14px;">
                  Present this QR code at the event entrance for quick verification
                </p>
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 15px;">
                  <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>💡 Tip:</strong> Save this email or take a screenshot for offline access
                  </p>
                </div>
              </div>
            `
                : ""
            }

            <div style="background: linear-gradient(45deg, #28a745, #20c997); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="color: white; margin: 0; font-size: 16px; font-weight: 500;">
                🎉 Thank you for choosing EventHub! 🎉
              </p>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                We hope you have an amazing experience at your event!
              </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Questions? Contact our support team • EventHub © 2024
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketConfirmation,
};
