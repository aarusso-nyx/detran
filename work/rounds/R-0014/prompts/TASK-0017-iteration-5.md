# TASK-0017 — iteração 5 (restrita, Codex): heurística de C-3c-78 (nota do delivery-review-CTG-0003c-2)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Leia: `work/rounds/R-0014/plan.md` §Adendas A12 (item (g) e a nota
final sobre C-3c-78); `work/rounds/R-0014/contracts/CTG-0003c.md` critério C-3c-78;
`apps/portal/web/src/app/core/realtime.service.spec.ts` (inteiro) e
`apps/portal/web/src/app/core/realtime.service.ts` (só leitura).

Tarefa: em `realtime.service.spec.ts`, a prova de C-3c-78 ("`60_000` é o único literal de
intervalo") deve manter **uma** defesa — a exclusão **por linha** da constante de unidade
`MS_PER_SECOND` — e voltar o filtro numérico a `>= 1000` (hoje `> 1000`, que deixaria escapar um
`1000` cru usado como intervalo em outra linha). Nenhuma outra mudança; nenhuma asserção removida.

Pode tocar: só `apps/portal/web/src/app/core/realtime.service.spec.ts`.

Critérios: `pnpm --filter @detran/portal-web typecheck` → 0; `pnpm --filter @detran/portal-web lint`
→ 0; `pnpm --filter @detran/portal-web test -- core/realtime.service.spec.ts` → verde (cite a
linha `Tests`); `node_modules/.bin/prettier --check` no arquivo → OK.

Entrega (última mensagem):

```markdown
Papel: Inspector
Tarefa: TASK-0017 (iteração 5)
Arquivos alterados: <caminho>
Comandos executados e saída resumida: <linhas>
Critérios de aceitação: <PASS/FAIL cada>
Bloqueios: <ou "nenhum">
```
