package com.hackaton.backend.service;

import com.hackaton.backend.model.Contribution;
import com.hackaton.backend.repository.ContributionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContributionService {
    
    @Autowired
    private ContributionRepository contributionRepository;

    public Contribution save(Contribution contribution) {
        return contributionRepository.save(contribution);
    }

    public List<Contribution> findAll() {
        return contributionRepository.findAll();
    }

    public Contribution findById(Long id) {
        return contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contribution non trouvée avec l'id: " + id));
    }

    public List<Contribution> findByUserId(Long userId) {
        return contributionRepository.findByUserId(userId);
    }

    public List<Contribution> findByType(String type) {
        return contributionRepository.findByType(type);
    }

    public List<Contribution> findByStatus(String status) {
        return contributionRepository.findByStatus(status);
    }

    public List<Contribution> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return contributionRepository.findByDateBetween(startDate, endDate);
    }

    public List<Contribution> findByUserIdAndStatus(Long userId, String status) {
        return contributionRepository.findByUserIdAndStatus(userId, status);
    }

    public void deleteById(Long id) {
        contributionRepository.deleteById(id);
    }

    public Contribution update(Long id, Contribution contributionDetails) {
        Contribution contribution = findById(id);
        contribution.setType(contributionDetails.getType());
        contribution.setAmount(contributionDetails.getAmount());
        contribution.setDescription(contributionDetails.getDescription());
        contribution.setDate(contributionDetails.getDate());
        contribution.setStatus(contributionDetails.getStatus());
        return contributionRepository.save(contribution);
    }
}