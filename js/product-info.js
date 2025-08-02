function loadCartData() {
    showPreloader("Loading your cart items");
    
    // Simulate API call to backend
    setTimeout(() => {
        // After data is loaded
        hidePreloader();
        cartContainer.style.display = 'block';
    }, 2500); // 2.5 seconds delay to simulate network request
}

// Initialize cart
loadCartData();

// Thumbnail Gallery Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Thumbnail selection
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(color => {
        color.addEventListener('click', function() {
            colorOptions.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Size selection
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(size => {
        size.addEventListener('click', function() {
            sizeOptions.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Quantity selector
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.querySelector('.qty-input');
    
    minusBtn.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        if (value > 1) {
            qtyInput.value = value - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        qtyInput.value = value + 1;
    });
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add to cart animation
    const addToCartBtn = document.querySelector('.btn-add-cart');
    const cartBadge = document.querySelector('.icon-badge');
    
    addToCartBtn.addEventListener('click', function() {
        let count = parseInt(cartBadge.textContent);
        cartBadge.textContent = count + 1;
        
        // Animation
        this.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        this.style.background = '#28a745';
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            this.style.background = '';
        }, 2000);
    });
    
    // Wishlist button toggle
    const wishlistBtn = document.querySelector('.btn-wishlist');
    wishlistBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.style.color = '#e74c3c';
            this.style.borderColor = '#e74c3c';
            
            // Update wishlist count
            const wishlistCount = document.querySelector('.nav-badge');
            wishlistCount.textContent = parseInt(wishlistCount.textContent) + 1;
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.style.color = '';
            this.style.borderColor = '';
            
            // Update wishlist count
            const wishlistCount = document.querySelector('.nav-badge');
            wishlistCount.textContent = parseInt(wishlistCount.textContent) - 1;
        }
    });
});