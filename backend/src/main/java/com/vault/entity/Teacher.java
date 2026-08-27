package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_id", unique = true, nullable = false)
    private String teacherId; // e.g., T-1001

    @Column(nullable = false)
    private String title; // "Mr.", "Mrs.", "Ms.", "Dr."

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String subjectSpecialization;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Teacher() {}

    public Teacher(String teacherId, String title, String password, String fullName, String subjectSpecialization) {
        this.teacherId = teacherId;
        this.title = title != null ? title : "Mr.";
        this.password = password;
        this.fullName = fullName;
        this.subjectSpecialization = subjectSpecialization;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getSubjectSpecialization() { return subjectSpecialization; }
    public void setSubjectSpecialization(String subjectSpecialization) { this.subjectSpecialization = subjectSpecialization; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
