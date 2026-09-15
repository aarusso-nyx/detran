# Ambiente do banco da rodada R-0008 (equivalente ao job backend-kernel do CI).
# Uso: source work/rounds/R-0008/env-detran-r8.sh
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r8
export DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r8
export STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r8
export STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r8?options=-c%20role%3Drole_app_backend'
export STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r8?options=-c%20role%3Drole_app_backend'
