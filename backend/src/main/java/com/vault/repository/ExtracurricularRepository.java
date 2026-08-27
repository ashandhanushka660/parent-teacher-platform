package com.vault.repository;

import com.vault.entity.ExtracurricularActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExtracurricularRepository extends JpaRepository<ExtracurricularActivity, Long> {
    List<ExtracurricularActivity> findByStudentUsername(String studentUsername);
}
