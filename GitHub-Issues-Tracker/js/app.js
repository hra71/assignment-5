let allIssues = [];

// Initialize data
async function fetchIssues() {
    showLoading(true);
    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const result = await res.json();
        allIssues = result.data;
        updateStats();
        renderCards(allIssues);
    } catch (err) {
        console.error("Error fetching data", err);
    } finally {
        showLoading(false);
    }
}

function renderCards(issues) {
    const grid = document.getElementById('issuesGrid');
    grid.innerHTML = issues.map(issue => `
        <div class="card bg-base-100 shadow-xl cursor-pointer hover:scale-105 transition-transform 
            ${issue.status === 'open' ? 'border-t-4 border-green-500' : 'border-t-4 border-purple-500'}"
            onclick="viewDetails(${issue.id})">
            <div class="card-body p-5">
                <h2 class="card-title text-sm font-bold truncate">${issue.title}</h2>
                <p class="text-xs text-gray-500 line-clamp-2">${issue.description}</p>
                <div class="flex flex-wrap gap-1 my-2">
                    ${issue.labels.map(l => `<span class="badge badge-ghost text-[10px]">${l}</span>`).join('')}
                </div>
                <div class="text-[11px] mt-2">
                    <p><strong>Author:</strong> ${issue.author}</p>
                    <p><strong>Priority:</strong> ${issue.priority}</p>
                    <p class="text-gray-400 mt-1">${new Date(issue.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Challenge: Search Implementation
document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    showLoading(true);
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`);
    const result = await res.json();
    renderCards(result.data);
    showLoading(false);
});

function updateStats() {
    document.getElementById('openCount').innerText = allIssues.filter(i => i.status === 'open').length;
    document.getElementById('closedCount').innerText = allIssues.filter(i => i.status === 'closed').length;
}

function filterIssues(status) {
    // Update active tab styles
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
    document.getElementById(`tab-${status}`).classList.add('tab-active');

    if (status === 'all') renderCards(allIssues);
    else renderCards(allIssues.filter(i => i.status === status));
}

function showLoading(status) {
    document.getElementById('loading').style.display = status ? 'flex' : 'none';
}