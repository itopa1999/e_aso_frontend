const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}
showPreloader("Loading your profile");

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch(`${ADMIN_URL}/profile/`, {
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
            renderRecentOrders(data.recent_orders)
            userData = {
                firstName: data.first_name,
                lastName: data.last_name,
                email: data.email,
                phone: data.phone,
                totalOrders: data.total_orders || 0
            };
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
                <div class="order-price">₦${parseFloat(order.total).toLocaleString()}</div>
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
            alert('Please fill in both first name, last name and phone');
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
            const res = await fetch(`${ADMIN_URL}/update/profile/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, phone: phone })
            });

            const result = await res.json();

            console.log(result)

            if (res.ok) {
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
                if (result.error) {
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