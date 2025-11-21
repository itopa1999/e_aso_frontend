const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}
showPreloader("Loading your profile");

// DOM CACHE
const PROFILE_DOM = {
    firstName: null,
    lastName: null,
    phoneNumber: null,
    profileUserName: null,
    profileUserEmail: null,
    totalOrders: null,
    emailAddress: null,
    profilePic: null,
    editModal: null,
    orderList: null,
    transactionsList: null
};

function cacheProfileDOM() {
    PROFILE_DOM.firstName = document.getElementById('firstName');
    PROFILE_DOM.lastName = document.getElementById('lastName');
    PROFILE_DOM.phoneNumber = document.getElementById('phoneNumber');
    PROFILE_DOM.profileUserName = document.getElementById('profileUserName');
    PROFILE_DOM.profileUserEmail = document.getElementById('profileUserEmail');
    PROFILE_DOM.totalOrders = document.getElementById('total_orders');
    PROFILE_DOM.emailAddress = document.getElementById('emailAddress');
    PROFILE_DOM.profilePic = document.getElementById('profile-pic');
    PROFILE_DOM.editModal = document.getElementById('editModal');
    PROFILE_DOM.orderList = document.querySelector('.order-list');
    PROFILE_DOM.transactionsList = document.querySelector('.transactions-list');
}

