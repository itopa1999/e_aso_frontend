const accessToken = getCookie("access");
showPreloader("Loading search products");

// =========================
// DOM CACHE FOR PERFORMANCE
// =========================
const SEARCH_DOM = {
    productsGrid: null,
    searchInput: null,
    searchButton: null,
    sortBySelect: null,
    priceRangeSelect: null,
    searchMeta: null,
    resultsCount: null,
    noProduct: null,
    clearFiltersBtn: null,
    searchSubtitle: null,
    wishlistBadge: null,
    cartBadge: null
};

function cacheSearchDOM() {
    SEARCH_DOM.productsGrid = document.querySelector('.products-grid');
    SEARCH_DOM.searchInput = document.getElementById('search-input');
    SEARCH_DOM.searchButton = document.querySelector('.search-button');
    SEARCH_DOM.sortBySelect = document.getElementById('sort-by-select');
    SEARCH_DOM.priceRangeSelect = document.getElementById('price-range-select');
    SEARCH_DOM.searchMeta = document.querySelector('.search-meta');
    SEARCH_DOM.resultsCount = document.querySelector('.results-count');
    SEARCH_DOM.noProduct = document.querySelector('.no-products-wrapper');
    SEARCH_DOM.clearFiltersBtn = document.querySelector('.clear-filters-btn');
    SEARCH_DOM.searchSubtitle = document.querySelector('.search-subtitle');
    SEARCH_DOM.wishlistBadge = document.getElementById('watchlist-count');
    SEARCH_DOM.cartBadge = document.getElementById('cart-count');
}

let currentFilters = {
    featured: "",
    price_range: "",
    search: "",
    page: 1
};

let isLoadingMore = false;
let nextPageUrl = null;


async function loadLists() {
    showPreloader("Loading search products");
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
    if (currentFilters.search) params.append("search", currentFilters.search);
    if (currentFilters.page) params.append("page", currentFilters.page);

    // Handle price range mapping
    switch (currentFilters.price_range) {
        case "under_50000":
            params.append("max_price", 50000);
            break;
        case "50000_100000":
            params.append("min_price", 50000);
            params.append("max_price", 100000);
            break;
        case "100000_200000":
            params.append("min_price", 100000);
            params.append("max_price", 200000);
            break;
        case "over_200000":
            params.append("min_price", 200000);
            break;
    }

    // Handle sort by mapping
    switch (currentFilters.sort_by) {
        case "price_low_high":
            params.append("ordering", "current_price");
            break;
        case "price_high_low":
            params.append("ordering", "-current_price");
            break;
        case "rating_high_low":
            params.append("ordering", "-rating");
            break;
        case "newest":
            params.append("ordering", "-created_at");  
            break;
    }

    return params.toString();
}

function renderList(data, append = false) {
    const products = data.results;
    const productsGrid = SEARCH_DOM.productsGrid;
    const noProduct = SEARCH_DOM.noProduct;
    noProduct.style.display = "none";

    SEARCH_DOM.searchMeta.innerHTML="Found " + products.length + ' products matching your search';
    SEARCH_DOM.resultsCount.innerHTML=products.length + " products Found "
        

    if (!append) {
        productsGrid.innerHTML = ""; // Clear existing
        
        // Check for empty results on initial load
        if (!products || products.length === 0) {
            
            
            noProduct.style.display = "block";
            
            
            nextPageUrl = null;
            return;
        }
    }

    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);
        const isActive = product.watchlisted ? "active" : "";


        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ""}
            <button class="wishlist-button ${isActive}" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="product-info.html?id=${product.id}">
                <div class="product-image" style="background-image: url('${product.main_image || "img/product_image.png"}');"></div>
            </a>

            <div class="product-details">
                <a href="product-info.html?id=${product.id}" style="text-decoration:none">
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
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        fragment.appendChild(card);

        const btn = card.querySelector(".add-to-cart");
        if (product.cart_added) {
            btn.textContent = "Added!";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } else {
            btn.textContent = "Add to Cart";
            btn.disabled = false;
            btn.style.cursor = "pointer";
        }
        
    });

    productsGrid.appendChild(fragment);

    nextPageUrl = data.next;
}

function resetFilters() {
    currentFilters = {
        featured: "",
        price_range: "",
        search: "",
        page: 1
    };
    
    // Reset UI elements
    if (SEARCH_DOM.searchInput) SEARCH_DOM.searchInput.value = "";

    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.selectedIndex = 0;
    });

    
}

