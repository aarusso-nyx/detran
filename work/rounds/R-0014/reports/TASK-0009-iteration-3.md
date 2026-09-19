Papel: Engineer
Tarefa: TASK-0009 (iteração 3)

Arquivos criados/alterados:

- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/shared/attachment-uploader.component.ts` — o `<input type="file">` ganha nome acessível: novo input opcional `labelKey = input<string | null>(null)` (chave da tela chamadora, padrão `…LabelKey` do contrato §5) renderizado como `<label [for]="inputId()">`; sem `labelKey`, o nome vem do próprio elemento da dica (`aria-labelledby="<hintId>"`), mantendo `aria-describedby` com a dica (C-3a-72). `inputId` derivado de `requestId`.
- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/shared/signature-step.component.ts` — no caminho `upload` passa `[labelKey]="'portal.forms.assinatura.method.upload'"` (chave já existente: "Enviar documento já assinado").
- Nenhum spec, stub, fixture, catálogo ou config tocado. Nenhuma chave i18n nova.

Comandos executados e saída resumida:

- `node_modules/.bin/prettier --write` nos dois arquivos → formatados
- `npx vitest run attachment-uploader.component.spec.ts signature-step.component.spec.ts` → 20 passed | 1 todo (axe C-3a-99/100 verdes)
- `pnpm --filter @detran/portal-web typecheck` → exit 0
- `pnpm --filter @detran/portal-web lint` → exit 0
- `pnpm --filter @detran/portal-web test` → `Test Files 50 passed (50)`, `Tests 711 passed | 3 todo (714)`, 0 erros não tratados, exit 0
- `pnpm --filter @detran/portal-web build` → exit 0
- `pnpm verify:parameter-catalogue` → OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)
- `pnpm format:check` → OK
- `pnpm check` (completo, primeiro plano) → **EXIT 0**
- Nenhum `git`, nenhum `pnpm install`, nenhum processo em segundo plano

Critérios de aceitação:

- typecheck 0 erros: PASS
- lint 0 erros: PASS
- test 0 failed (711 passed, 3 todo): PASS
- build OK: PASS
- verify:parameter-catalogue OK: PASS
- format:check OK: PASS
- `pnpm check` completo EXIT 0: PASS

Tabela artefato do contrato → arquivo → specs verdes: inalterada em relação à iteração 2, agora com C-3a-99/100 integrais verdes para `AttachmentUploader` (§5.6) e `SignatureStep` (§5.8); todos os demais artefatos seguem verdes.

Fora do escopo / deixado: `labelKey` do uploader é opcional (aditivo ao §5.6) — as features dos pares 2/3 devem passar a chave do campo de anexos da sua tela (ex.: `portal.forms.resposta_diligencia.anexos`, `portal.forms.recurso_jari.provas`); o fallback pela dica garante o nome acessível quando não o fizerem.

OD tocadas ou propostas: nenhuma nova.

Bloqueios: nenhum.
