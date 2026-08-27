// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
export interface CreateRaitAdmissibilityDto {
  case_id: string;
  criterion: string;
  verdict: boolean;
  reason?: string | null;
  evaluated_at?: string;
  evaluated_by: string;
}
