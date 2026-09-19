All four acceptance criteria are green, and my diff is confirmed scoped to `*.spec.ts` files plus one new `src/testing/**` helper (the `portal.pt-BR.json` and `payment-comparison.component.ts` changes visible in git status are unstaged production-side edits from the Engineer's concurrent session, not mine).

## Entrega — Tarefa: TASK-0015 (iteração 4)

**Papel (Art. 6): Inspector.**

### Escopo desta iteração
Restrito aos itens (j), (k), (l) da adenda A10 de `work/rounds/R-0014/plan.md` §Adendas — três achados `high` do ciclo 1 (C-3b-103 parcial, C-3b-84 condicional, C-3b-104 com escape) que o maestro omitiu ao relatar e o reviewer cobrou de novo no ciclo 2 (`work/rounds/R-0014/reviews/delivery-review-CTG-0003b-2.json`, achados 1–3). Apenas `*.spec.ts` e `src/testing/**`; sem `git`, sem `pnpm install`.

### (j) C-3b-103 — cobertura integral de axe/h1/status_region/foco em cada estado, nas 13 telas
Criado `apps/portal/web/src/testing/a11y-state.spec-helper.ts` (`expectA11yStateInvariants`) que verifica, num único ponto: `h1` único, região `role="status"` com `aria-label` traduzido de `portal.a11y.status_region`, foco no `portal-error-banner[role="alert"]` quando aplicável (`errorBannerFocused`), e delega a `axe.spec-helper.ts` para serious/critical. Os 13 describes "a11y por estado" foram reescritos para cobrir todos os estados da tabela §7 aplicáveis a cada tela (loading, ready, empty quando aplicável, not_found, error, unavailable, offline, e partial em T-13/T-23):
- `features/autos/pages/ait-list.page.spec.ts` (T-14): loading, ready, empty, unavailable, error, offline
- `features/autos/pages/ait-detail.page.spec.ts` (T-01): loading, ready, empty, not_found, error, unavailable, offline
- `features/defesa/pages/defesa-previa.page.spec.ts` (T-02): loading, composicao, forbidden, not_found, error, unavailable, offline
- `features/defesa/pages/recurso-jari.page.spec.ts` (T-03): loading, ready, ineligible, not_found, error, offline
- `features/defesa/pages/recurso-cetran.page.spec.ts` (T-04): loading, composicao, ineligible, not_found, error, offline
- `features/indicacao/pages/indicacao-condutor.page.spec.ts` (T-05): loading, composicao, ineligible, not_found, error, offline
- `features/pagamento/pages/pagamento.page.spec.ts` (T-13): loading, ready, partial, not_found, error, unavailable, offline
- `features/pagamento/pages/pagamento-preservando-recurso.page.spec.ts` (T-23): loading, ready, partial, not_found, error, unavailable, offline
- `features/processos/pages/request-list.page.spec.ts` (T-06): loading, ready, empty, unavailable, error, offline
- `features/processos/pages/request-detail.page.spec.ts` (T-07): loading, ready, not_found, unavailable, error, offline
- `features/processos/pages/desistencia.page.spec.ts` (T-08): loading, ready, ineligible, not_found, unavailable, error, offline
- `features/processos/pages/decisao.page.spec.ts` (T-10): loading, ready (×2), empty, not_found, unavailable, error, offline
- `features/processos/pages/diligencia.page.spec.ts` (T-11): loading, ready, empty, encerrada, not_found, unavailable, error, offline

Total: 74 casos de a11y por estado (antes: 22 parciais, só axe). Estados "not_found"/"error"/"unavailable"/"offline" reaproveitam o `portal-error-banner` já presente em cada página (`facade.error()`); nenhum caso ficou vermelho por defeito real de componente — todas as 13 páginas expõem consistentemente `[role="status"][aria-label]` e `<h1>` único, e o `PortalErrorBannerComponent` (par 1, congelado) move o foco a si mesmo via `afterRenderEffect` como o contrato exige.

### (k) C-3b-84 — `pagamento.page.spec.ts` (~l. 249–279)
Removido `.catch(() => null)` e o `if (submitReq)`: `expectOne` do `POST …/submit` agora é obrigatório, com as três asserções (`portal-protocol-receipt`, `portal.states.unavailable_in_version`, `not.toMatch(/pixCopyPaste|barcode|\d{44,}/)`) incondicionais no corpo do `it`.

### (l) C-3b-104 — `static-analysis.appeal.spec.ts` (~l. 52–68)
Removido o `.catch(() => null)` + `if (!req) { ...; return; }` e o comentário obsoleto sobre `PlaceholderPageComponent`; `expectOne` da leitura de `/v1/portal/aits/{id}` agora é obrigatório. Asserções de `portal.states.offline`, `role="alert"` e ausência de retry automático mantidas.

### Comandos executados e resultado
1. `pnpm --filter @detran/portal-web typecheck` → **0 erros**
2. `pnpm --filter @detran/portal-web lint` → **0 erros** (após remover 8 imports de `expectNoSeriousA11yViolations` que ficaram órfãos nos arquivos onde toda a cobertura de axe migrou para `expectA11yStateInvariants`)
3. `pnpm --filter @detran/portal-web test` → **74 arquivos passaram (74) / 969 passed | 7 todo (976) / 0 failed** (era 909 passed antes desta iteração; +60 dos novos casos de a11y por estado)
4. `pnpm verify:parameter-catalogue` → **OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)**
5. `pnpm format:check` → achou 13 dos meus arquivos desformatados; corrigido com `prettier --write` só neles; reexecutado → **OK** (nenhum arquivo fora do meu escopo pendente desta vez — o `CTG-0003c.md` sinalizado na iteração anterior já não aparece, presumivelmente resolvido pela tarefa TASK-0021 em paralelo).

### Critérios de aceite
- `typecheck && lint`: **PASS** (0 erros)
- `test`: **PASS** — 0 failed, 969 passed, 7 todo (976 total)
- `format:check`: **PASS**
- Não foi necessário aguardar o Engineer: a precedência servidor×flags e a chave `valor_indisponivel` (das iterações 3) já estavam em produção quando os testes rodaram.

### Casos vermelhos por defeito real
Nenhum. Todos os 74 casos de a11y por estado passaram já na primeira execução de cada arquivo (validado individualmente por `vitest run <arquivo>` antes da rodada completa), confirmando que as 13 páginas seguem o padrão transversal do contrato §7/§8 (região de estado, `h1` único, foco no banner de erro) de forma consistente.

### Restrições respeitadas
Nenhum comando `git` de escrita, nenhum `pnpm install`; alterações confinadas a `*.spec.ts` e a um novo arquivo em `src/testing/**` (`a11y-state.spec-helper.ts`); nenhuma asserção enfraquecida — pelo contrário, (k) e (l) removeram escapes silenciosos que mascaravam regressões; nenhum `it.skip` introduzido.
