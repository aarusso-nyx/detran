// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
