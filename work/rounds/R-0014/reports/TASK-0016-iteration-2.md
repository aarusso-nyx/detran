Papel: Engineer (Art. 6)
Tarefa: TASK-0016 (iteração 2 — adenda A10 a/e/h)
Arquivos criados/alterados:
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/shared/payment-comparison.component.ts — (a) `methodReason`: o servidor prevalece — com `available[]` (422 `PAYMENT_METHOD_UNAVAILABLE`, `payment.methods` via OD-P74) o meio fora dela é `data-reason="server"`; `PAYMENT_FLAGS` só decide quando o servidor não se pronuncia (contrato §4.2); (e) faixa com `amount === null` → `portal.forms.pagamento.valor_indisponivel`, mantendo `data-amount="unavailable"`.
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts — (h) `<select name="status">` sem `[value]`; `[selected]` por opção só quando a query tem filtro e `selectedIndex = -1` (afterRenderEffect) sem filtro, até OD-P84.
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/features/processos/pages/request-list.page.ts — (h) idem para `<select name="state">`.
- Nenhum spec, `src/testing/**`, `core/**`, `forms/**`, `i18n/**` ou `packages/**` tocado; sem `git`, sem `pnpm install`, nenhum processo em segundo plano.
Comandos executados e saída resumida:
- `pnpm --filter @detran/portal-web typecheck` → 0 erros
- `pnpm --filter @detran/portal-web lint` → 0 erros
- `pnpm --filter @detran/portal-web build` → OK (bundle inicial dentro do `maximumWarning` de A9 g)
- `pnpm verify:parameter-catalogue` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`
- `pnpm --filter @detran/portal-web test` → `Test Files 74 passed (74)`; `Tests 909 passed | 7 todo (916)` — 0 failed (após a iteração paralela do Inspector)
- `pnpm format:check` → FALHA em 4 arquivos que não são meus e estão em edição paralela: `ait-detail.page.spec.ts`, `pagamento.page.spec.ts`, `request-detail.page.spec.ts` (Inspector) e `work/rounds/R-0014/contracts/CTG-0003c.md` (Architect); todos os arquivos de produção e o README do app passam (`prettier --check` restrito a eles)
Critérios de aceitação:
- typecheck/lint 0 erros — PASS
- test 0 failed — PASS (909 passed, 7 todo)
- build OK — PASS
- verify:parameter-catalogue OK — PASS
- format:check OK — FAIL só por 3 specs do Inspector e o contrato CTG-0003c do Architect em edição paralela (fora da minha fronteira); meus arquivos PASS
Tabela artefato do contrato → arquivo → specs verdes:
| Item A10 | Arquivo | Specs |
|---|---|---|
| (a) precedência servidor > flags (§4.2) | shared/payment-comparison.component.ts | C-3b-37 (flags sem servidor → `portal.card_payment`), C-3b-87 (`cartao` → `server`) verdes |
| (e) `valor_indisponivel` (§4.3.2/OD-P70) | shared/payment-comparison.component.ts | C-3b-36, C-3b-43 verdes |
| (h) select sem filtro (§6 T-14/T-06, OD-P84) | features/autos/pages/ait-list.page.ts, features/processos/pages/request-list.page.ts | C-3b-60 (7 opções, `status=<token>` na query), C-3b-88/89 verdes |
Fora do escopo / deixado:
- (b), (c), (d) de A10 ratificam o que já estava implementado (composição T-13/T-23, T-05 sem uploader no passo 2, pontos após o detalhe) — sem mudança.
- A opção "sem filtro" dos `<select>` continua pendente de OD-P84; enquanto isso o controle não mostra nenhuma opção escolhida quando a lista vem inteira.
- OD-P87 (origem do `locale` para `Intl`): mantido o locale do runtime de i18n pelos pipes do kit.
OD tocadas ou propostas: nenhuma nova; aplicadas/citadas OD-P41, OD-P70, OD-P74, OD-P84, OD-P87.
Bloqueios: nenhum de código. `pnpm format:check` global só fica verde quando o Inspector/Architect formatarem os 4 arquivos deles listados acima (`prettier --write`).

Errata (maestro, 2026-09-18): onde este relatório cita 'OD-P87' para a origem do `locale`, leia-se **OD-P101** (renumerada em `plan.md` A10(i); OD-P87 é a origem do `If-Match` de `PUT preferences`, contrato do par 3).
