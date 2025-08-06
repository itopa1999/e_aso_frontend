const accessToken = getCookie("access");

showPreloader("Loading shopping items");

let currentFilters = {
    category: "",
    badge: "",
    max_price: "",
    search: "",
    page: 1
};


async function loadLists() {
    try {
        const res = await fetch(`${ASO_URL}/?${buildQueryParams()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const data = await res.json();
        renderList(data);
    } catch (error) {
        console.error("Error loading products:", error);
    } finally {
        hidePreloader();
    }
}

function buildQueryParams() {
    const params = new URLSearchParams();
    if (currentFilters.category) params.append("category", currentFilters.category);
    if (currentFilters.badge) params.append("badge", currentFilters.badge);
    if (currentFilters.max_price) params.append("max_price", currentFilters.max_price);
    if (currentFilters.search) params.append("search", currentFilters.search);
    if (currentFilters.rating) params.append("rating", currentFilters.rating);
    if (currentFilters.page) params.append("page", currentFilters.page);
    return params.toString();
}

function renderList(data) {
    const products = data.results;
    const productsGrid = document.querySelector(".product-grid");

    productsGrid.innerHTML = "";

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);

        const isActive = product.watchlisted ? "active" : "";

        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            <div class="product-badge">${product.badge}</div>
            <button class="wishlist-button ${isActive}" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="product-info.html?id=${product.id}">
                <div class="product-image" style="background-image: url('${product.main_image}'); background-size: cover;"></div>
            </a>
            <div class="product-details">
                <a href="product-info.html?id=${product.id}" style="text-decoration:none">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <p class="product-features">${product.short_description}</p>
                <div class="rating">${starsHTML}<span>(${reviewFormatted})</span></div>
                <div class="price">
                    <span class="current-price">₦${formatNumber(product.current_price)}</span>
                    <span class="original-price">₦${formatNumber(product.original_price)}</span>
                    <span class="discount">-${product.discount_percent}%</span>
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        productsGrid.appendChild(card);
    });

    attachWatchlistEvents();
    attachCartEvents();
}

function attachCartEvents() {
    const cartBadge = document.getElementById("cart-count");
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async function () {
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
            if (!accessToken) {
                window.location.href = "auth.html";
                return;
            }

            const productId = this.dataset.id;
            const btn = this;

            try {
                showPreloader("Updating watchlist...");

                const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                if (!res.ok) throw new Error("Failed to toggle watchlist");

                const data = await res.json();

                let count = parseInt(wishlistCountElement.textContent);
                if (data.watchlisted) {
                    btn.classList.add("active");
                    count += 1;
                } else {
                    btn.classList.remove("active");
                    count = Math.max(0, count - 1);
                }
                wishlistCountElement.textContent = count;

            } catch (error) {
                console.error(error);
                alert("Failed to update watchlist.");
            } finally {
                hidePreloader();
            }
        });
    });
}


async function loadCats() {
    try {
        const res = await fetch(`${ASO_URL}/categories/`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await res.json();
        renderCatButtons(data);
    } catch (error) {
        console.error("Error loading cats:", error);
    }
}

function renderCatButtons(data) {

    const container = document.querySelector('.filter-options2');
    container.innerHTML = '';  // Clear existing

    // Add "All" button first
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn';
    allBtn.textContent = 'All Categories';
    container.appendChild(allBtn);

    // Add category buttons
    data.results.forEach(cat => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = cat.name;
        container.appendChild(button);
    });
}





// Filter sidebar functionality
const filterButton = document.getElementById('filter-button');
const filterSidebar = document.getElementById('filter-sidebar');
const closeFilter = document.getElementById('close-filter');
const overlay = document.getElementById('overlay');

filterButton.addEventListener('click', function() {
    filterSidebar.classList.add('open');
    overlay.classList.add('active');
});

closeFilter.addEventListener('click', function() {
    filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', function() {
    filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', function() {
    loadLists()
    loadCats()
        
    // Price range slider value update
    const priceRange = document.querySelector('.price-range');
    const priceValue = document.querySelector('.price-values span:nth-child(2)');
    
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            priceValue.textContent = '₦' + value.toLocaleString();
        });
    }


    document.querySelector(".apply-filters").addEventListener("click", function () {
        currentFilters.search = document.getElementById("search-title-or-number").value.trim();
        currentFilters.badge = document.getElementById("badge-filter").value;
        currentFilters.max_price = document.querySelector(".price-range").value;

        if (document.getElementById("rating1").checked) {
            currentFilters.rating = "5.0";
        } else if (document.getElementById("rating2").checked) {
            currentFilters.rating = "4.0";
        } else if (document.getElementById("rating3").checked) {
            currentFilters.rating = "3.0";
        } else {
            currentFilters.rating = "";  // No rating filter
        }

        currentFilters.page = 1;  // Reset to first page when filtering

        filterSidebar.classList.remove('open');
        overlay.classList.remove('active');
        
        loadLists();
    });
    
    // Product card animations
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 300);
    });

    const container = document.querySelector('.filter-options2');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    leftArrow.addEventListener('click', () => {
        container.scrollBy({ left: -200, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        container.scrollBy({ left: 200, behavior: 'smooth' });
    });
});