showPreloader("loading rider info");

const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "404.html";
}

ASO_URL = "http://127.0.0.1:8000/aso/api/product"

let nextPageUrl = `${ASO_URL}/rider/`; // First page endpoint
let isLoading = false;

// Fetch rider info (supports pagination)
async function fetchRiderInfo(url = `${ASO_URL}/rider/`, append = false, searchTerm = "") {
    if (isLoading || !url) return; // Prevent duplicate loads
    isLoading = true;
    showPreloader("loading rider info");

    try {
        const finalUrl = searchTerm ? `${url}?search=${encodeURIComponent(searchTerm)}` : url;
        const response = await fetch(finalUrl, {
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
                <td><span style="cursor: pointer; font-weight: bold;" onclick="openDetails('${delivery.order_number}')">${delivery.order_number}</span></td>
                <td>${delivery.customer_first_name} ${delivery.customer_last_name}</td>
                <td>${formatDate(delivery.delivery_date)}</td>
                <td><span class="order-status status-delivered">Delivered</span></td>
            </tr>
        `;

        tableBody.insertAdjacentHTML('beforeend', row);

        // Mobile card
        const card = `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id" style="cursor: pointer; font-weight: bold;" onclick="openDetails('${delivery.order_number}')">${delivery.order_number}</div>
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
            </div>
        `;
        ordersList.insertAdjacentHTML('beforeend', card);

        
    });
}

function openDetails(orderNumber) {
    showPreloader("loading rider info");
    // Insert product number into modal body
    // document.getElementById("productModalBody").innerText = "Product Number: " + orderNumber;
    
    

    fetch(`${ASO_URL}/orders/rider-details/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            order_number: orderNumber,
        })
    })
    .then(res => {
        if (res.status === 401) {
            window.location.href = 'auth.html';
            return;
        }
        return res.json();
    })
    .then(data => {
        if (!data) return; // stop if redirected
        if (data && data.message) {
            // Fill order details
        const details = data.order_details;
        console.log("Fetched details:", details);
        document.querySelector('.order-details1').innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${details.order_id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${details.customer}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Delivery Address:</span>
                <span class="detail-value">${details.delivery_address}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${details.contact}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${details.order_date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">${details.total_amount}</span>
            </div>
        `;

        // Fill order items
        const itemsContainer = document.getElementById('orderItemContainer1');
        itemsContainer.innerHTML = `<br><br><h3>Order Items</h3>`;
        details.items.forEach(item => {
            itemsContainer.innerHTML += `
                <div class="order-item">
                    <a href="product-info.html?id=${item.product_id}">
                        <div class="item-image" 
                            style="background-image: url('${item.image || "/img/product_image.png"}');">
                        </div>
                    </a>
                    <div class="item-details">
                        <a style="text-decoration:none" href="product-info.html?id=${item.product_id}">
                            <div class="item-name">${item.product}</div>img
                        </a>
                        <div class="item-price">${item.price}</div>
                        <div class="item-quantity">Quantity: ${item.quantity}</div>
                    </div>
                </div>
            `;
        });

        document.getElementById("productModal").classList.add('active');

        
        } else {
            alert("unable to retrieve details")
        }
    })
    .catch(error => {
        console.error("unable to connect ro server")
    })
    .finally(() => {
        hidePreloader();
    });

}

// Close modal
document.getElementById("closeProductModal").addEventListener("click", function () {
    const modal = document.getElementById("productModal");
    modal.classList.remove("active"); // Hide modal
    document.querySelector('.order-details').innerHTML = "";
    document.getElementById('orderItemContainer').innerHTML = "";
});


const searchInput = document.getElementById("orderSearch");
const searchBtn = document.getElementById("searchBtn");

// searchBtn.addEventListener("click", () => {
//     const term = searchInput.value.trim();
//     fetchRiderInfo(`${ASO_URL}/rider/`, false, term);
// });

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const term = searchInput.value.trim();
        fetchRiderInfo(`${ASO_URL}/rider/`, false, term);
    }
});


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
    const otpSuccess = document.getElementById('otpMessage');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    
    // Show modal from main button
    startDeliveryBtn.addEventListener('click', function() {
        resetModal();
        deliveryModal.classList.add('active');
    });
    
    
    // Reset modal to initial state
    function resetModal() {
        step1.classList.add('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
        step4.classList.remove('active');
        orderError.style.display = 'none';
        otpError.style.display = 'none';
        otpSuccess.style.display = 'none';
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
    submitOrderBtn.addEventListener('click', function () {
        const orderNumber = orderNumberInput.value.trim();

        // Show loading state
        const originalText = submitOrderBtn.innerHTML;
        submitOrderBtn.innerHTML = '<div class="loading"></div> Verifying...';
        submitOrderBtn.disabled = true;

        // Basic check before hitting backend
        if (!orderNumber || !orderNumber.includes('OD')) {
            orderError.innerHTML = `<i class="fas fa-exclamation-circle"></i> Invalid order number format.`;
            orderError.style.display = 'block';
            submitOrderBtn.innerHTML = originalText;
            submitOrderBtn.disabled = false;
            return;
        }

        // Hit backend to send OTP
        fetch(`${ASO_URL}/orders/send-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ order_number: orderNumber })
        })
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'auth.html';
                return;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return; // stop if redirected
            if (data.message) {
                // OTP sent successfully
                orderError.style.display = 'none';
                step1.classList.remove('active');
                step2.classList.add('active');
                otpSuccess.style.display = 'block';
            } else {
                orderError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.error || "Order not found. Please check the order number and try again."}`;
                orderError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
            orderError.innerHTML = `<i class="fas fa-exclamation-circle"></i> Something went wrong. Please try again.`;
            orderError.style.display = 'block';
        })
        .finally(() => {
            submitOrderBtn.innerHTML = originalText;
            submitOrderBtn.disabled = false;
        });
    });

    // OTP submission
    submitOtpBtn.addEventListener('click', function() {
        const otpCode = otpCodeInput.value.trim();
        const orderNumber = orderNumberInput.value.trim();

        // Show loading state
        const originalText = submitOtpBtn.innerHTML;
        submitOtpBtn.innerHTML = '<div class="loading"></div> Verifying...';
        submitOtpBtn.disabled = true;

        fetch(`${ASO_URL}/orders/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                order_number: orderNumber,
                otp: otpCode
            })
        })
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'auth.html';
                return;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return; // stop if redirected
            if (data && data.message) {
                console.log(data)
                otpError.style.display = 'none';
                step2.classList.remove('active');
                step3.classList.add('active');

                // Fill order details
            const details = data.order_details;
            document.querySelector('#step3 .order-details').innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">${details.order_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${details.customer}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Delivery Address:</span>
                    <span class="detail-value">${details.delivery_address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${details.contact}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">${details.order_date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">${details.total_amount}</span>
                </div>
            `;

            // Fill order items
            const itemsContainer = document.getElementById('orderItemContainer');
            itemsContainer.innerHTML = `<br><br><h3>Order Items</h3>`;
            details.items.forEach(item => {
                itemsContainer.innerHTML += `
                    <div class="order-item">
                        <a href="product-info.html?id=${item.product_id}">
                            <div class="item-image" 
                                style="background-image: url('${item.image || "/img/product_image.png"}');">
                            </div>
                        </a>
                        <div class="item-details">
                            <a style="text-decoration:none" href="product-info.html?id=${item.product_id}">
                                <div class="item-name">${item.product}</div>img
                            </a>
                            <div class="item-price">${item.price}</div>
                            <div class="item-quantity">Quantity: ${item.quantity}</div>
                        </div>
                    </div>
                `;
            });
            document.querySelector('#step3').appendChild(itemsContainer);

            
            } else {
                otpError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.error || "Invalid OTP. Please check and try again."}`;
                otpError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error verifying OTP:', error);
            otpError.style.display = 'block';
        })
        .finally(() => {
            submitOtpBtn.innerHTML = originalText;
            submitOtpBtn.disabled = false;
        });
    });
    
    // Complete delivery
    completeDeliveryBtn.addEventListener('click', function() {
        const selectedStars = document.querySelector('input[name="rating"]:checked')?.value || null;
        const deliveryNotes = document.getElementById('deliveryNotes').value.trim();
        const orderNumber = orderNumberInput.value.trim();

        if (selectedStars === null) {
            alert("Please select a rating before submitting!");
        }

        // Show loading state
        const originalText = completeDeliveryBtn.innerHTML;
        completeDeliveryBtn.innerHTML = '<div class="loading"></div> Processing...';
        completeDeliveryBtn.disabled = true;

        fetch(`${ASO_URL}/orders/confirm/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                order_number: orderNumber,
                delivery_notes: deliveryNotes,
                stars: selectedStars
            })
        })
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'auth.html';
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data && data.message) {
                // Show success screen
                step3.classList.remove('active');
                step4.classList.add('active');
                document.querySelector('#step4 p').textContent = 
                    `Order ${data.order_number} has been successfully marked as delivered.`;

                // Refresh rider info after completion
                fetchRiderInfo();
            } else {
                alert(data.error || "Failed to mark order as delivered");
            }
        })
        .catch(error => {
            console.error('Error marking delivery complete:', error);
            alert("An error occurred while marking delivery complete");
        })
        .finally(() => {
            completeDeliveryBtn.innerHTML = originalText;
            completeDeliveryBtn.disabled = false;
        });
    });
        
    // Close modal when clicking outside
    deliveryModal.addEventListener('click', function(e) {
        if (e.target === deliveryModal) {
            closeDeliveryModal();
        }
    });
    hidePreloader()
});

const stars = document.querySelectorAll('.star');

// Handle click (set permanent selection)
stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        stars.forEach(s => s.classList.remove('active'));
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('active');
        }
    });

    // Handle hover (temporary highlight)
    star.addEventListener('mouseover', () => {
        stars.forEach(s => s.classList.remove('hover'));
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('hover');
        }
    });

    // Remove hover highlight when mouse leaves the container
    star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
    });
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


