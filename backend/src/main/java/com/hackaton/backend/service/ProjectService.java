package com.hackaton.backend.service;

import com.hackaton.backend.model.Project;
import com.hackaton.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Project project) {
        if (!projectRepository.existsById(project.getId())) {
            throw new RuntimeException("Project not found with id: " + project.getId());
        }
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByUser(Long userId) {
        return projectRepository.findByUserId(userId);
    }

    public List<Project> getProjectsByStatus(String status) {
        return projectRepository.findByStatus(status);
    }

    public List<Project> getProjectsByDateRange(LocalDateTime start, LocalDateTime end) {
        return projectRepository.findByStartDateBetween(start, end);
    }

    public List<Project> getProjectsByBudget(Double budget) {
        return projectRepository.findByBudgetGreaterThan(budget);
    }

    public List<Project> getProjectsByUserAndStatus(Long userId, String status) {
        return projectRepository.findByUserIdAndStatus(userId, status);
    }
}