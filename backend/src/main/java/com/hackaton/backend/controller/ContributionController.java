package com.hackaton.backend.controller;

import com.hackaton.backend.model.Contribution;
import com.hackaton.backend.service.ContributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@CrossOrigin(origins = "*")
public class ContributionController {

    @Autowired
    private ContributionService contributionService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Contribution> createContribution(@RequestBody Contribution contribution) {
        return ResponseEntity.ok(contributionService.save(contribution));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contribution>> getAllContributions() {
        return ResponseEntity.ok(contributionService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Contribution> getContributionById(@PathVariable Long id) {
        return ResponseEntity.ok(contributionService.findById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Contribution>> getContributionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(contributionService.findByUserId(userId));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contribution>> getContributionsByType(@PathVariable String type) {
        return ResponseEntity.ok(contributionService.findByType(type));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contribution>> getContributionsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(contributionService.findByStatus(status));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contribution>> getContributionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(contributionService.findByDateRange(startDate, endDate));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Contribution> updateContribution(
            @PathVariable Long id,
            @RequestBody Contribution contributionDetails) {
        return ResponseEntity.ok(contributionService.update(id, contributionDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContribution(@PathVariable Long id) {
        contributionService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}