// Organizer Dashboard Functions

async function loadOrganizerContent(content) {
  content.innerHTML = `
        <div class="organizer-header">
            <div class="header-content">
                <h2>🎯 Organizer Dashboard</h2>
                <p>Create and manage your events</p>
            </div>
            <button class="btn btn-primary btn-large" onclick="showCreateEventForm()">
                ➕ Create New Event
            </button>
        </div>

        <!-- Quick Stats -->
        <div class="organizer-stats" id="organizerStats">
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalEvents">--</div>
                    <div class="stat-label">Total Events</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎫</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalTicketsSold">--</div>
                    <div class="stat-label">Tickets Sold</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalRevenue">$--</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>
        </div>

        <!-- Create Event Form -->
        <div id="createEventForm" class="form-container hidden">
            <h3>✨ Create New Event</h3>
            <form id="eventForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventName">Event Name *</label>
                        <input type="text" id="eventName" required maxlength="100" placeholder="Enter event name">
                    </div>
                    <div class="form-group">
                        <label for="eventCategory">Category *</label>
                        <select id="eventCategory" required>
                            <option value="">Select Category</option>
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
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventGenre">Genre *</label>
                        <input type="text" id="eventGenre" required maxlength="50" placeholder="e.g., Rock Concert, Football Match, Tech Conference">
                    </div>
                    <div class="form-group">
                        <label for="eventPrice">Base Price ($) *</label>
                        <input type="number" id="eventPrice" required min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="eventDescription">Event Description *</label>
                    <textarea id="eventDescription" required maxlength="1000" placeholder="Describe your event in detail..." rows="4"></textarea>
                    <small class="char-counter"><span id="descriptionCounter">0</span>/1000 characters</small>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">🎉 Create Event</button>
                    <button type="button" class="btn btn-secondary" onclick="hideCreateEventForm()">Cancel</button>
                </div>
            </form>
        </div>

        <!-- My Events Section -->
        <div id="myEventsSection" style="margin-top: 40px;">
            <div class="section-header">
                <h3>📋 My Events</h3>
                <div class="section-actions">
                    <input type="text" id="myEventsSearch" placeholder="🔍 Search my events..." onkeyup="searchMyEvents()">
                </div>
            </div>
            
            <div class="loading" id="myEventsLoading">
                <div class="spinner"></div>
                <p>Loading your events...</p>
            </div>
            
            <div id="myEventsContainer" class="events-grid" style="display: none;">
                <!-- Events will be loaded here -->
            </div>
            
            <div id="noMyEventsMessage" class="no-events-message" style="display: none;">
                <div class="empty-state">
                    <h3>🎪 No events created yet</h3>
                    <p>Create your first event to get started!</p>
                    <button class="btn btn-primary" onclick="showCreateEventForm()">Create Event</button>
                </div>
            </div>
        </div>
    `;

  // Load organizer's events and stats
  await loadOrganizerEvents();
  await loadOrganizerStats();

  // Setup event form handler
  document
    .getElementById("eventForm")
    .addEventListener("submit", handleCreateEvent);

  // Setup character counter for description
  document
    .getElementById("eventDescription")
    .addEventListener("input", updateDescriptionCounter);
}

