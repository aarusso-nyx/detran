// Actual Nest/class/private-holder lifecycle with TEST_ONLY DB/context/S3 boundary ports.
// One Root-sealed scenario per fresh worker; no holder reset, private export or SDK mocks.
import { X509Certificate } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it, vi } from 'vitest';
import type { INestApplicationContext } from '@nestjs/common';
const scenarios = [
  'valid-detachment',
  'empty',
  'malformed',
  'duplicate',
  'parser-throw',
  'one-shot-empty-unavailable',
] as const;
it('actual module bootstrap holder scenario', async () => {
  const guard = (globalThis as Record<symbol, unknown>)[
    Symbol.for('detran.r22.signature-unit-guard')
  ] as { installed: boolean; configPath: string; clean(): void };
  expect(guard?.installed).toBe(true);
  guard.clean();
  const config = JSON.parse(readFileSync(guard.configPath, 'utf8'));
  const scenario = config.bootstrapScenario;
  expect(scenarios).toContain(scenario);
  const rootPem = readFileSync(
    new URL(
      '../fixtures/stynx-signature-test-pki/root.cert.pem',
      import.meta.url,
    ),
    'utf8',
  );
  const row = {
    document_kind: 'DECISAO_DEFESA',
    minimum_signature_level: 'ADVANCED',
    pades_level: 'PAdES-B-LT',
    tsa_required: true,
    require_lta: false,
    revocation: 'ocsp-or-crl',
    at_time: 'trusted-timestamp',
    accepted_policies: ['1.2.3.4.5.6.7'],
    trust_anchors_pem: [rootPem],
    source_ref: 'TEST_ONLY synthetic source NOT_APPROVED',
    approved_by: 'TEST_ONLY approval fixture NOT_REAL',
    approved_at: new Date('2026-09-29T12:00:00.000Z'),
  };
  let rows: Record<string, unknown>[] = [];
  if (scenario === 'valid-detachment') rows = [row];
  else if (scenario === 'malformed') rows = [{ ...row, approved_by: null }];
  else if (scenario === 'duplicate')
    rows = [row, { ...row, source_ref: 'TEST_ONLY duplicate source' }];
  else if (scenario === 'parser-throw')
    rows = [
      {
        ...row,
        trust_anchors_pem: ['TEST_ONLY invalid certificate parse input'],
      },
    ];
  const portCalls: Array<{
    operation: string;
    reason?: string;
    options?: unknown;
    statement?: string;
    parameters?: unknown;
  }> = [];
  let administrativeFrame = false,
    requestCalls = 0,
    s3Calls = 0;
  const database = {
    async withSystemContext<T>(
      reason: string,
      work: () => Promise<T>,
    ): Promise<T> {
      portCalls.push({ operation: 'withSystemContext', reason });
      expect(reason).toBe(
        'DETRAN approved signature floor bootstrap (read only)',
      );
      expect(administrativeFrame).toBe(false);
      administrativeFrame = true;
      try {
        return await work();
      } finally {
        administrativeFrame = false;
      }
    },
    async tx<T>(
      work: (tx: {
        query(
          statement: string,
          parameters?: unknown,
        ): Promise<{ rows: Record<string, unknown>[] }>;
      }) => Promise<T>,
      options: unknown,
    ): Promise<T> {
      expect(administrativeFrame).toBe(true);
      expect(options).toEqual({ role: 'owner', readonly: true, retry: false });
      portCalls.push({ operation: 'tx', options });
      return work({
        query: async (statement, parameters) => {
          portCalls.push({ operation: 'query', statement, parameters });
          expect(statement.replace(/\s+/gu, ' ').trim()).toBe(
            'SELECT document_kind,minimum_signature_level,pades_level, tsa_required,require_lta,revocation,at_time,accepted_policies,trust_anchors_pem,source_ref,approved_by,approved_at FROM inf.signature_policy_floor_ref ORDER BY document_kind',
          );
          expect(parameters).toBeUndefined();
          return { rows };
        },
      });
    },
  };
  const requestContext = {
    hasActiveContext: () => false,
    snapshot: () => {
      requestCalls++;
      throw Error('TEST_ONLY unexpected request context read');
    },
  };
  const denyS3 = () => {
    s3Calls++;
    throw Error('TEST_ONLY unexpected S3 operation');
  };
  const storage = {
    putObject: denyS3,
    getObject: denyS3,
    headObject: denyS3,
    deleteObject: denyS3,
    listObjects: denyS3,
    presignGet: denyS3,
    presignPut: denyS3,
  };
  vi.stubEnv('DETRAN_RUNTIME_PROFILE', 'test');
  vi.stubEnv('DETRAN_DOCUMENT_TRUST_URL', 'https://trust.test.invalid/verify');
  vi.stubEnv(
    'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
    'https://trust.test.invalid/health',
  );
  vi.stubEnv(
    'DETRAN_DOCUMENT_TRUST_TOKEN',
    'TEST_ONLY no production credential',
  );
  const [
    { Global, Module },
    { NestFactory },
    { Database },
    { RequestContext },
    { S3Service },
    signature,
    shared,
    composition,
  ] = await Promise.all([
    import('@nestjs/common'),
    import('@nestjs/core'),
    import('@stynx-nyx/data'),
    import('@stynx-nyx/core'),
    import('@stynx-nyx/storage'),
    import('@stynx-nyx/signature'),
    import('@detran/shared'),
    import('../../src/detran-signature.js'),
  ]);
  class TestOnlyBoundaryPorts {}
  Global()(TestOnlyBoundaryPorts);
  Module({
    providers: [
      { provide: Database, useValue: database },
      { provide: RequestContext, useValue: requestContext },
      { provide: S3Service, useValue: storage },
    ],
    exports: [Database, RequestContext, S3Service],
  })(TestOnlyBoundaryPorts);
  class TestOnlyApplication {}
  Module({
    imports: [TestOnlyBoundaryPorts, composition.DetranSignatureModule],
  })(TestOnlyApplication);
  let context: INestApplicationContext | undefined,
    closed = false;
  try {
    context = await NestFactory.createApplicationContext(TestOnlyApplication, {
      logger: false,
      abortOnError: false,
    });
    for (const token of [
      shared.SignatureTrustRuntime,
      shared.SignedDocumentStore,
      shared.DocumentTrustHttpAdapter,
      signature.SignatureService,
      signature.SignatureManifestService,
      signature.SignatureWithdrawalVerifier,
      shared.SignatureTrustBootstrapState,
      composition.DetranSignatureBootstrap,
    ])
      expect(context.get(token as never)).toBeInstanceOf(token);
    const holder = context.get(shared.SignatureTrustBootstrapState);
    expect(portCalls.filter((c) => c.operation === 'query')).toHaveLength(1);
    expect(administrativeFrame).toBe(false);
    expect(requestCalls).toBe(0);
    expect(s3Calls).toBe(0);
    if (scenario === 'valid-detachment') {
      expect(holder.isAvailable()).toBe(true);
      const first = holder.getApprovedFloor('DECISAO_DEFESA');
      expect(first).not.toBeNull();
      expect(first).toMatchObject({
        documentKind: 'DECISAO_DEFESA',
        sourceRef: row.source_ref,
        approvedBy: row.approved_by,
        approvedAt: new Date('2026-09-29T12:00:00.000Z'),
        trustAnchorsPem: [new X509Certificate(rootPem).toString()],
        acceptedPolicies: ['1.2.3.4.5.6.7'],
      });
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.isFrozen(first!.trustAnchorsPem)).toBe(true);
      expect(Object.isFrozen(first!.acceptedPolicies)).toBe(true);
      first!.approvedAt.setTime(0);
      expect(() => {
        (first!.trustAnchorsPem as string[]).push('TEST_ONLY injected');
      }).toThrow(TypeError);
      expect(() => {
        (first!.acceptedPolicies as string[]).push('TEST_ONLY injected');
      }).toThrow(TypeError);
      row.approved_at.setTime(0);
      row.trust_anchors_pem.push('TEST_ONLY caller-row mutation');
      row.accepted_policies.push('TEST_ONLY caller-row mutation');
      const second = holder.getApprovedFloor('DECISAO_DEFESA');
      expect(second!.approvedAt).toEqual(new Date('2026-09-29T12:00:00.000Z'));
      expect(second!.trustAnchorsPem).toEqual([
        new X509Certificate(rootPem).toString(),
      ]);
      expect(second!.acceptedPolicies).toEqual(['1.2.3.4.5.6.7']);
      expect(second).not.toBe(first);
      expect(second!.approvedAt).not.toBe(first!.approvedAt);
      expect(holder.getApprovedFloor('TEST_ONLY unknown species')).toBeNull();
      expect(() =>
        context!.get(shared.SignatureTrustRuntime).assertConfigured(),
      ).not.toThrow();
    } else {
      expect(holder.isAvailable()).toBe(false);
      expect(holder.getApprovedFloor('DECISAO_DEFESA')).toBeNull();
      expect(() =>
        context!.get(shared.SignatureTrustRuntime).assertConfigured(),
      ).toThrow('Document trust service is not configured');
      if (scenario === 'one-shot-empty-unavailable') {
        rows = [row];
        await context
          .get(composition.DetranSignatureBootstrap)
          .onApplicationBootstrap();
        expect(portCalls.filter((c) => c.operation === 'query')).toHaveLength(
          1,
        );
        expect(holder.isAvailable()).toBe(false);
        expect(holder.getApprovedFloor('DECISAO_DEFESA')).toBeNull();
      }
    }
    await expect(
      holder.resolveSignerCertificate('TEST_ONLY tenant', 'TEST_ONLY signer'),
    ).rejects.toThrow('Approved signer certificate source is unavailable');
    await expect(
      holder.resolvePartyCertificate('TEST_ONLY tenant', 'TEST_ONLY party'),
    ).rejects.toThrow('Approved party certificate source is unavailable');
    expect(requestCalls).toBe(0);
    expect(s3Calls).toBe(0);
    guard.clean();
  } finally {
    try {
      await context?.close();
      closed = !!context;
    } finally {
      vi.unstubAllEnvs();
      writeFileSync(
        path.join(config.output, 'holder-scenario-observation.json'),
        JSON.stringify({
          kind: 'TEST_ONLY actual Nest holder lifecycle port observation',
          scenario,
          pid: process.pid,
          contextClosed: closed,
          portCalls,
          requestCalls,
          s3Calls,
          actualPostgresObserved: false,
          approvedTrustAdmission: false,
        }) + '\n',
        { flag: 'wx' },
      );
    }
  }
});
