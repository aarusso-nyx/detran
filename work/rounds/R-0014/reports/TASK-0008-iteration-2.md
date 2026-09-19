Papel: Inspector

Tarefa: TASK-0008 (iteração 2 — restrita à adenda A7 do `plan.md` e aos bloqueios B2…B6, B8…B12 de `work/rounds/R-0014/reports/TASK-0009.md`)

## Leitura obrigatória desta iteração

`work/rounds/R-0014/plan.md` §Adendas A7 (a–e); `work/rounds/R-0014/reports/TASK-0009.md` (inteiro, seções "Comandos", "Cobertura", "Bloqueios" B1–B12).

## Arquivos criados/alterados

**Novo:**
- `apps/portal/web/src/testing/file-list.polyfill.ts` — `createFileList()`, substitui `DataTransfer` (ausente no jsdom) para simular seleção de arquivo (B5).

**Alterados (só `*.spec.ts` e `src/testing/**`, nenhum código de produção, nenhum `git`, nenhum install):**
- `apps/portal/web/src/app/data/idempotency-key.spec.ts` — hex de SHA-256 vazio corrigido de 63 para 64 caracteres (B4).
- `apps/portal/web/src/app/data/portal.client.spec.ts` — todo `httpMock.expectOne(...)` que segue um comando passa por `vi.waitFor(...)` (B2, 11 pontos); `downloadReceipt` flusha um `Blob` de erro em vez de objeto cru (B3).
- `apps/portal/web/src/app/core/brand.service.spec.ts` — `toEqual` do estado passa a incluir `serviceContact` (B9, [DIVERGE-9]).
- `apps/portal/web/src/app/core/error-boundary.spec.ts` — literal `'rait.errors.x'` trocado por `'zz.errors.x'` (B10).
- `apps/portal/web/src/app/shared/citizen-status-badge.component.spec.ts` — `it` único com 5 reconfigurações do TestBed virou `it.each` (B6).
- `apps/portal/web/src/app/shared/attachment-uploader.component.spec.ts` — `selectFile` usa `createFileList` em vez de `DataTransfer`; `flush()` de 3 microtasks substituído por `vi.waitFor` sobre condições observáveis reais (B5).
- `apps/portal/web/src/app/shared/service-wizard.component.spec.ts` — C-3a-60 reescrito conforme A7(b): sem `elevationRequested`/`ResumeService.save`, espera `step() === 'assinatura'` e `error()?.nextStep === 'elevation'` (B8); 4 `no-unused-vars` corrigidos (B11).
- `apps/portal/web/src/app/shared/action-triplet.component.spec.ts` — `provideRouter([])` → `provideRouter([{ path: '**', children: [] }])`, rota coringa sem componente para a navegação do `routerLink` resolver em vez de rejeitar (B12).

Nenhum arquivo de `src/app/i18n/**` foi tocado (B7 é do transcriber/maestro).

## Comandos executados e saída resumida

- `pnpm --filter @detran/portal-web typecheck` → 0 erros.
- `pnpm --filter @detran/portal-web lint` → 0 erros.
- `pnpm --filter @detran/portal-web test` → `Test Files 1 failed | 49 passed (50)` / `Tests 1 failed | 671 passed | 3 todo (675)` — **0 erros não tratados** (as 12 rejeições/`NavigationError` do estado anterior desapareceram).
- `pnpm verify:parameter-catalogue` → `OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)`.
- `pnpm format:check` → `All matched files use Prettier code style!`.

## Critérios de aceitação

- `typecheck` 0 erros: **PASS**.
- `lint` 0 erros: **PASS**.
- `test` → 0 failed, 0 unhandled errors: **FAIL** — resta 1 caso vermelho, por defeito real de implementação (não de spec), reportado abaixo sem acomodação.
- `verify:parameter-catalogue` OK: **PASS**.
- `format:check` OK: **PASS**.

## Caso vermelho remanescente — defeito real (não acomodado)

**Teste:** `data/portal.client.spec.ts` › `PortalClient — downloadReceipt` › C-3a-16 (linha ~404).

**Reprodução:** `downloadReceipt(rid)` faz `GET .../receipt` com `responseType: 'blob'` (confirmado em `data/portal.client.ts:338-345`, `firstValueFrom(this.http.get(url, { responseType: 'blob' }))`, sem tratamento de erro). O servidor responde `422 PORTAL.SERVICE_UNAVAILABLE` com corpo JSON — em XHR real, quando `responseType` é `'blob'`, o corpo do erro chega como `Blob` independentemente do `Content-Type`, nunca pré-parseado como objeto (comportamento de browser real, reproduzido pelo `HttpTestingController` ao exigir um corpo Blob-compatível em `flush()` — é exatamente o que motivou o bloqueio B3). O teste agora flusha corretamente um `Blob([JSON.stringify(erro)], {type:'application/json'})`.

**Esperado (contrato §2.4, C-3a-16):** `classifyError(error).code === 'PORTAL.SERVICE_UNAVAILABLE'` — a citada rejeita com o código classificado, para a UI mostrar "indisponível" + canal alternativo (M15).

**Observado:** `classifyError` retorna `code: null`. `core/error-boundary.ts` (`isPortalErrorBody`, linha 280-286) só reconhece `error.error` quando já é um objeto com `.code: string` — um `Blob` nunca satisfaz essa checagem. Nem `PortalClient.downloadReceipt` nem nenhum interceptor global converte o `Blob` de erro de volta para JSON antes de chegar ao `ErrorBoundary`.

**Correção sugerida (fora da minha fronteira — código de produção):** `downloadReceipt` capturar o erro, e quando `error.error instanceof Blob` e o `Content-Type` for JSON, ler o texto do blob e re-parsear antes de repropagar (`error.error = JSON.parse(await error.error.text())`), ou o `ErrorBoundary` ganhar um caminho assíncrono equivalente. Sinalizando para o maestro decidir se abre nova iteração da Engineer ou uma OD.

## Bloqueios

Nenhum bloqueio meu. O caso acima é bloqueio de implementação, não meu.
