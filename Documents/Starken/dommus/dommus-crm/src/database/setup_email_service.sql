-- Setup email service tables
BEGIN;

-- Create email_triggers table to store the different trigger types
CREATE TABLE IF NOT EXISTS email_triggers (
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
CREATE TABLE IF NOT EXISTS email_templates (
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
CREATE INDEX IF NOT EXISTS idx_email_templates_trigger_type ON email_templates (trigger_type);

-- Create SMTP configuration table
CREATE TABLE IF NOT EXISTS smtp_config (
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
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  send_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create indexes on email_queue to improve performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue (status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id ON email_queue (lead_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_send_at ON email_queue (send_at);

-- Add updated_at trigger function if it doesn't exist yet
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all email-related tables
DO $$
BEGIN
  -- For email_triggers table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_timestamp_email_triggers'
  ) THEN
    CREATE TRIGGER set_updated_at_timestamp_email_triggers
    BEFORE UPDATE ON email_triggers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For email_templates table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_timestamp_email_templates'
  ) THEN
    CREATE TRIGGER set_updated_at_timestamp_email_templates
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For smtp_config table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_timestamp_smtp_config'
  ) THEN
    CREATE TRIGGER set_updated_at_timestamp_smtp_config
    BEFORE UPDATE ON smtp_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For email_queue table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_timestamp_email_queue'
  ) THEN
    CREATE TRIGGER set_updated_at_timestamp_email_queue
    BEFORE UPDATE ON email_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default email triggers
INSERT INTO email_triggers (trigger_type, description, is_active)
VALUES 
  ('birthday', 'Sends emails to leads on their birthdays', TRUE),
  ('new_lead', 'Sends emails when a new lead is created', TRUE),
  ('meeting', 'Sends emails before scheduled meetings', TRUE)
ON CONFLICT (trigger_type) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

-- Example email templates
INSERT INTO email_templates (name, subject, content, trigger_type, is_active)
VALUES (
  'Birthday Wishes', 
  'Happy Birthday {{name}}!', 
  '<p>Hello {{name}},</p><p>The entire team at our company wishes you a very happy birthday! We hope your day is filled with joy.</p><p>As a token of our appreciation, we''d like to offer you a special birthday discount on our services. Feel free to reach out to learn more.</p><p>Best wishes,<br>Your Account Manager</p>', 
  'birthday', 
  TRUE
),
(
  'Welcome New Lead', 
  'Welcome to {{company_name}}', 
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
)
ON CONFLICT DO NOTHING;

COMMIT; 