// Simple animation for page elements with optimized event handling
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const homeButton = document.querySelector('.btn-home');
    const navContainer = document.querySelector('.bottom-nav');
    
    // Add hover effect to buttons
    if (homeButton) {
        homeButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        homeButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
    
    // Use event delegation for nav items
    if (navContainer) {
        const navItems = navContainer.querySelectorAll('.nav-item');
        
        navContainer.addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;
            
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            navItem.classList.add('active');
        });
        
        // Set the home nav item as active
        if (navItems.length > 0) {
            navItems[0].classList.add('active');
        }
    }
});