Tarefa: TASK-0011 (iteração 4)

Alterado somente `.github/workflows/ci.yml`. Trecho final do `backend-kernel`:

```yaml
  backend-kernel:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_DB: detran
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres -d detran"
          --health-interval 10s --health-timeout 5s --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/detran
      DETRAN_TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/detran
      STYNX_OWNER_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/detran
      STYNX_APP_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend
      STYNX_READER_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend
      DB_HOST: localhost
      DB_PORT: '5432'
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: detran
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - uses: pnpm/action-setup@f40ffcd9367d9f12939873eb1018b921a783ffaa # v4
        with:
          version: 9.15.0

      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: '24'
          cache: pnpm

      - name: Install dependencies
        env:
          NODE_AUTH_TOKEN: ${{ secrets.PACKAGES_READ_TOKEN }}
        run: pnpm install --frozen-lockfile

      - name: Apply unified backend DDL
        run: pnpm backend:db:reset

      - name: Load canonical fixtures (rait-fixtures.md; WP-A)
        run: bash backend/database/seed.sh

      - name: Verify controller decorators
        run: pnpm verify:decorators

      - name: Verify live RLS and audit persistence
        run: pnpm backend:rls-smoke

      - name: Verify blueprint regeneration has no drift
        run: pnpm blueprints:check

      - name: Run backend unit and integration tiers
        run: pnpm backend:test:unit && pnpm backend:test:integration

      - name: Verify SENATRAN boundary and generated contract drift
        run: |
          pnpm verify:senatran-boundary
          pnpm verify:senatran-contracts

      - name: Run SENATRAN adapter unit and HTTP integration tiers
        run: |
          pnpm --filter @detran/senatran-adapter test:unit
          pnpm --filter @detran/senatran-adapter test:integration

      - name: Run backend e2e and adapter contract tiers against the in-repo SENATRAN mock
        env:
          DB_NAME: senatran
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/senatran
          SENATRAN_MOCK_BASE_URL: http://127.0.0.1:3001
          PORT: '3001'
        run: |
          pnpm --dir senatran-mock db:reset
          pnpm --dir senatran-mock build
          node senatran-mock/dist/apps/api/src/main.js > /tmp/senatran-adapter-mock.log 2>&1 &
          mock_pid=$!
          trap 'kill "$mock_pid" 2>/dev/null || true' EXIT
          for attempt in $(seq 1 30); do
            if curl -fsS http://127.0.0.1:3001/health >/dev/null; then break; fi
            if [ "$attempt" = 30 ]; then
              cat /tmp/senatran-adapter-mock.log
              exit 1
            fi
            sleep 1
          done
          DB_NAME=detran \
          DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
          DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
          STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
          STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
          STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
          SENATRAN_PROVIDER=mock \
          pnpm backend:test:e2e
          pnpm --filter @detran/senatran-adapter test:e2e
```

`node_modules/.bin/prettier --check .github/workflows/ci.yml`: OK.

Bloqueios: nenhum. Não rodei suítes.

