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

# Apply every numbered migration in lexical order, with the global policy/grant
# pass deliberately last so new tenant tables cannot be omitted from a reset.
DDL=()
while IFS= read -r ddl_path; do
  name="$(basename "$ddl_path" .sql)"
  [[ "$name" = "20-rls-policies" ]] || DDL+=("$name")
done < <(find "$DIR/ddl" -maxdepth 1 -type f -name '*.sql' | sort)
DDL+=(20-rls-policies)
for name in "${DDL[@]}"; do
  echo "ddl/$name.sql"
  "${PSQL[@]}" -d "$DB" -f "$DIR/ddl/$name.sql" >/dev/null
done

echo "apply.sh: done (full=$FULL db=$DB)"
