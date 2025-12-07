const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

showPreloader("Loading your watchlist items");

// =========================
// DOM CACHE FOR PERFORMANCE
// =========================
const WATCHLIST_DOM = {
    wishlistCountElement: null,
    productsGrid: null,
    cartBadge: null,
    clearAllBtn: null,
    moveAllBtn: null
};

function cacheWatchlistDOM() {
    WATCHLIST_DOM.wishlistCountElement = document.getElementById("watchlist-count");
    WATCHLIST_DOM.productsGrid = document.querySelector(".products-grid");
    WATCHLIST_DOM.cartBadge = document.getElementById("cart-count");
    WATCHLIST_DOM.clearAllBtn = document.querySelector('.btn-clear-all');
    WATCHLIST_DOM.moveAllBtn = document.querySelector('.btn-move-all');
}
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
        renderList(data.data);
    } catch (error) {
        console.error("Error loading watchlists:", error);
    } finally {
        hidePreloader();
    }
}

cacheWatchlistDOM();
loadLists();
    
function renderList(data) {
    const products = data;
    const productsGrid = WATCHLIST_DOM.productsGrid;
    

    if (!products || products.length === 0) {
        showEmptyWatchlist();
    }

    productsGrid.innerHTML = "";

    // Use DocumentFragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);

        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ""}
            <button class="wishlist-button active" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="${generateProductUrl(product.id, product.title)}">
                <div class="product-image" style="background-image: url('${product.main_image || "img/product_image.png"}');"></div>
            </a>
            <div class="product-details">
                <a href="${generateProductUrl(product.id, product.title)}" style="text-decoration:none">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <p class="product-features">${product.short_description}</p>
                 <div class="rating">
                    ${starsHTML}
                    <span>
                        (<i class="fa fa-eye"></i> ${reviewFormatted})
                    </span>
                </div>
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
                <button class="add-to-cart" data-id="${product.id}">Add to cart</button>
            </div>
        `;

        const btn = card.querySelector(".add-to-cart");
        if (product.cart_added) {
            btn.textContent = "✓ Added to cart!";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } else {
            btn.textContent = "Add to cart";
            btn.disabled = false;
            btn.style.cursor = "pointer";
        }

        fragment.appendChild(card);
    });

    // Single batch DOM insertion
    productsGrid.appendChild(fragment);

    // Event delegation for add-to-cart buttons
    setupCartDelegation();
    setupWatchlistDelegation();
}

function setupCartDelegation() {
    if (!WATCHLIST_DOM.productsGrid) return;
    
    WATCHLIST_DOM.productsGrid.addEventListener('click', async function(e) {
        const btn = e.target.closest('.add-to-cart');
        if (!btn || btn.disabled) return;
        const product_id = btn.getAttribute('data-id');
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
            const itemsMoved = data.data.items_added;
            let currentCount = parseInt(WATCHLIST_DOM.cartBadge.textContent) || 0;
            WATCHLIST_DOM.cartBadge.textContent = currentCount + itemsMoved;

            btn.textContent = '✓ Added to cart!';
            btn.style.backgroundColor = '#28a745';
            btn.disabled = true;
            btn.style.cursor = "not-allowed";

        } catch (error) {
            console.error(error);
            showErrorModal(error.message || "Error moving items to cart.");
        } finally {
            hidePreloader();
        }
    });
}

function setupWatchlistDelegation() {
    if (!WATCHLIST_DOM.productsGrid) return;
    
    WATCHLIST_DOM.productsGrid.addEventListener('click', async function(e) {
        const button = e.target.closest('.wishlist-button');
        if (!button) return;
            
        const productId = button.dataset.id;
        try {
            showPreloader("Removing watchlist items");
            const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (!res.ok) throw new Error("Failed to reorder items");

            button.closest(".product-card").remove();

            let count = parseInt(WATCHLIST_DOM.wishlistCountElement.textContent);
            count = Math.max(0, count - 1);
            WATCHLIST_DOM.wishlistCountElement.textContent = count;

            if (count === 0) {
                showEmptyWatchlist();
            }
        } catch (error) {
            console.error(error);
            showErrorModal(error.message || "Failed to remove from watchlist.");
        } finally {
            hidePreloader();
        }
    });
}


// Clear all button
if (WATCHLIST_DOM.clearAllBtn) {
    WATCHLIST_DOM.clearAllBtn.addEventListener('click', async function () {
        if ((parseInt(WATCHLIST_DOM.wishlistCountElement.textContent) || 0) === 0) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p>WishList is empty</p>
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

        let wishlistCount = 0;
        WATCHLIST_DOM.wishlistCountElement.textContent = wishlistCount;
        showEmptyWatchlist();

    } catch (error) {
        console.error(error);
        showErrorModal(error.message || "Failed to remove watchlist.");
    } finally {
        hidePreloader();
    }
    });
}


// Add to cart functionality


// Move all to cart button
if (WATCHLIST_DOM.moveAllBtn) {
    WATCHLIST_DOM.moveAllBtn.addEventListener('click', async function () {
        if ((parseInt(WATCHLIST_DOM.wishlistCountElement.textContent) || 0) === 0) {
        const overlay = document.createElement("div");
        overlay.className = "dialog-overlay";
        overlay.innerHTML = `
            <div class="dialog-box">
                <p>WishList is empty</p>
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
        const itemsMoved = data.data.items_added;

        let currentCount = parseInt(WATCHLIST_DOM.cartBadge.textContent) || 0;
        WATCHLIST_DOM.cartBadge.textContent = currentCount + itemsMoved;

        // Animate all "Add to cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.textContent = '✓ Added to cart!';
            button.style.backgroundColor = '#28a745';

            setTimeout(() => {
                button.textContent = 'Add to cart';
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
        showErrorModal(error.message || "Error moving items to cart.");
    } finally {
        hidePreloader();
    }
    });
}


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
                You haven't added any items to your watchlist yet. Start exploring our beautiful collection of premium fabrics from Esther\'s Fabrics and save your favorites!
            </p>
            <a href="index.html">
                <button class="btn-shop">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </button>
            </a>
        </div>
    `;
}
