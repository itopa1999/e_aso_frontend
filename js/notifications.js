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
            <div class="notification-card ${notif.is_read ? '' : 'unread'} type-${notif.type}" data-id="${notif.id}" onclick="handleNotificationClick(${notif.id})" style="cursor: pointer;">
                <div class="notification-icon">${typeIcon}</div>
                <div class="notification-content">
                    <div class="notification-header-text">
                        <h3>${notif.title}</h3>
                        <span class="notification-badge">${typeLabel}</span>
                    </div>
                    <p class="notification-message" onclick="toggleMessage(event, ${notif.id})" style="cursor: pointer;">
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
    const success = await deleteNotificationAPI(id);
    if (success) {
        allNotifications = allNotifications.filter(n => n.id !== id);
        renderNotifications();
    }
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

// Handle notification card click - show full message and mark as read if not already
function handleNotificationClick(notificationId) {
    // Find the notification
    const notif = allNotifications.find(n => n.id === notificationId);
    const shortMsg = document.getElementById(`short-${notificationId}`);
    const fullMsg = document.getElementById(`full-${notificationId}`);
    const card = document.querySelector(`[data-id="${notificationId}"]`);
    
    if (shortMsg && fullMsg) {
        // Toggle to show full message
        shortMsg.style.display = 'none';
        fullMsg.style.display = 'inline';
        
        // Scroll to notification card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the card temporarily
        card.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
            card.style.backgroundColor = '';
        }, 2000);
        
        // Mark as read if not already read
        if (notif && !notif.is_read) {
            pageMarkAsRead(notificationId);
        }
    }
}

// Load notifications on page load
document.addEventListener('DOMContentLoaded', loadPageNotifications);
