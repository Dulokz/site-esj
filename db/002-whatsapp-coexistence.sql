-- Incremental migration: the original onboarding flow is Cloud API.
ALTER TABLE signup_attempts ADD COLUMN IF NOT EXISTS signup_mode text;
UPDATE signup_attempts SET signup_mode = 'cloud_api' WHERE signup_mode IS NULL;
ALTER TABLE signup_attempts ALTER COLUMN signup_mode SET DEFAULT 'cloud_api';
ALTER TABLE signup_attempts ALTER COLUMN signup_mode SET NOT NULL;
ALTER TABLE signup_attempts ADD CONSTRAINT signup_attempts_signup_mode_check
  CHECK (signup_mode IN ('cloud_api', 'coexistence'));

ALTER TABLE whatsapp_connections ADD COLUMN IF NOT EXISTS signup_mode text;
UPDATE whatsapp_connections SET signup_mode = 'cloud_api' WHERE signup_mode IS NULL;
ALTER TABLE whatsapp_connections ALTER COLUMN signup_mode SET DEFAULT 'cloud_api';
ALTER TABLE whatsapp_connections ALTER COLUMN signup_mode SET NOT NULL;
ALTER TABLE whatsapp_connections ADD CONSTRAINT whatsapp_connections_signup_mode_check
  CHECK (signup_mode IN ('cloud_api', 'coexistence'));

-- These facts are non-secret evidence returned by Graph for a coexistence connection.
ALTER TABLE whatsapp_connections ADD COLUMN IF NOT EXISTS is_on_biz_app boolean;
ALTER TABLE whatsapp_connections ADD COLUMN IF NOT EXISTS platform_type text;
