// ================== AUTH CHECK ==================
const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

// ================== DOM ELEMENTS ==================
const ordersContainer = document.querySelector('.orders-container');
const cartBadge = document.querySelector('.icon-badge');
let allOrders = [];

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setupFilterButtons();
});

// ================== LOAD ORDERS ==================
async function loadOrders() {
    showPreloader("Loading your ordered items");

    try {
        const res = await fetch(`${ASO_URL}/lists/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (res.status === 401) {
            window.location.href = "auth.html";
            return;
        }

        const data = await res.json();
        allOrders = data.results || [];
        renderOrders(allOrders);

    } catch (error) {
        console.error("Error loading orders:", error);
        ordersContainer.innerHTML = "<p>Failed to load orders. Please try again.</p>";
    } finally {
        hidePreloader();
    }
}

// ================== RENDER ORDERS ==================
function renderOrders(orders) {
    ordersContainer.innerHTML = "";

    if (!orders.length) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    orders.forEach(order => {
        const statusClass = `status-${order.order_status.replace(/_/g, '-')}`;

        const itemHtml = order.order_items.map(item => `
            <div class="order-item">
                <a href="product-info.html?id=${item.product_id}">
                    <div class="order-item-image" 
                        style="background: ${item.product_image 
                            ? `url('${item.product_image}')` 
                            : 'linear-gradient(to bottom right, #6b2c1e, #a86448)'}; 
                            background-size: cover;">
                    </div>
                </a>

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
        card.className = "order-card fade-in";
        card.setAttribute('data-status', order.order_status);
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
                    ${renderSummary(order)}
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

// ================== SUMMARY RENDER ==================
function renderSummary(order) {
    return `
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
    `;
}

// ================== ACTION HANDLERS ==================
function attachActionHandlers() {
    document.querySelectorAll('.btn-reorder').forEach(btn => {
        btn.addEventListener('click', () => reorderItems(btn));
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = `ordered-details.html?id=${btn.dataset.id}`;
        });
    });

    document.querySelectorAll('.btn-track').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = `ordered-details.html?id=${btn.dataset.id}`;
        });
    });
}

async function reorderItems(btn) {
    const orderId = btn.dataset.id;

    try {
        showPreloader("Adding to cart");

        const res = await fetch(`${ASO_URL}/cart/reorder/?order_id=${orderId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to reorder items");

        const data = await res.json();
        const itemsAdded = data.items_added || 0;

        let currentCount = parseInt(cartBadge.textContent) || 0;
        cartBadge.textContent = currentCount + itemsAdded;

        btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        btn.style.background = '#28a745';
        btn.style.borderColor = '#28a745';

    } catch (error) {
        alert("Failed to reorder items: " + error.message);
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Try Again';
        btn.style.background = '#dc3545';
    } finally {
        hidePreloader();
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Reorder';
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2000);
    }
}

// ================== FILTER ==================
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            showPreloader("Loading your ordered items");

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.textContent.trim().toLowerCase();
            const cards = document.querySelectorAll('.order-card');

            cards.forEach(card => {
                const status = card.dataset.status.replace(/_/g, ' ').toLowerCase();
                card.style.display = (filter === 'all orders' || status === filter) ? 'block' : 'none';
            });

            hidePreloader();
        });
    });
}
