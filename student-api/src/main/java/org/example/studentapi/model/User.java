package org.example.studentapi.model;

import java.util.regex.Pattern;

public class User {
    private String name;
    private String email;
    private String mobile;
    private String password;
    private String confirmPassword;

    private int id;
    private String status = "ACTIVE";

    // ====================================================================================================
    // ** 🎯 ROLE BASED VALUE TRACKER PARAMETER VARIABLE (ADMIN / USER) FOR TASK 2 IMPLEMENTATION **
    // ====================================================================================================
    private String role = "USER";

    // ====================================================================================================
    // ** 🎯 DHYAN SE DEKHO: HUMNE SIRF ISS LINES KE THEEK UPAR YEH JSONFORMAT WALI LINE JODHI HAI TAAKI 500 EROR JAAYE **
    // ====================================================================================================
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private java.sql.Timestamp createdDate;


    //====================================================================================================
    // 1. CONSTRUCTORS (REPAIRED: Added default empty constructor for Jackson mapping)
    //====================================================================================================
    // 🟢 यह खाली कंस्ट्रक्टर 500 एरर को रोकने के लिए सबसे ज़रूरी है
    public User() {
    }

    // रजिस्ट्रेशन के लिए मुख्य कंस्ट्रक्टर
    public User(String name, String email, String mobile, String password, String confirmPassword) {
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    // लॉगिन के लिए छोटा कंस्ट्रक्टर
    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    //====================================================================================================
    // 2. GETTERS & SETTERS (Added Setters so Spring can populate data)
    //====================================================================================================
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.sql.Timestamp getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(java.sql.Timestamp createdDate) {
        this.createdDate = createdDate;
    }

    // ====================================================================================================
    // ** 🎯 GETTER & SETTER FOR ROLE SYSTEM PARAMETERS TO RESOLVE THE 'setRole' COMPILE BUG **
    // ====================================================================================================
    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    //====================================================================================================
    // 3. VALIDATIONS
    //====================================================================================================
    public boolean isvalidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return Pattern.matches(emailRegex, email);
    }

    public boolean isvalidMobile(String mobile) {
        String mobileRegex = "^[0-9]{10}$";
        return Pattern.matches(mobileRegex, mobile);
    }

    public boolean isvalidPassword() {
        String passwordRegex = "^^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
        return Pattern.matches(passwordRegex, this.password);
    }

    public boolean isPasswordMatching() {
        return this.password != null && this.password.equals(this.confirmPassword);
    }
}
