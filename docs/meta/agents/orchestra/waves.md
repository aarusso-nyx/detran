# Ondas, frentes e rodadas

**Autoridade:** Architect. Derivado dos build packs e de `docs/meta/knowledge-base/decision-closure-plan.md`.
Estado em 2026-09-14: WP-0 e WP-T0 mesclados em `main` (PRs #28 e #29).

## Regras

- Pelo menos duas frentes ativas, uma por família de maestro; mais frentes quando o orçamento de
  janelas permitir — o limite de concorrência é o orçamento, não o grafo. A segunda a mesclar rebaseia sobre `main`.
- Nunca duas frentes ativas com lock no mesmo módulo (`policy.ts`, `roles.ts`, um mesmo DDL, um mesmo blueprint).
- Uma rodada DEVAI por frente; R-0003…R-0016 já instanciadas em `work/rounds/` (plano e prompt do maestro por frente).
- Toda frente pode **abrir** com `origin/main` atualizado. O que depende de upstream é o **merge de
  cada grupo acoplado** (lista em `plan.md` §Concorrência e no §0 do prompt de cada rodada). Grupos
  que precisam de código ainda não mesclado desenvolvem sobre base empilhada no branch
  `orchestra/<upstream>` e rebaseiam sobre `main` quando ele mescla; o PR contra `main` só abre
  depois disso. A coluna "Depende de" da tabela abaixo indica o merge do último grupo, não a abertura.

## Plano de ondas

| Onda | Frente              | Rodada | WPs                                                                                             | Depende de                       | Maestro | Locks principais                                                                                    |
| ---- | ------------------- | ------ | ----------------------------------------------------------------------------------------------- | -------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| 1    | `dash-roles`        | R-0003 | WP-D0 (DASHBOARD)                                                                               | —                                | Fable   | `roles.ts`, `policy.ts`, `05-role-catalog.sql`, `check-role-catalog.ts`                             |
| 1    | `param-store`       | R-0004 | WP-A (RAIT) — parte parâmetros: `BP-OPS-PARAMETER-001`, DDL, seed, gate                         | —                                | Sol     | `backend/domains/ops/parameter`, `15-ops-parameter.sql`, `tools/parameters`, `package.json` scripts |
| 2    | `ops-agency`        | R-0005 | WP-T1 (TEAT): `ops/agency`, módulos Nest de `ops/*`, sete entidades da origem, deltas de modelo | — (Owner, 2026-09-14)            | Sol     | `backend/domains/ops/*`, `13-ops-*.sql`, blueprints `BP-OPS-*`                                      |
| 2    | `rait-model`        | R-0006 | WP-A (RAIT) restante: agregado da infração (ADR-0016), organização, financeiro, integração      | `param-store`                    | Fable   | blueprints `BP-INF-*`, DDL 34…39                                                                    |
| 3    | `rait-backend`      | R-0007 | WP-B + WP-C (RAIT)                                                                              | `rait-model`, `ops-agency`       | Sol     | `backend/domains/inf/rait-*`, `policy.ts` (RAIT)                                                    |
| 3    | `teat-backend`      | R-0008 | WP-T2 + WP-T3 (TEAT)                                                                            | `ops-agency`                     | Fable   | `backend/domains/inf/{ait,measures,alcohol,normative}`, `ops/*`                                     |
| 4    | `portal-backend`    | R-0009 | WP-P0…P3 (PORTAL)                                                                               | `rait-backend`                   | Fable   | `backend/domains/portal/*`, `packages/senatran-adapter` (leituras)                                  |
| 4    | `boat-backend`      | R-0010 | WP-B0…B3 (BOAT)                                                                                 | `ops-agency`, `teat-backend`     | Sol     | `backend/domains/est/*`, `policy.ts` (est)                                                          |
| 5    | `dashboard-backend` | R-0011 | WP-D1…D3 (DASHBOARD)                                                                            | `rait-backend`, `teat-backend`   | Sol     | `backend/domains/dashboard/*`                                                                       |
| 5    | `rait-web`          | R-0012 | WP-D, WP-E, WP-F (RAIT)                                                                         | `rait-backend`                   | Fable   | `apps/rait/web`, `packages/ui`                                                                      |
| 6    | `teat-frontends`    | R-0013 | WP-T4…T6 (TEAT)                                                                                 | `teat-backend`                   | Sol     | `apps/teat/*`, `packages/ui`                                                                        |
| 6    | `portal-pwa`        | R-0014 | WP-P4…P6 (PORTAL)                                                                               | `portal-backend`                 | Fable   | `apps/portal/web`                                                                                   |
| 7    | `boat-mobile`       | R-0015 | WP-B4, WP-B5 (BOAT)                                                                             | `boat-backend`, `teat-frontends` | Fable   | `apps/boat/mobile`, `apps/teat/mobile` (shell)                                                      |
| 7    | `dashboard-console` | R-0016 | WP-D4, WP-D5 (DASHBOARD)                                                                        | `dashboard-backend`              | Sol     | `apps/dashboard/web`                                                                                |

Cobertura: todos os WPs dos cinco build packs aparecem exatamente uma vez (WP-0 e WP-T0 já
mesclados). `packages/ui` é lock compartilhado entre `rait-web` e `teat-frontends`: as duas nunca
ficam ativas ao mesmo tempo (ondas 5 e 6).

## Ordem de abertura recomendada

1. Onda 1 (R-0003 Fable, R-0004 Sol) em paralelo; `dash-roles` mescla primeiro por ser menor;
   `param-store` rebaseia.
2. Onda 2 assim que a onda 1 estiver em `main`.
3. Das ondas 3 em diante, abrir a próxima frente de uma família quando a anterior daquela família
   mesclar, mantendo sempre uma frente Sol e uma Fable ativas.

## Histórico (preencher a cada rodada)

| Rodada | Frente              | Abertura   | Merge              | Tarefas | Ciclos de REVIEW      | Escaladas | Tokens estimados             | Ajustes ao método                                                                                                                       |
| ------ | ------------------- | ---------- | ------------------ | ------- | --------------------- | --------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| R-0003 | `dash-roles`        | 2026-09-14 | 2026-09-14, PR #32 | 4       | 2 prompt + 2 delivery | 1         | 550k entrada / 91k saída     | Normalizar JSON da ponte antes do gate de formato; manter negativos explícitos para grants derivados.                                   |
| R-0004 | `param-store`       | 2026-09-14 | 2026-09-14, PR #37 | 6       | 6 prompt + 5 delivery | 3         | >16.4M entrada / >201k saída | Fazer preflight determinístico antes do reviewer; exigir JSON puro na ponte; testar grants e artefatos gerados de forma comportamental. |
| R-0005 | `ops-agency`        | 2026-09-14 | 2026-09-15, PR #44 | 9       | 3 prompt + 9 delivery | 5 agentes | >5.835M / >84.8k; exceção    | Opus 5 fixado; instalar workspaces antes dos gates, rever após integração semântica e rotear lows sem ampliar o CTG.                    |
| R-0006 | `rait-model`        | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0007 | `rait-backend`      | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0008 | `teat-backend`      | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0009 | `portal-backend`    | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0010 | `boat-backend`      | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0011 | `dashboard-backend` | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0012 | `rait-web`          | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0013 | `teat-frontends`    | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0014 | `portal-pwa`        | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0015 | `boat-mobile`       | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
| R-0016 | `dashboard-console` | —          | —                  | —       | —                     | —         | —                            | —                                                                                                                                       |
