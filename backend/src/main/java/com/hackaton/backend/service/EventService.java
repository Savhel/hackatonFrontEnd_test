package com.hackaton.backend.service;

import com.hackaton.backend.model.Event;
import com.hackaton.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(Event event) {
        if (!eventRepository.existsById(event.getId())) {
            throw new RuntimeException("Event not found with id: " + event.getId());
        }
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getEventsByUser(Long userId) {
        return eventRepository.findByUserId(userId);
    }

    public List<Event> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartDateBetween(start, end);
    }

    public List<Event> getEventsByStatus(String status) {
        return eventRepository.findByStatus(status);
    }

    public List<Event> getEventsByUserAndStatus(Long userId, String status) {
        return eventRepository.findByUserIdAndStatus(userId, status);
    }
}