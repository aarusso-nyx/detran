#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${DETRAN_STACK_STATE_DIR:-${TMPDIR:-/tmp}/detran-stack}"
LOG_DIR="$STATE_DIR/logs"
PID_DIR="$STATE_DIR/pids"
PROXY_CONFIG="$ROOT_DIR/tools/detran-stack.proxy.json"

DETRAN_DB_IMAGE_REQUESTED="${DETRAN_DB_IMAGE+x}"
DB_HOST_REQUESTED="${DB_HOST+x}"
DB_PORT_REQUESTED="${DB_PORT+x}"
DB_USER_REQUESTED="${DB_USER+x}"
DETRAN_BACKEND_PORT_REQUESTED="${DETRAN_BACKEND_PORT+x}"

DB_CONTAINER="${DETRAN_DB_CONTAINER:-detran-local-stack-postgres}"
DB_IMAGE='postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5'
DB_VOLUME="${DETRAN_DB_VOLUME:-detran-local-stack-postgres}"
DB_HOST='127.0.0.1'
DB_PORT='5432'
DB_USER='postgres'
DB_PASSWORD="${DB_PASSWORD:-postgres}"
STACK_DB_NAME="detran_local_stack"
REQUESTED_DB_NAME="${DB_NAME:-$STACK_DB_NAME}"
DB_NAME="$STACK_DB_NAME"

MOCK_COMPOSE_FILE="$ROOT_DIR/senatran-mock/docker-compose.yml"
MOCK_OVERRIDE_FILE="$ROOT_DIR/tools/stack/senatran-mock.compose.yml"
MOCK_PROJECT="${DETRAN_MOCK_PROJECT:-detran-senatran-mock}"
BACKEND_PORT='3001'

declare -a FRONTEND_NAMES=(portal rait dashboard teat pec)
declare -a FRONTEND_DIRS=(
  "$ROOT_DIR/apps/portal/web"
  "$ROOT_DIR/apps/rait/web"
  "$ROOT_DIR/apps/dashboard/web"
  "$ROOT_DIR/apps/teat/web"
  "$ROOT_DIR/apps/pec/web"
)
declare -a FRONTEND_PORTS=(4200 4201 4202 4203 4204)
declare -a FRONTEND_PROJECTS=(
  'portal-web'
  'rait-web'
  'dashboard-web'
  'teat-web'
  'pec-web'
)
declare -a FRONTEND_STATES=(active active active active not_built_r0031)

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
  config             Print resolved, secret-free stack configuration as JSON
  health             Probe active backend, mock and frontend HTTP endpoints
  db-reset           Recreate disposable DB detran_local_stack and apply fresh seed
  help               Show this help

Environment overrides:
  DETRAN_STACK_STATE_DIR, DETRAN_STACK_HEALTH_TIMEOUT_SECONDS,
  DETRAN_DB_CONTAINER, DETRAN_DB_VOLUME, DB_PASSWORD, DETRAN_MOCK_PROJECT,
  DETRAN_RUNTIME_PROFILE, DETRAN_LOCAL_TENANT_ID, DETRAN_LOCAL_ACTOR_ID,
  DETRAN_LOCAL_ROLES, DETRAN_LOCAL_CPF, DETRAN_LOCAL_ASSURANCE_LEVEL,
  SENATRAN_PROVIDER, SENATRAN_MOCK_BASE_URL,
  SENATRAN_MOCK_CPF_USUARIO, SENATRAN_MOCK_CLIENT_CERT_CN

The script never removes Docker volumes. Use `db-reset` only for the disposable
DB detran_local_stack.
EOF
}

die() {
  echo "detran-stack: $*" >&2
  exit 1
}

validate_database_name() {
  [[ "$REQUESTED_DB_NAME" == "$STACK_DB_NAME" ]] || die "stack database is restricted to DB_NAME=$STACK_DB_NAME"
}

health_timeout() {
  local timeout="${DETRAN_STACK_HEALTH_TIMEOUT_SECONDS:-120}"
  [[ "$timeout" =~ ^[0-9]+$ && "$timeout" -ge 1 && "$timeout" -le 600 ]] || die "DETRAN_STACK_HEALTH_TIMEOUT_SECONDS must be an integer from 1 to 600"
  printf '%s\n' "$timeout"
}

