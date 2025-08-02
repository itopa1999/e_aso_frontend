const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

function loadCartData() {
    showPreloader("Loading your ordered details");
    
    // Simulate API call to backend
    setTimeout(() => {
        // After data is loaded
        hidePreloader();
        cartContainer.style.display = 'block';
    }, 2500); // 2.5 seconds delay to simulate network request
}

// Initialize cart
loadCartData();

document.addEventListener('DOMContentLoaded', function() {
    // Update progress bar based on status
    function updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const activeStep = document.querySelector('.step-active');
        
        if (activeStep) {
            const stepIndex = Array.from(document.querySelectorAll('.timeline-step')).indexOf(activeStep);
            const percentage = (stepIndex / 4) * 100;
            progressBar.style.height = percentage + '%';
        }
    }
    
    // Simulate delivery status update
    function simulateDeliveryUpdate() {
        const steps = document.querySelectorAll('.timeline-step');
        const statusBar = document.querySelector('.status-bar');
        const statusTitle = statusBar.querySelector('.status-title');
        const statusSubtitle = statusBar.querySelector('.status-subtitle');
        const statusBadge = statusBar.querySelector('.order-status');
        
        // Simulate status updates every 5 seconds
        let currentStep = 2; // Start at Shipped
        
        const updateInterval = setInterval(() => {
            if (currentStep < 4) {
                // Remove active class from all steps
                steps.forEach(step => {
                    step.classList.remove('step-active');
                });
                
                // Move to next step
                currentStep++;
                steps[currentStep].classList.add('step-active');
                
                // Update status bar
                if (currentStep === 3) {
                    statusTitle.textContent = "In Transit";
                    statusSubtitle.textContent = "Estimated delivery: October 25, 2023";
                    statusBadge.textContent = "In Transit";
                    statusBadge.className = "order-status status-processing";
                } else if (currentStep === 4) {
                    statusTitle.textContent = "Delivered";
                    statusSubtitle.textContent = "Delivered on October 24, 2023";
                    statusBadge.textContent = "Delivered";
                    statusBadge.className = "order-status status-delivered";
                    clearInterval(updateInterval); // Stop simulation when delivered
                }
                
                updateProgressBar();
            }
        }, 5000);
    }
    
    // Initialize progress bar
    updateProgressBar();
    
    // Start simulation (would be replaced with real data in production)
    simulateDeliveryUpdate();
    
    // Reorder button functionality
    const reorderBtn = document.querySelector('.btn-reorder');
    const cartBadge = document.querySelector('.icon-badge');
    
    reorderBtn.addEventListener('click', function() {
        let count = parseInt(cartBadge.textContent);
        cartBadge.textContent = count + 2;
        
        // Animation
        this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        this.style.background = '#28a745';
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Reorder Items';
            this.style.background = '';
        }, 2000);
    });
    
    // Contact seller button
    document.querySelector('.btn-contact').addEventListener('click', function() {
        alert('Contacting seller...\nYou would be redirected to a chat with the seller.');
    });
    
    // Return button
    document.querySelector('.btn-return').addEventListener('click', function() {
        alert('Return request initiated\nYou will receive instructions for returning items.');
    });
});