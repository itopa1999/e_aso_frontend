
const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}

async function checkReferralFeature() {
    const featureFlagName = "Feedback";
    try {
        const res = await fetch(`${ASO_URL}/feature-flag/${encodeURIComponent(featureFlagName)}/`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        const result = await res.json();

        
        if (result?.data === true) {
            // Feature flag enabled
        } else {
            window.location.href = "404.html";
        }
    } catch (err) {
        showErrorModal("This page is currently unavailable.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkReferralFeature();
    // Get all form elements
    const feedbackForm = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    const userRatingInput = document.getElementById('userRating');
    const submitBtn = document.getElementById('submitFeedback');
    const userName = document.getElementById('FeedbackUserName');
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
        if (!userName || !userFeedback || !submitBtn) {
            return;
        }

        const valUserName = userName.value.trim();
        const valUserFeedback = userFeedback.value.trim();
        const userRating = userRatingInput.value;

        const isValid = valUserName && valUserFeedback && userRating !== '0';
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
            const valUserFeedback = userFeedback.value.trim();
            const userRating = userRatingInput.value;

            try {
                showPreloader("Submitting feedback...");

                const response = await fetch(`${ADMIN_URL}/create/feedback/`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        user: valUserName,
                        feedback: valUserFeedback,
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

    hidePreloader();
});