// Inspector TEST_ONLY thin-adapter consumer-port tests; not genuine CMS/provider/floor/SQL/S3 proof.
import { createHash, X509Certificate } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
const CERT_PEM =
  '-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIJAOVbcxQMV2gpMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV\nBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDAeFw0yNjA5MjgxNTQyMTlaFw0zNjA5\nMjUxNTQyMTlaMCAxHjAcBgNVBAMMFVNUWU5YIFRlc3QgVHJ1c3QgUm9vdDCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM+3+GmdyZkWro3WSGA+z0cZA3/n\n2EhtExBeQpC2brCNn1MjsG+nc1Bqki9aVa3TO46CzM/1QxtDGNG+kpLfq6I7LQ13\nb2Y2JRjrJatgQPtBEdZAwTs8G4hx+/tcag+TFAqVppTPS+nkwdHS/nqebr7QvzTP\nribyJ9NQPY9bBNI23nvahe7bN9QFXn4w4FWcpTZLue0LDCjM9HpKvWv1W/QdVdO5\njID7kapIDj8SzV81IC/jy/URGQzUghUCiDUL4ftQpdjo2SYoq+/XBglnwhjKOXPx\no8N10PbphTKaRSrvs/0fDtyInczYQ/CaF99rPRp4qpO7KE3iwhlkbtNjD7MCAwEA\nAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYE\nFGjo7/hiHc+B+I2+SKQdiIYqGTv8MB8GA1UdIwQYMBaAFGjo7/hiHc+B+I2+SKQd\niIYqGTv8MA0GCSqGSIb3DQEBCwUAA4IBAQBSGigMBLptifruCVNcJGPvoV/fa60A\nOiWu4EKfO6qKXPH14h2Zlwc0lfU19g57LiGoAhvOfOhv2Qu1JekqOtsk1SVpP1Hq\nyEDBtwAsvJvmDrk7MHDWuocRPq2ze5swre+zmKrhemNRYDgYBWw/VE7oyf0gyCCG\nRyIMulzVXu1ynLrEG83MUXDwfSrjLkRisBtZbGoP0wy2a0wpxqPAj6rLOsNBy/eU\nePii00YkSeEoypIStNgZ1SLQTjnNwGWLolNDGhU4PFaYCmeZB5IwlSiJZjh1e9tn\n59Rd1eTshw4yzwihOyvPLPENg72FZ6VZHQRcR+wGMHabTKr3dT927+49\n-----END CERTIFICATE-----\n';
const certificateObject = new X509Certificate(CERT_PEM);
const hash = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const tenant = '00000000-0000-7000-8000-000000000101',
  signer = '00000000-0000-4000-8000-000000000201',
  policyId = '00000000-0000-4000-8000-000000000301',
  evidenceId = '00000000-0000-4000-8000-000000000501',
  sourceObjectId = '00000000-0000-4000-8000-000000000701';
const at = new Date('2026-10-13T12:00:00.000Z');
const original = new TextEncoder().encode(
    '%PDF-1.7\nTEST_ONLY original\n%%EOF',
  ),
  signed = new TextEncoder().encode('%PDF-1.7\nTEST_ONLY signed\n%%EOF'),
  cms = new TextEncoder().encode('TEST_ONLY not CMS');
