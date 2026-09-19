// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
