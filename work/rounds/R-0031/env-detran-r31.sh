#!/usr/bin/env bash
# Source this file, then select a disposable database for one R-0031 test group.
# No connection or database creation happens here.

r31_set_db() {
  case "${1:-}" in
    characterization|clinical|regulatory|final)
      export DB_NAME="detran_r31_${1}"
      : "${DB_HOST:=localhost}"
      : "${DB_PORT:=5432}"
      : "${DB_USER:=postgres}"
      : "${DB_PASSWORD:=postgres}"
      export DB_HOST DB_PORT DB_USER DB_PASSWORD
      export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
      export DETRAN_TEST_DATABASE_URL="$DATABASE_URL"
      export STYNX_OWNER_DATABASE_URL="$DATABASE_URL"
      export STYNX_APP_DATABASE_URL="${DATABASE_URL}?options=-c%20role%3Drole_app_backend"
      export STYNX_READER_DATABASE_URL="$STYNX_APP_DATABASE_URL"
      ;;
    *)
      echo 'R-0031: expected characterization, clinical, regulatory, or final' >&2
      return 2
      ;;
  esac
}
