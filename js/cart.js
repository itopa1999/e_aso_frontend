const accessToken = getCookie("access");

showPreloader("Loading your cart items");



document.addEventListener('DOMContentLoaded', function() {
    if (!accessToken){
        hidePreloader();
        return;
    } 
    const cartContainer = document.querySelector('.cart-items');
    const summaryContainer = document.querySelector('.summary-container'); 

    async function fetchCartItems() {
        try {
            const response = await fetch(`${ASO_URL}/cart/`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            if (response.status === 401) return;
            

            const data = await response.json();
            renderCartItems(data);
            updateSummary(data);
            renderSummary(data)
            
        } catch (error) {
            alert("Failed to load cart items.");
        } finally {
            hidePreloader();
        }
    }

    function renderCartItems(data) {
        console.log(data)
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
        const descText = item.desc 
            ? `<div class="desc-container">
                <span><strong>Desc:</strong> Color: ${item.desc.color || 'N/A'}, Size: ${item.desc.size || 'N/A'}</span>
                <button class="edit-desc-btn" data-item-id="${item.id}" style="background:none;border:none;cursor:pointer;">
                    <i class="fas fa-edit" style="color:#007bff;margin-left:8px;"></i>
                </button>
            </div>`
            : `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: N/A, Size: N/A</span>
                    <button class="edit-desc-btn" data-item-id="${item.id}" style="background:none;border:none;cursor:pointer;">
                    <i class="fas fa-edit" style="color:#007bff;margin-left:8px;"></i>
                </button>
            </div>`;

            const cartItem = document.createElement('div');
            cartItem.className = "cart-item";
            cartItem.setAttribute("data-item-id", item.id);
            cartItem.innerHTML = `
                <a href="product-info.html?id=${item.product_id}">
                    <div class="cart-item-image" style="background-image: url('${item.product_image || "img/product_image.png"}');"></div>
                </a>
                </div>
                <div class="cart-item-details">
                    <a href="product-info.html?id=${item.product_id}" style="text-decoration:none">
                        <div class="cart-item-title">${item.product_title}</div>
                    </a>
                    ${descText ? `<div class="cart-item-desc">${descText}</div>` : ""}
                    <div class="cart-item-price">₦${parseFloat(item.product_price).toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn minus">-</button>
                            <input type="text" class="qty-input" value="${item.quantity}" disabled>
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
        document.querySelectorAll('.edit-desc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                editingItemId = e.target.closest('button').dataset.itemId;

                const itemData = data.items.find(item => item.id == editingItemId);
                if (itemData) {
                    // Dynamically update modal title
                    document.querySelector('#editModal .modal-content h3').innerText =
                        `Edit Description for ${itemData.product_title}`;

                    // Get dropdown elements
                    const colorSelect = document.getElementById('editColor');
                    const sizeSelect = document.getElementById('editSize');

                    // Clear old options
                    colorSelect.innerHTML = '';
                    sizeSelect.innerHTML = '';

                    // Populate colors
                    if (itemData.product_colors && itemData.product_colors.length > 0) {
                        itemData.product_colors.forEach(color => {
                            const option = document.createElement('option');
                            option.value = color.name;
                            option.textContent = color.name;
                            if (itemData.desc && itemData.desc.color === color.name) {
                                option.selected = true; // default selected color
                            }
                            colorSelect.appendChild(option);
                        });
                    } else {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No colors available';
                        colorSelect.appendChild(option);
                    }

                    // Populate sizes
                    if (itemData.product_sizes && itemData.product_sizes.length > 0) {
                        itemData.product_sizes.forEach(size => {
                            const option = document.createElement('option');
                            option.value = size;
                            option.textContent = size;
                            if (itemData.desc && itemData.desc.size === size) {
                                option.selected = true; // default selected size
                            }
                            sizeSelect.appendChild(option);
                        });
                    } else {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No sizes available';
                        sizeSelect.appendChild(option);
                    }
                }

                // Show modal
                document.getElementById('editModal').classList.remove('hidden');
            });
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('editModal').classList.add('hidden');
        });

        attachCartListeners();
    }

    document.getElementById('saveEdit').addEventListener('click', function () {
        const color = document.getElementById('editColor').value;
        const size = document.getElementById('editSize').value;

        const descData = {
            item_id: editingItemId,
            desc: { 
                color: color, 
                size: size 
            }
        };

        showPreloader("Updating description");
        fetch(`${ASO_URL}/cart/update-desc/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
                
            },
            body: JSON.stringify(descData)
        })
        .then(response => response.json())
        .then(data => {
            fetchCartItems();
            document.getElementById('editModal').classList.add('hidden');
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            hidePreloader();
        });;
    });


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

    function renderSummary(data) {
        summaryContainer.innerHTML = "";

        data.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = "order-item";
            const totalPrice = parseFloat(item.product_price) * item.quantity;
            cartItem.innerHTML = `
            <div class="order-item-info">
                <a href="product-info.html?id=${item.product_id}">
                    <div class="order-item-image" style="background-image: url('${item.product_image || "img/product_image.png"}');"></div>
                </a>
                <div class="order-item-details">
                    <a href="product-info.html?id=${item.product_id}" style="text-decoration:none">
                        <div class="order-item-name">${item.product_title}</div>
                    </a>
                    <div class="order-item-price">₦${parseFloat(item.product_price).toLocaleString()} × ${item.quantity}</div>
                </div>
            </div>
            <div class="order-item-total"><b>₦${totalPrice.toLocaleString()}</b></div>

            `;
            summaryContainer.appendChild(cartItem);

        })
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
        // const tax = isCartEmpty ? 0 : parseFloat(data.tax);
        const discount = isCartEmpty ? 0 : parseFloat(data.discount);
        const total = isCartEmpty ? 0 : parseFloat(data.total);

        document.querySelectorAll('.summary-subtotal').forEach(el => {
            el.textContent = `₦${subtotal.toLocaleString()}`;
        });
        document.querySelectorAll('.summary-shipping').forEach(el => {
            el.textContent = `₦${shipping.toLocaleString()}`;
        });
        // document.querySelectorAll('.summary-tax').forEach(el => {
        //     el.textContent = `₦${tax.toLocaleString()}`;
        // });
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

    document.getElementById('stateSelect').addEventListener('change', async function () {
        const selectedState = this.value;

        if (!selectedState) return;
        showPreloader("Updating your cart");

        try {
            const res = await fetch(`${ASO_URL}/cart/update-state/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ state: selectedState })
            });
            fetchCartItems()
        } catch (error) {
            console.error('Error updating state:', error);
        } finally {
            hidePreloader();
        }
    })
    

});




document.querySelector('.place-order-btn').addEventListener('click', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('stateSelect').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const altPhone = document.getElementById('altPhone').value.trim();
    const otherInfo = document.getElementById('otherInfo').value.trim();

    const total = parseFloat(document.querySelector('.summary-total').textContent.replace(/[^\d.]/g, ''));

    // Validation
    if (!firstName || !lastName || !address || !city || !state || !phone) {
        alert("Please fill in all required fields.");
        return;
    }

    if (parseInt(total) <= 0) {
        alert("Total amount must be greater than ₦0.");
        return;
    }

    // Prepare data
    const orderData = {
        shipping_info: {
            first_name: firstName,
            last_name: lastName,
            address: address,
            city: city,
            state: state,
            phone: phone,
            alt_phone: altPhone,
            total: total,
            otherInfo: otherInfo
        }
    };

    console.log(orderData)

    showPreloader("placing your order");

    try {
        const response = await fetch(`${ASO_URL}/place-orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        if (response.ok) {
            window.open(result.checkout_url, '_blank');
        } else {
            alert('Order failed: ' + (result.message || 'Please try again.'));
        }
    } catch (err) {
        console.error('Order error:', err);
        alert('An error occurred. Please try again.');
    } finally {
        hidePreloader();
    }
});


async function loadStates() {
    const res = await fetch(`${ASO_URL}/delivery-fees/`);
    const data = await res.json();

    const select = document.getElementById("stateSelect");
    data.delivery_fees.forEach(item => {
      const option = document.createElement("option");
      option.value = item.state;
      option.setAttribute("data-fee", item.fee);
      option.textContent = item.state;
      select.appendChild(option);
    });
  }

  function showShippingFee() {
    const select = document.getElementById("stateSelect");
    const selectedOption = select.options[select.selectedIndex];
    const fee = selectedOption.getAttribute("data-fee");

    if (fee) {
      document.getElementById("shippingInfo").textContent =
        `${selectedOption.value} : Shipping = ₦${parseInt(fee).toLocaleString()}`;
    } else {
      document.getElementById("shippingInfo").textContent = '';
    }
}

loadStates();


