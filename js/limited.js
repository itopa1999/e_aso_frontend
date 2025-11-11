ASO_URL = "http://127.0.0.1:8000/aso/api/product"
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
    createBubbles();
    FetchLimitedProducts();
    checkReferralFeature();
});

// Create floating bubbles
function createBubbles() {
    const bubblesContainer = document.getElementById('bubbles');
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
    const offersGrid = document.getElementById('offers-grid');
    const products = apiResponse.data.limited_products;
    
    offersGrid.innerHTML = '';
    
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
            <a href="product-info.html?id=${product.id}">
                <div class="offer-image">
                    <img src="${product.main_image || 'img/product_image.png'}" alt="${product.title}">
                </div>
            </a>
            <div class="offer-content">
            <a style="text-decoration:none;" href="product-info.html?id=${product.id}">
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
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        
        offersGrid.appendChild(offerCard);

        const btn = offerCard.querySelector(".action-button");
        if (product.cart_added) {
            btn.textContent = "✓ Added!";
            btn.style.background  = "#28a745";
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } else {
            btn.disabled = false;
            btn.style.cursor = "pointer";
        }

    });

    attachCartEvents();
}


function attachCartEvents() {
    document.querySelectorAll('.action-button').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!access) return (window.location.href = "auth.html");

            const product_id = this.dataset.id;
            try {
                const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${product_id}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${access}`, "Content-Type": "application/json" }
                });

                if (res.status === 401) return (window.location.href = "auth.html");
                if (!res.ok) throw new Error("Failed to move items to cart");

                const data = await res.json();
                btn.textContent = '✓ Added!';
                btn.style.background = '#28a745';
                btn.disabled = true;
                btn.style.cursor = "not-allowed";
            } catch (error) {
                console.error(error);
                alert("Error moving items to cart.");
            } finally {
            }
        });
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
            document.getElementById('countdown-days').textContent = '00';
            document.getElementById('countdown-hours').textContent = '00';
            document.getElementById('countdown-minutes').textContent = '00';
            document.getElementById('countdown-seconds').textContent = '00';
            
            document.querySelector('.sale-info').innerHTML = 
                'The sale has ended. Check back soon for new offers!';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display
        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
        
        // Update discount percentage
        document.querySelector('.discount-highlight').textContent = 
            `${apiResponse.data.limited_flag.discount_percent}% OFF`;
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}