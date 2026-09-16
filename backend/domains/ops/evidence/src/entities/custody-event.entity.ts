// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
export interface CustodyEvent {
  id: string;
  tenant_id: string;
  evidence_id: string;
  event_type: string;
  event_at: string;
  user_ref?: string | null;
  system_name?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
