// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
