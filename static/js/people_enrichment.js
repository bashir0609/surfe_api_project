// people_enrichment.js - Updated for Surfe API v2 Enrichment

let pollInterval;
let csvPeople = []; // To store people data parsed from CSV
let manualPeopleList = []; // To store people added via manual form input

// Function to create the HTML content for the enrichment page
function createEnrichmentPage() {
    return `
        <div class="max-w-4xl mx-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Bulk People Enrichment</h1>
                <p class="text-gray-600">Enrich a list of people (by name/company or LinkedIn URL) to get their contact details.</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <form id="api-form">
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Choose Input Method</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center">
                                <input type="radio" name="input-method" value="manual" checked 
                                       class="mr-2 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm">Manual Form Input</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="input-method" value="csv" 
                                       class="mr-2 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm">CSV Upload</span>
                            </label>
                        </div>
                    </div>

                    <div id="manual-input" class="mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="first-name" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" id="first-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="John">
                            </div>
                            <div>
                                <label for="last-name" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" id="last-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Doe">
                            </div>
                            <div>
                                <label for="company-name" class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input type="text" id="company-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Google">
                            </div>
                            <div>
                                <label for="company-domain" class="block text-sm font-medium text-gray-700 mb-1">Company Domain (Optional)</label>
                                <input type="text" id="company-domain" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="google.com">
                            </div>
                            <div class="md:col-span-2">
                                <label for="linkedin-url" class="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (Optional)</label>
                                <input type="url" id="linkedin-url" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://www.linkedin.com/in/john-doe">
                            </div>
                            <div class="md:col-span-2">
                                <label for="external-id" class="block text-sm font-medium text-gray-700 mb-1">External ID (Optional)</label>
                                <input type="text" id="external-id" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="user_123">
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mb-3">Provide LinkedIn URL OR First Name, Last Name, and Company Name.</p>
                        <button type="button" id="add-person-btn" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mr-2">
                            Add Person to List
                        </button>
                        <button type="button" id="clear-manual-list-btn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">
                            Clear List
                        </button>

                        <div id="manual-list-preview" class="mt-6 border-t border-gray-200 pt-4">
                            <h4 class="text-md font-semibold text-gray-800 mb-2">People to Enrich (<span id="manual-list-count">0</span>)</h4>
                            <div id="manual-list-items" class="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
                                <p class="text-sm text-gray-500" id="manual-list-placeholder">No people added yet.</p>
                            </div>
                        </div>
                    </div>

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
                            <p class="font-medium mb-1">CSV Format Requirements (requires at least one of):</p>
                            <ul class="list-disc list-inside space-y-1">
                                <li>"firstName", "lastName", "companyName" columns</li>
                                <li>"linkedinUrl" column</li>
                                <li>Optional: "companyDomain", "externalID"</li>
                            </ul>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">⚙️ Enrichment Options</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Include Fields:</label>
                                <div class="flex flex-col space-y-2">
                                    <label class="inline-flex items-center">
                                        <input type="checkbox" id="include-email" checked class="form-checkbox text-indigo-600">
                                        <span class="ml-2 text-sm text-gray-900">Email</span>
                                    </label>
                                    <label class="inline-flex items-center">
                                        <input type="checkbox" id="include-mobile" class="form-checkbox text-indigo-600">
                                        <span class="ml-2 text-sm text-gray-900">Mobile Phone</span>
                                    </label>
                                    <label class="inline-flex items-center">
                                        <input type="checkbox" id="include-linkedin" class="form-checkbox text-indigo-600">
                                        <span class="ml-2 text-sm text-gray-900">LinkedIn URL (fetch if not provided)</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label for="webhook-url" class="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
                                <input type="url" id="webhook-url" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="https://your.webhook.url">
                                <p class="text-xs text-gray-500 mt-1">Results can be sent here when ready.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 font-medium">
                        🚀 Start Enrichment
                    </button>
                </form>
            </div>

            <div id="status-container" class="mb-8 hidden">
                <h2 class="text-xl font-semibold mb-4 text-gray-900">Enrichment Status</h2>
                <div id="job-status" class="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
                    <div class="flex items-center">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                        <span>Initializing...</span>
                    </div>
                </div>
            </div>

            <div id="loading-indicator" class="hidden text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Starting enrichment job...</p>
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

// Initialization function for the page
function initEnrichment() {
    // Input method switching logic
    const inputMethods = document.querySelectorAll('input[name="input-method"]');
    const manualInputDiv = document.getElementById('manual-input');
    const csvInputDiv = document.getElementById('csv-upload-input');
    
    // Set initial visibility based on checked radio button
    if (document.querySelector('input[name="input-method"]:checked').value === 'manual') {
        manualInputDiv.classList.remove('hidden');
        csvInputDiv.classList.add('hidden');
    } else {
        manualInputDiv.classList.add('hidden');
        csvInputDiv.classList.remove('hidden');
    }

    inputMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            manualInputDiv.classList.add('hidden');
            csvInputDiv.classList.add('hidden');
            
            if (e.target.value === 'manual') {
                manualInputDiv.classList.remove('hidden');
            } else if (e.target.value === 'csv') {
                csvInputDiv.classList.remove('hidden');
            }
            hideError(); // Clear previous errors when switching input methods
        });
    });

    // Manual input form elements
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const companyNameInput = document.getElementById('company-name');
    const companyDomainInput = document.getElementById('company-domain');
    const linkedinUrlInput = document.getElementById('linkedin-url');
    const externalIdInput = document.getElementById('external-id');
    const addPersonBtn = document.getElementById('add-person-btn');
    const clearManualListBtn = document.getElementById('clear-manual-list-btn');
    const manualListItemsDiv = document.getElementById('manual-list-items');
    const manualListCountSpan = document.getElementById('manual-list-count');
    const manualListPlaceholder = document.getElementById('manual-list-placeholder');

    const updateManualListDisplay = () => {
        manualListCountSpan.textContent = manualPeopleList.length;
        manualListItemsDiv.innerHTML = ''; // Clear existing display
        if (manualPeopleList.length === 0) {
            manualListItemsDiv.appendChild(manualListPlaceholder);
            manualListPlaceholder.classList.remove('hidden');
        } else {
            manualListPlaceholder.classList.add('hidden');
            manualPeopleList.forEach((person, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex justify-between items-center bg-white p-2 rounded-md shadow-sm border border-gray-200 text-sm';
                let displayHtml = '';
                if (person.linkedinUrl) {
                    displayHtml = `<a href="${person.linkedinUrl}" target="_blank" class="text-blue-600 hover:underline">LinkedIn Profile</a>`;
                } else if (person.firstName && person.lastName) {
                    displayHtml += `<strong>${person.firstName} ${person.lastName}</strong>`;
                    if (person.companyName) {
                        displayHtml += ` at ${person.companyName}`;
                    }
                } else {
                    displayHtml = 'Invalid Entry'; // Fallback for invalid items that somehow got added
                }
                
                itemDiv.innerHTML = `
                    <span>${displayHtml}</span>
                    <button type="button" data-index="${index}" class="remove-person-btn text-red-500 hover:text-red-700 ml-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 5a1 1 0 100 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path></svg>
                    </button>
                `;
                manualListItemsDiv.appendChild(itemDiv);
            });

            // Add event listeners for new remove buttons
            manualListItemsDiv.querySelectorAll('.remove-person-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const indexToRemove = parseInt(e.currentTarget.dataset.index);
                    manualPeopleList.splice(indexToRemove, 1);
                    updateManualListDisplay();
                    showTemporaryMessage('🗑️ Person removed from list.', 'info');
                });
            });
        }
    };

    addPersonBtn.addEventListener('click', () => {
        hideError();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const companyName = companyNameInput.value.trim();
        const companyDomain = companyDomainInput.value.trim();
        const linkedinUrl = linkedinUrlInput.value.trim();
        const externalID = externalIdInput.value.trim();

        let person = {};
        if (linkedinUrl) {
            person.linkedinUrl = linkedinUrl;
        } else if (firstName && lastName && companyName) {
            person.firstName = firstName;
            person.lastName = lastName;
            person.companyName = companyName;
        } else {
            showError("Please provide a LinkedIn URL OR First Name, Last Name, and Company Name for the person.");
            return;
        }

        if (companyDomain) person.companyDomain = companyDomain;
        if (externalID) person.externalID = externalID;

        manualPeopleList.push(person);
        updateManualListDisplay();
        showTemporaryMessage('➕ Person added to list!', 'success');

        // Clear input fields for next entry
        firstNameInput.value = '';
        lastNameInput.value = '';
        companyNameInput.value = '';
        companyDomainInput.value = '';
        linkedinUrlInput.value = '';
        externalIdInput.value = '';
    });

    clearManualListBtn.addEventListener('click', () => {
        manualPeopleList = [];
        updateManualListDisplay();
        showTemporaryMessage('🗑️ Manual list cleared.', 'info');
    });

    updateManualListDisplay(); // Initial display update


    // Form submission logic
    const form = document.getElementById('api-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        hideError();
        document.getElementById('status-container').classList.add('hidden');
        document.getElementById('results-container').innerHTML = '';
        
        let peopleDataForAPI = [];
        const selectedMethod = document.querySelector('input[name="input-method"]:checked').value;
        
        switch(selectedMethod) {
            case 'manual':
                peopleDataForAPI = [...manualPeopleList];
                break;
            case 'csv':
                peopleDataForAPI = [...csvPeople]; // Use data parsed from CSV
                break;
        }
            
        if (peopleDataForAPI.length === 0) {
            showError("Please add people using the form or upload a CSV file for enrichment.");
            return;
        }

        if (peopleDataForAPI.length > 10000) { // Max 10000 per API spec
            showError(`Too many people (${peopleDataForAPI.length}). Maximum 10000 allowed per batch.`);
            return;
        }
        
        // Final validation before sending to API
        const invalidEntries = peopleDataForAPI.filter(p => !p.linkedinUrl && (!p.firstName || !p.lastName || !p.companyName));
        if (invalidEntries.length > 0) {
            showError(`Some entries are invalid. Each person needs 'linkedinUrl' OR ('firstName', 'lastName', and 'companyName'). Found ${invalidEntries.length} invalid entries.`);
            return;
        }

        // Construct the V2 API payload
        const includeEmail = document.getElementById('include-email').checked;
        const includeMobile = document.getElementById('include-mobile').checked;
        const includeLinkedInUrl = document.getElementById('include-linkedin').checked;
        const webhookUrl = document.getElementById('webhook-url').value.trim();

        const enrichmentInclude = {};
        if (includeEmail) enrichmentInclude.email = true;
        if (includeMobile) enrichmentInclude.mobile = true;
        if (includeLinkedInUrl) enrichmentInclude.linkedInUrl = true;

        if (Object.keys(enrichmentInclude).length === 0) {
            showError("At least one field (Email, Mobile Phone, or LinkedIn URL) must be selected to include in enrichment.");
            return;
        }

        const payload = {
            people: peopleDataForAPI,
            include: enrichmentInclude
        };

        if (webhookUrl) {
            payload.notificationOptions = { webhookUrl: webhookUrl };
        }
        
        showLoading('loading-indicator');
        // Call the local backend's v2 enrichment endpoint
        const startResponse = await makeRequest('/api/v2/people/enrich', 'POST', payload); 
        hideLoading('loading-indicator');
        
        if (startResponse.job_id) {
            document.getElementById('status-container').classList.remove('hidden');
            pollForStatus(startResponse.job_id);
        } else {
            // Check for a 'detail' field as FastAPI errors often put messages there
            showError(startResponse.detail?.error || startResponse.detail || 'Failed to start enrichment job. Check console for details.');
        }
    });
}

// CSV handling functions
function handleCSVUpload(input) {
    const file = input.files[0];
    console.log('handleCSVUpload triggered. File:', file); // Debugging
    if (!file) {
        showTemporaryMessage('No file selected.', 'info');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        console.log('File content loaded. Attempting to parse CSV...'); // Debugging
        try {
            const people = parseCSVForPeople(content); 
            if (people.length > 0) {
                csvPeople = people;
                showCSVPreview(people, file.name);
                showTemporaryMessage(`✅ Loaded ${people.length} people from CSV.`, 'success');
            } else {
                showError('No valid people data found in CSV file. Please check the format and headers (e.g., "firstName", "lastName", "companyName", "linkedinUrl").');
                clearCSV(); // Clear the file input if parsing fails
            }
        } catch (parseError) {
            showError(`Error parsing CSV: ${parseError.message}. Ensure it's a valid CSV format.`);
            console.error('CSV Parsing Error:', parseError); // Debugging
            clearCSV();
        }
    };
    
    reader.onerror = function() {
        showError('Error reading CSV file.');
        console.error('FileReader Error:', reader.error); // Debugging
        clearCSV();
    };
    
    reader.readAsText(file);
}

