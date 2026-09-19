// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
