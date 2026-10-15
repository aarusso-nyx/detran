// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
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
