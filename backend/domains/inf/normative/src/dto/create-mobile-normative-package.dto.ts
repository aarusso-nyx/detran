// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9b6f79a3cdcad0f477ef759231f4effedede012dda39fe184dad78a5196f11ca
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