function setupSearchDelegation() {
    if (!SEARCH_DOM.productsGrid) return;
    
    // Cart button delegation
    SEARCH_DOM.productsGrid.addEventListener('click', async function(e) {
        const btn = e.target.closest('.add-to-cart');
        if (!btn || btn.disabled) return;

        if (!accessToken) {
            window.location.href = "auth.html";
            return;
        }
        
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

            if (res.status === 401) {
                window.location.href = "auth.html";
                return;
            }

            if (!res.ok) throw new Error("Failed to move items to cart");

            const data = await res.json();
            const itemsMoved = data.data.items_added;
            let currentCount = parseInt(SEARCH_DOM.cartBadge.textContent) || 0;
            SEARCH_DOM.cartBadge.textContent = currentCount + itemsMoved;

            btn.textContent = '✓ Added!';
            btn.style.backgroundColor = '#28a745';
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } catch (error) {
            console.error(error);
            alert("Error moving items to cart.");
        } finally {
            hidePreloader();
        }
    });
    
    // Wishlist button delegation
    SEARCH_DOM.productsGrid.addEventListener('click', async function(e) {
        const button = e.target.closest('.wishlist-button');
        if (!button) return;

        if (!accessToken) {
            window.location.href = "auth.html";
            return;
        }

        const productId = button.dataset.id;
        const btn = button;

            try {
                showPreloader("Updating watchlist...");

                const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                if (res.status === 401) {
                    window.location.href = "auth.html";
                    return;
                }

                if (!res.ok) throw new Error("Failed to toggle watchlist");

                const data = await res.json();

            let count = parseInt(SEARCH_DOM.wishlistBadge.textContent);
            if (data.data.watchlisted) {
                btn.classList.add("active");
                count += 1;
            } else {
                btn.classList.remove("active");
                count = Math.max(0, count - 1);
            }
            SEARCH_DOM.wishlistBadge.textContent = count;

        } catch (error) {
            console.error(error);
            alert("Failed to update watchlist.");
        } finally {
            hidePreloader();
        }
    });
}

function setupSearchListeners() {
    if (SEARCH_DOM.searchButton) {
        SEARCH_DOM.searchButton.addEventListener('click', function () {
            const searchValue = SEARCH_DOM.searchInput.value.trim();
            if (searchValue === "") return;
            currentFilters.search = searchValue;
            currentFilters.page = 1;
            loadLists();

            if (SEARCH_DOM.searchSubtitle) {
                SEARCH_DOM.searchSubtitle.innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
            }
        });
    }

    if (SEARCH_DOM.searchInput) {

        SEARCH_DOM.searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const searchValue = this.value.trim();
                if (searchValue === "") return;
                currentFilters.search = searchValue;
                currentFilters.page = 1;
                loadLists();
                if (SEARCH_DOM.searchSubtitle) {
                    SEARCH_DOM.searchSubtitle.innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
                }
            }
        });
    }

    if (SEARCH_DOM.sortBySelect) {
        SEARCH_DOM.sortBySelect.addEventListener("change", function () {
            const sortValue = this.value;
            currentFilters.sort_by = sortValue;
            currentFilters.page = 1;
            loadLists();
        });
    }

    if (SEARCH_DOM.priceRangeSelect) {
        SEARCH_DOM.priceRangeSelect.addEventListener("change", function () {
            const priceRange = this.value;
            currentFilters.price_range = priceRange;
            currentFilters.page = 1;
            loadLists();
        });
    }

    if (SEARCH_DOM.clearFiltersBtn) {
        SEARCH_DOM.clearFiltersBtn.addEventListener('click', () => {
            resetFilters();
            loadLists();
        });
    }
}



// Wishlist functionality
document.addEventListener('DOMContentLoaded', function() {
    cacheSearchDOM();
    setupSearchListeners();
    setupSearchDelegation();
    hidePreloader();
    // View toggle functionality
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.querySelector('i').classList.contains('fa-list')) {
                document.querySelector('.products-grid').style.gridTemplateColumns = '1fr';
            } else {
                document.querySelector('.products-grid').style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            }
        });
    });

    window.addEventListener("scroll", async () => {
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

        if (nearBottom && !isLoadingMore && nextPageUrl) {
            isLoadingMore = true;
            showPreloader("Loading more products...");

            try {
                const res = await fetch(nextPageUrl, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Accept": "application/json"
                    }
                });
                const data = await res.json();
                renderList(data, true);  // Append instead of replacing
            } catch (err) {
                console.error("Error loading more products:", err);
            } finally {
                isLoadingMore = false;
                hidePreloader();
            }
        }
    });

    document.querySelector('.clear-filters-btn')?.addEventListener('click', () => {
        resetFilters();
        document.querySelector(".no-products-wrapper").style.display = "none"; // Hide "no products" message
    });

    document.querySelector(".search-subtitle").innerHTML="Search for our amazing products"
});