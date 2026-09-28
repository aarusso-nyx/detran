Papel: Inspector
Tarefa: TASK-0002
Arquivos criados/alterados: `tools/devai/tests/baseline.test.mjs`
Comandos executados e saída resumida:
- `node_modules/.bin/prettier --write tools/devai/tests/baseline.test.mjs` → formatado.
- `pnpm format:check` → PASS, exit 0.
- `node --test tools/devai/tests/baseline.test.mjs` → RED esperado: 4 testes falham pois `tools/devai/baseline.mjs` ainda não existe.
Critérios de aceitação: formatação PASS; arquivo presente e limitado à fronteira PASS; testes executam RED documentado.
Fora do escopo / deixado: implementação de `tools/devai/baseline.mjs` e scripts para TASK-0003.
OD tocadas ou propostas: nenhuma.
Bloqueios: nenhum.
