function loadCartData() {
    showPreloader("Loading items on desk");
    
    // Simulate API call to backend
    setTimeout(() => {
        // After data is loaded
        hidePreloader();
        // cartContainer.style.display = 'block';
    }, 2500); // 2.5 seconds delay to simulate network request
}

// Initialize cart
loadCartData();

// Filter sidebar functionality
const filterButton = document.getElementById('filter-button');
const filterSidebar = document.getElementById('filter-sidebar');
const closeFilter = document.getElementById('close-filter');
const overlay = document.getElementById('overlay');

filterButton.addEventListener('click', function() {
    filterSidebar.classList.add('open');
    overlay.classList.add('active');
});

closeFilter.addEventListener('click', function() {
    filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', function() {
    filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

// Wishlist functionality
document.addEventListener('DOMContentLoaded', function() {
    const wishlistButtons = document.querySelectorAll('.wishlist-button');
    const wishlistCountElement = document.getElementById('wishlist-count');
    let wishlistCount = 0;
    let wishlistItems = [];
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const heartIcon = this.querySelector('i');
            
            if (heartIcon.classList.contains('far')) {
                // Add to wishlist
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                this.classList.add('active');
                wishlistCount++;
                wishlistItems.push(productId);
            } else {
                // Remove from wishlist
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                this.classList.remove('active');
                wishlistCount--;
                wishlistItems = wishlistItems.filter(id => id !== productId);
            }
            
            // Update wishlist count
            wishlistCountElement.textContent = wishlistCount;
            
            // Animation
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);
        });
    });
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartBadge = document.querySelector('.icon-badge');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            let count = parseInt(cartBadge.textContent);
            cartBadge.textContent = count + 1;
            
            // Animation
            button.textContent = '✓ Added!';
            button.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.style.backgroundColor = '';
            }, 2000);
        });
    });
    
    // Price range slider value update
    const priceRange = document.querySelector('.price-range');
    const priceValue = document.querySelector('.price-values span:nth-child(2)');
    
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            priceValue.textContent = '₦' + value.toLocaleString();
        });
    }
    
    // Product card animations
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 300);
    });
});