async function checkReferralFeature() {
    const featureFlagName = "Referral System";
    try {
        const res = await fetch(`${ASO_URL}/feature-flag/${encodeURIComponent(featureFlagName)}/`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        const result = await res.json();

        const referralSection = document.querySelector(".referral-section");

        if (result?.data === true) {
            referralSection.style.display = "block";
        } else {
            referralSection.style.display = "none";
        }
    } catch (err) {
        console.error("Feature flag check failed:", err);
        document.querySelector(".referral-section").style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    cacheProfileDOM();
    await checkReferralFeature();
    try {
        const response = await fetch(`${AUTH_URL}/profile/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 404) {
            window.location.href = "404.html";
            return;
        }

        if (response.status === 401) {
            window.location.href = "auth.html";
            return;
        }

        const data = await response.json();
        
        renderTransactionsTable(data.data.transactions);

        if (response.ok) {
            renderRecentOrders(data.data.recent_orders)
            userData = {
                firstName: data.data.first_name,
                lastName: data.data.last_name,
                email: data.data.email,
                phone: data.data.phone,
                totalOrders: data.data.total_orders || 0,
                referralsSuccessful: data.data.total_successful_referrals || 0,
                isQualified: data.data.is_referral_qualified || false,
                referrerCode: data.data.referral_code || ''
            };

            setUserData();
        } else {
            showErrorModal(data.error || "Unable to fetch profile: Unknown error");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        showErrorModal(error.message || "Failed to fetch user profile.");
    } finally {
        hidePreloader();
    }

    // DOM Elements
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const profileForm = document.getElementById('profileForm');

    // Set user data on page load
    function setUserData() {
        if (PROFILE_DOM.firstName) PROFILE_DOM.firstName.textContent = userData.firstName;
        if (PROFILE_DOM.lastName) PROFILE_DOM.lastName.textContent = userData.lastName;
        if (PROFILE_DOM.phoneNumber) PROFILE_DOM.phoneNumber.textContent = userData.phone;
        if (PROFILE_DOM.profileUserName) PROFILE_DOM.profileUserName.textContent = `${userData.firstName} ${userData.lastName}`;
        if (PROFILE_DOM.profileUserEmail) PROFILE_DOM.profileUserEmail.textContent = userData.email;
        if (PROFILE_DOM.totalOrders) PROFILE_DOM.totalOrders.textContent = userData.totalOrders;
        if (PROFILE_DOM.emailAddress) PROFILE_DOM.emailAddress.textContent = userData.email;
        const firstInitial = userData.firstName?.charAt(0).toUpperCase() || '';
        const lastInitial = userData.lastName?.charAt(0).toUpperCase() || '';
        if (PROFILE_DOM.profilePic) PROFILE_DOM.profilePic.textContent = `${firstInitial}${lastInitial}`;

        const totalNeeded = 5;
        const current = Math.min(userData.referralsSuccessful, totalNeeded);
        const percent = Math.round((current / totalNeeded) * 100);

        const circle = document.querySelector('.circle');
        const text = document.getElementById('referralPercent');
        const count = document.getElementById('referralCount');
        const status = document.getElementById('referralStatus');

        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        text.textContent = `${percent}%`;
        count.textContent = current;
        status.textContent = userData.isQualified ? "✅ Qualified" : "🚀 Keep Referring";
        status.style.color = userData.isQualified ? "green" : "orange";

        const referralCodeElem = document.getElementById("referralCode");
        const copyBtn = document.getElementById("copyReferralCode");

        const referralCode = userData.referrerCode || "N/A";
        referralCodeElem.textContent = referralCode;

        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(referralCode);
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
        });
    }

    setUserData();

    function renderRecentOrders(recentOrders) {
        if (!PROFILE_DOM.orderList) return;
        PROFILE_DOM.orderList.innerHTML = '';

        const fragment = document.createDocumentFragment();

        recentOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        orderItem.innerHTML = `
            <div class="order-info">
                <a href="ordered-details.html?id=${order.id}" class="order-image">AO-${order.id}</a>
                <div class="order-details">
                    <div class="order-id">${order.order_number}</div>
                    <div class="order-date">Created: ${formatDateToHuman(order.created_at)}</div>
                </div>
            </div>
            <div class="order-right">
                <div class="order-status status-delivered">${order.latest_tracking_status}</div>
                <div class="order-price">₦${formatNumber(order.total)}</div>
            </div>
        `;

            fragment.appendChild(orderItem);
        });
        
        PROFILE_DOM.orderList.appendChild(fragment);
    }

    function renderTransactionsTable(transactions) {
        if (!PROFILE_DOM.transactionsList) return;
        PROFILE_DOM.transactionsList.innerHTML = '';

        if (transactions && transactions.length > 0) {
            PROFILE_DOM.transactionsList.innerHTML = transactions
            .map(tx => `
            <div class="transaction-card">
                <div class="transaction-info">
                <p><strong>Type:</strong> ${tx.transaction_type}</p>
                <p><strong>Amount:</strong> ₦${Number(tx.amount).toLocaleString()}</p>
                <p><strong>Order ID:</strong> ${tx.order_id}</p>
                <p><strong>Status:</strong> <span class="status ${tx.status.toLowerCase()}">${tx.status}</span></p>
                </div>
                <div class="transaction-meta">
                <p><strong>Channel:</strong> ${tx.channel}</p> 
                <p><strong>Reference:</strong> ${tx.reference}</p>
                <p><strong>Date:</strong> ${new Date(tx.created_at).toLocaleString()}</p>
                </div>
            </div>
            `)
            .join("");
        } else {
            PROFILE_DOM.transactionsList.innerHTML = "<p>No transactions found.</p>";
        }
    }

    // document.getElementById("filterBtn").addEventListener("click", () => {
    //     const fromDate = document.getElementById("fromDate").value;
    //     const toDate = document.getElementById("toDate").value;

    //     if (!fromDate || !toDate) {
    //         showErrorModal("Please select both start and end dates.");
    //         return;
    //     }

    //     fetchTransactions(fromDate, toDate);
    // });

    // Show modal
    editProfileBtn.addEventListener('click', function() {
        // Set current values in form
        document.getElementById('editFirstName').value = userData.firstName;
        document.getElementById('editLastName').value = userData.lastName;
        document.getElementById('editPhoneNumber').value = userData.phone;
        
        editModal.classList.add('active');
    });

    // Close modal
    function closeEditModal() {
        editModal.classList.remove('active');
    }

    closeModal.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);

    // Form submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('editFirstName').value.trim();
        const lastName = document.getElementById('editLastName').value.trim();
        const phone = document.getElementById('editPhoneNumber').value.trim();
        
        // Validate inputs
        if (!firstName || !lastName || !phone) {
            const overlay = document.createElement("div");
            overlay.className = "dialog-overlay";
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>Please fill in both first name, last name and phone</p>
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
        
        // Simulate sending to backend
        const loadingIndicator = document.createElement('div');
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving changes...';
        loadingIndicator.style.textAlign = 'center';
        loadingIndicator.style.marginTop = '20px';
        loadingIndicator.style.color = 'var(--primary-color)';
        profileForm.appendChild(loadingIndicator);

        try {
            const res = await fetch(`${AUTH_URL}/update/profile/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, phone: phone })
            });

            const result = await res.json();


            if (result.is_success) {
                showNotification(
                    'success',
                    'Profile Update',
                    'Successfully changed'
                );
                userData.firstName = firstName;
                userData.lastName = lastName;
                userData.phone = phone;
                setUserData();
                closeEditModal();
            } else {
                let errorMessage = "Update failed: ";
                if (result.message) {
                    if (typeof result.error === "string") {
                        errorMessage += result.error;
                    } else {

                        errorMessage += Object.values(result.error)
                            .flat()
                            .join(", ");
                    }
                } else {
                    errorMessage += "Unknown error";
                }

                showErrorModal(errorMessage);
            }

        } catch (err) {
            console.error("Update error:", err);
            showErrorModal(err.message || "Something went wrong while updating profile.");
        } finally {
            loadingIndicator.remove();
        }
    });

    // Close modal when clicking outside
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
});