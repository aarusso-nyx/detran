// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
export interface RaitMinutes {
  id: string;
  tenant_id: string;
  session_id: string;
  content: Record<string, unknown>;
  generated_at: string;
  signed_at?: string | null;
  signed_by?: string | null;
  signature_kind?: string | null;
  signature_ref?: string | null;
  document_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}
