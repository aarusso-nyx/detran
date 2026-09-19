// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
export interface CreateMobileNormativePackageDto {
  traffic_agency_id: string;
  catalog_id: string;
  package_version: string;
  manifest_hash: string;
  package_uri: string;
  published_at?: string | null;
  valid_until?: string | null;
  status?: string;
}
