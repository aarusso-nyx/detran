import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { Global, Module } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type { PdfAValidationResult, PdfAValidator } from '@stynx-nyx/pdf-a';
import { VeraPdfDockerValidator } from '@stynx-nyx/pdf-a-vera-docker';
import {
  countPdfPages,
  type PdfRenderBackend,
  type RenderRequest,
  type RenderResult,
} from '@stynx-nyx/pdf';
import { S3Service } from '@stynx-nyx/storage';
import {
  DOCUMENTS_FACADE,
  type DocumentSigner,
  type DocumentsFacade,
  type RenderedDocument,
  type SealedDocument,
  type SignedDocument,
  withTenantContext,
} from '@detran/shared';

const execFileAsync = promisify(execFile);
export const BOAT_TEMPLATE_KEY = 'est.crash.report.preliminary';
export const BOAT_DOCUMENT_KIND = 'relatorio_preliminar_sinistro';
export const BOAT_NOTICE =
  'Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.';
export const VERAPDF_IMAGE =
  'verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842';

type WeasyRunner = (html: string) => Promise<Uint8Array>;

export class WeasyPrintPdfABackend implements PdfRenderBackend {
  constructor(
    private readonly validator: PdfAValidator,
    private readonly run: WeasyRunner = runWeasyPrint,
  ) {}

  async render<TData extends Record<string, unknown>>(
    request: RenderRequest<TData>,
  ): Promise<RenderResult> {
    if (request.output?.profile !== 'pdf-a') {
      throw new Error('BOAT documents require the pdf-a profile');
    }
    const html = renderTemplate(request.template.source, request.data);
    const bytes = await this.run(html);
    const validation = await this.validator.validate(bytes, {
      version: 'A-2',
      conformance: 'b',
    });
    if (
      !validation.valid ||
      validation.declared?.version !== 'A-2' ||
      validation.declared.conformance !== 'b'
    ) {
      throw new Error('PDF/A-2b validation failed');
    }
    return {
      bytes,
      contentType: 'application/pdf',
      sha256: sha256(bytes),
      pageCount: countPdfPages(bytes),
      templateId: request.template.id,
      ...(request.template.version
        ? { templateVersion: request.template.version }
        : {}),
      metadata: {
        profile: 'pdf-a',
        pdfa: 'PDF/A-2b',
        renderer: 'WeasyPrint 70.0',
        validator: validation.rulesetVersion,
        pdfaValidation: JSON.stringify(validation),
        tenantId: request.tenantId,
        ...(request.metadata ?? {}),
      },
    };
  }
}

interface CatalogResolution {
  templateBody: string;
  templateVersion: string;
  policyId: string;
}

export interface BoatDocumentCatalog {
  resolve(trafficAgencyId: string): Promise<CatalogResolution>;
}

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export class SqlBoatDocumentCatalog implements BoatDocumentCatalog {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async resolve(trafficAgencyId: string): Promise<CatalogResolution> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (raw) => {
        const tx = raw as SqlTransaction;
        const template = await tx.query<{
          template_body: string;
          version: string;
        }>(
          `select template_body, version
           from inf.normative_document_template
          where traffic_agency_id = $1::uuid
            and document_kind = $2
            and domain_scope = 'est'
            and status = 'active'
          order by valid_from desc, version desc
          limit 1`,
          [trafficAgencyId, BOAT_DOCUMENT_KIND],
        );
        const policy = await tx.query<{
          id: string;
          required_signers_json: unknown;
          pades_level: string;
          tsa_required: boolean;
          pdfa_required: boolean;
          govbr_level: string | null;
        }>(
          `select id::text, required_signers_json, pades_level, tsa_required, pdfa_required, govbr_level
           from inf.signature_policy
          where traffic_agency_id = $1::uuid
            and document_kind = $2
            and status = 'active'
          limit 1`,
          [trafficAgencyId, BOAT_DOCUMENT_KIND],
        );
        const templateRow = template.rows[0];
        const policyRow = policy.rows[0];
        if (!templateRow || !policyRow) {
          throw new Error('BOAT document template or policy is unavailable');
        }
        if (
          !Array.isArray(policyRow.required_signers_json) ||
          policyRow.required_signers_json.length !== 0 ||
          policyRow.pades_level !== 'NONE' ||
          policyRow.tsa_required ||
          !policyRow.pdfa_required ||
          policyRow.govbr_level !== null
        ) {
          throw new Error(
            'BOAT document policy differs from approved Default D1',
          );
        }
        if (!templateRow.template_body.includes('Não constitui Boletim')) {
          throw new Error(
            'BOAT document template lacks the approved non-BAT notice',
          );
        }
        return {
          templateBody: templateRow.template_body,
          templateVersion: templateRow.version,
          policyId: policyRow.id,
        };
      },
    );
  }
}

