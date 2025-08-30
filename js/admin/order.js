const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Order data");

const searchInput = document.getElementById("order-search");
const ordersTableBody = document.getElementById('orders-table-body');
const orderDetail = document.getElementById('order-detail');
const backToOrders = document.getElementById('back-to-orders');
const breadcrumbOrderId = document.getElementById('breadcrumb-order-id');

async function filterProducts() {
    const searchTerm = searchInput.value.trim();

    if (!searchTerm){
        alert("Please provide at least one filter option.");
        return;
    }

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);

    try {
        showPreloader("searching for orders")
        const response = await fetch(`${ADMIN_URL}/orders/?${params.toString()}`, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.status === 401) {
            window.location.href = "/auth.html";
            return;
        }

        if (response.status === 404) {
            window.location.href = "/auth.html";
            return;
        }

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        renderOrders(data.results);
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally{
        hidePreloader()
    }

}

function renderOrders(orders) {
    console.log(orders)
    ordersTableBody.innerHTML = '';
                
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No orders found matching your criteria.</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = `status-${order.latest_tracking_status}`;
        
        const row = document.createElement('tr');
        row.addEventListener('click', () => showOrderDetail(order));
        
        row.innerHTML = `
            <td class="order-id">${order.order_number}</td>
            <td class="customer-name">${order.customer_first_name} ${order.customer_last_name}</td>
            <td class="order-date">${orderDate}</td>
            <td><span class="order-status ${statusClass}">${order.latest_tracking_status}</span></td>
            <td class="order-total">₦${parseFloat(order.total).toLocaleString()}</td>
        `;
        
        ordersTableBody.appendChild(row);
    });
}

 // Show order detail function
function showOrderDetail(order) {
    // showPreloader("loading details")
    // Hide orders table and show detail view
    document.querySelector('.orders-table-container').style.display = 'none';
    orderDetail.style.display = 'block';
    
    // Update breadcrumb
    breadcrumbOrderId.textContent = order.order_number;
    
    // Update order info
    document.getElementById('detail-order-id').textContent = order.order_number;
    
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('detail-order-date').textContent = orderDate;
    
    const statusClass = `status-${order.latest_tracking_status}`;
    document.getElementById('detail-order-status').innerHTML = `<span class="order-status ${statusClass}">${order.latest_tracking_status}</span>`;
    
    document.getElementById('detail-items-count').textContent = order.items.length;
    
    // Update customer info
    document.getElementById('detail-customer-name').textContent = `${order.customer_first_name} ${order.customer_last_name}`;
    document.getElementById('detail-customer-email').textContent = order.customer_email;
    document.getElementById('detail-customer-phone').textContent = order.customer_phone;
    
    // Update order items
    const orderItemsBody = document.getElementById('order-items-body');
    orderItemsBody.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="item-image"
                        style="background-image: url('${item.product.main_image || "/img/product_image.png"}');">
                    </div>
                    <div>
                        <div class="item-name">${item.product.title}</div>
                        <div style="font-size: 0.8rem; color: #777;">
                            <strong>Color: </strong>${item.desc?.color || 'N/A'}, 
                            <strong>Size: </strong>${item.desc?.size || 'N/A'}
                        </div>
                    </div>
                </div>
            </td>
            <td class="item-price">₦${parseFloat(item.price).toLocaleString()}</td>
            <td class="item-quantity">${item.quantity}</td>
            <td class="item-total">₦${parseFloat(item.total_price).toLocaleString()}</td>
        `;
        
        orderItemsBody.appendChild(row);
    });
    
    // Update order totals
    document.getElementById('detail-subtotal').textContent = `₦${parseFloat(order.subtotal).toLocaleString()}`;
    document.getElementById('detail-shipping').textContent = `₦${parseFloat(order.shipping_fee).toLocaleString()}`;
    document.getElementById('detail-discount').textContent = `-₦${parseFloat(order.discount).toLocaleString()}`;
    document.getElementById('detail-total').textContent = `₦${parseFloat(order.total).toLocaleString()}`;
    
    // Update timeline
    document.getElementById("timeline-title").innerHTML = `Order Timeline: ID ${order.tracking_number} || Carrier: ${order.carrier}`
    const orderTimeline = document.getElementById('order-timeline');
    orderTimeline.innerHTML = '';
    
    order.timeline.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-date">${eventDate}</div>
            <div class="timeline-content">
                <strong>${event.status}</strong>: ${event.description}
            </div>
        `;
        
        orderTimeline.appendChild(timelineItem);
    });
    
    // Scroll to top
    window.scrollTo({top: 40, behavior: 'smooth'});

    // hidePreloader()
}

// Back to orders function
backToOrders.addEventListener('click', function() {
    orderDetail.style.display = 'none';
    document.querySelector('.orders-table-container').style.display = 'block';
});



document.getElementById("search-button").addEventListener("click", filterProducts);

// ✅ Optional: Trigger search when pressing Enter in search input
searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        filterProducts();
    }
});

hidePreloader()