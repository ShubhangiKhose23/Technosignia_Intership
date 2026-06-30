import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        StudentDAO dao = new StudentDAO();
        Scanner sc = new Scanner(System.in);

        while(true) {
            int choice;
            while(true) {
                System.out.println("\n-----STUDENT_MANAGEMENT_SYSTEM-----");
                System.out.println("Choose the operation:");
                System.out.println("1. Add Student");
                System.out.println("2. View Student");
                System.out.println("3. Search Student");
                System.out.println("4. Update Student");
                System.out.println("5. Delete Student");
                System.out.println("6. Exit");
                System.out.print("Choice the Option(1-6): ");

                try {
                    choice = Integer.parseInt(sc.nextLine());
                    break;
                } catch (NumberFormatException var16) {
                    System.out.println("[!] Invalid Input! Please enter a number between 1 to 6.");
                }
            }

            switch (choice) {
                case 1:
                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();
                    System.out.print("Enter Age: ");
                    int age = Integer.parseInt(sc.nextLine());
                    System.out.print("Enter Course: ");
                    String course = sc.nextLine();
                    Student newStudent = new Student(0, name, age, course);
                    dao.addStudent(newStudent);
                    break;
                case 2:
                    ArrayList<Student> list = dao.getAllStudents();
                    if (list.isEmpty()) {
                        System.out.println("[!] No records found in the database.");
                    } else {
                        System.out.println("\n--- Student List ---");

                        for(Student s : list) {
                            PrintStream var19 = System.out;
                            int var20 = s.getId();
                            var19.println("ID: " + var20 + " | Name: " + s.getName() + " | Age: " + s.getAge() + " | Course: " + s.getCourse());
                        }
                    }
                    break;
                case 3:
                    System.out.print("Enter Student ID to Search: ");
                    int searchId = Integer.parseInt(sc.nextLine());
                    Student found = dao.searchStudent(searchId);
                    if (found != null) {
                        PrintStream var10000 = System.out;
                        int var10001 = found.getId();
                        var10000.println("\nFound -> ID: " + var10001 + " | Name: " + found.getName() + " | Age: " + found.getAge() + " | Course: " + found.getCourse());
                    } else {
                        System.out.println("[!] Student not found!");
                    }
                    break;
                case 4:
                    System.out.print("Enter Student ID to Update: ");
                    int updateId = Integer.parseInt(sc.nextLine());
                    System.out.print("Enter New Name: ");
                    String newName = sc.nextLine();
                    System.out.print("Enter New Age: ");
                    int newAge = Integer.parseInt(sc.nextLine());
                    System.out.print("Enter New Course: ");
                    String newCourse = sc.nextLine();
                    dao.updateStudent(updateId, newName, newAge, newCourse);
                    break;
                case 5:
                    System.out.print("Enter Student ID to Delete: ");
                    int deleteId = Integer.parseInt(sc.nextLine());
                    dao.deleteStudent(deleteId);
                    break;
                case 6:
                    System.out.println("Thank you for using Student Management System. Goodbye!");
                    sc.close();
                    System.exit(0);
                default:
                    System.out.println("[!] Invalid choice. Please select a number from 1 to 6.");
            }
        }
    }
}
