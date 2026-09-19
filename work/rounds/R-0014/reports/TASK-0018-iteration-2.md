Papel: Engineer (Art. 6)
Tarefa: TASK-0018 (iteração 2)
Arquivos criados/alterados (sob `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/`):
1. A12(a) — `presentRead` removido, `presentError` direto: `src/app/features/{atendimento,catalogo,documentos,exames,notificacoes,sinistros}/*.facade.ts`, `src/app/core/pages/inicio.facade.ts`, `src/app/core/pages/home.page.ts`; comentários que citavam a regra revogada atualizados (facades e `README.md`).
2. A12(d) — `src/app/features/sinistros/pages/crash-detail.page.ts`: entradas de `summary` sem rótulo rendem só `<dd>` no grupo `data-key`; o `<dt data-raw-key>` saiu.
3. A12(e) — novo `src/app/core/functional-route.ts` (`functionalRouteFor`, função pura, mesma semântica §3.9); `src/app/features/catalogo/catalogo.facade.ts` e `src/app/core/pages/home.page.ts` a consomem; `directRouteFor` saiu.
4. A12(f) — `src/app/features/atendimento/atendimento.facade.ts`: `evaluate()` com `entitlement: { kind: body.subjectKind, id: body.subjectId }`.
5. A12(g) — `src/app/core/realtime.service.ts`: `POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / MS_PER_SECOND` (`MS_PER_SECOND = 1000`, unidade; único literal de intervalo continua `60_000`).
6. A12(i) — `src/app/shared/clearance-status.component.ts`: `<h3>` da seção de débitos usa `portal.documents.clearance.debts`.
Também: `README.md` (parágrafo das regras transversais). Nada em specs, `src/testing/**`, `work/**`; nenhum `git`; nenhum `pnpm install`.

Comandos executados e saída resumida:
- `node_modules/.bin/prettier --write` nos arquivos tocados → OK
- `pnpm --filter @detran/portal-web typecheck` → 0 erros
- `pnpm --filter @detran/portal-web lint` → 0 erros (os 8 erros de spec da iteração 1 já corrigidos pelo Inspector)
- `pnpm --filter @detran/portal-web build` → OK, sem rede (inicial 542,26 kB)
- `pnpm verify:parameter-catalogue` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`
- `pnpm format:check` → FAIL só em `work/rounds/R-0014/reviews/delivery-review-CTG-0003c.json` (arquivo do reviewer/maestro, fora da minha fronteira; o código do app está formatado)
- `pnpm --filter @detran/portal-web test` (duas execuções completas): 1.ª `Test Files 4 failed | 114 passed (118)` / `Tests 4 failed | 1305 passed | 14 todo (1323)`; 2.ª (specs do Inspector já mais adiantados) `Test Files 3 failed | 115 passed (118)` / `Tests 3 failed | 1307 passed | 14 todo (1324)`

Vermelhos restantes (2.ª execução), classificados:
- `core/realtime.service.spec.ts` C-3c-78 — `expected Set{'60_000','1000'} to equal Set{'60_000'}`: a heurística do spec (`>= 1000`) apanha o literal de UNIDADE `1000` que A12(g) manda usar (`POLLING_INTERVAL_MS / 1000`). Não há como cumprir A12(g) e a heurística atual ao mesmo tempo sem esconder o número (ex.: `1e3`, que o regex não veria — evitei de propósito). Cabe ao Inspector ajustar C-3c-78 (ex.: `> 1000`, ou excluir `MS_PER_SECOND`); se o maestro preferir `1e3`, é uma linha.
- `core/pages/home.page.spec.ts` C-3c-69 (1.ª parte) — ainda espera `defesa_previa` (`available`) com link `/carta-servicos/defesa_previa` e sem `/autos`; com A12(e) (§3.9 na home) a rota funcional de `defesa_previa` é `/autos`. Spec a alinhar com A12(e) pelo Inspector (a adenda cita o caso `pagamento` → `/autos`).
- `features/documentos/pages/crlv.page.spec.ts` (caso novo "issueCrlv 422 SERVICE_UNAVAILABLE… nenhum card") — o `OfflineDocumentStore` real usa o `sessionStorage` do jsdom, que persiste entre os `it` do mesmo arquivo: o `put('crlv-e', { vehicleId: VEHICLE_ID })` do caso C-3c-104 vaza para este caso, `loadClearance` reencontra o documento do MESMO veículo e (corretamente, §3.3/[DIVERGE-13]) mostra o card offline. Passa isolado (`-t`); precisa de `sessionStorage.clear()`/`offlineStore.clear()` em `afterEach` (mesma classe de C-3c-28 da iteração 1).
- Na 1.ª execução falhou também `vehicles.page.spec.ts` "offline (navigator.onLine false)", que passou na 2.ª e passa isolado (7/7) — flutuação sob carga, não defeito de produção.
- Os casos de offline do par 3 já reescritos pelo Inspector com `navigator.onLine === false` (inbox, vehicles, service-charter…) estão verdes com `presentError` direto.

Critérios de aceitação:
- `typecheck` → PASS; `lint` → PASS; `build` → PASS; `verify:parameter-catalogue` → PASS
- `format:check` → FAIL (só `work/rounds/R-0014/reviews/delivery-review-CTG-0003c.json`, fora da fronteira)
- `test` → 3 vermelhos, todos de spec (acima); nenhum por defeito de produção

Fora do escopo / deixado: nada além dos seis itens; a semântica de resolução das leituras (ao concluir), a redundância explainer + botões em T-27 e o botão de início da junta ficam como relatados na iteração 1 (não estavam no escopo desta).

OD tocadas ou propostas: aplicada OD-P89 (ext. A12(i), `portal.documents.clearance.debts`); nenhuma nova.

Bloqueios: nenhum. Registro para o maestro: C-3c-78 × A12(g) (literal `1000`) e C-3c-69 × A12(e) (`defesa_previa` na home) são contradições spec × adenda a resolver no spec (Inspector, it. 4); o vazamento de `sessionStorage` em `crlv.page.spec.ts` é isolamento de spec.
