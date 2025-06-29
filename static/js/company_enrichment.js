// company_enrichment.js - Company enrichment specific functionality

let pollInterval;
let csvDomains = [];

// Create enrichment page content
function createEnrichmentPage() {
    return `
        <div class="max-w-4xl mx-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Bulk Company Enrichment</h1>
                <p class="text-gray-600">Enrich a list of company domains to get detailed information including employee count, industry, and more.</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <form id="api-form">
                    <!-- Input Method Selection -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Choose Input Method</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center">
                                <input type="radio" name="input-method" value="single" checked 
                                       class="mr-2 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm">Single Domain</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="input-method" value="manual" 
                                       class="mr-2 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm">Manual List</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="input-method" value="csv" 
                                       class="mr-2 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm">CSV Upload</span>
                            </label>
                        </div>
                    </div>

                    <!-- Single Domain Input -->
                    <div id="single-domain-input" class="mb-6">
                        <label for="single-domain" class="block text-sm font-medium text-gray-700 mb-2">
                            Domain
                        </label>
                        <input 
                            type="text" 
                            id="single-domain" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            placeholder="example.com">
                        <p class="text-xs text-gray-500 mt-1">Enter a single domain to enrich. Example: surfe.com</p>
                    </div>

                    <!-- Manual Domain List -->
                    <div id="manual-domain-input" class="mb-6 hidden">
                        <label for="domains" class="block text-sm font-medium text-gray-700 mb-2">
                            Domains <span class="text-gray-500">(one per line)</span>
                        </label>
                        <textarea 
                            id="domains" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32" 
                            placeholder="surfe.com&#10;google.com&#10;microsoft.com&#10;apple.com&#10;salesforce.com"></textarea>
                        <p class="text-xs text-gray-500 mt-1">Enter one domain per line. Example: company.com</p>
                    </div>

                    <!-- CSV Upload -->
                    <div id="csv-upload-input" class="mb-6 hidden">
                        <label for="csv-file" class="block text-sm font-medium text-gray-700 mb-2">
                            Upload CSV File
                        </label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input 
                                type="file" 
                                id="csv-file" 
                                accept=".csv,.txt" 
                                class="hidden"
                                onchange="handleCSVUpload(this)">
                            <label for="csv-file" class="cursor-pointer">
                                <div class="space-y-2">
                                    <div class="text-gray-400 text-center">
                                        <div class="text-6xl">📁</div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <span class="font-medium text-indigo-600 hover:text-indigo-500">Click to upload</span> or drag and drop
                                    </div>
                                    <div class="text-xs text-gray-500">CSV or TXT files only</div>
                                </div>
                            </label>
                        </div>
                        
                        <!-- CSV Preview -->
                        <div id="csv-preview" class="mt-4 hidden">
                            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div class="flex items-center mb-2">
                                    <span class="text-green-500 mr-2 text-lg">✅</span>
                                    <span class="font-medium text-green-800">CSV loaded successfully</span>
                                </div>
                                <div id="csv-info" class="text-sm text-green-700"></div>
                                <div class="mt-2">
                                    <button type="button" onclick="clearCSV()" 
                                            class="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                                        Clear File
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 text-xs text-gray-500">
                            <p class="font-medium mb-1">CSV Format Requirements:</p>
                            <ul class="list-disc list-inside space-y-1">
                                <li>Must have a "Domain" column header</li>
                                <li>One domain per row: example.com, company.org, etc.</li>
                                <li>Alternative headers: "Website", "URL", "Site"</li>
                            </ul>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                        🚀 Start Enrichment
                    </button>
                </form>
            </div>

            <!-- Status Container -->
            <div id="status-container" class="mb-8 hidden">
                <h2 class="text-xl font-semibold mb-4 text-gray-900">Enrichment Status</h2>
                <div id="job-status" class="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
                    <div class="flex items-center">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                        <span>Initializing...</span>
                    </div>
                </div>
            </div>

            <!-- Loading Indicator -->
            <div id="loading-indicator" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Starting enrichment job...</p>
            </div>

            <!-- Error Message -->
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

// CSV handling functions
function handleCSVUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const domains = parseCSVForDomains(content);
        
        if (domains.length > 0) {
            csvDomains = domains;
            showCSVPreview(domains, file.name);
        } else {
            showError('No valid domains found in CSV file. Please check the format.');
        }
    };
    
    reader.onerror = function() {
        showError('Error reading CSV file');
    };
    
    reader.readAsText(file);
}

function parseCSVForDomains(content) {
    const domains = new Set();
    const lines = content.split(/[\r\n]+/).filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    // Parse header to find domain column
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const domainColumnIndex = headers.findIndex(h => 
        h.includes('domain') || h.includes('website') || h.includes('url') || h.includes('site')
    );
    
    if (domainColumnIndex === -1) {
        console.warn('No domain column found, using first column');
        for (let i = 1; i < lines.length; i++) {
            const domain = cleanDomain(lines[i].split(',')[0]);
            if (domain && isValidDomain(domain)) {
                domains.add(domain);
            }
        }
    } else {
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length > domainColumnIndex) {
                const domain = cleanDomain(columns[domainColumnIndex]);
                if (domain && isValidDomain(domain)) {
                    domains.add(domain);
                }
            }
        }
    }
    
    return Array.from(domains);
}

function showCSVPreview(domains, filename) {
    const preview = document.getElementById('csv-preview');
    const info = document.getElementById('csv-info');
    
    info.innerHTML = `
        <div><strong>File:</strong> ${filename}</div>
        <div><strong>Valid domains found:</strong> ${domains.length}</div>
        <div><strong>Preview:</strong> ${domains.slice(0, 5).join(', ')}${domains.length > 5 ? ` +${domains.length - 5} more` : ''}</div>
    `;
    
    preview.classList.remove('hidden');
}

function clearCSV() {
    csvDomains = [];
    document.getElementById('csv-file').value = '';
    document.getElementById('csv-preview').classList.add('hidden');
}

// Initialize enrichment functionality
function initEnrichment() {
    // Setup input method switching
    const inputMethods = document.querySelectorAll('input[name="input-method"]');
    const singleInput = document.getElementById('single-domain-input');
    const manualInput = document.getElementById('manual-domain-input');
    const csvInput = document.getElementById('csv-upload-input');
    
    inputMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            singleInput.classList.add('hidden');
            manualInput.classList.add('hidden');
            csvInput.classList.add('hidden');
            
            switch(e.target.value) {
                case 'single':
                    singleInput.classList.remove('hidden');
                    break;
                case 'manual':
                    manualInput.classList.remove('hidden');
                    break;
                case 'csv':
                    csvInput.classList.remove('hidden');
                    break;
            }
        });
    });

    // Setup form submission
    const form = document.getElementById('api-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        hideError();
        document.getElementById('status-container').classList.add('hidden');
        document.getElementById('results-container').innerHTML = '';
        
        let domains = [];
        const selectedMethod = document.querySelector('input[name="input-method"]:checked').value;
        
        switch(selectedMethod) {
            case 'single':
                const singleDomain = document.getElementById('single-domain').value.trim();
                if (singleDomain) {
                    domains = [cleanDomain(singleDomain)];
                }
                break;
                
            case 'manual':
                domains = document.getElementById('domains').value
                    .split('\n')
                    .map(d => cleanDomain(d))
                    .filter(d => d);
                break;
                
            case 'csv':
                domains = [...csvDomains];
                break;
        }
            
        if (domains.length === 0) {
            showError("Please enter at least one domain.");
            return;
        }
        
        const invalidDomains = domains.filter(domain => !isValidDomain(domain));
        if (invalidDomains.length > 0) {
            showError(`Invalid domains found: ${invalidDomains.slice(0, 5).join(', ')}${invalidDomains.length > 5 ? ` and ${invalidDomains.length - 5} more` : ''}`);
            return;
        }
        
        if (domains.length > 1000) {
            showError(`Too many domains (${domains.length}). Maximum 1000 allowed per batch.`);
            return;
        }
        
        const payload = { domains };
        
        showLoading();
        // CHANGED: v1 to v2
        const startResponse = await makeRequest('/api/v2/companies/enrich', 'POST', payload);
        hideLoading();
        
        if (startResponse.job_id) {
            document.getElementById('status-container').classList.remove('hidden');
            pollForStatus(startResponse.job_id);
        } else {
            showError(startResponse.detail || 'Failed to start enrichment job.');
        }
    });
}

async function pollForStatus(jobId) {
    const statusDiv = document.getElementById('job-status');
    
    statusDiv.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span>Job <code class="font-mono bg-blue-100 px-2 py-1 rounded text-sm">${jobId}</code> started. Status: <strong>PENDING</strong></span>
        </div>
    `;
    
    pollInterval = setInterval(async () => {
        // CHANGED: v1 to v2
        const statusResponse = await makeRequest(`/api/v2/companies/enrich/status/${jobId}`, 'GET');
        
        if (!statusResponse || statusResponse.detail) {
            statusDiv.innerHTML = `
                <div class="flex items-center text-red-600">
                    <span>❌ Error checking status for job <code class="font-mono bg-red-100 px-2 py-1 rounded text-sm">${jobId}</code></span>
                </div>
            `;
            clearInterval(pollInterval);
            return;
        }
        
        const status = statusResponse.status.toUpperCase();
        const isProcessing = ['PENDING', 'RUNNING', 'IN_PROGRESS'].includes(status);
        
        statusDiv.innerHTML = `
            <div class="flex items-center ${isProcessing ? 'text-blue-600' : 'text-green-600'}">
                ${isProcessing ? '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>' : '<span class="mr-3">✅</span>'}
                <span>Job <code class="font-mono bg-gray-100 px-2 py-1 rounded text-sm">${jobId}</code> - Status: <strong>${status}</strong></span>
            </div>
        `;
        
        if (!isProcessing) {
            clearInterval(pollInterval);
            
            if (['COMPLETED', 'PARTIALLY_COMPLETED'].includes(status)) {
                displayResults(statusResponse.result);
            } else {
                showError(`Job failed or timed out. Status: ${status}`);
                if (statusResponse.result) {
                    displayResults(statusResponse.result);
                }
            }
        }
    }, 3000);
}

