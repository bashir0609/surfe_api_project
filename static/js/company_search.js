// company_search.js - Company search specific functionality

// Global variables
let currentResults = [];
let currentSearchParams = null;
let nextPageToken = null;
let excludeDomainsFromCSV = [];

// Create company search page content
function createCompanySearchPage() {
    return `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Company Search</h1>
                <p class="text-gray-600">Find companies based on criteria like industry, location, employee count, and revenue.</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <form id="api-form" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Industries -->
                        <div class="autocomplete-container">
                            <label for="industries" class="block text-sm font-medium text-gray-700 mb-2">
                                Industries <span class="text-gray-500">(select one or more)</span>
                            </label>
                            <input type="text" id="industries"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Type to search industries... (e.g. music, saas, fintech)">
                        </div>

                        <!-- Countries -->
                        <div class="autocomplete-container">
                            <label for="countries" class="block text-sm font-medium text-gray-700 mb-2">
                                Countries <span class="text-gray-500">(select countries)</span>
                            </label>
                            <input type="text" id="countries"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Type to search countries... (e.g. united states, germany)">
                        </div>

                        <!-- Employee Count Range -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Employee Count Range</label>
                            <div class="grid md:grid-cols-2 gap-4">
                                <input type="number" id="employee-min" placeholder="Min employees"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <input type="number" id="employee-max" placeholder="Max employees"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="mt-2 flex flex-wrap gap-1">
                                <button type="button" onclick="setEmployeeRange(1, 50)" class="filter-tag">Startup (1-50)</button>
                                <button type="button" onclick="setEmployeeRange(51, 200)" class="filter-tag">Small (51-200)</button>
                                <button type="button" onclick="setEmployeeRange(201, 1000)" class="filter-tag">Medium (201-1K)</button>
                                <button type="button" onclick="setEmployeeRange(1001, 10000)" class="filter-tag">Large (1K-10K)</button>
                            </div>
                        </div>

                        <!-- Revenue Range -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Revenue Range (USD)</label>
                            <div class="grid md:grid-cols-2 gap-4">
                                <input type="number" id="revenue-min" placeholder="Min revenue (e.g., 1000000)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <input type="number" id="revenue-max" placeholder="Max revenue (e.g., 100000000)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="mt-2 flex flex-wrap gap-1">
                                <button type="button" onclick="setRevenueRange(1000000, 10000000)" class="filter-tag">$1M - $10M</button>
                                <button type="button" onclick="setRevenueRange(10000000, 100000000)" class="filter-tag">$10M - $100M</button>
                                <button type="button" onclick="setRevenueRange(100000000, 1000000000)" class="filter-tag">$100M - $1B</button>
                                <button type="button" onclick="setRevenueRange(1000000000, 999999999999999)" class="filter-tag">$1B+</button>
                            </div>
                        </div>

                        <!-- Specific Domains -->
                        <div>
                            <label for="domains" class="block text-sm font-medium text-gray-700 mb-2">
                                Include Specific Domains <span class="text-gray-500">(optional, comma-separated)</span>
                            </label>
                            <input type="text" id="domains"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="example.com, company.com">
                            <p class="text-xs text-gray-500 mt-1">Only search companies with these specific domains</p>
                        </div>

                        <!-- Excluded Domains -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Exclude Domains <span class="text-gray-500">(optional)</span>
                            </label>
                            <div class="mb-3">
                                <label for="domains-excluded" class="block text-xs text-gray-600 mb-1">Type domains manually:</label>
                                <input type="text" id="domains-excluded"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="competitor.com, spam-site.com, unwanted.co">
                                <p class="text-xs text-gray-500 mt-1">Separate multiple domains with commas</p>
                            </div>

                            <div class="border-t border-gray-200 pt-3">
                                <label for="exclude-csv" class="block text-xs text-gray-600 mb-2">
                                    Or upload CSV file with exclude domains:
                                </label>
                                <div class="flex items-center space-x-3">
                                    <input type="file" id="exclude-csv" accept=".csv,.txt"
                                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        onchange="handleExcludeCSV(this)">
                                    <button type="button" onclick="testExcludeDomains()"
                                        class="text-xs bg-blue-200 text-blue-700 px-3 py-1 rounded hover:bg-blue-300">
                                        Test
                                    </button>
                                    <button type="button" onclick="clearExcludeDomains()"
                                        class="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">
                                        Clear All
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">
                                    CSV should have one domain per line or comma-separated. Example: domain1.com, domain2.org
                                </p>
                                <div id="exclude-domains-preview" class="mt-2 hidden">
                                    <p class="text-xs font-medium text-gray-700 mb-1">Loaded exclude domains:</p>
                                    <div class="bg-red-50 border border-red-200 rounded p-2 max-h-20 overflow-y-auto">
                                        <div id="exclude-domains-list" class="text-xs text-red-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Limit -->
                        <div>
                            <label for="limit" class="block text-sm font-medium text-gray-700 mb-2">Results Limit</label>
                            <input type="number" id="limit" value="10" min="1" max="200"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>

                        <input type="hidden" id="page-token" value="">

                        <button type="submit"
                            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                            🔍 Search Companies
                        </button>
                    </div>
                </form>
            </div>

            <!-- Loading -->
            <div id="loading" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Searching companies...</p>
            </div>

            <!-- Results -->
            <div id="results-container"></div>
        </div>
    `;
}

