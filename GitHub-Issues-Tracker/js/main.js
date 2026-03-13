let allIssues = [];
const issuesContainer = document.getElementById("issuesContainer");
const modal = document.getElementById("issueModal");

async function loadIssues() {
    try {
        const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        const json = await res.json();
        allIssues = json.data || json || [];
        
        updateTabCounts();
        render(allIssues);
    } catch (e) {
        console.error("Fetch Error:", e);
        issuesContainer.innerHTML = `<p class="col-span-full text-center py-20 text-gray-400">Failed to load issues. Please check your connection.</p>`;
    }
}

function updateTabCounts() {
    document.getElementById("countAll").innerText = allIssues.length;
    document.getElementById("countOpen").innerText = allIssues.filter(i => i.status === 'open').length;
    document.getElementById("countClosed").innerText = allIssues.filter(i => i.status === 'closed').length;
    document.getElementById("headerIconCount").innerText = allIssues.length;
}

function getPriorityStyle(p) {
    const s = { 
        'HIGH': 'bg-red-100 text-red-600', 
        'MEDIUM': 'bg-yellow-100 text-yellow-700', // Yellow
        'LOW': 'bg-gray-200 text-gray-600'          // Grey
    };
    return s[(p || 'LOW').toUpperCase()] || 'bg-gray-100 text-gray-500';
}

function getLabelMarkup(labels) {
    if (!labels || labels.length === 0) return "";
    // Uniform Orange Labels as requested
    const orangeStyle = "bg-orange-50 text-orange-600 border-orange-100";
    return labels.map(l => `<span class="px-2 py-1 text-[9px] font-bold border rounded-full uppercase ${orangeStyle}">${l}</span>`).join('');
}

function render(issues) {
    issuesContainer.innerHTML = "";
    
    issues.forEach(issue => {
        const card = document.createElement("div");
        
        // Dynamic border color based on status: Green for Open, Purple for Closed
        const statusBorder = issue.status === 'open' ? 'border-green-400' : 'border-purple-400';
        const statusIconColor = issue.status === 'open' ? 'text-green-500' : 'text-purple-500';
        
        card.className = `bg-white p-6 rounded-2xl border-t-4 ${statusBorder} shadow-sm hover:shadow-md transition-all cursor-pointer border-x border-b border-gray-100`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="${statusIconColor}">
                    ${issue.status === 'open' ? '🔄' : '✅'}
                </span>
                <span class="text-[9px] font-bold px-2 py-1 rounded uppercase ${getPriorityStyle(issue.priority)}">${issue.priority || 'LOW'}</span>
            </div>
            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 h-12">${issue.title}</h3>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${issue.description || 'No description provided.'}</p>
            
            <div class="flex flex-wrap gap-2 mb-6 h-12 overflow-hidden">${getLabelMarkup(issue.labels)}</div>

            <div class="space-y-3 text-[10px] border-t pt-4">
                <div class="flex justify-between items-center uppercase tracking-wider text-gray-400">
                    <span>Status</span>
                    <span class="px-2 py-0.5 rounded ${issue.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'} font-bold">${issue.status}</span>
                </div>
                <div class="flex justify-between items-center uppercase tracking-wider text-gray-400">
                    <span>Author</span>
                    <span class="text-gray-700 font-bold">${issue.author}</span>
                </div>
                <div class="flex justify-between items-center uppercase tracking-wider text-gray-400">
                    <span>Created</span>
                    <span class="text-gray-700 font-bold">${new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        card.onclick = () => {
            document.getElementById("modalTitle").innerText = issue.title;
            document.getElementById("modalAuthor").innerText = issue.author;
            document.getElementById("modalDate").innerText = new Date(issue.createdAt).toLocaleDateString();
            document.getElementById("modalDesc").innerText = issue.description || "No detailed description provided.";
            document.getElementById("modalAssignee").innerText = issue.assignee || "Unassigned";
            
            const p = document.getElementById("modalPriority");
            p.innerText = issue.priority || "LOW";
            p.className = `inline-block px-2 py-1 rounded text-[10px] font-bold uppercase mt-1 ${getPriorityStyle(issue.priority)}`;
            
            const s = document.getElementById("modalStatusBadge");
            s.innerText = issue.status;
            s.className = `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`;
            
            document.getElementById("modalLabels").innerHTML = getLabelMarkup(issue.labels);
            modal.classList.remove("hidden");
        };
        
        issuesContainer.appendChild(card);
    });
}
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    
    // Filter the original list of issues
    const filtered = allIssues.filter(issue => 
        issue.title.toLowerCase().includes(term) || 
        issue.description.toLowerCase().includes(term)
    );
    
    // Render the filtered results
    render(filtered);
});

// Logic for tabs and close button
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
        tab.classList.add('tab-active');
        
        const status = tab.dataset.status;
        document.getElementById("headerStatusText").innerText = status.charAt(0).toUpperCase() + status.slice(1);
        
        const filtered = status === 'all' ? allIssues : allIssues.filter(i => i.status === status);
        render(filtered);
    };
});

window.addEventListener('DOMContentLoaded', loadIssues);
// Add this logic to your main.js
document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        // 1. UI: Toggle Active Class
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
        tab.classList.add('tab-active');
        
        const status = tab.dataset.status;
        
        // 2. Filter the data
        const filteredIssues = status === 'all' 
            ? allIssues 
            : allIssues.filter(i => i.status === status);
        
        // 3. Update the Header Text (e.g., "Open Issues")
        const headerTitle = document.querySelector('h2.text-xl');
        if (headerTitle) {
            headerTitle.innerHTML = `${status.charAt(0).toUpperCase() + status.slice(1)} Issues`;
        }

        // 4. Update the Square Header Icon Count
        const headerIconCount = document.getElementById("headerIconCount");
        if (headerIconCount) {
            headerIconCount.innerText = filteredIssues.length;
        }
        
        // 5. Render the filtered cards
        render(filteredIssues);
    };
});