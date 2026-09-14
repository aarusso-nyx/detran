// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
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
