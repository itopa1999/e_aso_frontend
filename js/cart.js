const accessToken = getCookie("access");

showPreloader("Loading your cart items");



document.addEventListener('DOMContentLoaded', function() {
    if (!accessToken){
        hidePreloader();
        return;
    } 
    const cartContainer = document.querySelector('.cart-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTax = document.getElementById('summary-tax');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTotal = document.getElementById('summary-total');

    async function fetchCartItems() {
        try {
            const response = await fetch(`${ASO_URL}/cart/`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            const data = await response.json();
            renderCartItems(data);
            updateSummary(data);
        } catch (error) {
            alert("Failed to load cart items.");
        } finally {
            hidePreloader();
        }
    }

    function renderCartItems(data) {
        cartContainer.innerHTML = "";
        if (!data.items || data.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <small>Looks like you haven’t added anything yet.</small>
                    <a href="index.html" class="start-shopping-btn">
                        <i class="fas fa-store"></i> Start Shopping
                    </a>
                </div>
            `;
            return;
        }
        data.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = "cart-item";
            cartItem.setAttribute("data-item-id", item.id);
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <a href="product-info.html?id=${item.product_id}">
                        <img src="${item.product_image}" alt="${item.product_title}" style="width: 60px; height: 60px; object-fit: cover;">
                    </a>
                </div>
                <div class="cart-item-details">
                    <a href="product-info.html?id=${item.product_id}" style="text-decoration:none">
                        <div class="cart-item-title">${item.product_title}</div>
                    </a>
                    <div class="cart-item-price">₦${parseFloat(item.product_price).toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn minus">-</button>
                            <input type="text" class="qty-input" value="${item.quantity}">
                            <button class="qty-btn plus">+</button>
                        </div>
                        <button class="remove-btn">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(cartItem);
        });
        attachCartListeners();
    }

    // Event listeners for quantity & remove
    function attachCartListeners() {
        const cartItems = document.querySelectorAll('.cart-item');

        cartItems.forEach(cartItem => {
            const itemId = cartItem.dataset.itemId;
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const qtyInput = cartItem.querySelector('.qty-input');
            const removeBtn = cartItem.querySelector('.remove-btn');

            minusBtn.addEventListener('click', () => updateQuantity(itemId, qtyInput, -1));
            plusBtn.addEventListener('click', () => updateQuantity(itemId, qtyInput, 1));
            removeBtn.addEventListener('click', () => removeItem(itemId, cartItem));
        });
    }

    // Update quantity in backend
    function updateQuantity(itemId, input, delta) {
        showPreloader("Updating Cart");
        
        let newQty = parseInt(input.value) + delta;
        newQty = Math.max(1, Math.min(newQty, 99));
        input.value = newQty;

        fetch(`${ASO_URL}/cart/update-quantity/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ item_id: itemId, quantity: newQty })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to update quantity");
            }
            return res.json();
        })
        .then(() => {
            fetchCartItems();
        })
        .catch(() => {
            alert("Error updating quantity.");
        })
        .finally(() => {
            hidePreloader();
        });
    }

    // Remove item from cart
    function removeItem(itemId, cartElement) {
        showPreloader("Removing Item");

        fetch(`${ASO_URL}/cart/remove-item/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ item_id: itemId })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to remove item");
            }
            return res.json();
        })
        .then(() => {
            cartElement.remove();
            const badge = document.getElementById("cart-count");
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = Math.max(0, current - 1);
            fetchCartItems();
        })
        .catch(() => {
            alert("Error removing item.");
        })
        .finally(() => {
            hidePreloader();
        });
    }


    // Update order summary
    function updateSummary(data) {
       const isCartEmpty = !data.items || data.items.length === 0;

        const subtotal = isCartEmpty ? 0 : parseFloat(data.subtotal);
        const shipping = isCartEmpty ? 0 : parseFloat(data.shipping);
        const tax = isCartEmpty ? 0 : parseFloat(data.tax);
        const discount = isCartEmpty ? 0 : parseFloat(data.discount);
        const total = isCartEmpty ? 0 : parseFloat(data.total);

        document.querySelectorAll('.summary-subtotal').forEach(el => {
            el.textContent = `₦${subtotal.toLocaleString()}`;
        });
        document.querySelectorAll('.summary-shipping').forEach(el => {
            el.textContent = `₦${shipping.toLocaleString()}`;
        });
        document.querySelectorAll('.summary-tax').forEach(el => {
            el.textContent = `₦${tax.toLocaleString()}`;
        });
        document.querySelectorAll('.summary-discount').forEach(el => {
            el.textContent = `₦${discount.toLocaleString()}`;
        });
        document.querySelectorAll('.summary-total').forEach(el => {
            el.textContent = `₦${total.toLocaleString()}`;
        });
    }

    fetchCartItems()

    
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutSection = document.getElementById('checkout-section');
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        const cartCount = parseInt(document.getElementById("cart-count").textContent) || 0;

        if (cartCount < 1) {
            alert("Your cart is empty. Please add at least one item before proceeding to checkout.");
            return;
        }
        checkoutSection.style.display = 'block';
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelector('.continue-btn').addEventListener('click', function(){
        window.location.href = 'index.html';
    })
    

});