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
            setCookie(param, value, 1); // always 1 day expiry
        }
    });
}


const userIcon = document.getElementById('user-icon');
const userDropdown = document.getElementById('userDropdown');
const logoutButton = document.getElementById('logoutButton');
const dropdownItems = userDropdown.querySelector('.dropdown-items');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

const access = getCookie('access');
const email = getCookie('email');
const name = getCookie("name");
const groupString = getCookie("group")?.toLowerCase() || "";
const groups = groupString.split(",").map(g => g.trim());


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
// Handle auth-based content
function updateDropdown() {
    if (access && email) {
        // Use empty string if null/undefined
        const safeName = name || "";

        userName.textContent = safeName.length > 15 
            ? safeName.slice(0, 12) + '...' 
            : safeName || "User";

        userEmail.textContent = email;
        
        let riderLink = "";
        if (groups.includes("rider")) {
            riderLink = `
                <a href="rider-page.html" class="dropdown-item">
                    <i class="fas fa-motorcycle"></i>
                    <span>Go to Rider</span>
                </a>
            `;
        }

        let adminLink = "";
        if (groups.includes("admin")) { 
            adminLink = `
                <a href="admin/dashboard.html" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Admin Dashboard</span>
                </a>
            `;
        }

        dropdownItems.innerHTML = `
            <a href="profile.html" class="dropdown-item">
                <i class="fas fa-user-circle"></i>
                <span>My Profile</span>
            </a>
            <a href="ordered-lists.html" class="dropdown-item">
                <i class="fas fa-shopping-bag"></i>
                <span>My Orders</span>
            </a>
            <a href="watchlist.html" class="dropdown-item">
                <i class="fas fa-heart"></i>
                <span>My Wishlist</span>
            </a>
            ${riderLink}
            ${adminLink}
            <a href="about.html" class="dropdown-item">
                <i class="fas fa-info-circle"></i>
                <span>About Us</span>
            </a>
            <a href="contact.html" class="dropdown-item">
                <i class="fas fa-envelope"></i>
                <span>Contact Us</span>
            </a>
            <a href="#" class="dropdown-item logout-item" id="logoutButton">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        `;
    } else {
        // Unauthenticated view
        userName.textContent = "Guest";
        userEmail.textContent = "Please log in";

        dropdownItems.innerHTML = `
            <a href="about.html" class="dropdown-item">
                <i class="fas fa-info-circle"></i>
                <span>About Us</span>
            </a>
            <a href="contact.html" class="dropdown-item">
                <i class="fas fa-envelope"></i>
                <span>Contact Us</span>
            </a>
            <a href="auth.html" class="dropdown-item">
                <i class="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
            </a>
        `;
    }
}

// Set up dropdown toggle
userIcon.addEventListener('click', function (e) {
    e.preventDefault();
    updateDropdown();
    userDropdown.classList.toggle('active');
});

// Close dropdown on outside click
document.addEventListener('click', function (e) {
    if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Dynamic logout delegation (since logout button is injected dynamically)
document.addEventListener('click', function (e) {
    if (e.target.closest('#logoutButton')) {
        e.preventDefault();
        document.cookie = "access=; Max-Age=0; path=/";
        document.cookie = "refresh=; Max-Age=0; path=/";
        document.cookie = "email=; Max-Age=0; path=/";
        document.cookie = "name=; Max-Age=0; path=/";
        document.cookie = "group=; Max-Age=0; path=/";
        userDropdown.classList.remove('active');

        const currentPage = window.location.pathname;
        if (!currentPage.includes('index.html')) {
            window.location.href = 'index.html';
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

// Function to hide preloader
function hidePreloader() {
    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
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


const btn = document.getElementById("goToTopBtn");

window.onscroll = function () {
    btn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) ? "block" : "none";
};

// Scroll to top when clicked
btn.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Call it after DOM loads
document.addEventListener("DOMContentLoaded", updateCartAndWatchlistCounts);



var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6502cdf70f2b18434fd87797/1ha9f95o4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
