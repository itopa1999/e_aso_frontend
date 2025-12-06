/**
 * Tour Guide - Interactive onboarding for new users
 * Shows a guided tour on first visit with helpful tooltips
 */

class TourGuide {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.isActive = false;
        this.tourStarted = false;
        this.storageKey = 'esthers-fabrics-tour-completed';
        this.initTour();
    }

    initTour() {
        // Check if user has already completed the tour
        if (localStorage.getItem(this.storageKey)) {
            return;
        }

        // Create tour steps based on page
        this.createPageSteps();
        
        // Show welcome popup on first visit
        this.showWelcomePopup();
    }

    createPageSteps() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (currentPage === 'index.html' || currentPage === '') {
            this.steps = [
                {
                    title: 'Welcome to Esther\'s Fabrics! 👋',
                    description: 'Let us show you around and help you get started with shopping for premium Nigerian fabrics.',
                    element: '.logo',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Hero Banner',
                    description: 'Check out our featured products and special offers displayed in this carousel. Use the arrows to browse different collections.',
                    element: '.hero-carousel',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Browse & Filter',
                    description: 'Explore our product categories. Use the arrows to scroll through different categories and find what you\'re looking for.',
                    element: '.filter-wrapper',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Product Collection',
                    description: 'Browse our amazing collection of premium fabrics. Hover over any product to see more details and options.',
                    element: '.product-grid',
                    position: 'top',
                    action: 'click_next'
                },
                {
                    title: 'Header Icons - User Account 👤',
                    description: 'Click here to login, register, or access your profile. Manage your account and personal information.',
                    element: '#user-icon',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Header Icons - Filter 🔍',
                    description: 'Use this button to filter products by price, category, or other criteria to find exactly what you need.',
                    element: '#filter-button',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Shopping Cart 🛒',
                    description: 'Your shopping cart is always here! Click to view items, manage quantities, and proceed to checkout. The number shows how many items are in your cart.',
                    element: '.header-icons .icon:nth-child(3)',
                    position: 'bottom',
                    action: 'click_next'
                },
                {
                    title: 'Bottom Navigation 📱',
                    description: 'Use this bottom navigation to quickly access Home, Search, Wishlist (with item count), and your Orders. Always available at the bottom of your screen.',
                    element: '.bottom-navbar',
                    position: 'top',
                    action: 'click_finish'
                }
            ];
        } else if (currentPage === 'cart.html') {
            this.steps = [
                {
                    title: 'Your Shopping Cart',
                    description: 'Here\'s everything in your cart. Review items, update quantities, or remove them.',
                    element: '.cart-items',
                    position: 'top',
                    action: 'click_next'
                },
                {
                    title: 'Order Summary',
                    description: 'Your total price is calculated here, including any discounts or taxes.',
                    element: '.order-summary',
                    position: 'left',
                    action: 'click_next'
                },
                {
                    title: 'Proceed to Checkout',
                    description: 'Click here to enter your shipping and payment information.',
                    element: '.btn-checkout',
                    position: 'top',
                    action: 'click_finish'
                }
            ];
        } else if (currentPage === 'product-info.html') {
            this.steps = [
                {
                    title: 'Product Gallery',
                    description: 'View the main product image. Click thumbnails below to see different angles.',
                    element: '.main-image',
                    position: 'right',
                    action: 'click_next'
                },
                {
                    title: 'Product Details',
                    description: 'Check the price, rating, description, and available options (size, color).',
                    element: '.product-info',
                    position: 'left',
                    action: 'click_next'
                },
                {
                    title: 'Add to Cart',
                    description: 'Select your preferred options and quantity, then add the item to your cart.',
                    element: '.action-buttons',
                    position: 'top',
                    action: 'click_next'
                },
                {
                    title: 'Customer Reviews',
                    description: 'Read reviews from other customers to help you decide.',
                    element: '.details-tabs',
                    position: 'top',
                    action: 'click_finish'
                }
            ];
        } else if (currentPage === 'auth.html') {
            this.steps = [
                {
                    title: 'Create Your Account',
                    description: 'Sign up to enjoy personalized shopping, saved wishlists, and order tracking.',
                    element: '.auth-form',
                    position: 'top',
                    action: 'click_finish'
                }
            ];
        } else if (currentPage === 'profile.html') {
            this.steps = [
                {
                    title: 'Your Profile',
                    description: 'Manage your personal information and preferences here.',
                    element: '.profile-section',
                    position: 'top',
                    action: 'click_next'
                },
                {
                    title: 'Order History',
                    description: 'View all your past orders and their current status.',
                    element: '.orders-section',
                    position: 'top',
                    action: 'click_finish'
                }
            ];
        }
    }

    showWelcomePopup() {
        const modal = document.createElement('div');
        modal.className = 'tour-welcome-modal';
        modal.innerHTML = `
            <div class="tour-welcome-content">
                <div class="tour-welcome-icon">🎉</div>
                <h2>Welcome to Esther\'s Fabrics!</h2>
                <p>We'd love to show you around and help you get the most out of our platform.</p>
                <div class="tour-welcome-actions">
                    <button class="tour-btn tour-btn-primary" id="start-tour-btn">
                        <i class="fas fa-play"></i> Start Tour
                    </button>
                    <button class="tour-btn tour-btn-secondary" id="skip-tour-btn">
                        Skip for Now
                    </button>
                </div>
                <small>You can always restart the tour from the help menu</small>
            </div>
        `;
        
        document.body.appendChild(modal);

        document.getElementById('start-tour-btn').addEventListener('click', () => {
            modal.remove();
            this.startTour();
        });

        document.getElementById('skip-tour-btn').addEventListener('click', () => {
            modal.remove();
            // Don't mark as completed, user can still start tour later
        });
    }

    startTour() {
        if (this.steps.length === 0) return;
        
        this.tourStarted = true;
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.id = 'tour-overlay';
        document.body.appendChild(overlay);
    }

    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.completeTour();
            return;
        }

        const step = this.steps[stepIndex];
        const element = document.querySelector(step.element);

        if (!element) {
            // Skip to next step if element not found
            this.currentStep++;
            this.showStep(this.currentStep);
            return;
        }

        // Scroll element into view with better positioning
        setTimeout(() => {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center'
            });
        }, 100);

        // Create and show tooltip
        this.createTooltip(step, element, stepIndex);
    }

    createTooltip(step, element, stepIndex) {
        // Remove previous tooltip
        const existingTooltip = document.querySelector('.tour-tooltip');
        if (existingTooltip) existingTooltip.remove();

        const rect = element.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.innerHTML = `
            <div class="tour-tooltip-content">
                <div class="tour-tooltip-header">
                    <h3>${step.title}</h3>
                    <button class="tour-close-btn" id="tour-close">×</button>
                </div>
                <p>${step.description}</p>
                <div class="tour-progress">
                    <div class="tour-progress-bar" style="width: ${((stepIndex + 1) / this.steps.length) * 100}%"></div>
                </div>
                <div class="tour-tooltip-footer">
                    <span class="tour-step-counter">${stepIndex + 1} of ${this.steps.length}</span>
                    <div class="tour-actions">
                        ${stepIndex > 0 ? '<button class="tour-btn tour-btn-small" id="tour-prev"><i class="fas fa-chevron-left"></i> Back</button>' : ''}
                        <button class="tour-btn tour-btn-primary tour-btn-small" id="tour-next">
                            ${stepIndex === this.steps.length - 1 ? 'Finish' : 'Next'} <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        this.positionTooltip(tooltip, rect, step.position);

        // Highlight element
        this.highlightElement(element);

        // Event listeners
        document.getElementById('tour-next').addEventListener('click', () => {
            this.currentStep++;
            this.showStep(this.currentStep);
        });

        if (document.getElementById('tour-prev')) {
            document.getElementById('tour-prev').addEventListener('click', () => {
                this.currentStep--;
                this.showStep(this.currentStep);
            });
        }

        document.getElementById('tour-close').addEventListener('click', () => {
            this.endTour();
        });

        // Allow escape key to exit tour (bind to this for proper context)
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.endTour();
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    positionTooltip(tooltip, rect, position) {
        const padding = 20;
        const offset = 15;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let top = 0, left = 0;

            switch (position) {
                case 'bottom':
                    top = rect.bottom + offset;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    // If bottom is too close to viewport edge, position above
                    if (top + tooltipRect.height > viewportHeight - padding) {
                        top = rect.top - tooltipRect.height - offset;
                    }
                    break;
                case 'top':
                    top = rect.top - tooltipRect.height - offset;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    // If top is too close to viewport edge, position below
                    if (top < padding) {
                        top = rect.bottom + offset;
                    }
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.left - tooltipRect.width - offset;
                    // If left is too close to edge, position right
                    if (left < padding) {
                        left = rect.right + offset;
                    }
                    break;
                case 'right':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.right + offset;
                    // If right is too close to edge, position left
                    if (left + tooltipRect.width > viewportWidth - padding) {
                        left = rect.left - tooltipRect.width - offset;
                    }
                    break;
            }

            // Keep tooltip in viewport (horizontal)
            if (left < padding) left = padding;
            if (left + tooltipRect.width > viewportWidth - padding) {
                left = viewportWidth - tooltipRect.width - padding;
            }

            // Keep tooltip in viewport (vertical)
            if (top < padding) top = padding;
            if (top + tooltipRect.height > viewportHeight - padding) {
                top = viewportHeight - tooltipRect.height - padding;
            }

            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
        }, 150);
    }

    highlightElement(element) {
        // Remove previous highlight
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        element.classList.add('tour-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    completeTour() {
        localStorage.setItem(this.storageKey, 'true');
        
        const modal = document.createElement('div');
        modal.className = 'tour-complete-modal';
        modal.innerHTML = `
            <div class="tour-complete-content">
                <div class="tour-complete-icon">🎊</div>
                <h2>Tour Complete!</h2>
                <p>You're all set! Start exploring and enjoy your shopping experience.</p>
                <button class="tour-btn tour-btn-primary" id="close-complete">
                    <i class="fas fa-check"></i> Let's Go!
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('close-complete').addEventListener('click', () => {
            this.endTour();
        });
    }

    endTour() {
        this.isActive = false;
        this.tourStarted = false;

        // Remove overlay
        const overlay = document.getElementById('tour-overlay');
        if (overlay) overlay.remove();

        // Remove tooltip
        const tooltip = document.querySelector('.tour-tooltip');
        if (tooltip) tooltip.remove();

        // Remove modal
        const modal = document.querySelector('.tour-complete-modal');
        if (modal) modal.remove();

        // Remove highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Clean up event listeners
        const escapeHandler = (e) => {
            if (e.key === 'Escape') this.endTour();
        };
        document.removeEventListener('keydown', escapeHandler);
    }

    restartTour() {
        localStorage.removeItem(this.storageKey);
        this.currentStep = 0;
        this.endTour();
        setTimeout(() => {
            this.createPageSteps();
            this.startTour();
        }, 300);
    }
}

