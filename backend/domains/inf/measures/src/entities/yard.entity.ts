// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
export interface Yard {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  name: string;
  address?: string | null;
  location_json?: Record<string, unknown> | null;
  status: string;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
