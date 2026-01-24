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
    cartBadge: null,
    smartSearchDropdown: null
};

let smartSearchTimeout = null;
let smartSearchAbortController = null;

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
    SEARCH_DOM.smartSearchDropdown = document.getElementById('smartSearchDropdown');
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
        showErrorModal("Failed to load search results. Please try again.");
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
    const recentSearchesSection = document.querySelector('.recent-searches-section');
    
    // Send first product to backend when loading fresh results
    if (!append && products && products.length > 0) {
        addSearchToHistory(products[0].id);
    }
    
    noProduct.style.display = "none";
    
    // Hide recent searches when user is searching or viewing results
    if (currentFilters.search || products.length > 0) {
        if (recentSearchesSection) {
            recentSearchesSection.style.display = "none";
        }
    } else {
        // Show recent searches only on initial load with no search
        if (recentSearchesSection) {
            recentSearchesSection.style.display = "block";
        }
    }

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
                <button class="add-to-cart" data-id="${product.id}"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
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
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
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

    // Show recent searches when filters are cleared
    const recentSearchesSection = document.querySelector('.recent-searches-section');
    if (recentSearchesSection) {
        recentSearchesSection.style.display = "block";
    }
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
            showErrorModal(error.message || "Error moving items to cart.");
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
            showErrorModal(error.message || "Failed to update wishlist.");
        } finally {
            hidePreloader();
        }
    });
}

