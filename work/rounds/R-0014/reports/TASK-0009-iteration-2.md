Papel: Engineer
Tarefa: TASK-0009 (iteração 2)

Arquivos criados/alterados:

- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/data/portal.client.ts` — único arquivo tocado nesta iteração: `downloadReceipt` passa a capturar o `HttpErrorResponse` da requisição `responseType: 'blob'` e, quando `error.error` é um `Blob` de tipo JSON, lê `await blob.text()`, faz `JSON.parse` e repropaga um `HttpErrorResponse` equivalente (`error` = objeto decodificado; mesmos `status`, `statusText`, `headers`, `url`); corpo não-JSON ou ilegível → o erro original sobe intacto. Helpers privados de módulo: `isJsonBlob`, `decodeBlobError`. Nenhum spec, stub, fixture ou config tocado.
- Observação: `work/rounds/R-0014/reports/TASK-0008-iteration-2.md` não existe no disco (só `TASK-0008.md`); usei o spec atualizado (`portal.client.spec.ts` C-3a-16, que agora faz `flush(Blob JSON, 422)`) como fonte executável.

Comandos executados e saída resumida:

- `node_modules/.bin/prettier --write src/app/data/portal.client.ts` → formatado
- `npx vitest run src/app/data/portal.client.spec.ts` → 14 passed
- `pnpm --filter @detran/portal-web typecheck` → exit 0
- `pnpm --filter @detran/portal-web lint` → exit 0
- `pnpm --filter @detran/portal-web test` → `Test Files 50 passed (50)`, `Tests 672 passed | 3 todo (675)`, 0 erros não tratados, exit 0
- `pnpm --filter @detran/portal-web build` → exit 0
- `pnpm verify:parameter-catalogue` → OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)
- `pnpm format:check` → OK
- `pnpm check` (primeiro plano, completo) → **EXIT 0**: todos os passos verdes, incluindo `@detran/ui` build/test, os oito `verify:*`, e `portal-web` lint/test/build
- Nenhum `git`, nenhum `pnpm install`, nenhum processo em segundo plano

Critérios de aceitação:

- typecheck 0 erros: PASS
- lint 0 erros: PASS
- test 0 failed, 0 unhandled: PASS (672 passed, 3 todo)
- build OK: PASS
- verify:parameter-catalogue OK: PASS
- format:check OK: PASS
- `pnpm check` completo EXIT 0: PASS

Tabela artefato do contrato → arquivo → specs verdes: a tabela da entrega anterior permanece válida, agora com todas as linhas integralmente verdes sob a config real (`vitest.config.ts` com A7(a)): `data/portal.client.ts` → C-3a-05…18 (14/14); `data/idempotency-key.ts` → C-3a-01…04; `core/error-boundary.ts` → C-3a-19…30; `core/error-banner.component.ts` → C-3a-31…35; `core/field-errors.directive.ts` → C-3a-36…37; `core/session.facade.ts` → C-3a-38…45; `core/resume.service.ts` → C-3a-46; `core/offline-document.store.ts` → C-3a-87…91; os onze `shared/*` → C-3a-47…86; `forms/*` → C-3a-93…98; `i18n-keys.spec.ts` (C-3a-101) verde.

Fora do escopo / deixado: nada novo. Permanecem as decisões de engenharia aditivas registradas na entrega anterior (`WizardReceipt`, inputs opcionais do wizard para os rótulos do diálogo, `role="textbox"` no `<output>`, `HttpClient` resolvido na primeira requisição, `z.iso.datetime({ offset: true })`, banner sem controle de fechar aviso).

OD tocadas ou propostas: nenhuma nova nesta iteração (as propostas da entrega anterior — emissão de `elevationRequested` no 403 de `submit`, extensão de OD-P58, sintaxe de placeholder — seguem para o maestro conforme já registrado).

Bloqueios: nenhum.
