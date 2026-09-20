// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
  published_at?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
