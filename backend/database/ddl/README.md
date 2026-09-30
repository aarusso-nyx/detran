# Unified backend DDL

Applied by `../apply.sh` in one `psql --single-transaction` run: every `*.sql` file in lexical order (`LC_ALL=C sort`), except that `19-rait-priority-pre.sql` runs immediately before `34-inf-rait-case.sql` and that `20-rls-policies.sql`, a second application of `21-ops-provisioning.sql`, `19-rait-priority-enforce.sql` and `19-rait-priority-verify.sql` run last, in that order. Each file is listed once below, at its first application, so the list follows the order above and not the file numbers alone. Generated files are described by their `Generated from <blueprint> v<version>` header.

1. `00-extensions.sql` — pgcrypto, uuid-ossp, citext and PostGIS.
2. `01-schemas.sql` — shared plus empty `inf`/`est`/`ch`/`ops` domain schemas.
3. `02-auth.sql` — DETRAN tenants, identities, roles, memberships and sessions.
4. `03-audit.sql` — partitioned append-only `audit.events`.
5. `04-integration-storage.sql` — shared outbox, durable idempotency/rate-limit
   stores and storage metadata foundations.
6. `05-role-catalog.sql` — canonical DETRAN role catalogue (`auth.role_catalog`), seeded
   one-to-one with `backend/domains/shared/src/roles.ts` and enforced on `auth.roles.key`
   (`pnpm verify:role-catalog`).
7. `10-postgis-functions.sql` — SRID-4674 JSON/GeoJSON conversion helpers.
8. `11-auth-functions.sql` — request tenant setting, RLS helper and automatic
   `enforce_tenant_id` trigger installer.
9. `12-audit-functions.sql` — serialized per-tenant hash-chain persistence and
   verification.
10. `13-ops-agency.sql` — Generated from BP-OPS-AGENCY-001 v1.0.0
11. `13-ops-field-operations.sql` — Generated from BP-OPS-FIELD-001 v1.2.0
12. `14-inf-lifecycle-vocabulary.sql` — reference tables of the infraction lifecycle
    (`inf.infraction_*_ref`, `inf.notification_channel_ref`): states, sub-states,
    closure motives, timers, transitions and events of `WF-INF-003`/`WF-INF-002 §9`
    (`pnpm verify:lifecycle-vocabulary`).
13. `15-ops-parameter.sql` — Generated from BP-OPS-PARAMETER-001 v1.0.0
14. `16-ops-snapshots.sql` — Generated from BP-OPS-SNAPSHOTS-001 v1.1.0
15. `17-ops-evidence.sql` — Generated from BP-OPS-EVIDENCE-001 v1.1.0
16. `18-ops-offline-sync.sql` — Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0
17. `19-ch-encounter-renach-key.sql` — pré-checagem manuscrita (faixa 1x) do índice único parcial
    `ux_ch_encounter_renach_process_key` de BP-CH-ENCOUNTERS-001 v1.2.1 (chave RENACH única por
    tenant, OD-HF-B9-001 = (a)) e retirada do índice anterior `ux_ch_encounter_renach_process`.