// CSV handling for exclude domains
function handleExcludeCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const domains = parseCSVDomains(content);

        if (domains.length > 0) {
            excludeDomainsFromCSV = domains;
            updateExcludeDomainsPreview();
            mergeExcludeDomains();
            showTemporaryMessage(`✅ Loaded ${domains.length} domains from CSV`, 'success');
        } else {
            showTemporaryMessage('❌ No valid domains found in CSV file', 'error');
        }
    };

    reader.onerror = function () {
        showTemporaryMessage('❌ Error reading CSV file', 'error');
    };

    reader.readAsText(file);
}

function parseCSVDomains(content) {
    const domains = new Set();
    const lines = content.split(/[\r\n]+/).filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const domainColumnIndex = headers.findIndex(h => 
        h.includes('domain') || h === 'website' || h === 'url'
    );
    
    if (domainColumnIndex === -1) {
        console.warn('No domain column found. Headers:', headers);
        return [];
    }
    
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        
        if (columns.length > domainColumnIndex) {
            const domainValue = columns[domainColumnIndex].trim()
                .replace(/^["'`]+|["'`]+$/g, '')
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '')
                .toLowerCase();
            
            if (isValidDomain(domainValue)) {
                domains.add(domainValue);
            }
        }
    }
    
    return Array.from(domains);
}

function updateExcludeDomainsPreview() {
    const previewDiv = document.getElementById('exclude-domains-preview');
    const listDiv = document.getElementById('exclude-domains-list');

    if (excludeDomainsFromCSV.length > 0) {
        previewDiv.classList.remove('hidden');
        listDiv.innerHTML = excludeDomainsFromCSV.slice(0, 20).join(', ') +
            (excludeDomainsFromCSV.length > 20 ? ` ... and ${excludeDomainsFromCSV.length - 20} more` : '');
    } else {
        previewDiv.classList.add('hidden');
    }
}

function mergeExcludeDomains() {
    const manualInput = document.getElementById('domains-excluded');
    const manualDomains = manualInput.value.trim();
    const allDomains = [...excludeDomainsFromCSV];

    if (manualDomains) {
        const manual = manualDomains.split(',').map(d => d.trim()).filter(d => d);
        allDomains.push(...manual);
    }

    if (excludeDomainsFromCSV.length > 0) {
        const preview = excludeDomainsFromCSV.slice(0, 3).join(', ');
        const extra = excludeDomainsFromCSV.length > 3 ? ` +${excludeDomainsFromCSV.length - 3} from CSV` : '';
        manualInput.placeholder = `${preview}${extra}${manualDomains ? ', ' + manualDomains : ''}`;
    }
}

function clearExcludeDomains() {
    excludeDomainsFromCSV = [];
    document.getElementById('domains-excluded').value = '';
    document.getElementById('domains-excluded').placeholder = 'competitor.com, spam-site.com, unwanted.co';
    document.getElementById('exclude-csv').value = '';
    updateExcludeDomainsPreview();
    showTemporaryMessage('🗑️ Cleared all exclude domains', 'info');
}

