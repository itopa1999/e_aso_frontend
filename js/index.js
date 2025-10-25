


// =========================
// GLOBAL VARIABLES
// =========================
const accessToken = getCookie("access");

let currentFilters = {
    category: "",
    badge: "",
    max_price: "",
    search: "",
    rating: "",
    page: 1
};

let isLoadingMore = false;
let nextPageUrl = null;

// =========================
// UTILITY FUNCTIONS
// =========================
function buildQueryParams() {
    const params = new URLSearchParams();
    for (let key in currentFilters) {
        if (currentFilters[key]) params.append(key, currentFilters[key]);
    }
    return params.toString();
}

function resetFilters() {
    currentFilters = { category: "", badge: "", max_price: "", search: "", rating: "", page: 1 };

    document.getElementById("search-title-or-number").value = "";
    document.getElementById("badge-filter").value = "";
    document.querySelector(".price-range").value = "500000";
    document.querySelector(".price-values span:nth-child(2)").textContent = "₦500,000";
    document.querySelectorAll('input[type="radio"][name="rating"]').forEach(r => r.checked = false);
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn:first-child').classList.add('active');
}

function setActiveButton(selectedBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    selectedBtn.classList.add('active');
}

// =========================
// RENDER FUNCTIONS
// =========================
function renderList(data, append = false) {
    const productsGrid = document.querySelector(".product-grid");
    const products = data.results || [];

    if (!append) {
        productsGrid.innerHTML = "";
        document.querySelector(".no-products-wrapper").style.display = products.length ? "none" : "block";
        if (!products.length) {
            document.querySelector('.clear-filters-btn')?.addEventListener('click', () => {
                resetFilters();
                loadLists();
            });
            nextPageUrl = null;
            return;
        }
    }

    products.forEach(product => {
        const reviewFormatted = formatReviews(product.reviews_count);
        const starsHTML = getStarHTML(product.rating);
        const isActive = product.watchlisted ? "active" : "";

        const card = document.createElement("div");
        card.className = "product-card fade-in";

        card.innerHTML = `
            <div class="product-badge">${product.badge || ""}</div>
            <button class="wishlist-button ${isActive}" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="product-info.html?id=${product.id}">
                <div class="product-image" 
                    style="background-image: url('${product.main_image || "img/product_image.png"}');">
                </div>
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
                    ${product.discount_percent && parseFloat(product.discount_percent) > 0 
                        ? `<span class="original-price">₦${formatNumber(product.original_price)}</span>
                           <span class="discount">-${product.discount_percent}%</span>`
                        : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        productsGrid.appendChild(card);

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

    nextPageUrl = data.next;
    attachCartEvents();
    attachWatchlistEvents();
}

function renderCatButtons(data) {
    const container = document.querySelector('.filter-options2');
    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Categories';
    allBtn.addEventListener('click', () => {
        resetFilters();
        setActiveButton(allBtn);
        loadLists();
    });
    container.appendChild(allBtn);

    const productCategories = data.filter(cat => cat.category === 'product_cat');

    productCategories.forEach(cat => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = cat.name;
        button.addEventListener('click', () => {
            currentFilters.category = cat.name;
            setActiveButton(button);
            loadLists();
        });
        container.appendChild(button);
    });
}

function renderBadgeButtons(data) {
    const badgeSelect = document.getElementById('badge-filter');
    badgeSelect.innerHTML = '<option value="">All</option>';

    const badges = data.filter(item => item.category === 'badge_cat');

    badges.forEach(badge => {
        const option = document.createElement('option');
        option.value = badge.name;
        option.textContent = badge.name;
        badgeSelect.appendChild(option);
    });
}




// =========================
// API CALLS
// =========================
async function loadLists() {
    showPreloader("Loading shopping items");
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

async function loadCats() {
    try {
        const res = await fetch(`${ASO_URL}/lookups/`, { method: "GET", headers: { "Accept": "application/json" } });
        const data = await res.json();
        renderCatButtons(data);
        renderBadgeButtons(data)
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// =========================
// EVENT ATTACHMENTS
// =========================
function attachCartEvents() {
    const cartBadge = document.getElementById("cart-count");
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!accessToken) return (window.location.href = "auth.html");

            const product_id = this.dataset.id;
            try {
                showPreloader("Adding items to cart...");
                const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${product_id}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" }
                });

                if (res.status === 401) return (window.location.href = "auth.html");
                if (!res.ok) throw new Error("Failed to move items to cart");

                const data = await res.json();
                cartBadge.textContent = (parseInt(cartBadge.textContent) || 0) + data.data.items_added;

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
    });
}

function attachWatchlistEvents() {
    const wishlistCountElement = document.getElementById("watchlist-count");
    document.querySelectorAll(".wishlist-button").forEach(button => {
        button.addEventListener("click", async function () {
            if (!accessToken) return (window.location.href = "auth.html");

            const productId = this.dataset.id;
            try {
                showPreloader("Updating watchlist...");
                const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${accessToken}` }
                });

                if (res.status === 401) return (window.location.href = "auth.html");
                if (!res.ok) throw new Error("Failed to toggle watchlist");

                const data = await res.json();
                let count = parseInt(wishlistCountElement.textContent) || 0;
                if (data.data.watchlisted) {
                    this.classList.add("active");
                    count++;
                } else {
                    this.classList.remove("active");
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

// =========================
// PAGE INIT
// =========================
document.addEventListener('DOMContentLoaded', async function () {
    const heroImage = document.getElementById("hero-image");
    const heroLink = document.getElementById("hero-link");

    try {
        const res = await fetch(`${ADMIN_URL}/banners/hero/`);
        const json = await res.json();
        if (json.is_success && json.data && json.data.length > 0) {
        const banner = json.data[0]; // use the first hero banner
        heroImage.src = banner.image;
        heroLink.href = banner.link || "#";
        } else {
        console.warn("No hero banner found");
        }
    } catch (err) {
        console.error("Error loading hero banner:", err);
    }
    

    
    loadLists();
    loadCats();

    // Price range slider
    const priceRange = document.querySelector('.price-range');
    const priceValue = document.querySelector('.price-values span:nth-child(2)');
    if (priceRange) {
        priceRange.addEventListener('input', function () {
            priceValue.textContent = '₦' + formatNumber(this.value);
        });
    }

    // Apply filters
    document.querySelector(".apply-filters").addEventListener("click", function () {
        currentFilters.search = document.getElementById("search-title-or-number").value.trim();
        currentFilters.badge = document.getElementById("badge-filter").value;
        currentFilters.max_price = document.querySelector(".price-range").value;

        const ratings = ["rating1", "rating2", "rating3", "rating4"];
        const ratingValues = ["5.0", "4.0", "3.0", "2.0"];
        currentFilters.rating = "";
        ratings.forEach((id, idx) => { if (document.getElementById(id).checked) currentFilters.rating = ratingValues[idx]; });

        currentFilters.page = 1;
        document.getElementById('filter-sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');

        loadLists();
    });

    // Filter sidebar
    document.getElementById('filter-button').addEventListener('click', () => {
        document.getElementById('filter-sidebar').classList.add('open');
        document.getElementById('overlay').classList.add('active');
    });
    document.getElementById('close-filter').addEventListener('click', () => {
        document.getElementById('filter-sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
    });
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('filter-sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
    });

    // Scroll arrows
    const container = document.querySelector('.filter-options2');
    document.querySelector('.left-arrow').addEventListener('click', () => container.scrollBy({ left: -200, behavior: 'smooth' }));
    document.querySelector('.right-arrow').addEventListener('click', () => container.scrollBy({ left: 200, behavior: 'smooth' }));

    // Infinite scroll
    window.addEventListener("scroll", async () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoadingMore && nextPageUrl) {
            isLoadingMore = true;
            showPreloader("Loading more products...");
            try {
                const res = await fetch(nextPageUrl, {
                    headers: { "Authorization": `Bearer ${accessToken}`, "Accept": "application/json" }
                });
                const data = await res.json();
                renderList(data, true);
            } catch (err) {
                console.error("Error loading more products:", err);
            } finally {
                isLoadingMore = false;
                hidePreloader();
            }
        }
    });
});
