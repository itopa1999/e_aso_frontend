


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
    heroLink: null
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
    DOM.heroImage = document.getElementById("hero-image");
    DOM.heroLink = document.getElementById("hero-link");
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
                console.error(error);
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
                console.error(error);
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

//     const feedbackModal = document.getElementById('feedbackModal');
//     const closeModalBtn = document.getElementById('closeModal');
//     const closeSuccessBtn = document.getElementById('closeSuccess');
//     const feedbackForm = document.getElementById('feedbackForm');
//     const successMessage = document.getElementById('successMessage');
//     const stars = document.querySelectorAll('.star');
//     const ratingValue = document.getElementById('ratingValue');
//     const userRatingInput = document.getElementById('userRating');
//     const submitBtn = document.getElementById('submitFeedback');
//     const userName = document.getElementById('FeedbackUserName');
//     const userFeedback = document.getElementById('userFeedback');

//     // Check if user has visited before using localStorage
//     const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
//     // Show modal if user has visited before (not first time)
//     // For demo purposes, we'll show it after a delay
//     // In production, you would check: if (hasVisitedBefore) { showModal(); }
//     setTimeout(() => {
//         if (!hasVisitedBefore) {
//             // First visit - set the flag for next time
//             localStorage.setItem('hasVisitedBefore', 'true');
//         } else {
//             // Returning visitor - show the modal after 2 seconds
//             setTimeout(showModal, 2000);
//         }
//     }, 1000);
    
//     // Show modal function
//     function showModal() {
//         feedbackModal.classList.add('active');
//         document.body.style.overflow = 'hidden'; // Prevent scrolling
//     }
    
//     // Hide modal function
//     function hideModal() {
//         feedbackModal.classList.remove('active');
//         document.body.style.overflow = ''; // Re-enable scrolling
//     }
    
//     // Close modal events
//     closeModalBtn.addEventListener('click', hideModal);
//     closeSuccessBtn.addEventListener('click', hideModal);
    
//     // Close modal when clicking outside
//     feedbackModal.addEventListener('click', function(e) {
//         if (e.target === feedbackModal) {
//             hideModal();
//         }
//     });

//     stars.forEach(star => {
//     star.style.pointerEvents = 'auto'; // ensure clickable
//     star.addEventListener('click', (e) => {
//         e.stopPropagation(); // prevent modal click event
//         const rating = parseInt(e.currentTarget.getAttribute('data-rating'));
//         console.log("⭐ Star clicked:", rating);
//         setRating(rating);
//     });

//     star.addEventListener('mouseover', (e) => {
//         const rating = parseInt(e.currentTarget.getAttribute('data-rating'));
//         highlightStars(rating);
//     });
// });

            
//     // Reset stars when mouse leaves the rating container
//     document.querySelector('.star-rating').addEventListener('mouseleave', function() {
//         const currentRating = parseInt(userRatingInput.value);
//         highlightStars(currentRating);
//     });
    
//     // Set rating function
//     function setRating(rating) {
//         userRatingInput.value = rating;
//         ratingValue.textContent = rating;
//         highlightStars(rating);
        
//         // Enable submit button if all fields are filled
//         validateForm();
//     }
    
//     // Highlight stars based on rating
//     function highlightStars(rating) {
//         stars.forEach(star => {
//             const starRating = parseInt(star.getAttribute('data-rating'));
//             if (starRating <= rating) {
//                 star.innerHTML = '<i class="fas fa-star"></i>';
//                 star.classList.add('active');
//             } else {
//                 star.innerHTML = '<i class="far fa-star"></i>';
//                 star.classList.remove('active');
//             }
//         });
//     }
    
//     // Form validation
//     function validateForm() {
//         console.log("userRatingInput value:", userRatingInput.value);
//         console.log("ValUserName value:", userName.value);
//         console.log("ValUserFeedback value:", userFeedback.value);
//         const ValUserName = userName.value.trim();
//         const ValUserFeedback = userFeedback.value.trim();
//         const userRating = userRatingInput.value;
        
//         if (ValUserName && ValUserFeedback && userRating !== '0') {
//             submitBtn.disabled = false;
//         } else {
//             submitBtn.disabled = true;
//         }
//     }
    
//     // Add input event listeners for form validation
//     userName.addEventListener('input', validateForm);
//     userFeedback.addEventListener('input', validateForm);
    
//     // Form submission
//     feedbackForm.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         // Get form values
//         const ValUserName = userName.value.trim();
//         const ValUserFeedback = userFeedback.value.trim();
//         const userRating = userRatingInput.value;
        
//         // In a real application, you would send this data to your server
//         console.log('Feedback submitted:', {
//             user: ValUserName,
//             feedback: ValUserFeedback,
//             rating: userRating
//         });
        
//         // Show success message
//         feedbackForm.style.display = 'none';
//         successMessage.style.display = 'block';
        
//         // In a real application, you would:
//         // 1. Send data to your API endpoint
//         // 2. Handle success/error responses
//         // 3. Possibly store in localStorage that feedback was submitted to avoid showing again
//     });

    
//     // Demo: Show modal after 3 seconds (for testing)
//     // Remove this in production
//     // setTimeout(showModal, 3000);
//     // showModal();



    try {
        const res = await fetch(`${ADMIN_URL}/banners/hero/`);
        const json = await res.json();
        if (json.is_success && json.data && json.data.length > 0) {
            const banner = json.data[0];
            if (DOM.heroImage) DOM.heroImage.src = banner.image;
            if (DOM.heroLink) DOM.heroLink.href = banner.link || "#";
        } else {
            console.warn("No hero banner found");
        }
    } catch (err) {
        console.error("Error loading hero banner:", err);
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
                    console.error("Error loading more products:", err);
                } finally {
                    isLoadingMore = false;
                    hidePreloader();
                }
            }
        }, 150);
    }, { passive: true });
});
