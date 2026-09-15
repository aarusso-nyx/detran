// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