function displayResults(data) {
    const container = document.getElementById('results-container');
    
    console.log('Raw response data:', JSON.stringify(data, null, 2));
    
    let results = null;
    // FIXED: Handle both v1 and v2 API response formats
    if (data && data.companies) {
        results = data.companies;
    } else if (data && data.organizations) {
        results = data.organizations;
    } else if (data && data.results && data.results.companies) {
        results = data.results.companies;
    } else if (data && Array.isArray(data)) {
        results = data;
    }
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-8 text-center">
                <p class="text-gray-500 mb-4">No enrichment results returned.</p>
                <details class="text-left">
                    <summary class="cursor-pointer text-blue-600 hover:text-blue-800">🔍 Debug Info (Click to expand)</summary>
                    <pre class="mt-2 p-3 bg-gray-100 text-xs overflow-auto rounded">${JSON.stringify(data, null, 2)}</pre>
                </details>
            </div>
        `;
        return;
    }
    
    // Log activity to dashboard
    if (data && data.people && data.people.length > 0) {
        logActivity('people_enrichment', `Enriched ${data.people.length} people`, data.people.length);
    }

    container.innerHTML = `
        <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-900">Enrichment Results (${results.length})</h2>
                <button onclick="downloadEnrichmentCSV()" 
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center">
                    📥 Download CSV
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${results.map(company => {
                    // FIXED: Map both v1 and v2 API field names
                    const name = company.name || company.companyName || 'N/A';
                    const domain = company.websites?.[0] || company.domain || company.website || '';
                    const employees = company.employeeCount || company.employees || company.size || null;
                    const revenue = company.revenue || company.annualRevenue || null;
                    const industries = company.industry ? [company.industry] : (company.industries || company.industry || []);
                    const subIndustry = company.subIndustry || '';
                    const description = company.description || '';
                    const founded = company.founded || company.foundedYear || '';
                    const hqCountry = company.hqCountry || company.country || '';
                    const linkedin = company.linkedInURL || company.linkedin || company.linkedinUrl || '';
                    
                    return `
                        <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h3 class="font-bold text-lg text-gray-800 mb-2">${name}</h3>
                            
                            ${domain ? 
                                `<a href="https://${domain}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-4 block">${domain}</a>` 
                                : '<p class="text-gray-400 text-sm mb-4">No domain</p>'
                            }
                            
                            ${description ? 
                                `<p class="text-gray-600 text-sm mb-4 line-clamp-3">${description.substring(0, 120)}${description.length > 120 ? '...' : ''}</p>`
                                : ''
                            }
                            
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Employees:</span>
                                    <span class="font-semibold text-gray-700">${employees ? employees.toLocaleString() : 'N/A'}</span>
                                </div>
                                
                                ${revenue ? `
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Revenue:</span>
                                    <span class="font-semibold text-gray-700">$${revenue.toLocaleString()}</span>
                                </div>
                                ` : ''}
                                
                                ${founded ? `
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Founded:</span>
                                    <span class="font-semibold text-gray-700">${founded}</span>
                                </div>
                                ` : ''}
                                
                                ${hqCountry ? `
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Country:</span>
                                    <span class="font-semibold text-gray-700">${hqCountry}</span>
                                </div>
                                ` : ''}
                                
                                <div class="pt-2">
                                    <span class="text-gray-500 text-xs">Industries:</span>
                                    <div class="mt-1">
                                        ${industries && industries.length > 0 ? 
                                            (Array.isArray(industries) ? industries : [industries]).map(industry => 
                                                `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${typeof industry === 'string' ? industry : industry.name || 'Industry'}</span>`
                                            ).join('')
                                            : '<span class="text-gray-400 text-xs">N/A</span>'
                                        }
                                        ${subIndustry ? `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${subIndustry}</span>` : ''}
                                    </div>
                                </div>
                                
                                ${linkedin ? 
                                    `<div class="pt-2">
                                        <span class="text-gray-500 text-xs">LinkedIn:</span>
                                        <a href="${linkedin}" target="_blank" class="text-blue-500 hover:underline text-xs block">View Profile</a>
                                    </div>` 
                                    : ''
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function downloadEnrichmentCSV() {
    // Get the results from the grid display instead of table
    const container = document.getElementById('results-container');
    const resultCards = container.querySelectorAll('.bg-white.border');
    
    if (!resultCards || resultCards.length === 0) {
        alert('No results data found to download');
        return;
    }
    
    const results = Array.from(resultCards).map(card => {
        const companyName = card.querySelector('h3')?.textContent?.trim() || 'N/A';
        const website = card.querySelector('a[href*="https://"]')?.textContent?.trim() || 'N/A';
        const description = card.querySelector('p.text-gray-600')?.textContent?.trim() || 'N/A';
        
        // Extract data from the space-y-2 div
        const dataRows = card.querySelectorAll('.space-y-2 .flex.justify-between');
        let employees = 'N/A', revenue = 'N/A', founded = 'N/A', country = 'N/A';
        
        dataRows.forEach(row => {
            const label = row.querySelector('.text-gray-500')?.textContent?.trim();
            const value = row.querySelector('.font-semibold')?.textContent?.trim();
            
            if (label?.includes('Employees')) employees = value || 'N/A';
            else if (label?.includes('Revenue')) revenue = value || 'N/A';
            else if (label?.includes('Founded')) founded = value || 'N/A';
            else if (label?.includes('Country')) country = value || 'N/A';
        });
        
        // Extract industries
        const industrySpans = card.querySelectorAll('.bg-blue-100, .bg-green-100');
        const industries = Array.from(industrySpans).map(span => span.textContent.trim()).join('; ') || 'N/A';
        
        // Extract LinkedIn
        const linkedin = card.querySelector('a[href*="linkedin"]')?.href || 'N/A';
        
        return {
            'Company Name': companyName,
            'Website': website,
            'Description': description,
            'Employees': employees,
            'Revenue': revenue,
            'Founded': founded,
            'Country': country,
            'Industries': industries,
            'LinkedIn': linkedin
        };
    });
    
    if (results.length === 0) {
        alert('No valid data found to download');
        return;
    }
    
    // Create CSV content
    const headers = Object.keys(results[0]);
    const csvContent = [
        headers.join(','),
        ...results.map(result => 
            headers.map(header => {
                const value = result[header] || 'N/A';
                const escaped = value.toString().replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `company_enrichment_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV download completed for', results.length, 'companies');
}

console.log('Company enrichment.js loaded successfully');