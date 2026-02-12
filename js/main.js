// =========================
// SEO-FRIENDLY URL GENERATION
// =========================
/**
 * Generate SEO-friendly product URL with title slug
 * @param {number} id - Product ID
 * @param {string} title - Product title
 * @returns {string} SEO-friendly URL (e.g., product-info.html?id=58&slug=premium-nigerian-fabric)
 */
function generateProductUrl(id, title) {
    if (!id) return 'product-info.html';
    
    // Convert title to URL slug: remove special chars, convert spaces to hyphens, lowercase
    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    return `product-info.html?id=${id}&details=${slug}`;
}

/**
 * Generate SEO-friendly order URL with order number slug
 * @param {number} id - Order ID
 * @returns {string} SEO-friendly URL (e.g., ordered-details.html?id=48&slug=order-ao-48)
 */
function generateOrderUrl(id) {
    if (!id) return 'ordered-details.html';
    
    const slug = `order-ao-${id}`;
    return `ordered-details.html?id=${id}&details=${slug}`;
}

// =========================
// DOM CACHE FOR PERFORMANCE
// =========================
const DOM_CACHE = {
    preloader: null,
    userIcon: null,
    userDropdown: null,
    dropdownItems: null,
    userName: null,
    userEmail: null,
    goToTopBtn: null,
    notificationIcon: null,
    notificationDropdown: null,
    notificationList: null,
    notificationCount: null
};

function initDOMCache() {
    DOM_CACHE.preloader = document.getElementById('preloader');
    DOM_CACHE.userIcon = document.getElementById('user-icon');
    DOM_CACHE.userDropdown = document.getElementById('userDropdown');
    DOM_CACHE.dropdownItems = DOM_CACHE.userDropdown?.querySelector('.dropdown-items');
    DOM_CACHE.userName = document.getElementById('userName');
    DOM_CACHE.userEmail = document.getElementById('userEmail');
    DOM_CACHE.goToTopBtn = document.getElementById('goToTopBtn');
    DOM_CACHE.notificationIcon = document.getElementById('notification-icon');
    DOM_CACHE.notificationDropdown = document.getElementById('notificationDropdown');
    DOM_CACHE.notificationList = document.getElementById('notificationList');
    DOM_CACHE.notificationCount = document.getElementById('notification-count');
}

const urlParams = new URLSearchParams(window.location.search);

