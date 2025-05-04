package com.hackaton.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String role;

    @OneToMany(mappedBy = "user")
    private Set<Event> events;

    @OneToMany(mappedBy = "user")
    private Set<Project> projects;

    @OneToMany(mappedBy = "assignedTo")
    private Set<Task> tasks;

    @OneToMany(mappedBy = "user")
    private Set<Transaction> transactions;

    @OneToMany(mappedBy = "user")
    private Set<Contribution> contributions;
}