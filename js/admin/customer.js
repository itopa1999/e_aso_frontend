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
            <td class="customer-id">${customer.id}</td>
            <td class="customer-name">${customer.first_name} ${customer.last_name}</td>
            <td class="customer-email">${customer.email}</td>
            <td class="customer-phone">${customer.phone ? customer.phone : 'N/A'}</td>
        `;
        
        customersTableBody.appendChild(row);
    });
}

 // Show customer detail function
function showCustomerDetail(customer) {
    document.querySelector('.customers-table-container').style.display = 'none';
    customerDetail.style.display = 'block';

    // Update breadcrumb
    console.log(customer)
    breadcrumbCustomerId.textContent = customer.rider_number || customer.id;

    // Update customer info
    document.getElementById('detail-customer-id').textContent = customer.rider_number || customer.id;

    const customerDate = new Date(customer.date_joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('detail-customer-date').textContent = customerDate;
}

document.getElementById("search-button").addEventListener("click", filterProducts);

// ✅ Optional: Trigger search when pressing Enter in search input
searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        filterProducts();
    }
});



hidePreloader()