18. `19-dashboard-lifecycle-vocabulary.sql` — Vocabulário do DASHBOARD para o estado próprio de BP-DASH-MONITOR-001 (WF-DASH-001 ciclo do alerta, WF-DASH-002 calendário de deveres periódicos, WF-DASH-003 frescor; RN-DASH-142 classificação; RN-DASH-170 camadas; dashboard-route-contract.md §2/§3; parameter-catalogue.md §DASHBOARD; plan R-0011 M3 e M7; adendas A4 e A7; contrato work/rounds/R-0011/contracts/CTG-0001.md §3).
19. `19-est-lifecycle-vocabulary.sql` — Vocabulário do BOAT para o agregado est.crash (WF-BOAT-001, WF-BOAT-003; H.42, H.43 e H.45).
20. `19-portal-platform.sql` — 19-portal-platform.sql — plataforma do Portal (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
21. `21-ops-provisioning.sql` — Generated from BP-OPS-PROVISIONING-001 v1.0.3
22. `30-inf-normative.sql` — Generated from BP-INF-NORMATIVE-001 v1.1.0
23. `30-ops-example.sql` — Generated from BP-OPS-EXAMPLE-001 v1.0.0
24. `31-inf-ait.sql` — Generated from BP-INF-AIT-001 v1.2.0
25. `32-inf-measures.sql` — Generated from BP-INF-MEASURES-001 v1.2.0
26. `33-inf-alcohol.sql` — Generated from BP-INF-ALCOHOL-001 v1.2.0
27. `19-rait-priority-pre.sql` — CTG-0001-C4-OD V3.
28. `34-inf-rait-case.sql` — Generated from BP-INF-RAIT-CASE-001 v1.1.7
29. `35-inf-rait-worklist.sql` — Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1
30. `36-inf-rait-session.sql` — Generated from BP-INF-RAIT-SESSION-001 v1.2.2
31. `37-inf-speed.sql` — Generated from BP-INF-SPEED-001 v1.1.0
32. `38-inf-infraction.sql` — Generated from BP-INF-INFRACTION-001 v1.1.2
33. `39-inf-rait-org.sql` — Generated from BP-INF-RAIT-ORG-001 v1.0.1
34. `40-ch-clinical-network.sql` — Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1
35. `41-ch-patients.sql` — Generated from BP-CH-PATIENTS-001 v1.1.0
36. `42-ch-encounters.sql` — Generated from BP-CH-ENCOUNTERS-001 v1.2.1
37. `43-ch-exams.sql` — Generated from BP-CH-EXAMS-001 v1.1.0
38. `44-ch-reports.sql` — Generated from BP-CH-REPORTS-001 v1.3.0
39. `45-ch-biometrics.sql` — Generated from BP-CH-BIOMETRICS-001 v1.1.0
40. `46-ch-scheduling.sql` — Generated from BP-CH-SCHEDULING-001 v1.0.0
41. `47-ch-restrictions.sql` — Generated from BP-CH-RESTRICTIONS-001 v1.0.0
42. `48-ch-retention.sql` — Generated from BP-CH-RETENTION-001 v1.0.0
43. `49-ch-process-blocks.sql` — Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0
44. `50-ch-telehealth.sql` — Generated from BP-CH-TELEHEALTH-001 v1.0.0
45. `51-ch-billing.sql` — Generated from BP-CH-BILLING-001 v1.0.0
46. `52-ch-clinical-controls.sql` — Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0
47. `53-ch-inconsistencies.sql` — Generated from BP-CH-INCONSISTENCIES-001 v1.0.0
48. `54-ch-operational-controls.sql` — Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0
49. `55-ch-juntas.sql` — Generated from BP-CH-JUNTAS-001 v1.0.0
50. `56-ch-toxicology.sql` — Generated from BP-CH-TOXICOLOGY-001 v1.0.0
51. `57-inf-collection.sql` — Generated from BP-INF-COLLECTION-001 v1.0.2
52. `58-inf-rait-integration.sql` — Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1
53. `59-inf-notification.sql` — Generated from BP-INF-NOTIFICATION-001 v1.1.1
54. `60-portal-complaints.sql` — Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0
55. `61-portal-identity.sql` — Generated from BP-PORTAL-IDENTITY-001 v1.0.2
56. `62-portal-requests.sql` — Generated from BP-PORTAL-REQUESTS-001 v1.0.2
57. `63-portal-inbox.sql` — Generated from BP-PORTAL-INBOX-001 v1.0.2
58. `64-portal-citizen-service.sql` — Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1
59. `65-portal-projections.sql` — Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2
60. `70-est-crash.sql` — Generated from BP-EST-CRASH-001 v1.0.0
61. `71-dashboard-crashes.sql` — Generated from BP-DASHBOARD-CRASHES-001 v1.0.0
62. `72-integration-renaest-mirror.sql` — Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0
63. `75-boat-renaest-job.sql` — `jobs` control substrate for the BOAT RENAEST
    monthly executor: audited per-tenant technical identities, restricted active
    tenant discovery, execution ledger and forced RLS. It grants no administrative
    access to BOAT domain data.
64. `80-dashboard.sql` — Generated from BP-DASH-MONITOR-001 v1.1.0
65. `20-rls-policies.sql` — forced RLS, trigger installation and least-privilege
    grants.
66. `19-rait-priority-enforce.sql` — CTG-0001-C4-OD V3.
67. `19-rait-priority-verify.sql` — CTG-0001-C4-OD V3.

Application notes (`../apply.sh`):

- `21-ops-provisioning.sql` is applied twice: at its lexical position and again right after `20-rls-policies.sql`. From `apply.sh`: "DDL20 grants its broad baseline after the ordered inventory. Reapply this generated DDL so its applicationAppendOnly revocations are the final, idempotent privilege state both on first application and on reapplication."
- `19-rait-priority-pre.sql`, `19-rait-priority-enforce.sql` and `19-rait-priority-verify.sql` are skipped by the lexical loop: `19-rait-priority-pre.sql` runs immediately before `34-inf-rait-case.sql`; `19-rait-priority-enforce.sql` and `19-rait-priority-verify.sql` run after the second application of `21-ops-provisioning.sql`, `19-rait-priority-verify.sql` last.

`auth.tenants` is the canonical DETRAN tenant table. `tenancy.tenants` is a
simple, automatically updatable compatibility view exposing the columns used by
`@stynx-nyx/tenancy`; this prevents a second tenant source of truth.

## Duplicatas da chave de processo RENACH

`19-ch-encounter-renach-key.sql` recusa a aplicação quando `ch.encounter` tem a mesma
`renach_process_key` em mais de um atendimento do mesmo tenant e o índice
`ch.ux_ch_encounter_renach_process_key` ainda não existe; a mensagem lista, por chave, o tenant,
o número de atendimentos e o de pacientes distintos. A DDL não escolhe qual vínculo manter:

1. Para cada chave listada, identifique no RENACH o paciente titular do processo.
2. O índice cobre atendimentos em qualquer `status` (inclusive `CANCELLED`) e de qualquer paciente:
   para cada par (tenant, chave), a operação escolhe exatamente um atendimento que fica com a chave
   e a desassocia de todos os demais, inclusive dos que pertencem ao próprio paciente titular. Qual
   atendimento manter, com que registro e se o processo correto é reaberto é decisão da operação,
   nunca da DDL; a desassociação limpa `renach_process_key` e `renach_process_type` juntos
   (`ck_ch_encounter_renach_process_pair`).
3. Reaplique a DDL; o bloco não varre a tabela quando o índice já existe.
