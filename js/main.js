const userIcon = document.getElementById('user-icon');
const userDropdown = document.getElementById('userDropdown');

// Toggle dropdown when user icon is clicked
userIcon.addEventListener('click', function(e) {
    e.preventDefault();
    userDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Logout functionality
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Logout functionality would be implemented here.\nUser would be signed out and redirected to login page.');
    userDropdown.classList.remove('active');
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
