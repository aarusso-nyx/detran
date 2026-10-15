// Genuine public CMS verification of immutable TEST_ONLY synthetic PKI. No provider/approved floor or sign backend.
import { createHash, X509Certificate } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import type {
  SignatureTrustProfile,
  CmsTrustVerifierOptions,
} from '@stynx-nyx/signature';
const directory = new URL(
  '../fixtures/stynx-signature-test-pki/',
  import.meta.url,
);
const hash = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const bytes = (name: string) => readFileSync(new URL(name, directory));
const pem = (name: string) => bytes(name).toString('utf8');
const clock = () => new Date('2026-09-29T12:00:00.000Z');
const api = () => import('@stynx-nyx/signature');
function profile(): SignatureTrustProfile {
  return {
    id: 'clinical-test',
    revision: '1',
    environment: 'test',
    minimumSignatureLevel: 'ADVANCED',
    requiredPadesProfile: 'PAdES-B-LT',
    requireTsa: true,
    requireLta: false,
    revocation: 'ocsp-or-crl',
    trustAnchorsPem: [pem('root.cert.pem')],
    acceptedPolicies: ['1.2.3.4.5.6.7'],
    atTime: 'trusted-timestamp',
  };
}
function input() {
  return {
    tenantId: '00000000-0000-7000-8000-000000000101',
    originalDocument: bytes('pades-source.pdf'),
    signedDocument: bytes('pades-blt.pdf'),
    cmsSignature: bytes('pades-blt.cms.der'),
    certificate: {
      subject: 'CN=STYNX Test Signer',
      issuer: 'CN=STYNX Test Trust Root',
      serialNumber: '1001',
      pem: pem('signer.cert.pem'),
    },
    profile: profile(),
  };
}
async function verifier(patch: Partial<CmsTrustVerifierOptions> = {}) {
  const s = await api();
  return s.createCmsTrustVerifier({
    trustAnchorsPem: [pem('root.cert.pem')],
    tsaTrustAnchorsPem: [pem('root.cert.pem')],
    acceptedPolicies: ['1.2.3.4.5.6.7'],
    now: clock,
    ...patch,
  });
}
async function typedTrustRefusal(promise: Promise<unknown>) {
  const s = await api();
  let error: unknown;
  try {
    await promise;
  } catch (observed) {
    error = observed;
  }
  expect(error).toBeInstanceOf(s.SignatureError);
  expect([
    'SignatureTrustError',
    'SignatureEvidenceMismatchError',
    'SignatureTrustUnavailableError',
  ]).toContain((error as Error).name);
}
it('synthetic PKI copies exactly match13 source-bound public blobs and contain no private key', () => {
  const raw = bytes('TEST_ONLY-INVENTORY.json');
  expect(hash(raw)).toBe(
    'afa1c423b278fe2893d179cecb7f4d7f6ef1d0ad5ac1049eab0974a5a75d33a2',
  );
  const inventory = JSON.parse(raw.toString('utf8'));
  expect(inventory.sourceCommit).toBe(
    '3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',
  );
  expect(inventory.kind).toBe(
    'TEST_ONLY_PUBLIC_PKI_NOT_PROVIDER_OR_APPROVED_TRUST',
  );
  expect(inventory.privateKeysCopied).toBe(false);
  expect(inventory.files).toHaveLength(13);
  const names = inventory.files.map((f: { sourcePath: string }) =>
    f.sourcePath.split('/').at(-1),
  );
  expect(readdirSync(directory).sort()).toEqual(
    [...names, 'TEST_ONLY-INVENTORY.json'].sort(),
  );
  for (const entry of inventory.files) {
    const value = bytes(entry.sourcePath.split('/').at(-1));
    expect(value.length).toBe(entry.bytes);
    expect(hash(value)).toBe(entry.sha256);
    expect(value.toString('ascii')).not.toContain('PRIVATE KEY');
  }
  expect(new X509Certificate(pem('signer.cert.pem')).raw).toEqual(
    bytes('signer.cert.der'),
  );
});
it('genuine STYNX verifier brand, test-profile capabilities and service readiness are real public calls', async () => {
  const s = await api(),
    v = await verifier();
  expect(s.isCmsTrustVerifier(v)).toBe(true);
  expect(await v.capabilities(profile())).toMatchObject({
    simulated: false,
    pades: true,
    tsa: true,
    lta: false,
    evidenceSource: 'stynx-cms',
    checkedAt: clock(),
  });
  // Capability freshness is an actual observation; historical signed-artifact validation below keeps its fixture clock.
  const observedVerifier = await verifier({ now: () => new Date() });
  const service = new s.SignatureService(undefined, {
    trustVerifier: observedVerifier,
  });
  const before = Date.now();
  const readiness = await service.checkReadiness(profile());
  const after = Date.now();
  expect(readiness).toMatchObject({ ok: true, verifierKind: 'stynx-cms' });
  expect(readiness.capabilities.checkedAt.getTime()).toBeGreaterThanOrEqual(
    before,
  );
  expect(readiness.capabilities.checkedAt.getTime()).toBeLessThanOrEqual(after);
});
it('genuine self-contained B-LT proves exact original/signed/CMS/certificate bytes plus embedded TSA and revocation', async () => {
  const v = await verifier(),
    i = input(),
    proof = await v.verifySignedArtifact(i);
  expect(proof).toMatchObject({
    verifierKind: 'stynx-cms',
    profileId: 'clinical-test',
    profileRevision: '1',
    achievedLevel: 'ADVANCED',
    padesProfile: 'PAdES-B-LT',
    originalDocumentSha256: hash(i.originalDocument),
    signedDocumentSha256: hash(i.signedDocument),
    cmsSha256: hash(i.cmsSignature),
    signerCertificateSha256: hash(bytes('signer.cert.der')),
  });
  expect(proof.chainSha256.length).toBeGreaterThan(0);
  expect(proof.tsaAt.getTime()).toBeGreaterThan(0);
  expect(proof.signedAt.getTime()).toBeGreaterThan(0);
  expect(proof.certificateValidatedAt).toEqual(proof.tsaAt);
  expect(['ocsp', 'crl']).toContain(proof.revocationSource);
  expect(proof.verificationRef).toBeTruthy();
});
it('genuine SignatureService regulated verify needs no backend and preserves canonical proof without invented optional fields', async () => {
  const s = await api(),
    v = await verifier(),
    i = input();
  const service = new s.SignatureService(undefined, { trustVerifier: v });
  const result = await service.verify({
    tenantId: i.tenantId,
    document: i.originalDocument,
    documentSha256: hash(i.originalDocument),
    signedDocument: i.signedDocument,
    cmsSignature: i.cmsSignature,
    certificate: i.certificate,
    minimumSignatureLevel: 'ADVANCED',
    trustProfile: i.profile,
  });
  expect(result).toMatchObject({
    status: 'valid',
    verifierKind: 'stynx-cms',
    signatureLevel: 'ADVANCED',
    trustProof: {
      cmsSha256: hash(i.cmsSignature),
      signerCertificateSha256: hash(bytes('signer.cert.der')),
      padesProfile: 'PAdES-B-LT',
    },
  });
  expect(result.signerCertificate).toBeUndefined();
  expect(result.revocationCheckedAt).toBeUndefined();
});
for (const field of [
  'originalDocument',
  'signedDocument',
  'cmsSignature',
] as const)
  it(`genuine verifier refuses tampered ${field} with public typed trust error`, async () => {
    const v = await verifier(),
      i = input();
    const changed = Buffer.from(i[field]);
    const offset = field === 'signedDocument' ? 40 : changed.length - 1;
    changed[offset] = changed[offset]! ^ 1;
    i[field] = changed;
    await typedTrustRefusal(v.verifySignedArtifact(i));
    expect(
      hash(
        bytes(
          field === 'originalDocument'
            ? 'pades-source.pdf'
            : field === 'signedDocument'
              ? 'pades-blt.pdf'
              : 'pades-blt.cms.der',
        ),
      ),
    ).not.toBe(hash(changed));
  });
