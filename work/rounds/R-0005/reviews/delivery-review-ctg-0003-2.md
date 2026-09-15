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

Grupo: CTG-0003

IMPORTANTE PARA SERIALIZAÇÃO: responda em JSON RFC 8259 estrito. Não use caracteres de crase em nenhum valor string; nomeie identificadores em texto simples.

Critérios verificados pelo Engineer:

- apply full: PASS.
- seed twice: PASS.
- AIT coverage: 17/17.
- reservation storage states: cancelled, consumed, expired, reserved.
- RLS smoke and pnpm check: PASS.

Review anterior e remediation:
Cycle 1 verdict REVIEW. All three highs were remediated: canonical cancellation mapping, explicit deterministic base and convergent upsert, hash/protocol only after their lifecycle milestones. Safe lows were addressed or explicitly left in WP-T2/source-pending scope. Confirm closure and absence of new highs.

Relatórios:

### work/rounds/R-0005/reports/TASK-0008.md

# TASK-0008 — relatório Engineer

Papel: Engineer

## Estado

Fixtures TEAT concluídas após duas iterações corretivas.

## Arquivos

- `backend/database/seed/25-fixtures-teat.sql`.
- `backend/database/seed/10-fixtures-inf-ait.sql`, alteração mínima de compatibilidade para o
  campo obrigatório `approach_class`; ambos os registros usam conservadoramente `caso_1` enquanto
  a ficha MBFT não é fonte autorizada.

## Comandos

- `DB_NAME=detran_r5 DB_PASSWORD=postgres bash backend/database/apply.sh --full`: PASS.
- `DB_NAME=detran_r5 DB_PASSWORD=postgres bash backend/database/seed.sh`, duas execuções: PASS.
- Consulta independente de cobertura: PASS — 17/17 estados de `inf.ait_state_ref` possuem AIT
  determinístico correspondente.
- Estados de reserva: PASS — `reserved`, `consumed`, `expired`, `cancelled`, mapeados explicitamente
  para `RESERVADA`, `CONSUMIDA`, `EXPIRADA`, `CANCELADA` de WF-TEAT-002.
- `DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r5 pnpm backend:rls-smoke`:
  PASS.
- `pnpm check`: PASS.

## Critérios

- Um AIT por estado canônico, derivado da tabela de referência, com IDs e conteúdo determinísticos.
- A linha-base do AIT é referenciada por ID determinístico; `ON CONFLICT` converge todas as colunas;
  `content_hash` surge em `FINALIZADO_LOCAL` e `receipt_protocol` somente em `RECEBIDO` ou depois.
- Uma reserva por estado do blueprint; pacote normativo `published`; dispositivos nas posturas
  `authorized`, `blocked` e `tamper`.
- Seed idempotente no mesmo banco e RLS smoke preservado.

## Fora do escopo

- Nenhum teste, DDL, blueprint, código de produto, documentação, `record` ou `.devai` foi alterado
  pelo Engineer de fixtures.
- Posturas adicionais de WP-T2, como uma situação não-autorizada distinta de bloqueada, não foram
  promovidas a fixture sem contrato persistido. Alterações em task JSON, relatório, plano e budget
  são escrituração do maestro, não do worker.

## OD

- Nenhuma.

## Bloqueios

- Nenhum.

Git diff --stat:

```text
 backend/database/seed/10-fixtures-inf-ait.sql | 5 +++--
 work/rounds/R-0005/tasks/TASK-0008.json       | 4 ++--
 2 files changed, 5 insertions(+), 4 deletions(-)
```

Diff completo do grupo, incluindo arquivos novos:

