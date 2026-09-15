// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
