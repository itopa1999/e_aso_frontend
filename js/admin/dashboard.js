
// Show preloader for initial load

const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading dashboard data");


async function fetchDashboardInfo() {
    try {
        const response = await fetch(`${ADMIN_URL}/dashboard/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 404) {
            window.location.href = "/404.html";
            return;
        }

        if (response.status === 401) {
            window.location.href = "/auth.html";
            return;
        }

        const data = await response.json();

        if (response.ok) {
            renderData(data.data);
        } else {
            showErrorModal(data.error || "Unable to fetch data: Unknown error");
        }
    } catch (error) {
        showErrorModal(error.message || "Failed to fetch data.");
    } finally {
        hidePreloader();
    }
}


function renderData(data) {
     // --- Update Stats ---
    document.querySelector('.stats-container').innerHTML = data.order_status 
        ? `
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">Total Products</div>
                <div class="stat-icon icon-products">
                    <i class="fas fa-box"></i>
                </div>
            </div>
            <div class="stat-value">${data.order_status.total_products.value}</div>
            <div class="stat-change ${data.order_status.total_products.direction === 'up' ? 'change-up' : 'change-down'}">
                <i class="fas fa-arrow-${data.order_status.total_products.direction === 'up' ? 'up' : 'down'}"></i>
                ${data.order_status.total_products.change} from last month
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">Total Orders</div>
                <div class="stat-icon icon-orders" style="background-color: #28a745;">
                    <i class="fas fa-shopping-cart"></i>
                </div>
            </div>
            <div class="stat-value">${data.order_status.total_orders.value}</div>
            <div class="stat-change ${data.order_status.total_orders.direction === 'up' ? 'change-up' : 'change-down'}">
                <i class="fas fa-arrow-${data.order_status.total_orders.direction === 'up' ? 'up' : 'down'}"></i>
                ${data.order_status.total_orders.change} from last month
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">Total Customers Purchased Products</div>
                <div class="stat-icon icon-customers" style="background-color: #17a2b8;">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div class="stat-value">${data.order_status.total_customers.value}</div>
            <div class="stat-change ${data.order_status.total_customers.direction === 'up' ? 'change-up' : 'change-down'}">
                <i class="fas fa-arrow-${data.order_status.total_customers.direction === 'up' ? 'up' : 'down'}"></i>
                ${data.order_status.total_customers.change} from last month
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">Total Users Registered</div>
                <div class="stat-icon icon-customers" style="background-color: #17a2b8;">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div class="stat-value">${data.order_status.total_users.value}</div>
            <div class="stat-change ${data.order_status.total_users.direction === 'up' ? 'change-up' : 'change-down'}">
                <i class="fas fa-arrow-${data.order_status.total_users.direction === 'up' ? 'up' : 'down'}"></i>
                ${data.order_status.total_users.change} from last month
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">Total Riders Registered</div>
                <div class="stat-icon icon-customers" style="background-color: #17a2b8;">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div class="stat-value">${data.order_status.total_riders.value}</div>
            <div class="stat-change ${data.order_status.total_riders.direction === 'up' ? 'change-up' : 'change-down'}">
                <i class="fas fa-arrow-${data.order_status.total_riders.direction === 'up' ? 'up' : 'down'}"></i>
                ${data.order_status.total_riders.change} from last month
            </div>
        </div>
        `
        : '';

    // --- Update Order Status Cards ---
    document.querySelector('.order-stats').innerHTML = data.stats.map(item => `
        <div class="order-stat-card">
            <div class="order-stat-value">${item.value}</div>
            <div class="order-stat-label">${item.name}</div>
        </div>
    `).join('');

    // --- Update Top Products ---
    document.querySelector('.sold_product').innerHTML = data.top_products.map(product => `
        <div class="d-flex align-items-center mb-3">
            <div class="flex-shrink-0">
                <div class="bg-light rounded-2 p-3">
                    <i class="fas fa-tshirt text-primary"></i>
                </div>
            </div>
            <div class="flex-grow-1 ms-3">
                <h6 class="mb-0">${product.title}</h6>
                <p class="text-muted mb-0">${product.sold_count} sold</p>
            </div>
        </div>
    `).join('');

    // --- Update Recent Deliveries ---
    const recentDeliveriesTable = document.querySelector('#recent-orders tbody');
    if (recentDeliveriesTable) {
        recentDeliveriesTable.innerHTML = data.recent_orders.map(order => {
            let statusBadge = '';

            switch (order.latest_tracking_status) {
                case "cancelled":
                    statusBadge = '<span class="badge bg-danger">Cancelled</span>';
                    break;
                case "delivered":
                    statusBadge = '<span class="badge bg-success">Delivered</span>';
                    break;
                case "in_transit":
                    statusBadge = '<span class="badge bg-info">In Transit</span>';
                    break;
                case "shipped":
                    statusBadge = '<span class="badge bg-primary">Shipped</span>';
                    break;
                case "processing":
                    statusBadge = '<span class="badge bg-warning text-dark">Processing</span>';
                    break;
                case "placed":
                    statusBadge = '<span class="badge bg-secondary">Placed</span>';
                    break;
                default:
                    statusBadge = '<span class="badge bg-light text-dark">Unknown</span>';
            }

            return `
                <tr>
                    <td>${order.order_number}</td>
                    <td>${order.customer_first_name} ${order.customer_last_name}</td>
                    <td>${formatDateToHuman(order.delivery_date)}</td>
                    <td>₦${formatNumber(order.amount)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardInfo()

    hidePreloader();
});



