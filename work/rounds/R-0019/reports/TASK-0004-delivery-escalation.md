# TASK-0004 — escalada da revisão de entrega CTG-0001

**Papel:** Inspector. **Executor:** `gpt-6-sol/high`. Após duas iterações de
TASK-0004, a revisão cruzada apontou que o teste positivo exigia uma âncora
rejeitada pelo DEVAI e não cobria OD de rodada anterior. A escalada editou
apenas `tools/law/tests/verify.test.mjs`, antes de nova alteração do Engineer.

O positivo de `## Decisão` usa `deciso`; `decisao` agora é negativo com
`AUTHORITY_ANCHOR_UNRESOLVED`. Uma linha válida `OD-R18-001` fora da seção
R-0019 é positiva, e uma `OD-R19-*` deslocada é negativa. Casos de manifesto
ausente, chave extra e JSON inválido foram acrescentados; os negativos
verificam códigos de violação específicos.

`node --check` e `pnpm format:check` **PASS**. `node --test` teve 26 PASS e 2
RED esperados, precisamente as duas correções pendentes em
`tools/law/verify.mjs`. Nenhum comando Git foi executado.
