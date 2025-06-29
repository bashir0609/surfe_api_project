// dashboard.js - Dynamic dashboard functionality

// Function to create the dashboard page content
function createDashboardPage() {
    return `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p class="text-gray-600">Overview of your Surfe API usage and activities</p>
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            onclick="refreshDashboard()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center">
                            🔄 Refresh
                        </button>
                        <button 
                            onclick="resetStats()" 
                            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 flex items-center">
                            🗑️ Reset Stats
                        </button>
                    </div>
                </div>
                <div id="last-updated" class="text-sm text-gray-500 mt-2"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Company Searches</h3>
                            <p id="company-searches" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">People Searches</h3>
                            <p id="people-searches" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Company Enrichments</h3>
                            <p id="company-enrichments" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">People Enrichments</h3>
                            <p id="people-enrichments" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Success Rate</h3>
                            <p id="success-rate" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2zm0 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2v-7m-4 5v-3m0 0H9m0 0H7m0 0V9m0 0V5a2 2 0 012-2h2a2 2 0 012 2v5"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">API Key in Use</h3>
                            <p id="active-api-key" class="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
            </div> 
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex items-center mb-4">
                    <span class="text-xl mr-2">🔍</span>
                    <h2 class="text-xl font-semibold text-gray-900">Quick Company Search</h2>
                </div>
                <div class="flex space-x-4">
                    <input 
                        type="text" 
                        id="quick-search-input"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Enter domain (e.g., surfe.com)"
                        onkeypress="handleQuickSearchEnter(event)">
                    <button 
                        onclick="performQuickSearch()" 
                        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                        Search Company
                    </button>
                </div>
                <div id="quick-search-results" class="mt-4 hidden"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-lg shadow-md">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div id="recent-activity" class="p-6">
                        <div class="text-center text-gray-500">Loading activity...</div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-xl font-semibold text-gray-900">🛠️ API Tools</h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-1 gap-4">
                            <a href="/pages/company_search" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="text-2xl mr-3">🔍</span>
                                <div>
                                    <h3 class="font-medium text-gray-900">Company Search</h3>
                                    <p class="text-sm text-gray-500">Find companies by criteria</p>
                                </div>
                            </a>
                            
                            <a href="/pages/people_search" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="text-2xl mr-3">👥</span>
                                <div>
                                    <h3 class="font-medium text-gray-900">People Search</h3>
                                    <p class="text-sm text-gray-500">Find professionals</p>
                                </div>
                            </a>
                            
                            <a href="/pages/people_enrichment" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="text-2xl mr-3">👤</span>
                                <div>
                                    <h3 class="font-medium text-gray-900">People Enrichment</h3>
                                    <p class="text-sm text-gray-500">Enrich people data</p>
                                </div>
                            </a>
                            
                            <a href="/pages/company_enrichment" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="text-2xl mr-3">📈</span>
                                <div>
                                    <h3 class="font-medium text-gray-900">Company Enrichment</h3>
                                    <p class="text-sm text-gray-500">Enrich company data</p>
                                </div>
                            </a>
                            
                            <a href="/pages/diagnostics" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="text-2xl mr-3">🔧</span>
                                <div>
                                    <h3 class="font-medium text-gray-900">API Diagnostics</h3>
                                    <p class="text-sm text-gray-500">Check API status</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div id="loading-indicator" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-2 text-gray-600">Loading dashboard...</p>
            </div>

            <div id="error-message" class="hidden mb-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="text-red-800 font-semibold mb-2">Error</h3>
                    <p id="error-text" class="text-red-700"></p>
                </div>
            </div>
        </div>
    `;
}

// Initialize dashboard
function initDashboard() {
    loadDashboardStats();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardStats, 30000);
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        console.log('Loading dashboard stats...');
        const response = await makeRequest('/api/dashboard/stats', 'GET');
        
        console.log('Dashboard stats response:', response);
        
        if (response && response.success) {
            updateDashboardUI(response.data);
        } else {
            // FIXED: Better error handling for failed responses
            const errorMessage = response.error || response.detail || 'Unknown error occurred';
            console.error('Dashboard stats failed:', errorMessage);
            showError(errorMessage);
            
            // FIXED: Show default data even when there's an error
            updateDashboardUI({
                companies_found: 0,
                people_enriched: 0,
                success_rate: 0,
                current_jobs: 0,
                total_jobs: 0,
                recent_activity: [],
                active_api_key: 'Error',
                error: errorMessage
            });
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        const errorMessage = `Network error: ${error.message}`;
        showError(errorMessage);
        
        // FIXED: Show default data with error info
        updateDashboardUI({
            companies_found: 0,
            people_enriched: 0,
            success_rate: 0,
            current_jobs: 0,
            total_jobs: 0,
            recent_activity: [],
            active_api_key: 'Network Error',
            error: errorMessage
        });
    }
}

