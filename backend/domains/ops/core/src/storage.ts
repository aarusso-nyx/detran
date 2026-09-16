// CTG-0002 §4.8 (R-0008, TASK-0005) — portas de CTG-0003 declaradas aqui só
// pela forma; a semântica (presign, consulta de snapshot, selo do pacote
// probatório) é daquele contrato e de TASK-0007.

export interface EvidenceStoragePort {
  presignUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
    /**
     * `sha256:<hex>` declarado na intenção (CTG-0003 §4.1). Opcional na
     * forma fixada por CTG-0002 §4.8; o substrato S3 do STYNX exige o
     * checksum no `presignUpload`, e é daqui que ele vem.
     */
    hashValue?: string;
  }): Promise<{ uploadUrl: string; expiresAt: string }>;
}

/** Token da porta de armazenamento de evidência (CTG-0003 §4.1). */
export const EVIDENCE_STORAGE_PORT: unique symbol = Symbol(
  'EVIDENCE_STORAGE_PORT',
);

/** Token multi-provider `{ wsdenatranRead, renach }` (CTG-0003). */
export const SNAPSHOT_QUERY_PORTS: unique symbol = Symbol(
  'SNAPSHOT_QUERY_PORTS',
);

// O token de injeção de `PackageSignerPort` vive em `@detran/inf-normative`
// (`handwritten/package-signer.ts`), que é quem o consome: `inf/normative` não
// depende de `@detran/ops-core`. A forma da porta continua declarada aqui,
// como CTG-0002 §4.8 fixou.
export interface PackageSignerPort {
  sign(manifestHash: string): Promise<{
    signature: string;
    signer: string;
    kind: 'local-unsigned' | 'sealed';
  }>;
}
