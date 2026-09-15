// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface RaitCapacityPlan {
  id: string;
  tenant_id: string;
  pool_id: string;
  period_start: string;
  period_end: string;
  arrival_estimate?: number | null;
  capacity_estimate?: number | null;
  queue_observed?: number | null;
  months_over_capacity: number;
  measures?: string | null;
  reinforcement_requested: boolean;
  unit_proposed: boolean;
  registered_at: string;
  registered_by?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
