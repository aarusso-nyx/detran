-- W2.3: TEAT field operations port. Cross-domain references deliberately remain
-- UUID values: their owning domains port later. All tenant isolation is applied
-- centrally in 20-rls-policies.sql by auth.create_rls_policy/install_tenant_triggers.

CREATE TABLE IF NOT EXISTS ops.ops_agent_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  traffic_agency_id uuid NOT NULL, user_ref uuid NOT NULL, operational_unit_id uuid,
  registration_number varchar(60) NOT NULL, credential_number varchar(80),
  functional_status varchar(40) NOT NULL DEFAULT 'active', credential_valid_until date,
  trained_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, traffic_agency_id, registration_number)
);
CREATE TABLE IF NOT EXISTS ops.ops_operational_device (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  traffic_agency_id uuid NOT NULL, hardware_identifier_hash varchar(128) NOT NULL,
  model varchar(120), manufacturer varchar(120), os_name varchar(40) NOT NULL,
  os_version varchar(80), status varchar(40) NOT NULL DEFAULT 'authorized', app_version varchar(80),
  last_seen_at timestamptz, last_location_json jsonb, tamper_flag boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  last_location_geom geometry(Point, 4674), UNIQUE (tenant_id, hardware_identifier_hash)
);
CREATE TABLE IF NOT EXISTS ops.ops_homologation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  traffic_agency_id uuid NOT NULL, homologation_number varchar(100) NOT NULL,
  scope text NOT NULL, issued_at date NOT NULL, valid_until date, document_uri text,
  status varchar(40) NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, traffic_agency_id, homologation_number)
);
CREATE TABLE IF NOT EXISTS ops.ops_application_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  app_type varchar(40) NOT NULL, version varchar(80) NOT NULL, build_number varchar(80),
  status varchar(40) NOT NULL DEFAULT 'allowed', homologation_id uuid, valid_from date NOT NULL,
  valid_to date, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, app_type, version)
);
CREATE TABLE IF NOT EXISTS ops.ops_device_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, device_id uuid NOT NULL,
  agent_id uuid, event_type varchar(80) NOT NULL, event_at timestamptz NOT NULL DEFAULT now(),
  location_json jsonb, details_json jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  location_geom geometry(Point, 4674)
);
CREATE TABLE IF NOT EXISTS ops.ops_operation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  name varchar(255) NOT NULL, operation_type varchar(80) NOT NULL, description text,
  planned_start_at timestamptz, planned_end_at timestamptz, status varchar(40) NOT NULL DEFAULT 'planned',
  objectives text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.ops_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  operational_unit_id uuid, name varchar(120) NOT NULL, supervisor_agent_id uuid,
  status varchar(40) NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, traffic_agency_id, name)
);
CREATE TABLE IF NOT EXISTS ops.ops_team_agent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, team_id uuid NOT NULL,
  agent_id uuid NOT NULL, role varchar(60) NOT NULL, valid_from date NOT NULL, valid_to date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, team_id, agent_id)
);
CREATE TABLE IF NOT EXISTS ops.ops_patrol_vehicle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  prefix varchar(60) NOT NULL, plate varchar(10) NOT NULL, vehicle_type varchar(60) NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, traffic_agency_id, prefix)
);
CREATE TABLE IF NOT EXISTS ops.ops_shift (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  agent_id uuid NOT NULL, device_id uuid NOT NULL, operational_unit_id uuid, team_id uuid, patrol_vehicle_id uuid,
  operation_id uuid, started_at timestamptz NOT NULL, ended_at timestamptz,
  start_location_json jsonb, end_location_json jsonb, status varchar(40) NOT NULL DEFAULT 'open',
  offline_periods_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  start_location_geom geometry(Point, 4674), end_location_geom geometry(Point, 4674)
);
CREATE TABLE IF NOT EXISTS ops.ops_approach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  shift_id uuid NOT NULL, operation_id uuid, agent_id uuid NOT NULL, approached_at timestamptz NOT NULL,
  location_json jsonb, approach_type varchar(60) NOT NULL, result varchar(80) NOT NULL, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz, location_geom geometry(Point, 4674)
);

