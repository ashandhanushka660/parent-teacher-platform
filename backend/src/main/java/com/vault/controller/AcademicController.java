package com.vault.controller;

import com.vault.entity.*;
import com.vault.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/academic")
public class AcademicController {

    private final AcademicMarkRepository markRepository;
    private final AttendanceRepository attendanceRepository;
    private final ExtracurricularRepository extraRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DirectMessageRepository messageRepository;
    private final NoticeRepository noticeRepository;

    public AcademicController(
            AcademicMarkRepository markRepository,
            AttendanceRepository attendanceRepository,
            ExtracurricularRepository extraRepository,
            AssignmentRepository assignmentRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            DirectMessageRepository messageRepository,
            NoticeRepository noticeRepository) {
        this.markRepository = markRepository;
        this.attendanceRepository = attendanceRepository;
        this.extraRepository = extraRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.messageRepository = messageRepository;
        this.noticeRepository = noticeRepository;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getBillboardLeaderboard() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        for (Student s : students) {
            List<AcademicMark> marks = markRepository.findByStudentUsername(s.getStudentId());
            double totalMarks = 0.0;
            double totalMaxMarks = 0.0;
            for (AcademicMark m : marks) {
                totalMarks += m.getMarks();
                totalMaxMarks += m.getMaxMarks();
            }
            double avg = totalMaxMarks == 0.0 ? 0.0 : (totalMarks / totalMaxMarks) * 100.0;

            Map<String, Object> entry = new HashMap<>();
            entry.put("studentId", s.getStudentId());
            entry.put("fullName", s.getFullName());
            entry.put("gender", s.getGender() != null ? s.getGender() : "Son");
            entry.put("averageScore", Math.round(avg * 10.0) / 10.0);
            entry.put("subjectsCount", marks.size());
            leaderboard.add(entry);
        }

        leaderboard.sort((a, b) -> Double.compare((Double) b.get("averageScore"), (Double) a.get("averageScore")));

        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("rank", i + 1);
        }

