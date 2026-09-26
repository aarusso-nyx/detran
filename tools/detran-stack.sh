#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${DETRAN_STACK_STATE_DIR:-${TMPDIR:-/tmp}/detran-stack}"
LOG_DIR="$STATE_DIR/logs"
PID_DIR="$STATE_DIR/pids"
PROXY_CONFIG="$ROOT_DIR/tools/detran-stack.proxy.json"

DB_CONTAINER="${DETRAN_DB_CONTAINER:-detran-postgres-demo}"
DB_IMAGE="${DETRAN_DB_IMAGE:-postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5}"
DB_VOLUME="${DETRAN_DB_VOLUME:-detran-postgres-demo}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-detran_r13}"

MOCK_COMPOSE_FILE="$ROOT_DIR/senatran-mock/docker-compose.yml"
MOCK_PROJECT="${DETRAN_MOCK_PROJECT:-detran-senatran-mock}"
BACKEND_PORT="${DETRAN_BACKEND_PORT:-3001}"

declare -a FRONTEND_NAMES=(portal rait dashboard teat)
declare -a FRONTEND_DIRS=(
  "$ROOT_DIR/apps/portal/web"
  "$ROOT_DIR/apps/rait/web"
  "$ROOT_DIR/apps/dashboard/web"
  "$ROOT_DIR/apps/teat/web"
)
declare -a FRONTEND_PORTS=(4200 4201 4202 4203)
declare -a FRONTEND_PROJECTS=(
  'portal-web'
  'rait-web'
  'dashboard-web'
  'teat-web'
)

mkdir -p "$LOG_DIR" "$PID_DIR"

usage() {
  cat <<'EOF'
Usage: tools/detran-stack.sh <command> [options]

Commands:
  start [--no-mock]  Start database, optional SENATRAN mock, backend and web apps
  stop               Stop only this project's processes and containers
  restart [--no-mock]
  status             Show managed processes, Docker services and URLs
  logs <service>     Follow logs: db|mock|backend|portal|rait|dashboard|teat
  build              Build the backend and its workspace dependencies
  db-init            Apply DDL and the fresh demonstration seed without reset
  db-reset           Recreate disposable DB detran_r13 and apply fresh seed
  help               Show this help

Environment overrides:
  DETRAN_STACK_STATE_DIR, DETRAN_DB_CONTAINER, DETRAN_DB_IMAGE,
  DETRAN_DB_VOLUME, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  DETRAN_BACKEND_PORT, DETRAN_MOCK_PROJECT

The script never removes Docker volumes. Use `db-reset` only for the disposable
DB configured by DB_NAME (default: detran_r13).
EOF
}

die() {
  echo "detran-stack: $*" >&2
  exit 1
}

log() {
  echo "detran-stack: $*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "command not found: $1"
}

require_runtime() {
  require_command docker
  require_command pnpm
  docker info >/dev/null 2>&1 || die "Docker Desktop is not running or is inaccessible"
}

database_env() {
  printf '%s\n' \
    "DB_HOST=$DB_HOST" \
    "DB_PORT=$DB_PORT" \
    "DB_USER=$DB_USER" \
    "DB_PASSWORD=$DB_PASSWORD" \
    "DB_NAME=$DB_NAME"
}

database_env_array() {
  DATABASE_ENV=(
    "DB_HOST=$DB_HOST"
    "DB_PORT=$DB_PORT"
    "DB_USER=$DB_USER"
    "DB_PASSWORD=$DB_PASSWORD"
    "DB_NAME=$DB_NAME"
  )
}

container_exists() {
  docker inspect "$DB_CONTAINER" >/dev/null 2>&1
}

container_running() {
  [[ "$(docker inspect --format '{{.State.Running}}' "$DB_CONTAINER" 2>/dev/null || true)" == true ]]
}

start_database() {
  if ! container_exists; then
    log "creating PostGIS container $DB_CONTAINER"
    docker volume inspect "$DB_VOLUME" >/dev/null 2>&1 || docker volume create "$DB_VOLUME" >/dev/null
    docker run --detach \
      --name "$DB_CONTAINER" \
      --platform linux/amd64 \
      --env POSTGRES_DB=postgres \
      --env POSTGRES_USER=postgres \
      --env "POSTGRES_PASSWORD=$DB_PASSWORD" \
      --publish "127.0.0.1:$DB_PORT:5432" \
      --volume "$DB_VOLUME:/var/lib/postgresql/data" \
      "$DB_IMAGE" >/dev/null
  elif ! container_running; then
    log "starting existing PostGIS container $DB_CONTAINER"
    docker start "$DB_CONTAINER" >/dev/null
  fi

  for _ in $(seq 1 60); do
    if docker exec "$DB_CONTAINER" pg_isready -U postgres -d postgres >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  docker logs --tail 80 "$DB_CONTAINER" >&2 || true
  die "PostGIS did not become ready"
}

