// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:b72b0b7aad32b908d777d9b44b885244d74a7a214c442fecc03551811f18b2fd
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
