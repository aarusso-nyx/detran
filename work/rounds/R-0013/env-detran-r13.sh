# Ambiente isolado da rodada R-0013, equivalente ao job backend-kernel do CI.
# Uso: source work/rounds/R-0013/env-detran-r13.sh
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r13
export DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r13
export STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r13
export STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r13?options=-c%20role%3Drole_app_backend'
export STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r13?options=-c%20role%3Drole_app_backend'
export DB_NAME=detran_r13
export DB_PASSWORD=postgres
export DETRAN_R13_FULL_AUTHORIZED=1
