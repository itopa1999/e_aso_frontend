// User Agent Analysis Admin Page

const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/auth.html";
}

// DOM CACHE
const UA_DOM = {
    totalDevicesLoader: document.getElementById('total-devices-loader'),
    totalDevicesValue: document.getElementById('total-devices-value'),
    totalUsersLoader: document.getElementById('total-users-loader'),
    totalUsersValue: document.getElementById('total-users-value'),
    uniqueIpsLoader: document.getElementById('unique-ips-loader'),
    uniqueIpsValue: document.getElementById('unique-ips-value'),
    activeDevicesLoader: document.getElementById('active-devices-loader'),
    activeDevicesValue: document.getElementById('active-devices-value'),
    deviceTypeLoader: document.getElementById('device-type-loader'),
    deviceTypeContent: document.getElementById('device-type-content'),
    deviceTypeBody: document.getElementById('device-type-body'),
    browserLoader: document.getElementById('browser-loader'),
    browserContent: document.getElementById('browser-content'),
    browserBody: document.getElementById('browser-body'),
    osLoader: document.getElementById('os-loader'),
    osContent: document.getElementById('os-content'),
    osBody: document.getElementById('os-body'),
    statusChartLoader: document.getElementById('status-chart-loader'),
    statusChart: document.getElementById('status-chart'),
    emailFilter: document.getElementById('email-filter'),
    applyFilterBtn: document.getElementById('apply-filter-btn'),
    clearFilterBtn: document.getElementById('clear-filter-btn'),
    userInfoContainer: document.getElementById('user-info-container'),
    userFullName: document.getElementById('user-full-name'),
    userEmail: document.getElementById('user-email'),
    adminUserName: document.getElementById('adminUserName'),
    logoutUser: document.getElementById('logoutUser'),
    preloader: document.getElementById('preloader')
};

let deviceStatusChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnalysisData();
    setupEventListeners();
});

function setupEventListeners() {
    UA_DOM.applyFilterBtn.addEventListener('click', async () => {
        const email = UA_DOM.emailFilter.value.trim();
        if (email) {
            showPreloader("Loading user analysis...");
            await loadAnalysisData(email);
        } else {
            alert("Please enter an email address");
        }
    });

    UA_DOM.clearFilterBtn.addEventListener('click', async () => {
        UA_DOM.emailFilter.value = '';
        UA_DOM.userInfoContainer.style.display = 'none';
        showPreloader("Loading global analysis...");
        await loadAnalysisData();
    });

    UA_DOM.emailFilter.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            UA_DOM.applyFilterBtn.click();
        }
    });

    // Logout
    UA_DOM.logoutUser.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

async function loadAnalysisData(email = null) {
    try {
        // Build URL
        let url = `${ADMIN_URL}/user-agent-analysis/`;
        if (email) {
            url += `?email=${encodeURIComponent(email)}`;
        }

        showPreloader(email ? "Loading user analysis..." : "Loading analysis...");

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.is_success && data.data) {
            renderAnalysisData(data.data);
            
            // Show user info if available
            if (data.data.user) {
                UA_DOM.userFullName.textContent = `${data.data.user.first_name} ${data.data.user.last_name}`;
                UA_DOM.userEmail.textContent = data.data.user.email;
                UA_DOM.userInfoContainer.style.display = 'block';
            } else {
                UA_DOM.userInfoContainer.style.display = 'none';
            }
        } else {
            showError("Failed to load analysis data");
        }
    } catch (error) {
        console.error('Error loading analysis:', error);
        showError("Unable to load analysis data. Please try again.");
    } finally {
        hidePreloader();
    }
}

function renderAnalysisData(data) {
    // Render Summary
    renderSummary(data.summary);
    
    // Render Breakdown
    if (data.breakdown) {
        renderDeviceTypeBreakdown(data.breakdown.by_device_type || []);
        renderBrowserBreakdown(data.breakdown.by_browser || []);
        renderOsBreakdown(data.breakdown.by_os || []);
        renderStatusChart(data.summary);
    }
}

