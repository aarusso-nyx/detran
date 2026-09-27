Papel: **Architect (transcrição)**.

Alterado apenas [backlog.md](/Users/aarusso/.codex/worktrees/local-stack/detran/docs/meta/knowledge-base/backlog.md:638), linhas 638–639:

- Registrado reparo futuro de `serve.buildTarget` do RAIT, com valores atuais, workaround CTG-0001, responsáveis e fonte §RAIT serve.
- Registrada ADR própria pendente para `packages/sefaz-adapter`, fora do escopo, com responsável e fonte §Riscos.

ODs: preservadas, sem reabertura. Fora de escopo: Angular, ADR, código, CI e demais registros.

Comandos:

- `pnpm exec prettier --check docs/meta/knowledge-base/backlog.md` — exit 0
- `pnpm docs:kb:check` — exit 0
- `pnpm format:check` — exit 1

Bloqueio: `format:check` falhou exclusivamente por formatação preexistente fora da fronteira permitida em `work/rounds/R-0017/reviews/delivery-review-CTG-0003.md`. Parei sem inspecionar ou alterar esse arquivo.