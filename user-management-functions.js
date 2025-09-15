function displayUsers(users) {
  const container = document.getElementById('usersContainer');
  const loading = document.getElementById('usersLoading');

  loading.style.display = 'none';
  container.style.display = 'block';

  if (users.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>👥 No users found</h3>
        <p>No users match the current filter</p>
      </div>
    `;
    return;
  }

  container.innerHTML = users
    .map(
      (user) => `
      <div class="user-card">
        <div class="user-info">
          <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <h4>${user.name}</h4>
            <p class="user-email">${user.email}</p>
            <span class="user-role role-${user.role}">${user.role}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn btn-danger btn-small" onclick="adminDeleteUser('${user._id}', '${user.role}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

async function adminDeleteUser(userId, role) {
  const roleText = role.charAt(0).toUpperCase() + role.slice(1);
  const confirmMessage = `⚠️ ADMIN ACTION: Delete this ${role}?\n\n${
    role === 'attendee'
      ? 'This will make all their purchased tickets available again.'
      : role === 'organizer'
      ? 'This will permanently delete all their events and associated tickets.'
      : 'This will remove admin privileges.'
  }\n\nThis action cannot be undone.`;

  if (confirm(confirmMessage)) {
    try {
      const endpoint = `/admin/${role}s/${userId}`;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (data.success) {
        showAlert(`🗑️ ${roleText} deleted successfully!`, 'success');
        loadUsersManagement(); // Reload users list
        loadAdminStats(); // Update stats
      } else {
        showAlert('❌ Error: ' + data.message, 'error');
      }
    } catch (error) {
      showAlert('❌ Connection error. Please try again.', 'error');
    }
  }
}

function showUsersLoading(show) {
  const loading = document.getElementById('usersLoading');
  const container = document.getElementById('usersContainer');

  if (show) {
    loading.style.display = 'block';
    container.style.display = 'none';
  } else {
    loading.style.display = 'none';
  }
}

function showUsersError() {
  const container = document.getElementById('usersContainer');
  const loading = document.getElementById('usersLoading');

  loading.style.display = 'none';
  container.style.display = 'block';
  container.innerHTML = `
    <div class="empty-state error-state">
      <h3>⚠️ Connection Error</h3>
      <p>Unable to load users. Please check your connection and try again.</p>
      <button class="btn btn-primary" onclick="loadUsersManagement()">Retry</button>
    </div>
  `;
}