database_exists() {
  docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atc \
    "select 1 from pg_database where datname = '$DB_NAME'" 2>/dev/null | grep -qx 1
}

database_roles_exist() {
  docker exec "$DB_CONTAINER" psql -X -U postgres -d "$DB_NAME" -Atc \
    "select count(*) from pg_roles where rolname in ('role_app_backend','role_auditor_min')" 2>/dev/null | grep -qx 2
}

seed_database() {
  database_env_array
  log "applying fresh demonstration seed to $DB_NAME"
  env "${DATABASE_ENV[@]}" SEED_PROFILE=fresh bash "$ROOT_DIR/backend/database/seed.sh"
}

init_database() {
  start_database
  database_env_array
  if ! database_exists || ! database_roles_exist; then
    log "initializing disposable database $DB_NAME"
    env "${DATABASE_ENV[@]}" DETRAN_R13_FULL_AUTHORIZED=1 pnpm --dir "$ROOT_DIR" backend:db:reset
  else
    log "applying current DDL to existing database $DB_NAME"
    env "${DATABASE_ENV[@]}" pnpm --dir "$ROOT_DIR" backend:db:apply
  fi
  seed_database
}

reset_database() {
  [[ "$DB_NAME" == detran_r13 ]] || die "db-reset is restricted to DB_NAME=detran_r13"
  start_database
  database_env_array
  log "resetting disposable database $DB_NAME"
  env "${DATABASE_ENV[@]}" DETRAN_R13_FULL_AUTHORIZED=1 pnpm --dir "$ROOT_DIR" backend:db:reset
  seed_database
}

mock_start() {
  [[ -f "$MOCK_COMPOSE_FILE" ]] || die "missing SENATRAN mock compose file"
  log "starting SENATRAN mock"
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" up --build -d
}

mock_stop() {
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" down
}

mock_status() {
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" ps
}

backend_pid_file() {
  echo "$PID_DIR/backend.pid"
}

frontend_pid_file() {
  echo "$PID_DIR/$1.pid"
}

pid_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 1
  local pid
  pid="$(<"$pid_file")"
  [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null
}

kill_tree() {
  local pid="$1"
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

stop_pid_file() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 0
  local pid
  pid="$(<"$pid_file")"
  if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
    kill_tree "$pid"
    for _ in $(seq 1 30); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.2
    done
  fi
  rm -f "$pid_file"
}