function parseCSVForPeople(content) {
    const people = [];
    const lines = content.split(/[\r\n]+/).filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    // Parse headers and normalize them
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('Raw CSV Headers:', rawHeaders);
    
    // Create a mapping of normalized headers to original headers
    const headerMap = {};
    const normalizeHeader = (header) => {
        return header.toLowerCase()
            .replace(/[^a-z0-9]/g, '') // Remove spaces, special characters
            .replace(/^(first|last)name$/, '$1Name') // Handle firstName/lastName
            .replace(/^companyname$/, 'companyName')
            .replace(/^companydomain$/, 'companyDomain')
            .replace(/^linkedinurl$/, 'linkedinUrl')
            .replace(/^externalid$/, 'externalID');
    };
    
    // Map common header variations to standard names
    const headerVariations = {
        // First Name variations
        'firstname': 'firstName',
        'first_name': 'firstName', 
        'fname': 'firstName',
        'given_name': 'firstName',
        
        // Last Name variations  
        'lastname': 'lastName',
        'last_name': 'lastName',
        'lname': 'lastName',
        'surname': 'lastName',
        'family_name': 'lastName',
        
        // Company Name variations
        'companyname': 'companyName',
        'company_name': 'companyName',
        'company': 'companyName',
        'organization': 'companyName',
        'org': 'companyName',
        
        // Company Domain variations
        'companydomain': 'companyDomain',
        'company_domain': 'companyDomain',
        'domain': 'companyDomain',
        'website': 'companyDomain',
        
        // LinkedIn URL variations
        'linkedinurl': 'linkedinUrl',
        'linkedin_url': 'linkedinUrl',
        'linkedin': 'linkedinUrl',
        'profile_url': 'linkedinUrl',
        'profile': 'linkedinUrl',
        
        // External ID variations
        'externalid': 'externalID',
        'external_id': 'externalID',
        'id': 'externalID',
        'user_id': 'externalID',
        'userid': 'externalID'
    };
    
    // Build the header mapping
    rawHeaders.forEach((header, index) => {
        const normalized = normalizeHeader(header);
        const standardName = headerVariations[normalized] || normalized;
        headerMap[standardName] = index;
        console.log(`Header mapping: "${header}" -> "${standardName}" (index ${index})`);
    });
    
    console.log('Final header mapping:', headerMap);
    
    // Find required field indices
    const firstNameIdx = headerMap['firstName'];
    const lastNameIdx = headerMap['lastName'];
    const companyNameIdx = headerMap['companyName'];
    const companyDomainIdx = headerMap['companyDomain'];
    const linkedinUrlIdx = headerMap['linkedinUrl'];
    const externalIDIdx = headerMap['externalID'];
    
    console.log('Field indices:', {
        firstName: firstNameIdx,
        lastName: lastNameIdx,
        companyName: companyNameIdx,
        companyDomain: companyDomainIdx,
        linkedinUrl: linkedinUrlIdx,
        externalID: externalIDIdx
    });
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        if (columns.length === 0) continue;
        
        let person = {};
        let isValidRow = false;

        // Check for LinkedIn URL first
        if (linkedinUrlIdx !== undefined && columns[linkedinUrlIdx]?.trim()) {
            person.linkedinUrl = columns[linkedinUrlIdx].trim();
            isValidRow = true;
            console.log(`Row ${i}: Found LinkedIn URL: ${person.linkedinUrl}`);
        } 
        // Check for name + company combination
        else if (firstNameIdx !== undefined && lastNameIdx !== undefined && companyNameIdx !== undefined &&
                 columns[firstNameIdx]?.trim() && columns[lastNameIdx]?.trim() && columns[companyNameIdx]?.trim()) {
            person.firstName = columns[firstNameIdx].trim();
            person.lastName = columns[lastNameIdx].trim();
            person.companyName = columns[companyNameIdx].trim();
            isValidRow = true;
            console.log(`Row ${i}: Found name/company: ${person.firstName} ${person.lastName} at ${person.companyName}`);
        }
        
        if (!isValidRow) {
            console.warn(`Row ${i}: Skipping invalid row - missing required data`);
            continue;
        }

        // Add optional fields if they exist
        if (companyDomainIdx !== undefined && columns[companyDomainIdx]?.trim()) {
            person.companyDomain = columns[companyDomainIdx].trim();
        }
        if (externalIDIdx !== undefined && columns[externalIDIdx]?.trim()) {
            person.externalID = columns[externalIDIdx].trim();
        }
        
        people.push(person);
    }
    
    console.log(`Parsed ${people.length} valid people from CSV`);
    return people;
}

