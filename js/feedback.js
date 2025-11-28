// Feedback Page Script - Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all form elements
    const feedbackForm = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    const userRatingInput = document.getElementById('userRating');
    const submitBtn = document.getElementById('submitFeedback');
    const userName = document.getElementById('FeedbackUserName');
    const userEmail = document.getElementById('feedbackEmail');
    const userFeedback = document.getElementById('userFeedback');
    const starRatingContainer = document.querySelector('.star-rating');

    // Set rating function
    function setRating(rating) {
        userRatingInput.value = rating;
        ratingValue.textContent = rating;
        highlightStars(rating);
        validateForm();
    }

    // Highlight stars based on rating
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            const icon = star.querySelector('i');
            if (starRating <= rating) {
                icon.className = 'fas fa-star';
                star.classList.add('active');
            } else {
                icon.className = 'far fa-star';
                star.classList.remove('active');
            }
        });
    }

    // Form validation
    function validateForm() {
        if (!userName || !userEmail || !userFeedback || !submitBtn) {
            return;
        }

        const valUserName = userName.value.trim();
        const valUserEmail = userEmail.value.trim();
        const valUserFeedback = userFeedback.value.trim();
        const userRating = userRatingInput.value;

        const isValid = valUserName && valUserEmail && valUserFeedback && userRating !== '0';
        submitBtn.disabled = !isValid;
    }

    // Use event delegation on the star rating container
    if (starRatingContainer) {
        starRatingContainer.addEventListener('click', function(e) {
            const star = e.target.closest('.star');
            if (star) {
                e.preventDefault();
                e.stopPropagation();
                const rating = parseInt(star.getAttribute('data-rating'));
                setRating(rating);
            }
        }, true); // Use capture phase

        starRatingContainer.addEventListener('mouseover', function(e) {
            const star = e.target.closest('.star');
            if (star) {
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(rating);
            }
        }, true); // Use capture phase

        starRatingContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(userRatingInput.value);
            highlightStars(currentRating);
        }, true); // Use capture phase
    }

    // Input event listeners for form validation
    if (userName) {
        userName.addEventListener('input', function() {
            validateForm();
        });
    }
    
    if (userEmail) {
        userEmail.addEventListener('input', function() {
            validateForm();
        });
    }
    
    if (userFeedback) {
        userFeedback.addEventListener('input', function() {
            validateForm();
        });
    }

    // Form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const valUserName = userName.value.trim();
            const valUserEmail = userEmail.value.trim();
            const valUserFeedback = userFeedback.value.trim();
            const userRating = userRatingInput.value;

            try {
                showPreloader("Submitting feedback...");

                const response = await fetch(`${ASO_URL}/contact-us/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: valUserName,
                        email: valUserEmail,
                        message: valUserFeedback,
                        rating: userRating
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to submit feedback');
                }

                hidePreloader();

                // Show success message
                feedbackForm.style.display = 'none';
                successMessage.style.display = 'block';

                // Scroll to success message
                setTimeout(() => {
                    document.querySelector('.feedback-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);

            } catch (error) {
                hidePreloader();
                showErrorModal(error.message || 'Failed to submit feedback. Please try again.');
            }
        });
    }
});