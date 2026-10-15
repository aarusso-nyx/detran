// TEST_ONLY public certificate fixture signer.cert.pem SHA256 17fea071e719480eaca9e2d0a9c937d66ad9b8bcabb07312075b8f42d9ab2ebc
// TEST_ONLY public certificate fixture root.cert.pem SHA256 df62238b346362de03670731f1143fe37cfabffa721a34e9f74d03c2519e3c9f
import { X509Certificate, createHash } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';

// TEST_ONLY consumer-port fixtures, never an approved national floor or provider PKI.
const ROOT_CERT =
  '-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIJAOVbcxQMV2gpMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV\nBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDAeFw0yNjA5MjgxNTQyMTlaFw0zNjA5\nMjUxNTQyMTlaMCAxHjAcBgNVBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM+3+GmdyZkWro3WSGA+z0cZA3/n\n2EhtExBeQpC2brCNn1MjsG+nc1Bqki9aVa3TO46CzM/1QxtDGNG+kpLfq6I7LQ13\nb2Y2JRjrJatgQPtBEdZAwTs8G4hx+/tcag+TFAqVppTPS+nkwdHS/nqebr7QvzTP\nribyJ9NQPY9bBNI23nvahe7bN9QFXn4w4FWcpTZLue0LDCjM9HpKvWv1W/QdVdO5\njID7kapIDj8SzV81IC/jy/URGQzUghUCiDUL4ftQpdjo2SYoq+/XBglnwhjKOXPx\no8N10PbphTKaRSrvs/0fDtyInczYQ/CaF99rPRp4qpO7KE3iwhlkbtNjD7MCAwEA\nAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYE\nFGjo7/hiHc+B+I2+SKQdiIYqGTv8MB8GA1UdIwQYMBaAFGjo7/hiHc+B+I2+SKQd\niIYqGTv8MA0GCSqGSIb3DQEBCwUAA4IBAQBSGigMBLptifruCVNcJGPvoV/fa60A\nOiWu4EKfO6qKXPH14h2Zlwc0lfU19g57LiGoAhvOfOhv2Qu1JekqOtsk1SVpP1Hq\nyEDBtwAsvJvmDrk7MHDWuocRPq2ze5swre+zmKrhemNRYDgYBWw/VE7oyf0gyCCG\nRyIMulzVXu1ynLrEG83MUXDwfSrjLkRisBtZbGoP0wy2a0wpxqPAj6rLOsNBy/eU\nePii00YkSeEoypIStNgZ1SLQTjnNwGWLolNDGhU4PFaYCmeZB5IwlSiJZjh1e9tn\n59Rd1eTshw4yzwihOyvPLPENg72FZ6VZHQRcR+wGMHabTKr3dT927+49\n-----END CERTIFICATE-----\n';
