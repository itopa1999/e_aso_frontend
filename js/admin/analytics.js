const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Analytics data");

async function loadCats() {
    try {
        const res = await fetch(`${ASO_URL}/lookups/`, { method: "GET", headers: { "Accept": "application/json" } });
        const data = await res.json();
        renderCatButtons(data);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function renderCatButtons(data) {
    const badgeSelect = document.getElementById('category');
    badgeSelect.innerHTML = '<option value="">All Categories</option>';

    const productCategories = data.filter(cat => cat.category === 'product_cat');
    productCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = '🏷️ ' + cat.name;
        badgeSelect.appendChild(option);
    });
}

let charts = {};

const applyFiltersBtn = document.getElementById('apply-filters');
const categorySelect = document.getElementById('category');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCats(); 
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDateInput.value = formatDate(firstDay);
    endDateInput.value = formatDate(lastDay);
    
    // Load all analytics data
    loadAllAnalytics();

    // Add event listener for filter changes
    applyFiltersBtn.addEventListener('click', function() {
        loadAllAnalytics();
    });
});

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Build query parameters from filters
function buildQueryParams() {
    const params = new URLSearchParams();
    
    if (categorySelect.value) {
        params.append('categories', categorySelect.value);
    }
    
    if (startDateInput.value) {
        params.append('start_date', startDateInput.value);
    }
    
    if (endDateInput.value) {
        params.append('end_date', endDateInput.value);
    }
    
    return params.toString();
}

// Load all analytics data
function loadAllAnalytics() {
    const queryParams = buildQueryParams();
    
    // Show all loaders
    showAllLoaders();
    
    // Load each section with simulated API calls
    // In a real implementation, these would be actual fetch calls to your endpoints
    
    // Simulate API calls with timeouts to show loaders
    setTimeout(() => loadDailyOrders(queryParams), 800);
    setTimeout(() => loadCategorySales(queryParams), 1000);
    setTimeout(() => loadTopProducts(queryParams), 1200);
    setTimeout(() => loadCustomerInsights(queryParams), 1400);
    setTimeout(() => loadTopBuyers(queryParams), 1600);
    setTimeout(() => loadCustomerLocations(queryParams), 1800);
    setTimeout(() => loadCustomerMetrics(queryParams), 2000);
    setTimeout(() => loadProductViews(queryParams), 2200);
    setTimeout(() => loadProductRatings(queryParams), 2400);
    setTimeout(() => loadOrderFulfillment(queryParams), 2600);
}

// Show all loading states
function showAllLoaders() {
    // KPI cards
    document.querySelectorAll('.card-loader').forEach(loader => {
        loader.style.display = 'flex';
    });
    document.querySelectorAll('.kpi-value, .kpi-trend').forEach(el => {
        el.style.display = 'none';
    });
    
    // Charts
    document.querySelectorAll('.chart-container, .table-container, #fulfillment-content, #locations-content').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll('.card-loader').forEach(loader => {
        loader.style.display = 'flex';
    });
}

// Load daily orders data
async function loadDailyOrders(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/orders/daily/?${queryParams}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });
  const response = await res.json();    
    // Hide loader and show chart
    document.getElementById('daily-orders-loader').style.display = 'none';
    document.getElementById('daily-orders-chart').style.display = 'block';
    
    // Create or update chart
    const ctx = document.getElementById('dailyOrdersCanvas').getContext('2d');
    
    if (charts.dailyOrders) {
        charts.dailyOrders.destroy();
    }
    
    charts.dailyOrders = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: response.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Daily Orders',
                data: response.map(item => item.total_orders),
                backgroundColor: '#8a4b38',
                borderColor: '#4a2c2a',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load category sales data
