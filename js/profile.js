const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}
showPreloader("Loading your profile");

async function checkReferralFeature() {
    try {
        const res = await fetch(`${ASO_URL}/feature-flag/Referral%20System/`, {
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

            console.log("User Data:", userData);
            setUserData();
        } else {
            alert("Unable to fetch profile: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to fetch user profile.");
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
        document.getElementById('firstName').textContent = userData.firstName;
        document.getElementById('lastName').textContent = userData.lastName;
        document.getElementById('phoneNumber').textContent = userData.phone;
        document.getElementById('profileUserName').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('profileUserEmail').textContent = userData.email;
        document.getElementById('total_orders').textContent = userData.totalOrders;
        document.getElementById('emailAddress').textContent = userData.email;
        const firstInitial = userData.firstName?.charAt(0).toUpperCase() || '';
        const lastInitial = userData.lastName?.charAt(0).toUpperCase() || '';
        document.getElementById('profile-pic').textContent = `${firstInitial}${lastInitial}`;

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
    const orderList = document.querySelector('.order-list');
    orderList.innerHTML = '';

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

        orderList.appendChild(orderItem);
    });
}

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

                alert(errorMessage)
            }

        } catch (err) {
            console.error("Update error:", err);
            alert("Something went wrong while updating profile.");
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