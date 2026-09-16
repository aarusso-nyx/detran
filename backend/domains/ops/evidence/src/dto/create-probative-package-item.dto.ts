// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
export interface CreateProbativePackageItemDto {
  package_id: string;
  item_type: string;
  evidence_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  item_hash: string;
  sequence: number;
}
