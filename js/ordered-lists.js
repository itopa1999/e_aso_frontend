const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

const ordersContainer = document.querySelector('.orders-container');
let allOrders = [];

showPreloader("Loading your ordered items");

async function loadOrders() {
    try {
        const res = await fetch(`${ASO_URL}/lists/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const data = await res.json();
        allOrders = data.results;
        renderOrders(allOrders);
    } catch (error) {
        console.error("Error loading orders:", error);
        ordersContainer.innerHTML = "<p>Failed to load orders. Please try again.</p>";
    } finally {
        hidePreloader();
    }
}


// Render Orders
function renderOrders(orders) {
    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    orders.forEach(order => {
        const statusClass = `status-${order.order_status.replace(/_/g, '-')}`;

        const itemHtml = order.order_items.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <a href="product-info.html?id=${item.product_id}">
                        <img src="${item.product_image}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover;">
                    </a>
                </div>
                <div class="order-item-details">
                    <a href="product-info.html?id=${item.product_id}" style="text-decoration:none">
                        <div class="order-item-name">${item.product_name}</div>
                    </a>
                    <div class="order-item-price">₦${parseFloat(item.price).toLocaleString()}</div>
                    <div class="order-item-qty">Quantity: ${item.quantity}</div>
                </div>
            </div>
        `).join("");

        const card = document.createElement('div');
        card.className = `order-card fade-in`;
        card.setAttribute('data-status', order.order_status); // for filtering
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order ${order.order_number}</div>
                    <div class="order-date">Placed on ${formatDateToHuman(order.created_at)}</div>
                </div>
                <div class="order-status ${statusClass}">${order.order_status.replace(/_/g, ' ')}</div>
            </div>

            <div class="order-body">
                <div class="order-items">${itemHtml}</div>

                <div class="order-summary">
                    <div class="summary-row">
                        <div class="summary-label">Subtotal</div>
                        <div class="summary-value">₦${parseFloat(order.subtotal).toLocaleString()}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Shipping</div>
                        <div class="summary-value">₦${parseFloat(order.shipping).toLocaleString()}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Discount</div>
                        <div class="summary-value" style="color:#28a745;">-₦${parseFloat(order.discount).toLocaleString()}</div>
                    </div>
                    <div class="summary-total">
                        <div>Total</div>
                        <div>₦${parseFloat(order.total).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div class="order-actions">
                <button class="action-btn btn-view" data-id="${order.id}"><i class="fas fa-file-alt"></i> View Details</button>
                <button class="action-btn btn-reorder" data-id="${order.id}"><i class="fas fa-sync-alt"></i> Reorder</button>
                <button class="action-btn btn-track" data-id="${order.id}"><i class="fas fa-truck"></i> Track Order</button>
            </div>
        `;

        ordersContainer.appendChild(card);
    });

    attachActionHandlers();
}

// Handle Buttons After Rendering
function attachActionHandlers() {
    const cartBadge = document.querySelector('.icon-badge');
    

    document.querySelectorAll('.btn-reorder').forEach(btn => {
        btn.addEventListener('click', async function () {
            const orderId = this.getAttribute('data-id');
            try {
                showPreloader("Adding to cart");

                const response = await fetch(`${ASO_URL}/cart/reorder/?order_id=${orderId}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) throw new Error("Failed to reorder items");

                const data = await response.json();
                const itemsAdded = data.items_added || 0;

                // Update cart count
                let currentCount = parseInt(cartBadge.textContent) || 0;
                cartBadge.textContent = currentCount + itemsAdded;

                this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
                this.style.background = '#28a745';
                this.style.borderColor = '#28a745';
            } catch (error) {
                alert("Failed to reorder items: " + error.message);
                this.innerHTML = '<i class="fas fa-exclamation-circle"></i> Try Again';
                this.style.background = '#dc3545';
            } finally {
                hidePreloader();
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Reorder';
                    this.style.background = '';
                    this.style.borderColor = '';
                }, 2000);
            }
        });
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            window.location.href = `ordered-details.html?id=${id}`;
        });
    });

    document.querySelectorAll('.btn-track').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            window.location.href = `ordered-details.html?id=${id}`;
        });
    });
}


// Filter Frontend
document.addEventListener('DOMContentLoaded', function () {
    loadOrders();

    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            showPreloader("Loading your ordered items");
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.textContent.trim().toLowerCase();
            const cards = document.querySelectorAll('.order-card');

            cards.forEach(card => {
                const status = card.getAttribute('data-status').replace(/_/g, ' ').toLowerCase();

                if (filter === 'all orders' || status === filter) {
                    card.style.display = 'block';
                    hidePreloader();
                } else {
                    card.style.display = 'none';
                    hidePreloader();
                }
            });
        });
    });
});