Papel: Architect (transcrição)  
Tarefa: TASK-0010 — escalada restrita

Arquivos alterados/ratificados:

- Alterado: `docs/meta/agents/orchestra/waves.md`, somente R-0017.
- Formatado: `work/rounds/README.md`, somente alinhamento de R-0017.
- Ratificados sem edição: `docs/meta/knowledge-base/backlog.md` e seção R-0017 de `open-decisions-rait.md`.

Comandos:

- `pnpm exec prettier --write …waves.md …README.md` — exit 0.
- `pnpm verify:state-index` — exit 0; 39 ADRs, 33 rodadas, 16 closures.
- `pnpm docs:check` — exit 0; typecheck e build concluídos.
- `pnpm format:check` — exit 0.

Critérios:

- R-0017 permanece `aberta`, PRs `#133, #143`, PC `—`, CTG-0003 em curso: PASS.
- Linha `waves.md` inclui M1, OD-R17-001…004, checkpoint/RC e head da cadeia CTG-0002: PASS.
- A7 preservada como esclarecimento técnico, não decisão: PASS.
- Escopo restrito às linhas/entradas R-0017 permitidas: PASS.

ODs: OD-R17-001, OD-R17-002, OD-R17-003 e OD-R17-004 preservadas.  
Fora do escopo: código, CI, testes, integrações reais e PEC.  
Bloqueios: nenhum.