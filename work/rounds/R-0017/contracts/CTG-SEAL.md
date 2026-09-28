# CTG-SEAL — correção append-only e selo R-0017

**Autoridade:** `SEAL-AUTHORIZATION.md` do Owner, PC-0017 imutável, Constituição 1.0.0 Art. 41. **Papel Architect:** contrato, registro D-1/D-2 e draft corretivo. **Inspector:** testes dos gates de índice e supersessão. **Engineer:** ferramentas, commits e integração. O maestro executa todos os verbos DEVAI `--write` após ensaio em clone descartável.

## Invariantes

1. PC-0017 conserva seu SHA-256 e os quatro `fail` históricos. Um novo PC aponta `supersedes: PC-0017`, mantém os sete critérios atuais `pass` e registra os quatro substituídos como `n/a`, citando as adendas A4–A6, as ODs do Owner e PC-0017. O PC novo é escrito apenas por `round close`.
2. O cadastro de decisões contém `### D-1` e `### D-2`, com os atos e referências de R-0017. O `record.md` é escrito somente por `round plan --declare`, aponta o PC novo e lista apenas gates `pass` do PC. `close-state.jsonl` é escrito somente por `round seal`.
3. O índice derivado de rodadas é produzido por script determinístico a partir de todos os arquivos `PC-*.json` em `record/proofs/compliance/closures/`. Cada linha contém id do PC, rodada, `supersedes` (ou `—`) e commit `merged_as`. A ordenação é numérica pelo PC; nome de arquivo, id e `round_id` divergentes falham. Não aceitar entrada ilegível, duplicada ou ciclo de supersessão. `--check` compara bytes esperados com a saída rastreada; `--write` só grava o caminho padrão `record/derived/indexes/rounds.md` sob `--repo-root`.
4. `verify:state-index` reconhece uma cadeia append-only por rodada e exige que a tabela `work/rounds/README.md` aponte para o PC terminal único. PC anterior só deixa de exigir igualdade com a linha quando há `supersedes` válido pelo sucessor da mesma rodada. PC órfão, ciclo, ligação entre rodadas, dois terminais ou PC inexistente continuam FAIL. Não reduzir as demais verificações C-01-17…19.
5. A ordem de escrita é: ensaio no clone → draft corretivo → `round close` real → `record-input.json` com ID emitido → `round plan --declare` → gerador do índice → `round seal` → verificação de `close-state.jsonl`, schema, índice, cadeia, `pnpm check` e CI. Se algum verbo divergir do ensaio, parar sem falsificar estado.

## Aceitação

- `node --test tools/devai/tests/render-rounds-index.test.mjs tools/docs/state-index/tests/gate.test.mjs` verde, incluindo um PC supersedido positivo e casos negativos de ligação/ciclo/terminais.
- `node tools/devai/render-rounds-index.mjs --check` verde e idempotência byte a byte com `--write` no clone.
- `pnpm verify:state-index`, `pnpm format:check`, `pnpm check`, `devai evidence verify --scope chain` verdes; novo PC válido no schema `phase-closure`.
- `round seal` retorna `ok: true` no clone e na worktree real e cria exatamente uma linha `close-state.jsonl` com o novo PC. CI verde e delivery-review `PASS` antes de mesclar. Após merge, observar SHA exato integrado, sem reescrever a cadeia.
