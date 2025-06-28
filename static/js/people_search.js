// people_search.js - Updated for Surfe API v2

// Global variables
let currentResults = [];
let currentSearchResults = []; // Global

// Create people search page content with v2 API structure
function createPeopleSearchPage() {
    return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">People Search - Surfe API v2</h1>
                <p class="text-gray-600">Find people using company and people filters with enhanced v2 API capabilities.</p>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 class="text-yellow-800 font-semibold mb-2">⚠️ API Configuration</h3>
                <p class="text-yellow-700 text-sm">This uses Surfe API v2. Ensure your backend is configured to handle the new API structure.</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <form id="api-form">
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">🏢 Company Filters</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div class="autocomplete-container">
                                <label for="company-countries" class="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                                <input 
                                    type="text" 
                                    id="company-countries" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="fr, us, uk">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated country codes</p>
                            </div>
                            
                            <div>
                                <label for="company-domains" class="block text-sm font-medium text-gray-700 mb-2">Domains</label>
                                <input 
                                    type="text" 
                                    id="company-domains" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="surfe.com, google.com">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated domains</p>
                            </div>
                            
                            <div>
                                <label for="company-domains-excluded" class="block text-sm font-medium text-gray-700 mb-2">Excluded Domains</label>
                                <input 
                                    type="text" 
                                    id="company-domains-excluded" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="spam.com, old.com">
                                <p class="text-xs text-gray-500 mt-1">Domains to exclude</p>
                            </div>
                            
                            <div class="autocomplete-container">
                                <label for="industries" class="block text-sm font-medium text-gray-700 mb-2">
                                    Industries <span class="text-gray-500">(select one or more)</span>
                                </label>
                                <input type="text" id="industries"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Type to search industries... (e.g. music, saas, fintech)">
                            </div>
                            
                            <div>
                                <label for="company-names" class="block text-sm font-medium text-gray-700 mb-2">Company Names</label>
                                <input 
                                    type="text" 
                                    id="company-names" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="Surfe, Google">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated company names</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="employee-count-from" class="block text-sm font-medium text-gray-700 mb-2">Employee Count (From)</label>
                                <input 
                                    type="number" 
                                    id="employee-count-from" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="5" 
                                    min="0">
                            </div>
                            <div>
                                <label for="employee-count-to" class="block text-sm font-medium text-gray-700 mb-2">Employee Count (To)</label>
                                <input 
                                    type="number" 
                                    id="employee-count-to" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="10000" 
                                    min="1">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="revenue-from" class="block text-sm font-medium text-gray-700 mb-2">Revenue (From)</label>
                                <input 
                                    type="number" 
                                    id="revenue-from" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="1" 
                                    min="0">
                            </div>
                            <div>
                                <label for="revenue-to" class="block text-sm font-medium text-gray-700 mb-2">Revenue (To)</label>
                                <input 
                                    type="number" 
                                    id="revenue-to" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="999999999" 
                                    min="1">
                            </div>
                        </div>
                    </div>

                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">👥 People Filters</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div class="autocomplete-container">
                                <label for="people-countries" class="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                                <input 
                                    type="text" 
                                    id="people-countries" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="fr, us, uk">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated country codes</p>
                            </div>
                            
                            <div class="autocomplete-container">
                                <label for="people-departments" class="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                                <input 
                                    type="text" 
                                    id="people-departments" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="Management, Engineering, Sales" 
                                    value="Management">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated departments</p>
                            </div>
                            
                            <div>
                                <label for="people-job-titles" class="block text-sm font-medium text-gray-700 mb-2">Job Titles</label>
                                <input 
                                    type="text" 
                                    id="people-job-titles" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="CEO, CTO, Manager" 
                                    value="CEO, CTO">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated job titles</p>
                            </div>
                            
                            <div class="autocomplete-container">
                                <label for="people-seniorities" class="block text-sm font-medium text-gray-700 mb-2">Seniorities</label>
                                <input 
                                    type="text" 
                                    id="people-seniorities" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="Founder, C-Level, Director" 
                                    value="Founder, C-Level">
                                <p class="text-xs text-gray-500 mt-1">Comma-separated seniority levels</p>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">⚙️ Search Settings</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label for="limit" class="block text-sm font-medium text-gray-700 mb-2">Results Limit</label>
                                <input 
                                    type="number" 
                                    id="limit" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="10" 
                                    min="1" 
                                    max="100">
                                <p class="text-xs text-gray-500 mt-1">Max people to return (1-100)</p>
                            </div>
                            
                            <div>
                                <label for="people-per-company" class="block text-sm font-medium text-gray-700 mb-2">People per Company</label>
                                <input 
                                    type="number" 
                                    id="people-per-company" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value="5" 
                                    min="1" 
                                    max="10">
                                <p class="text-xs text-gray-500 mt-1">People per company (1-10)</p>
                            </div>
                            
                            <div>
                                <label for="page-token" class="block text-sm font-medium text-gray-700 mb-2">Page Token</label>
                                <input 
                                    type="text" 
                                    id="page-token" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="For pagination">
                                <p class="text-xs text-gray-500 mt-1">Leave empty for first page</p>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Examples:</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            <button type="button" onclick="loadExample('tech-founders')" class="text-left bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-sm transition-colors border border-blue-200">
                                <div class="font-medium text-blue-700">Tech Founders</div>
                                <div class="text-blue-600 text-xs">Software/SaaS founders</div>
                            </button>
                            <button type="button" onclick="loadExample('french-companies')" class="text-left bg-green-50 hover:bg-green-100 p-3 rounded-lg text-sm transition-colors border border-green-200">
                                <div class="font-medium text-green-700">French Companies</div>
                                <div class="text-green-600 text-xs">Management in French companies</div>
                            </button>
                            <button type="button" onclick="loadExample('surfe-leadjet')" class="text-left bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-sm transition-colors border border-purple-200">
                                <div class="font-medium text-purple-700">Surfe & Leadjet</div>
                                <div class="text-purple-600 text-xs">Leadership at specific companies</div>
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                        🔍 Search People
                    </button>
                </form>
            </div>

            <div id="loading-indicator" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Searching for people...</p>
            </div>

            <div id="error-message" class="hidden mb-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="text-red-800 font-semibold mb-2">Error</h3>
                    <p id="error-text" class="text-red-700"></p>
                </div>
            </div>

            <div id="results-container"></div>
        </div>
    `;
}

// Load example configurations (updated based on working Streamlit patterns)
function loadExample(exampleType) {
    const examples = {
        'tech-founders': {
            companies: {
                industries: ['Software', 'SaaS', 'Internet'],
                employeeCount: { from: 10, to: 1000 }
            },
            people: {
                seniorities: ['Founder', 'C-Level'],
                jobTitles: ['CEO', 'CTO', 'Founder']
            }
        },
        'french-companies': {
            companies: {
                countries: ['fr'],
                industries: ['Software', 'Internet']
            },
            people: {
                countries: ['fr'],
                departments: ['Management'],
                seniorities: ['C-Level', 'Director']
            }
        },
        'surfe-leadjet': {
            companies: {
                names: ['Surfe', 'Leadjet'],
                domains: ['surfe.com']
            },
            people: {
                seniorities: ['Founder', 'C-Level'],
                jobTitles: ['CEO', 'CTO']
            }
        }
    };
    
    const example = examples[exampleType];
    if (!example) return;
    
    // Clear all fields first
    clearAllFields();
    
    // Load company filters
    if (example.companies) {
        if (example.companies.countries) {
            document.getElementById('company-countries').value = example.companies.countries.join(', ');
        }
        if (example.companies.domains) {
            document.getElementById('company-domains').value = example.companies.domains.join(', ');
        }
        if (example.companies.industries) {
            document.getElementById('industries').value = example.companies.industries.join(', ');
        }
        if (example.companies.names) {
            document.getElementById('company-names').value = example.companies.names.join(', ');
        }
        if (example.companies.employeeCount) {
            document.getElementById('employee-count-from').value = example.companies.employeeCount.from;
            document.getElementById('employee-count-to').value = example.companies.employeeCount.to;
        }
    }
    
    // Load people filters
    if (example.people) {
        if (example.people.countries) {
            document.getElementById('people-countries').value = example.people.countries.join(', ');
        }
        if (example.people.departments) {
            document.getElementById('people-departments').value = example.people.departments.join(', ');
        }
        if (example.people.jobTitles) {
            document.getElementById('people-job-titles').value = example.people.jobTitles.join(', ');
        }
        if (example.people.seniorities) {
            document.getElementById('people-seniorities').value = example.people.seniorities.join(', ');
        }
    }
}

function clearAllFields() {
    const inputs = document.querySelectorAll('#api-form input[type="text"], #api-form input[type="number"]');
    inputs.forEach(input => {
        if (!['limit', 'people-per-company', 'employee-count-from', 'employee-count-to', 'revenue-from', 'revenue-to'].includes(input.id)) {
            input.value = '';
        }
    });
}

// Convert comma-separated string to array, filtering empty values
function stringToArray(str) {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

// Build API payload according to Surfe API v2 structure (based on working Streamlit version)
function buildApiPayload() {
    const payload = {
        limit: parseInt(document.getElementById('limit').value) || 10,
        pageToken: document.getElementById('page-token').value.trim() || "",
        peoplePerCompany: parseInt(document.getElementById('people-per-company').value) || 5,
    };
    
    // Build company filters (only add if we have actual values)
    const companiesFilters = {};
    
    const companyCountries = stringToArray(document.getElementById('company-countries').value);
    if (companyCountries.length > 0) {
        companiesFilters.countries = companyCountries.map(c => c.toLowerCase());
    }
    
    const companyDomains = stringToArray(document.getElementById('company-domains').value);
    if (companyDomains.length > 0) {
        companiesFilters.domains = companyDomains.map(d => d.trim());
    }
    
    const companyDomainsExcluded = stringToArray(document.getElementById('company-domains-excluded').value);
    if (companyDomainsExcluded.length > 0) {
        companiesFilters.domainsExcluded = companyDomainsExcluded.map(d => d.trim());
    }
    
    const companyIndustries = stringToArray(document.getElementById('industries').value);
    if (companyIndustries.length > 0) {
        companiesFilters.industries = companyIndustries;
    }
    
    const companyNames = stringToArray(document.getElementById('company-names').value);
    if (companyNames.length > 0) {
        companiesFilters.names = companyNames.map(n => n.trim());
    }
    
    const employeeCountFrom = parseInt(document.getElementById('employee-count-from').value);
    const employeeCountTo = parseInt(document.getElementById('employee-count-to').value);
    if (!isNaN(employeeCountFrom) && !isNaN(employeeCountTo) && employeeCountFrom > 0) {
        companiesFilters.employeeCount = {
            "from": employeeCountFrom,
            "to": employeeCountTo
        };
    }
    
    const revenueFrom = parseInt(document.getElementById('revenue-from').value);
    const revenueTo = parseInt(document.getElementById('revenue-to').value);
    if (!isNaN(revenueFrom) && !isNaN(revenueTo) && revenueFrom > 0) {
        companiesFilters.revenue = {
            "from": revenueFrom,
            "to": revenueTo
        };
    }
    
    // Only add companies object if we have filters
    if (Object.keys(companiesFilters).length > 0) {
        payload.companies = companiesFilters;
    }
    
    // Build people filters (only add if we have actual values)
    const peopleFilters = {};
    
    const peopleCountries = stringToArray(document.getElementById('people-countries').value);
    if (peopleCountries.length > 0) {
        peopleFilters.countries = peopleCountries.map(c => c.toLowerCase());
    }
    
    const peopleDepartments = stringToArray(document.getElementById('people-departments').value);
    if (peopleDepartments.length > 0) {
        peopleFilters.departments = peopleDepartments;
    }
    
    const peopleJobTitles = stringToArray(document.getElementById('people-job-titles').value);
    if (peopleJobTitles.length > 0) {
        peopleFilters.jobTitles = peopleJobTitles.map(t => t.trim());
    }
    
    const peopleSeniorities = stringToArray(document.getElementById('people-seniorities').value);
    if (peopleSeniorities.length > 0) {
        peopleFilters.seniorities = peopleSeniorities;
    }
    
    // Only add people object if we have filters
    if (Object.keys(peopleFilters).length > 0) {
        payload.people = peopleFilters;
    }
    
    return payload;
}

// Display results with enhanced layout
function displayResults(data) {
    const container = document.getElementById('results-container');
    
    // Check data structure and extract people array
    let peopleArray;
    if (data && data.data && data.data.people) {
        peopleArray = data.data.people;
    } else if (data && data.people) {
        peopleArray = data.people;
    } else if (Array.isArray(data)) {
        peopleArray = data;
    } else {
        peopleArray = [];
    }
    
    // Store results for CSV download
    currentResults = peopleArray;
    console.log('📊 Stored search results for CSV:', currentResults.length, 'people');
    
    if (peopleArray.length === 0) {
        container.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <div class="text-4xl mb-4">🔍</div>
                <p class="text-gray-600 text-lg mb-2">No people found</p>
                <p class="text-gray-500 text-sm">Try adjusting your filters or broadening your search criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-semibold text-gray-800">Found ${peopleArray.length} People</h2>
                    ${data.data && data.data.nextPageToken ? `<p class="text-sm text-blue-600 mt-1">Next page token: ${data.data.nextPageToken}</p>` : ''}
                </div>
                <button onclick="downloadPeopleCSV()" 
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center">
                    📥 Download CSV
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${peopleArray.map((person, index) => `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <span class="text-sm font-medium text-gray-700">
                                                    ${(person.firstName?.charAt(0) || '?')}${(person.lastName?.charAt(0) || '')}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">
                                                ${person.firstName || ''} ${person.lastName || ''}
                                            </div>
                                            ${person.email ? 
                                                `<div class="text-sm text-gray-500">${person.email}</div>` 
                                                : ''
                                            }
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">${person.jobTitle || 'N/A'}</div>
                                    ${person.seniorities && person.seniorities.length > 0 ? 
                                        `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            ${person.seniorities.join(', ')}
                                        </span>` 
                                        : ''
                                    }
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900 font-medium">${person.companyName || 'N/A'}</div>
                                    ${person.companyDomain ? 
                                        `<div class="text-sm text-gray-500">${person.companyDomain}</div>` 
                                        : ''
                                    }
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">
                                    ${person.country || 'N/A'}
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    ${person.linkedInUrl ? 
                                        `<a href="${person.linkedInUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 inline-flex items-center">
                                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
                                            </svg>
                                            LinkedIn
                                        </a>`
                                        : '<span class="text-gray-400">No LinkedIn</span>'
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
                        Showing ${peopleArray.length} people
                    </p>
                    <div class="flex items-center space-x-4">
                        ${data.data && data.data.nextPageToken ? 
                            `<button onclick="loadNextPage('${data.data.nextPageToken}')" 
                                    class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200">
                                Next Page →
                            </button>`
                            : ''
                        }
                        <p class="text-sm text-green-600">✅ Search completed</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load next page function
function loadNextPage(pageToken) {
    document.getElementById('page-token').value = pageToken;
    document.getElementById('api-form').dispatchEvent(new Event('submit'));
}

// CSV download function with enhanced data
function downloadPeopleCSV() {
    console.log('📥 Download CSV clicked');
    console.log('📊 Current results count:', currentResults.length);
    
    if (!currentResults || currentResults.length === 0) {
        alert('No search results to download. Please search for people first.');
        return;
    }

    // Enhanced CSV headers to match all the data you're collecting
    const headers = [
        'First Name', 'Last Name', 'Email', 'Job Title', 'Seniorities', 'Departments',
        'Company Name', 'Company Domain', 'Company Industries', 'Employee Count',
        'Country', 'Location', 'LinkedIn URL', 'Phone'
    ];
    
    // Convert results to CSV format
    const csvContent = [
        headers.join(','), // Header row
        ...currentResults.map(person => {
            // Handle arrays by joining with semicolons
            const seniorities = Array.isArray(person.seniorities) ? person.seniorities.join('; ') : (person.seniorities || '');
            const departments = Array.isArray(person.departments) ? person.departments.join('; ') : (person.departments || '');
            
            // Escape CSV data properly
            const escapeCSV = (field) => {
                if (field === null || field === undefined) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            return [
                escapeCSV(person.firstName || ''),
                escapeCSV(person.lastName || ''),
                escapeCSV(person.email || ''),
                escapeCSV(person.jobTitle || ''),
                escapeCSV(seniorities),
                escapeCSV(departments),
                escapeCSV(person.companyName || ''),
                escapeCSV(person.companyDomain || ''),
                escapeCSV(''), // Company industries - not in current data structure
                escapeCSV(''), // Employee count - not in current data structure
                escapeCSV(person.country || ''),
                escapeCSV(person.location || ''), // Add location if available
                escapeCSV(person.linkedInUrl || ''),
                escapeCSV(person.phone || '') // Add phone if available
            ].join(',');
        })
    ].join('\n');
    
    console.log('📄 CSV content preview:', csvContent.substring(0, 200) + '...');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `surfe_people_search_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ CSV download initiated');
}


// Initialize people search functionality
function initPeopleSearch() {
    initializeAllAutocomplete();
    const form = document.getElementById('api-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = buildApiPayload();
            
            // Validate that we have some filters (matches Streamlit validation)
            const hasCompanyFilters = payload.companies && Object.keys(payload.companies).length > 0;
            const hasPeopleFilters = payload.people && Object.keys(payload.people).length > 0;
            
            if (!hasCompanyFilters && !hasPeopleFilters) {
                showError('Please provide at least one company or people filter to search. The API requires meaningful search criteria.');
                return;
            }

            console.log('Surfe API v2 payload (matching Streamlit structure):', JSON.stringify(payload, null, 2));

            showLoading();
            
            try {
                // Try to make request to your backend endpoint first
                let response = await makeRequest('/api/v2/people/search', 'POST', payload);
                
                if (!response.success) {
                    // If backend fails, show instructions for direct API call
                    throw new Error('Backend not available - check console for direct API example');
                }
                
                hideLoading();
                displayResults(response.data);
                
            } catch (error) {
                hideLoading();
                
                // Show the direct API call example in console and error
                console.log('Direct Surfe API v2 call example:');
                console.log(`
fetch("https://api.surfe.com/v2/people/search", {
    method: "POST",
    headers: {
        "Authorization": "Bearer YOUR_API_KEY_HERE",
        "Content-Type": "application/json"
    },
    body: JSON.stringify(${JSON.stringify(payload, null, 2)})
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
                `);
                
                showError(`Backend request failed. Check console for direct API call example. Error: ${error.message}`);
            }
        });
    }
}

// Utility functions
function showLoading() {
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('results-container').innerHTML = '';
}

function hideLoading() {
    document.getElementById('loading-indicator').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    errorDiv.classList.remove('hidden');
    hideLoading();
}

// Enhanced makeRequest function with better error handling
async function makeRequest(url, method = 'GET', data = null) {
    try {
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || `HTTP error! status: ${response.status}`);
        }
        
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Request failed:', error);
        return {
            success: false,
            detail: error.message
        };
    }
}

// Convert v2 payload to v1 format for backward compatibility
function convertV2ToV1(v2Payload) {
    const v1Payload = {
        filters: {},
        limit: v2Payload.limit || 10,
        people_per_company: v2Payload.peoplePerCompany || 1
    };
    
    // Combine filters from companies and people into v1 filters object
    if (v2Payload.people?.seniorities) {
        v1Payload.filters.seniorities = v2Payload.people.seniorities;
    }
    
    if (v2Payload.companies?.industries) {
        v1Payload.filters.industries = v2Payload.companies.industries;
    }
    
    if (v2Payload.people?.countries) {
        v1Payload.filters.locations = v2Payload.people.countries;
    }
    
    if (v2Payload.people?.jobTitles) {
        v1Payload.filters.job_titles = v2Payload.people.jobTitles;
    }
    
    if (v2Payload.people?.departments) {
        v1Payload.filters.departments = v2Payload.departments;
    }
    
    // Handle other mappings as needed
    if (v2Payload.companies?.domains) {
        v1Payload.filters.company_domains = v2Payload.companies.domains;
    }
    
    if (v2Payload.companies?.names) {
        v1Payload.filters.company_names = v2Payload.companies.names;
    }
    
    return v1Payload;
}

// ADD THIS FUNCTION:
function initializeAllAutocomplete() {
    // Industries autocomplete
    const industryInput = document.getElementById('industries');
    if (industryInput && typeof SURFE_INDUSTRIES !== 'undefined' && typeof searchIndustries !== 'undefined') {
        setupAutocomplete(industryInput, SURFE_INDUSTRIES, searchIndustries);
        console.log('✅ Industry autocomplete initialized');
    }
    
    // Departments autocomplete  
    const departmentInput = document.getElementById('people-departments');
    if (departmentInput && typeof SURFE_DEPARTMENTS !== 'undefined' && typeof searchDepartments !== 'undefined') {
        setupAutocomplete(departmentInput, SURFE_DEPARTMENTS, searchDepartments);
        console.log('✅ Department autocomplete initialized');
    }
    
    // Seniorities autocomplete
    const seniorityInput = document.getElementById('people-seniorities');
    if (seniorityInput && typeof SURFE_SENIORITIES !== 'undefined' && typeof searchSeniorities !== 'undefined') {
        setupAutocomplete(seniorityInput, SURFE_SENIORITIES, searchSeniorities);
        console.log('✅ Seniority autocomplete initialized');
    }
    
    // ADD THESE: Company Countries autocomplete
    const companyCountriesInput = document.getElementById('company-countries');
    if (companyCountriesInput && typeof COUNTRIES !== 'undefined' && typeof searchCountries !== 'undefined') {
        setupAutocomplete(companyCountriesInput, COUNTRIES, searchCountries, true);
        console.log('✅ Company Countries autocomplete initialized');
    }
    
    // ADD THESE: People Countries autocomplete
    const peopleCountriesInput = document.getElementById('people-countries');
    if (peopleCountriesInput && typeof COUNTRIES !== 'undefined' && typeof searchCountries !== 'undefined') {
        setupAutocomplete(peopleCountriesInput, COUNTRIES, searchCountries, true);
        console.log('✅ People Countries autocomplete initialized');
    }
}

console.log('People search.js (Surfe API v2) loaded successfully');

// After search completes
// await logActivity('people_search', `Found ${peopleCount} people`, peopleCount);
