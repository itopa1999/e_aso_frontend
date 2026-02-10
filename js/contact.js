// Contact page specific functionality
const accessToken = getCookie("access");

showPreloader("Loading page....");

document.addEventListener('DOMContentLoaded', function() {
    hidePreloader();
    
    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const full_name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            // Validate inputs
            if (!full_name || !email || !subject || !message || !phone) {
                const overlay = document.createElement("div");
                overlay.className = "dialog-overlay";
                overlay.innerHTML = `
                    <div class="dialog-box">
                        <p>Please fill in all fields</p>
                        <div class="dialog-actions">
                            <button class="cancel-btn">Cancel</button>
                            <button class="confirm-btn1">Okay</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                // Handle actions
                overlay.querySelector(".cancel-btn").addEventListener("click", () => {
                    overlay.remove();
                });

                overlay.querySelector(".confirm-btn1").addEventListener("click", () => {
                    overlay.remove();
                });

                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            const payload = {
                full_name,
                email,
                subject,
                message,
                phone
            };

            try {
                const response = await fetch(`${AUTH_URL}/contact/submit/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok && result.is_success) {
                    // Success Modal
                    const overlay = document.createElement("div");
                    overlay.className = "dialog-overlay";
                    overlay.innerHTML = `
                        <div class="dialog-box">
                            <p>Thank you! Your message has been submitted successfully.</p>
                            <p>We will contact you soon.</p>
                            <div class="dialog-actions">
                                <button class="confirm-btn1">Okay</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);

                    overlay.querySelector(".confirm-btn1").addEventListener("click", () => overlay.remove());

                    // Reset form
                    contactForm.reset();
                } else {
                    // Error Modal
                    const overlay = document.createElement("div");
                    overlay.className = "dialog-overlay";
                    overlay.innerHTML = `
                        <div class="dialog-box">
                            <p>Something went wrong: ${result.message || 'Unable to submit form'}</p>
                            <div class="dialog-actions">
                                <button class="confirm-btn1">Okay</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);

                    overlay.querySelector(".confirm-btn1").addEventListener("click", () => overlay.remove());
                }

            } catch (error) {
                // Network / Server Error
                const overlay = document.createElement("div");
                overlay.className = "dialog-overlay";
                overlay.innerHTML = `
                    <div class="dialog-box">
                        <p>Network error. Please try again later.</p>
                        <div class="dialog-actions">
                            <button class="confirm-btn1">Okay</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                overlay.querySelector(".confirm-btn1").addEventListener("click", () => overlay.remove());
            }

            // Restore button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });

    // Initialize Tawk chat
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    (function() {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/6502cdf70f2b18434fd87797/1ha9f95o4';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
    })();
});
