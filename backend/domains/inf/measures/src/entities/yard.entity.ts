// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
