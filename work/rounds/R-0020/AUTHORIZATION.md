# Autorização do Owner — R-0020 `devai-sensors`

**Data:** 2026-09-27. **Papel decisor:** Owner.

O Owner autoriza a abertura de R-0020 com este prompt e decide a seguinte **troca de famílias**,
que prevalece sobre o que diz o prompt da rodada:

- **Maestro e workers:** família **Codex**. Você é o maestro com **Sol 6**. Os workers são
  subagentes Codex pela escada de `docs/meta/agents/orchestra/model-ladder.md`: Sol 6 para Architect
  e tarefas grandes, e os modelos Codex médio e pequeno vigentes para Inspector, Engineer e
  transcrição. Confirme os ids com `codex --help`.
- **Reviewer:** sempre da outra família, **Claude Code com Opus 5.5**, em nível grande, pela ponte
  `tools/orchestra/bridge.sh claude <id-opus-5.5> …`. Confirme o id com `claude --help`. Nunca
  inverta.
- No bootstrap, registre a troca em três lugares:
  - `work/rounds/R-0020/AUTHORIZATION.md`, com o texto desta seção;
  - `plan.md` §Decisões do maestro, como M1, junto com os ids confirmados;
  - `docs/meta/agents/orchestra/waves.md` (coluna Maestro e §Histórico), na tarefa de documentação.

O restante de `prompts/00-maestro.md` vale sem alteração, exceto o caminho físico da worktree
adaptado ao host nesta sessão: o repositório raiz está em `/Users/aarusso/Development/detran`,
conforme correção do Owner. O branch continua `orchestra/devai-sensors`.

Decisões preexistentes preservadas: OD-R20-003 = (A), autoria por caminho; OD-R20-005 = aceitar
a Constituição 1.0.1 por `devai init bind --constitution` em commit segregado de autoria Owner;
decisões da campanha C-0002 §7, §9 e §10.
