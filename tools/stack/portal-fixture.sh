#!/usr/bin/env bash
set -Eeuo pipefail

# Ephemeral C-02-05 data, never part of a canonical seed profile.
STACK_DB_NAME='detran_local_stack'
REQUESTED_DB_NAME="${DB_NAME:-$STACK_DB_NAME}"
DB_CONTAINER="${DETRAN_DB_CONTAINER:-detran-local-stack-postgres}"

die() {
  echo "detran-stack: $*" >&2
  exit 1
}

[[ "$REQUESTED_DB_NAME" == "$STACK_DB_NAME" ]] ||
  die "stack database is restricted to DB_NAME=$STACK_DB_NAME"

command -v docker >/dev/null 2>&1 || die 'command not found: docker'
docker exec -i "$DB_CONTAINER" psql -X -v ON_ERROR_STOP=1 -U postgres \
  -d "$STACK_DB_NAME" <<'SQL'
begin;
select set_config('app.role', 'owner', true);
select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', true);

-- A7: the local-token default actor needs an active tenancy membership. Roles
-- remain token-derived; this ephemeral stack fixture grants no roles or perms.
insert into auth.users (id, tenant_id, email, display_name, is_active)
values
  ('00000000-0000-4000-8000-000000000002',
   '00000000-0000-7000-8000-00000000a001',
   'local-stack-default-actor@detran-am.invalid',
   'Local stack default actor', true)
on conflict (id) do update set is_active = true;

insert into auth.memberships (id, tenant_id, user_id, is_active)
values
  ('00000000-0000-7000-8000-0000d2050001',
   '00000000-0000-7000-8000-00000000a001',
   '00000000-0000-4000-8000-000000000002', true)
on conflict (tenant_id, user_id) do update set is_active = true;

insert into portal.complaint
  (id, tenant_id, protocol, category, status, description, payload, created_at)
values
  ('00000000-0000-7000-8000-0000c2050001',
   '00000000-0000-7000-8000-00000000a001',
   'STACK-SMOKE-PORTAL-001', 'STACK_SMOKE', 'OPEN',
   'Denuncia sintetica da stack local; sem fato real.',
   '{"fixture":"r17-local-stack"}'::jsonb,
   '2026-09-14T12:00:00-04:00')
on conflict (id) do update set
  protocol = excluded.protocol,
  category = excluded.category,
  status = excluded.status,
  description = excluded.description,
  payload = excluded.payload;

commit;
SQL
