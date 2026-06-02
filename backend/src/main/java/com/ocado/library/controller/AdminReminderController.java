package com.ocado.library.controller;

import com.ocado.library.security.CurrentUser;
import com.ocado.library.service.ReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reminders")
public class AdminReminderController {

    private final ReminderService reminderService;

    public AdminReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/{internal_id}")
    public ResponseEntity<Void> sendReminder(@PathVariable("internal_id") String internalId) {
        reminderService.sendManualReminder(internalId, CurrentUser.email());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
