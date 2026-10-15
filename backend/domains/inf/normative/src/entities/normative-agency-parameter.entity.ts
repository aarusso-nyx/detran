// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
export interface NormativeAgencyParameter {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  key: string;
  value_json: Record<string, unknown>;
  value_type: string;
  valid_from: string;
  valid_to?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
