const accessToken = getCookie("access");
if (!accessToken) {
    window.location.href = "/404.html";
}
showPreloader("Loading Feedback data");

let currentPage = 1;
let totalPages = 1;
let currentSearchTerm = '';
let currentStartDate = '';
let currentEndDate = '';

// DOM elements
const searchInput = document.getElementById('search-input');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const searchButton = document.getElementById('search-button');
const transactionsLoader = document.getElementById('transactions-loader');
const transactionsTable = document.getElementById('transactions-table');
const transactionsBody = document.getElementById('transactions-body');
const paginationContainer = document.getElementById('pagination-container');
const paginationInfo = document.getElementById('pagination-info');
const currentPageEl = document.getElementById('current-page');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const emptyState = document.getElementById('empty-state');


// Stats elements
        const totalTransactionsEl = document.getElementById('total-transactions');
        const totalAmountEl = document.getElementById('total-amount');
        const successfulTransactionsEl = document.getElementById('successful-transactions');
        const averageTransactionEl = document.getElementById('average-transaction');

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set default dates (current month)
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            startDateInput.value = formatDate(firstDay);
            endDateInput.value = formatDate(lastDay);
            
            loadTransactions();

            // Add event listeners
            searchButton.addEventListener('click', function() {
                currentPage = 1;
                loadTransactions();
            });

            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    currentPage = 1;
                    loadTransactions();
                }
            });
            
            // Date change listeners
            startDateInput.addEventListener('change', function() {
                currentPage = 1;
                loadTransactions();
            });
            
            endDateInput.addEventListener('change', function() {
                currentPage = 1;
                loadTransactions();
            });

            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    loadTransactions();
                }
            });
            
            nextPageBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadTransactions();
                }
            });
        });

        // Format date as YYYY-MM-DD
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Load transactions from API
        function loadTransactions() {
            // Show loader
            transactionsLoader.style.display = 'flex';
            transactionsTable.style.display = 'none';
            paginationContainer.style.display = 'none';
            emptyState.style.display = 'none';
            
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage);
            
            if (searchInput.value.trim()) {
                params.append('search', searchInput.value.trim());
                currentSearchTerm = searchInput.value.trim();
            } else {
                currentSearchTerm = '';
            }
            
            if (startDateInput.value) {
                params.append('start_date', startDateInput.value);
                currentStartDate = startDateInput.value;
            } else {
                currentStartDate = '';
            }
            
            if (endDateInput.value) {
                params.append('end_date', endDateInput.value);
                currentEndDate = endDateInput.value;
            } else {
                currentEndDate = '';
            }

            fetch(`${ADMIN_URL}/transactions/?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    processTransactionsResponse(data);
                })
                .catch(error => {
                    console.error('Error loading transactions:', error);
                    transactionsLoader.style.display = 'none';
                    emptyState.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Error Loading Transactions</h3>
                        <p>There was a problem loading the transactions. Please try again.</p>
                    `;
                    emptyState.style.display = 'block';
                });

        }
        
        // Process the transactions response
        function processTransactionsResponse(response) {
            // Hide loader
            transactionsLoader.style.display = 'none';
            
            // Extract transactions data
            const transactions = response.results.data;
            const totalCount = response.count;
            
            // Update stats
            updateStats(transactions);
            
            // Check if we have transactions
            if (transactions.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            // Render transactions table
            renderTransactionsTable(transactions);
            
            // Update pagination
            updatePagination(totalCount);
        }
        
        // Update statistics
        function updateStats(transactions) {
            const total = transactions.length;
            const totalAmount = transactions.reduce((sum, transaction) => 
                sum + parseFloat(transaction.amount), 0);
            const successful = transactions.filter(t => t.status === 'Success').length;
            const average = total > 0 ? totalAmount / total : 0;
            
            totalTransactionsEl.textContent = total;
            totalAmountEl.textContent = `₦${totalAmount.toLocaleString()}`;
            successfulTransactionsEl.textContent = successful;
            averageTransactionEl.textContent = `₦${average.toFixed(2)}`;
        }
        
        // Render transactions table
        function renderTransactionsTable(transactions) {
            transactionsBody.innerHTML = '';
            
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
                
                // Format date
                const transactionDate = new Date(transaction.created_at);
                const formattedDate = transactionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Determine status badge class
                let statusClass = 'status-pending';
                if (transaction.status === 'Success') {
                    statusClass = 'status-success';
                } else if (transaction.status === 'Failed') {
                    statusClass = 'status-failed';
                }
                
                row.innerHTML = `
                    <td>${transaction.id}</td>
                    <td class="transaction-amount">₦${parseFloat(transaction.amount).toLocaleString()}</td>
                    <td class="transaction-type">${transaction.transaction_type}</td>
                    <td class="transaction-reference">${transaction.reference}</td>
                    <td>${transaction.channel}</td>
                    <td><span class="status-badge ${statusClass}">${transaction.status}</span></td>
                    <td>${transaction.order_id}</td>
                    <td class="transaction-date">${formattedDate}</td>
                `;
                
                transactionsBody.appendChild(row);
            });
            
            transactionsTable.style.display = 'table';
        }
        
        // Update pagination controls
        function updatePagination(totalCount) {
            const itemsPerPage = 21; // ✅ Set how many transactions per page you want
            if (totalCount > 0) {
                totalPages = Math.ceil(totalCount / itemsPerPage);

                // Update pagination info
                const startItem = (currentPage - 1) * itemsPerPage + 1;
                const endItem = Math.min(currentPage * itemsPerPage, totalCount);
                paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalCount} transactions`;

                // Update current page
                currentPageEl.textContent = currentPage;

                // Update button states
                prevPageBtn.disabled = currentPage === 1;
                nextPageBtn.disabled = currentPage === totalPages;

                // Show pagination
                paginationContainer.style.display = 'flex';
            } else {
                paginationContainer.style.display = 'none';
            }
        }
        
        // Simulate preloader
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.getElementById('preloader').style.display = 'none';
            }, 1500);
        });

hidePreloader();