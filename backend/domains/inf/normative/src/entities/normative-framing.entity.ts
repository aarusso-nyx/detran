// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
export interface NormativeFraming {
  id: string;
  tenant_id: string;
  catalog_id: string;
  framing_code: string;
  article?: string | null;
  clause?: string | null;
  description: string;
  severity?: string | null;
  penalty?: string | null;
  administrative_measure_summary?: string | null;
  allows_no_approach: boolean;
  requires_observation: boolean;
  requires_equipment: boolean;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