const OTHER_CERT =
  '-----BEGIN CERTIFICATE-----\nMIIDRDCCAiygAwIBAgICA+kwDQYJKoZIhvcNAQELBQAwIDEeMBwGA1UEAwwVU1RZ\nTlggVGVzdCBUcnVzdCBSb290MB4XDTI2MDkyODE1NDIxOVoXDTI3MDkyODE1NDIx\nOVowHDEaMBgGA1UEAwwRU1RZTlggVGVzdCBTaWduZXIwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQCyg+gnVRUK07Y6Ow/6ju8d27t7u6bKfnQWnAykPaAw\n8AIBnOFo/BufiFK5WlhBIegQe5/YxDLyt2DUP0B3EDV1ICf9bresTL6K5QGcXKmr\n7TQZSOUeEIJqFGUQomsoQzVJD3XRQIbny1+rDgKfUx+zjjWNGjCx6PXAzhnOSVMQ\nlWLgi/KKTZAp5l7KqNyVpd/q3OTD5/dToLyuL5sxH9xJ8If4QNo+qK1uWASRvbeJ\naHYH2M7VDH+s0ZIft6RGkkdcICPhd77Q0JphC8LdvmPUOyS1Yl/JcTJ4UHsqrRxm\nW3toI+8cjezQ9zL7sk3PgSU9qvFy5aihXF9eoaNMFO4/AgMBAAGjgYswgYgwDAYD\nVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCB4AwEwYDVR0lBAwwCgYIKwYBBQUHAwQw\nEwYDVR0gBAwwCjAIBgYqAwQFBgcwHQYDVR0OBBYEFFL+7HNLf2hVSZbqRqr7yAjq\nc5GdMB8GA1UdIwQYMBaAFGjo7/hiHc+B+I2+SKQdiIYqGTv8MA0GCSqGSIb3DQEB\nCwUAA4IBAQAhZPphu/GJaPCvgQKkGDSLnPdAU4mmQMbTAMPcM3oZKBvF1aOsgn9D\nQT3DC7bC7G07wJkRcXmgC+bkZFAXCe4lYsgEGysAy+ohVeX1UWxe8kw3gTA6VYgi\n8wEEfNdqqoyvkmZ/GarbP+2vii4R/IT3qe4iSHiWX/3jH+3gXQDMQVCmSwVRT6gh\n0UWLVEgOwT+X3i8qO7FCNt9qtkphfNEg01JhBTKUKdjybHJrOJ2MWR8jq5rCez4H\nSmteSRX9tpILdecsnhhFqdHSHPAo2/vW/p/W8NmGhrUAex3Rc0nlrk437giajOey\nmLfBHLX7EW7/chlecMYHPMsUEr6NO7dQ\n-----END CERTIFICATE-----\n';
const tenant = '00000000-0000-7000-8000-000000000101';
const foreign = '00000000-0000-7000-8000-000000000102';
const actor = '00000000-0000-4000-8000-000000000201';
const policyId = '00000000-0000-4000-8000-000000000301';
const agency = '00000000-0000-4000-8000-000000000401';
const at = new Date('2026-10-13T12:00:00.000Z');
const fingerprint = createHash('sha256')
  .update(new X509Certificate(ROOT_CERT).raw)
  .digest('hex');
