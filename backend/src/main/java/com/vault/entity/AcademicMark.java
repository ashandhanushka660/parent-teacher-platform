package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "academic_marks")
public class AcademicMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentUsername;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String examType; // e.g., "TERM_TEST", "MONTHLY_TEST", "QUIZ", "ASSIGNMENT"

    @Column(nullable = false)
    private Double marks;

    @Column(nullable = false)
    private Double maxMarks;

    @Column(length = 1000)
    private String teacherFeedback;

    @Column(nullable = false)
    private LocalDate evaluationDate = LocalDate.now();

    public AcademicMark() {}

    public AcademicMark(String studentUsername, String subject, String examType, Double marks, Double maxMarks, String teacherFeedback) {
        this.studentUsername = studentUsername;
        this.subject = subject;
        this.examType = examType;
        this.marks = marks;
        this.maxMarks = maxMarks;
        this.teacherFeedback = teacherFeedback;
        this.evaluationDate = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public String getStudentUsername() {
        return studentUsername;
    }

    public void setStudentUsername(String studentUsername) {
        this.studentUsername = studentUsername;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public Double getMarks() {
        return marks;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getTeacherFeedback() {
        return teacherFeedback;
    }

    public void setTeacherFeedback(String teacherFeedback) {
        this.teacherFeedback = teacherFeedback;
    }

    public LocalDate getEvaluationDate() {
        return evaluationDate;
    }

    public void setEvaluationDate(LocalDate evaluationDate) {
        this.evaluationDate = evaluationDate;
    }
}
