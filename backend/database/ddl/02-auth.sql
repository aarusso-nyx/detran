CREATE TABLE IF NOT EXISTS auth.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_name text,
  cnpj varchar(14),
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  contact_email text,
  contact_phone text,
  state text NOT NULL DEFAULT 'active'
    CHECK (state IN ('provisioning', 'active', 'suspended', 'archived', 'purged')),
  is_active boolean NOT NULL DEFAULT true,
  suspended_reason text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_tenants_name ON auth.tenants (lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_tenants_cnpj ON auth.tenants (cnpj) WHERE cnpj IS NOT NULL;

CREATE OR REPLACE VIEW tenancy.tenants AS
SELECT id, slug, name, state, is_active, suspended_reason, archived_at, created_at, updated_at
FROM auth.tenants;

CREATE TABLE IF NOT EXISTS tenancy.tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES auth.tenants(id) ON DELETE CASCADE,
  timezone text,
  locale text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES auth.tenants(id) ON DELETE CASCADE,
  email citext NOT NULL UNIQUE,
  oidc_sub text UNIQUE,
  external_subject text UNIQUE,
  display_name text NOT NULL DEFAULT '',
  given_name text,
  family_name text,
  picture_url text,
  locale text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS auth.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES auth.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  code text GENERATED ALWAYS AS (key) STORED,
  description text GENERATED ALWAYS AS (name) STORED,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS auth.perms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text
);

CREATE TABLE IF NOT EXISTS auth.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  effective_hash text,
  effective_hash_generation integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS auth.role_perms (
  role_id uuid NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
  perm_id uuid NOT NULL REFERENCES auth.perms(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, perm_id)
);

CREATE TABLE IF NOT EXISTS auth.membership_roles (
  membership_id uuid NOT NULL REFERENCES auth.memberships(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (membership_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth.direct_perms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES auth.memberships(id) ON DELETE CASCADE,
  perm_id uuid NOT NULL REFERENCES auth.perms(id) ON DELETE CASCADE,
  effect text NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'deny'))
);

CREATE TABLE IF NOT EXISTS auth.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES auth.groups(id) ON DELETE SET NULL,
  key text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS auth.group_memberships (
  group_id uuid NOT NULL REFERENCES auth.groups(id) ON DELETE CASCADE,
  membership_id uuid NOT NULL REFERENCES auth.memberships(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, membership_id)
);

CREATE TABLE IF NOT EXISTS auth.group_roles (
  group_id uuid NOT NULL REFERENCES auth.groups(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES auth.memberships(id) ON DELETE SET NULL,
  sid text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS auth.sessions_default PARTITION OF auth.sessions DEFAULT;

CREATE TABLE IF NOT EXISTS auth.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  email citext NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
