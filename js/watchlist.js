const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

showPreloader("Loading your watchlist items");

const wishlistCountElement = document.getElementById("watchlist-count");
async function loadLists() {
    try {
        const res = await fetch(`${ASO_URL}/watchlist-products/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (res.status === 401) {
            window.location.href = "auth.html";
            return;
        }

        const data = await res.json();
        renderList(data);
    } catch (error) {
        console.error("Error loading watchlists:", error);
    } finally {
        hidePreloader();
    }
}

loadLists()
    
function renderList(data) {
    const products = data.results;
    const productsGrid = document.querySelector(".products-grid");
    

    if (!products || products.length === 0) {
        showEmptyWatchlist();
    }

    productsGrid.innerHTML = "";

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);

        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            <div class="product-badge">${product.badge}</div>
            <button class="wishlist-button active" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="product-info.html?id=${product.id}">
                <div class="product-image" style="background: ${product.main_image ? `url('${product.main_image}')` : 'linear-gradient(to bottom right, #6b2c1e, #a86448)'}; background-size: cover;"></div>
            </a>
            <div class="product-details">
                <a href="product-info.html?id=${product.id}" style="text-decoration:none">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <p class="product-features">${product.short_description}</p>
                <div class="rating">${starsHTML}<span>(${reviewFormatted})</span></div>
                <div class="price">
                    <span class="current-price">₦${formatNumber(product.current_price)}</span>
                    ${
                        product.discount_percent && parseFloat(product.discount_percent) > 0
                        ? `
                            <span class="original-price">₦${formatNumber(product.original_price)}</span>
                            <span class="discount">-${product.discount_percent}%</span>
                        `
                        : ''
                    }
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        productsGrid.appendChild(card);
    });

    attachWatchlistEvents();

    const cartBadge = document.getElementById("cart-count");
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async function () {  // ✅ Make this function async
            const product_id = this.getAttribute('data-id');
            try {
                showPreloader("Adding items to cart...");

                const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${product_id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Failed to move items to cart");

                const data = await res.json();
                const itemsMoved = data.items_added;
                let currentCount = parseInt(cartBadge.textContent) || 0;
                cartBadge.textContent = currentCount + itemsMoved;

                // Animation
                btn.textContent = '✓ Added!';
                btn.style.backgroundColor = '#28a745';

            } catch (error) {
                console.error(error);
                alert("Error moving items to cart.");
            } finally {
                hidePreloader();
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.style.backgroundColor = '';
                }, 2000);
            }
        });
    });
}

function attachWatchlistEvents() {
    const buttons = document.querySelectorAll(".wishlist-button");
    const wishlistCountElement = document.getElementById("watchlist-count");

    buttons.forEach(button => {
        button.addEventListener("click", async function () {
            
            const productId = this.dataset.id;
            try {
                showPreloader("Removing watchlist items");
                const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                if (!res.ok) throw new Error("Failed to reorder items");

                this.closest(".product-card").remove();

                let count = parseInt(wishlistCountElement.textContent);
                count = Math.max(0, count - 1);
                wishlistCountElement.textContent = count;

                if (count === 0) {
                    showEmptyWatchlist();
                }
            } catch (error) {
                console.error(error);
                alert("Failed to remove from watchlist.");
            } finally {
                hidePreloader();
            }
        });
    });
}
    

// Clear all button
const clearAllBtn = document.querySelector('.btn-clear-all');
clearAllBtn.addEventListener('click', async function () {
    showPreloader("Removing all watchlist items");

    try {
        const res = await fetch(`${ASO_URL}/remove-all-watchlist/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!res.ok) throw new Error("Failed to clear watchlist.");

        // Animate and remove all product cards
        document.querySelectorAll('.wishlist-button.active').forEach(btn => {
            const card = btn.closest('.product-card');
            card.style.opacity = '0';
            card.style.height = '0';
            card.style.padding = '0';
            card.style.margin = '0';
            setTimeout(() => card.remove(), 300); // allow CSS animation to complete
        });

        wishlistCount = 0;
        wishlistCountElement.textContent = wishlistCount;
        showEmptyWatchlist();

    } catch (error) {
        console.error(error);
        alert("Failed to remove watchlist.");
    } finally {
        hidePreloader();
    }
});


// Add to cart functionality
const cartBadge = document.getElementById("cart-count");

// Move all to cart button
const moveAllBtn = document.querySelector('.btn-move-all');
moveAllBtn.addEventListener('click', async function () {
    showPreloader("Moving items to cart...");
    
    try {
        const res = await fetch(`${ASO_URL}/move-all-to-cart/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to move items to cart");

        const data = await res.json();
        const itemsMoved = data.items_added;

        let currentCount = parseInt(cartBadge.textContent) || 0;
        cartBadge.textContent = currentCount + itemsMoved;

        // Animate all "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.textContent = '✓ Added!';
            button.style.backgroundColor = '#28a745';

            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.style.backgroundColor = '';
            }, 2000);
        });

        // Button confirmation animation
        this.innerHTML = '<i class="fas fa-check"></i> All Items Moved!';
        this.style.background = '#28a745';
        this.style.borderColor = '#28a745';
        this.style.color = 'white';

        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-shopping-cart"></i> Move All to Cart';
            this.style.background = '';
            this.style.borderColor = '';
            this.style.color = '';
        }, 3000);

    } catch (error) {
        console.error(error);
        alert("Error moving items to cart.");
    } finally {
        hidePreloader();
    }
});


// Show empty watchlist state
function showEmptyWatchlist() {
    const productSection = document.querySelector('.product-section');
    productSection.innerHTML = `
        <div class="empty-watchlist fade-in">
            <div class="empty-icon">
                <i class="fas fa-heart"></i>
            </div>
            <h2 class="empty-title">Your Watchlist is Empty</h2>
            <p class="empty-text">
                You haven't added any items to your watchlist yet. Start exploring our beautiful collection of Aso Oke and Aso Ofi fabrics and save your favorites!
            </p>
            <a href="index.html">
                <button class="btn-shop">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </button>
            </a>
        </div>
    `;
}
