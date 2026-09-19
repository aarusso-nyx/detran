# C4-OD V3 — índice de execução e precedência

Papel coordenador: Maestro/Architect, artigo 6. Candidato documental para revisão independente, sem despacho de implementação. Worktree única: `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`; branch `orchestra/rait-backend`. O parecer V2 FAIL é preservado em `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v2-sol-1.json`.

## Precedência e fontes

`work/rounds/R-0007/contracts/CTG-0001.md` continua a base; `work/rounds/R-0007/contracts/CTG-0001-C4.md` a complementa; a seção final **Fechamento V3** de `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md` prevalece somente nas contradições C4-OD V2 identificadas. `work/rounds/R-0007/prompts/C4-OD-V2-PROPOSED.md` é histórico e não despachável. Os prompts V3 abaixo são as únicas composições candidatas; o arquivo `work/rounds/R-0007/compositions.json` conserva entradas antigas como histórico, e o `prompt_composition_id` de cada tarefa identifica a entrada V3 vigente.

Fontes Owner: `docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`, `docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`, `docs/framework/product/domains/inf/rait/rules/RN-RAIT-141.md` e `docs/framework/arch/parameter-catalogue.md`. PCD=80+, idade no ato de qualificação, prova PCD validada no protocolo, ausência comprovada como none, revisão futura tecnicamente preservada porém vedada na política atual, seis providers Clock e imutabilidade de `protocolled_at`/`id` são vinculantes.

## Ordem, locks e gate

| Ordem | Tarefa                                  | Papel/modelo           | Upstream direto                         | Lock de módulo                                                                                   | Prompt V3                                                                   |
| ----- | --------------------------------------- | ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 0     | TASK-0023 2/2 concluída documentalmente | Architect Astra/Medium | C4-3 PASS histórico                     | MOD-contract-case                                                                                | `TASK-0023-V3-CONTINUATION.md` (registro da continuação, não nova execução) |
| Gate  | CTG-0001-C4-OD-V3-REVIEW-1              | Auditor Fable 5        | hashes congelados de todos os inputs V3 | candidato completo                                                                               | prompt do reviewer sob `reviews/attempt-2/`                                 |
| 1     | TASK-0026                               | Inspector Sol/High     | TASK-0023 + Gate PASS                   | MOD-parameter-sensors                                                                            | `TASK-0026.md`                                                              |
| 2     | TASK-0027                               | Engineer Sol/High      | TASK-0026 RED/hashes                    | MOD-parameter-parser                                                                             | `TASK-0027.md`                                                              |
| 3     | TASK-0028                               | Inspector Sol/High     | TASK-0027                               | MOD-rait-priority-upgrade-tests                                                                  | `TASK-0028.md`                                                              |
| 4     | TASK-0029                               | Architect Astra/Medium | TASK-0028 RED/hashes                    | MOD-rait-priority-schema; MOD-bp-rait-case; MOD-generated-tree                                   | `TASK-0029.md`                                                              |
| 5     | TASK-0030                               | Architect Astra/Medium | TASK-0029                               | MOD-parameter-generated                                                                          | `TASK-0030.md`                                                              |
| 6     | TASK-0024                               | Architect Astra/Medium | TASK-0030                               | MOD-rait-kb                                                                                      | `TASK-0024-V3.md`                                                           |
| 7     | TASK-0025                               | Inspector Sol/High     | TASK-0024                               | MOD-ait-rls-tests                                                                                | `TASK-0025-V3.md`                                                           |
| 8     | TASK-0020 4/4 futura                    | Inspector Terra/High   | TASK-0025 + preflight DB                | MOD-rait-case-tests; MOD-shared-document-tests; MOD-shared-policy-tests; MOD-policy-routes-tests | `TASK-0020-V3.md`                                                           |
| 9     | TASK-0021 4/4 futura                    | Engineer Terra/High    | TASK-0020 RED/hashes                    | MOD-rait-case; MOD-shared-documents; MOD-shared-policy; MOD-app-wiring                           | `TASK-0021-V3.md`                                                           |
| 10    | TASK-0022                               | Architect Sol/Medium   | TASK-0021 GREEN                         | MOD-bp-rait-case; MOD-generated-tree                                                             | `TASK-0022-V3.md`                                                           |

