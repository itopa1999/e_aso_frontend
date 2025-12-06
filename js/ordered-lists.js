// ================== AUTH CHECK ==================
const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

// ================== DOM CACHE ==================
const ORDERS_DOM = {
    ordersContainer: null,
    cartBadge: null,
    filterBtns: null,
    noOrdersMsg: null,
    trackingModal: null
};

function cacheOrdersDOM() {
    ORDERS_DOM.ordersContainer = document.querySelector('.orders-container');
    ORDERS_DOM.cartBadge = document.querySelector('.icon-badge');
    ORDERS_DOM.filterBtns = document.querySelectorAll('.filter-btn');
    ORDERS_DOM.noOrdersMsg = document.getElementById('noOrdersMessage');
    ORDERS_DOM.trackingModal = document.getElementById('trackingModal');
}

// ================== ARROW SCROLL FUNCTIONALITY ==================
function setupArrowScroll() {
    const filterOptions2 = document.querySelector('.filter-options2');
    const leftArrow = document.querySelector('.arrow-btn.left-arrow');
    const rightArrow = document.querySelector('.arrow-btn.right-arrow');

    if (!filterOptions2 || !leftArrow || !rightArrow) return;

    const scrollAmount = 200; // pixels to scroll

    leftArrow.addEventListener('click', () => {
        filterOptions2.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        filterOptions2.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update arrow visibility based on scroll position
    function updateArrowVisibility() {
        leftArrow.disabled = filterOptions2.scrollLeft === 0;
        rightArrow.disabled = filterOptions2.scrollLeft + filterOptions2.clientWidth >= filterOptions2.scrollWidth;
    }

    filterOptions2.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);
    updateArrowVisibility(); // Initial check
}

let allOrders = [];
let currentStatusFilter = 'all'; // Track current status filter
let currentSearchQuery = ''; // Track current search query

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
    cacheOrdersDOM();
    loadOrders();
    setupFilterButtons();
    setupArrowScroll();
    setupSearchAndFilter();
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
        allOrders = data.data || [];
        renderOrders(allOrders);

    } catch (error) {
        console.error("Error loading orders:", error);
        if (ORDERS_DOM.ordersContainer) {
            ORDERS_DOM.ordersContainer.innerHTML = "<p>Failed to load orders. Please try again.</p>";
        }
        showErrorModal(error.message || "Failed to load orders. Please try again.");
    } finally {
        hidePreloader();
    }
}

