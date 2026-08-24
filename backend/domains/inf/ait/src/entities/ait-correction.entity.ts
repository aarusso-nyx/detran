// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
export interface AitCorrection {
  id: string;
  tenant_id: string;
  ait_id: string;
  operator_user_ref: string;
  correction_type: string;
  changed_field?: string | null;
  previous_value?: string | null;
  new_value?: string | null;
  justification: string;
  corrected_at: string;
  approved_by_user_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}
