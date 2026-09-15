# Reviewer — correção do sensor CI (`ops-agency`, R-0005, CTG-0001)

Papel constitucional: **Auditor**. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda somente com JSON RFC 8259
estrito, sem fences, crases ou comentários; primeiro byte `{`, último `}`.

## Objetivo fechado

Revise a correção feita após o primeiro run do PR #40. O job `backend-kernel` usava apenas
`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran`; o `AppModule` reutilizou essa
URL para seus pools app/reader, e o teste cross-tenant recebeu uma linha de outro tenant porque o
superuser contorna RLS. A correção declara `STYNX_OWNER_DATABASE_URL` com postgres e declara
`STYNX_APP_DATABASE_URL`/`STYNX_READER_DATABASE_URL` com a mesma conexão de sessão mais
`options=-c role=role_app_backend`.

Confirme que a mudança faz o teste do request path exercer RLS sob o papel não-superuser, sem
enfraquecer teste, DDL, política, gate ou evidência, e que o primeiro FAIL não foi ocultado.

## Leitura e comandos permitidos

Leia somente:

1. `.github/workflows/ci.yml`.
2. `backend/app/src/detran-runtime.ts` na função `detranDataOptions`.
3. `backend/database/ddl/01-schemas.sql` e `backend/database/ddl/20-rls-policies.sql`.
4. `backend/app/tests/e2e/ops-modules.e2e.spec.ts`.
5. `work/rounds/R-0005/evidence-CTG-0001-ci-correction.json`.
6. `record/proofs/work/generic/R-0005.jsonl`, `record/proofs/chain.json` e
   `work/rounds/R-0005/plan.md`.
7. O diff `35034fa1bb0b8748caf6c2a141956751480fd6a7..7a62d8f` e `git status --short`.

Use somente comandos read-only (`git diff`, `git status`, `rg`, `sed`, `jq`, `shasum`). Não rode
gates, não consulte sistemas externos e não escreva arquivos.

## Evidência observada pelo maestro

- PR #40, run 34900620022, job 104165432437: DDL, decorators, RLS smoke e blueprint drift
  passaram; `backend:test:ci` falhou somente em
  `ops-modules.e2e.spec.ts` porque a leitura com tenant local recebeu a fixture do outro tenant.
- A causa é coerente com `detranDataOptions`: em perfil local/test, app e reader caem no mesmo
  `DATABASE_URL` quando as URLs STYNX não são definidas.
- Após declarar as três URLs exatamente como no workflow corrigido, uma execução focal do app e2e
  passou 12/12 e a reexecução integral de `pnpm backend:test:ci` passou, incluindo app unit 54/54,
  app integration 11/11, app e2e 12/12, ops-parameter unit 57/57 e integration 1/1.
- Nenhum teste, DDL ou arquivo gerado mudou.
- A sequência 4 preserva o primeiro resultado como FAIL classificado `sensor-error`, registra a
  correção e a reexecução; a cadeia verifica com head
  `c7f24be7f6dcd89a9fb726d1bc1bc93af1233732521e9c9b2a6a5e1278bddf5a`.

`PASS` exige zero high. Considere high qualquer bypass RLS ainda possível no pool app/reader,
configuração inválida para node-postgres/PostgreSQL, ocultação do FAIL, enfraquecimento de gate ou
evidência inconsistente. Preserve lows sem rebaixar severidade.

{
"mode": "delivery-review-ci-correction",
"round": "R-0005",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 1,
"file": "path",
"line": 1,
"claim": "plain text",
"fix": "plain text"
}
],
"notes": ["plain text"]
}
