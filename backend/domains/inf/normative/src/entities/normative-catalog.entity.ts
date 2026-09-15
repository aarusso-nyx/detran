// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
