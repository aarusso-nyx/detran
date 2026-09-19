# TASK-0011 — iteração 4 (restrita, Codex): `ci.yml` do job `backend-kernel` conforme A21

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca specs, nunca
> `work/rounds/**`. Não rode suítes (o maestro está rodando `pnpm backend:test:ci` em paralelo).
> Ninguém responde durante a execução.

Papel: **Engineer** (Art. 6). Sua mudança em `.github/workflows/ci.yml` (tentativa 3,
`reports/TASK-0011-iteration-3.md`) enfraqueceu o gate e quebrou o mock — decisão **A21**
(`work/rounds/R-0014/plan.md` §Adendas — leia) e contrato `CTG-0004.md` §7.

Leitura: `plan.md` A21; `contracts/CTG-0004.md` §7; `.github/workflows/ci.yml` (job
`backend-kernel` inteiro, inclusive o `env:` do job nas l. 6–16); `git`-free: compare com a versão
anterior lendo `work/rounds/R-0014/reports/TASK-0011-iteration-3.md` §CI e o texto do passo
original transcrito abaixo; `senatran-mock/domain/shared/api/src/config/configuration.ts` l. 36–46
(`PORT` default 3000; `DATABASE_URL`/`DB_NAME`); `package.json` scripts `backend:test:*`.

Passo original (antes da sua mudança), para referência:

```yaml
      - name: Run backend unit, integration and e2e tiers
        run: pnpm backend:test:ci
      …
      - name: Run adapter contract tier against the in-repo SENATRAN mock
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
          for attempt in $(seq 1 30); do … curl -fsS http://127.0.0.1:3001/health … done
          pnpm --filter @detran/senatran-adapter test:e2e
```

Correção (só `.github/workflows/ci.yml`, job `backend-kernel`):

1. Passo "Run backend unit and integration tiers": `run: pnpm backend:test:unit && pnpm backend:test:integration`
   (todos os pacotes, como `backend:test:ci` fazia; só o tier e2e migra para o passo do mock).
2. Passo do mock: restaurar o bloco `env:` original (`DB_NAME: senatran`, `DATABASE_URL: …/senatran`,
   `SENATRAN_MOCK_BASE_URL: http://127.0.0.1:3001`, `PORT: '3001'`), renomear para
   "Run backend e2e and adapter contract tiers against the in-repo SENATRAN mock", manter
   `db:reset`, `build`, `node … &`, `mock_pid`, `trap`, espera pelo `/health`; e **antes** de
   `pnpm --filter @detran/senatran-adapter test:e2e` rodar o e2e do backend com o banco do backend
   restaurado por prefixo de comando (o `env:` do passo apontou tudo para `senatran`):
   ```sh
   DB_NAME=detran \
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
   DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
   STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran \
   STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
   STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran?options=-c%20role%3Drole_app_backend' \
   SENATRAN_PROVIDER=mock \
   pnpm backend:test:e2e
   ```
   (valores idênticos ao `env:` do job, l. 6–16 — copie de lá, não daqui, se divergirem).
3. Nada mais muda no arquivo. Valide: `node -e "require('yaml')"` não existe — use
   `node_modules/.bin/prettier --check .github/workflows/ci.yml` e uma leitura do YAML resultante
   (indentação de 2 espaços, `run: |` preservado).

Entrega (última mensagem, formato da TASK-0011, "Tarefa: TASK-0011 (iteração 4)"): o trecho final
do job `backend-kernel` transcrito, `prettier --check` OK, bloqueios (ou "nenhum").
