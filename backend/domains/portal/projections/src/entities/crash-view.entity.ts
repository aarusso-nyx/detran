// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface CrashView {
  id: string;
  tenant_id: string;
  crash_id: string;
  subject_cpf_hash: string;
  state_label: string;
  summary_json: Record<string, unknown>;
  third_party_fields_suppressed: boolean;
  last_event_id: string;
  created_at: string;
  updated_at?: string | null;
}