As linhas 0–7 preservam modelos e sequência efetivamente históricos. Somente
as linhas 8–10 são instruções de despacho futuro; nelas prevalece a redução de
modelos do OWNER. Entradas antigas de `compositions.json` continuam auditáveis,
mas não devem ser usadas para novos dispatches.

Os arrays `target_modules` dos registros governados são a fonte de verdade dos locks; esta tabela os reproduz para orientar a ordem. Além dos locks de módulo, há **uma trava global de escritor na worktree** e banco dedicado serializado. Não há escritores simultâneos, mesmo quando os módulos listados diferem. O schema DEVAI possui somente `upstream_task_id`; os gates adicionais aqui e nos prompts são obrigatórios e não podem ser inferidos desse único campo. Cada tarefa futura permanece `queued`, sem iteração consumida nesta preparação. TASK-0020/21 mantêm 3/4; TASK-0023 consumiu 2/2 com o resultado documental desta continuação e aguarda revisão.

O Gate é a revisão independente **pós-TASK-0023** do mesmo candidato V3 que fecha F1–F8. A revisão deve receber o manifesto SHA-256 de contrato, relatórios, prompts, tarefas, índice, allowlist, matriz, plano, orçamento e fontes Owner usadas. Somente JSON válido, hashes idênticos e PASS sem high liberam os dependentes. REVIEW/FAIL/invalid-output não liberam nada. Um retry técnico só usa candidato e prompt idênticos, conforme orçamento já registrado. Mudança material após PASS requer revisão do delta antes da etapa afetada.

## Critérios comuns de execução futura

Cada prompt lista leitura fechada, allowlist e comandos próprios. Comandos de produção e de DB são futuros, com banco `detran_r7_ctg1_a2` explicitamente identificado e credenciais sem impressão. Falta de URL, role `role_app_backend`, schema, teste coletado ou autorização de ensaio é BLOCKED, não RED/PASS. O pacote aprovado por review é somente elegível para despacho posterior; não equivale a SQL aplicado, sensores escritos, GREEN, delivery-review, PR ou merge.

Os 85 outputs gerados de case estão enumerados em `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-GENERATED-ALLOWLIST.md`. As fontes D1 herdadas dos overlays 0020/21/22 estão resolvidas nominalmente em `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-D1-READSET.md`, sem ampliar escrita. O inventário dos 49 DDLs atuais copiados pelo harness 0028 fica em `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL-INVENTORY.md`. A matriz F1–F8 fica em `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-FINDINGS.md`. Todo worker entrega papel, status, arquivos, comandos executados/resultado real, hash dos sensores ou gerados, cobertura por finding e bloqueios; o Maestro registra evidência. Nenhuma instrução permite `git commit`, push, PR, escrita em sibling, `record/` ou `.devai/` pelo worker.

## Delta de sequência autorizado pelo OWNER — candidato à revisão independente

Esta seção final prevalece somente sobre a ordem/gates 0028–0030 da tabela
histórica acima. Não equivale a PASS do delta nem a despacho. O contrato final
`contracts/CTG-0001-C4-OD.md` e o plano final
`reports/CTG-0001-C4-OD-PLAN.md` governam o mesmo candidato.

1. TASK-0028 permanece checkpoint **1/1**: completar antes do congelamento
   fresh/upgrade, string legada desconhecida e harness pré/pós-SQL. O RED
   estático atual (1 FAIL, 8 DB filtrados) não é RED/PASS DB. Exigir coleta
   positiva, typecheck, Prettier, RED estático e SHA final do sensor.
2. Após PASS independente deste delta, sensor completo congelado, RED estático
   e identidade/isolamento do banco dedicado comprovados, TASK-0029 pode
   preparar BP, SQL19, `apply.sh`, DDL34 e 85 outputs por geração oficial,
   sem DB apply/seed ou conclusão de TASK-0028.
3. Congelar SQL19, DDL34, `apply.sh`, 49 DDLs consumidos, outputs e sensor por
   hash; obter **revisão SQL independente PASS** dos bytes exatos antes de
   qualquer aplicação, inclusive harness.
