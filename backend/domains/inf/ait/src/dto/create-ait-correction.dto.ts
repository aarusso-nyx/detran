// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
export interface CreateAitCorrectionDto {
  ait_id: string;
  operator_user_ref: string;
  correction_type: string;
  changed_field?: string | null;
  previous_value?: string | null;
  new_value?: string | null;
  justification: string;
  corrected_at?: string;
  approved_by_user_ref?: string | null;
}
