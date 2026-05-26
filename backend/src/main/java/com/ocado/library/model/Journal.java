package com.ocado.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime datetime;

    @Column(nullable = false)
    private String description;

    @Column(name = "user_email", nullable = false)
    private String user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDatetime() { return datetime; }
    public void setDatetime(LocalDateTime datetime) { this.datetime = datetime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
}
