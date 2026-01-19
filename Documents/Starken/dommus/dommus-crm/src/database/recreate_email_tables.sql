-- Script to drop and recreate email-related tables from scratch
BEGIN;

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS email_templates;
DROP TABLE IF EXISTS email_triggers;
DROP TABLE IF EXISTS smtp_config;

-- Create email_triggers table to store the different trigger types
CREATE TABLE email_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting')),
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create unique constraint to ensure only one trigger exists per type
ALTER TABLE email_triggers ADD CONSTRAINT unique_trigger_type UNIQUE (trigger_type);

-- Create email_templates table to store email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create index on trigger_type for faster queries
CREATE INDEX idx_email_templates_trigger_type ON email_templates (trigger_type);

-- Create SMTP configuration table
CREATE TABLE smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create email queue table to store emails to be sent
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  send_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create indexes on email_queue to improve performance
CREATE INDEX idx_email_queue_status ON email_queue (status);
CREATE INDEX idx_email_queue_lead_id ON email_queue (lead_id);
CREATE INDEX idx_email_queue_send_at ON email_queue (send_at);

-- Create update triggers for all email-related tables
DO $$
BEGIN
  -- Create or replace the updated_at function if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
       NEW.updated_at = timezone('utc'::text, now());
       RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;

  -- For email_triggers table
  DROP TRIGGER IF EXISTS set_updated_at_timestamp_email_triggers ON email_triggers;
  CREATE TRIGGER set_updated_at_timestamp_email_triggers
  BEFORE UPDATE ON email_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- For email_templates table
  DROP TRIGGER IF EXISTS set_updated_at_timestamp_email_templates ON email_templates;
  CREATE TRIGGER set_updated_at_timestamp_email_templates
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- For smtp_config table
  DROP TRIGGER IF EXISTS set_updated_at_timestamp_smtp_config ON smtp_config;
  CREATE TRIGGER set_updated_at_timestamp_smtp_config
  BEFORE UPDATE ON smtp_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- For email_queue table
  DROP TRIGGER IF EXISTS set_updated_at_timestamp_email_queue ON email_queue;
  CREATE TRIGGER set_updated_at_timestamp_email_queue
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Insert default email triggers
INSERT INTO email_triggers (trigger_type, description, is_active)
VALUES 
  ('birthday', 'Sends emails to leads on their birthdays', TRUE),
  ('new_lead', 'Sends emails when a new lead is created', TRUE),
  ('meeting', 'Sends emails before scheduled meetings', TRUE);

-- Insert sample email templates
INSERT INTO email_templates (name, subject, content, trigger_type, is_active)
VALUES 
(
  'Birthday Wishes', 
  'Happy Birthday {{name}}!', 
  '<p>Hello {{name}},</p><p>The entire team at our company wishes you a very happy birthday! We hope your day is filled with joy.</p><p>As a token of our appreciation, we''d like to offer you a special birthday discount on our services. Feel free to reach out to learn more.</p><p>Best wishes,<br>Your Account Manager</p>', 
  'birthday', 
  TRUE
),
(
  'Welcome New Lead', 
  'Welcome to our company', 
  '<p>Hello {{name}},</p><p>Thank you for your interest in our services! We''re excited to have you join our community.</p><p>Over the next few days, your account manager will reach out to discuss how we can best serve your needs.</p><p>In the meantime, feel free to explore our website or reply to this email if you have any questions.</p><p>Best regards,<br>The Team</p>', 
  'new_lead', 
  TRUE
),
(
  'Meeting Confirmation', 
  'Your upcoming meeting on {{date}}', 
  '<p>Hello {{name}},</p><p>This is a friendly reminder about our meeting scheduled for {{date}} at {{time}}.</p><p>You can join the meeting using this link: <a href="{{link}}">{{link}}</a></p><p>If you need to reschedule, please let us know as soon as possible.</p><p>Looking forward to our conversation!</p><p>Best regards,<br>Your Account Manager</p>', 
  'meeting', 
  TRUE
);

-- Create lead timeline event function for email events
CREATE OR REPLACE FUNCTION register_email_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Record email queued event
    INSERT INTO lead_timeline (lead_id, event_type, event_data)
    VALUES (
      NEW.lead_id, 
      'email_queued', 
      jsonb_build_object(
        'email_id', NEW.id,
        'subject', NEW.subject
      )
    );
  ELSIF (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
    -- Record email status change event
    INSERT INTO lead_timeline (lead_id, event_type, event_data)
    VALUES (
      NEW.lead_id, 
      CASE 
        WHEN NEW.status = 'sent' THEN 'email_sent'
        WHEN NEW.status = 'failed' THEN 'email_failed'
        ELSE 'email_status_change'
      END, 
      jsonb_build_object(
        'email_id', NEW.id,
        'subject', NEW.subject,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'error', NEW.error
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email events
DROP TRIGGER IF EXISTS track_email_events ON email_queue;
CREATE TRIGGER track_email_events
AFTER INSERT OR UPDATE ON email_queue
FOR EACH ROW EXECUTE FUNCTION register_email_timeline_event();

COMMIT; 