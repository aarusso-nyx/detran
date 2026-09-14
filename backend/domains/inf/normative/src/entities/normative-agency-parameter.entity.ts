// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
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
