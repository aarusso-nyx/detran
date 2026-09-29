#!/usr/bin/env bash
# Source this file, then select a disposable database for one R-0031 test group.
# No connection or database creation happens here.

r31_set_db() {
  case "${1:-}" in
    characterization|clinical|regulatory|final)
      export DB_NAME="detran_r31_${1}"
      ;;
    *)
      echo 'R-0031: expected characterization, clinical, regulatory, or final' >&2
      return 2
      ;;
  esac
}
