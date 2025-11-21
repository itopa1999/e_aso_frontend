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
    goToTopBtn: null
};

function initDOMCache() {
    DOM_CACHE.preloader = document.getElementById('preloader');
    DOM_CACHE.userIcon = document.getElementById('user-icon');
    DOM_CACHE.userDropdown = document.getElementById('userDropdown');
    DOM_CACHE.dropdownItems = DOM_CACHE.userDropdown?.querySelector('.dropdown-items');
    DOM_CACHE.userName = document.getElementById('userName');
    DOM_CACHE.userEmail = document.getElementById('userEmail');
    DOM_CACHE.goToTopBtn = document.getElementById('goToTopBtn');
}

const urlParams = new URLSearchParams(window.location.search);

function setCookie(name, value, days = 1) {
    if (!value) return; // skip if missing or null
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // days → ms
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

// Only proceed if email param exists
const email1 = urlParams.get("email");
if (email1) {
    ["access", "refresh", "email", "name", "group"].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            setCookie(param, value, 7); // always 1 day expiry
        }
    });
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
    const groupString = getCookie("group")?.toLowerCase() || "";
    authData.groups = groupString ? groupString.split(",").map(g => g.trim()) : [];
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
            '<a href="watchlist.html" class="dropdown-item"><i class="fas fa-heart"></i><span>My Wishlist</span></a>'
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
        console.error("Error fetching cart/watchlist counts:", error);
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
    updateCartAndWatchlistCounts();
    setupGoToTop();
    
}

// Call it after DOM loads
document.addEventListener("DOMContentLoaded", initializeApp);



var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6502cdf70f2b18434fd87797/1ha9f95o4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
