// TEST_ONLY public certificate root.cert.pem SHA256 df62238b346362de03670731f1143fe37cfabffa721a34e9f74d03c2519e3c9f
import { createHash, X509Certificate } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';

// TEST_ONLY port fixtures. Fake verification replies do not prove CMS, provider or approved trust.
const CERT_PEM =
  '-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIJAOVbcxQMV2gpMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV\nBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDAeFw0yNjA5MjgxNTQyMTlaFw0zNjA5\nMjUxNTQyMTlaMCAxHjAcBgNVBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM+3+GmdyZkWro3WSGA+z0cZA3/n\n2EhtExBeQpC2brCNn1MjsG+nc1Bqki9aVa3TO46CzM/1QxtDGNG+kpLfq6I7LQ13\nb2Y2JRjrJatgQPtBEdZAwTs8G4hx+/tcag+TFAqVppTPS+nkwdHS/nqebr7QvzTP\nribyJ9NQPY9bBNI23nvahe7bN9QFXn4w4FWcpTZLue0LDCjM9HpKvWv1W/QdVdO5\njID7kapIDj8SzV81IC/jy/URGQzUghUCiDUL4ftQpdjo2SYoq+/XBglnwhjKOXPx\no8N10PbphTKaRSrvs/0fDtyInczYQ/CaF99rPRp4qpO7KE3iwhlkbtNjD7MCAwEA\nAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYE\nFGjo7/hiHc+B+I2+SKQdiIYqGTv8MB8GA1UdIwQYMBaAFGjo7/hiHc+B+I2+SKQd\niIYqGTv8MA0GCSqGSIb3DQEBCwUAA4IBAQBSGigMBLptifruCVNcJGPvoV/fa60A\nOiWu4EKfO6qKXPH14h2Zlwc0lfU19g57LiGoAhvOfOhv2Qu1JekqOtsk1SVpP1Hq\nyEDBtwAsvJvmDrk7MHDWuocRPq2ze5swre+zmKrhemNRYDgYBWw/VE7oyf0gyCCG\nRyIMulzVXu1ynLrEG83MUXDwfSrjLkRisBtZbGoP0wy2a0wpxqPAj6rLOsNBy/eU\nePii00YkSeEoypIStNgZ1SLQTjnNwGWLolNDGhU4PFaYCmeZB5IwlSiJZjh1e9tn\n59Rd1eTshw4yzwihOyvPLPENg72FZ6VZHQRcR+wGMHabTKr3dT927+49\n-----END CERTIFICATE-----\n';
