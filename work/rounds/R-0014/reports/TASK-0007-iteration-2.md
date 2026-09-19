Papel: Inspector
Tarefa: TASK-0007 (iteração 2)
Arquivos criados/alterados:
- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/screens/screen-sheets.spec.ts` (editado — 2 correções de tipo, nenhuma asserção alterada)

Nenhum outro arquivo tocado nesta iteração (`kb.ts` e os outros 4 specs novos já typecheckavam limpo — confirmado abaixo).

Correções aplicadas em `screen-sheets.spec.ts`:
- linha 27 (TS2677): o predicado `(screen): screen is string => screen !== null` afirmava `string`, mas o parâmetro é `` `T-${string}` | null `` — `string` é mais largo que o template literal e não é atribuível a ele. Troquei para `(screen): screen is \`T-${string}\` => screen !== null`, que tipa corretamente o `screen` filtrado sem alargar o tipo.
- linhas 48–50 (TS4111, `noPropertyAccessFromIndexSignature`): `meta.id`/`meta.status`/`meta.apps` acessavam um `Record<string, string>` (assinatura de índice) por notação de ponto, proibida por essa opção do `tsconfig.json`. Troquei para `meta['id']`, `meta['status']`, `meta['apps']` — mesmas comparações, mesmos valores esperados.

Comandos executados e saída resumida:
- `npx tsc -p tsconfig.spec.json --noEmit` (em `apps/portal/web`) → sem saída, 0 erros.
- `pnpm --filter @detran/portal-web typecheck` (raiz) → `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit`, sem saída, 0 erros.
- `node_modules/.bin/prettier --write apps/portal/web/src/app/screens/screen-sheets.spec.ts` → `unchanged`.
- `pnpm --filter @detran/portal-web test` (raiz) → `Test Files 17 passed (17)`, `Tests 472 passed (472)`.
- `pnpm format:check` (raiz) → `All matched files use Prettier code style!`.

Nota sobre o resultado do `test`: os 3 defeitos de catálogo relatados na iteração 1 (`portal.legal.consequencias_desistencia.v1.source` e `consequencias_indicacao.v1.source` ausentes; `portal.requests.nextAction.INELEGIVEL` grafado `INELIGIVEL`) não aparecem mais — `portal.pt-BR.json` já traz `consequencias_desistencia.v1.source`/`consequencias_indicacao.v1.source` preenchidos e `nextAction.INELEGIVEL` corrigido. Não toquei nesse arquivo (fora da minha fronteira de escrita); a correção veio de fora desta sessão de worker, entre a iteração 1 e esta (`git status` confirma `portal.pt-BR.json` seguindo como o único `M` pré-existente, sem diff meu).

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck` → 0 erros: **PASS**.
- `pnpm --filter @detran/portal-web test` → 472 passed, 0 failed: **PASS**.
- `pnpm format:check` → OK: **PASS**.

Fora do escopo / deixado: nada além do pedido pelo maestro nesta iteração — não revisitei a lógica dos specs (as duas verificações que exigiram acomodação documentada na iteração 1 — regex camelCase em `screen-i18n.spec.ts` e restrição a paths compostos em `screen-sheets.spec.ts` — seguem como estavam, já provadas corretas).

OD tocadas ou propostas: nenhuma.

Bloqueios: nenhum.
