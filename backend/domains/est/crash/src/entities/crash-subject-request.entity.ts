// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
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