const cert = new X509Certificate(CERT_PEM);
const hash = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');
const REFUSAL = {
  name: 'DetranError',
  code: 'RAIT.SIGNATURE_FAILED',
  status: 502,
  messageKey: 'rait.errors.signature_failed',
  message: 'A evidência documental não pôde ser validada.',
};
const tenant = '00000000-0000-7000-8000-000000000101';
const foreign = '00000000-0000-7000-8000-000000000102';
const actor = '00000000-0000-4000-8000-000000000201';
const policyId = '00000000-0000-4000-8000-000000000301';
const evidenceId = '00000000-0000-4000-8000-000000000501';
const when = new Date('2026-10-13T12:00:00.000Z');
const originalDocument = new TextEncoder().encode(
  '%PDF-1.7\nTEST_ONLY original bytes\n%%EOF',
);
const signedDocument = new TextEncoder().encode(
  '%PDF-1.7\nTEST_ONLY signed bytes\n%%EOF',
);
const cmsSignature = new TextEncoder().encode('TEST_ONLY not real CMS');
const certificate = {
  subject: cert.subject,
  issuer: cert.issuer,
  serialNumber: cert.serialNumber,
  pem: CERT_PEM,
};
const fingerprint = hash(cert.raw);
const profile = {
  id: policyId,
  revision: '3',
  environment: 'test',
  minimumSignatureLevel: 'ADVANCED',
  requiredPadesProfile: 'PAdES-B-LT',
  requireTsa: true,
  requireLta: false,
  revocation: 'ocsp',
  trustAnchorsPem: [CERT_PEM],
  atTime: 'trusted-timestamp',
};
function input() {
  return {
    tenantId: tenant,
    trafficAgencyId: null,
    documentId: 'TEST_ONLY-document',
    documentKind: 'SESSION_MINUTES',
    signerId: 'TEST_ONLY person',
    originalDocument: originalDocument.slice(),
    signedDocument: signedDocument.slice(),
    cmsSignature: cmsSignature.slice(),
    certificate: { ...certificate },
  };
}
function proof() {
  return {
    verifierKind: 'stynx-cms',
    profileId: policyId,
    profileRevision: '3',
    achievedLevel: 'ADVANCED',
    padesProfile: 'PAdES-B-LT',
    originalDocumentSha256: hash(originalDocument),
    signedDocumentSha256: hash(signedDocument),
    cmsSha256: hash(cmsSignature),
    signerCertificateSha256: fingerprint,
    chainSha256: [fingerprint],
    signedAt: new Date(when),
    tsaAt: new Date(when),
    certificateValidatedAt: new Date(when),
    revocationSource: 'ocsp',
    verificationRef: 'TEST_ONLY observed public-port reply',
  };
}
function reply() {
  return {
    status: 'valid',
    documentSha256: hash(originalDocument),
    checkedAt: new Date(when),
    signatureLevel: 'ADVANCED',
    verifierKind: 'stynx-cms',
    trustProof: proof(),
    signerCertificate: certificate,
    revocationSource: 'ocsp',
    revocationCheckedAt: new Date(when),
    reasons: [],
  };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function harness(
  options: {
    reply?: Record<string, unknown>;
    profile?: Record<string, unknown>;
    sqlFailure?: boolean;
    readRows?: unknown[];
    queryRows?: (sql: string, values: unknown[]) => unknown[];
    contextTenant?: string;
    ready?: boolean;
    headMismatch?: boolean;
  } = {},
) {
  const { SignedDocumentStore } = await import('./signed-document-store.js');
  const trace: string[] = [],
    queries: { sql: string; values: unknown[] }[] = [],
    uploads = new Map<
      string,
      { checksumSha256: string; contentType: string }
    >();
  const pending = new Map<
    string,
    { checksumSha256: string; contentType: string }
  >();
  let inserted = 0;
  const trx = {
    query: vi.fn(async (sql: string, values: unknown[] = []) => {
      queries.push({ sql, values });
      if (/^\s*(?:insert|with)\b/iu.test(sql)) {
        trace.push('insert');
        if (options.sqlFailure && sql.includes('signature_evidence'))
          throw Error('TEST_ONLY SQL failure after upload');
        inserted++;
        const id = sql.includes('signature_evidence')
          ? evidenceId
          : `00000000-0000-4000-8000-${String(600 + inserted).padStart(12, '0')}`;
        return { rows: [{ id }], rowCount: 1 };
      }
      const rows = options.queryRows?.(sql, values) ?? options.readRows ?? [];
      return { rows, rowCount: rows.length };
    }),
  };
  const database = {
    tx: vi.fn(async (fn: (tx: typeof trx) => unknown) => fn(trx)),
    withSystemContext: vi.fn(() => {
      throw Error('Request owner context forbidden');
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
  const s3 = {
    presignUpload: vi.fn(
      async (x: {
        key: string;
        contentType: string;
        checksumSha256: string;
      }) => {
        trace.push('presign');
        pending.set(x.key, x);
        return {
          method: 'PUT',
          url: 'https://s3.test.invalid/put/' + encodeURIComponent(x.key),
          headers: {
            'content-type': x.contentType,
            'x-amz-meta-sha256': x.checksumSha256,
          },
          expiresInSeconds: 60,
        };
      },
    ),
    headObject: vi.fn(async (key: string) => {
      if (options.headMismatch)
        return {
          contentType: 'application/pdf',
          contentLength: originalDocument.length,
          metadata: {},
        };
      const existing = uploads.get(key);
      if (!existing)
        throw Object.assign(new Error('TEST_ONLY absent object'), {
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        });
      return {
        contentType: existing.contentType,
        contentLength:
          existing.checksumSha256 === hash(originalDocument)
            ? originalDocument.length
            : signedDocument.length,
        metadata: { sha256: existing.checksumSha256 },
      };
    }),
    presignDownloadForTenant: vi.fn(
      async (_input?: unknown): Promise<string> => {
        throw Error('Unexpected test download');
      },
    ),
    deleteObject: vi.fn(),
    deleteAllVersions: vi.fn(),
  };
  const signatures = {
    checkReadiness: vi.fn(async () => {
      trace.push('readiness');
      if (options.ready === false)
        throw Error('TEST_ONLY readiness unavailable');
      return {
        ok: true,
        verifierKind: 'stynx-cms',
        capabilities: {
          simulated: false,
          pades: true,
          tsa: true,
          lta: false,
          certificateValidation: ['ocsp'],
          evidenceSource: 'TEST_ONLY port',
          checkedAt: new Date(when),
        },
      };
    }),
    verify: vi.fn(async () => {
      trace.push('verify');
      return options.reply ?? reply();
    }),
  };
  const manifests = {
    prepareSession: vi.fn(),
    prepareBatch: vi.fn(),
    appendVerifiedSigner: vi.fn(),
    verifyManifest: vi.fn(),
  };
  const withdrawals = { verify: vi.fn() };
  const runtime = {
    assertConfigured: vi.fn(),
    resolveProfile: vi.fn(async () => ({
      policyId,
      profile: options.profile ?? profile,
    })),
    resolveRecordedProfile: vi.fn(async () => ({ policyId, profile })),
    resolveSignerCertificate: vi.fn(async () => fingerprint),
    resolvePartyCertificate: vi.fn(async () => fingerprint),
  };
  const fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
    trace.push('upload');
    const key = decodeURIComponent(String(_url).split('/put/')[1]!);
    const object = pending.get(key);
    expect(object).toBeDefined();
    expect(hash(init?.body as Uint8Array)).toBe(object!.checksumSha256);
    uploads.set(key, object!);
    expect(init?.method).toBe('PUT');
    return new Response(null, { status: 200 });
  });
  vi.stubGlobal('fetch', fetch);
  const store = new SignedDocumentStore(
    database as never,
    context as never,
    s3 as never,
    signatures as never,
    manifests as never,
    withdrawals as never,
    runtime as never,
  );
  return {
    store,
    database,
    context,
    s3,
    signatures,
    manifests,
    withdrawals,
    runtime,
    fetch,
    queries,
    trace,
  };
}
function untouched(h: Awaited<ReturnType<typeof harness>>) {
  expect(h.s3.presignUpload).not.toHaveBeenCalled();
  expect(h.fetch).not.toHaveBeenCalled();
  expect(h.s3.headObject).not.toHaveBeenCalled();
  expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
  expect(
    h.queries.filter((x) => /^\s*(?:insert|with)\b/iu.test(x.sql)),
  ).toEqual([]);
}
it('TEST_ONLY valid public-port proof is verified before uploads and app-role persistence', async () => {
  const h = await harness();
  const value = await h.store.writeVerifiedEvidence(input());
  expect(Object.keys(value).sort()).toEqual(
    [
      'evidenceId',
      'originalObjectId',
      'signedObjectId',
      'policyId',
      'trustProof',
    ].sort(),
  );
  for (const key of [
    'evidenceId',
    'originalObjectId',
    'signedObjectId',
  ] as const)
    expect(value[key]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
    );
  expect(value.policyId).toBe(policyId);
  expect(value.trustProof).toEqual(proof());
  expect(h.trace.indexOf('readiness')).toBeLessThan(h.trace.indexOf('verify'));
  expect(h.trace.indexOf('verify')).toBeLessThan(h.trace.indexOf('presign'));
  expect(h.trace.indexOf('upload')).toBeLessThan(h.trace.indexOf('insert'));
  expect(h.signatures.checkReadiness).toHaveBeenCalledWith(profile);
  expect(h.signatures.verify).toHaveBeenCalledWith(
    expect.objectContaining({
      tenantId: tenant,
      document: originalDocument,
      documentSha256: hash(originalDocument),
      signedDocument,
      cmsSignature,
      certificate,
      minimumSignatureLevel: 'ADVANCED',
      trustProfile: profile,
    }),
  );
  expect(h.s3.presignUpload).toHaveBeenCalledTimes(2);
  expect(
    h.s3.presignUpload.mock.calls.every(
      ([x]) => x.contentType === 'application/pdf' && x.key.includes(tenant),
    ),
  ).toBe(true);
  expect(h.queries.some((x) => x.sql.includes('signature_evidence'))).toBe(
    true,
  );
  expect(h.queries.flatMap((x) => x.values)).toContain(actor);
  expect(h.database.withSystemContext).not.toHaveBeenCalled();
});
it('public readiness refusal performs no verify/upload/INSERT', async () => {
  const h = await harness({ ready: false });
  await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
    REFUSAL,
  );
  expect(h.signatures.verify).not.toHaveBeenCalled();
  untouched(h);
});
for (const status of ['invalid', 'unknown'])
  it(`non-valid ${status} reply refuses before upload/INSERT`, async () => {
    const h = await harness({ reply: { ...reply(), status } });
    await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
      REFUSAL,
    );
    untouched(h);
  });
