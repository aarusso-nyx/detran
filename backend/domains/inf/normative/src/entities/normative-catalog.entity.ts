// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
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
