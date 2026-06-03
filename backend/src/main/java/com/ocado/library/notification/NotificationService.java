package com.ocado.library.notification;

import com.ocado.library.model.Item;

public interface NotificationService {

    boolean isEnabled();

    boolean sendOverdueReminder(Item item);

    boolean sendManualMessage(String recipientEmail, String message);

    boolean sendUserPing(Item item, String pingerEmail);
}
