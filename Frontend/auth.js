// Authentication JavaScript
const API_URL = "http://localhost:3000/api";
let currentUser = null;
let authToken = localStorage.getItem("token");

// Role content data
const roleContent = {
  attendee: {
    theme: "attendee-theme",
    text: "Your gateway to amazing events. Discover and attend the best events in your area.",
    features: [
      "Browse events by category and location",
      "Get instant QR code tickets",
      "Receive event updates and reminders",
      "Build your event history",
    ],
  },
  organizer: {
    theme: "organizer-theme",
    text: "Create and manage successful events. Build memorable experiences for your audience.",
    features: [
      "Create and customize your events",
      "Manage ticket sales and attendees",
      "Track event performance",
      "Build your organizer reputation",
    ],
  },
  admin: {
    theme: "admin-theme",
    text: "Manage the EventHub platform. Oversee the entire event ecosystem.",
    features: [
      "Oversee platform operations",
      "Manage users and organizers",
      "Monitor event quality",
      "Access advanced analytics",
    ],
  },
};

// Role switching functionality
function switchRole(role) {
  // Update active tab
  document.querySelectorAll(".role-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.role === role);
  });

  // Show/hide role-specific fields
  document.querySelectorAll(".role-specific-fields").forEach((field) => {
    field.classList.toggle(
      "active",
      field.classList.contains(`${role}-fields`)
    );
  });

  // Update hidden role input
  document.getElementById("registerRole").value = role;

  // Update welcome section
  const welcomeSection = document.getElementById("welcomeSection");
  const welcomeText = document.getElementById("welcomeText");
  const welcomeFeatures = document.getElementById("welcomeFeatures");
  const content = roleContent[role];

  welcomeSection.className = `welcome-section ${content.theme}`;
  welcomeText.textContent = content.text;
  welcomeFeatures.innerHTML = content.features
    .map((feature) => `<li>${feature}</li>`)
    .join("");

  // Clear any validation errors when switching roles
  clearMessages();
}

// Authentication Functions
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    showLoading("loginForm");
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      currentUser = data.user;
      authToken = data.token;
      showDashboard();
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError("Connection error. Please check if the server is running.");
  } finally {
    hideLoading("loginForm");
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("registerRole").value;

  // Validate passwords match
  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  // Get role-specific data
  const roleData = { name, email, password, role };

  if (role === "organizer") {
    const organization = document.getElementById("organization").value;
    if (organization) {
      roleData.organization = organization;
    }
  } else if (role === "admin") {
    const employeeId = document.getElementById("employeeId").value;

    if (employeeId) {
      roleData.employeeId = employeeId;
    }
  }

  try {
    showLoading("registerForm");

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleData),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      currentUser = data.user;
      authToken = data.token;
      showSuccess(
        "Account created successfully! Check your email for a welcome message."
      );
      // Redirect immediately to dashboard after registration success
      showDashboard();
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError("Connection error. Please check if the server is running.");
  } finally {
    hideLoading("registerForm");
  }
}

// UI Toggle Functions
function showLogin() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  clearMessages();
}

function showRegister() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  clearMessages();
}

function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.style.display = "block";
  document.getElementById("successMessage").style.display = "none";
}

function showSuccess(message) {
  const successEl = document.getElementById("successMessage");
  successEl.textContent = message;
  successEl.style.display = "block";
  document.getElementById("errorMessage").style.display = "none";
}

function clearMessages() {
  document.getElementById("errorMessage").style.display = "none";
  document.getElementById("successMessage").style.display = "none";
}

function showLoading(formId) {
  const form = document.getElementById(formId);
  const submitBtn = form.querySelector(".submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";
}

function hideLoading(formId) {
  const form = document.getElementById(formId);
  const submitBtn = form.querySelector(".submit-btn");
  submitBtn.disabled = false;
  submitBtn.textContent =
    formId === "loginForm" ? "Login to EventHub" : "Create Account";
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentUser = null;
    authToken = null;

    // Reset body background
    document.body.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

    // Show auth container
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("authContainer").style.display = "flex";

    // Reset forms
    document.getElementById("loginForm").reset();
    document.getElementById("registerForm").reset();
    clearMessages();

    // Show login form by default
    document
      .querySelectorAll(".toggle-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(".toggle-btn").classList.add("active");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");

    // Reset to attendee role
    switchRole("attendee");
  }
}
