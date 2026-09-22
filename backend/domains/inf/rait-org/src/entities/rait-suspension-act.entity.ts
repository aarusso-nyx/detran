// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
export interface RaitSuspensionAct {
  id: string;
  tenant_id: string;
  reason: string;
  legal_basis?: string | null;
  starts_on: string;
  ends_on: string;
  timer_codes: Record<string, unknown>;
  evidence_document_id: string;
  signed_by: string;
  signed_at: string;
  state: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
