-- CTG-0001-C4-OD V3. Pre-DDL34 additive migration; no factual backfill.
-- Existing legacy values (including unknown legal_priority) are never rewritten.
DO $pre$
DECLARE expected jsonb; col jsonb; relation regclass; actual record; allowed boolean;
BEGIN
  -- Stable lock order. These locks remain held through DDL20/enforce/verify/commit.
  FOR expected IN SELECT value FROM jsonb_array_elements('[{"table":"rait_case","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"ait_id","type":"uuid","notnull":true},{"name":"origin_case_id","type":"uuid","notnull":false},{"name":"protocol_number","type":"varchar(40)","notnull":true},{"name":"instance","type":"varchar(20)","notnull":true},{"name":"circuit","type":"integer","notnull":true},{"name":"state","type":"varchar(40)","notnull":true},{"name":"intake_channel","type":"varchar(30)","notnull":true},{"name":"protocolled_at","type":"timestamptz","notnull":true},{"name":"admitted_at","type":"timestamptz","notnull":false},{"name":"judge_body_received_at","type":"timestamptz","notnull":false},{"name":"judge_body_received_on","type":"date","notnull":false},{"name":"cetran_received_at","type":"timestamptz","notnull":false},{"name":"cetran_received_on","type":"date","notnull":false},{"name":"remitted_at","type":"timestamptz","notnull":false},{"name":"decided_at","type":"timestamptz","notnull":false},{"name":"communicated_at","type":"timestamptz","notnull":false},{"name":"closed_at","type":"timestamptz","notnull":false},{"name":"suspensive_effect","type":"boolean","notnull":true},{"name":"archived","type":"boolean","notnull":true},{"name":"non_admission_reason","type":"varchar(40)","notnull":false},{"name":"withdrawal_document_id","type":"uuid","notnull":false},{"name":"last_movement_at","type":"timestamptz","notnull":true},{"name":"pending_completion","type":"boolean","notnull":true},{"name":"legal_priority","type":"varchar(30)","notnull":false},{"name":"unit_id","type":"uuid","notnull":false},{"name":"agency_jurisdiction_id","type":"uuid","notnull":false},{"name":"version","type":"integer","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_party","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"role","type":"varchar(30)","notnull":true},{"name":"legitimacy_basis","type":"varchar(40)","notnull":false},{"name":"person_name","type":"varchar(200)","notnull":true},{"name":"document_number","type":"varchar(30)","notnull":true},{"name":"contact_email","type":"varchar(200)","notnull":false},{"name":"representation_kind","type":"varchar(60)","notnull":false},{"name":"representation_verified","type":"boolean","notnull":true},{"name":"representation_document_id","type":"uuid","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_document","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"kind","type":"varchar(60)","notnull":true},{"name":"origin","type":"varchar(20)","notnull":true},{"name":"storage_key","type":"text","notnull":true},{"name":"filename","type":"varchar(255)","notnull":true},{"name":"content_hash","type":"varchar(128)","notnull":true},{"name":"digitised_from_paper","type":"boolean","notnull":true},{"name":"attached_at","type":"timestamptz","notnull":true},{"name":"attached_by","type":"uuid","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_priority_assessment","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"revision","type":"integer","notnull":true},{"name":"outcome","type":"varchar(20)","notnull":true},{"name":"assessed_at","type":"timestamptz","notnull":true},{"name":"assessed_by","type":"uuid","notnull":true},{"name":"qualification_on","type":"date","notnull":true},{"name":"timezone","type":"text","notnull":true},{"name":"policy_parameter_id","type":"uuid","notnull":true},{"name":"policy_version","type":"integer","notnull":true},{"name":"policy_snapshot","type":"jsonb","notnull":true},{"name":"reason","type":"text","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_priority_basis","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"assessment_id","type":"uuid","notnull":true},{"name":"basis_code","type":"varchar(30)","notnull":true},{"name":"verified_at","type":"timestamptz","notnull":true},{"name":"verified_by","type":"uuid","notnull":true},{"name":"source_kind","type":"varchar(30)","notnull":true},{"name":"source_ref","type":"text","notnull":true},{"name":"document_id","type":"uuid","notnull":false},{"name":"birth_date","type":"date","notnull":false},{"name":"evidence_hash","type":"varchar(128)","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_pending_content","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"missing_items","type":"jsonb","notnull":true},{"name":"due_on","type":"date","notnull":true},{"name":"opened_at","type":"timestamptz","notnull":true},{"name":"opened_by","type":"uuid","notnull":true},{"name":"closed_at","type":"timestamptz","notnull":false},{"name":"outcome","type":"varchar(20)","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_redirect","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":false},{"name":"direction","type":"varchar(10)","notnull":true},{"name":"reason","type":"varchar(30)","notnull":true},{"name":"protocol_number","type":"varchar(40)","notnull":true},{"name":"ait_number","type":"varchar(40)","notnull":false},{"name":"counterpart_agency","type":"varchar(120)","notnull":true},{"name":"counterpart_renainf_code","type":"varchar(20)","notnull":false},{"name":"origin_protocolled_on","type":"date","notnull":false},{"name":"deadline_restored","type":"boolean","notnull":true},{"name":"receipt_document_id","type":"uuid","notnull":false},{"name":"redirected_at","type":"timestamptz","notnull":true},{"name":"redirected_by","type":"uuid","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_admissibility","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"criterion","type":"varchar(30)","notnull":true},{"name":"verdict","type":"boolean","notnull":true},{"name":"reason","type":"text","notnull":false},{"name":"evaluated_at","type":"timestamptz","notnull":true},{"name":"evaluated_by","type":"uuid","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_deadline","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"timer_code","type":"varchar(20)","notnull":true},{"name":"start_basis","type":"varchar(60)","notnull":true},{"name":"started_on","type":"date","notnull":true},{"name":"raw_due_on","type":"date","notnull":true},{"name":"due_on","type":"date","notnull":true},{"name":"business_days","type":"boolean","notnull":true},{"name":"extension_count","type":"integer","notnull":true},{"name":"satisfied_at","type":"timestamptz","notnull":false},{"name":"suspended_by_act_id","type":"uuid","notnull":false},{"name":"legal_basis","type":"varchar(160)","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_inquiry","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"addressee","type":"varchar(20)","notnull":true},{"name":"subject","type":"text","notnull":true},{"name":"requested_at","type":"timestamptz","notnull":true},{"name":"requested_by","type":"uuid","notnull":true},{"name":"due_on","type":"date","notnull":true},{"name":"extension_count","type":"integer","notnull":true},{"name":"answered_at","type":"timestamptz","notnull":false},{"name":"answered_on","type":"date","notnull":false},{"name":"outcome","type":"varchar(20)","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_inquiry_document","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"inquiry_id","type":"uuid","notnull":true},{"name":"document_id","type":"uuid","notnull":true},{"name":"attached_at","type":"timestamptz","notnull":true},{"name":"attached_by","type":"uuid","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_pending_document","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"pending_id","type":"uuid","notnull":true},{"name":"document_id","type":"uuid","notnull":true},{"name":"attached_at","type":"timestamptz","notnull":true},{"name":"attached_by","type":"uuid","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_withdrawal_attestation","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"document_id","type":"uuid","notnull":true},{"name":"signer_party_id","type":"uuid","notnull":true},{"name":"verification_method","type":"varchar(30)","notnull":true},{"name":"evidence_ref","type":"text","notnull":true},{"name":"verified_at","type":"timestamptz","notnull":true},{"name":"recorded_by","type":"uuid","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_draft","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"version","type":"integer","notnull":true},{"name":"author_id","type":"uuid","notnull":true},{"name":"document_id","type":"uuid","notnull":false},{"name":"content_hash","type":"varchar(128)","notnull":true},{"name":"status","type":"varchar(20)","notnull":true},{"name":"submitted_at","type":"timestamptz","notnull":false},{"name":"returned_at","type":"timestamptz","notnull":false},{"name":"return_guidance","type":"text","notnull":false},{"name":"return_count","type":"integer","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_decision","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"circuit","type":"integer","notnull":true},{"name":"decision_kind","type":"varchar(30)","notnull":true},{"name":"grounds","type":"text","notnull":true},{"name":"decided_by","type":"uuid","notnull":true},{"name":"decided_at","type":"timestamptz","notnull":true},{"name":"session_id","type":"uuid","notnull":false},{"name":"signature_kind","type":"varchar(20)","notnull":false},{"name":"signature_ref","type":"text","notnull":false},{"name":"published_at","type":"timestamptz","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_communication","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"decision_id","type":"uuid","notnull":false},{"name":"channel","type":"varchar(30)","notnull":true},{"name":"sent_at","type":"timestamptz","notnull":true},{"name":"effective_on","type":"date","notnull":false},{"name":"next_deadline_on","type":"date","notnull":false},{"name":"authority_appeal_notice","type":"boolean","notnull":true},{"name":"enclosed_document_ids","type":"jsonb","notnull":false},{"name":"content_ref","type":"text","notnull":true},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]},{"table":"rait_case_event","columns":[{"name":"id","type":"uuid","notnull":true},{"name":"tenant_id","type":"uuid","notnull":true},{"name":"case_id","type":"uuid","notnull":true},{"name":"event_type","type":"varchar(60)","notnull":true},{"name":"from_state","type":"varchar(40)","notnull":false},{"name":"to_state","type":"varchar(40)","notnull":false},{"name":"occurred_at","type":"timestamptz","notnull":true},{"name":"actor_id","type":"uuid","notnull":false},{"name":"payload","type":"jsonb","notnull":false},{"name":"created_at","type":"timestamptz","notnull":true},{"name":"updated_at","type":"timestamptz","notnull":false}]}]'::jsonb) ORDER BY value->>'table' LOOP
    relation := to_regclass('inf.' || (expected->>'table'));
    IF relation IS NULL THEN CONTINUE; END IF;
    EXECUTE format('LOCK TABLE %s IN ACCESS EXCLUSIVE MODE',relation);
    IF NOT EXISTS (SELECT FROM pg_class WHERE oid=relation AND relkind='r'
      AND relowner='postgres'::regrole) THEN
      RAISE EXCEPTION 'Unknown relation shape or owner: %',relation;
    END IF;
    FOR col IN SELECT value FROM jsonb_array_elements(expected->'columns') LOOP
      SELECT format_type(atttypid,atttypmod) AS type, attnotnull AS notnull INTO actual
        FROM pg_attribute WHERE attrelid=relation AND attname=col->>'name'
          AND attnum>0 AND NOT attisdropped;
      IF NOT FOUND THEN
        allowed := (expected->>'table' = 'rait_case' AND col->>'name' IN
          ('agency_jurisdiction_id','judge_body_received_on','cetran_received_on'))
          OR (expected->>'table'='rait_inquiry' AND col->>'name'='answered_on');
        IF NOT allowed THEN RAISE EXCEPTION 'Unknown missing column %.%',relation,col->>'name'; END IF;
        EXECUTE format('ALTER TABLE %s ADD COLUMN %I %s',relation,col->>'name',col->>'type');
      ELSIF actual.type <> (CASE col->>'type' WHEN 'timestamptz' THEN 'timestamp with time zone'
          ELSE replace(col->>'type','varchar','character varying') END)
        OR actual.notnull IS DISTINCT FROM (col->>'notnull')::boolean THEN
        RAISE EXCEPTION 'Unexpected column definition %.%',relation,col->>'name';
      END IF;
    END LOOP;
    IF EXISTS (SELECT FROM pg_attribute a WHERE a.attrelid=relation AND a.attnum>0 AND NOT a.attisdropped
      AND NOT EXISTS (SELECT FROM jsonb_array_elements(expected->'columns') c WHERE c->>'name'=a.attname)) THEN
      RAISE EXCEPTION 'Unexpected extra column in %',relation;
    END IF;
  END LOOP;
  -- CREATE TABLE IF NOT EXISTS in DDL34 cannot install a newly introduced FK.
  -- Validate the additive legacy FK without repairing or deleting any data.
  relation := to_regclass('inf.rait_case');
  IF relation IS NOT NULL THEN
    SELECT pg_get_constraintdef(oid) AS definition INTO actual FROM pg_constraint
      WHERE conrelid=relation AND conname='fk_inf_rait_case_agency_jurisdiction';
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_case ADD CONSTRAINT fk_inf_rait_case_agency_jurisdiction
        FOREIGN KEY (agency_jurisdiction_id) REFERENCES ops.agency_jurisdiction(id);
    ELSIF actual.definition <> 'FOREIGN KEY (agency_jurisdiction_id) REFERENCES ops.agency_jurisdiction(id)' THEN
      RAISE EXCEPTION 'Unexpected agency jurisdiction FK definition';
    END IF;
  END IF;
