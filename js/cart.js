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

document.addEventListener('DOMContentLoaded', function() {
    // Quantity selectors
    const minusBtns = document.querySelectorAll('.minus');
    const plusBtns = document.querySelectorAll('.plus');
    const qtyInputs = document.querySelectorAll('.qty-input');
    const removeBtns = document.querySelectorAll('.remove-btn');
    const cartItems = document.querySelectorAll('.cart-item');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutSection = document.getElementById('checkout-section');
    
    // Update quantity
    function updateQuantity(input, change) {
        let currentValue = parseInt(input.value);
        let newValue = currentValue + change;
        
        if (newValue < 1) newValue = 1;
        if (newValue > 99) newValue = 99;
        
        input.value = newValue;
        updateTotals();
    }
    
    // Update totals
    function updateTotals() {
        // In a real app, this would calculate based on items
        // For this demo, we'll just update the badge counts
        let totalItems = 0;
        
        qtyInputs.forEach(input => {
            totalItems += parseInt(input.value);
        });
        
        document.querySelector('.icon-badge').textContent = totalItems;
        document.querySelector('.nav-badge').textContent = totalItems;
    }
    
    // Set up event listeners
    minusBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            updateQuantity(qtyInputs[index], -1);
        });
    });
    
    plusBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            updateQuantity(qtyInputs[index], 1);
        });
    });
    
    removeBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            cartItems[index].style.opacity = '0';
            cartItems[index].style.height = '0';
            cartItems[index].style.padding = '0';
            cartItems[index].style.margin = '0';
            cartItems[index].style.border = 'none';
            
            setTimeout(() => {
                cartItems[index].remove();
                updateTotals();
            }, 300);
        });
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        checkoutSection.style.display = 'block';
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize totals
    updateTotals();
});