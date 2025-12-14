const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}

showPreloader("Loading Feedback data");

const applyFiltersBtn = document.getElementById('apply-filters');
const nameInput = document.getElementById('name');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackLoader = document.getElementById('feedback-loader');


// Stats elements
const totalFeedbacksEl = document.getElementById('total-feedbacks');
const avgRatingEl = document.getElementById('avg-rating');
const positiveFeedbacksEl = document.getElementById('positive-feedbacks');
const criticalFeedbacksEl = document.getElementById('critical-feedbacks');
const resolvedFeedbacksEl = document.getElementById('resolved-feedbacks');
const unresolvedFeedbacksEl = document.getElementById('unresolved-feedbacks');

document.addEventListener('DOMContentLoaded', function() {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDateInput.value = formatDate(firstDay);
    endDateInput.value = formatDate(lastDay);

    // Load all feedback data
    loadAllFeedback();

    // Add event listener for filter changes
    applyFiltersBtn.addEventListener('click', function() {
        loadAllFeedback();
    });
});

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Build query parameters from filters
function buildQueryParams() {
    const params = new URLSearchParams();

    if (nameInput.value) {
        params.append('name', nameInput.value);
    }
    
    if (startDateInput.value) {
        params.append('start_date', startDateInput.value);
    }
    
    if (endDateInput.value) {
        params.append('end_date', endDateInput.value);
    }
    
    return params.toString();
}

// Generate star rating HTML
function generateStarRating(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Format date to readable format
function formatReadableDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Calculate stats from feedback data
function calculateStats(feedbacks) {
    const total = feedbacks.length;
    if (total === 0) return { total: 0, avgRating: 0, positive: 0, critical: 0 };
    
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const avgRating = totalRating / total;
    
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    const critical = feedbacks.filter(f => f.rating <= 2).length;

    const resolved = feedbacks.filter(f => f.is_done === true).length;
    const unresolved = feedbacks.filter(f => f.is_done === false).length;

    return {
        total,
        avgRating: avgRating.toFixed(1),
        positive,
        critical,
        resolved,
        unresolved
    };
}

// Load all feedback data
function loadAllFeedback() {
    const queryParams = buildQueryParams();
    feedbackLoader.style.display = 'block'; // Show loader
    feedbackContainer.innerHTML = ''; // Clear existing feedbacks

    fetch(`${ADMIN_URL}/feedbacks/?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(res => {
        // API returns wrapped data (BaseResultWithData)
        const data = res || [];

        
        // Optional: filter by name if user typed something
        const nameValue = nameInput?.value?.trim()?.toLowerCase() || "";
        let filteredData = data;
        if (nameValue) {
            filteredData = data.filter(feedback => 
                feedback.user.toLowerCase().includes(nameValue)
            );
        }

        // Update statistics
        const stats = calculateStats(filteredData);
        totalFeedbacksEl.textContent = stats.total;
        avgRatingEl.textContent = stats.avgRating;
        positiveFeedbacksEl.textContent = stats.positive;
        criticalFeedbacksEl.textContent = stats.critical;
        resolvedFeedbacksEl.textContent = stats.resolved;
        unresolvedFeedbacksEl.textContent = stats.unresolved;

        feedbackLoader.style.display = 'none';

        if (filteredData.length === 0) {
            feedbackContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <h3>No Feedback Found</h3>
                    <p>No customer feedback matches your current filter criteria. Try adjusting your filters.</p>
                </div>
            `;
            return;
        }

        
        // Render feedback cards
        filteredData.forEach(feedback => {
            const isDone = feedback.is_done === true;
            const btnClass = isDone ? 'action-btn done-btn' : 'action-btn reply-btn';
            const btnText = isDone ? '<i class="fas fa-check"></i> Done' : '<i class="fas fa-check"></i> Mark as Done';
            const btnStyle = isDone ? 'background-color: #28a745; color: white;' : '';
            const feedbackCard = document.createElement('div');
            feedbackCard.className = 'feedback-card';
            feedbackCard.innerHTML = `
                <div class="feedback-header">
                    <div class="feedback-user">
                        <div class="user-avatar">${getInitials(feedback.user)}</div>
                        <div class="user-info">
                            <div class="user-name">${feedback.user}</div>
                            <div class="feedback-date">${formatReadableDate(feedback.created_at)}</div>
                        </div>
                    </div>
                    <div class="feedback-rating">
                        <div class="rating-stars">${generateStarRating(feedback.rating)}</div>
                        <div class="rating-value">${feedback.rating}/5</div>
                    </div>
                </div>
                <div class="feedback-content">
                    ${feedback.feedback}
                </div>
                <div class="feedback-actions">
                    <button class="${btnClass}" style="${btnStyle}" data-id="${feedback.id}" data-done="${isDone}">
                        ${btnText}
                    </button>
                </div>
            `;
            feedbackContainer.appendChild(feedbackCard);
        });

        // Add action listeners
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const feedbackId = this.getAttribute('data-id');
                const isDone = this.getAttribute('data-done') === 'true';

                // If already done, do nothing
                if (isDone) return;
                const overlay = document.createElement("div");
                overlay.className = "dialog-overlay";
                overlay.innerHTML = `
                    <div class="dialog-box">
                        <h3>Mark has Resolved</h3>
                        <p>Are you sure you want to mark this feedback as resolved?</p>
                        <div class="dialog-actions">
                            <button class="cancel-btn">Cancel</button>
                            <button class="confirm-btn1">Yes, Mark as Resolved</button>
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
                    showPreloader("Marking as resolved...");
                    fetch(`${ADMIN_URL}/feedbacks/${feedbackId}/mark_done/`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(res => res.json())
                    .then(() => {
                        // Update button instantly
                        this.innerHTML = '<i class="fas fa-check"></i> Done';
                        this.style.backgroundColor = '#28a745';
                        this.style.color = 'white';
                        this.setAttribute('data-done', 'true');
                    })
                    .catch(err => {
                        // Silently fail for marking done
                    })
                    .finally(() => {
                        hidePreloader();
                    });
                });
            });
        });
    })
    .catch(error => {
        feedbackLoader.style.display = 'none';
    })
    .finally(() => {
        hidePreloader();
    });
}
