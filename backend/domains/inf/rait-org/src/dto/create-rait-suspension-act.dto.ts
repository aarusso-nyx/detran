// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface CreateRaitSuspensionActDto {
  reason: string;
  legal_basis?: string | null;
  starts_on: string;
  ends_on: string;
  timer_codes?: Record<string, unknown>;
  evidence_document_id: string;
  signed_by: string;
  signed_at?: string;
  state?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
}
