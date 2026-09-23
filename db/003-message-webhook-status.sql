-- Store only the Meta message identifier needed to correlate a delivery webhook.
-- Webhook payloads and recipient data remain deliberately excluded.
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS message_id text;
CREATE INDEX IF NOT EXISTS webhook_events_message_status_idx
  ON webhook_events(tenant_id, connection_id, message_id, received_at DESC)
  WHERE kind = 'status' AND message_id IS NOT NULL;