// Helper function to parse a CSV line, handling commas within quoted fields
function parseCSVLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] === ',' || inQuote)) { // Handle escaped quotes properly
            inQuote = !inQuote;
            // If it's an escaped quote within a field, keep it
            if (i > 0 && line[i-1] === '"' && i + 1 < line.length && line[i+1] === '"') {
                 currentField += char;
                 i++; // Skip the next quote as it's part of the escape
                 continue;
            }
        } else if (char === ',' && !inQuote) {
            result.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField); // Add the last field
    return result.map(field => field.replace(/^"|"$/g, '').trim()); // Trim and remove outer quotes
}


function showCSVPreview(people, filename) {
    const preview = document.getElementById('csv-preview');
    const info = document.getElementById('csv-info');
    
    info.innerHTML = `
        <div><strong>File:</strong> ${filename}</div>
        <div><strong>Valid people entries found:</strong> ${people.length}</div>
        <div><strong>Supported header formats:</strong></div>
        <div class="text-xs text-gray-600 mt-1">
            ✅ firstName, First Name, first_name, fname<br>
            ✅ lastName, Last Name, last_name, surname<br>
            ✅ companyName, Company Name, company, organization<br>
            ✅ linkedinUrl, LinkedIn URL, linkedin, profile<br>
            ✅ companyDomain, Company Domain, domain, website<br>
            ✅ externalID, External ID, id, user_id
        </div>
        <div class="mt-2"><strong>Preview (first 2 entries):</strong></div>
        <pre class="bg-gray-50 p-2 rounded text-xs mt-1 overflow-auto max-h-24">${JSON.stringify(people.slice(0, 2), null, 2)}</pre>
    `;
    
    preview.classList.remove('hidden');
}