-- Frozen external lookups are owned by ops while later inf/est modules consume IDs.
CREATE TABLE IF NOT EXISTS ops.snapshots_person (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, person_type varchar(40) NOT NULL,
  name varchar(255), cpf varchar(11), cnpj varchar(14), birth_date date, mother_name varchar(255),
  source varchar(60) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.snapshots_person_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, person_id uuid NOT NULL,
  document_type varchar(40) NOT NULL, document_number varchar(80) NOT NULL, issuing_uf varchar(2),
  valid_until date, license_category varchar(20), status varchar(60), source varchar(60) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.snapshots_vehicle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, plate varchar(10) NOT NULL,
  renavam varchar(20), chassis varchar(40), uf varchar(2), municipality_code varchar(20), make_model varchar(255),
  species varchar(80), category varchar(80), color varchar(60), source varchar(60) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.snapshots_external_query (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  user_ref uuid NOT NULL, agent_id uuid, device_id uuid, external_system_id uuid NOT NULL,
  query_type varchar(80) NOT NULL, parameters_hash varchar(128) NOT NULL, purpose varchar(80) NOT NULL,
  queried_at timestamptz NOT NULL DEFAULT now(), status varchar(40) NOT NULL, protocol varchar(120),
  result_summary text, result_snapshot_json jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.snapshots_vehicle_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, vehicle_id uuid,
  plate_snapshot varchar(10) NOT NULL, renavam_snapshot varchar(20), make_model_snapshot varchar(255),
  species_snapshot varchar(80), category_snapshot varchar(80), color_snapshot varchar(60), data_source varchar(80) NOT NULL,
  external_query_id uuid, divergence_recorded boolean NOT NULL DEFAULT false, payload_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS ops.evidence_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  evidence_type varchar(60) NOT NULL, origin varchar(60) NOT NULL, storage_uri text NOT NULL, mime_type varchar(120) NOT NULL,
  size_bytes bigint NOT NULL, hash_algorithm varchar(40) NOT NULL, hash_value varchar(128) NOT NULL,
  captured_by_user_ref uuid, agent_id uuid, device_id uuid, captured_at timestamptz NOT NULL, location_json jsonb,
  status varchar(60) NOT NULL DEFAULT 'captured', metadata_json jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  location_geom geometry(Point, 4674), UNIQUE (tenant_id, hash_value)
);
CREATE TABLE IF NOT EXISTS ops.evidence_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, evidence_id uuid NOT NULL,
  entity_type varchar(60) NOT NULL, entity_id uuid NOT NULL, role varchar(80) NOT NULL, mandatory boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.evidence_custody_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, evidence_id uuid NOT NULL,
  event_type varchar(80) NOT NULL, event_at timestamptz NOT NULL DEFAULT now(), user_ref uuid, system_name varchar(80),
  details_json jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.evidence_probative_package (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, traffic_agency_id uuid NOT NULL,
  entity_type varchar(60) NOT NULL, entity_id uuid NOT NULL, generated_by_user_ref uuid NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(), manifest_hash varchar(128) NOT NULL, package_uri text NOT NULL,
  purpose varchar(80) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ops.evidence_probative_package_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, package_id uuid NOT NULL,
  item_type varchar(60) NOT NULL, evidence_id uuid, entity_type varchar(60), entity_id uuid,
  item_hash varchar(128) NOT NULL, sequence integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  UNIQUE (tenant_id, package_id, sequence)
);

CREATE INDEX IF NOT EXISTS ix_ops_device_event_tenant_event ON ops.ops_device_event (tenant_id, device_id, event_at);
CREATE INDEX IF NOT EXISTS ix_ops_shift_tenant_agent ON ops.ops_shift (tenant_id, agent_id, started_at);
CREATE INDEX IF NOT EXISTS ix_ops_approach_tenant_shift ON ops.ops_approach (tenant_id, shift_id, approached_at);
CREATE INDEX IF NOT EXISTS ix_ops_snapshot_query_tenant ON ops.snapshots_external_query (tenant_id, purpose, queried_at);
CREATE INDEX IF NOT EXISTS ix_ops_evidence_tenant_captured ON ops.evidence_evidence (tenant_id, captured_at);
CREATE INDEX IF NOT EXISTS ix_ops_evidence_link_polymorphic ON ops.evidence_link (tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS ix_ops_custody_tenant_evidence ON ops.evidence_custody_event (tenant_id, evidence_id, event_at);
CREATE INDEX IF NOT EXISTS gist_ops_device_location ON ops.ops_operational_device USING gist (last_location_geom);
CREATE INDEX IF NOT EXISTS gist_ops_evidence_location ON ops.evidence_evidence USING gist (location_geom);
