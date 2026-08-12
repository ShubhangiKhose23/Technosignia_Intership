package org.example.studentapi.service;

import org.example.studentapi.model.Student;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class JwtUtil {

    // Simulating secure access tokens generation with explicit expiration bounds
    public String generateAccessToken(Student student) {
        long expiresAt = System.currentTimeMillis() + (1000 * 60 * 15); // 15 Mins Session Validity
        return "JWT_ACC_" + UUID.randomUUID().toString().substring(0, 8) + "_" + student.getRole() + "_" + student.getId() + "_" + expiresAt;
    }

    public String generateRefreshToken() {
        return "JWT_REF_" + UUID.randomUUID().toString();
    }

    public boolean isTokenExpired(String token) {
        try {
            if (token != null && token.startsWith("JWT_ACC_")) {
                String[] parts = token.split("_");
                if (parts.length >= 5) {
                    long expiryTime = Long.parseLong(parts[parts.length - 1]);
                    return System.currentTimeMillis() > expiryTime;
                }
            }
        } catch (Exception e) {
            return true; // Force expiration fallback trigger on structural invalid bounds
        }
        return false;
    }

    public String parseRoleFromToken(String token) {
        try {
            String[] parts = token.split("_");
            return parts[parts.length - 3]; // Pulls explicit mapped role flags dynamically
        } catch (Exception e) {
            return "USER";
        }
    }

    public int parseUserIdFromToken(String token) {
        try {
            String[] parts = token.split("_");
            return Integer.parseInt(parts[parts.length - 2]);
        } catch (Exception e) {
            return 0;
        }
    }
}
