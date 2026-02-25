const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

showPreloader("Loading your ordered details");

// DOM CACHE
const ORDER_DETAILS_DOM = {
    orderId: null,
    statusText: null,
    statusSubtitle: null,
    statusBadge: null,
    shippingInfo: null,
    itemsContainer: null,
    orderSummary: null,
    addressDetails: null,
    paymentInfo: null,
    otherInfo: null,
    totalPayment: null,
    progressBar: null,
    reorderBtn: null,
    contactBtn: null,
    returnBtn: null,
    cartBadge: null
};

function cacheOrderDetailsDOM() {
    ORDER_DETAILS_DOM.orderId = document.querySelector('.order-id');
    ORDER_DETAILS_DOM.statusText = document.querySelector('.status-title');
    ORDER_DETAILS_DOM.statusSubtitle = document.querySelector('.status-subtitle');
    ORDER_DETAILS_DOM.statusBadge = document.querySelector('.order-status');
    ORDER_DETAILS_DOM.shippingInfo = document.querySelector('.shipping-info');
    ORDER_DETAILS_DOM.itemsContainer = document.querySelector('.order-items');
    ORDER_DETAILS_DOM.orderSummary = document.querySelector('.order-summary');
    ORDER_DETAILS_DOM.addressDetails = document.querySelector('.address-details');
    ORDER_DETAILS_DOM.paymentInfo = document.querySelector('.payment-info');
    ORDER_DETAILS_DOM.otherInfo = document.querySelector('.other-info');
    ORDER_DETAILS_DOM.totalPayment = document.getElementById('total-payment');
    ORDER_DETAILS_DOM.progressBar = document.getElementById('progressBar');
    ORDER_DETAILS_DOM.reorderBtn = document.querySelector('.btn-reorder');
    ORDER_DETAILS_DOM.contactBtn = document.querySelector('.btn-contact');
    ORDER_DETAILS_DOM.returnBtn = document.querySelector('.btn-return');
    ORDER_DETAILS_DOM.cartBadge = document.getElementById('cart-count');
}

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
        renderOrderDetails(data.data);
        
    } catch (error) {
        showErrorModal(error.message || "Failed to load order");
    }
    finally{
        hidePreloader();
    }
}

