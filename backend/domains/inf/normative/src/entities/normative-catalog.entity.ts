// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:8f7f7c36486cc7f2062f87bdfda6722994b3aff5dc8e5b80183ffea196fad19f
export interface NormativeCatalog {
  id: string;
  tenant_id: string;
  traffic_agency_id?: string | null;
  name: string;
  catalog_type: string;
  version: string;
  published_at?: string | null;
  valid_from: string;
  valid_to?: string | null;
  status: string;
  normative_source?: string | null;
  created_at: string;
  updated_at?: string | null;
}
