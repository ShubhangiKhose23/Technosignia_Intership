package org.example.studentapi.controller;

import org.example.studentapi.model.Student;
import org.example.studentapi.repository.StudentRepository;
import org.example.studentapi.service.FileLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin("*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FileLogService fileLogService;

    // 🔐 ROLE-BASED SECURE LOGIN ENDPOINT (Pure JDBC Native Flow)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        String email = loginData.get("email");
        String password = loginData.get("password");

        try {
            Student student = studentRepository.validateLoginCredentials(email, password);
            if (student != null) {
                response.put("success", true);
                response.put("role", student.getRole());
                response.put("userId", student.getId());
                response.put("userName", student.getName());
                fileLogService.logActionToFile("LOGIN SUCCESS - User: " + email + " Role: " + student.getRole());
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "Invalid Email or Password combinations.");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 📋 GET FILTERED LIST (Admin reads all / Student reads only self records index)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFilteredStudentsList(
            @RequestParam(required = false, defaultValue = "") String searchName,
            @RequestParam(required = false, defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(required = false) Integer requestUserId,
            @RequestParam(required = false, defaultValue = "USER") String requestUserRole
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Student> studentsList;
            long totalFilteredRecords;

            // Strict Role Isolation Rule Check
            if ("USER".equalsIgnoreCase(requestUserRole) && requestUserId != null) {
                // Students can only see their exact single profile ledger mapping row
                studentsList = studentRepository.findSingleStudentById(requestUserId);
                totalFilteredRecords = studentsList.size();
            } else {
                // Admins bypass parameter isolation to fetch the full database matrix
                studentsList = studentRepository.findWithFilters(searchName, status, page, size, sortBy);
                totalFilteredRecords = studentRepository.countFilteredStudents(searchName, status);
            }

            response.put("success", true);
            response.put("totalRecords", totalFilteredRecords);
            response.put("data", studentsList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateStudentDetails(@PathVariable int id, @RequestBody Student student) {
        String validationResult = student.validate();
        Map<String, Object> response = new HashMap<>();

        if (!validationResult.equals("VALID")) {
            response.put("success", false);
            response.put("message", validationResult);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        boolean isUpdated = studentRepository.updateStudent(id, student);
        if (isUpdated) {
            fileLogService.logActionToFile("UPDATED - Student ID: " + id + ", Name: " + student.getName());
        }
        response.put("success", isUpdated);
        return new ResponseEntity<>(response, isUpdated ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteStudentDetails(@PathVariable int id) {
        boolean isDeleted = studentRepository.deleteStudent(id);
        if (isDeleted) {
            fileLogService.logActionToFile("DELETED - Student ID: " + id);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", isDeleted);
        return new ResponseEntity<>(response, isDeleted ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    // 📝 STUDENT SELF-REGISTRATION ENDPOINT (Pure JDBC Native Flow)
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerNewStudent(@RequestBody Student student) {
        Map<String, Object> response = new HashMap<>();

        // Model base validation rule test execution
        String validationResult = student.validate();
        if (!validationResult.equals("VALID")) {
            response.put("success", false);
            response.put("message", validationResult);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Role dynamic baseline allocation logic
        student.setRole("USER");
        student.setStatus("ACTIVE");

        boolean isSaved = studentRepository.saveStudent(student);
        if (isSaved) {
            fileLogService.logActionToFile("NEW REGISTRATION - Name: " + student.getName() + ", Email: " + student.getEmail());
            response.put("success", true);
            response.put("message", "Student registered successfully!");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            response.put("success", false);
            response.put("message", "Email already exists or Database insertion error.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

}
