const accessToken = getCookie("access");

showPreloader("Loading product info");
const productId = getQueryParam('id');
if (!productId) {
    window.location.href = "404.html";
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
        alert("Failed to load product details items.");
    } finally {
        hidePreloader();
    }
}


function renderProductDetails(data) {
    console.log(data)
    document.querySelector('.product-badge').textContent = data.badge;
    document.querySelector('.product-title').textContent = data.title;
    document.querySelector('.product-description-short').textContent = data.description;
    document.querySelector('.rating-count').textContent = '('+formatReviews(data.reviews_count)+' reviews) | ' + data.product_number;
    document.querySelector('.current-price').textContent = 
        '₦' + parseFloat(data.current_price).toLocaleString();

    if (data.discount_percent && parseFloat(data.discount_percent) > 0) {
        document.querySelector('.original-price').textContent = 
            '₦' + parseFloat(data.original_price).toLocaleString();
        document.querySelector('.discount').textContent = 
            '- ' + data.discount_percent + '%';

        document.querySelector('.original-price').style.display = 'inline';
        document.querySelector('.discount').style.display = 'inline';
    } else {
        document.querySelector('.original-price').style.display = 'none';
        document.querySelector('.discount').style.display = 'none';
    }    document.querySelector('.stars').innerHTML = getStarHTML(data.rating);
    
    setWishlistState(data.watchlisted);
    
    const colorOptionsContainer = document.querySelector('.color-options');
    colorOptionsContainer.innerHTML = '';

    data.colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option color-${index + 1}`;
        colorOption.style.backgroundColor = color.color_name;
        colorOption.dataset.color = color.color_name;
        colorOptionsContainer.appendChild(colorOption);
    });

    const sizeOptionsContainer = document.getElementById('size-options');
    sizeOptionsContainer.innerHTML = '';
    
    data.sizes.forEach((size, index) => {
        const sizeOption = document.createElement('div');
        sizeOption.className = 'size-option';
        sizeOption.textContent = size.size_label;
        sizeOption.dataset.size = size.size_label;
        sizeOptionsContainer.appendChild(sizeOption);
    });

    const CatContainer = document.getElementById('cart-options');
    CatContainer.innerHTML = '';
    
    data.category.forEach((cart, index) => {
        const cartOption = document.createElement('div');
        cartOption.className = 'size-option';
        cartOption.textContent = cart.name;
        cartOption.dataset.size = cart.name;
        CatContainer.appendChild(cartOption);
    });

            

    const mainImage = document.getElementById('mainImage');

    if (data.main_image) {
        mainImage.style.background = `url('${data.main_image}')`;
    } else {
        mainImage.style.background = `url("/img/product_image.jpeg")`;
    }

    mainImage.style.backgroundSize = 'contain';
    mainImage.style.backgroundPosition = 'center';
    mainImage.style.backgroundRepeat = 'no-repeat';

    const thumbnailContainer = document.getElementById('thumbnailContainer');
    thumbnailContainer.innerHTML = '';
    
    data.images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.style.backgroundImage = `url('${image.image}')`;
        thumbnail.style.backgroundSize = 'cover';
        thumbnail.style.backgroundPosition = 'center';
        
        if (index === 0) {
            thumbnail.classList.add('active');
        }
        
        thumbnail.addEventListener('click', function() {
            mainImage.style.backgroundImage = `url('${image.image}')`;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        thumbnailContainer.appendChild(thumbnail);
    });

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
            <a href="product-info.html?id=${product.id}">
                <div class="product-card-image" style="background-image: url('${product.main_image || "/img/product_image.jpeg"}');"></div>
            </a>
            <div class="product-card-details">
                <a style='text-decoration:none'; href="product-info.html?id=${product.id}">
                    <h3 class="product-card-title">${product.title}</h3>
                </a>
                <div class="product-card-price">₦${parseFloat(product.current_price).toLocaleString()}</div>
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
    addToCartBtn.addEventListener('click', async function() {
        if (!accessToken) {
            window.location.href = "auth.html";
            return;
        }
        try {
            showPreloader("Adding items to cart...");

            const res = await fetch(`${ASO_URL}/add-to-cart/?product_id=${id}&quantity=${qtyInput.value}`, {
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

            // Animation
            addToCartBtn.innerHTML = '✓ Added!';
            addToCartBtn.style.background = '#28a745';
        
        } catch (error) {
            console.error(error);
            alert("Error moving items to cart.");
        } finally {
            hidePreloader();
            setTimeout(() => {
                addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                addToCartBtn.style.background = 'linear-gradient(to right, var(--primary-color), var(--dark-color))';
            }, 2000);
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
            if (data.watchlisted) {
                setWishlistState(data.watchlisted);
                count += 1;
            } else {
                setWishlistState(data.watchlisted)
                count = Math.max(0, count - 1);
            }
            wishlistCountElement.textContent = count;
        } catch (error) {
            alert("Failed to toggle watchlist");
        } finally {
            hidePreloader();
        }
    })
}

// Thumbnail Gallery Functionality
document.addEventListener('DOMContentLoaded', function() {
    fetchProductDetails()

    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });


    // Thumbnail selection
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    
    // Quantity selector
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.querySelector('.qty-input');
    
    minusBtn.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        if (value > 1) {
            qtyInput.value = value - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        qtyInput.value = value + 1;
    });
    
    
    
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