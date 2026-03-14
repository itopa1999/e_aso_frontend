document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('customOrderForm');
    const fileInput = document.getElementById('attachments');
    const fileList = document.getElementById('fileList');
    const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const contactInfoSection = document.getElementById('contactInfoSection');
    const contactPhoneInput = document.getElementById('contactPhone');
    const contactEmailInput = document.getElementById('contactEmail');

    // Check if user is authenticated and hide/show contact info accordingly
    function setupContactFields() {
        const authData = {
            access: getCookie('access'),
            email: getCookie('email')
        };

        if (authData.access && authData.email) {
            // User is authenticated - hide contact info section
            contactInfoSection.style.display = 'none';
            contactPhoneInput.removeAttribute('required');
            contactEmailInput.removeAttribute('required');
        } else {
            // User is not authenticated - show contact info section as optional
            contactInfoSection.style.display = 'grid';
            contactPhoneInput.removeAttribute('required');
            contactEmailInput.removeAttribute('required');
        }
    }

    // Helper to read cookies
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (!match) return null;

        let value = decodeURIComponent(match[2]);

        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }

        return value;
    }

    // Setup contact fields on load
    setupContactFields();

    // File Upload Handling
    if (fileUploadWrapper) {
        fileUploadWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadWrapper.classList.add('dragover');
        });

        fileUploadWrapper.addEventListener('dragleave', () => {
            fileUploadWrapper.classList.remove('dragover');
        });

        fileUploadWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadWrapper.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            fileInput.files = files;
            displayFileList(files);
        });

        fileInput.addEventListener('change', (e) => {
            displayFileList(e.target.files);
        });
    }

    // Display Selected Files with Validation
    function displayFileList(files) {
        fileList.innerHTML = '';
        const fileError = document.getElementById('fileError');
        fileError.innerHTML = '';
        fileError.classList.remove('show');
        
        if (files.length === 0) {
            return;
        }

        const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validFiles = [];
        const errors = [];

        Array.from(files).forEach((file, index) => {
            // Check file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`${file.name} is not an image file. Only JPG, PNG, GIF, and WEBP are allowed.`);
                return;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                errors.push(`${file.name} is ${sizeMB}MB. Maximum allowed size is 4MB.`);
                return;
            }

            validFiles.push(file);
        });

        // Update file input with only valid files
        if (validFiles.length < files.length) {
            const dataTransfer = new DataTransfer();
            validFiles.forEach(f => dataTransfer.items.add(f));
            fileInput.files = dataTransfer.files;
        }

        // Display errors if any
        if (errors.length > 0) {
            fileError.innerHTML = '<strong>File Upload Errors:</strong><br>' + errors.join('<br>');
            fileError.classList.add('show');
        }

        // Display valid files
        validFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

            fileItem.innerHTML = `
                <i class="fas fa-image"></i>
                <div style="flex: 1;">
                    <span>${file.name}</span>
                    <small style="display: block; color: #999; font-size: 0.8rem;">${sizeMB}MB</small>
                </div>
                <button type="button" class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            fileList.appendChild(fileItem);

            // Remove file functionality
            const removeBtn = fileItem.querySelector('.remove-file');
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const dataTransfer = new DataTransfer();
                Array.from(fileInput.files).forEach((f, i) => {
                    if (i !== index) {
                        dataTransfer.items.add(f);
                    }
                });
                fileInput.files = dataTransfer.files;
                displayFileList(fileInput.files);
            });
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Get form data
            const formData = new FormData(form);
            
            // Generate order reference
            const orderRef = generateOrderReference();
            const email = document.getElementById('contactEmail').value;

            try {
                // Here you would typically send the data to your backend
                // For now, we'll just simulate the submission
                console.log('Submitting order:', {
                    productName: formData.get('productName'),
                    description: formData.get('description'),
                    quantity: formData.get('quantity'),
                    estimatedPrice: formData.get('estimatedPrice'),
                    deliveryAddress: formData.get('deliveryAddress'),
                    contactPhone: formData.get('contactPhone'),
                    contactEmail: formData.get('contactEmail'),
                    deliveryDate: formData.get('deliveryDate'),
                });

                // Show success modal
                showSuccessModal(orderRef, email);

                // Reset form
                form.reset();
                fileInput.value = '';
                fileList.innerHTML = '';
                form.classList.remove('was-validated');

            } catch (error) {
                console.error('Error submitting order:', error);
                alert('Error submitting order. Please try again.');
            }
        });
    }

    // Generate Order Reference
    function generateOrderReference() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `ORD-${timestamp}-${random}`;
    }

    // Show Success Modal
    function showSuccessModal(orderRef, email) {
        document.getElementById('orderRef').textContent = orderRef;
        
        // Use auth email if available, otherwise use form email
        const authEmail = getCookie('email');
        const displayEmail = authEmail || email;
        
        document.getElementById('confirmEmail').textContent = displayEmail;
        
        successModal.classList.add('show');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            closeSuccessModal.click();
        }, 5000);
    }

    // Close Success Modal
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', () => {
            successModal.classList.remove('show');
        });
    }

    // Close modal when clicking overlay
    const successOverlay = document.getElementById('successOverlay');
    if (successOverlay) {
        successOverlay.addEventListener('click', () => {
            successModal.classList.remove('show');
        });
    }

    // Set minimum delivery date to today
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        const today = new Date().toISOString().split('T')[0];
        deliveryDateInput.setAttribute('min', today);
    }

    // Format currency input
    const priceInput = document.getElementById('estimatedPrice');
    if (priceInput) {
        priceInput.addEventListener('blur', function() {
            if (this.value) {
                this.value = parseFloat(this.value).toFixed(2);
            }
        });
    }

    // Prevent preloader from showing
    hidePreloader();
});
