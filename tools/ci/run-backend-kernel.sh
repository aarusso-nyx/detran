#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${DETRAN_TEST_DATABASE_URL:?DETRAN_TEST_DATABASE_URL is required}"
: "${DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL:?DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL is required}"
: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:?DB_PORT is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_NAME:?DB_NAME is required}"

group_start() {
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "::group::$1"
  else
    echo "==> $1"
  fi
}

group_end() {
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "::endgroup::"
  fi
}

group_start "Apply unified backend DDL and canonical fixtures"
pnpm backend:db:reset
bash backend/database/seed.sh
group_end

group_start "Run deterministic backend sensors"
pnpm verify:decorators
pnpm backend:rls-smoke
pnpm blueprints:check
group_end

group_start "Run backend unit and integration tiers"
pnpm backend:test:unit
pnpm backend:test:prepare-legacy
pnpm backend:test:integration
group_end

group_start "Verify SENATRAN boundary and run adapter tiers"
pnpm verify:senatran-boundary
pnpm verify:senatran-contracts
pnpm --filter @detran/senatran-adapter test:unit
pnpm --filter @detran/senatran-adapter test:integration
group_end

mock_port="${SENATRAN_MOCK_PORT:-3001}"
mock_log="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/detran-senatran-adapter-mock-${$}.log"
mock_pid=""
cleanup_mock() {
  if [[ -n "$mock_pid" ]]; then
    kill "$mock_pid" 2>/dev/null || true
    wait "$mock_pid" 2>/dev/null || true
  fi
}
trap cleanup_mock EXIT

group_start "Run backend E2E, upgrade and adapter contract tiers"
env \
  DB_NAME=senatran \
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/senatran" \
  pnpm --dir senatran-mock db:reset
pnpm --dir senatran-mock build
env \
  DB_NAME=senatran \
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/senatran" \
  PORT="$mock_port" \
  node senatran-mock/dist/apps/api/src/main.js >"$mock_log" 2>&1 &
mock_pid=$!

for attempt in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${mock_port}/health" >/dev/null; then
    break
  fi
  if ! kill -0 "$mock_pid" 2>/dev/null; then
    cat "$mock_log"
    exit 1
  fi
  if [[ "$attempt" == "60" ]]; then
    cat "$mock_log"
    exit 1
  fi
  sleep 1
done

backend_env=(
  DB_NAME=detran_r7_ctg1_a2
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/detran_r7_ctg1_a2"
  DETRAN_TEST_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/detran_r7_ctg1_a2"
  STYNX_OWNER_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/detran_r7_ctg1_a2"
  "STYNX_APP_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend"
  "STYNX_READER_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD:-}@${DB_HOST}:${DB_PORT}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend"
  SENATRAN_PROVIDER=mock
  "SENATRAN_MOCK_BASE_URL=http://127.0.0.1:${mock_port}"
)
env "${backend_env[@]}" pnpm backend:test:prepare-legacy
env "${backend_env[@]}" pnpm backend:test:e2e
env "${backend_env[@]}" pnpm backend:test:upgrade
env "SENATRAN_MOCK_BASE_URL=http://127.0.0.1:${mock_port}" \
  pnpm --filter @detran/senatran-adapter test:e2e
group_end
