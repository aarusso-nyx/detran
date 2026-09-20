import { describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';

import {
  BOAT_NOTICE,
  BoatDocumentsFacade,
  SqlBoatDocumentCatalog,
  WeasyPrintPdfABackend,
  type BoatDocumentRecord,
} from './boat-documents.js';

describe('D-13-03/D-13-04 — backend PDF/A BOAT', () => {
  it('dado o Default D1 quando renderiza então valida A-2b e devolve o hash dos bytes validados', async () => {
    const pdf = Buffer.from('%PDF-1.7\nconforme\n%%EOF');
    const validator = {
      validate: vi.fn().mockResolvedValue({
        valid: true,
        declared: { version: 'A-2', conformance: 'b' },
        rulesetVersion: 'veraPDF-test',
        validatedAt: '2026-09-20T00:00:00.000Z',
        durationMs: 1,
        errors: [],
      }),
    };
    const backend = new WeasyPrintPdfABackend(validator, async () => pdf);
    const result = await backend.render({
      tenantId: 'tenant-a',
      template: {
        id: 'est.crash.report.preliminary',
        engine: 'html',
        source: '<p>x</p>',
        version: '1.0.0',
      },
      data: {},
      output: { profile: 'pdf-a' },
    });

    expect(validator.validate).toHaveBeenCalledWith(pdf, {
      version: 'A-2',
      conformance: 'b',
    });
    expect(result.bytes).toEqual(pdf);
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(result.metadata).toMatchObject({
      profile: 'pdf-a',
      validator: 'veraPDF-test',
    });
  });

  it('dado falso PDF quando veraPDF rejeita então falha fechado', async () => {
    const backend = new WeasyPrintPdfABackend(
      {
        validate: vi.fn().mockResolvedValue({
          valid: false,
          declared: null,
          rulesetVersion: 'veraPDF-test',
          validatedAt: '2026-09-20T00:00:00.000Z',
          durationMs: 1,
          errors: [
            { ruleId: 'x', severity: 'error', clause: 'x', message: 'invalid' },
          ],
        }),
      },
      async () => Buffer.from('%PDF-falso'),
    );
    await expect(
      backend.render({
        tenantId: 'tenant-a',
        template: {
          id: 'est.crash.report.preliminary',
          engine: 'html',
          source: '<p>x</p>',
        },
        data: {},
        output: { profile: 'pdf-a' },
      }),
    ).rejects.toThrow('PDF/A-2b validation failed');
  });

  it('dada falha do runner WeasyPrint quando renderiza então não valida nem produz documento', async () => {
    const validator = { validate: vi.fn() };
    const backend = new WeasyPrintPdfABackend(validator as never, async () => {
      throw new Error('WeasyPrint unavailable');
    });
    await expect(
      backend.render({
        tenantId: 'tenant-a',
        template: {
          id: 'est.crash.report.preliminary',
          engine: 'html',
          source: '<p>x</p>',
        },
        data: {},
        output: { profile: 'pdf-a' },
      }),
    ).rejects.toThrow('WeasyPrint unavailable');
    expect(validator.validate).not.toHaveBeenCalled();
  });
});

describe('D-13-02/D-13-06 — catálogo Default D1 falha fechado', () => {
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: 'tenant-a', actorId: 'actor-a' }),
  };
  const policyD1 = {
    id: '00000000-0000-7000-8000-000000000001',
    required_signers_json: [],
    pades_level: 'NONE',
    tsa_required: false,
    pdfa_required: true,
    govbr_level: null,
  };
  const templateD1 = {
    template_body: `<p>${BOAT_NOTICE}</p>`,
    version: '1.0.0',
  };

  function catalog(
    templates: Record<string, unknown>[],
    policies: Record<string, unknown>[],
  ): SqlBoatDocumentCatalog {
    const database = {
      tx: async (work: (tx: unknown) => Promise<unknown>) =>
        work({
          query: async (sql: string) => ({
            rows: sql.includes('normative_document_template')
              ? templates
              : policies,
          }),
        }),
    };
    return new SqlBoatDocumentCatalog(database as never, context as never);
  }

  it('dado template ausente quando resolve então rejeita a emissão', async () => {
    await expect(catalog([], [policyD1]).resolve('agency-a')).rejects.toThrow(
      'template or policy is unavailable',
    );
  });

  it('dada política ausente quando resolve então rejeita a emissão', async () => {
    await expect(catalog([templateD1], []).resolve('agency-a')).rejects.toThrow(
      'template or policy is unavailable',
    );
  });

  it('dada política divergente quando resolve então rejeita a emissão', async () => {
    await expect(
      catalog(
        [templateD1],
        [
          {
            ...policyD1,
            pades_level: 'B-B',
            required_signers_json: ['authority'],
          },
        ],
      ).resolve('agency-a'),
    ).rejects.toThrow('policy differs from approved Default D1');
  });
});

