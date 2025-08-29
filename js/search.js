const accessToken = getCookie("access");
showPreloader("Loading search products");

let currentFilters = {
    featured: "",
    price_range: "",
    search: "",
    page: 1
};

let isLoadingMore = false;
let nextPageUrl = null;


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
    const productsGrid = document.querySelector(".products-grid");
    const noProduct = document.querySelector(".no-products-wrapper")
    noProduct.style.display = "none";

    document.querySelector(".search-meta").innerHTML="Found " + products.length + ' products matching your search'
    document.querySelector(".results-count").innerHTML=products.length + " products Found "
        

    if (!append) {
        productsGrid.innerHTML = ""; // Clear existing
        
        // Check for empty results on initial load
        if (!products || products.length === 0) {
            
            
            noProduct.style.display = "block";
            
            
            nextPageUrl = null;
            return;
        }
    }

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);
        const isActive = product.watchlisted ? "active" : "";

        console.log(product.main_image)

        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            <div class="product-badge">${product.badge}</div>
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

        document.querySelector('.clear-filters-btn')?.addEventListener('click', () => {
            resetFilters();
            loadLists();
        });

        productsGrid.appendChild(card);
    });

    

    nextPageUrl = data.next;
    attachWatchlistEvents();
    attachCartEvents();
}

function resetFilters() {
    currentFilters = {
        featured: "",
        price_range: "",
        search: "",
        page: 1
    };
    
    // Reset UI elements
    document.getElementById("search-input").value = "";

    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.selectedIndex = 0;
    });

    
}

function attachCartEvents() {
    const cartBadge = document.getElementById("cart-count");
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!accessToken) {
                window.location.href = "auth.html";
                return;
            }
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

                if (res.status === 401) {
                    window.location.href = "auth.html";
                    return;
                }

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

                if (res.status === 401) {
                    window.location.href = "auth.html";
                    return;
                }

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

document.querySelector('.search-button').addEventListener('click', function () {
    const searchValue = document.getElementById('search-input').value.trim();
    if (searchValue === "") return;
    currentFilters.search = searchValue;
    currentFilters.page = 1;
    loadLists();

    document.querySelector(".search-subtitle").innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
});

document.getElementById('search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const searchValue = this.value.trim();
        if (searchValue === "") return;
        currentFilters.search = searchValue;
        currentFilters.page = 1;
        loadLists();
        document.querySelector(".search-subtitle").innerHTML = 'Search Result for "' + searchValue.toUpperCase() + '"';
    }
});


document.getElementById("sort-by-select").addEventListener("change", function () {
    const sortValue = this.value;
    console.log("Sort by:", sortValue);

    currentFilters.sort_by = sortValue;
    currentFilters.page = 1;
    loadLists();
});

// Price range dropdown
document.getElementById("price-range-select").addEventListener("change", function () {
    const priceRange = this.value;
    console.log("Price range selected:", priceRange);

    currentFilters.price_range = priceRange;
    currentFilters.page = 1;
    loadLists();
});



// Wishlist functionality
document.addEventListener('DOMContentLoaded', function() {
    hidePreloader()
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