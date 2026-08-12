//====================================================================================================
// 🔒 PORTAL SECURITY ACCOUNT ACCESS CONTROL ENGINE: SECURE TOKEN REDIRECTIONS LIFECYCLE
//====================================================================================================
const loginFormNode = document.getElementById("authLoginForm");

if (loginFormNode) {
    loginFormNode.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");
        const statusAlert = document.getElementById("statusAlert");

        // Reset elements states safely
        if(emailError) { emailError.innerText = ""; emailError.style.display = "none"; }
        if(passwordError) { passwordError.innerText = ""; passwordError.style.display = "none"; }
        if(statusAlert) {
            statusAlert.style.display = "none";
            statusAlert.innerText = "";
            statusAlert.className = "alert";
        }

        let isValid = true;
        if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes("@")) {
            if(emailError) {
                emailError.innerText = "❌ Please enter a valid registered email address.";
                emailError.style.display = "block";
            }
            isValid = false;
        }
        if (!passwordInput || !passwordInput.value.trim()) {
            if(passwordError) {
                passwordError.innerText = "❌ Password field cannot be left blank.";
                passwordError.style.display = "block";
            }
            isValid = false;
        }

        if (!isValid) return;

        // Login Payload
        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        try {
            const response = await fetch("http://localhost:8081/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (statusAlert) statusAlert.style.display = "block";

            if (response.ok && result.success === true) {
                // Tokens aur User details session mein save karein
                sessionStorage.setItem("accessToken", result.accessToken);
                sessionStorage.setItem("refreshToken", result.refreshToken);

                // Role normalize (ADMIN ya USER)
                const synchronizedRole = String(result.role || "USER").trim().toUpperCase();
                sessionStorage.setItem("userRole", synchronizedRole);
                sessionStorage.setItem("userId", result.userId || "0");

                const extractedName = result.userName || "Portal Console User";
                sessionStorage.setItem("activeUserName", extractedName);

                if(statusAlert) {
                    statusAlert.className = "alert alert-success";
                    statusAlert.style.background = "#d1fae5";
                    statusAlert.style.color = "#065f46";
                    statusAlert.innerText = "🎉 Sign-in verification passed! Redirecting workspace console...";
                }

                // 🗺️ ROLE-BASED REDIRECTION LOGIC
                setTimeout(() => {
                    if (synchronizedRole === "ADMIN") {
                        window.location.href = "dashboard.html"; // Admin Dashboard
                    } else {
                        window.location.href = "student_dashboard.html"; // Student Dashboard
                    }
                }, 1000);

            } else {
                if(statusAlert) {
                    statusAlert.className = "alert alert-error";
                    statusAlert.style.background = "#fee2e2";
                    statusAlert.style.color = "#991b1b";
                    statusAlert.innerText = result.message || "❌ Invalid login parameters combinations.";
                }
            }
        } catch (err) {
            console.error("Authentication pipeline trace:", err);
            if(statusAlert) {
                statusAlert.className = "alert alert-error";
                statusAlert.style.background = "#fee2e2";
                statusAlert.style.color = "#991b1b";
                statusAlert.innerText = "❌ Connection Exception: Spring Boot backend server is unreachable.";
            }
        }
    });
}
