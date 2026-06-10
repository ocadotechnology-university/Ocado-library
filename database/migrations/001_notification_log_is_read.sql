-- Backfill and enforce is_read on notification_log for existing databases.
-- Safe to run multiple times.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notification_log'
          AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notification_log
            ADD COLUMN is_read boolean NOT NULL DEFAULT false;
    ELSE
        UPDATE notification_log
        SET is_read = false
        WHERE is_read IS NULL;

        ALTER TABLE notification_log
            ALTER COLUMN is_read SET DEFAULT false;

        ALTER TABLE notification_log
            ALTER COLUMN is_read SET NOT NULL;
    END IF;
END $$;

-- Remove failed earlier attempt if present.
ALTER TABLE notification_log DROP COLUMN IF EXISTS read;
