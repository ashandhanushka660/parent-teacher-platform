package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vault_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // ROLE_STUDENT, ROLE_TEACHER, ROLE_PARENT

    @Column(name = "linked_student_username")
    private String linkedStudentUsername; // Required only if role == ROLE_PARENT

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String fullName, String role, String linkedStudentUsername) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.linkedStudentUsername = linkedStudentUsername;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getLinkedStudentUsername() { return linkedStudentUsername; }
    public void setLinkedStudentUsername(String linkedStudentUsername) { this.linkedStudentUsername = linkedStudentUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}