// Generated from BP-CH-ENCOUNTERS-001 v1.2.0 sha256:91731d0164806f1b137025d46dbb65f5fc8ac203fbc84cf8c9affcf81be9a4b5
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
