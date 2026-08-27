package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String authorId;

    @Column(nullable = false)
    private String authorName;

    @Column(length = 2000, nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Notice() {}

    public Notice(String authorId, String authorName, String message) {
        this.authorId = authorId;
        this.authorName = authorName;
        this.message = message;
    }

    public Long getId() { return id; }
    public String getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}