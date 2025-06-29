// Enhanced diagnostics.js with network troubleshooting
// Uses shared.js functions: makeRequest, showLoading, hideLoading, showError

// Function to create the enhanced diagnostics page content
function createDiagnosticsPage() {
    return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">🔧 Enhanced API Diagnostics</h1>
                <p class="text-gray-600">Comprehensive testing and troubleshooting for Surfe API connectivity and performance.</p>
            </div>

            <!-- Quick Actions Grid -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Diagnostic Tests</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                        id="run-full-diagnosis" 
                        class="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 font-medium">
                        🚨 Full Diagnosis
                    </button>
                    
                    <button 
                        id="test-connectivity" 
                        class="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 font-medium">
                        🌐 Test Network
                    </button>
                    
                    <button 
                        id="test-api-key" 
                        class="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 font-medium">
                        🔑 Test API Key
                    </button>
                    
                    <button 
                        id="get-api-stats" 
                        class="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 font-medium">
                        📊 API Statistics
                    </button>
                </div>
            </div>

            <!-- Advanced Tests -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Advanced Tests</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                        id="run-diagnostics" 
                        class="bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                        🔍 Get Available Filters
                    </button>
                    
                    <button 
                        id="test-endpoints" 
                        class="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200 font-medium">
                        🧪 Test Endpoints
                    </button>
                    
                    <button 
                        id="test-comprehensive-endpoints" 
                        class="bg-cyan-600 text-white py-3 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 font-medium">
                        🔬 Comprehensive API Test
                    </button>
                    
                    <button 
                        id="reset-keys" 
                        class="bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 font-medium">
                        🔄 Reset Keys
                    </button>
                </div>
                
                <div class="mt-4 text-sm text-gray-500">
                    <p><strong>Test Descriptions:</strong></p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <ul class="list-disc list-inside space-y-1">
                                <li><strong>Full Diagnosis:</strong> Complete system health check</li>
                                <li><strong>Test Network:</strong> Check DNS, HTTP, and SSL connectivity</li>
                                <li><strong>Test API Key:</strong> Verify API key validity with rotation</li>
                                <li><strong>API Statistics:</strong> View usage stats and key health</li>
                            </ul>
                        </div>
                        <div>
                            <ul class="list-disc list-inside space-y-1">
                                <li><strong>Get Filters:</strong> Test API by retrieving available search filters</li>
                                <li><strong>Test Endpoints:</strong> Find working API URL combinations</li>
                                <li><strong>Comprehensive Test:</strong> Deep endpoint analysis with detailed reporting</li>
                                <li><strong>Reset Keys:</strong> Clear API key cooldowns (emergency use)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading and Error States -->
            <div id="loading-indicator" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Running diagnostics...</p>
            </div>

            <div id="error-message" class="hidden mb-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="text-red-800 font-semibold mb-2">Error</h3>
                    <p id="error-text" class="text-red-700"></p>
                </div>
            </div>

            <!-- Results Container -->
            <div id="results-container"></div>
        </div>
    `;
}

// Add these enhanced utility functions at the top of your diagnostics.js file
function showDiagnosticsLoading() {
    // Clear results first
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
    
    // Hide any error messages
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    
    console.log('🔄 Loading started - previous results cleared');
}

function hideDiagnosticsLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
    console.log('✅ Loading finished');
}

function showDiagnosticsError(message) {
    // First hide loading
    hideDiagnosticsLoading();
    
    // Clear results container
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
    
    // Show error
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorDiv && errorText) {
        errorText.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        errorDiv.classList.remove('hidden');
    }
    
    console.error('❌ Error displayed:', message);
}

// REPLACE your entire initDiagnostics() function with this:
function initDiagnostics() {
    console.log('🔧 Initializing diagnostics event listeners...');
    
    // Full Diagnosis
    const fullDiagButton = document.getElementById('run-full-diagnosis');
    if (fullDiagButton) {
        fullDiagButton.addEventListener('click', async () => {
            console.log('🚨 Running full system diagnosis...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/full-diagnosis', 'GET');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayFullDiagnosisResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Full diagnosis failed');
                }
            } catch (error) {
                showDiagnosticsError(`Full diagnosis error: ${error.message}`);
            }
        });
        console.log('✅ Full Diagnosis button initialized');
    } else {
        console.warn('❌ Full Diagnosis button not found');
    }

    // Network Connectivity Test
    const connectivityButton = document.getElementById('test-connectivity');
    if (connectivityButton) {
        connectivityButton.addEventListener('click', async () => {
            console.log('🌐 Testing network connectivity...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/connectivity', 'GET');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayConnectivityResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Connectivity test failed');
                }
            } catch (error) {
                showDiagnosticsError(`Connectivity test error: ${error.message}`);
            }
        });
        console.log('✅ Connectivity Test button initialized');
    } else {
        console.warn('❌ Connectivity Test button not found');
    }

    // API Key Test
    const apiKeyButton = document.getElementById('test-api-key');
    if (apiKeyButton) {
        apiKeyButton.addEventListener('click', async () => {
            console.log('🔑 Testing API key with rotation...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/api-key-test', 'GET');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayApiKeyResults(response.data);
                } else {
                    displayApiKeyResults({
                        valid: false,
                        error: response.error || 'API key test failed'
                    });
                }
            } catch (error) {
                displayApiKeyResults({
                    valid: false,
                    error: `API key test error: ${error.message}`
                });
            }
        });
        console.log('✅ API Key Test button initialized');
    } else {
        console.warn('❌ API Key Test button not found');
    }

    // API Statistics
    const apiStatsButton = document.getElementById('get-api-stats');
    if (apiStatsButton) {
        apiStatsButton.addEventListener('click', async () => {
            console.log('📊 Getting API statistics...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/api-stats', 'GET');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayApiStatsResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Failed to get API statistics');
                }
            } catch (error) {
                showDiagnosticsError(`API stats error: ${error.message}`);
            }
        });
        console.log('✅ API Statistics button initialized');
    } else {
        console.warn('❌ API Statistics button not found');
    }

    // Get Available Filters
    const filtersButton = document.getElementById('run-diagnostics');
    if (filtersButton) {
        filtersButton.addEventListener('click', async () => {
            console.log('🔍 Getting available filters...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/filters', 'GET');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayFiltersResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Failed to get filters');
                }
            } catch (error) {
                showDiagnosticsError(`Error getting filters: ${error.message}`);
            }
        });
        console.log('✅ Get Filters button initialized');
    } else {
        console.warn('❌ Get Filters button not found');
    }

    // Test Different Endpoints
    const endpointsButton = document.getElementById('test-endpoints');
    if (endpointsButton) {
        endpointsButton.addEventListener('click', async () => {
            console.log('🧪 Testing different endpoints...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/test-endpoints', 'POST');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayEndpointTestResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Endpoint testing failed');
                }
            } catch (error) {
                showDiagnosticsError(`Endpoint test error: ${error.message}`);
            }
        });
        console.log('✅ Test Endpoints button initialized');
    } else {
        console.warn('❌ Test Endpoints button not found');
    }

    // 🔬 Comprehensive API Test - THE IMPORTANT ONE
    const comprehensiveButton = document.getElementById('test-comprehensive-endpoints');
    if (comprehensiveButton) {
        comprehensiveButton.addEventListener('click', async () => {
            console.log('🔬 Running comprehensive API endpoint testing...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/test-endpoints-comprehensive', 'POST');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayComprehensiveEndpointResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Comprehensive endpoint testing failed');
                }
            } catch (error) {
                showDiagnosticsError(`Comprehensive endpoint test error: ${error.message}`);
            }
        });
        console.log('✅ Comprehensive API Test button initialized');
    } else {
        console.warn('❌ Comprehensive API Test button NOT FOUND - check HTML template!');
    }

    // Reset API Keys
    const resetButton = document.getElementById('reset-keys');
    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to reset all API key cooldowns? This should only be used in emergencies.')) {
                return;
            }
            
            console.log('🔄 Resetting API key cooldowns...');
            showDiagnosticsLoading();
            
            try {
                const response = await makeRequest('/api/v1/diagnostics/reset-keys', 'POST');
                hideDiagnosticsLoading();
                
                if (response.success) {
                    displayResetResults(response.data);
                } else {
                    showDiagnosticsError(response.error || 'Failed to reset API keys');
                }
            } catch (error) {
                showDiagnosticsError(`Reset keys error: ${error.message}`);
            }
        });
        console.log('✅ Reset Keys button initialized');
    } else {
        console.warn('❌ Reset Keys button not found');
    }
    
    console.log('🎉 All diagnostics event listeners initialized successfully');
}

// Display comprehensive endpoint test results
function displayComprehensiveEndpointResults(data) {
    const container = document.getElementById('results-container');
    
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">🔬 Comprehensive Endpoint Test Results</h2>
                <p class="text-sm text-gray-600 mt-1">Detailed analysis of all API endpoints and configurations</p>
            </div>
            <div class="p-6">
    `;
    
    // Check if we have meaningful data structure
    if (data && typeof data === 'object') {
        // Display summary if available
        if (data.summary) {
            html += `
                <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 class="text-blue-800 font-semibold mb-2">Test Summary</h3>
                    <div class="text-blue-700 text-sm space-y-1">
            `;
            
            if (typeof data.summary === 'object') {
                Object.entries(data.summary).forEach(([key, value]) => {
                    html += `<div><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${value}</div>`;
                });
            } else {
                html += `<div>${data.summary}</div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Display working endpoints if available
        if (data.working_endpoints && Array.isArray(data.working_endpoints) && data.working_endpoints.length > 0) {
            html += `
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">✅ Working Endpoints (${data.working_endpoints.length})</h3>
                    <div class="space-y-2">
            `;
            
            data.working_endpoints.forEach(endpoint => {
                html += `
                    <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div class="font-mono text-sm">${endpoint.method || 'GET'} ${endpoint.url || endpoint}</div>
                        ${endpoint.status ? `<div class="text-xs text-green-600 mt-1">Status: ${endpoint.status}</div>` : ''}
                        ${endpoint.response_time ? `<div class="text-xs text-green-600">Response Time: ${endpoint.response_time}ms</div>` : ''}
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        // Display failed endpoints if available
        if (data.failed_endpoints && Array.isArray(data.failed_endpoints) && data.failed_endpoints.length > 0) {
            html += `
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">❌ Failed Endpoints (${data.failed_endpoints.length})</h3>
                    <div class="space-y-2">
            `;
            
            data.failed_endpoints.forEach(endpoint => {
                html += `
                    <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div class="font-mono text-sm">${endpoint.method || 'GET'} ${endpoint.url || endpoint}</div>
                        ${endpoint.error ? `<div class="text-xs text-red-600 mt-1">Error: ${endpoint.error}</div>` : ''}
                        ${endpoint.status ? `<div class="text-xs text-red-600">Status: ${endpoint.status}</div>` : ''}
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        // Display raw data if no structured format
        if (!data.summary && !data.working_endpoints && !data.failed_endpoints) {
            html += `
                <div class="space-y-4">
                    <h3 class="font-semibold text-gray-900">Raw Results</h3>
                    <div class="bg-gray-50 border rounded-lg p-4">
                        <pre class="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            `;
        }
    } else {
        html += `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">Comprehensive test completed, but no detailed results were returned.</p>
                <p class="text-yellow-700 text-sm mt-1">This may indicate that the endpoint is not yet fully implemented.</p>
            </div>
        `;
    }
    
    html += '</div></div>';
    container.innerHTML = html;
}

// Display full diagnosis results with comprehensive information
function displayFullDiagnosisResults(data) {
    const container = document.getElementById('results-container');
    
    const statusColor = data.overall_status === 'HEALTHY' ? 'green' : 'red';
    const statusIcon = data.overall_status === 'HEALTHY' ? '✅' : '❌';
    
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-${statusColor}-50">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${statusIcon}</span>
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">Full System Diagnosis</h2>
                        <p class="text-sm text-gray-600">Overall Status: <span class="font-semibold text-${statusColor}-800">${data.overall_status}</span></p>
                    </div>
                </div>
            </div>
            <div class="p-6">
    `;
    
    // Issues and Recommendations
    if (data.issues_detected && data.issues_detected.length > 0) {
        html += `
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 class="text-red-800 font-semibold mb-2">🚨 Issues Detected:</h3>
                <ul class="list-disc list-inside text-red-700 space-y-1">
        `;
        data.issues_detected.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        html += '</ul></div>';
        
        if (data.recommendations && data.recommendations.length > 0) {
            html += `
                <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 class="text-yellow-800 font-semibold mb-2">💡 Recommendations:</h3>
                    <ul class="list-disc list-inside text-yellow-700 space-y-1">
            `;
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul></div>';
        }
    } else {
        html += `
            <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 class="text-green-800 font-semibold">✅ All Systems Operational</h3>
                <p class="text-green-700 mt-1">No issues detected. API is functioning normally.</p>
            </div>
        `;
    }
    
    // Detailed Test Results
    html += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Connectivity Test -->
            <div class="border rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">🌐 Network Connectivity</h4>
                ${formatConnectivityInfo(data.connectivity_test)}
            </div>
            
            <!-- API Statistics -->
            <div class="border rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">📊 API Statistics</h4>
                ${formatApiStatsInfo(data.api_statistics)}
            </div>
        </div>
        
        <div class="mt-6 text-xs text-gray-500">
            Generated at: ${data.timestamp}
        </div>
    `;
    
    html += '</div></div>';
    container.innerHTML = html;
}

// Display connectivity test results
function displayConnectivityResults(data) {
    const container = document.getElementById('results-container');
    
    const overallStatus = data.overall_status === 'OK';
    const statusColor = overallStatus ? 'green' : 'red';
    const statusIcon = overallStatus ? '✅' : '❌';
    
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${statusIcon}</span>
                    <h2 class="text-xl font-semibold text-gray-900">Network Connectivity Test</h2>
                </div>
            </div>
            <div class="p-6">
    `;
    
    // Basic connectivity
    html += `
        <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Basic Connectivity Tests</h3>
            ${formatConnectivityInfo(data.basic_connectivity)}
        </div>
    `;
    
    // URL tests
    if (data.url_tests) {
        html += `
            <div class="mb-6">
                <h3 class="font-semibold text-gray-900 mb-3">URL Accessibility Tests</h3>
                <div class="space-y-2">
        `;
        
        for (const [url, result] of Object.entries(data.url_tests)) {
            const urlStatus = result.success ? '✅' : '❌';
            const urlColor = result.success ? 'green' : 'red';
            
            html += `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div class="flex items-center">
                        <span class="mr-2">${urlStatus}</span>
                        <span class="font-mono text-sm">${url}</span>
                    </div>
                    <div class="text-sm text-${urlColor}-600">
                        ${result.success ? `${result.status_code} (${result.response_time_ms}ms)` : result.error_type}
                    </div>
                </div>
            `;
        }
        
        html += '</div></div>';
    }
    
    // Working URLs
    if (data.working_urls && data.working_urls.length > 0) {
        html += `
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 class="text-green-800 font-semibold mb-2">✅ Working URLs (${data.working_urls.length})</h4>
                <div class="text-green-700 text-sm space-y-1">
        `;
        data.working_urls.forEach(url => {
            html += `<div class="font-mono">${url}</div>`;
        });
        html += '</div></div>';
    }
    
    html += '</div></div>';
    container.innerHTML = html;
}

// Display API key test results
function displayApiKeyResults(data) {
    const container = document.getElementById('results-container');
    
    const statusColor = data.valid ? 'green' : 'red';
    const statusIcon = data.valid ? '✅' : '❌';
    
    let html = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
                <span class="text-2xl mr-3">${statusIcon}</span>
                <h2 class="text-xl font-semibold text-gray-900">API Key Test Results</h2>
            </div>
            
            <div class="bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-4 mb-4">
                <p class="text-${statusColor}-800 font-semibold">
                    ${data.valid ? 'API Key is Valid and Working' : 'API Key Test Failed'}
                </p>
                ${data.message ? `<p class="text-${statusColor}-700 mt-1">${data.message}</p>` : ''}
                ${data.error ? `<p class="text-${statusColor}-700 mt-1">Error: ${data.error}</p>` : ''}
                ${data.error_analysis ? `<p class="text-${statusColor}-700 mt-1">Analysis: ${data.error_analysis}</p>` : ''}
            </div>
    `;
    
    // Additional details
    if (data.api_key_used) {
        html += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <strong>API Key Used:</strong> ${data.api_key_used}
                </div>
                ${data.status_code ? `<div><strong>Status Code:</strong> ${data.status_code}</div>` : ''}
            </div>
        `;
    }
    
    // API Statistics (if available)
    if (data.api_stats) {
        html += `
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">API Usage Statistics</h4>
                ${formatApiStatsInfo(data.api_stats)}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Display API statistics
function displayApiStatsResults(data) {
    const container = document.getElementById('results-container');
    
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">📊 API Usage Statistics</h2>
            </div>
            <div class="p-6">
                ${formatApiStatsInfo(data.statistics)}
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-2">Configuration</h4>
                    <div class="text-sm space-y-1">
                        <div><strong>Base URL:</strong> <span class="font-mono">${data.configuration.base_url}</span></div>
                        <div><strong>Total Keys Configured:</strong> ${data.configuration.total_keys_configured}</div>
                    </div>
                </div>
                
                <div class="mt-4 text-xs text-gray-500">
                    Generated at: ${data.timestamp}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Display endpoint test results
function displayEndpointTestResults(data) {
    const container = document.getElementById('results-container');
    
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">🧪 Endpoint Test Results</h2>
            </div>
            <div class="p-6">
    `;
    
    // Summary
    html += `
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-blue-800 font-semibold mb-2">Test Summary</h3>
            <div class="text-blue-700 text-sm space-y-1">
                <div>Total Tests Run: ${data.summary.total_tests}</div>
                <div>Working Endpoints Found: ${data.summary.working_endpoints}</div>
                <div>Current Configuration: ${data.current_configuration.base_url}</div>
            </div>
        </div>
    `;
    
    // Working combinations
    if (data.working_combinations && data.working_combinations.length > 0) {
        html += `
            <div class="mb-6">
                <h3 class="font-semibold text-gray-900 mb-3">✅ Working Endpoint Combinations</h3>
                <div class="space-y-2">
        `;
        
        data.working_combinations.forEach(combo => {
            html += `
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="font-mono text-sm">${combo.method} ${combo.full_url}</div>
                    <div class="text-xs text-green-600 mt-1">Status: ${combo.status_code}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
    }
    
    // Detailed results by base URL
    html += `
        <div class="space-y-4">
            <h3 class="font-semibold text-gray-900">Detailed Test Results</h3>
    `;
    
    for (const [baseUrl, results] of Object.entries(data.test_results)) {
        html += `
            <div class="border rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 mb-3">${baseUrl}</h4>
                <div class="space-y-2">
        `;
        
        for (const [endpoint, result] of Object.entries(results)) {
            const statusIcon = result.success ? '✅' : '❌';
            const statusColor = result.success ? 'green' : 'red';
            
            html += `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div class="flex items-center">
                        <span class="mr-2">${statusIcon}</span>
                        <span class="font-mono">${endpoint}</span>
                    </div>
                    <div class="text-${statusColor}-600">
                        ${result.success ? `${result.status_code} (${result.response_time_ms}ms)` : result.error_type || 'Failed'}
                    </div>
                </div>
            `;
        }
        
        html += '</div></div>';
    }
    
    html += '</div></div></div>';
    container.innerHTML = html;
}

// Display reset results
function displayResetResults(data) {
    const container = document.getElementById('results-container');
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
                <span class="text-2xl mr-3">🔄</span>
                <h2 class="text-xl font-semibold text-gray-900">API Keys Reset</h2>
            </div>
            
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p class="text-green-800 font-semibold">${data.message}</p>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Statistics After Reset</h4>
                ${formatApiStatsInfo(data.stats_after_reset)}
            </div>
            
            <div class="mt-4 text-xs text-gray-500">
                Reset completed at: ${data.timestamp}
            </div>
        </div>
    `;
}

// Display filter results (original functionality)
function displayFiltersResults(data) {
    const container = document.getElementById('results-container');
    
    if (!data || !data.filters) {
        container.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-8 text-center">
                <p class="text-gray-500">Could not retrieve filter data.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">Available Search Filters</h2>
                <p class="text-sm text-gray-600 mt-1">These filters can be used in People Search API calls</p>
            </div>
            <div class="p-6 space-y-6">
    `;

    for (const key in data.filters) {
        const values = data.filters[key];
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        html += `
            <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-lg text-gray-900 mb-3">${title}</h3>
        `;

        if (Array.isArray(values) && values.length > 0) {
            html += '<div class="flex flex-wrap gap-2">';
            
            if (typeof values[0] === 'object' && values[0] !== null) {
                values.forEach(tech => {
                    html += `
                        <div class="p-3 bg-gray-50 border rounded-lg w-full max-w-md">
                            <p class="font-semibold text-gray-800">${tech.name}</p>
                    `;
                    if (tech.categories && tech.categories.length > 0) {
                        html += '<div class="flex flex-wrap gap-1 mt-2">';
                        tech.categories.forEach(cat => {
                            html += `<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${cat}</span>`;
                        });
                        html += '</div>';
                    }
                    html += '</div>';
                });
            } else {
                values.forEach(value => {
                    html += `<span class="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">${value}</span>`;
                });
            }
            html += '</div>';
        } else {
            html += '<p class="text-sm text-gray-500">No values available.</p>';
        }
        html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}

// Helper function to format connectivity information
function formatConnectivityInfo(connectivity) {
    if (!connectivity) return '<p class="text-gray-500">No connectivity data available</p>';
    
    let html = '<div class="space-y-3">';
    
    // DNS Test
    const dnsStatus = connectivity.dns_test.success ? '✅' : '❌';
    const dnsColor = connectivity.dns_test.success ? 'green' : 'red';
    html += `
        <div class="flex items-center justify-between">
            <span>🌍 DNS Resolution</span>
            <span class="text-${dnsColor}-600">${dnsStatus} ${connectivity.dns_test.success ? `(${connectivity.dns_test.resolution_time_ms}ms)` : connectivity.dns_test.error_type}</span>
        </div>
    `;
    
    // HTTP Test
    const httpStatus = connectivity.http_test.success ? '✅' : '❌';
    const httpColor = connectivity.http_test.success ? 'green' : 'red';
    html += `
        <div class="flex items-center justify-between">
            <span>🌐 HTTP Connectivity</span>
            <span class="text-${httpColor}-600">${httpStatus} ${connectivity.http_test.success ? `${connectivity.http_test.status_code} (${connectivity.http_test.response_time_ms}ms)` : connectivity.http_test.error_type}</span>
        </div>
    `;
    
    // SSL Test
    const sslStatus = connectivity.ssl_test.success ? '✅' : '❌';
    const sslColor = connectivity.ssl_test.success ? 'green' : 'red';
    html += `
        <div class="flex items-center justify-between">
            <span>🔒 SSL/TLS</span>
            <span class="text-${sslColor}-600">${sslStatus}</span>
        </div>
    `;
    
    html += '</div>';
    return html;
}

// Helper function to format API statistics
function formatApiStatsInfo(stats) {
    if (!stats) return '<p class="text-gray-500">No statistics available</p>';
    
    return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">${stats.total_api_requests || 0}</div>
                <div class="text-blue-800">Total Requests</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">${stats.successful_requests || 0}</div>
                <div class="text-green-800">Successful</div>
            </div>
            <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">${Math.round(stats.overall_success_rate || 0)}%</div>
                <div class="text-yellow-800">Success Rate</div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">${stats.available_keys || 0}</div>
                <div class="text-purple-800">Available Keys</div>
            </div>
        </div>
        
        ${stats.key_details ? `
            <div class="mt-4">
                <h5 class="font-medium text-gray-900 mb-2">Key Details</h5>
                <div class="space-y-2">
                    ${Object.entries(stats.key_details).map(([key, details]) => `
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <span class="font-mono">${key}</span>
                            <div class="flex gap-2">
                                <span class="text-gray-600">${details.total_requests} req</span>
                                <span class="text-green-600">${Math.round(details.success_rate)}% success</span>
                                ${details.is_disabled ? '<span class="text-red-600">DISABLED</span>' : '<span class="text-green-600">ACTIVE</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Enhanced Diagnostics.js loaded successfully');
    initDiagnostics();
});

console.log('🔧 Enhanced Diagnostics.js loaded successfully');