it('valid status without trustProof is not evidence', async () => {
  const h = await harness({ reply: { ...reply(), trustProof: undefined } });
  await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
    REFUSAL,
  );
  untouched(h);
});
for (const [name, patch] of [
  ['original-hash', { originalDocumentSha256: 'a'.repeat(64) }],
  ['signed-hash', { signedDocumentSha256: 'a'.repeat(64) }],
  ['cms-hash', { cmsSha256: 'a'.repeat(64) }],
  ['signer-hash', { signerCertificateSha256: 'a'.repeat(64) }],
  ['profile-id', { profileId: '00000000-0000-4000-8000-000000000399' }],
  ['profile-revision', { profileRevision: '4' }],
  ['consumer-verifier', { verifierKind: 'consumer-owned' }],
  ['wrong-pades', { padesProfile: 'PAdES-B-T' }],
  ['embedded-revocation', { revocationSource: 'embedded' }],
  ['missing-revocation', { revocationSource: 'none' }],
  ['zero-signature-time', { signedAt: new Date(0) }],
  ['invalid-tsa-time', { tsaAt: new Date(NaN) }],
  ['invalid-validation-time', { certificateValidatedAt: new Date(NaN) }],
  ['missing-verification-ref', { verificationRef: '' }],
] as const)
  it(`incoherent ${name} proof is rejected before any upload or INSERT`, async () => {
    const h = await harness({
      reply: { ...reply(), trustProof: { ...proof(), ...patch } },
    });
    await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
      REFUSAL,
    );
    untouched(h);
  });
