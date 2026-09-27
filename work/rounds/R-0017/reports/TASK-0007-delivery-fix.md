Papel: Engineer  
PC: PC-b855ce8a4d669db3  
Tarefa: TASK-0007 iteração corretiva de entrega

Arquivos alterados:
- `tools/detran-stack.sh`
- `tools/stack/smoke.mjs`
- `tools/stack/portal-fixture.sh`
- `tools/stack/sefaz-adapter-smoke.mjs`
- `tools/stack/mocks/sefaz-mock.mjs`

Mudanças ratificadas/corrigidas/revertidas:
- Ratificadas: fixture Portal sintética exclusiva, `fixture-portal`, build topológico, `pg_isready` IPv4, mock SEFAZ com `env -i`, headers reais, filtro Dashboard `app=portal`.
- Corrigidas: identidade default/membership A7, remoção de todos os `DETRAN_LOCAL_*` herdados nos restarts, `readyz`, `tail -n`, relatórios de preflight separados, estado PEC por `angular.json`, tenant em arrays, entrypoints robustos e smoke SEFAZ completo.
- Revertidas: nenhuma.

A fixture Portal cria/reativa o ator default e uma membership ativa sem roles/grupos/permissões. Isso é suficiente porque o STYNX verifica apenas `auth.memberships.is_active` e tenant ativo em `tenant-context.interceptor.js:105-120`; os roles vêm de `DetranLocalTokenVerifier` em `backend/app/src/detran-runtime.ts:315-327`.

Comandos e resultados:
- `pnpm test:stack` inicial — 52/55 PASS; três vermelhos esperados.
- `node tools/stack/sefaz-adapter-smoke.mjs` — PASS; seis DTOs, erros normalizados, `405/Allow`, JSON malformado e todos os marcadores.
- `pnpm test:stack` final — 54/55 PASS; falha somente em `contract.test.mjs:581`.
- `node --test tools/stack/contract.test.mjs` — 10/11 PASS; falha do parsing do último campo vazio.
- `node --test tools/stack/revision.test.mjs` — 31/31 PASS.
- `pnpm format:check` — FAIL somente por `work/rounds/R-0017/prompts/TASK-0007-delivery-fix.md`, fora da fronteira permitida.
- Prettier dos três JS alterados, `bash -n` e `node --check` — PASS.

C-02-02/04/05/06:
- C-02-02: PASS offline.
- C-02-04: estrutura offline PASS; live pendente do maestro.
- C-02-05: não declarado PASS: sensor do Inspector falha por defeito de parsing, embora confirme ator ausente.
- C-02-06: estrutura offline PASS; checkpoint live pendente do maestro.

Processos ao final: nenhum persistente; o mock efêmero do adapter foi fechado em `finally`.

Bloqueios:
- `tools/stack/contract.test.mjs:554-581`: `trim()` remove o terceiro campo vazio do último restart, produzindo `undefined` em vez de `''`. O ambiente correto está ausente; não contornei isso inserindo `DETRAN_LOCAL_ACTOR_ID`.
- Formatação global bloqueada por arquivo de prompt fora da autoridade.

Para o maestro: faltam sensores do Inspector para a nova `auth.users`/`auth.memberships` da fixture Portal e para comprovar diretamente o body inválido atravessando o adapter; a implementação já o valida.