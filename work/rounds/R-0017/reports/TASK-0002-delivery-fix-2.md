Papel: Inspector

Tarefa: acrescentei o sensor de ausência das cinco variáveis opcionais no ambiente isolado do backend.

Arquivos criados/alterados:

- [tools/stack/revision.test.mjs](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/stack/revision.test.mjs)

Comandos executados e saída resumida:

- `pnpm exec prettier --write tools/stack/revision.test.mjs` — sem alterações necessárias.
- `node --test tools/stack/characterization.test.mjs` — 13/13 verde.
- `node --test tools/stack/revision.test.mjs` — 28 verdes, 1 vermelho: o novo sensor detecta `DETRAN_LOCAL_ACTOR_ID=` vazio.
- `pnpm format:check` — exit 0; Prettier aprovado.

Critérios de aceitação:

- Caracterização verde: atendido.
- Apenas o sensor novo vermelho, sem skip/todo: atendido.
- Formatação: atendido.

Fora do escopo / deixado: nenhuma alteração de produção ou de outros artefatos.

OD tocadas ou propostas: nenhuma.

Bloqueios: nenhum.