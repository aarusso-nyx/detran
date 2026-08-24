#!/usr/bin/env bash
set -euo pipefail

DB=${DB_NAME:-detran}
HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-5432}
USER=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-}

if [[ ! "$DB" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  echo "invalid DB_NAME identifier: $DB" >&2
  exit 2
fi

PSQL=(psql -v ON_ERROR_STOP=1 -q -h "$HOST" -p "$PORT" -U "$USER")
FULL=0
for argument in "$@"; do
  case "$argument" in
    --full) FULL=1 ;;
    *) echo "unknown flag: $argument" >&2; exit 2 ;;
  esac
done

DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ "$FULL" = 1 ]]; then
  "${PSQL[@]}" -d postgres -c "drop database if exists \"$DB\" with (force)"
  "${PSQL[@]}" -d postgres -c "create database \"$DB\""
fi

DDL=(00-extensions 01-schemas 02-auth 03-audit 04-integration-storage \
     10-postgis-functions 11-auth-functions 12-audit-functions 20-rls-policies)
for name in "${DDL[@]}"; do
  echo "ddl/$name.sql"
  "${PSQL[@]}" -d "$DB" -f "$DIR/ddl/$name.sql" >/dev/null
done

echo "apply.sh: done (full=$FULL db=$DB)"
