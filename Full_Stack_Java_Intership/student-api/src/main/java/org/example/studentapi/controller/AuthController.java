package org.example.studentapi.controller;

import org.example.studentapi.model.Student;
import org.example.studentapi.model.User;
import org.example.studentapi.repository.UserDAO;
import org.example.studentapi.service.AuthService;
import org.example.studentapi.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthService authService;

    // ====================================================================================================
    // 📮 1. UNIFIED SIGNUP PIPELINE WITH REAL-WORLD ROLE FIREWALL
    // ====================================================================================================
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signupNewUser(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (payload == null) {
                response.put("success", false);
                response.put("message", "❌ Empty registration payload dropped.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            String password = (String) payload.get("password");
            String confirmPassword = (String) payload.get("confirmPassword");

            if (confirmPassword == null || !confirmPassword.equals(password)) {
                response.put("success", false);
                response.put("message", "❌ Passwords and Confirm Password do not match!");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            String selectedRole = (payload.get("role") != null) ? ((String) payload.get("role")).trim().toUpperCase() : "USER";

            // 🛡️ SECURITY THREAT ACCESS CONTROL BLOCK
            if ("ADMIN".equals(selectedRole)) {
                String adminSecret = (payload.get("adminSecret") != null) ? ((String) payload.get("adminSecret")).trim() : "";

                // Explicitly intercept unauthorised entry tricks with an access constraint
                if (!"MASTER_ADMIN_2026".equals(adminSecret)) {
                    response.put("success", false);
                    response.put("message", "❌ Security Violation: Invalid Master Admin Passcode!");
                    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
                }
            }

            // Map safe attributes definitions to process backend rules configurations smoothly
            Student studentWrapper = new Student();
            studentWrapper.setName((String) payload.get("name"));
            studentWrapper.setEmail((String) payload.get("email"));
            studentWrapper.setMobile((String) payload.get("mobile"));
            studentWrapper.setPassword(password);
            studentWrapper.setRole(selectedRole);
            studentWrapper.setStatus("ACTIVE");
            studentWrapper.setCourse("Python Core");
            studentWrapper.setCity("N/A");
            studentWrapper.setAge(22);

            String signupResult = authService.validateAndSignup(studentWrapper);

            if ("SUCCESS".equals(signupResult)) {
                response.put("success", true);
                response.put("message", "User account registered successfully as " + selectedRole);
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                response.put("success", false);
                response.put("message", signupResult);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Server Error Trace: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ====================================================================================================
    // 🔐 2. SEPARATED REDIRECTION ACCESS CONTROL DISPATCH
    // ====================================================================================================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> dynamicAuthenticationChallenge(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            response.put("success", false);
            response.put("message", "❌ Identity verification keys missing.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Student targetIdentity = userDAO.validateUnifiedUserSessionCredentials(email, password);

        if (targetIdentity != null) {
            String accessToken = jwtUtil.generateAccessToken(targetIdentity);
            String refreshToken = jwtUtil.generateRefreshToken();

            userDAO.insertNewSessionTokenRow(targetIdentity.getEmail(), refreshToken, 1000L * 60 * 60 * 24 * 7);

            response.put("success", true);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("role", targetIdentity.getRole().trim().toUpperCase()); // Strict target flag returned
            response.put("userId", targetIdentity.getId());
            response.put("userName", targetIdentity.getName());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        response.put("success", false);
        response.put("message", "❌ Invalid login parameters combinations.");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> exchangeSessionTokens(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String refresh = payload.get("refreshToken");

        Student student = userDAO.validateRefreshTokenInSessionLedger(refresh);
        if (student != null) {
            String newAccess = jwtUtil.generateAccessToken(student);
            response.put("success", true);
            response.put("accessToken", newAccess);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("success", false);
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> clearTokensOnLogout(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");
        if(email != null) {
            userDAO.clearActiveSessionTokens(email.trim());
        }
        response.put("success", true);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
