package com.vault.config;

import com.vault.entity.*;
import com.vault.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final AcademicMarkRepository markRepository;
    private final AttendanceRepository attendanceRepository;
    private final ExtracurricularRepository extraRepository;
    private final AssignmentRepository assignmentRepository;
    private final DirectMessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            ParentRepository parentRepository,
            AcademicMarkRepository markRepository,
            AttendanceRepository attendanceRepository,
            ExtracurricularRepository extraRepository,
            AssignmentRepository assignmentRepository,
            DirectMessageRepository messageRepository,
            PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.markRepository = markRepository;
        this.attendanceRepository = attendanceRepository;
        this.extraRepository = extraRepository;
        this.assignmentRepository = assignmentRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() == 0) {
            String encodedPass = passwordEncoder.encode("pass123");

            // Seed Students with Gender / Relation
            studentRepository.save(new Student("S-1001", encodedPass, "Naveen Fernando", "Son"));
            studentRepository.save(new Student("S-1002", encodedPass, "Kavindi Jayawardena", "Daughter"));
            studentRepository.save(new Student("S-1003", encodedPass, "Sachithra Bandara", "Son"));
            studentRepository.save(new Student("S-1004", encodedPass, "Anuki Perera", "Daughter"));

            // Seed Teachers with Title (Mr. / Mrs. / Dr.)
            teacherRepository.save(new Teacher("T-1001", "Mrs.", encodedPass, "Mrs. R. Perera", "Combined Mathematics"));
            teacherRepository.save(new Teacher("T-1002", "Mr.", encodedPass, "Mr. S. Fernando", "Physics & Electronics"));
            teacherRepository.save(new Teacher("T-1003", "Dr.", encodedPass, "Dr. K. Silva", "Computer Science & Networking"));

            // Seed Parents with Title
            parentRepository.save(new Parent("P-1001", "Mr.", encodedPass, "Mr. D. Fernando", "S-1001"));
            parentRepository.save(new Parent("P-1002", "Mrs.", encodedPass, "Mrs. M. Jayawardena", "S-1002"));

            // Seed Marks
            markRepository.save(new AcademicMark("S-1001", "Combined Mathematics", "TERM_TEST", 96.0, 100.0, "Outstanding problem solving."));
            markRepository.save(new AcademicMark("S-1001", "Physics", "TERM_TEST", 94.0, 100.0, "Exceptional mechanics grasp."));
            markRepository.save(new AcademicMark("S-1001", "Computer Science", "MONTHLY_TEST", 95.0, 100.0, "Top scorer in algorithms."));

            markRepository.save(new AcademicMark("S-1002", "Combined Mathematics", "TERM_TEST", 88.0, 100.0, "Consistent analytical work."));
            markRepository.save(new AcademicMark("S-1002", "Physics", "TERM_TEST", 92.0, 100.0, "Excellent laboratory performance."));
            markRepository.save(new AcademicMark("S-1002", "Computer Science", "MONTHLY_TEST", 90.0, 100.0, "Great logic implementation."));

            markRepository.save(new AcademicMark("S-1003", "Combined Mathematics", "TERM_TEST", 82.0, 100.0, "Refine calculus proofs."));
            markRepository.save(new AcademicMark("S-1003", "Physics", "TERM_TEST", 84.0, 100.0, "Solid core concepts."));

            // Seed Attendance
            attendanceRepository.save(new AttendanceRecord("S-1001", LocalDate.now().minusDays(1), "PRESENT", "On time"));
            attendanceRepository.save(new AttendanceRecord("S-1002", LocalDate.now().minusDays(1), "PRESENT", "On time"));

            // Seed Extracurriculars
            extraRepository.save(new ExtracurricularActivity("S-1001", "Senior Chess Club", "CLUBS", "National Gold Medalist", "Exemplary tournament strategy."));
            extraRepository.save(new ExtracurricularActivity("S-1002", "Badminton Squad", "SPORTS", "School Team Captain", "Great leadership in zonal finals."));

            // Seed Assignment
            assignmentRepository.save(new Assignment("Distributed Systems Analysis", "Computer Science", "Implement consensus protocols in simulated cluster.", LocalDate.now().plusDays(7)));

            // Seed Direct Message
            messageRepository.save(new DirectMessage("P-1001", "Mr. D. Fernando", "T-1001", "Dear Mrs. Perera, will there be a revision session for calculus prior to term tests?"));
        }
    }
}
