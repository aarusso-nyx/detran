-- 19-portal-platform.sql — plataforma do Portal (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
-- Fonte: work/rounds/R-0009/plan.md M11 (tenant pelo Host, marca publica, sequencia de protocolo — M8);
-- docs/framework/arch/portal-route-contract.md §2 (campos de brand) e §11 (platform.public_hostname /
-- platform.tenant_brand_profile → portal.public_hostname / portal.brand_profile, sem RLS por desenho).
-- Idempotente: o schema tambem e criado pelos DDL gerados 60–65 (create schema if not exists).
CREATE SCHEMA IF NOT EXISTS portal;

-- Mapeamento Host → tenant, consultado pelo DetranTenantResolver antes de existir contexto de tenant
-- (X-Tenant-Id ausente e perfil nao local; PORTAL.TENANT_UNRESOLVED 421 quando nao mapeia).
-- RLS exempt by design (portal-route-contract.md §11; plan R-0009 M11)
CREATE TABLE IF NOT EXISTS portal.public_hostname (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname text NOT NULL UNIQUE,
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE portal.public_hostname IS 'R-0009 M11 — Host publico → tenant do Portal; hostname unico global; sem RLS por desenho (resolvido antes do contexto de tenant; tools/check-rls-ddl.ts allowlist RLS_EXEMPT_BY_DESIGN).';
CREATE INDEX IF NOT EXISTS ix_portal_public_hostname_tenant_id ON portal.public_hostname (tenant_id);

-- Marca publica do tenant: os 10 campos de GET brand (portal-route-contract.md §2), lidos sem sessao.
-- RLS exempt by design (portal-route-contract.md §11; plan R-0009 M11)
CREATE TABLE IF NOT EXISTS portal.brand_profile (
  tenant_id uuid PRIMARY KEY REFERENCES auth.tenants(id),
  display_name text NOT NULL,
  short_name text NOT NULL,
  legal_name text NOT NULL,
  primary_color varchar(20) NOT NULL,
  support_url text,
  privacy_url text,
  accessibility_url text,
  service_contact text,
  locale text NOT NULL,
  time_zone text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE portal.brand_profile IS 'R-0009 M11 — marca publica do tenant (GET brand, @Public); uma linha por tenant; sem RLS por desenho (a marca e publica; tools/check-rls-ddl.ts allowlist RLS_EXEMPT_BY_DESIGN).';

-- Sequencia do numero de protocolo (plan R-0009 M8: <tenant-slug-upper>-<AAAA>-<sequencial 7 digitos>).
-- Vive aqui porque tools/blueprints/generate.mjs nao emite sequences; a tabela portal.protocol e gerada
-- por BP-PORTAL-REQUESTS-001 (DDL 62).
CREATE SEQUENCE IF NOT EXISTS portal.protocol_seq;

GRANT USAGE ON SCHEMA portal TO role_app_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal.public_hostname, portal.brand_profile TO role_app_backend;
GRANT USAGE, SELECT ON SEQUENCE portal.protocol_seq TO role_app_backend;
