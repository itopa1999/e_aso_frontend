const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}

showPreloader("Loading Contact Forms data");

let contactForms = [];

// Fetch contact forms
async function fetchContactForms() {
    try {
        showPreloader("Searching for Contact Forms...");

        const response = await fetch(`${ADMIN_URL}/contact-form-submissions/`, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.status === 401 || response.status === 404) {
            window.location.href = "/auth.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        contactForms = data.data || [];
        console.log("Fetched contact forms:", contactForms);

        // Render AFTER fetching
        renderContactForms(contactForms);

    } catch (error) {
        console.error("Error fetching contact forms:", error);
    } finally {
        hidePreloader();
    }
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// Render contact forms
function renderContactForms(forms) {
    const container = document.getElementById('contact-forms-list');
    const emptyState = document.getElementById('empty-state');

    if (!Array.isArray(forms) || forms.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    container.innerHTML = forms.map(form => `
        <div class="contact-card" data-id="${form.id}">
            <div class="contact-header">
                <div class="contact-name">${form.full_name}</div>
                <div class="contact-date">${formatDate(form.created_at)}</div>
            </div>

            <div class="contact-details">
                <div class="contact-field">
                    <span class="contact-label">Email</span>
                    <span class="contact-value">${form.email}</span>
                </div>
                <div class="contact-field">
                    <span class="contact-label">Phone</span>
                    <span class="contact-value">${form.phone}</span>
                </div>
                <div class="contact-field">
                    <span class="contact-label">Subject</span>
                    <span class="contact-value">${form.subject}</span>
                </div>
                <div class="contact-field">
                    <span class="contact-label">Status</span>
                    <span class="contact-value">
                        <span class="status-badge status-${form.status}">
                            ${form.status === "new" ? "New" : "Replied"}
                        </span>
                    </span>
                </div>
            </div>

            <div class="contact-message">
                <div class="contact-label">Message</div>
                <div class="contact-value">${form.message}</div>
            </div>

            <div class="contact-actions">
                <button class="btn-action btn-reply" onclick="replyToContact(${form.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                <button class="btn-action btn-delete" onclick="deleteContact(${form.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}


// Reply action
function replyToContact(id) {
    showErrorModal(`Reply to contact form with ID: ${id}`);
}


// Delete action (frontend only)
function deleteContact(id) {
    if (confirm("Are you sure you want to delete this contact form submission?")) {
        contactForms = contactForms.filter(form => form.id !== id);
        renderContactForms(contactForms);
        showErrorModal(`Contact form with ID ${id} has been deleted.`);
    }
}


// Filtering
function filterContactForms() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    let filtered = [...contactForms];

    if (searchTerm) {
        filtered = filtered.filter(form =>
            form.full_name.toLowerCase().includes(searchTerm) ||
            form.email.toLowerCase().includes(searchTerm) ||
            form.subject.toLowerCase().includes(searchTerm)
        );
    }

    if (startDate) {
        filtered = filtered.filter(form =>
            new Date(form.created_at) >= new Date(startDate)
        );
    }

    if (endDate) {
        filtered = filtered.filter(form =>
            new Date(form.created_at) <= new Date(endDate + "T23:59:59")
        );
    }

    renderContactForms(filtered);
}


// Initialize Page
document.addEventListener("DOMContentLoaded", function () {

    // Fetch and display
    fetchContactForms();

    // Add filter listeners
    document.getElementById("search-button").addEventListener("click", filterContactForms);
    document.getElementById("search-input").addEventListener("input", filterContactForms);
    document.getElementById("start-date").addEventListener("change", filterContactForms);
    document.getElementById("end-date").addEventListener("change", filterContactForms);

    // Default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    document.getElementById("start-date").valueAsDate = start;
    document.getElementById("end-date").valueAsDate = end;
});
