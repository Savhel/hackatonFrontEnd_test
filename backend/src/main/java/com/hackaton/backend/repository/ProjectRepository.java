package com.hackaton.backend.repository;

import com.hackaton.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findByStatus(String status);
    List<Project> findByUserIdAndStatus(Long userId, String status);
    List<Project> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
    List<Project> findByBudgetGreaterThan(Double budget);
}