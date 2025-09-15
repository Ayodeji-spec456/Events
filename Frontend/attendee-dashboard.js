// Attendee Dashboard Functions

async function loadAttendeeContent(content) {
  content.innerHTML = `
        <div class="attendee-header">
            <h2>🎉 Discover Amazing Events</h2>
            <p>Find and attend the best events in your area</p>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-filter-section">
            <div class="search-bar">
                <input type="text" id="eventSearch" placeholder="🔍 Search events by name, description, or genre..." />
                <button class="btn btn-primary" onclick="searchEvents()">Search</button>
            </div>

            <div class="filter-bar">
                <select id="categoryFilter" onchange="filterEvents()">
                    <option value="all">All Categories</option>
                    <option value="music">🎵 Music</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="technology">💻 Technology</option>
                    <option value="business">💼 Business</option>
                    <option value="entertainment">🎭 Entertainment</option>
                    <option value="education">📚 Education</option>
                    <option value="arts">🎨 Arts</option>
                    <option value="food">🍽️ Food</option>
                    <option value="health">🏥 Health</option>
                    <option value="other">🌟 Other</option>
                </select>

                <button class="btn btn-secondary" onclick="clearFilters()">Clear Filters</button>
                <button class="btn btn-success" onclick="viewMyTickets()">My Tickets</button>
            </div>
        </div>

        <!-- Events Container -->
        <div class="loading" id="eventsLoading">
            <div class="spinner"></div>
            <p>Loading amazing events for you...</p>
        </div>

        <div id="eventsContainer" class="events-grid" style="display: none;">
            <!-- Events will be loaded here -->
        </div>

        <div id="noEventsMessage" class="no-events-message" style="display: none;">
            <div class="empty-state">
                <h3>🎪 No events found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button class="btn btn-primary" onclick="loadAllEvents()">Show All Events</button>
            </div>
        </div>
    `;

  // Load all events initially
  await loadAllEvents();
}

async function loadAllEvents() {
  try {
    showEventsLoading(true);
    const response = await fetch(`${API_URL}/events`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      displayAttendeeEvents(data.data);
    } else {
      showNoEventsMessage();
    }
  } catch (error) {
    showEventsError();
  }
}

