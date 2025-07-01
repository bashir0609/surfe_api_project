// settings.js - API Key Management

let currentKey = null;
let availableKeys = [];

async function initSettings() {
    console.log('Initializing settings page...');
    // Try to load selected key from localStorage first
    const savedKey = localStorage.getItem('selectedApiKey');
    if (savedKey) {
        updateCurrentKey(savedKey);
    }
    await loadAPIKeys();
    updateKeyStatus();
}

async function loadAPIKeys() {
    try {
        const response = await makeRequest('/api/v1/diagnostics/api-stats', 'GET');
        if (response.success) {
            const stats = response.data.statistics;
            updateKeysList(stats.key_details);
            updateCurrentKey(stats.last_key_used);

            // Show notification if no key selected
            if (!stats.last_key_used || stats.last_key_used === "N/A (No API Key Used Yet)") {
                showNoApiKeySelectedNotification();
            }

            // Disable select button for currently selected key
            disableSelectedKeyButton(stats.last_key_used);
        } else {
            showError('Failed to load API keys');
        }
    } catch (error) {
        showError('Error loading API keys: ' + error.message);
    }
}

function disableSelectedKeyButton(selectedKey) {
    const buttons = document.querySelectorAll('#api-keys-list button');
    buttons.forEach(button => {
        if (button.textContent === 'Select') {
            if (button.getAttribute('onclick')?.includes(`'${selectedKey}'`)) {
                button.disabled = true;
                button.textContent = 'Selected';
                button.classList.add('bg-gray-400', 'cursor-not-allowed');
                button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            } else {
                button.disabled = false;
                button.textContent = 'Select';
                button.classList.remove('bg-gray-400', 'cursor-not-allowed');
                button.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            }
        }
    });
}

function updateKeysList(keyDetails) {
    const container = document.getElementById('api-keys-list');
    container.innerHTML = '';

    Object.entries(keyDetails).forEach(([maskedKey, details]) => {
        const keyElement = document.createElement('div');
        keyElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        
        const isDisabled = details.is_disabled;
        const successRate = details.success_rate.toFixed(1);
        
        keyElement.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-mono">${maskedKey}</span>
                    ${isDisabled ? 
                        '<span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Disabled</span>' :
                        '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>'
                    }
                </div>
                <div class="text-sm text-gray-600 mt-1">
                    Success Rate: ${successRate}% | 
                    Requests: ${details.total_requests} | 
                    Failures: ${details.failed_attempts}
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="selectKey('${maskedKey}')" 
                        class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                    Select
                </button>
                <button onclick="removeKey('${maskedKey}')"
                        class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    Remove
                </button>
                ${isDisabled ? createEnableApiKeyButton(maskedKey, enableKeyHandler).outerHTML : ''}
            </div>
        `;
        
        container.appendChild(keyElement);
    });
}

// Handler for enable button click
function enableKeyHandler(maskedKey) {
    console.log('Enabling key:', maskedKey);
    makeRequest('/api/v1/settings/enable-key', 'POST', { masked_key: maskedKey })
        .then(response => {
            if (response.success) {
                showSuccess(`API key ${maskedKey} enabled successfully`);
                loadAPIKeys();
            } else {
                showServerResponseNotification('Failed to enable API key');
            }
        })
        .catch(error => {
            showServerResponseNotification('Error enabling API key: ' + error.message);
        });
}

function updateCurrentKey(key) {
    const element = document.getElementById('current-key');
    currentKey = key;
    element.textContent = key || 'No key selected';
    updateKeyStatus();
}

function updateKeyStatus() {
    const container = document.getElementById('key-status');
    if (!currentKey) {
        container.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">No API key is currently selected</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800">Using API key: ${currentKey}</p>
        </div>
    `;
}

async function selectKey(maskedKey) {
    console.log('Selecting key:', maskedKey);
    try {
        console.log('Making request to select key...');
        const response = await makeRequest('/api/v1/settings/select-key', 'POST', {
            masked_key: maskedKey
        });
        console.log('Select key response:', response);

        if (response.success) {
            showSuccess(`Selected API key: ${maskedKey}`);
            updateCurrentKey(maskedKey);
            // Save selected key to localStorage for persistence
            localStorage.setItem('selectedApiKey', maskedKey);
            console.log('Key selected successfully');
        } else {
            showError('Failed to select API key');
            console.error('Failed to select key:', response);
        }
    } catch (error) {
        showError('Error selecting API key: ' + error.message);
        console.error('Error in selectKey:', error);
    }
}

async function addNewKey() {
    const input = document.getElementById('new-key-input');
    const key = input.value.trim();

    if (!key) {
        showError('Please enter an API key');
        return;
    }

    try {
        const response = await makeRequest('/api/v1/settings/add-key', 'POST', {
            api_key: key
        });

        if (response.success) {
            showSuccess('API key added successfully');
            input.value = '';
            await loadAPIKeys();
        } else {
            showError('Failed to add API key');
        }
    } catch (error) {
        showError('Error adding API key: ' + error.message);
    }
}

async function removeKey(maskedKey) {
    if (!confirm('Are you sure you want to remove this API key?')) {
        return;
    }

    try {
        const response = await makeRequest('/api/v1/settings/remove-key', 'POST', {
            masked_key: maskedKey
        });

        if (response.success) {
            showSuccess('API key removed successfully');
            await loadAPIKeys();
        } else {
            showError('Failed to remove API key');
        }
    } catch (error) {
        showError('Error removing API key: ' + error.message);
    }
}

async function testSelectedKey() {
    if (!currentKey) {
        showError('Please select an API key first');
        return;
    }

    const resultsDiv = document.getElementById('test-results');
    resultsDiv.innerHTML = `
        <div class="animate-pulse bg-gray-50 p-4 rounded-lg">
            Testing API key...
        </div>
    `;

    try {
        const response = await makeRequest('/api/v1/diagnostics/api-key-test', 'GET');
        
        if (response.success && response.data.valid) {
            resultsDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p class="text-green-800">✅ API key is working correctly</p>
                    <p class="text-sm text-green-600 mt-2">Response time: ${response.data.response_time_ms}ms</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800">❌ API key test failed</p>
                    <p class="text-sm text-red-600 mt-2">${response.error || 'Unknown error'}</p>
                </div>
            `;
        }
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">❌ Error testing API key</p>
                <p class="text-sm text-red-600 mt-2">${error.message}</p>
            </div>
        `;
    }
}

function showSuccess(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-lg z-50';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

function showError(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-50';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}
