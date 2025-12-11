

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


ANALYTICS_URL = "http://192.168.0.199:8000/admins/api/analytics"
ADMIN_URL = "http://192.168.0.199:8000/admins/api/admin"
ASO_URL = "http://192.168.0.199:8000/aso/api/product"