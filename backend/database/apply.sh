#!/usr/bin/env bash
set -euo pipefail

rait_db_name=${DB_NAME:-detran}
rait_db_host=${DB_HOST:-localhost}
rait_db_port=${DB_PORT:-5432}
rait_db_user=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-}
[[ "$rait_db_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || { echo "invalid DB_NAME identifier" >&2; exit 2; }
rait_full=0
for rait_argument in "$@"; do
  case "$rait_argument" in
    --full) rait_full=1 ;;
    *) echo "unknown flag: $rait_argument" >&2; exit 2 ;;
  esac
done
if [[ "$rait_full" = 1 ]]; then
  case "$rait_db_name" in
    detran_r7_ctg1_a2)
      [[ "${DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED:-}" = 1 ]] || {
        echo "--full requires explicit disposable detran_r7_ctg1_a2 rehearsal authorization" >&2
        exit 2
      }
      ;;
    detran_r13)
      [[ "${DETRAN_R13_FULL_AUTHORIZED:-}" = 1 ]] || {
        echo "--full requires explicit disposable detran_r13 rehearsal authorization" >&2
        exit 2
      }
      ;;
    detran_local_stack)
      [[ "${DETRAN_LOCAL_STACK_FULL_AUTHORIZED:-}" = 1 ]] || {
        echo "--full requires explicit detran local stack authorization" >&2
        exit 2
      }
      ;;
    *)
      echo "--full is not authorized for database: $rait_db_name" >&2
      exit 2
      ;;
  esac
fi
rait_directory="$(cd "$(dirname "$0")" && pwd)"
# The fixed runner validates installed bytes and the closed SQL inventory before
# any connection. Normal and --full share the maintenance postgres session lock;
# recreation, the Node-owned target transaction and read-only verifiers stay inside it.
export DB_NAME="$rait_db_name" DB_HOST="$rait_db_host" DB_PORT="$rait_db_port" DB_USER="$rait_db_user"
node --input-type=module - "$rait_directory/../.." "$rait_full" <<'NODE'
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(process.argv[2]);
const { runStorageApply } = await import(pathToFileURL(path.join(root, 'tools/stynx-storage-public-install.mjs')));
await runStorageApply(root, { full: process.argv[3] === '1' });
NODE
