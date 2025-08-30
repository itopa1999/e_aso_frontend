const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

showPreloader("Loading your ordered details");

const orderId = getQueryParam('id');
if (!orderId) {
    window.location.href = "404.html";
}

async function fetchOrderDetails() {
    try {
        const response = await fetch(`${ASO_URL}/order-details/${orderId}/`, {
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

        if (!response.ok) throw new Error("Failed to fetch order");

        const data = await response.json();
        renderOrderDetails(data);
    } catch (error) {
        alert("Failed to load order: " + error.message);
    }
    finally{
        hidePreloader();
    }
}

function renderOrderDetails(order) {
    main_product_number = document.querySelector('.order-id').textContent = order.order_number;
    main_product_number = order.order_number;


    const statusText = document.querySelector('.status-title');
    const statusSubtitle = document.querySelector('.status-subtitle');
    const statusBadge = document.querySelector('.order-status');

    statusText.textContent = order.order_status || "Placed";
    statusBadge.textContent = statusText.textContent;
    statusBadge.className = `order-status status-${statusText.textContent.toLowerCase()}`;
    
    const deliveryDate = order.estimated_delivery_date
        ? formatDateToHuman(order.estimated_delivery_date)
        : null;

    statusSubtitle.textContent = deliveryDate
        ? "Estimated delivery: " + deliveryDate
        : "Estimated delivery: Not set yet";


    // Update tracking info
    document.querySelector('.shipping-info').innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center;">
            <i class="fas fa-box" style="font-size: 1.2rem; color: var(--primary-color);"></i>
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">Tracking Number: ${order.tracking_number}</div>
                <div style="color: #777;">Carrier: ${order.carrier}</div>
            </div>
        </div>
    `;

    // Populate items
    const itemsContainer = document.querySelector('.order-items');
    itemsContainer.innerHTML = "";
    order.items.forEach(item => {
    const descText = item.desc 
            ? `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: ${item.desc.color || 'N/A'}, Size: ${item.desc.size || 'N/A'}</span>
            </div>`
            : `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: N/A, Size: N/A</span>
            </div>`;

        itemsContainer.innerHTML += `
            <div class="order-item">
                <a href="product-info.html?id=${item.product_id}">
                    <div class="order-item-image" 
                        style="background-image: url('${item.product_image || "img/product_image.png"}');">
                    </div>
                </a>
                
                <div class="order-item-details">
                    <a style="text-decoration:none" href="product-info.html?id=${item.product_id}">
                        <div class="order-item-name">${item.product_name}</div>
                    </a>
                    ${descText ? `<div class="cart-item-desc">${descText}</div>` : ""}
                        <div class="order-item-price">₦${formatNumber(item.price)}</div>
                    <div class="order-item-qty">Quantity: ${item.quantity}</div>
                </div>
            </div>
        `;
    });

    // Totals
    document.querySelector('.order-summary').innerHTML = `
        <div class="summary-row"><div class="summary-label">Subtotal</div><div class="summary-value">₦${formatNumber(order.subtotal)}</div></div>
        <div class="summary-row"><div class="summary-label">Shipping</div><div class="summary-value">₦${formatNumber(order.shipping_fee)}</div></div>
        <div class="summary-row"><div class="summary-label">Discount</div><div class="summary-value" style="color:#28a745;">-₦${formatNumber(order.discount)}</div></div>
        <div class="summary-total"><div>Total</div><div>₦${formatNumber(order.total)}</div></div>
    `;

    // Shipping address
    const addr = order.shipping_address;
    document.querySelector('.address-details').innerHTML = `
        <div class="address-name">${addr.full_name}</div>
        <div class="address-line">${addr.first_name} ${addr.last_name}</div>
        <div class="address-line">${addr.address}</div>
        <div class="address-line">Apartment: ${addr.apartment}</div>
        <div class="address-line">${addr.city}, ${addr.state}</div>
        <div class="address-line">Nigeria</div>
        <div class="address-line" style="margin-top: 10px;">
            <i class="fas fa-phone"></i> ${addr.phone}
        </div>
        <div class="address-line">
            <i class="fas fa-phone"></i> Alt: ${addr.alt_phone}
        </div>
    `;

    const otherInfo = order.other_info;

    const otherInfoDiv = document.querySelector('.other-info');

    if (otherInfo && otherInfo.trim() !== "") {
        otherInfoDiv.innerHTML = otherInfo.replace(/\n/g, "<br>");
    } else {
        otherInfoDiv.innerHTML = "<em>This is not set yet.</em>";
    }

    // Payment info
    const payment = order.payment_detail;
    document.querySelector('.payment-info').innerHTML = `
        <div class="payment-name">${payment.method}</div>
    `;

    document.getElementById("total-payment").innerText  = `₦${formatNumber(order.total)}`;



    updateProgressBarFromBackend(order.order_status, order.tracking || []);

    function updateProgressBarFromBackend(orderStatus, trackingList) {
        const steps = document.querySelectorAll('.timeline-step');
        const progressBar = document.getElementById('progressBar');
        const statusBar = document.querySelector('.status-bar');
        const statusTitle = statusBar.querySelector('.status-title');
        const statusSubtitle = statusBar.querySelector('.status-subtitle');
        const statusBadge = statusBar.querySelector('.order-status');

        const statusOrder = ['placed', 'processing', 'shipped', 'in_transit', 'delivered'];
        const currentStepIndex = statusOrder.indexOf(orderStatus.toLowerCase());

        // Update timeline UI
        steps.forEach((step, index) => {
            const matchingTrack = trackingList.find(t => statusOrder[index] === t.status.toLowerCase());
            const stepIcon = step.querySelector('.step-icon i');
            const stepTitle = step.querySelector('.step-title');
            const stepDate = step.querySelector('.step-date');
            const stepDesc = step.querySelector('.step-description');

            step.classList.remove('step-completed', 'step-active');

            if (index < currentStepIndex) {
                step.classList.add('step-completed');
            } else if (index === currentStepIndex) {
                step.classList.add('step-active');
            }

            if (matchingTrack) {
                const date = new Date(matchingTrack.date).toLocaleString();
                stepTitle.textContent = capitalizeWords(matchingTrack.status.replace(/_/g, " "));
                stepDate.textContent = date;
                stepDesc.textContent = matchingTrack.description || "Updated";
            } else {
                stepTitle.textContent = capitalizeWords(statusOrder[index].replace(/_/g, " "));
                stepDate.textContent = "";
                stepDesc.textContent = "";
            }
        });

        // Update progress bar height
        const percent = (currentStepIndex / (statusOrder.length - 1)) * 100;
        progressBar.style.height = `${percent}%`;

        // Update top status bar
        const formattedStatus = capitalizeWords(orderStatus.replace(/_/g, " "));
        statusTitle.textContent = formattedStatus;
        statusBadge.textContent = formattedStatus;
    }

    function capitalizeWords(text) {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }

}

fetchOrderDetails()

document.addEventListener('DOMContentLoaded', function() {
    

    
    // Reorder button functionality
    const reorderBtn = document.querySelector('.btn-reorder');
    const cartBadge = document.getElementById("cart-count");

    reorderBtn.addEventListener('click', async function () {

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

            // Success UI feedback
            this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
            this.style.background = '#28a745';

            } catch (error) {
                console.error(error);
                alert("Failed to reorder items: " + error.message);
                this.innerHTML = '<i class="fas fa-exclamation-circle"></i> Try Again';
                this.style.background = '#dc3545';
            } finally {
                hidePreloader();
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Reorder Items';
                    this.style.background = '';
                    this.disabled = false;
                }, 2000);
            }
    });

    // Contact seller button
    const productID = orderId;
    const sellerNumber = "2348064160380";

    // Contact Seller Modal
    const contactModal = document.getElementById('contactModal');
    const contactClose = contactModal.querySelector('.close');
    const complaintMessageInput = document.getElementById('complaintMessage');
    const sendComplaintBtn = document.getElementById('sendComplaint');

    document.querySelector('.btn-contact').addEventListener('click', () => {
        contactModal.style.display = 'block';
    });

    contactClose.addEventListener('click', () => contactModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === contactModal) contactModal.style.display = 'none';
    });

    // Send complaint to WhatsApp
    sendComplaintBtn.addEventListener('click', () => {
        showPreloader("Loading......");
        const complaint = complaintMessageInput.value.trim();
        if (!complaint) return alert('Please enter your complaint before sending.');

        const message = `Hello, I have a complaint about Product ID: #${productID}.\n\nDetails:\n${complaint}`;
        const whatsappURL = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');

        contactModal.style.display = 'none';
        complaintMessageInput.value = '';

        hidePreloader()
    });


    // Return Modal
    const returnModal = document.getElementById('returnModal');
    const returnClose = returnModal.querySelector('.close');

    document.querySelector('.btn-return').addEventListener('click', () => {
        const currentStatus = document.querySelector('.status-title').textContent.trim().toLowerCase();
        if (currentStatus === 'delivered') {
            returnModal.style.display = 'flex';
        } else {
            alert('Return is only available after delivery.');
        }
    });

    returnClose.addEventListener('click', () => returnModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === returnModal) returnModal.style.display = 'none';
    });


    // Submit return request
    document.getElementById('submitReturn').addEventListener('click', function () {
        showPreloader("Loading......");
        const checkedOptions = Array.from(document.querySelectorAll('input[name="returnReason"]:checked'))
            .map(cb => cb.value);
        const message = document.getElementById('returnMessage').value.trim();

        if (!checkedOptions.length) {
            alert('Please select at least one reason.');
            return;
        }

        // Example: simulate sending request
        alert(`Return request submitted.\nReasons: ${checkedOptions.join(', ')}\nMessage: ${message}\nWe will reach out to you shortly.`);
        
        // Close modal after submission
        document.getElementById('returnModal').style.display = 'none';


        hidePreloader()
    });
});