async function performSmartSearch(query) {
    if (!query || query.trim().length < 2) {
        hideSmartSearchDropdown();
        return;
    }

    // Cancel previous request if exists
    if (smartSearchAbortController) {
        smartSearchAbortController.abort();
    }

    smartSearchAbortController = new AbortController();

    try {
        showSmartSearchLoading();

        const response = await fetch(`${ASO_URL}/smart-search/${encodeURIComponent(query)}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            signal: smartSearchAbortController.signal
        });

        if (!response.ok) {
            hideSmartSearchDropdown();
            return;
        }

        const result = await response.json();
        
        if (result.is_success && result.data && result.data.length > 0) {
            displaySmartSearchResults(result.data);
        } else {
            showSmartSearchNoResults();
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            // Request was cancelled, do nothing
            return;
        }
        hideSmartSearchDropdown();
    }
}

function showSmartSearchLoading() {
    if (!SEARCH_DOM.smartSearchDropdown) return;
    
    SEARCH_DOM.smartSearchDropdown.innerHTML = `
        <div class="smart-search-loading">
            <i class="fas fa-spinner fa-spin"></i> Searching...
        </div>
    `;
    SEARCH_DOM.smartSearchDropdown.classList.add('active');
}

function showSmartSearchNoResults() {
    if (!SEARCH_DOM.smartSearchDropdown) return;
    
    SEARCH_DOM.smartSearchDropdown.innerHTML = `
        <div class="smart-search-no-results">
            No suggestions found
        </div>
    `;
    SEARCH_DOM.smartSearchDropdown.classList.add('active');
}

function displaySmartSearchResults(suggestions) {
    if (!SEARCH_DOM.smartSearchDropdown) return;
    
    const fragment = document.createDocumentFragment();
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'smart-search-item';
        item.innerHTML = `
            <i class="fas fa-search"></i>
            <span>${suggestion}</span>
        `;
        
        item.addEventListener('click', () => {
            selectSmartSearchItem(suggestion);
        });
        
        fragment.appendChild(item);
    });
    
    SEARCH_DOM.smartSearchDropdown.innerHTML = '';
    SEARCH_DOM.smartSearchDropdown.appendChild(fragment);
    SEARCH_DOM.smartSearchDropdown.classList.add('active');
}

function selectSmartSearchItem(text) {
    if (SEARCH_DOM.searchInput) {
        SEARCH_DOM.searchInput.value = text;
        currentFilters.search = text;
        currentFilters.page = 1;
        loadLists();
        
        if (SEARCH_DOM.searchSubtitle) {
            SEARCH_DOM.searchSubtitle.innerHTML = 'Search Result for "' + text.toUpperCase() + '"';
        }
    }
    hideSmartSearchDropdown();
}

function hideSmartSearchDropdown() {
    if (SEARCH_DOM.smartSearchDropdown) {
        SEARCH_DOM.smartSearchDropdown.classList.remove('active');
        SEARCH_DOM.smartSearchDropdown.innerHTML = '';
    }
}

function setupSearchListeners() {
    if (SEARCH_DOM.searchButton) {
        SEARCH_DOM.searchButton.addEventListener('click', function () {
            const searchValue = SEARCH_DOM.searchInput.value.trim();
            if (searchValue === "") return;
            currentFilters.search = searchValue;
            currentFilters.page = 1;
            loadLists();
            hideSmartSearchDropdown();

            if (SEARCH_DOM.searchSubtitle) {
                SEARCH_DOM.searchSubtitle.innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
            }
        });
    }

    if (SEARCH_DOM.searchInput) {
        // Smart search on input with debouncing
        SEARCH_DOM.searchInput.addEventListener('input', function (e) {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (smartSearchTimeout) {
                clearTimeout(smartSearchTimeout);
            }
            
            // Debounce: wait 300ms after user stops typing
            smartSearchTimeout = setTimeout(() => {
                performSmartSearch(query);
            }, 300);
        });

        SEARCH_DOM.searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const searchValue = this.value.trim();
                if (searchValue === "") return;
                currentFilters.search = searchValue;
                currentFilters.page = 1;
                loadLists();
                hideSmartSearchDropdown();
                if (SEARCH_DOM.searchSubtitle) {
                    SEARCH_DOM.searchSubtitle.innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
                }
            } else if (e.key === 'Escape') {
                hideSmartSearchDropdown();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) {
                hideSmartSearchDropdown();
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
        // Only trigger infinite scroll if products grid is visible
        const recentSearchesSection = document.querySelector('.recent-searches-section');
        const isRecentSearchesVisible = recentSearchesSection && recentSearchesSection.style.display !== 'none';
        
        // Don't load more if recent searches are showing or if no products are loaded
        if (isRecentSearchesVisible || !SEARCH_DOM.productsGrid.hasChildNodes()) {
            return;
        }

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
                showErrorModal("Failed to load more products. Please try again.");
            } finally {
                isLoadingMore = false;
                hidePreloader();
            }
        }
    });

    document.querySelector('.clear-filters-btn')?.addEventListener('click', () => {
        // Reset all filters and clear display
        currentFilters = {
            featured: "",
            price_range: "",
            search: "",
            page: 1
        };
        
        // Clear UI elements
        if (SEARCH_DOM.searchInput) SEARCH_DOM.searchInput.value = "";
        
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Clear the products grid completely
        SEARCH_DOM.productsGrid.innerHTML = "";
        
        // Hide error messages
        document.querySelector(".no-products-wrapper").style.display = "none";
        SEARCH_DOM.searchMeta.innerHTML = "";
        SEARCH_DOM.resultsCount.innerHTML = "0 products found";
        
        // Show only recent searches
        const recentSearchesSection = document.querySelector('.recent-searches-section');
        if (recentSearchesSection) {
            recentSearchesSection.style.display = "block";
        }
    });

    document.querySelector(".search-subtitle").innerHTML="Search for our amazing products"

    // Initialize Recent Searches - this must be at the end of DOMContentLoaded
    setTimeout(async () => {
        await initializeRecentSearches();
        loadRecentSearches();
    }, 100);
});

// =========================
// RECENT SEARCHES FUNCTIONALITY
// =========================
let recentSearches = [];

async function initializeRecentSearches() {
    try {
        const res = await fetch(`${ASO_URL}/recent-searches/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            
            // Map API response to our format
            recentSearches = data.map(item => ({
                id: item.id,
                title: item.title,
                desc: new Date(item.created_at).toLocaleDateString(), // Format date as description
                img: item.image || "img/product_image.png",
                product_id: item.product_id
            }));
        }
    } catch (error) {
        console.error('Failed to load recent searches:', error);
        // If API fails, show empty list
        recentSearches = [];
    }
}

