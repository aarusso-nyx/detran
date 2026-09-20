-- CTG-0001-C4-OD V3. Reviewed preparation only; execute after DDL20.
-- The writer is an operational non-owner under FORCE RLS. No app membership.
DO $roles$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'role_rait_priority_writer') THEN
    CREATE ROLE role_rait_priority_writer NOLOGIN NOSUPERUSER NOBYPASSRLS
      NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'role_rait_priority_writer'
    AND (rolcanlogin OR rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication))
    OR EXISTS (SELECT FROM pg_auth_members WHERE roleid = 'role_rait_priority_writer'::regrole
      OR member = 'role_rait_priority_writer'::regrole) THEN
    RAISE EXCEPTION 'Incompatible priority writer role; no role alteration is permitted';
  END IF;
  EXECUTE format('GRANT TEMPORARY ON DATABASE %I TO role_rait_priority_writer', current_database());
END
$roles$;

REVOKE ALL ON inf.rait_priority_assessment, inf.rait_priority_basis FROM PUBLIC, role_app_backend;
GRANT SELECT ON inf.rait_priority_assessment, inf.rait_priority_basis TO role_app_backend;
GRANT USAGE ON SCHEMA inf, auth, ops TO role_rait_priority_writer;
GRANT SELECT ON inf.rait_case, inf.rait_document, inf.rait_pool, inf.rait_pool_member,
  inf.ait_ait, auth.tenants, ops.parameter TO role_rait_priority_writer;
GRANT UPDATE (legal_priority) ON inf.rait_case TO role_rait_priority_writer;
GRANT SELECT, INSERT ON inf.rait_priority_assessment, inf.rait_priority_basis TO role_rait_priority_writer;
REVOKE UPDATE, DELETE, TRUNCATE ON inf.rait_priority_assessment, inf.rait_priority_basis FROM role_rait_priority_writer;
GRANT EXECUTE ON FUNCTION auth.current_tenant() TO role_rait_priority_writer;

CREATE OR REPLACE FUNCTION inf.rait_priority_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, inf AS $body$
BEGIN
  RAISE EXCEPTION 'Priority history is immutable' USING ERRCODE = '42501';
END
$body$;

CREATE OR REPLACE FUNCTION inf.rait_priority_case_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, inf AS $body$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.legal_priority IS NOT NULL THEN
      RAISE EXCEPTION 'Initial priority must be recorded by the qualification function' USING ERRCODE = '42501';
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.protocolled_at IS DISTINCT FROM OLD.protocolled_at THEN
      RAISE EXCEPTION 'Protocol chronology and case identity are immutable' USING ERRCODE = '42501';
    END IF;
    IF NEW.legal_priority IS DISTINCT FROM OLD.legal_priority AND current_user <> 'role_rait_priority_writer' THEN
      RAISE EXCEPTION 'Direct priority projection write forbidden' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END
$body$;

-- The insertion event, not xmin or caller-set GUCs, records transaction provenance.
-- A writer-owned session-local marker is emptied at commit. The app cannot write,
-- replace or pre-create a usable marker: ownership is checked before every use.
CREATE OR REPLACE FUNCTION inf.rait_priority_mark_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, inf AS $body$
DECLARE marker oid;
BEGIN
  marker := to_regclass('pg_temp.rait_priority_new_cases');
  IF marker IS NULL THEN
    CREATE TEMPORARY TABLE rait_priority_new_cases (
      tenant_id uuid NOT NULL, case_id uuid NOT NULL,
      PRIMARY KEY (tenant_id, case_id)
    ) ON COMMIT DELETE ROWS;
    REVOKE ALL ON pg_temp.rait_priority_new_cases FROM PUBLIC, role_app_backend;
    marker := to_regclass('pg_temp.rait_priority_new_cases');
  END IF;
  IF NOT EXISTS (SELECT FROM pg_class WHERE oid = marker
    AND relowner = 'role_rait_priority_writer'::regrole AND relpersistence = 't') THEN
    RAISE EXCEPTION 'Untrusted insertion marker' USING ERRCODE = '42501';
  END IF;
  INSERT INTO pg_temp.rait_priority_new_cases VALUES (NEW.tenant_id, NEW.id);
  RETURN NEW;
END
$body$;
ALTER FUNCTION inf.rait_priority_mark_insert() OWNER TO role_rait_priority_writer;

