package com.vault.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "extracurricular_activities")
public class ExtracurricularActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentUsername;

    @Column(nullable = false)
    private String activityName; // e.g. "Chess Club", "Cricket Team", "Science Olympiad"

    @Column(nullable = false)
    private String category; // "SPORTS", "CLUBS", "LEADERSHIP", "ARTS"

    private String achievementLevel; // "Gold Medal", "Captain", "Participant"
    private String teacherRemarks;
    private LocalDate activityDate = LocalDate.now();

    public ExtracurricularActivity() {}

    public ExtracurricularActivity(String studentUsername, String activityName, String category, String achievementLevel, String teacherRemarks) {
        this.studentUsername = studentUsername;
        this.activityName = activityName;
        this.category = category;
        this.achievementLevel = achievementLevel;
        this.teacherRemarks = teacherRemarks;
        this.activityDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }
    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAchievementLevel() { return achievementLevel; }
    public void setAchievementLevel(String achievementLevel) { this.achievementLevel = achievementLevel; }
    public String getTeacherRemarks() { return teacherRemarks; }
    public void setTeacherRemarks(String teacherRemarks) { this.teacherRemarks = teacherRemarks; }
    public LocalDate getActivityDate() { return activityDate; }
}
