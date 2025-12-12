AUTH_URL = "http://192.168.0.200:8000/auth/api/user";

// DOM CACHE
const AUTH_DOM = {
    loginForm: null,
    submitBtn: null,
    spinner: null,
    btnText: null,
    googleBtn: null
};

function cacheAuthDOM() {
    AUTH_DOM.loginForm = document.getElementById('login-form');
    AUTH_DOM.submitBtn = document.getElementById('submit-btn');
    AUTH_DOM.spinner = document.getElementById('spinner');
    AUTH_DOM.btnText = AUTH_DOM.submitBtn?.querySelector('.btn-text');
    AUTH_DOM.googleBtn = document.querySelector('.btn-google');
}

document.addEventListener('DOMContentLoaded', function() {
    cacheAuthDOM();
    
    if (!AUTH_DOM.loginForm) return;        
    AUTH_DOM.loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = AUTH_DOM.loginForm.querySelector('input[name="email"]').value;
        // Disable button and show spinner
        AUTH_DOM.submitBtn.disabled = true;
        AUTH_DOM.spinner.classList.remove('d-none');
        AUTH_DOM.btnText.textContent = 'Signing In...';
        try {
            const response = await fetch(`${AUTH_URL}/magic-login/`, {
                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                showNotification(
                    'success',
                    'Account Sign-In', 
                    `${data.message}`
                );
                AUTH_DOM.loginForm.reset();
            } else {
                showNotification(
                    'error',
                    'Account Sign-In Error',
                    `${data.message}`
                );
            }
        } catch (error) {
            showNotification(
                'error',
                'Network Error',
                'Unable to reach the server. Please check your connection and try again.'
            );
            console.error(error);
        }

        // Re-enable button and hide spinner
        AUTH_DOM.submitBtn.disabled = false;
        AUTH_DOM.spinner.classList.add('d-none');
        AUTH_DOM.btnText.textContent = 'Sign In';
    });
    
    // Google SSO
    if (AUTH_DOM.googleBtn) {
        AUTH_DOM.googleBtn.addEventListener('click', function() {
            showErrorModal('Google SSO would open here\n(In a real app, this would authenticate with Google)');
        });
    }

});

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