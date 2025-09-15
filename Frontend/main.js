
// Main Application Controller

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  if (authToken && localStorage.getItem("user")) {
    currentUser = JSON.parse(localStorage.getItem("user"));
    showDashboard();
  } else {
    // Setup form event listeners
    setupFormListeners();
    
    // Initialize with attendee role
    switchRole('attendee');
  }
});

// Setup Form Event Listeners
function setupFormListeners() {
  // Login Form Handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Register Form Handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}

// Dashboard Functions
function showDashboard() {
  document.body.style.background = "#f8f9fa";
  document.getElementById("authContainer").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userInfo").textContent = `Welcome, ${currentUser.name} (${currentUser.role})`;

  loadDashboardContent();
}

function loadDashboardContent() {
  const content = document.getElementById("dashboardContent");

  switch (currentUser.role) {
    case "attendee":
      loadAttendeeContent(content);
      break;
    case "organizer":
      loadOrganizerContent(content);
      break;
    case "admin":
      loadAdminContent(content);
      break;
    default:
      content.innerHTML = "<p>Unknown user role</p>";
  }
}

// Utility Functions
function showAlert(message, type = "info") {
  // Remove any existing alerts
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
    `;

  // Set background color based on type
  switch (type) {
    case "success":
      alert.style.background = "linear-gradient(135deg, #28a745, #20c997)";
      break;
    case "error":
      alert.style.background = "linear-gradient(135deg, #dc3545, #c82333)";
      break;
    case "info":
      alert.style.background = "linear-gradient(135deg, #17a2b8, #138496)";
      break;
    default:
      alert.style.background = "linear-gradient(135deg, #6c757d, #545b62)";
  }

  alert.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">
                ×
            </button>
        </div>
    `;

  document.body.appendChild(alert);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert && alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

function closeModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
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

// Add CSS animations for alerts
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .alert {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
    }
    
    .alert:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
    
    /* Ticket list styles for modals */
    .ticket-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .ticket-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
    }

    .ticket-item:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transform: translateY(-1px);
    }

    .ticket-info {
        flex: 1;
    }

    .ticket-type {
        font-weight: 700;
        font-size: 1.1rem;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
    }

    .ticket-price {
        font-size: 1.3rem;
        font-weight: bold;
        color: #28a745;
        margin: 8px 0;
    }

    .ticket-features {
        color: #666;
        font-size: 0.9rem;
        margin-top: 8px;
    }
`;
document.head.appendChild(style);

// Add click to close alerts
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("alert")) {
    e.target.remove();
  }
});

// Handle escape key to close modals
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Global error handler for fetch requests
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);
  showAlert("An unexpected error occurred. Please try again.", "error");
});

// Network status monitoring
window.addEventListener("online", function () {
  showAlert("Connection restored!", "success");
});

window.addEventListener("offline", function () {
  showAlert("Connection lost. Please check your internet connection.", "error");
});

// Auto-logout on token expiration
function checkTokenExpiration() {
  if (authToken && currentUser) {
    try {
      // Basic token structure check (JWT tokens have 3 parts)
      const tokenParts = authToken.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          showAlert("Your session has expired. Please login again.", "info");
          logout();
        }
      }
    } catch (error) {
      console.log("Token validation error:", error);
    }
  }
}

// Check token expiration every 5 minutes
setInterval(checkTokenExpiration, 5 * 60 * 1000);

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Utility function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Utility function to debounce search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create debounced search functions
const debouncedSearchEvents = debounce(() => {
  if (typeof searchEvents === "function") searchEvents();
}, 300);

const debouncedSearchAdminEvents = debounce(() => {
  if (typeof searchAdminEvents === "function") searchAdminEvents();
}, 300);

const debouncedSearchMyEvents = debounce(() => {
  if (typeof searchMyEvents === "function") searchMyEvents();
}, 300);

// Accessibility improvements
document.addEventListener("keydown", function (e) {
  // Add keyboard navigation for modals
  if (e.key === "Tab" && document.querySelector(".modal-overlay")) {
    // Trap focus within modal
    const modal = document.querySelector(".modal-content");
    const focusableElements = modal.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
});

// Initialize tooltips for accessibility
function initializeTooltips() {
  const elementsWithTooltips = document.querySelectorAll("[title]");
  elementsWithTooltips.forEach((element) => {
    element.setAttribute("aria-label", element.getAttribute("title"));
  });
}

// Call tooltip initialization after DOM updates
const tooltipObserver = new MutationObserver(() => {
  initializeTooltips();
});

tooltipObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial tooltip setup
initializeTooltips();

console.log("EventHub application initialized successfully!");