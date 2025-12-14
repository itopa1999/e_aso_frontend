


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
// DOM CACHE - PERFORMANCE OPTIMIZATION
// =========================
const DOM = {
    productsGrid: null,
    noProductsWrapper: null,
    cartBadge: null,
    wishlistBadge: null,
    filterSidebar: null,
    overlay: null,
    priceRange: null,
    priceValue: null,
    searchInput: null,
    badgeFilter: null,
    filterContainer: null,
    applyFiltersBtn: null,
    heroImage: null,
    heroLink: null,
    heroSlides: null,
    heroDots: null,
    heroPrev: null,
    heroNext: null,
    specialOrderModal: null,
    modalOverlay: null,
    closeSpecialOrder: null,
    remindLater: null,
    exploreNow: null
};

// Special Order Modal Configuration
const SPECIAL_ORDER_CONFIG = {
    storageKey: 'specialOrderVisit',
    resetInterval: 20 * 60 * 1000, // 20 minutes in milliseconds
    storageResetKey: 'specialOrderReset'
};

function cacheDOMElements() {
    DOM.productsGrid = document.querySelector(".product-grid");
    DOM.noProductsWrapper = document.querySelector(".no-products-wrapper");
    DOM.cartBadge = document.getElementById("cart-count");
    DOM.wishlistBadge = document.getElementById("watchlist-count");
    DOM.filterSidebar = document.getElementById('filter-sidebar');
    DOM.overlay = document.getElementById('overlay');
    DOM.priceRange = document.querySelector('.price-range');
    DOM.priceValue = document.querySelector('.price-values span:nth-child(2)');
    DOM.searchInput = document.getElementById("search-title-or-number");
    DOM.badgeFilter = document.getElementById("badge-filter");
    DOM.filterContainer = document.querySelector('.filter-options2');
    DOM.applyFiltersBtn = document.querySelector(".apply-filters");
    DOM.heroSlides = document.querySelector(".hero-slides");
    DOM.heroDots = document.getElementById("heroDots");
    DOM.heroPrev = document.getElementById("heroPrev");
    DOM.heroNext = document.getElementById("heroNext");
    DOM.specialOrderModal = document.getElementById('specialOrderModal');
    DOM.modalOverlay = document.getElementById('modalOverlay');
    DOM.closeSpecialOrder = document.getElementById('closeSpecialOrder');
    DOM.remindLater = document.getElementById('remindLater');
    DOM.exploreNow = document.querySelector('.btn-explore');
}

// =========================
// HERO CAROUSEL FUNCTIONALITY
// =========================
let heroCarouselState = {
    currentSlide: 0,
    totalSlides: 0,
    autoplayInterval: null
};