function setCookie(name, value, days = 1) {
    if (!value) return; // skip if missing or null
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // days → ms
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

// Initialize auth data
let authData = {
    access: null,
    email: null,
    name: null,
    groups: []
};

function loadAuthData() {
    authData.access = getCookie("access");
    authData.email = getCookie("email");
    authData.name = getCookie("name");
    const groupString = getCookie("group") || "";
    // Parse groups: split by literal \054 or comma
    authData.groups = groupString 
        ? groupString.split(/\\054|,/).map(g => g.trim().toLowerCase()).filter(g => g)
        : [];
    console.log('Group string:', groupString, 'Parsed groups:', authData.groups);
}

// Load auth data immediately
loadAuthData();

// Backward compatibility
const access = authData.access;
const email = authData.email;
const name = authData.name;
const groups = authData.groups;



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
// Handle auth-based content - optimized with cached DOM
function updateDropdown() {
    if (!DOM_CACHE.userName || !DOM_CACHE.userEmail || !DOM_CACHE.dropdownItems) return;

    if (authData.access && authData.email) {
        const safeName = authData.name || "";
        DOM_CACHE.userName.textContent = safeName.length > 15 
            ? safeName.slice(0, 12) + '...' 
            : safeName || "User";
        DOM_CACHE.userEmail.textContent = authData.email;
        
        const links = [
            '<a href="profile.html" class="dropdown-item"><i class="fas fa-user-circle"></i><span>My Profile</span></a>',
            '<a href="ordered-lists.html" class="dropdown-item"><i class="fas fa-shopping-bag"></i><span>My Orders</span></a>',
            '<a href="watchlist.html" class="dropdown-item"><i class="fas fa-heart"></i><span>My Wishlist</span></a>',
            '<a href="feedback-page.html" class="dropdown-item"><i class="fas fa-comment-dots"></i><span>Share Feedback</span></a>',
        ];
        
        if (authData.groups.includes("rider")) {
            links.push('<a href="rider-page.html" class="dropdown-item"><i class="fas fa-motorcycle"></i><span>Go to Rider</span></a>');
        }
        
        if (authData.groups.includes("admin")) {
            links.push('<a href="/admin/dashboard.html" class="dropdown-item"><i class="fas fa-tachometer-alt"></i><span>Admin Dashboard</span></a>');
        }
        
        links.push(
            '<a href="about.html" class="dropdown-item"><i class="fas fa-info-circle"></i><span>About Us</span></a>',
            '<a href="contact.html" class="dropdown-item"><i class="fas fa-envelope"></i><span>Contact Us</span></a>',
            '<a href="#" class="dropdown-item restart-tour-item" id="restartTourDropdown"><i class="fas fa-redo"></i><span>Restart Tour</span></a>',
            '<a href="#" class="dropdown-item logout-item" id="logoutButton"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>'
        );
        
        DOM_CACHE.dropdownItems.innerHTML = links.join('');
    } else {
        DOM_CACHE.userName.textContent = "Guest";
        DOM_CACHE.userEmail.textContent = "Please log in";
        DOM_CACHE.dropdownItems.innerHTML = `
            <a href="about.html" class="dropdown-item"><i class="fas fa-info-circle"></i><span>About Us</span></a>
            <a href="contact.html" class="dropdown-item"><i class="fas fa-envelope"></i><span>Contact Us</span></a>
            <a href="auth.html" class="dropdown-item"><i class="fas fa-sign-in-alt"></i><span>Sign In</span></a>
            <a href="#" class="dropdown-item restart-tour-item" id="restartTourDropdown"><i class="fas fa-redo"></i><span>Restart Tour</span></a>
        `;
    }
}

// Set up dropdown toggle - optimized
function setupDropdownToggle() {
    if (!DOM_CACHE.userIcon || !DOM_CACHE.userDropdown) return;
    
    DOM_CACHE.userIcon.addEventListener('click', function (e) {
        e.preventDefault();
        updateDropdown();
        DOM_CACHE.userDropdown.classList.toggle('active');
    });
}

// Close dropdown on outside click - optimized
function setupOutsideClickDetection() {
    if (!DOM_CACHE.userIcon || !DOM_CACHE.userDropdown) return;
    
    document.addEventListener('click', function (e) {
        if (!DOM_CACHE.userIcon.contains(e.target) && !DOM_CACHE.userDropdown.contains(e.target)) {
            DOM_CACHE.userDropdown.classList.remove('active');
        }
    });
}

// Dynamic logout delegation - optimized
function setupLogoutHandler() {
    document.addEventListener('click', function (e) {
        if (e.target.closest('#logoutButton')) {
            e.preventDefault();
            // Clear all cookies at once
            const cookies = ["access", "refresh", "email", "name", "group"];
            cookies.forEach(cookie => {
                document.cookie = `${cookie}=; Max-Age=0; path=/`;
            });
            
            if (DOM_CACHE.userDropdown) {
                DOM_CACHE.userDropdown.classList.remove('active');
            }

            const currentPage = window.location.pathname;
            if (!currentPage.includes('index.html')) {
                window.location.href = 'index.html';
            } else {
                location.reload();
            }
        }
    });
}

// Setup restart tour handler - delegation
function setupRestartTourHandler() {
    document.addEventListener('click', function (e) {
        if (e.target.closest('#restartTourDropdown')) {
            e.preventDefault();
            // Close dropdown
            if (DOM_CACHE.userDropdown) {
                DOM_CACHE.userDropdown.classList.remove('active');
            }
            
            // Clear tour completion flag to allow restart
            localStorage.removeItem('esthers-fabrics-tour-completed');
            
            // Get current page
            const currentPage = window.location.pathname;
            const isIndexPage = currentPage.includes('index.html') || currentPage.endsWith('/');
            
            // If not on index page, go to index
            if (!isIndexPage) {
                window.location.href = 'index.html';
            } else {
                // If already on index, restart tour if it exists
                if (window.tourGuide) {
                    window.tourGuide.restartTour();
                }
            }
        }
    });
}

// Preloader functions - optimized with cache
function showPreloader(message) {
    if (!DOM_CACHE.preloader) DOM_CACHE.preloader = document.getElementById('preloader');
    if (DOM_CACHE.preloader) {
        const textEl = document.querySelector('.preloader-text');
        if (textEl) textEl.textContent = message;
        DOM_CACHE.preloader.classList.remove('hidden');
        DOM_CACHE.preloader.style.display = 'flex';
    }
}

function hidePreloader() {
    if (!DOM_CACHE.preloader) DOM_CACHE.preloader = document.getElementById('preloader');
    if (DOM_CACHE.preloader) {
        DOM_CACHE.preloader.classList.add('hidden');
        setTimeout(() => {
            if (DOM_CACHE.preloader) DOM_CACHE.preloader.style.display = 'none';
        }, 500);
    }
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



function showNotification(type, title, message) {
    const modal = document.getElementById('notificationModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalButton = document.getElementById('modalButton');
    
    // Set modal content based on type
    if(type === 'success') {
        modal.classList.add('success');
        modal.classList.remove('error');
        modalIcon.className = 'fas fa-check-circle';
        modalButton.innerHTML = '<i class="fas fa-check"></i> Continue';
    } else {
        modal.classList.add('error');
        modal.classList.remove('success');
        modalIcon.className = 'fas fa-exclamation-circle';
        modalButton.innerHTML = '<i class="fas fa-redo"></i> Try Again';
    }
    
    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Show modal
    modal.classList.add('active');
    
    // Add confetti effect for success
    if(type === 'success') {
        createConfetti();
    }
}

function closeNotification() {
    const modal = document.getElementById('notificationModal');
    modal.classList.remove('active');
}

// Confetti effect for success notifications
function createConfetti() {
    const colors = ['#8a4b38', '#e8d0b3', '#d4a373', '#28a745', '#4a2c2a'];
    const container = document.querySelector('.notification-modal');
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.opacity = '0';
        confetti.style.zIndex = '3';
        container.appendChild(confetti);
        
        // Random rotation
        const rotation = Math.random() * 360;
        confetti.style.transform = `rotate(${rotation}deg)`;
        
        // Animate confetti
        const animation = confetti.animate([
            { 
                transform: `translate(0, 0) scale(0) rotate(${rotation}deg)`, 
                opacity: 0 
            },
            { 
                transform: `translate(${(Math.random() - 0.5) * 200}px, 20vh) scale(1) rotate(${rotation + 180}deg)`, 
                opacity: 1 
            },
            { 
                transform: `translate(${(Math.random() - 0.5) * 400}px, 100vh) scale(0) rotate(${rotation + 360}deg)`, 
                opacity: 0 
            }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        // Remove after animation
        animation.onfinish = () => confetti.remove();
    }
}

// Close modal when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNotification();
    }

});

ADMIN_URL = "http://127.0.0.1:8000/admins/api/admin"
AUTH_URL = "http://127.0.0.1:8000/auth/api/user" 
ASO_URL = "http://127.0.0.1:8000/aso/api/product"


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

function formatReviews(count) {
    if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(1) + "b";
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "m";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "k";
    return count;
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Notification Functions
function setupNotificationHandler() {
    if (!DOM_CACHE.notificationIcon || !DOM_CACHE.notificationDropdown) return;
    
    // Toggle notification dropdown
    DOM_CACHE.notificationIcon.addEventListener('click', function (e) {
        e.preventDefault();
        DOM_CACHE.notificationDropdown.classList.toggle('active');
        DOM_CACHE.userDropdown?.classList.remove('active');
    });
    
    // Close notification dropdown on outside click
    document.addEventListener('click', function (e) {
        if (!DOM_CACHE.notificationIcon?.contains(e.target) && !DOM_CACHE.notificationDropdown?.contains(e.target)) {
            DOM_CACHE.notificationDropdown?.classList.remove('active');
        }
    });
    
    // Clear notifications button
    const clearBtn = document.getElementById('clearNotifications');
    if (clearBtn) {
        clearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            clearAllNotifications();
        });
    }
}

