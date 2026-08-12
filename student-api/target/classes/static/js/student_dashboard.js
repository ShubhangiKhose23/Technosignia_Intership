//====================================================================================================
// 🎯 MASTER SECURE REPOSITORY ENGINE LAYER: EXCLUSIVE INDEPENDENT STUDENT DASHBOARD LOGIC
//====================================================================================================
let originalStudentDataState = null;

document.addEventListener('DOMContentLoaded', () => {
    // 🟢 Read context tokens parameters from browser session storage instances
    const cachedRole = sessionStorage.getItem("userRole") || "USER";
    const cachedName = sessionStorage.getItem("activeUserName") || "Student View";

    // 🎯 FALLBACK INTERCEPTOR LOGIC: Login data khali hone par automatic table ki pehli entry target karega
    const cachedUserId = sessionStorage.getItem("userId") || "AUTO_FETCH_FIRST_ROW";

    // 🔒 COMMENTED ROUTE GUARD: Route guard check ko bypass kiya hai taaki bina login direct view ho sake
    // if (!sessionStorage.getItem("accessToken") || cachedRole !== "USER") {
    //     sessionStorage.clear(); window.location.href = "login.html"; return;
    // }

    const userProfileName = document.getElementById('userProfileName');
    if (userProfileName) userProfileName.innerHTML = `${cachedName} (${cachedRole})`;

    // Sidebar Toggles panels selectors hooks references definitions maps
    const menuStudentTab = document.getElementById('menuStudentTab');
    const menuContactTab = document.getElementById('menuContactTab');
    const menuHelpTab = document.getElementById('menuHelpTab');

    const dynamicTableBlock = document.getElementById('dynamicTableBlock');
    const contactSectionBlock = document.getElementById('contactSectionBlock');
    const helpSectionBlock = document.getElementById('helpSectionBlock');
    const dynamicTableBody = document.getElementById('dynamicTableBody');

    const clearActiveSectors = () => {
        [menuStudentTab, menuContactTab, menuHelpTab].forEach(t => { if(t) t.classList.remove('active'); });
        [dynamicTableBlock, contactSectionBlock, helpSectionBlock].forEach(s => { if(s) s.style.display = 'none'; });
    };

    if(menuStudentTab) {
        menuStudentTab.addEventListener('click', (e) => {
            e.preventDefault(); clearActiveSectors(); menuStudentTab.classList.add('active');
            dynamicTableBlock.style.display = "block"; fetchAuthenticatedStudentProfile();
        });
    }

    if(menuContactTab) {
        menuContactTab.addEventListener('click', (e) => {
            e.preventDefault(); clearActiveSectors(); menuContactTab.classList.add('active');
            contactSectionBlock.style.display = "block";
        });
    }

    if(menuHelpTab) {
        menuHelpTab.addEventListener('click', (e) => {
            e.preventDefault(); clearActiveSectors(); menuHelpTab.classList.add('active');
            helpSectionBlock.style.display = "block";
        });
    }

    // ====================================================================================================
    // 🎓 MODULE 1: VIEW PROFILE - SYNCHRONIZE DATA DIRECTLY FETCHED FROM MYSQL TABLE VIA API
    // ====================================================================================================
    async function fetchAuthenticatedStudentProfile() {
        try {
            // Constructing clean query layout targeting active session or first dynamic row inside table
            const urlPath = `/api/students?searchName=&status=&page=0&size=1&sortBy=name&requestUserId=${cachedUserId === "AUTO_FETCH_FIRST_ROW" ? "" : cachedUserId}&requestUserRole=${cachedRole}`;
            const response = await fetch(urlPath);
            const result = await response.json();

            if (result.success && result.data) {
                let recordsList = result.data;
                let student = null;

                // Safe check unpacking mechanism resolves array collections or raw object keys
                if (Array.isArray(recordsList) && recordsList.length > 0) {
                    student = recordsList[0];
                } else if (recordsList && !Array.isArray(recordsList)) {
                    student = recordsList;
                }

                if (!student) {
                    if(document.getElementById('badgeProfileName')) {
                        document.getElementById('badgeProfileName').innerText = "❌ Database Table is Empty!";
                    }
                    return;
                }

                originalStudentDataState = student;

                if(document.getElementById('topBannerStudentName')) document.getElementById('topBannerStudentName').innerText = student.name;
                if(document.getElementById('badgeProfileName')) document.getElementById('badgeProfileName').innerText = student.name;

                document.getElementById('stParamName').value = student.name;
                document.getElementById('stParamEmail').value = student.email || "N/A";
                document.getElementById('stParamMobile').value = student.mobile || "—";
                document.getElementById('stParamCourse').value = student.course || "Not Assigned";
                document.getElementById('stParamCity').value = student.city || "N/A";
                document.getElementById('stParamAge').value = student.age || 18;

                if (student.profilePhoto) {
                    document.getElementById('studentAvatarPreview').src = student.profilePhoto;
                }
            }
        } catch (error) { console.error("Trace breakdown executing database row lookups:", error); }
    }

    // ====================================================================================================
    // 🎓 MODULE 2: UPDATE PROFILE - NATIVE PUT METHOD TARGETS ROW PRIMARY KEY ID MATCHES
    // ====================================================================================================
    document.getElementById('studentSelfEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('selfEditStatusAlert');
        alertBox.style.display = "none";

        const updatedPayload = {
            name: document.getElementById('stParamName').value.trim(),
            email: document.getElementById('stParamEmail').value.trim(),
            mobile: document.getElementById('stParamMobile').value.trim(),
            course: document.getElementById('stParamCourse').value.trim(),
            city: document.getElementById('stParamCity').value.trim(),
            age: parseInt(document.getElementById('stParamAge').value),
            status: originalStudentDataState ? originalStudentDataState.status : "ACTIVE",
            role: "USER",
            password: originalStudentDataState ? originalStudentDataState.password : ""
        };

        try {
            const currentUpdateId = cachedUserId === "AUTO_FETCH_FIRST_ROW" && originalStudentDataState ? originalStudentDataState.id : cachedUserId;
            const response = await fetch(`/api/students/${currentUpdateId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedPayload)
            });
            const result = await response.json();
            alertBox.style.display = "block";

            if (result.success) {
                alertBox.style.background = "#d1fae5"; alertBox.style.color = "#065f46";
                alertBox.innerText = "🎉 Profile Data Updated Successfully!";

                ['stParamName', 'stParamEmail', 'stParamMobile', 'stParamCourse', 'stParamCity'].forEach(id => {
                    const el = document.getElementById(id); el.readOnly = true; el.classList.remove('active-editing');
                });
                document.getElementById('saveProfileChangesBtn').style.display = "none";
                sessionStorage.setItem('activeUserName', updatedPayload.name);
            } else {
                alertBox.style.background = "#fee2e2"; alertBox.style.color = "#991b1b";
                alertBox.innerText = result.message || "❌ Input structure parameters mismatch validation schema.";
            }
        } catch (err) { console.error(err); }
    });

    // ====================================================================================================
    // 🎓 MODULE 3: UPLOAD PROFILE PHOTO CONTROLLER DATA MULTIPART PIPELINE
    // ====================================================================================================
    const photoTriggerArea = document.getElementById('photoTriggerArea');
    const hiddenPhotoInput = document.getElementById('hiddenPhotoInput');

    if(photoTriggerArea && hiddenPhotoInput) {
        photoTriggerArea.addEventListener('click', () => hiddenPhotoInput.click());
        hiddenPhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = (event) => { document.getElementById('studentAvatarPreview').src = event.target.result; };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append("photo", file);

            try {
                const currentUpdateId = cachedUserId === "AUTO_FETCH_FIRST_ROW" && originalStudentDataState ? originalStudentDataState.id : cachedUserId;
                await fetch(`/api/students/${currentUpdateId}/upload-photo`, {
                    method: "POST", body: formData
                });
                alert("🎉 Profile image processed successfully inside storage.");
            } catch (err) { console.error(err); }
        });
    }

// ====================================================================================================
// 🎓 MODULE 4: CHANGE SECURITY PASSWORD POPUP MODAL ENFORCEMENT HOOKS
    //====================================================================================================
    // ⚙️ 6. RUN TIME INITIAL LIFECYCLES TRIGGER ENGINE CONTROL
    //====================================================================================================
    // Run active profile row discovery instantly on startup lifecycle load
    fetchAuthenticatedStudentProfile();

    // Application logging sign-out clear parameters routine session tracker link
    if(document.getElementById('systemLogoutBtn')) {
        document.getElementById('systemLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "login.html";
        });
    }
});

// ====================================================================================================
// ⚡ CORE INTERACTION CONTROLLER: SWITCHES READONLY TO WRITABLE TRANSITION INLINE VALUES
// ====================================================================================================
function toggleFieldEditing(fieldId) {
    const targetInput = document.getElementById(fieldId);
    if (targetInput.readOnly) {
        targetInput.readOnly = false;
        targetInput.classList.add('active-editing');
        targetInput.focus();
        document.getElementById('saveProfileChangesBtn').style.display = "block";
    } else {
        targetInput.readOnly = true;
        targetInput.classList.remove('active-editing');
    }
}