it('genuine verifier refuses a different supplied signer despite valid original signed artifacts', async () => {
  const v = await verifier(),
    i = input();
  i.certificate = { ...i.certificate, pem: pem('root.cert.pem') };
  await typedTrustRefusal(v.verifySignedArtifact(i));
});
it('genuine verifier refuses disjoint root2 trust without relabeling it approved', async () => {
  const v = await verifier({
      trustAnchorsPem: [pem('root2.cert.pem')],
      tsaTrustAnchorsPem: [pem('root2.cert.pem')],
    }),
    i = input();
  i.profile = { ...i.profile, trustAnchorsPem: [pem('root2.cert.pem')] };
  await typedTrustRefusal(v.verifySignedArtifact(i));
});
it('genuine verifier refuses missing trust anchors with public trust error', async () => {
  const v = await verifier({ trustAnchorsPem: [], tsaTrustAnchorsPem: [] });
  await typedTrustRefusal(v.verifySignedArtifact(input()));
});
it('genuine verifier refuses a profile policy absent from the signed certificate', async () => {
  const v = await verifier({ acceptedPolicies: ['1.2.3.4.5.999'] }),
    i = input();
  i.profile = { ...i.profile, acceptedPolicies: ['1.2.3.4.5.999'] };
  await typedTrustRefusal(v.verifySignedArtifact(i));
});
it('genuine verifier refuses retained real revoked-OCSP synthetic signed artifacts', async () => {
  const v = await verifier(),
    i = input();
  await expect(
    v.verifySignedArtifact({
      ...i,
      originalDocument: bytes('pades-revoked-ocsp-source.pdf'),
      signedDocument: bytes('pades-revoked-ocsp-blt.pdf'),
      cmsSignature: bytes('pades-revoked-ocsp-blt.cms.der'),
      profile: { ...i.profile, revocation: 'ocsp' },
    }),
  ).rejects.toMatchObject({
    name: 'SignatureTrustError',
    message: 'Certificate revoked',
  });
});
