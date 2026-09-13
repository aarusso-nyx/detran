#!/usr/bin/env bash
# Applies the canonical RAIT fixtures (backend/database/seed/*.sql) to a database that already
# received apply.sh. Same connection variables as apply.sh. Idempotent (upserts).
set -euo pipefail
DB=${DB_NAME:-detran}
HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-5432}
USER=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-}
if [[ ! "$DB" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then echo "invalid DB_NAME identifier: $DB" >&2; exit 2; fi
DIR="$(cd "$(dirname "$0")" && pwd)"
for file in "$DIR"/seed/*.sql; do
  echo "seed/$(basename "$file")"
  psql -v ON_ERROR_STOP=1 -q -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -f "$file" >/dev/null
done
echo "seed.sh: done (db=$DB)"