const REFUSAL = {
  name: 'DetranError',
  code: 'RAIT.SIGNATURE_FAILED',
  status: 502,
  messageKey: 'rait.errors.signature_failed',
  message: 'A evidência documental não pôde ser validada.',
};
const UNAVAILABLE = { name: 'ServiceUnavailableException', status: 503 };
function configurationRefused(fn: () => unknown) {
  let caught: unknown;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  expect(caught).toMatchObject(UNAVAILABLE);
  expect(JSON.stringify(caught)).not.toContain('TEST_ONLY_SENTINEL_NEVER_LOG');
}
const norm = {
  minimum_signature_level: 'ADVANCED',
  pades_level: 'PAdES-B-LT',
  tsa_required: true,
  require_lta: false,
  revocation: 'ocsp',
  at_time: 'trusted-timestamp',
  accepted_policies: null,
  trust_anchors_pem: [ROOT_CERT],
  source_ref: 'TEST_ONLY not normative',
  approved_by: 'TEST_ONLY fixture',
  approved_at: new Date('2026-10-01T00:00:00Z'),
};
function policy() {
  return {
    id: policyId,
    tenant_id: tenant,
    traffic_agency_id: null,
    document_kind: 'SESSION_MINUTES',
    status: 'active',
    revision: 3,
    valid_from: new Date('2026-10-01T00:00:00Z'),
    valid_to: null,
    ...norm,
  };
}
function floor() {
  return { document_kind: 'SESSION_MINUTES', ...norm };
}
function env() {
  vi.stubEnv('DETRAN_DOCUMENT_TRUST_URL', 'https://trust.test.invalid/verify');
  vi.stubEnv(
    'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
    'https://trust.test.invalid/health',
  );
  vi.stubEnv('DETRAN_DOCUMENT_TRUST_TOKEN', 'TEST_ONLY_SENTINEL_NEVER_LOG');
  vi.stubEnv('DETRAN_RUNTIME_PROFILE', 'test');
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function harness(
  options: {
    policy?: Record<string, unknown> | null;
    floor?: Record<string, unknown> | null;
    available?: boolean;
    contextTenant?: string;
    fingerprint?: string;
  } = {},
) {
  const { SignatureTrustRuntime } =
    await import('./signature-trust-runtime.js');
  const calls: { sql: string; values: unknown[] }[] = [];
  const trx = {
    query: vi.fn(async (sql: string, values: unknown[] = []) => {
      calls.push({ sql, values });
      if (sql.includes('signature_policy_floor_ref'))
        throw Error('Request cannot re-read owner bootstrap floor');
      const row = options.policy === undefined ? policy() : options.policy;
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }),
  };
  const database = {
    tx: vi.fn(async (fn: (tx: typeof trx) => unknown) => fn(trx)),
    withSystemContext: vi.fn(() => {
      throw Error('Request must not use owner context');
    }),
    currentTenantId: () => options.contextTenant ?? tenant,
  };
  const context = {
    tenantId: options.contextTenant ?? tenant,
    actorId: actor,
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: options.contextTenant ?? tenant,
      actorId: actor,
    }),
  };
  const bootstrap = {
    isAvailable: vi.fn(() => options.available ?? true),
    // TEST_ONLY bootstrap port supplies approved immutable DTO; actual holder parsing/Date detachment requires separate DI proof.
    getApprovedFloor: vi.fn((kind: string) => {
      const row = options.floor === undefined ? floor() : options.floor;
      if (
        !row ||
        row.document_kind !== kind ||
        !(row.approved_at instanceof Date) ||
        !Number.isFinite(row.approved_at.getTime()) ||
        !row.approved_by ||
        !row.source_ref
      )
        return null;
      return {
        documentKind: row.document_kind,
        minimumSignatureLevel: row.minimum_signature_level,
        padesLevel: row.pades_level,
        tsaRequired: row.tsa_required,
        requireLta: row.require_lta,
        revocation: row.revocation,
        atTime: row.at_time,
        acceptedPolicies: row.accepted_policies,
        trustAnchorsPem: row.trust_anchors_pem,
        sourceRef: row.source_ref,
        approvedBy: row.approved_by,
        approvedAt: new Date(row.approved_at),
      };
    }),
    resolveSignerCertificate: vi.fn(
      async () => options.fingerprint ?? fingerprint,
    ),
    resolvePartyCertificate: vi.fn(
      async () => options.fingerprint ?? fingerprint,
    ),
  };
  const runtime = new SignatureTrustRuntime(
    database as never,
    context as never,
    bootstrap as never,
  );
  return { runtime, database, trx, context, bootstrap, calls };
}
const input = () => ({
  tenantId: tenant,
  trafficAgencyId: agency,
  documentKind: 'SESSION_MINUTES',
  at: new Date(at),
});
function expectedProfile(environment: 'test' | 'production' = 'test') {
  return {
    id: policyId,
    revision: '3',
    environment,
    minimumSignatureLevel: 'ADVANCED',
    requiredPadesProfile: 'PAdES-B-LT',
    requireTsa: true,
    requireLta: false,
    revocation: 'ocsp',
    trustAnchorsPem: [ROOT_CERT],
    atTime: 'trusted-timestamp',
  };
}

it('configured TEST_ONLY runtime maps every real policy field and omits absent policy sets', async () => {
  env();
  const h = await harness();
  expect(await h.runtime.resolveProfile(input())).toEqual({
    policyId,
    profile: expectedProfile(),
  });
  expect(h.database.withSystemContext).not.toHaveBeenCalled();
  expect(
    h.calls.some((x) => x.sql.includes('signature_policy_floor_ref')),
  ).toBe(false);
  expect(h.bootstrap.getApprovedFloor).toHaveBeenCalledWith('SESSION_MINUTES');
  expect(h.calls.flatMap((x) => x.values)).toContain(tenant);
  expect(h.calls.flatMap((x) => x.values)).toContain('SESSION_MINUTES');
});
for (const [runtimeProfile, expected] of [
  ['local-sandbox', 'test'],
  ['test', 'test'],
  ['staging-like', 'production'],
  ['production', 'production'],
] as const)
  it(`runtime environment mapping ${runtimeProfile} preserves policy identity`, async () => {
    env();
    vi.stubEnv('DETRAN_RUNTIME_PROFILE', runtimeProfile);
    const h = await harness();
    expect((await h.runtime.resolveProfile(input())).profile).toEqual(
      expectedProfile(expected),
    );
  });