// Update dashboard UI with data
function updateDashboardUI(data) {
    console.log('Updating dashboard UI with data:', data);
    
    // Update stats cards with fallback values
    document.getElementById('company-searches').textContent = (data.company_searches || 0).toLocaleString();
    document.getElementById('people-searches').textContent = (data.people_searches || 0).toLocaleString();
    document.getElementById('company-enrichments').textContent = (data.company_enrichments || 0).toLocaleString();
    document.getElementById('people-enrichments').textContent = (data.people_enrichments || 0).toLocaleString();
    document.getElementById('success-rate').textContent = `${data.success_rate || 0}%`;
    
    // Update last updated time
    if (data.last_updated) {
        try {
            const lastUpdated = new Date(data.last_updated);
            document.getElementById('last-updated').textContent = `Last updated: ${lastUpdated.toLocaleString()}`;
        } catch (e) {
            document.getElementById('last-updated').textContent = 'Last updated: Unknown';
        }
    } else {
        document.getElementById('last-updated').textContent = 'Last updated: Never';
    }
    
    // Update active API key with error handling
    const apiKeyElement = document.getElementById('active-api-key');
    if (apiKeyElement) {
        apiKeyElement.textContent = data.active_api_key || 'N/A';
        
        // FIXED: Add visual indicator for error states
        if (data.error || data.active_api_key === 'Error' || data.active_api_key === 'Network Error') {
            apiKeyElement.className = 'text-2xl font-bold text-red-600';
            apiKeyElement.title = data.error || 'Error loading API key info';
        } else {
            apiKeyElement.className = 'text-2xl font-bold text-gray-900';
            apiKeyElement.title = '';
        }
    }

    // Update recent activity
    updateRecentActivity(data.recent_activity || []);
    
    // FIXED: Show error message if present
    if (data.error) {
        showError(`Dashboard Error: ${data.error}`);
    } else {
        hideError();
    }
}

// Update recent activity section
function updateRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500">No recent activity</div>';
        return;
    }
    
    const activityIcons = {
        'company_search': '🔍',
        'people_search': '👥',
        'people_enrichment': '👤',
        'job_completed': '✅',
        'job_failed': '❌',
        'csv_upload': '📄'
    };
    
    let html = '<div class="space-y-3">';
    
    activities.forEach(activity => {
        const icon = activityIcons[activity.type] || '📊';
        const timestamp = new Date(activity.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        
        html += `
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span class="text-lg">${icon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${timeAgo}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Quick search functionality
async function performQuickSearch() {
    const input = document.getElementById('quick-search-input');
    const domain = input.value.trim();
    
    if (!domain) {
        alert('Please enter a domain');
        return;
    }
    
    const resultsDiv = document.getElementById('quick-search-results');
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>';
    
    try {
        // Log activity
        await logActivity('company_search', `Quick search for ${domain}`, 1);
        
        // For demo purposes - you can integrate with actual company search
        setTimeout(() => {
            resultsDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p class="text-green-800">Search completed for <strong>${domain}</strong></p>
                    <p class="text-sm text-green-600 mt-1">Visit <a href="/pages/company_search" class="underline">Company Search</a> for detailed results</p>
                </div>
            `;
            
            // Refresh stats after search
            loadDashboardStats();
        }, 1000);
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">Search failed: ${error.message}</p>
            </div>
        `;
    }
}

// Handle Enter key in quick search
function handleQuickSearchEnter(event) {
    if (event.key === 'Enter') {
        performQuickSearch();
    }
}

// Utility functions
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function showError(message) {
    console.error('Dashboard Error:', message);
    
    // Try to find error display element
    let errorDiv = document.getElementById('error-message');
    
    if (!errorDiv) {
        // Create error display if it doesn't exist
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'mb-8 bg-red-50 border border-red-200 rounded-lg p-4';
        
        const container = document.querySelector('.max-w-7xl') || document.querySelector('main') || document.body;
        container.insertBefore(errorDiv, container.firstChild);
    }
    
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <span class="text-red-500 mr-2 text-lg">⚠️</span>
            <div>
                <h3 class="text-red-800 font-semibold">Dashboard Error</h3>
                <p class="text-red-700 text-sm">${message}</p>
                <button onclick="refreshDashboard()" class="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                    🔄 Retry
                </button>
            </div>
        </div>
    `;
    
    errorDiv.style.display = 'block';
}

function showTemporaryMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
        type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
            'bg-blue-100 border-blue-400 text-blue-700';

    messageDiv.className = `fixed top-4 right-4 ${bgColor} border px-4 py-2 rounded shadow-lg z-50 text-sm`;
    messageDiv.innerHTML = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Export functions for global access
window.refreshDashboard = refreshDashboard;
window.resetStats = resetStats;
window.performQuickSearch = performQuickSearch;
window.handleQuickSearchEnter = handleQuickSearchEnter;

console.log('🎯 Dashboard.js loaded successfully');
