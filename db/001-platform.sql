CREATE TABLE IF NOT EXISTS tenants (
 id uuid PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id), email text NOT NULL UNIQUE,
 password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('admin','member')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,tenant_id)
);
CREATE TABLE IF NOT EXISTS sessions (
 id uuid PRIMARY KEY, user_id uuid NOT NULL, tenant_id uuid NOT NULL,
 token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id) ON DELETE CASCADE,
 UNIQUE(id,user_id,tenant_id)
);
CREATE TABLE IF NOT EXISTS signup_attempts (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, user_id uuid NOT NULL, session_id uuid NOT NULL,
 state_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, consumed_at timestamptz,
 outcome text CHECK (outcome IN ('pending','completed','failed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(session_id,user_id,tenant_id) REFERENCES sessions(id,user_id,tenant_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS signup_tenant_idx ON signup_attempts(tenant_id,created_at DESC);
CREATE TABLE IF NOT EXISTS credentials (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id), provider text NOT NULL,
 key_version text NOT NULL, ciphertext text NOT NULL, iv text NOT NULL, tag text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,tenant_id)
);
CREATE TABLE IF NOT EXISTS whatsapp_connections (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id),
 meta_business_id text NOT NULL, waba_id text NOT NULL, phone_number_id text NOT NULL UNIQUE,
 display_phone_number text NOT NULL, status text NOT NULL
 CHECK (status IN ('not_connected','pending','connected','error','reauthorization_required')),
 credential_reference uuid, connected_at timestamptz, validated_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(credential_reference,tenant_id) REFERENCES credentials(id,tenant_id),
 UNIQUE(id,tenant_id), UNIQUE(tenant_id,waba_id,phone_number_id)
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid,
 event text NOT NULL CHECK (event IN ('signup_started','signup_completed','signup_failed',
 'credential_stored','connection_connected','connection_disconnected','message_test_sent','management_test_executed')),
 resource_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS message_requests (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id), connection_id uuid NOT NULL,
 request_hash text NOT NULL, status text NOT NULL CHECK(status IN ('sending','sent','failed','unknown')),
 meta_message_id text, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(connection_id,tenant_id) REFERENCES whatsapp_connections(id,tenant_id)
);
CREATE TABLE IF NOT EXISTS webhook_events (
 event_hash text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id),
 connection_id uuid NOT NULL, kind text NOT NULL, delivery_status text,
 received_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(connection_id,tenant_id) REFERENCES whatsapp_connections(id,tenant_id)
);