        return ResponseEntity.ok(leaderboard);
    }

    // NEW ENDPOINT: Fetch Dynamic Exam Types
    @GetMapping("/exam-types")
    public ResponseEntity<?> getDistinctExamTypes() {
        List<String> defaultTypes = Arrays.asList("TERM_TEST", "MONTHLY_TEST", "QUIZ");
        return ResponseEntity.ok(defaultTypes);
    }

    @PostMapping("/marks")
    public ResponseEntity<?> addMark(@RequestBody AcademicMark mark) {
        return ResponseEntity.ok(markRepository.save(mark));
    }

    @PostMapping("/marks/batch")
    public ResponseEntity<?> addMarksBatch(@RequestBody List<AcademicMark> marks) {
        return ResponseEntity.ok(markRepository.saveAll(marks));
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/notices")
    public ResponseEntity<?> publishNotice(@RequestBody Map<String, String> payload) {
        String authorId = payload.get("authorId");
        String authorName = payload.get("authorName");
        String message = payload.get("message");
        if (authorId == null || authorName == null || message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Author and message are required."));
        }
        return ResponseEntity.ok(noticeRepository.save(new Notice(authorId, authorName, message.trim())));
    }

    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceRepository.save(record));
    }

    @GetMapping("/all-attendance")
    public ResponseEntity<List<AttendanceRecord>> getAllAttendance() {
        return ResponseEntity.ok(attendanceRepository.findAll());
    }

    @PostMapping("/extracurricular")
    public ResponseEntity<?> addExtracurricular(@RequestBody ExtracurricularActivity activity) {
        return ResponseEntity.ok(extraRepository.save(activity));
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> getAssignments() {
        return ResponseEntity.ok(assignmentRepository.findAll());
    }

    @PostMapping("/direct-messages")
    public ResponseEntity<?> sendDirectMessage(@RequestBody Map<String, Object> payload) {
        String senderId = (String) payload.get("senderId");
        String senderName = (String) payload.get("senderName");
        String messageText = (String) payload.get("message");
        @SuppressWarnings("unchecked")
        List<String> teacherIds = (List<String>) payload.get("teacherIds");

        if (teacherIds == null || teacherIds.isEmpty() || messageText == null || messageText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Teachers and message body are required."));
        }

        List<DirectMessage> sentMessages = new ArrayList<>();
        for (String tId : teacherIds) {
            DirectMessage dm = new DirectMessage(senderId, senderName, tId, messageText);
            sentMessages.add(messageRepository.save(dm));
        }

        return ResponseEntity.ok(Map.of("message", "Direct message sent to " + sentMessages.size() + " teacher(s)."));
    }

    @GetMapping("/teacher-inbox/{teacherId}")
    public ResponseEntity<?> getTeacherInbox(@PathVariable String teacherId) {
        List<DirectMessage> inbox = messageRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        long unreadCount = messageRepository.countByTeacherIdAndIsReadFalse(teacherId);
        return ResponseEntity.ok(Map.of("messages", inbox, "unreadCount", unreadCount));
    }

    @PostMapping("/mark-message-read/{messageId}")
    public ResponseEntity<?> markMessageRead(@PathVariable Long messageId) {
        Optional<DirectMessage> dmOpt = messageRepository.findById(messageId);
        if (dmOpt.isPresent()) {
            DirectMessage dm = dmOpt.get();
            dm.setRead(true);
            messageRepository.save(dm);
        }
        return ResponseEntity.ok(Map.of("status", "READ"));
    }

    @GetMapping("/student-data/{studentId}")
    public ResponseEntity<?> getStudentData(@PathVariable String studentId) {
        String cleanId = studentId.trim().toUpperCase();
        Optional<Student> studentOpt = studentRepository.findByStudentId(cleanId);
        String studentName = studentOpt.map(Student::getFullName).orElse(cleanId);
        String gender = studentOpt.map(Student::getGender).orElse("Son");

        List<AcademicMark> marks = markRepository.findByStudentUsername(cleanId);
        List<AttendanceRecord> attendance = attendanceRepository.findByStudentUsername(cleanId);
        List<ExtracurricularActivity> extras = extraRepository.findByStudentUsername(cleanId);

        double totalMarks = 0;
        double totalMaxMarks = 0;
        for (AcademicMark m : marks) {
            totalMarks += m.getMarks();
            totalMaxMarks += m.getMaxMarks();
        }
        double avg = totalMaxMarks == 0.0 ? 0.0 : (totalMarks / totalMaxMarks) * 100.0;

        long presentCount = attendance.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        double attendanceRate = attendance.isEmpty() ? 100.0 : ((double) presentCount / attendance.size()) * 100.0;

        double predictedNextTerm = Math.min(100.0, avg + (attendanceRate > 90 ? 2.5 : -4.0));
        String riskLevel = avg < 50 ? "HIGH RISK" : (avg < 75 ? "MODERATE" : "EXCELLENT");

        Map<String, Object> analytics = Map.of(
                "averageScore", Math.round(avg * 10.0) / 10.0,
                "attendanceRate", Math.round(attendanceRate * 10.0) / 10.0,
                "predictedScore", Math.round(predictedNextTerm * 10.0) / 10.0,
                "riskLevel", riskLevel,
                "rankPosition", "Rank #2 in Cohort"
        );

        return ResponseEntity.ok(Map.of(
                "studentId", cleanId,
                "studentName", studentName,
                "gender", gender,
                "marks", marks,
                "attendance", attendance,
                "extracurriculars", extras,
                "analytics", analytics
        ));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll().stream()
                .map(s -> Map.of(
                        "studentId", s.getStudentId(),
                        "fullName", s.getFullName(),
                        "gender", s.getGender() != null ? s.getGender() : "Son"
                ))
                .toList());
    }

    @GetMapping("/teachers")
    public ResponseEntity<?> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll().stream()
                .map(t -> Map.of(
                        "teacherId", t.getTeacherId(),
                        "fullName", t.getFullName(),
                        "subjectSpecialization", t.getSubjectSpecialization() != null ? t.getSubjectSpecialization() : "General"
                ))
                .toList());
    }
}