function clearCSV() {
    csvPeople = [];
    // Reset the file input itself
    document.getElementById('csv-file').value = ''; 
    
    document.getElementById('csv-preview').classList.add('hidden');
    showTemporaryMessage('🗑️ Cleared CSV data', 'info');
}

// Poll for job status - FIXED to use correct V2 endpoint
async function pollForStatus(jobId) {
    const statusDiv = document.getElementById('job-status');
    
    statusDiv.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span>Job <code class="font-mono bg-blue-100 px-2 py-1 rounded text-sm">${jobId}</code> started. Status: <strong>PENDING</strong></span>
        </div>
    `;
    
    pollInterval = setInterval(async () => {
        // FIXED: Use V2 endpoint to match backend
        const statusResponse = await makeRequest(`/api/v2/people/enrich/status/${jobId}`, 'GET');
        
        // Check for error response
        if (statusResponse.error || !statusResponse.job_id) {
            statusDiv.innerHTML = `
                <div class="flex items-center text-red-600">
                    <span>❌ Error checking status for job <code class="font-mono bg-red-100 px-2 py-1 rounded text-sm">${jobId}</code>. ${statusResponse.error || 'Unknown error'}</span>
                </div>
            `;
            clearInterval(pollInterval);
            console.error("Error fetching job status:", statusResponse);
            return;
        }
        
        // Access status and result directly from statusResponse
        const jobStatus = statusResponse.status?.toUpperCase(); 
        const jobResult = statusResponse.result;

        const isProcessing = ['PENDING', 'RUNNING', 'IN_PROGRESS'].includes(jobStatus);
        
        statusDiv.innerHTML = `
            <div class="flex items-center ${isProcessing ? 'text-blue-600' : 'text-green-600'}">
                ${isProcessing ? '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>' : '<span class="mr-3">✅</span>'}
                <span>Job <code class="font-mono bg-gray-100 px-2 py-1 rounded text-sm">${jobId}</code> - Status: <strong>${jobStatus}</strong></span>
            </div>
        `;
        
        if (!isProcessing) {
            clearInterval(pollInterval);
            
            if (['COMPLETED', 'PARTIALLY_COMPLETED'].includes(jobStatus)) {
                displayResults(jobResult); // Pass jobResult (which is the actual Surfe API response)
            } else {
                showError(`Job failed or timed out. Status: ${jobStatus}`);
                if (jobResult) {
                    displayResults(jobResult); // Display partial results or error info
                }
            }
        }
    }, 3000); // Poll every 3 seconds
}

// Display enrichment results in a table
function displayResults(data) {
    const container = document.getElementById('results-container');
    
    // The API response for status check returns the enrichment data directly under 'people'
    if (!data || !data.people || data.people.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-8 text-center">
                <p class="text-gray-500">No enrichment results returned for these inputs.</p>
                ${data.error ? `<pre class="mt-4 p-3 bg-red-100 text-xs text-red-700 overflow-auto rounded">${JSON.stringify(data.error, null, 2)}</pre>` : ''}
            </div>
        `;
        return;
    }

    // Log activity to dashboard
    if (data && data.people && data.people.length > 0) {
        logActivity('people_enrichment', `Enriched ${data.people.length} people`, data.people.length);
    }
    
    // Store results for CSV download
    csvPeople = data.people;

    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Enrichment Results (${data.people.length})</h2>
                <button onclick="downloadEnrichmentCSV()" 
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center">
                    📥 Download CSV
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company & Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.people.map((person, index) => `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${person.firstName || ''} ${person.lastName || ''}</div>
                                    ${person.externalID ? `<div class="text-xs text-gray-500">ID: ${person.externalID}</div>` : ''}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">Email: ${person.emails?.[0]?.email || 'N/A'}</div>
                                    <div class="text-sm text-gray-900">Phone: ${person.mobilePhones?.[0]?.mobilePhone || 'N/A'}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900">${person.companyName || 'N/A'}</div>
                                    ${person.companyDomain ? `<div class="text-xs text-gray-500">${person.companyDomain}</div>` : ''}
                                    <div class="text-sm text-gray-600 mt-1">${person.jobTitle || 'N/A'}</div>
                                    ${person.seniorities && person.seniorities.length > 0 ? 
                                        `<div class="flex flex-wrap gap-1 mt-1">
                                            ${person.seniorities.map(s => `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${s}</span>`).join('')}
                                        </div>` : ''}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">Country: ${person.country || 'N/A'}</div>
                                    <div class="text-sm text-gray-900">Location: ${person.location || 'N/A'}</div>
                                    ${person.departments && person.departments.length > 0 ? 
                                        `<div class="flex flex-wrap gap-1 mt-1">
                                            ${person.departments.map(d => `<span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${d}</span>`).join('')}
                                        </div>` : ''}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    ${person.linkedInUrl ? 
                                        `<a href="${person.linkedInUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Profile</a>`
                                        : '<span class="text-gray-400 text-sm">N/A</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex justify-between items-center text-sm text-gray-600">
                    <span>Showing ${data.people.length} enriched people</span>
                    <span class="text-green-600">✅ Enrichment completed</span>
                </div>
            </div>
        </div>
    `;
}

// Download enriched people data as CSV
function downloadEnrichmentCSV() {
    if (csvPeople.length === 0) { // csvPeople is now used to store both manual and CSV parsed data for download
        alert('No data to download.');
        return;
    }

    const headers = [
        'External ID', 'First Name', 'Last Name', 'Email', 'Mobile Phone', 
        'Job Title', 'Seniorities', 'Departments', 'Company Name', 'Company Domain', 
        'Country', 'Location', 'LinkedIn URL'
    ];
    
    const csvContent = [
        headers.join(','),
        ...csvPeople.map(person => {
            const email = person.emails?.[0]?.email || '';
            const mobilePhone = person.mobilePhones?.[0]?.mobilePhone || '';
            const seniorities = person.seniorities?.join('; ') || '';
            const departments = person.departments?.join('; ') || '';

            return [
                `"${(person.externalID || '').replace(/"/g, '""')}"`,
                `"${(person.firstName || '').replace(/"/g, '""')}"`,
                `"${(person.lastName || '').replace(/"/g, '""')}"`,
                `"${email.replace(/"/g, '""')}"`,
                `"${mobilePhone.replace(/"/g, '""')}"`,
                `"${(person.jobTitle || '').replace(/"/g, '""')}"`,
                `"${seniorities.replace(/"/g, '""')}"`,
                `"${departments.replace(/"/g, '""')}"`,
                `"${(person.companyName || '').replace(/"/g, '""')}"`,
                `"${(person.companyDomain || '').replace(/"/g, '""')}"`,
                `"${(person.country || '').replace(/"/g, '""')}"`,
                `"${(person.location || '').replace(/"/g, '""')}"`,
                `"${(person.linkedInUrl || '').replace(/"/g, '""')}"`
            ].join(',');
        })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `surfe_people_enrichment_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Helper to show temporary messages (reused from shared.js, but explicitly defined for scope)
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
// After job completes successfully
// await logActivity('people_enrichment', `Enriched ${resultsCount} people`, resultsCount);