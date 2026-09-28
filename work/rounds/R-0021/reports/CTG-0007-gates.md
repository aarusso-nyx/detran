# CTG-0007 — gates do candidato documental

Papel de execução dos gates e Git: Engineer; julgamento documental: Architect. Base `69642874c1ccd4cf4d1c6f0ec431ecd9fb848a05` (merge do PR #151); checkpoint da transcrição `fd58d9b08eb98c2471fa2aad50c30d52dfdd90a1`. `origin/main` permaneceu nessa base após `git fetch origin main`. O único delta de produto após CTG-0002 é nenhum; este grupo acrescenta documentação, autorização já concedida representada para o runtime, revisão e observação DEVAI exata do merge #151.

| Verificação | Resultado | Log SHA-256 |
| --- | --- | --- |
| `pnpm format:check` após correção do review 1 | exit 0 | `/tmp/r21-format-after-review.log`; Prettier: todos os arquivos conformes |
| `pnpm check` | exit 0 | `ctg0007-check.log`: `46561d5f9d730913c69a075e6e0b5e77ca29393d892665fa98d9ed3318ff415a` |
| `pnpm backend:test:ci` | exit 0 | `ctg0007-backend-ci.log`: `4668153d3ee1f8fda495d05a9872062df947eedd4a7573bb5a179b64b6d757e1` |
| `pnpm build` | exit 0 | `ctg0007-build.log`: `ed91a435682db60f0c1267d30fb20711227dcb22e38eac9ccc6fff2644087b74` |
| `pnpm backend:rls-smoke` | exit 0 | `ctg0007-rls-smoke.log`: `0a09062867f30c22d0657342f2a2e93b8f9725bc5e0b4158299ee1fb5d82e83d` |
| `pnpm devai:doctor` | exit 0 | `/tmp/r21-ctg0007-doctor.log`; pin constitucional 1.0.0 preservado |
| `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` | exit 0, antes da prova deste grupo | head `dd20c041e50928a77cbea9c3d3c578e3ba837ebfbb3bf73c333021bcc20abb1c` |

O backend CI rodou no PostGIS exclusivo `detran-r21-postgis`, com mock SENATRAN da rodada em `127.0.0.1:31021`, usando `/tmp/r21-db-env.sh`. O app e2e passou em 37/37 arquivos, 1.681 testes verdes e 3 TODO preexistentes; o upgrade passou 21/21. O RLS smoke confirmou isolamento de tenant, 140 tabelas inf/ch, RLS ops, SRID 4674 e auditoria.

O `pnpm check` inclui `verify:rls-ddl`, `verify:decorators`, `verify:role-catalog`, `blueprints:check`, `contracts:check`, `docs:kb:check` e `docs:kb:publish-check`; não houve falha nesses checks. A reprodução isolada `stack:smoke` do candidato de produto CTG-0002 passou 42/42 em Docker-in-Docker. Não foi repetida para o delta documental. Os workflows manuais remotos seguem exit 1 tanto para o candidato quanto para a referência 1.3.1, com triagem em `CTG-0002-stack-smoke-triage.md`; nenhum PASS remoto é inferido.

Review independente `claude-opus-5-5`: ciclo 1 REVIEW pelo pin DEVAI incorreto; ciclo 2 PASS em JSON válido após correção no ADR-0015 e errata que preserva o relatório verbatim do worker. Os dois temporários citados como informação no ciclo 2 não existem. Nenhum PC, close ou selo foi emitido durante estes gates.

Os três logs longos foram normalizados somente para remover linhas vazias finais ao versionar; os logs brutos da execução permanecem em `/tmp/r21-ctg0007-{check,backend-ci,build}.log`, com SHA-256 respectivamente `0f0bae3120a6b173684f104ad2cc81a3773b12d8426a02dbf80db9977c51e2b4`, `0ddcc365dd6108ff1616978de76e607c45bb2bc1c73b561d09df319f4888fdb6` e `f3e808499bd0e2e7465578106d9edd817694bea21e5e7e4d8811e988de01bc8e`.