function initHeroCarousel(banners) {
    if (!banners || banners.length === 0) return;
    
    heroCarouselState.totalSlides = banners.length;
    
    // Render slides
    DOM.heroSlides.innerHTML = banners.map((banner, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}">
            <a href="${banner.link || '#'}" class="hero-link">
                <img src="${banner.image}" alt="Hero Banner ${index + 1}" class="hero-image">
            </a>
        </div>
    `).join('');
    
    // Render dots
    if (banners.length > 1) {
        DOM.heroDots.innerHTML = banners.map((_, index) => `
            <button class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
        `).join('');
        
        // Show navigation if multiple slides
        DOM.heroPrev.style.display = 'flex';
        DOM.heroNext.style.display = 'flex';
        
        // Add event listeners
        DOM.heroPrev.addEventListener('click', () => goToSlide(heroCarouselState.currentSlide - 1));
        DOM.heroNext.addEventListener('click', () => goToSlide(heroCarouselState.currentSlide + 1));
        
        document.querySelectorAll('.hero-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Add touch/swipe functionality for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        DOM.heroSlides.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        DOM.heroSlides.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for a swipe
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    // Swiped left - go to next slide
                    goToSlide(heroCarouselState.currentSlide + 1);
                } else {
                    // Swiped right - go to previous slide
                    goToSlide(heroCarouselState.currentSlide - 1);
                }
            }
        }
        
        // Auto-play carousel
        startHeroAutoplay();
    } else {
        // Hide navigation if only one slide
        DOM.heroPrev.style.display = 'none';
        DOM.heroNext.style.display = 'none';
        DOM.heroDots.style.display = 'none';
    }
}

function goToSlide(index) {
    const totalSlides = heroCarouselState.totalSlides;
    if (index < 0) {
        heroCarouselState.currentSlide = totalSlides - 1;
    } else if (index >= totalSlides) {
        heroCarouselState.currentSlide = 0;
    } else {
        heroCarouselState.currentSlide = index;
    }
    
    updateHeroCarouselUI();
}

function updateHeroCarouselUI() {
    // Update slide
    document.querySelectorAll('.hero-slide').forEach((slide, index) => {
        slide.classList.toggle('active', index === heroCarouselState.currentSlide);
    });
    
    // Update dots
    document.querySelectorAll('.hero-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === heroCarouselState.currentSlide);
    });
}

function startHeroAutoplay() {
    // Clear existing interval if any
    if (heroCarouselState.autoplayInterval) {
        clearInterval(heroCarouselState.autoplayInterval);
    }
    
    // Auto-advance every 5 seconds
    heroCarouselState.autoplayInterval = setInterval(() => {
        goToSlide(heroCarouselState.currentSlide + 1);
    }, 5000);
}

function stopHeroAutoplay() {
    if (heroCarouselState.autoplayInterval) {
        clearInterval(heroCarouselState.autoplayInterval);
        heroCarouselState.autoplayInterval = null;
    }
}

// =========================
// SPECIAL ORDER MODAL FUNCTIONS
// =========================
function initSpecialOrderModal() {
    // Check if user has visited before
    const hasVisited = localStorage.getItem(SPECIAL_ORDER_CONFIG.storageKey);
    
    if (!hasVisited) {
        // First visit - set flag
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageKey, 'first_visit');
    } else if (hasVisited === 'first_visit') {
        // Second visit - show modal
        showSpecialOrderModal();
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageKey, 'shown');
    }
    
    // Setup reset interval for localStorage
    setupStorageResetTimer();
}

function showSpecialOrderModal() {
    if (DOM.specialOrderModal) {
        DOM.specialOrderModal.classList.add('show');
    }
}

function closeSpecialOrderModal() {
    if (DOM.specialOrderModal) {
        DOM.specialOrderModal.classList.remove('show');
    }
}

function setupSpecialOrderModalEvents() {
    if (DOM.closeSpecialOrder) {
        DOM.closeSpecialOrder.addEventListener('click', closeSpecialOrderModal);
    }
    
    if (DOM.modalOverlay) {
        DOM.modalOverlay.addEventListener('click', closeSpecialOrderModal);
    }
    
    if (DOM.remindLater) {
        DOM.remindLater.addEventListener('click', () => {
            closeSpecialOrderModal();
            // Reset the visit flag so modal shows again next time
            localStorage.setItem(SPECIAL_ORDER_CONFIG.storageKey, 'first_visit');
        });
    }
    
    if (DOM.exploreNow) {
        DOM.exploreNow.addEventListener('click', () => {
            closeSpecialOrderModal();
            // Keep the 'shown' state so modal doesn't show again until reset
        });
    }
}

function setupStorageResetTimer() {
    // Check if reset timer exists
    const lastReset = localStorage.getItem(SPECIAL_ORDER_CONFIG.storageResetKey);
    const now = Date.now();
    
    if (!lastReset || (now - parseInt(lastReset)) > SPECIAL_ORDER_CONFIG.resetInterval) {
        // Reset the special order modal storage
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageKey, 'first_visit');
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageResetKey, now.toString());
    }
    
    // Set up interval to reset every 20 minutes
    setInterval(() => {
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageKey, 'first_visit');
        localStorage.setItem(SPECIAL_ORDER_CONFIG.storageResetKey, Date.now().toString());
    }, SPECIAL_ORDER_CONFIG.resetInterval);
}

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
    const products = data.results || [];

    if (!append) {
        DOM.productsGrid.innerHTML = "";
        DOM.noProductsWrapper.style.display = products.length ? "none" : "block";
        if (!products.length) {
            const clearBtn = document.querySelector('.clear-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    resetFilters();
                    loadLists();
                }, { once: true });
            }
            nextPageUrl = null;
            return;
        }
    }

    // Use DocumentFragment for batch DOM insertion
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
                <div class="product-image" 
                    style="background-image: url('${product.main_image || "img/product_image.png"}');">
                </div>
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
                    ${product.discount_percent && parseFloat(product.discount_percent) > 0 
                        ? `<span class="original-price">₦${formatNumber(product.original_price)}</span>
                           <span class="discount">-${product.discount_percent}%</span>`
                        : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        const btn = card.querySelector(".add-to-cart");
        if (product.cart_added) {
            btn.textContent = "✓ Added!";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
        } else {
            btn.textContent = "Add to Cart";
            btn.disabled = false;
            btn.style.cursor = "pointer";
        }

        fragment.appendChild(card);
    });

    // Single DOM insertion
    DOM.productsGrid.appendChild(fragment);

    nextPageUrl = data.next;
}

function renderCatButtons(data) {
    DOM.filterContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Categories';
    allBtn.dataset.category = '';
    fragment.appendChild(allBtn);

    const productCategories = data.filter(cat => cat.category === 'product_cat');

    productCategories.forEach(cat => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = cat.name;
        button.dataset.category = cat.name;
        fragment.appendChild(button);
    });

    DOM.filterContainer.appendChild(fragment);

    // Event delegation for category buttons
    DOM.filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const category = e.target.dataset.category;
            if (category === '') {
                resetFilters();
            } else {
                currentFilters.category = category;
            }
            setActiveButton(e.target);
            loadLists();
        }
    });
}

function renderBadgeButtons(data) {
    DOM.badgeFilter.innerHTML = '<option value="">All</option>';

    const badges = data.filter(item => item.category === 'badge_cat');
    const fragment = document.createDocumentFragment();

    badges.forEach(badge => {
        const option = document.createElement('option');
        option.value = badge.name;
        option.textContent = badge.name;
        fragment.appendChild(option);
    });

    DOM.badgeFilter.appendChild(fragment);
}




// =========================
// API CALLS
// =========================
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
        // Show default products when server is unreachable
        showDefaultProducts();
    } finally {
        hidePreloader();
    }
}

// Show default products when server is unreachable
function showDefaultProducts() {
    const defaultProducts = [
        {
            id: "default-1",
            title: "Premium Wireless Headphones",
            short_description: "High-quality wireless headphones with noise cancellation",
            current_price: 45000,
            original_price: 55000,
            discount_percent: 18,
            rating: 4.5,
            reviews_count: 128,
            main_image: "img/product_image.png",
            badge: "New",
            cart_added: false,
            watchlisted: false
        },
        {
            id: "default-2",
            title: "Smart Fitness Watch",
            short_description: "Track your fitness goals with advanced health monitoring",
            current_price: 75000,
            original_price: 95000,
            discount_percent: 21,
            rating: 4.2,
            reviews_count: 89,
            main_image: "img/product_image.png",
            badge: "Popular",
            cart_added: false,
            watchlisted: false
        },
        {
            id: "default-3",
            title: "Professional Camera Lens",
            short_description: "85mm f/1.4 portrait lens for professional photography",
            current_price: 120000,
            original_price: 150000,
            discount_percent: 20,
            rating: 4.8,
            reviews_count: 67,
            main_image: "img/product_image.png",
            badge: "Pro",
            cart_added: false,
            watchlisted: false
        },
        {
            id: "default-4",
            title: "Gaming Mechanical Keyboard",
            short_description: "RGB backlit mechanical keyboard with blue switches",
            current_price: 35000,
            original_price: 45000,
            discount_percent: 22,
            rating: 4.3,
            reviews_count: 156,
            main_image: "img/product_image.png",
            badge: "Gaming",
            cart_added: false,
            watchlisted: false
        },
        {
            id: "default-5",
            title: "Wireless Charging Pad",
            short_description: "Fast wireless charging for all Qi-enabled devices",
            current_price: 12000,
            original_price: 15000,
            discount_percent: 20,
            rating: 4.0,
            reviews_count: 203,
            main_image: "img/product_image.png",
            badge: null,
            cart_added: false,
            watchlisted: false
        },
        {
            id: "default-6",
            title: "Bluetooth Speaker",
            short_description: "Portable waterproof speaker with 360° sound",
            current_price: 25000,
            original_price: 35000,
            discount_percent: 29,
            rating: 4.1,
            reviews_count: 94,
            main_image: "img/product_image.png",
            badge: "Waterproof",
            cart_added: false,
            watchlisted: false
        }
    ];

    // Create a mock response object
    const mockData = {
        results: defaultProducts,
        next: null
    };

    // Show server unreachable message
    showServerUnreachableMessage();

    // Render default products
    renderList(mockData);
}

// Show server unreachable message
function showServerUnreachableMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'server-unreachable-message';
    messageDiv.innerHTML = `
        <div class="server-message-content">
            <i class="fas fa-wifi-slash"></i>
            <h4>Server Temporarily Unavailable</h4>
            <p>We're showing you some featured products while we reconnect to our servers.</p>
            <button onclick="location.reload()" class="retry-btn">Try Again</button>
        </div>
    `;

    // Insert at the top of the page content
    const mainContent = document.querySelector('.container') || document.body;
    mainContent.insertBefore(messageDiv, mainContent.firstChild);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 10000);
}

async function loadCats() {
    try {
        const res = await fetch(`${ASO_URL}/lookups/`, { method: "GET", headers: { "Accept": "application/json" } });
        const data = await res.json();
        renderCatButtons(data);
        renderBadgeButtons(data)
    } catch (error) {
        showErrorModal("Failed to load categories. Please refresh the page.");
    }
}

// =========================
// EVENT DELEGATION - PERFORMANCE OPTIMIZATION
// =========================
function setupEventDelegation() {
    // Cart events - single listener on parent
    DOM.productsGrid.addEventListener('click', async function(e) {
        const cartBtn = e.target.closest('.add-to-cart');
        if (cartBtn && !cartBtn.disabled) {
            e.preventDefault();
            if (!accessToken) {
                window.location.href = "auth.html";
                return;
            }

            const product_id = cartBtn.dataset.id;
            try {
                showPreloader("Adding items to cart...");
                const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${product_id}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" }
                });

                if (res.status === 401) {
                    window.location.href = "auth.html";
                    return;
                }
                if (!res.ok) throw new Error("Failed to move items to cart");

                const data = await res.json();
                DOM.cartBadge.textContent = (parseInt(DOM.cartBadge.textContent) || 0) + data.data.items_added;

                cartBtn.textContent = '✓ Added!';
                cartBtn.style.backgroundColor = '#28a745';
                cartBtn.disabled = true;
                cartBtn.style.cursor = "not-allowed";
            } catch (error) {
                showErrorModal(error.message || "Error moving items to cart.");
            } finally {
                hidePreloader();
            }
            return;
        }

        // Wishlist events - handle in same delegation
        const wishlistBtn = e.target.closest('.wishlist-button');
        if (wishlistBtn) {
            e.preventDefault();
            if (!accessToken) {
                window.location.href = "auth.html";
                return;
            }

            const productId = wishlistBtn.dataset.id;
            try {
                showPreloader("Updating watchlist...");
                const res = await fetch(`${ASO_URL}/toggle-watchlist/${productId}/`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${accessToken}` }
                });

                if (res.status === 401) {
                    window.location.href = "auth.html";
                    return;
                }
                if (!res.ok) throw new Error("Failed to toggle watchlist");

                const data = await res.json();
                let count = parseInt(DOM.wishlistBadge.textContent) || 0;
                if (data.data.watchlisted) {
                    wishlistBtn.classList.add("active");
                    count++;
                } else {
                    wishlistBtn.classList.remove("active");
                    count = Math.max(0, count - 1);
                }
                DOM.wishlistBadge.textContent = count;
            } catch (error) {
                showErrorModal(error.message || "Failed to update wishlist.");
            } finally {
                hidePreloader();
            }
        }
    });
}

