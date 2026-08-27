package com.vault.repository;

import com.vault.entity.AcademicMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AcademicMarkRepository extends JpaRepository<AcademicMark, Long> {
    List<AcademicMark> findByStudentUsername(String studentUsername);
    List<AcademicMark> findByStudentUsernameAndExamType(String studentUsername, String examType);

    @Query("SELECT DISTINCT a.examType FROM AcademicMark a")
    List<String> findDistinctExamTypes();
}
