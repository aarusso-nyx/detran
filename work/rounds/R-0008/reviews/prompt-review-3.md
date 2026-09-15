# Prompt do reviewer — modo `prompt-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2 + WP-T3` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
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
  "mode": "prompt-review",
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — ciclo 3 (restrito ao achado do ciclo 2)

Veredito anterior: `FAIL` (`reviews/prompt-review-2.json`, item 6: segundo Inspector no CTG-0004). Correção exatamente como prescrita: WP-T3 é agora o **CTG-0005** com tríade própria — TASK-0013 (Architect, contrato `CTG-0005.md`, depende de TASK-0009) → TASK-0012 (Inspector) → TASK-0010 (Engineer) → TASK-0011 (transcrição). CTG-0004 volta a ser só TASK-0008/0009 (WP-T2). TASK-0001 deixa de cobrir o WP-T3 (§10 reescrito). `tasks/*.json` (`coupled_task_group`, `upstream_task_id`) e `plan.md` §Tarefas atualizados. Avalie **somente** essa correção. Anexos: `plan.md` §Tarefas, TASK-0013 inteiro, TASK-0001 §Tarefa item 10, TASK-0012 e TASK-0010 (cabeçalho de contexto), `tasks/TASK-0010.json`, `tasks/TASK-0012.json`, `tasks/TASK-0013.json`.

## Anexo — `plan.md` §Tarefas

```markdown
## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                      | Depende de | Entrega                                                                                                                                                          |
| --------- | ------------ | ------------------- | -------------- | --------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-teat-contracts-design`                                                                               | —          | contrato de cada comando (pré-estado, papel, pré-condições, pós-estado, erros) por seção do route contract; desenho da aplicação transacional do lote; critérios |
| TASK-0002 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-ait-tests`                                                                                       | TASK-0001  | testes AIT: matriz [WF-TEAT-001], `cancel-requests` × `decision_body`, `If-Match`                                                                                |
| TASK-0003 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-ait`, `MOD-shared-policy`                                                                        | TASK-0002  | comandos AIT + regras; testes verdes                                                                                                                             |
| TASK-0004 | Inspector    | inspector-tests     | Opus / alto    | `MOD-ops-offline-sync-tests`, `MOD-ops-field-tests`, `MOD-shared-policy-tests`                            | TASK-0003  | testes de sincronização (ACK perdido, retry, lote parcial, sequência repetida/gap, conflito, integridade), bootstrap, turno, numeração                           |
| TASK-0005 | Engineer     | engineer-backend    | Opus / médio   | `MOD-ops-offline-sync`, `MOD-ops-field`, `MOD-shared-policy`                                              | TASK-0004  | bootstrap, turno, numeração, sincronização; testes verdes                                                                                                        |
| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-ops-evidence-tests`, `MOD-ops-snapshots-tests`, `MOD-inf-normative-tests`, `MOD-shared-policy-tests` | TASK-0005  | testes evidência (fluxo em três passos, bodycam com finalidade), snapshots (adapter mock), pacote normativo                                                      |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-ops-evidence`, `MOD-ops-snapshots`, `MOD-inf-normative`, `MOD-shared-policy`                         | TASK-0006  | evidência, snapshots, normativo; testes verdes                                                                                                                   |
| TASK-0008 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-measures-tests`, `MOD-inf-alcohol-tests`, `MOD-ops-stream-tests`, `MOD-shared-policy-tests`      | TASK-0007  | testes medidas/alcoolemia (tabela metrológica, dois prazos OD-T05), SSE, `policy-routes.spec.ts`                                                                 |
| TASK-0009 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-measures`, `MOD-inf-alcohol`, `MOD-ops-stream`                                                   | TASK-0008  | medidas, alcoolemia, SSE, projeção de integrações; testes verdes                                                                                                 |
| TASK-0013 | Architect    | architect-blueprint | Opus / médio   | `MOD-teat-contracts-design-wp-t3`                                                                         | TASK-0009  | contrato CTG-0005 (WP-T3): formato dos `*.commands.openapi.json`, rota → `operationId`, assinaturas de `check-commands.mjs` e `generate-clients.mjs`, schemas    |
| TASK-0012 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-tools-contracts-tests`                                                                               | TASK-0013  | testes do gate `check-commands.mjs`, do gerador de clientes e das verificações rota ⇔ contrato (node:test)                                                       |
| TASK-0010 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-contracts-commands`, `MOD-schemas`, `MOD-tools-contracts`                                            | TASK-0012  | nove `.commands.openapi.json`, três schemas JSON, `contracts:check`/`contracts:clients` verdes                                                                   |
| TASK-0011 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                                | TASK-0010  | build pack, route contract §9, schemas README, backlog                                                                                                           |

CTG-0001 = 0001…0003; CTG-0002 = 0004/0005; CTG-0003 = 0006/0007; CTG-0004 = 0008/0009 (WP-T2); CTG-0005 = 0013 → 0012 → 0010 → 0011
(WP-T3, PR próprio ou junto do CTG-0004). Um PR por CTG. Os Inspectors
de cada grupo só começam com o grupo anterior implementado (lock `MOD-shared-policy-tests` em `policy.spec.ts`; prompt-review-1).


```

## Anexo — `work/rounds/R-0008/prompts/TASK-0013.md`

```markdown
# Prompt de worker — `TASK-0013` (`architect-blueprint`)

> Você é um worker da orquestra `teat-backend`, rodada `R-0008`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes, nunca edita arquivos gerados, nunca altera testes
> nem código. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro. Nesta tarefa você
escreve um contrato (documento de trabalho da rodada), não código.

## Contexto da frente (o que você precisa saber, já resumido)

WP-T3 do TEAT, grupo **CTG-0005** (payloads e contratos). Todos os comandos de WP-T2 estão
implementados e montados (CTG-0001…0004; contratos `work/rounds/R-0008/contracts/CTG-000{1,2,3,4}.md`;
relatórios `reports/TASK-0003/0005/0007/0009.md`). O maestro fixou o desenho em `plan.md` M19. Você
escreve `work/rounds/R-0008/contracts/CTG-0005.md`, que o Inspector (TASK-0012) transcreve em testes
`node:test` do gate e do gerador, e o Engineer (TASK-0010) transcreve em nove
`*.commands.openapi.json`, três schemas, schemas de evento, `check-commands.mjs`, `generate-clients.mjs`
e `packages/api-clients`. Hoje `tools/contracts/generate-openapi.mjs --check` trata qualquer
`*.openapi.json` não gerado como órfão: a única mudança nele será ignorar `*.commands.openapi.json`.

## Leitura obrigatória (lista fechada — não leia além dela)