```diff
diff --git a/backend/database/seed/10-fixtures-inf-ait.sql b/backend/database/seed/10-fixtures-inf-ait.sql
index 33fff5e..85c44c8 100644
--- a/backend/database/seed/10-fixtures-inf-ait.sql
+++ b/backend/database/seed/10-fixtures-inf-ait.sql
@@ -1,8 +1,9 @@
 select set_config('app.role', 'owner', false);
 select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
 insert into inf.normative_catalog (id, tenant_id, name, catalog_type, version, published_at, valid_from, status, normative_source) values ('00000000-0000-7000-8000-0000e0000001', '00000000-0000-7000-8000-00000000a001', 'Catálogo CONTRAN — enquadramentos (fixtures)', 'enquadramentos', '2026.1', '2026-01-01', '2026-01-01', 'published', 'CTB; Res. CONTRAN 918/2022') on conflict (id) do update set status = excluded.status;
-insert into inf.normative_framing (id, tenant_id, catalog_id, framing_code, article, clause, description, severity, penalty, status) values ('00000000-0000-7000-8000-0000e1000001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e0000001', '7455-0', '218', 'II', 'Transitar em velocidade superior à máxima permitida em mais de 20% até 50%', 'grave', 'multa', 'active') on conflict (id) do update set description = excluded.description;
-insert into inf.normative_framing (id, tenant_id, catalog_id, framing_code, article, clause, description, severity, penalty, allows_no_approach, status) values ('00000000-0000-7000-8000-0000e1000002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e0000001', '5541-0', '181', 'XVII', 'Estacionar em local proibido pela sinalização', 'média', 'multa', true, 'active') on conflict (id) do update set description = excluded.description;
+-- MBFT ainda não é fonte autorizada para classificar abordagem; caso_1 é a postura conservadora.
+insert into inf.normative_framing (id, tenant_id, catalog_id, framing_code, article, clause, description, severity, penalty, approach_class, status) values ('00000000-0000-7000-8000-0000e1000001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e0000001', '7455-0', '218', 'II', 'Transitar em velocidade superior à máxima permitida em mais de 20% até 50%', 'grave', 'multa', 'caso_1', 'active') on conflict (id) do update set description = excluded.description, approach_class = excluded.approach_class;
+insert into inf.normative_framing (id, tenant_id, catalog_id, framing_code, article, clause, description, severity, penalty, approach_class, status) values ('00000000-0000-7000-8000-0000e1000002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e0000001', '5541-0', '181', 'XVII', 'Estacionar em local proibido pela sinalização', 'média', 'multa', 'caso_1', 'active') on conflict (id) do update set description = excluded.description, approach_class = excluded.approach_class;
 insert into inf.ait_ait (id, tenant_id, traffic_agency_id, ait_number, series, agent_id, shift_id, device_id, framing_id, catalog_id, infraction_at, issued_at, issuance_mode, constatation_type, had_approach, location_description, uf, municipality_code, current_status, content_hash, receipt_protocol) values ('00000000-0000-7000-8000-0000f0000001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e2000001', 'AM-2026-000001', 'F', '00000000-0000-4000-8000-0000b0000001', '00000000-0000-7000-8000-0000e3000001', '00000000-0000-7000-8000-0000e4000001', '00000000-0000-7000-8000-0000e1000001', '00000000-0000-7000-8000-0000e0000001', '2026-04-02T14:01:00-04:00', '2026-04-02T14:06:00-04:00', 'eletronico', 'abordagem', true, 'Av. Djalma Batista, 1000 — Manaus/AM', 'AM', '1302603', 'INTEGRADO', 'sha256:fixture01', 'REC-2026-000001') on conflict (id) do update set current_status = excluded.current_status;
 insert into inf.ait_status_history (id, tenant_id, ait_id, status, changed_at, system_name, reason) values ('00000000-0000-7000-8000-0000f1000001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000001', 'INTEGRADO', '2026-04-02T18:00:00-04:00', 'teat', 'fixture') on conflict (id) do nothing;
 insert into inf.ait_ait (id, tenant_id, traffic_agency_id, ait_number, series, agent_id, shift_id, device_id, framing_id, catalog_id, infraction_at, issued_at, issuance_mode, constatation_type, had_approach, location_description, uf, municipality_code, current_status, content_hash, receipt_protocol) values ('00000000-0000-7000-8000-0000f0000002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000e2000001', 'AM-2026-000002', 'F', '00000000-0000-4000-8000-0000b0000001', '00000000-0000-7000-8000-0000e3000001', '00000000-0000-7000-8000-0000e4000001', '00000000-0000-7000-8000-0000e1000002', '00000000-0000-7000-8000-0000e0000001', '2026-05-03T14:02:00-04:00', '2026-05-03T14:07:00-04:00', 'eletronico', 'sem_abordagem', false, 'Av. Djalma Batista, 1000 — Manaus/AM', 'AM', '1302603', 'INTEGRADO', 'sha256:fixture02', 'REC-2026-000002') on conflict (id) do update set current_status = excluded.current_status;
diff --git a/work/rounds/R-0005/tasks/TASK-0008.json b/work/rounds/R-0005/tasks/TASK-0008.json
index dcbf238..7d6b457 100644
--- a/work/rounds/R-0005/tasks/TASK-0008.json
+++ b/work/rounds/R-0005/tasks/TASK-0008.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0008",
   "round_id": "R-0005",
-  "status": "queued",
+  "status": "completed",
   "discipline": "engineer",
   "discipline_specialization": "engineer-backend",
   "title": "Add idempotent TEAT fixtures",
@@ -15,7 +15,7 @@
   "coupled_pipeline_position": "engineer",
   "upstream_task_id": "TASK-0007",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 2,
   "max_iterations": 2,
   "priority": 3,
   "tags": ["wp-t1", "fixtures"],

diff --git a/backend/database/seed/25-fixtures-teat.sql b/backend/database/seed/25-fixtures-teat.sql
new file mode 100644
--- /dev/null
+++ b/backend/database/seed/25-fixtures-teat.sql
@@ -0,0 +1,41 @@
+-- TASK-0008: TEAT fixtures; deterministic and idempotent.
+-- Storage reserved|consumed|expired|cancelled corresponde a RESERVADA|CONSUMIDA|EXPIRADA|CANCELADA (WF-TEAT-002; blueprint fixa reserved).
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+-- Um AIT determinístico por estado: a seleção da tabela de referência faz a
+-- fixture falhar fechada se o vocabulário não estiver aplicado.
+insert into inf.ait_ait (id, tenant_id, traffic_agency_id, ait_number, series, agent_id, shift_id, device_id, framing_id, catalog_id, infraction_at, issued_at, issuance_mode, constatation_type, had_approach, location_description, uf, municipality_code, current_status, content_hash, receipt_protocol)
+select ('00000000-0000-7000-8000-0000f8' || lpad(s.sort_order::text, 6, '0'))::uuid, a.tenant_id, a.traffic_agency_id,
+       'TEAT-' || lpad(s.sort_order::text, 3, '0'), a.series, a.agent_id,
+       a.shift_id, a.device_id, a.framing_id, a.catalog_id, a.infraction_at,
+       a.issued_at, a.issuance_mode, a.constatation_type, a.had_approach,
+       a.location_description, a.uf, a.municipality_code, s.code,
+       case when s.code in ('FINALIZADO_LOCAL','ENFILEIRADO','TRANSMITIDO','RECEBIDO','SUSPEITO_CONCORRENCIA','VALIDANDO','ACEITO','REJEITADO','PENDENTE_CORRECAO','CORRIGIDO','INTEGRADO','PROCESSADO','ARQUIVADO','SOLICITADO_CANCEL_POSFINAL','CANCELADO_POSFINAL') then 'sha256:task-0008-' || lower(s.code) else null end,
+       case when s.code in ('RECEBIDO','SUSPEITO_CONCORRENCIA','VALIDANDO','ACEITO','REJEITADO','PENDENTE_CORRECAO','CORRIGIDO','INTEGRADO','PROCESSADO','ARQUIVADO','SOLICITADO_CANCEL_POSFINAL','CANCELADO_POSFINAL') then 'TEAT-0008-' || lpad(s.sort_order::text, 3, '0') else null end
+from inf.ait_state_ref s
+join inf.ait_ait a on a.id = '00000000-0000-7000-8000-0000f0000001'
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, ait_number=excluded.ait_number, series=excluded.series, agent_id=excluded.agent_id, shift_id=excluded.shift_id, device_id=excluded.device_id, framing_id=excluded.framing_id, catalog_id=excluded.catalog_id, infraction_at=excluded.infraction_at, issued_at=excluded.issued_at, issuance_mode=excluded.issuance_mode, constatation_type=excluded.constatation_type, had_approach=excluded.had_approach, location_description=excluded.location_description, uf=excluded.uf, municipality_code=excluded.municipality_code, current_status=excluded.current_status, content_hash=excluded.content_hash, receipt_protocol=excluded.receipt_protocol;
+
+insert into ops.ops_operational_device (id, tenant_id, traffic_agency_id, hardware_identifier_hash, model, manufacturer, os_name, os_version, status, app_version, tamper_flag)
+values
+ ('00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-authorized','Field X','DETRAN','android','14','authorized','1.0.0',false),
+ ('00000000-0000-7000-8000-0000e4000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-blocked','Field X','DETRAN','android','14','blocked','1.0.0',false),
+ ('00000000-0000-7000-8000-0000e4000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','sha256:teat-device-tampered','Field X','DETRAN','android','14','authorized','1.0.0',true)
+on conflict (id) do update set status=excluded.status, tamper_flag=excluded.tamper_flag;
+
+insert into ops.ait_numbering_range (id,tenant_id,traffic_agency_id,series,start_number,end_number,next_number,status,usage_mode)
+values ('00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','F',2026000001,2026001000,2026000001,'active','offline')
+on conflict (id) do update set next_number=excluded.next_number, status=excluded.status;
+
+insert into ops.numbering_reservation (id,tenant_id,range_id,traffic_agency_id,agent_id,device_id,shift_id,idempotency_key,start_number,end_number,reserved_at,valid_until,status)
+values
+ ('00000000-0000-7000-8000-0000e6000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-reserved',2026000001,2026000001,'2026-09-14T10:00:00-04:00','2026-12-31T23:59:59-04:00','reserved'),
+ ('00000000-0000-7000-8000-0000e6000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-consumed',2026000002,2026000002,'2026-09-14T10:00:00-04:00','2026-12-31T23:59:59-04:00','consumed'),
+ ('00000000-0000-7000-8000-0000e6000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-expired',2026000003,2026000003,'2026-01-01T10:00:00-04:00','2026-01-02T23:59:59-04:00','expired'),
+ ('00000000-0000-7000-8000-0000e6000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e5000001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e3000001','teat-cancelled',2026000004,2026000004,'2026-09-01T10:00:00-04:00','2026-12-31T23:59:59-04:00','cancelled')
+on conflict (id) do update set status=excluded.status;
+
+insert into inf.normative_mobile_package (id,tenant_id,traffic_agency_id,catalog_id,package_version,manifest_hash,package_uri,published_at,valid_until,status)
+values ('00000000-0000-7000-8000-0000e7000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e0000001','2026.1','sha256:teat-normative-2026-1','https://fixtures.invalid/teat/2026.1','2026-09-14T10:00:00-04:00','2026-12-31','published')
+on conflict (id) do update set status=excluded.status, manifest_hash=excluded.manifest_hash;
```
