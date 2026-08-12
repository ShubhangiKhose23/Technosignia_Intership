package org.example.studentapi.service;

import org.example.studentapi.model.Student;
import org.example.studentapi.repository.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserDAO userDAO;

    public String validateAndSignup(Student student) {
        // Enforcing mandatory parameters validation checking bounds safely
        if (student.getName() == null || student.getName().trim().isEmpty() ||
                student.getEmail() == null || student.getEmail().trim().isEmpty() ||
                student.getMobile() == null || student.getMobile().trim().isEmpty() ||
                student.getPassword() == null || student.getPassword().isEmpty()) {
            return "❌ Please Enter Correct Data (All fields are mandatory)";
        }

        // Automatic defaults allocations before targeting backend repositories
        if (student.getRole() == null || student.getRole().trim().isEmpty()) {
            student.setRole("USER");
        }
        if (student.getCourse() == null || student.getCourse().trim().isEmpty()) {
            student.setCourse("Python Core");
        }
        if (student.getCity() == null || student.getCity().trim().isEmpty()) {
            student.setCity("N/A");
        }
        if (student.getAge() <= 0) {
            student.setAge(22);
        }

        boolean isSaved = userDAO.saveStudent(student);
        if (isSaved) {
            return "SUCCESS";
        } else {
            return "❌ System Error: Registration failed. Email or Mobile might already exist inside database constraints.";
        }
    }

    public String validateAndLogin(String email, String password) {
        if (email == null || email.trim().isEmpty() || password == null || password.isEmpty()) {
            return "❌ Email and Password cannot be empty!";
        }

        Student student = userDAO.validateLoginCredentials(email, password);
        if (student != null) {
            return "SUCCESS";
        } else {
            return "❌ Incorrect Credentials! Please enter valid password/email combinations.";
        }
    }

    public List<Student> getAdvancedFilteredUsers(String searchName, String status, int page, int size, String sortBy) {
        return userDAO.findWithFilters(searchName, status, page, size, sortBy);
    }

    public long getTotalFilteredUsersCount(String searchName, String status) {
        return userDAO.countFilteredStudents(searchName, status);
    }

    public boolean updateUserRecordInDatabase(int id, Student student) {
        return userDAO.updateStudent(id, student);
    }

    public boolean deleteUserRecordFromDatabase(int id) {
        return userDAO.deleteStudent(id);
    }
}
