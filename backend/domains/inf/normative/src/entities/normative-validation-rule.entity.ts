// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
export interface NormativeValidationRule {
  id: string;
  tenant_id: string;
  catalog_id: string;
  framing_id?: string | null;
  rule_code: string;
  description: string;
  rule_type: string;
  expression_json?: Record<string, unknown> | null;
  user_message?: string | null;
  severity: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
