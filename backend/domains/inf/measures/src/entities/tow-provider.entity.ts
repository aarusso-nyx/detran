// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
export interface TowProvider {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  name: string;
  document_number?: string | null;
  contact_json?: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
