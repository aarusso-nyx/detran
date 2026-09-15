// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
