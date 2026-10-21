// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CrashSubjectRequest {
  id: string;
  tenant_id: string;
  crash_record_id?: string | null;
  kind: string;
  subject_cpf: string;
  purpose: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
