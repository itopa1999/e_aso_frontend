const userIcon = document.getElementById('user-icon');
const userDropdown = document.getElementById('userDropdown');
const logoutButton = document.getElementById('logoutButton');
const dropdownItems = userDropdown.querySelector('.dropdown-items');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

const access = getCookie('access');
const email = getCookie('email');
const name = getCookie("name");

console.log(email, access)

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
        // Authenticated view
        userName.textContent = name.length > 15 ? name.slice(0, 12) + '...' : name || "User";
        userEmail.textContent = email;

        dropdownItems.innerHTML = `
            <a href="#" class="dropdown-item">
                <i class="fas fa-user-circle"></i>
                <span>My Profile</span>
            </a>
            <a href="#" class="dropdown-item">
                <i class="fas fa-shopping-bag"></i>
                <span>My Orders</span>
            </a>
            <a href="#" class="dropdown-item">
                <i class="fas fa-heart"></i>
                <span>My Wishlist</span>
            </a>
            <a href="#" class="dropdown-item">
                <i class="fas fa-cog"></i>
                <span>Account Settings</span>
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
            <a href="auth.html" class="dropdown-item">
                <i class="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
            </a>
            <a href="auth.html" class="dropdown-item">
                <i class="fas fa-user-plus"></i>
                <span>Create Account</span>
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
