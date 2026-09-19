# Ambiente do banco da rodada R-0014 (equivalente ao job backend-kernel do CI).
# Uso: source work/rounds/R-0014/env-detran-r14.sh
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r14
export DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r14
export STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r14
export STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r14?options=-c%20role%3Drole_app_backend'
export STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r14?options=-c%20role%3Drole_app_backend'
export DB_NAME=detran_r14
export DB_PASSWORD=postgres
# Mock nacional em processo (plan A13(f)/M18; mesmo trecho do job backend-kernel do CI).
export SENATRAN_PROVIDER=mock
export SENATRAN_MOCK_BASE_URL=http://127.0.0.1:3001