start_backend() {
  local pid_file
  pid_file="$(backend_pid_file)"
  pid_running "$pid_file" && { log "backend already running"; return; }
  rm -f "$pid_file"
  log_file="$LOG_DIR/backend.log"
  log "starting backend on http://127.0.0.1:$BACKEND_PORT"
  (
    cd "$ROOT_DIR"
    exec env \
      DETRAN_RUNTIME_PROFILE="${DETRAN_RUNTIME_PROFILE:-local-sandbox}" \
      DETRAN_LOCAL_TENANT_ID="${DETRAN_LOCAL_TENANT_ID:-00000000-0000-7000-8000-00000000a001}" \
      DETRAN_LOCAL_ROLES="${DETRAN_LOCAL_ROLES:-technical-admin,agency-admin,field-agent,rait-coordinator,dash-operator}" \
      DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" \
      SENATRAN_PROVIDER="${SENATRAN_PROVIDER:-mock}" \
      SENATRAN_MOCK_BASE_URL="${SENATRAN_MOCK_BASE_URL:-http://127.0.0.1:3000}" \
      PORT="$BACKEND_PORT" \
      pnpm --filter @detran/app start
  ) >"$log_file" 2>&1 &
  echo $! >"$pid_file"
}

start_frontend() {
  local name="$1"
  local directory="$2"
  local port="$3"
  local project_name="$4"
  local pid_file
  pid_file="$(frontend_pid_file "$name")"
  pid_running "$pid_file" && { log "$name frontend already running"; return; }
  rm -f "$pid_file"
  log "starting $name frontend on http://127.0.0.1:$port"
  (
    cd "$directory"
    exec env NG_CLI_ANALYTICS=false pnpm exec ng serve \
      --configuration development \
      --host 127.0.0.1 \
      --port "$port" \
      --proxy-config "$PROXY_CONFIG" \
      "$project_name"
  ) >"$LOG_DIR/$name.log" 2>&1 &
  echo $! >"$pid_file"
}

start_frontends() {
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    start_frontend \
      "${FRONTEND_NAMES[$index]}" \
      "${FRONTEND_DIRS[$index]}" \
      "${FRONTEND_PORTS[$index]}" \
      "${FRONTEND_PROJECTS[$index]}"
  done
}

build_stack() {
  log "building backend and workspace dependencies"
  pnpm --dir "$ROOT_DIR" build
}

start_stack() {
  local with_mock=1
  if [[ "${1:-}" == --no-mock ]]; then
    with_mock=0
  elif [[ "${1:-}" != "" ]]; then
    die "unknown start option: $1"
  fi
  require_runtime
  init_database
  [[ -f "$ROOT_DIR/backend/app/dist/main.js" ]] || build_stack
  if [[ "$with_mock" == 1 ]]; then mock_start; fi
  start_backend
  start_frontends
  log "stack started; run '$0 status' for URLs and health"
}

stop_stack() {
  require_runtime
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    stop_pid_file "$(frontend_pid_file "${FRONTEND_NAMES[$index]}")"
  done
  stop_pid_file "$(backend_pid_file)"
  mock_stop >/dev/null 2>&1 || true
  if container_running; then
    log "stopping PostGIS container $DB_CONTAINER"
    docker stop "$DB_CONTAINER" >/dev/null
  fi
  log "stack stopped; volumes preserved"
}

status_process() {
  local name="$1"
  local pid_file="$2"
  if pid_running "$pid_file"; then
    echo "$name: running (pid $(<"$pid_file"))"
  else
    echo "$name: stopped"
  fi
}

status_stack() {
  require_runtime
  echo "== detran stack =="
  if container_running; then
    echo "database: running ($DB_CONTAINER, $DB_HOST:$DB_PORT/$DB_NAME)"
  elif container_exists; then
    echo "database: stopped ($DB_CONTAINER)"
  else
    echo "database: not created ($DB_CONTAINER)"
  fi
  status_process backend "$(backend_pid_file)"
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    status_process "${FRONTEND_NAMES[$index]}" "$(frontend_pid_file "${FRONTEND_NAMES[$index]}")"
  done
  echo
  echo "== SENATRAN mock =="
  mock_status || true
  echo
  echo "== URLs =="
  echo "backend:  http://127.0.0.1:$BACKEND_PORT/healthz"
  echo "mock:     http://127.0.0.1:3000/health"
  echo "portal:   http://127.0.0.1:4200"
  echo "rait:     http://127.0.0.1:4201"
  echo "dashboard:http://127.0.0.1:4202"
  echo "teat:     http://127.0.0.1:4203"
}

logs_stack() {
  local service="${1:-}"
  [[ -n "$service" ]] || die "usage: $0 logs <db|mock|backend|portal|rait|dashboard|teat>"
  case "$service" in
    db) docker logs --follow "$DB_CONTAINER" ;;
    mock) docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" logs --follow --tail=100 ;;
    backend|portal|rait|dashboard|teat)
      tail -f "$LOG_DIR/$service.log"
      ;;
    *) die "unknown service: $service" ;;
  esac
}

command="${1:-help}"
shift || true
case "$command" in
  start) start_stack "$@" ;;
  stop) [[ $# -eq 0 ]] || die "stop accepts no options"; stop_stack ;;
  restart) stop_stack; start_stack "$@" ;;
  status) [[ $# -eq 0 ]] || die "status accepts no options"; status_stack ;;
  logs) logs_stack "$@" ;;
  build) [[ $# -eq 0 ]] || die "build accepts no options"; require_command pnpm; build_stack ;;
  db-init) [[ $# -eq 0 ]] || die "db-init accepts no options"; require_runtime; init_database ;;
  db-reset) [[ $# -eq 0 ]] || die "db-reset accepts no options"; require_runtime; reset_database ;;
  help|-h|--help) usage ;;
  *) usage; die "unknown command: $command" ;;
esac
