//====================================================================================================
// 🎯 MASTER USER MANAGEMENT ENGINE LAYER: FULL CRUD, ADVANCED FILTERS, SORTING & PAGINATION PIPELINES
//====================================================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Read secure access tokens parameter values from storage instances
    let accessToken = sessionStorage.getItem("accessToken");
    let cachedRole = sessionStorage.getItem("userRole") || "USER";

    // 🔒 PROTECTED ROUTE ACCESS SEPARATION GUARDS
    if (!accessToken || cachedRole !== "ADMIN") {
        sessionStorage.clear();
        window.location.href = "login.html";
        return;
    }

    let globalUsersCacheList = [];
    let userCurrentPage = 0;
    let userPageSize = 5;

    // 🎯 INITIAL BLANK TABLE STATE: Forces blank state placeholder until user actively fires search triggers
    let activeSearchName = "EMPTY_INITIAL_FORCE_BLANK_STATE_QUERY";
    let activeStatusFilter = "";
    let activeSortBy = "name";

    // HTML DOM Geometries Selector Elements Nodes Mapping Paths
    const dynamicTableBody = document.getElementById('dynamicTableBody');
    const paginatorPageStatus = document.getElementById('paginatorPageStatus');
    const uPrevPageBtn = document.getElementById('uPrevPageBtn');
    const uNextPageBtn = document.getElementById('uNextPageBtn');

    // Popups Modals Backdrops Containers Nodes
    const editUserFormModal = document.getElementById('editUserFormModal');
    const addStudentFormModal = document.getElementById('addStudentFormModal');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');

    // Forms Inputs Selectors Mappings Fields
    const editUserIdField = document.getElementById('editUserIdField');
    const editUserName = document.getElementById('editUserName');
    const editUserAge = document.getElementById('editUserAge');
    const editUserCourse = document.getElementById('editUserCourse');
    const editUserEmail = document.getElementById('editUserEmail');
    const editUserCity = document.getElementById('editUserCity');
    const editUserMobile = document.getElementById('editUserMobile');
    const editUserStatus = document.getElementById('editUserStatus');
    const deleteTargetUserId = document.getElementById('deleteTargetUserId');

    //====================================================================================================
    // 🔄 AUTHORIZED API TUNNEL FETCH INTERCEPTOR (JWT ACCESS + SILENT REFRESH ACTIVE ROUTER)
    //====================================================================================================
    async function secureAuthorizedFetch(url, config = {}) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${sessionStorage.getItem("accessToken")}`;

        let response = await fetch(url, config);

        if (response.status === 401 || response.status === 403) {
            const refreshRes = await fetch("http://localhost:8081/api/auth/refresh", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({refreshToken: sessionStorage.getItem("refreshToken")})
            });
            const refreshJson = await refreshRes.json();

            if (refreshJson.success) {
                sessionStorage.setItem("accessToken", refreshJson.accessToken);
                config.headers["Authorization"] = `Bearer ${refreshJson.accessToken}`;
                return await fetch(url, config);
            } else {
                sessionStorage.clear();
                window.location.href = "login.html";
                return null;
            }
        }
        return response;
    }

    //====================================================================================================
    // 👥 MODULE 1: COMPREHENSIVE SEARCH DRIVEN GENERATOR LOOP (DYNAMICAL UPDATE & DELETE ACTIONS)
    //====================================================================================================
    async function loadUserModuleGridRows() {
        if (!dynamicTableBody) return;
        dynamicTableBody.innerHTML = "";

        // Strict interceptor checks renders initial fallback blank state row cleanly
        if (activeSearchName === "EMPTY_INITIAL_FORCE_BLANK_STATE_QUERY") {
            dynamicTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:45px; color:#64748b; font-weight:600; background:#ffffff;">🔍 Grid index is currently empty. Enter target search name keyword above or click "View All Students" to render records.</td></tr>`;
            if (paginatorPageStatus) paginatorPageStatus.innerHTML = "Awaiting dynamic query execution trigger...";
            if (uPrevPageBtn) uPrevPageBtn.disabled = true;
            if (uNextPageBtn) uNextPageBtn.disabled = true;
            return;
        }

        let url = `/api/students?page=${userCurrentPage}&size=${userPageSize}&sortBy=${activeSortBy}&searchName=${activeSearchName}&status=${activeStatusFilter}&requestUserId=0&requestUserRole=ADMIN`;

        try {
            const res = await secureAuthorizedFetch(url);
            if (!res) return;
            const json = await res.json();

            if (json.success && json.data) {
                globalUsersCacheList = json.data;
                const totalRecordsCount = json.totalRecords || globalUsersCacheList.length;
                const totalPagesCount = Math.ceil(totalRecordsCount / userPageSize) || 1;

                if (globalUsersCacheList.length === 0) {
                    dynamicTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:35px; color:#ef4444; font-weight:700;">❌ No matching registered student rows discovered inside MySQL database tables ledger index.</td></tr>`;
                    paginatorPageStatus.innerHTML = "Showing page 1 of 1";
                    uPrevPageBtn.disabled = true;
                    uNextPageBtn.disabled = true;
                    return;
                }

                // Dynamic table markup iterator injector loop
                globalUsersCacheList.forEach(user => {
                    const tr = document.createElement('tr');
                    const badgeColor = user.status === "INACTIVE" || user.status === "inactive" ? "background:#fee2e2; color:#991b1b;" : "background:#d1fae5; color:#065f46;";
                    const statusText = user.status === "INACTIVE" || user.status === "inactive" ? "Inactive" : "Active";

                    // 🎯 UPDATE & DELETE LIVE BUTTON OPTIONS CONFIGURED HERE ON EVERY SINGLE RECORD ROW GRID
                    tr.innerHTML = `
                        <td><span class="id-tag">#USR-${user.id}</span></td>
                        <td style="font-weight:700; color:#0f172a;">${user.name}</td>
                        <td>${user.age}</td>
                        <td style="font-weight:600; color:#4b5563;">${user.course}</td>
                        <td>${user.email || '—'}</td>
                        <td>${user.city || '—'}</td>
                        <td>${user.mobile}</td>
                        <td><span style="padding:4px 10px; border-radius:12px; font-size:12px; font-weight:700; ${badgeColor}">${statusText}</span></td>
                        <td style="text-align:center; white-space:nowrap;">
                            <button class="user-edit-trigger" data-id="${user.id}" style="background:#2563eb; border:none; padding:6px 12px; color:#fff; font-size:12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:6px;">Update</button>
                            <button class="user-delete-trigger" data-id="${user.id}" style="background:#ef4444; border:none; padding:6px 12px; color:#fff; font-size:12px; border-radius:6px; font-weight:700; cursor:pointer;">Delete</button>
                        </td>`;
                    dynamicTableBody.appendChild(tr);
                });

                paginatorPageStatus.innerHTML = `Showing page ${userCurrentPage + 1} of ${totalPagesCount}`;
                uPrevPageBtn.disabled = (userCurrentPage === 0);
                uNextPageBtn.disabled = (userCurrentPage >= totalPagesCount - 1);

                attachUserActionHandlers(); // Activates instant click listners onto newly loaded rows buttons options
            }
        } catch (err) {
            console.error("Dynamic table compilation crash error:", err);
        }
    }

    //====================================================================================================
    // 👥 MODULE 2: SEARCH FILTERS, SORTING, AND VIEW ALL SELECTION CONTROLLERS TRIGGERS
    //====================================================================================================
    if (document.getElementById('triggerFilterSearchBtn')) {
        document.getElementById('triggerFilterSearchBtn').addEventListener('click', () => {
            const rawSearchKeyword = document.getElementById('userSearchBar').value.trim();

            // Enforces clean blank look view if empty text entered inside search bar input field
            if (!rawSearchKeyword) {
                activeSearchName = "EMPTY_INITIAL_FORCE_BLANK_STATE_QUERY";
                userCurrentPage = 0;
                loadUserModuleGridRows();
                return;
            }

            activeSearchName = rawSearchKeyword.toLowerCase();
            activeStatusFilter = document.getElementById('statusFilterDropdown').value;
            activeSortBy = document.getElementById('sortingFieldControl').value;
            userCurrentPage = 0;
            loadUserModuleGridRows();
        });
    }

    // 📋 VIEW ALL OVERRIDE: Instantly clears empty state to retrieve all database entries
    if (document.getElementById('triggerViewAllStudentsBtn')) {
        document.getElementById('triggerViewAllStudentsBtn').addEventListener('click', () => {
            document.getElementById('userSearchBar').value = "";
            activeSearchName = ""; // Empty string tells backend API query to match all student rows
            activeStatusFilter = document.getElementById('statusFilterDropdown').value;
            activeSortBy = document.getElementById('sortingFieldControl').value;
            userCurrentPage = 0;
            loadUserModuleGridRows();
        });
    }

    // Pagination Click Event Binding Routine Operations
    if (uPrevPageBtn) uPrevPageBtn.onclick = () => {
        if (userCurrentPage > 0) {
            userCurrentPage--;
            loadUserModuleGridRows();
        }
    };
    if (uNextPageBtn) uNextPageBtn.onclick = () => {
        userCurrentPage++;
        loadUserModuleGridRows();
    };

    //====================================================================================================
    // 🎛️ MODULE 3: POPUPS INTERACTORS ACTIONS MAPPINGS (CRUD BINDINGS FOR MODAL TABS POPUPS)
    //====================================================================================================
    if (document.getElementById('triggerAddStudentModalBtn')) {
        document.getElementById('triggerAddStudentModalBtn').onclick = () => {
            document.getElementById('adminNewStudentRegistryForm').reset();
            document.getElementById('adminAddStudentAlert').style.display = "none";
            addStudentFormModal.style.display = "flex";
        };
    }
    if (document.getElementById('closeAddModalBtn')) document.getElementById('closeAddModalBtn').onclick = () => addStudentFormModal.style.display = "none";

    function attachUserActionHandlers() {
        // Intercepts Update option clicks triggers matching items map values
        document.querySelectorAll('.user-edit-trigger').forEach(btn => {
            btn.onclick = () => {
                const targetId = parseInt(btn.getAttribute('data-id'));
                const userObj = globalUsersCacheList.find(u => u.id === targetId);
                if (userObj) {
                    editUserIdField.value = userObj.id;
                    editUserName.value = userObj.name;
                    editUserAge.value = userObj.age || 18;
                    editUserCourse.value = userObj.course || "";
                    editUserEmail.value = userObj.email || "";
                    editUserCity.value = userObj.city || "";
                    editUserMobile.value = userObj.mobile || "";
                    editUserStatus.value = userObj.status || "ACTIVE";
                    editUserFormModal.style.display = "flex";
                }
            };
        });

        // Intercepts Delete options confirmation prompt windows launcher
        document.querySelectorAll('.user-delete-trigger').forEach(btn => {
            btn.onclick = () => {
                deleteTargetUserId.value = btn.getAttribute('data-id');
                deleteConfirmationModal.style.display = "flex";
            };
        });
    }

    if (document.getElementById('closeEditModalBtn')) document.getElementById('closeEditModalBtn').onclick = () => editUserFormModal.style.display = "none";
    if (document.getElementById('cancelDeleteBtn')) document.getElementById('cancelDeleteBtn').onclick = () => deleteConfirmationModal.style.display = "none";

    // ⚙️ UPDATE USER API PIPELINE (PUT REQUEST ROUTE INTEGRATION INTERCEPTOR)
    editUserRecordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: editUserName.value.trim(),
            age: parseInt(editUserAge.value) || 18,
            course: editUserCourse.value.trim(),
            email: editUserEmail.value.trim(),
            city: editUserCity.value.trim(),
            mobile: editUserMobile.value.trim(),
            status: editUserStatus.value,
            role: "USER"
        };
        try {
            const res = await secureAuthorizedFetch(`/api/students/${editUserIdField.value}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if (res && res.ok) {
                editUserFormModal.style.display = "none";
                loadUserModuleGridRows();
            }
        } catch (err) {
            console.error("Update API connection failure trace logs:", err);
        }
    });

    // ⚙️ DELETE USER API PIPELINE (DELETE REQUEST ROUTE INTEGRATION INTERCEPTOR)
    if (document.getElementById('confirmDeleteBtn')) {
        document.getElementById('confirmDeleteBtn').onclick = async () => {
            try {
                const res = await secureAuthorizedFetch(`/api/students/${deleteTargetUserId.value}`, {
                    method: 'DELETE'
                });
                if (res && res.ok) {
                    deleteConfirmationModal.style.display = "none";
                    loadUserModuleGridRows();
                }
            } catch (err) {
                console.error("Wipe permanent target entry crash track log trace:", err);
            }
        };
    }

    // ====================================================================================================
    // ➕ MODULE 4: NEW STUDENT DATA ROW ENTRY INJECTION INTERACTION PIPELINE (POST REQUEST)
    // ====================================================================================================
    document.getElementById('adminNewStudentRegistryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertDiv = document.getElementById('adminAddStudentAlert');
        alertDiv.style.display = "none";

        const newStudentPayload = {
            name: document.getElementById('addStName').value.trim(),
            age: parseInt(document.getElementById('addStAge').value) || 18,
            course: document.getElementById('addStCourse').value.trim() || "Not Assigned",
            email: document.getElementById('addStEmail').value.trim(),
            city: document.getElementById('addStCity').value.trim() || "N/A",
            mobile: document.getElementById('addStMobile').value.trim(),
            password: document.getElementById('addStPassword').value,
            role: "USER",
            status: "ACTIVE"
        };

        try {
            const res = await fetch('http://localhost:8081/api/students/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newStudentPayload)
            });
            const data = await res.json();
            alertDiv.style.display = "block";

            if (res.status === 201 || data.success) {
                alertDiv.style.background = "#d1fae5";
                alertDiv.style.color = "#065f46";
                alertDiv.innerText = "🎉 New Student Registered Successfully inside Database table rows ledger!";
                setTimeout(() => {
                    addStudentFormModal.style.display = "none";
                    if (activeSearchName !== "EMPTY_INITIAL_FORCE_BLANK_STATE_QUERY") {
                        loadUserModuleGridRows();
                    }
                }, 1500);
            } else {
                alertDiv.style.background = "#fee2e2";
                alertDiv.style.color = "#991b1b";
                alertDiv.innerText = data.message || "❌ Record creation failed: Duplicate Email mapping detected.";
            }
        } catch (err) {
            alertDiv.style.display = "block";
            alertDiv.style.background = "#fee2e2";
            alertDiv.style.color = "#991b1b";
            alertDiv.innerText = "❌ Network Exception: Spring Boot backend service unreachable.";
        }
    });

    // Run active summary filter view instantly on startup initialization life cycle checks
    loadUserModuleGridRows();

    if (document.getElementById('systemLogoutBtn')) {
        document.getElementById('systemLogoutBtn').onclick = (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "login.html";
        };
    }
});

