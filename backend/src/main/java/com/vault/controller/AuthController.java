package com.vault.controller;

import com.vault.entity.Parent;
import com.vault.entity.Student;
import com.vault.entity.Teacher;
import com.vault.repository.ParentRepository;
import com.vault.repository.StudentRepository;
import com.vault.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            ParentRepository parentRepository,
            PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/next-id/{role}")
    public ResponseEntity<?> getNextId(@PathVariable String role) {
        long count;
        String prefix;
        if ("ROLE_STUDENT".equalsIgnoreCase(role)) {
            count = studentRepository.count();
            prefix = "S-";
        } else if ("ROLE_TEACHER".equalsIgnoreCase(role)) {
            count = teacherRepository.count();
            prefix = "T-";
        } else if ("ROLE_PARENT".equalsIgnoreCase(role)) {
            count = parentRepository.count();
            prefix = "P-";
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }
        return ResponseEntity.ok(Map.of("suggestedId", prefix + (1001 + count)));
    }

    @GetMapping("/verify-student/{studentId}")
    public ResponseEntity<?> verifyStudent(@PathVariable String studentId) {
        String cleanId = studentId.trim().toUpperCase();
        if (!cleanId.startsWith("S-")) {
            return ResponseEntity.badRequest().body(Map.of(
                "exists", false,
                "message", "Invalid ID format: Student IDs must start with 'S-' (e.g., S-1001)"
            ));
        }

        Optional<Student> studentOpt = studentRepository.findByStudentId(cleanId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "exists", false,
                "message", "Student ID '" + cleanId + "' not found. Your child must register as a Student first."
            ));
        }

        Student s = studentOpt.get();
        return ResponseEntity.ok(Map.of(
            "exists", true,
            "studentName", s.getFullName(),
            "gender", s.getGender() != null ? s.getGender() : "Son",
            "studentId", s.getStudentId()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String customId = request.get("userId") != null ? request.get("userId").trim().toUpperCase() : "";
        String password = request.get("password");
        String fullName = request.get("fullName");
        String role = request.getOrDefault("role", "ROLE_STUDENT");
        String title = request.getOrDefault("title", "Mr.");
        String gender = request.getOrDefault("gender", "Son");
        String linkedStudentId = request.get("linkedStudentId") != null ? request.get("linkedStudentId").trim().toUpperCase() : "";

        if (customId.isEmpty() || password == null || fullName == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All registration fields are required."));
        }

        String encodedPassword = passwordEncoder.encode(password);

        if ("ROLE_STUDENT".equals(role)) {
            if (!customId.startsWith("S-")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid ID. Must contain 'S-' prefix for Students (e.g., S-1001)."));
            }
            if (studentRepository.existsByStudentId(customId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Student ID " + customId + " is already in use."));
            }
            Student student = new Student(customId, encodedPassword, fullName, gender);
            studentRepository.save(student);
            return ResponseEntity.ok(Map.of("message", "Student registered successfully", "assignedId", customId));
        }

        if ("ROLE_TEACHER".equals(role)) {
            if (!customId.startsWith("T-")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid ID. Must contain 'T-' prefix for Teachers (e.g., T-1001)."));
            }
            if (teacherRepository.existsByTeacherId(customId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Teacher ID " + customId + " is already in use."));
            }
            String specialization = request.getOrDefault("specialization", "General Academic");
            Teacher teacher = new Teacher(customId, title, encodedPassword, title + " " + fullName, specialization);
            teacherRepository.save(teacher);
            return ResponseEntity.ok(Map.of("message", "Teacher registered successfully", "assignedId", customId));
        }

        if ("ROLE_PARENT".equals(role)) {
            if (!customId.startsWith("P-")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid ID. Must contain 'P-' prefix for Parents (e.g., P-1001)."));
            }
            if (parentRepository.existsByParentId(customId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Parent ID " + customId + " is already in use."));
            }
            if (!linkedStudentId.startsWith("S-")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid Child ID. Student ID must begin with 'S-' (e.g., S-1001)."));
            }
            Optional<Student> studentOpt = studentRepository.findByStudentId(linkedStudentId);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(Map.of("message", "Linked Student ID does not exist in the database."));
            }
            Parent parent = new Parent(customId, title, encodedPassword, title + " " + fullName, linkedStudentId);
            parentRepository.save(parent);
            return ResponseEntity.ok(Map.of("message", "Parent registered successfully", "assignedId", customId));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Unsupported role specified."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> request) {
        String userId = request.get("userId") != null ? request.get("userId").trim().toUpperCase() : "";
        String password = request.get("password");

        if (userId.isEmpty() || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID and password are required."));
        }

        if (userId.startsWith("S-")) {
            Optional<Student> student = studentRepository.findByStudentId(userId);
            if (student.isPresent() && passwordEncoder.matches(password, student.get().getPassword())) {
                return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", student.get().getStudentId(),
                    "fullName", student.get().getFullName(),
                    "gender", student.get().getGender() != null ? student.get().getGender() : "Son",
                    "role", "ROLE_STUDENT"
                ));
            }
        } else if (userId.startsWith("T-")) {
            Optional<Teacher> teacher = teacherRepository.findByTeacherId(userId);
            if (teacher.isPresent() && passwordEncoder.matches(password, teacher.get().getPassword())) {
                return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", teacher.get().getTeacherId(),
                    "fullName", teacher.get().getFullName(),
                    "role", "ROLE_TEACHER"
                ));
            }
        } else if (userId.startsWith("P-")) {
            Optional<Parent> parent = parentRepository.findByParentId(userId);
            if (parent.isPresent() && passwordEncoder.matches(password, parent.get().getPassword())) {
                return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", parent.get().getParentId(),
                    "fullName", parent.get().getFullName(),
                    "linkedStudentId", parent.get().getLinkedStudentId(),
                    "role", "ROLE_PARENT"
                ));
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Invalid ID format: Must start with 'S-' for Student, 'T-' for Teacher, or 'P-' for Parent."
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid User ID or Password."));
    }
}
