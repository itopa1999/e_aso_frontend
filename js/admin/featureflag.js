const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Customers data");

const searchInput = document.getElementById('flags-search');
const searchButton = document.getElementById('search-button');
const flagsContainer = document.getElementById('flags-container');
const flagsLoader = document.getElementById('flags-loader');
const emptyState = document.getElementById('empty-state');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFeatureFlags();

    searchButton.addEventListener('click', function() {
        loadFeatureFlags();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadFeatureFlags();
        }
    });
});

function buildQueryParams() {
    const params = new URLSearchParams();
    
    if (searchInput.value.trim()) {
        params.append('search', searchInput.value.trim());
    }
    
    return params.toString();
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Format date to readable format
function formatReadableDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Toggle user list visibility
function toggleUsersList(flagId) {
    const usersSection = document.getElementById(`users-${flagId}`);
    const viewButton = document.querySelector(`[data-flag-id="${flagId}"]`);
    
    if (usersSection.classList.contains('expanded')) {
        usersSection.classList.remove('expanded');
        viewButton.innerHTML = '<i class="fas fa-eye"></i> View Users';
    } else {
        usersSection.classList.add('expanded');
        viewButton.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Users';
    }
}

// Toggle feature flag status
function toggleFlagStatus(flagId, currentStatus) {
    const newStatus = !currentStatus;
    const toggleElement = document.querySelector(`[data-toggle-id="${flagId}"]`);

    toggleElement.checked = newStatus;

    console.log(`Toggling flag ${flagId} to ${newStatus}`);
}

// Load feature flags from API
function loadFeatureFlags() {
    // Show loader
    flagsLoader.style.display = 'flex';
    flagsContainer.innerHTML = '';
    flagsContainer.appendChild(flagsLoader);
    emptyState.style.display = 'none';
    
    // Build query parameters
    const queryParams = buildQueryParams();
    
    fetch(`${ADMIN_URL}/feature-flags/?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        processFlagsResponse(data);
    })
    .catch(error => {
        console.error('Error loading feature flags:', error);
        flagsLoader.style.display = 'none';
        emptyState.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error Loading Feature Flags</h3>
            <p>There was a problem loading the feature flags. Please try again.</p>
        `;
        emptyState.style.display = 'block';
    });
        
}

// Process the feature flags response
function processFlagsResponse(response) {
    // Hide loader
    flagsLoader.style.display = 'none';
    
    // Extract flags data
    const flags = response.data;
    
    // Check if we have flags
    if (flags.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    // Render flags
    renderFeatureFlags(flags);
}

// Render feature flags
function renderFeatureFlags(flags) {
    flagsContainer.innerHTML = '';
    
    flags.forEach(flag => {
        const flagCard = document.createElement('div');
        flagCard.className = 'flag-card';
        
        flagCard.innerHTML = `
            <div class="flag-header">
                <div class="flag-info">
                    <h3 class="flag-name">${flag.name}</h3>
                    <p class="flag-description">${flag.description || 'No description provided'}</p>
                    <div class="flag-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Created: ${formatReadableDate(flag.created_at)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>Users: ${flag.users.length}</span>
                        </div>
                        ${flag.start_date ? `
                        <div class="meta-item">
                            <i class="fas fa-play"></i>
                            <span>Start: ${formatReadableDate(flag.start_date)}</span>
                        </div>` : ''}
                        ${flag.end_date ? `
                        <div class="meta-item">
                            <i class="fas fa-stop"></i>
                            <span>End: ${formatReadableDate(flag.end_date)}</span>
                        </div>` : ''}
                        ${flag.discount_percent !== null ? `
                        <div class="meta-item">
                            <i class="fas fa-percent"></i>
                            <span>Discount: ${flag.discount_percent}%</span>
                        </div>` : ''}
                        ${flag.count !== null ? `
                        <div class="meta-item">
                            <i class="fas fa-hashtag"></i>
                            <span>Count: ${flag.count}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="flag-actions">
                    <div class="toggle-container">
                        <span class="toggle-label">${flag.is_enabled ? 'Enabled' : 'Disabled'}</span>
                        <label class="toggle-switch">
                            <input type="checkbox" data-toggle-id="${flag.id}" ${flag.is_enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <button class="action-btn view-users-btn" data-flag-id="${flag.id}">
                        <i class="fas fa-eye"></i> View Users
                    </button>
                    <button class="action-btn edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            
            <div class="users-section" id="users-${flag.id}">
                <h4 class="users-title">
                    <i class="fas fa-users"></i>
                    Users with this flag (${flag.user_first_names.length})
                </h4>
                ${flag.user_first_names.length > 0 ? `
                    <div class="users-list">
                        ${flag.user_first_names.map(user => `
                            <div class="user-item">
                                <div class="user-avatar">${getInitials(user)}</div>
                                <span class="user-name">${user}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-users">
                        <i class="fas fa-user-slash"></i>
                        <p>No users assigned to this feature flag</p>
                    </div>
                `}
            </div>
        `;
        
        flagsContainer.appendChild(flagCard);
        
        // Add event listeners for this flag
        const toggleElement = flagCard.querySelector(`[data-toggle-id="${flag.id}"]`);
        const viewButton = flagCard.querySelector(`[data-flag-id="${flag.id}"]`);
        
        toggleElement.addEventListener('change', function() {
            toggleFlagStatus(flag.id, flag.is_enabled);
        });
        
        viewButton.addEventListener('click', function() {
            toggleUsersList(flag.id);
        });
    });
}

// Simulate preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
    }, 1500);
});

hidePreloader();