function getAllExcludeDomains() {
    const manualInput = document.getElementById('domains-excluded').value.trim();
    const manualDomains = manualInput ? manualInput.split(',').map(d => d.trim()).filter(d => d) : [];
    const allDomains = [...new Set([...excludeDomainsFromCSV, ...manualDomains])];
    return allDomains.filter(d => d);
}

function testExcludeDomains() {
    const allDomains = getAllExcludeDomains();
    if (allDomains.length > 0) {
        showTemporaryMessage(`📋 Found ${allDomains.length} exclude domains: ${allDomains.slice(0, 5).join(', ')}${allDomains.length > 5 ? '...' : ''}`, 'info');
    } else {
        showTemporaryMessage('❌ No exclude domains found', 'error');
    }
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

// Results display
function displayResults(data) {
    const container = document.getElementById('results-container');

    if (!data || !data.companies || data.companies.length === 0) {
        container.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <p class="text-gray-600">No companies found. Try a different industry or country.</p>
            </div>
        `;
        return;
    }

    // Log activity to dashboard
    if (data && data.people && data.people.length > 0) {
        logActivity('people_enrichment', `Enriched ${data.people.length} people`, data.people.length);
    }

    currentResults = data.companies;

    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Found ${data.companies.length} Companies</h2>
                <div class="flex gap-2">
                    <button onclick="downloadCSV()" 
                            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center">
                        📥 Download CSV
                    </button>
                    ${nextPageToken ?
            `<button onclick="loadNextPage()" 
                             class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center">
                        ➡️ Load More
                     </button>`
            : ''
        }
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Countries</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industries</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.companies.map((company, index) => `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50">
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900">${company.name || 'N/A'}</div>
                                </td>
                                <td class="px-6 py-4">
                                    ${company.domain ?
                `<a href="https://${company.domain}" target="_blank" class="text-indigo-600 hover:text-indigo-900 text-sm">${company.domain}</a>`
                : '<span class="text-gray-400 text-sm">N/A</span>'
            }
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">
                                    ${company.employeeCount ? company.employeeCount.toLocaleString() : 'N/A'}
                                </td>
                                <td class="px-6 py-4">
                                    ${company.countries && company.countries.length > 0 ?
                company.countries.slice(0, 2).map(country =>
                    `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${country}</span>`
                ).join('') + (company.countries.length > 2 ? `<span class="text-xs text-gray-500">+${company.countries.length - 2}</span>` : '')
                : (company.country ? 
                    `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${company.country}</span>`
                    : '<span class="text-gray-400 text-xs">N/A</span>')
            }
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">
                                    ${company.revenue ? 
                `${company.revenue.toLocaleString()}` 
                : (company.annualRevenue ? 
                    `${company.annualRevenue.toLocaleString()}` 
                    : 'N/A')
            }
                                </td>
                                <td class="px-6 py-4">
                                    ${company.industries && company.industries.length > 0 ?
                company.industries.slice(0, 2).map(industry =>
                    `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${industry}</span>`
                ).join('') + (company.industries.length > 2 ? `<span class="text-xs text-gray-500">+${company.industries.length - 2}</span>` : '')
                : '<span class="text-gray-400">N/A</span>'
            }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-600">
                        Showing ${data.companies.length} companies total
                    </p>
                    ${nextPageToken ?
            `<p class="text-sm text-blue-600">More results available - click "Load More" to continue</p>`
            : `<p class="text-sm text-gray-500">No more results available</p>`
        }
                </div>
            </div>
        </div>
    `;
}

function downloadCSV() {
    if (currentResults.length === 0) {
        alert('No data to download');
        return;
    }

    const headers = ['Company Name', 'Domain', 'Employees', 'Countries', 'Revenue', 'Industries'];
    const csvContent = [
        headers.join(','),
        ...currentResults.map(company => [
            `"${(company.name || 'N/A').replace(/"/g, '""')}"`,
            `"${(company.domain || 'N/A').replace(/"/g, '""')}"`,
            company.employeeCount || 'N/A',
            `"${(company.countries ? company.countries.join('; ') : (company.country || 'N/A')).toString().replace(/"/g, '""')}"`,
            company.revenue ? `${company.revenue.toLocaleString()}` : (company.annualRevenue ? `${company.annualRevenue.toLocaleString()}` : 'N/A'),
            `"${(company.industries ? company.industries.join('; ') : 'N/A').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

async function loadNextPage() {
    if (!nextPageToken || !currentSearchParams) {
        alert('No more pages available');
        return;
    }

    const payload = { ...currentSearchParams };
    payload.pageToken = nextPageToken;

    console.log('Loading next page:', JSON.stringify(payload, null, 2));

    showLoading();
    const response = await makeRequest('/api/v2/companies/search', 'POST', payload);
    hideLoading();

    if (response.success) {
        nextPageToken = response.data.nextPageToken || null;

        if (response.data.companies && response.data.companies.length > 0) {
            currentResults = [...currentResults, ...response.data.companies];
            displayResults({ companies: currentResults });
        } else {
            alert('No more results available');
        }
    } else {
        showError(response.detail);
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results-container').innerHTML = '';
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(error) {
    document.getElementById('results-container').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 class="text-red-800 font-semibold mb-2">Error</h3>
            <p class="text-red-700">${JSON.stringify(error, null, 2)}</p>
        </div>
    `;
}