4. Retomar a mesma TASK-0028 para ensaio DB integral autorizado: upgrade,
   rollback, concorrência, legado, imutabilidade e equivalência estrutural
   fresh/upgrade, preservando snapshots do upgrade antes do `--full`.
   `SET LOCAL ROLE role_app_backend` é impersonação SQL controlada, não
   autenticação HTTP; conferir `current_user/current_role` e flags sem
   superuser/BYPASSRLS.
5. Somente PASS DB integral do mesmo candidato, mais gates anteriores, libera
   TASK-0030 e posteriores. `upstream_task_id` não substitui esses gates;
   ausência de SQL, revisão, cenário ou identidade mantém BLOCKED.

Os prompts ativos 0028/0029/0030 têm adendos finais, e seus novos PCs/SHAs
ficam em `compositions.json` e task records. Os PCs V3 anteriores permanecem
evidência histórica no manifesto aprovado, não instrução ativa do delta.
Escritor global único, locks e contadores 0020/21 3/4 e 0023 2/2 seguem.

## Gate transversal Owner — OpenAPI manual

O único path operacional do futuro contrato de intake é
`docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`.
O contrato manual é separado dos gerados da raiz; o checker gerado e sua
detecção de órfãos permanecem intactos. TASK-0029 deve executar o bloco
completo e fail-closed de `docs/framework/contracts/manual/README.md`
(existência, parser/ref resolver, Redocly estrutural, superfície positiva e
SHA), além de `pnpm contracts:check`. Os mesmos dois gates sobre os bytes atuais
são obrigatórios na revisão SQL, ensaio DB, TASK-0030, TASK-0024/0025,
preflight, TASK-0020/0021/0022 e delivery-review. Os prompts individuais
devem consumir esse path e não podem interpretar PASS do checker gerado como
PASS do manual. Até o JSON futuro existir e passar, o gate é PENDENTE, não PASS.
Esta seção prevalece sobre paths antigos somente nas instruções operacionais;
snapshots históricos mantêm os hashes originais. TASK-0029 segue checkpoint
1/1 na mesma iteração, sem despacho automático. SQL-review antes de DB apply e
PASS DB integral de TASK-0028 antes de TASK-0030 continuam distintos.

## SQL review1 — correção dos três highs antes do ensaio DB

O parecer `reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-1.json` é REVIEW, não PASS. F1 é seed JSON string, F2 é ausência de intake positivo no sensor 0028, F3 é claim-next lexical. A seção final SQL review1 de `contracts/CTG-0001-C4-OD.md` e `reports/CTG-0001-C4-OD-PLAN.md` prevalece sobre gates antigos apenas nesses achados. Nenhum SQL/DDL/apply/DB muda durante o prompt-review corretivo. Os registros de tarefa e seus `prompt_composition_id` ativos, não a tabela histórica acima, são fonte de verdade dos locks/PCs. Escritor global único.

Ordem obrigatória após prompt-review independente PASS: (1) continuar TASK-0028 **1/1** no único sensor permitido e recongelar somente após positivos `none`/60/80/PCD e negativos marcador/requalificação, sem DB; (2) TASK-0034 Inspector Sol/High, lock `MOD-rait-case-tests`, um teste unitário, RED real congelado; (3) TASK-0035 Engineer Sol/High, lock `MOD-rait-case`, um serviço, GREEN no mesmo teste; (4) TASK-0030 Architect Astra/Medium inicia **0/1→1/1** geração oficial de três derivados e idempotência, fica `in_progress`/checkpoint, sem DB. Prompts ativos: `TASK-0028.md`, `TASK-0034-SQL1-QUEUE-SENSOR.md`, `TASK-0035-SQL1-QUEUE-FIX.md`, `TASK-0030.md`. TASK-0030 tem gates múltiplos além de seu único `upstream_task_id` no schema DEVAI.

Depois congelar SQL review2 incluindo sensores, serviço, seed/derivados, SQL/apply e receita auditável da fixture. Somente SQL review2 independente PASS dos mesmos hashes autoriza reconciliação explícita da fixture no banco descartável e ensaio DB integral TASK-0028. A linha preexistente do seed usa ON CONFLICT DO NOTHING; geração de arquivo não corrige o banco. Nenhum `completed` de TASK-0030 ou avanço 0024+ antes do PASS DB integral. SQL1 low Clock permanece em 0021 e não autoriza alegar build. Catálogo DDL05/DDL14 exige baseline exato, sem relaxar fail-closed.
