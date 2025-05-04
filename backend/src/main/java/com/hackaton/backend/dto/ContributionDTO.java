package com.hackaton.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContributionDTO {
    private Long id;
    private Long userId;
    private String type;
    private BigDecimal amount;
    private String description;
    private LocalDateTime date;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructeur par défaut
    public ContributionDTO() {}

    // Constructeur avec tous les champs
    public ContributionDTO(Long id, Long userId, String type, BigDecimal amount,
                          String description, LocalDateTime date, String status,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}