CREATE OR REPLACE FUNCTION inf.rait_priority_document_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, inf AS $body$
BEGIN
  IF EXISTS (SELECT FROM inf.rait_priority_basis b WHERE b.tenant_id = OLD.tenant_id AND b.document_id = OLD.id)
    AND (TG_OP = 'DELETE' OR NEW.id IS DISTINCT FROM OLD.id
      OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR NEW.case_id IS DISTINCT FROM OLD.case_id
      OR NEW.content_hash IS DISTINCT FROM OLD.content_hash OR NEW.storage_key IS DISTINCT FROM OLD.storage_key) THEN
    RAISE EXCEPTION 'Referenced priority evidence is immutable' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$body$;
ALTER FUNCTION inf.rait_priority_document_guard() OWNER TO role_rait_priority_writer;

CREATE OR REPLACE FUNCTION inf.rait_priority_consistency()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, inf AS $body$
DECLARE target_id uuid; target_tenant uuid; a inf.rait_priority_assessment%ROWTYPE;
  projection text; n integer; max_rank integer;
BEGIN
  target_tenant := NEW.tenant_id;
  IF TG_TABLE_NAME = 'rait_case' THEN target_id := NEW.id; ELSE target_id := NEW.case_id; END IF;
  SELECT * INTO STRICT a FROM inf.rait_priority_assessment
    WHERE tenant_id = target_tenant AND case_id = target_id AND revision = 1;
  IF a.policy_snapshot IS DISTINCT FROM '{"schemaVersion":1,"policyCode":"ADR-0024-2026-09-16","basisRanks":{"pcd":2,"age_80_plus":2,"age_60_plus":1},"noneRank":0,"postProtocolRevision":"forbidden"}'::jsonb
    OR a.qualification_on IS DISTINCT FROM (a.assessed_at AT TIME ZONE a.timezone)::date
    OR EXISTS (SELECT FROM inf.rait_priority_assessment WHERE tenant_id = target_tenant AND case_id = target_id AND revision <> 1) THEN
    RAISE EXCEPTION 'Invalid qualification policy or revision' USING ERRCODE = '23514';
  END IF;
  SELECT count(*), coalesce(max(CASE basis_code WHEN 'pcd' THEN 2 WHEN 'age_80_plus' THEN 2 ELSE 1 END),0)
    INTO n, max_rank FROM inf.rait_priority_basis WHERE tenant_id = target_tenant AND assessment_id = a.id;
  IF (a.outcome = 'none') IS DISTINCT FROM (n = 0) THEN
    RAISE EXCEPTION 'Priority outcome differs from evidence' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (SELECT FROM inf.rait_priority_basis b WHERE b.tenant_id = target_tenant AND b.assessment_id = a.id
      AND (b.verified_by <> a.assessed_by OR b.verified_at <> a.assessed_at
        OR (b.basis_code <> 'pcd' AND (b.birth_date > a.qualification_on OR
          extract(year FROM age(a.qualification_on, b.birth_date)) < CASE b.basis_code WHEN 'age_80_plus' THEN 80 ELSE 60 END))
        OR (b.document_id IS NOT NULL AND NOT EXISTS (SELECT FROM inf.rait_document d
          WHERE d.tenant_id = b.tenant_id AND d.case_id = b.case_id AND d.id = b.document_id
            AND (b.evidence_hash IS NULL OR d.content_hash = b.evidence_hash))))) THEN
    RAISE EXCEPTION 'Invalid priority evidence' USING ERRCODE = '23514';
  END IF;
  SELECT legal_priority INTO STRICT projection FROM inf.rait_case WHERE tenant_id = target_tenant AND id = target_id;
  IF projection IS DISTINCT FROM (CASE max_rank WHEN 2 THEN 'level_2' WHEN 1 THEN 'level_1' ELSE 'none' END) THEN
    RAISE EXCEPTION 'Priority projection mismatch' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$body$;
ALTER FUNCTION inf.rait_priority_consistency() OWNER TO role_rait_priority_writer;

