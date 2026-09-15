// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
export interface CreateRaitMinutesDto {
  session_id: string;
  content: Record<string, unknown>;
  generated_at?: string;
  signed_at?: string | null;
  signed_by?: string | null;
  signature_kind?: string | null;
  signature_ref?: string | null;
  document_hash?: string | null;
  published_at?: string | null;
}
