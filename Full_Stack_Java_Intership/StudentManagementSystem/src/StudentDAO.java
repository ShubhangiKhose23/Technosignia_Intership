import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

public class StudentDAO {
    private void appendToFile(Student student) {
        try (
                FileWriter fw = new FileWriter("students_log.txt", true);
                BufferedWriter bw = new BufferedWriter(fw);
        ) {
            int var10001 = student.getId();
            bw.write("ADDED: ID=" + var10001 + ", Name=" + student.getName() + ", Age=" + student.getAge() + ", Course=" + student.getCourse());
            bw.newLine();
        } catch (IOException e) {
            System.out.println("File write error: " + e.getMessage());
        }

    }

    private void logActionToFile(String action) {
        try (
                FileWriter fw = new FileWriter("students_log.txt", true);
                BufferedWriter bw = new BufferedWriter(fw);
        ) {
            bw.write(action);
            bw.newLine();
        } catch (IOException e) {
            System.out.println("File write error: " + e.getMessage());
        }

    }

    public void addStudent(Student student) {
        String query = "insert into students(name, age, course) values(?,?,?)";

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(query);
        ) {
            pstmt.setString(1, student.getName());
            pstmt.setInt(2, student.getAge());
            pstmt.setString(3, student.getCourse());
            pstmt.executeUpdate();
            System.out.println("Student Added Successfully");
            this.appendToFile(student);
        } catch (SQLException e) {
            System.out.println("Error adding Student" + e.getMessage());
        }

    }

    public ArrayList<Student> getAllStudents() {
        ArrayList<Student> list = new ArrayList();
        String query = "select * from students";

        try (
                Connection conn = DatabaseConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query);
        ) {
            while(rs.next()) {
                Student s = new Student(rs.getInt("id"), rs.getString("name"), rs.getInt("age"), rs.getString("course"));
                list.add(s);
            }

            this.logActionToFile("VIEWED: All students records fetched from DB.");
        } catch (SQLException e) {
            System.out.println("Error Viewing all Student" + e.getMessage());
        }

        return list;
    }

    public Student searchStudent(int id) {
        String query = "select * from students where id = ?";

        try {
            Student var7;
            try (Connection conn = DatabaseConnection.getConnection()) {
                try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                    pstmt.setInt(1, id);
                    ResultSet rs = pstmt.executeQuery();
                    if (!rs.next()) {
                        return null;
                    }

                    Student found = new Student(rs.getInt("id"), rs.getString("name"), rs.getInt("age"), rs.getString("course"));
                    this.logActionToFile("SEARCHED: Found Student ID=" + id + ", Name=" + found.getName());
                    var7 = found;
                }
            }

            return var7;
        } catch (SQLException e) {
            System.out.println("Error searching Student" + e.getMessage());
            return null;
        }
    }

    public void updateStudent(int id, String name, int age, String course) {
        String query = "UPDATE students SET name=?,age=?, course=? where id=?";

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(query);
        ) {
            pstmt.setString(1, name);
            pstmt.setInt(2, age);
            pstmt.setString(3, course);
            pstmt.setInt(4, id);
            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("Student Updated Successfully!");
                this.logActionToFile("UPDATED: Student ID=" + id + " to Name=" + name + ", Age=" + age + ", Course=" + course);
            } else {
                System.out.println("Student ID not found!");
            }
        } catch (SQLException e) {
            System.out.println("Error updating Student: " + e.getMessage());
        }

    }

    public void deleteStudent(int id) {
        String query = "Delete from students where id=?";

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(query);
        ) {
            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("Student Deleted Successfully!");
                this.logActionToFile("DELETED: Student with ID=" + id);
            } else {
                System.out.println("Student ID not found!");
            }
        } catch (SQLException e) {
            System.out.println("Error Deleting Student: " + e.getMessage());
        }

    }
}
