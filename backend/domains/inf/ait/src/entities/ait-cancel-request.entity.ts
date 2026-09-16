// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
export interface AitCancelRequest {
  id: string;
  tenant_id: string;
  ait_id?: string | null;
  kind: string;
  target_local_act_id?: string | null;
  origin_status: string;
  addressed_to: string;
  idempotency_key?: string | null;
  justification?: string | null;
  requested_by?: string | null;
  version: number;
  status: string;
  decision?: string | null;
  requested_at: string;
  decided_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