function renderOrderDetails(order) {
    if (ORDER_DETAILS_DOM.orderId) {
        ORDER_DETAILS_DOM.orderId.textContent = order.order_number;
    }

    if (ORDER_DETAILS_DOM.statusText) {
        ORDER_DETAILS_DOM.statusText.textContent = order.order_status || "Placed";
    }
    
    if (ORDER_DETAILS_DOM.statusBadge && ORDER_DETAILS_DOM.statusText) {
        ORDER_DETAILS_DOM.statusBadge.textContent = ORDER_DETAILS_DOM.statusText.textContent;
        ORDER_DETAILS_DOM.statusBadge.className = `order-status status-${ORDER_DETAILS_DOM.statusText.textContent.toLowerCase()}`;
    }    
    const deliveryDate = order.estimated_delivery_date
        ? formatDateToHuman(order.estimated_delivery_date)
        : null;

    if (ORDER_DETAILS_DOM.statusSubtitle) {
        ORDER_DETAILS_DOM.statusSubtitle.textContent = deliveryDate
            ? "Estimated delivery: " + deliveryDate
            : "Estimated delivery: Not set yet";
    }

    // Update tracking info
    if (ORDER_DETAILS_DOM.shippingInfo) {
        ORDER_DETAILS_DOM.shippingInfo.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center;">
            <i class="fas fa-box" style="font-size: 1.2rem; color: var(--primary-color);"></i>
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">Tracking Number: ${order.tracking_number}</div>
                <div style="color: #777;">Carrier: ${order.carrier}</div>
            </div>
        </div>
        `;
    }

    // Populate items with fragment
    if (ORDER_DETAILS_DOM.itemsContainer) {
        ORDER_DETAILS_DOM.itemsContainer.innerHTML = "";
        
        const fragment = document.createDocumentFragment();
        order.items.forEach(item => {
    const descText = item.desc 
            ? `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: ${item.desc.color || 'N/A'}, Size: ${item.desc.size || 'N/A'}</span>
            </div>`
            : `<div class="desc-container">
                    <span><strong>Desc:</strong> Color: N/A, Size: N/A</span>
                </div>`;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            itemDiv.innerHTML = `
                <a href="${generateProductUrl(item.product_id, item.product_name)}">
                    <div class="order-item-image" 
                        style="background-image: url('${item.product_image || "img/product_image.png"}');">
                    </div>
                </a>
                
                <div class="order-item-details">
                    <a style="text-decoration:none" href="${generateProductUrl(item.product_id, item.product_name)}">
                        <div class="order-item-name">${item.product_name}</div>
                    </a>
                    ${descText ? `<div class="cart-item-desc">${descText}</div>` : ""}
                        <div class="order-item-price">₦${formatNumber(item.price)}</div>
                    <div class="order-item-qty">Quantity: ${item.quantity}</div>
                </div>
            `;
            fragment.appendChild(itemDiv);
        });
        ORDER_DETAILS_DOM.itemsContainer.appendChild(fragment);
    }

    // Totals
    if (ORDER_DETAILS_DOM.orderSummary) {
        ORDER_DETAILS_DOM.orderSummary.innerHTML = `
        <div class="summary-row"><div class="summary-label">Subtotal</div><div class="summary-value">₦${formatNumber(order.subtotal)}</div></div>
        <div class="summary-row"><div class="summary-label">Shipping</div><div class="summary-value">₦${formatNumber(order.shipping_fee)}</div></div>
        <div class="summary-row"><div class="summary-label">Discount</div><div class="summary-value" style="color:#28a745;">-₦${formatNumber(order.discount)}</div></div>
        <div class="summary-total"><div>Total</div><div>₦${formatNumber(order.total)}</div></div>
        `;
    }

    // Shipping address
    const addr = order.shipping_address;
    if (ORDER_DETAILS_DOM.addressDetails && addr) {
        ORDER_DETAILS_DOM.addressDetails.innerHTML = `
        <div class="address-name">${addr.full_name || 'N/A'}</div>
        <div class="address-line">${addr.first_name || ''} ${addr.last_name || ''}</div>
        <div class="address-line">${addr.address || 'N/A'}</div>
        <div class="address-line">Apartment: ${addr.apartment || 'N/A'}</div>
        <div class="address-line">${addr.city || ''}, ${addr.state || ''}</div>
        <div class="address-line">Nigeria</div>
        <div class="address-line" style="margin-top: 10px;">
            <i class="fas fa-phone"></i> ${addr.phone || 'N/A'}
        </div>
        <div class="address-line">
            <i class="fas fa-phone"></i> Alt: ${addr.alt_phone || 'N/A'}
        </div>
        `;
    } else if (ORDER_DETAILS_DOM.addressDetails) {
        ORDER_DETAILS_DOM.addressDetails.innerHTML = `<div class="address-line"><em>Address information not available</em></div>`;
    }

    const otherInfo = order.other_info;
    if (ORDER_DETAILS_DOM.otherInfo) {
        if (otherInfo && otherInfo.trim() !== "") {
            ORDER_DETAILS_DOM.otherInfo.innerHTML = otherInfo.replace(/\n/g, "<br>");
        } else {
            ORDER_DETAILS_DOM.otherInfo.innerHTML = "<em>This is not set yet.</em>";
        }
    }

    // Payment info
    const payment = order.payment_detail;
    if (ORDER_DETAILS_DOM.paymentInfo) {
        if (payment && payment.method) {
            ORDER_DETAILS_DOM.paymentInfo.innerHTML = `
            <div class="payment-name">${payment.method}</div>
            `;
        } else {
            ORDER_DETAILS_DOM.paymentInfo.innerHTML = `
            <div class="payment-name">Payment method not available</div>
            `;
        }
    }

    if (ORDER_DETAILS_DOM.totalPayment) {
        ORDER_DETAILS_DOM.totalPayment.innerText = `₦${formatNumber(order.total)}`;
    }



    updateProgressBarFromBackend(order.order_status, order.tracking || []);

    function updateProgressBarFromBackend(orderStatus, trackingList) {
        const steps = document.querySelectorAll('.timeline-step');
        const progressBar = ORDER_DETAILS_DOM.progressBar;
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

document.addEventListener('DOMContentLoaded', function() {
    cacheOrderDetailsDOM();
    fetchOrderDetails();

    if (!ORDER_DETAILS_DOM.reorderBtn) return;

    // Reorder button functionality
    ORDER_DETAILS_DOM.reorderBtn.addEventListener('click', async function () {

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
            if (ORDER_DETAILS_DOM.cartBadge) {
                let currentCount = parseInt(ORDER_DETAILS_DOM.cartBadge.textContent) || 0;
                ORDER_DETAILS_DOM.cartBadge.textContent = currentCount + itemsAdded;
            }

            // Success UI feedback
            this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
            this.style.background = '#28a745';

            } catch (error) {
                showErrorModal(error.message || "Failed to reorder items");
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
    const contactClose = contactModal?.querySelector('.close');
    const complaintMessageInput = document.getElementById('complaintMessage');
    const sendComplaintBtn = document.getElementById('sendComplaint');

    if (ORDER_DETAILS_DOM.contactBtn && contactModal) {
        ORDER_DETAILS_DOM.contactBtn.addEventListener('click', () => {
            contactModal.style.display = 'block';
        });
    }

    if (contactClose) {
        contactClose.addEventListener('click', () => contactModal.style.display = 'none');
    }

    window.addEventListener('click', (event) => {
        if (event.target === contactModal) contactModal.style.display = 'none';
    });

    // Send complaint to WhatsApp
    sendComplaintBtn.addEventListener('click', () => {
        const complaint = complaintMessageInput.value.trim();
        
        if (!complaint){
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Please enter your complaint before sending.</p>
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn1">Okay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle actions
            overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                overlay.remove();
            });

            overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                overlay.remove();
            });

            return;
        }
        showPreloader("Loading......");
        const message = `Hello, I have a complaint about Product ID: #${productID}.\n\nDetails:\n${complaint}`;
        const whatsappURL = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');

        contactModal.style.display = 'none';
        complaintMessageInput.value = '';

        hidePreloader()
    });


    // Return Modal
    const returnModal = document.getElementById('returnModal');
    const returnClose = returnModal?.querySelector('.close');

    if (ORDER_DETAILS_DOM.returnBtn && returnModal) {
        ORDER_DETAILS_DOM.returnBtn.addEventListener('click', () => {
            const currentStatus = ORDER_DETAILS_DOM.statusText?.textContent.trim().toLowerCase();
        if (currentStatus === 'delivered') {
            returnModal.style.display = 'flex';
        } else {
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Return is only available after delivery.</p>
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn1">Okay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle actions
            overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                overlay.remove();
            });

            overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                overlay.remove();
            });

        }
        });
    }

    if (returnClose) {
        returnClose.addEventListener('click', () => returnModal.style.display = 'none');
    }

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
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Please select at least one reason.</p>
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn1">Okay</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle actions
            overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                overlay.remove();
            });

            overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                overlay.remove();
            });
            return;
        }

        // Example: simulate sending request
        showErrorModal(`Return request submitted.\nReasons: ${checkedOptions.join(', ')}\nMessage: ${message}\nWe will reach out to you shortly.`);
        
        // Close modal after submission
        document.getElementById('returnModal').style.display = 'none';


        hidePreloader()
    });
});