// Event delegation handles cart and wishlist - no individual attachments needed

// =========================
// UTILITY: DEBOUNCE FOR PERFORMANCE
// =========================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =========================
// PAGE INIT
// =========================
document.addEventListener('DOMContentLoaded', async function () {
    // Cache all DOM elements first
    cacheDOMElements();
    setupEventDelegation();
    setupSpecialOrderModalEvents();
    initSpecialOrderModal();

    try {
        const res = await fetch(`${ADMIN_URL}/banners/hero/`);
        const json = await res.json();
        if (json.is_success && json.data && json.data.length > 0) {
            initHeroCarousel(json.data);
        } else {
            console.warn("No hero banner found");
        }
    } catch (err) {
        showErrorModal("Failed to load hero banner. Some features may not work properly.");
    }

    loadLists();
    loadCats();

    // Price range slider with debounce
    if (DOM.priceRange && DOM.priceValue) {
        const updatePrice = debounce((value) => {
            DOM.priceValue.textContent = '₦' + formatNumber(value);
        }, 100);
        DOM.priceRange.addEventListener('input', function () {
            updatePrice(this.value);
        });
    }

    // Apply filters with cached DOM
    if (DOM.applyFiltersBtn) {
        DOM.applyFiltersBtn.addEventListener("click", function () {
            currentFilters.search = DOM.searchInput ? DOM.searchInput.value.trim() : '';
            currentFilters.badge = DOM.badgeFilter ? DOM.badgeFilter.value : '';
            currentFilters.max_price = DOM.priceRange ? DOM.priceRange.value : '';

            const ratings = ["rating1", "rating2", "rating3", "rating4"];
            const ratingValues = ["5.0", "4.0", "3.0", "2.0"];
            currentFilters.rating = "";
            ratings.forEach((id, idx) => {
                const ratingEl = document.getElementById(id);
                if (ratingEl && ratingEl.checked) currentFilters.rating = ratingValues[idx];
            });

            currentFilters.page = 1;
            if (DOM.filterSidebar) DOM.filterSidebar.classList.remove('open');
            if (DOM.overlay) DOM.overlay.classList.remove('active');

            loadLists();
        });
    }

    // Filter sidebar with cached DOM
    const filterButton = document.getElementById('filter-button');
    const closeFilter = document.getElementById('close-filter');
    
    if (filterButton && DOM.filterSidebar && DOM.overlay) {
        filterButton.addEventListener('click', () => {
            DOM.filterSidebar.classList.add('open');
            DOM.overlay.classList.add('active');
        });
    }
    
    if (closeFilter && DOM.filterSidebar && DOM.overlay) {
        closeFilter.addEventListener('click', () => {
            DOM.filterSidebar.classList.remove('open');
            DOM.overlay.classList.remove('active');
        });
    }
    
    if (DOM.overlay && DOM.filterSidebar) {
        DOM.overlay.addEventListener('click', () => {
            DOM.filterSidebar.classList.remove('open');
            DOM.overlay.classList.remove('active');
        });
    }

    // Scroll arrows with cached DOM
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    if (leftArrow && DOM.filterContainer) {
        leftArrow.addEventListener('click', () => DOM.filterContainer.scrollBy({ left: -200, behavior: 'smooth' }));
    }
    if (rightArrow && DOM.filterContainer) {
        rightArrow.addEventListener('click', () => DOM.filterContainer.scrollBy({ left: 200, behavior: 'smooth' }));
    }

    // Infinite scroll with throttle for performance
    let scrollTimeout;
    window.addEventListener("scroll", () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(async () => {
            scrollTimeout = null;
            
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
                    showErrorModal("Failed to load more products. Please try again.");
                } finally {
                    isLoadingMore = false;
                    hidePreloader();
                }
            }
        }, 150);
    }, { passive: true });
});
