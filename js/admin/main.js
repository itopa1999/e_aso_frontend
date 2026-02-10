

const access = getCookie('access');
const email = getCookie('email');
const name = getCookie("name");
const group = getCookie("group")?.toLowerCase();
const AdminUserName = document.getElementById('adminUserName');

// Helper to read cookies
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!match) return null;

    let value = decodeURIComponent(match[2]);

    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }

    return value;
}


const safeName = name || "";

AdminUserName.textContent = safeName.length > 15 
    ? safeName.slice(0, 12) + '...' 
    : safeName || "User";

const logoutButton = document.getElementById('logoutUser');

document.addEventListener('click', function (e) {
    if (e.target.closest('#logoutUser')) {
        e.preventDefault();
        document.cookie = "access=; Max-Age=0; path=/";
        document.cookie = "refresh=; Max-Age=0; path=/";
        document.cookie = "email=; Max-Age=0; path=/";
        document.cookie = "name=; Max-Age=0; path=/";
        document.cookie = "group=; Max-Age=0; path=/";

        const currentPage = window.location.pathname;
        if (!currentPage.includes('/auth.html')) {
            window.location.href = '/index.html';
        } else {
            location.reload();
        }
    }
});

const preloader = document.getElementById('preloader');

// Function to show preloader
function showPreloader(message) {
    document.querySelector('.preloader-text').textContent = message;
    preloader.classList.remove('hidden');
    preloader.style.display = 'flex';
}

function showErrorModal(message) {
    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.innerHTML = `
        <div class="dialog-box">
            <p>${message}</p>
            <div class="dialog-actions">
                <button class="confirm-btn1">Okay</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector(".confirm-btn1").addEventListener("click", () => overlay.remove());
}

// Function to hide preloader
function hidePreloader() {
    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}


const btn = document.getElementById("goToTopBtn");

window.onscroll = function () {
    btn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
};

// Scroll to top when clicked
btn.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


// Sidebar toggle functionality
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mainContent = document.getElementById('mainContent');

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
});

// Close sidebar when clicking on overlay
sidebarOverlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickInsideToggle = menuToggle.contains(event.target);
    
    if (!isClickInsideSidebar && !isClickInsideToggle && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
});

// Adjust sidebar on window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
})

function formatNumber(num) {
    return parseFloat(num).toLocaleString();
}


// Utility: format human-readable date
function formatDateToHuman(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getStarHTML(rating) {
    const fullStars = parseInt(rating);  // Convert 4.0 => 4
    let starHTML = "";

    for (let i = 0; i < fullStars; i++) {
        starHTML += `<i class="fas fa-star"></i>`;
    }

    const remaining = 5 - fullStars;
    for (let i = 0; i < remaining; i++) {
        starHTML += `<i class="far fa-star"></i>`;
    }

    return starHTML;
}

const toggle = document.querySelector('.accordion-toggle');
const info = document.querySelector('.product-informations');

// Only run if both elements exist
if (toggle && info) {
toggle.addEventListener('click', () => {
    const isVisible = info.style.display === 'block';

    if (isVisible) {
    info.style.display = 'none';
    toggle.classList.remove('active');
    } else {
    info.style.display = 'block';
    toggle.classList.add('active');
    }
});
}


ANALYTICS_URL = "http://127.0.0.1:8000/admins/api/analytics"
ADMIN_URL = "http://127.0.0.1:8000/admins/api/admin"
ASO_URL = "http://127.0.0.1:8000/aso/api/product"
AUTH_URL = "http://127.0.0.1:8000/auth/api"

// Show notification icon only if authenticated
function updateNotificationIcon() {
    const notificationIcon = document.getElementById('notification-icon');
    if (notificationIcon) {
        notificationIcon.style.display = access ? 'flex' : 'none';
        
        // Update notification count
        if (access) {
            loadNotifications();
        }
    }
}

// Load and display notifications
async function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList || !access) return;

    try {
        const response = await fetch(`${AUTH_URL}/notifications/`, {
            headers: {
                "Authorization": `Bearer ${access}`,
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            const notifications = Array.isArray(data) ? data : data.results || [];
            displayNotifications(notifications.slice(0, 5));
        } else {
            displaySampleNotifications();
        }
    } catch (error) {
        console.log('Failed to load notifications');
        displaySampleNotifications();
    }
}

function displaySampleNotifications() {
    const notifications = [
        {
            id: 1,
            title: "Your Order is Confirmed",
            message: "Order #12345 has been confirmed and will be shipped soon.",
            type: "system",
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            title: "Special Promo: 20% Off",
            message: "Get 20% off on all fabric collections this weekend only!",
            type: "promos",
            is_read: true,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            title: "New Premium Collection Available",
            message: "Check out our latest premium fabric collection just added to the store.",
            type: "updates",
            is_read: false,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            title: "Payment Successful",
            message: "Your payment of ₦15,500 for order #12346 has been processed.",
            type: "system",
            is_read: true,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            title: "Aso Oke Festival Sale",
            message: "Celebrate with us! Enjoy exclusive deals on traditional Aso Oke fabrics.",
            type: "promos",
            is_read: false,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    displayNotifications(notifications);
}

function displayNotifications(notifications) {
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.getElementById('notification-count');
    if (!notificationList) return;

    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (notificationCount) {
        notificationCount.textContent = unreadCount;
    }

    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="empty-notifications">No notifications</div>';
        return;
    }

    const notificationsHTML = notifications.map(notif => `
        <div class="notification-item ${notif.is_read ? '' : 'unread'} type-${notif.type}" data-id="${notif.id}">
            <div class="notification-icon">${getNotificationTypeIcon(notif.type)}</div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${formatTimeAgo(notif.created_at)}</div>
            </div>
            ${!notif.is_read ? '<div class="notification-unread-indicator"></div>' : ''}
        </div>
    `).join('');

    notificationList.innerHTML = notificationsHTML;
}

function getNotificationTypeIcon(type) {
    const icons = {
        'system': '<i class="fas fa-cog"></i>',
        'updates': '<i class="fas fa-bell"></i>',
        'promos': '<i class="fas fa-tag"></i>'
    };
    return icons[type] || icons['system'];
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNotificationIcon();
});