package com.hackaton.backend.service;

import com.hackaton.backend.model.Transaction;
import com.hackaton.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Transaction transaction) {
        if (!transactionRepository.existsById(transaction.getId())) {
            throw new RuntimeException("Transaction not found with id: " + transaction.getId());
        }
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionsByType(String type) {
        return transactionRepository.findByType(type);
    }

    public List<Transaction> getTransactionsByCategory(String category) {
        return transactionRepository.findByCategory(category);
    }

    public List<Transaction> getTransactionsByStatus(String status) {
        return transactionRepository.findByStatus(status);
    }

    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByDateBetween(start, end);
    }

    public List<Transaction> getTransactionsByMinAmount(BigDecimal amount) {
        return transactionRepository.findByAmountGreaterThan(amount);
    }

    public List<Transaction> getTransactionsByUserAndType(Long userId, String type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    public List<Transaction> getTransactionsByUserAndCategory(Long userId, String category) {
        return transactionRepository.findByUserIdAndCategory(userId, category);
    }
}