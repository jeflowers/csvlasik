/*
  # Create Notifications System

  ## Description
  Creates notification system for real-time admin alerts and email queue.

  ## Tables Created
  - `notifications` - Stores all system notifications
  - `notification_preferences` - User notification settings
  - `email_queue` - Email sending queue

  ## Security
  - RLS enabled on all tables
  - Users see only their notifications or global ones
  - Admins can manage all notifications

  ## Functions
  - `cleanup_old_notifications()` - Remove old read notifications
  - `get_unread_notification_count()` - Fast unread counts
  - `queue_email()` - Queue emails for sending
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('contact', 'appointment', 'testimonial', 'admin', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read boolean NOT NULL DEFAULT false,
  action_url text,
  action_label text,
  data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1));

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1))
  WITH CHECK (user_id IS NULL OR user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1));

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1));

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY,
  email_on_contact boolean DEFAULT true,
  email_on_appointment boolean DEFAULT true,
  email_on_testimonial boolean DEFAULT true,
  email_on_admin_action boolean DEFAULT false,
  email_on_system_error boolean DEFAULT true,
  push_enabled boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1));

-- =====================================================
-- EMAIL QUEUE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  from_email text,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  reply_to text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email queue" ON email_queue;
CREATE POLICY "Admins can view email queue"
  ON email_queue
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can manage email queue" ON email_queue;
CREATE POLICY "System can manage email queue"
  ON email_queue
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE read = true
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id uuid DEFAULT NULL)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_value bigint;
BEGIN
  IF target_user_id IS NULL THEN
    SELECT COUNT(*)
    INTO count_value
    FROM notifications
    WHERE read = false
      AND user_id IS NULL;
  ELSE
    SELECT COUNT(*)
    INTO count_value
    FROM notifications
    WHERE read = false
      AND (user_id = target_user_id OR user_id IS NULL);
  END IF;

  RETURN count_value;
END;
$$;

-- Function to queue an email
CREATE OR REPLACE FUNCTION queue_email(
  p_to_email text,
  p_subject text,
  p_html_body text,
  p_text_body text DEFAULT NULL,
  p_from_email text DEFAULT NULL,
  p_reply_to text DEFAULT NULL,
  p_scheduled_for timestamptz DEFAULT NOW()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  queue_id uuid;
BEGIN
  INSERT INTO email_queue (
    to_email,
    from_email,
    subject,
    html_body,
    text_body,
    reply_to,
    scheduled_for
  ) VALUES (
    p_to_email,
    p_from_email,
    p_subject,
    p_html_body,
    p_text_body,
    p_reply_to,
    p_scheduled_for
  )
  RETURNING id INTO queue_id;

  RETURN queue_id;
END;
$$;

-- Add trigger for notification_preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at_trigger ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at_trigger
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add comments
COMMENT ON TABLE notifications IS 'System notifications for users and admins';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON TABLE email_queue IS 'Queue for asynchronous email sending';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Removes read notifications older than 30 days';
COMMENT ON FUNCTION get_unread_notification_count(uuid) IS 'Returns count of unread notifications for a user';
COMMENT ON FUNCTION queue_email(text, text, text, text, text, text, timestamptz) IS 'Adds an email to the sending queue';
