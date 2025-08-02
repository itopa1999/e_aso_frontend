const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "auth.html";
}


function loadCartData() {
    showPreloader("Loading your profile");
    
    // Simulate API call to backend
    setTimeout(() => {
        // After data is loaded
        hidePreloader();
        cartContainer.style.display = 'block';
    }, 2500); // 2.5 seconds delay to simulate network request
}

// Initialize cart
loadCartData();

document.addEventListener('DOMContentLoaded', function() {
    // In a real app, this would fetch user data from backend
    const userData = {
        firstName: "Aminat",
        lastName: "Yusuf",
        email: "aminat.yusuf@example.com",
        totalOrders: 15
    };
    
    // Set user data
    document.getElementById('firstName').textContent = userData.firstName;
    document.getElementById('lastName').textContent = userData.lastName;
    document.getElementById('userName').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('userEmail').textContent = userData.email;
    
    // Edit profile button
    document.querySelector('.btn-edit').addEventListener('click', function() {
        alert('Edit profile functionality would open here');
    });
});