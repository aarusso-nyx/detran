// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
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
