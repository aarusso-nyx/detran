## Papel (Constituição Art. 6)

Architect (TASK-0004 deltas v1.1.0, TASK-0005 blueprints novos e especificação da fachada) → Inspector (TASK-0006 testes de contrato de banco e fixtures) → Engineer (TASK-0007 wiring, port bancário mock, fachada de documentos) → Owner delegado (TASK-0008 transcrição). Maestro Fable 5.1 (Engineer no git e na evidência; Architect nas decisões M16 e nas notas de ADR). Orquestra `rait-model`, rodada DEVAI `R-0006`, grupo acoplado CTG-0002 (janela 3).

## Pacote de trabalho e fontes

WP-A de `docs/framework/arch/rait-build-pack.md` (restante: deltas v1.1.0 dos blueprints RAIT, organização, financeiro, integração, documentos). Fontes: [WF-RAIT-004] §3, §5–§10; [WF-RAIT-003]; [WF-RAIT-001]; [WF-RAIT-002] §4/§7; UC-RAIT-022/025/027/028/029/030/031/032…036/038/042/043; ADR-0017, ADR-0018, ADR-0020, ADR-0021; steering H.48/H.53/H.54/H.57. Decisões do maestro M1–M16 em `work/rounds/R-0006/plan.md`.

## O que muda

- `BP-INF-RAIT-WORKLIST-001`, `BP-INF-RAIT-SESSION-001`, `BP-INF-RAIT-CASE-001` → v1.1.0: `rait_unit`, `rait_schedule`/`rait_schedule_slot`, `rait_batch`/`rait_batch_item`, `rait_substitute_duty`, `rait_bench`, colunas de pool/membro/atribuição/impedimento; `modality`, `short_notice_ack`, pedido de vista, `published_at`; `legal_priority`, `unit_id`, `version`, `rait_pending_content`, `rait_redirect`, `rait_draft`. DDL 34–36 regenerados (+10 tabelas).
- `BP-INF-RAIT-ORG-001` (DDL 39: feriados, atos de suspensão, folha/linhas de jeton com valores pendentes de fonte, incidentes, amostras de qualidade, planos de capacidade, exportações), `BP-INF-COLLECTION-001` (DDL 57: `collection_document`, `payment`, `refund_order`, `debt_handoff`, faixas FK `infraction_payment_tier_ref`), `BP-INF-RAIT-INTEGRATION-001` (DDL 58: só `rait_reconciliation` — projeções do outbox ficam em WP-P, M10). Módulos gerados e contratos OpenAPI (38). 178 tabelas de tenant.
- Fachada de documentos em `@detran/shared` (`DocumentKind` × 12, `SignaturePolicy`, `DocumentsFacade`, `DOCUMENT_ERROR_CODES` — ADR-0018 §1–§4), só tipos e interface.
- `BankPort` + mock determinístico em `collection/src/handwritten/ports/bank` (ADR-0017 §4), provider `BANK_PORT`, 8 testes de comportamento (contrato §c); os módulos `rait-org`, `collection` e `rait-integration` **não** são montados no `AppModule` até R-0007 (M13/M17: sem matriz de política); negativas exaustivas de política para os 23 recursos novos (`policy.spec.ts`, 24 `it`).
- Fixtures: `20-fixtures-rait.sql` ajustado, `40-fixtures-rait-org.sql`, `50-fixtures-collection.sql`, `60-fixtures-rait-integration.sql` (uma por estado, prefixos M16), espelho `rait-fixtures.json`; 114 testes de integração novos (RLS, checks das máquinas TURMA/LOTE/BANCA/disponibilidade e dos módulos, FKs, unicidades parciais); sensor `inf-rls` 58 → 81.
- Integração de `main` durante a janela: PRs #37 (param-store), #40/#41/#42 (ops-agency: DDL 14 com 24 timers e 17 estados de AIT, TEAT v1.1.0, `signature_policy`, seed 25); sensor `inf-rls` 85 tabelas de tenant / 10 de referência; `verify:rls-ddl` 182.
- Docs: build pack §WP-A com a numeração real (38/39/57/58/59), `blueprints/README.md`, `rait-fixtures.md`, `rait-deadline-engine.md` §1, backlog; método da orquestra (ciclos de review restritos, fixtures no CI, escada recalibrada).
- Contratos da tríade: `work/rounds/R-0006/contracts/CTG-0002-deltas.md`, `CTG-0002-modules.md`.

## Verificação executada

- [x] `pnpm check`
- [x] `pnpm backend:test:ci` (+ `backend:rls-smoke`, `apply.sh --full` + `seed.sh` ×2 em banco limpo)
- [ ] `pnpm --filter @detran/rait-web test` (não se aplica: sem frontend)
- [x] `pnpm exec devai evidence record …` (referência abaixo)
- [x] nenhum arquivo gerado editado à mão; blueprint e gerados no mesmo PR

Revisão cruzada (GPT-5.6 Terra via `tools/orchestra/bridge.sh`): delivery-review-CTG-0002 ciclo 1 FAIL (5 achados → M17: reatribuição de TASK-0008 a Architect, bump do blueprint pelo Architect, testes do mock bancário, desmontagem dos módulos + negativas de política, critério 178) → ciclo 2 FAIL (autoria de docs, critério de TASK-0014, OD-309) → ciclo 3 REVIEW → ciclo 4 REVIEW → ciclo 5 **PASS**. Mutação documental de TASK-0008 revertida e re-autorada pelo Architect; OD-309 registrada. Evidência DEVAI: `record/proofs/work/generic/R-0006.jsonl` sequência 2, cadeia `record/proofs/chain.json` (`evidence chain: valid; head e4b98151f503aa12934f94b197cc034875cca9106fd0796566d990f3e418eee0`).

## Questões abertas tocadas

Vigentes (H.54/H.57): OD-003, 004, 005, 007, 008, 012, 013, 015, 016, 017, 018, 019, 101…112, 204, 207. Propostas novas (não decididas) em `CTG-0002-deltas.md` §g (5) e `CTG-0002-modules.md` §e.3 (14): vocabulário de turno da escala, chave de prazo da pendência de conteúdo, `priority_policy`, status da minuta, `jurisdiction` sem fixture, níveis PAdES/gov.br, layout do documento de arrecadação, valor da multa por gravidade, prazo de cobrança, porta da Fazenda, FK `rait_clock_alert.incident_ref`, desfecho de incidente, alvo de `responsible_id`, persona DPO, calendário por município, `exports["./documents"]` de `@detran/shared`. Divergências de prompt registradas nos relatórios (UCs 027/028 e 025/038 trocadas nos prompts; descriptions seguem a fonte).

## Fora do escopo / deixado explicitamente

Montagem de `rait-org`/`collection`/`rait-integration` no `AppModule` e matriz de política dos 23 recursos novos (R-0007, com os comandos); grants pré-existentes `inf:rait-suspension-act:create` e `inf:rait-export:create` em `RAIT_COMMAND_RULES` a confirmar em R-0007. Comandos, rotas e política das máquinas novas (R-0007, WP-B); projeções por consumidor e migração de `rait_communication` (WP-P, M10); `signature_policy` e generalização de `normative_document_template` (R-0008); provedor bancário real e porta da Fazenda; `rait-error-catalog.md` (`context` de `RAIT.INQUIRY_EXTENSION_LIMIT`, `T-PAR-3A` em `SUSPENSION_LEGAL_TIMER`) — correção de catálogo para a rodada dona; observação de auditoria de CTG-0001 (EV-b1a79752263c5493) perdida ao aceitar a cadeia de `main` no merge — observação final no sha deste merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