async function loadCategorySales(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/categories/sales/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show chart
    document.getElementById('category-sales-loader').style.display = 'none';
    document.getElementById('category-sales-chart').style.display = 'block';
    
    // Create or update chart
    const ctx = document.getElementById('categorySalesCanvas').getContext('2d');
    
    if (charts.categorySales) {
        charts.categorySales.destroy();
    }
    
    const colors = ['#8a4b38', '#d4a373', '#e8d0b3', '#4a2c2a', '#a86a56', '#c18968'];
    
    charts.categorySales = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: response.map(item => item.items__product__category__name),
            datasets: [{
                data: response.map(item => item.total_sales),
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Load top products data
async function loadTopProducts(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/products/top/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show chart
    document.getElementById('top-products-loader').style.display = 'none';
    document.getElementById('top-products-chart').style.display = 'block';
    
    // Create or update chart
    const ctx = document.getElementById('topProductsCanvas').getContext('2d');
    
    if (charts.topProducts) {
        charts.topProducts.destroy();
    }
    
    // Shorten product names for display
    const shortenedNames = response.map(item => {
        const name = item.items__product__title || 'Unknown Product';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    });
    
    charts.topProducts = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: shortenedNames,
            datasets: [{
                label: 'Units Sold',
                data: response.map(item => item.total_sold),
                backgroundColor: '#d4a373',
                borderColor: '#8a4b38',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load customer insights data
async function loadCustomerInsights(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/customers/insights/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show chart
    document.getElementById('customer-insights-loader').style.display = 'none';
    document.getElementById('customer-insights-chart').style.display = 'block';
    
    // Create or update chart
    const ctx = document.getElementById('customerInsightsCanvas').getContext('2d');
    
    if (charts.customerInsights) {
        charts.customerInsights.destroy();
    }
    
    charts.customerInsights = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['New Customers', 'Returning Customers'],
            datasets: [{
                data: [response.new_customers, response.returning_customers],
                backgroundColor: ['#8a4b38', '#d4a373'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Update KPI cards
    document.getElementById('new-customers-loader').style.display = 'none';
    document.getElementById('new-customers-value').textContent = response.new_customers;
    document.getElementById('new-customers-value').style.display = 'block';
    document.getElementById('new-customers-trend').style.display = 'flex';
    
    document.getElementById('returning-customers-loader').style.display = 'none';
    document.getElementById('returning-customers-value').textContent = response.returning_customers;
    document.getElementById('returning-customers-value').style.display = 'block';
    document.getElementById('returning-customers-trend').style.display = 'flex';
}

// Load top buyers data
async function loadTopBuyers(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/customers/top-buyers/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show table
    document.getElementById('top-buyers-loader').style.display = 'none';
    document.getElementById('top-buyers-table').style.display = 'block';
    
    // Populate table
    const tbody = document.getElementById('top-buyers-body');
    tbody.innerHTML = '';
    
    response.forEach(buyer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${buyer.user__email}</td>
            <td>₦${buyer.total_spent.toLocaleString()}</td>
            <td>${buyer.orders}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load customer locations data
async function loadCustomerLocations(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/customers/locations/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show content
    document.getElementById('locations-loader').style.display = 'none';
    document.getElementById('locations-content').style.display = 'block';
    
    // Populate table
    const tbody = document.getElementById('locations-body');
    tbody.innerHTML = '';
    
    response.forEach(location => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${location.city}</td>
            <td>${location.state}</td>
            <td>${location.total_customers}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load customer metrics data
async function loadCustomerMetrics(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/customers/metrics/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Update KPI cards
    document.getElementById('avg-order-loader').style.display = 'none';
    document.getElementById('avg-order-value').textContent = `₦${response.avg_order_value.toLocaleString()}`;
    document.getElementById('avg-order-value').style.display = 'block';
    document.getElementById('avg-order-trend').style.display = 'flex';
    
    document.getElementById('abandonment-loader').style.display = 'none';
    document.getElementById('abandonment-value').textContent = `${response.cart_abandonment_rate}%`;
    document.getElementById('abandonment-value').style.display = 'block';
    document.getElementById('abandonment-trend').style.display = 'flex';
}

// Load product views data
async function loadProductViews(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/products/viewed/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show chart
    document.getElementById('product-views-loader').style.display = 'none';
    document.getElementById('product-views-chart').style.display = 'block';
    
    // Create or update chart
    const ctx = document.getElementById('productViewsCanvas').getContext('2d');
    
    if (charts.productViews) {
        charts.productViews.destroy();
    }
    
    // Shorten product names for display
    const shortenedNames = response.map(item => {
        const name = item.title || 'Unknown Product';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    });
    
    charts.productViews = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: shortenedNames,
            datasets: [{
                label: 'Product Views',
                data: response.map(item => item.total_views),
                backgroundColor: '#e8d0b3',
                borderColor: '#d4a373',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load product ratings data
async function loadProductRatings(queryParams) {
    const res = await fetch(`${ANALYTICS_URL}/products/rated/?${queryParams}`, {
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
        }
    });
    const response = await res.json(); 
    
    // Hide loader and show table
    document.getElementById('top-rated-loader').style.display = 'none';
    document.getElementById('top-rated-table').style.display = 'block';
    
    // Populate table
    const tbody = document.getElementById('top-rated-body');
    tbody.innerHTML = '';
    
    response.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.title}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span>${product.rating}</span>
                    <div style="color: #ffc107;">
                        ${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load order fulfillment data
async function loadOrderFulfillment(queryParams) {
    try {
        const res = await fetch(`${ANALYTICS_URL}/orders/fulfillment/?${queryParams}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const response = await res.json(); 
        
        // Hide loader and show content
        document.getElementById('fulfillment-loader').style.display = 'none';
        document.getElementById('fulfillment-content').style.display = 'block';
        
        // Update KPI cards - REMOVE the display:none inline styles
        const pendingElement = document.getElementById('pending-orders-value');
        const completedElement = document.getElementById('completed-orders-value');
        const cancelledElement = document.getElementById('cancelled-orders-value');
        const avgDeliveryElement = document.getElementById('avg-delivery-value');
        
        pendingElement.textContent = response.pending;
        pendingElement.style.display = 'block'; // Remove the inline display:none
        
        completedElement.textContent = response.completed;
        completedElement.style.display = 'block'; // Remove the inline display:none
        
        cancelledElement.textContent = response.cancelled;
        cancelledElement.style.display = 'block'; // Remove the inline display:none
        
        // Convert seconds to days and format
        const avgDays = parseFloat(response.avg_delivery_days) / 86400; // 86400 seconds in a day
        avgDeliveryElement.textContent = `${avgDays.toFixed(1)} days`;
        avgDeliveryElement.style.display = 'block'; // Remove the inline display:none
        
        // Show chart container
        const chartContainer = document.querySelector('#fulfillment-content .chart-container');
        chartContainer.style.display = 'block';
        
        // Create or update chart
        const ctx = document.getElementById('fulfillmentChart').getContext('2d');
        
        if (charts.fulfillment) {
            charts.fulfillment.destroy();
        }
        
        // Only create chart if we have data
        if (response.pending > 0 || response.completed > 0 || response.cancelled > 0) {
            charts.fulfillment = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Completed', 'Cancelled'],
                    datasets: [{
                        data: [response.pending, response.completed, response.cancelled],
                        backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            // Show message if no data
            chartContainer.innerHTML = 
                '<div style="text-align: center; padding: 50px; color: #666;">No fulfillment data available</div>';
        }
        
    } catch (error) {
        console.error('Error loading order fulfillment:', error);
        document.getElementById('fulfillment-loader').style.display = 'none';
        document.getElementById('fulfillment-content').innerHTML = 
            '<div style="text-align: center; padding: 50px; color: #dc3545;">Error loading fulfillment data</div>';
    }
}


hidePreloader();