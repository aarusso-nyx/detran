// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
