// Generated from BP-CH-ENCOUNTERS-001 v1.1.0 sha256:7931238eb7e2720ab74ab9e327a65f946e9feb0fd555a8658cbf413e7db8b48b
export interface Encounter {
  id: string;
  tenant_id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string | null;
  renach_process_key?: string | null;
  renach_process_type?: string | null;
  current_category?: string | null;
  requested_category?: string | null;
  requires_medical: boolean;
  requires_psychological: boolean;
  exam_eligible?: boolean | null;
  eligibility_reasons: Record<string, unknown>;
  eligibility_checked_at?: string | null;
  status: string;
  started_at: string;
  closed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}
