// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
export interface EvidenceAccessRequest {
  id: string;
  tenant_id: string;
  evidence_id: string;
  requester_name: string;
  requester_role: string;
  investigation_ref: string;
  purpose: string;
  legal_basis?: string | null;
  status: string;
  delivery_media_ref?: string | null;
  decided_by_user_ref?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