const fingerprint = hash(certificateObject.raw);
const certificate = {
  subject: certificateObject.subject,
  issuer: certificateObject.issuer,
  serialNumber: certificateObject.serialNumber,
  pem: CERT_PEM,
};
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
const unavailable = { name: 'ServiceUnavailableException', status: 503 };
const refusal = {
  name: 'DetranError',
  code: 'RAIT.SIGNATURE_FAILED',
  status: 502,
  messageKey: 'rait.errors.signature_failed',
  message: 'A evidência documental não pôde ser validada.',
};
function input() {
  return {
    tenantId: tenant,
    signatureRef: evidenceId,
    documentId: sourceObjectId,
    contentHash: hash(original),
    expectedSignerPersonId: signer,
  };
}
function proof() {
  return {
    verifierKind: 'stynx-cms',
    profileId: policyId,
    profileRevision: '3',
    achievedLevel: 'ADVANCED',
    padesProfile: 'PAdES-B-LT',
    originalDocumentSha256: hash(original),
    signedDocumentSha256: hash(signed),
    cmsSha256: hash(cms),
    signerCertificateSha256: fingerprint,
    chainSha256: [fingerprint],
    signedAt: new Date(at),
    tsaAt: new Date(at),
    certificateValidatedAt: new Date(at),
    revocationSource: 'ocsp',
    verificationRef: 'TEST_ONLY public-port observation',
  };
}
function evidence() {
  return {
    id: evidenceId,
    tenantId: tenant,
    documentId: sourceObjectId,
    documentKind: 'DECISAO_DEFESA',
    signerId: signer,
    policyId,
    trustProfileRevision: '3',
    originalObjectId: sourceObjectId,
    signedObjectId: '00000000-0000-4000-8000-000000000702',
    originalDocument: original.slice(),
    signedDocument: signed.slice(),
    cmsSignature: cms.slice(),
    certificate,
    originalDocumentSha256: hash(original),
    signedDocumentSha256: hash(signed),
    cmsSha256: hash(cms),
    signerCertificateSha256: fingerprint,
    recorded: {
      achievedLevel: 'ADVANCED',
      padesProfile: 'PAdES-B-LT',
      revocationSource: 'ocsp',
      signedAt: new Date(at),
      tsaAt: new Date(at),
      certificateValidatedAt: new Date(at),
      verificationRef: 'TEST_ONLY public-port observation',
    },
  };
}
function reply() {
  return {
    status: 'valid',
    documentSha256: hash(original),
    checkedAt: new Date(at),
    signatureLevel: 'ADVANCED',
    verifierKind: 'stynx-cms',
    trustProof: proof(),
    signerCertificate: certificate,
    revocationSource: 'ocsp',
    revocationCheckedAt: new Date(at),
    reasons: [],
  };
}
function environment() {
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
    missing?: number;
    reply?: Record<string, unknown>;
    evidence?: Record<string, unknown>;
    fingerprint?: string;
    readyError?: boolean;
  } = {},
) {
  environment();
  const trace: string[] = [];
  const signatures = {
    checkReadiness: vi.fn(async (_p: unknown) => {
      trace.push('readiness');
      if (options.readyError) throw Error('TEST_ONLY_SENTINEL_NEVER_LOG');
      return { ok: true, verifierKind: 'stynx-cms' };
    }),
    verify: vi.fn(async (_r: unknown) => {
      trace.push('verify');
      return options.reply ?? reply();
    }),
  };
  const manifests = { verifyManifest: vi.fn() };
  const withdrawals = { verify: vi.fn() };
  const documents = {
    readEvidence: vi.fn(async (_r: unknown) => {
      trace.push('read-evidence');
      return options.evidence ?? evidence();
    }),
    readManifest: vi.fn(async (_r: unknown) => ({
      id: evidenceId,
      sourceObjectId,
      manifest: {
        manifestVersion: '1',
        canonicalization: 'RFC8785-JCS',
        kind: 'session-minutes',
        tenantId: tenant,
        aggregateId: 'TEST_ONLY-session',
        documentId: 'TEST_ONLY-public-binding-differs',
        documentKind: 'SESSION_MINUTES',
        documentSha256: hash(original),
        snapshotSha256: 'a'.repeat(64),
        requiredSignerIds: [signer],
        preparedAt: at.toISOString(),
        sessionId: 'TEST_ONLY-session',
        minutesId: 'TEST_ONLY-minutes',
        signers: [],
        manifestSha256: 'b'.repeat(64),
      },
      sourceDocument: original.slice(),
      snapshot: new TextEncoder().encode('TEST_ONLY snapshot'),
      preparedAt: new Date(at),
    })),
    readWithdrawalEvidence: vi.fn(async (_r: unknown) => {
      throw Object.assign(Error(refusal.message), refusal);
    }),
    verifyManifest: vi.fn(async (_r: unknown) => ({ status: 'valid' })),
  };
  const runtime = {
    assertConfigured: vi.fn(() => {
      trace.push('configuration');
    }),
    resolveRecordedProfile: vi.fn(async (_r: unknown) => {
      trace.push('recorded-profile');
      return { policyId, profile };
    }),
    resolveProfile: vi.fn(),
    resolveSignerCertificate: vi.fn(
      async (_tenant: unknown, _person: unknown) =>
        options.fingerprint ?? fingerprint,
    ),
    resolvePartyCertificate: vi.fn(),
  };
  const fetchPort = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          documentManifest: true,
          padesLt: true,
          tsa: true,
          withdrawalEvidence: true,
          certificateValidation: ['OCSP'],
        }),
        { status: 200 },
      ),
  );
  vi.stubGlobal('fetch', fetchPort);
  const { DocumentTrustHttpAdapter } =
    await import('../../../domains/shared/src/documents/document-trust.http-adapter.js');
  const bindings = [signatures, manifests, withdrawals, documents, runtime];
  const adapter = new DocumentTrustHttpAdapter(
    (options.missing === 0 ? undefined : bindings[0]) as never,
    (options.missing === 1 ? undefined : bindings[1]) as never,
    (options.missing === 2 ? undefined : bindings[2]) as never,
    (options.missing === 3 ? undefined : bindings[3]) as never,
    (options.missing === 4 ? undefined : bindings[4]) as never,
  );
  return {
    adapter,
    signatures,
    manifests,
    withdrawals,
    documents,
    runtime,
    fetchPort,
    trace,
    DocumentTrustHttpAdapter,
  };
}
it('source thin evidence operation uses genuine local ports instead of documentary HTTP', () => {
  const s = readFileSync(
    new URL(
      '../../../domains/shared/src/documents/document-trust.http-adapter.ts',
      import.meta.url,
    ),
    'utf8',
  );
  const body = s.slice(
    s.indexOf('  async verifySignatureEvidence('),
    s.indexOf('  async verifyBatchMinutesEvidence('),
  );
  for (const method of [
    'readEvidence',
    'resolveRecordedProfile',
    'resolveSignerCertificate',
    'checkReadiness',
    '.verify(',
  ])
    expect(body).toContain(method);
  expect(body).not.toContain('request(config.verifyUrl');
});
it('source get-manifest projection uses actual immutable sourceObjectId', () => {
  const s = readFileSync(
    new URL(
      '../../../domains/shared/src/documents/document-trust.http-adapter.ts',
      import.meta.url,
    ),
    'utf8',
  );
  expect(s).toContain('sourceObjectId');
  expect(s).toContain('readManifest');
});
it('no-argument adapter with configured HTTP env refuses relevant missing ports before HTTP', async () => {
  const h = await harness();
  const a = new h.DocumentTrustHttpAdapter();
  await expect(a.verifySignatureEvidence(input())).rejects.toMatchObject(
    unavailable,
  );
  expect(h.fetchPort).not.toHaveBeenCalled();
});
for (const missing of [0, 3, 4])
  it(`missing relevant evidence binding${missing} refuses503 before any port I/O`, async () => {
    const h = await harness({ missing });
    await expect(
      h.adapter.verifySignatureEvidence(input()),
    ).rejects.toMatchObject(unavailable);
    expect(h.fetchPort).not.toHaveBeenCalled();
    expect(h.documents.readEvidence).not.toHaveBeenCalled();
    expect(h.signatures.verify).not.toHaveBeenCalled();
  });
