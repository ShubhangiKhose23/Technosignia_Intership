package org.example.studentapi.repository;

import org.example.studentapi.model.Student;
import java.util.List;

public interface StudentRepository {
    List<Student> findWithFilters(String searchName, String status, int page, int size, String sortBy);
    long countFilteredStudents(String searchName, String status);
    boolean updateStudent(int id, Student student);
    boolean deleteStudent(int id);
    Student validateLoginCredentials(String email, String password);
    List<Student> findSingleStudentById(int id);
    boolean saveStudent(Student student); // 🟢 Fixed Controller Compilation Error
}