CREATE OR REPLACE FUNCTION inf.rait_record_initial_priority(
  p_case_id uuid, p_actor_id uuid, p_assessed_at timestamptz, p_proofs jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, inf AS $body$
DECLARE t uuid := auth.current_tenant(); c inf.rait_case%ROWTYPE; tz text;
  day_on date; policy ops.parameter%ROWTYPE; agency uuid; proof jsonb;
  assessment uuid := gen_random_uuid(); marker oid; affected integer;
  birth date; document uuid; rank integer := 0; proof_rank integer;
BEGIN
  IF t IS NULL OR p_actor_id IS NULL OR p_assessed_at IS NULL OR NOT isfinite(p_assessed_at)
    OR jsonb_typeof(p_proofs) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Qualification context or proofs missing' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO STRICT c FROM inf.rait_case WHERE tenant_id = t AND id = p_case_id FOR UPDATE;
  marker := to_regclass('pg_temp.rait_priority_new_cases');
  IF marker IS NULL OR NOT EXISTS (SELECT FROM pg_class WHERE oid = marker
    AND relowner = 'role_rait_priority_writer'::regrole AND relpersistence = 't') THEN
    RAISE EXCEPTION 'Only an insertion event in this transaction may be qualified' USING ERRCODE = '42501';
  END IF;
  DELETE FROM pg_temp.rait_priority_new_cases WHERE tenant_id = t AND case_id = p_case_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 OR EXISTS (SELECT FROM inf.rait_priority_assessment WHERE tenant_id = t AND case_id = p_case_id) THEN
    RAISE EXCEPTION 'Initial qualification only; revision forbidden' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT FROM inf.rait_pool_member m JOIN inf.rait_pool p ON p.id = m.pool_id AND p.tenant_id = m.tenant_id
    WHERE m.tenant_id = t AND m.person_id = p_actor_id AND m.member_role = 'secretaria' AND m.status = 'ATIVO'
      AND p.active AND p.instance = c.instance AND p.unit_id IS NOT DISTINCT FROM c.unit_id) THEN
    RAISE EXCEPTION 'Secretary membership required' USING ERRCODE = '42501';
  END IF;
  SELECT timezone INTO STRICT tz FROM auth.tenants WHERE id = t;
  IF tz IS NULL OR btrim(tz) = '' OR NOT EXISTS (SELECT FROM pg_timezone_names WHERE name = tz) THEN
    RAISE EXCEPTION 'Tenant timezone missing or invalid' USING ERRCODE = '22023';
  END IF;
  day_on := (p_assessed_at AT TIME ZONE tz)::date;
  SELECT traffic_agency_id INTO STRICT agency FROM inf.ait_ait WHERE id = c.ait_id AND tenant_id = t;
  SELECT * INTO STRICT policy FROM ops.parameter WHERE tenant_id = t AND key = 'rait.priority.legal_bases'
    AND surface = 'rait' AND (traffic_agency_id IS NULL OR traffic_agency_id = agency)
    AND effective_from <= day_on AND (effective_to IS NULL OR effective_to >= day_on);
  IF policy.status <> 'vigente' OR policy.source_pending OR policy.value_type <> 'json'
    OR policy.value_json IS DISTINCT FROM '{"schemaVersion":1,"policyCode":"ADR-0024-2026-09-16","basisRanks":{"pcd":2,"age_80_plus":2,"age_60_plus":1},"noneRank":0,"postProtocolRevision":"forbidden"}'::jsonb THEN
    RAISE EXCEPTION 'Priority policy is not recognized or ready' USING ERRCODE = '22023';
  END IF;
  INSERT INTO inf.rait_priority_assessment(id,tenant_id,case_id,revision,outcome,assessed_at,assessed_by,
    qualification_on,timezone,policy_parameter_id,policy_version,policy_snapshot)
    VALUES(assessment,t,p_case_id,1,CASE WHEN jsonb_array_length(p_proofs)=0 THEN 'none' ELSE 'priority' END,
      p_assessed_at,p_actor_id,day_on,tz,policy.id,policy.version,policy.value_json);
  FOR proof IN SELECT value FROM jsonb_array_elements(p_proofs) LOOP
    IF jsonb_typeof(proof) <> 'object' OR NOT (proof ?& ARRAY['basis_code','source_kind','source_ref'])
      OR EXISTS (SELECT FROM jsonb_object_keys(proof) k WHERE k NOT IN ('basis_code','source_kind','source_ref','document_id','birth_date','evidence_hash'))
      OR jsonb_typeof(proof->'basis_code') IS DISTINCT FROM 'string'
      OR jsonb_typeof(proof->'source_kind') IS DISTINCT FROM 'string'
      OR jsonb_typeof(proof->'source_ref') IS DISTINCT FROM 'string'
      OR btrim(proof->>'source_ref') = '' THEN
      RAISE EXCEPTION 'Malformed priority proof' USING ERRCODE = '22023';
    END IF;
    birth := (proof->>'birth_date')::date; document := (proof->>'document_id')::uuid;
    IF proof->>'basis_code' NOT IN ('pcd','age_60_plus','age_80_plus')
      OR proof->>'source_kind' NOT IN ('attached_document','presented_document','presented_cnh') THEN
      RAISE EXCEPTION 'Unknown priority evidence vocabulary' USING ERRCODE = '22023';
    END IF;
    IF proof->>'basis_code' = 'pcd' THEN
      IF proof->>'source_kind' <> 'attached_document' OR document IS NULL
        OR coalesce(btrim(proof->>'evidence_hash'),'') = '' THEN
        RAISE EXCEPTION 'PCD requires a verified attachment' USING ERRCODE = '22023';
      END IF;
      proof_rank := 2;
    ELSE
      IF birth IS NULL OR NOT isfinite(birth) OR birth > day_on
        OR extract(year FROM age(day_on,birth)) < (CASE proof->>'basis_code' WHEN 'age_80_plus' THEN 80 ELSE 60 END) THEN
        RAISE EXCEPTION 'Age proof does not establish the claimed basis' USING ERRCODE = '22023';
      END IF;
      proof_rank := CASE proof->>'basis_code' WHEN 'age_80_plus' THEN 2 ELSE 1 END;
    END IF;
    IF document IS NOT NULL AND NOT EXISTS (SELECT FROM inf.rait_document d WHERE d.tenant_id = t
      AND d.case_id = p_case_id AND d.id = document AND (proof->>'evidence_hash' IS NULL OR d.content_hash = proof->>'evidence_hash')) THEN
      RAISE EXCEPTION 'Evidence document or hash mismatch' USING ERRCODE = '23514';
    END IF;
    INSERT INTO inf.rait_priority_basis(tenant_id,case_id,assessment_id,basis_code,verified_at,verified_by,
      source_kind,source_ref,document_id,birth_date,evidence_hash)
      VALUES(t,p_case_id,assessment,proof->>'basis_code',p_assessed_at,p_actor_id,
        proof->>'source_kind',proof->>'source_ref',document,birth,proof->>'evidence_hash');
    rank := greatest(rank,proof_rank);
  END LOOP;
  UPDATE inf.rait_case SET legal_priority = CASE rank WHEN 2 THEN 'level_2' WHEN 1 THEN 'level_1' ELSE 'none' END
    WHERE tenant_id = t AND id = p_case_id;
  RETURN assessment;