END
$pre$;

-- DDL34/35 are CREATE TABLE IF NOT EXISTS: reconcile the historical relations
-- before the generator runs. NOT VALID preserves historical rows while PostgreSQL
-- still checks every subsequent INSERT and UPDATE against the new predicate.
DO $historical$
DECLARE r regclass; definition text; validated boolean; column_type text;
BEGIN
  r := to_regclass('inf.rait_pool_member');
  IF r IS NOT NULL THEN
    EXECUTE format('LOCK TABLE %s IN ACCESS EXCLUSIVE MODE', r);
    IF (SELECT relkind <> 'r' OR relowner <> 'postgres'::regrole FROM pg_class WHERE oid = r) THEN
      RAISE EXCEPTION 'Unknown historical pool member relation';
    END IF;
    SELECT format_type(atttypid, atttypmod) INTO column_type FROM pg_attribute
      WHERE attrelid = r AND attname = 'agency_jurisdiction_id' AND attnum > 0 AND NOT attisdropped;
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_pool_member ADD COLUMN agency_jurisdiction_id uuid;
    ELSIF column_type <> 'uuid' OR (SELECT attnotnull FROM pg_attribute
      WHERE attrelid = r AND attname = 'agency_jurisdiction_id') THEN
      RAISE EXCEPTION 'Unexpected pool member jurisdiction column';
    END IF;
    SELECT pg_get_constraintdef(oid), convalidated INTO definition, validated FROM pg_constraint
      WHERE conrelid = r AND conname = 'ck_inf_rait_pool_member_role';
    IF NOT FOUND OR definition NOT LIKE '%analista%' OR definition NOT LIKE '%secretaria%'
      OR (definition LIKE '%autoridade%' AND NOT validated) THEN
      RAISE EXCEPTION 'Unknown historical pool member role check';
    END IF;
    IF definition NOT LIKE '%autoridade%' THEN
      ALTER TABLE inf.rait_pool_member DROP CONSTRAINT ck_inf_rait_pool_member_role;
      ALTER TABLE inf.rait_pool_member ADD CONSTRAINT ck_inf_rait_pool_member_role
        CHECK (member_role IN ('analista','relator','presidente','coordenador','secretaria','autoridade'));
    END IF;
    SELECT pg_get_constraintdef(oid) INTO definition FROM pg_constraint
      WHERE conrelid = r AND conname = 'ck_inf_rait_pool_member_authority_jurisdiction';
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_pool_member ADD CONSTRAINT ck_inf_rait_pool_member_authority_jurisdiction
        CHECK (member_role <> 'autoridade' OR agency_jurisdiction_id IS NOT NULL);
    ELSIF definition NOT LIKE '%autoridade%' OR definition NOT LIKE '%agency_jurisdiction_id%' THEN
      RAISE EXCEPTION 'Unknown authority jurisdiction check';
    END IF;
    SELECT pg_get_constraintdef(oid) INTO definition FROM pg_constraint
      WHERE conrelid = r AND conname = 'fk_inf_rait_pool_member_agency_jurisdiction';
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_pool_member ADD CONSTRAINT fk_inf_rait_pool_member_agency_jurisdiction
        FOREIGN KEY (agency_jurisdiction_id) REFERENCES ops.agency_jurisdiction(id);
    ELSIF definition <> 'FOREIGN KEY (agency_jurisdiction_id) REFERENCES ops.agency_jurisdiction(id)' THEN
      RAISE EXCEPTION 'Unknown pool member jurisdiction FK';
    END IF;
  END IF;

  r := to_regclass('inf.rait_draft');
  IF r IS NOT NULL THEN
    EXECUTE format('LOCK TABLE %s IN ACCESS EXCLUSIVE MODE', r);
    SELECT pg_get_constraintdef(oid) INTO definition FROM pg_constraint
      WHERE conrelid = r AND conname = 'ck_inf_rait_draft_submitted_required';
    IF NOT FOUND OR definition NOT LIKE '%submitted_at%' OR definition NOT LIKE '%rascunho%' THEN
      RAISE EXCEPTION 'Unknown historical draft submitted check';
    END IF;
    IF definition NOT LIKE '%document_id%' THEN
      ALTER TABLE inf.rait_draft DROP CONSTRAINT ck_inf_rait_draft_submitted_required;
      ALTER TABLE inf.rait_draft ADD CONSTRAINT ck_inf_rait_draft_submitted_required
        CHECK (status = 'rascunho' OR (submitted_at IS NOT NULL AND document_id IS NOT NULL
          AND length(btrim(content_hash)) > 0)) NOT VALID;
    END IF;
  END IF;

  r := to_regclass('inf.rait_decision');
  IF r IS NOT NULL THEN
    EXECUTE format('LOCK TABLE %s IN ACCESS EXCLUSIVE MODE', r);
    SELECT pg_get_constraintdef(oid) INTO definition FROM pg_constraint
      WHERE conrelid = r AND conname = 'ck_inf_rait_decision_signature_pair';
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_decision ADD CONSTRAINT ck_inf_rait_decision_signature_pair
        CHECK ((signature_kind IS NULL) = (signature_ref IS NULL)) NOT VALID;
    ELSIF definition NOT LIKE '%signature_kind%' OR definition NOT LIKE '%signature_ref%' THEN
      RAISE EXCEPTION 'Unknown decision signature pair check';
    END IF;
    SELECT pg_get_constraintdef(oid) INTO definition FROM pg_constraint
      WHERE conrelid = r AND conname = 'ck_inf_rait_decision_circuit_one_signature';
    IF NOT FOUND THEN
      ALTER TABLE inf.rait_decision ADD CONSTRAINT ck_inf_rait_decision_circuit_one_signature
        CHECK (circuit <> 1 OR (signature_kind = 'PAdES-TSA' AND signature_ref IS NOT NULL)) NOT VALID;
    ELSIF definition NOT LIKE '%circuit%' OR definition NOT LIKE '%PAdES-TSA%'
      OR definition NOT LIKE '%signature_ref%' THEN
      RAISE EXCEPTION 'Unknown decision circuit-one signature check';
    END IF;
  END IF;
END
$historical$;
