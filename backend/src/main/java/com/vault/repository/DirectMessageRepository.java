package com.vault.repository;

import com.vault.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    List<DirectMessage> findByTeacherIdOrderByCreatedAtDesc(String teacherId);
    long countByTeacherIdAndIsReadFalse(String teacherId);
}
