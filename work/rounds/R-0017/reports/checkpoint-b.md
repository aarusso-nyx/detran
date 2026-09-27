# Checkpoint (b) - CTG-0002

Papel: Engineer. Worktree limpa antes da sequencia. Saida integral da execucao
final abaixo. `checkpoint-b-smoke.json`: 42/42 linhas `passed`, incluindo Portal
com a denuncia sintetica exclusiva da stack local e tres 503 esperados do CH.
`checkpoint-b-preflight.json`: prova negativa, `backend.healthz` indisponivel
apos `stack:stop` e `stack:smoke` com exit 1. Tentativas anteriores e triagem
estao preservadas em `plan.md`.

```text

===== db-reset =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:db-reset /Users/aarusso/.codex/worktrees/local-stack/detran
> bash tools/detran-stack.sh db-reset

detran-stack: starting existing PostGIS container detran-local-stack-postgres
detran-stack: resetting disposable database detran_local_stack
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 backend:db:reset /Users/aarusso/.codex/worktrees/local-stack/detran
> bash backend/database/apply.sh --full

 pg_advisory_xact_lock 
-----------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/12-audit-functions.sql:109: NOTICE:  trigger "audit_events_prevent_mutation" for relation "audit.events" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:58: NOTICE:  policy "tenant_isolation" for relation "ops.agency_unit" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:60: NOTICE:  policy "tenant_isolation" for relation "ops.agency_jurisdiction" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:62: NOTICE:  policy "tenant_isolation" for relation "ops.agency_competence" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:22: NOTICE:  identifier "ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_number" will be truncated to "ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_n"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:73: NOTICE:  identifier "ux_ops_homologation_tenant_id_traffic_agency_id_homologation_number" will be truncated to "ux_ops_homologation_tenant_id_traffic_agency_id_homologation_nu"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:209: NOTICE:  identifier "ux_ops_measurement_instrument_tenant_id_instrument_type_serial_number" will be truncated to "ux_ops_measurement_instrument_tenant_id_instrument_type_serial_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:210: NOTICE:  identifier "ix_ops_measurement_instrument_tenant_id_traffic_agency_id_status" will be truncated to "ix_ops_measurement_instrument_tenant_id_traffic_agency_id_statu"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:299: NOTICE:  policy "tenant_isolation" for relation "ops.ops_agent_profile" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:301: NOTICE:  policy "tenant_isolation" for relation "ops.ops_operational_device" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:303: NOTICE:  policy "tenant_isolation" for relation "ops.ops_homologation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:305: NOTICE:  policy "tenant_isolation" for relation "ops.ops_application_version" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:307: NOTICE:  policy "tenant_isolation" for relation "ops.ops_device_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:309: NOTICE:  policy "tenant_isolation" for relation "ops.ops_operation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:311: NOTICE:  policy "tenant_isolation" for relation "ops.ops_team" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:313: NOTICE:  policy "tenant_isolation" for relation "ops.ops_team_agent" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:315: NOTICE:  policy "tenant_isolation" for relation "ops.ops_patrol_vehicle" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:317: NOTICE:  policy "tenant_isolation" for relation "ops.ops_measurement_instrument" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:319: NOTICE:  policy "tenant_isolation" for relation "ops.ops_shift" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:321: NOTICE:  policy "tenant_isolation" for relation "ops.ops_approach" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:323: NOTICE:  policy "tenant_isolation" for relation "ops.ops_session_handoff" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:10: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:39: NOTICE:  policy "tenant_isolation" for relation "ops.parameter" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:41: NOTICE:  identifier "ix_snapshots_person_document_tenant_id_document_type_document_number" will be truncated to "ix_snapshots_person_document_tenant_id_document_type_document_n"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:118: NOTICE:  policy "tenant_isolation" for relation "ops.snapshots_person" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:120: NOTICE:  policy "tenant_isolation" for relation "ops.snapshots_person_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:122: NOTICE:  policy "tenant_isolation" for relation "ops.snapshots_vehicle" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:124: NOTICE:  policy "tenant_isolation" for relation "ops.snapshots_external_query" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:126: NOTICE:  policy "tenant_isolation" for relation "ops.snapshots_vehicle_snapshot" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:111: NOTICE:  identifier "ux_evidence_probative_package_item_tenant_id_package_id_sequence" will be truncated to "ux_evidence_probative_package_item_tenant_id_package_id_sequenc"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:164: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_evidence" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:166: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_link" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:168: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_custody_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:170: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_probative_package" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:172: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_probative_package_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:174: NOTICE:  policy "tenant_isolation" for relation "ops.evidence_access_request" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:176: NOTICE:  policy "tenant_isolation" for relation "ops.storage_intent" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:193: NOTICE:  policy "tenant_isolation" for relation "ops.ait_numbering_range" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:195: NOTICE:  policy "tenant_isolation" for relation "ops.numbering_reservation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:197: NOTICE:  policy "tenant_isolation" for relation "ops.numbering_consumption" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:199: NOTICE:  policy "tenant_isolation" for relation "ops.sync_batch" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:201: NOTICE:  policy "tenant_isolation" for relation "ops.sync_queue_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:203: NOTICE:  policy "tenant_isolation" for relation "ops.sync_receipt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:205: NOTICE:  policy "tenant_isolation" for relation "ops.sync_conflict" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:5: NOTICE:  schema "est" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  identifier "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_type" will be truncated to "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  identifier "ux_provisioning_command_idempotency_tenant_id_command_name_idempotency_key" will be truncated to "ux_provisioning_command_idempotency_tenant_id_command_name_idem"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  identifier "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliation_digest" will be truncated to "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_reservation"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  identifier "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_authorized_agent_id" will be truncated to "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:203: NOTICE:  policy "tenant_isolation" for relation "ops.device_key" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:205: NOTICE:  policy "tenant_isolation" for relation "ops.offline_authorization_grant" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:207: NOTICE:  policy "tenant_isolation" for relation "ops.provisioning_package" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:209: NOTICE:  policy "tenant_isolation" for relation "ops.provisioning_receipt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:211: NOTICE:  policy "tenant_isolation" for relation "ops.device_revocation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:213: NOTICE:  policy "tenant_isolation" for relation "ops.provisioning_command_idempotency" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:215: NOTICE:  policy "tenant_isolation" for relation "ops.provisioning_reconciliation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:217: NOTICE:  policy "tenant_isolation" for relation "ops.provisioning_grant_reservation_binding" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:174: NOTICE:  policy "tenant_isolation" for relation "inf.normative_catalog" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:176: NOTICE:  policy "tenant_isolation" for relation "inf.normative_framing" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:178: NOTICE:  policy "tenant_isolation" for relation "inf.normative_metrological_table" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:180: NOTICE:  policy "tenant_isolation" for relation "inf.normative_validation_rule" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:182: NOTICE:  policy "tenant_isolation" for relation "inf.normative_agency_parameter" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:184: NOTICE:  policy "tenant_isolation" for relation "inf.normative_document_template" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:186: NOTICE:  policy "tenant_isolation" for relation "inf.signature_policy" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:188: NOTICE:  policy "tenant_isolation" for relation "inf.normative_mobile_package" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-ops-example.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-ops-example.sql:17: NOTICE:  policy "tenant_isolation" for relation "ops.example_record" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:240: NOTICE:  policy "tenant_isolation" for relation "inf.ait_ait" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:242: NOTICE:  policy "tenant_isolation" for relation "inf.ait_cancel_request" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:244: NOTICE:  policy "tenant_isolation" for relation "inf.ait_cancel_request_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:246: NOTICE:  policy "tenant_isolation" for relation "inf.ait_vehicle" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:248: NOTICE:  policy "tenant_isolation" for relation "inf.ait_person" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:250: NOTICE:  policy "tenant_isolation" for relation "inf.ait_status_history" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:252: NOTICE:  policy "tenant_isolation" for relation "inf.ait_correction" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:254: NOTICE:  policy "tenant_isolation" for relation "inf.ait_signature" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:256: NOTICE:  policy "tenant_isolation" for relation "inf.ait_print_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:208: NOTICE:  policy "tenant_isolation" for relation "inf.measure_type" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:210: NOTICE:  policy "tenant_isolation" for relation "inf.administrative_measure" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:212: NOTICE:  policy "tenant_isolation" for relation "inf.administrative_term" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:214: NOTICE:  policy "tenant_isolation" for relation "inf.measure_retention" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:216: NOTICE:  policy "tenant_isolation" for relation "inf.measure_removal" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:218: NOTICE:  policy "tenant_isolation" for relation "inf.vehicle_inventory" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:220: NOTICE:  policy "tenant_isolation" for relation "inf.tow_provider" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:222: NOTICE:  policy "tenant_isolation" for relation "inf.yard" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:224: NOTICE:  policy "tenant_isolation" for relation "inf.measure_status_history" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:160: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_procedure" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:162: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_breathalyzer" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:164: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_test" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:166: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_refusal" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:168: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_psychomotor_sign" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:170: NOTICE:  policy "tenant_isolation" for relation "inf.alcohol_forwarding" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:461: NOTICE:  policy "tenant_isolation" for relation "inf.rait_case" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:463: NOTICE:  policy "tenant_isolation" for relation "inf.rait_party" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:465: NOTICE:  policy "tenant_isolation" for relation "inf.rait_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:467: NOTICE:  policy "tenant_isolation" for relation "inf.rait_priority_assessment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:469: NOTICE:  policy "tenant_isolation" for relation "inf.rait_priority_basis" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:471: NOTICE:  policy "tenant_isolation" for relation "inf.rait_pending_content" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:473: NOTICE:  policy "tenant_isolation" for relation "inf.rait_redirect" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:475: NOTICE:  policy "tenant_isolation" for relation "inf.rait_admissibility" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:477: NOTICE:  policy "tenant_isolation" for relation "inf.rait_deadline" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:479: NOTICE:  policy "tenant_isolation" for relation "inf.rait_inquiry" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:481: NOTICE:  policy "tenant_isolation" for relation "inf.rait_inquiry_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:483: NOTICE:  policy "tenant_isolation" for relation "inf.rait_pending_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:485: NOTICE:  policy "tenant_isolation" for relation "inf.rait_withdrawal_attestation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:487: NOTICE:  policy "tenant_isolation" for relation "inf.rait_draft" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:489: NOTICE:  policy "tenant_isolation" for relation "inf.rait_decision" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:491: NOTICE:  policy "tenant_isolation" for relation "inf.rait_communication" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:493: NOTICE:  policy "tenant_isolation" for relation "inf.rait_case_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:82: NOTICE:  column "representation_block" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:83: NOTICE:  column "institutional_seat_ref" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:84: NOTICE:  column "appointment_act_ref" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:85: NOTICE:  column "institutional_valid_from" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:86: NOTICE:  column "institutional_valid_to" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:87: NOTICE:  column "institutional_identity_hash" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:149: NOTICE:  column "version" of relation "rait_schedule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:213: NOTICE:  column "version" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:214: NOTICE:  column "approval_signature_ref" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:215: NOTICE:  column "approval_receipt_hash" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:216: NOTICE:  column "approval_verified_at" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:217: NOTICE:  column "approval_signer_person_id" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:282: NOTICE:  column "manifest_hash" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:283: NOTICE:  column "manifest_version" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:284: NOTICE:  column "prepared_at" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:492: NOTICE:  trigger "rait_batch_draw_snapshot_immutable" for relation "inf.rait_batch_draw_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:495: NOTICE:  trigger "rait_batch_draw_snapshot_no_truncate" for relation "inf.rait_batch_draw_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:496: NOTICE:  trigger "rait_batch_draw_snapshot_immutable_truncate" for relation "inf.rait_batch_draw_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:500: NOTICE:  trigger "rait_batch_minutes_manifest_immutable" for relation "inf.rait_batch_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:503: NOTICE:  trigger "rait_batch_minutes_manifest_no_truncate" for relation "inf.rait_batch_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:504: NOTICE:  trigger "rait_batch_minutes_manifest_immutable_truncate" for relation "inf.rait_batch_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:508: NOTICE:  policy "tenant_isolation" for relation "inf.rait_unit" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:510: NOTICE:  policy "tenant_isolation" for relation "inf.rait_pool" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:512: NOTICE:  policy "tenant_isolation" for relation "inf.rait_pool_member" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:514: NOTICE:  policy "tenant_isolation" for relation "inf.rait_schedule" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:516: NOTICE:  policy "tenant_isolation" for relation "inf.rait_schedule_slot" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:518: NOTICE:  policy "tenant_isolation" for relation "inf.rait_batch" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:520: NOTICE:  policy "tenant_isolation" for relation "inf.rait_batch_draw_snapshot" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:522: NOTICE:  policy "tenant_isolation" for relation "inf.rait_batch_minutes_manifest" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:524: NOTICE:  policy "tenant_isolation" for relation "inf.rait_batch_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:526: NOTICE:  policy "tenant_isolation" for relation "inf.rait_assignment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:528: NOTICE:  policy "tenant_isolation" for relation "inf.rait_impediment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:530: NOTICE:  policy "tenant_isolation" for relation "inf.rait_substitute_duty" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:532: NOTICE:  policy "tenant_isolation" for relation "inf.rait_bench" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:534: NOTICE:  policy "tenant_isolation" for relation "inf.rait_clock" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:536: NOTICE:  policy "tenant_isolation" for relation "inf.rait_clock_alert" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:38: NOTICE:  column "version" of relation "rait_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:87: NOTICE:  column "version" of relation "rait_agenda_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:138: NOTICE:  column "representation_block" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:139: NOTICE:  column "membership_kind" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:140: NOTICE:  column "mandate_starts_on_snapshot" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:141: NOTICE:  column "mandate_ends_on_snapshot" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:142: NOTICE:  column "institutional_seat_ref" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:143: NOTICE:  column "appointment_act_ref" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:144: NOTICE:  column "institutional_valid_from" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:145: NOTICE:  column "institutional_valid_to" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:146: NOTICE:  column "composition_snapshot_hash" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:244: NOTICE:  column "version" of relation "rait_minutes" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:412: NOTICE:  relation "ux_inf_rait_pool_member_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:426: NOTICE:  trigger "rait_vote_immutable" for relation "inf.rait_vote" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:429: NOTICE:  trigger "rait_vote_no_truncate" for relation "inf.rait_vote" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:430: NOTICE:  trigger "rait_vote_immutable_truncate" for relation "inf.rait_vote" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:434: NOTICE:  trigger "rait_minutes_immutable" for relation "inf.rait_minutes" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:437: NOTICE:  trigger "rait_minutes_no_truncate" for relation "inf.rait_minutes" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:438: NOTICE:  trigger "rait_minutes_immutable_truncate" for relation "inf.rait_minutes" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:442: NOTICE:  trigger "rait_session_minutes_snapshot_immutable" for relation "inf.rait_session_minutes_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:445: NOTICE:  trigger "rait_session_minutes_snapshot_no_truncate" for relation "inf.rait_session_minutes_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:446: NOTICE:  trigger "rait_session_minutes_snapshot_immutable_truncate" for relation "inf.rait_session_minutes_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:450: NOTICE:  trigger "rait_session_minutes_manifest_immutable" for relation "inf.rait_session_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:453: NOTICE:  trigger "rait_session_minutes_manifest_no_truncate" for relation "inf.rait_session_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:454: NOTICE:  trigger "rait_session_minutes_manifest_immutable_truncate" for relation "inf.rait_session_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:458: NOTICE:  trigger "rait_minutes_required_signer_immutable" for relation "inf.rait_minutes_required_signer" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:461: NOTICE:  trigger "rait_minutes_required_signer_no_truncate" for relation "inf.rait_minutes_required_signer" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:462: NOTICE:  trigger "rait_minutes_required_signer_immutable_truncate" for relation "inf.rait_minutes_required_signer" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:466: NOTICE:  trigger "rait_minutes_signature_receipt_immutable" for relation "inf.rait_minutes_signature_receipt" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:469: NOTICE:  trigger "rait_minutes_signature_receipt_no_truncate" for relation "inf.rait_minutes_signature_receipt" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:470: NOTICE:  trigger "rait_minutes_signature_receipt_immutable_truncate" for relation "inf.rait_minutes_signature_receipt" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:474: NOTICE:  policy "tenant_isolation" for relation "inf.rait_session" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:476: NOTICE:  policy "tenant_isolation" for relation "inf.rait_agenda_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:478: NOTICE:  policy "tenant_isolation" for relation "inf.rait_attendance" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:480: NOTICE:  policy "tenant_isolation" for relation "inf.rait_vote" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:482: NOTICE:  policy "tenant_isolation" for relation "inf.rait_oral_argument" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:484: NOTICE:  policy "tenant_isolation" for relation "inf.rait_minutes" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:486: NOTICE:  policy "tenant_isolation" for relation "inf.rait_session_minutes_snapshot" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:488: NOTICE:  policy "tenant_isolation" for relation "inf.rait_session_minutes_manifest" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:490: NOTICE:  policy "tenant_isolation" for relation "inf.rait_minutes_required_signer" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:492: NOTICE:  policy "tenant_isolation" for relation "inf.rait_minutes_signature_receipt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:85: NOTICE:  policy "tenant_isolation" for relation "inf.speed_meter" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:87: NOTICE:  policy "tenant_isolation" for relation "inf.speed_meter_certificate" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:89: NOTICE:  policy "tenant_isolation" for relation "inf.speed_measurement" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:128: NOTICE:  policy "tenant_isolation" for relation "inf.infraction" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:130: NOTICE:  policy "tenant_isolation" for relation "inf.infraction_timer" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:132: NOTICE:  policy "tenant_isolation" for relation "inf.infraction_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:238: NOTICE:  policy "tenant_isolation" for relation "inf.rait_holiday" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:240: NOTICE:  policy "tenant_isolation" for relation "inf.rait_suspension_act" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:242: NOTICE:  policy "tenant_isolation" for relation "inf.rait_jeton_sheet" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:244: NOTICE:  policy "tenant_isolation" for relation "inf.rait_jeton_line" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:246: NOTICE:  policy "tenant_isolation" for relation "inf.rait_incident" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:248: NOTICE:  policy "tenant_isolation" for relation "inf.rait_quality_sample" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:250: NOTICE:  policy "tenant_isolation" for relation "inf.rait_capacity_plan" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:252: NOTICE:  policy "tenant_isolation" for relation "inf.rait_export" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:82: NOTICE:  policy "tenant_isolation" for relation "ch.clinic" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:84: NOTICE:  policy "tenant_isolation" for relation "ch.professional" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:86: NOTICE:  policy "tenant_isolation" for relation "ch.biometric_station" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:38: NOTICE:  policy "tenant_isolation" for relation "ch.patient" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:76: NOTICE:  policy "tenant_isolation" for relation "ch.appointment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:78: NOTICE:  policy "tenant_isolation" for relation "ch.encounter" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:81: NOTICE:  policy "tenant_isolation" for relation "ch.psych_instrument" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:83: NOTICE:  policy "tenant_isolation" for relation "ch.medical_exam" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:85: NOTICE:  policy "tenant_isolation" for relation "ch.psychological_exam" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:229: NOTICE:  policy "tenant_isolation" for relation "ch.report" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:231: NOTICE:  policy "tenant_isolation" for relation "ch.report_addendum" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:233: NOTICE:  policy "tenant_isolation" for relation "ch.report_addendum_approval" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:235: NOTICE:  policy "tenant_isolation" for relation "ch.registration_block_notice" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:237: NOTICE:  policy "tenant_isolation" for relation "ch.feedback_request" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:239: NOTICE:  policy "tenant_isolation" for relation "ch.episode_export" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:241: NOTICE:  policy "tenant_isolation" for relation "ch.clinical_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:134: NOTICE:  policy "tenant_isolation" for relation "ch.biometric_reference" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:136: NOTICE:  policy "tenant_isolation" for relation "ch.biometric_finger_condition" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:138: NOTICE:  policy "tenant_isolation" for relation "ch.biometric_check" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:140: NOTICE:  policy "tenant_isolation" for relation "ch.biometric_exception" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:66: NOTICE:  policy "tenant_isolation" for relation "ch.professional_schedule" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:68: NOTICE:  policy "tenant_isolation" for relation "ch.appointment_assignment_draw" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:47: NOTICE:  policy "tenant_isolation" for relation "ch.restriction_code" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:49: NOTICE:  policy "tenant_isolation" for relation "ch.encounter_restriction" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:78: NOTICE:  policy "tenant_isolation" for relation "ch.retention_case" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:80: NOTICE:  policy "tenant_isolation" for relation "ch.retention_hold" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:82: NOTICE:  policy "tenant_isolation" for relation "ch.retention_disposition" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:30: NOTICE:  policy "tenant_isolation" for relation "ch.process_block" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:41: NOTICE:  policy "tenant_isolation" for relation "ch.telehealth_session" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:132: NOTICE:  policy "tenant_isolation" for relation "ch.federal_exam_public_price" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:134: NOTICE:  policy "tenant_isolation" for relation "ch.billing_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:136: NOTICE:  policy "tenant_isolation" for relation "ch.billing_invoice" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:138: NOTICE:  policy "tenant_isolation" for relation "ch.billing_divergence" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:140: NOTICE:  policy "tenant_isolation" for relation "ch.billing_invoice_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:34: NOTICE:  policy "tenant_isolation" for relation "ch.clinical_control_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:38: NOTICE:  policy "tenant_isolation" for relation "ch.inconsistency" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:31: NOTICE:  policy "tenant_isolation" for relation "ch.operational_record" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:144: NOTICE:  policy "tenant_isolation" for relation "ch.junta_case" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:146: NOTICE:  policy "tenant_isolation" for relation "ch.junta_board" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:148: NOTICE:  policy "tenant_isolation" for relation "ch.junta_board_member" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:150: NOTICE:  policy "tenant_isolation" for relation "ch.junta_decision" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:152: NOTICE:  policy "tenant_isolation" for relation "ch.junta_appeal" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:67: NOTICE:  policy "tenant_isolation" for relation "ch.periodic_toxicology_result" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:69: NOTICE:  policy "tenant_isolation" for relation "ch.toxicology_suspension" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:135: NOTICE:  policy "tenant_isolation" for relation "inf.collection_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:137: NOTICE:  policy "tenant_isolation" for relation "inf.payment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:139: NOTICE:  policy "tenant_isolation" for relation "inf.refund_order" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:141: NOTICE:  policy "tenant_isolation" for relation "inf.debt_handoff" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:34: NOTICE:  policy "tenant_isolation" for relation "inf.rait_reconciliation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:86: NOTICE:  policy "tenant_isolation" for relation "inf.notice" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:88: NOTICE:  policy "tenant_isolation" for relation "inf.notice_acknowledgement" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:90: NOTICE:  policy "tenant_isolation" for relation "inf.notice_delivery_attempt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:30: NOTICE:  policy "tenant_isolation" for relation "portal.complaint" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:94: NOTICE:  policy "tenant_isolation" for relation "portal.subject" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:96: NOTICE:  policy "tenant_isolation" for relation "portal.representation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:98: NOTICE:  policy "tenant_isolation" for relation "portal.act_level_policy" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:100: NOTICE:  policy "tenant_isolation" for relation "portal.entitlement" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:156: NOTICE:  policy "tenant_isolation" for relation "portal.request" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:158: NOTICE:  policy "tenant_isolation" for relation "portal.request_draft" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:160: NOTICE:  policy "tenant_isolation" for relation "portal.request_attachment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:162: NOTICE:  policy "tenant_isolation" for relation "portal.protocol" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:164: NOTICE:  policy "tenant_isolation" for relation "portal.consequence_ack" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:166: NOTICE:  policy "tenant_isolation" for relation "portal.evaluation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:168: NOTICE:  policy "tenant_isolation" for relation "portal.idempotency_record" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:99: NOTICE:  policy "tenant_isolation" for relation "portal.inbox_item" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:101: NOTICE:  policy "tenant_isolation" for relation "portal.acknowledgement_evidence" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:103: NOTICE:  policy "tenant_isolation" for relation "portal.sne_enrollment" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:105: NOTICE:  policy "tenant_isolation" for relation "portal.push_subscription" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:89: NOTICE:  policy "tenant_isolation" for relation "portal.manifestation" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:91: NOTICE:  policy "tenant_isolation" for relation "portal.manifestation_extension" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:93: NOTICE:  policy "tenant_isolation" for relation "portal.service_catalog" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:146: NOTICE:  policy "tenant_isolation" for relation "portal.infraction_view" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:148: NOTICE:  policy "tenant_isolation" for relation "portal.process_timeline" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:150: NOTICE:  policy "tenant_isolation" for relation "portal.points_view" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:152: NOTICE:  policy "tenant_isolation" for relation "portal.crash_view" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:154: NOTICE:  policy "tenant_isolation" for relation "portal.exam_view" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:156: NOTICE:  policy "tenant_isolation" for relation "portal.projection_applied_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:158: NOTICE:  policy "tenant_isolation" for relation "portal.national_read_cache" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:5: NOTICE:  schema "est" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:294: NOTICE:  policy "tenant_isolation" for relation "est.crash_record" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:296: NOTICE:  policy "tenant_isolation" for relation "est.crash_vehicle" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:298: NOTICE:  policy "tenant_isolation" for relation "est.crash_person" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:300: NOTICE:  policy "tenant_isolation" for relation "est.crash_victim" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:302: NOTICE:  policy "tenant_isolation" for relation "est.crash_scene_duty" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:304: NOTICE:  policy "tenant_isolation" for relation "est.crash_damage" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:306: NOTICE:  policy "tenant_isolation" for relation "est.crash_witness" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:308: NOTICE:  policy "tenant_isolation" for relation "est.crash_sketch" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:310: NOTICE:  policy "tenant_isolation" for relation "est.crash_link" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:312: NOTICE:  policy "tenant_isolation" for relation "est.crash_renaest_submission" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:314: NOTICE:  policy "tenant_isolation" for relation "est.crash_subject_request" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:316: NOTICE:  policy "tenant_isolation" for relation "est.crash_report_document" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:5: NOTICE:  schema "dashboard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:46: NOTICE:  policy "tenant_isolation" for relation "dashboard.crash_aggregate" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:48: NOTICE:  policy "tenant_isolation" for relation "dashboard.crash_projection_applied_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:5: NOTICE:  schema "integration" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:48: NOTICE:  policy "tenant_isolation" for relation "integration.renaest_mirror" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:50: NOTICE:  policy "tenant_isolation" for relation "integration.renaest_mirror_applied_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:202: NOTICE:  policy "tenant_isolation" for relation "jobs.boat_renaest_identity" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:203: NOTICE:  policy "tenant_isolation" for relation "jobs.boat_renaest_identity_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:204: NOTICE:  policy "tenant_isolation" for relation "jobs.boat_renaest_execution" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:5: NOTICE:  schema "dashboard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:671: NOTICE:  policy "tenant_isolation" for relation "dashboard.alert" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:673: NOTICE:  policy "tenant_isolation" for relation "dashboard.alert_trail" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:675: NOTICE:  policy "tenant_isolation" for relation "dashboard.duty" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:677: NOTICE:  policy "tenant_isolation" for relation "dashboard.duty_cycle" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:679: NOTICE:  policy "tenant_isolation" for relation "dashboard.indicator" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:681: NOTICE:  policy "tenant_isolation" for relation "dashboard.indicator_config" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:683: NOTICE:  policy "tenant_isolation" for relation "dashboard.bi_panel" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:685: NOTICE:  policy "tenant_isolation" for relation "dashboard.generated_report" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:687: NOTICE:  policy "tenant_isolation" for relation "dashboard.export_log" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:689: NOTICE:  policy "tenant_isolation" for relation "dashboard.source" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:691: NOTICE:  policy "tenant_isolation" for relation "dashboard.transparency_audit" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:693: NOTICE:  policy "tenant_isolation" for relation "dashboard.dataset" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:695: NOTICE:  policy "tenant_isolation" for relation "dashboard.monitor_projection_applied_event" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:697: NOTICE:  policy "tenant_isolation" for relation "dashboard.prescription_risk" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:699: NOTICE:  policy "tenant_isolation" for relation "dashboard.production" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:701: NOTICE:  policy "tenant_isolation" for relation "dashboard.integration_health" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:703: NOTICE:  policy "tenant_isolation" for relation "dashboard.pec_deadlines" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:705: NOTICE:  policy "tenant_isolation" for relation "dashboard.teat_measures" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:707: NOTICE:  policy "tenant_isolation" for relation "dashboard.portal_service_metrics" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:709: NOTICE:  policy "tenant_isolation" for relation "dashboard.duty_evidence" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:711: NOTICE:  policy "tenant_isolation" for relation "dashboard.timer" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:713: NOTICE:  policy "tenant_isolation" for relation "dashboard.access_log" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:1: NOTICE:  policy "tenant_isolation" for relation "tenancy.tenant_settings" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:2: NOTICE:  policy "tenant_isolation" for relation "auth.users" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:3: NOTICE:  policy "tenant_isolation" for relation "auth.roles" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:4: NOTICE:  policy "tenant_isolation" for relation "auth.memberships" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:5: NOTICE:  policy "tenant_isolation" for relation "auth.groups" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:6: NOTICE:  policy "tenant_isolation" for relation "auth.sessions" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:7: NOTICE:  policy "tenant_isolation" for relation "auth.sessions_default" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:8: NOTICE:  policy "tenant_isolation" for relation "auth.invitations" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:9: NOTICE:  policy "tenant_isolation" for relation "audit.events" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:10: NOTICE:  policy "tenant_isolation" for relation "audit.events_default" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:11: NOTICE:  policy "tenant_isolation" for relation "integration.outbox" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:12: NOTICE:  policy "tenant_isolation" for relation "integration.delivery_attempt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:13: NOTICE:  policy "tenant_isolation" for relation "integration.inbox_receipt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:14: NOTICE:  policy "tenant_isolation" for relation "integration.idempotency_keys" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:15: NOTICE:  policy "tenant_isolation" for relation "integration.rate_limit_windows" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:16: NOTICE:  policy "tenant_isolation" for relation "integration.professional_council_cache" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:17: NOTICE:  policy "tenant_isolation" for relation "storage.objects" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/20-rls-policies.sql:21: NOTICE:  policy "tenant_isolation" for relation "auth.tenants" does not exist, skipping
 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:23: NOTICE:  relation "device_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:24: NOTICE:  relation "ux_device_key_tenant_id_device_id_key_fingerprint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:25: NOTICE:  relation "ix_device_key_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:26: NOTICE:  relation "ix_device_key_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:27: NOTICE:  relation "ix_device_key_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:57: NOTICE:  relation "offline_authorization_grant" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:58: NOTICE:  relation "ix_offline_authorization_grant_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:59: NOTICE:  relation "ux_offline_authorization_grant_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:60: NOTICE:  relation "ix_offline_authorization_grant_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:61: NOTICE:  relation "ix_offline_authorization_grant_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:62: NOTICE:  relation "ix_offline_authorization_grant_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:63: NOTICE:  relation "ix_offline_authorization_grant_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:64: NOTICE:  relation "ix_offline_authorization_grant_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:89: NOTICE:  relation "provisioning_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:90: NOTICE:  relation "ux_provisioning_package_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:91: NOTICE:  relation "ix_provisioning_package_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:92: NOTICE:  relation "ux_provisioning_package_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:93: NOTICE:  relation "ix_provisioning_package_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:94: NOTICE:  relation "ix_provisioning_package_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:95: NOTICE:  relation "ix_provisioning_package_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:96: NOTICE:  relation "ix_provisioning_package_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:97: NOTICE:  relation "ix_provisioning_package_signature_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:114: NOTICE:  relation "provisioning_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  identifier "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_type" will be truncated to "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  relation "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:116: NOTICE:  relation "ux_provisioning_receipt_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:117: NOTICE:  relation "ix_provisioning_receipt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:118: NOTICE:  relation "ix_provisioning_receipt_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:119: NOTICE:  relation "ix_provisioning_receipt_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:120: NOTICE:  relation "ix_provisioning_receipt_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:135: NOTICE:  relation "device_revocation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:136: NOTICE:  relation "ux_device_revocation_tenant_id_device_id_revocation_epoch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:137: NOTICE:  relation "ix_device_revocation_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:138: NOTICE:  relation "ix_device_revocation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:139: NOTICE:  relation "ix_device_revocation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:140: NOTICE:  relation "ix_device_revocation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:154: NOTICE:  relation "provisioning_command_idempotency" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  identifier "ux_provisioning_command_idempotency_tenant_id_command_name_idempotency_key" will be truncated to "ux_provisioning_command_idempotency_tenant_id_command_name_idem"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  relation "ux_provisioning_command_idempotency_tenant_id_command_name_idem" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:156: NOTICE:  relation "ix_provisioning_command_idempotency_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:173: NOTICE:  relation "provisioning_reconciliation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  identifier "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliation_digest" will be truncated to "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  relation "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:175: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id_grant_id_reconciled_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:176: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:177: NOTICE:  relation "ix_provisioning_reconciliation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:178: NOTICE:  relation "ix_provisioning_reconciliation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:192: NOTICE:  relation "provisioning_grant_reservation_binding" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_reservation"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_reservation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  identifier "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_authorized_agent_id" will be truncated to "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:196: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:197: NOTICE:  relation "ix_provisioning_grant_reservation_binding_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:198: NOTICE:  relation "ix_provisioning_grant_reservation_binding_reservation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:199: NOTICE:  relation "ix_provisioning_grant_reservation_binding_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:200: NOTICE:  relation "ix_provisioning_grant_reservation_binding_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:201: NOTICE:  relation "ix_provisioning_grant_reservation_binding_authorized_agent_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:231: NOTICE:  trigger "rait_priority_case_guard" for relation "inf.rait_case" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:234: NOTICE:  trigger "rait_priority_mark_insert" for relation "inf.rait_case" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:237: NOTICE:  trigger "rait_priority_case_complete" for relation "inf.rait_case" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:240: NOTICE:  trigger "rait_priority_document_guard" for relation "inf.rait_document" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_immutable" for relation "inf.rait_priority_assessment" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_no_truncate" for relation "inf.rait_priority_assessment" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_complete" for relation "inf.rait_priority_assessment" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_immutable" for relation "inf.rait_priority_basis" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_no_truncate" for relation "inf.rait_priority_basis" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-rait-priority-enforce.sql:256: NOTICE:  trigger "rait_priority_complete" for relation "inf.rait_priority_basis" does not exist, skipping
apply.sh: done (full=1 db=detran_local_stack)
detran-stack: applying fresh-local-stack demonstration seed to detran_local_stack
seed/00-fixtures-core.sql
seed/05-parameters.sql
seed/10-fixtures-inf-ait.sql
seed/21-fixtures-rait-fresh.sql
seed/25-fixtures-teat.sql
seed/26-fixtures-teat-field.sql
seed/27-fixtures-teat-evidence.sql
seed/28-fixtures-teat-measures-alcohol.sql
seed/29-fixtures-ops-provisioning.sql
seed/30-fixtures-infraction.sql
seed/40-fixtures-rait-org-fresh-local-stack.sql
seed/50-fixtures-collection.sql
seed/60-fixtures-rait-integration-fresh-local-stack.sql
seed/70-fixtures-est-crash.sql
seed/70-fixtures-portal.sql
seed/71-fixtures-portal-events.sql
seed/72-fixtures-boat-projections.sql
seed/80-fixtures-dashboard-catalog.sql
seed/81-fixtures-dashboard-state.sql
seed.sh: done (profile=fresh-local-stack db=detran_local_stack)

===== db-reset exit=0 =====

===== start =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:start /Users/aarusso/.codex/worktrees/local-stack/detran
> bash tools/detran-stack.sh start

detran-stack: applying current DDL to existing database detran_local_stack
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 backend:db:apply /Users/aarusso/.codex/worktrees/local-stack/detran
> bash backend/database/apply.sh

 pg_advisory_xact_lock 
-----------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/00-extensions.sql:1: NOTICE:  extension "pgcrypto" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/00-extensions.sql:2: NOTICE:  extension "uuid-ossp" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/00-extensions.sql:3: NOTICE:  extension "citext" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/00-extensions.sql:4: NOTICE:  extension "postgis" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:1: NOTICE:  schema "auth" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:2: NOTICE:  schema "tenancy" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:3: NOTICE:  schema "audit" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:4: NOTICE:  schema "storage" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:5: NOTICE:  schema "integration" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:7: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:8: NOTICE:  schema "est" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:9: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/01-schemas.sql:10: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:17: NOTICE:  relation "tenants" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:19: NOTICE:  relation "uq_auth_tenants_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:20: NOTICE:  relation "uq_auth_tenants_cnpj" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:32: NOTICE:  relation "tenant_settings" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:48: NOTICE:  relation "users" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:60: NOTICE:  relation "roles" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:66: NOTICE:  relation "perms" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:77: NOTICE:  relation "memberships" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:83: NOTICE:  relation "role_perms" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:89: NOTICE:  relation "membership_roles" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:96: NOTICE:  relation "direct_perms" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:106: NOTICE:  relation "groups" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:112: NOTICE:  relation "group_memberships" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:118: NOTICE:  relation "group_roles" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:130: NOTICE:  relation "sessions" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:132: NOTICE:  relation "sessions_default" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/02-auth.sql:143: NOTICE:  relation "invitations" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/03-audit.sql:18: NOTICE:  relation "events" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/03-audit.sql:20: NOTICE:  relation "events_default" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/03-audit.sql:21: NOTICE:  relation "idx_audit_events_tenant_time" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/03-audit.sql:22: NOTICE:  relation "idx_audit_events_entity" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:20: NOTICE:  relation "outbox" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:23: NOTICE:  relation "ix_integration_outbox_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:40: NOTICE:  relation "delivery_attempt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:43: NOTICE:  relation "ix_integration_delivery_attempt_outbox" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:59: NOTICE:  relation "inbox_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:62: NOTICE:  relation "ix_integration_inbox_receipt_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:77: NOTICE:  relation "idempotency_keys" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:80: NOTICE:  relation "ix_integration_idempotency_expiry" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:89: NOTICE:  relation "rate_limit_windows" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:92: NOTICE:  relation "ix_integration_rate_limit_expiry" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:107: NOTICE:  relation "professional_council_cache" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:111: NOTICE:  relation "ix_integration_professional_council_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/04-integration-storage.sql:124: NOTICE:  relation "objects" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/05-role-catalog.sql:23: NOTICE:  relation "role_catalog" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:16: NOTICE:  relation "agency_unit" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:17: NOTICE:  relation "ux_ops_agency_unit_scope_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:18: NOTICE:  relation "ux_ops_agency_unit_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:19: NOTICE:  relation "ux_ops_agency_unit_external_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:20: NOTICE:  relation "ix_agency_unit_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:21: NOTICE:  relation "ix_agency_unit_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:32: NOTICE:  relation "agency_jurisdiction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:33: NOTICE:  relation "ux_ops_agency_jurisdiction_scope_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:34: NOTICE:  relation "ux_ops_agency_jurisdiction_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:35: NOTICE:  relation "ux_ops_agency_jurisdiction_external_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:36: NOTICE:  relation "ix_agency_jurisdiction_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:37: NOTICE:  relation "ix_agency_jurisdiction_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:50: NOTICE:  relation "agency_competence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:51: NOTICE:  relation "ux_ops_agency_competence_scope" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:52: NOTICE:  relation "ix_ops_agency_competence_jurisdiction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:53: NOTICE:  relation "ix_agency_competence_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:54: NOTICE:  relation "ix_agency_competence_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:55: NOTICE:  relation "ix_agency_competence_agency_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-agency.sql:56: NOTICE:  relation "ix_agency_competence_agency_jurisdiction_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:21: NOTICE:  relation "ops_agent_profile" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:22: NOTICE:  identifier "ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_number" will be truncated to "ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_n"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:22: NOTICE:  relation "ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_n" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:23: NOTICE:  relation "ix_ops_agent_profile_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:24: NOTICE:  relation "ix_ops_agent_profile_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:25: NOTICE:  relation "ix_ops_agent_profile_operational_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:45: NOTICE:  relation "ops_operational_device" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:46: NOTICE:  relation "ux_ops_operational_device_tenant_id_hardware_identifier_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:47: NOTICE:  relation "gist_ops_device_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:48: NOTICE:  relation "ix_ops_operational_device_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:49: NOTICE:  relation "ix_ops_operational_device_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:72: NOTICE:  relation "ops_homologation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:73: NOTICE:  identifier "ux_ops_homologation_tenant_id_traffic_agency_id_homologation_number" will be truncated to "ux_ops_homologation_tenant_id_traffic_agency_id_homologation_nu"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:73: NOTICE:  relation "ux_ops_homologation_tenant_id_traffic_agency_id_homologation_nu" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:74: NOTICE:  relation "ix_ops_homologation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:75: NOTICE:  relation "ix_ops_homologation_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:92: NOTICE:  relation "ops_application_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:93: NOTICE:  relation "ux_ops_application_version_tenant_id_app_type_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:94: NOTICE:  relation "ix_ops_application_version_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:95: NOTICE:  relation "ix_ops_application_version_homologation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:112: NOTICE:  relation "ops_device_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:113: NOTICE:  relation "ix_ops_device_event_tenant_id_device_id_event_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:114: NOTICE:  relation "ix_ops_device_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:115: NOTICE:  relation "ix_ops_device_event_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:116: NOTICE:  relation "ix_ops_device_event_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:132: NOTICE:  relation "ops_operation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:133: NOTICE:  relation "ix_ops_operation_tenant_id_traffic_agency_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:134: NOTICE:  relation "ix_ops_operation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:135: NOTICE:  relation "ix_ops_operation_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:149: NOTICE:  relation "ops_team" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:150: NOTICE:  relation "ux_ops_team_tenant_id_traffic_agency_id_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:151: NOTICE:  relation "ix_ops_team_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:152: NOTICE:  relation "ix_ops_team_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:153: NOTICE:  relation "ix_ops_team_operational_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:154: NOTICE:  relation "ix_ops_team_supervisor_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:169: NOTICE:  relation "ops_team_agent" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:170: NOTICE:  relation "ux_ops_team_agent_tenant_id_team_id_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:171: NOTICE:  relation "ix_ops_team_agent_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:172: NOTICE:  relation "ix_ops_team_agent_team_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:173: NOTICE:  relation "ix_ops_team_agent_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:186: NOTICE:  relation "ops_patrol_vehicle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:187: NOTICE:  relation "ux_ops_patrol_vehicle_tenant_id_traffic_agency_id_prefix" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:188: NOTICE:  relation "ix_ops_patrol_vehicle_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:189: NOTICE:  relation "ix_ops_patrol_vehicle_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:208: NOTICE:  relation "ops_measurement_instrument" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:209: NOTICE:  identifier "ux_ops_measurement_instrument_tenant_id_instrument_type_serial_number" will be truncated to "ux_ops_measurement_instrument_tenant_id_instrument_type_serial_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:209: NOTICE:  relation "ux_ops_measurement_instrument_tenant_id_instrument_type_serial_" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:210: NOTICE:  identifier "ix_ops_measurement_instrument_tenant_id_traffic_agency_id_status" will be truncated to "ix_ops_measurement_instrument_tenant_id_traffic_agency_id_statu"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:210: NOTICE:  relation "ix_ops_measurement_instrument_tenant_id_traffic_agency_id_statu" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:211: NOTICE:  relation "ix_ops_measurement_instrument_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:212: NOTICE:  relation "ix_ops_measurement_instrument_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:240: NOTICE:  relation "ops_shift" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:241: NOTICE:  relation "ix_ops_shift_tenant_id_agent_id_started_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:242: NOTICE:  relation "ix_ops_shift_tenant_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:243: NOTICE:  relation "ix_ops_shift_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:244: NOTICE:  relation "ix_ops_shift_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:245: NOTICE:  relation "ix_ops_shift_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:246: NOTICE:  relation "ix_ops_shift_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:247: NOTICE:  relation "ix_ops_shift_operational_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:248: NOTICE:  relation "ix_ops_shift_team_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:249: NOTICE:  relation "ix_ops_shift_patrol_vehicle_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:250: NOTICE:  relation "ix_ops_shift_operation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:271: NOTICE:  relation "ops_approach" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:272: NOTICE:  relation "ix_ops_approach_tenant_id_shift_id_approached_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:273: NOTICE:  relation "ix_ops_approach_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:274: NOTICE:  relation "ix_ops_approach_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:275: NOTICE:  relation "ix_ops_approach_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:276: NOTICE:  relation "ix_ops_approach_operation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:277: NOTICE:  relation "ix_ops_approach_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:293: NOTICE:  relation "ops_session_handoff" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:294: NOTICE:  relation "ix_ops_session_handoff_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:295: NOTICE:  relation "ix_ops_session_handoff_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:296: NOTICE:  relation "ix_ops_session_handoff_from_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/13-ops-field-operations.sql:297: NOTICE:  relation "ix_ops_session_handoff_to_agent_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:10: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:19: NOTICE:  relation "ait_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:54: NOTICE:  relation "infraction_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:84: NOTICE:  relation "infraction_substate_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:109: NOTICE:  relation "infraction_closure_motive_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:128: NOTICE:  relation "infraction_subject_kind_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:143: NOTICE:  relation "infraction_payment_tier_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:157: NOTICE:  relation "notification_channel_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:181: NOTICE:  relation "infraction_timer_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:226: NOTICE:  relation "infraction_event_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/14-inf-lifecycle-vocabulary.sql:261: NOTICE:  relation "infraction_transition_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:34: NOTICE:  relation "parameter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:35: NOTICE:  relation "ux_parameter_tenant_agency_surface_key_effective_from" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:36: NOTICE:  relation "ix_parameter_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/15-ops-parameter.sql:37: NOTICE:  relation "ix_parameter_traffic_agency_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:20: NOTICE:  relation "snapshots_person" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:21: NOTICE:  relation "ix_snapshots_person_tenant_id_cpf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:22: NOTICE:  relation "ix_snapshots_person_tenant_id_cnpj" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:23: NOTICE:  relation "ix_snapshots_person_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:40: NOTICE:  relation "snapshots_person_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:41: NOTICE:  identifier "ix_snapshots_person_document_tenant_id_document_type_document_number" will be truncated to "ix_snapshots_person_document_tenant_id_document_type_document_n"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:41: NOTICE:  relation "ix_snapshots_person_document_tenant_id_document_type_document_n" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:42: NOTICE:  relation "ix_snapshots_person_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:43: NOTICE:  relation "ix_snapshots_person_document_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:61: NOTICE:  relation "snapshots_vehicle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:62: NOTICE:  relation "ix_snapshots_vehicle_tenant_id_plate" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:63: NOTICE:  relation "ix_snapshots_vehicle_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:84: NOTICE:  relation "snapshots_external_query" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:85: NOTICE:  relation "ix_snapshots_external_query_tenant_id_purpose_queried_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:86: NOTICE:  relation "ix_snapshots_external_query_tenant_id_parameters_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:87: NOTICE:  relation "ix_snapshots_external_query_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:88: NOTICE:  relation "ix_snapshots_external_query_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:89: NOTICE:  relation "ix_snapshots_external_query_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:90: NOTICE:  relation "ix_snapshots_external_query_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:91: NOTICE:  relation "ix_snapshots_external_query_external_system_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:112: NOTICE:  relation "snapshots_vehicle_snapshot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:113: NOTICE:  relation "ix_snapshots_vehicle_snapshot_tenant_id_plate_snapshot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:114: NOTICE:  relation "ix_snapshots_vehicle_snapshot_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:115: NOTICE:  relation "ix_snapshots_vehicle_snapshot_vehicle_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/16-ops-snapshots.sql:116: NOTICE:  relation "ix_snapshots_vehicle_snapshot_external_query_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:30: NOTICE:  relation "evidence_evidence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:31: NOTICE:  relation "ux_evidence_evidence_tenant_id_hash_value" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:32: NOTICE:  relation "ix_evidence_evidence_tenant_id_captured_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:33: NOTICE:  relation "gist_ops_evidence_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:34: NOTICE:  relation "ix_evidence_evidence_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:35: NOTICE:  relation "ix_evidence_evidence_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:36: NOTICE:  relation "ix_evidence_evidence_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:37: NOTICE:  relation "ix_evidence_evidence_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:51: NOTICE:  relation "evidence_link" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:52: NOTICE:  relation "ix_evidence_link_tenant_id_entity_type_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:53: NOTICE:  relation "ix_evidence_link_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:54: NOTICE:  relation "ix_evidence_link_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:55: NOTICE:  relation "ix_evidence_link_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:70: NOTICE:  relation "evidence_custody_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:71: NOTICE:  relation "ix_evidence_custody_event_tenant_id_evidence_id_event_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:72: NOTICE:  relation "ix_evidence_custody_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:73: NOTICE:  relation "ix_evidence_custody_event_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:89: NOTICE:  relation "evidence_probative_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:90: NOTICE:  relation "ix_evidence_probative_package_tenant_id_entity_type_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:91: NOTICE:  relation "ix_evidence_probative_package_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:92: NOTICE:  relation "ix_evidence_probative_package_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:93: NOTICE:  relation "ix_evidence_probative_package_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:110: NOTICE:  relation "evidence_probative_package_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:111: NOTICE:  identifier "ux_evidence_probative_package_item_tenant_id_package_id_sequence" will be truncated to "ux_evidence_probative_package_item_tenant_id_package_id_sequenc"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:111: NOTICE:  relation "ux_evidence_probative_package_item_tenant_id_package_id_sequenc" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:112: NOTICE:  relation "ix_evidence_probative_package_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:113: NOTICE:  relation "ix_evidence_probative_package_item_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:114: NOTICE:  relation "ix_evidence_probative_package_item_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:115: NOTICE:  relation "ix_evidence_probative_package_item_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:137: NOTICE:  relation "evidence_access_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:138: NOTICE:  relation "ix_evidence_access_request_tenant_id_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:139: NOTICE:  relation "ix_evidence_access_request_tenant_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:140: NOTICE:  relation "ix_evidence_access_request_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:141: NOTICE:  relation "ix_evidence_access_request_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:157: NOTICE:  relation "storage_intent" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:158: NOTICE:  relation "ux_storage_intent_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:159: NOTICE:  relation "ux_storage_intent_tenant_id_local_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:160: NOTICE:  relation "ix_storage_intent_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:161: NOTICE:  relation "ix_storage_intent_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/17-ops-evidence.sql:162: NOTICE:  relation "ix_storage_intent_local_evidence_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:21: NOTICE:  relation "ait_numbering_range" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:22: NOTICE:  relation "ux_ait_numbering_range_tenant_id_traffic_agency_id_series" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:23: NOTICE:  relation "ix_ait_numbering_range_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:24: NOTICE:  relation "ix_ait_numbering_range_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:45: NOTICE:  relation "numbering_reservation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:46: NOTICE:  relation "ix_numbering_reservation_tenant_id_agent_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:47: NOTICE:  relation "ux_numbering_reservation_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:48: NOTICE:  relation "ix_numbering_reservation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:49: NOTICE:  relation "ix_numbering_reservation_range_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:50: NOTICE:  relation "ix_numbering_reservation_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:51: NOTICE:  relation "ix_numbering_reservation_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:52: NOTICE:  relation "ix_numbering_reservation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:53: NOTICE:  relation "ix_numbering_reservation_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:73: NOTICE:  relation "numbering_consumption" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:74: NOTICE:  relation "ux_numbering_consumption_tenant_id_range_id_number" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:75: NOTICE:  relation "ux_numbering_consumption_tenant_id_local_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:76: NOTICE:  relation "ux_numbering_consumption_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:77: NOTICE:  relation "ix_numbering_consumption_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:78: NOTICE:  relation "ix_numbering_consumption_reservation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:79: NOTICE:  relation "ix_numbering_consumption_range_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:80: NOTICE:  relation "ix_numbering_consumption_local_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:81: NOTICE:  relation "ix_numbering_consumption_server_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:99: NOTICE:  relation "sync_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:100: NOTICE:  relation "ux_sync_batch_tenant_id_device_id_device_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:101: NOTICE:  relation "ux_sync_batch_tenant_id_device_id_batch_sequence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:102: NOTICE:  relation "ix_sync_batch_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:103: NOTICE:  relation "ix_sync_batch_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:104: NOTICE:  relation "ix_sync_batch_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:105: NOTICE:  relation "ix_sync_batch_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:106: NOTICE:  relation "ix_sync_batch_device_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:130: NOTICE:  relation "sync_queue_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:131: NOTICE:  relation "ix_sync_queue_item_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:132: NOTICE:  relation "ux_sync_queue_item_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:133: NOTICE:  relation "ix_sync_queue_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:134: NOTICE:  relation "ix_sync_queue_item_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:135: NOTICE:  relation "ix_sync_queue_item_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:136: NOTICE:  relation "ix_sync_queue_item_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:137: NOTICE:  relation "ix_sync_queue_item_local_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:138: NOTICE:  relation "ix_sync_queue_item_server_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:157: NOTICE:  relation "sync_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:158: NOTICE:  relation "ux_sync_receipt_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:159: NOTICE:  relation "ux_sync_receipt_tenant_id_sync_queue_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:160: NOTICE:  relation "ix_sync_receipt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:161: NOTICE:  relation "ix_sync_receipt_sync_queue_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:162: NOTICE:  relation "ix_sync_receipt_local_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:163: NOTICE:  relation "ix_sync_receipt_server_entity_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:187: NOTICE:  relation "sync_conflict" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:188: NOTICE:  relation "ix_sync_conflict_tenant_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:189: NOTICE:  relation "ix_sync_conflict_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:190: NOTICE:  relation "ix_sync_conflict_sync_queue_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/18-ops-offline-sync.sql:191: NOTICE:  relation "ix_sync_conflict_correlation_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:10: NOTICE:  schema "dashboard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:19: NOTICE:  relation "alert_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:50: NOTICE:  relation "alert_transition_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:82: NOTICE:  relation "duty_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:109: NOTICE:  relation "duty_transition_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:137: NOTICE:  relation "freshness_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:156: NOTICE:  relation "severity_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:175: NOTICE:  relation "layer_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:194: NOTICE:  relation "classification_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:214: NOTICE:  relation "block_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:240: NOTICE:  relation "timer_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql:288: NOTICE:  relation "escalation_chain_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:5: NOTICE:  schema "est" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:14: NOTICE:  relation "crash_state_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:44: NOTICE:  relation "crash_severity_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:61: NOTICE:  relation "scene_duty_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:79: NOTICE:  relation "crash_condition_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:97: NOTICE:  relation "damage_asset_kind_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-est-lifecycle-vocabulary.sql:115: NOTICE:  relation "crash_timer_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-portal-platform.sql:6: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-portal-platform.sql:17: NOTICE:  relation "public_hostname" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-portal-platform.sql:19: NOTICE:  relation "ix_portal_public_hostname_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-portal-platform.sql:36: NOTICE:  relation "brand_profile" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/19-portal-platform.sql:42: NOTICE:  relation "protocol_seq" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:23: NOTICE:  relation "device_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:24: NOTICE:  relation "ux_device_key_tenant_id_device_id_key_fingerprint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:25: NOTICE:  relation "ix_device_key_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:26: NOTICE:  relation "ix_device_key_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:27: NOTICE:  relation "ix_device_key_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:57: NOTICE:  relation "offline_authorization_grant" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:58: NOTICE:  relation "ix_offline_authorization_grant_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:59: NOTICE:  relation "ux_offline_authorization_grant_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:60: NOTICE:  relation "ix_offline_authorization_grant_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:61: NOTICE:  relation "ix_offline_authorization_grant_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:62: NOTICE:  relation "ix_offline_authorization_grant_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:63: NOTICE:  relation "ix_offline_authorization_grant_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:64: NOTICE:  relation "ix_offline_authorization_grant_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:89: NOTICE:  relation "provisioning_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:90: NOTICE:  relation "ux_provisioning_package_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:91: NOTICE:  relation "ix_provisioning_package_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:92: NOTICE:  relation "ux_provisioning_package_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:93: NOTICE:  relation "ix_provisioning_package_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:94: NOTICE:  relation "ix_provisioning_package_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:95: NOTICE:  relation "ix_provisioning_package_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:96: NOTICE:  relation "ix_provisioning_package_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:97: NOTICE:  relation "ix_provisioning_package_signature_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:114: NOTICE:  relation "provisioning_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  identifier "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_type" will be truncated to "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  relation "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:116: NOTICE:  relation "ux_provisioning_receipt_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:117: NOTICE:  relation "ix_provisioning_receipt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:118: NOTICE:  relation "ix_provisioning_receipt_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:119: NOTICE:  relation "ix_provisioning_receipt_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:120: NOTICE:  relation "ix_provisioning_receipt_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:135: NOTICE:  relation "device_revocation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:136: NOTICE:  relation "ux_device_revocation_tenant_id_device_id_revocation_epoch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:137: NOTICE:  relation "ix_device_revocation_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:138: NOTICE:  relation "ix_device_revocation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:139: NOTICE:  relation "ix_device_revocation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:140: NOTICE:  relation "ix_device_revocation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:154: NOTICE:  relation "provisioning_command_idempotency" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  identifier "ux_provisioning_command_idempotency_tenant_id_command_name_idempotency_key" will be truncated to "ux_provisioning_command_idempotency_tenant_id_command_name_idem"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  relation "ux_provisioning_command_idempotency_tenant_id_command_name_idem" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:156: NOTICE:  relation "ix_provisioning_command_idempotency_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:173: NOTICE:  relation "provisioning_reconciliation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  identifier "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliation_digest" will be truncated to "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  relation "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:175: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id_grant_id_reconciled_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:176: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:177: NOTICE:  relation "ix_provisioning_reconciliation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:178: NOTICE:  relation "ix_provisioning_reconciliation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:192: NOTICE:  relation "provisioning_grant_reservation_binding" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_reservation"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_reservation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  identifier "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_authorized_agent_id" will be truncated to "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:196: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:197: NOTICE:  relation "ix_provisioning_grant_reservation_binding_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:198: NOTICE:  relation "ix_provisioning_grant_reservation_binding_reservation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:199: NOTICE:  relation "ix_provisioning_grant_reservation_binding_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:200: NOTICE:  relation "ix_provisioning_grant_reservation_binding_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:201: NOTICE:  relation "ix_provisioning_grant_reservation_binding_authorized_agent_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:22: NOTICE:  relation "normative_catalog" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:23: NOTICE:  relation "ux_inf_normative_catalog_name_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:24: NOTICE:  relation "ix_normative_catalog_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:25: NOTICE:  relation "ix_normative_catalog_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:50: NOTICE:  relation "normative_framing" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:51: NOTICE:  relation "ux_inf_normative_framing_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:52: NOTICE:  relation "ix_normative_framing_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:53: NOTICE:  relation "ix_normative_framing_catalog_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:69: NOTICE:  relation "normative_metrological_table" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:70: NOTICE:  relation "ux_inf_normative_metrological_table" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:71: NOTICE:  relation "ix_normative_metrological_table_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:72: NOTICE:  relation "ix_normative_metrological_table_catalog_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:91: NOTICE:  relation "normative_validation_rule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:92: NOTICE:  relation "ux_inf_normative_rule_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:93: NOTICE:  relation "ix_normative_validation_rule_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:94: NOTICE:  relation "ix_normative_validation_rule_catalog_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:95: NOTICE:  relation "ix_normative_validation_rule_framing_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:110: NOTICE:  relation "normative_agency_parameter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:111: NOTICE:  relation "ux_inf_normative_agency_parameter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:112: NOTICE:  relation "ix_normative_agency_parameter_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:113: NOTICE:  relation "ix_normative_agency_parameter_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:129: NOTICE:  relation "normative_document_template" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:130: NOTICE:  relation "ux_inf_normative_document_template" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:131: NOTICE:  relation "ix_normative_document_template_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:132: NOTICE:  relation "ix_normative_document_template_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:148: NOTICE:  relation "signature_policy" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:149: NOTICE:  relation "ux_inf_signature_policy_document_kind" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:150: NOTICE:  relation "ix_signature_policy_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:151: NOTICE:  relation "ix_signature_policy_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:168: NOTICE:  relation "normative_mobile_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:169: NOTICE:  relation "ux_inf_normative_mobile_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:170: NOTICE:  relation "ix_normative_mobile_package_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:171: NOTICE:  relation "ix_normative_mobile_package_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-inf-normative.sql:172: NOTICE:  relation "ix_normative_mobile_package_catalog_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-ops-example.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-ops-example.sql:14: NOTICE:  relation "example_record" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/30-ops-example.sql:15: NOTICE:  relation "ix_example_record_tenant_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:51: NOTICE:  relation "ait_ait" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:52: NOTICE:  relation "ux_inf_ait_number" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:53: NOTICE:  relation "ux_inf_ait_receipt_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:54: NOTICE:  relation "ix_inf_ait_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:55: NOTICE:  relation "gist_inf_ait_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:56: NOTICE:  relation "ix_ait_ait_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:57: NOTICE:  relation "ix_ait_ait_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:58: NOTICE:  relation "ix_ait_ait_executing_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:59: NOTICE:  relation "ix_ait_ait_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:60: NOTICE:  relation "ix_ait_ait_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:61: NOTICE:  relation "ix_ait_ait_operation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:62: NOTICE:  relation "ix_ait_ait_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:63: NOTICE:  relation "ix_ait_ait_framing_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:64: NOTICE:  relation "ix_ait_ait_catalog_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:65: NOTICE:  relation "ix_ait_ait_speed_measurement_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:88: NOTICE:  relation "ait_cancel_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:89: NOTICE:  relation "ix_inf_ait_cancel_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:90: NOTICE:  relation "ux_inf_ait_cancel_request_idempotency" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:91: NOTICE:  relation "ix_inf_ait_cancel_request_target" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:92: NOTICE:  relation "ix_ait_cancel_request_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:93: NOTICE:  relation "ix_ait_cancel_request_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:94: NOTICE:  relation "ix_ait_cancel_request_target_local_act_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:109: NOTICE:  relation "ait_cancel_request_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:110: NOTICE:  relation "ix_inf_ait_cancel_request_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:111: NOTICE:  relation "ix_ait_cancel_request_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:112: NOTICE:  relation "ix_ait_cancel_request_event_cancel_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:127: NOTICE:  relation "ait_vehicle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:128: NOTICE:  relation "ix_inf_ait_vehicle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:129: NOTICE:  relation "ix_ait_vehicle_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:130: NOTICE:  relation "ix_ait_vehicle_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:131: NOTICE:  relation "ix_ait_vehicle_vehicle_snapshot_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:150: NOTICE:  relation "ait_person" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:151: NOTICE:  relation "ix_inf_ait_person" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:152: NOTICE:  relation "ix_ait_person_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:153: NOTICE:  relation "ix_ait_person_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:154: NOTICE:  relation "ix_ait_person_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:155: NOTICE:  relation "ix_ait_person_external_query_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:171: NOTICE:  relation "ait_status_history" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:172: NOTICE:  relation "ix_inf_ait_history" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:173: NOTICE:  relation "ix_ait_status_history_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:174: NOTICE:  relation "ix_ait_status_history_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:192: NOTICE:  relation "ait_correction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:193: NOTICE:  relation "ix_inf_ait_correction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:194: NOTICE:  relation "ix_ait_correction_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:195: NOTICE:  relation "ix_ait_correction_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:214: NOTICE:  relation "ait_signature" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:215: NOTICE:  relation "gist_inf_ait_signature_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:216: NOTICE:  relation "ix_ait_signature_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:217: NOTICE:  relation "ix_ait_signature_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:218: NOTICE:  relation "ix_ait_signature_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:219: NOTICE:  relation "ix_ait_signature_signature_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:235: NOTICE:  relation "ait_print_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:236: NOTICE:  relation "ix_ait_print_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:237: NOTICE:  relation "ix_ait_print_event_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/31-inf-ait.sql:238: NOTICE:  relation "ix_ait_print_event_device_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:17: NOTICE:  relation "measure_type" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:18: NOTICE:  relation "ux_inf_measure_type_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:19: NOTICE:  relation "ix_measure_type_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:46: NOTICE:  relation "administrative_measure" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:47: NOTICE:  relation "ix_inf_measure_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:48: NOTICE:  relation "gist_inf_measure_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:49: NOTICE:  relation "ix_administrative_measure_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:50: NOTICE:  relation "ix_administrative_measure_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:51: NOTICE:  relation "ix_administrative_measure_measure_type_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:52: NOTICE:  relation "ix_administrative_measure_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:53: NOTICE:  relation "ix_administrative_measure_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:54: NOTICE:  relation "ix_administrative_measure_approach_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:55: NOTICE:  relation "ix_administrative_measure_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:56: NOTICE:  relation "ix_administrative_measure_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:57: NOTICE:  relation "ix_administrative_measure_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:83: NOTICE:  relation "administrative_term" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:84: NOTICE:  relation "ux_inf_administrative_term_number" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:85: NOTICE:  relation "ix_administrative_term_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:86: NOTICE:  relation "ix_administrative_term_measure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:87: NOTICE:  relation "ix_administrative_term_file_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:88: NOTICE:  relation "ix_administrative_term_signed_by_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:89: NOTICE:  relation "ix_administrative_term_source_local_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:108: NOTICE:  relation "measure_retention" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:109: NOTICE:  relation "ix_measure_retention_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:110: NOTICE:  relation "ix_measure_retention_measure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:111: NOTICE:  relation "ix_measure_retention_vehicle_snapshot_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:132: NOTICE:  relation "measure_removal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:133: NOTICE:  relation "ix_measure_removal_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:134: NOTICE:  relation "ix_measure_removal_measure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:135: NOTICE:  relation "ix_measure_removal_vehicle_snapshot_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:136: NOTICE:  relation "ix_measure_removal_tow_provider_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:137: NOTICE:  relation "ix_measure_removal_yard_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:153: NOTICE:  relation "vehicle_inventory" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:154: NOTICE:  relation "ix_vehicle_inventory_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:155: NOTICE:  relation "ix_vehicle_inventory_measure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:156: NOTICE:  relation "ix_vehicle_inventory_vehicle_snapshot_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:157: NOTICE:  relation "ix_vehicle_inventory_signed_by_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:170: NOTICE:  relation "tow_provider" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:171: NOTICE:  relation "ix_tow_provider_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:172: NOTICE:  relation "ix_tow_provider_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:186: NOTICE:  relation "yard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:187: NOTICE:  relation "gist_inf_yard_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:188: NOTICE:  relation "ix_yard_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:189: NOTICE:  relation "ix_yard_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:204: NOTICE:  relation "measure_status_history" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:205: NOTICE:  relation "ix_measure_status_history_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/32-inf-measures.sql:206: NOTICE:  relation "ix_measure_status_history_measure_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:44: NOTICE:  relation "alcohol_procedure" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:45: NOTICE:  relation "ix_inf_alcohol_procedure_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:46: NOTICE:  relation "gist_inf_alcohol_location" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:47: NOTICE:  relation "ix_alcohol_procedure_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:48: NOTICE:  relation "ix_alcohol_procedure_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:49: NOTICE:  relation "ix_alcohol_procedure_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:50: NOTICE:  relation "ix_alcohol_procedure_measure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:51: NOTICE:  relation "ix_alcohol_procedure_approach_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:52: NOTICE:  relation "ix_alcohol_procedure_agent_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:53: NOTICE:  relation "ix_alcohol_procedure_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:54: NOTICE:  relation "ix_alcohol_procedure_driver_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:55: NOTICE:  relation "ix_alcohol_procedure_ait_local_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:56: NOTICE:  relation "ix_alcohol_procedure_sign_catalog_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:57: NOTICE:  relation "ix_alcohol_procedure_source_local_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:72: NOTICE:  relation "alcohol_breathalyzer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:73: NOTICE:  relation "ux_inf_breathalyzer_serial" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:74: NOTICE:  relation "ix_alcohol_breathalyzer_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:75: NOTICE:  relation "ix_alcohol_breathalyzer_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:97: NOTICE:  relation "alcohol_test" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:98: NOTICE:  relation "ix_alcohol_test_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:99: NOTICE:  relation "ix_alcohol_test_procedure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:100: NOTICE:  relation "ix_alcohol_test_breathalyzer_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:101: NOTICE:  relation "ix_alcohol_test_result_image_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:119: NOTICE:  relation "alcohol_refusal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:120: NOTICE:  relation "ix_alcohol_refusal_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:121: NOTICE:  relation "ix_alcohol_refusal_procedure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:122: NOTICE:  relation "ix_alcohol_refusal_witness_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:123: NOTICE:  relation "ix_alcohol_refusal_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:139: NOTICE:  relation "alcohol_psychomotor_sign" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:140: NOTICE:  relation "ix_alcohol_psychomotor_sign_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:141: NOTICE:  relation "ix_alcohol_psychomotor_sign_procedure_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:156: NOTICE:  relation "alcohol_forwarding" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:157: NOTICE:  relation "ix_alcohol_forwarding_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/33-inf-alcohol.sql:158: NOTICE:  relation "ix_alcohol_forwarding_procedure_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:52: NOTICE:  relation "rait_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:53: NOTICE:  relation "ux_inf_rait_case_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:54: NOTICE:  relation "ix_inf_rait_case_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:55: NOTICE:  relation "ix_inf_rait_case_movement" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:56: NOTICE:  relation "ix_inf_rait_case_cetran_received" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:57: NOTICE:  relation "ix_inf_rait_case_agency_jurisdiction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:58: NOTICE:  relation "ux_inf_rait_case_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:59: NOTICE:  relation "ix_rait_case_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:60: NOTICE:  relation "ix_rait_case_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:61: NOTICE:  relation "ix_rait_case_origin_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:62: NOTICE:  relation "ix_rait_case_withdrawal_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:63: NOTICE:  relation "ix_rait_case_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:64: NOTICE:  relation "ix_rait_case_agency_jurisdiction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:85: NOTICE:  relation "rait_party" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:86: NOTICE:  relation "ix_inf_rait_party_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:87: NOTICE:  relation "ix_rait_party_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:88: NOTICE:  relation "ix_rait_party_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:89: NOTICE:  relation "ix_rait_party_representation_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:108: NOTICE:  relation "rait_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:109: NOTICE:  relation "ix_inf_rait_document_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:110: NOTICE:  relation "ux_inf_rait_document_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:111: NOTICE:  relation "ix_rait_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:112: NOTICE:  relation "ix_rait_document_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:137: NOTICE:  relation "rait_priority_assessment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:138: NOTICE:  relation "ux_inf_rait_priority_assessment_revision" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:139: NOTICE:  relation "ux_inf_rait_priority_assessment_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:140: NOTICE:  relation "ix_rait_priority_assessment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:141: NOTICE:  relation "ix_rait_priority_assessment_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:142: NOTICE:  relation "ix_rait_priority_assessment_policy_parameter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:168: NOTICE:  relation "rait_priority_basis" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:169: NOTICE:  relation "ux_inf_rait_priority_basis_evidence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:170: NOTICE:  relation "ix_rait_priority_basis_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:171: NOTICE:  relation "ix_rait_priority_basis_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:172: NOTICE:  relation "ix_rait_priority_basis_assessment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:173: NOTICE:  relation "ix_rait_priority_basis_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:191: NOTICE:  relation "rait_pending_content" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:192: NOTICE:  relation "ux_inf_rait_pending_content_open" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:193: NOTICE:  relation "ix_inf_rait_pending_content_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:194: NOTICE:  relation "ix_rait_pending_content_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:195: NOTICE:  relation "ix_rait_pending_content_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:219: NOTICE:  relation "rait_redirect" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:220: NOTICE:  relation "ux_inf_rait_redirect_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:221: NOTICE:  relation "ix_inf_rait_redirect_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:222: NOTICE:  relation "ix_rait_redirect_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:223: NOTICE:  relation "ix_rait_redirect_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:224: NOTICE:  relation "ix_rait_redirect_receipt_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:240: NOTICE:  relation "rait_admissibility" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:241: NOTICE:  relation "ux_inf_rait_admissibility_criterion" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:242: NOTICE:  relation "ix_rait_admissibility_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:243: NOTICE:  relation "ix_rait_admissibility_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:266: NOTICE:  relation "rait_deadline" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:267: NOTICE:  relation "ux_inf_rait_deadline_case_timer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:268: NOTICE:  relation "ix_inf_rait_deadline_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:269: NOTICE:  relation "ix_rait_deadline_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:270: NOTICE:  relation "ix_rait_deadline_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:271: NOTICE:  relation "ix_rait_deadline_suspended_by_act_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:293: NOTICE:  relation "rait_inquiry" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:294: NOTICE:  relation "ix_inf_rait_inquiry_open" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:295: NOTICE:  relation "ix_rait_inquiry_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:296: NOTICE:  relation "ix_rait_inquiry_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:310: NOTICE:  relation "rait_inquiry_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:311: NOTICE:  relation "ux_inf_rait_inquiry_document_once" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:312: NOTICE:  relation "ix_rait_inquiry_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:313: NOTICE:  relation "ix_rait_inquiry_document_inquiry_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:314: NOTICE:  relation "ix_rait_inquiry_document_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:328: NOTICE:  relation "rait_pending_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:329: NOTICE:  relation "ux_inf_rait_pending_document_once" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:330: NOTICE:  relation "ix_rait_pending_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:331: NOTICE:  relation "ix_rait_pending_document_pending_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:332: NOTICE:  relation "ix_rait_pending_document_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:352: NOTICE:  relation "rait_withdrawal_attestation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:353: NOTICE:  relation "ux_inf_rait_withdrawal_attestation_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:354: NOTICE:  relation "ix_rait_withdrawal_attestation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:355: NOTICE:  relation "ix_rait_withdrawal_attestation_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:356: NOTICE:  relation "ix_rait_withdrawal_attestation_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:357: NOTICE:  relation "ix_rait_withdrawal_attestation_signer_party_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:381: NOTICE:  relation "rait_draft" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:382: NOTICE:  relation "ux_inf_rait_draft_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:383: NOTICE:  relation "ix_inf_rait_draft_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:384: NOTICE:  relation "ix_rait_draft_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:385: NOTICE:  relation "ix_rait_draft_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:386: NOTICE:  relation "ix_rait_draft_author_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:387: NOTICE:  relation "ix_rait_draft_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:411: NOTICE:  relation "rait_decision" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:412: NOTICE:  relation "ux_inf_rait_decision_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:413: NOTICE:  relation "ix_rait_decision_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:414: NOTICE:  relation "ix_rait_decision_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:415: NOTICE:  relation "ix_rait_decision_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:435: NOTICE:  relation "rait_communication" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:436: NOTICE:  relation "ix_inf_rait_communication_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:437: NOTICE:  relation "ix_rait_communication_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:438: NOTICE:  relation "ix_rait_communication_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:439: NOTICE:  relation "ix_rait_communication_decision_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:455: NOTICE:  relation "rait_case_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:456: NOTICE:  relation "ix_inf_rait_case_event_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:457: NOTICE:  relation "ix_rait_case_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:458: NOTICE:  relation "ix_rait_case_event_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/34-inf-rait-case.sql:459: NOTICE:  relation "ix_rait_case_event_actor_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:19: NOTICE:  relation "rait_unit" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:20: NOTICE:  relation "ux_inf_rait_unit_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:21: NOTICE:  relation "ix_inf_rait_unit_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:22: NOTICE:  relation "ix_rait_unit_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:23: NOTICE:  relation "ix_rait_unit_coordinator_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:42: NOTICE:  relation "rait_pool" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:43: NOTICE:  relation "ux_inf_rait_pool_instance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:44: NOTICE:  relation "ux_inf_rait_pool_instance_unit" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:45: NOTICE:  relation "ix_rait_pool_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:46: NOTICE:  relation "ix_rait_pool_unit_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:81: NOTICE:  relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:82: NOTICE:  column "representation_block" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:83: NOTICE:  column "institutional_seat_ref" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:84: NOTICE:  column "appointment_act_ref" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:85: NOTICE:  column "institutional_valid_from" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:86: NOTICE:  column "institutional_valid_to" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:87: NOTICE:  column "institutional_identity_hash" of relation "rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:108: NOTICE:  relation "ux_inf_rait_pool_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:109: NOTICE:  relation "ix_inf_rait_pool_member_agency_jurisdiction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:110: NOTICE:  relation "ux_inf_rait_pool_member_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:111: NOTICE:  relation "ux_inf_rait_pool_member_institutional_seat" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:112: NOTICE:  relation "ix_rait_pool_member_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:113: NOTICE:  relation "ix_rait_pool_member_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:114: NOTICE:  relation "ix_rait_pool_member_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:115: NOTICE:  relation "ix_rait_pool_member_agency_jurisdiction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:148: NOTICE:  relation "rait_schedule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:149: NOTICE:  column "version" of relation "rait_schedule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:155: NOTICE:  relation "ux_inf_rait_schedule_member_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:156: NOTICE:  relation "ix_inf_rait_schedule_pool_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:157: NOTICE:  relation "ix_rait_schedule_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:158: NOTICE:  relation "ix_rait_schedule_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:159: NOTICE:  relation "ix_rait_schedule_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:175: NOTICE:  relation "rait_schedule_slot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:176: NOTICE:  relation "ux_inf_rait_schedule_slot_day" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:177: NOTICE:  relation "ix_rait_schedule_slot_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:178: NOTICE:  relation "ix_rait_schedule_slot_schedule_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:212: NOTICE:  relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:213: NOTICE:  column "version" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:214: NOTICE:  column "approval_signature_ref" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:215: NOTICE:  column "approval_receipt_hash" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:216: NOTICE:  column "approval_verified_at" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:217: NOTICE:  column "approval_signer_person_id" of relation "rait_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:228: NOTICE:  relation "ux_inf_rait_batch_pool_week" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:229: NOTICE:  relation "ix_inf_rait_batch_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:230: NOTICE:  relation "ux_inf_rait_batch_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:231: NOTICE:  relation "ix_rait_batch_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:232: NOTICE:  relation "ix_rait_batch_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:233: NOTICE:  relation "ix_rait_batch_minutes_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:234: NOTICE:  relation "ix_rait_batch_approval_signer_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:251: NOTICE:  relation "rait_batch_draw_snapshot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:252: NOTICE:  relation "ux_inf_rait_batch_draw_snapshot_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:253: NOTICE:  relation "ux_inf_rait_batch_draw_snapshot_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:254: NOTICE:  relation "ix_rait_batch_draw_snapshot_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:255: NOTICE:  relation "ix_rait_batch_draw_snapshot_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:281: NOTICE:  relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:282: NOTICE:  column "manifest_hash" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:283: NOTICE:  column "manifest_version" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:284: NOTICE:  column "prepared_at" of relation "rait_batch_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:295: NOTICE:  relation "ux_inf_rait_batch_minutes_manifest_batch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:296: NOTICE:  relation "ux_inf_rait_batch_minutes_manifest_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:297: NOTICE:  relation "ux_inf_rait_batch_minutes_manifest_batch_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:298: NOTICE:  relation "ux_inf_rait_batch_minutes_manifest_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:299: NOTICE:  relation "ix_rait_batch_minutes_manifest_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:300: NOTICE:  relation "ix_rait_batch_minutes_manifest_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:301: NOTICE:  relation "ix_rait_batch_minutes_manifest_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:302: NOTICE:  relation "ix_rait_batch_minutes_manifest_expected_signer_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:335: NOTICE:  relation "rait_batch_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:336: NOTICE:  relation "ux_inf_rait_batch_item_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:337: NOTICE:  relation "ux_inf_rait_batch_item_position" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:338: NOTICE:  relation "ix_rait_batch_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:339: NOTICE:  relation "ix_rait_batch_item_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:340: NOTICE:  relation "ix_rait_batch_item_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:341: NOTICE:  relation "ix_rait_batch_item_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:365: NOTICE:  relation "rait_assignment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:366: NOTICE:  relation "ux_inf_rait_assignment_active" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:367: NOTICE:  relation "ix_inf_rait_assignment_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:368: NOTICE:  relation "ix_rait_assignment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:369: NOTICE:  relation "ix_rait_assignment_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:370: NOTICE:  relation "ix_rait_assignment_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:371: NOTICE:  relation "ix_rait_assignment_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:372: NOTICE:  relation "ix_rait_assignment_batch_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:390: NOTICE:  relation "rait_impediment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:391: NOTICE:  relation "ux_inf_rait_impediment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:392: NOTICE:  relation "ix_rait_impediment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:393: NOTICE:  relation "ix_rait_impediment_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:394: NOTICE:  relation "ix_rait_impediment_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:408: NOTICE:  relation "rait_substitute_duty" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:409: NOTICE:  relation "ux_inf_rait_substitute_duty" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:410: NOTICE:  relation "ix_rait_substitute_duty_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:411: NOTICE:  relation "ix_rait_substitute_duty_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:412: NOTICE:  relation "ix_rait_substitute_duty_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:430: NOTICE:  relation "rait_bench" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:431: NOTICE:  relation "ux_inf_rait_bench_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:432: NOTICE:  relation "ix_rait_bench_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:433: NOTICE:  relation "ix_rait_bench_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:453: NOTICE:  relation "rait_clock" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:454: NOTICE:  relation "ux_inf_rait_clock_case_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:455: NOTICE:  relation "ix_inf_rait_clock_flag" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:456: NOTICE:  relation "ix_rait_clock_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:457: NOTICE:  relation "ix_rait_clock_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:475: NOTICE:  relation "rait_clock_alert" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:476: NOTICE:  relation "ux_inf_rait_clock_alert_level" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:477: NOTICE:  relation "ix_rait_clock_alert_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:478: NOTICE:  relation "ix_rait_clock_alert_clock_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:496: NOTICE:  trigger "rait_batch_draw_snapshot_immutable_truncate" for relation "inf.rait_batch_draw_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/35-inf-rait-worklist.sql:504: NOTICE:  trigger "rait_batch_minutes_manifest_immutable_truncate" for relation "inf.rait_batch_minutes_manifest" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:37: NOTICE:  relation "rait_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:38: NOTICE:  column "version" of relation "rait_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:44: NOTICE:  relation "ix_inf_rait_session_body_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:45: NOTICE:  relation "ux_inf_rait_session_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:46: NOTICE:  relation "ix_rait_session_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:47: NOTICE:  relation "ix_rait_session_chair_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:86: NOTICE:  relation "rait_agenda_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:87: NOTICE:  column "version" of relation "rait_agenda_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:93: NOTICE:  relation "ux_inf_rait_agenda_item_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:94: NOTICE:  relation "ux_inf_rait_agenda_item_position" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:95: NOTICE:  relation "ux_inf_rait_agenda_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:96: NOTICE:  relation "ix_rait_agenda_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:97: NOTICE:  relation "ix_rait_agenda_item_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:98: NOTICE:  relation "ix_rait_agenda_item_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:99: NOTICE:  relation "ix_rait_agenda_item_rapporteur_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:137: NOTICE:  relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:138: NOTICE:  column "representation_block" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:139: NOTICE:  column "membership_kind" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:140: NOTICE:  column "mandate_starts_on_snapshot" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:141: NOTICE:  column "mandate_ends_on_snapshot" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:142: NOTICE:  column "institutional_seat_ref" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:143: NOTICE:  column "appointment_act_ref" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:144: NOTICE:  column "institutional_valid_from" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:145: NOTICE:  column "institutional_valid_to" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:146: NOTICE:  column "composition_snapshot_hash" of relation "rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:177: NOTICE:  relation "ux_inf_rait_attendance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:178: NOTICE:  relation "ix_rait_attendance_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:179: NOTICE:  relation "ix_rait_attendance_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:180: NOTICE:  relation "ix_rait_attendance_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:196: NOTICE:  relation "rait_vote" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:197: NOTICE:  relation "ux_inf_rait_vote_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:198: NOTICE:  relation "ix_rait_vote_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:199: NOTICE:  relation "ix_rait_vote_agenda_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:200: NOTICE:  relation "ix_rait_vote_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:216: NOTICE:  relation "rait_oral_argument" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:217: NOTICE:  relation "ux_inf_rait_oral_argument_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:218: NOTICE:  relation "ix_rait_oral_argument_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:219: NOTICE:  relation "ix_rait_oral_argument_agenda_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:220: NOTICE:  relation "ix_rait_oral_argument_requested_by_party_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:243: NOTICE:  relation "rait_minutes" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:244: NOTICE:  column "version" of relation "rait_minutes" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:250: NOTICE:  relation "ux_inf_rait_minutes_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:251: NOTICE:  relation "ux_inf_rait_minutes_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:252: NOTICE:  relation "ix_rait_minutes_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:253: NOTICE:  relation "ix_rait_minutes_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:276: NOTICE:  relation "rait_session_minutes_snapshot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:277: NOTICE:  relation "ux_inf_rait_session_minutes_snapshot_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:278: NOTICE:  relation "ux_inf_rait_session_minutes_snapshot_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:279: NOTICE:  relation "ix_rait_session_minutes_snapshot_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:280: NOTICE:  relation "ix_rait_session_minutes_snapshot_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:314: NOTICE:  relation "rait_session_minutes_manifest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:315: NOTICE:  relation "ux_inf_rait_session_minutes_manifest_minutes" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:316: NOTICE:  relation "ux_inf_rait_session_minutes_manifest_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:317: NOTICE:  relation "ux_inf_rait_session_minutes_manifest_evidence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:318: NOTICE:  relation "ix_rait_session_minutes_manifest_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:319: NOTICE:  relation "ix_rait_session_minutes_manifest_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:320: NOTICE:  relation "ix_rait_session_minutes_manifest_minutes_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:321: NOTICE:  relation "ix_rait_session_minutes_manifest_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:355: NOTICE:  relation "rait_minutes_required_signer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:356: NOTICE:  relation "ux_inf_rait_minutes_required_signer_person" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:357: NOTICE:  relation "ix_rait_minutes_required_signer_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:358: NOTICE:  relation "ix_rait_minutes_required_signer_minutes_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:359: NOTICE:  relation "ix_rait_minutes_required_signer_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:360: NOTICE:  relation "ix_rait_minutes_required_signer_agenda_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:397: NOTICE:  relation "rait_minutes_signature_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:398: NOTICE:  relation "ux_inf_rait_minutes_signature_receipt_signer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:399: NOTICE:  relation "ux_inf_rait_minutes_signature_receipt_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:400: NOTICE:  relation "ix_rait_minutes_signature_receipt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:401: NOTICE:  relation "ix_rait_minutes_signature_receipt_minutes_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:402: NOTICE:  relation "ix_rait_minutes_signature_receipt_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:403: NOTICE:  relation "ix_rait_minutes_signature_receipt_signer_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:412: NOTICE:  relation "ux_inf_rait_pool_member_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:430: NOTICE:  trigger "rait_vote_immutable_truncate" for relation "inf.rait_vote" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:438: NOTICE:  trigger "rait_minutes_immutable_truncate" for relation "inf.rait_minutes" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:446: NOTICE:  trigger "rait_session_minutes_snapshot_immutable_truncate" for relation "inf.rait_session_minutes_snapshot" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:454: NOTICE:  trigger "rait_session_minutes_manifest_immutable_truncate" for relation "inf.rait_session_minutes_manifest" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:462: NOTICE:  trigger "rait_minutes_required_signer_immutable_truncate" for relation "inf.rait_minutes_required_signer" does not exist, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/36-inf-rait-session.sql:470: NOTICE:  trigger "rait_minutes_signature_receipt_immutable_truncate" for relation "inf.rait_minutes_signature_receipt" does not exist, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:22: NOTICE:  relation "speed_meter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:23: NOTICE:  relation "ux_inf_speed_meter_serial" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:24: NOTICE:  relation "ix_speed_meter_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:41: NOTICE:  relation "speed_meter_certificate" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:42: NOTICE:  relation "ux_inf_speed_certificate" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:43: NOTICE:  relation "ix_inf_speed_certificate_validity" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:44: NOTICE:  relation "ix_speed_meter_certificate_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:45: NOTICE:  relation "ix_speed_meter_certificate_meter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:75: NOTICE:  relation "speed_measurement" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:76: NOTICE:  relation "ix_inf_speed_measurement_ait" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:77: NOTICE:  relation "ix_inf_speed_measurement_meter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:78: NOTICE:  relation "ix_speed_measurement_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:79: NOTICE:  relation "ix_speed_measurement_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:80: NOTICE:  relation "ix_speed_measurement_meter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:81: NOTICE:  relation "ix_speed_measurement_certificate_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:82: NOTICE:  relation "ix_speed_measurement_plate_image_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/37-inf-speed.sql:83: NOTICE:  relation "ix_speed_measurement_agent_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:45: NOTICE:  relation "infraction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:46: NOTICE:  relation "ux_inf_infraction_ait" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:47: NOTICE:  relation "ix_inf_infraction_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:48: NOTICE:  relation "ix_inf_infraction_risk_flag" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:49: NOTICE:  relation "ix_infraction_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:50: NOTICE:  relation "ix_infraction_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:51: NOTICE:  relation "ix_infraction_last_transition_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:84: NOTICE:  relation "infraction_timer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:85: NOTICE:  relation "ux_inf_infraction_timer_arm" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:86: NOTICE:  relation "ix_inf_infraction_timer_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:87: NOTICE:  relation "ix_infraction_timer_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:88: NOTICE:  relation "ix_infraction_timer_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:89: NOTICE:  relation "ix_infraction_timer_suspended_by_act_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:120: NOTICE:  relation "infraction_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:121: NOTICE:  relation "ix_inf_infraction_event_infraction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:122: NOTICE:  relation "ix_infraction_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:123: NOTICE:  relation "ix_infraction_event_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:124: NOTICE:  relation "ix_infraction_event_transition_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:125: NOTICE:  relation "ix_infraction_event_actor_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/38-inf-infraction.sql:126: NOTICE:  relation "ix_infraction_event_outbox_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:18: NOTICE:  relation "rait_holiday" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:19: NOTICE:  relation "ux_inf_rait_holiday_date_scope" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:20: NOTICE:  relation "ix_inf_rait_holiday_date" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:21: NOTICE:  relation "ix_rait_holiday_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:47: NOTICE:  relation "rait_suspension_act" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:48: NOTICE:  relation "ix_inf_rait_suspension_act_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:49: NOTICE:  relation "ix_inf_rait_suspension_act_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:50: NOTICE:  relation "ix_rait_suspension_act_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:51: NOTICE:  relation "ix_rait_suspension_act_evidence_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:78: NOTICE:  relation "rait_jeton_sheet" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:79: NOTICE:  relation "ux_inf_rait_jeton_sheet_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:80: NOTICE:  relation "ix_inf_rait_jeton_sheet_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:81: NOTICE:  relation "ix_rait_jeton_sheet_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:82: NOTICE:  relation "ix_rait_jeton_sheet_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:112: NOTICE:  relation "rait_jeton_line" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:113: NOTICE:  relation "ux_inf_rait_jeton_line_member_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:114: NOTICE:  relation "ix_inf_rait_jeton_line_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:115: NOTICE:  relation "ix_rait_jeton_line_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:116: NOTICE:  relation "ix_rait_jeton_line_sheet_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:117: NOTICE:  relation "ix_rait_jeton_line_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:118: NOTICE:  relation "ix_rait_jeton_line_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:119: NOTICE:  relation "ix_rait_jeton_line_minutes_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:143: NOTICE:  relation "rait_incident" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:144: NOTICE:  relation "ux_inf_rait_incident_ref" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:145: NOTICE:  relation "ix_inf_rait_incident_open" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:146: NOTICE:  relation "ix_rait_incident_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:147: NOTICE:  relation "ix_rait_incident_clock_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:148: NOTICE:  relation "ix_rait_incident_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:149: NOTICE:  relation "ix_rait_incident_responsible_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:174: NOTICE:  relation "rait_quality_sample" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:175: NOTICE:  relation "ux_inf_rait_quality_sample_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:176: NOTICE:  relation "ix_inf_rait_quality_sample_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:177: NOTICE:  relation "ix_rait_quality_sample_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:178: NOTICE:  relation "ix_rait_quality_sample_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:179: NOTICE:  relation "ix_rait_quality_sample_decision_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:180: NOTICE:  relation "ix_rait_quality_sample_reviewer_member_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:205: NOTICE:  relation "rait_capacity_plan" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:206: NOTICE:  relation "ux_inf_rait_capacity_plan_pool_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:207: NOTICE:  relation "ix_inf_rait_capacity_plan_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:208: NOTICE:  relation "ix_rait_capacity_plan_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:209: NOTICE:  relation "ix_rait_capacity_plan_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:233: NOTICE:  relation "rait_export" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:234: NOTICE:  relation "ix_inf_rait_export_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:235: NOTICE:  relation "ix_rait_export_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/39-inf-rait-org.sql:236: NOTICE:  relation "ix_rait_export_document_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:23: NOTICE:  relation "clinic" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:24: NOTICE:  relation "ux_ch_clinic_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:25: NOTICE:  relation "ux_ch_clinic_cnpj" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:26: NOTICE:  relation "ix_clinic_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:50: NOTICE:  relation "professional" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:51: NOTICE:  relation "ix_ch_professional_kind" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:52: NOTICE:  relation "ux_ch_professional_council" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:53: NOTICE:  relation "ux_ch_professional_user" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:54: NOTICE:  relation "ix_professional_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:55: NOTICE:  relation "ix_professional_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:56: NOTICE:  relation "ix_professional_user_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:76: NOTICE:  relation "biometric_station" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:77: NOTICE:  relation "ux_ch_biometric_station_fingerprint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:78: NOTICE:  relation "ix_ch_biometric_station_clinic" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:79: NOTICE:  relation "ix_biometric_station_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/40-ch-clinical-network.sql:80: NOTICE:  relation "ix_biometric_station_clinic_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:28: NOTICE:  relation "patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:29: NOTICE:  relation "ux_ch_patient_national_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:30: NOTICE:  relation "ix_ch_patient_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:31: NOTICE:  relation "ix_ch_patient_clinic" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:32: NOTICE:  relation "ux_ch_patient_user" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:33: NOTICE:  relation "ix_patient_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:34: NOTICE:  relation "ix_patient_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:35: NOTICE:  relation "ix_patient_user_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/41-ch-patients.sql:36: NOTICE:  relation "ix_patient_national_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:24: NOTICE:  relation "appointment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:25: NOTICE:  relation "ux_ch_appointment_slot" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:26: NOTICE:  relation "ix_ch_appointment_schedule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:27: NOTICE:  relation "ix_ch_appointment_patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:28: NOTICE:  relation "ix_appointment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:29: NOTICE:  relation "ix_appointment_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:30: NOTICE:  relation "ix_appointment_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:31: NOTICE:  relation "ix_appointment_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:67: NOTICE:  relation "encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:68: NOTICE:  relation "ix_ch_encounter_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:69: NOTICE:  relation "ix_ch_encounter_patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:70: NOTICE:  relation "ux_ch_encounter_renach_process" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:71: NOTICE:  relation "ix_encounter_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:72: NOTICE:  relation "ix_encounter_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:73: NOTICE:  relation "ix_encounter_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/42-ch-encounters.sql:74: NOTICE:  relation "ix_encounter_appointment_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:23: NOTICE:  relation "psych_instrument" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:24: NOTICE:  relation "ux_ch_psych_instrument_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:25: NOTICE:  relation "ix_psych_instrument_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:47: NOTICE:  relation "medical_exam" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:48: NOTICE:  relation "ux_ch_medical_exam_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:49: NOTICE:  relation "ix_medical_exam_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:50: NOTICE:  relation "ix_medical_exam_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:51: NOTICE:  relation "ix_medical_exam_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:74: NOTICE:  relation "psychological_exam" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:75: NOTICE:  relation "ux_ch_psychological_exam_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:76: NOTICE:  relation "ix_psychological_exam_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:77: NOTICE:  relation "ix_psychological_exam_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:78: NOTICE:  relation "ix_psychological_exam_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/43-ch-exams.sql:79: NOTICE:  relation "ix_psychological_exam_instrument_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:37: NOTICE:  relation "report" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:38: NOTICE:  relation "ux_ch_report_encounter_kind" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:39: NOTICE:  relation "ux_ch_report_storage_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:40: NOTICE:  relation "ix_report_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:41: NOTICE:  relation "ix_report_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:42: NOTICE:  relation "ix_report_source_exam_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:43: NOTICE:  relation "ix_report_storage_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:44: NOTICE:  relation "ix_report_signer_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:71: NOTICE:  relation "report_addendum" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:72: NOTICE:  relation "ix_ch_report_addendum_report" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:73: NOTICE:  relation "ix_report_addendum_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:74: NOTICE:  relation "ix_report_addendum_report_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:75: NOTICE:  relation "ix_report_addendum_storage_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:89: NOTICE:  relation "report_addendum_approval" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:90: NOTICE:  relation "ux_ch_report_addendum_approval_role" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:91: NOTICE:  relation "ux_ch_report_addendum_approval_actor" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:92: NOTICE:  relation "ix_report_addendum_approval_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:93: NOTICE:  relation "ix_report_addendum_approval_report_addendum_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:123: NOTICE:  relation "registration_block_notice" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:124: NOTICE:  relation "ux_ch_registration_block_report" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:125: NOTICE:  relation "ux_ch_registration_block_addendum" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:126: NOTICE:  relation "ix_ch_registration_block_inbox" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:127: NOTICE:  relation "ix_registration_block_notice_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:128: NOTICE:  relation "ix_registration_block_notice_report_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:129: NOTICE:  relation "ix_registration_block_notice_source_addendum_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:130: NOTICE:  relation "ix_registration_block_notice_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:131: NOTICE:  relation "ix_registration_block_notice_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:158: NOTICE:  relation "feedback_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:159: NOTICE:  relation "ux_ch_feedback_request_active" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:160: NOTICE:  relation "ix_ch_feedback_professional" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:161: NOTICE:  relation "ix_feedback_request_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:162: NOTICE:  relation "ix_feedback_request_report_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:163: NOTICE:  relation "ix_feedback_request_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:164: NOTICE:  relation "ix_feedback_request_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:165: NOTICE:  relation "ix_feedback_request_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:195: NOTICE:  relation "episode_export" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:196: NOTICE:  relation "ux_ch_episode_export_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:197: NOTICE:  relation "ux_ch_episode_export_storage_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:198: NOTICE:  relation "ix_episode_export_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:199: NOTICE:  relation "ix_episode_export_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:200: NOTICE:  relation "ix_episode_export_storage_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:201: NOTICE:  relation "ix_episode_export_signer_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:221: NOTICE:  relation "clinical_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:222: NOTICE:  relation "ix_ch_clinical_document_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:223: NOTICE:  relation "ux_ch_clinical_document_storage" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:224: NOTICE:  relation "ix_clinical_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:225: NOTICE:  relation "ix_clinical_document_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:226: NOTICE:  relation "ix_clinical_document_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/44-ch-reports.sql:227: NOTICE:  relation "ix_clinical_document_storage_document_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:24: NOTICE:  relation "biometric_reference" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:25: NOTICE:  relation "ux_ch_biometric_reference_kind" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:26: NOTICE:  relation "ix_biometric_reference_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:27: NOTICE:  relation "ix_biometric_reference_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:28: NOTICE:  relation "ix_biometric_reference_storage_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:45: NOTICE:  relation "biometric_finger_condition" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:46: NOTICE:  relation "ux_ch_biometric_finger_condition" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:47: NOTICE:  relation "ix_biometric_finger_condition_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:48: NOTICE:  relation "ix_biometric_finger_condition_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:83: NOTICE:  relation "biometric_check" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:84: NOTICE:  relation "ix_ch_biometric_check_appointment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:85: NOTICE:  relation "ix_ch_biometric_check_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:86: NOTICE:  relation "ix_biometric_check_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:87: NOTICE:  relation "ix_biometric_check_appointment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:88: NOTICE:  relation "ix_biometric_check_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:89: NOTICE:  relation "ix_biometric_check_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:90: NOTICE:  relation "ix_biometric_check_station_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:91: NOTICE:  relation "ix_biometric_check_subject_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:92: NOTICE:  relation "ix_biometric_check_subject_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:93: NOTICE:  relation "ix_biometric_check_evidence_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:124: NOTICE:  relation "biometric_exception" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:125: NOTICE:  relation "ix_ch_biometric_exception_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:126: NOTICE:  relation "ix_ch_biometric_exception_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:127: NOTICE:  relation "ix_biometric_exception_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:128: NOTICE:  relation "ix_biometric_exception_appointment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:129: NOTICE:  relation "ix_biometric_exception_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:130: NOTICE:  relation "ix_biometric_exception_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:131: NOTICE:  relation "ix_biometric_exception_station_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/45-ch-biometrics.sql:132: NOTICE:  relation "ix_biometric_exception_biometric_check_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:27: NOTICE:  relation "professional_schedule" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:28: NOTICE:  relation "ix_ch_professional_schedule_lookup" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:29: NOTICE:  relation "ix_professional_schedule_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:30: NOTICE:  relation "ix_professional_schedule_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:31: NOTICE:  relation "ix_professional_schedule_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:58: NOTICE:  relation "appointment_assignment_draw" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:59: NOTICE:  relation "ux_ch_appointment_assignment_track" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:60: NOTICE:  relation "ix_ch_appointment_assignment_professional" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:61: NOTICE:  relation "ix_appointment_assignment_draw_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:62: NOTICE:  relation "ix_appointment_assignment_draw_appointment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:63: NOTICE:  relation "ix_appointment_assignment_draw_selected_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/46-ch-scheduling.sql:64: NOTICE:  relation "ix_appointment_assignment_draw_selected_professional_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:21: NOTICE:  relation "restriction_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:22: NOTICE:  relation "ux_ch_restriction_code_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:23: NOTICE:  relation "ix_restriction_code_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:40: NOTICE:  relation "encounter_restriction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:41: NOTICE:  relation "ux_ch_encounter_restriction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:42: NOTICE:  relation "ix_encounter_restriction_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:43: NOTICE:  relation "ix_encounter_restriction_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:44: NOTICE:  relation "ix_encounter_restriction_report_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/47-ch-restrictions.sql:45: NOTICE:  relation "ix_encounter_restriction_restriction_code_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:27: NOTICE:  relation "retention_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:28: NOTICE:  relation "ux_ch_retention_case_patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:29: NOTICE:  relation "ix_ch_retention_case_eligibility" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:30: NOTICE:  relation "ix_retention_case_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:31: NOTICE:  relation "ix_retention_case_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:48: NOTICE:  relation "retention_hold" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:49: NOTICE:  relation "ix_ch_retention_hold_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:50: NOTICE:  relation "ix_retention_hold_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:51: NOTICE:  relation "ix_retention_hold_retention_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:73: NOTICE:  relation "retention_disposition" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:74: NOTICE:  relation "ix_ch_retention_disposition_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:75: NOTICE:  relation "ix_retention_disposition_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/48-ch-retention.sql:76: NOTICE:  relation "ix_retention_disposition_retention_case_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:24: NOTICE:  relation "process_block" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:25: NOTICE:  relation "ux_ch_process_block_active_source" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:26: NOTICE:  relation "ix_ch_process_block_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:27: NOTICE:  relation "ix_process_block_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/49-ch-process-blocks.sql:28: NOTICE:  relation "ix_process_block_encounter_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:32: NOTICE:  relation "telehealth_session" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:33: NOTICE:  relation "ux_ch_telehealth_external" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:34: NOTICE:  relation "ix_ch_telehealth_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:35: NOTICE:  relation "ix_telehealth_session_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:36: NOTICE:  relation "ix_telehealth_session_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:37: NOTICE:  relation "ix_telehealth_session_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:38: NOTICE:  relation "ix_telehealth_session_appointment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/50-ch-telehealth.sql:39: NOTICE:  relation "ix_telehealth_session_external_session_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:27: NOTICE:  relation "federal_exam_public_price" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:28: NOTICE:  relation "ux_ch_federal_exam_price_start" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:29: NOTICE:  relation "ix_ch_federal_exam_price_effective" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:30: NOTICE:  relation "ix_federal_exam_public_price_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:58: NOTICE:  relation "billing_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:59: NOTICE:  relation "ix_ch_billing_item_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:60: NOTICE:  relation "ix_ch_billing_item_reference" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:61: NOTICE:  relation "ix_billing_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:62: NOTICE:  relation "ix_billing_item_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:63: NOTICE:  relation "ix_billing_item_telehealth_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:64: NOTICE:  relation "ix_billing_item_federal_price_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:85: NOTICE:  relation "billing_invoice" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:86: NOTICE:  relation "ix_ch_billing_invoice_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:87: NOTICE:  relation "ix_billing_invoice_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:88: NOTICE:  relation "ix_billing_invoice_clinic_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:110: NOTICE:  relation "billing_divergence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:111: NOTICE:  relation "ix_ch_billing_divergence_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:112: NOTICE:  relation "ix_billing_divergence_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:113: NOTICE:  relation "ix_billing_divergence_invoice_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:114: NOTICE:  relation "ix_billing_divergence_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:126: NOTICE:  relation "billing_invoice_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:127: NOTICE:  relation "ux_ch_billing_invoice_item_once" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:128: NOTICE:  relation "ix_billing_invoice_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:129: NOTICE:  relation "ix_billing_invoice_item_invoice_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/51-ch-billing.sql:130: NOTICE:  relation "ix_billing_invoice_item_item_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:27: NOTICE:  relation "clinical_control_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:28: NOTICE:  relation "ix_ch_clinical_control_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:29: NOTICE:  relation "ix_clinical_control_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:30: NOTICE:  relation "ix_clinical_control_event_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:31: NOTICE:  relation "ix_clinical_control_event_medical_exam_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/52-ch-clinical-controls.sql:32: NOTICE:  relation "ix_clinical_control_event_psychological_exam_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:33: NOTICE:  relation "inconsistency" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:34: NOTICE:  relation "ix_ch_inconsistency_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:35: NOTICE:  relation "ix_inconsistency_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/53-ch-inconsistencies.sql:36: NOTICE:  relation "ix_inconsistency_encounter_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:25: NOTICE:  relation "operational_record" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:26: NOTICE:  relation "ix_ch_operational_record_kind" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:27: NOTICE:  relation "ix_operational_record_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:28: NOTICE:  relation "ix_operational_record_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/54-ch-operational-controls.sql:29: NOTICE:  relation "ix_operational_record_clinic_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:30: NOTICE:  relation "junta_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:31: NOTICE:  relation "ix_ch_junta_case_encounter" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:32: NOTICE:  relation "ix_ch_junta_case_applicant" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:33: NOTICE:  relation "ix_junta_case_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:34: NOTICE:  relation "ix_junta_case_encounter_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:35: NOTICE:  relation "ix_junta_case_applicant_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:56: NOTICE:  relation "junta_board" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:57: NOTICE:  relation "ux_ch_junta_board_instance" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:58: NOTICE:  relation "ix_junta_board_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:59: NOTICE:  relation "ix_junta_board_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:74: NOTICE:  relation "junta_board_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:75: NOTICE:  relation "ux_ch_junta_board_member" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:76: NOTICE:  relation "ix_junta_board_member_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:77: NOTICE:  relation "ix_junta_board_member_board_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:78: NOTICE:  relation "ix_junta_board_member_professional_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:107: NOTICE:  relation "junta_decision" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:108: NOTICE:  relation "ix_ch_junta_decision_board" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:109: NOTICE:  relation "ix_junta_decision_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:110: NOTICE:  relation "ix_junta_decision_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:111: NOTICE:  relation "ix_junta_decision_board_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:112: NOTICE:  relation "ix_junta_decision_storage_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:136: NOTICE:  relation "junta_appeal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:137: NOTICE:  relation "ux_ch_junta_appeal_decision" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:138: NOTICE:  relation "ix_ch_junta_appeal_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:139: NOTICE:  relation "ix_junta_appeal_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:140: NOTICE:  relation "ix_junta_appeal_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:141: NOTICE:  relation "ix_junta_appeal_source_decision_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/55-ch-juntas.sql:142: NOTICE:  relation "ix_junta_appeal_applicant_patient_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:5: NOTICE:  schema "ch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:33: NOTICE:  relation "periodic_toxicology_result" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:34: NOTICE:  relation "ux_ch_toxicology_source_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:35: NOTICE:  relation "ix_ch_toxicology_patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:36: NOTICE:  relation "ix_periodic_toxicology_result_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:37: NOTICE:  relation "ix_periodic_toxicology_result_source_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:38: NOTICE:  relation "ix_periodic_toxicology_result_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:59: NOTICE:  relation "toxicology_suspension" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:60: NOTICE:  relation "ux_ch_toxicology_active_suspension" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:61: NOTICE:  relation "ix_ch_toxicology_suspension_patient" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:62: NOTICE:  relation "ix_toxicology_suspension_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:63: NOTICE:  relation "ix_toxicology_suspension_patient_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:64: NOTICE:  relation "ix_toxicology_suspension_source_positive_result_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/56-ch-toxicology.sql:65: NOTICE:  relation "ix_toxicology_suspension_released_by_result_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:36: NOTICE:  relation "collection_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:37: NOTICE:  relation "ux_inf_collection_document_active" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:38: NOTICE:  relation "ux_inf_collection_document_barcode" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:39: NOTICE:  relation "ix_inf_collection_document_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:40: NOTICE:  relation "ix_collection_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:41: NOTICE:  relation "ix_collection_document_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:42: NOTICE:  relation "ix_collection_document_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:43: NOTICE:  relation "ix_collection_document_supersedes_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:66: NOTICE:  relation "payment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:67: NOTICE:  relation "ux_inf_payment_bank_reference" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:68: NOTICE:  relation "ix_inf_payment_unmatched" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:69: NOTICE:  relation "ix_payment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:70: NOTICE:  relation "ix_payment_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:99: NOTICE:  relation "refund_order" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:100: NOTICE:  relation "ux_inf_refund_order_payment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:101: NOTICE:  relation "ix_inf_refund_order_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:102: NOTICE:  relation "ix_refund_order_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:103: NOTICE:  relation "ix_refund_order_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:104: NOTICE:  relation "ix_refund_order_payment_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:105: NOTICE:  relation "ix_refund_order_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:128: NOTICE:  relation "debt_handoff" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:129: NOTICE:  relation "ux_inf_debt_handoff_active" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:130: NOTICE:  relation "ix_inf_debt_handoff_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:131: NOTICE:  relation "ix_debt_handoff_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:132: NOTICE:  relation "ix_debt_handoff_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/57-inf-collection.sql:133: NOTICE:  relation "ix_debt_handoff_dossier_document_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:28: NOTICE:  relation "rait_reconciliation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:29: NOTICE:  relation "ux_inf_rait_reconciliation_window" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:30: NOTICE:  relation "ix_inf_rait_reconciliation_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:31: NOTICE:  relation "ix_rait_reconciliation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/58-inf-rait-integration.sql:32: NOTICE:  relation "ix_rait_reconciliation_report_document_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:5: NOTICE:  schema "inf" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:35: NOTICE:  relation "notice" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:36: NOTICE:  relation "ix_inf_notice_infraction" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:37: NOTICE:  relation "ix_inf_notice_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:38: NOTICE:  relation "ix_notice_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:39: NOTICE:  relation "ix_notice_infraction_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:40: NOTICE:  relation "ix_notice_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:41: NOTICE:  relation "ix_notice_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:42: NOTICE:  relation "ix_notice_supersedes_notice_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:58: NOTICE:  relation "notice_acknowledgement" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:59: NOTICE:  relation "ux_inf_notice_acknowledgement_notice" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:60: NOTICE:  relation "ix_notice_acknowledgement_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:61: NOTICE:  relation "ix_notice_acknowledgement_notice_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:80: NOTICE:  relation "notice_delivery_attempt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:81: NOTICE:  relation "ix_inf_notice_delivery_attempt_notice" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:82: NOTICE:  relation "ix_notice_delivery_attempt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:83: NOTICE:  relation "ix_notice_delivery_attempt_notice_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/59-inf-notification.sql:84: NOTICE:  relation "ix_notice_delivery_attempt_outbox_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:25: NOTICE:  relation "complaint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:26: NOTICE:  relation "ux_portal_complaint_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:27: NOTICE:  relation "ix_portal_complaint_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/60-portal-complaints.sql:28: NOTICE:  relation "ix_complaint_tenant_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:22: NOTICE:  relation "subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:23: NOTICE:  relation "ux_portal_subject_cpf_hash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:24: NOTICE:  relation "ix_subject_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:44: NOTICE:  relation "representation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:45: NOTICE:  relation "ix_portal_representation_representative" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:46: NOTICE:  relation "ix_portal_representation_represented" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:47: NOTICE:  relation "ix_representation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:48: NOTICE:  relation "ix_representation_representative_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:49: NOTICE:  relation "ix_representation_instrument_document_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:66: NOTICE:  relation "act_level_policy" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:67: NOTICE:  relation "ux_portal_act_level_policy_act_key_effective_from" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:68: NOTICE:  relation "ix_act_level_policy_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:87: NOTICE:  relation "entitlement" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:88: NOTICE:  relation "ux_portal_entitlement_subject_target_relation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:89: NOTICE:  relation "ix_portal_entitlement_target" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:90: NOTICE:  relation "ix_entitlement_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:91: NOTICE:  relation "ix_entitlement_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/61-portal-identity.sql:92: NOTICE:  relation "ix_entitlement_target_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:34: NOTICE:  relation "request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:35: NOTICE:  relation "ix_portal_request_subject_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:36: NOTICE:  relation "ix_portal_request_service_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:37: NOTICE:  relation "ix_portal_request_target" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:38: NOTICE:  relation "ix_request_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:39: NOTICE:  relation "ix_request_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:40: NOTICE:  relation "ix_request_target_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:41: NOTICE:  relation "ix_request_delegation_external_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:55: NOTICE:  relation "request_draft" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:56: NOTICE:  relation "ux_portal_request_draft_request_version" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:57: NOTICE:  relation "ix_request_draft_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:58: NOTICE:  relation "ix_request_draft_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:77: NOTICE:  relation "request_attachment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:78: NOTICE:  relation "ix_portal_request_attachment_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:79: NOTICE:  relation "ix_request_attachment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:80: NOTICE:  relation "ix_request_attachment_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:96: NOTICE:  relation "protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:97: NOTICE:  relation "ux_portal_protocol_number" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:98: NOTICE:  relation "ux_portal_protocol_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:99: NOTICE:  relation "ix_protocol_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:100: NOTICE:  relation "ix_protocol_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:114: NOTICE:  relation "consequence_ack" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:115: NOTICE:  relation "ix_portal_consequence_ack_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:116: NOTICE:  relation "ix_consequence_ack_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:117: NOTICE:  relation "ix_consequence_ack_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:131: NOTICE:  relation "evaluation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:132: NOTICE:  relation "ux_portal_evaluation_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:133: NOTICE:  relation "ix_evaluation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:134: NOTICE:  relation "ix_evaluation_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:151: NOTICE:  relation "idempotency_record" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:152: NOTICE:  relation "ux_portal_idempotency_record_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:153: NOTICE:  relation "ix_idempotency_record_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/62-portal-requests.sql:154: NOTICE:  relation "ix_idempotency_record_subject_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:33: NOTICE:  relation "inbox_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:34: NOTICE:  relation "ux_portal_inbox_item_source_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:35: NOTICE:  relation "ix_portal_inbox_item_subject_available" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:36: NOTICE:  relation "ix_inbox_item_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:37: NOTICE:  relation "ix_inbox_item_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:38: NOTICE:  relation "ix_inbox_item_source_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:39: NOTICE:  relation "ix_inbox_item_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:40: NOTICE:  relation "ix_inbox_item_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:54: NOTICE:  relation "acknowledgement_evidence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:55: NOTICE:  relation "ux_portal_acknowledgement_evidence_item" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:56: NOTICE:  relation "ix_acknowledgement_evidence_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:57: NOTICE:  relation "ix_acknowledgement_evidence_inbox_item_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:79: NOTICE:  relation "sne_enrollment" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:80: NOTICE:  relation "ux_portal_sne_enrollment_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:81: NOTICE:  relation "ix_sne_enrollment_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:82: NOTICE:  relation "ix_sne_enrollment_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:94: NOTICE:  relation "push_subscription" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:95: NOTICE:  relation "ux_portal_push_subscription_endpoint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:96: NOTICE:  relation "ix_push_subscription_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/63-portal-inbox.sql:97: NOTICE:  relation "ix_push_subscription_subject_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:31: NOTICE:  relation "manifestation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:32: NOTICE:  relation "ux_portal_manifestation_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:33: NOTICE:  relation "ix_portal_manifestation_subject_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:34: NOTICE:  relation "ix_portal_manifestation_state_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:35: NOTICE:  relation "ix_manifestation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:36: NOTICE:  relation "ix_manifestation_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:52: NOTICE:  relation "manifestation_extension" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:53: NOTICE:  relation "ux_portal_manifestation_extension_timer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:54: NOTICE:  relation "ix_manifestation_extension_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:55: NOTICE:  relation "ix_manifestation_extension_manifestation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:84: NOTICE:  relation "service_catalog" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:85: NOTICE:  relation "ux_portal_service_catalog_service_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:86: NOTICE:  relation "ix_portal_service_catalog_availability" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/64-portal-citizen-service.sql:87: NOTICE:  relation "ix_service_catalog_tenant_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:5: NOTICE:  schema "portal" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:30: NOTICE:  relation "infraction_view" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:31: NOTICE:  relation "ux_portal_infraction_view_ait" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:32: NOTICE:  relation "ix_portal_infraction_view_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:33: NOTICE:  relation "ix_infraction_view_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:34: NOTICE:  relation "ix_infraction_view_ait_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:35: NOTICE:  relation "ix_infraction_view_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:49: NOTICE:  relation "process_timeline" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:50: NOTICE:  relation "ux_portal_process_timeline_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:51: NOTICE:  relation "ix_process_timeline_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:52: NOTICE:  relation "ix_process_timeline_request_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:53: NOTICE:  relation "ix_process_timeline_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:54: NOTICE:  relation "ix_process_timeline_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:70: NOTICE:  relation "points_view" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:71: NOTICE:  relation "ux_portal_points_view_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:72: NOTICE:  relation "ix_points_view_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:73: NOTICE:  relation "ix_points_view_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:87: NOTICE:  relation "crash_view" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:88: NOTICE:  relation "ux_portal_crash_view_crash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:89: NOTICE:  relation "ix_portal_crash_view_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:90: NOTICE:  relation "ix_crash_view_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:91: NOTICE:  relation "ix_crash_view_crash_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:92: NOTICE:  relation "ix_crash_view_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:106: NOTICE:  relation "exam_view" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:107: NOTICE:  relation "ux_portal_exam_view_exam" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:108: NOTICE:  relation "ix_portal_exam_view_subject" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:109: NOTICE:  relation "ix_exam_view_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:110: NOTICE:  relation "ix_exam_view_exam_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:111: NOTICE:  relation "ix_exam_view_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:123: NOTICE:  relation "projection_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:124: NOTICE:  relation "ux_portal_projection_applied_event_event_projection" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:125: NOTICE:  relation "ix_projection_applied_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:126: NOTICE:  relation "ix_projection_applied_event_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:140: NOTICE:  relation "national_read_cache" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:141: NOTICE:  relation "ux_portal_national_read_cache_subject_kind_target" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:142: NOTICE:  relation "ix_national_read_cache_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:143: NOTICE:  relation "ix_national_read_cache_subject_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/65-portal-projections.sql:144: NOTICE:  relation "ix_national_read_cache_target_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:5: NOTICE:  schema "est" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:48: NOTICE:  relation "crash_record" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:49: NOTICE:  relation "ix_est_crash_record_tenant_occurred" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:50: NOTICE:  relation "ix_est_crash_record_tenant_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:51: NOTICE:  relation "ux_est_crash_record_source_local" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:52: NOTICE:  relation "ux_est_crash_record_natural_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:53: NOTICE:  relation "ix_crash_record_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:54: NOTICE:  relation "ix_crash_record_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:55: NOTICE:  relation "ix_crash_record_shift_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:56: NOTICE:  relation "ix_crash_record_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:57: NOTICE:  relation "ix_crash_record_operation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:58: NOTICE:  relation "ix_crash_record_source_local_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:74: NOTICE:  relation "crash_vehicle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:75: NOTICE:  relation "ux_est_crash_vehicle_sequence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:76: NOTICE:  relation "ix_crash_vehicle_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:77: NOTICE:  relation "ix_crash_vehicle_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:78: NOTICE:  relation "ix_crash_vehicle_vehicle_snapshot_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:99: NOTICE:  relation "crash_person" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:100: NOTICE:  relation "ix_crash_person_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:101: NOTICE:  relation "ix_crash_person_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:102: NOTICE:  relation "ix_crash_person_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:103: NOTICE:  relation "ix_crash_person_crash_vehicle_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:123: NOTICE:  relation "crash_victim" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:124: NOTICE:  relation "ix_crash_victim_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:125: NOTICE:  relation "ix_crash_victim_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:126: NOTICE:  relation "ix_crash_victim_crash_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:146: NOTICE:  relation "crash_scene_duty" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:147: NOTICE:  relation "ix_crash_scene_duty_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:148: NOTICE:  relation "ix_crash_scene_duty_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:149: NOTICE:  relation "ix_crash_scene_duty_crash_person_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:150: NOTICE:  relation "ix_crash_scene_duty_crash_vehicle_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:165: NOTICE:  relation "crash_damage" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:166: NOTICE:  relation "ix_crash_damage_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:167: NOTICE:  relation "ix_crash_damage_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:181: NOTICE:  relation "crash_witness" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:182: NOTICE:  relation "ix_crash_witness_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:183: NOTICE:  relation "ix_crash_witness_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:197: NOTICE:  relation "crash_sketch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:198: NOTICE:  relation "ix_crash_sketch_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:199: NOTICE:  relation "ix_crash_sketch_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:200: NOTICE:  relation "ix_crash_sketch_evidence_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:214: NOTICE:  relation "crash_link" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:215: NOTICE:  relation "ux_est_crash_link_target" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:216: NOTICE:  relation "ix_crash_link_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:217: NOTICE:  relation "ix_crash_link_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:218: NOTICE:  relation "ix_crash_link_target_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:237: NOTICE:  relation "crash_renaest_submission" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:238: NOTICE:  relation "ux_est_crash_renaest_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:239: NOTICE:  relation "ix_crash_renaest_submission_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:240: NOTICE:  relation "ix_crash_renaest_submission_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:255: NOTICE:  relation "crash_subject_request" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:256: NOTICE:  relation "ix_crash_subject_request_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:257: NOTICE:  relation "ix_crash_subject_request_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:286: NOTICE:  relation "crash_report_document" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:287: NOTICE:  relation "ux_est_crash_report_storage_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:288: NOTICE:  relation "ix_est_crash_report_record_created" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:289: NOTICE:  relation "ix_crash_report_document_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:290: NOTICE:  relation "ix_crash_report_document_crash_record_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:291: NOTICE:  relation "ix_crash_report_document_policy_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/70-est-crash.sql:292: NOTICE:  relation "ix_crash_report_document_supersedes_document_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:5: NOTICE:  schema "dashboard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:22: NOTICE:  relation "crash_aggregate" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:23: NOTICE:  relation "ux_dashboard_crash_aggregate_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:24: NOTICE:  relation "ix_dashboard_crash_aggregate_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:25: NOTICE:  relation "ix_crash_aggregate_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:26: NOTICE:  relation "ix_crash_aggregate_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:40: NOTICE:  relation "crash_projection_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:41: NOTICE:  relation "ux_dashboard_crash_projection_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:42: NOTICE:  relation "ix_dashboard_crash_projection_replay" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:43: NOTICE:  relation "ix_crash_projection_applied_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/71-dashboard-crashes.sql:44: NOTICE:  relation "ix_crash_projection_applied_event_event_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:5: NOTICE:  schema "integration" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:22: NOTICE:  relation "renaest_mirror" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:23: NOTICE:  relation "ux_integration_renaest_mirror_crash" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:24: NOTICE:  relation "ix_integration_renaest_mirror_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:25: NOTICE:  relation "ix_integration_renaest_mirror_protocol" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:26: NOTICE:  relation "ix_renaest_mirror_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:27: NOTICE:  relation "ix_renaest_mirror_crash_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:28: NOTICE:  relation "ix_renaest_mirror_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:42: NOTICE:  relation "renaest_mirror_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:43: NOTICE:  relation "ux_integration_renaest_mirror_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:44: NOTICE:  relation "ix_integration_renaest_mirror_replay" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:45: NOTICE:  relation "ix_renaest_mirror_applied_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/72-integration-renaest-mirror.sql:46: NOTICE:  relation "ix_renaest_mirror_applied_event_event_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:1: NOTICE:  schema "jobs" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:21: NOTICE:  relation "boat_renaest_identity" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:33: NOTICE:  relation "boat_renaest_identity_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:55: NOTICE:  relation "boat_renaest_execution" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/75-boat-renaest-job.sql:58: NOTICE:  relation "idx_jobs_boat_renaest_execution_due" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:5: NOTICE:  schema "dashboard" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:54: NOTICE:  relation "alert" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:55: NOTICE:  relation "ix_dashboard_alert_state_severity" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:56: NOTICE:  relation "ix_dashboard_alert_indicator" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:57: NOTICE:  relation "ix_dashboard_alert_object" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:58: NOTICE:  relation "ix_dashboard_alert_owner" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:59: NOTICE:  relation "ix_alert_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:60: NOTICE:  relation "ix_alert_source_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:83: NOTICE:  relation "alert_trail" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:84: NOTICE:  relation "ux_dashboard_alert_trail_seq" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:85: NOTICE:  relation "ix_alert_trail_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:86: NOTICE:  relation "ix_alert_trail_alert_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:87: NOTICE:  relation "ix_alert_trail_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:114: NOTICE:  relation "duty" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:115: NOTICE:  relation "ux_dashboard_duty_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:116: NOTICE:  relation "ux_dashboard_duty_line_no" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:117: NOTICE:  relation "ix_duty_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:147: NOTICE:  relation "duty_cycle" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:148: NOTICE:  relation "ux_dashboard_duty_cycle_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:149: NOTICE:  relation "ix_dashboard_duty_cycle_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:150: NOTICE:  relation "ix_duty_cycle_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:185: NOTICE:  relation "indicator" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:186: NOTICE:  relation "ux_dashboard_indicator_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:187: NOTICE:  relation "ix_dashboard_indicator_block" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:188: NOTICE:  relation "ix_indicator_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:213: NOTICE:  relation "indicator_config" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:214: NOTICE:  relation "ux_dashboard_indicator_config_code" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:215: NOTICE:  relation "ix_dashboard_indicator_config_indicator" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:216: NOTICE:  relation "ix_indicator_config_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:236: NOTICE:  relation "bi_panel" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:237: NOTICE:  relation "ux_dashboard_bi_panel_name" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:238: NOTICE:  relation "ix_bi_panel_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:264: NOTICE:  relation "generated_report" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:265: NOTICE:  relation "ix_dashboard_generated_report_requested" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:266: NOTICE:  relation "ix_dashboard_generated_report_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:267: NOTICE:  relation "ix_generated_report_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:296: NOTICE:  relation "export_log" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:297: NOTICE:  relation "ix_dashboard_export_log_requested" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:298: NOTICE:  relation "ix_dashboard_export_log_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:299: NOTICE:  relation "ix_dashboard_export_log_user" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:300: NOTICE:  relation "ix_export_log_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:326: NOTICE:  relation "source" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:327: NOTICE:  relation "ux_dashboard_source_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:328: NOTICE:  relation "ix_dashboard_source_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:329: NOTICE:  relation "ix_source_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:330: NOTICE:  relation "ix_source_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:345: NOTICE:  relation "transparency_audit" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:346: NOTICE:  relation "ux_dashboard_transparency_audit_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:347: NOTICE:  relation "ix_transparency_audit_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:380: NOTICE:  relation "dataset" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:381: NOTICE:  relation "ux_dashboard_dataset_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:382: NOTICE:  relation "ix_dataset_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:399: NOTICE:  relation "monitor_projection_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:400: NOTICE:  relation "ux_dashboard_monitor_projection_applied_event" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:401: NOTICE:  relation "ix_dashboard_monitor_projection_replay" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:402: NOTICE:  relation "ix_monitor_projection_applied_event_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:403: NOTICE:  relation "ix_monitor_projection_applied_event_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:434: NOTICE:  relation "prescription_risk" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:435: NOTICE:  relation "ux_dashboard_prescription_risk_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:436: NOTICE:  relation "ix_dashboard_prescription_risk_indicator" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:437: NOTICE:  relation "ix_dashboard_prescription_risk_pool" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:438: NOTICE:  relation "ix_prescription_risk_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:439: NOTICE:  relation "ix_prescription_risk_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:440: NOTICE:  relation "ix_prescription_risk_clock_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:441: NOTICE:  relation "ix_prescription_risk_pool_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:442: NOTICE:  relation "ix_prescription_risk_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:469: NOTICE:  relation "production" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:470: NOTICE:  relation "ux_dashboard_production_case" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:471: NOTICE:  relation "ix_dashboard_production_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:472: NOTICE:  relation "ix_production_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:473: NOTICE:  relation "ix_production_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:474: NOTICE:  relation "ix_production_session_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:475: NOTICE:  relation "ix_production_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:495: NOTICE:  relation "integration_health" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:496: NOTICE:  relation "ux_dashboard_integration_health_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:497: NOTICE:  relation "ix_dashboard_integration_health_system" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:498: NOTICE:  relation "ix_integration_health_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:499: NOTICE:  relation "ix_integration_health_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:519: NOTICE:  relation "pec_deadlines" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:520: NOTICE:  relation "ux_dashboard_pec_deadlines_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:521: NOTICE:  relation "ix_dashboard_pec_deadlines_indicator" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:522: NOTICE:  relation "ix_pec_deadlines_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:523: NOTICE:  relation "ix_pec_deadlines_case_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:524: NOTICE:  relation "ix_pec_deadlines_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:547: NOTICE:  relation "teat_measures" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:548: NOTICE:  relation "ux_dashboard_teat_measures_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:549: NOTICE:  relation "ix_dashboard_teat_measures_deadline" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:550: NOTICE:  relation "ix_teat_measures_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:551: NOTICE:  relation "ix_teat_measures_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:577: NOTICE:  relation "portal_service_metrics" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:578: NOTICE:  relation "ux_dashboard_portal_service_metrics_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:579: NOTICE:  relation "ix_dashboard_portal_service_metrics_period" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:580: NOTICE:  relation "ix_portal_service_metrics_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:581: NOTICE:  relation "ix_portal_service_metrics_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:606: NOTICE:  relation "duty_evidence" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:607: NOTICE:  relation "ux_dashboard_duty_evidence_cell" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:608: NOTICE:  relation "ix_dashboard_duty_evidence_state" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:609: NOTICE:  relation "ix_duty_evidence_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:610: NOTICE:  relation "ix_duty_evidence_last_event_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:637: NOTICE:  relation "timer" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:638: NOTICE:  relation "ux_dashboard_timer_arm" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:639: NOTICE:  relation "ix_dashboard_timer_due" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:640: NOTICE:  relation "ix_dashboard_timer_owner" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:641: NOTICE:  relation "ix_timer_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:642: NOTICE:  relation "ix_timer_owner_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:663: NOTICE:  relation "access_log" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:664: NOTICE:  relation "ix_dashboard_access_log_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:665: NOTICE:  relation "ix_dashboard_access_log_user" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:666: NOTICE:  relation "ix_dashboard_access_log_resource" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:667: NOTICE:  relation "ix_dashboard_access_log_export" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:668: NOTICE:  relation "ix_access_log_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/80-dashboard.sql:669: NOTICE:  relation "ix_access_log_export_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:5: NOTICE:  schema "ops" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:23: NOTICE:  relation "device_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:24: NOTICE:  relation "ux_device_key_tenant_id_device_id_key_fingerprint" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:25: NOTICE:  relation "ix_device_key_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:26: NOTICE:  relation "ix_device_key_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:27: NOTICE:  relation "ix_device_key_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:57: NOTICE:  relation "offline_authorization_grant" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:58: NOTICE:  relation "ix_offline_authorization_grant_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:59: NOTICE:  relation "ux_offline_authorization_grant_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:60: NOTICE:  relation "ix_offline_authorization_grant_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:61: NOTICE:  relation "ix_offline_authorization_grant_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:62: NOTICE:  relation "ix_offline_authorization_grant_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:63: NOTICE:  relation "ix_offline_authorization_grant_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:64: NOTICE:  relation "ix_offline_authorization_grant_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:89: NOTICE:  relation "provisioning_package" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:90: NOTICE:  relation "ux_provisioning_package_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:91: NOTICE:  relation "ix_provisioning_package_tenant_id_device_id_status" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:92: NOTICE:  relation "ux_provisioning_package_tenant_id_manifest_digest" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:93: NOTICE:  relation "ix_provisioning_package_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:94: NOTICE:  relation "ix_provisioning_package_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:95: NOTICE:  relation "ix_provisioning_package_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:96: NOTICE:  relation "ix_provisioning_package_normative_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:97: NOTICE:  relation "ix_provisioning_package_signature_key_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:114: NOTICE:  relation "provisioning_receipt" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  identifier "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_type" will be truncated to "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:115: NOTICE:  relation "ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:116: NOTICE:  relation "ux_provisioning_receipt_tenant_id_idempotency_key" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:117: NOTICE:  relation "ix_provisioning_receipt_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:118: NOTICE:  relation "ix_provisioning_receipt_package_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:119: NOTICE:  relation "ix_provisioning_receipt_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:120: NOTICE:  relation "ix_provisioning_receipt_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:135: NOTICE:  relation "device_revocation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:136: NOTICE:  relation "ux_device_revocation_tenant_id_device_id_revocation_epoch" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:137: NOTICE:  relation "ix_device_revocation_tenant_id_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:138: NOTICE:  relation "ix_device_revocation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:139: NOTICE:  relation "ix_device_revocation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:140: NOTICE:  relation "ix_device_revocation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:154: NOTICE:  relation "provisioning_command_idempotency" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  identifier "ux_provisioning_command_idempotency_tenant_id_command_name_idempotency_key" will be truncated to "ux_provisioning_command_idempotency_tenant_id_command_name_idem"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:155: NOTICE:  relation "ux_provisioning_command_idempotency_tenant_id_command_name_idem" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:156: NOTICE:  relation "ix_provisioning_command_idempotency_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:173: NOTICE:  relation "provisioning_reconciliation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  identifier "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliation_digest" will be truncated to "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:174: NOTICE:  relation "ux_provisioning_reconciliation_tenant_id_grant_id_reconciliatio" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:175: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id_grant_id_reconciled_at" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:176: NOTICE:  relation "ix_provisioning_reconciliation_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:177: NOTICE:  relation "ix_provisioning_reconciliation_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:178: NOTICE:  relation "ix_provisioning_reconciliation_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:192: NOTICE:  relation "provisioning_grant_reservation_binding" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:193: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_grant_id_re" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  identifier "ux_provisioning_grant_reservation_binding_tenant_id_reservation_id" will be truncated to "ux_provisioning_grant_reservation_binding_tenant_id_reservation"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:194: NOTICE:  relation "ux_provisioning_grant_reservation_binding_tenant_id_reservation" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  identifier "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_authorized_agent_id" will be truncated to "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au"
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:195: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id_grant_id_au" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:196: NOTICE:  relation "ix_provisioning_grant_reservation_binding_tenant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:197: NOTICE:  relation "ix_provisioning_grant_reservation_binding_grant_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:198: NOTICE:  relation "ix_provisioning_grant_reservation_binding_reservation_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:199: NOTICE:  relation "ix_provisioning_grant_reservation_binding_traffic_agency_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:200: NOTICE:  relation "ix_provisioning_grant_reservation_binding_device_id" already exists, skipping
psql:/Users/aarusso/.codex/worktrees/local-stack/detran/backend/database/ddl/21-ops-provisioning.sql:201: NOTICE:  relation "ix_provisioning_grant_reservation_binding_authorized_agent_id" already exists, skipping
 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 create_rls_policy 
-------------------
 
(1 row)

 install_tenant_triggers 
-------------------------
 
(1 row)

apply.sh: done (full=0 db=detran_local_stack)
detran-stack: applying fresh-local-stack demonstration seed to detran_local_stack
seed/00-fixtures-core.sql
seed/05-parameters.sql
seed/10-fixtures-inf-ait.sql
seed/21-fixtures-rait-fresh.sql
seed/25-fixtures-teat.sql
seed/26-fixtures-teat-field.sql
seed/27-fixtures-teat-evidence.sql
seed/28-fixtures-teat-measures-alcohol.sql
seed/29-fixtures-ops-provisioning.sql
seed/30-fixtures-infraction.sql
seed/40-fixtures-rait-org-fresh-local-stack.sql
seed/50-fixtures-collection.sql
seed/60-fixtures-rait-integration-fresh-local-stack.sql
seed/70-fixtures-est-crash.sql
seed/70-fixtures-portal.sql
seed/71-fixtures-portal-events.sql
seed/72-fixtures-boat-projections.sql
seed/80-fixtures-dashboard-catalog.sql
seed/81-fixtures-dashboard-state.sql
seed.sh: done (profile=fresh-local-stack db=detran_local_stack)
detran-stack: building backend and workspace dependencies
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
Scope: 53 of 64 workspace projects
backend/domains/inf/deadlines build$ tsc -p tsconfig.build.json
backend/domains/shared build$ tsc -p tsconfig.build.json
packages/senatran-adapter build$ tsc -p tsconfig.build.json
packages/sefaz-adapter build$ tsc -p tsconfig.build.json
packages/sefaz-adapter build: Done
packages/senatran-adapter build: Done
backend/domains/inf/deadlines build: Done
backend/domains/shared build: Done
backend/domains/ch/clinical-network build$ tsc -p tsconfig.build.json
backend/domains/est/crash build$ tsc -p tsconfig.build.json
backend/domains/inf/normative build$ tsc -p tsconfig.build.json
backend/domains/ops/parameter build$ tsc -p tsconfig.build.json
backend/domains/ch/clinical-network build: Done
backend/domains/ops/core build$ tsc -p tsconfig.build.json
backend/domains/ops/parameter build: Done
backend/domains/inf/rait-integration build$ tsc -p tsconfig.build.json
backend/domains/est/crash build: Done
.../domains/integration/renaest-mirror build$ tsc -p tsconfig.build.json
backend/domains/inf/normative build: Done
backend/domains/ops/agency build$ tsc -p tsconfig.build.json
backend/domains/ops/core build: Done
backend/domains/portal/identity build$ tsc -p tsconfig.build.json
backend/domains/inf/rait-integration build: Done
backend/domains/portal/complaints build$ tsc -p tsconfig.build.json
.../domains/integration/renaest-mirror build: Done
backend/domains/ops/agency build: Done
backend/domains/portal/complaints build: Done
backend/domains/portal/identity build: Done
backend/domains/ch/patients build$ tsc -p tsconfig.build.json
backend/domains/dashboard/crashes build$ tsc -p tsconfig.build.json
backend/domains/inf/ait build$ tsc -p tsconfig.build.json
backend/domains/ch/operational-controls build$ tsc -p tsconfig.build.json
backend/domains/ch/operational-controls build: Done
backend/domains/ch/patients build: Done
backend/domains/ops/evidence build$ tsc -p tsconfig.build.json
backend/domains/ops/field build$ tsc -p tsconfig.build.json
backend/domains/dashboard/crashes build: Done
backend/domains/ops/offline-sync build$ tsc -p tsconfig.build.json
backend/domains/inf/ait build: Done
backend/domains/ops/snapshots build$ tsc -p tsconfig.build.json
backend/domains/ops/evidence build: Done
backend/domains/portal/requests build$ tsc -p tsconfig.build.json
backend/domains/ops/field build: Done
backend/domains/portal/projections build$ tsc -p tsconfig.build.json
backend/domains/ops/offline-sync build: Done
backend/domains/ops/snapshots build: Done
backend/domains/portal/requests build: Done
backend/domains/portal/projections build: Done
backend/domains/dashboard/monitor build$ tsc -p tsconfig.build.json
backend/domains/ch/encounters build$ tsc -p tsconfig.build.json
backend/domains/inf/measures build$ tsc -p tsconfig.build.json
backend/domains/ch/toxicology build$ tsc -p tsconfig.build.json
backend/domains/ch/toxicology build: Done
backend/domains/inf/infraction build$ tsc -p tsconfig.build.json
backend/domains/ch/encounters build: Done
backend/domains/inf/speed build$ tsc -p tsconfig.build.json
backend/domains/inf/measures build: Done
backend/domains/ops/provisioning build$ tsc -p tsconfig.build.json
backend/domains/dashboard/monitor build: Done
backend/domains/portal/citizen-service build$ tsc -p tsconfig.build.json
backend/domains/inf/speed build: Done
backend/domains/portal/inbox build$ tsc -p tsconfig.build.json
backend/domains/inf/infraction build: Done
backend/domains/ops/provisioning build: Done
backend/domains/portal/citizen-service build: Done
backend/domains/portal/inbox build: Done
backend/domains/ch/process-blocks build$ tsc -p tsconfig.build.json
backend/domains/ch/biometrics build$ tsc -p tsconfig.build.json
backend/domains/ch/telehealth build$ tsc -p tsconfig.build.json
backend/domains/ch/exams build$ tsc -p tsconfig.build.json
backend/domains/ch/process-blocks build: Done
backend/domains/ch/inconsistencies build$ tsc -p tsconfig.build.json
backend/domains/ch/exams build: Done
backend/domains/ch/biometrics build: Done
backend/domains/ch/scheduling build$ tsc -p tsconfig.build.json
backend/domains/inf/alcohol build$ tsc -p tsconfig.build.json
backend/domains/ch/telehealth build: Done
backend/domains/inf/collection build$ tsc -p tsconfig.build.json
backend/domains/ch/inconsistencies build: Done
backend/domains/inf/notification build$ tsc -p tsconfig.build.json
backend/domains/ch/scheduling build: Done
backend/domains/inf/alcohol build: Done
backend/domains/inf/collection build: Done
backend/domains/inf/notification build: Done
backend/domains/inf/rait-case build$ tsc -p tsconfig.build.json
backend/domains/ch/clinical-controls build$ tsc -p tsconfig.build.json
backend/domains/ch/billing build$ tsc -p tsconfig.build.json
backend/domains/ch/clinical-reports build$ tsc -p tsconfig.build.json
backend/domains/ch/clinical-controls build: Done
backend/domains/ch/billing build: Done
backend/domains/ch/clinical-reports build: Done
backend/domains/inf/rait-case build: Done
backend/domains/ch/restrictions build$ tsc -p tsconfig.build.json
backend/domains/ch/juntas build$ tsc -p tsconfig.build.json
backend/domains/ch/retention build$ tsc -p tsconfig.build.json
backend/domains/inf/rait-worklist build$ tsc -p tsconfig.build.json
backend/domains/ch/retention build: Done
backend/domains/ch/juntas build: Done
backend/domains/ch/restrictions build: Done
backend/domains/inf/rait-worklist build: Done
backend/domains/inf/rait-session build$ tsc -p tsconfig.build.json
backend/domains/inf/rait-org build$ tsc -p tsconfig.build.json
backend/domains/inf/rait-org build: Done
backend/domains/inf/rait-session build: Done
backend/app build$ tsc -p tsconfig.build.json
backend/app build: Done
detran-stack: starting SEFAZ mock on http://127.0.0.1:3999
detran-stack: starting SENATRAN mock
 Image senatran-mock-app:ci Building 
#1 [internal] load local bake definitions
#1 reading from stdin 590B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 1.38kB done
#2 DONE 0.0s

#3 resolve image config for docker-image://docker.io/docker/dockerfile:1
#3 DONE 0.8s

#4 docker-image://docker.io/docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32
#4 resolve docker.io/docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32 0.0s done
#4 CACHED

#5 [internal] load metadata for docker.io/library/node:24-slim
#5 DONE 0.7s

#6 [internal] load .dockerignore
#6 transferring context: 316B done
#6 DONE 0.0s

#7 [builder  1/10] FROM docker.io/library/node:24-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6
#7 resolve docker.io/library/node:24-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 0.0s done
#7 DONE 0.0s

#8 [internal] load build context
#8 transferring context: 7.20kB 0.0s done
#8 DONE 0.0s

#9 [runtime 4/5] COPY --from=builder /app/dist ./dist
#9 CACHED

#10 [runtime 3/5] COPY --from=builder /app/node_modules ./node_modules
#10 CACHED

#11 [builder  2/10] WORKDIR /app
#11 CACHED

#12 [builder  9/10] RUN pnpm build
#12 CACHED

#13 [builder  8/10] COPY domain ./domain
#13 CACHED

#14 [builder  6/10] COPY tsconfig.json tsconfig.build.json ./
#14 CACHED

#15 [builder  4/10] COPY package.json pnpm-lock.yaml ./
#15 CACHED

#16 [builder 10/10] RUN pnpm prune --prod
#16 CACHED

#17 [builder  5/10] RUN pnpm install --frozen-lockfile
#17 CACHED

#18 [builder  3/10] RUN corepack enable
#18 CACHED

#19 [builder  7/10] COPY apps ./apps
#19 CACHED

#20 [runtime 5/5] COPY package.json ./
#20 CACHED

#21 exporting to image
#21 exporting layers done
#21 exporting manifest sha256:5e42e7947fb098e38295197e8601c53ca3f56da503055e135e985e58c2f826be done
#21 exporting config sha256:abcde6e0860ef69560d8654c81ebc8d50ffdb79533e57b4507646a4173a5aac8 done
#21 exporting attestation manifest sha256:5dd8e0736d3a02a73a71da90e883f2fd8a6f4fca79560c00e7f007cc6e6c0d84 done
#21 exporting manifest list sha256:7863714feda1bf9603b52e375bd6261cd085974a24645db5b369e7556f409fba done
#21 naming to docker.io/library/senatran-mock-app:ci done
#21 unpacking to docker.io/library/senatran-mock-app:ci done
#21 DONE 0.1s

#22 resolving provenance for metadata file
#22 DONE 0.0s
 Image senatran-mock-app:ci Built 
 Network detran-senatran-mock_default Creating 
 Network detran-senatran-mock_default Creating 
 Network detran-senatran-mock_default Created 
 Network detran-senatran-mock_default Created 
 Container detran-senatran-mock-db-1 Creating 
 Container detran-senatran-mock-db-1 Created 
 Container detran-senatran-mock-migrate-1 Creating 
 Container detran-senatran-mock-migrate-1 Created 
 Container detran-senatran-mock-app-1 Creating 
 Container detran-senatran-mock-app-1 Created 
 Container detran-senatran-mock-db-1 Starting 
 Container detran-senatran-mock-db-1 Started 
 Container detran-senatran-mock-db-1 Waiting 
 Container detran-senatran-mock-db-1 Healthy 
 Container detran-senatran-mock-migrate-1 Starting 
 Container detran-senatran-mock-migrate-1 Started 
 Container detran-senatran-mock-db-1 Waiting 
 Container detran-senatran-mock-migrate-1 Waiting 
 Container detran-senatran-mock-db-1 Healthy 
 Container detran-senatran-mock-migrate-1 Exited 
 Container detran-senatran-mock-app-1 Starting 
 Container detran-senatran-mock-app-1 Started 
 Container detran-senatran-mock-migrate-1 Waiting 
 Container detran-senatran-mock-app-1 Waiting 
 Container detran-senatran-mock-db-1 Waiting 
 Container detran-senatran-mock-db-1 Healthy 
 Container detran-senatran-mock-migrate-1 Exited 
 Container detran-senatran-mock-app-1 Healthy 
detran-stack: starting backend on http://127.0.0.1:3001
detran-stack: starting portal frontend on http://127.0.0.1:4200
detran-stack: starting rait frontend on http://127.0.0.1:4201
detran-stack: starting dashboard frontend on http://127.0.0.1:4202
detran-stack: starting teat frontend on http://127.0.0.1:4203
detran-stack: all active services are healthy
detran-stack: stack started; run 'tools/detran-stack.sh status' for URLs and health

===== start exit=0 =====

===== health =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:health /Users/aarusso/.codex/worktrees/local-stack/detran
> bash tools/detran-stack.sh health

detran-stack: all active services are healthy

===== health exit=0 =====

===== smoke =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:smoke /Users/aarusso/.codex/worktrees/local-stack/detran
> node tools/stack/smoke.mjs


===== smoke exit=0 =====

===== stop =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:stop /Users/aarusso/.codex/worktrees/local-stack/detran
> bash tools/detran-stack.sh stop

detran-stack: stopping PostGIS container detran-local-stack-postgres
detran-stack: stack stopped; volumes preserved

===== stop exit=0 =====

===== negative smoke =====
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}
 WARN  Issue while reading "/Users/aarusso/.codex/worktrees/local-stack/detran/.npmrc". Failed to replace env in config: ${NODE_AUTH_TOKEN}

> detran@0.0.1 stack:smoke /Users/aarusso/.codex/worktrees/local-stack/detran
> node tools/stack/smoke.mjs

 ELIFECYCLE  Command failed with exit code 1.

===== negative smoke exit=1 =====
```
