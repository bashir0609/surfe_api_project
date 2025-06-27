document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('api-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                domain: document.getElementById('domain').value,
                limit: parseInt(document.getElementById('limit').value)
            };
            showLoading();
            const response = await makeRequest('/api/v1/companies/lookalikes', 'POST', payload);
            hideLoading();
            if (response.success) {
                displayResults(response.data);
            } else {
                showError(response.detail);
            }
        });
    }
});

function displayResults(data) {
    const container = document.getElementById('results-container');
    if (!data || !data.companies || data.companies.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No lookalikes found for the given domain.</p>';
        return;
    }
    container.innerHTML = `<h2 class="text-xl font-semibold mb-4">Results (${data.companies.length})</h2><div class="results-grid">${data.companies.map(c => `<div class="result-card"><h3 class="font-bold text-lg text-gray-800">${c.name||'N/A'}</h3><p class="text-sm text-indigo-600 font-medium">${c.domain||''}</p><p class="mt-4 text-xs text-gray-500">Employees: <span class="font-semibold text-gray-700">${c.employeeCount||'N/A'}</span></p><p class="text-xs text-gray-500">Industries: <span class="font-semibold text-gray-700">${c.industries?.join(', ')||'N/A'}</span></p></div>`).join('')}</div>`;
}