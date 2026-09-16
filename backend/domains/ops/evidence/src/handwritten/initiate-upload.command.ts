// CTG-0003 §4.1 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/upload-intents`.
//
// A intenção é idempotente por `idempotency_key` (índice único
// `ux_storage_intent_tenant_id_idempotency_key`): a repetição com o mesmo
// corpo devolve a **mesma** resposta; com corpo diferente, 409
// `TEAT.IDEMPOTENCY_REPLAY`. A expiração vem sempre da porta
// `EvidenceStoragePort`, nunca de constante do domínio (M11).
import { DetranError } from '@detran/shared';

import {
  assertEntityApplied,
  findRow,
  findRowsWhere,
  insertRow,
  inTenantTransaction,
  isoOf,
  newId,
  objectKeyOf,
  stringOf,
  tenantScope,
  validationFailed,
  type EvidenceDeps,
  type EvidenceRow,
} from './evidence-runtime.js';
import { sha256Hex, stableJson } from './manifest.js';

/** `mime_type` aceito pela coleção `evidence` do substrato de storage. */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
] as const;

const MAX_SIZE_BYTES = 52_428_800;
/** §4.1; OD-T53 (adenda §13): o digest tem 64 hex, sem exceção. */
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface InitiateUploadInput {
  traffic_agency_id: string;
  local_evidence_id: string;
  idempotency_key: string;
  entity_type: string;
  entity_id: string;
  evidence_type: string;
  origin: string;
  mime_type: string;
  size_bytes: number;
  hash_algorithm: string;
  hash_value: string;
  filename: string;
  captured_by_user_ref?: string;
  agent_id?: string;
  device_id?: string;
  captured_at?: string;
  location_json?: Record<string, unknown>;
  metadata_json?: Record<string, unknown>;
}

export interface InitiateUploadResult {
  storage_intent_id: string;
  upload_url: string;
  expires_at: string;
  evidence_id: string;
}

interface ParsedInput extends InitiateUploadInput {
  requestHash: string;
}

export class InitiateUploadCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(input: InitiateUploadInput): Promise<InitiateUploadResult> {
    const parsed = parse(input);
    const { tenantId, actorId } = tenantScope(this.deps);

    return inTenantTransaction(this.deps, async (tx) => {
      const replay = await this.findByIdempotencyKey(
        tx,
        parsed.idempotency_key,
      );
      if (replay) return this.replayOf(tx, replay, parsed);

      await assertEntityApplied(
        this.deps,
        tx,
        parsed.entity_type,
        parsed.entity_id,
      );
      await this.assertHashIsFree(tx, parsed.hash_value);

      const evidenceId = newId();
      const objectKey = objectKeyOf(tenantId, evidenceId);
      const presigned = await this.presign(parsed, objectKey);

      await insertRow(this.deps, tx, 'evidence', {
        id: evidenceId,
        traffic_agency_id: parsed.traffic_agency_id,
        evidence_type: parsed.evidence_type,
        origin: parsed.origin,
        // §13 item 3 (OD-T32): a coluna é `not null`; a chave já decidida é a
        // do objeto, e `status='pending_upload'` é quem diz que nada chegou.
        storage_uri: objectKey,
        mime_type: parsed.mime_type,
        size_bytes: parsed.size_bytes,
        hash_algorithm: parsed.hash_algorithm,
        hash_value: parsed.hash_value,
        captured_by_user_ref: parsed.captured_by_user_ref ?? actorId,
        agent_id: parsed.agent_id ?? null,
        device_id: parsed.device_id ?? null,
        captured_at: parsed.captured_at ?? this.deps.clock.now(),
        location_json: parsed.location_json ?? null,
        metadata_json: metadataOf(parsed),
        status: 'pending_upload',
      });

      const intent = await insertRow(this.deps, tx, 'storageIntents', {
        evidence_id: evidenceId,
        idempotency_key: parsed.idempotency_key,
        local_evidence_id: parsed.local_evidence_id,
        object_key: objectKey,
        expires_at: presigned.expiresAt,
        status: 'pending',
      });

      return {
        storage_intent_id: stringOf(intent.id),
        upload_url: presigned.uploadUrl,
        expires_at: presigned.expiresAt,
        evidence_id: evidenceId,
      };
    });
  }

  private presign(
    parsed: ParsedInput,
    objectKey: string,
  ): Promise<{ uploadUrl: string; expiresAt: string }> {
    const storage = this.deps.evidenceStorage;
    if (!storage)
      throw new Error('EvidenceStoragePort não está ligada ao comando');
    return storage.presignUpload({
      objectKey,
      mimeType: parsed.mime_type,
      sizeBytes: parsed.size_bytes,
      hashValue: parsed.hash_value,
    });
  }

  private async findByIdempotencyKey(
    tx: unknown,
    idempotencyKey: string,
  ): Promise<EvidenceRow | undefined> {
    const intents = await findRowsWhere(
      this.deps,
      tx,
      'storageIntents',
      'idempotency_key',
      idempotencyKey,
    );
    return intents[0];
  }

  /**
   * §4.1 nota final: `(tenant_id, hash_value)` é único, então um segundo
   * conteúdo idêntico com outra chave é replay da intenção que já detém o
   * hash — nunca uma segunda linha.
   */
  private async assertHashIsFree(
    tx: unknown,
    hashValue: string,
  ): Promise<void> {
    const owner = (
      await findRowsWhere(this.deps, tx, 'evidence', 'hash_value', hashValue)
    )[0];
    if (!owner) return;
    const intents = await findRowsWhere(
      this.deps,
      tx,
      'storageIntents',
      'evidence_id',
      owner.id,
    );
    throw idempotencyReplay(stringOf(intents[0]?.idempotency_key ?? ''));
  }

  private async replayOf(
    tx: unknown,
    intent: EvidenceRow,
    parsed: ParsedInput,
  ): Promise<InitiateUploadResult> {
    const evidence = await findRow(
      this.deps,
      tx,
      'evidence',
      stringOf(intent.evidence_id),
    );
    if (fingerprintOf(evidence) !== parsed.requestHash)
      throw idempotencyReplay(parsed.idempotency_key);
    const presigned = await this.presign(parsed, stringOf(intent.object_key));
    return {
      storage_intent_id: stringOf(intent.id),
      upload_url: presigned.uploadUrl,
      expires_at: presigned.expiresAt,
      evidence_id: stringOf(intent.evidence_id),
    };
  }
}

