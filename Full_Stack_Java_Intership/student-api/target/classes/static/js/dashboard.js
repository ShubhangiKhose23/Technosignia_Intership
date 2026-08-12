let originalStudentDataState = null;
let globalPieChartInstance = null;
let globalLineChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    let accessToken = sessionStorage.getItem("accessToken");
    let cachedRole = sessionStorage.getItem("userRole") || "ADMIN";
    let globalUsersCacheList = [];
    let userCurrentPage = 0;
    let userPageSize = 5;

    const dashboardCardsWrapper = document.getElementById('dashboardCardsWrapper');
    const dynamicTableBlock = document.getElementById('dynamicTableBlock');
    const studentModuleCardProfilePanel = document.getElementById('studentModuleCardProfilePanel');
    const dynamicTableBody = document.getElementById('dynamicTableBody');
    const adminStudentViewerSelector = document.getElementById('adminStudentViewerSelector');

    function initializeDynamicCharts(total, active, recent, branch) {
        if (globalPieChartInstance) globalPieChartInstance.destroy();
        if (globalLineChartInstance) globalLineChartInstance.destroy();

        const canvasPie = document.getElementById('smsPieChartCanvas');
        const canvasLine = document.getElementById('smsLineChartCanvas');
        if (!canvasPie || !canvasLine) return;

        globalPieChartInstance = new Chart(canvasPie.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Total Students', 'Active Live', 'Recently Added', 'Same Branch'],
                datasets: [{ data: [total, active, recent, branch], backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        globalLineChartInstance = new Chart(canvasLine.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM'],
                datasets: [{ label: 'Live Traffic Scale', data: [total, total+2, total+5, total+1, total+6, total+10], borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,0.06)' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    async function secureAuthorizedFetch(url, config = {}) {
        config.headers = config.headers || {};
        const currentToken = sessionStorage.getItem("accessToken");
        if (currentToken) {
            config.headers["Authorization"] = currentToken;
        }
        config.headers["Content-Type"] = "application/json";
        try { return await fetch(url, config); } catch (e) { return null; }
    }

    async function refreshAdminCounterMetrics() {
        try {
            const response = await secureAuthorizedFetch(`http://localhost:8081/api/students?searchName=&status=&page=0&size=1000&sortBy=name&requestUserId=0&requestUserRole=ADMIN`);
            if (response && response.ok) {
                const result = await response.json();
                let fullList = result.data || (Array.isArray(result) ? result : []);

                if (fullList.length >= 0) {
                    const totalVal = fullList.length;
                    const activeVal = fullList.filter(st => st.status && st.status.toUpperCase() === "ACTIVE").length;
                    const recentVal = fullList.length;
                    const branchVal = fullList.filter(st => st.course && st.course.toLowerCase().includes("python")).length;

                    if (document.getElementById('totalUsersCount')) document.getElementById('totalUsersCount').innerText = totalVal;
                    if (document.getElementById('activeSessionsCount')) document.getElementById('activeSessionsCount').innerText = activeVal;
                    if (document.getElementById('recentlyAddedCount')) document.getElementById('recentlyAddedCount').innerText = recentVal;
                    if (document.getElementById('sameBranchCount')) document.getElementById('sameBranchCount').innerText = branchVal;

                    initializeDynamicCharts(totalVal, activeVal, recentVal, branchVal);
                    return;
                }
            }
        } catch (err) { console.error(err); }
        initializeDynamicCharts(15, 10, 15, 6); // Mock data display fallback block
    }

    const clearActiveViewSectors = () => {
        ['menuDashboardTab', 'menuUserTab', 'menuStudentTab', 'menuAddStudentTab'].forEach(id => { const el = document.getElementById(id); if(el) el.classList.remove('active'); });
        [dashboardCardsWrapper, dynamicTableBlock, studentModuleCardProfilePanel].forEach(s => { if (s) s.style.display = 'none'; });
    };

    if (document.getElementById('menuDashboardTab')) document.getElementById('menuDashboardTab').addEventListener('click', (e) => { e.preventDefault(); clearActiveViewSectors(); document.getElementById('menuDashboardTab').classList.add('active'); if (dashboardCardsWrapper) dashboardCardsWrapper.style.display = "block"; refreshAdminCounterMetrics(); });
    if (document.getElementById('menuUserTab')) document.getElementById('menuUserTab').addEventListener('click', (e) => { e.preventDefault(); clearActiveViewSectors(); document.getElementById('menuUserTab').classList.add('active'); if (dynamicTableBlock) dynamicTableBlock.style.display = "block"; loadUserModuleGridRows(); });
    if (document.getElementById('menuStudentTab')) document.getElementById('menuStudentTab').addEventListener('click', (e) => { e.preventDefault(); clearActiveViewSectors(); document.getElementById('menuStudentTab').classList.add('active'); if (studentModuleCardProfilePanel) studentModuleCardProfilePanel.style.display = "block"; populateAdminStudentSelectorDropdown(); });

    async function loadUserModuleGridRows() {
        if (!dynamicTableBody) return;
        dynamicTableBody.innerHTML = "";
        try {
            const res = await secureAuthorizedFetch(`http://localhost:8081/api/students?page=${userCurrentPage}&size=${userPageSize}&sortBy=name&searchName=&status=&requestUserId=0&requestUserRole=ADMIN`);
            if (res && res.ok) {
                const json = await res.json();
                let list = json.data || (Array.isArray(json) ? json : []);
                if (list.length > 0) {
                    globalUsersCacheList = list;
                    list.forEach(user => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td><span style="color:#2563eb; font-weight:700;">#USR-${user.id}</span></td><td style="font-weight:600;">${user.name}</td><td>${user.email}</td><td>${user.mobile || '—'}</td><td><span style="color:#10b981;">ACTIVE</span></td><td style="text-align:center;"><button style="background:#2563eb; border:none; padding:6px 12px; color:#fff; border-radius:6px; cursor:pointer;">Edit</button></td>`;
                        dynamicTableBody.appendChild(tr);
                    });
                    return;
                }
            }
        } catch (err) {}
        dynamicTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:35px; color:#64748b;">🔍 No live server records fetched. Displaying template.</td></tr>`;
    }

    async function populateAdminStudentSelectorDropdown() {
        if (!adminStudentViewerSelector) return;
        adminStudentViewerSelector.innerHTML = `<option value="">-- Choose Target Student --</option>`;
        try {
            const response = await secureAuthorizedFetch(`http://localhost:8081/api/students?searchName=&status=&page=0&size=1000&sortBy=name&requestUserId=0&requestUserRole=ADMIN`);
            if (response && response.ok) {
                const result = await response.json();
                let list = result.data || (Array.isArray(result) ? result : []);
                globalUsersCacheList = list;
                list.forEach(st => {
                    const opt = document.createElement('option'); opt.value = st.id; opt.innerText = `${st.name} (ID: ${st.id})`;
                    adminStudentViewerSelector.appendChild(opt);
                });
            }
        } catch (ex) {}
    }

    if (document.getElementById('systemLogoutBtn')) {
        document.getElementById('systemLogoutBtn').onclick = (e) => { e.preventDefault(); sessionStorage.clear(); window.location.href = "login.html"; };
    }

    refreshAdminCounterMetrics();
});
