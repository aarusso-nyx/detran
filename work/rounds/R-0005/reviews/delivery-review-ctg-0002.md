# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `ops-agency` (rodada `R-0005`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T1` e o "mapa entregável → definições"
4. `work/rounds/R-0005/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0005/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0005/reports/*.md`, o diff anexado abaixo e os
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

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0005",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0005/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

Grupo: CTG-0002

Critérios verificados pelo Engineer:

- pnpm check: PASS.
- pnpm backend:test:ci: PASS.
- verify:lifecycle-vocabulary: PASS (17 AIT states).
- verify:rls-ddl: PASS (159 tenant tables).
- Contract/blueprint drift checks: PASS.

Relatórios:

### work/rounds/R-0005/reports/TASK-0005.md

# TASK-0005 — relatório Architect

Papel: Architect

## Resultado

TASK-0005 concluída.

## Arquivos

- `BP-INF-AIT-001`, `BP-INF-NORMATIVE-001`, `BP-INF-MEASURES-001` e
  `BP-INF-ALCOHOL-001`: versão 1.1.0.
- `backend/database/ddl/14-inf-lifecycle-vocabulary.sql`.
- `work/rounds/R-0005/contracts/CTG-0002.md`.
- Saídas geradas por `blueprints:generate` e `contracts:openapi`.

## Comandos e gates

- `pnpm blueprints:generate`: PASS.
- `pnpm contracts:openapi`: PASS.
- `pnpm format:check`: PASS.
- `pnpm blueprints:check`: PASS.
- `pnpm contracts:check`: PASS.
- `pnpm verify:rls-ddl`: OK, 159 tabelas tenant.
- `pnpm verify:lifecycle-vocabulary`: OK, 15 estados, 12 subestados e 24 timers.

## Critérios

- Estados AIT canônicos, versão/If-Match, medição de velocidade e cancelamento apenso.
- Catálogo metrológico, classificação de abordagem e política de assinatura como dados.
- Prazos distintos, estado de medidas e limites 30/15 vinculados à hipótese legal correta.
- Procedimento de alcoolemia com par metrológico, recusa fechada e campos canônicos.
- `ait_state_ref` contém exclusivamente os 17 estados de WF-TEAT-001; seis timers têm
  `owner='medida'`.
- CTG-0002 registra fontes e critérios negativos do Inspector.

## Fora do escopo

- Nenhuma alteração em código manual, testes, policy/roles, produto, record, `.devai`, BP-OPS ou
  outros BP-INF.
- Seed não foi alterado: `inf.infraction_timer_ref` já existe.

## OD

- OD-T05 atendido pelos dois prazos impressos distintos.
- `addressed_to` preserva a fronteira de competência; não decide RBAC.

## Bloqueios

- Nenhum bloqueio final.
- O delta em `BP-INF-NORMATIVE-001` e a consulta read-only única ao blueprint TEAT foram
  autorizados pelo maestro; a superfície R-0004 foi preservada.

### work/rounds/R-0005/reports/TASK-0006.md

# TASK-0006 — relatório Inspector

Papel: Inspector

## Arquivos

- `backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts`.
- `backend/domains/inf/normative/src/normative-blueprint-contract.spec.ts`.
- `backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts`.
- `backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts`.

## Comandos

- Specs normative/measures/alcohol: PASS.
- `pnpm verify:lifecycle-vocabulary`: PASS — 15 estados, 12 subestados e 24 timers.
- AIT unit: FAIL `plant-bug` — serviço espera `draft`/produz `issued`, rejeitando
  `RASCUNHO_OFFLINE`.
- AIT integration: FAIL observado — 52 tabelas tenant encontradas, teste exige 58; sujeito à
  confirmação Engineer após reaplicar os DDLs no banco isolado.
- `pnpm backend:test:unit`: interrompido pelo mesmo `plant-bug` do AIT.

## Critérios

- Novos specs descobertos: PASS para normative, measures e alcohol.
- Tokens canônicos AIT: teste criado e falha conforme esperado.
- Checks de prazos, estados, alcoolemia e recusa: PASS.
- Nenhuma asserção, cobertura ou timeout existente reduzida.

## Fora do escopo

- Nenhuma alteração em produção, blueprints, DDL, tools, docs, seeds ou vitest configs.
- Nenhum git ou pacote instalado.
- Nenhum teste de integração novo criado.

## OD

- Nenhuma.

## Bloqueios

- TASK-0007 deve corrigir o vocabulário legado do `AitLifecycleService`.
- A observação inicial 52/58 veio de banco anterior à reaplicação. Na iteração 1, o banco
  reaplicado apresentou 62 tabelas tenant e 10 referências; o teste foi ampliado para exigir as
  contagens atuais e provar explicitamente RLS, FORCE RLS, política e trigger nas quatro tabelas
  novas. Integration AIT passou 2/2 no worker e no checkpoint Engineer.
- Na iteração 2 final, o teste legado passou a usar `RASCUNHO_OFFLINE` → `FINALIZADO_LOCAL`,
  preservando hash, assinatura e histórico; a fixture e2e recebeu `approach_class: 'caso_1'`.
  Unit AIT passou 3/3, typecheck passou e integration permaneceu 2/2.

### work/rounds/R-0005/reports/TASK-0007.md

# TASK-0007 — relatório Engineer

Papel: Engineer

## Estado

Implementação e checkpoint composto concluídos.

## Arquivos

- `backend/domains/inf/ait/src/ait-lifecycle.service.ts`.
- `tools/check-lifecycle-vocabulary.ts`.
- Saídas geradas por `blueprints:generate` e `contracts:openapi`.

## Comandos

- `pnpm blueprints:generate`: PASS.
- `pnpm contracts:openapi`: PASS.
- `pnpm blueprints:check`: PASS.
- `pnpm contracts:check`: PASS.
- `pnpm verify:lifecycle-vocabulary`: PASS — 17 estados AIT.
- AIT unit após TASK-0006 iteração 2: PASS — 3/3.
- AIT typecheck após TASK-0006 iteração 2: PASS.
- AIT integration após TASK-0006 iteração 2: PASS — 2/2.
- `pnpm backend:test:ci`: PASS — unitários, integração e E2E completos.
- `pnpm check`: PASS — incluindo typecheck, blueprints, contratos, RLS, vocabulário e fronteira
  SENATRAN.

## Critérios

- Lifecycle migrado para tokens canônicos WF-TEAT-001.
- Gate determinístico compara `ait_state_ref` ao workflow e prova 17 estados.
- Regeneração e contratos sincronizados.

## Fora do escopo

- Testes, DDL, seed, blueprints, policy, roles, record e `.devai` não foram alterados pelo
  Engineer.

## OD

- Nenhuma.

## Bloqueios

- Nenhum. A incompatibilidade do seed foi corrigida pela TASK-0008 dentro do lock MOD-seed e os
  gates compostos foram repetidos com sucesso.

Git diff --stat:

```text
 .../database/ddl/14-inf-lifecycle-vocabulary.sql   |  40 +-
 backend/database/ddl/30-inf-normative.sql          |  55 ++-
 backend/database/ddl/31-inf-ait.sql                |  55 ++-
 backend/database/ddl/32-inf-measures.sql           |  17 +-
 backend/database/ddl/33-inf-alcohol.sql            |  26 +-
 .../inf/ait/src/ait-lifecycle.service.spec.ts      |  37 +-
 .../domains/inf/ait/src/ait-lifecycle.service.ts   |  85 ++--
 backend/domains/inf/ait/src/ait.module.ts          |  14 +-
 .../src/controllers/ait-correction.controller.ts   |   2 +-
 .../ait/src/controllers/ait-person.controller.ts   |   2 +-
 .../src/controllers/ait-print-event.controller.ts  |   2 +-
 .../src/controllers/ait-signature.controller.ts    |   2 +-
 .../controllers/ait-status-history.controller.ts   |   2 +-
 .../ait/src/controllers/ait-vehicle.controller.ts  |   2 +-
 .../inf/ait/src/controllers/ait.controller.ts      |   2 +-
 .../inf/ait/src/dto/create-ait-correction.dto.ts   |   2 +-
 .../inf/ait/src/dto/create-ait-person.dto.ts       |   2 +-
 .../inf/ait/src/dto/create-ait-print-event.dto.ts  |   2 +-
 .../inf/ait/src/dto/create-ait-signature.dto.ts    |   2 +-
 .../ait/src/dto/create-ait-status-history.dto.ts   |   2 +-
 .../inf/ait/src/dto/create-ait-vehicle.dto.ts      |   2 +-
 backend/domains/inf/ait/src/dto/create-ait.dto.ts  |   4 +-
 .../inf/ait/src/entities/ait-correction.entity.ts  |   2 +-
 .../inf/ait/src/entities/ait-person.entity.ts      |   2 +-
 .../inf/ait/src/entities/ait-print-event.entity.ts |   2 +-
 .../inf/ait/src/entities/ait-signature.entity.ts   |   2 +-
 .../ait/src/entities/ait-status-history.entity.ts  |   2 +-
 .../inf/ait/src/entities/ait-vehicle.entity.ts     |   2 +-
 backend/domains/inf/ait/src/entities/ait.entity.ts |   4 +-
 backend/domains/inf/ait/src/index.ts               |  12 +-
 .../src/repositories/ait-correction.repository.ts  |   2 +-
 .../ait/src/repositories/ait-person.repository.ts  |   2 +-
 .../src/repositories/ait-print-event.repository.ts |   2 +-
 .../src/repositories/ait-signature.repository.ts   |   2 +-
 .../repositories/ait-status-history.repository.ts  |   2 +-
 .../ait/src/repositories/ait-vehicle.repository.ts |   2 +-
 .../inf/ait/src/repositories/ait.repository.ts     |   4 +-
 .../inf/ait/src/services/ait-correction.service.ts |   2 +-
 .../inf/ait/src/services/ait-person.service.ts     |   2 +-
 .../ait/src/services/ait-print-event.service.ts    |   2 +-
 .../inf/ait/src/services/ait-signature.service.ts  |   2 +-
 .../ait/src/services/ait-status-history.service.ts |   2 +-
 .../inf/ait/src/services/ait-vehicle.service.ts    |   2 +-
 .../domains/inf/ait/src/services/ait.service.ts    |   2 +-
 .../inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts    |  13 +-
 .../tests/integration/inf-rls.integration.spec.ts  |  27 +-
 .../inf/alcohol/src/alcohol-lifecycle.service.ts   |   2 +
 backend/domains/inf/alcohol/src/alcohol.module.ts  |   2 +-
 .../controllers/alcohol-forwarding.controller.ts   |   2 +-
 .../controllers/alcohol-procedure.controller.ts    |   2 +-
 .../src/controllers/alcohol-refusal.controller.ts  |   2 +-
 .../src/controllers/alcohol-test.controller.ts     |   2 +-
 .../src/controllers/breathalyzer.controller.ts     |   2 +-
 .../src/controllers/psychomotor-sign.controller.ts |   2 +-
 .../src/dto/create-alcohol-forwarding.dto.ts       |   2 +-
 .../src/dto/create-alcohol-procedure.dto.ts        |  15 +-
 .../alcohol/src/dto/create-alcohol-refusal.dto.ts  |   3 +-
 .../inf/alcohol/src/dto/create-alcohol-test.dto.ts |   4 +-
 .../inf/alcohol/src/dto/create-breathalyzer.dto.ts |   2 +-
 .../alcohol/src/dto/create-psychomotor-sign.dto.ts |   5 +-
 .../src/entities/alcohol-forwarding.entity.ts      |   2 +-
 .../src/entities/alcohol-procedure.entity.ts       |  15 +-
 .../alcohol/src/entities/alcohol-refusal.entity.ts |   3 +-
 .../alcohol/src/entities/alcohol-test.entity.ts    |   4 +-
 .../alcohol/src/entities/breathalyzer.entity.ts    |   2 +-
 .../src/entities/psychomotor-sign.entity.ts        |   5 +-
 backend/domains/inf/alcohol/src/index.ts           |   2 +-
 .../repositories/alcohol-forwarding.repository.ts  |   2 +-
 .../repositories/alcohol-procedure.repository.ts   |  15 +-
 .../src/repositories/alcohol-refusal.repository.ts |   3 +-
 .../src/repositories/alcohol-test.repository.ts    |   4 +-
 .../src/repositories/breathalyzer.repository.ts    |   2 +-
 .../repositories/psychomotor-sign.repository.ts    |   5 +-
 .../src/services/alcohol-forwarding.service.ts     |   2 +-
 .../src/services/alcohol-procedure.service.ts      |   2 +-
 .../src/services/alcohol-refusal.service.ts        |   2 +-
 .../alcohol/src/services/alcohol-test.service.ts   |   2 +-
 .../alcohol/src/services/breathalyzer.service.ts   |   2 +-
 .../src/services/psychomotor-sign.service.ts       |   2 +-
 .../administrative-measure.controller.ts           |   2 +-
 .../controllers/administrative-term.controller.ts  |   2 +-
 .../src/controllers/measure-removal.controller.ts  |   2 +-
 .../controllers/measure-retention.controller.ts    |   2 +-
 .../measure-status-history.controller.ts           |   2 +-
 .../src/controllers/measure-type.controller.ts     |   2 +-
 .../src/controllers/tow-provider.controller.ts     |   2 +-
 .../controllers/vehicle-inventory.controller.ts    |   2 +-
 .../measures/src/controllers/yard.controller.ts    |   2 +-
 .../src/dto/create-administrative-measure.dto.ts   |   2 +-
 .../src/dto/create-administrative-term.dto.ts      |   9 +-
 .../measures/src/dto/create-measure-removal.dto.ts |   4 +-
 .../src/dto/create-measure-retention.dto.ts        |   4 +-
 .../src/dto/create-measure-status-history.dto.ts   |   2 +-
 .../measures/src/dto/create-measure-type.dto.ts    |   2 +-
 .../measures/src/dto/create-tow-provider.dto.ts    |   2 +-
 .../src/dto/create-vehicle-inventory.dto.ts        |   2 +-
 .../inf/measures/src/dto/create-yard.dto.ts        |   2 +-
 .../src/entities/administrative-measure.entity.ts  |   2 +-
 .../src/entities/administrative-term.entity.ts     |   9 +-
 .../src/entities/measure-removal.entity.ts         |   4 +-
 .../src/entities/measure-retention.entity.ts       |   4 +-
 .../src/entities/measure-status-history.entity.ts  |   2 +-
 .../measures/src/entities/measure-type.entity.ts   |   2 +-
 .../measures/src/entities/tow-provider.entity.ts   |   2 +-
 .../src/entities/vehicle-inventory.entity.ts       |   2 +-
 .../inf/measures/src/entities/yard.entity.ts       |   2 +-
 backend/domains/inf/measures/src/index.ts          |   2 +-
 .../domains/inf/measures/src/measures.module.ts    |   2 +-
 .../administrative-measure.repository.ts           |   2 +-
 .../repositories/administrative-term.repository.ts |   9 +-
 .../src/repositories/measure-removal.repository.ts |   4 +-
 .../repositories/measure-retention.repository.ts   |   4 +-
 .../measure-status-history.repository.ts           |   2 +-
 .../src/repositories/measure-type.repository.ts    |   2 +-
 .../src/repositories/tow-provider.repository.ts    |   2 +-
 .../repositories/vehicle-inventory.repository.ts   |   2 +-
 .../measures/src/repositories/yard.repository.ts   |   2 +-
 .../src/services/administrative-measure.service.ts |   2 +-
 .../src/services/administrative-term.service.ts    |   2 +-
 .../src/services/measure-removal.service.ts        |   2 +-
 .../src/services/measure-retention.service.ts      |   2 +-
 .../src/services/measure-status-history.service.ts |   2 +-
 .../measures/src/services/measure-type.service.ts  |   2 +-
 .../measures/src/services/tow-provider.service.ts  |   2 +-
 .../src/services/vehicle-inventory.service.ts      |   2 +-
 .../inf/measures/src/services/yard.service.ts      |   2 +-
 .../mobile-normative-package.controller.ts         |   2 +-
 .../normative-agency-parameter.controller.ts       |   2 +-
 .../controllers/normative-catalog.controller.ts    |   2 +-
 .../normative-document-template.controller.ts      |   2 +-
 .../controllers/normative-framing.controller.ts    |   2 +-
 .../normative-validation-rule.controller.ts        |   2 +-
 .../src/dto/create-mobile-normative-package.dto.ts |   2 +-
 .../dto/create-normative-agency-parameter.dto.ts   |   2 +-
 .../src/dto/create-normative-catalog.dto.ts        |   2 +-
 .../dto/create-normative-document-template.dto.ts  |   5 +-
 .../src/dto/create-normative-framing.dto.ts        |   7 +-
 .../dto/create-normative-validation-rule.dto.ts    |   2 +-
 .../entities/mobile-normative-package.entity.ts    |   2 +-
 .../entities/normative-agency-parameter.entity.ts  |   2 +-
 .../src/entities/normative-catalog.entity.ts       |   2 +-
 .../entities/normative-document-template.entity.ts |   5 +-
 .../src/entities/normative-framing.entity.ts       |   7 +-
 .../entities/normative-validation-rule.entity.ts   |   2 +-
 backend/domains/inf/normative/src/index.ts         |  12 +-
 .../domains/inf/normative/src/normative.module.ts  |  14 +-
 .../mobile-normative-package.repository.ts         |   2 +-
 .../normative-agency-parameter.repository.ts       |   2 +-
 .../repositories/normative-catalog.repository.ts   |   2 +-
 .../normative-document-template.repository.ts      |   5 +-
 .../repositories/normative-framing.repository.ts   |   7 +-
 .../normative-validation-rule.repository.ts        |   2 +-
 .../services/mobile-normative-package.service.ts   |   2 +-
 .../services/normative-agency-parameter.service.ts |   2 +-
 .../src/services/normative-catalog.service.ts      |   2 +-
 .../normative-document-template.service.ts         |   2 +-
 .../src/services/normative-framing.service.ts      |   2 +-
 .../services/normative-validation-rule.service.ts  |   2 +-
 docs/framework/blueprints/BP-INF-AIT-001.json      | 102 +++-
 docs/framework/blueprints/BP-INF-ALCOHOL-001.json  |  91 +++-
 docs/framework/blueprints/BP-INF-MEASURES-001.json |  67 ++-
 .../framework/blueprints/BP-INF-NORMATIVE-001.json | 100 +++-
 .../contracts/BP-INF-AIT-001.openapi.json          | 520 +++++++++++++++++++-
 .../contracts/BP-INF-ALCOHOL-001.openapi.json      | 210 +++++++-
 .../contracts/BP-INF-MEASURES-001.openapi.json     | 136 +++++-
 .../contracts/BP-INF-NORMATIVE-001.openapi.json    | 528 ++++++++++++++++++++-
 tools/blueprints/generated-files.json              |  20 +
 tools/check-lifecycle-vocabulary.ts                |  27 +-
 work/rounds/R-0005/budget.json                     |  17 +-
 work/rounds/R-0005/plan.md                         |  65 +++
 work/rounds/R-0005/tasks/TASK-0005.json            |   2 +-
 work/rounds/R-0005/tasks/TASK-0006.json            |   4 +-
 work/rounds/R-0005/tasks/TASK-0007.json            |   4 +-
 173 files changed, 2465 insertions(+), 245 deletions(-)
```

Diff completo do grupo (inclui arquivos novos):

