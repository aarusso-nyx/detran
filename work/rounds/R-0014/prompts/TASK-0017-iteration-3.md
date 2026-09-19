# TASK-0017 — iteração 3 (restrita): specs verdes contra a implementação de TASK-0018

Papel: **Inspector** (Art. 6). Mesmas regras, fronteira e leitura da TASK-0017. O Engineer
(TASK-0018) entregou os 23 módulos do par 3 (`reports/TASK-0018.md`): `typecheck` 0 erros, `build`
OK; `test` = `Test Files 23 failed | 95 passed (118)` / `Tests 75 failed | 1220 passed | 14 todo
(1309)`; `lint` 8 erros — **todos os 75 vermelhos e os 8 erros de lint são defeitos de spec**, não
de produção (adenda A11(g) do `plan.md`). Esta iteração corrige **só** isso. Código de produção
segue intocável; nenhuma asserção pode ser reduzida ou removida; nenhum `it.skip`/`it.todo`.

Correções exigidas (cada uma com a lição correspondente do par 2, A9(f)):

1. **Stub de `ServiceCatalogFacade`** (contrato §9) nos sete specs de página cujas rotas têm
   `serviceKey` — o `serviceAvailabilityGuard` aguarda `GET /v1/portal/services` nunca flushado e
   o `mount()` nunca resolve (52 timeouts): `documentos/pages/cnh.page.spec.ts`,
   `crlv.page.spec.ts`, `sinistros/pages/crash-list.page.spec.ts`, `crash-detail.page.spec.ts`,
   `exames/pages/exam-list.page.spec.ts`, `atendimento/pages/manifestation-new.page.spec.ts`,
   `evaluation.page.spec.ts` →
   `{ provide: ServiceCatalogFacade, useValue: createServiceCatalogFacadeStub({ status: 'available' }) }`
   no `mount()` (veja como os specs do par 2 fazem).
2. **Dupla `TestBed.configureTestingModule` no mesmo `it`** ("Cannot configure the test module…",
   12 casos): `core/push.service.spec.ts` C-3c-79; `shared/digital-document-card.component.spec.ts`
   C-3c-89/91; `evaluation-form` C-3c-98; `manifestation-form` C-3c-96; `own-data-panel` C-3c-94;
   `sne-consent` C-3c-87; `atendimento/atendimento.facade.spec.ts` C-3c-42/49;
   `privacidade/privacidade.facade.spec.ts` C-3c-51; `core/pages/home.page.spec.ts` C-3c-69;
   `exames/components/junta-medica-form.component.spec.ts` (anexos) → `TestBed.resetTestingModule()`
   entre montagens ou um `it` por cenário.
3. **Literal com placeholder cru** `portal.documents.consulta.consultedAt` (`{consultedAt}` é
   interpolado pelo motor; o par 2 compara pelo prefixo): `digital-document-card.component.spec.ts`
   C-3c-90 e `cnh.page.spec.ts` C-3c-103.
4. **Corridas em zoneless** (asserção logo após `waitFor(data-screen)` — atributo estático; o DOM
   só reflete os signals no tick seguinte) → `vi.waitFor` sobre o conteúdo asserido:
   `documentos/pages/vehicles.page.spec.ts` C-3c-100; `catalogo/pages/service-charter.page.spec.ts`
   C-3c-63/65; `atendimento/pages/manifestation-detail.page.spec.ts` C-3c-107;
   `notificacoes/pages/sne.page.spec.ts` (4 casos a11y — `fillAndSubmit` antes do `SneConsent`
   renderizar); `sinistros/pages/crash-detail.page.spec.ts` (supressão);
   `exames/pages/exam-list.page.spec.ts` C-3c-39.
5. **Vazamento de `sessionStorage`** entre C-3c-27 e C-3c-28 em `documentos/documentos.facade.spec.ts`
   (mesmo `sid`; passa isolado) → `sessionStorage.clear()`/`offlineStore.clear()` em `afterEach`.
6. **`setTimeout(0)` sob `vi.useFakeTimers()`** em `core/realtime.service.spec.ts` C-3c-72 →
   `vi.advanceTimersByTimeAsync(0)`.
7. **Lint**: `a11y/all-routes.a11y.spec.ts` (`FIXED_ENTITY_ID`, `RealtimeService`, `PushService`
   não usados), `assinatura/pages/elevation.page.spec.ts` (`sessionFacade` ×4),
   `notificacoes/pages/preferences.page.spec.ts` (`PushService`) — remover o que não é usado (ou
   usar, se a asserção pedia).

Se ao ficar verde algum spec revelar **defeito real de produção** (comportamento contrário ao
contrato), não contorne: registre em "Bloqueios" com critério, arquivo e linha — o Engineer trata.
Se um spec exigir algo que o contrato não fixa, registre `OD-*` e mantenha a asserção conforme o
contrato.

## Critérios de aceitação

- `pnpm --filter @detran/portal-web typecheck` → 0 erros.
- `pnpm --filter @detran/portal-web lint` → 0 erros.
- `pnpm --filter @detran/portal-web test` → `Test Files 0 failed | 118 passed`, `Tests 0 failed | N passed | 14 todo (1309)` (os 1309 continuam — nenhum removido).
- `pnpm format:check` → OK (`prettier --write` nos arquivos tocados).
- Nenhum arquivo fora de `**/*.spec.ts` e `src/testing/**` alterado.

## Entrega (mesmo formato da TASK-0017, com "Tarefa: TASK-0017 (iteração 3)")

Inclua: lista dos specs tocados por item 1…7; saída literal das linhas `Test Files`/`Tests`;
defeitos reais de produção encontrados (ou "nenhum"); OD propostas (ou "nenhuma").
