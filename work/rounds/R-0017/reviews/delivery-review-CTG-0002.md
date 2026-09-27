# Reviewer — `delivery-review` CTG-0002, ciclo 1

> Frente `local-stack`, R-0017. Papel constitucional: **Auditor** (Art. 18),
> modelo `claude-opus-5-5` da familia oposta. Somente leitura em
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Responda apenas JSON
> estrito. Este primeiro ciclo e exaustivo: liste todos os achados altos e
> baixos verificaveis, com arquivo e linha.
> Cada valor string deve ocupar uma unica linha JSON, sem quebras literais;
> escape aspas e barras conforme JSON. Nao use fences nem comentarios.

## Fontes fechadas

1. `docs/meta/agents/orchestra/README.md` §4–5 e
   `docs/meta/agents/README.md` §Regras comuns.
2. `work/campaigns/C-0002-consolidacao.md` §2 (R-0017) e §4;
   `work/rounds/R-0017/plan.md` §Metas, §Tarefas, §Criterios, §Mapa,
   §Adendas A4–A6, §Decisoes do maestro e §Triagem.
3. `work/rounds/R-0017/contracts/CTG-0002.md` inteiro, inclusive A6;
   `docs/meta/knowledge-base/open-decisions-rait.md` somente §R-0017.
4. `work/rounds/R-0017/reports/TASK-0004.md`,
   `TASK-0004-characterization.md`, `TASK-0005-escalation.md`,
   `TASK-0006.md`, `TASK-0006-maestro-adenda.md`, `TASK-0007.md`,
   `TASK-0007-retry-1.md` e `TASK-0007-maestro-adenda.md`.
5. `git diff --stat HEAD` e `git diff HEAD --` para `backend/database/seed.sh`,
   `backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`,
   `package.json`, `tools/detran-stack.sh`, `tools/stack/revision.test.mjs`,
   `work/rounds/R-0017/plan.md` e
   `docs/meta/knowledge-base/open-decisions-rait.md`. Leia tambem os novos,
   ainda nao rastreados: `backend/database/seed/{40-fixtures-rait-org-fresh-local-stack,60-fixtures-rait-integration-fresh-local-stack}.sql`,
   `tools/stack/{ch-fixture,portal-fixture}.sh`,
   `tools/stack/{contract.test,sefaz-adapter-smoke,smoke}.mjs` e
   `tools/stack/mocks/sefaz-mock.mjs`. Nao avalie outros arquivos de rounds.

Gates ja medidos: spec RAIT scratch 3/3 no relatorio TASK-0006; `pnpm
test:stack` 50/50 apos A6; smoke live 42/42, quatro proxies, mock SEFAZ e
tres adapters CH off, com `stack:stop` e sem processo remanescente. O
`pnpm check` pos-A6 esta em curso; `pnpm docs:check` e
`pnpm ci:backend-kernel:local` finais ainda pendem. O RC local exige
worktree limpa apos commit/push; nao o classifique como verde agora. O
checkpoint formal (b) em worktree limpa tambem segue pendente.

## Rubrica

1. Triade, papeis e locks respeitados; A6 autorizada pelo Owner e critério
   historico de fonte nao apagado ou declarado cumprido.
2. C-02-01: perfil `fresh-local-stack` fechado, so 19 arquivos, sem mudar
   `fresh`/`legacy-upgrade`; fixtures RAIT locais e FKs validas, idempotentes.
3. C-02-02/03: mock SEFAZ compativel com seis operacoes do adapter, somente
   loopback e dados de teste; start/stop/status/health/timeout coerentes.
4. C-02-04: PAdES, biometria e conselho explicitamente off; 503 exato
   apenas no adapter, via proxy com precondicoes, ator e roles corretos;
   falha anterior bloqueia.
5. C-02-05/A6: quatro roots e GET `/v1` pelos proxies, tenant/ID concreto,
   policy sem relaxamento, JSON nao vazio; fixture Portal so no banco
   descartavel e fora de todos os perfis canonicos; guarda antes de SQL.
6. C-02-06/07: evidencia sem credencial, relatorio final completo,
   compatibilidade dos sensores antigos; nenhum teste afrouxado, nenhum
   arquivo gerado editado a mao, nenhum externo real.
7. Registre qualquer risco operacional real nao coberto, mas nao trate os
   gates pendentes como falha de codigo nem os declare PASS.

`PASS` sem achado `high`; `REVIEW` com `high` corrigivel; `FAIL` apenas para
contradicao canonica/Owner/ADR/Constituicao ou violacao de fronteira.

## Saida

```json
{
  "mode": "delivery-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "tools/stack/smoke.mjs",
      "line": 1,
      "claim": "descricao verificavel",
      "fix": "correcao precisa"
    }
  ],
  "notes": ["observacoes curtas"]
}
```
