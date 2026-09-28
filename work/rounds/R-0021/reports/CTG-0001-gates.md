# CTG-0001 — gates e triagem antes do pin

Papel: Architect (coordenação dos gates); código e testes pertencem aos Inspectors identificados nos relatórios TASK-0002/0003.
Árvore de entrada: `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b` mais os arquivos preparados e os sete specs novos. Node v24.20.0, pnpm 9.15.0, STYNX 1.3.1. PostGIS 3.4.3 em container exclusivo da rodada `a9abf78080db`.

| Operação | Banco / ambiente | Exit | Prova |
| --- | --- | ---: | --- |
| Baseline `pnpm check` antes dos Inspectors | árvore de preparação | 0 | `baseline-check.log`, SHA-256 `002039a261be0d4d1f45eae77dc63d91af86ee79a8f6bb030e354bdea0bf7144` |
| Build `@detran/ch-clinical-reports` antes da caracterização | sem banco | 0 | `clinical-build-pre.log` |
| `backend:test:prepare-legacy` | banco fixo do runtime no container exclusivo | 0 | `db-prepare.log`, 20 casos e DDL/seed canônicos |
| E2e integral de TASK-0002 após satisfazer o nome de banco exigido pela suíte RAIT | `detran_r7_ctg1_a2`, container R21 | 0 | `task0002-e2e-fixed.log`, 3 arquivos/107 testes |
| E2e integral de TASK-0003 após restaurar sua fixture | `detran_r21_task3` | 0 | `task0003-e2e-fresh.log`, 3 arquivos/50 testes |
| Primeiro `pnpm check` do grupo | árvore anterior a duas correções focais | 143 (encerrado pelo maestro, sem veredito) | `ctg0001-check-aborted.log`; encerrado durante `blueprints:check` para não validar árvore obsoleta |
| `pnpm check` final | árvore corrigida | 0 | `ctg0001-check.log`, SHA-256 `f5f4446b8601acad7b2e2b9943f258d5adbb940d64231e8ea62742436e353aad` |
| Primeiro `pnpm backend:test:ci` | banco fixo, mock nacional ausente | 1 | `ctg0001-backend-ci-no-mock-fail.log`; 22 falhas em 4 arquivos e2e do Portal dependentes de mock; não há edição em código Portal |
| `pnpm backend:test:ci` com `SENATRAN_PROVIDER=mock` e `SENATRAN_MOCK_BASE_URL=http://127.0.0.1:31021` | banco fixo, mock SENATRAN e banco `senatran` exclusivos | 0 | `ctg0001-backend-ci.log`, SHA-256 `b008d421790cebd685d15b25049225d01120ca8e50faa26c7413b09cacb6cf5c`; app e2e 37/37 arquivos; upgrade 21/21 testes |

Triagem: o e2e RAIT exige literalmente `detran_r7_ctg1_a2`; o runtime `backend:test:ci` usa o mesmo nome. Ele só existe dentro do container exclusivo da rodada. A suíte BOAT existente reutiliza chaves determinísticas, portanto o banco `detran_r21_task3` foi restaurado da fixture canônica antes da execução conjunta, sem mudar testes. O primeiro `backend:test:ci` foi `sensor-error` de ambiente por mock não iniciado. O serviço persistente da rodada responde em health sob PID 96431; o primeiro processo de mock iniciado por shell curto terminou antes do e2e e não foi reutilizado. Os negativos e os logs falhos foram preservados; nenhum gate foi declarado verde antes de exit 0.

## Ciclo 2 após delivery review

Os Inspectors corrigiram os quatro achados high do review 1 e repetiram os focais: TASK-0002 clínica 5 arquivos/34 testes, RENACH unit 2/13, perfis e2e 2/13 e app typecheck; TASK-0003 offline integração 5/46 e novo e2e 1/2. Todos exit 0. O typecheck global e os demais gates da cadeia são cobertos por `pnpm check`; a lista e2e integral anterior de TASK-0002 está em `task0002-e2e-fixed.log` (3 arquivos/107 testes). Os negativos novos são cobertos pelo `backend:test:ci` deste ciclo.

`pnpm check` na árvore do ciclo 2: exit 0, `ctg0001-check-cycle2.log`, SHA-256 `362d61932f7d4a660537f8949655f5d5d4c3a9080bb0f76b843d33da18d1c7b1`. Houve uma tentativa anterior que parou no formatador por `delivery-review-CTG-0001-1.prompt.md`; o arquivo de entrada do review foi formatado e o comando foi repetido, sem alterar as asserções de produto. O registro `.bridge.json` conserva o hash do prompt exatamente apresentado ao reviewer no ciclo 1; a formatação posterior desse arquivo está declarada aqui.

`pnpm backend:test:ci` na mesma árvore: exit 0, `ctg0001-backend-ci-cycle2.log`, SHA-256 `29494ec1b4c83a7f13904a8c484018c577c2c5d3cd8b0e0a9e8ccf9cc428b677`. Banco fixo `detran_r7_ctg1_a2` no PostGIS exclusivo, mock SENATRAN local em `127.0.0.1:31021`; app e2e 37 arquivos/1.681 testes passados e 3 `todo` existentes; upgrade RAIT 21/21. Ambos os gates finais do grupo estão verdes antes da revisão 2.

## Integração do avanço de main

Após delivery-review ciclo 2 PASS, `origin/main` avançou a `8e7c583211f3a622db8745720504abe48e73d74e` pelo selo corretivo da R-0017. O commit de entrega `a9d494238517143afc61ecdaedd75e4a6c51d0b3` incorporou-o em merge normal `480f7fccc3014c009651b50656ba9c68915008ba`; o merge automático preservou os ODs R-0021 no registro. `git diff a9d4942..480f7fc -- backend/` é vazio e o script `backend:test:ci` não mudou, portanto o backend CI de ciclo 2 cobre o mesmo código e harness. `pnpm check` foi repetido sobre a árvore integrada: exit 0, `ctg0001-check-main-merge.log`, SHA-256 `448d62c220ae9d1a0521e5a5b6a6cb795903dc16f0f7502879c5e5a3221235a6`. `devai evidence verify --scope chain` após o merge: exit 0, head `4e7d24d618730d6555af5b2e4ad5ff92af3e915f9420ab17d9c438cb8a16f994` antes do registro CTG-0001.

## Verificação do preparador Astra — fallback remoto existente

Em 2026-09-28, no papel Architect, o preparador conferiu ADR-0028 (Decision 4) e `.github/workflows/ci.yml:170-249`: sem tag de evidência elegível, `backend-kernel-full` executa `pnpm ci:backend-full` remotamente e publica `verified-local-rc` no SHA exato, com a conclusão real do job. Portanto, a ausência de `DEVAI_RC_PRIVATE_KEY` impede somente a rota local assinada e não bloqueia o uso da rota remota já autorizada.

A pergunta sobre caminhos de chave feita ao Owner foi retirada pelo preparador após essa conferência. O PR pode seguir pelo fallback remoto existente, mantendo todos os checks obrigatórios e aguardando seu resultado real. Nenhuma alteração de workflow, trust store, proteção de branch ou criação de chave é necessária para essa escolha. Uma tag presente e inválida continua bloqueante e não autoriza fallback.
