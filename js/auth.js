// Dark Mode Toggle
const toggleBtn = document.getElementById('darkModeToggle');
// Check system preference
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDark = localStorage.getItem('darkMode');

// If no preference is stored, use system setting
if (isDark === null) {
    isDark = prefersDarkMode;
} else {
    isDark = isDark === 'true'; // Convert string to boolean
}

// Apply theme
document.body.classList.toggle('dark-mode', isDark);
toggleBtn.textContent = isDark ? '🌞' : '🌙';

// Toggle dark mode on button click
toggleBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
    toggleBtn.textContent = isDark ? '🌞' : '🌙';
});


function showAlert(type, message) {
    const alertBox = document.getElementById("customAlert");
    const alertContent = document.getElementById("alertContent");
    const alertProgress = document.getElementById("alertProgress");

    alertContent.textContent = message;

    // Apply type-based color
    let bgColor;
    switch (type) {
        case 'success':
            bgColor = 'var(--success)';
            break;
        case 'info':
            bgColor = 'var(--info)';
            break;
        case 'error':
            bgColor = 'var(--error)';
            break;
        default:
            bgColor = '#ccc';
    }

    alertProgress.style.background = bgColor;

    // Show alert
    alertBox.classList.add("active");

    // Auto-close after 6 seconds
    setTimeout(closeAlert, 6000);
}

function closeAlert() {
    document.getElementById("customAlert").classList.remove("active");
}