// ================== RENDER ORDERS ==================
function renderOrders(orders) {
    if (!ORDERS_DOM.ordersContainer) return;
    ORDERS_DOM.ordersContainer.innerHTML = "";

    if (!orders.length) {
        ordersContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-bag"></i>
                <p>Your Order is empty</p>
                <small>Looks like you haven’t Ordered anything yet.</small>
                <a href="index.html" class="start-shopping-btn">
                    <i class="fas fa-store"></i> Start Shopping
                </a>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    orders.forEach(order => {
        const statusClass = `status-${order.order_status.replace(/_/g, '-')}`;

        const itemHtml = order.order_items.map(item => `
            <div class="order-item">
                <a href="${generateProductUrl(item.product_id, item.product_name)}">
                    <div class="order-item-image" 
                        style="background-image: url('${item.product_image || "img/product_image.png"}');">
                    </div>
                </a>

                <div class="order-item-details">
                    <a href="${generateProductUrl(item.product_id, item.product_name)}" style="text-decoration:none">
                        <div class="order-item-name">${item.product_name}</div>
                    </a>
                    <div class="order-item-price">₦${formatNumber(item.price)}</div>
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

        fragment.appendChild(card);
    });

    ORDERS_DOM.ordersContainer.appendChild(fragment);
    setupOrdersDelegation();
}

// ================== SUMMARY RENDER ==================
function renderSummary(order) {
    return `
        <div class="summary-row">
            <div class="summary-label">Subtotal</div>
            <div class="summary-value">₦${formatNumber(order.subtotal)}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Shipping</div>
            <div class="summary-value">₦${formatNumber(order.shipping)}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Discount</div>
            <div class="summary-value" style="color:#28a745;">-₦${formatNumber(order.discount)}</div>
        </div>
        <div class="summary-total">
            <div>Total</div>
            <div>₦${formatNumber(order.total)}</div>
        </div>
    `;
}

// ================== ACTION HANDLERS ==================
function setupOrdersDelegation() {
    if (!ORDERS_DOM.ordersContainer) return;
    
    ORDERS_DOM.ordersContainer.addEventListener('click', async function(e) {
        const reorderBtn = e.target.closest('.btn-reorder');
        const viewBtn = e.target.closest('.btn-view');
        const trackBtn = e.target.closest('.btn-track');
        
        if (reorderBtn) {
            await reorderItems(reorderBtn);
            return;
        }
        
        if (viewBtn) {
            window.location.href = generateOrderUrl(viewBtn.dataset.id);
            return;
        }
        
        if (trackBtn) {
            const modal = ORDERS_DOM.trackingModal;
            if (!modal) return;
            modal.style.display = 'flex';

            const steps = document.querySelectorAll('.timeline-step');
            const headerTitle = document.getElementById('header-title');
            const progressBar = document.querySelector('.progress-bar');

            // Example: you can fetch tracking details dynamically
            const orderId = trackBtn.dataset.id;
            try {
                showPreloader("Loading tracking details");
                const response = await fetch(`${ASO_URL}/track-order/${orderId}/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`, // optional if auth required
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch tracking info: ${response.status}`);
                }

                const data = await response.json();
                console.log("Tracking data received:", data); // Debug log

                if (!data.data) {
                    throw new Error("Invalid tracking data structure");
                }

                headerTitle.textContent = `Tracking Information for Order ${data.data.order_number || orderId}`;

                const trackingList = data.data.tracking || [];
                console.log("Tracking list:", trackingList); // Debug log
                if (trackingList.length === 0) {
                    console.warn("No tracking info available for order:", orderId);
                    // Show message to user
                    showErrorModal("Tracking information is not yet available for this order. Please check back later.");
                    return;
                }

                const statusOrder = ['placed', 'processing', 'shipped', 'in_transit', 'delivered'];
            const latest = trackingList[0]; // most recent status
            const orderStatus = latest.status;
            const currentStepIndex = statusOrder.indexOf(orderStatus.toLowerCase());

            // Update timeline steps
            steps.forEach((step, index) => {
                const matchingTrack = trackingList.find(t => statusOrder[index] === t.status.toLowerCase());
                const stepTitle = step.querySelector('.step-title');
                const stepDate = step.querySelector('.step-date');
                const stepDesc = step.querySelector('.step-description');

                if (!stepTitle || !stepDate || !stepDesc) {
                    console.error(`Step ${index} missing text elements`);
                    return;
                }

                step.classList.remove('step-completed', 'step-active');

                if (index < currentStepIndex) {
                    step.classList.add('step-completed');
                } else if (index === currentStepIndex) {
                    step.classList.add('step-active');
                }

                if (matchingTrack) {
                    try {
                        const date = new Date(matchingTrack.date).toLocaleString();
                        stepTitle.textContent = capitalizeWords(matchingTrack.status.replace(/_/g, " "));
                        stepDate.textContent = date;
                        stepDesc.textContent = matchingTrack.description || "Updated";
                    } catch (e) {
                        console.error("Error processing tracking data:", e);
                        stepTitle.textContent = capitalizeWords(statusOrder[index].replace(/_/g, " "));
                        stepDate.textContent = "";
                        stepDesc.textContent = "";
                    }
                } else {
                    stepTitle.textContent = capitalizeWords(statusOrder[index].replace(/_/g, " "));
                    stepDate.textContent = "";
                    stepDesc.textContent = "";
                }
            });

            // progress bar height
            const percent = (currentStepIndex / (statusOrder.length - 1)) * 100;
            progressBar.style.height = `${percent}%`;

            } catch (error) {
                console.error(error);
            } finally {
                hidePreloader();
            }
        }
    });

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Close modal when clicking close button
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('trackingModal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', e => {
        const modal = document.getElementById('trackingModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
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
        const itemsAdded = data.data.items_added || 0;

        let currentCount = parseInt(ORDERS_DOM.cartBadge.textContent) || 0;
        ORDERS_DOM.cartBadge.textContent = currentCount + itemsAdded;

        btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        btn.style.background = '#28a745';
        btn.style.borderColor = '#28a745';

    } catch (error) {
        showErrorModal(error.message || "Failed to reorder items");
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
    if (!ORDERS_DOM.filterBtns || !ORDERS_DOM.filterBtns.length) return;
    
    ORDERS_DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            ORDERS_DOM.filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Get status from data attribute
            currentStatusFilter = this.dataset.status || 'all';
            applyFiltersAndSearch();
        });
    });
}

// ================== SEARCH AND FILTER SETUP ==================
function setupSearchAndFilter() {
    const searchInput = document.getElementById('orderSearchInput');
    const clearBtn = document.getElementById('orderClearBtn');

    if (!searchInput || !clearBtn) return;

    // Search input listener
    searchInput.addEventListener('input', function () {
        currentSearchQuery = this.value.trim();
        
        // Show/hide clear button
        if (currentSearchQuery) {
            clearBtn.classList.add('show');
        } else {
            clearBtn.classList.remove('show');
        }

        applyFiltersAndSearch();
    });

    // Clear button listener
    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        currentSearchQuery = '';
        clearBtn.classList.remove('show');
        applyFiltersAndSearch();
    });
}

// ================== APPLY FILTERS AND SEARCH ==================
function applyFiltersAndSearch() {
    const cards = document.querySelectorAll('.order-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const orderNumber = card.querySelector('.order-id')?.textContent?.replace('Order ', '').trim() || '';
        const status = card.dataset.status || '';

        // Check status filter
        const statusMatches = currentStatusFilter === 'all' || status === currentStatusFilter;

        // Check search query
        const searchMatches = currentSearchQuery === '' || orderNumber.toLowerCase().includes(currentSearchQuery.toLowerCase());

        // Show card if both filters match
        if (statusMatches && searchMatches) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the "No orders" message
    if (ORDERS_DOM.noOrdersMsg) {
        ORDERS_DOM.noOrdersMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}