function updateNotificationIcon() {
    if (!authData.access || !DOM_CACHE.notificationIcon) {
        if (DOM_CACHE.notificationIcon) {
            DOM_CACHE.notificationIcon.style.display = 'none';
        }
        return;
    }
    
    // Show notification icon only if authenticated
    DOM_CACHE.notificationIcon.style.display = 'flex';
    loadNotifications();
}

async function loadNotifications() {
    if (!authData.access || !DOM_CACHE.notificationList) return;
    
    try {
        const response = await fetch(`${ASO_URL}/notifications/recent/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authData.access}`,
                "Accept": "application/json"
            }
        });
        
        if (!response.ok) throw new Error("Failed to fetch notifications");
        
        const data = await response.json();
        displayNotifications(data.data || []);
    } catch (error) {
        console.log('Notifications load skipped - API may not be available yet');
    }
}


function displayNotifications(notifications) {
    if (!DOM_CACHE.notificationList || !DOM_CACHE.notificationCount) return;
    
    if (!notifications || notifications.length === 0) {
        DOM_CACHE.notificationList.innerHTML = '<div class="empty-notifications">No notifications</div>';
        DOM_CACHE.notificationCount.textContent = '0';
        return;
    }
    
    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.is_read).length;
    DOM_CACHE.notificationCount.textContent = unreadCount > 0 ? unreadCount : '';
    DOM_CACHE.notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    
    // Limit to 5 notifications in dropdown
    const displayNotifications = notifications.slice(0, 5);
    
    const notificationHTML = displayNotifications.map(notif => {
        const typeIcon = getNotificationTypeIcon(notif.type);
        const typeClass = `type-${notif.type}`;
        const truncatedMessage = truncateLongText(notif.message || '', 80);
        const messageHTML = truncatedMessage.replace(/\n/g, '<br>');
        
        return `
            <div class="notification-item ${notif.is_read ? '' : 'unread'} ${typeClass}" data-id="${notif.id}">
                <div class="notification-icon">${typeIcon}</div>
                <div class="notification-content" onclick="viewNotificationDetail(${notif.id}, event)">
                    <h4>${notif.title || 'Notification'}</h4>
                    <p>${messageHTML}</p>
                    <small>${formatTimeAgo(notif.created_at)}</small>
                </div>
                <button class="delete-notification" data-id="${notif.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    DOM_CACHE.notificationList.innerHTML = notificationHTML;
    
    // Add delete handlers
    document.querySelectorAll('.delete-notification').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            deleteNotification(this.dataset.id);
        });
    });
}

function getNotificationTypeIcon(type) {
    const icons = {
        'system': '<i class="fas fa-cog"></i>',
        'updates': '<i class="fas fa-bell"></i>',
        'promos': '<i class="fas fa-tag"></i>'
    };
    return icons[type] || icons['system'];
}

function getNotificationTypeLabel(type) {
    const labels = {
        'system': 'System',
        'updates': 'Updates',
        'promos': 'Promos'
    };
    return labels[type] || 'Notification';
}

function truncateLongText(text, maxLength = 80) {
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
    
    return formatDateToHuman(dateString);
}

// Mark a single notification as read via API
async function markAsReadAPI(notificationId) {
    if (!authData.access) return false;
    
    try {
        const response = await fetch(`${ASO_URL}/notifications/${notificationId}/read/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authData.access}`,
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.log('Failed to mark notification as read');
    }
    return false;
}

// Delete a single notification via API
async function deleteNotificationAPI(notificationId) {
    if (!authData.access) return false;
    showPreloader('Deleting notification...');
    try {
        const response = await fetch(`${ASO_URL}/notifications/${notificationId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authData.access}`
            }
        });
        
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.log('Failed to delete notification');
    } finally {
        hidePreloader();
    }
    return false;
}

// Mark all notifications as read via API
async function markAllAsReadAPI() {
    if (!authData.access) return false;
    
    try {
        const response = await fetch(`${ASO_URL}/notifications/mark-all-read/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authData.access}`,
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.log('Failed to mark all notifications as read');
    }
    return false;
}

// Delete all notifications via API
async function deleteAllNotificationsAPI() {
    if (!authData.access) return false;
    
    try {
        const response = await fetch(`${ASO_URL}/notifications/clear-all/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authData.access}`
            }
        });
        
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.log('Failed to delete all notifications');
    }
    return false;
}

// Wrapper for dropdown: mark as read with event handling
async function markAsRead(notificationId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const success = await markAsReadAPI(notificationId);
    if (success) {
        // Update UI - remove unread class
        const notifItem = document.querySelector(`[data-id="${notificationId}"]`);
        if (notifItem) {
            notifItem.classList.remove('unread');
        }
        loadNotifications();
    }
}

// View notification detail on full notifications page
function viewNotificationDetail(notificationId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Store the notification ID to scroll to and open
    sessionStorage.setItem('viewNotificationId', notificationId);
    
    // Navigate to notifications page
    window.location.href = 'notifications.html?id=' + notificationId;
}

// Wrapper for dropdown: delete notification
async function deleteNotification(notificationId) {
    const success = await deleteNotificationAPI(notificationId);
    if (success) {
        loadNotifications();
    }
}

// Wrapper for dropdown: clear all notifications
async function clearAllNotifications() {
    const success = await deleteAllNotificationsAPI();
    if (success) {
        loadNotifications();
    }
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

async function updateCartAndWatchlistCounts() {
    if (!access) return;
    try {
        const response = await fetch(`${ASO_URL}/watchlist-and-cart-count/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch counts");

        const data = await response.json();

        // Update the cart and watchlist badges
        document.getElementById("cart-count").textContent = data.item_count;
        document.getElementById("watchlist-count").textContent = data.watchlist_count;
    } catch (error) {
        // Silently fail for cart/watchlist counts
    }
}


