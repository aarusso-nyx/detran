Papel: Inspector
Tarefa: TASK-0007 (iteração 3 — adenda A5, achados `high` do reviewer)

Arquivos criados/alterados:
- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/screens/legal-texts.spec.ts` (editado)
- `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/screens/screen-sheets.spec.ts` (editado)

Nenhum outro arquivo tocado (li `plan.md` §Adendas A5 e `reviews/delivery-review-CTG-0002.json` por inteiro antes de editar; nenhum `git`, nenhum `install`).

Correções aplicadas:
1. **`legal-texts.spec.ts` (achado #1, `high`).** A asserção "dado o catálogo quando portal.legal.efeitos_sne.v1.* é lido então tem exatamente 4 chaves-filhas além de .source" (só contagem) foi substituída por uma que fixa os quatro nomes de [RN-PORTAL-123] (`ciencia_ficta`, `substituicao`, `responsabilidade`, `cancelamento` — plan.md §Adendas A5.a): compara o conjunto ordenado das chaves-filhas ao conjunto fixo `SNE_EFFECTS` (`toEqual`, não mais só `toHaveLength`) e, para cada uma das quatro, verifica existência e comprimento ≥ 40. Comentário de cabeçalho do arquivo atualizado para citar a adenda A5 em vez da instrução anterior "sem fixar nomes".
2. **`screen-sheets.spec.ts` (achado #2, `high`).** A verificação "Identidade não cita rota de outra tela" deixou de se restringir a paths compostos (com `/`). Agora extrai da seção Identidade só os spans com forma de rota — iniciados por `/`, ex. `` `/autos` `` — via `backtickSpans(identity).filter(span => span.startsWith('/'))`, normaliza (remove a barra) e compara contra **todos** os paths de outras telas no manifesto, inclusive os de um segmento (`autos`, `processos`, `notificacoes`, `sinistros`...). Isso resolve a colisão com nome de módulo sem restringir a cobertura: citações de módulo na prosa (`` `autos` ``, sem barra) nunca entram no conjunto comparado, mas uma citação real de rota de outra tela, com ou sem múltiplos segmentos, seria pega.

Comandos executados e saída resumida:
- `node_modules/.bin/prettier --write legal-texts.spec.ts screen-sheets.spec.ts` → ambos `unchanged`.
- `npx vitest run --config vitest.config.ts src/app/screens/legal-texts.spec.ts src/app/screens/screen-sheets.spec.ts --reporter=verbose` → `Test Files 2 passed (2)`, `Tests 170 passed (170)` — a verificação ampliada (2) não acusou nenhuma ficha real; nenhum defeito a relatar.
- `pnpm --filter @detran/portal-web typecheck` → `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit`, sem saída, 0 erros.
- `pnpm --filter @detran/portal-web test` → `Test Files 17 passed (17)`, `Tests 472 passed (472)`.
- `pnpm format:check` → `All matched files use Prettier code style!`.

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck` → 0 erros: **PASS**.
- `pnpm --filter @detran/portal-web test` → 0 failed (472): **PASS**.
- `pnpm format:check` → OK: **PASS**.

Defeitos encontrados pela verificação ampliada (2): nenhum — as 27 fichas passaram sem exceção; nenhuma cita, com forma de rota (`` `/...` ``), o path de outra tela.

Fora do escopo / deixado: nenhuma outra asserção dos 5 specs foi alterada, conforme instrução do maestro ("nenhuma outra asserção muda").

OD tocadas ou propostas: nenhuma.

Bloqueios: nenhum.
