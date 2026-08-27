package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parents")
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id", unique = true, nullable = false)
    private String parentId; // e.g., P-1001

    @Column(nullable = false)
    private String title; // "Mr.", "Mrs.", "Dr."

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "linked_student_id", nullable = false)
    private String linkedStudentId; // S-1001

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Parent() {}

    public Parent(String parentId, String title, String password, String fullName, String linkedStudentId) {
        this.parentId = parentId;
        this.title = title != null ? title : "Mr.";
        this.password = password;
        this.fullName = fullName;
        this.linkedStudentId = linkedStudentId;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getLinkedStudentId() { return linkedStudentId; }
    public void setLinkedStudentId(String linkedStudentId) { this.linkedStudentId = linkedStudentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