export interface BoatDocumentRecord {
  document: RenderedDocument;
  tenantId: string;
  aggregateId: string;
  policyId: string;
  templateVersion: string;
  byteSize: number;
  validation: PdfAValidationResult;
  sealedAt: string | null;
}

export interface BoatDocumentRepository {
  latest(aggregateId: string): Promise<BoatDocumentRecord | null>;
  insert(record: BoatDocumentRecord): Promise<void>;
  find(documentId: string): Promise<BoatDocumentRecord | null>;
}

interface BoatDocumentRow {
  id: string;
  tenant_id: string;
  crash_record_id: string;
  policy_id: string;
  template_version: string;
  storage_key: string;
  content_hash: string;
  byte_size: number;
  pdfa_validation: PdfAValidationResult;
  supersedes_document_id: string | null;
  sealed_at: string | null;
}

export class SqlBoatDocumentRepository implements BoatDocumentRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async latest(aggregateId: string): Promise<BoatDocumentRecord | null> {
    return this.one(
      `select id::text, tenant_id::text, crash_record_id::text, policy_id::text,
              template_version, storage_key, content_hash, byte_size, pdfa_validation,
              supersedes_document_id::text, sealed_at::text
         from est.crash_report_document
        where crash_record_id = $1::uuid
        order by created_at desc, id desc
        limit 1`,
      [aggregateId],
    );
  }

  async insert(record: BoatDocumentRecord): Promise<void> {
    await withTenantContext(this.database, this.requestContext, async (raw) => {
      const tx = raw as SqlTransaction;
      await tx.query(
        `insert into est.crash_report_document (
             id, tenant_id, crash_record_id, document_kind, template_key,
             template_version, policy_id, storage_key, content_hash, byte_size,
             signature_ref, pdfa_conformance, pdfa_validation,
             supersedes_document_id, sealed_at
           ) values (
             $1::uuid, $2::uuid, $3::uuid, 'RELATORIO_PRELIMINAR_SINISTRO', $4,
             $5, $6::uuid, $7, $8, $9,
             null, 'PDF/A-2b', $10::jsonb, $11::uuid, $12::timestamptz
           )`,
        [
          record.document.documentId,
          record.tenantId,
          record.aggregateId,
          BOAT_TEMPLATE_KEY,
          record.templateVersion,
          record.policyId,
          record.document.storageKey,
          record.document.contentHash,
          record.byteSize,
          JSON.stringify(record.validation),
          record.document.supersedesDocumentId,
          record.sealedAt,
        ],
      );
    });
  }

  async find(documentId: string): Promise<BoatDocumentRecord | null> {
    return this.one(
      `select id::text, tenant_id::text, crash_record_id::text, policy_id::text,
              template_version, storage_key, content_hash, byte_size, pdfa_validation,
              supersedes_document_id::text, sealed_at::text
         from est.crash_report_document
        where id = $1::uuid
        limit 1`,
      [documentId],
    );
  }

  private async one(
    sql: string,
    values: readonly unknown[],
  ): Promise<BoatDocumentRecord | null> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (raw) => {
        const tx = raw as SqlTransaction;
        const result = await tx.query<BoatDocumentRow>(sql, [...values]);
        return result.rows[0] ? fromRow(result.rows[0]) : null;
      },
    );
  }
}

