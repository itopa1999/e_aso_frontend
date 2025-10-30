const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Customers data");

const searchInput = document.getElementById("customer-search");
const customersTableBody = document.getElementById('customers-table-body');
const customerDetail = document.getElementById('customer-detail');
const backToCustomers = document.getElementById('back-to-customers');
const breadcrumbCustomerId = document.getElementById('breadcrumb-customer-id');

async function filterProducts() {
    const searchTerm = searchInput.value.trim();

    if (!searchTerm){
        alert("Please provide at least one filter option.");
        return;
    }

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);

    try {
        showPreloader("searching for customer")
        const response = await fetch(`${ADMIN_URL}/customers/?${params.toString()}`, {
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
        renderCustomers(data.results);
    } catch (error) {
        console.error("Error fetching customers:", error);
    } finally{
        hidePreloader()
    }

}

function renderCustomers(customers) {
    customersTableBody.innerHTML = '';
                
    if (customers.length === 0) {
        customersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No customers found matching your criteria.</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        
        const row = document.createElement('tr');
        row.addEventListener('click', () => showCustomerDetail(customer));
        
        row.innerHTML = `
            <td class="customer-id">${customer.rider_number || customer.id}</td>
            <td class="customer-name">${customer.first_name} ${customer.last_name}</td>
            <td class="customer-email">${customer.email}</td>
            <td class="customer-group">${customer.groups.length ? customer.groups.join(", ") : "N/A"}</td>
            <td class="customer-phone">${customer.phone ? customer.phone : 'N/A'}</td>
        `;
        
        customersTableBody.appendChild(row);
    });
}

 // Show customer detail function
// Enhanced showCustomerDetail function
function showCustomerDetail(customer) {
    document.querySelector('.customers-table-container').style.display = 'none';
    customerDetail.style.display = 'block';

    // Update breadcrumb
    breadcrumbCustomerId.textContent = customer.rider_number || `Customer #${customer.id}`;

    // Update customer info
    document.getElementById('detail-customer-id').textContent = customer.rider_number || `Customer #${customer.id}`;
    
    // Update customer details
    document.getElementById('detail-customer-name').textContent = 
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Not provided';
    document.getElementById('detail-customer-email').textContent = customer.email;
    document.getElementById('detail-customer-phone').textContent = customer.phone || 'Not provided';

    const customerDate = new Date(customer.date_joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('detail-customer-date').textContent = customerDate;
    
    // Update groups
    document.getElementById('detail-order-status').textContent = 
        customer.groups && customer.groups.length > 0 ? customer.groups.join(', ') : 'No groups';
    
    // Update orders count
    const ordersCount = customer.orders ? customer.orders.length : 0;
    document.getElementById('detail-items-count').textContent = ordersCount;
    
    // Update order items
    const orderItemsBody = document.getElementById('order-items-body');
    orderItemsBody.innerHTML = '';
    
    if (customer.orders && customer.orders.length > 0) {
        customer.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.order_number}</td>
                <td>₦${parseFloat(order.total).toFixed(2)}</td>
                <td>1</td>
                <td>₦${parseFloat(order.total).toFixed(2)}</td>
            `;
            orderItemsBody.appendChild(row);
        });
    } else {
        orderItemsBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    No orders found for this customer
                </td>
            </tr>
        `;
    }
}

// Add back to customers functionality
backToCustomers.addEventListener('click', () => {
    customerDetail.style.display = 'none';
    document.querySelector('.customers-table-container').style.display = 'block';
});

// Enhanced renderCustomers function
function renderCustomers(customers) {
    customersTableBody.innerHTML = '';
                
    if (customers.length === 0) {
        customersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px 20px;">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No customers found</h3>
                        <p>No customers match your search criteria. Try different search terms.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.addEventListener('click', () => showCustomerDetail(customer));
        
        row.innerHTML = `
            <td class="customer-id">#${customer.id}</td>
            <td class="customer-name">${customer.first_name || ''} ${customer.last_name || ''}</td>
            <td class="customer-email">${customer.email}</td>
            <td class="customer-group">${customer.groups && customer.groups.length > 0 ? customer.groups[0] : 'No Group'}</td>
            <td class="customer-phone">${customer.phone ? customer.phone : 'N/A'}</td>
        `;
        
        customersTableBody.appendChild(row);
    });
}


document.getElementById("search-button").addEventListener("click", filterProducts);

// ✅ Optional: Trigger search when pressing Enter in search input
searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        filterProducts();
    }
});



hidePreloader()