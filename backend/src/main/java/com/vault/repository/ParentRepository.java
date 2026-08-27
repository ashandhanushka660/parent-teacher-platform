package com.vault.repository;

import com.vault.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByParentId(String parentId);
    boolean existsByParentId(String parentId);
}