for (const key of [
  'DETRAN_DOCUMENT_TRUST_URL',
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
])
  it(`missing ${key} refuses before any policy SQL`, async () => {
    env();
    vi.stubEnv(key, '');
    const h = await harness();
    configurationRefused(() => h.runtime.assertConfigured());
    await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
      UNAVAILABLE,
    );
    expect(h.database.tx).not.toHaveBeenCalled();
  });
it('configuration is re-read per call rather than cached after a valid call', async () => {
  env();
  const h = await harness();
  h.runtime.assertConfigured();
  vi.stubEnv('DETRAN_DOCUMENT_TRUST_TOKEN', '');
  configurationRefused(() => h.runtime.assertConfigured());
  expect(h.database.tx).not.toHaveBeenCalled();
});
for (const profile of ['production', 'staging-like'])
  for (const key of [
    'DETRAN_DOCUMENT_TRUST_URL',
    'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  ])
    it(`${profile} refuses HTTP ${key} before I/O`, async () => {
      env();
      vi.stubEnv('DETRAN_RUNTIME_PROFILE', profile);
      vi.stubEnv(key, 'http://nonlocal.test.invalid/endpoint');
      const h = await harness();
      configurationRefused(() => h.runtime.assertConfigured());
      expect(h.database.tx).not.toHaveBeenCalled();
    });
it('missing bootstrap approval source remains unavailable despite configured URLs', async () => {
  env();
  const h = await harness({ available: false });
  configurationRefused(() => h.runtime.assertConfigured());
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    UNAVAILABLE,
  );
  expect(h.database.tx).not.toHaveBeenCalled();
});
it('no-optional-bootstrap construction is fail-closed', async () => {
  env();
  const { SignatureTrustRuntime } =
    await import('./signature-trust-runtime.js');
  const runtime = new SignatureTrustRuntime({} as never, {} as never);
  configurationRefused(() => runtime.assertConfigured());
});
it('foreign input tenant is denied before SQL or certificate identity resolution', async () => {
  env();
  const h = await harness();
  await expect(
    h.runtime.resolveProfile({ ...input(), tenantId: foreign }),
  ).rejects.toMatchObject(REFUSAL);
  await expect(
    h.runtime.resolveSignerCertificate(foreign, 'TEST_ONLY signer'),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.database.tx).not.toHaveBeenCalled();
  expect(h.bootstrap.resolveSignerCertificate).not.toHaveBeenCalled();
});
it('invalid server Date does not become an invented current instant', async () => {
  env();
  const h = await harness();
  await expect(
    h.runtime.resolveProfile({ ...input(), at: new Date(NaN) }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.database.tx).not.toHaveBeenCalled();
});
it('missing policy cannot be replaced by a populated national floor', async () => {
  env();
  const h = await harness({ policy: null });
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    REFUSAL,
  );
});
it('missing national floor cannot be replaced by a populated policy', async () => {
  env();
  const h = await harness({ floor: null });
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    REFUSAL,
  );
});
it('unapproved floor is refused', async () => {
  env();
  const h = await harness({ floor: { ...floor(), approved_at: null } });
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    REFUSAL,
  );
});
for (const field of [
  'minimum_signature_level',
  'require_lta',
  'revocation',
  'at_time',
  'source_ref',
  'trust_anchors_pem',
])
  it(`NULL normative ${field} is not defaulted`, async () => {
    env();
    const h = await harness({ policy: { ...policy(), [field]: null } });
    await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
      REFUSAL,
    );
  });
