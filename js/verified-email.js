document.addEventListener('DOMContentLoaded', function() {
    // Simulate a slight delay for verification
    setTimeout(() => {
        document.querySelector('.verification-icon').style.animation = 'pulse 2s infinite, fadeIn 0.8s ease-out';
    }, 300);
    
    // Add confetti effect on success
    document.querySelector('.btn-primary').addEventListener('click', function(e) {
        e.preventDefault();
        createConfetti();
        
        // Show success message
        this.innerHTML = '<i class="fas fa-check"></i> Taking you to marketplace...';
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
    
    // Simple confetti effect
    function createConfetti() {
        const colors = ['#8a4b38', '#e8d0b3', '#d4a373', '#28a745'];
        const container = document.querySelector('.verification-container');
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.top = '50%';
            confetti.style.left = '50%';
            confetti.style.opacity = '0';
            confetti.style.zIndex = '1000';
            container.appendChild(confetti);
            
            // Animate confetti
            const angle = Math.random() * Math.PI * 2;
            const velocity = 20 + Math.random() * 20;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;
            
            confetti.animate([
                { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
                { transform: `translate(${x * 2}px, ${y * 2}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 2000);
        }
    }
});