END
$body$;
ALTER FUNCTION inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb) OWNER TO role_rait_priority_writer;
REVOKE ALL ON FUNCTION inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb) TO role_app_backend;

REVOKE ALL ON FUNCTION inf.rait_priority_immutable(), inf.rait_priority_case_guard(),
  inf.rait_priority_mark_insert(), inf.rait_priority_document_guard(), inf.rait_priority_consistency() FROM PUBLIC, role_app_backend;

DROP TRIGGER IF EXISTS rait_priority_case_guard ON inf.rait_case;
CREATE TRIGGER rait_priority_case_guard BEFORE INSERT OR UPDATE ON inf.rait_case
  FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_case_guard();
DROP TRIGGER IF EXISTS rait_priority_mark_insert ON inf.rait_case;
CREATE TRIGGER rait_priority_mark_insert AFTER INSERT ON inf.rait_case
  FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_mark_insert();
DROP TRIGGER IF EXISTS rait_priority_case_complete ON inf.rait_case;
CREATE CONSTRAINT TRIGGER rait_priority_case_complete AFTER INSERT ON inf.rait_case
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_consistency();
DROP TRIGGER IF EXISTS rait_priority_document_guard ON inf.rait_document;
CREATE TRIGGER rait_priority_document_guard BEFORE UPDATE OR DELETE ON inf.rait_document
  FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_document_guard();

DO $triggers$
DECLARE relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['rait_priority_assessment','rait_priority_basis'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS rait_priority_immutable ON inf.%I',relation);
    EXECUTE format('CREATE TRIGGER rait_priority_immutable BEFORE UPDATE OR DELETE ON inf.%I FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_immutable()',relation);
    EXECUTE format('DROP TRIGGER IF EXISTS rait_priority_no_truncate ON inf.%I',relation);
    EXECUTE format('CREATE TRIGGER rait_priority_no_truncate BEFORE TRUNCATE ON inf.%I FOR EACH STATEMENT EXECUTE FUNCTION inf.rait_priority_immutable()',relation);
    EXECUTE format('DROP TRIGGER IF EXISTS rait_priority_complete ON inf.%I',relation);
    EXECUTE format('CREATE CONSTRAINT TRIGGER rait_priority_complete AFTER INSERT ON inf.%I DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inf.rait_priority_consistency()',relation);
  END LOOP;
END
$triggers$;