function renderSummary(summary) {
    // Hide loaders and show values
    hideLoader(UA_DOM.totalDevicesLoader);
    UA_DOM.totalDevicesValue.textContent = summary.total_devices || 0;
    UA_DOM.totalDevicesValue.style.display = 'block';

    hideLoader(UA_DOM.totalUsersLoader);
    UA_DOM.totalUsersValue.textContent = summary.total_users || 0;
    UA_DOM.totalUsersValue.style.display = 'block';

    hideLoader(UA_DOM.uniqueIpsLoader);
    UA_DOM.uniqueIpsValue.textContent = summary.total_unique_ips || 0;
    UA_DOM.uniqueIpsValue.style.display = 'block';

    hideLoader(UA_DOM.activeDevicesLoader);
    UA_DOM.activeDevicesValue.textContent = summary.active_devices || 0;
    UA_DOM.activeDevicesValue.style.display = 'block';
}

function renderDeviceTypeBreakdown(devices) {
    hideLoader(UA_DOM.deviceTypeLoader);
    UA_DOM.deviceTypeBody.innerHTML = '';

    if (devices.length === 0) {
        UA_DOM.deviceTypeBody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
    } else {
        devices.forEach(device => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="device-badge">
                        ${getDeviceIcon(device.type)} ${capitalizeFirst(device.type)}
                    </span>
                </td>
                <td><span class="count-badge">${device.count}</span></td>
            `;
            UA_DOM.deviceTypeBody.appendChild(row);
        });
    }

    UA_DOM.deviceTypeContent.style.display = 'block';
}

function renderBrowserBreakdown(browsers) {
    hideLoader(UA_DOM.browserLoader);
    UA_DOM.browserBody.innerHTML = '';

    if (browsers.length === 0) {
        UA_DOM.browserBody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
    } else {
        browsers.forEach(browser => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="browser-badge">
                        ${getBrowserIcon(browser.browser)} ${browser.browser}
                    </span>
                </td>
                <td><span class="count-badge">${browser.count}</span></td>
            `;
            UA_DOM.browserBody.appendChild(row);
        });
    }

    UA_DOM.browserContent.style.display = 'block';
}

function renderOsBreakdown(oses) {
    hideLoader(UA_DOM.osLoader);
    UA_DOM.osBody.innerHTML = '';

    if (oses.length === 0) {
        UA_DOM.osBody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
    } else {
        oses.forEach(os => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="os-badge">
                        ${getOsIcon(os.os)} ${os.os}
                    </span>
                </td>
                <td><span class="count-badge">${os.count}</span></td>
            `;
            UA_DOM.osBody.appendChild(row);
        });
    }

    UA_DOM.osContent.style.display = 'block';
}

function renderStatusChart(summary) {
    hideLoader(UA_DOM.statusChartLoader);
    UA_DOM.statusChart.style.display = 'block';

    const ctx = document.getElementById('deviceStatusCanvas');
    
    // Destroy existing chart if it exists
    if (deviceStatusChart) {
        deviceStatusChart.destroy();
    }

    const activeDevices = summary.active_devices || 0;
    const inactiveDevices = summary.inactive_devices || 0;

    deviceStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active Devices', 'Inactive Devices'],
            datasets: [{
                data: [activeDevices, inactiveDevices],
                backgroundColor: ['#4ecca3', '#ff9999'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            }
        }
    });
}

// Helper Functions
function getDeviceIcon(type) {
    const icons = {
        'desktop': '🖥️',
        'mobile': '📱',
        'tablet': '📱',
        'laptop': '💻'
    };
    return icons[type.toLowerCase()] || '📱';
}

function getBrowserIcon(browser) {
    const icons = {
        'Chrome': '🌐',
        'Firefox': '🦊',
        'Safari': '🧭',
        'Edge': '⚡',
        'Opera': '🎭',
        'IE': '📶'
    };
    return icons[browser] || '🌐';
}

function getOsIcon(os) {
    const icons = {
        'Windows': '🪟',
        'macOS': '🍎',
        'Linux': '🐧',
        'iOS': '🍎',
        'Android': '🤖',
        'Ubuntu': '🐧'
    };
    return icons[os] || '💾';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function hideLoader(loaderElement) {
    if (loaderElement) {
        loaderElement.style.display = 'none';
    }
}

// Logout function
function logout() {
    deleteCookie('access');
    deleteCookie('refresh');
    deleteCookie('email');
    deleteCookie('name');
    deleteCookie('group');
    window.location.href = '/auth.html';
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Load admin user name on page load
(async () => {
    const adminName = getCookie('name');
    if (adminName) {
        UA_DOM.adminUserName.textContent = adminName;
    }
})();
