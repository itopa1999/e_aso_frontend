const accessToken = getCookie("access");

// Get product ID and name from URL parameters
const productId = getQueryParam('id');
const productName = getQueryParam('name');

if (!productId) {
    window.location.href = "404.html";
}

showPreloader("Loading mannequin view");

// DOM Elements
const mannequinsGrid = document.getElementById('mannequinsGrid');
const productNumberEl = document.getElementById('productNumber');
const productTitleEl = document.getElementById('productTitle');
const productNameEl = document.getElementById('productName');
const backToProductBtn = document.getElementById('backToProduct');
const productLink = document.getElementById('productLink');
const categoriesList = document.getElementById('categoriesList');
const mannequinOptions = document.getElementById('mannequinOptions');

// Mannequin positions data
const mannequinPositions = [
    { id: 1, label: 'Front View' },
    { id: 2, label: 'Back View' },
    { id: 3, label: 'Side View' },
    { id: 4, label: 'Detail View' }
];

let productData = null;
let productImages = {
    mainImage: '',
    images: []
};

// Retrieve product images from localStorage
function getProductImagesFromStorage() {
    try {
        const stored = localStorage.getItem('mannequinProductData');
        if (stored) {
            const data = JSON.parse(stored);
            productImages.mainImage = data.mainImage;
            productImages.images = data.images || [];
            console.log('Product images loaded from localStorage:', productImages);
        }
    } catch (error) {
        console.error('Failed to retrieve product images from localStorage:', error);
    }
}

// Render categories
function renderCategories(categories) {
    categoriesList.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        categoriesList.innerHTML = '<span style="color: #999; font-size: 0.9rem;">No categories</span>';
        return;
    }

    categories.forEach(category => {
        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = category.name || category;
        badge.title = category.name || category;
        categoriesList.appendChild(badge);
    });
}

// Render mannequin options
function renderMannequinOptions() {
    mannequinOptions.innerHTML = '';
    
    mannequinPositions.forEach(position => {
        const btn = document.createElement('button');
        btn.className = 'mannequin-option-btn';
        btn.innerHTML = `<span class="mannequin-option-icon">👕</span><span>${position.label}</span>`;
        mannequinOptions.appendChild(btn);
    });
}

// Render mannequins grid
function renderMannequinsGrid() {
    mannequinsGrid.innerHTML = '';
    
    mannequinPositions.forEach((position, index) => {
        const card = document.createElement('div');
        card.className = 'mannequin-card';
        card.innerHTML = `
            <div class="mannequin-viewer-content">
                <img src="img/mannequin.png" alt="${position.label}" class="mannequin-image">
            </div>
            <div class="mannequin-info">
                <div class="mannequin-label">${position.label}</div>
                <button class="mannequin-action-btn" data-position="${index + 1}" title="Blend product image onto this mannequin">
                    <i class="fas fa-magic"></i>
                    Blend Product
                </button>
            </div>
        `;
        
        // Add click handler to blend button
        const blendBtn = card.querySelector('.mannequin-action-btn');
        blendBtn.addEventListener('click', () => handleBlendProduct(index + 1));
        
        mannequinsGrid.appendChild(card);
    });
}

// Handle blending product image
async function handleBlendProduct(positionId) {
    console.log('Blend button clicked for position:', positionId);
    console.log('Product data:', productData);
    console.log('Product images from storage:', productImages);
    
    // Check if product has images
    if (!productData.product_main_image && !productData.product_image) {
        console.warn('No product images found in API response');
        console.log('product_main_image:', productData.product_main_image);
        console.log('product_image:', productData.product_image);
        
        // Check localStorage as fallback
        if (!productImages.mainImage) {
            showErrorModal('Product images are not available. Please add images to the product first.');
            return;
        }
    }

    // Get image to use - prefer product_main_image, then product_image, then fallback to localStorage
    const imageToBlend = productData.product_main_image || productData.product_image || productImages.mainImage;
    
    console.log('Image to blend:', imageToBlend);
    
    if (!imageToBlend) {
        showErrorModal('No product image available for blending. Please try again.');
        return;
    }
    
    try {
        const btn = document.querySelector(`[data-position="${positionId}"]`);
        if (!btn) {
            console.error('Button not found for position:', positionId);
            return;
        }
        
        btn.classList.add('loading');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Send request to backend to blend
        const response = await fetch(`${ASO_URL}/${productId}/blend-mannequin/`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                mannequin_position: positionId,
                product_image: imageToBlend
            })
        });

        console.log('Blend response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                showErrorModal('Blending service is not available. Please try again later.');
            } else {
                try {
                    const error = await response.json();
                    showErrorModal(error.detail || 'Failed to blend product image');
                } catch (e) {
                    showErrorModal('Failed to blend product image. Server error.');
                }
            }
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-magic"></i> Blend Product';
            return;
        }

        const result = await response.json();
        console.log('Blend result:', result);
        
        // Show success message and update image
        if (result.blended_image_url) {
            const mannequinImage = btn.closest('.mannequin-card').querySelector('.mannequin-image');
            if (mannequinImage) {
                mannequinImage.src = result.blended_image_url;
                mannequinImage.style.transition = 'opacity 0.3s ease';
            }
            
            // Show success feedback
            btn.innerHTML = '<i class="fas fa-check"></i> Blended!';
            btn.style.background = '#4CAF50';
            
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.innerHTML = '<i class="fas fa-magic"></i> Blend Product';
                btn.style.background = '';
            }, 2000);
        } else {
            console.warn('No blended_image_url in response');
            showErrorModal('Blending completed but no image returned. Please try again.');
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-magic"></i> Blend Product';
        }

    } catch (error) {
        console.error("Failed to blend product:", error);
        showErrorModal("An error occurred while blending. Please try again.");
        const btn = document.querySelector(`[data-position="${positionId}"]`);
        if (btn) {
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-magic"></i> Blend Product';
        }
    }
}

// Fetch product details
async function fetchProductDetails() {
    try {
        console.log('Fetching product details for ID:', productId);
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
        productData = data;
        
        console.log('Product data fetched:', data);
        console.log('product_main_image:', data.product_main_image);
        console.log('product_image:', data.product_image);
        
        // Update page with product info
        const productNumber = data.product_number || `AO-${data.id}`;
        const title = data.title || 'Product';
        
        productNumberEl.textContent = productNumber;
        productTitleEl.textContent = title;
        productNameEl.textContent = title;
        
        // Set back to product link
        const productUrl = generateProductUrl(data.id, data.title);
        backToProductBtn.href = productUrl;
        productLink.href = productUrl;

        // Render categories
        if (data.category) {
            renderCategories(data.category);
        }

        // Render mannequin options
        renderMannequinOptions();

        // Render mannequins grid
        renderMannequinsGrid();

    } catch (error) {
        console.error("Failed to load product details:", error);
        showErrorModal("Failed to load product information");
    } finally {
        hidePreloader();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing mannequin viewer');
    
    // Get product images from localStorage first
    getProductImagesFromStorage();
    console.log('localStorage images:', productImages);
    
    // Then fetch product details
    fetchProductDetails();
});