// Go to top button - optimized with throttle
function setupGoToTop() {
    if (!DOM_CACHE.goToTopBtn) DOM_CACHE.goToTopBtn = document.getElementById("goToTopBtn");
    if (!DOM_CACHE.goToTopBtn) return;

    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                if (DOM_CACHE.goToTopBtn) {
                    const shouldShow = document.body.scrollTop > 200 || document.documentElement.scrollTop > 200;
                    DOM_CACHE.goToTopBtn.style.display = shouldShow ? "block" : "none";
                }
            }, 100);
        }
    }, { passive: true });

    DOM_CACHE.goToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialize all components
function initializeApp() {
    initDOMCache();
    loadAuthData();
    setupDropdownToggle();
    setupOutsideClickDetection();
    setupLogoutHandler();
    setupRestartTourHandler();
    setupNotificationHandler();
    updateNotificationIcon();
    updateCartAndWatchlistCounts();
    setupGoToTop();
    setupImageProtection();
}

// =========================
// IMAGE PROTECTION - PREVENT DOWNLOADS
// =========================
function setupImageProtection() {
    // Disable right-click on images
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG' || e.target.closest('img')) {
            e.preventDefault();
            return false;
        }
    }, true);
    
    // Disable drag and drop of images
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, true);
    
    // Disable image copy
    document.addEventListener('copy', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, true);
    
    // Make all images non-draggable
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.setAttribute('draggable', 'false');
        img.ondragstart = function() { return false; };
        img.oncontextmenu = function() { return false; };
    });
    
    // For images added dynamically, observe and apply protection
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'IMG') {
                        node.setAttribute('draggable', 'false');
                        node.ondragstart = function() { return false; };
                        node.oncontextmenu = function() { return false; };
                    }
                    // Check for images inside added elements
                    if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(img => {
                            img.setAttribute('draggable', 'false');
                            img.ondragstart = function() { return false; };
                            img.oncontextmenu = function() { return false; };
                        });
                    }
                });
            }
        });
    });
    
    // Start observing the document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Call it after DOM loads
document.addEventListener("DOMContentLoaded", initializeApp);