// Initialize company search functionality
function initCompanySearch() {
    // Initialize autocomplete using the shared system
    initializeAutocompleteForPage('company-search');
    
    const form = document.getElementById('api-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const filters = {};

            // Industries
            const industriesInput = document.getElementById('industries').value;
            if (industriesInput) {
                filters.industries = [industriesInput.trim()];
            }

            // Countries
            const countriesInput = document.getElementById('countries').value;
            if (countriesInput) {
                filters.countries = countriesInput.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            }

            // Employee count range
            const employeeMin = document.getElementById('employee-min').value;
            const employeeMax = document.getElementById('employee-max').value;
            if (employeeMin || employeeMax) {
                filters.employeeCount = {
                    from: employeeMin ? parseInt(employeeMin) : 1,
                    to: employeeMax ? parseInt(employeeMax) : 999999999999999
                };
            }

            // Revenue range
            const revenueMin = document.getElementById('revenue-min').value;
            const revenueMax = document.getElementById('revenue-max').value;
            if (revenueMin || revenueMax) {
                filters.revenue = {
                    from: revenueMin ? parseInt(revenueMin) : 1,
                    to: revenueMax ? parseInt(revenueMax) : 999999999999999
                };
            }

            // Specific domains to include
            const domainsInput = document.getElementById('domains').value;
            if (domainsInput) {
                filters.domains = domainsInput.split(',').map(s => s.trim()).filter(s => s);
            }

            // Domains to exclude (combine manual input + CSV)
            const allExcludeDomains = getAllExcludeDomains();
            if (allExcludeDomains.length > 0) {
                console.log('Exclude domains to send:', allExcludeDomains);

                if (allExcludeDomains.length > 1000) {
                    alert(`Too many exclude domains (${allExcludeDomains.length}). Maximum 1000 allowed. Please reduce the list.`);
                    return;
                }

                filters.domainsExcluded = allExcludeDomains;
            }

            const payload = {
                filters: filters,
                limit: parseInt(document.getElementById('limit').value) || 10,
                pageToken: document.getElementById('page-token').value.trim() || ""
            };

            // Store search params for pagination
            currentSearchParams = { ...payload };
            currentSearchParams.pageToken = "";

            console.log('Final payload to send:', JSON.stringify(payload, null, 2));

            // Validate payload before sending
            if (!payload.filters || Object.keys(payload.filters).length === 0) {
                alert('Please select at least one filter (industry or country)');
                return;
            }

            showLoading();
            const response = await makeRequest('/api/v2/companies/search', 'POST', payload);
            hideLoading();

            if (response.success) {
                nextPageToken = response.data.nextPageToken || null;
                displayResults(response.data);
            } else {
                showError(response.detail);
            }
        });
    }
}

console.log('Company search.js loaded successfully');