// Initialize tour on page load
document.addEventListener('DOMContentLoaded', () => {
    window.tourGuide = new TourGuide();

    // Add help button to show tour restart option
    const helpButton = document.createElement('button');
    helpButton.className = 'tour-help-btn';
    helpButton.title = 'Help & Tour';
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpButton.addEventListener('click', () => {
        showHelpMenu();
    });
    document.body.appendChild(helpButton);
});

function showHelpMenu() {
    const menu = document.createElement('div');
    menu.className = 'tour-help-menu';
    menu.innerHTML = `
        <button id="restart-tour" class="tour-help-item">
            <i class="fas fa-redo"></i> Restart Tour
        </button>
        <button id="contact-support" class="tour-help-item">
            <i class="fas fa-headset"></i> Contact Support
        </button>
        <button id="close-help" class="tour-help-item tour-help-close">
            <i class="fas fa-times"></i> Close
        </button>
    `;
    
    document.body.appendChild(menu);

    document.getElementById('restart-tour').addEventListener('click', () => {
        menu.remove();
        window.tourGuide.restartTour();
    });

    document.getElementById('contact-support').addEventListener('click', () => {
        window.location.href = '/contact.html';
    });

    document.getElementById('close-help').addEventListener('click', () => {
        menu.remove();
    });

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tour-help-btn') && !e.target.closest('.tour-help-menu')) {
                menu.remove();
            }
        }, { once: true });
    }, 100);
}
