-- R-0013 / BP-OPS-PROVISIONING-001 — idempotent fixtures for the isolated
-- provisioning proof.  Private device-key material is intentionally absent.

insert into ops.device_key (
  id,
  tenant_id,
  device_id,
  key_fingerprint,
  public_key,
  attestation_evidence_json
) values (
  '00000000-0000-7000-8000-0000a2010001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1010001',
  'fixture-public-key-a',
  'PUBLIC-KEY-FIXTURE-A',
  '{"fixture": "ops-provisioning-a"}'::jsonb
) on conflict (id) do update
set public_key = excluded.public_key,
    attestation_evidence_json = excluded.attestation_evidence_json;

select set_config(
  'app.tenant_id',
  '00000000-0000-7000-8000-00000000b001',
  true
);

insert into ops.device_key (
  id,
  tenant_id,
  device_id,
  key_fingerprint,
  public_key,
  attestation_evidence_json
) values (
  '00000000-0000-7000-8000-0000b2010001',
  '00000000-0000-7000-8000-00000000b001',
  '00000000-0000-7000-8000-0000b1010001',
  'fixture-public-key-b',
  'PUBLIC-KEY-FIXTURE-B',
  '{"fixture": "ops-provisioning-b"}'::jsonb
) on conflict (id) do update
set public_key = excluded.public_key,
    attestation_evidence_json = excluded.attestation_evidence_json;

select set_config(
  'app.tenant_id',
  '00000000-0000-7000-8000-00000000a001',
  true
);

insert into ops.offline_authorization_grant (
  id,
  tenant_id,
  traffic_agency_id,
  device_id,
  device_key_fingerprint,
  authorized_agents_json,
  valid_from,
  valid_until,
  maximum_offline_seconds,
  maximum_acts,
  revocation_epoch,
  policy_version,
  normative_package_id,
  numbering_reservation_ids_json,
  issued_by_subject,
  key_id,
  manifest_digest
) values (
  '00000000-0000-7000-8000-0000a3010001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a1020001',
  '00000000-0000-7000-8000-0000a1010001',
  'fixture-public-key-a',
  '[{"agent_id":"00000000-0000-7000-8000-0000a1030001","registration_number":"fixture-agent-a","roles":["field-agent"],"permissions":["ops:provisioning"]}]'::jsonb,
  '2026-09-21T00:00:00.000Z',
  '2026-09-22T00:00:00.000Z',
  3600,
  10,
  0,
  'fixture-policy-v1',
  '00000000-0000-7000-8000-0000a1040001',
  '["00000000-0000-7000-8000-0000a1050001"]'::jsonb,
  '00000000-0000-7000-8000-0000a1030001',
  'fixture-kid-a',
  'fixture-grant-digest-a'
) on conflict (id) do update
set authorized_agents_json = excluded.authorized_agents_json,
    issued_by_subject = excluded.issued_by_subject,
    manifest_digest = excluded.manifest_digest;

insert into ops.provisioning_package (
  id,
  tenant_id,
  grant_id,
  device_id,
  manifest_digest,
  artifact_digests_json,
  trust_chain_json,
  normative_package_id,
  numbering_policy_json,
  envelope_uri,
  signature_key_id
) values (
  '00000000-0000-7000-8000-0000a4010001',
  '00000000-0000-7000-8000-00000000a001',
  '00000000-0000-7000-8000-0000a3010001',
  '00000000-0000-7000-8000-0000a1010001',
  'fixture-package-digest-a',
  '{"manifest":"fixture-package-digest-a"}'::jsonb,
  '{"public_chain":"fixture-only"}'::jsonb,
  '00000000-0000-7000-8000-0000a1040001',
  '{"reservation_ids":["00000000-0000-7000-8000-0000a1050001"]}'::jsonb,
  'fixture://ops-provisioning/a',
  'fixture-kid-a'
) on conflict (id) do update
set artifact_digests_json = excluded.artifact_digests_json,
    trust_chain_json = excluded.trust_chain_json;

-- A5 HTTP fixtures use actual tenant-scoped operational identities. The source
-- templates belong to the same closed fresh/legacy seed profile above.
insert into ops.ops_operational_device
select (jsonb_populate_record(null::ops.ops_operational_device,
  to_jsonb(d) || '{"id":"00000000-0000-7000-8000-0000a1010001","traffic_agency_id":"00000000-0000-7000-8000-0000a1020001","hardware_identifier_hash":"fixture-provisioning-device-a"}'::jsonb)).*
from ops.ops_operational_device d
where d.id = '00000000-0000-7000-8000-0000e4000002'
on conflict (id) do update set traffic_agency_id = excluded.traffic_agency_id;

insert into ops.ops_agent_profile
select (jsonb_populate_record(null::ops.ops_agent_profile,
  to_jsonb(a) || '{"id":"00000000-0000-7000-8000-0000a1030001","user_ref":"00000000-0000-7000-8000-0000a1030001","traffic_agency_id":"00000000-0000-7000-8000-0000a1020001","registration_number":"fixture-agent-a"}'::jsonb)).*
from ops.ops_agent_profile a
where a.id = '00000000-0000-4000-8000-0000b0000001'
on conflict (id) do update set traffic_agency_id = excluded.traffic_agency_id;
