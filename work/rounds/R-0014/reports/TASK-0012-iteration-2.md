Papel: Architect (transcrição)  
Tarefa: TASK-0012 (iteração 2)

Arquivos alterados: `portal-build-pack.md`, `portal-frontends.md`, `parameter-catalogue.md`, método da orquestra, `waves.md`, `engineer-frontend.md`, `backlog.md`, `CTG-0003c.md`, `closure.md` e ficha T12.

Entregáveis:

1. Feito — build pack: WP-P4/P5/P6 executados (linhas 130, 144, 156) e 62 ODs na tabela R-0014.
2. Feito — `portal-frontends.md` §§9–10 (linhas 220 e 240).
3. Feito — catálogo OD-P66 nas linhas 92–93.
4. Feito — método §§4.17/4.18 e histórico R-0014 (linhas 92, 96, 237).
5. Feito — `waves.md` R-0014 e `model-ladder.md` confirmado.
6. Feito — padrão de app R-0014 em `engineer-frontend.md:47`.
7. Feito — backlog, 15 itens individuais com dono e fonte (linhas 505–519).
8. Feito — contrato A12(j): sem `access`, C-3c-116 e nota C-3c-78.
9. Feito — `closure.md` com 110 linhas.
10. Feito — ficha T12 corrigida para placeholder `{source}`; correções T10–T18 anteriores preservadas.

Comandos executados:

- `node tools/docs/kb/check.mjs` — PASS: `OK (549 artifacts, 446 canonical tokens)`.
- `pnpm docs:kb:publish-check` — PASS: publicação seca OK.
- `pnpm format:check` — PASS.
- Verificação cruzada das chaves i18n das fichas — `missing=0`.
- `grep -c '^| OD-P' docs/framework/arch/portal-build-pack.md` — `108` (≥ 95).
- `pnpm verify:parameter-catalogue` — FAIL esperado fora do escopo: `unresolved decision OD-P66`; A25 exige status `proposta` e proíbe a regeneração pelo worker.

Tabela OD → destino → fonte:

| OD | Destino | Fonte |
| --- | --- | --- |
| P47–P51 | Build pack §4.1 | `plan.md` A1/A3 |
| P52–P54 | Build pack §4.1 | `plan.md` OD TASK-0004 |
| P55–P56 | Build pack §4.1 | `plan.md` A4 / OD TASK-0006 |
| P57–P67 | Build pack §4.1 | CTG-0003a §10; A6 |
| P68 | Build pack §4.1 | `plan.md` A7/A8 |
| P69–P82 | Build pack §4.1 | CTG-0003b §10; A10 |
| P83–P86 | Build pack §4.1 | `plan.md` A9 |
| P87–P100 | Build pack §4.1 | CTG-0003c §10; A11/A12 |
| P101–P102 | Build pack §4.1 + backlog | `plan.md` A10/A12 |
| P103–P108 | Build pack §4.1 + backlog | CTG-0004 §10; A14 |

Tabela ficha → chave:

| Ficha | Antiga | Nova | Fonte |
| --- | --- | --- | --- |
| T10–T12, T14–T15 | `portal.states.retry` | `portal.states.error` + `portal.common.action.retry` | CTG-0003c §7.2 |
| T10–T18 | `portal.states.unavailable` | `portal.states.service_unavailable` | CTG-0003c §7.2 |
| T13 | `portal.screens.t13.state.faixa_indisponivel` | `portal.screens.t13.state.faixa_40_indisponivel` | catálogo i18n / A12 |
| T12 | `{{source}}` | `{source}` | `plan.md` A7(c); CTG-0003c §10 |

Fora do escopo / deixado: regeneração de parâmetros (`pnpm parameters:generate`), PC final, Lighthouse CI e todas as pendências registradas no backlog.

Bloqueios: nenhum.