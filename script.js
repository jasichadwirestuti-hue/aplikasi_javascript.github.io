const appKey = "proplanUnifiedData";
let taskChart = null;

document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    renderApp();
});

// Navigasi Terpadu
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';

    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    document.getElementById(pageId === 'page-dashboard' ? 'link-dashboard' : 'link-projects').classList.add('active');
}

function updateGreeting() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function openModal() { document.getElementById("taskModal").style.display = "block"; }
function closeModal() { document.getElementById("taskModal").style.display = "none"; }

// Simpan Data Terpadu
function saveData() {
    const name = document.getElementById("mTitle").value.trim();
    if (!name) return alert("Masukan judul misi!");

    const tasks = JSON.parse(localStorage.getItem(appKey)) || [];
    tasks.push({
        id: Date.now(),
        name,
        category: document.getElementById("mCat").value,
        priority: document.getElementById("mPrio").value,
        progress: 0,
        status: "Active"
    });

    localStorage.setItem(appKey, JSON.stringify(tasks));
    closeModal();
    renderApp();
}

function setDone(id) {
    const tasks = JSON.parse(localStorage.getItem(appKey));
    const index = tasks.findIndex(t => t.id === id);
    tasks[index].status = "Completed";
    tasks[index].progress = 100; // Selesai otomatis 100%
    localStorage.setItem(appKey, JSON.stringify(tasks));
    renderApp();
}

function deleteData(id) {
    let tasks = JSON.parse(localStorage.getItem(appKey));
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem(appKey, JSON.stringify(tasks));
    renderApp();
}

// Rendering Dua Halaman Sekaligus
function renderApp(filter = "") {
    const tasks = JSON.parse(localStorage.getItem(appKey)) || [];
    const board = document.getElementById("taskList");
    const table = document.getElementById("projectTableBody");
    
    board.innerHTML = ""; table.innerHTML = "";

    tasks.forEach(t => {
        if (filter && !t.name.toLowerCase().includes(filter)) return;

        // 1. Render Ke Dashboard (Board Misi)
        if (t.status === "Active") {
            const li = document.createElement("li");
            li.className = `task-item prio-${t.priority.toLowerCase()}`;
            li.innerHTML = `
                <div><h4>${t.name}</h4><small>${t.category} | ${t.priority}</small></div>
                <div>
                    <button style="border:none; color:green; background:none; cursor:pointer;" onclick="setDone(${t.id})"><i class="fas fa-check-circle fa-lg"></i></button>
                    <button style="border:none; color:red; background:none; cursor:pointer;" onclick="deleteData(${t.id})"><i class="fas fa-trash-alt"></i></button>
                </div>`;
            board.appendChild(li);
        }

        // 2. Render Ke Halaman Project List (Table Detail)
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>${t.name}</b></td>
            <td style="color:#888">${t.category}</td>
            <td><span class="badge" style="background:${t.priority === 'High' ? '#ff4d4d' : '#4361ee'}; color:#fff">${t.priority}</span></td>
            <td>
                <div class="prog-container">
                    <div class="prog-bar"><div class="prog-fill" style="width:${t.progress}%"></div></div>
                    <span style="font-size:11px">${t.progress}%</span>
                </div>
            </td>
            <td><span class="badge ${t.status === 'Active' ? 'badge-active' : 'badge-done'}">${t.status}</span></td>
            <td><button style="border:none; background:none; color:red; cursor:pointer;" onclick="deleteData(${t.id})"><i class="fas fa-trash"></i></button></td>`;
        table.appendChild(row);
    });

    document.getElementById("activeCounter").innerText = `${tasks.filter(t => t.status === "Active").length} Misi Aktif`;
    updateChart();
}

function updateChart() {
    const tasks = JSON.parse(localStorage.getItem(appKey)) || [];
    const ctx = document.getElementById('taskChart').getContext('2d');
    const done = tasks.filter(t => t.status === 'Completed').length;
    const active = tasks.filter(t => t.status === 'Active').length;

    if (taskChart) taskChart.destroy();
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Done', 'Active'],
            datasets: [{ data: [done, active], backgroundColor: ['#4caf50','#4361ee'], borderWidth: 0 }]
        },
        options: { cutout: '75%', plugins: { legend: { position: 'bottom' } } }
    });
}