import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/Student_management_system";
    private static final String USER = "root";
    private static final String PASS = "root";

    public static Connection getConnection() {
        Connection conn = null;

        try {
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/Student_management_system", "root", "root");
        } catch (Exception e) {
            System.out.println("Connection Failed! Check output console" + e.getMessage());
        }

        return conn;
    }
}