require_unset() {
  local variable="$1" requested=''
  case "$variable" in
    DETRAN_DB_IMAGE) requested="$DETRAN_DB_IMAGE_REQUESTED" ;;
    DB_HOST) requested="$DB_HOST_REQUESTED" ;;
    DB_PORT) requested="$DB_PORT_REQUESTED" ;;
    DB_USER) requested="$DB_USER_REQUESTED" ;;
    DETRAN_BACKEND_PORT) requested="$DETRAN_BACKEND_PORT_REQUESTED" ;;
  esac
  if [[ -n "$requested" ]]; then
    die "$variable is not a valid stack override"
  fi
}

validate_runtime_profile() {
  [[ "${DETRAN_RUNTIME_PROFILE:-local-sandbox}" == local-sandbox ]] || die "DETRAN_RUNTIME_PROFILE must be local-sandbox"
  [[ "${SENATRAN_PROVIDER:-mock}" == mock ]] || die "SENATRAN_PROVIDER must be mock"
  [[ "${SENATRAN_MOCK_BASE_URL:-http://127.0.0.1:3000}" =~ ^http://(127\.0\.0\.1|localhost)(:[0-9]{1,5})?(/.*)?$ ]] || die "SENATRAN_MOCK_BASE_URL must be an HTTP loopback URL without userinfo"
}

validate_stack_environment() {
  local variable
  for variable in DETRAN_DB_IMAGE DB_HOST DB_PORT DB_USER DETRAN_BACKEND_PORT; do
    require_unset "$variable"
  done
  validate_database_name
  health_timeout >/dev/null
  validate_runtime_profile
}

ensure_state_dirs() {
  mkdir -p "$LOG_DIR" "$PID_DIR"
}

mock_disabled() {
  [[ -f "$STATE_DIR/mock.disabled" ]]
}

set_mock_disabled() {
  ensure_state_dirs
  : >"$STATE_DIR/mock.disabled"
}

clear_mock_disabled() {
  rm -f "$STATE_DIR/mock.disabled"
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

database_env_array() {
  DATABASE_ENV=(
    "DB_HOST=$DB_HOST"
    "DB_PORT=$DB_PORT"
    "DB_USER=$DB_USER"
    "DB_PASSWORD=$DB_PASSWORD"
    "DB_NAME=$DB_NAME"
  )
}

frontend_command() {
  local name="$1" directory="$2" port="$3" project="$4" build_target=''
  [[ "$name" == rait ]] && build_target=' --build-target rait-web:build:development'
  printf 'cd %q && env NG_CLI_ANALYTICS=false pnpm exec ng serve --configuration development --host 127.0.0.1 --port %q --proxy-config %q %q%s' \
    "$directory" "$port" "$PROXY_CONFIG" "$project" "$build_target"
}

config_stack() {
  local timeout mock_state='active' frontend_json='' index state command
  timeout="$(health_timeout)"
  mock_disabled && mock_state='disabled'
  for index in "${!FRONTEND_NAMES[@]}"; do
    state="${FRONTEND_STATES[$index]}"
    command=''
    if [[ "$state" == active ]]; then
      command="$(frontend_command "${FRONTEND_NAMES[$index]}" "${FRONTEND_DIRS[$index]}" "${FRONTEND_PORTS[$index]}" "${FRONTEND_PROJECTS[$index]}")"
    fi
    frontend_json+="$(node -e 'const [name,directory,port,project,state,command]=process.argv.slice(1); process.stdout.write(JSON.stringify({name,directory,port:Number(port),project,state,...(command?{command}:{})}))' "${FRONTEND_NAMES[$index]}" "apps/${FRONTEND_NAMES[$index]}/web" "${FRONTEND_PORTS[$index]}" "${FRONTEND_PROJECTS[$index]}" "$state" "$command"),"
  done
  frontend_json="[${frontend_json%,}]"
  node - "$STATE_DIR" "$DB_CONTAINER" "$DB_VOLUME" "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_NAME" "$DB_IMAGE" "$timeout" "$mock_state" "$frontend_json" <<'NODE'
const [stateDir, container, volume, host, port, user, name, image, timeout, mockState, frontends] = process.argv.slice(2);
const config = {
  schema: 'detran-stack-config/v1', state_dir: stateDir,
  database: { container, volume, host, port: Number(port), user, name, image, platform: 'linux/amd64' },
  seed: { profile: 'fresh' }, timeouts: { health_seconds: Number(timeout) },
  services: {
    backend: { state: 'active', host: '127.0.0.1', port: 3001, health: ['/healthz', '/readyz'] },
    senatran_mock: { state: mockState, host: '127.0.0.1', port: 3000, health: ['/health'] },
    frontends: JSON.parse(frontends),
  },
  providers: {
    senatran: { provider: 'mock', state: 'adapter_only' },
    sefaz: { state: 'pending', decision: 'OD-R17-001' },
    pades: { state: 'proposed_off', decision: 'OD-R17-002' },
    biometrics: { state: 'proposed_off', decision: 'OD-R17-002' },
    council: { state: 'proposed_off', decision: 'OD-R17-002' },
    bank: { provider: 'createMockBankPort', state: 'in_process' },
    normative_signer: { provider: 'local-unsigned', state: 'in_process' },
    authentication: { provider: 'DetranLocalTokenVerifier', state: 'in_process' },
    vapid: { state: 'source_pending', decision: 'OD-P88' },
    sne: { provider: 'mock', state: 'adapter_only' },
  },
};
process.stdout.write(JSON.stringify(config, null, 2) + '\n');
NODE
}

container_exists() {
  docker ps --all --filter "name=^/${DB_CONTAINER}$" --format '{{.Names}}' 2>/dev/null | grep -Fx "$DB_CONTAINER" >/dev/null
}

container_running() {
  docker ps --filter "name=^/${DB_CONTAINER}$" --format '{{.Names}}' 2>/dev/null | grep -Fx "$DB_CONTAINER" >/dev/null
}

start_database() {
  local timeout
  timeout="$(health_timeout)"
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

  for _ in $(seq 1 "$timeout"); do
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
  validate_database_name
  start_database
  database_env_array
  if ! database_exists || ! database_roles_exist; then
    log "initializing disposable database $DB_NAME"
    env "${DATABASE_ENV[@]}" DETRAN_LOCAL_STACK_FULL_AUTHORIZED=1 pnpm --dir "$ROOT_DIR" backend:db:reset
  else
    log "applying current DDL to existing database $DB_NAME"
    env "${DATABASE_ENV[@]}" pnpm --dir "$ROOT_DIR" backend:db:apply
  fi
  seed_database
}

reset_database() {
  validate_database_name
  start_database
  database_env_array
  log "resetting disposable database $DB_NAME"
  env "${DATABASE_ENV[@]}" DETRAN_LOCAL_STACK_FULL_AUTHORIZED=1 pnpm --dir "$ROOT_DIR" backend:db:reset
  seed_database
}

mock_start() {
  [[ -f "$MOCK_COMPOSE_FILE" ]] || die "missing SENATRAN mock compose file"
  [[ -f "$MOCK_OVERRIDE_FILE" ]] || die "missing SENATRAN mock stack override"
  require_compose_version
  log "starting SENATRAN mock"
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" -f "$MOCK_OVERRIDE_FILE" up --build -d --wait
}

mock_stop() {
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" -f "$MOCK_OVERRIDE_FILE" down
}

mock_status() {
  docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" -f "$MOCK_OVERRIDE_FILE" ps
}

# The override relies on the Compose !override tag introduced in v2.24.4.
COMPOSE_MIN_VERSION='2.24.4'

require_compose_version() {
  local version major minor patch
  version="$(docker compose version --short 2>/dev/null || true)"
  version="${version#v}"
  IFS=. read -r major minor patch <<< "$version"
  if [[ ! "$major" =~ ^[0-9]+$ || ! "$minor" =~ ^[0-9]+$ || ! "$patch" =~ ^[0-9]+$ ]] ||
    (( major < 2 || (major == 2 && minor < 24) || (major == 2 && minor == 24 && patch < 4) )); then
    die "Docker Compose >= $COMPOSE_MIN_VERSION is required"
  fi
}

health_url() {
  curl --fail --silent --show-error --max-time 3 "$2" >/dev/null 2>&1
}

health_targets() {
  printf '%s\n' \
    'backend http://127.0.0.1:3001/healthz' \
    'backend http://127.0.0.1:3001/readyz'
  mock_disabled || printf '%s\n' 'senatran-mock http://127.0.0.1:3000/health'
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    [[ "${FRONTEND_STATES[$index]}" == active ]] && printf '%s http://127.0.0.1:%s/\n' "${FRONTEND_NAMES[$index]}" "${FRONTEND_PORTS[$index]}"
  done
}

health_stack() {
  local timeout started elapsed service url
  timeout="$(health_timeout)"
  started=$(date +%s)
  while :; do
    while read -r service url; do
      if ! health_url "$service" "$url"; then
        break
      fi
      service=''
    done < <(health_targets)
    [[ -z "$service" ]] && { log 'all active services are healthy'; return 0; }
    elapsed=$(( $(date +%s) - started ))
    if (( elapsed >= timeout )); then
      echo "health timeout: $service ($url)" >&2
      if [[ "$service" == senatran-mock ]]; then
        docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" -f "$MOCK_OVERRIDE_FILE" logs --tail=80 app >&2 || true
      else
        tail --lines=80 "$LOG_DIR/$service.log" >&2 || true
      fi
      return 1
    fi
    sleep 1
  done
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
  local log_file="$LOG_DIR/backend.log"
  log "starting backend on http://127.0.0.1:$BACKEND_PORT"
  (
    cd "$ROOT_DIR"
    local -a backend_env=(
      "PATH=$PATH"
      "HOME=${HOME:-/tmp}"
      "DETRAN_TEST_STUB_CALLS=${DETRAN_TEST_STUB_CALLS:-}"
      "DETRAN_RUNTIME_PROFILE=${DETRAN_RUNTIME_PROFILE:-local-sandbox}"
      "DETRAN_LOCAL_TENANT_ID=${DETRAN_LOCAL_TENANT_ID:-00000000-0000-7000-8000-00000000a001}"
      "DETRAN_LOCAL_ROLES=${DETRAN_LOCAL_ROLES:-technical-admin,agency-admin,field-agent,rait-coordinator,dash-operator}"
      "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
      "SENATRAN_PROVIDER=${SENATRAN_PROVIDER:-mock}"
      "SENATRAN_MOCK_BASE_URL=${SENATRAN_MOCK_BASE_URL:-http://127.0.0.1:3000}"
      "PORT=$BACKEND_PORT"
    )
    [[ -n "${DETRAN_LOCAL_ACTOR_ID+x}" ]] && backend_env+=("DETRAN_LOCAL_ACTOR_ID=$DETRAN_LOCAL_ACTOR_ID")
    [[ -n "${DETRAN_LOCAL_CPF+x}" ]] && backend_env+=("DETRAN_LOCAL_CPF=$DETRAN_LOCAL_CPF")
    [[ -n "${DETRAN_LOCAL_ASSURANCE_LEVEL+x}" ]] && backend_env+=("DETRAN_LOCAL_ASSURANCE_LEVEL=$DETRAN_LOCAL_ASSURANCE_LEVEL")
    [[ -n "${SENATRAN_MOCK_CPF_USUARIO+x}" ]] && backend_env+=("SENATRAN_MOCK_CPF_USUARIO=$SENATRAN_MOCK_CPF_USUARIO")
    [[ -n "${SENATRAN_MOCK_CLIENT_CERT_CN+x}" ]] && backend_env+=("SENATRAN_MOCK_CLIENT_CERT_CN=$SENATRAN_MOCK_CLIENT_CERT_CN")
    exec env -i "${backend_env[@]}" pnpm --filter @detran/app start
  ) >"$log_file" 2>&1 &
  echo $! >"$pid_file"
}

start_frontend() {
  local name="$1"
  local directory="$2"
  local port="$3"
  local project_name="$4"
  local -a ng_args=(--configuration development --host 127.0.0.1 --port "$port" --proxy-config "$PROXY_CONFIG" "$project_name")
  [[ "$name" == rait ]] && ng_args+=(--build-target rait-web:build:development)
  local pid_file
  pid_file="$(frontend_pid_file "$name")"
  pid_running "$pid_file" && { log "$name frontend already running"; return; }
  rm -f "$pid_file"
  log "starting $name frontend on http://127.0.0.1:$port"
  (
    cd "$directory"
    exec env -i \
      PATH="$PATH" \
      HOME="${HOME:-/tmp}" \
      DETRAN_TEST_STUB_CALLS="${DETRAN_TEST_STUB_CALLS:-}" \
      NG_CLI_ANALYTICS=false \
      pnpm exec ng serve "${ng_args[@]}"
  ) >"$LOG_DIR/$name.log" 2>&1 &
  echo $! >"$pid_file"
}

start_frontends() {
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    [[ "${FRONTEND_STATES[$index]}" == active ]] || continue
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
  local with_mock=1 mock_started=0
  if [[ "${1:-}" == --no-mock ]]; then
    with_mock=0
  elif [[ "${1:-}" != "" ]]; then
    die "unknown start option: $1"
  fi
  ensure_state_dirs
  if [[ "$with_mock" == 1 ]]; then
    clear_mock_disabled
  else
    set_mock_disabled
  fi
  require_runtime
  init_database
  [[ -f "$ROOT_DIR/backend/app/dist/main.js" ]] || build_stack
  if [[ "$with_mock" == 1 ]]; then
    if ! mock_start; then
      mock_stop >/dev/null 2>&1 || true
      return 1
    fi
    mock_started=1
  fi
  if ! start_backend || ! start_frontends || ! health_stack; then
    cleanup_failed_start "$mock_started"
    return 1
  fi
  log "stack started; run '$0 status' for URLs and health"
}

cleanup_failed_start() {
  local mock_started="$1" index
  for index in "${!FRONTEND_NAMES[@]}"; do
    stop_pid_file "$(frontend_pid_file "${FRONTEND_NAMES[$index]}")"
  done
  stop_pid_file "$(backend_pid_file)"
  [[ "$mock_started" == 1 ]] && mock_stop >/dev/null 2>&1 || true
}

stop_stack() {
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    stop_pid_file "$(frontend_pid_file "${FRONTEND_NAMES[$index]}")"
  done
  stop_pid_file "$(backend_pid_file)"
  clear_mock_disabled
  require_runtime
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
  echo "== detran stack =="
  if container_running; then
    echo "database: running ($DB_CONTAINER, $DB_HOST:$DB_PORT/$DB_NAME)"
  elif container_exists; then
    echo "database: stopped ($DB_CONTAINER, $DB_HOST:$DB_PORT/$DB_NAME)"
  else
    echo "database: not created ($DB_CONTAINER, $DB_HOST:$DB_PORT/$DB_NAME)"
  fi
  status_process backend "$(backend_pid_file)"
  local index
  for index in "${!FRONTEND_NAMES[@]}"; do
    if [[ "${FRONTEND_STATES[$index]}" == active ]]; then
      status_process "${FRONTEND_NAMES[$index]}" "$(frontend_pid_file "${FRONTEND_NAMES[$index]}")"
    else
      printf 'pec: não construído (R-0031)\n'
    fi
  done
  echo
  echo "== SENATRAN mock =="
  if mock_disabled; then
    echo 'senatran-mock: disabled'
  else
    echo "senatran-mock: Compose project $MOCK_PROJECT"
    mock_status || true
  fi
  echo
  echo "== URLs =="
  echo "backend:  http://127.0.0.1:$BACKEND_PORT/healthz"
  mock_disabled || echo 'mock:     http://127.0.0.1:3000/health'
  for index in "${!FRONTEND_NAMES[@]}"; do
    [[ "${FRONTEND_STATES[$index]}" == active ]] || continue
    printf '%s: http://127.0.0.1:%s\n' "${FRONTEND_NAMES[$index]}" "${FRONTEND_PORTS[$index]}"
  done
}

logs_stack() {
  local service="${1:-}"
  [[ -n "$service" ]] || die "usage: $0 logs <db|mock|backend|portal|rait|dashboard|teat>"
  case "$service" in
    db) docker logs --follow "$DB_CONTAINER" ;;
    mock) docker compose -p "$MOCK_PROJECT" -f "$MOCK_COMPOSE_FILE" -f "$MOCK_OVERRIDE_FILE" logs --follow --tail=100 ;;
    backend|portal|rait|dashboard|teat)
      tail -f "$LOG_DIR/$service.log"
      ;;
    *) die "unknown service: $service" ;;
  esac
}

command="${1:-help}"
shift || true
validate_stack_environment
case "$command" in
  start) start_stack "$@" ;;
  stop) [[ $# -eq 0 ]] || die "stop accepts no options"; stop_stack ;;
  restart) stop_stack; start_stack "$@" ;;
  status) [[ $# -eq 0 ]] || die "status accepts no options"; status_stack ;;
  logs) logs_stack "$@" ;;
  config) [[ $# -eq 0 ]] || die "config accepts no options"; config_stack ;;
  health) [[ $# -eq 0 ]] || die "health accepts no options"; health_stack ;;
  build) [[ $# -eq 0 ]] || die "build accepts no options"; require_command pnpm; build_stack ;;
  db-init) [[ $# -eq 0 ]] || die "db-init accepts no options"; require_runtime; init_database ;;
  db-reset) [[ $# -eq 0 ]] || die "db-reset accepts no options"; require_runtime; reset_database ;;
  help|-h|--help) usage ;;
  *) usage; die "unknown command: $command" ;;
esac
