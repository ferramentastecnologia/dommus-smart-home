-- Begin transaction
BEGIN;

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name varchar(255) NOT NULL,
    subject varchar(255) NOT NULL,
    content text NOT NULL,
    trigger_type varchar(50),
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id),
    CONSTRAINT email_templates_name_unique UNIQUE (name),
    CONSTRAINT email_templates_trigger_type_check CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting', 'custom'))
);

-- Create email_queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_queue (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    template_id uuid REFERENCES public.email_templates(id),
    to varchar(255) NOT NULL,
    subject varchar(255) NOT NULL,
    content text NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pending',
    error text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    sent_at timestamp with time zone,
    PRIMARY KEY (id),
    CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Add birthday column to leads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'birthday'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN birthday date;
    END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id ON public.email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_trigger_type ON public.email_templates(trigger_type, is_active);
CREATE INDEX IF NOT EXISTS idx_leads_birthday ON public.leads(birthday);

-- Create function to track email events in lead timeline
CREATE OR REPLACE FUNCTION register_email_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- When a new email is queued, register in timeline
        INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
        VALUES (
            NEW.lead_id, 
            'email_sent', 
            jsonb_build_object(
                'subject', NEW.subject,
                'email_id', NEW.id,
                'status', NEW.status
            ),
            NULL -- System generated event
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        -- When email status changes, update the timeline event
        INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
        VALUES (
            NEW.lead_id, 
            CASE 
                WHEN NEW.status = 'sent' THEN 'email_sent'
                WHEN NEW.status = 'failed' THEN 'email_failed'
                ELSE 'email_status_changed'
            END, 
            jsonb_build_object(
                'subject', NEW.subject,
                'email_id', NEW.id,
                'status', NEW.status,
                'old_status', OLD.status,
                'error', NEW.error
            ),
            NULL -- System generated event
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email events
DROP TRIGGER IF EXISTS track_email_events ON public.email_queue;
CREATE TRIGGER track_email_events
AFTER INSERT OR UPDATE ON public.email_queue
FOR EACH ROW EXECUTE FUNCTION register_email_event();

-- Add policies to make email_queue and email_templates accessible
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read email templates
CREATE POLICY read_email_templates ON public.email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage email templates
CREATE POLICY manage_email_templates ON public.email_templates
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to read email queue
CREATE POLICY read_email_queue ON public.email_queue
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage email queue
CREATE POLICY manage_email_queue ON public.email_queue
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Commit transaction
COMMIT; 