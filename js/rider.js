showPreloader("loading rider info");

const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "404.html";
}

ASO_URL = "http://127.0.0.1:8000/aso/api/product"

let nextPageUrl = `${ASO_URL}/rider/`; // First page endpoint
let isLoading = false;

// Fetch rider info (supports pagination)
async function fetchRiderInfo(url = `${ASO_URL}/rider/`, append = false) {
    if (isLoading || !url) return; // Prevent duplicate loads
    isLoading = true;
    showPreloader("loading rider info");

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 404) {
            window.location.href = "404.html";
            return;
        }

        if (response.status === 401) {
            window.location.href = "auth.html";
            return;
        }

        const data = await response.json();

        if (response.ok) {
            nextPageUrl = data.next; // Store next page link from DRF
            renderProfile(data.results, append);
        } else {
            alert("Unable to fetch profile: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to fetch user profile.");
    } finally {
        hidePreloader();
        isLoading = false;
    }
}

// Render profile + deliveries
function renderProfile(data, append = false) {
    // Only update profile info on first load
    if (!append) {
        const nameEl = document.querySelector('.rider-name');
        const riderIdEl = document.querySelector('.rider-id');
        const deliveriesEl = document.querySelector('.stat-value');

        nameEl.textContent = data.profile.name || 'Unknown Rider';
        riderIdEl.textContent = `Rider ID: ${data.profile.rider_id ?? 'N/A'}`;
        deliveriesEl.textContent = data.profile.deliveries_count ?? 0;

        // Clear lists for fresh load
        document.querySelector('.orders-table tbody').innerHTML = '';
        document.querySelector('.orders-list').innerHTML = '';
    }

    const tableBody = document.querySelector('.orders-table tbody');
    const ordersList = document.querySelector('.orders-list');

    data.recent_deliveries.forEach(delivery => {
        // Desktop table row
        const row = `
            <tr>
                <td>${delivery.order_number}</td>
                <td>${delivery.customer_first_name} ${delivery.customer_last_name}</td>
                <td>${formatDate(delivery.delivery_date)}</td>
                <td>₦${Number(delivery.amount).toLocaleString()}</td>
                <td><span class="order-status status-delivered">Delivered</span></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);

        // Mobile card
        const card = `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">${delivery.order_number}</div>
                    <div class="order-status-mobile status-delivered">Delivered</div>
                </div>
                <div class="order-detail">
                    <div class="detail-label">Customer:</div>
                    <div class="detail-value">${delivery.customer_first_name} ${delivery.customer_last_name}</div>
                </div>
                <div class="order-detail">
                    <div class="detail-label">Date:</div>
                    <div class="detail-value">${formatDate(delivery.delivery_date)}</div>
                </div>
                <div class="order-detail">
                    <div class="detail-label">Amount:</div>
                    <div class="detail-value">₦${Number(delivery.amount).toLocaleString()}</div>
                </div>
            </div>
        `;
        ordersList.insertAdjacentHTML('beforeend', card);
    });
}

// Helper function to format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

window.addEventListener("scroll", async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && nextPageUrl) {
        if (nextPageUrl) {
            fetchRiderInfo(nextPageUrl, true);
        }
    }
});

// Infinite scroll for desktop table container
const tableContainer = document.querySelector('.orders-table').parentElement;
tableContainer.style.overflowY = 'auto'; // Ensure scrollable
window.addEventListener("scroll", async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && nextPageUrl) {
        if (nextPageUrl) {
            fetchRiderInfo(nextPageUrl, true);
        }
    }
});

fetchRiderInfo(nextPageUrl, false);

document.addEventListener('DOMContentLoaded', function() {

    

    
    // DOM Elements
    const deliveryModal = document.getElementById('deliveryModal');
    const closeModal = document.getElementById('closeModal');
    const startDeliveryBtn = document.getElementById('startDeliveryBtn');
    const submitOrderBtn = document.getElementById('submitOrderBtn');
    const submitOtpBtn = document.getElementById('submitOtpBtn');
    const completeDeliveryBtn = document.getElementById('completeDeliveryBtn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const orderNumberInput = document.getElementById('orderNumber');
    const otpCodeInput = document.getElementById('otpCode');
    const orderError = document.getElementById('orderError');
    const otpError = document.getElementById('otpError');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    const confirmButtons = document.querySelectorAll('.confirm-order');
    
    // Show modal from main button
    startDeliveryBtn.addEventListener('click', function() {
        resetModal();
        deliveryModal.classList.add('active');
    });
    
    // Show modal from table buttons
    confirmButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order');
            resetModal();
            orderNumberInput.value = orderId;
            deliveryModal.classList.add('active');
        });
    });
    
    // Reset modal to initial state
    function resetModal() {
        step1.classList.add('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
        step4.classList.remove('active');
        orderError.style.display = 'none';
        otpError.style.display = 'none';
        orderNumberInput.value = '';
        otpCodeInput.value = '';
    }
    
    // Close modal
    function closeDeliveryModal() {
        deliveryModal.classList.remove('active');
    }
    
    closeModal.addEventListener('click', closeDeliveryModal);
    closeSuccessBtn.addEventListener('click', closeDeliveryModal);
    
    // Order number submission
    submitOrderBtn.addEventListener('click', function() {
        const orderNumber = orderNumberInput.value.trim();
        
        // Show loading state
        const originalText = submitOrderBtn.innerHTML;
        submitOrderBtn.innerHTML = '<div class="loading"></div> Verifying...';
        submitOrderBtn.disabled = true;
        
        // Simulate backend verification
        setTimeout(() => {
            if (orderNumber && orderNumber.includes('AO')) {
                // Valid order number - proceed to OTP step
                orderError.style.display = 'none';
                step1.classList.remove('active');
                step2.classList.add('active');
            } else {
                // Invalid order number
                orderError.style.display = 'block';
            }
            
            // Restore button
            submitOrderBtn.innerHTML = originalText;
            submitOrderBtn.disabled = false;
        }, 1500);
    });
    
    // OTP submission
    submitOtpBtn.addEventListener('click', function() {
        const otpCode = otpCodeInput.value.trim();
        
        // Show loading state
        const originalText = submitOtpBtn.innerHTML;
        submitOtpBtn.innerHTML = '<div class="loading"></div> Verifying...';
        submitOtpBtn.disabled = true;
        
        // Simulate OTP verification
        setTimeout(() => {
            if (otpCode === '123456') {
                // Valid OTP - show order details
                otpError.style.display = 'none';
                step2.classList.remove('active');
                step3.classList.add('active');
            } else {
                // Invalid OTP
                otpError.style.display = 'block';
            }
            
            // Restore button
            submitOtpBtn.innerHTML = originalText;
            submitOtpBtn.disabled = false;
        }, 1500);
    });
    
    // Complete delivery
    completeDeliveryBtn.addEventListener('click', function() {
        // Show loading state
        const originalText = completeDeliveryBtn.innerHTML;
        completeDeliveryBtn.innerHTML = '<div class="loading"></div> Processing...';
        completeDeliveryBtn.disabled = true;
        
        // Simulate backend processing
        setTimeout(() => {
            // Show success screen
            step3.classList.remove('active');
            step4.classList.add('active');
            
            // Update the order status in the table
            const orderRow = document.querySelector(`.confirm-order[data-order="AO-2023-8765"]`).closest('tr');
            const statusCell = orderRow.querySelector('.order-status');
            statusCell.textContent = 'Delivered';
            statusCell.className = 'order-status status-delivered';
            
            // Remove the action button
            const actionCell = orderRow.querySelector('td:last-child');
            actionCell.innerHTML = '<span class="order-status status-delivered">Completed</span>';
            
            // Update the mobile list view
            const mobileCards = document.querySelectorAll('.order-card');
            mobileCards[0].querySelector('.order-status-mobile').textContent = 'Delivered';
            mobileCards[0].querySelector('.order-status-mobile').className = 'order-status-mobile status-delivered';
            mobileCards[0].querySelector('.order-action').innerHTML = '<span class="order-status-mobile status-delivered">Completed</span>';
        }, 1500);
    });
    
    // Close modal when clicking outside
    deliveryModal.addEventListener('click', function(e) {
        if (e.target === deliveryModal) {
            closeDeliveryModal();
        }
    });
    hidePreloader()
});

// Function to hide preloader
function hidePreloader() {
    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}


// Function to show preloader
function showPreloader(message) {
    document.querySelector('.preloader-text').textContent = message;
    preloader.classList.remove('hidden');
    preloader.style.display = 'flex';
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!match) return null;

    let value = decodeURIComponent(match[2]);

    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }

    return value;
}


