#!/usr/bin/env bash
# Applies one closed, idempotent fixture profile after apply.sh.  The fresh profile
# deliberately contains no legacy RAIT history; legacy-upgrade is for an existing
# 20-case fixture baseline only.
set -euo pipefail

rait_db_name=${DB_NAME:-detran}
rait_db_host=${DB_HOST:-localhost}
rait_db_port=${DB_PORT:-5432}
rait_db_user=${DB_USER:-postgres}
rait_seed_profile=${SEED_PROFILE:-fresh}
export PGPASSWORD=${DB_PASSWORD:-}

if [[ ! "$rait_db_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  echo "invalid DB_NAME identifier: $rait_db_name" >&2
  exit 2
fi

rait_directory="$(cd "$(dirname "$0")" && pwd)"
case "$rait_seed_profile" in
  fresh)
    rait_seed_files=(
      00-fixtures-core.sql
      05-parameters.sql
      10-fixtures-inf-ait.sql
      21-fixtures-rait-fresh.sql
      25-fixtures-teat.sql
      30-fixtures-infraction.sql
      50-fixtures-collection.sql
    )
    ;;
  legacy-upgrade)
    rait_seed_files=(
      00-fixtures-core.sql
      05-parameters.sql
      10-fixtures-inf-ait.sql
      20-fixtures-rait.sql
      25-fixtures-teat.sql
      30-fixtures-infraction.sql
      40-fixtures-rait-org.sql
      50-fixtures-collection.sql
      60-fixtures-rait-integration.sql
    )
    ;;
  *)
    echo "invalid SEED_PROFILE: $rait_seed_profile (expected fresh or legacy-upgrade)" >&2
    exit 2
    ;;
esac

for rait_seed_file in "${rait_seed_files[@]}"; do
  if [[ ! -f "$rait_directory/seed/$rait_seed_file" ]]; then
    echo "missing closed seed file: seed/$rait_seed_file" >&2
    exit 2
  fi
done

rait_psql=(psql -X -v ON_ERROR_STOP=1 -q -h "$rait_db_host" -p "$rait_db_port" -U "$rait_db_user" -d "$rait_db_name")
if [[ "$rait_seed_profile" == legacy-upgrade ]]; then
  rait_legacy_case_count="$("${rait_psql[@]}" -Atc "
    SELECT count(*)
    FROM inf.rait_case
    WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
      AND id = ANY (ARRAY[
        '00000000-0000-7000-8000-000010000001',
        '00000000-0000-7000-8000-000010000002',
        '00000000-0000-7000-8000-000010000003',
        '00000000-0000-7000-8000-000010000004',
        '00000000-0000-7000-8000-000010000005',
        '00000000-0000-7000-8000-000010000006',
        '00000000-0000-7000-8000-000010000007',
        '00000000-0000-7000-8000-000010000008',
        '00000000-0000-7000-8000-000010000009',
        '00000000-0000-7000-8000-000010000010',
        '00000000-0000-7000-8000-000010000011',
        '00000000-0000-7000-8000-000010000012',
        '00000000-0000-7000-8000-000010000013',
        '00000000-0000-7000-8000-000010000014',
        '00000000-0000-7000-8000-000010000015',
        '00000000-0000-7000-8000-000010000016',
        '00000000-0000-7000-8000-000010000017',
        '00000000-0000-7000-8000-000010000018',
        '00000000-0000-7000-8000-000010000019',
        '00000000-0000-7000-8000-000010000020'
      ]::uuid[])
  ")"
  if [[ "$rait_legacy_case_count" != 20 ]]; then
    echo "legacy-upgrade requires all 20 existing legacy RAIT cases; found $rait_legacy_case_count" >&2
    exit 2
  fi
fi

rait_arguments=(--single-transaction)
for rait_seed_file in "${rait_seed_files[@]}"; do
  echo "seed/$rait_seed_file"
  rait_arguments+=(-f "$rait_directory/seed/$rait_seed_file")
done
"${rait_psql[@]}" "${rait_arguments[@]}" >/dev/null
# psql only returns successfully after the profile's single transaction commits.
echo "seed.sh: done (profile=$rait_seed_profile db=$rait_db_name)"
