package org.example.studentapi.model;

public class Student {
    private int id;
    private String name;
    private int age;
    private String course;
    private String email;
    private String city;
    private String mobile = "";
    private String role = "USER";
    private String password = "";
    private String status = "ACTIVE"; // Assigned explicit status placeholder field tracker

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getMobile() { return this.mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getRole() { return this.role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return this.password; }
    public void setPassword(String password) { this.password = password; }

    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }

    public String validate() {
        if (this.name == null || this.name.trim().isEmpty()) {
            return "❌ Student name cannot be empty!";
        }
        if (this.age <= 0 || this.age > 100) {
            return "❌ Age must be between 1 and 100!";
        }
        if (this.course == null || this.course.trim().isEmpty()) {
            return "❌ Course cannot be empty!";
        }
        if (this.email == null || !this.email.contains("@") || !this.email.contains(".")) {
            return "❌ Email format is wrong! (e.g., abc@gmail.com)";
        }
        if (this.city == null || this.city.trim().isEmpty()) {
            return "❌ City cannot be empty!";
        }
        return "VALID";
    }
}
