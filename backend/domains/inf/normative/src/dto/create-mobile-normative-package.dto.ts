// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
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
