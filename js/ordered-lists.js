const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

function loadCartData() {
    showPreloader("Loading your ordered items");
    
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
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // In a real app, this would filter the orders
            document.querySelectorAll('.order-card').forEach(card => {
                card.style.display = 'block';
            });
        });
    });
    
    // Reorder button functionality
    const reorderBtns = document.querySelectorAll('.btn-reorder');
    const cartBadge = document.querySelector('.icon-badge');
    
    reorderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let count = parseInt(cartBadge.textContent);
            cartBadge.textContent = count + 1;
            
            // Animation
            this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
            this.style.background = '#28a745';
            this.style.borderColor = '#28a745';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Reorder';
                this.style.background = '';
                this.style.borderColor = '';
            }, 2000);
        });
    });
    
    // View details button
    const viewBtns = document.querySelectorAll('.btn-view');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Order details would show here\n(In a real app, this would show order details)');
        });
    });
    
    // Track order button
    const trackBtns = document.querySelectorAll('.btn-track');
    trackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Tracking information would show here\n(In a real app, this would show delivery tracking)');
        });
    });
});