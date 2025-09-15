// Admin Dashboard Functions

async function loadAdminContent(content) {
  content.innerHTML = `
        <div class="admin-header">
            <h2>🛡️ Admin Dashboard</h2>
            <p>System-wide management and analytics</p>
        </div>

        <!-- System Statistics -->
        <div class="admin-stats-grid">
            <div class="admin-stat-card users-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalAttendees">--</div>
                    <div class="stat-label">Total Attendees</div>
                </div>
            </div>
            
            <div class="admin-stat-card organizers-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalOrganizers">--</div>
                    <div class="stat-label">Total Organizers</div>
                </div>
            </div>
            
            <div class="admin-stat-card tickets-card">
                <div class="stat-icon">🎫</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalTickets">--</div>
                    <div class="stat-label">Total Tickets</div>
                    <div class="stat-subtext" id="ticketsBreakdown">--</div>
                </div>
            </div>
            
            <div class="admin-stat-card events-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalSystemEvents">--</div>
                    <div class="stat-label">Total Events</div>
                </div>
            </div>
        </div>

        <!-- Management Sections -->
        <div class="admin-management-tabs">
        <button class="tab-btn active" onclick="showTab('events')">📅 Events Management</button>
        <button class="tab-btn" onclick="showTab('analytics')">📊 Analytics</button>
        <button class="tab-btn" onclick="showTab('users')">👥 User Management</button>
    </div>

    <!-- Events Management Tab -->
    <div id="eventsTab" class="tab-content active">
            <div class="tab-header">
                <h3>📅 System Events Management</h3>
                <div class="search-controls">
                    <input type="text" id="adminEventsSearch" placeholder="🔍 Search events..." onkeyup="searchAdminEvents()">
                    <select id="adminCategoryFilter" onchange="filterAdminEvents()">
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
                </div>
            </div>
            
            <div class="loading" id="adminEventsLoading">
                <div class="spinner"></div>
                <p>Loading system events...</p>
            </div>
            
            <div id="adminEventsContainer" class="events-grid" style="display: none;">
                <!-- Events will be loaded here -->
            </div>
    </div>

    <!-- Analytics Tab -->
    <div id="analyticsTab" class="tab-content">
        <div class="tab-header">
            <h3>📊 Platform Analytics</h3>
        </div>
        
        <div class="analytics-content">
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>📈 Events by Category</h4>
                    <div id="categoryChart" class="chart-container">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4>💰 Revenue Overview</h4>
                    <div id="revenueChart" class="chart-container">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4>🎫 Ticket Sales Status</h4>
                    <div id="ticketChart" class="chart-container">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4>📅 Recent Activity</h4>
                    <div id="recentActivity" class="activity-list">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- User Management Tab -->
    <div id="usersTab" class="tab-content">
        <div class="tab-header">
            <h3>👥 User Management</h3>
            <div class="user-management-tabs">
                <button class="tab-btn active" onclick="showUserManagementTab('attendees')">Attendees</button>
                <button class="tab-btn" onclick="showUserManagementTab('organizers')">Organizers</button>
            </div>
            <div class="search-controls">
                <input type="text" id="userSearchInput" placeholder="🔍 Search users..." onkeyup="searchUsers()">
            </div>
        </div>
        <div id="attendeesSection" class="user-list-section active">
            <div id="attendeesList" class="user-list">
                <!-- Attendees will be loaded here -->
            </div>
        </div>
        <div id="organizersSection" class="user-list-section">
            <div id="organizersList" class="user-list">
                <!-- Organizers will be loaded here -->
            </div>
        </div>
    </div>
    `;

  // Load initial data
  await loadAdminStats();
  await loadAllSystemEvents();
}