- `docs/framework/arch/teat-build-pack.md` §WP-T3 e §6 "Mapa entregável → definições"
- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/architect-blueprint.md`; `docs/meta/agents/transcriber-docs.md` §Regras de transcrição (item 5)
- `work/rounds/R-0008/plan.md` §Decisões (M16, M19, M20) e §Critérios
- `work/rounds/R-0008/contracts/CTG-0001.md`, `CTG-0002.md`, `CTG-0003.md`, `CTG-0004.md` (blocos de comando: rota, DTO, erros, eventos,
  `operationId` previsto)
- `docs/framework/arch/teat-route-contract.md` §1, §3.2, §4.1–§4.6, §5, §6, §7; `docs/framework/arch/teat-error-catalog.md` (inteiro)
- `docs/framework/arch/rait-build-pack.md` §0 "Convenções de payload"; `docs/framework/arch/rait-events-sse-contract.md` §1
- `docs/framework/contracts/README.md`; `docs/framework/contracts/BP-INF-AIT-001.openapi.json` (formato gerado);
  `docs/framework/schemas/README.md`; `docs/framework/schemas/events/inf.infraction.changed.schema.json`
- `tools/contracts/generate-openapi.mjs`; `tools/verify-controller-decorators.ts`; `tools/parameters/verify.mjs` e
  `tools/parameters/tests/*.test.mjs` (padrão de ferramenta `.mjs` testada com `node:test`)
- Todos os controladores manuscritos montados: `backend/domains/inf/{ait,normative,measures,alcohol,speed}/src/**/*controller.ts` (fora
  de `src/controllers/`), `backend/domains/ops/{field,offline-sync,evidence,snapshots}/src/handwritten/*controller.ts`,
  `backend/app/src/teat-*.controller.ts`; os `events.ts` manuscritos de cada módulo
- `packages/senatran-adapter/package.json` (como `openapi-typescript` é usado hoje); `package.json` da raiz (scripts `contracts:*`);
  `pnpm-workspace.yaml`
- Origem `../teat` (**somente leitura**): `docs/framework/schemas/teat-offline-sync-batch.schema.json`

## Pode tocar

- `work/rounds/R-0008/contracts/CTG-0005.md` (novo).

## Não pode tocar

Tudo o mais. Além disso: `docs/framework/product/**`, `record/`, `.devai/`, `docs/meta/adr/`, arquivos "Generated from BP-…".

## Tarefa (o quê, não o como)

Escreva `CTG-0005.md` com: (1) cabeçalho (fontes, consumidores, decisões aplicadas); (2) **formato** exato dos `*.commands.openapi.json`
(M19) com um exemplo completo de uma operação; (3) **tabela** rota manuscrita → método → `operationId` → arquivo de contrato → DTO →
códigos 4xx, cobrindo **todas** as rotas manuscritas montadas (inclusive `GET`s de leitura manuscritos, `stream`, `integrations`) e o
mapeamento de cada rota ao arquivo (`BP-OPS-BOOTSTRAP-001.commands.openapi.json` agrupa bootstrap, turno, handoff, stream, integrações com
`x-blueprint: BP-OPS-FIELD-001`); (4) **assinaturas** de `tools/contracts/check-commands.mjs` — `checkCommands({ contractsDir, controllerRoots,
catalogPath, blueprintsDir }) → { ok, operations, problems[{ kind: missing-route|missing-operation|unknown-error-code|duplicate-operation-id|
unknown-blueprint|invalid-json, file, detail }] }`, CLI com "commands contracts: OK (<n> operations)"/exit 1 — e de
`tools/contracts/generate-clients.mjs` — `generateClients({ contractsDir, outDir }) → { written[] }`, CLI "clients written: <n>",
idempotente; regras de varredura AST (quais diretórios, quais decoradores, como se junta `@Controller` + rota, normalização
`:id` ↔ `{id}`); (5) **schemas**: campos de `teat-offline-sync-batch.schema.json`, `teat-normative-package.schema.json`,
`teat-bootstrap.schema.json` e a lista de `events/<type>.schema.json` (tradução literal dos zod); (6) `packages/api-clients` (package.json,
tsconfig, `src/index.ts`, saída em `src/generated/`); mudanças em `package.json` da raiz (`contracts:check`, `contracts:clients`, devDependency
`openapi-typescript` na versão do workspace) e em `generate-openapi.mjs` (filtro de órfãos); (7) **critérios** numerados `C-5-nn` para o
Inspector (fixtures mínimas por caso do gate e do gerador) e para a verificação final (`pnpm contracts:check`, `pnpm contracts:clients`,
`pnpm check`); (8) divergências/OD.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- `operationId` por comando `teat<Recurso><Verbo>`; respostas 4xx listam os `code` do catálogo; exemplos usam ids das fixtures.
- Convenções de payload (rait-build-pack §0): `If-Match` (428/412) nos comandos que o contrato marca; `Idempotency-Key` nas criações;
  `tenant_id` nunca no payload (DTO de origem que o traz: `deprecated: true`, "ignorado; tenant vem do contexto").
- Códigos genéricos §9: `TEAT.IF_MATCH_REQUIRED` 428, `TEAT.VERSION_CONFLICT` 412, `TEAT.VALIDATION_FAILED` 400, `TEAT.ENUM_INVALID` 400,
  `TEAT.FORBIDDEN_ACTION` 403, `TEAT.TENANT_MISMATCH` 404.
- Blocos monoespaçados para tabelas largas (estabilidade sob `prettier --check`).

## Critérios de aceitação (todos precisam passar)

- O arquivo existe e a tabela (3) cobre todas as rotas manuscritas montadas (confira contra os controladores lidos; cite o total).
- `node_modules/.bin/prettier --check work/rounds/R-0008/contracts/CTG-0005.md` → limpo; `node tools/docs/kb/check.mjs` → inalterado.

## Regras que não admitem exceção

1. Nenhum valor inventado; lacuna vira `source_pending`/`OD-*`.
2. Código gerado não se edita (ADR-0007).
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas; não crie tenants nem personas próprias.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0013
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

```

## Anexo — `work/rounds/R-0008/prompts/TASK-0001.md`

```markdown
# Prompt de worker — `TASK-0001` (`architect-blueprint`)

> Você é um worker da orquestra `teat-backend`, rodada `R-0008`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`), nunca edita arquivos
> gerados, nunca altera testes. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/architect-blueprint.md` — leia-o primeiro; ele define o que você
pode e não pode tocar e o formato da entrega. Nesta tarefa você **não** escreve blueprint, DDL,
código nem teste: escreve os **contratos por comando** que o Inspector transcreve em testes e o
Engineer transcreve em código.

## Contexto da frente (o que você precisa saber, já resumido)

WP-T2 + WP-T3 do TEAT (`docs/framework/arch/teat-build-pack.md`). O modelo de dados existe (R-0005,
R-0006): blueprints `BP-INF-{AIT,NORMATIVE,MEASURES,ALCOHOL,SPEED}-001` e `BP-OPS-{AGENCY,FIELD,
OFFLINE-SYNC,EVIDENCE,SNAPSHOTS}-001` gerados e montados no `AppModule`; DDL 13/16/17/18/30–33/37
aplicados; comandos manuscritos parciais em `inf/ait` (12 rotas), `inf/normative` (5), `inf/measures`
(8), `inf/alcohol` (6) e controladores CRUD manuscritos em `ops/{field,evidence,snapshots}`. O maestro
já fechou as decisões **M1–M20** em `work/rounds/R-0008/plan.md` §Decisões: elas **são o contrato de
partida** — você as detalha comando a comando; não as reabre. Onde M-decisão e documento canônico
divergirem, prevalece o documento canônico e você registra a divergência no relatório (é triagem do
maestro). Quatro grupos acoplados: CTG-0001 (AIT + `DetranError` + política), CTG-0002 (campo,
numeração, sincronização, handoff, appliers), CTG-0003 (evidência, snapshots, normativo), CTG-0004
(medidas, alcoolemia, velocidade, SSE, integrações, `policy-routes`). O WP-T3 é o CTG-0005 (TASK-0013).

## Leitura obrigatória (lista fechada — não leia além dela)

- `docs/framework/arch/teat-build-pack.md` §WP-T2, §WP-T3 e §6 "Mapa entregável → definições" (escopo do pacote de trabalho)
- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0008/plan.md` (inteiro: Metas, Decisões M1–M20, Tarefas, Critérios, Mapa, Riscos, Concorrência, Bloqueios)
- `work/rounds/R-0006/contracts/CTG-0001.md` (só §1 e §6 — formato de contrato adotado nesta orquestra: blocos monoespaçados, não tabelas)
- `docs/framework/arch/teat-route-contract.md` (inteiro); `docs/framework/arch/teat-error-catalog.md` (inteiro)
- `docs/framework/arch/parameter-catalogue.md` §TEAT; `docs/meta/knowledge-base/steering.md` §H itens 39, 54, 55
- `docs/framework/product/domains/inf/teat/workflows/WF-TEAT-001.md` §Estados, §Transições; `WF-TEAT-002.md` §Estados, §Transições;
  `WF-TEAT-003.md` §Estados, §Transições; `WF-TEAT-004.md` §Estados (A e B), §Prazos; `WF-TEAT-005.md` §Estados, §Guard central,
  §Recusa × impossibilidade, §Limiares
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-011.md` §Critérios de aceitação; `UC-TEAT-012.md` §Critérios de aceitação
- `docs/framework/product/domains/inf/teat/rules/RN-TEAT-{111,123,124,125,126,132,133,142}.md` (§Regra de cada um)
- `docs/framework/arch/rait-events-sse-contract.md` §1 (envelope), §3 (fluxo SSE), §5 (contrato de teste)
- `docs/framework/arch/rait-test-strategy.md` §1, §2, §6; `docs/framework/arch/rait-error-catalog.md` §1 (envelope)
- `docs/framework/blueprints/BP-INF-{AIT,NORMATIVE,MEASURES,ALCOHOL,SPEED}-001.json` e `BP-OPS-{FIELD,OFFLINE-SYNC,EVIDENCE,SNAPSHOTS,AGENCY}-001.json`
  (blocos `module` e `database.entities`: colunas, checks; `api.resources`)
- `backend/database/ddl/14-inf-lifecycle-vocabulary.sql` (blocos `ait_state_ref` e `infraction_timer_ref` com `owner='medida'`);
  `backend/database/ddl/18-ops-offline-sync.sql`; `backend/database/ddl/17-ops-evidence.sql` (índices únicos);
  `backend/database/ddl/04-integration-storage.sql` (tabela `integration.outbox`)
- `backend/database/seed/00-fixtures-core.sql` (usuários e papéis), `10-fixtures-inf-ait.sql`, `25-fixtures-teat.sql` (ids canônicos)
- `backend/domains/shared/src/policy.ts` (blocos `TEAT_RULES`, `OPS_SURFACE_RULES`, `INF_SURFACE_RULES`, `isDetranActionAllowed`);
  `backend/domains/shared/src/roles.ts` (papéis TEAT); `backend/domains/shared/src/policy.guard.ts`; `backend/domains/shared/src/tenant-context.ts`
- `backend/domains/inf/ait/src/{ait-commands.controller,ait-lifecycle.service,ait-lifecycle.provider,ait.module}.ts`
- `backend/domains/inf/normative/src/{normative-commands.controller,normative-lifecycle.service}.ts`
- `backend/domains/inf/measures/src/{measure-commands.controller,measure-lifecycle.service}.ts`
- `backend/domains/inf/alcohol/src/{alcohol-commands.controller,alcohol-lifecycle.service}.ts`
- `backend/domains/ops/core/src/index.ts`; `backend/domains/ops/{field,evidence,snapshots}/src/handwritten/*.ts`
- `backend/domains/ops/parameter/src/handwritten/parameter.service.ts` (API de leitura de parâmetro: assinatura de `get`/lookup)
- `backend/domains/inf/deadlines/src/types.ts` (API `computeDue`/`Clock`); `backend/domains/inf/infraction/src/handwritten/{errors,events}.ts`
  (padrão de erro e de schema zod de evento)
- `backend/app/src/app.module.ts`; `backend/app/src/detran-runtime.ts` (função `verify` do perfil local, linhas ~300–330: como o principal local nasce);
  `backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts` (padrão de e2e com fixtures)
- `packages/senatran-adapter/src/ports.ts` (`RenachPort`, `WsdenatranReadPort`); `packages/senatran-adapter/src/domain.ts` (`VehicleRecord`, `DriverRecord`)
- `tools/verify-controller-decorators.ts`; `tools/contracts/generate-openapi.mjs`
- Origem `../teat` (**somente leitura**, caminho `/Volumes/Thiamat II/stech/teat`): `domain/shared/api/src/teat-policy.ts`;
  `domain/offline-offline-sync/api/src/offline-offline-sync/dto/offline-sync-command.dto.ts`;
  `domain/ops-mobile-operations/api/src/ops-mobile-operations/dto/mobile-bootstrap-query.dto.ts`;
  `domain/ops-mobile-operations/api/src/ops-mobile-operations/services/mobile-bootstrap.service.ts` (só as funções de bloqueadores e a resposta);
  `domain/evidence-evidence-custody/api/src/evidence-evidence-custody/dto/evidence-command.dto.ts`;
  `domain/measures-administrative-measures/api/src/measures-administrative-measures/dto/administrative-measure-command.dto.ts`;
  `domain/alcohol-alcohol-procedure/api/src/alcohol-alcohol-procedure/dto/alcohol-procedure-command.dto.ts`;
  `domain/normative-normative-catalog/api/src/normative-normative-catalog/dto/normative-command.dto.ts`;
  `domain/ait-ait-lifecycle/api/src/ait-ait-lifecycle/dto/{create-ait-cancel-request,decide-ait-cancel-request}.dto.ts`;
  `domain/shared/api/src/ait-cancellation-request.ts`; `docs/framework/schemas/teat-offline-sync-batch.schema.json`;
  `domain/offline-offline-sync/api/src/offline-offline-sync/services/offline-sync-commands.service.ts` (só `reserveNumbering`,
  `cancelReservation`, `reconcileReservation`, `submitBatch`, `assertBatchSequence`, `applyQueueItem`, `flagConcurrentSessionItems`).

## Pode tocar

- `work/rounds/R-0008/contracts/CTG-0001.md`, `CTG-0002.md`, `CTG-0003.md`, `CTG-0004.md` (novos).

## Não pode tocar

Tudo o mais: código, testes, blueprints, DDL, seeds, `docs/**`, `plan.md`, `tasks/`, `prompts/`.
Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`,
arquivos com cabeçalho "Generated from BP-…".

## Tarefa (o quê, não o como)

Escreva os quatro contratos. Cada contrato tem, nesta ordem:

1. **Cabeçalho**: rodada, grupo, fontes, consumidores (tarefas Inspector/Engineer), e a lista de decisões M-n que aplica.
2. **Comandos** — um bloco monoespaçado por comando, com **todos** os campos: rota (`método caminho`), controlador/arquivo
   (`src/handwritten/<arquivo>` ou o existente), `@Resource`/`@Action`/`@Audit{action, entity}` (entidade = tabela real, ex.
   `inf.ait_cancel_request`, `ops.ops_shift`), chave de política e papéis (copiados de `policy.ts` ou, quando a chave é nova, da origem
   `teat-policy.ts` com a linha citada; papéis novos sem fonte viram `source_pending` + OD), DTO (nome e campos da origem, obrigatoriedade,
   enums), cabeçalhos (`If-Match`, `Idempotency-Key`, `ETag`), pré-estado (tokens do workflow), pré-condições, pós-estado e efeitos
   (linhas gravadas, `version`), erros (código do catálogo, status, `context` exato), eventos (`type`, `domainEvent`, `data`), resposta.
3. **Máquinas de estado** transcritas (AIT `WF-TEAT-001`; reserva/faixa `WF-TEAT-002`; catálogo/pacote `WF-TEAT-003`; medidas A/B
   `WF-TEAT-004`; alcoolemia `WF-TEAT-005`) em blocos `from → to : comando : guarda`, com a lista de estados **não** admitidos por comando
   (para os testes de `*_STATE_INVALID`).
4. **Protocolo de sincronização** (CTG-0002): algoritmo do lote e do item exatamente como M5–M7 (replay, sequência, integridade,
   appliers, transação por item, recibo, concorrência M6, numeração M7/M8), com a tabela recibo × `error_code` × efeito, o esquema zod
   do payload canônico do `ait` (campos das DTOs geradas `CreateAitDto`, `CreateAitVehicleDto`, `CreateAitPersonDto`,
   `CreateAitSignatureDto`, `CreateAitPrintEventDto`), e a forma das portas `SyncEntityApplier`, `TeatEventOutbox` (M16, em
   `@detran/shared`), `AppliedEntityPort`, `EvidenceStoragePort`, `SNAPSHOT_QUERY_PORTS`, `PackageSignerPort`.
5. **Bootstrap** (CTG-0002): resposta completa (route contract §4.1) campo a campo com a fonte de cada campo, ordem dos bloqueadores e
   avisos (M9), `capabilities`.
6. **Eventos** (M16): por grupo, `type` → `domainEvent` → `aggregate.kind` → `data` (só ids, tokens, datas).
7. **Fixtures** (M20): ids exatos por arquivo de seed (`26`, `27`, `28`), com colunas obrigatórias de cada linha (consulte os blueprints)
   e o estado que cada linha representa; ids de usuários/papéis vêm de `00-fixtures-core.sql`.
8. **Critérios para o Inspector**: lista numerada `C-<grupo>-nn` — cada item = "dado <fixture> quando <comando> então <efeito|código>",
   com o tier (`unit|integration|e2e`) e o arquivo de teste alvo (caminhos exatos abaixo).
9. **Layout para o Engineer**: arquivos a criar por pacote (`src/handwritten/…`), entradas de `module.handwrittenExports/
handwrittenControllers/handwrittenProviders` a acrescentar nos blueprints (só bloco `module`, seguido de `pnpm blueprints:generate &&
pnpm contracts:openapi`), wiring no `AppModule`/`backend/app/src/*.ts`, scripts da raiz a estender (`backend:test:*` com os pacotes
   `ops`), regras a inserir/remover em `policy.ts`.
10. **WP-T3 não é desta tarefa**: o contrato dos `*.commands.openapi.json`, do gate `check-commands.mjs`, do gerador de clientes e
    dos schemas é `CTG-0005.md` (TASK-0013, depois de todos os comandos existirem). Aqui, em cada bloco de comando, deixe apenas o
    `operationId` previsto (`teat<Recurso><Verbo>`) para que TASK-0013 o herde.
11. **Divergências** encontradas (documento × M-decisão × código atual) e **OD propostas** (OD-T13…T18 já reservadas em `plan.md`
    §Bloqueios; novas a partir de OD-T19).

Arquivos de teste alvo (fixe-os nos critérios): CTG-0001 → `backend/domains/shared/src/errors/detran-error.spec.ts`,
`backend/domains/shared/src/policy.spec.ts`, `backend/domains/inf/ait/src/ait-lifecycle.service.spec.ts`,
`backend/domains/inf/ait/src/handwritten/*.spec.ts`, `backend/domains/inf/ait/tests/integration/ait-commands.integration.spec.ts`,
`backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts`. CTG-0002 → `backend/domains/ops/offline-sync/src/handwritten/*.spec.ts`,
`backend/domains/ops/offline-sync/tests/integration/*.integration.spec.ts`, `backend/domains/ops/field/src/handwritten/*.spec.ts`,
`backend/domains/ops/field/tests/integration/*.integration.spec.ts`, `backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts`,
`backend/app/tests/e2e/teat-field-sync.e2e.spec.ts`. CTG-0003 → idem em `ops/evidence`, `ops/snapshots`, `inf/normative` e
`backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts`. CTG-0004 → `inf/measures`, `inf/alcohol`, `inf/speed`,
`backend/app/tests/e2e/teat-measures-alcohol.e2e.spec.ts`, `backend/app/tests/e2e/teat-stream.e2e.spec.ts`,
`backend/app/tests/e2e/policy-routes.e2e.spec.ts`.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Papéis TEAT canônicos (`roles.ts`): `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`,
  `technical-admin`, `AUDITOR`, `integration-operator`. Toda matriz de grants lista positivos e negativos para **todos** os papéis
  canônicos omitidos (orchestra/README.md §4.8); `technical-admin` é admin global em `isDetranActionAllowed` (permissão `*`).
- Estados do AIT (`ait_state_ref`, 17 tokens): `RASCUNHO_OFFLINE`, `CANCELADO_RASCUNHO`, `FINALIZADO_LOCAL`, `ENFILEIRADO`, `TRANSMITIDO`,
  `RECEBIDO`, `SUSPEITO_CONCORRENCIA`, `VALIDANDO`, `ACEITO`, `REJEITADO`, `PENDENTE_CORRECAO`, `CORRIGIDO`, `INTEGRADO`, `PROCESSADO`,
  `ARQUIVADO`, `SOLICITADO_CANCEL_POSFINAL`, `CANCELADO_POSFINAL`.
- `ait_cancel_request.status` ∈ `requested|under_review|approved|denied` (check do DDL 31); `kind` ∈ `draft|post_final`;
  `addressed_to` ∈ `traffic-authority|diretoria-fiscalizacao` (DTO de origem).
- Reserva (`numbering_reservation.status`, armazenado): `reserved|consumed|expired|cancelled|blocked`; faixa: `active|exhausted`;
  consumo: `disponivel|consumido_localmente|aplicado|inutilizado|expirado|bloqueado`.
- Recibo: `received|applied|conflict|rejected`; `sync_queue_item.status`: `pending|received|applied|conflict|rejected`;
  `sync_conflict.status`: `open|resolved`; `conflict_type`: `integrity|domain|concurrency`.
- Evidência (`evidence_evidence.status`, check do DDL 17): `pending_upload|uploaded|validated|linked|packaged|archived|rejected|quarantined|superseded`;
  `evidence_access_request.status`: `requested|approved|denied|delivered`; `requester_role` ∈ `magistrado|ministerio-publico|defensoria-publica|autoridade-policial|autoridade-administrativa`.
- Pacote normativo: `draft|published|retired` (armazenado; tokens `RASCUNHO_PKG|PUBLICADO_PKG|VALIDADO_PKG|RETIRADO_PKG` do WF-TEAT-003 são
  os nomes de domínio; `VALIDADO_PKG` não persiste — `validate` é idempotente e não muda `status`); catálogo: `draft|active|retired`.
- Envelope de evento (`rait-events-sse-contract.md` §1): `{ id, type, domainEvent, version, occurredAt, tenantId, actor{kind,id,role?},
correlationId, causationId?, aggregate{kind,id,version}, data }`; `data` só ids, tokens e datas.
- Envelope de erro (`rait-error-catalog.md` §1 via `StynxError`): `{ code, status, message, messageKey, requestId, context }`.
- Parâmetros: `sync.concurrency_window_minutes` (`source_pending`, nulo), `teat.numbering.reservation_ttl_hours=72`,
  `teat.homologation.expired_behavior='warn'`, `teat.monitored_custody=false`, `teat.speed_meters=false`, `teat.bodycam.retention_days`
  (`source_pending`). Flags lidas por `detranFeatureFlagSet().flags[key].default`; parâmetros por `ParameterService`.
- Limiares de alcoolemia: administrativo ≥ 0,05 mg/L; crime ≥ 0,34 mg/L (WF-TEAT-005 §Limiares; RN-TEAT-133); prazos de retenção
  ≤ 30 dias (RN-TEAT-124), remoção ≤ 15 dias (RN-TEAT-125); timers `T-REG30`, `T-REG15`, `T-NOTIF10`, `T-DEPOSITO6M`, `T-CNH5D`,
  `T-SNE2027` (`infraction_timer_ref`, `owner='medida'`).

## Critérios de aceitação (todos precisam passar)

- Os quatro arquivos existem e cobrem **todas** as rotas de `teat-route-contract.md` §3.2, §4.1, §4.2 (comandos), §4.3, §4.4, §4.5, §4.6, §5, §6 e §7,
  cada uma com os dez campos do bloco de comando preenchidos (ou `source_pending` explícito).
- Cada `code` citado existe em `docs/framework/arch/teat-error-catalog.md`; cada papel citado existe em `roles.ts`; cada token de estado
  existe no workflow citado; cada coluna citada existe no blueprint.
- `node_modules/.bin/prettier --check work/rounds/R-0008/contracts/*.md` → "All matched files use Prettier code style!"
- `node tools/docs/kb/check.mjs` → "knowledge-base check: OK (521 artifacts, 446 canonical tokens)" (inalterado).

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`, `docs/framework/arch/rait-fixtures.md`); não crie
   tenants nem personas próprias (M20 fixa as personas TEAT permitidas).
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Blocos monoespaçados (```text) para matrizes; nunca tabelas Markdown largas.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0001
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

```

## Anexo — `work/rounds/R-0008/prompts/TASK-0012.md`

```markdown
# Prompt de worker — `TASK-0012` (`inspector-tests`)

> Você é um worker da orquestra `teat-backend`, rodada `R-0008`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes, nunca edita arquivos gerados, nunca altera código
> de produção nem ferramentas existentes. Se algo impedir a tarefa, pare e escreva o bloqueio no
> relatório.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/inspector-tests.md` — leia-o primeiro (`tools/check-*` e testes de
gates estão na sua fronteira: "novos gates, nunca afrouxar os existentes").

## Contexto da frente (o que você precisa saber, já resumido)

WP-T3 do TEAT, grupo **CTG-0005**. Todos os comandos de WP-T2 estão implementados (CTG-0001…0004).
O Architect fixou em `work/rounds/R-0008/contracts/CTG-0005.md` (e em `plan.md` M19) o formato
dos contratos de comando `*.commands.openapi.json`, o gate `tools/contracts/check-commands.mjs`, o
gerador `tools/contracts/generate-clients.mjs` e os schemas. Você escreve os **testes** desses dois
scripts (padrão `node --test` já usado por `tools/parameters/tests/*.test.mjs`) **antes** de eles
existirem (TASK-0010 os implementa); os testes ficam vermelhos por "módulo ausente", nunca por erro
seu. Use fixtures próprias em `tools/contracts/tests/fixtures/` (contratos mínimos válidos e inválidos,
um controlador manuscrito de exemplo em TypeScript), nunca os contratos reais.

## Leitura obrigatória (lista fechada — não leia além dela)

- `docs/framework/arch/teat-build-pack.md` §WP-T3 e §6 "Mapa entregável → definições"
- `AGENTS.md`; `CODESTYLE.md` §Tests; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0008/plan.md` §Decisões (M19) e §Critérios; `work/rounds/R-0008/contracts/CTG-0005.md` (formato, gate, clientes)
- `tools/parameters/tests/*.test.mjs` e `tools/parameters/verify.mjs` (padrão de teste `node:test` de uma ferramenta `.mjs` com fixtures)
- `tools/contracts/generate-openapi.mjs`; `tools/verify-controller-decorators.ts` (varredura AST que o gate reutiliza)
- `docs/framework/contracts/BP-INF-AIT-001.openapi.json` (formato gerado); `docs/framework/arch/teat-error-catalog.md` §1, §3, §9
  (códigos válidos para as fixtures); `package.json` da raiz (scripts `parameters:test`, `contracts:check`)

## Pode tocar

- `tools/contracts/tests/**` (novo: `check-commands.test.mjs`, `generate-clients.test.mjs`, `fixtures/**`)

## Não pode tocar

`tools/contracts/*.mjs` (existentes e os que TASK-0010 criará); `docs/**`; `packages/**`; `package.json`; código e testes dos domínios.
Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`,
arquivos com cabeçalho "Generated from BP-…".

## Tarefa (o quê, não o como)

1. `check-commands.test.mjs`: importa `tools/contracts/check-commands.mjs` e exercita sua função exportada (assinatura fixada no
   contrato: `checkCommands({ contractsDir, controllerRoots, catalogPath, blueprintsDir }) → { ok, operations, problems[] }`) contra fixtures:
   (a) contrato válido + controlador com as mesmas rotas → `ok: true`, `operations` = n; (b) rota no contrato sem controlador → problema
   `missing-route`; (c) rota no controlador sem contrato → `missing-operation`; (d) `code` 4xx fora do catálogo → `unknown-error-code`;
   (e) `operationId` duplicado → `duplicate-operation-id`; (f) `x-blueprint` inexistente → `unknown-blueprint`; (g) JSON inválido → `invalid-json`;
   (h) arquivo sem sufixo `.commands` é ignorado; (i) execução como CLI (`node tools/contracts/check-commands.mjs`) devolve exit 1 com a lista
   quando há problemas e imprime "commands contracts: OK (<n> operations)" quando não há (spawn com `cwd` de fixture).
2. `generate-clients.test.mjs`: `generateClients({ contractsDir, outDir }) → { written: string[] }` gera um `.ts` por `*.openapi.json`
   (gerados e `.commands`) com `export interface paths` (saída do `openapi-typescript`), reexecução é idempotente (bytes iguais) e a CLI
   imprime "clients written: <n>".
3. Fixtures mínimas e determinísticas; nomes de teste "dado <fixture> quando <chamada> então <resultado>".
4. Rode `node --test tools/contracts/tests/` e relate: todos falham por `ERR_MODULE_NOT_FOUND` de `check-commands.mjs`/`generate-clients.mjs`
   (esperado) — qualquer outra falha é sua e deve ser corrigida.

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- Formato do contrato de comando (M19): OpenAPI 3.1, `info.x-blueprint`, `info.x-commands: true`, `paths[<rota>][<método>]` com `operationId`
  `teat<Recurso><Verbo>`, respostas 4xx com `content.application/json.schema.properties.code.enum` só de códigos de
  `docs/framework/arch/teat-error-catalog.md`.
- Gate: (1) JSON válido e `x-blueprint` existente em `docs/framework/blueprints/`; (2) rota ⇔ controlador manuscrito nos dois sentidos
  (`@Controller` + `@Get|@Post|@Patch|@Put|@Delete`, ignorando `src/controllers/` gerados); (3) códigos do catálogo; (4) `operationId` único.
- Nunca `it.skip`/`todo`; testes de ferramenta não abrem banco.

## Critérios de aceitação (todos precisam passar)

- `node_modules/.bin/prettier --check tools/contracts/tests` → limpo
- `node --test tools/contracts/tests/` → executa; falhas **somente** por módulo ausente (`check-commands.mjs`, `generate-clients.mjs`)
- Relatório com a lista "caso → fixture → resultado esperado".

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007).
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`, `docs/framework/arch/rait-fixtures.md`); fixtures de ferramenta vivem em `tools/contracts/tests/fixtures/`.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. Nunca afrouxe um gate existente.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0012
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

```

## Anexo — `work/rounds/R-0008/prompts/TASK-0010.md`

```markdown
# Prompt de worker — `TASK-0010` (`engineer-backend`)

> Você é um worker da orquestra `teat-backend`, rodada `R-0008`, na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Você executa **uma** tarefa, dentro de
> uma fronteira de escrita, e entrega um relatório. Você **nunca** executa `git` (nem `add`, nem
> `commit`, nem `stash`), nunca instala pacotes (não rode `pnpm install`; a devDependency
> `openapi-typescript` já existe no workspace — declare-a na raiz e avise o maestro para rodar
> `pnpm install`), nunca edita arquivos gerados, nunca altera testes. Se algo impedir a tarefa, pare
> e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/engineer-backend.md` — leia-o primeiro (contratos de comando em
código são ato de Engineer; `docs/framework/contracts/*.commands.openapi.json` e
`docs/framework/schemas/*.json` estão na sua fronteira por serem artefatos verificados por gate).

## Contexto da frente (o que você precisa saber, já resumido)

WP-T3 do TEAT, grupo **CTG-0005**. Todos os comandos de WP-T2 estão implementados (CTG-0001…0004,
contratos em `work/rounds/R-0008/contracts/CTG-000{1,2,3,4}.md`; o contrato deste grupo é `CTG-0005.md` (TASK-0013), código em `src/handwritten/**` e
nos controladores manuscritos). O Inspector (TASK-0012) já escreveu os testes do gate e do gerador de clientes em `tools/contracts/tests/*.test.mjs`
(relatório `work/rounds/R-0008/reports/TASK-0012.md`); eles estão vermelhos e você os faz passar sem alterá-los.
Você transcreve os comandos em **nove** contratos
`*.commands.openapi.json`, cria os **três** schemas JSON e os schemas de evento, cria o gate
`tools/contracts/check-commands.mjs` (ligado a `contracts:check`) e o script `contracts:clients`
(M19). Hoje `tools/contracts/generate-openapi.mjs --check` marca como órfão qualquer
`*.openapi.json` que não venha de blueprint: a única alteração permitida nele é ignorar
`*.commands.openapi.json` nessa varredura.

## Leitura obrigatória (lista fechada — não leia além dela)

- `docs/framework/arch/teat-build-pack.md` §WP-T2, §WP-T3 e §6 "Mapa entregável → definições" (escopo do pacote de trabalho)
- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/engineer-backend.md`; `docs/meta/agents/transcriber-docs.md` §Regras de transcrição (item 5)
- `work/rounds/R-0008/plan.md` §Decisões (M16, M19, M20) e §Critérios
- `work/rounds/R-0008/contracts/CTG-0005.md` (inteiro); `CTG-0001.md`, `CTG-0002.md`, `CTG-0003.md`, `CTG-0004.md` (blocos de comando, DTOs, eventos, fixtures)
- `work/rounds/R-0008/reports/TASK-0012.md` e todos os `tools/contracts/tests/*.test.mjs` (+ fixtures em `tools/contracts/tests/fixtures/`)
- `docs/framework/arch/teat-route-contract.md` §1 (regras), §3.2, §4.1–§4.6, §5, §6, §7; `docs/framework/arch/teat-error-catalog.md` (inteiro)
- `docs/framework/arch/rait-build-pack.md` §0 "Convenções de payload"; `docs/framework/arch/rait-events-sse-contract.md` §1
- `docs/framework/contracts/README.md`; `docs/framework/contracts/BP-INF-AIT-001.openapi.json` (formato gerado, `components.schemas`);
  `docs/framework/schemas/README.md`; `docs/framework/schemas/events/inf.infraction.changed.schema.json` (padrão de schema de evento)
- `tools/contracts/generate-openapi.mjs`; `tools/verify-controller-decorators.ts` (varredura de controladores por AST — reutilize a
  técnica para `check-commands.mjs`, em `.mjs` com `typescript` já disponível)
- Todos os controladores manuscritos: `backend/domains/inf/{ait,normative,measures,alcohol,speed}/src/**/*controller.ts` (fora de
  `src/controllers/`), `backend/domains/ops/{field,offline-sync,evidence,snapshots}/src/handwritten/*controller.ts`,
  `backend/app/src/teat-stream.controller.ts`, `backend/app/src/teat-integrations.controller.ts`
- Os `events.ts` manuscritos de cada módulo (schemas zod → JSON Schema)
- `backend/database/seed/10-fixtures-inf-ait.sql`, `25`, `26`, `27`, `28` (ids para exemplos)
- `package.json` da raiz (scripts `contracts:*`); `packages/senatran-adapter/package.json` (como `openapi-typescript` é invocado hoje)
- Origem `../teat` (**somente leitura**): `docs/framework/schemas/teat-offline-sync-batch.schema.json`

## Pode tocar

- `docs/framework/contracts/BP-INF-{AIT,NORMATIVE,MEASURES,ALCOHOL}-001.commands.openapi.json`,
  `docs/framework/contracts/BP-OPS-{FIELD,OFFLINE-SYNC,EVIDENCE,SNAPSHOTS}-001.commands.openapi.json`,
  `docs/framework/contracts/BP-OPS-BOOTSTRAP-001.commands.openapi.json` (bootstrap, turno, handoff, stream, integrações — `x-blueprint:
BP-OPS-FIELD-001`) (novos); `docs/framework/contracts/README.md` (uma seção sobre `*.commands.openapi.json`)
- `docs/framework/schemas/teat-offline-sync-batch.schema.json`, `teat-normative-package.schema.json`, `teat-bootstrap.schema.json`
  (novos); `docs/framework/schemas/events/<type>.schema.json` (novos, um por `type` TEAT)
- `tools/contracts/check-commands.mjs`, `tools/contracts/generate-clients.mjs` (novos); `tools/contracts/generate-openapi.mjs`
  (**só** o filtro de órfãos)
- `package.json` da raiz: `contracts:check` → `node tools/contracts/generate-openapi.mjs --check && node tools/contracts/check-commands.mjs`;
  `contracts:clients` → `node tools/contracts/generate-clients.mjs`; devDependency `openapi-typescript` (mesma versão do workspace)
- `packages/api-clients/{package.json,tsconfig.json,src/index.ts,src/generated/**}` (novo pacote `@detran/api-clients`, só tipos);
  `pnpm-workspace.yaml` **não** (se `packages/*` já estiver coberto; confira)

## Não pode tocar

Código de produção dos domínios; testes (inclusive `tools/contracts/tests/**`); blueprints; DDL; seeds; `docs/framework/arch/**`; `docs/meta/**`; `pnpm-lock.yaml` (o maestro
roda `pnpm install`); arquivos gerados `*.openapi.json` sem sufixo `.commands`.
Além disso: `docs/framework/product/**` (corpus de produto), `record/`, `.devai/`, `docs/meta/adr/`,
arquivos com cabeçalho "Generated from BP-…".

## Tarefa (o quê, não o como)

1. **Nove contratos de comando** (M19): OpenAPI 3.1; `info.x-blueprint`, `info.x-commands: true`, `info.x-source: teat-route-contract.md §n`;
   um `paths[<rota>][<método>]` por comando manuscrito com `operationId` `teat<Recurso><Verbo>`, `tags`, `parameters` (`If-Match`,
   `Idempotency-Key` quando o comando os aceita; path params), `requestBody` com `$ref` para `components.schemas.<DTO da origem>`
   (mesmos nomes e campos do contrato), respostas de sucesso (recurso pós-transição + `events[]` quando o contrato diz), 4xx com
   `code` enumerado (só códigos do catálogo), header `ETag` onde há `If-Match`, `examples` com ids das fixtures. Cubra **todas** as rotas
   manuscritas montadas (o gate confere nos dois sentidos).
2. **Schemas**: `teat-offline-sync-batch.schema.json` (origem + `device_batch_id`, `batch_sequence`, `items[].entity_type|local_entity_id|
idempotency_key|payload_hash|created_locally_at|payload_json`, `additionalProperties: false`), `teat-normative-package.schema.json`
   (conteúdo assinado M13), `teat-bootstrap.schema.json` (resposta M9); `events/<type>.schema.json` por `type` TEAT, tradução literal dos
   zod (`additionalProperties: false`).
3. **`check-commands.mjs`**: (1) parse + `x-blueprint` existente em `docs/framework/blueprints/`; (2) rota ⇔ controlador manuscrito nos
   dois sentidos (varredura AST de `@Controller`/`@Get|@Post|…` fora de `src/controllers/` gerados, nos pacotes `inf/{ait,normative,
measures,alcohol,speed}`, `ops/{field,offline-sync,evidence,snapshots}` e `backend/app/src/teat-*.controller.ts`); (3) todo `code` das
   respostas 4xx existe em `docs/framework/arch/teat-error-catalog.md`; (4) `operationId` único; saída "commands contracts: OK (<n> operations)"
   ou lista de diferenças e `exit 1`.
4. **`generate-clients.mjs`** + `packages/api-clients`: `openapi-typescript` sobre todos os `docs/framework/contracts/*.openapi.json`
   (gerados e `.commands`) → `packages/api-clients/src/generated/<nome>.ts`; `src/index.ts` reexporta; `package.json`
   (`@detran/api-clients`, `private`, `types` only, script `typecheck`); saída "clients written: <n>".
5. Rode os critérios; corrija até passarem. Diferença rota × contrato que exija mudar código de produção → relatório (não altere código).

## Definições que valem como contrato (copiadas das fontes; não reinterprete)

- `operationId` por comando `teat<Recurso><Verbo>` (transcriber-docs §Regras item 5, adaptado ao prefixo `teat`); respostas 4xx listam os
  `code` do catálogo; exemplos usam ids das fixtures.
- Convenções de payload (rait-build-pack §0): `If-Match` obrigatório nos comandos que o contrato marca (428/412); `Idempotency-Key` nas
  criações; enums exatos; `tenant_id` nunca no payload (quando a DTO de origem o traz, documente-o como `deprecated: true` e
  `description: ignorado; tenant vem do contexto`).
- Códigos: prefixo `TEAT.`; famílias de status do catálogo §2 do RAIT; genéricos §9 (`TEAT.IF_MATCH_REQUIRED` 428, `TEAT.VERSION_CONFLICT`
  412, `TEAT.VALIDATION_FAILED` 400, `TEAT.ENUM_INVALID` 400, `TEAT.FORBIDDEN_ACTION` 403, `TEAT.TENANT_MISMATCH` 404).
- `contracts:check` continua rodando o gerador em modo `--check` **antes** do gate de comandos; `x-generated` dos gerados permanece.

## Critérios de aceitação (todos precisam passar)

- `node --test tools/contracts/tests/` → todos os testes do Inspector passam, 0 failed
- `pnpm contracts:check` → "contracts are in sync with the blueprints" **e** "commands contracts: OK (<n> operations)"
- `pnpm contracts:clients` → "clients written: <n>"; `pnpm --filter @detran/api-clients typecheck` → sem erros
- `node -e "for (const f of require('fs').readdirSync('docs/framework/schemas')) if (f.endsWith('.json')) JSON.parse(require('fs').readFileSync('docs/framework/schemas/'+f,'utf8'))"` → sem erro
- `pnpm format:check` → limpo; `node tools/docs/kb/check.mjs` → 521/446 (inalterado); `pnpm check` → verde
- Relatório com a tabela "rota manuscrita → `operationId` → arquivo de contrato" (todas as rotas) e a lista de schemas gerados.

## Regras que não admitem exceção

1. Nenhum valor inventado: prazo, papel, estado, código de erro, rótulo ou parâmetro sem fonte nas
   definições acima vira `source_pending` no catálogo (`docs/framework/arch/parameter-catalogue.md`)
   ou uma questão `OD-*` no relatório; nunca constante silenciosa.
2. Código gerado não se edita (ADR-0007); comportamento manuscrito vai em `src/handwritten/` ou
   nos arquivos listados em "Pode tocar".
3. Tokens de estado, timer, papel e erro vêm dos catálogos citados; a UI só traduz rótulos.
4. Nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
5. Fixtures canônicas (`backend/database/seed/`, `docs/framework/arch/rait-fixtures.md`); não crie
   tenants nem personas próprias.
6. Prettier: `node_modules/.bin/prettier --write <arquivos que tocou>` antes de entregar.
7. O gate nunca é afrouxado para caber num contrato incompleto: contrato incompleto se completa.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: TASK-0010
Arquivos criados/alterados: <lista com caminho>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou "nenhuma">
Bloqueios: <ou "nenhum">
```

```

## Anexo — `work/rounds/R-0008/tasks/TASK-0010.json`

```json
{
  "schemaVersion": "2.0.0",
  "id": "TASK-0010",
  "round_id": "R-0008",
  "status": "queued",
  "discipline": "engineer",
  "discipline_specialization": "engineer-backend",
  "title": "Escrever os nove contratos de comando, os três schemas JSON, os schemas de evento, check-commands.mjs e contracts:clients",
  "description": "Transcrever os comandos manuscritos em *.commands.openapi.json e schemas verificáveis; criar o gate check-commands e o script de clientes; contracts:check verde.",
  "lifecycle": "supported",
  "target_modules": [
    "MOD-contracts-commands",
    "MOD-schemas",
    "MOD-tools-contracts",
    "MOD-package-json",
    "MOD-api-clients"
  ],
  "target_substrates": ["F2"],
  "target_invariants": [],
  "coupled_task_group": "CTG-0005",
  "coupled_pipeline_position": "engineer",
  "upstream_task_id": "TASK-0012",
  "db_isolation": "database",
  "iteration_count": 0,
  "max_iterations": 2,
  "priority": 10,
  "tags": ["wp-t3"],
  "branch": "orchestra/teat-backend",
  "worktree_id": "WT-teat-backend",
  "prompt_composition_id": "PC-ccac5f6582304e4a",
  "acceptance_commands": [
    ["pnpm", "contracts:check"],
    ["pnpm", "contracts:clients"],
    ["pnpm", "format:check"],
    ["pnpm", "check"]
  ],
  "created_at": "2026-09-15T16:00:00.000Z",
  "executor": {
    "kind": "agent",
    "runtime": "claude-cli",
    "model": "sonnet",
    "effort": "medium",
    "selection": {
      "mode": "exact",
      "registry_id": "claude-sonnet-5"
    },
    "prompt_composition_id": "PC-ccac5f6582304e4a",
    "max_iterations": 2,
    "capabilities": ["read", "local-write"]
  }
}

```

## Anexo — `work/rounds/R-0008/tasks/TASK-0012.json`

```json
{
  "schemaVersion": "2.0.0",
  "id": "TASK-0012",
  "round_id": "R-0008",
  "status": "queued",
  "discipline": "inspector",
  "discipline_specialization": "inspector-tests",
  "title": "Escrever os testes do gate check-commands.mjs, do script de clientes e das verificações rota ⇔ contrato, operationId único e códigos do catálogo (WP-T3)",
  "description": "Codificar em testes node:test os critérios do contrato CTG-0004 §WP-T3 para o gate de contratos de comando e o gerador de clientes, antes da implementação em TASK-0010; vermelhos até lá.",
  "lifecycle": "supported",
  "target_modules": ["MOD-tools-contracts-tests"],
  "target_substrates": ["F2"],
  "target_invariants": [],
  "coupled_task_group": "CTG-0005",
  "coupled_pipeline_position": "inspector",
  "upstream_task_id": "TASK-0013",
  "db_isolation": "database",
  "iteration_count": 0,
  "max_iterations": 2,
  "priority": 12,
  "tags": ["wp-t3"],
  "branch": "orchestra/teat-backend",
  "worktree_id": "WT-teat-backend",
  "prompt_composition_id": "PC-650598ff6d3e7318",
  "acceptance_commands": [
    ["pnpm", "format:check"],
    ["node", "--test", "tools/contracts/tests/"]
  ],
  "created_at": "2026-09-15T16:00:00.000Z",
  "executor": {
    "kind": "agent",
    "runtime": "claude-cli",
    "model": "sonnet",
    "effort": "medium",
    "selection": {
      "mode": "exact",
      "registry_id": "claude-sonnet-5"
    },
    "prompt_composition_id": "PC-650598ff6d3e7318",
    "max_iterations": 2,
    "capabilities": ["read", "local-write"]
  }
}

```

## Anexo — `work/rounds/R-0008/tasks/TASK-0013.json`

```json
{
  "schemaVersion": "2.0.0",
  "id": "TASK-0013",
  "round_id": "R-0008",
  "status": "queued",
  "discipline": "architect",
  "discipline_specialization": "architect-blueprint",
  "title": "Escrever o contrato WP-T3: formato dos contratos de comando, tabela rota → operationId, assinatura do gate check-commands.mjs e do gerador de clientes, três schemas JSON e critérios",
  "description": "Fechar, a partir de M19 e dos comandos implementados em CTG-0001…0004, o contrato CTG-0005 que o Inspector (TASK-0012) transcreve em testes e o Engineer (TASK-0010) em contratos, schemas e ferramentas. Nada de código.",
  "lifecycle": "supported",
  "target_modules": ["MOD-teat-contracts-design-wp-t3"],
  "target_substrates": ["F2"],
  "target_invariants": [],
  "coupled_task_group": "CTG-0005",
  "coupled_pipeline_position": "architect",
  "upstream_task_id": "TASK-0009",
  "db_isolation": "database",
  "iteration_count": 0,
  "max_iterations": 2,
  "priority": 13,
  "tags": ["wp-t3"],
  "branch": "orchestra/teat-backend",
  "worktree_id": "WT-teat-backend",
  "prompt_composition_id": "PC-1a790895da83e7c8",
  "acceptance_commands": [
    ["pnpm", "format:check"],
    ["node", "tools/docs/kb/check.mjs"]
  ],
  "created_at": "2026-09-15T16:00:00.000Z",
  "executor": {
    "kind": "agent",
    "runtime": "claude-cli",
    "model": "opus",
    "effort": "medium",
    "selection": {
      "mode": "exact",
      "registry_id": "claude-opus-5"
    },
    "prompt_composition_id": "PC-1a790895da83e7c8",
    "max_iterations": 2,
    "capabilities": ["read", "local-write"]
  }
}

```

