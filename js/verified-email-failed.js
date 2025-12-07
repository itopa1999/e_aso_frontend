AUTH_URL = "http://192.168.0.198:8000/auth/api/user"
document.addEventListener('DOMContentLoaded', function() {
    // Simulate a slight delay for verification
    setTimeout(() => {
        document.querySelector('.verification-icon').style.animation = 'pulseWarning 2s infinite, fadeIn 0.8s ease-out';
    }, 300);

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const is_login = urlParams.get('is_login');
    
    // Resend email functionality
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn && email) {

        resendBtn.addEventListener('click', async function() {
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            this.disabled = true;

            try {
                const response = await fetch(`${AUTH_URL}/resend-link/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, is_login : is_login })
                });
                const data = await response.json();

                if (response.ok) {
                    this.innerHTML = '<i class="fas fa-check"></i> Email Sent!';
                    this.style.background = '#28a745';

                    showNotification('success', 'Email Sent', data?.message || 'Verification email has been resent.');
                } else {
                    showNotification('error', 'Error', data?.error || 'Something went wrong.');
                }
            } catch (err) {
                showNotification('error', 'Network Error', 'Unable to reach the server. Please try again later.');
                console.error(err);
            } finally {
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-paper-plane"></i> Resend Verification Email';
                    this.style.background = '';
                    this.disabled = false;
                }, 3000);
            }
        });
    } else if (!email) {
        showNotification('error', 'Missing Email', 'Email parameter not found in the URL.');
        resendBtn.disabled = true;
    }        

    // Add shake animation to icon to get attention
    setTimeout(() => {
        document.querySelector('.verification-icon').classList.add('shake');
    }, 1000);
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