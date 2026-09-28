# CTG-0002 — pin STYNX 1.4.0 e gates

Papel: Architect na coordenação; TASK-0015 foi produzida por Inspector Terra/medium e TASK-0004 por Engineer Luna/medium. Base integrada: `3d96eeb8650446ae47519b2fe2c989a9028ba07d` (merge CTG-0001). Commit de produto `bf85eb70`, merge normal de main `3e7ee10c`, prova Auditor gerada pelo runtime em `15b5ab773bcb8c2d3db52a4fb242274a1cc3f1be`. Árvore desse HEAD: `5d60f0c23dcbd25949afd87147b2162eebc8d4cc`. A cadeia de provas verifica com head `a88d485148a537de89608425a79d4b2c997a8c6929609e0c73f9b3b5b7c97485` antes do registro CTG-0002.

TASK-0015 registrou RED esperado antes do CLI: oito casos encontrados, falha exclusivamente por ausência de `tools/check-stynx-pin.ts`; spec congelado SHA-256 `95dc74060b2da90a65b02a7402ea8d28fc50891555de8acd2c97d15ae272a0f0`. Após TASK-0004, os mesmos oito casos passam sem alteração. O maestro executou a geração e instalação sob lock. Comparei os 59 `package.json` alterados com o HEAD anterior: 158 declarações `@stynx-nyx/*` passaram exatamente de 1.3.1 para 1.4.0, sem outro diff semântico nos manifests; 48 são gerados e 11 são manuais. O lockfile foi resolvido com token obtido de `gh auth token`, sem registrar segredo.

| Comando | Ambiente / resultado | Prova SHA-256 |
| --- | --- | --- |
| `pnpm blueprints:generate` | exit 0; 48 manifests gerados só por pin | `ctg0002-blueprints-generate.log` — `ca9f0bf9758cd00118340c0984eb22e5fca8df4c55e721e95763eaaec38bc3bb` |
| `pnpm install --no-frozen-lockfile` | exit 0; lockfile STYNX 1.4.0 | `ctg0002-install.log` — `7d84cc95e06940b88e9e4c3429dee80a55afeacba0c0b36bd990212b7f4d0c69` |
| `pnpm install --frozen-lockfile` | exit 0 | `ctg0002-frozen-install.log` — `287c0cd3778187cf917c76f5b4b9e3f9d04856d2645721cc19736597fcfad6b1` |
| `pnpm --filter @detran/ch-clinical-reports build` | exit 0 após o pin | `ctg0002-clinical-build.log` — `2e194a05dab24230bd7278b738f72f082126f8ebcd0bf8cfdb3193ae41bad0d1` |
| `pnpm check` | exit 0; inclui `verify:stynx-pin`, oito testes, `blueprints:check`, contratos, parâmetros, typecheck, UI e builds frontend | `ctg0002-check.log` — `857a2123d011ad7254ffafe3ca91a7ce8afb06afc6bbd5e797485632f0033a16` |
| `pnpm backend:test:ci` | exit 0; PostGIS exclusivo, DB fixo `detran_r7_ctg1_a2`, mock SENATRAN `127.0.0.1:31021`; 37 arquivos e2e/1.681 testes passados, 3 `todo` preexistentes; upgrade RAIT 21/21 | `ctg0002-backend-ci.log` — `976dbd6b675ef70f85246175d38831b6de0256fbb0e496b47383acdd07a35c8c` |
| `pnpm build` | exit 0 | `ctg0002-build.log` — `1296fa4a50fea8a563dba738c2a8d71e524623fcc9d4efc48ffa11562dcd88bb` |
| `pnpm backend:rls-smoke` | exit 0; mesmo banco isolado restaurado pelo runner CI | `ctg0002-rls-smoke.log` — `0a09062867f30c22d0657342f2a2e93b8f9725bc5e0b4158299ee1fb5d82e83d` |

`pnpm check` cobre `verify:rls-ddl`, `verify:decorators`, `verify:role-catalog`, `blueprints:check`, `contracts:check`, `docs:kb:check` e `docs:kb:publish-check` na mesma árvore. O `backend:test:ci` inclui as suítes de C-01-01…10 e C-01-20…30 no pin novo; a baseline 1.3.1 já tinha os mesmos testes verdes, conforme `CTG-0001-gates.md`. O smoke da stack completa será executado no runner isolado do workflow `workflow_dispatch` após publicar o candidato; a porta local 5432 pertence a outro PostgreSQL e não foi alterada.

## Integração final de main e review

Opus 5.5 retornou PASS exaustivo no ciclo 1 (`reviews/delivery-review-CTG-0002-1.json`) com quatro achados low, sem high. O estado de TASK-0004 foi alinhado a `pre_merge`; a tentativa de usar `devai task status/start` respondeu `TASK_ROUND_INACTIVE` nesta rodada preparada, registrada sem criar round record artificial. As descrições históricas 1.3.1 dos frontends serão transcritas por TASK-0014; o CLI e os logs atuais satisfazem o contrato. `origin/main` avançou a `c10b226366ba3c31f92e59148e704d360583beb4` somente em 23 arquivos de campanha/planos R-0022…R-0032. Merge normal `1bbb30e509441aa63408bbc849d5c05786cc4f31` preservou o produto sem diff em `backend/`, `apps/`, `packages/`, `tools/`, `package.json` ou `pnpm-lock.yaml` (comando `git diff --quiet 39006eb4..1bbb30e5 -- ...` exit 0). Opus 5.5 revisou exclusivamente o delta no ciclo 2 e retornou PASS sem achados (`reviews/delivery-review-CTG-0002-2.json`).

`pnpm check` foi repetido após o merge: exit 0. `ctg0002-check-main-merge.log` SHA-256 `50ee83057dd6371e59d74b039ad246f879edcda55fe824b5adfca3cc03af66f9`; a linha final `exit=0` registra o código real capturado pelo maestro. Backend, testes e script do runner permaneceram byte a byte idênticos ao ciclo 1, cujo `backend:test:ci` verde cobre a mesma implementação. `devai evidence verify --scope chain` após o merge: exit 0, head `a88d485148a537de89608425a79d4b2c997a8c6929609e0c73f9b3b5b7c97485` antes da prova CTG-0002.
