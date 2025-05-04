package com.hackaton.backend.repository;

import com.hackaton.backend.model.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByUserId(Long userId);
    List<Contribution> findByType(String type);
    List<Contribution> findByStatus(String status);
    List<Contribution> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Contribution> findByUserIdAndStatus(Long userId, String status);
}