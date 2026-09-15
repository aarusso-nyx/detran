// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