async function loadAdminStats() {
  try {
    // Load attendees count
    const attendeesResponse = await fetch(`${API_URL}/admin/attendees`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const attendeesData = await attendeesResponse.json();
    if (attendeesData.success) {
      document.getElementById("totalAttendees").textContent =
        attendeesData.data.totalAttendees;
    }

    // Load organizers count
    const organizersResponse = await fetch(`${API_URL}/admin/organizers`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const organizersData = await organizersResponse.json();
    if (organizersData.success) {
      document.getElementById("totalOrganizers").textContent =
        organizersData.data.totalOrganizers;
    }

    // Load tickets count
    const ticketsResponse = await fetch(`${API_URL}/admin/tickets`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const ticketsData = await ticketsResponse.json();
    if (ticketsData.success) {
      document.getElementById("totalTickets").textContent =
        ticketsData.data.totalTickets;
      document.getElementById(
        "ticketsBreakdown"
      ).textContent = `${ticketsData.data.soldTickets} sold • ${ticketsData.data.availableTickets} available`;
    }

    // Load events count
    const eventsResponse = await fetch(`${API_URL}/events`);
    const eventsData = await eventsResponse.json();
    if (eventsData.success) {
      document.getElementById("totalSystemEvents").textContent =
        eventsData.data.length;
    }
  } catch (error) {
    console.log("Error loading admin stats:", error);
  }
}

async function loadAllSystemEvents() {
  try {
    showAdminEventsLoading(true);
    const response = await fetch(`${API_URL}/events`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      displayAdminEvents(data.data);
    } else {
      showNoAdminEventsMessage();
    }
  } catch (error) {
    showAdminEventsError();
  }
}

function displayAdminEvents(events) {
  const container = document.getElementById("adminEventsContainer");
  const loading = document.getElementById("adminEventsLoading");

  loading.style.display = "none";
  container.style.display = "grid";

  container.innerHTML = events
    .map(
      (event) => `
        <div class="event-card admin-card">
            <div class="event-category">
                <span class="category-badge category-${
                  event.category
                }">${getCategoryIcon(event.category)} ${event.category}</span>
            </div>
            
            <h3>${event.name}</h3>
            <p class="event-genre"><strong>Genre:</strong> ${event.genre}</p>
            <p class="event-organizer"><strong>Organizer:</strong> ${
              event.organizerId?.name || "Unknown"
            }</p>
            <p class="event-description">${
              event.description.length > 100
                ? event.description.substring(0, 100) + "..."
                : event.description
            }</p>
            
            <div class="event-price">${event.price}</div>
            <div class="event-date">Created: ${new Date(
              event.createdAt
            ).toLocaleDateString()}</div>
            
            <div class="admin-actions">
                <button class="btn btn-info btn-small" onclick="viewEventTicketsAdmin('${
                  event._id
                }')">
                    👁️ View Tickets
                </button>
                <button class="btn btn-danger btn-small" onclick="adminDeleteEvent('${
                  event._id
                }')">
                    🗑️ Delete Event
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

async function searchAdminEvents() {
  const searchTerm = document.getElementById("adminEventsSearch").value.trim();
  const category = document.getElementById("adminCategoryFilter").value;

  let queryParams = new URLSearchParams();

  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  if (category && category !== "all") {
    queryParams.append("category", category);
  }

  try {
    showAdminEventsLoading(true);
    const response = await fetch(`${API_URL}/events?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      displayAdminEvents(data.data);
    } else {
      showNoAdminEventsMessage();
    }
  } catch (error) {
    showAdminEventsError();
  }
}

function filterAdminEvents() {
  searchAdminEvents();
}

async function adminDeleteEvent(eventId) {
  if (
    confirm(
      "⚠️ ADMIN ACTION: Delete this event?\n\nThis will permanently delete the event and all associated tickets. This action cannot be undone."
    )
  ) {
    try {
      const response = await fetch(`${API_URL}/admin/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (data.success) {
        showAlert("🗑️ Event deleted successfully by admin!", "success");
        loadAllSystemEvents();
        loadAdminStats();
      } else {
        showAlert("❌ Error: " + data.message, "error");
      }
    } catch (error) {
      showAlert("❌ Connection error. Please try again.", "error");
    }
  }
}

async function viewEventTicketsAdmin(eventId) {
  try {
    const eventResponse = await fetch(`${API_URL}/events/${eventId}`);
    const eventData = await eventResponse.json();

    const ticketsResponse = await fetch(`${API_URL}/tickets/event/${eventId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const ticketsData = await ticketsResponse.json();

    if (eventData.success) {
      showAdminEventTicketsModal(
        eventData.data,
        ticketsData.success ? ticketsData.data : []
      );
    }
  } catch (error) {
    showAlert("Error loading event tickets", "error");
  }
}

function showAdminEventTicketsModal(event, tickets) {
  const soldTickets = tickets.filter((t) => !t.isAvailable);
  const availableTickets = tickets.filter((t) => t.isAvailable);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content admin-tickets-modal">
            <div class="modal-header">
                <h3>🎫 Event Tickets - ${event.name}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            
            <div class="admin-tickets-content">
                <div class="tickets-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Tickets:</span>
                        <span class="summary-value">${tickets.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Sold:</span>
                        <span class="summary-value sold">${
                          soldTickets.length
                        }</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Available:</span>
                        <span class="summary-value available">${
                          availableTickets.length
                        }</span>
                    </div>
                </div>
                
                ${
                  tickets.length > 0
                    ? `
                    <div class="tickets-table">
                        <div class="table-header">
                            <span>Type</span>
                            <span>Price</span>
                            <span>Status</span>
                            <span>Purchaser</span>
                            <span>Purchase Date</span>
                        </div>
                        ${tickets
                          .map(
                            (ticket) => `
                            <div class="table-row">
                                <span class="ticket-type-badge">${ticket.ticketType.toUpperCase()}</span>
                                <span>${ticket.price}</span>
                                <span class="status-badge ${
                                  ticket.isAvailable ? "available" : "sold"
                                }">
                                    ${ticket.isAvailable ? "Available" : "Sold"}
                                </span>
                                <span>${ticket.attendeeId?.name || "N/A"}</span>
                                <span>${
                                  ticket.isAvailable
                                    ? "N/A"
                                    : new Date(
                                        ticket.updatedAt
                                      ).toLocaleDateString()
                                }</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : "<p>No tickets created for this event.</p>"
                }
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

function showTab(tabName) {
  // Remove active class from all tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to selected tab
  event.target.classList.add("active");
  document.getElementById(tabName + "Tab").classList.add("active");

  // Load content based on tab
  if (tabName === "analytics") {
    loadAnalytics();
  } else if (tabName === "users") {
    loadUsers();
  }
}



function loadAnalytics() {
  // Load analytics charts and data
  document.getElementById("categoryChart").innerHTML = `
        <div class="simple-chart">
            <div class="chart-item">
                <span>Music</span>
                <div class="bar" style="width: 80%;">80%</div>
            </div>
            <div class="chart-item">
                <span>Sports</span>
                <div class="bar" style="width: 60%;">60%</div>
            </div>
            <div class="chart-item">
                <span>Tech</span>
                <div class="bar" style="width: 40%;">40%</div>
            </div>
        </div>
    `;

  document.getElementById("revenueChart").innerHTML = `
        <div class="revenue-summary">
            <div class="revenue-item">
                <span class="revenue-label">Total Revenue:</span>
                <span class="revenue-value">$12,345</span>
            </div>
            <div class="revenue-item">
                <span class="revenue-label">This Month:</span>
                <span class="revenue-value">$3,456</span>
            </div>
            <div class="revenue-item">
                <span class="revenue-label">Average per Event:</span>
                <span class="revenue-value">$245</span>
            </div>
        </div>
    `;

  document.getElementById("ticketChart").innerHTML = `
        <div class="ticket-stats">
            <div class="ticket-stat">
                <div class="stat-circle sold">75%</div>
                <span>Tickets Sold</span>
            </div>
            <div class="ticket-stat">
                <div class="stat-circle available">25%</div>
                <span>Available</span>
            </div>
        </div>
    `;

  document.getElementById("recentActivity").innerHTML = `
        <div class="activity-item">
            <span class="activity-icon">🎫</span>
            <span class="activity-text">New ticket purchased for "Concert Night"</span>
            <span class="activity-time">2 min ago</span>
        </div>
        <div class="activity-item">
            <span class="activity-icon">📅</span>
            <span class="activity-text">New event "Tech Summit" created</span>
            <span class="activity-time">15 min ago</span>
        </div>
        <div class="activity-item">
            <span class="activity-icon">👥</span>
            <span class="activity-text">New user registered as organizer</span>
            <span class="activity-time">1 hour ago</span>
        </div>
    `;
}

async function loadUsers() {
  try {
    // Load attendees
    const attendeesResponse = await fetch(`${API_URL}/admin/attendees/list`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const attendeesData = await attendeesResponse.json();
    if (attendeesData.success) {
      displayUsers(attendeesData.data, "attendeesList");
    }

    // Load organizers
    const organizersResponse = await fetch(`${API_URL}/admin/organizers/list`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const organizersData = await organizersResponse.json();
    if (organizersData.success) {
      displayUsers(organizersData.data, "organizersList");
    }
  } catch (error) {
    console.log("Error loading users:", error);
  }
}

function displayUsers(users, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = "<p>No users found.</p>";
    return;
  }

  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.className = "user-card admin-card";
    userDiv.innerHTML = `
      <div class="user-info">
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="user-actions">
        <button class="btn btn-danger btn-small" onclick="deleteUser('${user._id}', '${containerId}')">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(userDiv);
  });
}

function showUserManagementTab(tabName) {
  // Remove active class from all user management tabs
  document
    .querySelectorAll(".user-management-tabs .tab-btn")
    .forEach((btn) => btn.classList.remove("active"));

  // Remove active class from all user list sections
  document
    .querySelectorAll(".user-list-section")
    .forEach((section) => section.classList.remove("active"));

  // Add active class to selected tab and section
  event.target.classList.add("active");
  document.getElementById(tabName + "Section").classList.add("active");
}

async function deleteUser(userId, containerId) {
  if (confirm("⚠️ ADMIN ACTION: Delete this user? This action cannot be undone.")) {
    try {
      let endpoint = "";
      if (containerId === "attendeesList") {
        endpoint = `${API_URL}/admin/attendees/${userId}`;
      } else if (containerId === "organizersList") {
        endpoint = `${API_URL}/admin/organizers/${userId}`;
      } else {
        alert("Unknown user type.");
        return;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (data.success) {
        alert("🗑️ User deleted successfully!");
        loadUsers();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("❌ Connection error. Please try again.");
    }
  }
}

function searchUsers() {
  const searchTerm = document.getElementById("userSearchInput").value.toLowerCase();

  ["attendeesList", "organizersList"].forEach((containerId) => {
    const container = document.getElementById(containerId);
    const userCards = container.querySelectorAll(".user-card");

    userCards.forEach((card) => {
      const name = card.querySelector(".user-info p strong").nextSibling.textContent.toLowerCase();
      const email = card.querySelector(".user-info p:nth-child(2)").textContent.toLowerCase();

      if (name.includes(searchTerm) || email.includes(searchTerm)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
}



function showAdminEventsLoading(show) {
  const loading = document.getElementById("adminEventsLoading");
  const container = document.getElementById("adminEventsContainer");

  if (show) {
    loading.style.display = "block";
    container.style.display = "none";
  } else {
    loading.style.display = "none";
  }
}

function showNoAdminEventsMessage() {
  const container = document.getElementById("adminEventsContainer");
  container.innerHTML = `
        <div class="empty-state">
            <h3>📅 No events found</h3>
            <p>No events match your search criteria</p>
        </div>
    `;
  container.style.display = "block";
}

function showAdminEventsError() {
  const container = document.getElementById("adminEventsContainer");
  container.innerHTML = `
        <div class="empty-state error-state">
            <h3>⚠️ Connection Error</h3>
            <p>Unable to load events. Please try again.</p>
            <button class="btn btn-primary" onclick="loadAllSystemEvents()">Retry</button>
        </div>
    `;
  container.style.display = "block";
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
