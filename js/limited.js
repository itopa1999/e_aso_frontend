ASO_URL = "http://192.168.0.200:8000/aso/api/product";

// DOM CACHE
const LIMITED_DOM = {
    offersGrid: null,
    bubblesContainer: null,
    countdownDays: null,
    countdownHours: null,
    countdownMinutes: null,
    countdownSeconds: null,
    discountHighlight: null,
    saleInfo: null
};

function cacheLimitedDOM() {
    LIMITED_DOM.offersGrid = document.getElementById('offers-grid');
    LIMITED_DOM.bubblesContainer = document.getElementById('bubbles');
    LIMITED_DOM.countdownDays = document.getElementById('countdown-days');
    LIMITED_DOM.countdownHours = document.getElementById('countdown-hours');
    LIMITED_DOM.countdownMinutes = document.getElementById('countdown-minutes');
    LIMITED_DOM.countdownSeconds = document.getElementById('countdown-seconds');
    LIMITED_DOM.discountHighlight = document.querySelector('.discount-highlight');
    LIMITED_DOM.saleInfo = document.querySelector('.sale-info');
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
const access = getCookie('access');

let apiResponse = null;

async function checkReferralFeature() {
    const featureFlagName = "Product Limitation";
    try {
        const res = await fetch(`${ASO_URL}/feature-flag/${encodeURIComponent(featureFlagName)}/`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        const result = await res.json();

        
        if (result?.data === true) {
            console.log("Feature flag response:");
        } else {
            window.location.href = "404.html";
        }
    } catch (err) {
        console.error("Feature flag check failed:", err);
    }
}

async function FetchLimitedProducts() {
    try {
        const res = await fetch(`${ASO_URL}/limited-products/`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${access}`,
                "Accept": "application/json" }
        });
        apiResponse = await res.json();
        renderProducts();
        startCountdown();

    } catch (err) {
        console.error("fetch limited products failed", err);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    cacheLimitedDOM();
    createBubbles();
    FetchLimitedProducts();
    checkReferralFeature();
});

// Create floating bubbles
function createBubbles() {
    if (!LIMITED_DOM.bubblesContainer) return;
    const bubblesContainer = LIMITED_DOM.bubblesContainer;
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random size and position
        const size = Math.random() * 100 + 50;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 15;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.top = `${top}%`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.opacity = Math.random() * 0.3 + 0.1;
        
        bubblesContainer.appendChild(bubble);
    }
}

// Render products from API response
function renderProducts() {
    if (!LIMITED_DOM.offersGrid) return;
    const offersGrid = LIMITED_DOM.offersGrid;
    const products = apiResponse.data.limited_products;
    
    offersGrid.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        
        // Generate star rating HTML
        const fullStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 >= 0.5;
        let starsHtml = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        offerCard.innerHTML = `
            <div class="offer-badge">${product.badge}</div>
            <a href="${generateProductUrl(product.id, product.title)}">
                <div class="offer-image">
                    <img src="${product.main_image || 'img/product_image.png'}" alt="${product.title}">
                </div>
            </a>
            <div class="offer-content">
            <a style="text-decoration:none;" href="${generateProductUrl(product.id, product.title)}">
                <h3 class="offer-title">${product.title}</h3>
            </a>
                <p class="offer-description">${product.short_description}</p>
                
                <div class="price-container">
                    <div class="current-price">₦${product.current_price.toLocaleString()}</div>
                    <div class="original-price">₦${parseFloat(product.original_price).toLocaleString()}</div>
                    <div class="discount">${product.discount_percent}% OFF</div>
                </div>
                
                <div class="product-meta">
                    <div class="rating">
                        <div class="stars">${starsHtml}</div>
                        <span class="rating-value">${product.rating}</span>
                    </div>
                    <div class="reviews">${product.reviews_count} reviews</div>
                </div>
                
                <button data-id="${product.id}" class="action-button">
                    <i class="fas fa-shopping-cart"></i> Add to cart
                </button>
            </div>
        `;
        
        fragment.appendChild(offerCard);

        const btn = offerCard.querySelector(".action-button");
        if (product.cart_added) {
            btn.textContent = "✓ Added to cart!";
            btn.style.background  = "#28a745";
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } else {
            btn.disabled = false;
            btn.style.cursor = "pointer";
        }

    });

    offersGrid.appendChild(fragment);
    setupLimitedDelegation();
}


function setupLimitedDelegation() {
    if (!LIMITED_DOM.offersGrid) return;
    
    LIMITED_DOM.offersGrid.addEventListener('click', async function(e) {
        const btn = e.target.closest('.action-button');
        if (!btn || btn.disabled) return;
        if (!access) {
            window.location.href = "auth.html";
            return;
        }

        const product_id = btn.dataset.id;
            try {
                const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${product_id}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${access}`, "Content-Type": "application/json" }
                });

                if (res.status === 401) return (window.location.href = "auth.html");
                if (!res.ok) throw new Error("Failed to move items to cart");

                const data = await res.json();
                btn.textContent = '✓ Added to cart!';
                btn.style.background = '#28a745';
                btn.disabled = true;
                btn.style.cursor = "not-allowed";
            } catch (error) {
                console.error(error);
                showErrorModal(error.message || "Error moving items to cart.");
            }
    });
}



// Start the countdown timer
function startCountdown() {
    const endDate = new Date(apiResponse.data.limited_flag.end_date);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        if (distance < 0) {
            // Sale has ended
            if (LIMITED_DOM.countdownDays) LIMITED_DOM.countdownDays.textContent = '00';
            if (LIMITED_DOM.countdownHours) LIMITED_DOM.countdownHours.textContent = '00';
            if (LIMITED_DOM.countdownMinutes) LIMITED_DOM.countdownMinutes.textContent = '00';
            if (LIMITED_DOM.countdownSeconds) LIMITED_DOM.countdownSeconds.textContent = '00';
            
            if (LIMITED_DOM.saleInfo) LIMITED_DOM.saleInfo.innerHTML = 
                'The sale has ended. Check back soon for new offers!';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display
        if (LIMITED_DOM.countdownDays) LIMITED_DOM.countdownDays.textContent = days.toString().padStart(2, '0');
        if (LIMITED_DOM.countdownHours) LIMITED_DOM.countdownHours.textContent = hours.toString().padStart(2, '0');
        if (LIMITED_DOM.countdownMinutes) LIMITED_DOM.countdownMinutes.textContent = minutes.toString().padStart(2, '0');
        if (LIMITED_DOM.countdownSeconds) LIMITED_DOM.countdownSeconds.textContent = seconds.toString().padStart(2, '0');
        
        // Update discount percentage
        if (LIMITED_DOM.discountHighlight) LIMITED_DOM.discountHighlight.textContent = 
            `${apiResponse.data.limited_flag.discount_percent}% OFF`;
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}