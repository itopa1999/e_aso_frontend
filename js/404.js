// Simple animation for page elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to buttons
    const homeButton = document.querySelector('.btn-home');
    
    homeButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    homeButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    // Add click effect to bottom nav items
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
    
    // Set the home nav item as active
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
});