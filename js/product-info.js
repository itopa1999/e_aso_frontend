const accessToken = getCookie("access");

showPreloader("Loading product info");
const productId = getQueryParam('id');
if (!productId) {
    window.location.href = "404.html";
}

// =========================
// DOM CACHE FOR PERFORMANCE
// =========================
const PRODUCT_DOM = {
    mainImage: null,
    thumbnailContainer: null,
    wishlistBtn: null,
    cartBtn: null,
    qtyInput: null,
    colorOptions: null,
    sizeOptions: null,
    cartBadge: null,
    wishlistBadge: null,
    tabs: null,
    tabContents: null
};

function cacheProductDOM() {
    PRODUCT_DOM.mainImage = document.getElementById('mainImage');
    PRODUCT_DOM.thumbnailContainer = document.getElementById('thumbnailContainer');
    PRODUCT_DOM.wishlistBtn = document.querySelector('.btn-wishlist');
    PRODUCT_DOM.cartBtn = document.querySelector('.btn-add-cart');
    PRODUCT_DOM.qtyInput = document.querySelector('.qty-input');
    PRODUCT_DOM.colorOptions = document.getElementById('color-options');
    PRODUCT_DOM.sizeOptions = document.getElementById('size-options');
    PRODUCT_DOM.cartBadge = document.getElementById("cart-count");
    PRODUCT_DOM.wishlistBadge = document.getElementById("watchlist-count");
    PRODUCT_DOM.tabs = document.querySelectorAll('.tab');
    PRODUCT_DOM.tabContents = document.querySelectorAll('.tab-content');
}