async function searchEvents() {
  const searchTerm = document.getElementById("eventSearch").value.trim();
  const category = document.getElementById("categoryFilter").value;

  let queryParams = new URLSearchParams();

  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  if (category && category !== "all") {
    queryParams.append("category", category);
  }

  try {
    showEventsLoading(true);
    const response = await fetch(`${API_URL}/events?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      displayAttendeeEvents(data.data);
    } else {
      showNoEventsMessage();
    }
  } catch (error) {
    showEventsError();
  }
}

function filterEvents() {
  searchEvents(); // Use the same search function with category filter
}

function clearFilters() {
  document.getElementById("eventSearch").value = "";
  document.getElementById("categoryFilter").value = "all";
  loadAllEvents();
}

function displayAttendeeEvents(events) {
  const container = document.getElementById("eventsContainer");
  const loading = document.getElementById("eventsLoading");
  const noEventsMsg = document.getElementById("noEventsMessage");

  loading.style.display = "none";
  noEventsMsg.style.display = "none";
  container.style.display = "grid";

  container.innerHTML = events
    .map(
      (event) => `
        <div class="event-card attendee-card">
            <div class="event-category">
                <span class="category-badge category-${
                  event.category
                }">${getCategoryIcon(event.category)} ${event.category}</span>
            </div>

            <h3>${event.name}</h3>
            <p class="event-genre"><strong>Genre:</strong> ${event.genre}</p>
            <p class="event-description">${
              event.description.length > 120
                ? event.description.substring(0, 120) + "..."
                : event.description
            }</p>
            <p class="event-organizer"><strong>Organizer:</strong> ${
              event.organizerId?.name || "Unknown"
            }</p>

            <div class="event-price">$${event.price}</div>

            <div class="event-actions">
                <button class="btn btn-success btn-full" onclick="viewEventTickets('${
                  event._id
                }')">
                    🎫 View Available Tickets
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

function getCategoryIcon(category) {
  const icons = {
    music: "🎵",
    sports: "⚽",
    technology: "💻",
    business: "💼",
    entertainment: "🎭",
    education: "📚",
    arts: "🎨",
    food: "🍽️",
    health: "🏥",
    other: "🌟",
  };
  return icons[category] || "🌟";
}

async function viewEventTickets(eventId) {
  try {
    const response = await fetch(`${API_URL}/tickets/available/${eventId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      showTicketModal(data.data, eventId);
    } else {
      showAlert(
        "No tickets are available for this event yet. Check back later!",
        "info"
      );
    }
  } catch (error) {
    showAlert("Error loading tickets. Please try again.", "error");
  }
}

function showTicketModal(tickets, eventId) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content ticket-modal">
            <div class="modal-header">
                <h3>🎫 Available Tickets</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>

            <div class="ticket-list">
                ${tickets
                  .map(
                    (ticket) => `
                    <div class="ticket-item">
                        <div class="ticket-info">
                            <div class="ticket-type">${ticket.ticketType.toUpperCase()}</div>
                            <div class="ticket-price">$${ticket.price}</div>
                            <div class="ticket-features">
                                ${getTicketFeatures(ticket.ticketType)}
                            </div>
                        </div>
                        <button class="btn btn-success" onclick="buyTicket('${
                          ticket._id
                        }')">
                            💳 Buy Now
                        </button>
                    </div>
                `
                  )
                  .join("")}
            </div>

            <div class="modal-footer">
                <p><small>💡 You will receive a confirmation email with QR code after purchase</small></p>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

function getTicketFeatures(ticketType) {
  const features = {
    regular: "✓ Event Access",
    vip: "✓ VIP Seating ✓ Priority Entry",
    premium: "✓ Premium Seating ✓ Complimentary Drinks",
    "early-bird": "✓ Special Discount ✓ Early Access",
  };
  return features[ticketType] || "✓ Event Access";
}

async function buyTicket(ticketId) {
  if (
    confirm(
      "🎫 Confirm your ticket purchase?\n\nYou will receive a confirmation email with your QR code ticket."
    )
  ) {
    try {
      const response = await fetch(`${API_URL}/tickets/buy/${ticketId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (data.success) {
        const message = `🎉 Ticket purchased successfully!\n\n📧 Confirmation email with QR code sent to your inbox!`;
        showAlert(message, "success");
        closeModal();

        // Refresh events to update ticket availability
        setTimeout(() => {
          loadAllEvents();
        }, 2000);
      } else {
        showAlert("❌ Error: " + data.message, "error");
      }
    } catch (error) {
      showAlert("❌ Connection error. Please try again.", "error");
    }
  }
}

async function viewMyTickets() {
  try {
    const response = await fetch(`${API_URL}/tickets/mine`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();

    if (data.success && data.data.length > 0) {
      // Fetch QR codes for each ticket
      const ticketsWithQR = await Promise.all(
        data.data.map(async (ticket) => {
          try {
            const qrResponse = await fetch(`${API_URL}/tickets/qr/${ticket._id}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            const qrData = await qrResponse.json();
            if (qrData.success) {
              return { ...ticket, qrCodeDataURL: qrData.data.qrCodeDataURL };
            }
          } catch (error) {
            console.error("Error fetching QR code for ticket:", ticket._id, error);
          }
          return ticket;
        })
      );
      showMyTicketsModal(ticketsWithQR);
    } else {
      showAlert(
        "You haven't purchased any tickets yet. Browse events to get started!",
        "info"
      );
    }
  } catch (error) {
    showAlert("Error loading your tickets. Please try again.", "error");
  }
}

function showMyTicketsModal(tickets) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content my-tickets-modal">
            <div class="modal-header">
                <h3>🎫 My Tickets (${tickets.length})</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>

            <div class="my-tickets-list">
                ${tickets
                  .map(
                    (ticket) => `
                    ${generateTicketCard(ticket)}
                `
                  )
                  .join("")}
            </div>

            <div class="modal-footer">
                <p><small>💡 Present your QR code at the event entrance for verification</small></p>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

function generateTicketCard(ticket) {
  const ticketTypeClass = `ticket-${ticket.ticketType}`;

  return `
    <div class="ticket-card ${ticketTypeClass}">
        <div class="ticket-header">
            <div>
                <div class="ticket-event-name">${ticket.eventId.name}</div>
                <div class="ticket-event-details">${getCategoryIcon(
                  ticket.eventId.category
                )} ${ticket.eventId.category} • ${ticket.eventId.genre}</div>
            </div>
            <div class="ticket-type-badge">${ticket.ticketType}</div>
        </div>

        <div class="ticket-body">
            <div class="ticket-info">
                <div class="ticket-price">${ticket.price}</div>
                <div class="ticket-date">Purchased: ${new Date(
                  ticket.createdAt
                ).toLocaleDateString()}</div>
            </div>

            <div class="ticket-qr-section">
                ${ticket.qrCodeDataURL ?
                  `<img src="${ticket.qrCodeDataURL}" alt="QR Code" class="ticket-qr-code" />` :
                  `<div class="ticket-qr-placeholder">📱</div>`
                }
                <div class="ticket-number">#${
                  ticket.ticketNumber || "N/A"
                }</div>
            </div>
        </div>

        <div class="ticket-footer">
            <div>EventHub</div>
            <div>Valid for Entry</div>
        </div>
    </div>
  `;
}

function showEventsLoading(show) {
  const loading = document.getElementById("eventsLoading");
  const container = document.getElementById("eventsContainer");
  const noEventsMsg = document.getElementById("noEventsMessage");

  if (show) {
    loading.style.display = "block";
    container.style.display = "none";
    noEventsMsg.style.display = "none";
  } else {
    loading.style.display = "none";
  }
}

function showNoEventsMessage() {
  const loading = document.getElementById("eventsLoading");
  const container = document.getElementById("eventsContainer");
  const noEventsMsg = document.getElementById("noEventsMessage");

  loading.style.display = "none";
  container.style.display = "none";
  noEventsMsg.style.display = "block";
}

function showEventsError() {
  const container = document.getElementById("eventsContainer");
  const loading = document.getElementById("eventsLoading");
  const noEventsMsg = document.getElementById("noEventsMessage");

  loading.style.display = "none";
  container.style.display = "none";
  noEventsMsg.innerHTML = `
        <div class="empty-state error-state">
            <h3>⚠️ Connection Error</h3>
            <p>Unable to load events. Please check your connection and try again.</p>
            <button class="btn btn-primary" onclick="loadAllEvents()">Retry</button>
        </div>
    `;
  noEventsMsg.style.display = "block";
}

// Event listeners for search functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener for Enter key on search input
  setTimeout(() => {
    const searchInput = document.getElementById("eventSearch");
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          searchEvents();
        }
      });
    }
  }, 1000);
});
