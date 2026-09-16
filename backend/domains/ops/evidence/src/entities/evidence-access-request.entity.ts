// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