function idempotencyReplay(idempotencyKey: string): DetranError {
  return new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
    status: 409,
    context: { idempotencyKey },
    message: 'Chave de idempotência já usada com outro pedido.',
  });
}

/**
 * `filename`, a impressão digital do pedido e a entidade declarada moram em
 * `metadata_json`: a DDL 17 não tem coluna para nenhum dos três, e sem a
 * impressão não há como distinguir "mesma chave, mesmo corpo" de "mesma
 * chave, corpo diferente" (§4.1, OD-T55 ratificada na adenda §13; a entidade
 * é o termo de comparação da §14.1).
 */
function metadataOf(parsed: ParsedInput): Record<string, unknown> {
  return {
    ...(parsed.metadata_json ?? {}),
    filename: parsed.filename,
    upload_request_hash: parsed.requestHash,
    // §14.1: `complete-upload` compara a entidade declarada com a da
    // intenção, e `ops.storage_intent` não tem coluna para o par. Os nomes
    // são os propostos pelo Inspector em TASK-0006 iteração 3.
    entity_type: parsed.entity_type,
    entity_id: parsed.entity_id,
  };
}

function fingerprintOf(evidence: EvidenceRow | undefined): string {
  const metadata = evidence?.metadata_json;
  if (!metadata || typeof metadata !== 'object') return '';
  return stringOf(
    (metadata as Record<string, unknown>).upload_request_hash ?? '',
  );
}

function parse(input: InitiateUploadInput): ParsedInput {
  const hashValue = stringOf(input?.hash_value ?? '').trim();
  if (!hashValue)
    throw new DetranError('TEAT.EVIDENCE_HASH_REQUIRED', {
      status: 400,
      context: { field: 'hash_value' },
      message: 'O hash do conteúdo é obrigatório na intenção de upload.',
    });

  const fields: { path: string; rule: string }[] = [];
  const requireUuid = (path: keyof InitiateUploadInput): void => {
    const value = stringOf(input[path] ?? '');
    if (!UUID_PATTERN.test(value)) fields.push({ path, rule: 'uuid' });
  };
  const requireText = (
    path: keyof InitiateUploadInput,
    maxLength: number,
  ): void => {
    const value = stringOf(input[path] ?? '').trim();
    if (!value || value.length > maxLength)
      fields.push({ path, rule: 'required' });
  };

  requireUuid('traffic_agency_id');
  // Adenda CTG-0003 §12 item 3: a DDL 17 é canônica (`uuid not null`).
  requireUuid('local_evidence_id');
  requireUuid('entity_id');
  requireText('idempotency_key', 160);
  requireText('entity_type', 80);
  requireText('evidence_type', 60);
  requireText('origin', 60);
  requireText('filename', 180);
  if (!HASH_PATTERN.test(hashValue))
    fields.push({ path: 'hash_value', rule: 'pattern' });
  if (stringOf(input.hash_algorithm ?? '') !== 'sha256')
    fields.push({ path: 'hash_algorithm', rule: 'enum' });
  if (
    !(ALLOWED_MIME_TYPES as readonly string[]).includes(
      stringOf(input.mime_type),
    )
  )
    fields.push({ path: 'mime_type', rule: 'enum' });
  const sizeBytes = Number(input.size_bytes);
  if (
    !Number.isInteger(sizeBytes) ||
    sizeBytes < 1 ||
    sizeBytes > MAX_SIZE_BYTES
  )
    fields.push({ path: 'size_bytes', rule: 'range' });
  if (fields.length > 0) throw validationFailed(fields);

  const parsed: InitiateUploadInput = {
    ...input,
    hash_value: hashValue,
    size_bytes: sizeBytes,
    captured_at: input.captured_at ? isoOf(input.captured_at) : undefined,
  };
  return { ...parsed, requestHash: requestHashOf(parsed) };
}

function requestHashOf(input: InitiateUploadInput): string {
  const { idempotency_key: _key, ...rest } = input;
  return sha256Hex(stableJson(rest));
}
