// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
export interface RequestDraft {
  id: string;
  tenant_id: string;
  request_id: string;
  version: number;
  payload_json: Record<string, unknown>;
  saved_at: string;
  created_at: string;
  updated_at?: string | null;
}