describe('D-13-02/D-13-06/D-13-07 — fachada D1', () => {
  it('dado política sem assinatura quando sela então persiste bytes, hash, evidência e supersessão', async () => {
    const bytes = Buffer.from('%PDF-1.7\nreal-test\n%%EOF');
    const records = new Map<string, BoatDocumentRecord>();
    const objects = new Map<string, Uint8Array>();
    const repository = {
      latest: async (aggregateId: string) =>
        [...records.values()]
          .filter((record) => record.aggregateId === aggregateId)
          .at(-1) ?? null,
      insert: async (record: BoatDocumentRecord) => {
        records.set(record.document.documentId, structuredClone(record));
      },
      find: async (documentId: string) => records.get(documentId) ?? null,
      seal: async (documentId: string) => {
        const record = records.get(documentId);
        if (!record) throw new Error('Document not found');
        record.sealedAt ??= '2026-09-20T00:00:00.000Z';
        return record.sealedAt;
      },
    };
    const storage = {
      put: async (key: string, value: Uint8Array) => {
        if (objects.has(key)) throw new Error('immutable key already exists');
        objects.set(key, value);
      },
      read: async (key: string) => {
        const value = objects.get(key);
        if (!value) throw new Error('Document not found');
        return value;
      },
    };
    const renderer = {
      render: async () => ({
        bytes,
        contentType: 'application/pdf' as const,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        pageCount: 1,
        templateId: 'est.crash.report.preliminary',
        templateVersion: '1.0.0',
        metadata: {
          profile: 'pdf-a',
          pdfaValidation: JSON.stringify({
            valid: true,
            declared: { version: 'A-2', conformance: 'b' },
            rulesetVersion: 'veraPDF-test',
            validatedAt: '2026-09-20T00:00:00.000Z',
            durationMs: 1,
            errors: [],
          }),
        },
      }),
    };
    const facade = new BoatDocumentsFacade(
      { snapshot: () => ({ tenantId: 'tenant-a' }) } as never,
      {
        resolve: async () => ({
          templateBody: `<p>{{id}}</p><p>${BOAT_NOTICE}</p>`,
          templateVersion: '1.0.0',
          policyId: '00000000-0000-7000-8000-000000000001',
        }),
      },
      renderer,
      repository,
      storage,
    );
    const input = {
      id: 'crash-1',
      traffic_agency_id: 'agency-1',
      state: 'REGISTRADO',
    };
    const first = await facade.render('est.crash.report.preliminary', input);
    const sealed = await facade.seal(first.documentId);
    expect(sealed.signatureRef).toBeNull();
    expect(await facade.read(first.documentId)).toEqual(bytes);

    const restarted = new BoatDocumentsFacade(
      { snapshot: () => ({ tenantId: 'tenant-a' }) } as never,
      { resolve: async () => Promise.reject(new Error('unused')) },
      renderer,
      repository,
      storage,
    );
    expect(await restarted.read(first.documentId)).toEqual(bytes);

    const second = await facade.render('est.crash.report.preliminary', input);
    expect(second.supersedesDocumentId).toBe(first.documentId);
    await expect(
      facade.sign(first.documentId, {
        role: 'field-agent',
        personId: 'person-1',
        certificateRef: null,
      }),
    ).rejects.toThrow('Default D1 forbids signing');
  });
});
