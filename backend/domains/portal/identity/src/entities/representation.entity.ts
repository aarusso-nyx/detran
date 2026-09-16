// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
export interface Representation {
  id: string;
  tenant_id: string;
  representative_subject_id: string;
  represented_cpf_hash: string;
  represented_name: string;
  instrument_document_id: string;
  scope: string;
  valid_until?: string | null;
  state: string;
  refusal_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