async function loadOrganizerEvents() {
  try {
    showMyEventsLoading(true);
    const response = await fetch(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();

    if (data.success) {
      // Filter events by current organizer
      const myEvents = data.data.filter(
        (event) =>
          event.organizerId._id === currentUser.id ||
          event.organizerId === currentUser.id
      );

      if (myEvents.length > 0) {
        displayOrganizerEvents(myEvents);
      } else {
        showNoMyEventsMessage();
      }
    }
  } catch (error) {
    showMyEventsError();
  }
}

async function loadOrganizerStats() {
  try {
    // Get organizer's events for stats calculation
    const eventsResponse = await fetch(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const eventsData = await eventsResponse.json();

    if (eventsData.success) {
      const myEvents = eventsData.data.filter(
        (event) =>
          event.organizerId._id === currentUser.id ||
          event.organizerId === currentUser.id
      );

      // Update total events
      document.getElementById("totalEvents").textContent = myEvents.length;

      // Calculate tickets sold and revenue
      let totalTicketsSold = 0;
      let totalRevenue = 0;

      // Get tickets for each event
      for (const event of myEvents) {
        try {
          const ticketsResponse = await fetch(
            `${API_URL}/tickets/event/${event._id}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const ticketsData = await ticketsResponse.json();

          if (ticketsData.success) {
            const soldTickets = ticketsData.data.filter(
              (ticket) => !ticket.isAvailable
            );
            totalTicketsSold += soldTickets.length;
            totalRevenue += soldTickets.reduce(
              (sum, ticket) => sum + ticket.price,
              0
            );
          }
        } catch (error) {
          console.log("Error loading tickets for event:", event._id);
        }
      }

      document.getElementById("totalTicketsSold").textContent =
        totalTicketsSold;
      document.getElementById(
        "totalRevenue"
      ).textContent = `${totalRevenue.toFixed(2)}`;
    }
  } catch (error) {
    console.log("Error loading organizer stats:", error);
  }
}

function displayOrganizerEvents(events) {
  const container = document.getElementById("myEventsContainer");
  const loading = document.getElementById("myEventsLoading");
  const noEventsMsg = document.getElementById("noMyEventsMessage");

  loading.style.display = "none";
  noEventsMsg.style.display = "none";
  container.style.display = "grid";

  container.innerHTML = events
    .map(
      (event) => `
        <div class="event-card organizer-card">
            <div class="event-category">
                <span class="category-badge category-${
                  event.category
                }">${getCategoryIcon(event.category)} ${event.category}</span>
            </div>
            
            <h3>${event.name}</h3>
            <p class="event-genre"><strong>Genre:</strong> ${event.genre}</p>
            <p class="event-description">${
              event.description.length > 100
                ? event.description.substring(0, 100) + "..."
                : event.description
            }</p>
            
            <div class="event-price">${event.price}</div>
            <div class="event-date">Created: ${new Date(
              event.createdAt
            ).toLocaleDateString()}</div>
            
            <div class="event-actions">
                <button class="btn btn-primary" onclick="manageEventTickets('${
                  event._id
                }')">
                    🎫 Manage Tickets
                </button>
                <button class="btn btn-info" onclick="viewEventDetails('${
                  event._id
                }')">
                    👁️ View Details
                </button>
                <button class="btn btn-danger" onclick="deleteEvent('${
                  event._id
                }')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

async function handleCreateEvent(e) {
  e.preventDefault();

  const eventData = {
    name: document.getElementById("eventName").value,
    description: document.getElementById("eventDescription").value,
    genre: document.getElementById("eventGenre").value,
    category: document.getElementById("eventCategory").value,
    price: parseFloat(document.getElementById("eventPrice").value),
  };

  try {
    const submitBtn = e.target.querySelector(".btn-success");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Creating...";

    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("🎉 Event created successfully!", "success");
      document.getElementById("eventForm").reset();
      hideCreateEventForm();
      loadOrganizerEvents();
      loadOrganizerStats();
    } else {
      showAlert("❌ Error: " + data.message, "error");
    }
  } catch (error) {
    showAlert("❌ Connection error. Please try again.", "error");
  } finally {
    const submitBtn = e.target.querySelector(".btn-success");
    submitBtn.disabled = false;
    submitBtn.innerHTML = "🎉 Create Event";
  }
}

async function manageEventTickets(eventId) {
  try {
    // Get event details first
    const eventResponse = await fetch(`${API_URL}/events/${eventId}`);
    const eventData = await eventResponse.json();

    if (!eventData.success) {
      showAlert("Error loading event details", "error");
      return;
    }

    // Get existing tickets
    const ticketsResponse = await fetch(`${API_URL}/tickets/event/${eventId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const ticketsData = await ticketsResponse.json();

    showTicketManagementModal(
      eventData.data,
      ticketsData.success ? ticketsData.data : []
    );
  } catch (error) {
    showAlert("Error loading event tickets", "error");
  }
}

function showTicketManagementModal(event, tickets) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content ticket-management-modal">
            <div class="modal-header">
                <h3>🎫 Manage Tickets - ${event.name}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            
            <div class="ticket-management-content">
                <div class="create-ticket-section">
                    <h4>➕ Create New Ticket</h4>
                    <form id="createTicketForm" onsubmit="createTicketForEvent(event, '${
                      event._id
                    }')">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ticket Type</label>
                                <select id="newTicketType" required>
                                    <option value="">Select Type</option>
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="premium">Premium</option>
                                    <option value="early-bird">Early Bird</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Price ($)</label>
                                <input type="number" id="newTicketPrice" required min="0" step="0.01" placeholder="0.00">
                            </div>
                            <button type="submit" class="btn btn-success">Add Ticket</button>
                        </div>
                    </form>
                </div>
                
                <div class="existing-tickets-section">
                    <h4>📊 Existing Tickets (${tickets.length})</h4>
                    ${
                      tickets.length > 0
                        ? `
                        <div class="tickets-table">
                            ${tickets
                              .map(
                                (ticket) => `
                                <div class="ticket-row">
                                    <div class="ticket-info">
                                        <span class="ticket-type-badge">${ticket.ticketType.toUpperCase()}</span>
                                        <span class="ticket-price">${
                                          ticket.price
                                        }</span>
                                        <span class="ticket-status ${
                                          ticket.isAvailable
                                            ? "available"
                                            : "sold"
                                        }">
                                            ${
                                              ticket.isAvailable
                                                ? "✅ Available"
                                                : "❌ Sold"
                                            }
                                        </span>
                                    </div>
                                    ${
                                      ticket.isAvailable
                                        ? `
                                        <button class="btn btn-danger btn-small" onclick="deleteTicket('${ticket._id}')">
                                            Delete
                                        </button>
                                    `
                                        : `
                                        <span class="sold-info">Sold to: ${
                                          ticket.attendeeId?.name || "Unknown"
                                        }</span>
                                    `
                                    }
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `
                        : "<p>No tickets created yet.</p>"
                    }
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

async function createTicketForEvent(e, eventId) {
  e.preventDefault();

  const ticketType = document.getElementById("newTicketType").value;
  const price = document.getElementById("newTicketPrice").value;

  try {
    const response = await fetch(`${API_URL}/tickets/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ticketType: ticketType,
        price: parseFloat(price),
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("🎫 Ticket created successfully!", "success");
      closeModal();
      // Refresh the ticket management modal
      setTimeout(() => manageEventTickets(eventId), 1000);
    } else {
      showAlert("❌ Error: " + data.message, "error");
    }
  } catch (error) {
    showAlert("❌ Connection error. Please try again.", "error");
  }
}

async function viewEventDetails(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const data = await response.json();

    if (data.success) {
      showEventDetailsModal(data.data);
    }
  } catch (error) {
    showAlert("Error loading event details", "error");
  }
}

function showEventDetailsModal(event) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content event-details-modal">
            <div class="modal-header">
                <h3>📋 Event Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            
            <div class="event-details-content">
                <div class="detail-row">
                    <strong>Event Name:</strong>
                    <span>${event.name}</span>
                </div>
                <div class="detail-row">
                    <strong>Category:</strong>
                    <span class="category-badge category-${
                      event.category
                    }">${getCategoryIcon(event.category)} ${
    event.category
  }</span>
                </div>
                <div class="detail-row">
                    <strong>Genre:</strong>
                    <span>${event.genre}</span>
                </div>
                <div class="detail-row">
                    <strong>Base Price:</strong>
                    <span class="price">${event.price}</span>
                </div>
                <div class="detail-row">
                    <strong>Description:</strong>
                    <span>${event.description}</span>
                </div>
                <div class="detail-row">
                    <strong>Created:</strong>
                    <span>${new Date(event.createdAt).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <strong>Last Updated:</strong>
                    <span>${new Date(event.updatedAt).toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

async function deleteEvent(eventId) {
  if (
    confirm(
      "⚠️ Are you sure you want to delete this event?\n\nThis will also delete all associated tickets and cannot be undone."
    )
  ) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (data.success) {
        showAlert("🗑️ Event deleted successfully!", "success");
        loadOrganizerEvents();
        loadOrganizerStats();
      } else {
        showAlert("❌ Error: " + data.message, "error");
      }
    } catch (error) {
      showAlert("❌ Connection error. Please try again.", "error");
    }
  }
}

function searchMyEvents() {
  const searchTerm = document
    .getElementById("myEventsSearch")
    .value.toLowerCase();
  const eventCards = document.querySelectorAll(
    "#myEventsContainer .event-card"
  );

  eventCards.forEach((card) => {
    const eventName = card.querySelector("h3").textContent.toLowerCase();
    const eventDescription = card
      .querySelector(".event-description")
      .textContent.toLowerCase();
    const eventGenre = card
      .querySelector(".event-genre")
      .textContent.toLowerCase();

    if (
      eventName.includes(searchTerm) ||
      eventDescription.includes(searchTerm) ||
      eventGenre.includes(searchTerm)
    ) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function showCreateEventForm() {
  document.getElementById("createEventForm").classList.remove("hidden");
  document.getElementById("eventName").focus();
}

function hideCreateEventForm() {
  document.getElementById("createEventForm").classList.add("hidden");
  document.getElementById("eventForm").reset();
  updateDescriptionCounter();
}

function updateDescriptionCounter() {
  const textarea = document.getElementById("eventDescription");
  const counter = document.getElementById("descriptionCounter");
  if (textarea && counter) {
    counter.textContent = textarea.value.length;
  }
}

function showMyEventsLoading(show) {
  const loading = document.getElementById("myEventsLoading");
  const container = document.getElementById("myEventsContainer");
  const noEventsMsg = document.getElementById("noMyEventsMessage");

  if (show) {
    loading.style.display = "block";
    container.style.display = "none";
    noEventsMsg.style.display = "none";
  } else {
    loading.style.display = "none";
  }
}

function showNoMyEventsMessage() {
  const loading = document.getElementById("myEventsLoading");
  const container = document.getElementById("myEventsContainer");
  const noEventsMsg = document.getElementById("noMyEventsMessage");

  loading.style.display = "none";
  container.style.display = "none";
  noEventsMsg.style.display = "block";
}

function showMyEventsError() {
  const container = document.getElementById("myEventsContainer");
  const loading = document.getElementById("myEventsLoading");
  const noEventsMsg = document.getElementById("noMyEventsMessage");

  loading.style.display = "none";
  container.style.display = "none";
  noEventsMsg.innerHTML = `
        <div class="empty-state error-state">
            <h3>⚠️ Connection Error</h3>
            <p>Unable to load your events. Please check your connection and try again.</p>
            <button class="btn btn-primary" onclick="loadOrganizerEvents()">Retry</button>
        </div>
    `;
  noEventsMsg.style.display = "block";
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
