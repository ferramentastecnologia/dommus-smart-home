-- Add is_default column to lead_statuses table
ALTER TABLE lead_statuses ADD COLUMN is_default BOOLEAN DEFAULT FALSE;

-- Create a unique constraint to ensure only one status can be default
CREATE UNIQUE INDEX idx_lead_statuses_default ON lead_statuses (is_default) WHERE is_default = TRUE;

-- Create a trigger to ensure only one status can be default at a time
CREATE OR REPLACE FUNCTION update_lead_status_default()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE lead_statuses SET is_default = FALSE WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lead_status_default
    BEFORE INSERT OR UPDATE ON lead_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_status_default(); 