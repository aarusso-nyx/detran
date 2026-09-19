Papel: Architect (transcrição)
Tarefa: TASK-0006 (iteração 5 — adenda A7(c), sintaxe de placeholders)
Arquivos criados/alterados: `apps/portal/web/src/app/i18n/portal.pt-BR.json` (conversão de sintaxe `{{nome}}` → `{nome}` em 10 chaves; texto e nomes dos placeholders inalterados; nenhuma outra mudança)
Comandos executados e saída resumida:
- Script local (regex `\{\{([A-Za-z0-9_]+)\}\}` → `{$1}`) → `before: 10, after: 0`
- `node -e "JSON.parse(...)"` → JSON válido
- `grep -c '{{' apps/portal/web/src/app/i18n/portal.pt-BR.json` → 0
- `node_modules/.bin/prettier --write`/`--check apps/portal/web/src/app/i18n/portal.pt-BR.json` → `unchanged` / `All matched files use Prettier code style!`
- `npx vitest run --config vitest.config.ts src/app/i18n src/app/screens` (em `apps/portal/web`) → `Test Files 6 passed (6)`, `Tests 214 passed (214)`
- `node tools/parameters/verify.mjs --check-generated --check-usage` → **FALHA**, reprodutível: `apps/portal/web/src/app/core/error-boundary.spec.ts: unknown parameter literal rait.errors.x` (2×) — literal `rait.errors.x` não existe em `portal.pt-BR.json` (confirmado por grep) nem em qualquer arquivo tocado por mim; é um literal de teste negativo deliberado em `error-boundary.spec.ts` (linha 285, "nunca a chave estranha"), arquivo que eu nunca toquei. A suíte completa do pacote (rodada só para diagnóstico, não é critério desta iteração) passou de 17 para 50 arquivos de teste desde a iteração 4, com 6 arquivos falhando por razões não relacionadas a i18n — evidência de que outro worker alterou o mesmo worktree compartilhado entre minhas iterações 4 e 5.

Critérios de aceitação:
- JSON válido: PASS
- `pnpm --filter @detran/portal-web test -- src/app/i18n src/app/screens` verde: PASS (214 passed, 0 failed)
- `pnpm verify:parameter-catalogue` OK: **FAIL** — causa externa à minha fronteira de escrita (ver acima); não corrigível sem tocar `error-boundary.spec.ts`, fora de "só esse arquivo"
- `pnpm format:check` OK (arquivo tocado): PASS

Chaves convertidas (10):

| Chave | Antes | Depois |
| --- | --- | --- |
| `portal.common.deadline.days_left` | `Faltam {{daysLeft}} dias` | `Faltam {daysLeft} dias` |
| `portal.documents.cnh.validity` | `Válida até {{validUntil}}` | `Válida até {validUntil}` |
| `portal.documents.consulta.consultedAt` | `Consultado em {{consultedAt}}` | `Consultado em {consultedAt}` |
| `portal.documents.consulta.source` | `Fonte: {{source}}` | `Fonte: {source}` |
| `portal.errors.internal` | `…informe o código {{requestId}} ao suporte.` | `…informe o código {requestId} ao suporte.` |
| `portal.screens.t10.field.restituicao` | `…restituição de {{amount}}, já atualizada.` | `…restituição de {amount}, já atualizada.` |
| `portal.screens.t11.field.prazo` | `Envie até {{dueOn}}.` | `Envie até {dueOn}.` |
| `portal.screens.t12.field.canal` | `Recebido por {{source}}` | `Recebido por {source}` |
| `portal.screens.t16.field.validade` | `Válida até {{validUntil}}.` | `Válida até {validUntil}.` |
| `portal.screens.t17.state.pendencia` | `Falta quitar {{amount}} antes de emitir o CRLV-e.` | `Falta quitar {amount} antes de emitir o CRLV-e.` |

Fora do escopo / deixado: nenhuma outra chave, texto ou nome de placeholder alterado; nenhum outro arquivo tocado.
OD tocadas ou propostas: nenhuma.
Bloqueios: `pnpm verify:parameter-catalogue` está falhando por um literal (`rait.errors.x`) em `apps/portal/web/src/app/core/error-boundary.spec.ts` — arquivo fora da minha fronteira de escrita e não relacionado a `portal.pt-BR.json`; parece ter sido introduzido por outro worker no mesmo worktree compartilhado entre esta iteração e a anterior (a suíte completa do pacote também cresceu de 17 para 50 arquivos de teste no intervalo). Recomendo o maestro confirmar com o worker responsável (provável TASK-0009/Engineer) antes de tratar esta iteração como bloqueada por mim.
