package com.hackaton.backend.repository;

import com.hackaton.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByStatus(String status);
    List<Task> findByPriority(String priority);
    List<Task> findByDueDateBefore(LocalDateTime date);
    List<Task> findByProjectIdAndStatus(Long projectId, String status);
    List<Task> findByAssignedToIdAndStatus(Long userId, String status);
}