// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
