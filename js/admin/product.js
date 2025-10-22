const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Products data");

// DOM elements
const productsGrid = document.getElementById('products-grid');
const productDetail = document.getElementById('product-detail');
const backToProducts = document.getElementById('back-to-products');
const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
const searchInput = document.getElementById('product-search');
const searchButton = document.getElementById('search-button');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const ratingFilter = document.getElementById('rating-filter');
const badgeFilter = document.getElementById('badge-filter');
const featureFilter = document.getElementById('featured-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
let currentProduct = null;
let currentCategories = null;


productsGrid.innerHTML = '<div class="no-products">Empty Filter</div>';

async function loadCats() {
    try {
        const res = await fetch(`${ASO_URL}/categories/`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        populateCategoryFilter(data);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function populateCategoryFilter(categories) {
    currentCategories = categories
    const categorySelect = document.getElementById("category-filter");

    // Clear existing options
    categorySelect.innerHTML = '<option value="">All Categories</option>';

    // Populate dynamically
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.slug || cat.id || cat.name; // Use slug or id for backend filtering
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}



async function filterProducts() {
    const searchTerm = searchInput.value.trim();
    const categoryValue = categoryFilter.value;
    const priceValue = priceFilter.value;
    const ratingValue = ratingFilter.value;
    const badgeValue = badgeFilter.value;
    const featuredValue = featureFilter.value;

    if (
        !searchTerm &&
        !categoryValue &&
        !priceValue &&
        !ratingValue &&
        !badgeValue &&
        !featuredValue
    ) {
    alert("Please provide at least one filter option.");
    return;
    }

    const params = new URLSearchParams();

    // Add filters dynamically
    if (searchTerm) params.append("search", searchTerm);
    if (categoryValue) params.append("category", categoryValue);
    if (ratingValue) params.append("rating", ratingValue);
    if (badgeValue) params.append("badge", badgeValue);

    // Handle price range mapping
    switch (priceValue) {
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

    // Handle ordering
    switch (featuredValue) {
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

    try {
        showPreloader("searching for products")
        const response = await fetch(`${ADMIN_URL}/products/?${params.toString()}`, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.status === 401) {
            window.location.href = "/auth.html";
            return;
        }

        if (response.status === 404) {
            window.location.href = "/auth.html";
            return;
        }

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();

        

        // Update your UI with the filtered products
        renderProducts(data.results);
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally{
        hidePreloader()
    }
}


function renderProducts(products) {
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }

    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.addEventListener('click', () => showProductDetail(product));
        
        // Determine badge class
        let badgeClass = '';
        if (product.badge === "New") badgeClass = "badge-new";
        else if (product.badge === "Best Seller") badgeClass = "badge-bestseller";
        else if (product.badge === "Limited") badgeClass = "badge-limited";
        
        // Generate star rating HTML
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        let starsHtml = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && halfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        productCard.innerHTML = `
            <div class="product-image"
                style="background-image: url('${product.main_image || "/img/product_image.png"}');">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-id">${product.product_number} (${product.reviews_count} reviews)</div>
                <div class="product-price">
                    <span class="current-price">₦${formatNumber(product.current_price)}</span>
                    ${product.original_price > product.current_price ? 
                        `<span class="original-price">₦${formatNumber(product.original_price)}</span>` : ''}
                </div>
                <div class="product-meta">
                    <div class="product-rating">
                        <span class="rating-stars">${getStarHTML(product.rating)}</span>
                    </div>
                    ${product.badge ? `<span class="product-badge ${badgeClass}">${product.badge}</span>` : ''}
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });

    
}

// Show product detail function
function showProductDetail(product) {
     currentProduct = product;
    showPreloader("Loading product details")
    // Hide products grid and show detail view
    productsGrid.style.display = 'none';
    productDetail.style.display = 'block';
    
    console.log(product)
    // Update breadcrumb
    breadcrumbProductName.textContent = product.title;
    
    // Update main product image
    const mainImage = document.getElementById('detail-main-image');

    if (product.main_image && product.main_image.trim() !== '') {
        mainImage.style.backgroundImage = `url('${product.main_image}')`;
    } else {
        mainImage.style.backgroundImage = `url("/img/product_image.png")`;
    }

    mainImage.style.backgroundSize = 'contain';
    mainImage.style.backgroundPosition = 'center';
    mainImage.style.backgroundRepeat = 'no-repeat';

    // Update thumbnails
    const thumbnailList = document.getElementById('thumbnail-list');
    thumbnailList.innerHTML = '';

    product.images.forEach((imgObj, index) => {
        const imageUrl = imgObj.image;  // <-- Access the image URL

        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
        thumbnail.innerHTML = `<img src="${imageUrl}" alt="Thumbnail ${index + 1}">`;

        thumbnail.addEventListener('click', () => {
            mainImage.style.backgroundImage = `url('${imageUrl}')`;
            mainImage.style.backgroundSize = 'contain';
            mainImage.style.backgroundPosition = 'center';
            mainImage.style.backgroundRepeat = 'no-repeat';

            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });

        thumbnailList.appendChild(thumbnail);
    });

    
    // Update product info
    document.getElementById('detail-title').textContent = product.title;
    document.getElementById('detail-id').textContent = product.product_number;
    document.getElementById('detail-current-price').textContent = `₦${formatNumber(product.current_price)}`;
    
    if (product.original_price > product.current_price) {
        document.getElementById('detail-original-price').textContent = `₦${formatNumber(product.original_price)}`;
        document.getElementById('detail-discount').textContent = `(${product.discount_percent}% off)`;
    } else {
        document.getElementById('detail-original-price').textContent = '';
        document.getElementById('detail-discount').textContent = '';
    }
    
    // Generate star rating
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    
    document.getElementById('detail-rating-stars').innerHTML = starsHtml;
    // document.getElementById('detail-rating-value').textContent = product.rating;
    document.getElementById('detail-reviews').textContent = product.reviews_count;
    
    // Update badge
    const detailBadge = document.getElementById('detail-badge');
    if (product.badge) {
        detailBadge.textContent = product.badge;
        if (product.badge === "New") detailBadge.className = "product-badge badge-new";
        else if (product.badge === "Best Seller") detailBadge.className = "product-badge badge-bestseller";
        else if (product.badge === "Limited") detailBadge.className = "product-badge badge-limited";
        detailBadge.style.display = 'block';
    } else {
        detailBadge.style.display = 'none';
    }
    
    document.getElementById('detail-description').textContent = product.description;

    // Render Options
    renderOptions('color-options', product.colors, 'color');
    renderOptions('size-options', product.sizes, 'size');
    renderOptions('cart-options', product.categories, 'category');

    function renderOptions(containerId, options, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!options || options.length === 0) {
            container.innerHTML = `<p style="color:red;">No ${type}s available.</p>`;
            return;
        }

        options.forEach((item, index) => {
            const option = document.createElement('div');
            option.className = 'size-option';
            option.textContent = item.color_name || item.size_label || item.name;
            option.dataset[type] = item.color_name || item.size_label || item.name;
            container.appendChild(option);

        });

    }

    const descriptionData = product.details.find(item => item.tab === "description");
    const detailsData = product.details.filter(item => item.tab === "details");
    const shippingData = product.details.find(item => item.tab === "shipping");

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

    const tbody = document.getElementById("orders-tbody");

    product.related_orders.forEach(order => {
        const tr = document.createElement("tr");

        const deliveryDate = order.delivery_date ? order.delivery_date : "Not set yet";

        tr.innerHTML = `
            <td>${order.order_number}</td>
            <td>${order.customer_first_name} ${order.customer_last_name}</td>
            <td>${order.amount}</td>
            <td>${deliveryDate}</td>
            <td>${order.latest_tracking_status}</td>
        `;

        tbody.appendChild(tr);
    });


    
    // Scroll to top
    window.scrollTo({top: 40, behavior: 'smooth'});

    hidePreloader()
}

document.addEventListener('DOMContentLoaded', function() {
    loadCats()

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

    // Back to products function
    backToProducts.addEventListener('click', function() {
        productDetail.style.display = 'none';
        productsGrid.style.display = 'grid';
    });
    
    // Event listeners for filters
    applyFiltersBtn.addEventListener('click', filterProducts);
    
    resetFiltersBtn.addEventListener('click', function() {
        searchInput.value = '';
        categoryFilter.value = '';
        priceFilter.value = '';
        ratingFilter.value = '';
        badgeFilter.value = '';
        featureFilter.value = '';

        renderProducts(data.results);
    });
    
    searchButton.addEventListener('click', filterProducts);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });

    const editButton = document.getElementById("editButton");
    const modal = document.getElementById("editProductModal");
    const closeModal = document.getElementById("closeModal");
    const editForm = document.getElementById("editProductForm");

    // Open modal
    editButton.addEventListener("click", () => {
        if (!currentProduct) {
            alert("No product selected!");
            return;
        }
        // Prepopulate fields
        document.getElementById("edit-title").value = currentProduct.title || "";
        document.getElementById("edit-description").value = currentProduct.description || "";
        document.getElementById("edit-current_price").value = currentProduct.current_price || "";
        document.getElementById("edit-original_price").value = currentProduct.original_price || "";
        document.getElementById("edit-discount_percent").value = currentProduct.discount_percent || "";

        // Badge dropdown
        const badgeSelect = document.getElementById("edit-badge");
        if (currentProduct.badge) {
            badgeSelect.value = currentProduct.badge; // sets the dropdown to match
        } else {
            badgeSelect.value = ""; // fallback
        }

        // Main image preview setup
        let mainImageInput = document.getElementById("edit-main_image");
        let preview = document.createElement("img");
        preview.style.width = "120px";
        preview.style.marginTop = "10px";
        mainImageInput.insertAdjacentElement("afterend", preview);

        // Show existing image if available
        if (currentProduct.main_image) {
            preview.src = currentProduct.main_image;
        }

        // Change preview when a new image is selected
        mainImageInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result; // Show selected image
                };
                reader.readAsDataURL(file);
            } else {
                // If no file selected, fallback to original product image
                preview.src = currentProduct.main_image || "";
            }
        });

        let categorySelect = document.getElementById("edit-category");
        categorySelect.innerHTML = ""; // clear existing options

        currentCategories.forEach(cat => {
            let option = document.createElement("option");
            option.value = cat.name;
            option.textContent = cat.name;

            // Pre-select categories that belong to this product
            if (currentProduct.categories.some(c => c.name === cat.name)) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });


        modal.style.display = "flex";
    });

    // Close modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    // Handle form submission
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(editForm);

        // Log all fields
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // Log categories separately
        let selectedCategories = Array.from(
            document.getElementById("edit-category").selectedOptions
        ).map(option => option.value);

        console.log("Selected Categories:", selectedCategories);

        // try {
        //     const res = await fetch(`${ADMIN_URL}/products/update/`, {
        //         method: "POST",
        //         headers: { 
        //             "Authorization": `Bearer ${accessToken}`,
        //         },
        //         body: formData,
        //     });

        //     if (!res.ok) throw new Error(`Error: ${res.status}`);

        //     alert("✅ Product updated successfully!");
        //     modal.style.display = "none";
        //     filterProducts(); // Refresh product list
        // } catch (err) {
        //     console.error(err);
        //     alert("❌ Failed to update product.");
        // }
    });

    document.getElementById("resetTokenLink").addEventListener("click", async function (e) {
        e.preventDefault();

        showPreloader("Requesting for new Token");
        try {
        const response = await fetch(`${ADMIN_URL}/send-token/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ email: email }),
        });

        if (response.ok) {
            const data = await response.json();
            showAlert("✅ Token sent successfully: " + (data.message || ""));
        } else {
            const errorData = await response.json();
            alert("❌ Failed: " + (errorData.error || "Something went wrong"));
        }
        } catch (error) {
        console.error("Error:", error);
        alert("❌ Network error, please try again.");
        } finally{
            hidePreloader()
        }
    });



    hidePreloader();

    
});
