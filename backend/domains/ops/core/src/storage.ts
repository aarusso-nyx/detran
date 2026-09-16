// CTG-0002 §4.8 (R-0008, TASK-0005) — portas de CTG-0003 declaradas aqui só
// pela forma; a semântica (presign, consulta de snapshot, selo do pacote
// probatório) é daquele contrato e de TASK-0007.

export interface EvidenceStoragePort {
  presignUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ uploadUrl: string; expiresAt: string }>;
}

/** Token multi-provider `{ wsdenatranRead, renach }` (CTG-0003). */
export const SNAPSHOT_QUERY_PORTS: unique symbol = Symbol(
  'SNAPSHOT_QUERY_PORTS',
);

export interface PackageSignerPort {
  sign(manifestHash: string): Promise<{
    signature: string;
    signer: string;
    kind: 'local-unsigned' | 'sealed';
  }>;
}
