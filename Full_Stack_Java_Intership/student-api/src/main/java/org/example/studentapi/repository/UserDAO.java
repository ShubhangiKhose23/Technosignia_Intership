package org.example.studentapi.repository;

import org.example.studentapi.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UserDAO implements StudentRepository {

    // 🟢 CLEAN AUTOMATIC FIELD INJECTION LINKED WITH DATABASE CONFIG BEAN
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ====================================================================================================
    // 🎯 DYNAMIC ROW MAPPER: Database columns ko Student Object mein map karne ke liye (No compile errors!)
    // ====================================================================================================
    private final RowMapper<Student> unifiedRowMapper = new RowMapper<Student>() {
        @Override
        public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
            Student student = new Student();
            student.setId(rs.getInt("id"));
            student.setName(rs.getString("name"));
            student.setEmail(rs.getString("email"));
            student.setMobile(rs.getString("mobile"));

            String dbRole = rs.getString("role");
            student.setRole(dbRole != null ? dbRole.trim().toUpperCase() : "USER");

            try { student.setAge(rs.getInt("age")); } catch(Exception e) { student.setAge(22); }
            try { student.setCourse(rs.getString("course")); } catch(Exception e) { student.setCourse("Python Core"); }
            try { student.setCity(rs.getString("city")); } catch(Exception e) { student.setCity("N/A"); }
            try { student.setPassword(rs.getString("password")); } catch(Exception e) { student.setPassword(""); }
            try { student.setStatus(rs.getString("status")); } catch(Exception e) { student.setStatus("ACTIVE"); }

            return student;
        }
    };

    // ====================================================================================================
    // 🔐 1. UNIFIED LOGIN HOOK: Scans both target tables matrices securely using native strings
    // ====================================================================================================
    @Override
    public Student validateLoginCredentials(String email, String password) {
        String sql = "SELECT id, name, email, mobile, password, status, role, NULL as age, NULL as course, NULL as city " +
                "FROM users WHERE BINARY TRIM(email) = ? AND BINARY password = ? AND status = 'ACTIVE' " +
                "UNION ALL " +
                "SELECT id, name, email, mobile, password, 'ACTIVE' as status, role, age, course, city " +
                "FROM students WHERE BINARY TRIM(email) = ? AND BINARY password = ? ";
        try {
            String cleanEmail = (email != null) ? email.trim() : "";
            return jdbcTemplate.queryForObject(sql, unifiedRowMapper, cleanEmail, password, cleanEmail, password);
        } catch (Exception e) {
            System.out.println("❌ Database credentials tracking failure: " + e.getMessage());
            return null;
        }
    }

    public Student validateUnifiedUserSessionCredentials(String email, String password) {
        return validateLoginCredentials(email, password);
    }

    // ====================================================================================================
    // 📮 2. SAVE DYNAMIC ROUTER: ADMIN hits 'users' table ledger, USER drops inside 'students'
    // ====================================================================================================
    @Override
    public boolean saveStudent(Student student) {
        String targetDynamicRole = (student.getRole() != null) ? student.getRole().trim().toUpperCase() : "USER";

        if ("ADMIN".equals(targetDynamicRole)) {
            // 🛡️ ADMIN CORE ROUTING LAYER: Straight inserts inside 'users' table ledger
            String sqlAdmin = "INSERT INTO users (name, email, mobile, password, status, role) VALUES (?, ?, ?, ?, 'ACTIVE', ?)";
            try {
                int rows = jdbcTemplate.update(sqlAdmin,
                        student.getName().trim(),
                        student.getEmail().trim(),
                        student.getMobile().trim(),
                        student.getPassword(),
                        targetDynamicRole
                );
                System.out.println("🛡️ REPOSITORY DISPATCH >>> Admin successfully saved in users table as " + targetDynamicRole);
                return rows > 0;
            } catch (Exception e) {
                System.out.println("❌ Exception writing Admin inside database: " + e.getMessage());
                return false;
            }
        } else {
            // 🎓 STUDENT CORE ROUTING LAYER: Straight inserts inside 'students' table ledger
            String sqlStudent = "INSERT INTO students (name, age, course, email, city, role, password, mobile, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')";
            try {
                int studentAge = (student.getAge() > 0) ? student.getAge() : 22;
                String studentCourse = (student.getCourse() != null) ? student.getCourse().trim() : "Python Core";
                String studentCity = (student.getCity() != null) ? student.getCity().trim() : "N/A";

                int rows = jdbcTemplate.update(sqlStudent,
                        student.getName().trim(),
                        studentAge,
                        studentCourse,
                        student.getEmail().trim(),
                        studentCity,
                        targetDynamicRole,
                        student.getPassword(),
                        student.getMobile().trim()
                );
                System.out.println("🎓 REPOSITORY DISPATCH >>> Student successfully saved in students table as " + targetDynamicRole);
                return rows > 0;
            } catch (Exception e) {
                System.out.println("❌ Exception writing Student inside database: " + e.getMessage());
                return false;
            }
        }
    }

    // ====================================================================================================
    // 🔄 3. TOKENS LOGISTICS AND SESSION EXTRACTIONS
    // ====================================================================================================
    public boolean insertNewSessionTokenRow(String email, String refreshToken, long expiryMs) {
        String sql = "INSERT INTO sessions (email, refresh_token, expiry_date, status) VALUES (?, ?, ?, 'ACTIVE')";
        java.sql.Timestamp expiry = new java.sql.Timestamp(System.currentTimeMillis() + expiryMs);
        try { return jdbcTemplate.update(sql, email.trim(), refreshToken, expiry) > 0; } catch (Exception e) { return false; }
    }

    public Student validateRefreshTokenInSessionLedger(String token) {
        String sql = "SELECT u.id, u.name, u.email, u.mobile, u.password, u.status, u.role, NULL as age, NULL as course, NULL as city " +
                "FROM users u INNER JOIN sessions s ON u.email = s.email WHERE s.refresh_token = ? AND s.expiry_date > NOW() AND s.status = 'ACTIVE' " +
                "UNION ALL " +
                "SELECT st.id, st.name, st.email, st.mobile, st.password, 'ACTIVE' as status, st.role, st.age, st.course, st.city " +
                "FROM students st INNER JOIN sessions s ON st.email = s.email WHERE s.refresh_token = ? AND s.expiry_date > NOW()";
        try { return jdbcTemplate.queryForObject(sql, unifiedRowMapper, token, token); } catch (Exception e) { return null; }
    }

    public void clearActiveSessionTokens(String email) {
        jdbcTemplate.update("DELETE FROM sessions WHERE email = ?", email.trim());
    }

    @Override
    public List<Student> findWithFilters(String searchName, String status, int page, int size, String sortBy) {
        String sql = "SELECT id, name, age, course, email, city, role, password, mobile, 'ACTIVE' as status FROM students WHERE name LIKE ? ORDER BY " + (sortBy.equalsIgnoreCase("id") ? "id DESC" : "name ASC") + " LIMIT ? OFFSET ?";
        try { return jdbcTemplate.query(sql, unifiedRowMapper, "%" + (searchName == null ? "" : searchName) + "%", size, page * size); } catch (Exception e) { return new ArrayList<>(); }
    }

    @Override
    public long countFilteredStudents(String searchName, String status) {
        try { return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE name LIKE ?", Long.class, "%" + (searchName == null ? "" : searchName) + "%"); } catch (Exception e) { return 0; }
    }

    @Override
    public List<Student> findSingleStudentById(int id) {
        String sql = "SELECT id, name, age, course, email, city, role, password, mobile, 'ACTIVE' as status FROM students WHERE id = ?";
        try { return jdbcTemplate.query(sql, unifiedRowMapper, id); } catch (Exception e) { return new ArrayList<>(); }
    }

    @Override
    public boolean updateStudent(int id, Student s) {
        String sql = "UPDATE students SET name=?, age=?, course=?, email=?, city=?, mobile=? WHERE id=?";
        try { return jdbcTemplate.update(sql, s.getName(), s.getAge(), s.getCourse(), s.getEmail(), s.getCity(), s.getMobile(), id) > 0; } catch (Exception e) { return false; }
    }

    @Override
    public boolean deleteStudent(int id) {
        String sql = "DELETE FROM students WHERE id = ?";
        try { return jdbcTemplate.update(sql, id) > 0; } catch (Exception e) { return false; }
    }
}