```diff
diff --git a/backend/database/ddl/14-inf-lifecycle-vocabulary.sql b/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
index ddc8d51..0bc69f4 100644
--- a/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
+++ b/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
@@ -9,6 +9,38 @@

 CREATE SCHEMA IF NOT EXISTS inf;

+-- WF-TEAT-001 — Estados canônicos da lavratura e processamento do AIT.
+CREATE TABLE IF NOT EXISTS inf.ait_state_ref (
+  code varchar(60) PRIMARY KEY,
+  sort_order smallint NOT NULL UNIQUE,
+  is_terminal boolean NOT NULL DEFAULT false,
+  description text NOT NULL,
+  legal_basis text NOT NULL
+);
+COMMENT ON TABLE inf.ait_state_ref IS 'WF-TEAT-001 — estados do ciclo de lavratura do AIT; [estado_origem] é notação de retorno, não estado.';
+
+INSERT INTO inf.ait_state_ref (code, sort_order, is_terminal, description, legal_basis) VALUES
+  ('RASCUNHO_OFFLINE', 10, false, 'rascunho criado no dispositivo com faixa reservada', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II'),
+  ('CANCELADO_RASCUNHO', 20, true, 'cancelamento do preenchimento em curso aprovado pela autoridade', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, k'),
+  ('FINALIZADO_LOCAL', 30, false, 'conteúdo legal congelado localmente por ação explícita do agente', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, g'),
+  ('ENFILEIRADO', 40, false, 'AIT gravado em fila local cifrada', 'WF-TEAT-001'),
+  ('TRANSMITIDO', 50, false, 'lote enviado para sincronização', 'WF-TEAT-001'),
+  ('RECEBIDO', 60, false, 'backend emitiu protocolo de recebimento', 'WF-TEAT-001'),
+  ('SUSPEITO_CONCORRENCIA', 70, false, 'mesmo agente em dispositivos distintos no mesmo intervalo; processamento bloqueado', 'WF-TEAT-001; REF-SENATRAN-997 Anexo II, h'),
+  ('VALIDANDO', 80, false, 'conteúdo e referências normativas em validação', 'WF-TEAT-001'),
+  ('ACEITO', 90, false, 'autoridade de trânsito aceitou o AIT para integração', 'WF-TEAT-001'),
+  ('REJEITADO', 100, true, 'autoridade rejeitou o AIT; integração bloqueada', 'WF-TEAT-001'),
+  ('PENDENTE_CORRECAO', 110, false, 'correção solicitada pela retaguarda ou autoridade', 'WF-TEAT-001'),
+  ('CORRIGIDO', 120, false, 'correção aprovada com justificativa', 'WF-TEAT-001'),
+  ('INTEGRADO', 130, false, 'integração autorizada e evento AIT_INTEGRADO emitido', 'WF-TEAT-001; ADR-0014'),
+  ('PROCESSADO', 140, false, 'processamento downstream concluído', 'WF-TEAT-001'),
+  ('ARQUIVADO', 150, true, 'processamento TEAT encerrado e arquivado', 'WF-TEAT-001'),
+  ('SOLICITADO_CANCEL_POSFINAL', 160, false, 'pedido formal de cancelamento pós-finalização endereçado à Diretoria de Fiscalização', 'WF-TEAT-001; UC-TEAT-011'),
+  ('CANCELADO_POSFINAL', 170, true, 'cancelamento pós-finalização deferido; conteúdo legal original imutável', 'WF-TEAT-001; UC-TEAT-011')
+ON CONFLICT (code) DO UPDATE SET
+  sort_order = EXCLUDED.sort_order, is_terminal = EXCLUDED.is_terminal, description = EXCLUDED.description,
+  legal_basis = EXCLUDED.legal_basis;
+
 -- §1 — Estados (um por fase jurídica)
 CREATE TABLE IF NOT EXISTS inf.infraction_state_ref (
   code varchar(40) PRIMARY KEY,
@@ -136,7 +168,7 @@ ON CONFLICT (code) DO UPDATE SET ciencia_rule = EXCLUDED.ciencia_rule, legal_bas
 -- WF-INF-002 §9 — Catálogo unificado de timers
 CREATE TABLE IF NOT EXISTS inf.infraction_timer_ref (
   code varchar(20) PRIMARY KEY,
-  owner varchar(20) NOT NULL CHECK (owner IN ('infracao', 'caso', 'sessao', 'indicador')),
+  owner varchar(20) NOT NULL CHECK (owner IN ('infracao', 'caso', 'sessao', 'indicador', 'medida')),
   duration_value integer,
   duration_unit varchar(20) NOT NULL CHECK (duration_unit IN ('dias_corridos', 'dias_uteis', 'meses', 'anos', 'data_impressa', 'meta')),
   start_mark text NOT NULL,
@@ -163,6 +195,12 @@ INSERT INTO inf.infraction_timer_ref (code, owner, duration_value, duration_unit
   ('T-R2', 'infracao', 30, 'dias_corridos', 'publicação da decisão da JARI (Owner C.24)', 'AGUARDANDO_RECURSO_2A', 'transicao', NULL, NULL, 'vigente', 'CTB art. 288; RN-RAIT-103, RN-RAIT-130'),
   ('T-PAR-3A', 'infracao', 3, 'anos', 'último ato registrado (reinicia a cada movimentação)', 'qualquer estado pendente de julgamento', 'transicao', 'EXTINTO_PRESCRICAO', NULL, 'a_confirmar', 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113'),
   ('T-PRESC-5A', 'infracao', 5, 'anos', 'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)', 'todo o ciclo até o encerramento', 'transicao', 'EXTINTO_PRESCRICAO', '30/45/54/60 meses', 'a_confirmar', 'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113'),
+  ('T-REG30', 'medida', 30, 'dias_corridos', 'recibo entregue na retenção com CLA recolhido', 'LIBERADO_COM_PRAZO (CTB art. 270 §2º)', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 270 §§2º, 6º-7º; RN-TEAT-124'),
+  ('T-REG15', 'medida', 15, 'dias_corridos', 'recibo entregue na liberação do CTB art. 271 §9º-A', 'LIBERADO_COM_PRAZO (CTB art. 271 §9º-A)', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §§9º-A, 9º-C-9º-D; RN-TEAT-125'),
+  ('T-NOTIF10', 'medida', 10, 'dias_corridos', 'remoção efetivada sem proprietário ou condutor presente', 'EM_DEPOSITO', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §6º; Res. CONTRAN 1.025/2026 art. 15'),
+  ('T-DEPOSITO6M', 'medida', 6, 'meses', 'entrada no centro de custódia', 'EM_DEPOSITO', 'marco', NULL, NULL, 'vigente', 'WF-TEAT-004; CTB art. 271 §10; Res. CONTRAN 1.025/2026 art. 21 §2º; RN-TEAT-128'),
+  ('T-CNH5D', 'medida', 5, 'dias_corridos', 'recolhimento de CNH por alcoolemia', 'recolhimento de CNH em procedimento de alcoolemia', 'regra', NULL, NULL, 'vigente', 'WF-TEAT-004; WF-TEAT-005; Res. CONTRAN 432/2013 art. 10 §1º'),
+  ('T-SNE2027', 'medida', NULL, 'meta', 'marco fixo de 01/01/2027', 'notificação de remoção', 'marco', NULL, NULL, 'vigente', 'WF-TEAT-004; Res. CONTRAN 1.025/2026 art. 15 §3º'),
   ('T-VOTO', 'caso', 20, 'dias_corridos', 'distribuição ao relator (aceite do lote)', 'caso RAIT em EM_INSTRUCAO (2º circuito)', 'alerta', NULL, NULL, 'proposta', 'WF-RAIT-003 (pendente regimento)'),
   ('T-CONV', 'sessao', 5, 'dias_uteis', 'fechamento da pauta', 'sessão em PAUTA_FECHADA', 'guarda', NULL, NULL, 'proposta', 'WF-RAIT-003 (pendente regimento)'),
   ('T-ASS', 'caso', 5, 'dias_uteis', 'minuta enviada para assinatura', 'caso RAIT em PRONTO_P_DECISAO (1º circuito)', 'alerta', NULL, NULL, 'proposta', 'WF-RAIT-004 §2 (meta operacional)'),
diff --git a/backend/database/ddl/30-inf-normative.sql b/backend/database/ddl/30-inf-normative.sql
index e9d0f4b..aa9c414 100644
--- a/backend/database/ddl/30-inf-normative.sql
+++ b/backend/database/ddl/30-inf-normative.sql
@@ -1,4 +1,4 @@
--- Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+-- Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52

 -- Regenerable-only DDL for BP-INF-NORMATIVE-001; request-path writes use role_app_backend.

@@ -35,19 +35,42 @@ create table if not exists inf.normative_framing (
   severity varchar(40),
   penalty text,
   administrative_measure_summary text,
-  allows_no_approach boolean default false not null,
+  approach_class varchar(20) not null,
+  required_fields jsonb,
+  required_instrument boolean default false not null,
+  points_label varchar(160),
   requires_observation boolean default false not null,
   requires_equipment boolean default false not null,
   status varchar(40) default 'active' not null,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_normative_framing primary key (id),
+  constraint ck_inf_normative_framing_approach_class check (approach_class in ('caso_1', 'caso_2', 'caso_3')),
   constraint fk_inf_framing_catalog foreign key (catalog_id) references inf.normative_catalog (id)
 );
 create unique index if not exists ux_inf_normative_framing_code on inf.normative_framing (tenant_id, catalog_id, framing_code);
 create index if not exists ix_normative_framing_tenant_id on inf.normative_framing (tenant_id);
 create index if not exists ix_normative_framing_catalog_id on inf.normative_framing (catalog_id);

+create table if not exists inf.normative_metrological_table (
+  id uuid default gen_random_uuid() not null,
+  tenant_id uuid not null,
+  catalog_id uuid not null,
+  table_name varchar(160) not null,
+  version varchar(80) not null,
+  table_json jsonb not null,
+  valid_from date not null,
+  valid_to date,
+  status varchar(40) default 'active' not null,
+  created_at timestamptz default now() not null,
+  updated_at timestamptz,
+  constraint pk_normative_metrological_table primary key (id),
+  constraint fk_inf_metrological_table_catalog foreign key (catalog_id) references inf.normative_catalog (id)
+);
+create unique index if not exists ux_inf_normative_metrological_table on inf.normative_metrological_table (tenant_id, catalog_id, table_name, version);
+create index if not exists ix_normative_metrological_table_tenant_id on inf.normative_metrological_table (tenant_id);
+create index if not exists ix_normative_metrological_table_catalog_id on inf.normative_metrological_table (catalog_id);
+
 create table if not exists inf.normative_validation_rule (
   id uuid default gen_random_uuid() not null,
   tenant_id uuid not null,
@@ -93,7 +116,8 @@ create table if not exists inf.normative_document_template (
   id uuid default gen_random_uuid() not null,
   tenant_id uuid not null,
   traffic_agency_id uuid not null,
-  document_type varchar(80) not null,
+  document_kind varchar(80) not null,
+  domain_scope varchar(80) default 'inf' not null,
   name varchar(255) not null,
   version varchar(80) not null,
   template_body text not null,
@@ -103,10 +127,29 @@ create table if not exists inf.normative_document_template (
   updated_at timestamptz,
   constraint pk_normative_document_template primary key (id)
 );
-create unique index if not exists ux_inf_normative_document_template on inf.normative_document_template (tenant_id, traffic_agency_id, document_type, version);
+create unique index if not exists ux_inf_normative_document_template on inf.normative_document_template (tenant_id, traffic_agency_id, document_kind, version);
 create index if not exists ix_normative_document_template_tenant_id on inf.normative_document_template (tenant_id);
 create index if not exists ix_normative_document_template_traffic_agency_id on inf.normative_document_template (traffic_agency_id);

+create table if not exists inf.signature_policy (
+  id uuid default gen_random_uuid() not null,
+  tenant_id uuid not null,
+  traffic_agency_id uuid not null,
+  document_kind varchar(80) not null,
+  required_signers_json jsonb not null,
+  pades_level varchar(40) not null,
+  tsa_required boolean default false not null,
+  pdfa_required boolean default false not null,
+  govbr_level varchar(40),
+  status varchar(40) default 'active' not null,
+  created_at timestamptz default now() not null,
+  updated_at timestamptz,
+  constraint pk_signature_policy primary key (id)
+);
+create unique index if not exists ux_inf_signature_policy_document_kind on inf.signature_policy (tenant_id, traffic_agency_id, document_kind);
+create index if not exists ix_signature_policy_tenant_id on inf.signature_policy (tenant_id);
+create index if not exists ix_signature_policy_traffic_agency_id on inf.signature_policy (traffic_agency_id);
+
 create table if not exists inf.normative_mobile_package (
   id uuid default gen_random_uuid() not null,
   tenant_id uuid not null,
@@ -132,12 +175,16 @@ select auth.create_rls_policy('inf', 'normative_catalog');

 select auth.create_rls_policy('inf', 'normative_framing');

+select auth.create_rls_policy('inf', 'normative_metrological_table');
+
 select auth.create_rls_policy('inf', 'normative_validation_rule');

 select auth.create_rls_policy('inf', 'normative_agency_parameter');

 select auth.create_rls_policy('inf', 'normative_document_template');

+select auth.create_rls_policy('inf', 'signature_policy');
+
 select auth.create_rls_policy('inf', 'normative_mobile_package');

 select auth.install_tenant_triggers();
diff --git a/backend/database/ddl/31-inf-ait.sql b/backend/database/ddl/31-inf-ait.sql
index 48ec668..ba20522 100644
--- a/backend/database/ddl/31-inf-ait.sql
+++ b/backend/database/ddl/31-inf-ait.sql
@@ -1,4 +1,4 @@
--- Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+-- Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609

 -- Regenerable-only DDL for BP-INF-AIT-001; request-path writes use role_app_backend.

@@ -33,7 +33,9 @@ create table if not exists inf.ait_ait (
   direction varchar(60),
   mandatory_observation text,
   complementary_observation text,
-  current_status varchar(60) default 'draft' not null,
+  current_status varchar(60) default 'RASCUNHO_OFFLINE' not null,
+  version integer default 1 not null,
+  speed_measurement_id uuid,
   content_hash varchar(128),
   system_signature_ref text,
   receipt_protocol varchar(120),
@@ -42,8 +44,10 @@ create table if not exists inf.ait_ait (
   updated_at timestamptz,
   constraint pk_ait_ait primary key (id),
   constraint ck_inf_ait_issue_after_infraction check (issued_at >= infraction_at),
+  constraint ck_inf_ait_current_status check (current_status in ('RASCUNHO_OFFLINE', 'CANCELADO_RASCUNHO', 'FINALIZADO_LOCAL', 'ENFILEIRADO', 'TRANSMITIDO', 'RECEBIDO', 'SUSPEITO_CONCORRENCIA', 'VALIDANDO', 'ACEITO', 'REJEITADO', 'PENDENTE_CORRECAO', 'CORRIGIDO', 'INTEGRADO', 'PROCESSADO', 'ARQUIVADO', 'SOLICITADO_CANCEL_POSFINAL', 'CANCELADO_POSFINAL')),
   constraint fk_inf_ait_catalog foreign key (catalog_id) references inf.normative_catalog (id),
-  constraint fk_inf_ait_framing foreign key (framing_id) references inf.normative_framing (id)
+  constraint fk_inf_ait_framing foreign key (framing_id) references inf.normative_framing (id),
+  constraint fk_inf_ait_current_status foreign key (current_status) references inf.ait_state_ref (code)
 );
 create unique index if not exists ux_inf_ait_number on inf.ait_ait (tenant_id, traffic_agency_id, series, ait_number);
 create unique index if not exists ux_inf_ait_receipt_protocol on inf.ait_ait (tenant_id, receipt_protocol) where receipt_protocol is not null;
@@ -58,6 +62,47 @@ create index if not exists ix_ait_ait_operation_id on inf.ait_ait (operation_id)
 create index if not exists ix_ait_ait_device_id on inf.ait_ait (device_id);
 create index if not exists ix_ait_ait_framing_id on inf.ait_ait (framing_id);
 create index if not exists ix_ait_ait_catalog_id on inf.ait_ait (catalog_id);
+create index if not exists ix_ait_ait_speed_measurement_id on inf.ait_ait (speed_measurement_id);
+
+create table if not exists inf.ait_cancel_request (
+  id uuid default gen_random_uuid() not null,
+  tenant_id uuid not null,
+  ait_id uuid not null,
+  kind varchar(60) not null,
+  target_local_act_id varchar(120),
+  origin_status varchar(60) not null,
+  addressed_to varchar(120) not null,
+  status varchar(60) default 'submitted' not null,
+  decision text,
+  requested_at timestamptz default now() not null,
+  decided_at timestamptz,
+  created_at timestamptz default now() not null,
+  updated_at timestamptz,
+  constraint pk_ait_cancel_request primary key (id),
+  constraint fk_inf_ait_cancel_request_ait foreign key (ait_id) references inf.ait_ait (id)
+);
+create index if not exists ix_inf_ait_cancel_request on inf.ait_cancel_request (tenant_id, ait_id, status);
+create index if not exists ix_ait_cancel_request_tenant_id on inf.ait_cancel_request (tenant_id);
+create index if not exists ix_ait_cancel_request_ait_id on inf.ait_cancel_request (ait_id);
+create index if not exists ix_ait_cancel_request_target_local_act_id on inf.ait_cancel_request (target_local_act_id);
+
+create table if not exists inf.ait_cancel_request_event (
+  id uuid default gen_random_uuid() not null,
+  tenant_id uuid not null,
+  cancel_request_id uuid not null,
+  event_type varchar(80) not null,
+  event_at timestamptz default now() not null,
+  actor_user_ref uuid,
+  decision text,
+  details_json jsonb,
+  created_at timestamptz default now() not null,
+  updated_at timestamptz,
+  constraint pk_ait_cancel_request_event primary key (id),
+  constraint fk_inf_ait_cancel_request_event_request foreign key (cancel_request_id) references inf.ait_cancel_request (id)
+);
+create index if not exists ix_inf_ait_cancel_request_event on inf.ait_cancel_request_event (tenant_id, cancel_request_id, event_at);
+create index if not exists ix_ait_cancel_request_event_tenant_id on inf.ait_cancel_request_event (tenant_id);
+create index if not exists ix_ait_cancel_request_event_cancel_request_id on inf.ait_cancel_request_event (cancel_request_id);

 create table if not exists inf.ait_vehicle (
   id uuid default gen_random_uuid() not null,
@@ -187,6 +232,10 @@ create index if not exists ix_ait_print_event_device_id on inf.ait_print_event (

 select auth.create_rls_policy('inf', 'ait_ait');

+select auth.create_rls_policy('inf', 'ait_cancel_request');
+
+select auth.create_rls_policy('inf', 'ait_cancel_request_event');
+
 select auth.create_rls_policy('inf', 'ait_vehicle');

 select auth.create_rls_policy('inf', 'ait_person');
diff --git a/backend/database/ddl/32-inf-measures.sql b/backend/database/ddl/32-inf-measures.sql
index cdbbbfe..4795ca1 100644
--- a/backend/database/ddl/32-inf-measures.sql
+++ b/backend/database/ddl/32-inf-measures.sql
@@ -1,4 +1,4 @@
--- Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+-- Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212

 -- Regenerable-only DDL for BP-INF-MEASURES-001; request-path writes use role_app_backend.

@@ -39,6 +39,7 @@ create table if not exists inf.administrative_measure (
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_administrative_measure primary key (id),
+  constraint ck_inf_administrative_measure_current_status check (current_status in ('RETIDO', 'LIBERADO_LOCAL', 'LIBERADO_COM_PRAZO', 'REGULARIZADO', 'CONVERTIDO_REMOCAO', 'REMOVIDO', 'EM_DEPOSITO', 'GUARDA_MONITORADA', 'VIOLACAO_MONITORAMENTO', 'NOTIFICADO', 'RESTITUIDO', 'LEILAO')),
   constraint fk_inf_measure_type foreign key (measure_type_id) references inf.measure_type (id),
   constraint fk_inf_measure_ait foreign key (ait_id) references inf.ait_ait (id),
   constraint fk_inf_measure_approach foreign key (approach_id) references ops.ops_approach (id)
@@ -65,6 +66,13 @@ create table if not exists inf.administrative_term (
   file_evidence_id uuid,
   issued_at timestamptz not null,
   signed_by_person_id uuid,
+  signer_name varchar(160),
+  withdrawal_deadline_at timestamptz,
+  ctb_deadline_at timestamptz,
+  field_details_json jsonb,
+  source_local_id varchar(120),
+  source_idempotency_key varchar(160),
+  source_payload_hash varchar(128),
   status varchar(60) default 'issued' not null,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
@@ -78,6 +86,7 @@ create index if not exists ix_administrative_term_tenant_id on inf.administrativ
 create index if not exists ix_administrative_term_measure_id on inf.administrative_term (measure_id);
 create index if not exists ix_administrative_term_file_evidence_id on inf.administrative_term (file_evidence_id);
 create index if not exists ix_administrative_term_signed_by_person_id on inf.administrative_term (signed_by_person_id);
+create index if not exists ix_administrative_term_source_local_id on inf.administrative_term (source_local_id);

 create table if not exists inf.measure_retention (
   id uuid default gen_random_uuid() not null,
@@ -85,12 +94,15 @@ create table if not exists inf.measure_retention (
   measure_id uuid not null,
   vehicle_snapshot_id uuid not null,
   retention_reason text not null,
+  regularization_deadline_at timestamptz,
+  regularization_deadline_days integer,
   regularized_at timestamptz,
   released_at timestamptz,
   release_user_ref uuid,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_measure_retention primary key (id),
+  constraint ck_inf_measure_retention_regularization_deadline_30 check (regularization_deadline_days is null or regularization_deadline_days between 1 and 30),
   constraint fk_inf_retention_measure foreign key (measure_id) references inf.administrative_measure (id),
   constraint fk_inf_retention_vehicle foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id)
 );
@@ -108,10 +120,13 @@ create table if not exists inf.measure_removal (
   requested_at timestamptz,
   tow_arrived_at timestamptz,
   delivered_at timestamptz,
+  regularization_deadline_at timestamptz,
+  regularization_deadline_days integer,
   destination_description text,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_measure_removal primary key (id),
+  constraint ck_inf_measure_removal_regularization_deadline_15 check (regularization_deadline_days is null or regularization_deadline_days between 1 and 15),
   constraint fk_inf_removal_measure foreign key (measure_id) references inf.administrative_measure (id),
   constraint fk_inf_removal_vehicle foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id)
 );
diff --git a/backend/database/ddl/33-inf-alcohol.sql b/backend/database/ddl/33-inf-alcohol.sql
index 3aa0552..5cb0b47 100644
--- a/backend/database/ddl/33-inf-alcohol.sql
+++ b/backend/database/ddl/33-inf-alcohol.sql
@@ -1,4 +1,4 @@
--- Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+-- Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382

 -- Regenerable-only DDL for BP-INF-ALCOHOL-001; request-path writes use role_app_backend.

@@ -20,6 +20,19 @@ create table if not exists inf.alcohol_procedure (
   outcome varchar(80) not null,
   status varchar(40) default 'draft' not null,
   notes text,
+  ait_local_id varchar(120),
+  sign_catalog_id varchar(120),
+  sign_catalog_version varchar(40),
+  driver_name varchar(160),
+  driver_document varchar(60),
+  vehicle_plate varchar(20),
+  vehicle_make varchar(120),
+  refused_procedures bool,
+  driver_statement_json jsonb,
+  witnesses_json jsonb,
+  source_local_id varchar(120),
+  source_idempotency_key varchar(160),
+  source_payload_hash varchar(128),
   location_geom geometry(Point,4674),
   created_at timestamptz default now() not null,
   updated_at timestamptz,
@@ -39,6 +52,9 @@ create index if not exists ix_alcohol_procedure_approach_id on inf.alcohol_proce
 create index if not exists ix_alcohol_procedure_agent_id on inf.alcohol_procedure (agent_id);
 create index if not exists ix_alcohol_procedure_shift_id on inf.alcohol_procedure (shift_id);
 create index if not exists ix_alcohol_procedure_driver_person_id on inf.alcohol_procedure (driver_person_id);
+create index if not exists ix_alcohol_procedure_ait_local_id on inf.alcohol_procedure (ait_local_id);
+create index if not exists ix_alcohol_procedure_sign_catalog_id on inf.alcohol_procedure (sign_catalog_id);
+create index if not exists ix_alcohol_procedure_source_local_id on inf.alcohol_procedure (source_local_id);

 create table if not exists inf.alcohol_breathalyzer (
   id uuid default gen_random_uuid() not null,
@@ -66,12 +82,15 @@ create table if not exists inf.alcohol_test (
   test_number varchar(80),
   tested_at timestamptz not null,
   result_mg_l numeric(8,3),
+  considered_mg_l numeric(8,3),
+  max_error_mg_l numeric(8,3),
   counterproof boolean default false not null,
   result_image_evidence_id uuid,
   status varchar(40) default 'recorded' not null,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_alcohol_test primary key (id),
+  constraint ck_inf_alcohol_test_considered_error_pair check ((considered_mg_l is null) = (max_error_mg_l is null) and (max_error_mg_l is null or max_error_mg_l >= 0)),
   constraint fk_inf_alcohol_test_procedure foreign key (procedure_id) references inf.alcohol_procedure (id),
   constraint fk_inf_alcohol_test_device foreign key (breathalyzer_id) references inf.alcohol_breathalyzer (id),
   constraint fk_inf_alcohol_test_evidence foreign key (result_image_evidence_id) references ops.evidence_evidence (id)
@@ -86,12 +105,14 @@ create table if not exists inf.alcohol_refusal (
   tenant_id uuid not null,
   procedure_id uuid not null,
   refused_at timestamptz not null,
+  kind varchar(40) not null,
   refusal_description text not null,
   witness_person_id uuid,
   evidence_id uuid,
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_alcohol_refusal primary key (id),
+  constraint ck_inf_alcohol_refusal_kind check (kind in ('refusal', 'technical_impossibility')),
   constraint fk_inf_alcohol_refusal_procedure foreign key (procedure_id) references inf.alcohol_procedure (id),
   constraint fk_inf_alcohol_refusal_person foreign key (witness_person_id) references ops.snapshots_person (id),
   constraint fk_inf_alcohol_refusal_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
@@ -108,6 +129,9 @@ create table if not exists inf.alcohol_psychomotor_sign (
   sign_code varchar(80) not null,
   description text not null,
   observed boolean default true not null,
+  sign_group varchar(80),
+  sign_status varchar(20),
+  method varchar(120),
   created_at timestamptz default now() not null,
   updated_at timestamptz,
   constraint pk_alcohol_psychomotor_sign primary key (id),
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts b/backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts
index 3e5b651..62e1e89 100644
--- a/backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts
+++ b/backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts
@@ -5,6 +5,35 @@ import {
 } from './ait-lifecycle.service.js';

 describe('AitLifecycleService', () => {
+  it('dado um AIT em RASCUNHO_OFFLINE quando finalizado então transita para FINALIZADO_LOCAL', async () => {
+    const ait = {
+      id: 'ait-canonico',
+      current_status: 'RASCUNHO_OFFLINE',
+      ait_number: '123',
+      series: 'A',
+    };
+    const service = new AitLifecycleService(
+      {
+        ait: {
+          transaction: vi.fn(async (work) => work({})),
+          findOne: vi.fn(async () => ait),
+          update: vi.fn(async (_id, patch) => ({ ...ait, ...patch })),
+        } as never,
+        history: { create: vi.fn(async (dto) => dto) } as never,
+        vehicles: {} as never,
+        people: {} as never,
+        corrections: {} as never,
+        signatures: {} as never,
+        printEvents: {} as never,
+      },
+      { assertActive: vi.fn() },
+    );
+
+    await expect(service.finalize(ait.id, 'actor-1')).resolves.toMatchObject({
+      current_status: 'FINALIZADO_LOCAL',
+    });
+  });
+
   it('produces a stable legal-content hash independent of mutable delivery fields', () => {
     const baseline = {
       id: 'ait-1',
@@ -25,10 +54,10 @@ describe('AitLifecycleService', () => {
     );
   });

-  it('finalizes a draft atomically with content hash and history', async () => {
+  it('dado um AIT em RASCUNHO_OFFLINE quando finalizado então preserva hash assinatura e histórico', async () => {
     const draft = {
       id: 'ait-1',
-      current_status: 'draft',
+      current_status: 'RASCUNHO_OFFLINE',
       ait_number: '123',
       series: 'A',
     };
@@ -55,10 +84,10 @@ describe('AitLifecycleService', () => {
       { assertActive: vi.fn() },
     );
     const result = await service.finalize('ait-1', 'actor-1');
-    expect(result.current_status).toBe('issued');
+    expect(result.current_status).toBe('FINALIZADO_LOCAL');
     expect(result.content_hash).toMatch(/^[a-f0-9]{64}$/u);
     expect(history).toHaveBeenCalledWith(
-      expect.objectContaining({ status: 'issued' }),
+      expect.objectContaining({ status: 'FINALIZADO_LOCAL' }),
       expect.anything(),
     );
     expect(transaction).toHaveBeenCalledOnce();
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.service.ts b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
index 33e3522..276a2bb 100644
--- a/backend/domains/inf/ait/src/ait-lifecycle.service.ts
+++ b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
@@ -24,17 +24,23 @@ import type { AitVehicleRepository } from './repositories/ait-vehicle.repository
 import type { AitRepository } from './repositories/ait.repository.js';

 export type AitStatus =
-  | 'draft'
-  | 'issued'
-  | 'pending_transmission'
-  | 'transmitted'
-  | 'received'
-  | 'validating'
-  | 'pending_correction'
-  | 'corrected'
-  | 'accepted'
-  | 'rejected'
-  | 'cancelled';
+  | 'RASCUNHO_OFFLINE'
+  | 'CANCELADO_RASCUNHO'
+  | 'FINALIZADO_LOCAL'
+  | 'ENFILEIRADO'
+  | 'TRANSMITIDO'
+  | 'RECEBIDO'
+  | 'SUSPEITO_CONCORRENCIA'
+  | 'VALIDANDO'
+  | 'ACEITO'
+  | 'REJEITADO'
+  | 'PENDENTE_CORRECAO'
+  | 'CORRIGIDO'
+  | 'INTEGRADO'
+  | 'PROCESSADO'
+  | 'ARQUIVADO'
+  | 'SOLICITADO_CANCEL_POSFINAL'
+  | 'CANCELADO_POSFINAL';

 export interface AitRepositories {
   ait: AitRepository;
@@ -57,7 +63,7 @@ export class AitLifecycleService {
     return this.repositories.ait.transaction(async (tx) => {
       await this.normative.assertActive(dto.catalog_id, dto.framing_id, tx);
       return this.repositories.ait.create(
-        { ...dto, current_status: 'draft', content_hash: null },
+        { ...dto, current_status: 'RASCUNHO_OFFLINE', content_hash: null },
         tx,
       );
     });
@@ -65,21 +71,21 @@ export class AitLifecycleService {

   addVehicle(aitId: string, dto: Omit<CreateAitVehicleDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['draft'], tx);
+      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
       return this.repositories.vehicles.create({ ...dto, ait_id: aitId }, tx);
     });
   }

   addPerson(aitId: string, dto: Omit<CreateAitPersonDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['draft'], tx);
+      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
       return this.repositories.people.create({ ...dto, ait_id: aitId }, tx);
     });
   }

   addCorrection(aitId: string, dto: Omit<CreateAitCorrectionDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['pending_correction'], tx);
+      await this.requireStatus(aitId, ['PENDENTE_CORRECAO'], tx);
       return this.repositories.corrections.create(
         { ...dto, ait_id: aitId },
         tx,
@@ -89,7 +95,11 @@ export class AitLifecycleService {

   recordScience(aitId: string, dto: Omit<CreateAitSignatureDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.requireStatus(aitId, ['draft', 'issued'], tx);
+      const ait = await this.requireStatus(
+        aitId,
+        ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
+        tx,
+      );
       const signature = await this.repositories.signatures.create(
         { ...dto, ait_id: aitId },
         tx,
@@ -106,7 +116,7 @@ export class AitLifecycleService {

   recordPrint(aitId: string, dto: Omit<CreateAitPrintEventDto, 'ait_id'>) {
     return this.repositories.ait.transaction(async (tx) => {
-      await this.requireStatus(aitId, ['issued', 'pending_transmission'], tx);
+      await this.requireStatus(aitId, ['FINALIZADO_LOCAL', 'ENFILEIRADO'], tx);
       return this.repositories.printEvents.create(
         { ...dto, ait_id: aitId },
         tx,
@@ -116,20 +126,27 @@ export class AitLifecycleService {

   finalize(id: string, actorId?: string): Promise<Ait> {
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.requireStatus(id, ['draft'], tx);
+      const ait = await this.requireStatus(id, ['RASCUNHO_OFFLINE'], tx);
       const contentHash = contentHashForAit(ait);
-      return this.transition(ait, 'issued', 'AIT finalized', tx, actorId, {
-        content_hash: contentHash,
-        system_signature_ref: `sha256:${contentHash}`,
-      });
+      return this.transition(
+        ait,
+        'FINALIZADO_LOCAL',
+        'AIT finalized',
+        tx,
+        actorId,
+        {
+          content_hash: contentHash,
+          system_signature_ref: `sha256:${contentHash}`,
+        },
+      );
     });
   }

   queueTransmission(id: string, actorId?: string): Promise<Ait> {
     return this.transitionFrom(
       id,
-      ['issued'],
-      'pending_transmission',
+      ['FINALIZADO_LOCAL'],
+      'ENFILEIRADO',
       'AIT queued for transmission',
       actorId,
     );
@@ -143,12 +160,12 @@ export class AitLifecycleService {
     return this.repositories.ait.transaction(async (tx) => {
       const ait = await this.requireStatus(
         id,
-        ['pending_transmission', 'transmitted'],
+        ['ENFILEIRADO', 'TRANSMITIDO'],
         tx,
       );
       return this.transition(
         ait,
-        'received',
+        'RECEBIDO',
         'RENAINF protocol received',
         tx,
         actorId,
@@ -166,8 +183,8 @@ export class AitLifecycleService {
   ): Promise<Ait> {
     return this.transitionFrom(
       id,
-      ['validating', 'rejected'],
-      'pending_correction',
+      ['VALIDANDO', 'REJEITADO'],
+      'PENDENTE_CORRECAO',
       reason,
       actorId,
     );
@@ -181,7 +198,7 @@ export class AitLifecycleService {
     return this.repositories.ait.transaction(async (tx) => {
       const ait = await this.requireStatus(
         id,
-        ['pending_correction', 'corrected'],
+        ['PENDENTE_CORRECAO', 'CORRIGIDO'],
         tx,
       );
       const correction = await this.repositories.corrections.findOne(
@@ -197,7 +214,7 @@ export class AitLifecycleService {
       );
       return this.transition(
         ait,
-        'corrected',
+        'CORRIGIDO',
         correction.justification,
         tx,
         actorId,
@@ -209,8 +226,8 @@ export class AitLifecycleService {
     // TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake.
     return this.transitionFrom(
       id,
-      ['received', 'validating', 'corrected'],
-      'accepted',
+      ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'],
+      'ACEITO',
       'AIT accepted',
       actorId,
     );
@@ -224,8 +241,8 @@ export class AitLifecycleService {
   ): Promise<Ait> {
     return this.transitionFrom(
       id,
-      ['received', 'validating', 'pending_correction'],
-      cancelled ? 'cancelled' : 'rejected',
+      ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
+      cancelled ? 'CANCELADO_RASCUNHO' : 'REJEITADO',
       reason,
       actorId,
     );
diff --git a/backend/domains/inf/ait/src/ait.module.ts b/backend/domains/inf/ait/src/ait.module.ts
index 95cf470..2b38832 100644
--- a/backend/domains/inf/ait/src/ait.module.ts
+++ b/backend/domains/inf/ait/src/ait.module.ts
@@ -1,8 +1,14 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Module } from '@nestjs/common';
 import { AitController } from './controllers/ait.controller.js';
 import { AitService } from './services/ait.service.js';
 import { AitRepository } from './repositories/ait.repository.js';
+import { AitCancelRequestController } from './controllers/ait-cancel-request.controller.js';
+import { AitCancelRequestService } from './services/ait-cancel-request.service.js';
+import { AitCancelRequestRepository } from './repositories/ait-cancel-request.repository.js';
+import { AitCancelRequestEventController } from './controllers/ait-cancel-request-event.controller.js';
+import { AitCancelRequestEventService } from './services/ait-cancel-request-event.service.js';
+import { AitCancelRequestEventRepository } from './repositories/ait-cancel-request-event.repository.js';
 import { AitVehicleController } from './controllers/ait-vehicle.controller.js';
 import { AitVehicleService } from './services/ait-vehicle.service.js';
 import { AitVehicleRepository } from './repositories/ait-vehicle.repository.js';
@@ -29,6 +35,8 @@ import { NormativeModule } from '@detran/inf-normative';
   imports: [NormativeModule],
   controllers: [
     AitController,
+    AitCancelRequestController,
+    AitCancelRequestEventController,
     AitVehicleController,
     AitPersonController,
     AitStatusHistoryController,
@@ -40,6 +48,10 @@ import { NormativeModule } from '@detran/inf-normative';
   providers: [
     AitService,
     AitRepository,
+    AitCancelRequestService,
+    AitCancelRequestRepository,
+    AitCancelRequestEventService,
+    AitCancelRequestEventRepository,
     AitVehicleService,
     AitVehicleRepository,
     AitPersonService,
diff --git a/backend/domains/inf/ait/src/controllers/ait-correction.controller.ts b/backend/domains/inf/ait/src/controllers/ait-correction.controller.ts
index dc5dcec..07cf4cf 100644
--- a/backend/domains/inf/ait/src/controllers/ait-correction.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-correction.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait-person.controller.ts b/backend/domains/inf/ait/src/controllers/ait-person.controller.ts
index 3d131b7..5a0f419 100644
--- a/backend/domains/inf/ait/src/controllers/ait-person.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-person.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts b/backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts
index 96c30ab..ae3c7ab 100644
--- a/backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait-signature.controller.ts b/backend/domains/inf/ait/src/controllers/ait-signature.controller.ts
index dc836f9..6089ffa 100644
--- a/backend/domains/inf/ait/src/controllers/ait-signature.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-signature.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts b/backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts
index f046983..d0cdd21 100644
--- a/backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts b/backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts
index acc1217..e1e9f56 100644
--- a/backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/controllers/ait.controller.ts b/backend/domains/inf/ait/src/controllers/ait.controller.ts
index 8e65c66..1758bde 100644
--- a/backend/domains/inf/ait/src/controllers/ait.controller.ts
+++ b/backend/domains/inf/ait/src/controllers/ait.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts
index 195a1c1..110d32f 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitCorrectionDto {
   ait_id: string;
   operator_user_ref: string;
diff --git a/backend/domains/inf/ait/src/dto/create-ait-person.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-person.dto.ts
index 07cf7e9..e5b06a4 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-person.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-person.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitPersonDto {
   ait_id: string;
   person_id: string;
diff --git a/backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts
index c7186ae..afe5dc9 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitPrintEventDto {
   ait_id: string;
   event_type: string;
diff --git a/backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts
index 4e760c2..a627d47 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitSignatureDto {
   ait_id: string;
   person_id?: string | null;
diff --git a/backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts
index 3aa7bfd..f2b0493 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitStatusHistoryDto {
   ait_id: string;
   status: string;
diff --git a/backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts
index ef1bf49..28a14e8 100644
--- a/backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitVehicleDto {
   ait_id: string;
   vehicle_snapshot_id: string;
diff --git a/backend/domains/inf/ait/src/dto/create-ait.dto.ts b/backend/domains/inf/ait/src/dto/create-ait.dto.ts
index 7561c73..aa20709 100644
--- a/backend/domains/inf/ait/src/dto/create-ait.dto.ts
+++ b/backend/domains/inf/ait/src/dto/create-ait.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface CreateAitDto {
   traffic_agency_id: string;
   executing_agency_id?: string | null;
@@ -27,6 +27,8 @@ export interface CreateAitDto {
   mandatory_observation?: string | null;
   complementary_observation?: string | null;
   current_status?: string;
+  version?: number;
+  speed_measurement_id?: string | null;
   content_hash?: string | null;
   system_signature_ref?: string | null;
   receipt_protocol?: string | null;
diff --git a/backend/domains/inf/ait/src/entities/ait-correction.entity.ts b/backend/domains/inf/ait/src/entities/ait-correction.entity.ts
index aa3fd59..f10a772 100644
--- a/backend/domains/inf/ait/src/entities/ait-correction.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-correction.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitCorrection {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait-person.entity.ts b/backend/domains/inf/ait/src/entities/ait-person.entity.ts
index 01c80a2..c6eacc0 100644
--- a/backend/domains/inf/ait/src/entities/ait-person.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-person.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitPerson {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait-print-event.entity.ts b/backend/domains/inf/ait/src/entities/ait-print-event.entity.ts
index aa1b16f..b9171dc 100644
--- a/backend/domains/inf/ait/src/entities/ait-print-event.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-print-event.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitPrintEvent {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait-signature.entity.ts b/backend/domains/inf/ait/src/entities/ait-signature.entity.ts
index 1c1a773..7b632fb 100644
--- a/backend/domains/inf/ait/src/entities/ait-signature.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-signature.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitSignature {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait-status-history.entity.ts b/backend/domains/inf/ait/src/entities/ait-status-history.entity.ts
index 9601743..e01077b 100644
--- a/backend/domains/inf/ait/src/entities/ait-status-history.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-status-history.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitStatusHistory {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts b/backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts
index 5a89c9d..5c8a4bf 100644
--- a/backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface AitVehicle {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/ait/src/entities/ait.entity.ts b/backend/domains/inf/ait/src/entities/ait.entity.ts
index 003c070..0b24130 100644
--- a/backend/domains/inf/ait/src/entities/ait.entity.ts
+++ b/backend/domains/inf/ait/src/entities/ait.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export interface Ait {
   id: string;
   tenant_id: string;
@@ -29,6 +29,8 @@ export interface Ait {
   mandatory_observation?: string | null;
   complementary_observation?: string | null;
   current_status: string;
+  version: number;
+  speed_measurement_id?: string | null;
   content_hash?: string | null;
   system_signature_ref?: string | null;
   receipt_protocol?: string | null;
diff --git a/backend/domains/inf/ait/src/index.ts b/backend/domains/inf/ait/src/index.ts
index d24f76c..ec45d56 100644
--- a/backend/domains/inf/ait/src/index.ts
+++ b/backend/domains/inf/ait/src/index.ts
@@ -1,9 +1,19 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 export * from './controllers/ait.controller.js';
 export * from './dto/create-ait.dto.js';
 export * from './entities/ait.entity.js';
 export * from './repositories/ait.repository.js';
 export * from './services/ait.service.js';
+export * from './controllers/ait-cancel-request.controller.js';
+export * from './dto/create-ait-cancel-request.dto.js';
+export * from './entities/ait-cancel-request.entity.js';
+export * from './repositories/ait-cancel-request.repository.js';
+export * from './services/ait-cancel-request.service.js';
+export * from './controllers/ait-cancel-request-event.controller.js';
+export * from './dto/create-ait-cancel-request-event.dto.js';
+export * from './entities/ait-cancel-request-event.entity.js';
+export * from './repositories/ait-cancel-request-event.repository.js';
+export * from './services/ait-cancel-request-event.service.js';
 export * from './controllers/ait-vehicle.controller.js';
 export * from './dto/create-ait-vehicle.dto.js';
 export * from './entities/ait-vehicle.entity.js';
diff --git a/backend/domains/inf/ait/src/repositories/ait-correction.repository.ts b/backend/domains/inf/ait/src/repositories/ait-correction.repository.ts
index 96d65ac..faedf42 100644
--- a/backend/domains/inf/ait/src/repositories/ait-correction.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-correction.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait-person.repository.ts b/backend/domains/inf/ait/src/repositories/ait-person.repository.ts
index bb423fc..e6f7662 100644
--- a/backend/domains/inf/ait/src/repositories/ait-person.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-person.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts b/backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts
index 7e37b53..d8b64e3 100644
--- a/backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait-signature.repository.ts b/backend/domains/inf/ait/src/repositories/ait-signature.repository.ts
index 7bec1cf..352a236 100644
--- a/backend/domains/inf/ait/src/repositories/ait-signature.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-signature.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts b/backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts
index a1a71d2..5377550 100644
--- a/backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts b/backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts
index 5410a25..2960764 100644
--- a/backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/ait/src/repositories/ait.repository.ts b/backend/domains/inf/ait/src/repositories/ait.repository.ts
index 3256251..ab29692 100644
--- a/backend/domains/inf/ait/src/repositories/ait.repository.ts
+++ b/backend/domains/inf/ait/src/repositories/ait.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -40,6 +40,8 @@ const WRITABLE_FIELDS = new Set<string>([
   'mandatory_observation',
   'complementary_observation',
   'current_status',
+  'version',
+  'speed_measurement_id',
   'content_hash',
   'system_signature_ref',
   'receipt_protocol',
diff --git a/backend/domains/inf/ait/src/services/ait-correction.service.ts b/backend/domains/inf/ait/src/services/ait-correction.service.ts
index e83eea9..8ecc39f 100644
--- a/backend/domains/inf/ait/src/services/ait-correction.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-correction.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitCorrectionRepository } from '../repositories/ait-correction.repository.js';
 import type { AitCorrection } from '../entities/ait-correction.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait-person.service.ts b/backend/domains/inf/ait/src/services/ait-person.service.ts
index bfb8b9f..773f28d 100644
--- a/backend/domains/inf/ait/src/services/ait-person.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-person.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitPersonRepository } from '../repositories/ait-person.repository.js';
 import type { AitPerson } from '../entities/ait-person.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait-print-event.service.ts b/backend/domains/inf/ait/src/services/ait-print-event.service.ts
index a949075..2dd1382 100644
--- a/backend/domains/inf/ait/src/services/ait-print-event.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-print-event.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitPrintEventRepository } from '../repositories/ait-print-event.repository.js';
 import type { AitPrintEvent } from '../entities/ait-print-event.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait-signature.service.ts b/backend/domains/inf/ait/src/services/ait-signature.service.ts
index 9683081..dde5621 100644
--- a/backend/domains/inf/ait/src/services/ait-signature.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-signature.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitSignatureRepository } from '../repositories/ait-signature.repository.js';
 import type { AitSignature } from '../entities/ait-signature.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait-status-history.service.ts b/backend/domains/inf/ait/src/services/ait-status-history.service.ts
index 8b2cb0c..2ffe93d 100644
--- a/backend/domains/inf/ait/src/services/ait-status-history.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-status-history.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitStatusHistoryRepository } from '../repositories/ait-status-history.repository.js';
 import type { AitStatusHistory } from '../entities/ait-status-history.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait-vehicle.service.ts b/backend/domains/inf/ait/src/services/ait-vehicle.service.ts
index 7bab9f3..d04f97c 100644
--- a/backend/domains/inf/ait/src/services/ait-vehicle.service.ts
+++ b/backend/domains/inf/ait/src/services/ait-vehicle.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitVehicleRepository } from '../repositories/ait-vehicle.repository.js';
 import type { AitVehicle } from '../entities/ait-vehicle.entity.js';
diff --git a/backend/domains/inf/ait/src/services/ait.service.ts b/backend/domains/inf/ait/src/services/ait.service.ts
index 1c2acd4..002acfc 100644
--- a/backend/domains/inf/ait/src/services/ait.service.ts
+++ b/backend/domains/inf/ait/src/services/ait.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
 import { Injectable } from '@nestjs/common';
 import { AitRepository } from '../repositories/ait.repository.js';
 import type { Ait } from '../entities/ait.entity.js';
diff --git a/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts b/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
index 1cb84db..5dc6ae0 100644
--- a/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
+++ b/backend/domains/inf/ait/tests/e2e/ait-lifecycle.e2e.spec.ts
@@ -119,6 +119,7 @@ describe('AIT lifecycle', () => {
     const framing = await framings.create({
       catalog_id: catalog.id,
       framing_code: '74550',
+      approach_class: 'caso_1',
       description: 'Infraction framing',
       status: 'active',
     });
@@ -181,7 +182,7 @@ describe('AIT lifecycle', () => {
     await lifecycle.queueTransmission(draft.id, actorA);
     await lifecycle.receiveProtocol(draft.id, 'RENAINF-001', actorA);
     const accepted = await lifecycle.accept(draft.id, actorA);
-    expect(accepted.current_status).toBe('accepted');
+    expect(accepted.current_status).toBe('ACEITO');
     const history = await repositories.history.findAll();
     expect(
       history
@@ -189,11 +190,11 @@ describe('AIT lifecycle', () => {
         .map((item) => item.status),
     ).toEqual(
       expect.arrayContaining([
-        'draft',
-        'issued',
-        'pending_transmission',
-        'received',
-        'accepted',
+        'RASCUNHO_OFFLINE',
+        'FINALIZADO_LOCAL',
+        'ENFILEIRADO',
+        'RECEBIDO',
+        'ACEITO',
       ]),
     );
     await expect(lifecycle.createDraft(draftInput)).rejects.toMatchObject({
diff --git a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
index 995c6e9..fd5b210 100644
--- a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
+++ b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
@@ -37,15 +37,36 @@ describe('inf database contract', () => {
         group by tables.table_schema, tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity
         order by tables.table_name`,
     );
