package com.hackaton.backend.service;

import com.hackaton.backend.model.Task;
import com.hackaton.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Task task) {
        if (!taskRepository.existsById(task.getId())) {
            throw new RuntimeException("Task not found with id: " + task.getId());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public List<Task> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority);
    }

    public List<Task> getOverdueTasks(LocalDateTime date) {
        return taskRepository.findByDueDateBefore(date);
    }

    public List<Task> getTasksByProjectAndStatus(Long projectId, String status) {
        return taskRepository.findByProjectIdAndStatus(projectId, status);
    }

    public List<Task> getTasksByUserAndStatus(Long userId, String status) {
        return taskRepository.findByAssignedToIdAndStatus(userId, status);
    }
}