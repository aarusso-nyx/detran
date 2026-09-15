// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface RaitQualitySample {
  id: string;
  tenant_id: string;
  period_start: string;
  period_end: string;
  case_id: string;
  decision_id?: string | null;
  reviewer_member_id?: string | null;
  sampled_at: string;
  reviewed_at?: string | null;
  finding_kind?: string | null;
  finding_note?: string | null;
  systemic: boolean;
  created_at: string;
  updated_at?: string | null;
}
