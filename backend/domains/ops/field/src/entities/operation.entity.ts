// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface Operation {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  name: string;
  operation_type: string;
  description?: string | null;
  planned_start_at?: string | null;
  planned_end_at?: string | null;
  status: string;
  objectives?: string | null;
  created_at: string;
  updated_at?: string | null;
}
