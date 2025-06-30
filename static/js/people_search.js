// people_search.js - Enhanced People Search Functionality

let currentResults = [];
let currentSearchParams = null;
let nextPageToken = null;

// Create people search page content
function createPeopleSearchPage() {
    return `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">People Search</h1>
                <p class="text-gray-600">Find professionals based on departments, seniorities, and other criteria.</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <form id="people-search-form" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Departments -->
                        <div class="autocomplete-container">
                            <label for="departments" class="block text-sm font-medium text-gray-700 mb-2">
                                Departments <span class="text-gray-500">(select one or more)</span>
                            </label>
                            <input type="text" id="departments"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Type to search departments... (e.g. Marketing, Sales)">
                        </div>

                        <!-- Seniorities -->
                        <div class="autocomplete-container">
                            <label for="seniorities" class="block text-sm font-medium text-gray-700 mb-2">
                                Seniorities <span class="text-gray-500">(select one or more)</span>
                            </label>
                            <input type="text" id="seniorities"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Type to search seniorities... (e.g. Manager, Director)">
                        </div>
                    </div>

                    <div>
                        <label for="limit" class="block text-sm font-medium text-gray-700 mb-2">Results Limit</label>
                        <input type="number" id="limit" value="10" min="1" max="200"
                            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <button type="submit"
                        class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                        🔍 Search People
                    </button>
                </form>
            </div>

            <!-- Loading -->
            <div id="loading" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Searching people...</p>
            </div>

            <!-- Results -->
            <div id="results-container"></div>
        </div>
    `;
}

// Display search results
function displayResults(data) {
    const container = document.getElementById('results-container');

    if (!data || !data.people || data.people.length === 0) {
        container.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <p class="text-gray-600">No people found. Try different filters.</p>
            </div>
        `;
        return;
    }

    currentResults = data.people;

    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Found ${data.people.length} People</h2>
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
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seniority</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.people.map((person, index) => `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">${person.firstName || ''} ${person.lastName || ''}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${person.jobTitle || 'N/A'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${person.department || 'N/A'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${person.seniority || 'N/A'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">${person.companyName || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Download CSV of current results
function downloadCSV() {
    if (currentResults.length === 0) {
        alert('No data to download');
        return;
    }

    const headers = ['First Name', 'Last Name', 'Title', 'Department', 'Seniority', 'Company'];
    const csvContent = [
        headers.join(','),
        ...currentResults.map(person => [
            `"${(person.firstName || '').replace(/"/g, '""')}"`,
            `"${(person.lastName || '').replace(/"/g, '""')}"`,
            `"${(person.jobTitle || 'N/A').replace(/"/g, '""')}"`,
            `"${(person.department || 'N/A').replace(/"/g, '""')}"`,
            `"${(person.seniority || 'N/A').replace(/"/g, '""')}"`,
            `"${(person.companyName || 'N/A').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `people_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Load next page of results
async function loadNextPage() {
    if (!nextPageToken || !currentSearchParams) {
        alert('No more pages available');
        return;
    }

    const payload = { ...currentSearchParams };
    payload.pageToken = nextPageToken;

    showLoading();
    const response = await makeRequest('/api/v2/people/search', 'POST', payload);
    hideLoading();

    if (response.success) {
        nextPageToken = response.data.nextPageToken || null;

        if (response.data.people && response.data.people.length > 0) {
            currentResults = [...currentResults, ...response.data.people];
            displayResults({ people: currentResults });
        } else {
            alert('No more results available');
        }
    } else {
        showError(response.detail);
    }
}

// Show loading indicator
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results-container').innerHTML = '';
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Show error message
function showError(error) {
    document.getElementById('results-container').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 class="text-red-800 font-semibold mb-2">Error</h3>
            <p class="text-red-700">${JSON.stringify(error, null, 2)}</p>
        </div>
    `;
}

// Initialize people search functionality
function initPeopleSearch() {
    initializeAutocompleteForPage('people-search');

    const form = document.getElementById('people-search-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const filters = {};

            // Departments
            const departmentsInput = document.getElementById('departments').value;
            if (departmentsInput) {
                filters.departments = departmentsInput.split(',').map(s => s.trim()).filter(s => s);
            }

            // Seniorities
            const senioritiesInput = document.getElementById('seniorities').value;
            if (senioritiesInput) {
                filters.seniorities = senioritiesInput.split(',').map(s => s.trim()).filter(s => s);
            }

            const payload = {
                limit: parseInt(document.getElementById('limit').value) || 10,
                pageToken: '',
                peoplePerCompany: 1,
                companies: {},
                people: filters
            };

            currentSearchParams = { ...payload };

            showLoading();
            const response = await makeRequest('/api/v2/people/search', 'POST', payload);
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

console.log('People search.js loaded successfully');
</create_file>
