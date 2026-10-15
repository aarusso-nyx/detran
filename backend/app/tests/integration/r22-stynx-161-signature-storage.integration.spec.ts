// Inspector source-only C06A contract sensors. No SQL/SDK execution; live enforcement remains separate.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const root = new URL('../../../../', import.meta.url);
function sql(relative: string) {
  return readFileSync(new URL(relative, root), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/--[^\n]*/gu, '');
}
const signedPath = 'backend/database/ddl/06-storage-signed-documents.sql';
const guardsPath = 'backend/database/ddl/31-inf-signature-policy-guards.sql';
it('C06A manual signed-storage SQL declares both append-only evidence and manifest relations', () => {
  const s = sql(signedPath);
  expect(s).toMatch(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?storage\.signature_evidence\b/iu,
  );
  expect(s).toMatch(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?storage\.signature_manifest\b/iu,
  );
  for (const field of [
    'original_object_id',
    'signed_object_id',
    'cms_signature',
    'cms_sha256',
    'original_document_sha256',
    'signed_document_sha256',
    'signer_certificate_sha256',
    'signer_certificate_pem',
    'signature_policy_id',
    'trust_profile_revision',
    'verifier_kind',
    'achieved_level',
    'pades_profile',
    'revocation_source',
    'signed_at',
    'tsa_at',
    'certificate_validated_at',
    'verification_ref',
    'created_by',
    'source_object_id',
    'snapshot',
    'snapshot_sha256',
    'manifest_sha256',
    'signer_count',
    'manifest_json',
    'idempotency_key',
  ])
    expect(s).toMatch(new RegExp(`\\b${field}\\b`, 'u'));
});
it('signed objects require actual existing ENABLE and FORCE RLS; absence is a STOP, not a local policy repair', () => {
  const s = sql(signedPath);
  expect(s).toMatch(/relrowsecurity/iu);
  expect(s).toMatch(/relforcerowsecurity/iu);
  expect(s).toMatch(/storage\.objects/iu);
  expect(s).toMatch(/raise\s+exception/iu);
  expect(s).not.toMatch(
    /alter\s+table\s+storage\.objects\s+(?:enable|force)\s+row\s+level\s+security/iu,
  );
});
it('signed-object immutable guard targets exactly the signed-documents collection', () => {
  const s = sql(signedPath);
  expect(s).toMatch(
    /before\s+(?:update\s+or\s+delete|delete\s+or\s+update)[\s\S]*?on\s+storage\.objects[\s\S]*?for\s+each\s+row[\s\S]*?when\s*\(\s*old\.collection\s*=\s*'signed-documents'\s*\)/iu,
  );
  expect(s).toMatch(/raise\s+exception/iu);
});
it('new evidence and manifest use canonical tenant helper and only app SELECT/INSERT privileges', () => {
  const s = sql(signedPath);
  for (const table of ['signature_evidence', 'signature_manifest']) {
    expect(s).toMatch(
      new RegExp(
        `auth\\.create_rls_policy\\(\\s*'storage'\\s*,\\s*'${table}'\\s*\\)`,
        'iu',
      ),
    );
    expect(s).toMatch(
      new RegExp(
        `(?:before|BEFORE)\\s+(?:update\\s+or\\s+delete|delete\\s+or\\s+update)[\\s\\S]*?on\\s+storage\\.${table}`,
        'iu',
      ),
    );
  }
  expect(s).toMatch(/auth\.install_tenant_triggers\s*\(/iu);
  expect(s).toMatch(/grant\s+select\s*,\s*insert\s+on/iu);
  expect(s).not.toMatch(
    /grant\s+(?:all|update|delete|truncate)[^;]*signature_(?:evidence|manifest)[^;]*to\s+role_app_backend/iu,
  );
});
it('manifest SQL binds tenant/signers and both original-count and idempotency uniqueness', () => {
  const s = sql(signedPath);
  expect(s).toMatch(/manifest_json\s*->>\s*'tenantId'/u);
  expect(s).toMatch(
    /jsonb_array_length\s*\(\s*manifest_json\s*->\s*'signers'\s*\)/u,
  );
  expect(s).toMatch(
    /unique\s*\(\s*tenant_id\s*,\s*kind\s*,\s*aggregate_id\s*,\s*document_id\s*,\s*signer_count\s*\)/iu,
  );
  expect(s).toMatch(/where\s+idempotency_key\s+is\s+not\s+null/iu);
});
it('late policy guard preserves approved-floor source without invented seed or profile defaults', () => {
  const s = sql(guardsPath);
  expect(s).toMatch(/signature_policy_floor_ref/iu);
  expect(s).not.toMatch(/insert\s+into\s+inf\.signature_policy_floor_ref/iu);
  expect(s).toMatch(/old\.status\s*=\s*'active'/iu);
  expect(s).toMatch(/raise\s+exception/iu);
  expect(s).toMatch(/nulls\s+not\s+distinct/iu);
  expect(s).toMatch(/signature_policy/iu);
});
it('policy-reference foreign key exists after normative table creation and binds actual evidence policy ID', () => {
  const s = sql(signedPath) + '\n' + sql(guardsPath);
  expect(s).toMatch(
    /foreign\s+key\s*\(\s*signature_policy_id\s*\)\s*references\s+inf\.signature_policy\s*\(\s*id\s*\)/iu,
  );
});
it('normal apply explicitly registers both new DDLs and final privilege maintenance follows them', () => {
  const s = readFileSync(new URL('backend/database/apply.sh', root), 'utf8');
  expect(s).toMatch(/await\s+runStorageApply\(root/u);
  expect(s).toMatch(/tools\/stynx-storage-public-install\.mjs/u);
  const runner = readFileSync(
    new URL('tools/stynx-storage-public-install.mjs', root),
    'utf8',
  );
  const plan = readFileSync(
    new URL('tools/stynx-storage-ddl-plan.mjs', root),
    'utf8',
  );
  const ordered = [
    '20-rls-policies.sql',
    '06-storage-signed-documents.sql',
    '31-inf-signature-policy-guards.sql',
  ];
  let prior = -1;
  for (const name of ordered) {
    const next = plan.indexOf(name);
    expect(next).toBeGreaterThan(prior);
    prior = next;
  }
  expect(runner).toMatch(/createStorageDdlPlan\(root, full\)/u);
  const main = runner.slice(
    runner.indexOf('export async function runStorageApply'),
  );
  expect(
    main.indexOf(
      'custodyFinalPrivilegesSql',
      main.indexOf('for (const step of ddl.steps)'),
    ),
  ).toBeGreaterThan(main.indexOf('for (const step of ddl.steps)'));

  // Exact actual SQL/ACL/FORCE/ALWAYS enforcement is deliberately left to leased live probes.
});
it('manifest missing or JSON-null tenantId/signers cannot pass SQL CHECK through UNKNOWN', () => {
  const s = sql(signedPath);
  for (const expression of [
    /manifest_json\s*->>\s*'tenantId'[\s\S]{0,90}\bIS\s+TRUE\b/iu,
    /jsonb_typeof\s*\(\s*manifest_json\s*->\s*'signers'\s*\)[\s\S]{0,70}\bIS\s+TRUE\b/iu,
    /jsonb_array_length\s*\(\s*manifest_json\s*->\s*'signers'\s*\)[\s\S]{0,70}\bIS\s+TRUE\b/iu,
  ])
    expect(s).toMatch(expression);
});
it('immutable trigger function admission inspects exact owner/body/security/config and effective execution authority', () => {
  const s = sql(signedPath) + '\n' + sql(guardsPath);
  for (const token of [
    'pg_proc',
    'proowner',
    'prosecdef',
    'proconfig',
    'pg_get_functiondef',
    'has_function_privilege',
  ])
    expect(s).toContain(token);
  expect(s).toContain('postgres');
  expect(s).toContain('reject_signed_document_mutation');
  expect(s).toContain('reject_active_signature_policy_mutation');
  expect(s).not.toMatch(
    /ALTER\s+FUNCTION[^;]*reject_(?:signed_document|active_signature_policy)_mutation[^;]*OWNER\s+TO/iu,
  );
});
it('late signature ACL admission detects existing forbidden column grants as well as table grants', () => {
  const s = sql(guardsPath);
  for (const table of [
    'inf.signature_policy_floor_ref',
    'storage.signature_evidence',
    'storage.signature_manifest',
  ])
    expect(s).toMatch(
      new RegExp(
        `has_any_column_privilege\\([^;]*?'${table.replaceAll('.', '\\.')}'[^;]*?UPDATE`,
        'iu',
      ),
    );
});

// Prospective64f5 source witnesses only: actual23503/direct-role enforcement awaits a leased normal install.
for (const [name, child, local, parent, file] of [
  [
    'signature_evidence_original_object_tenant_fk',
    'storage.signature_evidence',
    'original_object_id',
    'storage.objects',
    signedPath,
  ],
  [
    'signature_evidence_signed_object_tenant_fk',
    'storage.signature_evidence',
    'signed_object_id',
    'storage.objects',
    signedPath,
  ],
  [
    'signature_manifest_source_object_tenant_fk',
    'storage.signature_manifest',
    'source_object_id',
    'storage.objects',
    signedPath,
  ],
  [
    'signature_evidence_policy_tenant_fk',
    'storage.signature_evidence',
    'signature_policy_id',
    'inf.signature_policy',
    guardsPath,
  ],
])
  it(`same-tenant composite FK ${name} binds ordered tenant and original parent identity`, () => {
    const s = sql(file);
    const escaped = (value: string) => value.replaceAll('.', '\\.');
    expect(s).toMatch(
      new RegExp(
        `ALTER\\s+TABLE\\s+${escaped(child)}\\s+ADD\\s+CONSTRAINT\\s+${name}\\s+FOREIGN\\s+KEY\\s*\\(\\s*tenant_id\\s*,\\s*${local}\\s*\\)\\s*REFERENCES\\s+${escaped(parent)}\\s*\\(\\s*tenant_id\\s*,\\s*id\\s*\\)`,
        'iu',
      ),
    );
    const statement = s.match(
      new RegExp(`ADD\\s+CONSTRAINT\\s+${name}\\b[^;]*;`, 'iu'),
    )?.[0];
    expect(statement).toBeDefined();
    expect(statement).not.toMatch(
      /NOT\s+VALID|INITIALLY\s+DEFERRED|(?<!NOT\s)DEFERRABLE|CASCADE|SET\s+NULL|SET\s+DEFAULT/iu,
    );
  });
for (const [name, parent, file] of [
  ['ux_storage_objects_tenant_id_id', 'storage.objects', signedPath],
  ['ux_inf_signature_policy_tenant_id_id', 'inf.signature_policy', guardsPath],
])
  it(`same-tenant parent index ${name} requires exact unique key and catalog admission`, () => {
    const s = sql(file);
    expect(s).toMatch(
      new RegExp(
        `CREATE\\s+UNIQUE\\s+INDEX(?:\\s+IF\\s+NOT\\s+EXISTS)?\\s+${name}\\s+ON\\s+${parent.replaceAll('.', '\\.')}\\s*\\(\\s*tenant_id\\s*,\\s*id\\s*\\)\\s*;`,
        'iu',
      ),
    );
    for (const field of [
      'pg_index',
      'indisunique',
      'indisvalid',
      'indpred',
      'indexprs',
      'relowner',
    ])
      expect(s).toContain(field);
    expect(s).toMatch(/pg_get_indexdef|indkey/iu);
    expect(s).toMatch(/RAISE\s+EXCEPTION/iu);
  });
it('same-tenant FK catalog admission checks ordered keys, actual parent index and enforced nondeferrable NO ACTION flags', () => {
  const s = sql(signedPath) + '\n' + sql(guardsPath);
  for (const field of [
    'pg_constraint',
    'conrelid',
    'confrelid',
    'conkey',
    'confkey',
    'conindid',
    'convalidated',
    'condeferrable',
    'condeferred',
    'confmatchtype',
    'confupdtype',
    'confdeltype',
  ])
    expect(s).toContain(field);
  expect(s).toMatch(/RAISE\s+EXCEPTION/iu);
});

it('same-tenant RI admission compares exact per-FK child and parent event/function multisets in both directions', () => {
  const s = sql(signedPath) + '\n' + sql(guardsPath);
  for (const [event, func] of [
    [5, 'RI_FKey_check_ins'],
    [17, 'RI_FKey_check_upd'],
    [9, 'RI_FKey_noaction_del'],
    [17, 'RI_FKey_noaction_upd'],
  ] as const)
    expect(s).toMatch(
      new RegExp(`\\([^\\n;]*\\b${event}\\s*,\\s*'${func}'\\s*\\)`, 'u'),
    );
  for (const field of [
    'pg_trigger',
    'tgconstraint',
    'tgrelid',
    'tgconstrrelid',
    'tgconstrindid',
    'conindid',
    'tgtype',
  ])
    expect(s).toContain(field);
  expect(s.match(/EXCEPT\s+ALL/giu)?.length ?? 0).toBeGreaterThanOrEqual(2);
  for (const constraint of [
    'signature_evidence_original_object_tenant_fk',
    'signature_evidence_signed_object_tenant_fk',
    'signature_manifest_source_object_tenant_fk',
    'signature_evidence_policy_tenant_fk',
  ])
    expect(s).toContain(constraint);
});
it('same-tenant RI admission requires enabled internal origin triggers and rejects disabled or altered guard metadata', () => {
  const s = sql(signedPath) + '\n' + sql(guardsPath);
  expect(s).toMatch(/session_replication_role[\s\S]{0,80}'origin'/u);
  expect(s).toMatch(/tgenabled[\s\S]{0,50}'O'/u);
  for (const field of [
    'tgisinternal',
    'tgdeferrable',
    'tginitdeferred',
    'tgqual',
    'tgargs',
    'tgattr',
    'tgoldtable',
    'tgnewtable',
  ])
    expect(s).toContain(field);
  expect(s).toMatch(/RAISE\s+EXCEPTION/iu);
});
