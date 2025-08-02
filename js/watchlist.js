const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

function loadCartData() {
    showPreloader("Loading your watchlist items");
    
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
    // Wishlist functionality
    const wishlistButtons = document.querySelectorAll('.wishlist-button');
    const wishlistCountElement = document.querySelector('.nav-badge');
    let wishlistCount = 4;
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                wishlistCount--;
                
                // Animation
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 300);
            }
            
            // Update wishlist count
            wishlistCountElement.textContent = wishlistCount;
            
            // If count reaches zero, show empty state
            if (wishlistCount === 0) {
                showEmptyWatchlist();
            }
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
    
    // Clear all button
    const clearAllBtn = document.querySelector('.btn-clear-all');
    clearAllBtn.addEventListener('click', function() {
        document.querySelectorAll('.wishlist-button.active').forEach(btn => {
            btn.classList.remove('active');
            btn.closest('.product-card').style.opacity = '0';
            btn.closest('.product-card').style.height = '0';
            btn.closest('.product-card').style.padding = '0';
            btn.closest('.product-card').style.margin = '0';
            
            setTimeout(() => {
                btn.closest('.product-card').remove();
            }, 300);
        });
        
        wishlistCount = 0;
        wishlistCountElement.textContent = wishlistCount;
        showEmptyWatchlist();
    });
    
    // Move all to cart button
    const moveAllBtn = document.querySelector('.btn-move-all');
    moveAllBtn.addEventListener('click', function() {
        addToCartButtons.forEach(button => {
            let count = parseInt(cartBadge.textContent);
            cartBadge.textContent = count + 1;
            
            // Animation for each button
            button.textContent = '✓ Added!';
            button.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.style.backgroundColor = '';
            }, 2000);
        });
        
        // Show confirmation
        this.innerHTML = '<i class="fas fa-check"></i> All Items Moved!';
        this.style.background = '#28a745';
        this.style.borderColor = '#28a745';
        this.style.color = 'white';
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-shopping-cart"></i> Move All to Cart';
            this.style.background = '';
            this.style.borderColor = '';
            this.style.color = '';
        }, 3000);
    });
    
    // Show empty watchlist state
    function showEmptyWatchlist() {
        const productSection = document.querySelector('.product-section');
        productSection.innerHTML = `
            <div class="empty-watchlist fade-in">
                <div class="empty-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <h2 class="empty-title">Your Watchlist is Empty</h2>
                <p class="empty-text">
                    You haven't added any items to your watchlist yet. Start exploring our beautiful collection of Aso Oke and Aso Ofi fabrics and save your favorites!
                </p>
                <button class="btn-shop">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </button>
            </div>
        `;
    }
});