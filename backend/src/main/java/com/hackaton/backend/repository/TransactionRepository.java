package com.hackaton.backend.repository;

import com.hackaton.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByType(String type);
    List<Transaction> findByCategory(String category);
    List<Transaction> findByStatus(String status);
    List<Transaction> findByDateBetween(LocalDateTime start, LocalDateTime end);
    List<Transaction> findByAmountGreaterThan(BigDecimal amount);
    List<Transaction> findByUserIdAndType(Long userId, String type);
    List<Transaction> findByUserIdAndCategory(Long userId, String category);
}