// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
export interface Request {
  id: string;
  tenant_id: string;
  state: string;
  service_key: string;
  subject_id: string;
  target_kind: string;
  target_id?: string | null;
  channel: string;
  delegation_domain?: string | null;
  delegation_command?: string | null;
  delegation_external_id?: string | null;
  delegation_status: string;
  delegation_error?: string | null;
  minimum_assurance: string;
  version: number;
  withdrawn_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