-    // Tenant tables: ait (9), normative (6), measures (9), alcohol (6), rait case/worklist/session (21),
+    // Tenant tables: ait (11), normative (7), measures (9), alcohol (6), rait case/worklist/session (21),
     // speed (3), infraction (3: infraction, infraction_timer, infraction_event — DDL 38) and
     // notification (3: notice, notice_acknowledgement, notice_delivery_attempt — DDL 59) —
     // 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`), which must
     // never carry tenant RLS and must be the only unprotected tables in the schema.
     const tenantTables = result.rows.filter((row) => row.has_tenant_id);
     const referenceTables = result.rows.filter((row) => !row.has_tenant_id);
-    expect(tenantTables).toHaveLength(58);
-    expect(referenceTables).toHaveLength(9);
+    expect(tenantTables).toHaveLength(62);
+    expect(referenceTables).toHaveLength(10);
+    const ctg2Tables = new Set([
+      'ait_cancel_request',
+      'ait_cancel_request_event',
+      'normative_metrological_table',
+      'signature_policy',
+    ]);
+    expect(
+      result.rows.filter((row) => ctg2Tables.has(row.table_name)),
+    ).toHaveLength(4);
+    expect(
+      result.rows
+        .filter((row) => ctg2Tables.has(row.table_name))
+        .every(
+          (row) =>
+            row.has_tenant_id &&
+            row.relrowsecurity &&
+            row.relforcerowsecurity &&
+            row.policy_count === '1' &&
+            row.trigger_count === '1',
+        ),
+    ).toBe(true);
     expect(
       tenantTables.every(
         (row) =>
diff --git a/backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts b/backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts
index e79c8ad..000ccca 100644
--- a/backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts
+++ b/backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts
@@ -81,6 +81,7 @@ export class AlcoholLifecycleService {
     id: string,
     dto: {
       refused_at?: string;
+      kind?: 'refusal' | 'technical_impossibility';
       refusal_description: string;
       witness_person_id?: string;
       evidence_id?: string;
@@ -92,6 +93,7 @@ export class AlcoholLifecycleService {
         {
           procedure_id: id,
           refused_at: dto.refused_at ?? new Date().toISOString(),
+          kind: dto.kind ?? 'refusal',
           refusal_description: dto.refusal_description,
           witness_person_id: dto.witness_person_id ?? null,
           evidence_id: dto.evidence_id ?? null,
diff --git a/backend/domains/inf/alcohol/src/alcohol.module.ts b/backend/domains/inf/alcohol/src/alcohol.module.ts
index 308d3f7..902e652 100644
--- a/backend/domains/inf/alcohol/src/alcohol.module.ts
+++ b/backend/domains/inf/alcohol/src/alcohol.module.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Module } from '@nestjs/common';
 import { AlcoholProcedureController } from './controllers/alcohol-procedure.controller.js';
 import { AlcoholProcedureService } from './services/alcohol-procedure.service.js';
diff --git a/backend/domains/inf/alcohol/src/controllers/alcohol-forwarding.controller.ts b/backend/domains/inf/alcohol/src/controllers/alcohol-forwarding.controller.ts
index 14c7e69..8a64ce9 100644
--- a/backend/domains/inf/alcohol/src/controllers/alcohol-forwarding.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/alcohol-forwarding.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/controllers/alcohol-procedure.controller.ts b/backend/domains/inf/alcohol/src/controllers/alcohol-procedure.controller.ts
index 2374857..c7d3eef 100644
--- a/backend/domains/inf/alcohol/src/controllers/alcohol-procedure.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/alcohol-procedure.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/controllers/alcohol-refusal.controller.ts b/backend/domains/inf/alcohol/src/controllers/alcohol-refusal.controller.ts
index 8ceecc7..3a51e0d 100644
--- a/backend/domains/inf/alcohol/src/controllers/alcohol-refusal.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/alcohol-refusal.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/controllers/alcohol-test.controller.ts b/backend/domains/inf/alcohol/src/controllers/alcohol-test.controller.ts
index 49acf43..a0f9840 100644
--- a/backend/domains/inf/alcohol/src/controllers/alcohol-test.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/alcohol-test.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/controllers/breathalyzer.controller.ts b/backend/domains/inf/alcohol/src/controllers/breathalyzer.controller.ts
index 46fd4a4..6a941f5 100644
--- a/backend/domains/inf/alcohol/src/controllers/breathalyzer.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/breathalyzer.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/controllers/psychomotor-sign.controller.ts b/backend/domains/inf/alcohol/src/controllers/psychomotor-sign.controller.ts
index 52627f3..2bfd120 100644
--- a/backend/domains/inf/alcohol/src/controllers/psychomotor-sign.controller.ts
+++ b/backend/domains/inf/alcohol/src/controllers/psychomotor-sign.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/alcohol/src/dto/create-alcohol-forwarding.dto.ts b/backend/domains/inf/alcohol/src/dto/create-alcohol-forwarding.dto.ts
index 983ccce..258186e 100644
--- a/backend/domains/inf/alcohol/src/dto/create-alcohol-forwarding.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-alcohol-forwarding.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreateAlcoholForwardingDto {
   procedure_id: string;
   forwarding_type: string;
diff --git a/backend/domains/inf/alcohol/src/dto/create-alcohol-procedure.dto.ts b/backend/domains/inf/alcohol/src/dto/create-alcohol-procedure.dto.ts
index 6e72fa7..c6367c1 100644
--- a/backend/domains/inf/alcohol/src/dto/create-alcohol-procedure.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-alcohol-procedure.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreateAlcoholProcedureDto {
   traffic_agency_id: string;
   ait_id?: string | null;
@@ -13,5 +13,18 @@ export interface CreateAlcoholProcedureDto {
   outcome: string;
   status?: string;
   notes?: string | null;
+  ait_local_id?: string | null;
+  sign_catalog_id?: string | null;
+  sign_catalog_version?: string | null;
+  driver_name?: string | null;
+  driver_document?: string | null;
+  vehicle_plate?: string | null;
+  vehicle_make?: string | null;
+  refused_procedures?: boolean | null;
+  driver_statement_json?: Record<string, unknown> | null;
+  witnesses_json?: Record<string, unknown> | null;
+  source_local_id?: string | null;
+  source_idempotency_key?: string | null;
+  source_payload_hash?: string | null;
   location_geom?: unknown | null;
 }
diff --git a/backend/domains/inf/alcohol/src/dto/create-alcohol-refusal.dto.ts b/backend/domains/inf/alcohol/src/dto/create-alcohol-refusal.dto.ts
index c22335e..ca176a2 100644
--- a/backend/domains/inf/alcohol/src/dto/create-alcohol-refusal.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-alcohol-refusal.dto.ts
@@ -1,7 +1,8 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreateAlcoholRefusalDto {
   procedure_id: string;
   refused_at: string;
+  kind: string;
   refusal_description: string;
   witness_person_id?: string | null;
   evidence_id?: string | null;
diff --git a/backend/domains/inf/alcohol/src/dto/create-alcohol-test.dto.ts b/backend/domains/inf/alcohol/src/dto/create-alcohol-test.dto.ts
index f1b52db..5e81c1a 100644
--- a/backend/domains/inf/alcohol/src/dto/create-alcohol-test.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-alcohol-test.dto.ts
@@ -1,10 +1,12 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreateAlcoholTestDto {
   procedure_id: string;
   breathalyzer_id?: string | null;
   test_number?: string | null;
   tested_at: string;
   result_mg_l?: number | null;
+  considered_mg_l?: number | null;
+  max_error_mg_l?: number | null;
   counterproof?: boolean;
   result_image_evidence_id?: string | null;
   status?: string;
diff --git a/backend/domains/inf/alcohol/src/dto/create-breathalyzer.dto.ts b/backend/domains/inf/alcohol/src/dto/create-breathalyzer.dto.ts
index 4bc713c..d668d53 100644
--- a/backend/domains/inf/alcohol/src/dto/create-breathalyzer.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-breathalyzer.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreateBreathalyzerDto {
   traffic_agency_id: string;
   serial_number: string;
diff --git a/backend/domains/inf/alcohol/src/dto/create-psychomotor-sign.dto.ts b/backend/domains/inf/alcohol/src/dto/create-psychomotor-sign.dto.ts
index aff4cca..4a69e77 100644
--- a/backend/domains/inf/alcohol/src/dto/create-psychomotor-sign.dto.ts
+++ b/backend/domains/inf/alcohol/src/dto/create-psychomotor-sign.dto.ts
@@ -1,7 +1,10 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface CreatePsychomotorSignDto {
   procedure_id: string;
   sign_code: string;
   description: string;
   observed?: boolean;
+  sign_group?: string | null;
+  sign_status?: string | null;
+  method?: string | null;
 }
diff --git a/backend/domains/inf/alcohol/src/entities/alcohol-forwarding.entity.ts b/backend/domains/inf/alcohol/src/entities/alcohol-forwarding.entity.ts
index 67dfabd..d8713f7 100644
--- a/backend/domains/inf/alcohol/src/entities/alcohol-forwarding.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/alcohol-forwarding.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface AlcoholForwarding {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/alcohol/src/entities/alcohol-procedure.entity.ts b/backend/domains/inf/alcohol/src/entities/alcohol-procedure.entity.ts
index 8aaefaa..d719c60 100644
--- a/backend/domains/inf/alcohol/src/entities/alcohol-procedure.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/alcohol-procedure.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface AlcoholProcedure {
   id: string;
   tenant_id: string;
@@ -15,6 +15,19 @@ export interface AlcoholProcedure {
   outcome: string;
   status: string;
   notes?: string | null;
+  ait_local_id?: string | null;
+  sign_catalog_id?: string | null;
+  sign_catalog_version?: string | null;
+  driver_name?: string | null;
+  driver_document?: string | null;
+  vehicle_plate?: string | null;
+  vehicle_make?: string | null;
+  refused_procedures?: boolean | null;
+  driver_statement_json?: Record<string, unknown> | null;
+  witnesses_json?: Record<string, unknown> | null;
+  source_local_id?: string | null;
+  source_idempotency_key?: string | null;
+  source_payload_hash?: string | null;
   location_geom?: unknown | null;
   created_at: string;
   updated_at?: string | null;
diff --git a/backend/domains/inf/alcohol/src/entities/alcohol-refusal.entity.ts b/backend/domains/inf/alcohol/src/entities/alcohol-refusal.entity.ts
index f00aaad..7a77ad9 100644
--- a/backend/domains/inf/alcohol/src/entities/alcohol-refusal.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/alcohol-refusal.entity.ts
@@ -1,9 +1,10 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface AlcoholRefusal {
   id: string;
   tenant_id: string;
   procedure_id: string;
   refused_at: string;
+  kind: string;
   refusal_description: string;
   witness_person_id?: string | null;
   evidence_id?: string | null;
diff --git a/backend/domains/inf/alcohol/src/entities/alcohol-test.entity.ts b/backend/domains/inf/alcohol/src/entities/alcohol-test.entity.ts
index c01593f..5ba70c7 100644
--- a/backend/domains/inf/alcohol/src/entities/alcohol-test.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/alcohol-test.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface AlcoholTest {
   id: string;
   tenant_id: string;
@@ -7,6 +7,8 @@ export interface AlcoholTest {
   test_number?: string | null;
   tested_at: string;
   result_mg_l?: number | null;
+  considered_mg_l?: number | null;
+  max_error_mg_l?: number | null;
   counterproof: boolean;
   result_image_evidence_id?: string | null;
   status: string;
diff --git a/backend/domains/inf/alcohol/src/entities/breathalyzer.entity.ts b/backend/domains/inf/alcohol/src/entities/breathalyzer.entity.ts
index 30c3904..09cf234 100644
--- a/backend/domains/inf/alcohol/src/entities/breathalyzer.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/breathalyzer.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface Breathalyzer {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/alcohol/src/entities/psychomotor-sign.entity.ts b/backend/domains/inf/alcohol/src/entities/psychomotor-sign.entity.ts
index 4eae1d0..0aab316 100644
--- a/backend/domains/inf/alcohol/src/entities/psychomotor-sign.entity.ts
+++ b/backend/domains/inf/alcohol/src/entities/psychomotor-sign.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export interface PsychomotorSign {
   id: string;
   tenant_id: string;
@@ -6,6 +6,9 @@ export interface PsychomotorSign {
   sign_code: string;
   description: string;
   observed: boolean;
+  sign_group?: string | null;
+  sign_status?: string | null;
+  method?: string | null;
   created_at: string;
   updated_at?: string | null;
 }
diff --git a/backend/domains/inf/alcohol/src/index.ts b/backend/domains/inf/alcohol/src/index.ts
index 96e07c6..6f03a3c 100644
--- a/backend/domains/inf/alcohol/src/index.ts
+++ b/backend/domains/inf/alcohol/src/index.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 export * from './controllers/alcohol-procedure.controller.js';
 export * from './dto/create-alcohol-procedure.dto.js';
 export * from './entities/alcohol-procedure.entity.js';
diff --git a/backend/domains/inf/alcohol/src/repositories/alcohol-forwarding.repository.ts b/backend/domains/inf/alcohol/src/repositories/alcohol-forwarding.repository.ts
index 44ab854..93f6bc2 100644
--- a/backend/domains/inf/alcohol/src/repositories/alcohol-forwarding.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/alcohol-forwarding.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/alcohol/src/repositories/alcohol-procedure.repository.ts b/backend/domains/inf/alcohol/src/repositories/alcohol-procedure.repository.ts
index e1b2c80..240e719 100644
--- a/backend/domains/inf/alcohol/src/repositories/alcohol-procedure.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/alcohol-procedure.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -26,6 +26,19 @@ const WRITABLE_FIELDS = new Set<string>([
   'outcome',
   'status',
   'notes',
+  'ait_local_id',
+  'sign_catalog_id',
+  'sign_catalog_version',
+  'driver_name',
+  'driver_document',
+  'vehicle_plate',
+  'vehicle_make',
+  'refused_procedures',
+  'driver_statement_json',
+  'witnesses_json',
+  'source_local_id',
+  'source_idempotency_key',
+  'source_payload_hash',
   'location_geom',
 ]);

diff --git a/backend/domains/inf/alcohol/src/repositories/alcohol-refusal.repository.ts b/backend/domains/inf/alcohol/src/repositories/alcohol-refusal.repository.ts
index 7482c85..80f9b50 100644
--- a/backend/domains/inf/alcohol/src/repositories/alcohol-refusal.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/alcohol-refusal.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -15,6 +15,7 @@ type SqlTransaction = Transaction & {
 const WRITABLE_FIELDS = new Set<string>([
   'procedure_id',
   'refused_at',
+  'kind',
   'refusal_description',
   'witness_person_id',
   'evidence_id',
diff --git a/backend/domains/inf/alcohol/src/repositories/alcohol-test.repository.ts b/backend/domains/inf/alcohol/src/repositories/alcohol-test.repository.ts
index 95f386b..3f5952b 100644
--- a/backend/domains/inf/alcohol/src/repositories/alcohol-test.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/alcohol-test.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -18,6 +18,8 @@ const WRITABLE_FIELDS = new Set<string>([
   'test_number',
   'tested_at',
   'result_mg_l',
+  'considered_mg_l',
+  'max_error_mg_l',
   'counterproof',
   'result_image_evidence_id',
   'status',
diff --git a/backend/domains/inf/alcohol/src/repositories/breathalyzer.repository.ts b/backend/domains/inf/alcohol/src/repositories/breathalyzer.repository.ts
index 01e08e4..2dbee17 100644
--- a/backend/domains/inf/alcohol/src/repositories/breathalyzer.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/breathalyzer.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/alcohol/src/repositories/psychomotor-sign.repository.ts b/backend/domains/inf/alcohol/src/repositories/psychomotor-sign.repository.ts
index f1123dd..80d6e3e 100644
--- a/backend/domains/inf/alcohol/src/repositories/psychomotor-sign.repository.ts
+++ b/backend/domains/inf/alcohol/src/repositories/psychomotor-sign.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -17,6 +17,9 @@ const WRITABLE_FIELDS = new Set<string>([
   'sign_code',
   'description',
   'observed',
+  'sign_group',
+  'sign_status',
+  'method',
 ]);

 /** SQL-only repository. Tenant identity is injected by the kernel trigger. */
diff --git a/backend/domains/inf/alcohol/src/services/alcohol-forwarding.service.ts b/backend/domains/inf/alcohol/src/services/alcohol-forwarding.service.ts
index 488288e..105fcce 100644
--- a/backend/domains/inf/alcohol/src/services/alcohol-forwarding.service.ts
+++ b/backend/domains/inf/alcohol/src/services/alcohol-forwarding.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { AlcoholForwardingRepository } from '../repositories/alcohol-forwarding.repository.js';
 import type { AlcoholForwarding } from '../entities/alcohol-forwarding.entity.js';
diff --git a/backend/domains/inf/alcohol/src/services/alcohol-procedure.service.ts b/backend/domains/inf/alcohol/src/services/alcohol-procedure.service.ts
index e12531f..b3475a8 100644
--- a/backend/domains/inf/alcohol/src/services/alcohol-procedure.service.ts
+++ b/backend/domains/inf/alcohol/src/services/alcohol-procedure.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { AlcoholProcedureRepository } from '../repositories/alcohol-procedure.repository.js';
 import type { AlcoholProcedure } from '../entities/alcohol-procedure.entity.js';
diff --git a/backend/domains/inf/alcohol/src/services/alcohol-refusal.service.ts b/backend/domains/inf/alcohol/src/services/alcohol-refusal.service.ts
index 41d3556..a623f0f 100644
--- a/backend/domains/inf/alcohol/src/services/alcohol-refusal.service.ts
+++ b/backend/domains/inf/alcohol/src/services/alcohol-refusal.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { AlcoholRefusalRepository } from '../repositories/alcohol-refusal.repository.js';
 import type { AlcoholRefusal } from '../entities/alcohol-refusal.entity.js';
diff --git a/backend/domains/inf/alcohol/src/services/alcohol-test.service.ts b/backend/domains/inf/alcohol/src/services/alcohol-test.service.ts
index be3ce47..73a5876 100644
--- a/backend/domains/inf/alcohol/src/services/alcohol-test.service.ts
+++ b/backend/domains/inf/alcohol/src/services/alcohol-test.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { AlcoholTestRepository } from '../repositories/alcohol-test.repository.js';
 import type { AlcoholTest } from '../entities/alcohol-test.entity.js';
diff --git a/backend/domains/inf/alcohol/src/services/breathalyzer.service.ts b/backend/domains/inf/alcohol/src/services/breathalyzer.service.ts
index 6c7a51d..7fdaddf 100644
--- a/backend/domains/inf/alcohol/src/services/breathalyzer.service.ts
+++ b/backend/domains/inf/alcohol/src/services/breathalyzer.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { BreathalyzerRepository } from '../repositories/breathalyzer.repository.js';
 import type { Breathalyzer } from '../entities/breathalyzer.entity.js';
diff --git a/backend/domains/inf/alcohol/src/services/psychomotor-sign.service.ts b/backend/domains/inf/alcohol/src/services/psychomotor-sign.service.ts
index 4d6da02..0ced3a2 100644
--- a/backend/domains/inf/alcohol/src/services/psychomotor-sign.service.ts
+++ b/backend/domains/inf/alcohol/src/services/psychomotor-sign.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
+// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:45e391981e5397909a7272ee2f1be26ca8d1c9a23cc6bac7ba85db7ea4c87382
 import { Injectable } from '@nestjs/common';
 import { PsychomotorSignRepository } from '../repositories/psychomotor-sign.repository.js';
 import type { PsychomotorSign } from '../entities/psychomotor-sign.entity.js';
diff --git a/backend/domains/inf/measures/src/controllers/administrative-measure.controller.ts b/backend/domains/inf/measures/src/controllers/administrative-measure.controller.ts
index 7db572f..3b7beab 100644
--- a/backend/domains/inf/measures/src/controllers/administrative-measure.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/administrative-measure.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/administrative-term.controller.ts b/backend/domains/inf/measures/src/controllers/administrative-term.controller.ts
index 7a36666..5218084 100644
--- a/backend/domains/inf/measures/src/controllers/administrative-term.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/administrative-term.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/measure-removal.controller.ts b/backend/domains/inf/measures/src/controllers/measure-removal.controller.ts
index 875e403..5479f8b 100644
--- a/backend/domains/inf/measures/src/controllers/measure-removal.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/measure-removal.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/measure-retention.controller.ts b/backend/domains/inf/measures/src/controllers/measure-retention.controller.ts
index 6ba2042..f7fc37c 100644
--- a/backend/domains/inf/measures/src/controllers/measure-retention.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/measure-retention.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/measure-status-history.controller.ts b/backend/domains/inf/measures/src/controllers/measure-status-history.controller.ts
index a0066c4..bd558b1 100644
--- a/backend/domains/inf/measures/src/controllers/measure-status-history.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/measure-status-history.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/measure-type.controller.ts b/backend/domains/inf/measures/src/controllers/measure-type.controller.ts
index 72a2168..7d1a88a 100644
--- a/backend/domains/inf/measures/src/controllers/measure-type.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/measure-type.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/tow-provider.controller.ts b/backend/domains/inf/measures/src/controllers/tow-provider.controller.ts
index f926f3d..2f64508 100644
--- a/backend/domains/inf/measures/src/controllers/tow-provider.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/tow-provider.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/vehicle-inventory.controller.ts b/backend/domains/inf/measures/src/controllers/vehicle-inventory.controller.ts
index eec51d4..efd6641 100644
--- a/backend/domains/inf/measures/src/controllers/vehicle-inventory.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/vehicle-inventory.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/controllers/yard.controller.ts b/backend/domains/inf/measures/src/controllers/yard.controller.ts
index 5565f63..83fd122 100644
--- a/backend/domains/inf/measures/src/controllers/yard.controller.ts
+++ b/backend/domains/inf/measures/src/controllers/yard.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/measures/src/dto/create-administrative-measure.dto.ts b/backend/domains/inf/measures/src/dto/create-administrative-measure.dto.ts
index 4daf238..10547c7 100644
--- a/backend/domains/inf/measures/src/dto/create-administrative-measure.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-administrative-measure.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateAdministrativeMeasureDto {
   traffic_agency_id: string;
   measure_type_id: string;
diff --git a/backend/domains/inf/measures/src/dto/create-administrative-term.dto.ts b/backend/domains/inf/measures/src/dto/create-administrative-term.dto.ts
index 5b86ab4..0db00d0 100644
--- a/backend/domains/inf/measures/src/dto/create-administrative-term.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-administrative-term.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateAdministrativeTermDto {
   measure_id: string;
   term_type: string;
@@ -7,5 +7,12 @@ export interface CreateAdministrativeTermDto {
   file_evidence_id?: string | null;
   issued_at: string;
   signed_by_person_id?: string | null;
+  signer_name?: string | null;
+  withdrawal_deadline_at?: string | null;
+  ctb_deadline_at?: string | null;
+  field_details_json?: Record<string, unknown> | null;
+  source_local_id?: string | null;
+  source_idempotency_key?: string | null;
+  source_payload_hash?: string | null;
   status?: string;
 }
diff --git a/backend/domains/inf/measures/src/dto/create-measure-removal.dto.ts b/backend/domains/inf/measures/src/dto/create-measure-removal.dto.ts
index de8a8fe..e3c3c46 100644
--- a/backend/domains/inf/measures/src/dto/create-measure-removal.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-measure-removal.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateMeasureRemovalDto {
   measure_id: string;
   vehicle_snapshot_id: string;
@@ -7,5 +7,7 @@ export interface CreateMeasureRemovalDto {
   requested_at?: string | null;
   tow_arrived_at?: string | null;
   delivered_at?: string | null;
+  regularization_deadline_at?: string | null;
+  regularization_deadline_days?: number | null;
   destination_description?: string | null;
 }
diff --git a/backend/domains/inf/measures/src/dto/create-measure-retention.dto.ts b/backend/domains/inf/measures/src/dto/create-measure-retention.dto.ts
index 7b5b09f..18e0760 100644
--- a/backend/domains/inf/measures/src/dto/create-measure-retention.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-measure-retention.dto.ts
@@ -1,8 +1,10 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateMeasureRetentionDto {
   measure_id: string;
   vehicle_snapshot_id: string;
   retention_reason: string;
+  regularization_deadline_at?: string | null;
+  regularization_deadline_days?: number | null;
   regularized_at?: string | null;
   released_at?: string | null;
   release_user_ref?: string | null;
diff --git a/backend/domains/inf/measures/src/dto/create-measure-status-history.dto.ts b/backend/domains/inf/measures/src/dto/create-measure-status-history.dto.ts
index e86c335..ecaad7b 100644
--- a/backend/domains/inf/measures/src/dto/create-measure-status-history.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-measure-status-history.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateMeasureStatusHistoryDto {
   measure_id: string;
   status: string;
diff --git a/backend/domains/inf/measures/src/dto/create-measure-type.dto.ts b/backend/domains/inf/measures/src/dto/create-measure-type.dto.ts
index 53a2e45..20fc123 100644
--- a/backend/domains/inf/measures/src/dto/create-measure-type.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-measure-type.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateMeasureTypeDto {
   code: string;
   name: string;
diff --git a/backend/domains/inf/measures/src/dto/create-tow-provider.dto.ts b/backend/domains/inf/measures/src/dto/create-tow-provider.dto.ts
index 3a6d89b..f4d75ac 100644
--- a/backend/domains/inf/measures/src/dto/create-tow-provider.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-tow-provider.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateTowProviderDto {
   traffic_agency_id: string;
   name: string;
diff --git a/backend/domains/inf/measures/src/dto/create-vehicle-inventory.dto.ts b/backend/domains/inf/measures/src/dto/create-vehicle-inventory.dto.ts
index 8ed11dd..4bf2883 100644
--- a/backend/domains/inf/measures/src/dto/create-vehicle-inventory.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-vehicle-inventory.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateVehicleInventoryDto {
   measure_id: string;
   vehicle_snapshot_id: string;
diff --git a/backend/domains/inf/measures/src/dto/create-yard.dto.ts b/backend/domains/inf/measures/src/dto/create-yard.dto.ts
index 7783046..476ba62 100644
--- a/backend/domains/inf/measures/src/dto/create-yard.dto.ts
+++ b/backend/domains/inf/measures/src/dto/create-yard.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface CreateYardDto {
   traffic_agency_id: string;
   name: string;
diff --git a/backend/domains/inf/measures/src/entities/administrative-measure.entity.ts b/backend/domains/inf/measures/src/entities/administrative-measure.entity.ts
index 9b0d848..3207eee 100644
--- a/backend/domains/inf/measures/src/entities/administrative-measure.entity.ts
+++ b/backend/domains/inf/measures/src/entities/administrative-measure.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface AdministrativeMeasure {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/entities/administrative-term.entity.ts b/backend/domains/inf/measures/src/entities/administrative-term.entity.ts
index 039fceb..d771b07 100644
--- a/backend/domains/inf/measures/src/entities/administrative-term.entity.ts
+++ b/backend/domains/inf/measures/src/entities/administrative-term.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface AdministrativeTerm {
   id: string;
   tenant_id: string;
@@ -9,6 +9,13 @@ export interface AdministrativeTerm {
   file_evidence_id?: string | null;
   issued_at: string;
   signed_by_person_id?: string | null;
+  signer_name?: string | null;
+  withdrawal_deadline_at?: string | null;
+  ctb_deadline_at?: string | null;
+  field_details_json?: Record<string, unknown> | null;
+  source_local_id?: string | null;
+  source_idempotency_key?: string | null;
+  source_payload_hash?: string | null;
   status: string;
   created_at: string;
   updated_at?: string | null;
diff --git a/backend/domains/inf/measures/src/entities/measure-removal.entity.ts b/backend/domains/inf/measures/src/entities/measure-removal.entity.ts
index 5423043..8d4aabf 100644
--- a/backend/domains/inf/measures/src/entities/measure-removal.entity.ts
+++ b/backend/domains/inf/measures/src/entities/measure-removal.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface MeasureRemoval {
   id: string;
   tenant_id: string;
@@ -9,6 +9,8 @@ export interface MeasureRemoval {
   requested_at?: string | null;
   tow_arrived_at?: string | null;
   delivered_at?: string | null;
+  regularization_deadline_at?: string | null;
+  regularization_deadline_days?: number | null;
   destination_description?: string | null;
   created_at: string;
   updated_at?: string | null;
diff --git a/backend/domains/inf/measures/src/entities/measure-retention.entity.ts b/backend/domains/inf/measures/src/entities/measure-retention.entity.ts
index 8409bc5..32038a8 100644
--- a/backend/domains/inf/measures/src/entities/measure-retention.entity.ts
+++ b/backend/domains/inf/measures/src/entities/measure-retention.entity.ts
@@ -1,10 +1,12 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface MeasureRetention {
   id: string;
   tenant_id: string;
   measure_id: string;
   vehicle_snapshot_id: string;
   retention_reason: string;
+  regularization_deadline_at?: string | null;
+  regularization_deadline_days?: number | null;
   regularized_at?: string | null;
   released_at?: string | null;
   release_user_ref?: string | null;
diff --git a/backend/domains/inf/measures/src/entities/measure-status-history.entity.ts b/backend/domains/inf/measures/src/entities/measure-status-history.entity.ts
index dcf88c7..5918d83 100644
--- a/backend/domains/inf/measures/src/entities/measure-status-history.entity.ts
+++ b/backend/domains/inf/measures/src/entities/measure-status-history.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface MeasureStatusHistory {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/entities/measure-type.entity.ts b/backend/domains/inf/measures/src/entities/measure-type.entity.ts
index 64f9e96..7935831 100644
--- a/backend/domains/inf/measures/src/entities/measure-type.entity.ts
+++ b/backend/domains/inf/measures/src/entities/measure-type.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface MeasureType {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/entities/tow-provider.entity.ts b/backend/domains/inf/measures/src/entities/tow-provider.entity.ts
index b013f0a..b4cdb71 100644
--- a/backend/domains/inf/measures/src/entities/tow-provider.entity.ts
+++ b/backend/domains/inf/measures/src/entities/tow-provider.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface TowProvider {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/entities/vehicle-inventory.entity.ts b/backend/domains/inf/measures/src/entities/vehicle-inventory.entity.ts
index ca7f344..b6bb9e1 100644
--- a/backend/domains/inf/measures/src/entities/vehicle-inventory.entity.ts
+++ b/backend/domains/inf/measures/src/entities/vehicle-inventory.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface VehicleInventory {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/entities/yard.entity.ts b/backend/domains/inf/measures/src/entities/yard.entity.ts
index 90b65c3..8592958 100644
--- a/backend/domains/inf/measures/src/entities/yard.entity.ts
+++ b/backend/domains/inf/measures/src/entities/yard.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export interface Yard {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/measures/src/index.ts b/backend/domains/inf/measures/src/index.ts
index 1154a8a..b1f15e3 100644
--- a/backend/domains/inf/measures/src/index.ts
+++ b/backend/domains/inf/measures/src/index.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 export * from './controllers/measure-type.controller.js';
 export * from './dto/create-measure-type.dto.js';
 export * from './entities/measure-type.entity.js';
diff --git a/backend/domains/inf/measures/src/measures.module.ts b/backend/domains/inf/measures/src/measures.module.ts
index a217aa1..eacca88 100644
--- a/backend/domains/inf/measures/src/measures.module.ts
+++ b/backend/domains/inf/measures/src/measures.module.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Module } from '@nestjs/common';
 import { MeasureTypeController } from './controllers/measure-type.controller.js';
 import { MeasureTypeService } from './services/measure-type.service.js';
diff --git a/backend/domains/inf/measures/src/repositories/administrative-measure.repository.ts b/backend/domains/inf/measures/src/repositories/administrative-measure.repository.ts
index ca07653..83a11d9 100644
--- a/backend/domains/inf/measures/src/repositories/administrative-measure.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/administrative-measure.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/repositories/administrative-term.repository.ts b/backend/domains/inf/measures/src/repositories/administrative-term.repository.ts
index 60af0c6..47390b3 100644
--- a/backend/domains/inf/measures/src/repositories/administrative-term.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/administrative-term.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -20,6 +20,13 @@ const WRITABLE_FIELDS = new Set<string>([
   'file_evidence_id',
   'issued_at',
   'signed_by_person_id',
+  'signer_name',
+  'withdrawal_deadline_at',
+  'ctb_deadline_at',
+  'field_details_json',
+  'source_local_id',
+  'source_idempotency_key',
+  'source_payload_hash',
   'status',
 ]);

diff --git a/backend/domains/inf/measures/src/repositories/measure-removal.repository.ts b/backend/domains/inf/measures/src/repositories/measure-removal.repository.ts
index a9bfbc2..0fc40c0 100644
--- a/backend/domains/inf/measures/src/repositories/measure-removal.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/measure-removal.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -20,6 +20,8 @@ const WRITABLE_FIELDS = new Set<string>([
   'requested_at',
   'tow_arrived_at',
   'delivered_at',
+  'regularization_deadline_at',
+  'regularization_deadline_days',
   'destination_description',
 ]);

diff --git a/backend/domains/inf/measures/src/repositories/measure-retention.repository.ts b/backend/domains/inf/measures/src/repositories/measure-retention.repository.ts
index decc27e..d0cbcf1 100644
--- a/backend/domains/inf/measures/src/repositories/measure-retention.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/measure-retention.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -16,6 +16,8 @@ const WRITABLE_FIELDS = new Set<string>([
   'measure_id',
   'vehicle_snapshot_id',
   'retention_reason',
+  'regularization_deadline_at',
+  'regularization_deadline_days',
   'regularized_at',
   'released_at',
   'release_user_ref',
diff --git a/backend/domains/inf/measures/src/repositories/measure-status-history.repository.ts b/backend/domains/inf/measures/src/repositories/measure-status-history.repository.ts
index e65f571..d5e1fd7 100644
--- a/backend/domains/inf/measures/src/repositories/measure-status-history.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/measure-status-history.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/repositories/measure-type.repository.ts b/backend/domains/inf/measures/src/repositories/measure-type.repository.ts
index 2358dda..8719db6 100644
--- a/backend/domains/inf/measures/src/repositories/measure-type.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/measure-type.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/repositories/tow-provider.repository.ts b/backend/domains/inf/measures/src/repositories/tow-provider.repository.ts
index f814f6f..ffb8c0f 100644
--- a/backend/domains/inf/measures/src/repositories/tow-provider.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/tow-provider.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/repositories/vehicle-inventory.repository.ts b/backend/domains/inf/measures/src/repositories/vehicle-inventory.repository.ts
index cb67dea..5c32b03 100644
--- a/backend/domains/inf/measures/src/repositories/vehicle-inventory.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/vehicle-inventory.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/repositories/yard.repository.ts b/backend/domains/inf/measures/src/repositories/yard.repository.ts
index 4f57bd8..678ae88 100644
--- a/backend/domains/inf/measures/src/repositories/yard.repository.ts
+++ b/backend/domains/inf/measures/src/repositories/yard.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/measures/src/services/administrative-measure.service.ts b/backend/domains/inf/measures/src/services/administrative-measure.service.ts
index c46a9f3..539961c 100644
--- a/backend/domains/inf/measures/src/services/administrative-measure.service.ts
+++ b/backend/domains/inf/measures/src/services/administrative-measure.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { AdministrativeMeasureRepository } from '../repositories/administrative-measure.repository.js';
 import type { AdministrativeMeasure } from '../entities/administrative-measure.entity.js';
diff --git a/backend/domains/inf/measures/src/services/administrative-term.service.ts b/backend/domains/inf/measures/src/services/administrative-term.service.ts
index efd9044..110e66c 100644
--- a/backend/domains/inf/measures/src/services/administrative-term.service.ts
+++ b/backend/domains/inf/measures/src/services/administrative-term.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { AdministrativeTermRepository } from '../repositories/administrative-term.repository.js';
 import type { AdministrativeTerm } from '../entities/administrative-term.entity.js';
diff --git a/backend/domains/inf/measures/src/services/measure-removal.service.ts b/backend/domains/inf/measures/src/services/measure-removal.service.ts
index 0f6bd53..559ef69 100644
--- a/backend/domains/inf/measures/src/services/measure-removal.service.ts
+++ b/backend/domains/inf/measures/src/services/measure-removal.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { MeasureRemovalRepository } from '../repositories/measure-removal.repository.js';
 import type { MeasureRemoval } from '../entities/measure-removal.entity.js';
diff --git a/backend/domains/inf/measures/src/services/measure-retention.service.ts b/backend/domains/inf/measures/src/services/measure-retention.service.ts
index e64e319..997790e 100644
--- a/backend/domains/inf/measures/src/services/measure-retention.service.ts
+++ b/backend/domains/inf/measures/src/services/measure-retention.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { MeasureRetentionRepository } from '../repositories/measure-retention.repository.js';
 import type { MeasureRetention } from '../entities/measure-retention.entity.js';
diff --git a/backend/domains/inf/measures/src/services/measure-status-history.service.ts b/backend/domains/inf/measures/src/services/measure-status-history.service.ts
index 6473952..0eca57c 100644
--- a/backend/domains/inf/measures/src/services/measure-status-history.service.ts
+++ b/backend/domains/inf/measures/src/services/measure-status-history.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { MeasureStatusHistoryRepository } from '../repositories/measure-status-history.repository.js';
 import type { MeasureStatusHistory } from '../entities/measure-status-history.entity.js';
diff --git a/backend/domains/inf/measures/src/services/measure-type.service.ts b/backend/domains/inf/measures/src/services/measure-type.service.ts
index de93bd0..967c062 100644
--- a/backend/domains/inf/measures/src/services/measure-type.service.ts
+++ b/backend/domains/inf/measures/src/services/measure-type.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { MeasureTypeRepository } from '../repositories/measure-type.repository.js';
 import type { MeasureType } from '../entities/measure-type.entity.js';
diff --git a/backend/domains/inf/measures/src/services/tow-provider.service.ts b/backend/domains/inf/measures/src/services/tow-provider.service.ts
index c66e2a7..09310cb 100644
--- a/backend/domains/inf/measures/src/services/tow-provider.service.ts
+++ b/backend/domains/inf/measures/src/services/tow-provider.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { TowProviderRepository } from '../repositories/tow-provider.repository.js';
 import type { TowProvider } from '../entities/tow-provider.entity.js';
diff --git a/backend/domains/inf/measures/src/services/vehicle-inventory.service.ts b/backend/domains/inf/measures/src/services/vehicle-inventory.service.ts
index b0a5aa9..dbf465b 100644
--- a/backend/domains/inf/measures/src/services/vehicle-inventory.service.ts
+++ b/backend/domains/inf/measures/src/services/vehicle-inventory.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { VehicleInventoryRepository } from '../repositories/vehicle-inventory.repository.js';
 import type { VehicleInventory } from '../entities/vehicle-inventory.entity.js';
diff --git a/backend/domains/inf/measures/src/services/yard.service.ts b/backend/domains/inf/measures/src/services/yard.service.ts
index 303c857..228ccfb 100644
--- a/backend/domains/inf/measures/src/services/yard.service.ts
+++ b/backend/domains/inf/measures/src/services/yard.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
+// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:67025d150314a204fbf82d334249bb704ebfc76f2a313ffaca060e0c3f077212
 import { Injectable } from '@nestjs/common';
 import { YardRepository } from '../repositories/yard.repository.js';
 import type { Yard } from '../entities/yard.entity.js';
diff --git a/backend/domains/inf/normative/src/controllers/mobile-normative-package.controller.ts b/backend/domains/inf/normative/src/controllers/mobile-normative-package.controller.ts
index a43483c..833b5ba 100644
--- a/backend/domains/inf/normative/src/controllers/mobile-normative-package.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/mobile-normative-package.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/controllers/normative-agency-parameter.controller.ts b/backend/domains/inf/normative/src/controllers/normative-agency-parameter.controller.ts
index a5cdc40..4bba18b 100644
--- a/backend/domains/inf/normative/src/controllers/normative-agency-parameter.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/normative-agency-parameter.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts b/backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts
index 8c5a236..fd23a13 100644
--- a/backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts b/backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts
index a37ef92..4ee345c 100644
--- a/backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/controllers/normative-framing.controller.ts b/backend/domains/inf/normative/src/controllers/normative-framing.controller.ts
index 7cd6f2a..9a13a51 100644
--- a/backend/domains/inf/normative/src/controllers/normative-framing.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/normative-framing.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts b/backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts
index 69b1943..b809a7a 100644
--- a/backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts
+++ b/backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import {
   Body,
   Controller,
diff --git a/backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts b/backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts
index 674043c..5a112cb 100644
--- a/backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateMobileNormativePackageDto {
   traffic_agency_id: string;
   catalog_id: string;
diff --git a/backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts
index 1900f90..5f0d302 100644
--- a/backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateNormativeAgencyParameterDto {
   traffic_agency_id: string;
   key: string;
diff --git a/backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts
index d7205e5..fcccc96 100644
--- a/backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateNormativeCatalogDto {
   traffic_agency_id?: string | null;
   name: string;
diff --git a/backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts
index 1f50823..7ddd771 100644
--- a/backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts
@@ -1,7 +1,8 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateNormativeDocumentTemplateDto {
   traffic_agency_id: string;
-  document_type: string;
+  document_kind: string;
+  domain_scope?: string;
   name: string;
   version: string;
   template_body: string;
diff --git a/backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts
index c567afb..051efa0 100644
--- a/backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateNormativeFramingDto {
   catalog_id: string;
   framing_code: string;
@@ -8,7 +8,10 @@ export interface CreateNormativeFramingDto {
   severity?: string | null;
   penalty?: string | null;
   administrative_measure_summary?: string | null;
-  allows_no_approach?: boolean;
+  approach_class: string;
+  required_fields?: Record<string, unknown> | null;
+  required_instrument?: boolean;
+  points_label?: string | null;
   requires_observation?: boolean;
   requires_equipment?: boolean;
   status?: string;
diff --git a/backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts
index 308597a..361d436 100644
--- a/backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts
+++ b/backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface CreateNormativeValidationRuleDto {
   catalog_id: string;
   framing_id?: string | null;
diff --git a/backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts b/backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts
index db82d12..e4825d7 100644
--- a/backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts
+++ b/backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface MobileNormativePackage {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts b/backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts
index efd841a..50d8196 100644
--- a/backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts
+++ b/backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface NormativeAgencyParameter {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/normative/src/entities/normative-catalog.entity.ts b/backend/domains/inf/normative/src/entities/normative-catalog.entity.ts
index 39ab588..02afd77 100644
--- a/backend/domains/inf/normative/src/entities/normative-catalog.entity.ts
+++ b/backend/domains/inf/normative/src/entities/normative-catalog.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface NormativeCatalog {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/normative/src/entities/normative-document-template.entity.ts b/backend/domains/inf/normative/src/entities/normative-document-template.entity.ts
index 7da3cb8..1c5f44b 100644
--- a/backend/domains/inf/normative/src/entities/normative-document-template.entity.ts
+++ b/backend/domains/inf/normative/src/entities/normative-document-template.entity.ts
@@ -1,9 +1,10 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface NormativeDocumentTemplate {
   id: string;
   tenant_id: string;
   traffic_agency_id: string;
-  document_type: string;
+  document_kind: string;
+  domain_scope: string;
   name: string;
   version: string;
   template_body: string;
diff --git a/backend/domains/inf/normative/src/entities/normative-framing.entity.ts b/backend/domains/inf/normative/src/entities/normative-framing.entity.ts
index c49dd57..de70a3b 100644
--- a/backend/domains/inf/normative/src/entities/normative-framing.entity.ts
+++ b/backend/domains/inf/normative/src/entities/normative-framing.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface NormativeFraming {
   id: string;
   tenant_id: string;
@@ -10,7 +10,10 @@ export interface NormativeFraming {
   severity?: string | null;
   penalty?: string | null;
   administrative_measure_summary?: string | null;
-  allows_no_approach: boolean;
+  approach_class: string;
+  required_fields?: Record<string, unknown> | null;
+  required_instrument: boolean;
+  points_label?: string | null;
   requires_observation: boolean;
   requires_equipment: boolean;
   status: string;
diff --git a/backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts b/backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts
index 976ff61..2841a4b 100644
--- a/backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts
+++ b/backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export interface NormativeValidationRule {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/inf/normative/src/index.ts b/backend/domains/inf/normative/src/index.ts
index 0c0ed2b..1203208 100644
--- a/backend/domains/inf/normative/src/index.ts
+++ b/backend/domains/inf/normative/src/index.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 export * from './controllers/normative-catalog.controller.js';
 export * from './dto/create-normative-catalog.dto.js';
 export * from './entities/normative-catalog.entity.js';
@@ -9,6 +9,11 @@ export * from './dto/create-normative-framing.dto.js';
 export * from './entities/normative-framing.entity.js';
 export * from './repositories/normative-framing.repository.js';
 export * from './services/normative-framing.service.js';
+export * from './controllers/normative-metrological-table.controller.js';
+export * from './dto/create-normative-metrological-table.dto.js';
+export * from './entities/normative-metrological-table.entity.js';
+export * from './repositories/normative-metrological-table.repository.js';
+export * from './services/normative-metrological-table.service.js';
 export * from './controllers/normative-validation-rule.controller.js';
 export * from './dto/create-normative-validation-rule.dto.js';
 export * from './entities/normative-validation-rule.entity.js';
@@ -24,6 +29,11 @@ export * from './dto/create-normative-document-template.dto.js';
 export * from './entities/normative-document-template.entity.js';
 export * from './repositories/normative-document-template.repository.js';
 export * from './services/normative-document-template.service.js';
+export * from './controllers/signature-policy.controller.js';
+export * from './dto/create-signature-policy.dto.js';
+export * from './entities/signature-policy.entity.js';
+export * from './repositories/signature-policy.repository.js';
+export * from './services/signature-policy.service.js';
 export * from './controllers/mobile-normative-package.controller.js';
 export * from './dto/create-mobile-normative-package.dto.js';
 export * from './entities/mobile-normative-package.entity.js';
diff --git a/backend/domains/inf/normative/src/normative.module.ts b/backend/domains/inf/normative/src/normative.module.ts
index adec2f8..2d19a50 100644
--- a/backend/domains/inf/normative/src/normative.module.ts
+++ b/backend/domains/inf/normative/src/normative.module.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Module } from '@nestjs/common';
 import { NormativeCatalogController } from './controllers/normative-catalog.controller.js';
 import { NormativeCatalogService } from './services/normative-catalog.service.js';
@@ -6,6 +6,9 @@ import { NormativeCatalogRepository } from './repositories/normative-catalog.rep
 import { NormativeFramingController } from './controllers/normative-framing.controller.js';
 import { NormativeFramingService } from './services/normative-framing.service.js';
 import { NormativeFramingRepository } from './repositories/normative-framing.repository.js';
+import { NormativeMetrologicalTableController } from './controllers/normative-metrological-table.controller.js';
+import { NormativeMetrologicalTableService } from './services/normative-metrological-table.service.js';
+import { NormativeMetrologicalTableRepository } from './repositories/normative-metrological-table.repository.js';
 import { NormativeValidationRuleController } from './controllers/normative-validation-rule.controller.js';
 import { NormativeValidationRuleService } from './services/normative-validation-rule.service.js';
 import { NormativeValidationRuleRepository } from './repositories/normative-validation-rule.repository.js';
@@ -15,6 +18,9 @@ import { NormativeAgencyParameterRepository } from './repositories/normative-age
 import { NormativeDocumentTemplateController } from './controllers/normative-document-template.controller.js';
 import { NormativeDocumentTemplateService } from './services/normative-document-template.service.js';
 import { NormativeDocumentTemplateRepository } from './repositories/normative-document-template.repository.js';
+import { SignaturePolicyController } from './controllers/signature-policy.controller.js';
+import { SignaturePolicyService } from './services/signature-policy.service.js';
+import { SignaturePolicyRepository } from './repositories/signature-policy.repository.js';
 import { MobileNormativePackageController } from './controllers/mobile-normative-package.controller.js';
 import { MobileNormativePackageService } from './services/mobile-normative-package.service.js';
 import { MobileNormativePackageRepository } from './repositories/mobile-normative-package.repository.js';
@@ -25,9 +31,11 @@ import { NormativeLifecycleService } from './normative-lifecycle.service.js';
   controllers: [
     NormativeCatalogController,
     NormativeFramingController,
+    NormativeMetrologicalTableController,
     NormativeValidationRuleController,
     NormativeAgencyParameterController,
     NormativeDocumentTemplateController,
+    SignaturePolicyController,
     MobileNormativePackageController,
     NormativeCommandsController,
   ],
@@ -36,12 +44,16 @@ import { NormativeLifecycleService } from './normative-lifecycle.service.js';
     NormativeCatalogRepository,
     NormativeFramingService,
     NormativeFramingRepository,
+    NormativeMetrologicalTableService,
+    NormativeMetrologicalTableRepository,
     NormativeValidationRuleService,
     NormativeValidationRuleRepository,
     NormativeAgencyParameterService,
     NormativeAgencyParameterRepository,
     NormativeDocumentTemplateService,
     NormativeDocumentTemplateRepository,
+    SignaturePolicyService,
+    SignaturePolicyRepository,
     MobileNormativePackageService,
     MobileNormativePackageRepository,
     NormativeLifecycleService,
diff --git a/backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts b/backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts
index 7164f10..458a746 100644
--- a/backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/normative/src/repositories/normative-agency-parameter.repository.ts b/backend/domains/inf/normative/src/repositories/normative-agency-parameter.repository.ts
index bb52003..e4eeac3 100644
--- a/backend/domains/inf/normative/src/repositories/normative-agency-parameter.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/normative-agency-parameter.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts b/backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts
index 30b6841..a0a967c 100644
--- a/backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts b/backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts
index 96bfdf6..09dd391 100644
--- a/backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -14,7 +14,8 @@ type SqlTransaction = Transaction & {
 };
 const WRITABLE_FIELDS = new Set<string>([
   'traffic_agency_id',
-  'document_type',
+  'document_kind',
+  'domain_scope',
   'name',
   'version',
   'template_body',
diff --git a/backend/domains/inf/normative/src/repositories/normative-framing.repository.ts b/backend/domains/inf/normative/src/repositories/normative-framing.repository.ts
index da0fa24..9ea8bb5 100644
--- a/backend/domains/inf/normative/src/repositories/normative-framing.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/normative-framing.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
@@ -21,7 +21,10 @@ const WRITABLE_FIELDS = new Set<string>([
   'severity',
   'penalty',
   'administrative_measure_summary',
-  'allows_no_approach',
+  'approach_class',
+  'required_fields',
+  'required_instrument',
+  'points_label',
   'requires_observation',
   'requires_equipment',
   'status',
diff --git a/backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts b/backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts
index c7782a2..48dc50e 100644
--- a/backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts
+++ b/backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/inf/normative/src/services/mobile-normative-package.service.ts b/backend/domains/inf/normative/src/services/mobile-normative-package.service.ts
index ae99635..53bb080 100644
--- a/backend/domains/inf/normative/src/services/mobile-normative-package.service.ts
+++ b/backend/domains/inf/normative/src/services/mobile-normative-package.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { MobileNormativePackageRepository } from '../repositories/mobile-normative-package.repository.js';
 import type { MobileNormativePackage } from '../entities/mobile-normative-package.entity.js';
diff --git a/backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts b/backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts
index 8052429..b03c5ab 100644
--- a/backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts
+++ b/backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { NormativeAgencyParameterRepository } from '../repositories/normative-agency-parameter.repository.js';
 import type { NormativeAgencyParameter } from '../entities/normative-agency-parameter.entity.js';
diff --git a/backend/domains/inf/normative/src/services/normative-catalog.service.ts b/backend/domains/inf/normative/src/services/normative-catalog.service.ts
index 91173ac..62c488e 100644
--- a/backend/domains/inf/normative/src/services/normative-catalog.service.ts
+++ b/backend/domains/inf/normative/src/services/normative-catalog.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { NormativeCatalogRepository } from '../repositories/normative-catalog.repository.js';
 import type { NormativeCatalog } from '../entities/normative-catalog.entity.js';
diff --git a/backend/domains/inf/normative/src/services/normative-document-template.service.ts b/backend/domains/inf/normative/src/services/normative-document-template.service.ts
index 3e909cf..8e74e21 100644
--- a/backend/domains/inf/normative/src/services/normative-document-template.service.ts
+++ b/backend/domains/inf/normative/src/services/normative-document-template.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { NormativeDocumentTemplateRepository } from '../repositories/normative-document-template.repository.js';
 import type { NormativeDocumentTemplate } from '../entities/normative-document-template.entity.js';
diff --git a/backend/domains/inf/normative/src/services/normative-framing.service.ts b/backend/domains/inf/normative/src/services/normative-framing.service.ts
index 3ef1dc4..39341b8 100644
--- a/backend/domains/inf/normative/src/services/normative-framing.service.ts
+++ b/backend/domains/inf/normative/src/services/normative-framing.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { NormativeFramingRepository } from '../repositories/normative-framing.repository.js';
 import type { NormativeFraming } from '../entities/normative-framing.entity.js';
diff --git a/backend/domains/inf/normative/src/services/normative-validation-rule.service.ts b/backend/domains/inf/normative/src/services/normative-validation-rule.service.ts
index fce8a2a..67c8137 100644
--- a/backend/domains/inf/normative/src/services/normative-validation-rule.service.ts
+++ b/backend/domains/inf/normative/src/services/normative-validation-rule.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
 import { Injectable } from '@nestjs/common';
 import { NormativeValidationRuleRepository } from '../repositories/normative-validation-rule.repository.js';
 import type { NormativeValidationRule } from '../entities/normative-validation-rule.entity.js';
diff --git a/docs/framework/blueprints/BP-INF-AIT-001.json b/docs/framework/blueprints/BP-INF-AIT-001.json
index e3142b1..ef2ccf5 100644
--- a/docs/framework/blueprints/BP-INF-AIT-001.json
+++ b/docs/framework/blueprints/BP-INF-AIT-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Ait",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "ddlFile": "31-inf-ait.sql",
     "dependencies": {
       "@detran/inf-normative": "workspace:*",
@@ -186,7 +186,17 @@
           {
             "name": "current_status",
             "type": "varchar(60)",
-            "default": "'draft'"
+            "default": "'RASCUNHO_OFFLINE'"
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": "1"
+          },
+          {
+            "name": "speed_measurement_id",
+            "type": "uuid",
+            "nullable": true
           },
           {
             "name": "content_hash",
@@ -240,6 +250,10 @@
           {
             "name": "ck_inf_ait_issue_after_infraction",
             "expression": "issued_at >= infraction_at"
+          },
+          {
+            "name": "ck_inf_ait_current_status",
+            "expression": "current_status in ('RASCUNHO_OFFLINE', 'CANCELADO_RASCUNHO', 'FINALIZADO_LOCAL', 'ENFILEIRADO', 'TRANSMITIDO', 'RECEBIDO', 'SUSPEITO_CONCORRENCIA', 'VALIDANDO', 'ACEITO', 'REJEITADO', 'PENDENTE_CORRECAO', 'CORRIGIDO', 'INTEGRADO', 'PROCESSADO', 'ARQUIVADO', 'SOLICITADO_CANCEL_POSFINAL', 'CANCELADO_POSFINAL')"
           }
         ],
         "foreignKeys": [
@@ -258,6 +272,80 @@
               "table": "inf.normative_framing",
               "columns": ["id"]
             }
+          },
+          {
+            "name": "fk_inf_ait_current_status",
+            "columns": ["current_status"],
+            "references": {
+              "table": "inf.ait_state_ref",
+              "columns": ["code"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "AitCancelRequest",
+        "table": "ait_cancel_request",
+        "primaryKey": ["id"],
+        "fields": [
+          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
+          { "name": "tenant_id", "type": "uuid" },
+          { "name": "ait_id", "type": "uuid" },
+          { "name": "kind", "type": "varchar(60)" },
+          {
+            "name": "target_local_act_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          { "name": "origin_status", "type": "varchar(60)" },
+          { "name": "addressed_to", "type": "varchar(120)" },
+          { "name": "status", "type": "varchar(60)", "default": "'submitted'" },
+          { "name": "decision", "type": "text", "nullable": true },
+          { "name": "requested_at", "type": "timestamptz", "default": "now()" },
+          { "name": "decided_at", "type": "timestamptz", "nullable": true }
+        ],
+        "indexes": [
+          {
+            "name": "ix_inf_ait_cancel_request",
+            "columns": ["tenant_id", "ait_id", "status"]
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_ait_cancel_request_ait",
+            "columns": ["ait_id"],
+            "references": { "table": "inf.ait_ait", "columns": ["id"] }
+          }
+        ]
+      },
+      {
+        "name": "AitCancelRequestEvent",
+        "table": "ait_cancel_request_event",
+        "primaryKey": ["id"],
+        "fields": [
+          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
+          { "name": "tenant_id", "type": "uuid" },
+          { "name": "cancel_request_id", "type": "uuid" },
+          { "name": "event_type", "type": "varchar(80)" },
+          { "name": "event_at", "type": "timestamptz", "default": "now()" },
+          { "name": "actor_user_ref", "type": "uuid", "nullable": true },
+          { "name": "decision", "type": "text", "nullable": true },
+          { "name": "details_json", "type": "jsonb", "nullable": true }
+        ],
+        "indexes": [
+          {
+            "name": "ix_inf_ait_cancel_request_event",
+            "columns": ["tenant_id", "cancel_request_id", "event_at"]
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_ait_cancel_request_event_request",
+            "columns": ["cancel_request_id"],
+            "references": {
+              "table": "inf.ait_cancel_request",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -701,6 +789,16 @@
         "path": "aits",
         "resource": "ait"
       },
+      {
+        "entity": "AitCancelRequest",
+        "path": "cancel-requests",
+        "resource": "ait-cancel-request"
+      },
+      {
+        "entity": "AitCancelRequestEvent",
+        "path": "cancel-request-events",
+        "resource": "ait-cancel-request-event"
+      },
       {
         "entity": "AitVehicle",
         "path": "vehicles",
diff --git a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
index e8fd723..2471151 100644
--- a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
+++ b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Alcohol",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "ddlFile": "33-inf-alcohol.sql",
     "dependencies": {
       "@detran/inf-ait": "workspace:*",
@@ -39,6 +39,67 @@
           { "name": "outcome", "type": "varchar(80)" },
           { "name": "status", "type": "varchar(40)", "default": "'draft'" },
           { "name": "notes", "type": "text", "nullable": true },
+          { "name": "ait_local_id", "type": "varchar(120)", "nullable": true },
+          {
+            "name": "sign_catalog_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "sign_catalog_version",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "driver_name",
+            "type": "varchar(160)",
+            "nullable": true,
+            "pii": "high",
+            "retention": "forever"
+          },
+          {
+            "name": "driver_document",
+            "type": "varchar(60)",
+            "nullable": true,
+            "pii": "high",
+            "retention": "forever"
+          },
+          {
+            "name": "vehicle_plate",
+            "type": "varchar(20)",
+            "nullable": true,
+            "pii": "high",
+            "retention": "forever"
+          },
+          { "name": "vehicle_make", "type": "varchar(120)", "nullable": true },
+          { "name": "refused_procedures", "type": "bool", "nullable": true },
+          {
+            "name": "driver_statement_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "witnesses_json",
+            "type": "jsonb",
+            "nullable": true,
+            "pii": "high",
+            "retention": "forever"
+          },
+          {
+            "name": "source_local_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "source_idempotency_key",
+            "type": "varchar(160)",
+            "nullable": true
+          },
+          {
+            "name": "source_payload_hash",
+            "type": "varchar(128)",
+            "nullable": true
+          },
           {
             "name": "location_geom",
             "type": "geometry(Point,4674)",
@@ -121,6 +182,16 @@
           { "name": "test_number", "type": "varchar(80)", "nullable": true },
           { "name": "tested_at", "type": "timestamptz" },
           { "name": "result_mg_l", "type": "numeric(8,3)", "nullable": true },
+          {
+            "name": "considered_mg_l",
+            "type": "numeric(8,3)",
+            "nullable": true
+          },
+          {
+            "name": "max_error_mg_l",
+            "type": "numeric(8,3)",
+            "nullable": true
+          },
           { "name": "counterproof", "type": "boolean", "default": "false" },
           {
             "name": "result_image_evidence_id",
@@ -129,6 +200,12 @@
           },
           { "name": "status", "type": "varchar(40)", "default": "'recorded'" }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_alcohol_test_considered_error_pair",
+            "expression": "(considered_mg_l is null) = (max_error_mg_l is null) and (max_error_mg_l is null or max_error_mg_l >= 0)"
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_inf_alcohol_test_procedure",
@@ -165,10 +242,17 @@
           { "name": "tenant_id", "type": "uuid" },
           { "name": "procedure_id", "type": "uuid" },
           { "name": "refused_at", "type": "timestamptz" },
+          { "name": "kind", "type": "varchar(40)" },
           { "name": "refusal_description", "type": "text" },
           { "name": "witness_person_id", "type": "uuid", "nullable": true },
           { "name": "evidence_id", "type": "uuid", "nullable": true }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_alcohol_refusal_kind",
+            "expression": "kind in ('refusal', 'technical_impossibility')"
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_inf_alcohol_refusal_procedure",
@@ -203,7 +287,10 @@
           { "name": "procedure_id", "type": "uuid" },
           { "name": "sign_code", "type": "varchar(80)" },
           { "name": "description", "type": "text" },
-          { "name": "observed", "type": "boolean", "default": "true" }
+          { "name": "observed", "type": "boolean", "default": "true" },
+          { "name": "sign_group", "type": "varchar(80)", "nullable": true },
+          { "name": "sign_status", "type": "varchar(20)", "nullable": true },
+          { "name": "method", "type": "varchar(120)", "nullable": true }
         ],
         "foreignKeys": [
           {
diff --git a/docs/framework/blueprints/BP-INF-MEASURES-001.json b/docs/framework/blueprints/BP-INF-MEASURES-001.json
index 691ac50..01a8f47 100644
--- a/docs/framework/blueprints/BP-INF-MEASURES-001.json
+++ b/docs/framework/blueprints/BP-INF-MEASURES-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Measures",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "ddlFile": "32-inf-measures.sql",
     "dependencies": { "@detran/inf-ait": "workspace:*" },
     "handwrittenExports": [
@@ -67,6 +67,12 @@
             "nullable": true
           }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_administrative_measure_current_status",
+            "expression": "current_status in ('RETIDO', 'LIBERADO_LOCAL', 'LIBERADO_COM_PRAZO', 'REGULARIZADO', 'CONVERTIDO_REMOCAO', 'REMOVIDO', 'EM_DEPOSITO', 'GUARDA_MONITORADA', 'VIOLACAO_MONITORAMENTO', 'NOTIFICADO', 'RESTITUIDO', 'LEILAO')"
+          }
+        ],
         "indexes": [
           {
             "name": "ix_inf_measure_status",
@@ -110,6 +116,33 @@
           { "name": "file_evidence_id", "type": "uuid", "nullable": true },
           { "name": "issued_at", "type": "timestamptz" },
           { "name": "signed_by_person_id", "type": "uuid", "nullable": true },
+          { "name": "signer_name", "type": "varchar(160)", "nullable": true },
+          {
+            "name": "withdrawal_deadline_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "ctb_deadline_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          { "name": "field_details_json", "type": "jsonb", "nullable": true },
+          {
+            "name": "source_local_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "source_idempotency_key",
+            "type": "varchar(160)",
+            "nullable": true
+          },
+          {
+            "name": "source_payload_hash",
+            "type": "varchar(128)",
+            "nullable": true
+          },
           { "name": "status", "type": "varchar(60)", "default": "'issued'" }
         ],
         "indexes": [
@@ -153,10 +186,26 @@
           { "name": "measure_id", "type": "uuid" },
           { "name": "vehicle_snapshot_id", "type": "uuid" },
           { "name": "retention_reason", "type": "text" },
+          {
+            "name": "regularization_deadline_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "regularization_deadline_days",
+            "type": "integer",
+            "nullable": true
+          },
           { "name": "regularized_at", "type": "timestamptz", "nullable": true },
           { "name": "released_at", "type": "timestamptz", "nullable": true },
           { "name": "release_user_ref", "type": "uuid", "nullable": true }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_measure_retention_regularization_deadline_30",
+            "expression": "regularization_deadline_days is null or regularization_deadline_days between 1 and 30"
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_inf_retention_measure",
@@ -190,12 +239,28 @@
           { "name": "requested_at", "type": "timestamptz", "nullable": true },
           { "name": "tow_arrived_at", "type": "timestamptz", "nullable": true },
           { "name": "delivered_at", "type": "timestamptz", "nullable": true },
+          {
+            "name": "regularization_deadline_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "regularization_deadline_days",
+            "type": "integer",
+            "nullable": true
+          },
           {
             "name": "destination_description",
             "type": "text",
             "nullable": true
           }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_measure_removal_regularization_deadline_15",
+            "expression": "regularization_deadline_days is null or regularization_deadline_days between 1 and 15"
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_inf_removal_measure",
diff --git a/docs/framework/blueprints/BP-INF-NORMATIVE-001.json b/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
index 895d014..6f7c574 100644
--- a/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
+++ b/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Normative",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "ddlFile": "30-inf-normative.sql",
     "testAliases": [
       {
@@ -150,10 +150,24 @@
             "nullable": true
           },
           {
-            "name": "allows_no_approach",
+            "name": "approach_class",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "required_fields",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "required_instrument",
             "type": "boolean",
             "default": "false"
           },
+          {
+            "name": "points_label",
+            "type": "varchar(160)",
+            "nullable": true
+          },
           {
             "name": "requires_observation",
             "type": "boolean",
@@ -177,6 +191,12 @@
             "unique": true
           }
         ],
+        "checks": [
+          {
+            "name": "ck_inf_normative_framing_approach_class",
+            "expression": "approach_class in ('caso_1', 'caso_2', 'caso_3')"
+          }
+        ],
         "foreignKeys": [
           {
             "name": "fk_inf_framing_catalog",
@@ -188,6 +208,39 @@
           }
         ]
       },
+      {
+        "name": "NormativeMetrologicalTable",
+        "table": "normative_metrological_table",
+        "primaryKey": ["id"],
+        "fields": [
+          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
+          { "name": "tenant_id", "type": "uuid" },
+          { "name": "catalog_id", "type": "uuid" },
+          { "name": "table_name", "type": "varchar(160)" },
+          { "name": "version", "type": "varchar(80)" },
+          { "name": "table_json", "type": "jsonb" },
+          { "name": "valid_from", "type": "date" },
+          { "name": "valid_to", "type": "date", "nullable": true },
+          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+        ],
+        "indexes": [
+          {
+            "name": "ux_inf_normative_metrological_table",
+            "columns": ["tenant_id", "catalog_id", "table_name", "version"],
+            "unique": true
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_metrological_table_catalog",
+            "columns": ["catalog_id"],
+            "references": {
+              "table": "inf.normative_catalog",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
       {
         "name": "NormativeValidationRule",
         "table": "normative_validation_rule",
@@ -341,9 +394,14 @@
             "type": "uuid"
           },
           {
-            "name": "document_type",
+            "name": "document_kind",
             "type": "varchar(80)"
           },
+          {
+            "name": "domain_scope",
+            "type": "varchar(80)",
+            "default": "'inf'"
+          },
           {
             "name": "name",
             "type": "varchar(255)"
@@ -372,13 +430,37 @@
             "columns": [
               "tenant_id",
               "traffic_agency_id",
-              "document_type",
+              "document_kind",
               "version"
             ],
             "unique": true
           }
         ]
       },
+      {
+        "name": "SignaturePolicy",
+        "table": "signature_policy",
+        "primaryKey": ["id"],
+        "fields": [
+          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
+          { "name": "tenant_id", "type": "uuid" },
+          { "name": "traffic_agency_id", "type": "uuid" },
+          { "name": "document_kind", "type": "varchar(80)" },
+          { "name": "required_signers_json", "type": "jsonb" },
+          { "name": "pades_level", "type": "varchar(40)" },
+          { "name": "tsa_required", "type": "boolean", "default": "false" },
+          { "name": "pdfa_required", "type": "boolean", "default": "false" },
+          { "name": "govbr_level", "type": "varchar(40)", "nullable": true },
+          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+        ],
+        "indexes": [
+          {
+            "name": "ux_inf_signature_policy_document_kind",
+            "columns": ["tenant_id", "traffic_agency_id", "document_kind"],
+            "unique": true
+          }
+        ]
+      },
       {
         "name": "MobileNormativePackage",
         "table": "normative_mobile_package",
@@ -462,6 +544,11 @@
         "path": "framings",
         "resource": "framing"
       },
+      {
+        "entity": "NormativeMetrologicalTable",
+        "path": "metrological-tables",
+        "resource": "normative-metrological-table"
+      },
       {
         "entity": "NormativeValidationRule",
         "path": "validation-rules",
@@ -477,6 +564,11 @@
         "path": "document-templates",
         "resource": "document-template"
       },
+      {
+        "entity": "SignaturePolicy",
+        "path": "signature-policies",
+        "resource": "signature-policy"
+      },
       {
         "entity": "MobileNormativePackage",
         "path": "mobile-packages",
diff --git a/docs/framework/contracts/BP-INF-AIT-001.openapi.json b/docs/framework/contracts/BP-INF-AIT-001.openapi.json
index 543424b..61298d1 100644
--- a/docs/framework/contracts/BP-INF-AIT-001.openapi.json
+++ b/docs/framework/contracts/BP-INF-AIT-001.openapi.json
@@ -2,7 +2,7 @@
   "openapi": "3.1.0",
   "info": {
     "title": "Ait — BP-INF-AIT-001",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "description": "AIT issuance and lifecycle with immutable content hash, normative references, and operational satellites.",
     "x-blueprint": "BP-INF-AIT-001",
     "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
@@ -134,6 +134,258 @@
         }
       }
     },
+    "/v1/inf/ait/cancel-requests": {
+      "get": {
+        "tags": ["ait-cancel-request"],
+        "operationId": "listAitCancelRequest",
+        "summary": "List AitCancelRequest (most recent first, capped at 500)",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "array",
+                  "items": {
+                    "$ref": "#/components/schemas/AitCancelRequest"
+                  }
+                }
+              }
+            }
+          }
+        }
+      },
+      "post": {
+        "tags": ["ait-cancel-request"],
+        "operationId": "createAitCancelRequest",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/CreateAitCancelRequestDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "created",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequest"
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/ait/cancel-requests/{id}": {
+      "parameters": [
+        {
+          "name": "id",
+          "in": "path",
+          "required": true,
+          "schema": {
+            "type": "string",
+            "format": "uuid"
+          }
+        }
+      ],
+      "get": {
+        "tags": ["ait-cancel-request"],
+        "operationId": "getAitCancelRequest",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequest"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "patch": {
+        "tags": ["ait-cancel-request"],
+        "operationId": "updateAitCancelRequest",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "allOf": [
+                  {
+                    "$ref": "#/components/schemas/CreateAitCancelRequestDto"
+                  }
+                ],
+                "required": []
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequest"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "delete": {
+        "tags": ["ait-cancel-request"],
+        "operationId": "removeAitCancelRequest",
+        "responses": {
+          "200": {
+            "description": "deleted"
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      }
+    },
+    "/v1/inf/ait/cancel-request-events": {
+      "get": {
+        "tags": ["ait-cancel-request-event"],
+        "operationId": "listAitCancelRequestEvent",
+        "summary": "List AitCancelRequestEvent (most recent first, capped at 500)",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "array",
+                  "items": {
+                    "$ref": "#/components/schemas/AitCancelRequestEvent"
+                  }
+                }
+              }
+            }
+          }
+        }
+      },
+      "post": {
+        "tags": ["ait-cancel-request-event"],
+        "operationId": "createAitCancelRequestEvent",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/CreateAitCancelRequestEventDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "created",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequestEvent"
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/ait/cancel-request-events/{id}": {
+      "parameters": [
+        {
+          "name": "id",
+          "in": "path",
+          "required": true,
+          "schema": {
+            "type": "string",
+            "format": "uuid"
+          }
+        }
+      ],
+      "get": {
+        "tags": ["ait-cancel-request-event"],
+        "operationId": "getAitCancelRequestEvent",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequestEvent"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "patch": {
+        "tags": ["ait-cancel-request-event"],
+        "operationId": "updateAitCancelRequestEvent",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "allOf": [
+                  {
+                    "$ref": "#/components/schemas/CreateAitCancelRequestEventDto"
+                  }
+                ],
+                "required": []
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/AitCancelRequestEvent"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "delete": {
+        "tags": ["ait-cancel-request-event"],
+        "operationId": "removeAitCancelRequestEvent",
+        "responses": {
+          "200": {
+            "description": "deleted"
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      }
+    },
     "/v1/inf/ait/vehicles": {
       "get": {
         "tags": ["ait-vehicle"],
@@ -1018,7 +1270,35 @@
           "current_status": {
             "type": "string",
             "maxLength": 60,
-            "default": "'draft'"
+            "enum": [
+              "RASCUNHO_OFFLINE",
+              "CANCELADO_RASCUNHO",
+              "FINALIZADO_LOCAL",
+              "ENFILEIRADO",
+              "TRANSMITIDO",
+              "RECEBIDO",
+              "SUSPEITO_CONCORRENCIA",
+              "VALIDANDO",
+              "ACEITO",
+              "REJEITADO",
+              "PENDENTE_CORRECAO",
+              "CORRIGIDO",
+              "INTEGRADO",
+              "PROCESSADO",
+              "ARQUIVADO",
+              "SOLICITADO_CANCEL_POSFINAL",
+              "CANCELADO_POSFINAL"
+            ],
+            "default": "'RASCUNHO_OFFLINE'"
+          },
+          "version": {
+            "type": "integer",
+            "default": "1"
+          },
+          "speed_measurement_id": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
           },
           "content_hash": {
             "type": "string",
@@ -1181,7 +1461,35 @@
           "current_status": {
             "type": "string",
             "maxLength": 60,
-            "default": "'draft'"
+            "enum": [
+              "RASCUNHO_OFFLINE",
+              "CANCELADO_RASCUNHO",
+              "FINALIZADO_LOCAL",
+              "ENFILEIRADO",
+              "TRANSMITIDO",
+              "RECEBIDO",
+              "SUSPEITO_CONCORRENCIA",
+              "VALIDANDO",
+              "ACEITO",
+              "REJEITADO",
+              "PENDENTE_CORRECAO",
+              "CORRIGIDO",
+              "INTEGRADO",
+              "PROCESSADO",
+              "ARQUIVADO",
+              "SOLICITADO_CANCEL_POSFINAL",
+              "CANCELADO_POSFINAL"
+            ],
+            "default": "'RASCUNHO_OFFLINE'"
+          },
+          "version": {
+            "type": "integer",
+            "default": "1"
+          },
+          "speed_measurement_id": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
           },
           "content_hash": {
             "type": "string",
@@ -1217,6 +1525,212 @@
           "uf"
         ]
       },
+      "AitCancelRequest": {
+        "type": "object",
+        "properties": {
+          "id": {
+            "type": "string",
+            "format": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          "tenant_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "ait_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "kind": {
+            "type": "string",
+            "maxLength": 60
+          },
+          "target_local_act_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "origin_status": {
+            "type": "string",
+            "maxLength": 60
+          },
+          "addressed_to": {
+            "type": "string",
+            "maxLength": 120
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 60,
+            "default": "'submitted'"
+          },
+          "decision": {
+            "type": "string",
+            "nullable": true
+          },
+          "requested_at": {
+            "type": "string",
+            "format": "date-time",
+            "default": "now()"
+          },
+          "decided_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "created_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "updated_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": [
+          "tenant_id",
+          "ait_id",
+          "kind",
+          "origin_status",
+          "addressed_to",
+          "created_at"
+        ]
+      },
+      "CreateAitCancelRequestDto": {
+        "type": "object",
+        "properties": {
+          "ait_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "kind": {
+            "type": "string",
+            "maxLength": 60
+          },
+          "target_local_act_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "origin_status": {
+            "type": "string",
+            "maxLength": 60
+          },
+          "addressed_to": {
+            "type": "string",
+            "maxLength": 120
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 60,
+            "default": "'submitted'"
+          },
+          "decision": {
+            "type": "string",
+            "nullable": true
+          },
+          "requested_at": {
+            "type": "string",
+            "format": "date-time",
+            "default": "now()"
+          },
+          "decided_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": ["ait_id", "kind", "origin_status", "addressed_to"]
+      },
+      "AitCancelRequestEvent": {
+        "type": "object",
+        "properties": {
+          "id": {
+            "type": "string",
+            "format": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          "tenant_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "cancel_request_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "event_type": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "event_at": {
+            "type": "string",
+            "format": "date-time",
+            "default": "now()"
+          },
+          "actor_user_ref": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
+          },
+          "decision": {
+            "type": "string",
+            "nullable": true
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "created_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "updated_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": [
+          "tenant_id",
+          "cancel_request_id",
+          "event_type",
+          "created_at"
+        ]
+      },
+      "CreateAitCancelRequestEventDto": {
+        "type": "object",
+        "properties": {
+          "cancel_request_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "event_type": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "event_at": {
+            "type": "string",
+            "format": "date-time",
+            "default": "now()"
+          },
+          "actor_user_ref": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
+          },
+          "decision": {
+            "type": "string",
+            "nullable": true
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          }
+        },
+        "required": ["cancel_request_id", "event_type"]
+      },
       "AitVehicle": {
         "type": "object",
         "properties": {
diff --git a/docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json b/docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json
index 306ca2f..780c6a3 100644
--- a/docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json
+++ b/docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json
@@ -2,7 +2,7 @@
   "openapi": "3.1.0",
   "info": {
     "title": "Alcohol — BP-INF-ALCOHOL-001",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "description": "Breathalyzer and alcohol-testing procedure flows ported from TEAT.",
     "x-blueprint": "BP-INF-ALCOHOL-001",
     "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
@@ -837,6 +837,78 @@
             "type": "string",
             "nullable": true
           },
+          "ait_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "sign_catalog_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "sign_catalog_version": {
+            "type": "string",
+            "maxLength": 40,
+            "nullable": true
+          },
+          "driver_name": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "driver_document": {
+            "type": "string",
+            "maxLength": 60,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "vehicle_plate": {
+            "type": "string",
+            "maxLength": 20,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "vehicle_make": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "refused_procedures": {
+            "type": "boolean",
+            "nullable": true
+          },
+          "driver_statement_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "witnesses_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "source_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "source_idempotency_key": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "source_payload_hash": {
+            "type": "string",
+            "maxLength": 128,
+            "nullable": true
+          },
           "location_geom": {
             "nullable": true
           },
@@ -922,6 +994,78 @@
             "type": "string",
             "nullable": true
           },
+          "ait_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "sign_catalog_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "sign_catalog_version": {
+            "type": "string",
+            "maxLength": 40,
+            "nullable": true
+          },
+          "driver_name": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "driver_document": {
+            "type": "string",
+            "maxLength": 60,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "vehicle_plate": {
+            "type": "string",
+            "maxLength": 20,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "vehicle_make": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "refused_procedures": {
+            "type": "boolean",
+            "nullable": true
+          },
+          "driver_statement_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "witnesses_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true,
+            "x-pii": "high",
+            "x-retention": "forever"
+          },
+          "source_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "source_idempotency_key": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "source_payload_hash": {
+            "type": "string",
+            "maxLength": 128,
+            "nullable": true
+          },
           "location_geom": {
             "nullable": true
           }
@@ -1070,6 +1214,14 @@
             "type": "number",
             "nullable": true
           },
+          "considered_mg_l": {
+            "type": "number",
+            "nullable": true
+          },
+          "max_error_mg_l": {
+            "type": "number",
+            "nullable": true
+          },
           "counterproof": {
             "type": "boolean",
             "default": "false"
@@ -1121,6 +1273,14 @@
             "type": "number",
             "nullable": true
           },
+          "considered_mg_l": {
+            "type": "number",
+            "nullable": true
+          },
+          "max_error_mg_l": {
+            "type": "number",
+            "nullable": true
+          },
           "counterproof": {
             "type": "boolean",
             "default": "false"
@@ -1158,6 +1318,11 @@
             "type": "string",
             "format": "date-time"
           },
+          "kind": {
+            "type": "string",
+            "maxLength": 40,
+            "enum": ["refusal", "technical_impossibility"]
+          },
           "refusal_description": {
             "type": "string"
           },
@@ -1185,6 +1350,7 @@
           "tenant_id",
           "procedure_id",
           "refused_at",
+          "kind",
           "refusal_description",
           "created_at"
         ]
@@ -1200,6 +1366,11 @@
             "type": "string",
             "format": "date-time"
           },
+          "kind": {
+            "type": "string",
+            "maxLength": 40,
+            "enum": ["refusal", "technical_impossibility"]
+          },
           "refusal_description": {
             "type": "string"
           },
@@ -1214,7 +1385,12 @@
             "nullable": true
           }
         },
-        "required": ["procedure_id", "refused_at", "refusal_description"]
+        "required": [
+          "procedure_id",
+          "refused_at",
+          "kind",
+          "refusal_description"
+        ]
       },
       "PsychomotorSign": {
         "type": "object",
@@ -1243,6 +1419,21 @@
             "type": "boolean",
             "default": "true"
           },
+          "sign_group": {
+            "type": "string",
+            "maxLength": 80,
+            "nullable": true
+          },
+          "sign_status": {
+            "type": "string",
+            "maxLength": 20,
+            "nullable": true
+          },
+          "method": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
           "created_at": {
             "type": "string",
             "format": "date-time"
@@ -1278,6 +1469,21 @@
           "observed": {
             "type": "boolean",
             "default": "true"
+          },
+          "sign_group": {
+            "type": "string",
+            "maxLength": 80,
+            "nullable": true
+          },
+          "sign_status": {
+            "type": "string",
+            "maxLength": 20,
+            "nullable": true
+          },
+          "method": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
           }
         },
         "required": ["procedure_id", "sign_code", "description"]
diff --git a/docs/framework/contracts/BP-INF-MEASURES-001.openapi.json b/docs/framework/contracts/BP-INF-MEASURES-001.openapi.json
index e39788d..33bd05e 100644
--- a/docs/framework/contracts/BP-INF-MEASURES-001.openapi.json
+++ b/docs/framework/contracts/BP-INF-MEASURES-001.openapi.json
@@ -2,7 +2,7 @@
   "openapi": "3.1.0",
   "info": {
     "title": "Measures — BP-INF-MEASURES-001",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "description": "Administrative measures, terms, retention, removal, inventory, providers, yards, and status history.",
     "x-blueprint": "BP-INF-MEASURES-001",
     "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
@@ -1276,6 +1276,20 @@
           "current_status": {
             "type": "string",
             "maxLength": 60,
+            "enum": [
+              "RETIDO",
+              "LIBERADO_LOCAL",
+              "LIBERADO_COM_PRAZO",
+              "REGULARIZADO",
+              "CONVERTIDO_REMOCAO",
+              "REMOVIDO",
+              "EM_DEPOSITO",
+              "GUARDA_MONITORADA",
+              "VIOLACAO_MONITORAMENTO",
+              "NOTIFICADO",
+              "RESTITUIDO",
+              "LEILAO"
+            ],
             "default": "'started'"
           },
           "notes": {
@@ -1365,6 +1379,20 @@
           "current_status": {
             "type": "string",
             "maxLength": 60,
+            "enum": [
+              "RETIDO",
+              "LIBERADO_LOCAL",
+              "LIBERADO_COM_PRAZO",
+              "REGULARIZADO",
+              "CONVERTIDO_REMOCAO",
+              "REMOVIDO",
+              "EM_DEPOSITO",
+              "GUARDA_MONITORADA",
+              "VIOLACAO_MONITORAMENTO",
+              "NOTIFICADO",
+              "RESTITUIDO",
+              "LEILAO"
+            ],
             "default": "'started'"
           },
           "notes": {
@@ -1427,6 +1455,41 @@
             "format": "uuid",
             "nullable": true
           },
+          "signer_name": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "withdrawal_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "ctb_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "field_details_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "source_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "source_idempotency_key": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "source_payload_hash": {
+            "type": "string",
+            "maxLength": 128,
+            "nullable": true
+          },
           "status": {
             "type": "string",
             "maxLength": 60,
@@ -1485,6 +1548,41 @@
             "format": "uuid",
             "nullable": true
           },
+          "signer_name": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "withdrawal_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "ctb_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "field_details_json": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "source_local_id": {
+            "type": "string",
+            "maxLength": 120,
+            "nullable": true
+          },
+          "source_idempotency_key": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
+          "source_payload_hash": {
+            "type": "string",
+            "maxLength": 128,
+            "nullable": true
+          },
           "status": {
             "type": "string",
             "maxLength": 60,
@@ -1522,6 +1620,15 @@
           "retention_reason": {
             "type": "string"
           },
+          "regularization_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "regularization_deadline_days": {
+            "type": "integer",
+            "nullable": true
+          },
           "regularized_at": {
             "type": "string",
             "format": "date-time",
@@ -1569,6 +1676,15 @@
           "retention_reason": {
             "type": "string"
           },
+          "regularization_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "regularization_deadline_days": {
+            "type": "integer",
+            "nullable": true
+          },
           "regularized_at": {
             "type": "string",
             "format": "date-time",
@@ -1632,6 +1748,15 @@
             "format": "date-time",
             "nullable": true
           },
+          "regularization_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "regularization_deadline_days": {
+            "type": "integer",
+            "nullable": true
+          },
           "destination_description": {
             "type": "string",
             "nullable": true
@@ -1689,6 +1814,15 @@
             "format": "date-time",
             "nullable": true
           },
+          "regularization_deadline_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "regularization_deadline_days": {
+            "type": "integer",
+            "nullable": true
+          },
           "destination_description": {
             "type": "string",
             "nullable": true
diff --git a/docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json b/docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json
index cff85cd..43daf98 100644
--- a/docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json
+++ b/docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json
@@ -2,7 +2,7 @@
   "openapi": "3.1.0",
   "info": {
     "title": "Normative — BP-INF-NORMATIVE-001",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "description": "Infraction catalog, framing rules, agency parameters, templates, and mobile package versioning ported from TEAT.",
     "x-blueprint": "BP-INF-NORMATIVE-001",
     "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
@@ -260,6 +260,132 @@
         }
       }
     },
+    "/v1/inf/normative/metrological-tables": {
+      "get": {
+        "tags": ["normative-metrological-table"],
+        "operationId": "listNormativeMetrologicalTable",
+        "summary": "List NormativeMetrologicalTable (most recent first, capped at 500)",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "array",
+                  "items": {
+                    "$ref": "#/components/schemas/NormativeMetrologicalTable"
+                  }
+                }
+              }
+            }
+          }
+        }
+      },
+      "post": {
+        "tags": ["normative-metrological-table"],
+        "operationId": "createNormativeMetrologicalTable",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/CreateNormativeMetrologicalTableDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "created",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/NormativeMetrologicalTable"
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/normative/metrological-tables/{id}": {
+      "parameters": [
+        {
+          "name": "id",
+          "in": "path",
+          "required": true,
+          "schema": {
+            "type": "string",
+            "format": "uuid"
+          }
+        }
+      ],
+      "get": {
+        "tags": ["normative-metrological-table"],
+        "operationId": "getNormativeMetrologicalTable",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/NormativeMetrologicalTable"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "patch": {
+        "tags": ["normative-metrological-table"],
+        "operationId": "updateNormativeMetrologicalTable",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "allOf": [
+                  {
+                    "$ref": "#/components/schemas/CreateNormativeMetrologicalTableDto"
+                  }
+                ],
+                "required": []
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/NormativeMetrologicalTable"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "delete": {
+        "tags": ["normative-metrological-table"],
+        "operationId": "removeNormativeMetrologicalTable",
+        "responses": {
+          "200": {
+            "description": "deleted"
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      }
+    },
     "/v1/inf/normative/validation-rules": {
       "get": {
         "tags": ["validation-rule"],
@@ -638,6 +764,132 @@
         }
       }
     },
+    "/v1/inf/normative/signature-policies": {
+      "get": {
+        "tags": ["signature-policy"],
+        "operationId": "listSignaturePolicy",
+        "summary": "List SignaturePolicy (most recent first, capped at 500)",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "array",
+                  "items": {
+                    "$ref": "#/components/schemas/SignaturePolicy"
+                  }
+                }
+              }
+            }
+          }
+        }
+      },
+      "post": {
+        "tags": ["signature-policy"],
+        "operationId": "createSignaturePolicy",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/CreateSignaturePolicyDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "created",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/SignaturePolicy"
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/normative/signature-policies/{id}": {
+      "parameters": [
+        {
+          "name": "id",
+          "in": "path",
+          "required": true,
+          "schema": {
+            "type": "string",
+            "format": "uuid"
+          }
+        }
+      ],
+      "get": {
+        "tags": ["signature-policy"],
+        "operationId": "getSignaturePolicy",
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/SignaturePolicy"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "patch": {
+        "tags": ["signature-policy"],
+        "operationId": "updateSignaturePolicy",
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "allOf": [
+                  {
+                    "$ref": "#/components/schemas/CreateSignaturePolicyDto"
+                  }
+                ],
+                "required": []
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "ok",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "$ref": "#/components/schemas/SignaturePolicy"
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      },
+      "delete": {
+        "tags": ["signature-policy"],
+        "operationId": "removeSignaturePolicy",
+        "responses": {
+          "200": {
+            "description": "deleted"
+          },
+          "404": {
+            "description": "not found"
+          }
+        }
+      }
+    },
     "/v1/inf/normative/mobile-packages": {
       "get": {
         "tags": ["mobile-normative-package"],
@@ -930,10 +1182,25 @@
             "type": "string",
             "nullable": true
           },
-          "allows_no_approach": {
+          "approach_class": {
+            "type": "string",
+            "maxLength": 20,
+            "enum": ["caso_1", "caso_2", "caso_3"]
+          },
+          "required_fields": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "required_instrument": {
             "type": "boolean",
             "default": "false"
           },
+          "points_label": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
           "requires_observation": {
             "type": "boolean",
             "default": "false"
@@ -962,6 +1229,7 @@
           "catalog_id",
           "framing_code",
           "description",
+          "approach_class",
           "created_at"
         ]
       },
@@ -1002,10 +1270,25 @@
             "type": "string",
             "nullable": true
           },
-          "allows_no_approach": {
+          "approach_class": {
+            "type": "string",
+            "maxLength": 20,
+            "enum": ["caso_1", "caso_2", "caso_3"]
+          },
+          "required_fields": {
+            "type": "object",
+            "additionalProperties": true,
+            "nullable": true
+          },
+          "required_instrument": {
             "type": "boolean",
             "default": "false"
           },
+          "points_label": {
+            "type": "string",
+            "maxLength": 160,
+            "nullable": true
+          },
           "requires_observation": {
             "type": "boolean",
             "default": "false"
@@ -1020,7 +1303,116 @@
             "default": "'active'"
           }
         },
-        "required": ["catalog_id", "framing_code", "description"]
+        "required": [
+          "catalog_id",
+          "framing_code",
+          "description",
+          "approach_class"
+        ]
+      },
+      "NormativeMetrologicalTable": {
+        "type": "object",
+        "properties": {
+          "id": {
+            "type": "string",
+            "format": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          "tenant_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "catalog_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "table_name": {
+            "type": "string",
+            "maxLength": 160
+          },
+          "version": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "table_json": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "valid_from": {
+            "type": "string",
+            "format": "date"
+          },
+          "valid_to": {
+            "type": "string",
+            "format": "date",
+            "nullable": true
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 40,
+            "default": "'active'"
+          },
+          "created_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "updated_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": [
+          "tenant_id",
+          "catalog_id",
+          "table_name",
+          "version",
+          "table_json",
+          "valid_from",
+          "created_at"
+        ]
+      },
+      "CreateNormativeMetrologicalTableDto": {
+        "type": "object",
+        "properties": {
+          "catalog_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "table_name": {
+            "type": "string",
+            "maxLength": 160
+          },
+          "version": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "table_json": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "valid_from": {
+            "type": "string",
+            "format": "date"
+          },
+          "valid_to": {
+            "type": "string",
+            "format": "date",
+            "nullable": true
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 40,
+            "default": "'active'"
+          }
+        },
+        "required": [
+          "catalog_id",
+          "table_name",
+          "version",
+          "table_json",
+          "valid_from"
+        ]
       },
       "NormativeValidationRule": {
         "type": "object",
@@ -1262,10 +1654,15 @@
             "type": "string",
             "format": "uuid"
           },
-          "document_type": {
+          "document_kind": {
             "type": "string",
             "maxLength": 80
           },
+          "domain_scope": {
+            "type": "string",
+            "maxLength": 80,
+            "default": "'inf'"
+          },
           "name": {
             "type": "string",
             "maxLength": 255
@@ -1299,7 +1696,7 @@
         "required": [
           "tenant_id",
           "traffic_agency_id",
-          "document_type",
+          "document_kind",
           "name",
           "version",
           "template_body",
@@ -1314,10 +1711,15 @@
             "type": "string",
             "format": "uuid"
           },
-          "document_type": {
+          "document_kind": {
             "type": "string",
             "maxLength": 80
           },
+          "domain_scope": {
+            "type": "string",
+            "maxLength": 80,
+            "default": "'inf'"
+          },
           "name": {
             "type": "string",
             "maxLength": 255
@@ -1341,13 +1743,123 @@
         },
         "required": [
           "traffic_agency_id",
-          "document_type",
+          "document_kind",
           "name",
           "version",
           "template_body",
           "valid_from"
         ]
       },
+      "SignaturePolicy": {
+        "type": "object",
+        "properties": {
+          "id": {
+            "type": "string",
+            "format": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          "tenant_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "traffic_agency_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "document_kind": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "required_signers_json": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "pades_level": {
+            "type": "string",
+            "maxLength": 40
+          },
+          "tsa_required": {
+            "type": "boolean",
+            "default": "false"
+          },
+          "pdfa_required": {
+            "type": "boolean",
+            "default": "false"
+          },
+          "govbr_level": {
+            "type": "string",
+            "maxLength": 40,
+            "nullable": true
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 40,
+            "default": "'active'"
+          },
+          "created_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "updated_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": [
+          "tenant_id",
+          "traffic_agency_id",
+          "document_kind",
+          "required_signers_json",
+          "pades_level",
+          "created_at"
+        ]
+      },
+      "CreateSignaturePolicyDto": {
+        "type": "object",
+        "properties": {
+          "traffic_agency_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "document_kind": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "required_signers_json": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "pades_level": {
+            "type": "string",
+            "maxLength": 40
+          },
+          "tsa_required": {
+            "type": "boolean",
+            "default": "false"
+          },
+          "pdfa_required": {
+            "type": "boolean",
+            "default": "false"
+          },
+          "govbr_level": {
+            "type": "string",
+            "maxLength": 40,
+            "nullable": true
+          },
+          "status": {
+            "type": "string",
+            "maxLength": 40,
+            "default": "'active'"
+          }
+        },
+        "required": [
+          "traffic_agency_id",
+          "document_kind",
+          "required_signers_json",
+          "pades_level"
+        ]
+      },
       "MobileNormativePackage": {
         "type": "object",
         "properties": {
diff --git a/tools/blueprints/generated-files.json b/tools/blueprints/generated-files.json
index d33bba3..dc1c5fa 100644
--- a/tools/blueprints/generated-files.json
+++ b/tools/blueprints/generated-files.json
@@ -358,6 +358,8 @@
   "backend/domains/ch/toxicology/vitest.config.ts",
   "backend/domains/inf/ait/package.json",
   "backend/domains/inf/ait/src/ait.module.ts",
+  "backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts",
+  "backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts",
   "backend/domains/inf/ait/src/controllers/ait-correction.controller.ts",
   "backend/domains/inf/ait/src/controllers/ait-person.controller.ts",
   "backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts",
@@ -365,6 +367,8 @@
   "backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts",
   "backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts",
   "backend/domains/inf/ait/src/controllers/ait.controller.ts",
+  "backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts",
+  "backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts",
   "backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts",
   "backend/domains/inf/ait/src/dto/create-ait-person.dto.ts",
   "backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts",
@@ -372,6 +376,8 @@
   "backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts",
   "backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts",
   "backend/domains/inf/ait/src/dto/create-ait.dto.ts",
+  "backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts",
+  "backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts",
   "backend/domains/inf/ait/src/entities/ait-correction.entity.ts",
   "backend/domains/inf/ait/src/entities/ait-person.entity.ts",
   "backend/domains/inf/ait/src/entities/ait-print-event.entity.ts",
@@ -380,6 +386,8 @@
   "backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts",
   "backend/domains/inf/ait/src/entities/ait.entity.ts",
   "backend/domains/inf/ait/src/index.ts",
+  "backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts",
+  "backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts",
   "backend/domains/inf/ait/src/repositories/ait-correction.repository.ts",
   "backend/domains/inf/ait/src/repositories/ait-person.repository.ts",
   "backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts",
@@ -387,6 +395,8 @@
   "backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts",
   "backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts",
   "backend/domains/inf/ait/src/repositories/ait.repository.ts",
+  "backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts",
+  "backend/domains/inf/ait/src/services/ait-cancel-request.service.ts",
   "backend/domains/inf/ait/src/services/ait-correction.service.ts",
   "backend/domains/inf/ait/src/services/ait-person.service.ts",
   "backend/domains/inf/ait/src/services/ait-print-event.service.ts",
@@ -511,19 +521,25 @@
   "backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts",
   "backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts",
   "backend/domains/inf/normative/src/controllers/normative-framing.controller.ts",
+  "backend/domains/inf/normative/src/controllers/normative-metrological-table.controller.ts",
   "backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts",
+  "backend/domains/inf/normative/src/controllers/signature-policy.controller.ts",
   "backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts",
   "backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts",
   "backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts",
   "backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts",
   "backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts",
+  "backend/domains/inf/normative/src/dto/create-normative-metrological-table.dto.ts",
   "backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts",
+  "backend/domains/inf/normative/src/dto/create-signature-policy.dto.ts",
   "backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts",
   "backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts",
   "backend/domains/inf/normative/src/entities/normative-catalog.entity.ts",
   "backend/domains/inf/normative/src/entities/normative-document-template.entity.ts",
   "backend/domains/inf/normative/src/entities/normative-framing.entity.ts",
+  "backend/domains/inf/normative/src/entities/normative-metrological-table.entity.ts",
   "backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts",
+  "backend/domains/inf/normative/src/entities/signature-policy.entity.ts",
   "backend/domains/inf/normative/src/index.ts",
   "backend/domains/inf/normative/src/normative.module.ts",
   "backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts",
@@ -531,13 +547,17 @@
   "backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts",
   "backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts",
   "backend/domains/inf/normative/src/repositories/normative-framing.repository.ts",
+  "backend/domains/inf/normative/src/repositories/normative-metrological-table.repository.ts",
   "backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts",
+  "backend/domains/inf/normative/src/repositories/signature-policy.repository.ts",
   "backend/domains/inf/normative/src/services/mobile-normative-package.service.ts",
   "backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts",
   "backend/domains/inf/normative/src/services/normative-catalog.service.ts",
   "backend/domains/inf/normative/src/services/normative-document-template.service.ts",
   "backend/domains/inf/normative/src/services/normative-framing.service.ts",
+  "backend/domains/inf/normative/src/services/normative-metrological-table.service.ts",
   "backend/domains/inf/normative/src/services/normative-validation-rule.service.ts",
+  "backend/domains/inf/normative/src/services/signature-policy.service.ts",
   "backend/domains/inf/normative/tsconfig.build.json",
   "backend/domains/inf/normative/tsconfig.json",
   "backend/domains/inf/normative/vitest.config.ts",
diff --git a/tools/check-lifecycle-vocabulary.ts b/tools/check-lifecycle-vocabulary.ts
index 9558028..60a0968 100644
--- a/tools/check-lifecycle-vocabulary.ts
+++ b/tools/check-lifecycle-vocabulary.ts
@@ -39,6 +39,20 @@ const wf2 = fs.readFileSync(
   ),
   'utf8',
 );
+const teatWf = fs.readFileSync(
+  path.join(
+    root,
+    'docs',
+    'framework',
+    'product',
+    'domains',
+    'inf',
+    'teat',
+    'workflows',
+    'WF-TEAT-001.md',
+  ),
+  'utf8',
+);

 function seededCodes(table: string): Set<string> {
   const start = ddl.indexOf(`INSERT INTO ${table}`);
@@ -102,6 +116,16 @@ const ddlStates = seededCodes('inf.infraction_state_ref');
 const ddlSubstates = seededCodes('inf.infraction_substate_ref');
 const ddlTimers = seededCodes('inf.infraction_timer_ref');

+const aitStatesSection = section(teatWf, '## Estados', '## Transições');
+const workflowAitStates = new Set<string>();
+for (const match of aitStatesSection.matchAll(
+  /^\s*([A-Z][A-Z0-9_]+)\s+-->\s+([A-Z][A-Z0-9_]+)/gm,
+)) {
+  if (match[1] && match[1] !== 'AIT') workflowAitStates.add(match[1]);
+  if (match[2] && match[2] !== 'AIT') workflowAitStates.add(match[2]);
+}
+const ddlAitStates = seededCodes('inf.ait_state_ref');
+
 const problems: string[] = [];
 const compare = (
   label: string,
@@ -124,6 +148,7 @@ compare(
   new Set([...ddlSubstates].filter((code) => code !== 'PRAZO_DEFESA_ABERTO')),
 );
 compare('timer', docTimers, ddlTimers, false);
+compare('AIT state', workflowAitStates, ddlAitStates);

 if (problems.length > 0) {
   console.error(
@@ -133,6 +158,6 @@ if (problems.length > 0) {
   process.exitCode = 1;
 } else {
   console.log(
-    `check-lifecycle-vocabulary: OK (${ddlStates.size} states, ${ddlSubstates.size} substates, ${ddlTimers.size} timers)`,
+    `check-lifecycle-vocabulary: OK (${ddlStates.size} states, ${ddlSubstates.size} substates, ${ddlTimers.size} timers, ${ddlAitStates.size} AIT states)`,
   );
 }
diff --git a/work/rounds/R-0005/budget.json b/work/rounds/R-0005/budget.json
index 82d0ab3..049bc8d 100644
--- a/work/rounds/R-0005/budget.json
+++ b/work/rounds/R-0005/budget.json
@@ -322,8 +322,9 @@
       "model": "gpt-5.6-terra",
       "estimated_input_tokens": 150000,
       "estimated_output_tokens": 30000,
-      "status": "in_progress",
-      "window": 9
+      "status": "completed",
+      "window": 9,
+      "result": "PASS; four INF blueprints advanced to v1.1.0, R-0004 normative param-store preserved, lifecycle vocabulary and generated artifacts synchronized; independent Engineer acceptance gates passed"
     },
     {
       "kind": "worker-task",
@@ -331,7 +332,9 @@
       "model": "gpt-5.6-luna",
       "estimated_input_tokens": 60000,
       "estimated_output_tokens": 12000,
-      "status": "window-2"
+      "status": "completed",
+      "window": 9,
+      "result": "PASS after iteration 1; four INF contract specs added, canonical AIT unit test exposes the expected service plant-bug, and fresh-database integration passes 2/2 with explicit coverage of four new tenant tables"
     },
     {
       "kind": "worker-task",
@@ -339,7 +342,9 @@
       "model": "gpt-5.6-luna",
       "estimated_input_tokens": 80000,
       "estimated_output_tokens": 16000,
-      "status": "window-2"
+      "status": "completed",
+      "window": 9,
+      "result": "PASS after Engineer iteration 1 and Inspector final escalation; canonical 17-state lifecycle, alcohol refusal kind, backend:test:ci and pnpm check all green"
     },
     {
       "kind": "worker-task",
@@ -347,7 +352,9 @@
       "model": "gpt-5.6-luna",
       "estimated_input_tokens": 50000,
       "estimated_output_tokens": 10000,
-      "status": "window-2"
+      "status": "completed",
+      "window": 9,
+      "result": "PASS after iteration 1; deterministic 17/17 AIT coverage, all numbering reservation states, device postures, published normative package, idempotent double seed and RLS smoke"
     },
     {
       "kind": "worker-task",
diff --git a/work/rounds/R-0005/plan.md b/work/rounds/R-0005/plan.md
index 269d9c6..d3e08d4 100644
--- a/work/rounds/R-0005/plan.md
+++ b/work/rounds/R-0005/plan.md
@@ -235,9 +235,74 @@ Checkpoint da janela 1 em 2026-09-14:
 - CTG-0002 iniciado por autorizacao do Owner em 2026-09-14. TASK-0005 foi marcada `in_progress`
   para despacho Architect Terra/alto com a composicao fechada `PC-9da7ddfeadf987ff`; TASK-0006 e
   TASK-0007 permanecem queued ate a conclusao e o checkpoint das respectivas dependencias.
+- TASK-0005 Architect concluida e confirmada pelo checkpoint Engineer independente. Os quatro
+  blueprints INF estao em 1.1.0; a superficie param-store de R-0004 foi preservada; contratos e
+  arvore gerada estao sincronizados. Gates: `format:check`, `blueprints:check`, `contracts:check`,
+  `verify:rls-ddl` (159 tabelas tenant) e `verify:lifecycle-vocabulary` (15 estados, 12 subestados,
+  24 timers) passaram. TASK-0006 esta pronta pela dependencia, mas permanece queued e sem worker
+  ate novo despacho do maestro.
+- TASK-0006 Inspector iniciada na sequencia autorizada do CTG-0002, composicao fechada
+  `PC-2edfc6daa6fd170c`, modelo Luna/medio. TASK-0007 permanece queued ate a conclusao e o
+  checkpoint independente dos testes.
+- TASK-0006 Inspector concluida na iteracao 1. O integration AIT passou 2/2 no banco reaplicado,
+  exigindo 62 tabelas tenant, 10 referencias e prova explicita das quatro tabelas CTG-0002. Os
+  specs normative/measures/alcohol passaram; o spec AIT preserva vermelho o `plant-bug` de tokens
+  legados para TASK-0007. Nenhuma assercao ou cobertura foi reduzida.
+- TASK-0007 Engineer iniciada com a composicao `PC-70787dc5c23875e4`, Luna/medio, para corrigir
+  somente o lifecycle manuscrito e o gate deterministico. Os arquivos manuscritos existentes
+  declarados por `handwrittenExports` no blueprint AIT ficam na raiz de `src/`; essa localizacao
+  concreta e a fronteira autorizada do prompt, sem permitir outros fontes manuscritos.
+- TASK-0007 implementou o lifecycle canonico e o gate de 17 estados; unit 3/3, typecheck e
+  integration 2/2 passaram apos a iteracao final do Inspector. O gate composto esta bloqueado
+  exclusivamente pelo seed existente incompatível com `approach_class`. Para evitar dependencia
+  circular entre o acceptance de TASK-0007 e o lock MOD-seed, TASK-0008 foi iniciada na sua
+  fronteira de fixtures antes de declarar TASK-0007 completed; ambos os gates serao repetidos
+  depois. Nenhuma responsabilidade de papel foi transferida.
+- TASK-0007 e TASK-0008 concluidas. O checkpoint composto repetido passou integralmente:
+  `backend:test:ci`, `pnpm check`, seed idempotente em duas execucoes, RLS smoke, cobertura
+  independente 17/17 dos estados AIT e os quatro estados de reserva. TASK-0008 exigiu iteracao 1
+  porque a entrega inicial omitira os AITs por estado; o mesmo Engineer corrigiu apenas o fixture
+  TEAT e nenhum gate foi enfraquecido. Proximo passo: delivery-review independente de CTG-0002 e
+  CTG-0003 antes de qualquer commit.

 ## Triagem

+- TASK-0008 iteracao 0: a entrega inicial continha dispositivos, reservas e pacote normativo, mas
+  omitia o requisito explicito de um AIT por cada estado canonico. Classificacao: `plant-bug` no
+  fixture. A iteracao 1 adicionou cobertura derivada diretamente de `inf.ait_state_ref`; consulta
+  independente confirmou 17/17 e os gates de banco permaneceram verdes.
+- Gate composto apos TASK-0008: `backend:test:ci` passou unit e integration, mas o app e2e tinha
+  uma insercao SQL direta de `normative_framing` sem `approach_class`. Classificacao: `test-bug`.
+  Como TASK-0006 consumiu duas iteracoes e o arquivo pertence ao app, a correcao foi escalada a um
+  Inspector Sol, restrito a essa fixture e sem reduzir cobertura.
+- O mesmo checkpoint `pnpm check` chegou ao typecheck e revelou que o handwritten export
+  `alcohol-lifecycle.service.ts` criava `AlcoholRefusal` sem o novo `kind`. Classificacao:
+  `plant-bug` de integracao do delta. TASK-0007 iteracao 1 foi autorizada apenas nesse arquivo
+  manuscrito para propagar `refusal|technical_impossibility`, sem editar contrato ou teste.
+- TASK-0007 ciclo inicial: o lifecycle canônico tornou vermelho um teste unitario legado que ainda
+  montava `draft`/esperava `issued`, e o typecheck revelou fixture e2e sem o novo
+  `approach_class`. Classificacao: `test-bug` esperado pela mudanca contratual. TASK-0006 retorna
+  ao Inspector na iteracao 2 final para atualizar somente as fixtures/expectativas, preservando
+  hash, assinatura, historico e toda cobertura existente.
+- TASK-0006 iteracao 0: o integration AIT executado pelo worker contra banco anterior observou
+  52 tabelas tenant; apos `apply.sh --full` no `detran_r5`, o checkpoint Engineer observou 62
+  contra a expectativa fixa de 58. Classificacao: `test-bug` por crescimento legitimo do esquema.
+  A iteracao 1 do Inspector deve preservar todas as assercoes e acrescentar prova explicita das
+  quatro tabelas tenant novas de CTG-0002.
+- TASK-0006 checkpoint: o DDL completo aplicou, mas o seed preexistente falhou porque a fixture de
+  `normative_framing` nao fornece o novo `approach_class` obrigatorio. Classificacao provisoria:
+  `plant-bug` de compatibilidade do delta/fixture; nao foi mascarado. A fronteira sera resolvida
+  antes do gate composto, sem enfraquecer schema ou teste.
+- TASK-0005 iteracao 0, pre-mutacao: o lock compartilhado de `BP-INF-NORMATIVE-001` exigiu
+  confirmacao do maestro. O arquivo era byte-identico ao baseline mesclado em `origin/main`
+  (`13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7`); foi autorizado
+  somente o delta aditivo CTG-0002, preservando integralmente `normative_agency_parameter` e a
+  superficie R-0004.
+- TASK-0005 iteracao 0, `reference-gap` de composicao: o prompt exigia os campos `driver_*` e
+  `vehicle_*` exatamente como na origem, mas a leitura fechada nao incluia a fonte que os enumera.
+  O maestro autorizou consulta estritamente read-only apenas a
+  `teat:docs/framework/product/blueprints/BP-ALCOHOL-PROCEDURE-001.json`, fixando
+  `driver_name`, `driver_document`, `vehicle_plate` e `vehicle_make`, sem inventar outros campos.
 - Integracao pos-rebase: a primeira execucao de `backend:test:ci` terminou em `sensor-error`
   antes de observar `@detran/ops-parameter`, porque `pnpm install --lockfile-only` atualizou o
   lockfile sem criar seus links locais. `pnpm install --frozen-lockfile` materializou o workspace;
diff --git a/work/rounds/R-0005/tasks/TASK-0005.json b/work/rounds/R-0005/tasks/TASK-0005.json
index c1fb990..d8947ab 100644
--- a/work/rounds/R-0005/tasks/TASK-0005.json
+++ b/work/rounds/R-0005/tasks/TASK-0005.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0005",
   "round_id": "R-0005",
-  "status": "in_progress",
+  "status": "completed",
   "discipline": "architect",
   "discipline_specialization": "architect-blueprint",
   "title": "Define TEAT inf model deltas and lifecycle vocabulary",
diff --git a/work/rounds/R-0005/tasks/TASK-0006.json b/work/rounds/R-0005/tasks/TASK-0006.json
index 5db4e52..6480ce5 100644
--- a/work/rounds/R-0005/tasks/TASK-0006.json
+++ b/work/rounds/R-0005/tasks/TASK-0006.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0006",
   "round_id": "R-0005",
-  "status": "queued",
+  "status": "completed",
   "discipline": "inspector",
   "discipline_specialization": "inspector-tests",
   "title": "Specify canonical TEAT lifecycle tests",
@@ -15,7 +15,7 @@
   "coupled_pipeline_position": "inspector",
   "upstream_task_id": "TASK-0005",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 2,
   "max_iterations": 2,
   "priority": 2,
   "tags": ["wp-t1", "tests"],
diff --git a/work/rounds/R-0005/tasks/TASK-0007.json b/work/rounds/R-0005/tasks/TASK-0007.json
index 2b8c8b5..dc2bb8a 100644
--- a/work/rounds/R-0005/tasks/TASK-0007.json
+++ b/work/rounds/R-0005/tasks/TASK-0007.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0007",
   "round_id": "R-0005",
-  "status": "queued",
+  "status": "completed",
   "discipline": "engineer",
   "discipline_specialization": "engineer-backend",
   "title": "Implement canonical AIT lifecycle behavior",
@@ -15,7 +15,7 @@
   "coupled_pipeline_position": "engineer",
   "upstream_task_id": "TASK-0006",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 1,
   "max_iterations": 2,
   "priority": 2,
   "tags": ["wp-t1", "inf-lifecycle"],

diff --git a/backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts b/backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts
@@ -0,0 +1,55 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Param,
+  Patch,
+  Post,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import type { CreateAitCancelRequestEventDto } from '../dto/create-ait-cancel-request-event.dto.js';
+import { AitCancelRequestEventService } from '../services/ait-cancel-request-event.service.js';
+
+@Controller('v1/inf/ait/cancel-request-events')
+@Resource('inf:ait-cancel-request-event')
+export class AitCancelRequestEventController {
+  constructor(private readonly service: AitCancelRequestEventService) {}
+  @Get() @Action('read') list() {
+    return this.service.findAll();
+  }
+  @Get(':id') @Action('read') get(@Param('id') id: string) {
+    return this.service.findOne(id);
+  }
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_EVENT_CREATE',
+    entity: 'inf.ait_cancel_request_event',
+  })
+  create(@Body() dto: CreateAitCancelRequestEventDto) {
+    return this.service.create(dto);
+  }
+  @Patch(':id')
+  @Action('update')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_EVENT_UPDATE',
+    entity: 'inf.ait_cancel_request_event',
+  })
+  update(
+    @Param('id') id: string,
+    @Body() dto: Partial<CreateAitCancelRequestEventDto>,
+  ) {
+    return this.service.update(id, dto);
+  }
+  @Delete(':id')
+  @Action('delete')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_EVENT_DELETE',
+    entity: 'inf.ait_cancel_request_event',
+  })
+  remove(@Param('id') id: string) {
+    return this.service.remove(id);
+  }
+}

diff --git a/backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts b/backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts
@@ -0,0 +1,55 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Param,
+  Patch,
+  Post,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
+import { AitCancelRequestService } from '../services/ait-cancel-request.service.js';
+
+@Controller('v1/inf/ait/cancel-requests')
+@Resource('inf:ait-cancel-request')
+export class AitCancelRequestController {
+  constructor(private readonly service: AitCancelRequestService) {}
+  @Get() @Action('read') list() {
+    return this.service.findAll();
+  }
+  @Get(':id') @Action('read') get(@Param('id') id: string) {
+    return this.service.findOne(id);
+  }
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_CREATE',
+    entity: 'inf.ait_cancel_request',
+  })
+  create(@Body() dto: CreateAitCancelRequestDto) {
+    return this.service.create(dto);
+  }
+  @Patch(':id')
+  @Action('update')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_UPDATE',
+    entity: 'inf.ait_cancel_request',
+  })
+  update(
+    @Param('id') id: string,
+    @Body() dto: Partial<CreateAitCancelRequestDto>,
+  ) {
+    return this.service.update(id, dto);
+  }
+  @Delete(':id')
+  @Action('delete')
+  @Audit({
+    action: 'INF_AIT_CANCEL_REQUEST_DELETE',
+    entity: 'inf.ait_cancel_request',
+  })
+  remove(@Param('id') id: string) {
+    return this.service.remove(id);
+  }
+}

diff --git a/backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts
@@ -0,0 +1,9 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+export interface CreateAitCancelRequestEventDto {
+  cancel_request_id: string;
+  event_type: string;
+  event_at?: string;
+  actor_user_ref?: string | null;
+  decision?: string | null;
+  details_json?: Record<string, unknown> | null;
+}

diff --git a/backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts b/backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts
@@ -0,0 +1,12 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+export interface CreateAitCancelRequestDto {
+  ait_id: string;
+  kind: string;
+  target_local_act_id?: string | null;
+  origin_status: string;
+  addressed_to: string;
+  status?: string;
+  decision?: string | null;
+  requested_at?: string;
+  decided_at?: string | null;
+}

diff --git a/backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts b/backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts
@@ -0,0 +1,13 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+export interface AitCancelRequestEvent {
+  id: string;
+  tenant_id: string;
+  cancel_request_id: string;
+  event_type: string;
+  event_at: string;
+  actor_user_ref?: string | null;
+  decision?: string | null;
+  details_json?: Record<string, unknown> | null;
+  created_at: string;
+  updated_at?: string | null;
+}

diff --git a/backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts b/backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts
@@ -0,0 +1,16 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+export interface AitCancelRequest {
+  id: string;
+  tenant_id: string;
+  ait_id: string;
+  kind: string;
+  target_local_act_id?: string | null;
+  origin_status: string;
+  addressed_to: string;
+  status: string;
+  decision?: string | null;
+  requested_at: string;
+  decided_at?: string | null;
+  created_at: string;
+  updated_at?: string | null;
+}

diff --git a/backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts b/backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts
@@ -0,0 +1,131 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import { Injectable, NotFoundException } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import type { CreateAitCancelRequestEventDto } from '../dto/create-ait-cancel-request-event.dto.js';
+import type { AitCancelRequestEvent } from '../entities/ait-cancel-request-event.entity.js';
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+const WRITABLE_FIELDS = new Set<string>([
+  'cancel_request_id',
+  'event_type',
+  'event_at',
+  'actor_user_ref',
+  'decision',
+  'details_json',
+]);
+
+/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
+@Injectable()
+export class AitCancelRequestEventRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+  findAll(transaction?: Transaction): Promise<AitCancelRequestEvent[]> {
+    return this.execute(
+      transaction,
+      async (tx) =>
+        (
+          await tx.query<AitCancelRequestEvent & Record<string, unknown>>(
+            'select * from inf.ait_cancel_request_event order by created_at desc limit 500',
+          )
+        ).rows,
+    );
+  }
+  async findOne(
+    id: string,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequestEvent> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<AitCancelRequestEvent & Record<string, unknown>>(
+        'select * from inf.ait_cancel_request_event where id = $1 limit 1',
+        [id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('AitCancelRequestEvent ' + id + ' not found');
+    return row;
+  }
+  create(
+    dto: CreateAitCancelRequestEventDto,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequestEvent> {
+    return this.write('insert', undefined, dto, transaction);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateAitCancelRequestEventDto>,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequestEvent> {
+    return this.write('update', id, dto, transaction);
+  }
+  async remove(id: string, transaction?: Transaction): Promise<void> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query(
+        'delete from inf.ait_cancel_request_event where id = $1 returning id',
+        [id],
+      ),
+    );
+    if (!result.rows[0])
+      throw new NotFoundException('AitCancelRequestEvent ' + id + ' not found');
+  }
+  private async write(
+    operation: 'insert' | 'update',
+    id: string | undefined,
+    dto: Partial<CreateAitCancelRequestEventDto>,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequestEvent> {
+    const entries = Object.entries(dto).filter(
+      ([, value]) => value !== undefined,
+    );
+    if (
+      !entries.length ||
+      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
+    )
+      throw new Error('Invalid AitCancelRequestEvent write fields');
+    const columns = entries.map(([field]) => field);
+    const values = entries.map(([, value]) => value);
+    const insertSql =
+      'insert into inf.ait_cancel_request_event (' +
+      columns.join(', ') +
+      ') values (' +
+      columns.map((_, index) => '
 + (index + 1)).join(', ') +
+      ') returning *';
+    const updateSql =
+      'update inf.ait_cancel_request_event set ' +
+      columns.map((field, index) => field + ' =
 + (index + 1)).join(', ') +
+      ', updated_at = now() where id =
 +
+      (columns.length + 1) +
+      ' returning *';
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<AitCancelRequestEvent & Record<string, unknown>>(
+        operation === 'insert' ? insertSql : updateSql,
+        operation === 'insert' ? values : [...values, id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('AitCancelRequestEvent ' + id + ' not found');
+    return row;
+  }
+  private execute<T>(
+    transaction: Transaction | undefined,
+    work: (transaction: SqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    if (transaction) return work(transaction as SqlTransaction);
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      work(tx as SqlTransaction),
+    );
+  }
+}

diff --git a/backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts b/backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts
@@ -0,0 +1,134 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import { Injectable, NotFoundException } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
+import type { AitCancelRequest } from '../entities/ait-cancel-request.entity.js';
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+const WRITABLE_FIELDS = new Set<string>([
+  'ait_id',
+  'kind',
+  'target_local_act_id',
+  'origin_status',
+  'addressed_to',
+  'status',
+  'decision',
+  'requested_at',
+  'decided_at',
+]);
+
+/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
+@Injectable()
+export class AitCancelRequestRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+  findAll(transaction?: Transaction): Promise<AitCancelRequest[]> {
+    return this.execute(
+      transaction,
+      async (tx) =>
+        (
+          await tx.query<AitCancelRequest & Record<string, unknown>>(
+            'select * from inf.ait_cancel_request order by created_at desc limit 500',
+          )
+        ).rows,
+    );
+  }
+  async findOne(
+    id: string,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequest> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<AitCancelRequest & Record<string, unknown>>(
+        'select * from inf.ait_cancel_request where id = $1 limit 1',
+        [id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
+    return row;
+  }
+  create(
+    dto: CreateAitCancelRequestDto,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequest> {
+    return this.write('insert', undefined, dto, transaction);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateAitCancelRequestDto>,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequest> {
+    return this.write('update', id, dto, transaction);
+  }
+  async remove(id: string, transaction?: Transaction): Promise<void> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query(
+        'delete from inf.ait_cancel_request where id = $1 returning id',
+        [id],
+      ),
+    );
+    if (!result.rows[0])
+      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
+  }
+  private async write(
+    operation: 'insert' | 'update',
+    id: string | undefined,
+    dto: Partial<CreateAitCancelRequestDto>,
+    transaction?: Transaction,
+  ): Promise<AitCancelRequest> {
+    const entries = Object.entries(dto).filter(
+      ([, value]) => value !== undefined,
+    );
+    if (
+      !entries.length ||
+      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
+    )
+      throw new Error('Invalid AitCancelRequest write fields');
+    const columns = entries.map(([field]) => field);
+    const values = entries.map(([, value]) => value);
+    const insertSql =
+      'insert into inf.ait_cancel_request (' +
+      columns.join(', ') +
+      ') values (' +
+      columns.map((_, index) => '
 + (index + 1)).join(', ') +
+      ') returning *';
+    const updateSql =
+      'update inf.ait_cancel_request set ' +
+      columns.map((field, index) => field + ' =
 + (index + 1)).join(', ') +
+      ', updated_at = now() where id =
 +
+      (columns.length + 1) +
+      ' returning *';
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<AitCancelRequest & Record<string, unknown>>(
+        operation === 'insert' ? insertSql : updateSql,
+        operation === 'insert' ? values : [...values, id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
+    return row;
+  }
+  private execute<T>(
+    transaction: Transaction | undefined,
+    work: (transaction: SqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    if (transaction) return work(transaction as SqlTransaction);
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      work(tx as SqlTransaction),
+    );
+  }
+}

diff --git a/backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts b/backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts
@@ -0,0 +1,28 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import { Injectable } from '@nestjs/common';
+import { AitCancelRequestEventRepository } from '../repositories/ait-cancel-request-event.repository.js';
+import type { AitCancelRequestEvent } from '../entities/ait-cancel-request-event.entity.js';
+import type { CreateAitCancelRequestEventDto } from '../dto/create-ait-cancel-request-event.dto.js';
+
+@Injectable()
+export class AitCancelRequestEventService {
+  constructor(private readonly repository: AitCancelRequestEventRepository) {}
+  findAll(): Promise<AitCancelRequestEvent[]> {
+    return this.repository.findAll();
+  }
+  findOne(id: string): Promise<AitCancelRequestEvent> {
+    return this.repository.findOne(id);
+  }
+  create(dto: CreateAitCancelRequestEventDto): Promise<AitCancelRequestEvent> {
+    return this.repository.create(dto);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateAitCancelRequestEventDto>,
+  ): Promise<AitCancelRequestEvent> {
+    return this.repository.update(id, dto);
+  }
+  remove(id: string): Promise<void> {
+    return this.repository.remove(id);
+  }
+}

diff --git a/backend/domains/inf/ait/src/services/ait-cancel-request.service.ts b/backend/domains/inf/ait/src/services/ait-cancel-request.service.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/ait/src/services/ait-cancel-request.service.ts
@@ -0,0 +1,28 @@
+// Generated from BP-INF-AIT-001 v1.1.0 sha256:f3c036b81f4291f13206a2d90a7ad59b0a9684899694fdf5a15cbaf1ee08e609
+import { Injectable } from '@nestjs/common';
+import { AitCancelRequestRepository } from '../repositories/ait-cancel-request.repository.js';
+import type { AitCancelRequest } from '../entities/ait-cancel-request.entity.js';
+import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
+
+@Injectable()
+export class AitCancelRequestService {
+  constructor(private readonly repository: AitCancelRequestRepository) {}
+  findAll(): Promise<AitCancelRequest[]> {
+    return this.repository.findAll();
+  }
+  findOne(id: string): Promise<AitCancelRequest> {
+    return this.repository.findOne(id);
+  }
+  create(dto: CreateAitCancelRequestDto): Promise<AitCancelRequest> {
+    return this.repository.create(dto);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateAitCancelRequestDto>,
+  ): Promise<AitCancelRequest> {
+    return this.repository.update(id, dto);
+  }
+  remove(id: string): Promise<void> {
+    return this.repository.remove(id);
+  }
+}

diff --git a/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
@@ -0,0 +1,50 @@
+import { readFileSync } from 'node:fs';
+import { describe, expect, it } from 'vitest';
+
+const blueprint = JSON.parse(
+  readFileSync(
+    new URL(
+      '../../../../../docs/framework/blueprints/BP-INF-ALCOHOL-001.json',
+      import.meta.url,
+    ),
+    'utf8',
+  ),
+) as {
+  module: { version: string };
+  database: {
+    entities: Array<{
+      table: string;
+      fields?: Array<{ name: string }>;
+      checks?: Array<{ expression: string }>;
+    }>;
+  };
+};
+
+describe('BP-INF-ALCOHOL-001 v1.1.0', () => {
+  it('dado uma alcoolemia quando inspecionada então preserva o par de medição e distingue recusa de impossibilidade técnica', () => {
+    expect(blueprint.module.version).toBe('1.1.0');
+    const test = blueprint.database.entities.find(
+      (entity) => entity.table === 'alcohol_test',
+    );
+    expect(test?.fields?.map((column) => column.name)).toEqual(
+      expect.arrayContaining(['considered_mg_l', 'max_error_mg_l']),
+    );
+    expect(
+      test?.checks?.some(
+        (check) =>
+          check.expression.includes('considered_mg_l') &&
+          check.expression.includes('max_error_mg_l'),
+      ),
+    ).toBe(true);
+    const refusal = blueprint.database.entities.find(
+      (entity) => entity.table === 'alcohol_refusal',
+    );
+    expect(
+      refusal?.checks?.some(
+        (check) =>
+          check.expression.includes("'refusal'") &&
+          check.expression.includes("'technical_impossibility'"),
+      ),
+    ).toBe(true);
+  });
+});

diff --git a/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
@@ -0,0 +1,64 @@
+import { readFileSync } from 'node:fs';
+import { describe, expect, it } from 'vitest';
+
+const blueprint = JSON.parse(
+  readFileSync(
+    new URL(
+      '../../../../../docs/framework/blueprints/BP-INF-MEASURES-001.json',
+      import.meta.url,
+    ),
+    'utf8',
+  ),
+) as {
+  module: { version: string };
+  database: {
+    entities: Array<{
+      table: string;
+      fields?: Array<{ name: string }>;
+      checks?: Array<{ expression: string }>;
+    }>;
+  };
+};
+
+describe('BP-INF-MEASURES-001 v1.1.0', () => {
+  it('dado uma medida administrativa quando inspecionada então separa os prazos e restringe estados e limites', () => {
+    expect(blueprint.module.version).toBe('1.1.0');
+    const term = blueprint.database.entities.find(
+      (entity) => entity.table === 'administrative_term',
+    );
+    expect(term?.fields?.map((column) => column.name)).toEqual(
+      expect.arrayContaining([
+        'withdrawal_deadline_at',
+        'ctb_deadline_at',
+        'signer_name',
+        'field_details_json',
+      ]),
+    );
+    const measure = blueprint.database.entities.find(
+      (entity) => entity.table === 'administrative_measure',
+    );
+    expect(
+      measure?.checks?.some(
+        (check) =>
+          check.expression.includes('RETIDO') &&
+          check.expression.includes('VIOLACAO_MONITORAMENTO'),
+      ),
+    ).toBe(true);
+    const retention = blueprint.database.entities.find(
+      (entity) => entity.table === 'measure_retention',
+    );
+    const removal = blueprint.database.entities.find(
+      (entity) => entity.table === 'measure_removal',
+    );
+    expect(
+      retention?.checks?.some((check) =>
+        check.expression.includes('between 1 and 30'),
+      ),
+    ).toBe(true);
+    expect(
+      removal?.checks?.some((check) =>
+        check.expression.includes('between 1 and 15'),
+      ),
+    ).toBe(true);
+  });
+});

diff --git a/backend/domains/inf/normative/src/controllers/normative-metrological-table.controller.ts b/backend/domains/inf/normative/src/controllers/normative-metrological-table.controller.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/controllers/normative-metrological-table.controller.ts
@@ -0,0 +1,55 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Param,
+  Patch,
+  Post,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import type { CreateNormativeMetrologicalTableDto } from '../dto/create-normative-metrological-table.dto.js';
+import { NormativeMetrologicalTableService } from '../services/normative-metrological-table.service.js';
+
+@Controller('v1/inf/normative/metrological-tables')
+@Resource('inf:normative-metrological-table')
+export class NormativeMetrologicalTableController {
+  constructor(private readonly service: NormativeMetrologicalTableService) {}
+  @Get() @Action('read') list() {
+    return this.service.findAll();
+  }
+  @Get(':id') @Action('read') get(@Param('id') id: string) {
+    return this.service.findOne(id);
+  }
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_CREATE',
+    entity: 'inf.normative_metrological_table',
+  })
+  create(@Body() dto: CreateNormativeMetrologicalTableDto) {
+    return this.service.create(dto);
+  }
+  @Patch(':id')
+  @Action('update')
+  @Audit({
+    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_UPDATE',
+    entity: 'inf.normative_metrological_table',
+  })
+  update(
+    @Param('id') id: string,
+    @Body() dto: Partial<CreateNormativeMetrologicalTableDto>,
+  ) {
+    return this.service.update(id, dto);
+  }
+  @Delete(':id')
+  @Action('delete')
+  @Audit({
+    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_DELETE',
+    entity: 'inf.normative_metrological_table',
+  })
+  remove(@Param('id') id: string) {
+    return this.service.remove(id);
+  }
+}

diff --git a/backend/domains/inf/normative/src/controllers/signature-policy.controller.ts b/backend/domains/inf/normative/src/controllers/signature-policy.controller.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/controllers/signature-policy.controller.ts
@@ -0,0 +1,55 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Param,
+  Patch,
+  Post,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import type { CreateSignaturePolicyDto } from '../dto/create-signature-policy.dto.js';
+import { SignaturePolicyService } from '../services/signature-policy.service.js';
+
+@Controller('v1/inf/normative/signature-policies')
+@Resource('inf:signature-policy')
+export class SignaturePolicyController {
+  constructor(private readonly service: SignaturePolicyService) {}
+  @Get() @Action('read') list() {
+    return this.service.findAll();
+  }
+  @Get(':id') @Action('read') get(@Param('id') id: string) {
+    return this.service.findOne(id);
+  }
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'INF_SIGNATURE_POLICY_CREATE',
+    entity: 'inf.signature_policy',
+  })
+  create(@Body() dto: CreateSignaturePolicyDto) {
+    return this.service.create(dto);
+  }
+  @Patch(':id')
+  @Action('update')
+  @Audit({
+    action: 'INF_SIGNATURE_POLICY_UPDATE',
+    entity: 'inf.signature_policy',
+  })
+  update(
+    @Param('id') id: string,
+    @Body() dto: Partial<CreateSignaturePolicyDto>,
+  ) {
+    return this.service.update(id, dto);
+  }
+  @Delete(':id')
+  @Action('delete')
+  @Audit({
+    action: 'INF_SIGNATURE_POLICY_DELETE',
+    entity: 'inf.signature_policy',
+  })
+  remove(@Param('id') id: string) {
+    return this.service.remove(id);
+  }
+}

diff --git a/backend/domains/inf/normative/src/dto/create-normative-metrological-table.dto.ts b/backend/domains/inf/normative/src/dto/create-normative-metrological-table.dto.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/dto/create-normative-metrological-table.dto.ts
@@ -0,0 +1,10 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+export interface CreateNormativeMetrologicalTableDto {
+  catalog_id: string;
+  table_name: string;
+  version: string;
+  table_json: Record<string, unknown>;
+  valid_from: string;
+  valid_to?: string | null;
+  status?: string;
+}

diff --git a/backend/domains/inf/normative/src/dto/create-signature-policy.dto.ts b/backend/domains/inf/normative/src/dto/create-signature-policy.dto.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/dto/create-signature-policy.dto.ts
@@ -0,0 +1,11 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+export interface CreateSignaturePolicyDto {
+  traffic_agency_id: string;
+  document_kind: string;
+  required_signers_json: Record<string, unknown>;
+  pades_level: string;
+  tsa_required?: boolean;
+  pdfa_required?: boolean;
+  govbr_level?: string | null;
+  status?: string;
+}

diff --git a/backend/domains/inf/normative/src/entities/normative-metrological-table.entity.ts b/backend/domains/inf/normative/src/entities/normative-metrological-table.entity.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/entities/normative-metrological-table.entity.ts
@@ -0,0 +1,14 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+export interface NormativeMetrologicalTable {
+  id: string;
+  tenant_id: string;
+  catalog_id: string;
+  table_name: string;
+  version: string;
+  table_json: Record<string, unknown>;
+  valid_from: string;
+  valid_to?: string | null;
+  status: string;
+  created_at: string;
+  updated_at?: string | null;
+}

diff --git a/backend/domains/inf/normative/src/entities/signature-policy.entity.ts b/backend/domains/inf/normative/src/entities/signature-policy.entity.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/entities/signature-policy.entity.ts
@@ -0,0 +1,15 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+export interface SignaturePolicy {
+  id: string;
+  tenant_id: string;
+  traffic_agency_id: string;
+  document_kind: string;
+  required_signers_json: Record<string, unknown>;
+  pades_level: string;
+  tsa_required: boolean;
+  pdfa_required: boolean;
+  govbr_level?: string | null;
+  status: string;
+  created_at: string;
+  updated_at?: string | null;
+}

diff --git a/backend/domains/inf/normative/src/normative-blueprint-contract.spec.ts b/backend/domains/inf/normative/src/normative-blueprint-contract.spec.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/normative-blueprint-contract.spec.ts
@@ -0,0 +1,51 @@
+import { readFileSync } from 'node:fs';
+import { describe, expect, it } from 'vitest';
+
+const blueprint = JSON.parse(
+  readFileSync(
+    new URL(
+      '../../../../../docs/framework/blueprints/BP-INF-NORMATIVE-001.json',
+      import.meta.url,
+    ),
+    'utf8',
+  ),
+) as {
+  module: { version: string };
+  database: {
+    entities: Array<{
+      table: string;
+      fields?: Array<{ name: string }>;
+      checks?: Array<{ expression: string }>;
+    }>;
+  };
+};
+
+describe('BP-INF-NORMATIVE-001 v1.1.0', () => {
+  it('dado o blueprint normativo quando inspecionado então expõe a tabela metrológica e os campos de framing', () => {
+    expect(blueprint.module.version).toBe('1.1.0');
+    expect(
+      blueprint.database.entities.some(
+        (entity) => entity.table === 'normative_metrological_table',
+      ),
+    ).toBe(true);
+    const framing = blueprint.database.entities.find(
+      (entity) => entity.table === 'normative_framing',
+    );
+    expect(framing?.fields?.map((column) => column.name)).toEqual(
+      expect.arrayContaining([
+        'approach_class',
+        'required_fields',
+        'required_instrument',
+        'points_label',
+      ]),
+    );
+    expect(
+      framing?.checks?.some(
+        (check) =>
+          check.expression.includes('caso_1') &&
+          check.expression.includes('caso_2') &&
+          check.expression.includes('caso_3'),
+      ),
+    ).toBe(true);
+  });
+});

diff --git a/backend/domains/inf/normative/src/repositories/normative-metrological-table.repository.ts b/backend/domains/inf/normative/src/repositories/normative-metrological-table.repository.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/repositories/normative-metrological-table.repository.ts
@@ -0,0 +1,138 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import { Injectable, NotFoundException } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import type { CreateNormativeMetrologicalTableDto } from '../dto/create-normative-metrological-table.dto.js';
+import type { NormativeMetrologicalTable } from '../entities/normative-metrological-table.entity.js';
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+const WRITABLE_FIELDS = new Set<string>([
+  'catalog_id',
+  'table_name',
+  'version',
+  'table_json',
+  'valid_from',
+  'valid_to',
+  'status',
+]);
+
+/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
+@Injectable()
+export class NormativeMetrologicalTableRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+  findAll(transaction?: Transaction): Promise<NormativeMetrologicalTable[]> {
+    return this.execute(
+      transaction,
+      async (tx) =>
+        (
+          await tx.query<NormativeMetrologicalTable & Record<string, unknown>>(
+            'select * from inf.normative_metrological_table order by created_at desc limit 500',
+          )
+        ).rows,
+    );
+  }
+  async findOne(
+    id: string,
+    transaction?: Transaction,
+  ): Promise<NormativeMetrologicalTable> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<NormativeMetrologicalTable & Record<string, unknown>>(
+        'select * from inf.normative_metrological_table where id = $1 limit 1',
+        [id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException(
+        'NormativeMetrologicalTable ' + id + ' not found',
+      );
+    return row;
+  }
+  create(
+    dto: CreateNormativeMetrologicalTableDto,
+    transaction?: Transaction,
+  ): Promise<NormativeMetrologicalTable> {
+    return this.write('insert', undefined, dto, transaction);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateNormativeMetrologicalTableDto>,
+    transaction?: Transaction,
+  ): Promise<NormativeMetrologicalTable> {
+    return this.write('update', id, dto, transaction);
+  }
+  async remove(id: string, transaction?: Transaction): Promise<void> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query(
+        'delete from inf.normative_metrological_table where id = $1 returning id',
+        [id],
+      ),
+    );
+    if (!result.rows[0])
+      throw new NotFoundException(
+        'NormativeMetrologicalTable ' + id + ' not found',
+      );
+  }
+  private async write(
+    operation: 'insert' | 'update',
+    id: string | undefined,
+    dto: Partial<CreateNormativeMetrologicalTableDto>,
+    transaction?: Transaction,
+  ): Promise<NormativeMetrologicalTable> {
+    const entries = Object.entries(dto).filter(
+      ([, value]) => value !== undefined,
+    );
+    if (
+      !entries.length ||
+      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
+    )
+      throw new Error('Invalid NormativeMetrologicalTable write fields');
+    const columns = entries.map(([field]) => field);
+    const values = entries.map(([, value]) => value);
+    const insertSql =
+      'insert into inf.normative_metrological_table (' +
+      columns.join(', ') +
+      ') values (' +
+      columns.map((_, index) => '
 + (index + 1)).join(', ') +
+      ') returning *';
+    const updateSql =
+      'update inf.normative_metrological_table set ' +
+      columns.map((field, index) => field + ' =
 + (index + 1)).join(', ') +
+      ', updated_at = now() where id =
 +
+      (columns.length + 1) +
+      ' returning *';
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<NormativeMetrologicalTable & Record<string, unknown>>(
+        operation === 'insert' ? insertSql : updateSql,
+        operation === 'insert' ? values : [...values, id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException(
+        'NormativeMetrologicalTable ' + id + ' not found',
+      );
+    return row;
+  }
+  private execute<T>(
+    transaction: Transaction | undefined,
+    work: (transaction: SqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    if (transaction) return work(transaction as SqlTransaction);
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      work(tx as SqlTransaction),
+    );
+  }
+}

diff --git a/backend/domains/inf/normative/src/repositories/signature-policy.repository.ts b/backend/domains/inf/normative/src/repositories/signature-policy.repository.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/repositories/signature-policy.repository.ts
@@ -0,0 +1,132 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import { Injectable, NotFoundException } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import type { CreateSignaturePolicyDto } from '../dto/create-signature-policy.dto.js';
+import type { SignaturePolicy } from '../entities/signature-policy.entity.js';
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+const WRITABLE_FIELDS = new Set<string>([
+  'traffic_agency_id',
+  'document_kind',
+  'required_signers_json',
+  'pades_level',
+  'tsa_required',
+  'pdfa_required',
+  'govbr_level',
+  'status',
+]);
+
+/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
+@Injectable()
+export class SignaturePolicyRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+  findAll(transaction?: Transaction): Promise<SignaturePolicy[]> {
+    return this.execute(
+      transaction,
+      async (tx) =>
+        (
+          await tx.query<SignaturePolicy & Record<string, unknown>>(
+            'select * from inf.signature_policy order by created_at desc limit 500',
+          )
+        ).rows,
+    );
+  }
+  async findOne(
+    id: string,
+    transaction?: Transaction,
+  ): Promise<SignaturePolicy> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<SignaturePolicy & Record<string, unknown>>(
+        'select * from inf.signature_policy where id = $1 limit 1',
+        [id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('SignaturePolicy ' + id + ' not found');
+    return row;
+  }
+  create(
+    dto: CreateSignaturePolicyDto,
+    transaction?: Transaction,
+  ): Promise<SignaturePolicy> {
+    return this.write('insert', undefined, dto, transaction);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateSignaturePolicyDto>,
+    transaction?: Transaction,
+  ): Promise<SignaturePolicy> {
+    return this.write('update', id, dto, transaction);
+  }
+  async remove(id: string, transaction?: Transaction): Promise<void> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query('delete from inf.signature_policy where id = $1 returning id', [
+        id,
+      ]),
+    );
+    if (!result.rows[0])
+      throw new NotFoundException('SignaturePolicy ' + id + ' not found');
+  }
+  private async write(
+    operation: 'insert' | 'update',
+    id: string | undefined,
+    dto: Partial<CreateSignaturePolicyDto>,
+    transaction?: Transaction,
+  ): Promise<SignaturePolicy> {
+    const entries = Object.entries(dto).filter(
+      ([, value]) => value !== undefined,
+    );
+    if (
+      !entries.length ||
+      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
+    )
+      throw new Error('Invalid SignaturePolicy write fields');
+    const columns = entries.map(([field]) => field);
+    const values = entries.map(([, value]) => value);
+    const insertSql =
+      'insert into inf.signature_policy (' +
+      columns.join(', ') +
+      ') values (' +
+      columns.map((_, index) => '
 + (index + 1)).join(', ') +
+      ') returning *';
+    const updateSql =
+      'update inf.signature_policy set ' +
+      columns.map((field, index) => field + ' =
 + (index + 1)).join(', ') +
+      ', updated_at = now() where id =
 +
+      (columns.length + 1) +
+      ' returning *';
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<SignaturePolicy & Record<string, unknown>>(
+        operation === 'insert' ? insertSql : updateSql,
+        operation === 'insert' ? values : [...values, id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('SignaturePolicy ' + id + ' not found');
+    return row;
+  }
+  private execute<T>(
+    transaction: Transaction | undefined,
+    work: (transaction: SqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    if (transaction) return work(transaction as SqlTransaction);
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      work(tx as SqlTransaction),
+    );
+  }
+}

diff --git a/backend/domains/inf/normative/src/services/normative-metrological-table.service.ts b/backend/domains/inf/normative/src/services/normative-metrological-table.service.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/services/normative-metrological-table.service.ts
@@ -0,0 +1,32 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import { Injectable } from '@nestjs/common';
+import { NormativeMetrologicalTableRepository } from '../repositories/normative-metrological-table.repository.js';
+import type { NormativeMetrologicalTable } from '../entities/normative-metrological-table.entity.js';
+import type { CreateNormativeMetrologicalTableDto } from '../dto/create-normative-metrological-table.dto.js';
+
+@Injectable()
+export class NormativeMetrologicalTableService {
+  constructor(
+    private readonly repository: NormativeMetrologicalTableRepository,
+  ) {}
+  findAll(): Promise<NormativeMetrologicalTable[]> {
+    return this.repository.findAll();
+  }
+  findOne(id: string): Promise<NormativeMetrologicalTable> {
+    return this.repository.findOne(id);
+  }
+  create(
+    dto: CreateNormativeMetrologicalTableDto,
+  ): Promise<NormativeMetrologicalTable> {
+    return this.repository.create(dto);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateNormativeMetrologicalTableDto>,
+  ): Promise<NormativeMetrologicalTable> {
+    return this.repository.update(id, dto);
+  }
+  remove(id: string): Promise<void> {
+    return this.repository.remove(id);
+  }
+}

diff --git a/backend/domains/inf/normative/src/services/signature-policy.service.ts b/backend/domains/inf/normative/src/services/signature-policy.service.ts
new file mode 100644
--- /dev/null
+++ b/backend/domains/inf/normative/src/services/signature-policy.service.ts
@@ -0,0 +1,28 @@
+// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
+import { Injectable } from '@nestjs/common';
+import { SignaturePolicyRepository } from '../repositories/signature-policy.repository.js';
+import type { SignaturePolicy } from '../entities/signature-policy.entity.js';
+import type { CreateSignaturePolicyDto } from '../dto/create-signature-policy.dto.js';
+
+@Injectable()
+export class SignaturePolicyService {
+  constructor(private readonly repository: SignaturePolicyRepository) {}
+  findAll(): Promise<SignaturePolicy[]> {
+    return this.repository.findAll();
+  }
+  findOne(id: string): Promise<SignaturePolicy> {
+    return this.repository.findOne(id);
+  }
+  create(dto: CreateSignaturePolicyDto): Promise<SignaturePolicy> {
+    return this.repository.create(dto);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateSignaturePolicyDto>,
+  ): Promise<SignaturePolicy> {
+    return this.repository.update(id, dto);
+  }
+  remove(id: string): Promise<void> {
+    return this.repository.remove(id);
+  }
+}

diff --git a/work/rounds/R-0005/contracts/CTG-0002.md b/work/rounds/R-0005/contracts/CTG-0002.md
new file mode 100644
--- /dev/null
+++ b/work/rounds/R-0005/contracts/CTG-0002.md
@@ -0,0 +1,54 @@
+# CTG-0002 — Deltas INF do WP-T1
+
+**Papel:** Architect
+**Tarefa:** TASK-0005
+**Escopo:** apenas os deltas v1.1.0 de `BP-INF-{AIT,NORMATIVE,MEASURES,ALCOHOL}-001`, o
+vocabulário de AIT e os timers de medida.
+
+## Mapa contratual
+
+| Alvo      | Campo, entidade ou guarda                                                                                                                                                                                 | Fonte vinculante                                                                                  |
+| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
+| AIT       | `ait_ait.current_status` e `ck_inf_ait_current_status` com os 17 tokens do workflow; FK para `inf.ait_state_ref`                                                                                          | WF-TEAT-001 Estados                                                                               |
+| AIT       | `version` para `If-Match`; `speed_measurement_id` opcional                                                                                                                                                | WP-T1; CODESTYLE (concorrência)                                                                   |
+| AIT       | `ait_cancel_request.kind`, `target_local_act_id`, `origin_status`, `addressed_to`, `status`, `decision`; `ait_cancel_request_event`                                                                       | WF-TEAT-001 cancelamento pós-finalização; UC-TEAT-011 AC-1…AC-4                                   |
+| NORMATIVE | `normative_metrological_table` versionada por catálogo                                                                                                                                                    | RN-TEAT-133; WF-TEAT-005 (margem metrológica)                                                     |
+| NORMATIVE | `approach_class` e seu CHECK `caso_1                                                                                                                                                                      | caso_2                                                                                            | caso_3`; `required_fields`, `required_instrument`, `points_label` | RN-TEAT-108 |
+| NORMATIVE | `document_kind`, `domain_scope`, `signature_policy`                                                                                                                                                       | ADR-0018 decisões 2–4                                                                             |
+| MEASURES  | `administrative_term.withdrawal_deadline_at`, `ctb_deadline_at`, `signer_name`, `field_details_json`, `source_*`                                                                                          | RN-TEAT-126 e RN-TEAT-128; OD-T05                                                                 |
+| MEASURES  | estados da retenção/remoção e CHECK; prazos de regularização limitados a 30 somente em retenção (art. 270 §2º) e a 15 somente em CTB art. 271 §9º-A                                                       | WF-TEAT-004; RN-TEAT-124; RN-TEAT-125                                                             |
+| ALCOHOL   | `ait_local_id`, `sign_catalog_id`, `sign_catalog_version`, `driver_name`, `driver_document`, `vehicle_plate`, `vehicle_make`, `refused_procedures`, `driver_statement_json`, `witnesses_json`, `source_*` | `BP-ALCOHOL-PROCEDURE-001` da origem TEAT, consulta read-only excepcional autorizada pelo maestro |
+| ALCOHOL   | par `considered_mg_l`/`max_error_mg_l` e CHECK de presença pareada                                                                                                                                        | RN-TEAT-133; WF-TEAT-005                                                                          |
+| ALCOHOL   | `alcohol_refusal.kind` limitado a `refusal                                                                                                                                                                | technical_impossibility`                                                                          | RN-TEAT-134; WF-TEAT-005                                          |
+| ALCOHOL   | `psychomotor_sign.sign_group`, `sign_status`, `method`                                                                                                                                                    | WF-TEAT-005 conteúdo mínimo do AIT                                                                |
+| DDL       | `inf.ait_state_ref` com todos e somente os estados reais; `[estado_origem]` não é estado                                                                                                                  | WF-TEAT-001 Nota de leitura                                                                       |
+| DDL       | `T-REG30`, `T-REG15`, `T-NOTIF10`, `T-DEPOSITO6M`, `T-CNH5D`, `T-SNE2027` com `owner='medida'`                                                                                                            | WF-TEAT-004; WF-TEAT-005; RN-TEAT-124…128; Entradas de `rait-deadline-engine.md`                  |
+
+## Critérios negativos para o Inspector
+
+- Reprovar token de `current_status` fora dos 17 tokens de WF-TEAT-001, inclusive
+  `draft`, `issued` e a pseudo-notação `[estado_origem]`.
+- Reprovar ausência de `version`, `speed_measurement_id` opcional, ou cancelamento que reescreva
+  o AIT em vez de registrar pedido/evento apenso.
+- Reprovar `approach_class` fora de `caso_1|caso_2|caso_3`, o antigo booleano
+  `allows_no_approach`, ou justificativa universal de não abordagem.
+- Reprovar template sem `document_kind`, política de assinatura codificada fora de
+  `signature_policy`, ou ausência de requisitos PAdES/TSA/PDF-A como dados.
+- Reprovar troca, colapso ou preenchimento automático dos dois prazos impressos; aplicar 30 dias
+  ao ramo do art. 271 §9º-A ou 15 dias ao ramo do art. 270 §2º também reprova.
+- Reprovar estado de medida fora de WF-TEAT-004, inclusive inventar estado de guarda monitorada
+  operacional além do vocabulário documentado.
+- Reprovar `considered_mg_l` sem `max_error_mg_l` (ou inverso), `kind` diferente de
+  `refusal|technical_impossibility`, ou tratar impossibilidade técnica como recusa 165-A.
+- Reprovar qualquer `driver_*`/`vehicle_*` além dos quatro campos autorizados ou remover
+  `driver_person_id` pré-existente.
+- Reprovar timer de medida com dono diferente de `medida`, timer ausente, ou inserir timer em
+  seed quando `inf.infraction_timer_ref` já existe.
+
+## Limites de integração
+
+`normative_agency_parameter` e toda a superfície do param-store de R-0004 foram preservados
+integralmente. A alteração de `BP-INF-NORMATIVE-001` foi autorizada pelo maestro somente como
+delta aditivo CTG-0002, após verificação do baseline mesclado. A consulta ao arquivo de autoridade
+do sibling TEAT foi read-only e limitada a `BP-ALCOHOL-PROCEDURE-001.json`, por autorização
+expressa do maestro.
```
