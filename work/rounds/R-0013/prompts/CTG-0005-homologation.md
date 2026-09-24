# Prompt corretivo — CTG-0005, fechamento de homologação R-0013

Papel constitucional: **Architect (documentação) → Reviewer independente**;
maestro opera Git/evidência/PR somente após gates e autorização aplicáveis. Ler
`AGENTS.md`, `CODESTYLE.md`, `plan.md`, ADR-0033, `teat-build-pack.md`,
`teat-frontends.md`, backlog, relatórios e reviews CTG-0004a/b, e issues de produção.
TASK-0018 e seu review anterior documentam um estado anterior; não atestam o novo
escopo por si sós.

## Meta

Atualizar build pack, arquitetura, backlog e história da rodada para declarar o que
foi **entregue e provado** como homologação de UI/workflows mobile/web. Separar
expressamente os gates desta build dos requisitos de produção das ADR-0028–0032.
Referenciar as issues completas do round produtivo posterior (R-0017 é candidato,
não compromisso de agenda ou ID reservado), com dependências e critérios de aceite.
Não fechar WP-T6 como app de campo, não declarar KMS/Keystore/GMS820 integrado e não
usar PASS documental/narrow de ciclos anteriores como PASS integral.

## Critérios de aceitação

- CTG-0004a e CTG-0004b têm gates integrais verdes e review independente PASS do
  candidato atual. `pnpm format:check`, `pnpm docs:kb:check`,
  `pnpm docs:kb:publish-check` e `pnpm check` verdes após a transcrição.
- Cada afirmação de entrega aponta para teste, comando e revisão; relatório distingue
  homologação, integração real já provada e escopo de produção postergado.
- Issues de produção abertas e vinculadas cobrem E2/segredos, Android/GMS820,
  AIT/catálogo, ciclo transacional/sync e liberação de campo. Nenhuma lacuna vira
  `PASS`, `skip`, `todo` ou decisão presumida.
- A PR e o fechamento de R-0013, quando autorizados e executados, usam título e
  descrição de **homologação de UI/workflows**, sem alegar produção.
