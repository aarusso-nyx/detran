# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-model` (rodada `R-0006`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-A` e o "mapa entregável → definições"
4. `work/rounds/R-0006/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0006/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0006/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0006",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0006/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

### Ciclo 3 — restrito às três correções do ciclo 2 (regra do §Veredito)

| Achado do ciclo 2                                | Correção                                                                                                                                                                                                                                                                                                                                                           | Onde verificar                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1. mutação de `docs/**` autorada sob papel Owner | commit `5497678` **reverte** integralmente a mutação de TASK-0008 (`revert(docs)`); commit `5b745e1` **re-autora** o mesmo conteúdo pelo Architect (maestro, papel constitucional declarado no plano e no commit) — a mutação documental vigente na árvore tem autoria de Architect; o worker Owner não é ratificado                                               | `git show 5497678 --stat`, `git show 5b745e1 --stat`; `reports/TASK-0008.md` (nota de reversão); `plan.md` §Triagem |
| 2. critério de TASK-0014 × entrega               | prompt `prompts/TASK-0014.md` item 2 reescrito: papéis **não administrativos** (`GLOBAL_ADMIN_ROLES` excluídos por estrutura) e as duas exceções nomeadas com fonte (OD-309); composição recalculada (`compositions.json`); `tasks/TASK-0014.json` iteração 2                                                                                                      | diff abaixo                                                                                                         |
| 3. OD sem id                                     | **OD-309** registrada em `docs/meta/knowledge-base/open-decisions-rait.md` (grants pré-existentes `inf:rait-suspension-act:create`, `inf:rait-export:create` em `RAIT_COMMAND_RULES`; premissa: mantidos); citada em `reports/TASK-0014.md`, em `plan.md` §Bloqueios e no teste (`policy.spec.ts`: comentários e nomes dos `it`, nenhuma asserção alterada; 73/73) | diff abaixo                                                                                                         |

```
1751bca test(shared): cite OD-309 on the named policy exceptions (TASK-0014 iteration 2); round bookkeeping
5b745e1 docs(kb): transcribe the executed WP-A and register OD-309 (Architect re-authoring, CTG-0002)
5497678 revert(docs): withdraw the TASK-0008 documentation mutation authored under the Owner role
```

### `git diff --stat b7f4afc..HEAD`

```
 backend/domains/shared/src/policy.spec.ts          |   20 +-
 docs/meta/knowledge-base/open-decisions-rait.md    |   21 +-
 work/rounds/R-0006/budget.json                     |   17 +-
 work/rounds/R-0006/closure.json                    |   63 ++
 work/rounds/R-0006/compositions.json               |    4 +-
 work/rounds/R-0006/plan.md                         |    8 +-
 work/rounds/R-0006/pr-ctg-0002.md                  |    6 +-
 work/rounds/R-0006/prompts/TASK-0014.md            |    8 +-
 .../reviews/delivery-review-CTG-0002-2.bridge.json |   11 +
 .../R-0006/reviews/delivery-review-CTG-0002-2.json |   32 +
 .../R-0006/reviews/delivery-review-CTG-0002-2.md   | 1077 ++++++++++++++++++++
 work/rounds/R-0006/tasks/TASK-0014.json            |   15 +-
 12 files changed, 1251 insertions(+), 31 deletions(-)
```

### Diff das três correções

```diff
diff --git a/docs/meta/knowledge-base/open-decisions-rait.md b/docs/meta/knowledge-base/open-decisions-rait.md
index 6bf46e2..628ddfd 100644
--- a/docs/meta/knowledge-base/open-decisions-rait.md
+++ b/docs/meta/knowledge-base/open-decisions-rait.md
@@ -71,16 +71,17 @@ construção não bloqueie. A decisão contrária exige mudança dos artefatos c

 ## D. Parecer jurídico formal (LEGAL) — leituras de trabalho aceitas pelo Owner sem parecer

-| ID     | Questão                                                                                                                                   | Premissa adotada                                                                                                                                                                                                                                                                                              | Destrava / bloqueia                              | Afeta                                           |
-| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
-| OD-301 | Aplicabilidade da Lei 9.873/1999 (`T-PAR-3A`, `T-PRESC-5A`) ao órgão estadual via Res. 918 art. 36 (steering C.13 `[BLOQUEIA]`)           | relógios com alerta; transição `EXTINTO_PRESCRICAO` marcada `a_confirmar` — STJ Temas 1.293/1.294 (2025): Lei 9.873 restrita à União; nenhuma lei estadual localizada — ver [REF-STJ-1293-1294]; premissa passa a **alerta sem declaração de ofício** (cédula 04) — **H.46**: alerta sem declaração de ofício | motor de prazos; declaração de ofício            | [RN-RAIT-113], `infraction_timer_ref.status`    |
-| OD-302 | Efeito do julgamento proferido após os 24 meses (art. 289-A): nulo, ineficaz ou válido; suspensão/interrupção; intervalo entre instâncias | prescrição declarável de ofício; decisão tardia registrada como extemporânea e não executada                                                                                                                                                                                                                  | `RAIT.EXTINCTION_DECISION_LATE`, [UC-RAIT-023]   | [RN-RAIT-112]                                   |
-| OD-303 | Contagem de `T-NA`/`T-DEC` fora do flagrante (CTB art. 282 §6º-A) — procedimento CONTRAN não localizado                                   | cometimento como marco; data de conhecimento pelo órgão registrada para auditoria                                                                                                                                                                                                                             | motor de prazos do agregado                      | [WF-INF-002] §Decisões pendentes, [RN-TEAT-108] |
-| OD-304 | Desfecho de `T-NA-IND` vencido (NA ao condutor indicado não expedida em 30 dias)                                                          | indicação perde efeito quanto ao condutor; responsabilidade volta ao proprietário; sem reabrir `T-NA`                                                                                                                                                                                                         | transição #5/#6, `T-NA-IND` (`a_confirmar`)      | [WF-INF-003] §3, `infraction_transition_ref`    |
-| OD-305 | Se a NP interrompe `T-PRESC-5A` (Lei 9.873 art. 2º)                                                                                       | sem auto-reset na NP; só as hipóteses do art. 2º                                                                                                                                                                                                                                                              | motor de prazos                                  | [WF-INF-002] §9.2                               |
-| OD-306 | Validade do mapeamento `SituacaoRenainf` (mock) contra o contrato real do RENAINF                                                         | mapeamento §8 do mock; `approved` só após validação                                                                                                                                                                                                                                                           | `UC-RAIT-029`, adapter                           | [WF-INF-003] §8, ADR-0003                       |
-| OD-307 | Penalidades de suspensão/cassação (CTB art. 282 §6º II) — processo próprio do domínio `ch`                                                | fora do ciclo da infração                                                                                                                                                                                                                                                                                     | —                                                | [WF-INF-003] §Decisões pendentes                |
-| OD-308 | Regras legais da série 1xx ainda em `draft` (22 RNs escritas pelo LEGAL sem revisão individual)                                           | vigentes como leitura de trabalho                                                                                                                                                                                                                                                                             | nenhum bloqueio de construção; risco de reversão | backlog 2026-08-26 §Fila de revisão             |
+| ID     | Questão                                                                                                                                                                                                                                                                                                                                                    | Premissa adotada                                                                                                                                                                                                                                                                                              | Destrava / bloqueia                              | Afeta                                           |
+| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
+| OD-301 | Aplicabilidade da Lei 9.873/1999 (`T-PAR-3A`, `T-PRESC-5A`) ao órgão estadual via Res. 918 art. 36 (steering C.13 `[BLOQUEIA]`)                                                                                                                                                                                                                            | relógios com alerta; transição `EXTINTO_PRESCRICAO` marcada `a_confirmar` — STJ Temas 1.293/1.294 (2025): Lei 9.873 restrita à União; nenhuma lei estadual localizada — ver [REF-STJ-1293-1294]; premissa passa a **alerta sem declaração de ofício** (cédula 04) — **H.46**: alerta sem declaração de ofício | motor de prazos; declaração de ofício            | [RN-RAIT-113], `infraction_timer_ref.status`    |
+| OD-302 | Efeito do julgamento proferido após os 24 meses (art. 289-A): nulo, ineficaz ou válido; suspensão/interrupção; intervalo entre instâncias                                                                                                                                                                                                                  | prescrição declarável de ofício; decisão tardia registrada como extemporânea e não executada                                                                                                                                                                                                                  | `RAIT.EXTINCTION_DECISION_LATE`, [UC-RAIT-023]   | [RN-RAIT-112]                                   |
+| OD-303 | Contagem de `T-NA`/`T-DEC` fora do flagrante (CTB art. 282 §6º-A) — procedimento CONTRAN não localizado                                                                                                                                                                                                                                                    | cometimento como marco; data de conhecimento pelo órgão registrada para auditoria                                                                                                                                                                                                                             | motor de prazos do agregado                      | [WF-INF-002] §Decisões pendentes, [RN-TEAT-108] |
+| OD-304 | Desfecho de `T-NA-IND` vencido (NA ao condutor indicado não expedida em 30 dias)                                                                                                                                                                                                                                                                           | indicação perde efeito quanto ao condutor; responsabilidade volta ao proprietário; sem reabrir `T-NA`                                                                                                                                                                                                         | transição #5/#6, `T-NA-IND` (`a_confirmar`)      | [WF-INF-003] §3, `infraction_transition_ref`    |
+| OD-305 | Se a NP interrompe `T-PRESC-5A` (Lei 9.873 art. 2º)                                                                                                                                                                                                                                                                                                        | sem auto-reset na NP; só as hipóteses do art. 2º                                                                                                                                                                                                                                                              | motor de prazos                                  | [WF-INF-002] §9.2                               |
+| OD-306 | Validade do mapeamento `SituacaoRenainf` (mock) contra o contrato real do RENAINF                                                                                                                                                                                                                                                                          | mapeamento §8 do mock; `approved` só após validação                                                                                                                                                                                                                                                           | `UC-RAIT-029`, adapter                           | [WF-INF-003] §8, ADR-0003                       |
+| OD-307 | Penalidades de suspensão/cassação (CTB art. 282 §6º II) — processo próprio do domínio `ch`                                                                                                                                                                                                                                                                 | fora do ciclo da infração                                                                                                                                                                                                                                                                                     | —                                                | [WF-INF-003] §Decisões pendentes                |
+| OD-308 | Regras legais da série 1xx ainda em `draft` (22 RNs escritas pelo LEGAL sem revisão individual)                                                                                                                                                                                                                                                            | vigentes como leitura de trabalho                                                                                                                                                                                                                                                                             | nenhum bloqueio de construção; risco de reversão | backlog 2026-08-26 §Fila de revisão             |
+| OD-309 | **Grants pré-existentes em `RAIT_COMMAND_RULES` para recursos sem matriz**: `inf:rait-suspension-act:create` (`rait-signing-authority`, `rait-chair`) e `inf:rait-export:create` (`AUDITOR`) já constam da política antes de R-0007 fixar a matriz dos 23 recursos de WP-A/CTG-0002 (R-0006, M17); confirmar intencionalidade ou retirar ao criar a matriz | premissa: mantidos; demais ações CRUD geradas desses recursos negadas para todo papel não administrativo (`policy.spec.ts`)                                                                                                                                                                                   |

 ## E. O que cada família destrava (leitura para a orquestra)

diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index e01b63e..3366cc0 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -855,9 +855,12 @@ describe('DASHBOARD roles, dashboard:* policy matrix and access layers (WP-D0, C
  * (`rait-signing-authority`, `rait-chair`) e `inf:rait-export:create`
  * (`AUDITOR`). Isso contradiz a premissa "a matriz não contém nenhuma chave
  * `inf:<recurso>:*` destes recursos" para a ação `create` desses dois
- * recursos; os testes abaixo provam o estado real (com a exceção nomeada)
- * em vez de falhar às ciências, e o achado vai para
- * `docs/meta/knowledge-base/open-decisions-rait.md` (relatório desta tarefa).
+ * recursos; os testes abaixo provam o estado real (exceções nomeadas —
+ * OD-309), em vez de falhar às ciências. Achado registrado como OD-309
+ * (`docs/meta/knowledge-base/open-decisions-rait.md`): confirmar em R-0007
+ * se os grants de `RAIT_COMMAND_RULES` para estes dois recursos são
+ * intencionais ou devem ser retirados/ajustados quando a matriz completa
+ * dos 23 recursos entrar.
  */
 describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
   const GENERATED_ACTIONS = ['read', 'create', 'update', 'delete'] as const;
