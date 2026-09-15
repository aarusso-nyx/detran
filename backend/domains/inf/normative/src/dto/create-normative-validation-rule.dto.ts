// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
export interface CreateNormativeValidationRuleDto {
  catalog_id: string;
  framing_id?: string | null;
  rule_code: string;
  description: string;
  rule_type: string;
  expression_json?: Record<string, unknown> | null;
  user_message?: string | null;
  severity: string;
  status?: string;
}
