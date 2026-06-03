package com.ocado.library.notification;

import com.ocado.library.model.Item;

public interface NotificationService {

    boolean isEnabled();

    boolean sendOverdueReminder(Item item);

    boolean sendManualReminder(Item item, String pingerEmail);

    boolean sendUserPing(Item item, String pingerEmail);
}
