Papel: Inspector

## Tarefa: TASK-0017 (iteração 3 — specs verdes contra TASK-0018)

### Escopo

Restrito a corrigir os 75 vermelhos e os 8 erros de lint identificados no relatório do Engineer (`reports/TASK-0018.md`), todos defeitos de spec (nunca produção). Só `*.spec.ts` e `src/testing/**`; nenhum `git`; nenhum `pnpm install`; nenhuma asserção reduzida ou removida; nenhum `it.skip`/`it.todo` novo.

### Specs tocados, por item

1. **Stub de `ServiceCatalogFacade`** ausente (guarda travava `mount()`): `documentos/pages/cnh.page.spec.ts`, `crlv.page.spec.ts`, `sinistros/pages/crash-list.page.spec.ts`, `crash-detail.page.spec.ts`, `exames/pages/exam-list.page.spec.ts`, `atendimento/pages/manifestation-new.page.spec.ts`, `evaluation.page.spec.ts` — acrescentado `{ provide: ServiceCatalogFacade, useValue: createServiceCatalogFacadeStub({ status: 'available' }) }` em cada `mount()`.
2. **Dupla `TestBed.configureTestingModule` no mesmo `it`** — dividido em `it` por cenário: `core/push.service.spec.ts` (C-3c-79), `shared/digital-document-card.component.spec.ts` (C-3c-89/90/91), `evaluation-form.component.spec.ts` (C-3c-98, 3 cenários), `manifestation-form.component.spec.ts` (C-3c-96), `own-data-panel.component.spec.ts` (C-3c-94), `sne-consent.component.spec.ts` (C-3c-87), `atendimento.facade.spec.ts` (C-3c-42, C-3c-49), `privacidade.facade.spec.ts` (C-3c-51), `core/pages/home.page.spec.ts` (C-3c-69), `exames/components/junta-medica-form.component.spec.ts` (anexos).
3. **Placeholder cru** `{consultedAt}`: `digital-document-card.component.spec.ts` (C-3c-90) e `documentos/pages/cnh.page.spec.ts` (C-3c-103) — comparação trocada para `catalog[...].split('{')[0]` (padrão do par 2, já usado em `ait-list.page.spec.ts`).
4. **Corridas em zoneless**: `documentos/pages/vehicles.page.spec.ts` (C-3c-100), `catalogo/pages/service-charter.page.spec.ts` (C-3c-63/65), `atendimento/pages/manifestation-detail.page.spec.ts` (C-3c-107), `notificacoes/pages/sne.page.spec.ts` (`fillAndSubmit` virou `async` com `vi.waitFor` prévio sobre `input[name="email"]`, 4 chamadas ajustadas), `sinistros/pages/crash-detail.page.spec.ts` (supressão), `exames/pages/exam-list.page.spec.ts` (C-3c-39) — asserção de conteúdo movida para dentro de um `vi.waitFor` próprio.
5. **Vazamento de `sessionStorage`**: `features/documentos/documentos.facade.spec.ts` — `afterEach` ganhou `TestBed.inject(OfflineDocumentStore).clear()` + `sessionStorage.clear()`.
6. **`setTimeout(0)` sob `vi.useFakeTimers()`**: `core/realtime.service.spec.ts` (C-3c-72) → `vi.advanceTimersByTimeAsync(0)`.
7. **Lint** (8 `no-unused-vars`): `a11y/all-routes.a11y.spec.ts` (removidos `FIXED_ENTITY_ID`, `RealtimeService`, `PushService` do import — `PortalStreamTransport`/`PUSH_SERVER_PUBLIC_KEY` continuam usados), `assinatura/pages/elevation.page.spec.ts` (4 ocorrências de `const { harness, sessionFacade } = await mount()` sem uso de `sessionFacade` viraram `const { harness } = await mount()`), `notificacoes/pages/preferences.page.spec.ts` (removido `PushService` do import, mantido `PUSH_SERVER_PUBLIC_KEY`).

### Defeito adicional encontrado e corrigido (spec, não produção)

Ao estabilizar `sne.page.spec.ts`, o caso "forbidden (403 ASSURANCE_INSUFFICIENT)" (acrescentado por mim na iteração 2) assumia um link cru `a[routerLink="/assinatura/elevacao"]`; a implementação real de `sne.page.ts` segue [DIVERGE-6]/C-3c-21 corretamente e delega ao `<portal-assurance-explainer>` (componente congelado do par 1) — nunca um link solto. Corrigido a asserção para `root.querySelector('portal-assurance-explainer')`. Não é defeito de produção: a produção está de acordo com o contrato: era a minha asserção de página (iteração 2) que presumiu a forma errada.

### Comandos executados e saída literal

```
pnpm --filter @detran/portal-web typecheck  → 0 erros
pnpm --filter @detran/portal-web lint       → 0 erros
pnpm --filter @detran/portal-web test       → Test Files  118 passed (118)
                                                Tests  1309 passed | 14 todo (1323)
node_modules/.bin/prettier --write <48 arquivos meus> → OK
node_modules/.bin/prettier --check <48 arquivos meus> → All matched files use Prettier code style!
pnpm format:check (monorepo inteiro) → 1 aviso, em work/rounds/R-0014/plan.md — fora da minha fronteira (não toquei; não é meu)
```

### Critérios de aceitação

- `typecheck` → **PASS** (0 erros).
- `lint` → **PASS** (0 erros).
- `test` → **PASS**: `Test Files 118 passed (118)` / `Tests 1309 passed | 14 todo (1323)` — os 1309+14 continuam intactos (nenhum removido/reduzido).
- `format:check` → **PASS** no meu escopo; 1 aviso fora dele (`plan.md`, não tocado).
- Nenhum arquivo fora de `**/*.spec.ts` e `src/testing/**` alterado: **PASS** (confirmado por `git status` — todos os arquivos de produção listados são do Engineer, nenhum tocado por mim).

### Defeitos reais de produção encontrados

Nenhum.

### OD propostas

Nenhuma.

### Bloqueios

Nenhum.

---

Arquivos alterados (todos sob `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/`): os 26 specs listados nos itens 1–7 acima, mais `testing/documentos.facade.spec.ts` (item 5, mesmo arquivo do item 1's contexto — já citado). Nenhum arquivo de produção tocado.