export interface BoatObjectStorage {
  put(storageKey: string, bytes: Uint8Array, sha256: string): Promise<void>;
  read(storageKey: string): Promise<Uint8Array>;
}

export class StynxBoatObjectStorage implements BoatObjectStorage {
  constructor(private readonly storage: S3Service) {}

  async put(
    storageKey: string,
    bytes: Uint8Array,
    contentHash: string,
  ): Promise<void> {
    const upload = await this.storage.presignUpload({
      key: storageKey,
      contentType: 'application/pdf',
      checksumSha256: contentHash,
    });
    const response = await fetch(upload.url, {
      method: upload.method,
      headers: upload.headers,
      body: Buffer.from(bytes),
    });
    if (!response.ok) {
      throw new Error(`STYNX document upload failed (${response.status})`);
    }
  }

  async read(storageKey: string): Promise<Uint8Array> {
    const download = await this.storage.presignDownload({
      key: storageKey,
      filename: 'relatorio-preliminar-sinistro.pdf',
    });
    const response = await fetch(download.url);
    if (!response.ok) {
      throw new Error(`STYNX document download failed (${response.status})`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
}

export class BoatDocumentsFacade implements DocumentsFacade {
  private readonly pending = new Map<
    string,
    { record: BoatDocumentRecord; bytes: Uint8Array }
  >();

  constructor(
    private readonly requestContext: RequestContext,
    private readonly catalog: BoatDocumentCatalog,
    private readonly renderer: PdfRenderBackend,
    private readonly repository: BoatDocumentRepository,
    private readonly storage: BoatObjectStorage,
  ) {}

  async render(
    templateKey: string,
    data: Record<string, unknown>,
  ): Promise<RenderedDocument> {
    if (templateKey !== BOAT_TEMPLATE_KEY)
      throw new Error('Unknown template key');
    const tenantId = this.requestContext.snapshot().tenantId;
    const trafficAgencyId = stringField(data, 'traffic_agency_id');
    const aggregateId = stringField(data, 'id');
    if (!tenantId) throw new Error('Tenant context is required');
    const template = await this.catalog.resolve(trafficAgencyId);
    const result = await this.renderer.render({
      tenantId,
      template: {
        id: templateKey,
        engine: 'html',
        source: template.templateBody,
        version: template.templateVersion,
      },
      data,
      output: { profile: 'pdf-a' },
      metadata: { documentKind: BOAT_DOCUMENT_KIND, aggregateId },
    });
    const validation = parseValidation(result.metadata.pdfaValidation);
    const prior = await this.repository.latest(aggregateId);
    const documentId = randomUUID();
    const storageKey = `${tenantId}/signed-documents/boat/${aggregateId}/${documentId}/1/relatorio-preliminar-sinistro.pdf`;
    const document: RenderedDocument = {
      documentId,
      kind: 'RELATORIO_PRELIMINAR_SINISTRO',
      storageKey,
      contentHash: result.sha256,
      pdfaConformance: 'PDF/A-2b',
      supersedesDocumentId: prior?.document.documentId ?? null,
    };
    this.pending.set(documentId, {
      bytes: result.bytes,
      record: {
        document,
        tenantId,
        aggregateId,
        policyId: template.policyId,
        templateVersion: template.templateVersion,
        byteSize: result.bytes.byteLength,
        validation,
        sealedAt: null,
      },
    });
    return document;
  }

  sign(_documentId: string, _signer: DocumentSigner): Promise<SignedDocument> {
    return Promise.reject(
      new Error('Default D1 forbids signing the preliminary report'),
    );
  }

  async seal(documentId: string): Promise<SealedDocument> {
    const alreadySealed = await this.repository.find(documentId);
    if (alreadySealed?.sealedAt) return toSealed(alreadySealed);
    const pending = this.pending.get(documentId);
    if (!pending) throw new Error('Document not found');
    const { record, bytes } = pending;
    if (sha256(bytes) !== record.document.contentHash) {
      throw new Error('RAIT.DOCUMENT_HASH_MISMATCH');
    }
    const sealed = { ...record, sealedAt: new Date().toISOString() };
    await this.storage.put(
      record.document.storageKey,
      bytes,
      record.document.contentHash,
    );
    await this.repository.insert(sealed);
    this.pending.delete(documentId);
    return toSealed(sealed);
  }

  async read(documentId: string): Promise<Uint8Array> {
    const record = await this.requireRecord(documentId);
    if (!record.sealedAt) throw new Error('Document is not sealed');
    const bytes = await this.storage.read(record.document.storageKey);
    if (sha256(bytes) !== record.document.contentHash) {
      throw new Error('RAIT.DOCUMENT_HASH_MISMATCH');
    }
    return bytes;
  }

  private async requireRecord(documentId: string): Promise<BoatDocumentRecord> {
    const record = await this.repository.find(documentId);
    if (!record) throw new Error('Document not found');
    return record;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DOCUMENTS_FACADE,
      inject: [Database, RequestContext, S3Service],
      useFactory: (
        database: Database,
        requestContext: RequestContext,
        storage: S3Service,
      ) =>
        new BoatDocumentsFacade(
          requestContext,
          new SqlBoatDocumentCatalog(database, requestContext),
          new WeasyPrintPdfABackend(
            new VeraPdfDockerValidator({
              image: process.env.STYNX_VERAPDF_IMAGE ?? VERAPDF_IMAGE,
              timeoutMs: 120_000,
            }),
          ),
          new SqlBoatDocumentRepository(database, requestContext),
          new StynxBoatObjectStorage(storage),
        ),
    },
  ],
  exports: [DOCUMENTS_FACADE],
})
export class BoatDocumentsRuntimeModule {}

async function runWeasyPrint(html: string): Promise<Uint8Array> {
  const directory = await mkdtemp(join(tmpdir(), 'detran-weasyprint-'));
  const input = join(directory, 'input.html');
  const output = join(directory, 'output.pdf');
  try {
    await writeFile(input, html, 'utf8');
    await execFileAsync(
      process.env.WEASYPRINT_BIN ?? 'weasyprint',
      ['--pdf-variant', 'pdf/a-2b', input, output],
      { timeout: 30_000 },
    );
    return readFile(output);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function fromRow(row: BoatDocumentRow): BoatDocumentRecord {
  return {
    document: {
      documentId: row.id,
      kind: 'RELATORIO_PRELIMINAR_SINISTRO',
      storageKey: row.storage_key,
      contentHash: row.content_hash,
      pdfaConformance: 'PDF/A-2b',
      supersedesDocumentId: row.supersedes_document_id,
    },
    tenantId: row.tenant_id,
    aggregateId: row.crash_record_id,
    policyId: row.policy_id,
    templateVersion: row.template_version,
    byteSize: row.byte_size,
    validation: row.pdfa_validation,
    sealedAt: row.sealed_at,
  };
}

function toSealed(record: BoatDocumentRecord): SealedDocument {
  if (!record.sealedAt) throw new Error('Document is not sealed');
  return {
    ...record.document,
    pdfaConformance: 'PDF/A-2b',
    signatureRef: null,
    sealedAt: record.sealedAt,
  };
}

function parseValidation(value: string | undefined): PdfAValidationResult {
  if (!value) throw new Error('PDF/A validation evidence is missing');
  const parsed = JSON.parse(value) as Partial<PdfAValidationResult>;
  if (
    parsed.valid !== true ||
    parsed.declared?.version !== 'A-2' ||
    parsed.declared.conformance !== 'b' ||
    typeof parsed.rulesetVersion !== 'string' ||
    !Array.isArray(parsed.errors)
  ) {
    throw new Error('PDF/A validation evidence is invalid');
  }
  return parsed as PdfAValidationResult;
}

function renderTemplate(source: string, data: Record<string, unknown>): string {
  return source.replace(
    /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/gu,
    (_match, key: string) => escapeHtml(String(data[key] ?? '')),
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function stringField(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Document data requires ${key}`);
  }
  return value;
}
