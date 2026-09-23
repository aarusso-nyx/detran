// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
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
