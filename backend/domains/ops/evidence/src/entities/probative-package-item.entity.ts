// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
export interface ProbativePackageItem {
  id: string;
  tenant_id: string;
  package_id: string;
  item_type: string;
  evidence_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  item_hash: string;
  sequence: number;
  created_at: string;
  updated_at?: string | null;
}
