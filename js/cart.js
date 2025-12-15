const accessToken = getCookie("access");

showPreloader("Loading your cart items");

// =========================
// DOM CACHE FOR PERFORMANCE
// =========================
const CART_DOM = {
    cartContainer: null,
    summaryContainer: null,
    cartBadge: null,
    stateSelect: null,
    editModal: null
};

function cacheCartDOM() {
    CART_DOM.cartContainer = document.querySelector('.cart-items');
    CART_DOM.summaryContainer = document.querySelector('.summary-container');
    CART_DOM.cartBadge = document.getElementById("cart-count");
    CART_DOM.stateSelect = document.getElementById('stateSelect');
    CART_DOM.editModal = document.getElementById('editModal');
}


document.addEventListener('DOMContentLoaded', function() {
    cacheCartDOM();
    
    if (!accessToken){
        hidePreloader();
        return;
    } 

    async function fetchCartItems() {
        try {
            const response = await fetch(`${ASO_URL}/cart/`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            if (response.status === 401) return;


            const data = await response.json();
            renderCartItems(data.data);
            updateSummary(data.data);
            renderSummary(data.data)

        } catch (error) {
            showErrorModal(error.message || "Failed to load cart items.");
        } finally {
            hidePreloader();
        }
    }

    function renderCartItems(data) {
        if (!data || !data.items || data.items.length === 0) {
            CART_DOM.cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            hidePreloader();
            return;
        }

        const headerHTML = `
            <div class="cart-header">
                <h2>Cart Items</h2>
                <button class="delete-all-btn">
                    <i class="fas fa-trash"></i> Remove All
                </button>
            </div>
        `;
        CART_DOM.cartContainer.innerHTML = headerHTML;
        
        // Use DocumentFragment for batch DOM insertion
        const fragment = document.createDocumentFragment();
        
        data.items.forEach(item => {
        const descText = item.desc 
            ? `<div class="desc-container">
                <span><strong>Desc:</strong> Color: ${item.desc.color || 'N/A'}, Size: ${item.desc.size || 'N/A'}</span>
                <button class="edit-desc-btn" data-item-id="${item.id}" style="background:none;border:none;cursor:pointer;padding:6px 10px;display:inline-flex;align-items:center;">
                    <i class="fas fa-edit" style="color:#007bff;margin-left:8px;font-size:18px;"></i>
                </button>
            </div>`
            : `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: N/A, Size: N/A</span>
                    <button class="edit-desc-btn" data-item-id="${item.id}" style="background:none;border:none;cursor:pointer;padding:6px 10px;display:inline-flex;align-items:center;">
                    <i class="fas fa-edit" style="color:#007bff;margin-left:8px;font-size:18px;"></i>
                </button>
            </div>`;

            const cartItem = document.createElement('div');
            cartItem.className = "cart-item";
            cartItem.setAttribute("data-item-id", item.id);
            cartItem.innerHTML = `
                <a href="${generateProductUrl(item.product_id, item.product_title)}">
                    <div class="cart-item-image" style="background-image: url('${item.product_image || "img/product_image.png"}');"></div>
                </a>
                </div>
                <div class="cart-item-details">
                    <a href="${generateProductUrl(item.product_id, item.product_title)}" style="text-decoration:none">
                        <div class="cart-item-title">${item.product_title}</div>
                    </a>
                    ${descText ? `<div class="cart-item-desc">${descText}</div>` : ""}
                    <div class="cart-item-price">₦${formatNumber(item.product_price)}</div>
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
            fragment.appendChild(cartItem);
        });
        
        // Single DOM insertion
        CART_DOM.cartContainer.appendChild(fragment);
        
        // Event delegation for edit buttons
        CART_DOM.cartContainer.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-desc-btn');
            if (!editBtn) return;
            
            editingItemId = editBtn.dataset.itemId;

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

                // Add default "None" option for colors
                const noneColorOption = document.createElement('option');
                noneColorOption.value = '';
                noneColorOption.textContent = '-- Select Color --';
                colorSelect.appendChild(noneColorOption);

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
                }

                // Add default "None" option for sizes
                const noneSizeOption = document.createElement('option');
                noneSizeOption.value = '';
                noneSizeOption.textContent = '-- Select Size --';
                sizeSelect.appendChild(noneSizeOption);

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
                }
            }

            // Show modal
            document.getElementById('editModal').classList.remove('hidden');
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('editModal').classList.add('hidden');
        });

        attachCartListeners();

        const deleteAllBtn = document.querySelector(".delete-all-btn");
        deleteAllBtn.addEventListener("click", showDeleteAllDialog);

    }

    function showDeleteAllDialog() {
        const badge = document.getElementById("cart-count");
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <h3>Delete All Items?</h3>
                <p>Are you sure you want to remove all items from your cart?</p>
                <div class="dialog-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn">Yes, Delete All</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle actions
        overlay.querySelector(".cancel-btn").addEventListener("click", () => {
            overlay.remove();
        });

        overlay.querySelector(".confirm-btn").addEventListener("click", () => {
            overlay.remove();
            // TODO: Call your delete-all endpoint here
            showPreloader("Removing all cart items");
            fetch(`${ASO_URL}/cart/clear/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${accessToken}`
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.is_success) {
                    badge.textContent = 0;
                    renderCartItems({ items: [] });
                } else {
                    showErrorModal('Failed to clear cart. Please try again.');
                }
            })
            .catch(error => {
                showErrorModal('Failed to clear cart. Please try again.');
            })
            .finally(() => {
                hidePreloader();
            });
        });
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update description');
            }
            return response.json();
        })
        .then(data => {
            fetchCartItems();
            document.getElementById('editModal').classList.add('hidden');
        })
        .catch(error => {
            showErrorModal('Failed to update description. Please try again.');
        })
        .finally(() => {
            hidePreloader();
        });
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
        CART_DOM.summaryContainer.innerHTML = "";

        data.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = "order-item";
            const totalPrice = parseFloat(item.product_price) * item.quantity;
            cartItem.innerHTML = `
            <div class="order-item-info">
                <a href="${generateProductUrl(item.product_id, item.product_title)}">
                    <div class="order-item-image" style="background-image: url('${item.product_image || "img/product_image.png"}');"></div>
                </a>
                <div class="order-item-details">
                    <a href="${generateProductUrl(item.product_id, item.product_title)}" style="text-decoration:none">
                        <div class="order-item-name">${item.product_title}</div>
                    </a>
                    <div class="order-item-price">₦${formatNumber(item.product_price)} × ${item.quantity}</div>
                </div>
            </div>
            <div class="order-item-total"><b>₦${formatNumber(totalPrice)}</b></div>

            `;
            CART_DOM.summaryContainer.appendChild(cartItem);

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
        .catch((error) => {
            showErrorModal('Failed to update cart. Please try again.');
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
        .catch((error) => {
            showErrorModal('Failed to remove item. Please try again.');
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
            el.textContent = `₦${formatNumber(subtotal)}`;
        });
        document.querySelectorAll('.summary-shipping').forEach(el => {
            el.textContent = `₦${formatNumber(shipping)}`;
        });
        // document.querySelectorAll('.summary-tax').forEach(el => {
        //     el.textContent = `₦${tax.toLocaleString()}`;
        // });
        document.querySelectorAll('.summary-discount').forEach(el => {
            el.textContent = `₦${formatNumber(discount)}`;
        });
        document.querySelectorAll('.summary-total').forEach(el => {
            el.textContent = `₦${formatNumber(total)}`;
        });
    }

    fetchCartItems()

    async function checkReferralFeature() {
        const featureFlagName = "Referral System";
        try {
            const res = await fetch(`${ASO_URL}/feature-flag/${encodeURIComponent(featureFlagName)}/`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            const result = await res.json();

            const referralSection = document.querySelector(".referral-code-section");

            if (result?.data === true) {
                referralSection.style.display = "block";
            } else {
                referralSection.style.display = "none";
            }
        } catch (err) {
            document.querySelector(".referral-code-section").style.display = "none";
        }
    }
    checkReferralFeature();

    
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutSection = document.getElementById('checkout-section');
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        const cartCount = parseInt(document.getElementById("cart-count").textContent) || 0;

        if (cartCount < 1) {
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Your cart is empty. Please add at least one item before proceeding to checkout.</p>
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn1">Okay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle actions
            overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                overlay.remove();
            });

            overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                overlay.remove();
            });

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
            // Error updating state - silently fail
        } finally {
            hidePreloader();
        }
    })
    

});

const applyReferralBtn = document.getElementById("applyReferralBtn");
const referralInput = document.getElementById("referralInput");
const referralFeedback = document.getElementById("referralFeedback");

applyReferralBtn.addEventListener("click", async () => {
    const code = referralInput.value.trim();
    if (!code) {
        referralFeedback.textContent = "Please enter a referral code.";
        referralFeedback.style.color = "orange";
        return;
    }

    referralFeedback.textContent = "Checking code...";
    referralFeedback.style.color = "#555";

    try {
        const res = await fetch(`${AUTH_URL}/referral/validate/${code}/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const data = await res.json();

        if (res.ok && data?.is_success) {
            referralFeedback.textContent = "✅ Referral code applied successfully!";
            referralFeedback.style.color = "green";

        } else {
            referralFeedback.textContent = `❌ ${data.message}.`;
            referralFeedback.style.color = "red";
        }
    } catch (err) {
        referralFeedback.textContent = "⚠️ Could not verify code. Try again.";
        referralFeedback.style.color = "red";
    }
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

    // Get selected payment gateway
    const paymentGateway = document.querySelector('input[name="paymentGateway"]:checked')?.value || 'paystack';

    // Check if Monnify is selected (not available)
    if (paymentGateway === 'monnify') {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p><strong>Payment Gateway Not Available</strong></p>
                <p>Monnify payment gateway is currently not available. Please select another payment method to continue.</p>
                <div class="dialog-actions">
                    <button class="confirm-btn1">Okay</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
            overlay.remove();
        });
        return;
    }

    // Validation
if (!firstName || !lastName || !address || !city || !state || !phone || !paymentGateway || !altPhone || !otherInfo) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p>Please fill in all required fields.</p>
                <div class="dialog-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn1">Okay</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle actions
        overlay.querySelector(".cancel-btn").addEventListener("click", () => {
            overlay.remove();
        });

        overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
            overlay.remove();
        });
        return;

    }

    // Validate phone numbers
    const phoneRegex = /^(\+234|0)[0-9]{10}$/; // Nigerian phone format
    
    if (!phoneRegex.test(phone)) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p><strong>Invalid Phone Number</strong></p>
                <p>Please enter a valid phone number. Format: +234XXXXXXXXXX or 0XXXXXXXXXX</p>
                <div class="dialog-actions">
                    <button class="confirm-btn1">Okay</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
            overlay.remove();
        });
        return;
    }

    if (!phoneRegex.test(altPhone)) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p><strong>Invalid Alternate Phone Number</strong></p>
                <p>Please enter a valid alternate phone number. Format: +234XXXXXXXXXX or 0XXXXXXXXXX</p>
                <div class="dialog-actions">
                    <button class="confirm-btn1">Okay</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
            overlay.remove();
        });
        return;
    }

    if (parseInt(total) <= 0) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p>Total amount must be greater than ₦0</p>
                <div class="dialog-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn1">Okay</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle actions
        overlay.querySelector(".cancel-btn").addEventListener("click", () => {
            overlay.remove();
        });

        overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
            overlay.remove();
        });
        return;
    }

    // Show order confirmation modal with important warnings
    const confirmModal = document.createElement("div");
    confirmModal.className = "dialog-overlay";
    confirmModal.innerHTML = `
        <div class="dialog-box" style="max-width: 550px; max-height: 90vh; overflow-y: auto;">
            <h3 style="color: #8a4b38; margin-bottom: 15px; font-size: 18px;">
                <i class="fas fa-exclamation-triangle" style="color: #ff9800; margin-right: 8px;"></i>
                Order Confirmation
            </h3>
            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; border-radius: 4px; margin-bottom: 15px; font-size: 14px;">
                <p style="margin: 8px 0;"><strong>⚠️ Important Notice:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin: 6px 0;"><strong>Order Location:</strong> Once your order is placed, the delivery location <strong>cannot be changed</strong>.</li>
                    <li style="margin: 6px 0;"><strong>Phone Availability:</strong> Make sure your shipping phone number is <strong>active and reachable</strong> during delivery.</li>
                    <li style="margin: 6px 0;"><strong>Delivery Address:</strong> The address you provided will be used as the <strong>exact delivery location</strong>.</li>
                    <li style="margin: 6px 0;"><strong>Verification:</strong> Please verify all shipping details are correct before proceeding.</li>
                </ul>
            </div>
            <div style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 13px;">
                <p style="margin: 8px 0;"><strong>Delivery Details:</strong></p>
                <p style="margin: 6px 0;">📍 <strong>Address:</strong> ${address}, ${city}, ${state}</p>
                <p style="margin: 6px 0;">📞 <strong>Phone:</strong> ${phone}</p>
                <p style="margin: 6px 0;">📞 <strong>Alternate Phone:</strong> ${altPhone}</p>
            </div>
            <div class="dialog-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="cancel-btn" style="flex: 1; padding: 12px;">Edit Details</button>
                <button class="confirm-btn1" style="flex: 1; padding: 12px; background-color: #28a745;">Proceed with Order</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);

    // Handle cancel - go back to edit
    confirmModal.querySelector(".cancel-btn").addEventListener("click", () => {
        confirmModal.remove();
    });

    // Handle confirm - proceed with order
    confirmModal.querySelector(".confirm-btn1").addEventListener("click", async () => {
        confirmModal.remove();
        await submitOrder(firstName, lastName, address, city, state, phone, altPhone, otherInfo, total, paymentGateway);
    });
});

// Separate function to handle actual order submission
async function submitOrder(firstName, lastName, address, city, state, phone, altPhone, otherInfo, total, paymentGateway) {
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
            otherInfo: otherInfo,
            payment_type: paymentGateway
        },
    };

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
            window.open(result.data.checkout_url, '_blank');
        } else {
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Order failed: ${result.message || 'Please try again.'}</p>
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn1">Okay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle actions
            overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                overlay.remove();
            });

            overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                overlay.remove();
            });
        }
    } catch (err) {
        showErrorModal(err.message || 'An error occurred. Please try again.');
    } finally {
        hidePreloader();
    }
}


async function loadStates() {
    try {
        const res = await fetch(`${ASO_URL}/delivery-fees/`);
        if (!res.ok) {
            throw new Error('Failed to load delivery fees');
        }
        const data = await res.json();
        if (!data || !data.delivery_fees || !Array.isArray(data.delivery_fees)) {
            throw new Error('Invalid delivery fees data format');
        }
        const select = document.getElementById("stateSelect");
        if (!select) {
            throw new Error('State select element not found');
        }
        data.delivery_fees.forEach(item => {
            if (!item.state || item.fee === undefined) {
                // skip invalid
                return;
            }
            const option = document.createElement("option");
            option.value = item.state;
            option.setAttribute("data-fee", item.fee);
            option.textContent = item.state;
            select.appendChild(option);
        });
    } catch (error) {
        showErrorModal('Failed to load delivery locations. Please refresh the page.');
    }
}

  function showShippingFee() {
    const select = document.getElementById("stateSelect");
    const selectedOption = select.options[select.selectedIndex];
    const fee = selectedOption.getAttribute("data-fee");

    if (fee) {
      document.getElementById("shippingInfo").textContent =
        `${selectedOption.value} : Shipping = ₦${formatNumber(fee)}`;
    } else {
      document.getElementById("shippingInfo").textContent = '';
    }
}

loadStates();