async function fetchProductDetails() {
    try {
        const response = await fetch(`${ASO_URL}/${productId}/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });
        if (response.status === 404) {
            window.location.href = "404.html";
            return;
        }
        const data = await response.json();
        renderProductDetails(data);
    } catch (error) {
        console.log("Failed to load product details items.", error);
    } finally {
        hidePreloader();
    }
}


function renderProductDetails(data) {

    // Basic Product Info
    const badgeEl = document.querySelector('.product-badge');
    if (data.badge) {
    badgeEl.textContent = data.badge;
    badgeEl.style.display = 'block';
    } else {
    badgeEl.style.display = 'none';
    }
    document.querySelector('.product-title').textContent = data.title;
    document.querySelector('.product-description-short').textContent = data.description;
    document.querySelector('.rating-count').textContent = `(${formatReviews(data.reviews_count)} reviews) | ${data.product_number}`;
    document.querySelector('.current-price').textContent =
        '₦' + formatNumber(data.current_price);

    // Price and Discount
    if (data.discount_percent && parseFloat(data.discount_percent) > 0) {
        document.querySelector('.original-price').textContent =
            '₦' + formatNumber(data.original_price);
        document.querySelector('.discount').textContent =
            `- ${data.discount_percent}%`;

        document.querySelector('.original-price').style.display = 'inline';
        document.querySelector('.discount').style.display = 'inline';
    } else {
        document.querySelector('.original-price').style.display = 'none';
        document.querySelector('.discount').style.display = 'none';
    }

    // Star Ratings
    document.querySelector('.stars').innerHTML = getStarHTML(data.rating);

    // Wishlist state
    setWishlistState(data.watchlisted);

    const AddToCartbtn2 = document.querySelector(".btn-add-cart");
    if (data.cart_added) {
        AddToCartbtn2.textContent = "✓ Added!";
        AddToCartbtn2.style.background  = "#28a745";
        AddToCartbtn2.disabled = true;
        AddToCartbtn2.style.cursor = "not-allowed";
    }

    // Render Options
    renderOptions('color-options', data.colors, 'color');
    renderOptions('size-options', data.sizes, 'size');
    renderOptions('cart-options', data.category, 'category');

    /**
     * Utility function to render option buttons (color, size, etc.) - OPTIMIZED
     */
    function renderOptions(containerId, options, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!options || options.length === 0) {
            container.innerHTML = `<p style="color:red;">No ${type}s available.</p>`;
            return;
        }

        // Use DocumentFragment for batch insertion
        const fragment = document.createDocumentFragment();
        
        options.forEach((item, index) => {
            const option = document.createElement('div');
            option.className = 'size-option';
            option.textContent = item.color_name || item.size_label || item.name;
            option.dataset[type] = item.color_name || item.size_label || item.name;

            // Select first by default
            if (index === 0) option.classList.add('active');
            
            fragment.appendChild(option);
        });

        container.appendChild(fragment);

        // Event delegation instead of individual listeners
        handleSelection(container);
    }

    /**
     * Handle active selection toggle for options
     */
    function handleSelection(container) {
    container.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', () => {
            // If the clicked item is already active, remove the class
            if (option.classList.contains('active')) {
                option.classList.remove('active');
            } else {
                // Otherwise, remove active from others and add to the clicked one
                container.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            }
        });
    });
}
            

    if (PRODUCT_DOM.mainImage) {
        if (data.main_image) {
            PRODUCT_DOM.mainImage.style.backgroundImage = `url('${data.main_image}')`;
        } else {
            PRODUCT_DOM.mainImage.style.backgroundImage = `url("img/product_image.png")`;
        }

        PRODUCT_DOM.mainImage.style.backgroundSize = 'contain';
        PRODUCT_DOM.mainImage.style.backgroundPosition = 'center';
        PRODUCT_DOM.mainImage.style.backgroundRepeat = 'no-repeat';
    }

    if (PRODUCT_DOM.thumbnailContainer) {
        PRODUCT_DOM.thumbnailContainer.innerHTML = '';
        
        // Use DocumentFragment for batch insertion
        const fragment = document.createDocumentFragment();
        
        data.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.style.backgroundImage = `url('${image.image}')`;
            thumbnail.style.backgroundSize = 'contain';
            thumbnail.style.backgroundPosition = 'center';
            thumbnail.style.backgroundRepeat = 'no-repeat';
            thumbnail.dataset.imageUrl = image.image;
            
            if (index === 0) {
                thumbnail.classList.add('active');
            }
            
            fragment.appendChild(thumbnail);
        });
        
        PRODUCT_DOM.thumbnailContainer.appendChild(fragment);
        
        // Event delegation for thumbnails
        PRODUCT_DOM.thumbnailContainer.addEventListener('click', function(e) {
            const thumbnail = e.target.closest('.thumbnail');
            if (!thumbnail || !PRODUCT_DOM.mainImage) return;
            
            PRODUCT_DOM.mainImage.style.backgroundImage = `url('${thumbnail.dataset.imageUrl}')`;
            
            // Update active thumbnail
            PRODUCT_DOM.thumbnailContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    }

    const descriptionData = data.details.find(item => item.tab === "description");
    const detailsData = data.details.filter(item => item.tab === "details");
    const shippingData = data.details.find(item => item.tab === "shipping");

    // Description
    if (descriptionData) {
        document.getElementById("description").innerHTML = `
            <p class="product-description">${descriptionData.content.replace(/\r\n/g, "<br>")}</p>
        `;
    }

    // Details (multiple)
    const detailsContainer = document.getElementById("details");
    if (detailsData.length > 0) {
        detailsContainer.innerHTML = detailsData.map(detail => `
            <div class="detail-item">
                <div class="detail-title">${detail.title}</div>
                <div class="detail-value">${detail.content.replace(/\r\n/g, "<br>")}</div>
            </div>
        `).join("");
    }

    // Shipping
    if (shippingData) {
        document.getElementById("shipping").innerHTML = `
            <div class="detail-item">
                <div class="detail-title">${shippingData.title}</div>
                <div class="detail-value">${shippingData.content.replace(/\r\n/g, "<br>")}</div>
            </div>
        `;
    }

    const ProductRelatedContainer = document.querySelector('.products-grid');
    ProductRelatedContainer.innerHTML = '';
    
    data.related_products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.className = 'product-card';
        productItem.innerHTML = `
            <a href="${generateProductUrl(product.id, product.title)}">
                <div class="product-card-image" style="background-image: url('${product.product_image || "img/product_image.png"}');"></div>
            </a>
            <div class="product-card-details">
                <a style='text-decoration:none'; href="${generateProductUrl(product.id, product.title)}">
                    <h3 class="product-card-title">${product.title}</h3>
                </a>
                <div class="product-card-price">₦${formatNumber(product.current_price)}</div>
            </div>
         `;
        ProductRelatedContainer.appendChild(productItem);
    });

    attachWatchlistEvents(data.id);
    attachCartEvents(data.id);
}

function attachCartEvents(id) {
    const cartBadge = document.getElementById("cart-count");
    const addToCartBtn = document.querySelector('.btn-add-cart');
    const qtyInput = document.querySelector('.qty-input');
    const colorOptionsContainer = document.getElementById('color-options');
    const sizeOptionsContainer = document.getElementById('size-options');


    addToCartBtn.addEventListener('click', async function() {
        if (!accessToken) {
            window.location.href = "auth.html";
            return;
        }

        // Get selected color and size
        const selectedColor = colorOptionsContainer.querySelector('.size-option.active')?.dataset.color;
        const selectedSize = sizeOptionsContainer.querySelector('.size-option.active')?.dataset.size;

        const selectedAttributes = {
            color: selectedColor || null,
            size: selectedSize || null
        };
            

        try {
            showPreloader("Adding items to cart...");

            const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${id}&quantity=${qtyInput.value}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ desc: selectedAttributes })
            });

            if (res.status === 401) {
                window.location.href = "auth.html";
                return;
            }

            if (!res.ok) throw new Error("Failed to move items to cart");

            const data = await res.json();
            const itemsMoved = data.data.items_added;
            let currentCount = parseInt(cartBadge.textContent) || 0;
            cartBadge.textContent = currentCount + itemsMoved;

            // Animation
            addToCartBtn.innerHTML = '✓ Added!';
            addToCartBtn.style.background = '#28a745';
            addToCartBtn.disabled = true;
            addToCartBtn.style.cursor = "not-allowed";
        
        } catch (error) {
            console.error(error);
            showErrorModal(error.message || "Error moving items to cart.");
        } finally {
            hidePreloader();
        }
    });
}

function attachWatchlistEvents(id) {
    const wishlistButton = document.querySelector('.btn-wishlist');
    const wishlistCountElement = document.getElementById("watchlist-count");

    wishlistButton.addEventListener('click', async function () {
        if (!accessToken) {
            window.location.href = "auth.html";
            return;
        }
        showPreloader("updating watchlist");
        try {
            const response = await fetch(`${ASO_URL}/toggle-watchlist/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (response.status === 401) {
                window.location.href = "auth.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to toggle watchlist");
            }
            const data = await response.json();
            let count = parseInt(wishlistCountElement.textContent);
            if (data.data.watchlisted) {
                setWishlistState(data.data.watchlisted);
                count += 1;
            } else {
                setWishlistState(data.watchlisted)
                count = Math.max(0, count - 1);
            }
            wishlistCountElement.textContent = count;
        } catch (error) {
            showErrorModal(error.message || "Failed to toggle watchlist");
        } finally {
            hidePreloader();
        }
    })
}