it('below-minimum achieved signature level is not persisted', async () => {
  const h = await harness({
    profile: { ...profile, minimumSignatureLevel: 'QUALIFIED' },
  });
  await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
    REFUSAL,
  );
  untouched(h);
});
it('foreign input tenant cannot upload or write under current request context', async () => {
  const h = await harness();
  await expect(
    h.store.writeVerifiedEvidence({ ...input(), tenantId: foreign }),
  ).rejects.toMatchObject(REFUSAL);
  untouched(h);
  expect(h.signatures.verify).not.toHaveBeenCalled();
});
for (const field of ['actorId', 'trustProof', 'trustProfile', 'signedAt'])
  it(`caller-supplied ${field} is not accepted as an evidence fact`, async () => {
    const h = await harness();
    await expect(
      h.store.writeVerifiedEvidence({
        ...input(),
        [field]: 'TEST_ONLY forged',
      } as never),
    ).rejects.toMatchObject(REFUSAL);
    untouched(h);
  });
it('SQL failure after verified uploads returns no successful receipt and does not delete S3 objects', async () => {
  const h = await harness({ sqlFailure: true });
  await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
    REFUSAL,
  );
  expect(h.s3.presignUpload).toHaveBeenCalledTimes(2);
  expect(h.fetch).toHaveBeenCalledTimes(2);
  expect(h.s3.deleteObject).not.toHaveBeenCalled();
  expect(h.s3.deleteAllVersions).not.toHaveBeenCalled();
});
it('invalid evidence UUID refuses before any SQL or S3 reads', async () => {
  const h = await harness();
  await expect(
    h.store.readEvidence({
      tenantId: tenant,
      evidenceId: 'not-a-uuid',
      documentId: 'TEST_ONLY-document',
      documentKind: 'SESSION_MINUTES',
      signerId: 'TEST_ONLY person',
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.database.tx).not.toHaveBeenCalled();
  expect(h.s3.headObject).not.toHaveBeenCalled();
});
it('foreign evidence address refuses before SQL or S3', async () => {
  const h = await harness();
  await expect(
    h.store.readEvidence({
      tenantId: foreign,
      evidenceId,
      documentId: 'TEST_ONLY-document',
      documentKind: 'SESSION_MINUTES',
      signerId: 'TEST_ONLY person',
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.database.tx).not.toHaveBeenCalled();
  expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
});
it('absent evidence row is unavailable, never a synthetic verified artifact', async () => {
  const h = await harness();
  await expect(
    h.store.readEvidence({
      tenantId: tenant,
      evidenceId,
      documentId: 'TEST_ONLY-document',
      documentKind: 'SESSION_MINUTES',
      signerId: 'TEST_ONLY person',
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
});
it('withdrawal without exactly one original row is refused', async () => {
  const h = await harness();
  await expect(
    h.store.readWithdrawalEvidence({
      tenantId: tenant,
      documentId: 'TEST_ONLY-document',
      contentHash: hash(originalDocument),
      eligiblePartyIds: ['TEST_ONLY person'],
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.withdrawals.verify).not.toHaveBeenCalled();
});
it('foreign withdrawal tenant is refused before SQL or resolver access', async () => {
  const h = await harness();
  await expect(
    h.store.readWithdrawalEvidence({
      tenantId: foreign,
      documentId: 'TEST_ONLY-document',
      contentHash: hash(originalDocument),
      eligiblePartyIds: ['TEST_ONLY person'],
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.database.tx).not.toHaveBeenCalled();
  expect(h.runtime.resolvePartyCertificate).not.toHaveBeenCalled();
});
it('empty manifest source does not become a fabricated prepared or complete manifest', async () => {
  const h = await harness();
  await expect(
    h.store.readManifest({
      kind: 'session-minutes',
      tenantId: tenant,
      sessionId: 'TEST_ONLY session',
      minutesId: 'TEST_ONLY minutes',
      snapshotHash: 'a'.repeat(64),
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.manifests.verifyManifest).not.toHaveBeenCalled();
});
it('caller cannot append a forged manifest/proof object instead of evidence IDs', async () => {
  const h = await harness();
  await expect(
    h.store.appendManifestSigner({
      tenantId: tenant,
      manifestId: evidenceId,
      evidenceId,
      trustProof: proof(),
    } as never),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.manifests.appendVerifiedSigner).not.toHaveBeenCalled();
  untouched(h);
});

it('unsafe document ID is refused without relaxing the approved object-key grammar', async () => {
  const h = await harness();
  await expect(
    h.store.writeVerifiedEvidence({
      ...input(),
      documentId: 'TEST_ONLY document',
    }),
  ).rejects.toMatchObject(REFUSAL);
  untouched(h);
});
it('existing S3 object missing checksum metadata is not treated as absent', async () => {
  const h = await harness({ headMismatch: true });
  await expect(h.store.writeVerifiedEvidence(input())).rejects.toMatchObject(
    REFUSAL,
  );
  expect(h.s3.headObject).toHaveBeenCalled();
  expect(h.s3.presignUpload).not.toHaveBeenCalled();
  expect(h.fetch).not.toHaveBeenCalled();
  expect(
    h.queries.filter((x) => /^\s*(?:insert|with)\b/iu.test(x.sql)),
  ).toEqual([]);
});

// Additional source-review vectors; first execution waits for workspace SDK admission.
it('already-approved batch distribution minutes retain their exact object-key species', async () => {
  const h = await harness();
  await h.store.writeVerifiedEvidence({
    ...input(),
    documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  });
  expect(h.runtime.resolveProfile).toHaveBeenCalledWith(
    expect.objectContaining({ documentKind: 'BATCH_DISTRIBUTION_MINUTES' }),
  );
  expect(h.s3.presignUpload).toHaveBeenCalledTimes(2);
  for (const [request] of h.s3.presignUpload.mock.calls)
    expect(request.key).toMatch(
      new RegExp(
        `^${tenant}/signed-documents/BATCH_DISTRIBUTION_MINUTES/TEST_ONLY-document/[0-9a-f]{64}\\.pdf$`,
        'u',
      ),
    );
});
for (const documentKind of ['TEST_ONLY_UNKNOWN', '../SESSION_MINUTES'])
  it(`unapproved or path-injecting species ${documentKind} refuses before S3/persistence`, async () => {
    const h = await harness();
    await expect(
      h.store.writeVerifiedEvidence({ ...input(), documentKind }),
    ).rejects.toMatchObject(REFUSAL);
    untouched(h);
  });
it('a unique policy-positive ordinary decision cannot substitute for C03 withdrawal species binding', async () => {
  const h = await harness({
    readRows: [
      {
        id: evidenceId,
        tenant_id: tenant,
        document_id: 'TEST_ONLY-document',
        document_kind: 'DECISAO_DEFESA',
        signer_id: 'TEST_ONLY person',
        signature_policy_id: policyId,
        trust_profile_revision: '3',
        original_document_sha256: hash(originalDocument),
        signed_document_sha256: hash(signedDocument),
        cms_sha256: hash(cmsSignature),
        signer_certificate_sha256: fingerprint,
        status: 'verified',
      },
    ],
  });
  await expect(
    h.store.readWithdrawalEvidence({
      tenantId: tenant,
      documentId: 'TEST_ONLY-document',
      contentHash: hash(originalDocument),
      eligiblePartyIds: ['TEST_ONLY person'],
    }),
  ).rejects.toMatchObject(REFUSAL);
  expect(h.withdrawals.verify).not.toHaveBeenCalled();
  expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
});

// TEST_ONLY manifest public-port replies exercise consumer binding, not real JCS/CMS.
function manifestFixture() {
  const sourceObjectId = '00000000-0000-4000-8000-000000000701';
  const snapshot = new TextEncoder().encode('{"TEST_ONLY":"snapshot"}');
  const manifest = {
    manifestVersion: '1',
    canonicalization: 'RFC8785-JCS',
    kind: 'session-minutes',
    tenantId: tenant,
    aggregateId: 'TEST_ONLY-session',
    documentId: 'TEST_ONLY-public-minutes-binding',
    documentKind: 'SESSION_MINUTES',
    documentSha256: hash(originalDocument),
    snapshotSha256: hash(snapshot),
    requiredSignerIds: ['TEST_ONLY person'],
    preparedAt: when.toISOString(),
    sessionId: 'TEST_ONLY-session',
    minutesId: 'TEST_ONLY-minutes',
    signers: [],
    manifestSha256: 'b'.repeat(64),
  };
  const row = {
    id: evidenceId,
    tenant_id: tenant,
    kind: manifest.kind,
    aggregate_id: manifest.aggregateId,
    document_id: manifest.documentId,
    source_object_id: sourceObjectId,
    snapshot,
    snapshot_sha256: manifest.snapshotSha256,
    manifest_sha256: manifest.manifestSha256,
    signer_count: 0,
    manifest_json: manifest,
    created_at: new Date(when),
  };
  const object = {
    id: sourceObjectId,
    tenant_id: tenant,
    collection: 'signed-documents',
    object_key: `${tenant}/signed-documents/SESSION_MINUTES/${manifest.documentId}/${manifest.documentSha256}.pdf`,
    content_type: 'application/pdf',
    byte_size: originalDocument.length,
    checksum_sha256: manifest.documentSha256,
    classification: 'confidential',
  };
  return {
    sourceObjectId,
    snapshot,
    manifest,
    row,
    object,
    address: {
      kind: 'session-minutes' as const,
      tenantId: tenant,
      sessionId: manifest.sessionId,
      minutesId: manifest.minutesId,
      snapshotHash: manifest.snapshotSha256,
    },
  };
}
async function manifestHarness(
  patch: { object?: Record<string, unknown>; rows?: unknown[] } = {},
) {
  const f = manifestFixture();
  const h = await harness({
    queryRows: (sql) =>
      sql.includes('FROM storage.signature_manifest')
        ? (patch.rows ?? [f.row])
        : sql.includes('FROM storage.objects')
          ? [{ ...f.object, ...patch.object }]
          : [],
  });
  h.s3.headObject.mockResolvedValue({
    contentType: 'application/pdf',
    contentLength: originalDocument.length,
    metadata: { sha256: hash(originalDocument) },
  });
  h.s3.presignDownloadForTenant.mockResolvedValue(
    'https://s3.test.invalid/TEST_ONLY-download',
  );
  h.fetch.mockImplementation(
    async () => new Response(Buffer.from(originalDocument), { status: 200 }),
  );
  h.manifests.prepareSession.mockReturnValue(f.manifest);
  return { ...h, fixture: f };
}
it('real source UUID and differing public manifest document binding remain distinct', async () => {
  const h = await manifestHarness();
  const value = await h.store.readManifest(h.fixture.address);
  expect(Object.keys(value).sort()).toEqual(
    [
      'id',
      'sourceObjectId',
      'manifest',
      'sourceDocument',
      'snapshot',
      'preparedAt',
    ].sort(),
  );
  expect(value.sourceObjectId).toBe(h.fixture.sourceObjectId);
  expect(value.manifest.documentId).toBe(h.fixture.manifest.documentId);
  expect(value.sourceObjectId).not.toBe(value.manifest.documentId);
  expect(value.sourceDocument).toEqual(originalDocument);
  expect(value.snapshot).toEqual(h.fixture.snapshot);
  expect(value.preparedAt).toEqual(when);
  expect(h.manifests.prepareSession).toHaveBeenCalledWith(
    expect.objectContaining({ documentId: h.fixture.manifest.documentId }),
  );
  expect(h.manifests.verifyManifest).not.toHaveBeenCalled();
});
for (const [name, patch] of [
  ['foreign-source-tenant', { tenant_id: foreign }],
  ['different-source-UUID', { id: '00000000-0000-4000-8000-000000000799' }],
  ['different-source-checksum', { checksum_sha256: 'a'.repeat(64) }],
] as const)
  it(`manifest ${name} refuses instead of projecting unvalidated source identity`, async () => {
    const h = await manifestHarness({ object: patch });
    await expect(h.store.readManifest(h.fixture.address)).rejects.toMatchObject(
      REFUSAL,
    );
    expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
  });
it('latest manifest cannot replace its original count-zero source UUID', async () => {
  const f = manifestFixture();
  const latest = {
    ...f.row,
    signer_count: 1,
    manifest_json: {
      ...f.manifest,
      signers: [{ signerId: 'TEST_ONLY person' }],
    },
  };
  const original = {
    ...f.row,
    source_object_id: '00000000-0000-4000-8000-000000000799',
  };
  const h = await manifestHarness({ rows: [latest, original] });
  await expect(h.store.readManifest(f.address)).rejects.toMatchObject(REFUSAL);
  expect(h.s3.presignDownloadForTenant).not.toHaveBeenCalled();
  expect(h.manifests.appendVerifiedSigner).not.toHaveBeenCalled();
});

async function signedManifestHarness(
  wrongOriginalHash = false,
  patchOriginal: Record<string, unknown> = {},
  duplicateOriginal = false,
  gap = false,
) {
  const f = manifestFixture();
  const signed = {
    ...f.manifest,
    signers: [{ signatureId: evidenceId, signerId: 'TEST_ONLY person' }],
    manifestSha256: 'c'.repeat(64),
  };
  const latest = {
    ...f.row,
    id: '00000000-0000-4000-8000-000000000702',
    signer_count: 1,
    manifest_json: signed,
    manifest_sha256: signed.manifestSha256,
  };
  const original = { ...f.row, ...patchOriginal };
  if (gap) {
    latest.signer_count = 2;
    latest.manifest_json.signers.push({
      signatureId: '00000000-0000-4000-8000-000000000503',
      signerId: 'TEST_ONLY second person',
    });
  }
  const h = await manifestHarness({
    rows: [
      latest,
      ...(duplicateOriginal
        ? [{ ...original, id: '00000000-0000-4000-8000-000000000799' }]
        : []),
      original,
    ],
  });
  const evidence = {
    id: evidenceId,
    tenantId: tenant,
    documentId: f.sourceObjectId,
    documentKind: 'SESSION_MINUTES',
    signerId: 'TEST_ONLY person',
    policyId,
    trustProfileRevision: '3',
    originalDocumentSha256: wrongOriginalHash
      ? 'a'.repeat(64)
      : hash(originalDocument),
    signedDocument,
    cmsSignature,
    certificate,
    recorded: { signedAt: new Date(when) },
  };
  const read = vi
    .spyOn(h.store, 'readEvidence')
    .mockImplementation(async (address) => {
      if (address.documentId !== f.sourceObjectId)
        throw Object.assign(new Error(REFUSAL.message), REFUSAL);
      return evidence as never;
    });
  h.manifests.appendVerifiedSigner.mockResolvedValue(signed);
  return { ...h, read, signed };
}
it('signed manifest evidence addresses the actual source UUID while public document binding stays original', async () => {
  const h = await signedManifestHarness();
  const value = await h.store.readManifest(h.fixture.address);
  expect(value.sourceObjectId).toBe(h.fixture.sourceObjectId);
  expect(value.manifest.documentId).toBe(h.fixture.manifest.documentId);
  expect(h.read).toHaveBeenCalledWith(
    expect.objectContaining({
      documentId: h.fixture.sourceObjectId,
      evidenceId,
      documentKind: 'SESSION_MINUTES',
    }),
  );
  expect(h.manifests.appendVerifiedSigner).toHaveBeenCalledWith(
    h.fixture.manifest,
    expect.objectContaining({ signatureId: evidenceId }),
    { sourceDocument: originalDocument, snapshot: h.fixture.snapshot },
  );
  expect(h.manifests.verifyManifest).not.toHaveBeenCalled();
});
it('signed manifest rejects evidence for a different original source hash before appending', async () => {
  const h = await signedManifestHarness(true);
  await expect(h.store.readManifest(h.fixture.address)).rejects.toMatchObject(
    REFUSAL,
  );
  expect(h.manifests.appendVerifiedSigner).not.toHaveBeenCalled();
  expect(h.manifests.verifyManifest).not.toHaveBeenCalled();
});

for (const [name, change] of [
  [
    'public-document-family',
    (f: ReturnType<typeof manifestFixture>) => ({
      document_id: 'TEST_ONLY-other-document',
      manifest_json: { ...f.manifest, documentId: 'TEST_ONLY-other-document' },
    }),
  ],
  [
    'minutes-family',
    (f: ReturnType<typeof manifestFixture>) => ({
      manifest_json: { ...f.manifest, minutesId: 'TEST_ONLY-other-minutes' },
    }),
  ],
  [
    'original-required-signers',
    (f: ReturnType<typeof manifestFixture>) => ({
      manifest_json: {
        ...f.manifest,
        requiredSignerIds: ['TEST_ONLY replaced signer'],
      },
    }),
  ],
  [
    'original-prepared-at',
    (f: ReturnType<typeof manifestFixture>) => ({
      manifest_json: { ...f.manifest, preparedAt: '2026-10-13T11:00:00.000Z' },
    }),
  ],
] as const)
  it(`current manifest cannot replace ${name} from the retained original count-zero row`, async () => {
    const h = await signedManifestHarness(false, change(manifestFixture()));
    await expect(h.store.readManifest(h.fixture.address)).rejects.toMatchObject(
      REFUSAL,
    );
  });
it('duplicate original count-zero rows are ambiguous rather than an arbitrary selected family', async () => {
  const h = await signedManifestHarness(false, {}, true);
  await expect(h.store.readManifest(h.fixture.address)).rejects.toMatchObject(
    REFUSAL,
  );
});
it('a missing intermediate signer-count row cannot form a recoverable manifest history', async () => {
  const h = await signedManifestHarness(false, {}, false, true);
  await expect(h.store.readManifest(h.fixture.address)).rejects.toMatchObject(
    REFUSAL,
  );
});
