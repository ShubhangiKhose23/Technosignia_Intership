//====================================================================================================
// 🎯 MASTER REGISTRATION ENGINE: FIXED PAYLOAD KEY SYNC WITH BACKEND CONTROLLER
//====================================================================================================

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 1. Capture HTML Field References
    const nameField = document.getElementById('studentName');
    const emailField = document.getElementById('studentEmail');
    const mobileField = document.getElementById('studentMobile');
    const passwordField = document.getElementById('studentPassword');
    const confirmPasswordField = document.getElementById('studentConfirmPassword');
    const roleField = document.getElementById('userRole'); // Dropdown selector
    const statusAlert = document.getElementById('statusAlert');

    // 2. Client-Side Basic Validation
    if (!nameField.value || !emailField.value || !passwordField.value || !confirmPasswordField.value || mobileField.value.length < 10) {
        statusAlert.style.display = "block";
        statusAlert.style.background = "#fee2e2";
        statusAlert.style.color = "#991b1b";
        statusAlert.innerHTML = "❌ Oye! Saari fields sahi se bhar, mobile number 10 digit ka hona chahiye.";
        return;
    }

    if (passwordField.value !== confirmPasswordField.value) {
        statusAlert.style.display = "block";
        statusAlert.style.background = "#fee2e2";
        statusAlert.style.color = "#991b1b";
        statusAlert.innerHTML = "❌ Password aur Confirm Password screen par hi match nahi ho rahe hain!";
        return;
    }

    // 3. 🎯 EXACT PAYLOAD KEY MATCHING: Mapped according to variables inside AuthController
    const requestPayload = {
        id: 0,
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        mobile: mobileField.value.trim(),
        password: passwordField.value,

        // 🟢 FIXED KEY NAME: Matching exactly with User model getter signatures on backend
        confirmPassword: confirmPasswordField.value,

        role: roleField.value, // Passes "ADMIN" or "USER" dynamically
        age: 22,
        course: "Python Core",
        city: "N/A",
        status: "ACTIVE"
    };

    try {
        // 4. API Handshake with Spring Boot Backend
        const apiResponse = await fetch('http://localhost:8081/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        const responseJson = await apiResponse.json();
        statusAlert.style.display = "block";

        if (apiResponse.ok && responseJson.success) {
            // ✅ Success Logic
            statusAlert.style.background = "#d1fae5";
            statusAlert.style.color = "#065f46";
            statusAlert.innerHTML = `🎉 Badhai ho! Dynamic ${requestPayload.role} account ban gaya. Redirecting...`;

            document.getElementById('registerForm').reset();

            // Auto-redirect to Login after 2 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        } else {
            // ❌ Backend Validation Error
            statusAlert.style.background = "#fee2e2";
            statusAlert.style.color = "#991b1b";
            statusAlert.innerHTML = "❌ Error: " + (responseJson.message || "Registration fail ho gaya!");
        }

    } catch (err) {
        console.error("Pipeline Trace:", err);
        statusAlert.style.display = "block";
        statusAlert.style.background = "#fee2e2";
        statusAlert.style.color = "#991b1b";
        statusAlert.innerHTML = "❌ Connection Refused: Backend server offline hai.";
    }
});
