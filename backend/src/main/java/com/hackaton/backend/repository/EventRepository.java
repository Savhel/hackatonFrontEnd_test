package com.hackaton.backend.repository;

import com.hackaton.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserId(Long userId);
    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
    List<Event> findByStatus(String status);
    List<Event> findByUserIdAndStatus(Long userId, String status);
}