function loadRecentSearches() {
    const searchList = document.getElementById('search-list');
    const clearAllBtn = document.getElementById('clear-all');
    
    if (!searchList) return;
    
    function renderSearchList() {
        searchList.innerHTML = '';
        
        if (recentSearches.length === 0) {
            showEmptyState();
            return;
        }
        
        recentSearches.forEach(search => {
            const item = createSearchItem(search);
            searchList.appendChild(item);
        });
    }
    
    function createSearchItem(search) {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.dataset.id = search.id;
        
        item.innerHTML = `
            <img src="${search.img || 'img/product_image.png'}" alt="${search.title}" class="item-img" onerror="this.src='img/product_image.png'">
            <div class="item-info">
                <div class="item-title">${search.title}</div>
                <div class="item-desc">${search.desc}</div>
            </div>
            <button class="remove-btn" title="Remove from search history">×</button>
        `;
        
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.addEventListener('click', async function(e) {
            e.stopPropagation();
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(async () => {
                // Delete from backend
                await deleteRecentSearch(search.id);
                
                const index = recentSearches.findIndex(s => s.id === search.id);
                if (index !== -1) {
                    recentSearches.splice(index, 1);
                }
                
                item.remove();
                
                if (recentSearches.length === 0) {
                    showEmptyState();
                }
            }, 300);
        });
        
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.remove-btn')) {
                // Open product details page
                window.location.href = generateProductUrl(search.product_id, search.title);
            }
        });
        
        return item;
    }
    
    function showEmptyState() {
        searchList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">No recent searches</div>
                <div class="empty-text">Your search history will appear here</div>
            </div>
        `;
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async function() {
            if (recentSearches.length === 0) return;
            
            // Show custom confirmation modal
            const confirmModal = document.createElement("div");
            confirmModal.className = "dialog-overlay";
            confirmModal.innerHTML = `
                <div class="dialog-box" style="max-width: 400px;">
                    <h3 style="color: #8a4b38; margin-bottom: 15px; font-size: 18px;">
                        <i class="fas fa-trash-alt" style="color: #ff6b6b; margin-right: 8px;"></i>
                        Clear Search History
                    </h3>
                    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
                        Are you sure you want to clear all recent searches? This action cannot be undone.
                    </p>
                    <div class="dialog-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="cancel-btn" style="flex: 1; padding: 12px;">Cancel</button>
                        <button class="confirm-btn1" style="flex: 1; padding: 12px; background-color: #ff6b6b;">Clear All</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);

            // Handle cancel
            confirmModal.querySelector(".cancel-btn").addEventListener("click", () => {
                confirmModal.remove();
            });

            // Handle confirm - delete all searches
            confirmModal.querySelector(".confirm-btn1").addEventListener("click", async () => {
                confirmModal.remove();
                // Delete all from backend
                await deleteAllRecentSearches();
                recentSearches.length = 0;
                renderSearchList();
            });
        });
    }
    
    renderSearchList();
}

// Send search history to backend
async function addSearchToHistory(productId) {
    try {
        const res = await fetch(`${ASO_URL}/recent-searches/add/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                product_id: productId
            })
        });
        
        if (res.ok) {
            console.log('Search added to history');
        }
    } catch (error) {
        console.error('Failed to add search to history:', error);
        // Silently fail - don't interrupt user experience
    }
}

// Delete a single recent search
async function deleteRecentSearch(searchId) {
    try {
        const res = await fetch(`${ASO_URL}/recent-searches/${searchId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (res.ok) {
            console.log('Search deleted from history');
        }
    } catch (error) {
        console.error('Failed to delete search from history:', error);
        // Silently fail - don't interrupt user experience
    }
}

// Delete all recent searches
async function deleteAllRecentSearches() {
    try {
        const res = await fetch(`${ASO_URL}/recent-searches/delete-all/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (res.ok) {
            console.log('All searches deleted from history');
        }
    } catch (error) {
        console.error('Failed to delete all searches from history:', error);
        // Silently fail - don't interrupt user experience
    }
}