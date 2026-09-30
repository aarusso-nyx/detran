# R-0026 — autorização do Owner

status: active

GRANTED — autorização expressa do Owner para abertura antecipada de R-0026 (`dashboard-wiring`),
limitada às tarefas liberadas pela adenda A-C2-15 (`work/campaigns/C-0002-consolidacao.md` §16).
Estes marcadores não ampliam o escopo.

Papel: Architect (maestro Opus 5.5, Claude Code). Fonte: prompt da sessão B do Owner, colado nesta
sessão em 2026-09-29 (America/Sao_Paulo), datado pelo Owner de 2026-09-30: "O Owner autoriza em
2026-09-30 a abertura antecipada dessas rodadas, limitada às tarefas liberadas". PR #161
(`docs/c0002-a-c2-15`) ainda aberto no bootstrap: o prompt vale como texto da A-C2-15.

## Escopo autorizado

- **Tarefas liberadas (todas documentos, nenhum código):** TASK-0001 (mapas de leitura e de
  comando, triagem OD-D16-001…019, decisões OD-D33/D35/D58, nível-alvo das 22 rotas), TASK-0002
  (build pack §4, route contract §6, catálogo de erros e i18n), TASK-0003 (`contracts/CTG-0002.md`;
  job de relatórios sobre `@stynx-nyx/jobs` 1.5.x com ator técnico, UPS-JOB), TASK-0006
  (`contracts/CTG-0003.md`; transporte marcado "pendente do outbox de R-0022 (stynx #316)").
- **Esperam:** TASK-0004/0005 (job e `@stynx-nyx/jobs` 1.5.x / R-0024), TASK-0007/0008 (outbox de
  R-0022), TASK-0009 em diante (padrão de R-0024).
- **Decisão vigente:** OD-R26-001 = (a) (Owner, 2026-09-26).
- **Processo:** branch `orchestra/dashboard-wiring` sobre `origin/main`; um prompt-review no
  bootstrap restrito às tarefas liberadas; `acceptance_commands` por tarefa; push sem PR; sem
  delivery-review nem PR (OD-C2-005); checkpoint em `plan.md` §Retomada ao fim.
- **Não tocar:** `backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`, serviços
  SSE, `backend/domains/shared/src/policy.ts`, `backend/domains/shared/src/documents`, outbox
  (`integration.*`), offline-sync, pin STYNX (R-0022/R-0023); `packages/ui`, shells e núcleos dos
  apps (R-0024); `.github/workflows/`, `.devai/config`, `law/register`, `record/` (R-0020).
- Nenhuma integração externa real, nenhum `--force`, nenhum arquivo gerado editado.
