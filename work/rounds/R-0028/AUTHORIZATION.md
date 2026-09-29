# R-0028 — autorização do Owner

status: active

GRANTED — autorização expressa do Owner para abertura antecipada de R-0028 (`boat-wiring`),
limitada às tarefas liberadas pela adenda A-C2-15 (`work/campaigns/C-0002-consolidacao.md` §16).
Estes marcadores não ampliam o escopo.

Papel: Architect (maestro Opus 5.5, Claude Code). Fonte: prompt da sessão B do Owner, colado nesta
sessão em 2026-09-29 (America/Sao_Paulo), datado pelo Owner de 2026-09-30: "O Owner autoriza em
2026-09-30 a abertura antecipada dessas rodadas, limitada às tarefas liberadas". PR #161
(`docs/c0002-a-c2-15`) ainda aberto no bootstrap: o prompt vale como texto da A-C2-15.

## Escopo autorizado

- **Tarefas liberadas:** TASK-0001 (matriz de vínculo, desenho do `BoatCrashGateway` e das 6
  portas, fail-closed de S-06/W-05 sob DT-049), TASK-0002 (`boat-build-pack.md` §4, issue e
  backlog), TASK-0003 → TASK-0004 (specs e implementação das portas de homologação em
  `apps/boat/mobile/src/lib/ports/`; atestação nunca `true`; nenhum `@capacitor/*`; `ports.ts`
  mantém a forma).
- **Esperam:** TASK-0005 em diante (padrão de ligação de R-0024 e SSE canônico de R-0022).
- **Decisão vigente:** OD-R28-001 = (a) (Owner, 2026-09-26).
- **Processo:** branch `orchestra/boat-wiring` sobre `origin/main`; um prompt-review no bootstrap
  restrito às tarefas liberadas; `acceptance_commands` por tarefa; push sem PR; sem
  delivery-review nem PR (OD-C2-005); checkpoint em `plan.md` §Retomada ao fim.
- **Não tocar:** `backend/app/src/app.module.ts`, `backend/app/src/detran-runtime.ts`, serviços
  SSE, `backend/domains/shared/src/policy.ts`, `backend/domains/shared/src/documents`, outbox
  (`integration.*`), offline-sync, pin STYNX (R-0022/R-0023); `packages/ui`, shells e núcleos dos
  apps (R-0024); `.github/workflows/`, `.devai/config`, `law/register`, `record/` (R-0020).
  `apps/teat/web/src/app/features/sinistros/` é lock desta rodada, mas não é editado nesta sessão.
- Nenhuma integração externa real, nenhum Capacitor (#109), nenhum RENAEST real (#120), nenhum
  `--force`, nenhum arquivo gerado editado.
