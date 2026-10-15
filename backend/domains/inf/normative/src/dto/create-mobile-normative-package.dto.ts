// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
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
