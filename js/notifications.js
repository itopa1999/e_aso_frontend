const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

// Notifications page specific functionality
let currentFilter = 'all';
let allNotifications = [];

hidePreloader()
  
function truncateLongText(text, maxLength = 100) {
    if (!text) return '';
    
    // Preserve line breaks but escape them for HTML display
    const lines = text.split('\n');
    let result = lines.join('\n');
    
    // Truncate if total length exceeds maxLength
    if (result.length > maxLength) {
        result = result.substring(0, maxLength) + '...';
    }
    
    return result;
}

async function loadPageNotifications() {
    try {
        const response = await fetch(`${ASO_URL}/notifications/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });
        const result = await response.json();
        
        if (result.is_success && result.data && result.data.results) {
            allNotifications = result.data.results;
        } else {
            console.error('Failed to load notifications:', result.message);
            allNotifications = [];
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        allNotifications = [];
    }
    
    renderNotifications();
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    
    // Filter notifications
    let filtered = allNotifications;
    if (currentFilter !== 'all') {
        filtered = allNotifications.filter(n => n.type === currentFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell"></i>
                <p>No ${currentFilter !== 'all' ? currentFilter : ''} notifications</p>
                <a href="index.html">Continue Shopping</a>
            </div>
        `;
        return;
    }

    const html = filtered.map(notif => {
        const typeIcon = getNotificationTypeIcon(notif.type);
        const typeLabel = getNotificationTypeLabel(notif.type);
        const truncatedMessage = truncateLongText(notif.message || '', 100);
        const truncatedHTML = truncatedMessage.replace(/\n/g, '<br>');
        const fullHTML = notif.message.replace(/\n/g, '<br>');
        
        return `
            <div class="notification-card ${notif.is_read ? '' : 'unread'} type-${notif.type}" data-id="${notif.id}" style="cursor: pointer;">
                <div class="notification-icon">${typeIcon}</div>
                <div class="notification-content">
                    <div class="notification-header-text">
                        <h3>${notif.title}</h3>
                        <span class="notification-badge">${typeLabel}</span>
                    </div>
                    <p class="notification-message" onclick="markAsRead(${notif.id}, event)" style="cursor: pointer;">
                        <span class="message-short" id="short-${notif.id}">${truncatedHTML}</span>
                        <span class="message-full" id="full-${notif.id}" style="display: none;">${fullHTML}</span>
                    </p>
                    <div class="notification-time">${formatTimeAgo(notif.created_at)}</div>
                    <div class="notification-actions">
                        <button class="btn-action btn-delete" onclick="event.stopPropagation(); pageDeleteNotification(${notif.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Delete a notification from the page
async function pageDeleteNotification(id) {
    // Show confirmation modal
    showDeleteConfirmation(id);
}

// Show delete confirmation modal
function showDeleteConfirmation(notificationId) {
    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.innerHTML = `
        <div class="dialog-box">
            <div class="dialog-header">
                <h3><i class="fas fa-trash"></i> Delete Notification</h3>
            </div>
            <div class="dialog-body">
                <p>Are you sure you want to delete this notification? This action cannot be undone.</p>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" id="cancelDelete">Cancel</button>
                <button class="btn btn-danger" id="confirmDelete">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Handle cancel
    document.getElementById('cancelDelete').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Handle confirm delete
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        overlay.remove();
        const success = await deleteNotificationAPI(notificationId);
        if (success) {
            allNotifications = allNotifications.filter(n => n.id !== notificationId);
            renderNotifications();
            showNotification('success', 'Success', 'Notification deleted successfully');
        } else {
            showNotification('error', 'Error', 'Failed to delete notification');
        }
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Mark a notification as read from the page
async function pageMarkAsRead(id) {
    const success = await markAsReadAPI(id);
    if (success) {
        const notif = allNotifications.find(n => n.id === id);
        if (notif) {
            notif.is_read = true;
            renderNotifications();
        }
    }
}

// Mark all notifications as read from the page
async function pageMarkAllAsRead() {
    const success = await markAllAsReadAPI();
    if (success) {
        allNotifications.forEach(n => n.is_read = true);
        renderNotifications();
    }
}

// Filter buttons
document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderNotifications();
    });
});

// Mark all read button
document.getElementById('markAllRead').addEventListener('click', pageMarkAllAsRead);

// Toggle message expand/collapse
function toggleMessage(event, id) {
    event.stopPropagation();
    const shortMsg = document.getElementById(`short-${id}`);
    const fullMsg = document.getElementById(`full-${id}`);
    
    if (fullMsg.style.display === 'none') {
        shortMsg.style.display = 'none';
        fullMsg.style.display = 'inline';
    } else {
        shortMsg.style.display = 'inline';
        fullMsg.style.display = 'none';
    }
}

// Wrapper: mark as read and toggle message expand
async function markAsRead(notificationId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Find the notification
    const notif = allNotifications.find(n => n.id === notificationId);
    
    // Toggle to show full message
    const shortMsg = document.getElementById(`short-${notificationId}`);
    const fullMsg = document.getElementById(`full-${notificationId}`);
    
    if (shortMsg && fullMsg) {
        shortMsg.style.display = 'none';
        fullMsg.style.display = 'inline';
    }
    
    // Only mark as read if not already read
    if (notif && !notif.is_read) {
        const success = await markAsReadAPI(notificationId);
        if (success) {
            // Update the notification object
            notif.is_read = true;
            
            // Update UI - remove unread class
            const notifCard = document.querySelector(`[data-id="${notificationId}"]`);
            if (notifCard) {
                notifCard.classList.remove('unread');
            }
        }
    }
}

// Load notifications on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPageNotifications();
    
    // Check if we need to auto-open a notification
    const urlParams = new URLSearchParams(window.location.search);
    const notificationId = urlParams.get('id') || sessionStorage.getItem('viewNotificationId');
    
    if (notificationId) {
        // Clear the session storage
        sessionStorage.removeItem('viewNotificationId');
        
        // Wait a bit for the notifications to render, then auto-open
        setTimeout(() => {
            const notifCard = document.querySelector(`[data-id="${notificationId}"]`);
            if (notifCard) {
                // Scroll to the notification
                notifCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight it
                notifCard.style.backgroundColor = '#fff3cd';
                setTimeout(() => {
                    notifCard.style.backgroundColor = '';
                }, 2000);
                
                // Auto-expand the message
                const shortMsg = document.getElementById(`short-${notificationId}`);
                const fullMsg = document.getElementById(`full-${notificationId}`);
                if (shortMsg && fullMsg) {
                    shortMsg.style.display = 'none';
                    fullMsg.style.display = 'inline';
                }
                
                // Mark as read if not already
                const notif = allNotifications.find(n => n.id == notificationId);
                if (notif && !notif.is_read) {
                    markAsReadAPI(notificationId).then(success => {
                        if (success) {
                            notif.is_read = true;
                            notifCard.classList.remove('unread');
                        }
                    });
                }
            }
        }, 500);
    }
});
