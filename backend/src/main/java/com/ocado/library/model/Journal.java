package com.ocado.library.model;

import com.ocado.library.model.enums.OperationType;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type")
    private OperationType operationType;

    @Column(name = "user_email", nullable = false)
    private String user;

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "description_id")
    private Long descriptionId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDatetime() { return datetime; }
    public void setDatetime(LocalDateTime datetime) { this.datetime = datetime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OperationType getOperationType() { return operationType; }
    public void setOperationType(OperationType operationType) { this.operationType = operationType; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }
    public Long getDescriptionId() { return descriptionId; }
    public void setDescriptionId(Long descriptionId) { this.descriptionId = descriptionId; }
}
