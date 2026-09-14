// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
export interface CreateProbativePackageItemDto {
  package_id: string;
  item_type: string;
  evidence_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  item_hash: string;
  sequence: number;
}