// Thumbnail Gallery Functionality - OPTIMIZED
document.addEventListener('DOMContentLoaded', function() {
    cacheProductDOM();
    fetchProductDetails();

    // Tab functionality with event delegation
    const tabsContainer = document.querySelector('.tabs-container') || document.body;
    tabsContainer.addEventListener('click', function(e) {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        
        const tabId = tab.getAttribute('data-tab');
        if (!tabId) return;
        
        // Remove active class from all tabs and contents
        if (PRODUCT_DOM.tabs) {
            PRODUCT_DOM.tabs.forEach(t => t.classList.remove('active'));
        }
        if (PRODUCT_DOM.tabContents) {
            PRODUCT_DOM.tabContents.forEach(c => c.classList.remove('active'));
        }
        
        // Add active class to current tab and content
        tab.classList.add('active');
        const content = document.getElementById(tabId);
        if (content) content.classList.add('active');
    });
    
    // Quantity selector with event delegation
    const qtyContainer = document.querySelector('.quantity-selector');
    if (qtyContainer && PRODUCT_DOM.qtyInput) {
        qtyContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.qty-btn');
            if (!btn) return;
            
            let value = parseInt(PRODUCT_DOM.qtyInput.value) || 1;
            
            if (btn.classList.contains('minus') && value > 1) {
                PRODUCT_DOM.qtyInput.value = value - 1;
            } else if (btn.classList.contains('plus')) {
                PRODUCT_DOM.qtyInput.value = value + 1;
            }
        });
    }
    
    
    
});

const wishlistBtn = document.querySelector('.btn-wishlist');

function setWishlistState(isWatchlisted) {
    const icon = wishlistBtn.querySelector('i');

    if (isWatchlisted) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        wishlistBtn.style.color = '#e74c3c';
        wishlistBtn.style.borderColor = '#e74c3c';
        icon.nextSibling.textContent = ' Watchlisted';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlistBtn.style.color = '';
        wishlistBtn.style.borderColor = '';
        icon.nextSibling.textContent = ' Wishlist';
    }
}