it('empty trust anchor array is not a usable profile', async () => {
  env();
  const h = await harness({ policy: { ...policy(), trust_anchors_pem: [] } });
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    REFUSAL,
  );
});
it('NONE policy cannot generate a signed-document profile', async () => {
  env();
  const h = await harness({ policy: { ...policy(), pades_level: 'NONE' } });
  await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
    REFUSAL,
  );
});
for (const [name, policyPatch, floorPatch] of [
  [
    'level',
    { minimum_signature_level: 'ADVANCED' },
    { minimum_signature_level: 'QUALIFIED' },
  ],
  ['TSA', { tsa_required: false }, { tsa_required: true }],
  ['LTA', { require_lta: false }, { require_lta: true }],
  ['revocation', { revocation: 'crl' }, { revocation: 'ocsp' }],
  [
    'trusted-time',
    { at_time: 'signing-time' },
    { at_time: 'trusted-timestamp' },
  ],
  ['PAdES', { pades_level: 'PAdES-B-LT' }, { pades_level: 'NONE' }],
  [
    'policies',
    { accepted_policies: ['1.2.3.99'] },
    { accepted_policies: ['1.2.3.1'] },
  ],
  [
    'anchors',
    { trust_anchors_pem: [OTHER_CERT] },
    { trust_anchors_pem: [ROOT_CERT] },
  ],
] as const)
  it(`policy weaker or unequal to floor ${name} is rejected`, async () => {
    env();
    const h = await harness({
      policy: { ...policy(), ...policyPatch },
      floor: { ...floor(), ...floorPatch },
    });
    await expect(h.runtime.resolveProfile(input())).rejects.toMatchObject(
      REFUSAL,
    );
  });
it('explicit accepted policy data is preserved without inventing qualifiedPolicies', async () => {
  env();
  const policies = ['1.2.3.1'];
  const h = await harness({
    policy: { ...policy(), accepted_policies: policies },
    floor: { ...floor(), accepted_policies: policies },
  });
  const p = (await h.runtime.resolveProfile(input())).profile;
  expect(p.acceptedPolicies).toEqual(policies);
  expect(p).not.toHaveProperty('qualifiedPolicies');
});
it('recorded profile selects immutable policy ID and original signature time', async () => {
  env();
  const h = await harness();
  const value = await h.runtime.resolveRecordedProfile({
    tenantId: tenant,
    policyId,
    documentKind: 'SESSION_MINUTES',
    at: new Date(at),
  });
  expect(value).toEqual({ policyId, profile: expectedProfile() });
  expect(
    h.calls
      .filter((x) => !x.sql.includes('signature_policy_floor_ref'))
      .flatMap((x) => x.values),
  ).toContain(policyId);
  expect(h.database.withSystemContext).not.toHaveBeenCalled();
});
for (const method of [
  'resolveSignerCertificate',
  'resolvePartyCertificate',
] as const) {
  it(`${method} uses independent bootstrap identity and current tenant`, async () => {
    env();
    const h = await harness();
    expect(await h.runtime[method](tenant, 'TEST_ONLY person')).toBe(
      fingerprint,
    );
    expect(h.bootstrap[method]).toHaveBeenCalledWith(
      tenant,
      'TEST_ONLY person',
    );
  });
  it(`${method} rejects malformed trusted identity fingerprints`, async () => {
    env();
    const h = await harness({ fingerprint: 'not-a-trusted-sha256' });
    await expect(
      h.runtime[method](tenant, 'TEST_ONLY person'),
    ).rejects.toMatchObject(REFUSAL);
  });
}

it('same-DER PEM representation is accepted without a false anchor mismatch', async () => {
  env();
  const h = await harness({
    policy: {
      ...policy(),
      trust_anchors_pem: [ROOT_CERT.replaceAll('\n', '\r\n')],
    },
  });
  const value = await h.runtime.resolveProfile(input());
  expect(value.policyId).toBe(policyId);
  expect(new X509Certificate(value.profile.trustAnchorsPem[0]!).raw).toEqual(
    new X509Certificate(ROOT_CERT).raw,
  );
  expect(h.database.withSystemContext).not.toHaveBeenCalled();
});