@@ -868,10 +871,11 @@ describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
     'technical-admin',
   ] as const;
   /**
-   * Achado (ver comentário do describe): `RAIT_COMMAND_RULES` grava estas
-   * duas chaves de ação gerada, de rodada anterior. Único par (recurso,
-   * ação gerada) com uma exceção; todos os outros recursos e ações negam
-   * para todo papel além de `GLOBAL_ADMIN_ROLES`.
+   * Achado (ver comentário do describe) — exceções nomeadas, OD-309:
+   * `RAIT_COMMAND_RULES` grava estas duas chaves de ação gerada, de rodada
+   * anterior. Único par (recurso, ação gerada) com uma exceção; todos os
+   * outros recursos e ações negam para todo papel além de
+   * `GLOBAL_ADMIN_ROLES`.
    */
   const PRE_EXISTING_COMMAND_GRANTS: Readonly<
     Record<string, Readonly<Record<string, readonly string[]>>>
@@ -953,7 +957,7 @@ describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
   });

   for (const resource of NEW_RESOURCES) {
-    it(`dado o recurso novo inf:${resource} sem matriz quando isDetranActionAllowed é chamado para read/create/update/delete então nega para todo papel canônico de roles.ts, exceto GLOBAL_ADMIN_ROLES e a exceção nomeada da matriz de comando (M17)`, () => {
+    it(`dado o recurso novo inf:${resource} sem matriz quando isDetranActionAllowed é chamado para read/create/update/delete então nega para todo papel canônico de roles.ts, exceto GLOBAL_ADMIN_ROLES e a exceção nomeada da matriz de comando — OD-309 (M17)`, () => {
       expectDeniedForEveryRole(resource);
       expectResourceHasNoGeneratedMatrixEntry(resource);
     });
diff --git a/work/rounds/R-0006/prompts/TASK-0014.md b/work/rounds/R-0006/prompts/TASK-0014.md
index f712d06..b321e35 100644
--- a/work/rounds/R-0006/prompts/TASK-0014.md
+++ b/work/rounds/R-0006/prompts/TASK-0014.md
@@ -59,8 +59,12 @@ negar — até R-0007 criar a matriz. Decisão M17 em `plan.md`. Os módulos `ra
    `inf:rait-holiday`, `inf:rait-suspension-act`, `inf:rait-jeton-sheet`, `inf:rait-jeton-line`, `inf:rait-incident`,
    `inf:rait-quality-sample`, `inf:rait-capacity-plan`, `inf:rait-export`, `inf:collection-document`, `inf:payment`,
    `inf:refund-order`, `inf:debt-handoff`, `inf:rait-reconciliation` — e cada ação gerada (`read`, `create`,
-   `update`, `delete`) e **cada papel canônico** de `roles.ts`, `isDetranActionAllowed({ roles: [papel], permissions: [] }, recurso, ação)`
-   é `false`; e a matriz não contém nenhuma chave `inf:<recurso>:*` desses recursos. Um `it` por recurso (iterando
+   `update`, `delete`) e **cada papel canônico não administrativo** de `roles.ts` (excluídos os `GLOBAL_ADMIN_ROLES` — `ADMIN`, `GESTOR_DETRAN`,
+   `SUPORTE`, `technical-admin` —, liberados por estrutura antes da matriz), `isDetranActionAllowed({ roles: [papel], permissions: [] }, recurso, ação)`
+   é `false`; e a matriz não contém nenhuma chave `inf:<recurso>:*` desses recursos, **exceto** as duas já existentes
+   em `RAIT_COMMAND_RULES` antes desta rodada — `inf:rait-suspension-act:create` (`rait-signing-authority`, `rait-chair`) e
+   `inf:rait-export:create` (`AUDITOR`) — registradas como **OD-309** em `docs/meta/knowledge-base/open-decisions-rait.md`
+   e citadas no teste como exceções nomeadas. Um `it` por recurso (iterando
    ações × papéis) para a matriz ficar auditável.

 ## Critérios de aceitação (todos precisam passar)
```

### Nota do maestro

Avalie somente as três correções; achados novos sobre texto inalterado só se forem FAIL por definição, dizendo por que não foram levantados nos ciclos 1–2. Responda apenas com o JSON do §Saída.