for (const missing of [1, 2])
  it(`unused evidence binding${missing} absence does not substitute for real operation readiness`, async () => {
    const h = await harness({ missing });
    await expect(
      h.adapter.verifySignatureEvidence(input()),
    ).resolves.toMatchObject({
      documentId: sourceObjectId,
      signerPersonId: signer,
    });
    expect(h.signatures.checkReadiness).toHaveBeenCalledWith(profile);
    expect(h.fetchPort).not.toHaveBeenCalled();
  });
it('each evidence call resolves recorded policy at actual signed time and performs public readiness before verification', async () => {
  const h = await harness();
  await h.adapter.verifySignatureEvidence(input());
  await h.adapter.verifySignatureEvidence(input());
  expect(h.runtime.resolveRecordedProfile).toHaveBeenCalledTimes(2);
  expect(h.runtime.resolveRecordedProfile).toHaveBeenCalledWith({
    tenantId: tenant,
    policyId,
    documentKind: 'DECISAO_DEFESA',
    at,
  });
  expect(h.runtime.resolveProfile).not.toHaveBeenCalled();
  expect(h.signatures.checkReadiness).toHaveBeenCalledTimes(2);
  expect(h.trace.indexOf('readiness')).toBeLessThan(h.trace.indexOf('verify'));
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('consumer translation passes exact original/signed/CMS bytes and real minimum+profile to public verify', async () => {
  const h = await harness();
  const actual = await h.adapter.verifySignatureEvidence(input());
  expect(h.signatures.verify).toHaveBeenCalledWith({
    tenantId: tenant,
    document: original,
    documentSha256: hash(original),
    signedDocument: signed,
    cmsSignature: cms,
    certificate,
    minimumSignatureLevel: 'ADVANCED',
    trustProfile: profile,
  });
  expect(actual).toEqual({
    signatureRef: evidenceId,
    documentId: sourceObjectId,
    contentHash: hash(original),
    signerPersonId: signer,
    documentKind: 'DECISAO_DEFESA',
    padesLevel: 'PAdES-B-LT',
    tsaAt: at.toISOString(),
    certificateValidationSource: 'OCSP',
    certificateValidationStatus: 'GOOD',
    certificateValidatedAt: at.toISOString(),
  });
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('readiness error translates to sanitized typed S08 before verify and no HTTP fallback', async () => {
  const h = await harness({ readyError: true });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).rejects.toMatchObject(refusal);
  expect(h.signatures.verify).not.toHaveBeenCalled();
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('trusted signer fingerprint mismatch retains precise CERT_MISMATCH422', async () => {
  const h = await harness({ fingerprint: 'f'.repeat(64) });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).rejects.toMatchObject({
    name: 'DetranError',
    code: 'RAIT.SIGNATURE_CERT_MISMATCH',
    status: 422,
    messageKey: 'rait.errors.signature_cert_mismatch',
  });
  expect(h.fetchPort).not.toHaveBeenCalled();
});
for (const [name, patch] of [
  ['absent-proof', { trustProof: undefined }],
  ['nonvalid', { status: 'unknown' }],
  ['wrong-proof-profile', { trustProof: { ...proof(), profileId: 'other' } }],
  [
    'wrong-original-hash',
    { trustProof: { ...proof(), originalDocumentSha256: 'f'.repeat(64) } },
  ],
  ['wrong-revision', { trustProof: { ...proof(), profileRevision: '4' } }],
] as const)
  it(`public verify ${name} cannot become a trusted evidence receipt`, async () => {
    const h = await harness({ reply: { ...reply(), ...patch } });
    await expect(
      h.adapter.verifySignatureEvidence(input()),
    ).rejects.toMatchObject(refusal);
    expect(h.fetchPort).not.toHaveBeenCalled();
  });
it('get-session manifest projects real source UUID while public manifest document binding remains distinct', async () => {
  const h = await harness();
  const address = {
    tenantId: tenant,
    sessionId: 'TEST_ONLY-session',
    minutesId: 'TEST_ONLY-minutes',
    snapshotHash: 'a'.repeat(64),
  };
  const result = await h.adapter.getSessionMinutesManifest(address);
  expect(h.documents.readManifest).toHaveBeenCalledWith({
    kind: 'session-minutes',
    ...address,
  });
  expect(result).toEqual({
    tenantId: tenant,
    aggregateId: 'TEST_ONLY-session',
    documentId: sourceObjectId,
    contentHash: hash(original),
    snapshotHash: address.snapshotHash,
    manifestHash: 'b'.repeat(64),
    documentKind: 'SESSION_MINUTES',
    manifestVersion: 'session-minutes-v1',
    preparedAt: at.toISOString(),
  });
  expect(result.documentId).not.toBe('TEST_ONLY-public-binding-differs');
  expect(h.fetchPort).not.toHaveBeenCalled();
});
for (const [name, call] of [
  [
    'session',
    (a: Awaited<ReturnType<typeof harness>>['adapter']) =>
      a.prepareSessionMinutesManifest({
        tenantId: tenant,
        sessionId: 'TEST_ONLY-session',
        minutesId: 'TEST_ONLY-minutes',
        snapshotHash: 'a'.repeat(64),
        snapshotVersion: 'session-minutes-v1',
        requiredSignerPersonIds: [signer],
        idempotencyKey: 'TEST_ONLY',
      }),
  ],
  [
    'batch',
    (a: Awaited<ReturnType<typeof harness>>['adapter']) =>
      a.prepareBatchMinutesManifest({
        tenantId: tenant,
        batchId: 'TEST_ONLY-batch',
        snapshotHash: 'a'.repeat(64),
        snapshotVersion: 'draw-v1',
        idempotencyKey: 'TEST_ONLY',
      }),
  ],
] as const)
  it(`C02 ${name} preparation with no committed original PDF source remains typed failclosed and never documentary HTTP`, async () => {
    const h = await harness();
    await expect(call(h.adapter)).rejects.toMatchObject(refusal);
    expect(h.fetchPort).not.toHaveBeenCalled();
  });
it('C03 absent authoritative withdrawal species stays typed failclosed without HTTP or verifier shortcut', async () => {
  const h = await harness();
  await expect(
    h.adapter.verifyWithdrawalEvidence({
      tenantId: tenant,
      caseId: 'TEST_ONLY-case',
      documentId: sourceObjectId,
      contentHash: hash(original),
      eligiblePartyIds: [signer],
    }),
  ).rejects.toMatchObject(refusal);
  expect(h.fetchPort).not.toHaveBeenCalled();
  expect(h.withdrawals.verify).not.toHaveBeenCalled();
});

// Independent public-result shape delta: published regulated native verify omits these optional top-level fields.
it('public result seam native optional fields absent', async () => {
  const native: Record<string, unknown> = reply();
  delete native.signerCertificate;
  delete native.revocationCheckedAt;
  const h = await harness({ reply: native });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).resolves.toMatchObject({
    signatureRef: evidenceId,
    documentId: sourceObjectId,
    contentHash: hash(original),
    signerPersonId: signer,
  });
  expect(h.signatures.verify).toHaveBeenCalledOnce();
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('public result seam present signer certificate mismatch', async () => {
  const changed = Buffer.from(certificateObject.raw);
  changed[changed.length - 1] = changed[changed.length - 1]! ^ 1;
  const other = new X509Certificate(changed).toString();
  const h = await harness({
    reply: { ...reply(), signerCertificate: { ...certificate, pem: other } },
  });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).rejects.toMatchObject(refusal);
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('public result seam present revocation time mismatch', async () => {
  const h = await harness({
    reply: { ...reply(), revocationCheckedAt: new Date(at.getTime() + 1000) },
  });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).rejects.toMatchObject(refusal);
  expect(h.fetchPort).not.toHaveBeenCalled();
});
it('public result seam recorded verification reference mismatch', async () => {
  const saved = evidence();
  saved.recorded.verificationRef = 'TEST_ONLY different immutable observation';
  const h = await harness({ evidence: saved });
  await expect(
    h.adapter.verifySignatureEvidence(input()),
  ).rejects.toMatchObject(refusal);
  expect(h.fetchPort).not.toHaveBeenCalled();
});
